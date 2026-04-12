#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["httpx"]
# ///
"""
MinerU Precision Extract API v4 — batch document-to-Markdown converter.

Converts PDF / DOC(X) / PPT(X) / XLS(X) / images to Markdown with
frontmatter headers, ready for use as company knowledge-base references.

Usage:
    uv run convert.py /path/to/raw/          # convert every supported file in dir
    uv run convert.py /path/to/file.pdf      # convert a single file
    uv run convert.py /path/to/raw/ --output /path/to/output/
"""

from __future__ import annotations

import argparse
import io
import os
import sys
import time
import zipfile
from pathlib import Path

import httpx

# ── constants ────────────────────────────────────────────────────────────────

BASE_URL = "https://mineru.net/api/v4"
SUPPORTED_EXTENSIONS = {
    ".pdf", ".doc", ".docx",
    ".ppt", ".pptx",
    ".xls", ".xlsx",
    ".png", ".jpg", ".jpeg",
}
POLL_INTERVAL = 5        # seconds
MAX_POLL_TIME = 600      # 10 minutes
MAX_FILE_SIZE = 200 * 1024 * 1024  # 200 MB


# ── helpers ──────────────────────────────────────────────────────────────────

def get_token() -> str:
    """Read MINERU_TOKEN from the environment. Exit with a helpful message if missing."""
    token = os.environ.get("MINERU_TOKEN", "").strip()
    if not token:
        print(
            "Error: MINERU_TOKEN environment variable is not set.\n"
            "Please export your MinerU API token before running this script:\n"
            "\n"
            "    export MINERU_TOKEN='your-token-here'\n",
            file=sys.stderr,
        )
        sys.exit(1)
    return token


def collect_files(input_path: str | Path) -> list[Path]:
    """Return a list of files with supported extensions from *input_path*.

    *input_path* may be a single file or a directory (non-recursive).
    """
    path = Path(input_path).resolve()
    if path.is_file():
        if path.suffix.lower() in SUPPORTED_EXTENSIONS:
            return [path]
        print(f"Warning: '{path.name}' has unsupported extension, skipping.", file=sys.stderr)
        return []

    if path.is_dir():
        files = sorted(
            f for f in path.rglob("*")
            if f.is_file() and f.suffix.lower() in SUPPORTED_EXTENSIONS
        )
        return files

    print(f"Error: '{path}' is neither a file nor a directory.", file=sys.stderr)
    sys.exit(1)


def upload_and_create_task(client: httpx.Client, file_path: Path) -> str:
    """Upload *file_path* via the MinerU batch API and return the *batch_id*.

    Steps:
        1. POST /file-urls/batch  → get upload URL + batch_id
        2. PUT  the file bytes to the returned upload URL
    """
    file_size = file_path.stat().st_size
    if file_size > MAX_FILE_SIZE:
        raise RuntimeError(
            f"File '{file_path.name}' exceeds 200 MB limit ({file_size / 1024 / 1024:.1f} MB)."
        )

    # 1. Request an upload URL ---------------------------------------------------
    payload = {
        "files": [{"name": file_path.name}],
        "model_version": "vlm",
        "enable_table": True,
        "enable_formula": False,
        "language": "ch",
    }
    resp = client.post(f"{BASE_URL}/file-urls/batch", json=payload)
    resp.raise_for_status()
    body = resp.json()

    if body.get("code") != 0:
        raise RuntimeError(
            f"MinerU file-urls/batch error: {body.get('msg', body)}"
        )

    data = body["data"]
    batch_id: str = data["batch_id"]
    file_url: str = data["file_urls"][0]

    # 2. Upload the file content -------------------------------------------------
    with open(file_path, "rb") as fh:
        put_resp = client.put(file_url, content=fh)
    put_resp.raise_for_status()

    return batch_id


def poll_batch_result(client: httpx.Client, batch_id: str) -> str:
    """Poll MinerU until the batch is done and return *full_zip_url*.

    Raises on timeout or remote failure.
    """
    url = f"{BASE_URL}/extract-results/batch/{batch_id}"
    deadline = time.monotonic() + MAX_POLL_TIME

    while time.monotonic() < deadline:
        resp = client.get(url)
        resp.raise_for_status()
        body = resp.json()

        if body.get("code") != 0:
            raise RuntimeError(f"MinerU poll error: {body.get('msg', body)}")

        results = body["data"].get("extract_result", [])
        if not results:
            time.sleep(POLL_INTERVAL)
            continue

        item = results[0]
        state = item.get("state", "")

        if state == "done":
            zip_url = item.get("full_zip_url", "")
            if not zip_url:
                raise RuntimeError("MinerU returned 'done' but no full_zip_url.")
            return zip_url

        if state == "failed":
            err = item.get("err_msg", "unknown error")
            raise RuntimeError(f"MinerU extraction failed: {err}")

        # running / pending — show progress if available
        progress = item.get("progress")
        if progress is not None:
            print(f"  ... progress: {progress}", flush=True)

        time.sleep(POLL_INTERVAL)

    raise TimeoutError(
        f"MinerU extraction did not finish within {MAX_POLL_TIME}s (batch {batch_id})."
    )


def download_and_extract_md(zip_url: str) -> str:
    """Download the ZIP from *zip_url* and return the markdown content.

    Prefers the file whose name contains 'full'; otherwise falls back to the
    first `.md` file found.
    """
    with httpx.Client(timeout=120) as dl_client:
        resp = dl_client.get(zip_url)
        resp.raise_for_status()

    with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
        md_names = [n for n in zf.namelist() if n.lower().endswith(".md")]
        if not md_names:
            raise RuntimeError("No .md file found in the downloaded ZIP.")

        # prefer a file with "full" in its name
        chosen = next((n for n in md_names if "full" in n.lower()), md_names[0])
        return zf.read(chosen).decode("utf-8")


def add_frontmatter(content: str, title: str) -> str:
    """Prepend YAML frontmatter with *title* and an empty summary placeholder."""
    safe_title = title.replace('"', '\\"')
    frontmatter = (
        "---\n"
        f'title: "{safe_title}"\n'
        "summary: \uff08\u5f85\u586b\u5199\uff09\n"
        "---\n\n"
    )
    return frontmatter + content


def convert_file(
    client: httpx.Client,
    file_path: Path,
    output_dir: Path,
) -> bool:
    """Orchestrate the full conversion of a single file. Return True on success."""
    stem = file_path.stem
    out_file = output_dir / f"{stem}.md"

    try:
        print(f"\n[1/4] Uploading '{file_path.name}' ...", flush=True)
        batch_id = upload_and_create_task(client, file_path)
        print(f"[2/4] Polling results (batch {batch_id}) ...", flush=True)
        zip_url = poll_batch_result(client, batch_id)
        print(f"[3/4] Downloading & extracting markdown ...", flush=True)
        md_content = download_and_extract_md(zip_url)
        md_with_fm = add_frontmatter(md_content, stem)
        print(f"[4/4] Writing '{out_file.name}' ...", flush=True)
        output_dir.mkdir(parents=True, exist_ok=True)
        out_file.write_text(md_with_fm, encoding="utf-8")
        print(f"  Done -> {out_file}")
        return True
    except Exception as exc:
        print(f"  Error converting '{file_path.name}': {exc}", file=sys.stderr)
        return False


# ── main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Convert company documents to Markdown via MinerU Precision Extract API.",
    )
    parser.add_argument(
        "input",
        help="Path to a single file or a directory of documents to convert.",
    )
    parser.add_argument(
        "--output",
        default=None,
        help=(
            "Output directory for .md files. "
            "Default: ../references/ relative to this script."
        ),
    )
    args = parser.parse_args()

    # Resolve output directory
    if args.output:
        output_dir = Path(args.output).resolve()
    else:
        output_dir = (Path(__file__).resolve().parent.parent / "references").resolve()

    token = get_token()
    files = collect_files(args.input)

    if not files:
        print("No supported files found. Nothing to do.")
        sys.exit(0)

    print(f"Found {len(files)} file(s) to convert.")
    print(f"Output directory: {output_dir}\n")

    successes = 0
    failures = 0

    headers = {"Authorization": f"Bearer {token}"}
    with httpx.Client(headers=headers, timeout=120) as client:
        for file_path in files:
            ok = convert_file(client, file_path, output_dir)
            if ok:
                successes += 1
            else:
                failures += 1

    # ── summary ──────────────────────────────────────────────────────────────
    print("\n" + "=" * 50)
    print("Conversion Summary")
    print("=" * 50)
    if successes:
        print(f"  \u2705 Success: {successes}")
    if failures:
        print(f"  \u274c Failed:  {failures}")
    print()
    print("Next steps:")
    print("  1. 编辑 references/ 下每份 .md 文件，填写 frontmatter 中的 summary")
    print("  2. 更新 SKILL.md 中的文档索引表")
    print("  3. 检查转换质量（表格、图片等可能需要微调）")


if __name__ == "__main__":
    main()
