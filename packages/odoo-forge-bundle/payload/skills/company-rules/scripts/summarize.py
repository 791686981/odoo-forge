#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["httpx"]
# ///
"""
批量为 references/ 下的 .md 文件生成 summary。
使用硅基流动 DeepSeek-V3.2 模型总结文档内容。

用法：
    export SILICONFLOW_API_KEY="sk-xxx"
    uv run summarize.py
"""

from __future__ import annotations

import os
import re
import sys
import time
from pathlib import Path

import httpx

API_URL = "https://api.siliconflow.cn/v1/chat/completions"
MODEL = "deepseek-ai/DeepSeek-V3"
REFERENCES_DIR = Path(__file__).resolve().parent.parent / "references"
MAX_CONTENT_CHARS = 20000  # 截取前 20000 字符送给模型


def get_key() -> str:
    key = os.environ.get("SILICONFLOW_API_KEY", "").strip()
    if not key:
        print("Error: SILICONFLOW_API_KEY 环境变量未设置", file=sys.stderr)
        sys.exit(1)
    return key


def extract_content(file_path: Path) -> tuple[str, str]:
    """读取文件，返回 (title, 正文前 N 字符)。"""
    text = file_path.read_text(encoding="utf-8")

    # 提取 title
    title_match = re.search(r'^title:\s*"?(.+?)"?\s*$', text, re.MULTILINE)
    title = title_match.group(1) if title_match else file_path.stem

    # 去掉 frontmatter 取正文
    parts = text.split("---", 2)
    body = parts[2] if len(parts) >= 3 else text
    body = body.strip()[:MAX_CONTENT_CHARS]

    return title, body


def summarize(client: httpx.Client, title: str, body: str) -> str:
    """调用 DeepSeek 生成一行摘要。"""
    resp = client.post(
        API_URL,
        json={
            "model": MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": "你是一个文档摘要助手。用户给你一份公司制度文档的标题和内容节选，你需要用一句话（不超过50个中文字）概括这份文档的核心内容。只输出摘要本身，不要加引号、前缀或解释。摘要要突出文档的适用范围和关键规定。",
                },
                {
                    "role": "user",
                    "content": f"标题：{title}\n\n内容节选：\n{body}",
                },
            ],
            "max_tokens": 100,
            "temperature": 0.3,
        },
    )
    resp.raise_for_status()
    data = resp.json()
    return data["choices"][0]["message"]["content"].strip()


def update_frontmatter(file_path: Path, summary: str):
    """替换文件 frontmatter 中的 summary。"""
    text = file_path.read_text(encoding="utf-8")
    # 替换 summary: （待填写） 或 summary: 任何已有值
    new_text = re.sub(
        r'^(summary:\s*).*$',
        f'\\1{summary}',
        text,
        count=1,
        flags=re.MULTILINE,
    )
    if new_text != text:
        file_path.write_text(new_text, encoding="utf-8")


def main():
    key = get_key()
    md_files = sorted(REFERENCES_DIR.glob("*.md"))

    if not md_files:
        print("references/ 下没有 .md 文件")
        sys.exit(1)

    print(f"找到 {len(md_files)} 个文件，开始生成摘要...\n")

    client = httpx.Client(
        headers={"Authorization": f"Bearer {key}"},
        timeout=30,
    )

    results = []
    ok = 0
    fail = 0

    try:
        for i, fp in enumerate(md_files, 1):
            title, body = extract_content(fp)
            try:
                summary = summarize(client, title, body)
                update_frontmatter(fp, summary)
                results.append((fp.name, summary))
                print(f"[{i}/{len(md_files)}] ✅ {fp.name}")
                print(f"    → {summary}")
                ok += 1
            except Exception as e:
                print(f"[{i}/{len(md_files)}] ❌ {fp.name}: {e}")
                results.append((fp.name, "（生成失败）"))
                fail += 1
            # 避免限流
            time.sleep(0.5)
    finally:
        client.close()

    # 输出索引表
    print(f"\n{'='*60}")
    print(f"完成！成功 {ok}，失败 {fail}")
    print(f"\n## 文档索引表（复制到 SKILL.md）\n")
    print("| 文件 | 摘要 |")
    print("|------|------|")
    for name, summary in results:
        print(f"| {name} | {summary} |")


if __name__ == "__main__":
    main()
