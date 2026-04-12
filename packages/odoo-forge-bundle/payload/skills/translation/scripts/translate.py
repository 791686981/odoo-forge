# /// script
# requires-python = ">=3.12"
# dependencies = ["httpx"]
# ///
"""Gettext 翻译脚本 — 读取本地 .po/.pot 文件，调用远程 API 翻译，写回本地。"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path

import httpx

API_URL = "http://81.70.95.163:8001"
API_KEY = "Mm.123456"
PLACEHOLDER_RE = re.compile(
    r"%\([^)]+\)[#0\- +]?\d*(?:\.\d+)?[diouxXeEfFgGcrs]"
    r"|%\d+\$[diouxXeEfFgGcrs]"
    r"|%[-+#0 ]?\d*(?:\.\d+)?[diouxXeEfFgGcrs]"
    r"|\{[^{}\n]+\}"
    r"|\{\}"
)
MARKUP_RE = re.compile(r"</?[\w:-]+(?:\s+[^<>]*?)?/?>")
LANGUAGE_HEADER_RE = re.compile(r"(?:^|\n)Language:\s*([^\n]+)")


def decode_po_string(value: str) -> str:
    value = value.strip()
    if not value.startswith('"') or not value.endswith('"'):
        return value
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return value.strip('"')


def parse_po_entries(content: str) -> list[dict[str, object]]:
    entries: list[dict[str, object]] = []
    for block in re.split(r"\n\s*\n", content.strip()):
        if not block.strip():
            continue

        entry = {
            "flags": set(),
            "msgid": "",
            "msgid_plural": "",
            "msgstr": {},
        }
        current_field: tuple[str, object | None] | None = None

        for raw_line in block.splitlines():
            line = raw_line.strip()
            if not line:
                continue
            if line.startswith("#,"):
                entry["flags"].update(
                    flag.strip() for flag in line[2:].split(",") if flag.strip()
                )
                current_field = None
                continue
            if line.startswith("#"):
                continue
            if line.startswith("msgid_plural "):
                entry["msgid_plural"] = decode_po_string(line[len("msgid_plural "):])
                current_field = ("msgid_plural", None)
                continue
            if line.startswith("msgid "):
                entry["msgid"] = decode_po_string(line[len("msgid "):])
                current_field = ("msgid", None)
                continue
            if line.startswith("msgstr["):
                match = re.match(r"msgstr\[(\d+)\]\s+(.*)", line)
                if match:
                    index = int(match.group(1))
                    entry["msgstr"][index] = decode_po_string(match.group(2))
                    current_field = ("msgstr", index)
                continue
            if line.startswith("msgstr "):
                entry["msgstr"]["singular"] = decode_po_string(line[len("msgstr "):])
                current_field = ("msgstr", "singular")
                continue
            if line.startswith('"') and current_field:
                decoded = decode_po_string(line)
                field_name, index = current_field
                if field_name == "msgid":
                    entry["msgid"] += decoded
                elif field_name == "msgid_plural":
                    entry["msgid_plural"] += decoded
                elif field_name == "msgstr":
                    entry["msgstr"][index] = entry["msgstr"].get(index, "") + decoded

        entries.append(entry)

    return entries


def extract_placeholders(text: str) -> list[str]:
    return PLACEHOLDER_RE.findall(text.replace("%%", ""))


def extract_markup_tokens(text: str) -> list[str]:
    return MARKUP_RE.findall(text)


def validate_translation_artifact(
    content: str,
    output_path: Path,
    target_language: str,
) -> dict[str, object]:
    exists = output_path.exists()
    filename_matches_language = output_path.name == f"{target_language}.po"
    entries = parse_po_entries(content)

    header_entry = next(
        (entry for entry in entries if entry.get("msgid", "") == ""),
        None,
    )
    header_text = ""
    if header_entry:
        header_msgstr = header_entry.get("msgstr", {})
        header_text = "".join(str(value) for value in header_msgstr.values())

    language_match = LANGUAGE_HEADER_RE.search(header_text)
    detected_language = language_match.group(1).strip() if language_match else ""
    language_header_correct = detected_language == target_language

    empty_msgstr_count = 0
    fuzzy_count = 0
    placeholder_mismatch_count = 0
    markup_mismatch_count = 0

    for entry in entries:
        msgid = str(entry.get("msgid", ""))
        if msgid == "":
            continue

        flags = entry.get("flags", set())
        msgstr_map = entry.get("msgstr", {})
        msgstr_values = list(msgstr_map.values()) if msgstr_map else [""]

        if "fuzzy" in flags:
            fuzzy_count += 1
        if all(not str(value) for value in msgstr_values):
            empty_msgstr_count += 1

        source_placeholders = Counter(extract_placeholders(msgid))
        source_markup = extract_markup_tokens(msgid)
        for value in msgstr_values:
            target_text = str(value)
            if source_placeholders != Counter(extract_placeholders(target_text)):
                placeholder_mismatch_count += 1
                break
        for value in msgstr_values:
            target_text = str(value)
            if source_markup != extract_markup_tokens(target_text):
                markup_mismatch_count += 1
                break

    issues: list[str] = []
    if not exists:
        issues.append("输出文件不存在")
    if not filename_matches_language:
        issues.append(f"输出文件名应为 {target_language}.po")
    if empty_msgstr_count:
        issues.append(f"仍有 {empty_msgstr_count} 个空白翻译条目")
    if fuzzy_count:
        issues.append(f"仍有 {fuzzy_count} 个 fuzzy 条目")
    if not language_header_correct:
        issues.append(
            "Language 头不正确"
            + (f"，当前为 {detected_language}" if detected_language else "，当前未检测到")
        )
    if placeholder_mismatch_count:
        issues.append(f"发现 {placeholder_mismatch_count} 个占位符不一致条目")
    if markup_mismatch_count:
        issues.append(f"发现 {markup_mismatch_count} 个 HTML/XML 片段不一致条目")

    return {
        "passed": not issues,
        "exists": exists,
        "filename_matches_language": filename_matches_language,
        "empty_msgstr_count": empty_msgstr_count,
        "fuzzy_count": fuzzy_count,
        "language_header_correct": language_header_correct,
        "detected_language": detected_language,
        "placeholder_mismatch_count": placeholder_mismatch_count,
        "markup_mismatch_count": markup_mismatch_count,
        "issues": issues,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="翻译 .po/.pot 文件")
    parser.add_argument("file", help="本地 .po/.pot 文件路径")
    parser.add_argument("--target-language", default="zh_CN")
    parser.add_argument("--source-language", default="en_US")
    parser.add_argument("--translation-mode", default="blank")
    parser.add_argument("--chunk-size", type=int, default=20)
    parser.add_argument("--no-proofread", action="store_true")
    parser.add_argument("--output", default=None, help="输出文件路径")
    args = parser.parse_args()

    path = Path(args.file)
    if not path.exists():
        print(json.dumps({"success": False, "error": f"文件不存在: {path}"}))
        sys.exit(1)

    if path.suffix.lower() not in (".po", ".pot"):
        print(json.dumps({"success": False, "error": f"不支持的文件类型: {path.suffix}"}))
        sys.exit(1)

    file_content = path.read_text(encoding="utf-8")

    payload = {
        "file_content": file_content,
        "filename": path.name,
        "source_language": args.source_language,
        "target_language": args.target_language,
        "translation_mode": args.translation_mode,
        "chunk_size": args.chunk_size,
        "proofread": not args.no_proofread,
    }

    try:
        resp = httpx.post(
            f"{API_URL}/api/tools/gettext-translation/auto-translate",
            json=payload,
            headers={"Authorization": f"Bearer {API_KEY}"},
            timeout=600,
        )
        resp.raise_for_status()
    except httpx.ConnectError:
        print(json.dumps({"success": False, "error": "无法连接翻译服务器，请检查网络。"}))
        sys.exit(1)
    except httpx.HTTPStatusError as exc:
        detail = exc.response.text
        try:
            detail = exc.response.json().get("detail", detail)
        except Exception:
            pass
        print(json.dumps({"success": False, "error": f"API 错误 ({exc.response.status_code}): {detail}"}))
        sys.exit(1)
    except httpx.TimeoutException:
        print(json.dumps({"success": False, "error": "翻译超时，文件可能过大，请尝试减小 chunk-size。"}))
        sys.exit(1)

    data = resp.json()
    content = data.get("content", "")

    if args.output:
        output_path = Path(args.output)
    else:
        output_path = path.parent / f"{args.target_language}.po"

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(content, encoding="utf-8")
    validation = validate_translation_artifact(content, output_path, args.target_language)

    print(json.dumps({
        "success": True,
        "output_path": str(output_path),
        "total_entries": data.get("total_entries", 0),
        "translated_entries": data.get("translated_entries", 0),
        "proofread_applied": data.get("proofread_applied", 0),
        "validation": validation,
        "validation_passed": validation["passed"],
    }))


if __name__ == "__main__":
    main()
