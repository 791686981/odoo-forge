---
name: translation
description: Use when 需要翻译 Odoo 模块、.po/.pot 文件，或先盘点 Odoo 仓库内多模块翻译现状并制定翻译计划时使用。
---

# Odoo 模块翻译工作流

## 定位

Odoo Gettext 翻译工作流。固定节奏只有一套：

1. 先扫描现状
2. 先向用户汇报结果
3. 先给出中文策略建议
4. 明确得到用户确认后再执行翻译
5. 翻译后做固定校验，再汇报结果

`scripts/translate.py` 只负责两件事：调用翻译 API，以及对翻译产物做结构化校验。仓库盘点、策略推荐、向用户确认这些动作都在 skill 流程里完成。

## 适用输入

支持三类输入：

- 单个 `.pot` 文件
- 单个 `.po` 文件
- 目录路径

目录路径再细分为两种：

- 单模块目录：只有一个 `__manifest__.py`
- 多模块仓库目录：存在多个 `__manifest__.py`

目标语言默认是 `zh_CN`。

## 使用方式

```text
/translation addons/dms
/translation addons/dms zh_CN
/translation addons/dms/i18n/dms.pot zh_CN
/translation addons/dms/i18n/zh_CN.po zh_CN
/translation sandbox/timesheet zh_CN
```

## 工作流

### Step 1: 判断输入范围

- 输入是 `.po` 或 `.pot` 文件：按单文件模式处理
- 输入是目录：先扫描 `__manifest__.py`
- 没有参数：提示用户提供模块路径、仓库路径或 `.po/.pot` 文件路径

目录扫描时，优先使用这些命令：

```bash
find <path> -name '__manifest__.py'
rg --files <path> | rg '/__manifest__\.py$'
```

判断规则：

- 扫描到 0 个 `__manifest__.py`：这不是标准 Odoo 模块/仓库，提示用户检查路径
- 扫描到 1 个 `__manifest__.py`：按单模块处理
- 扫描到多个 `__manifest__.py`：按多模块仓库处理

### Step 2: 扫描翻译现状

无论是单模块还是多模块仓库，都必须先扫描，不要拿到路径就直接执行翻译。

#### 单模块扫描

优先扫描模块 `i18n/` 目录：

```bash
find <module>/i18n -maxdepth 1 -type f \( -name '*.pot' -o -name '*.po' \)
rg --files <module>/i18n
```

至少识别这些信息：

- `.pot` 模板路径
- 目标语言 `.po` 路径，例如 `i18n/zh_CN.po`
- 是否存在其他语言 `.po`
- `.pot` 是否为空模板
- 现有 `.po` 的总条目数、空白条目数、`fuzzy` 条目数

统计时优先使用：

```bash
rg -c '^msgid "' <file>
rg -c '^msgstr ""$' <file>
rg -c '^#, fuzzy' <file>
awk 'BEGIN{c=0} /^msgid "/{c++} END{print c}' <file>
```

#### 多模块仓库扫描

如果目录下有多个模块，先给用户“盘点清单 + 执行计划”，不要默认挑一个模块直接试翻。

对每个模块扫描：

- 是否有 `i18n/*.pot`
- 是否已有 `i18n/<lang>.po`
- 现有 `<lang>.po` 是否还有空白项或 `fuzzy`
- `.pot` 是否为空模板

然后输出清单，至少包含：

- 模块名
- `.pot` 路径
- `<lang>.po` 路径或“缺失”
- 空白项数量
- `fuzzy` 数量
- 当前状态

状态建议至少分成这几类：

- 缺少 `zh_CN.po`
- 已有中文但未完成
- 中文基本完成
- `.pot` 为空模板
- 缺少可用翻译源

如果用户明确说“先不要执行”，就停在这里，只返回盘点结果和建议计划。

### Step 3: 汇报现状并推荐策略

扫描完成后，必须先向用户汇报，再问要不要执行。汇报里至少要包含：

- 本次识别到的是单文件、单模块还是多模块仓库
- 将使用哪个源文件执行翻译
- 默认输出路径是什么
- 当前空白项和 `fuzzy` 情况
- 推荐的翻译策略及理由

对用户展示的策略必须使用中文：

| 用户可见策略 | 内部参数 | 适用场景 |
|---|---|---|
| 只补空白项（推荐） | `blank` | 旧译稿基本可用，只剩空白项 |
| 补空白项和模糊项 | `blank_and_fuzzy` | 已有不少 `fuzzy`，需要顺手修复 |
| 全部重新翻译 | `overwrite_all` | 旧译稿质量明显差，适合整体重做 |

推荐规则：

- 如果存在 `fuzzy`，优先推荐“补空白项和模糊项”
- 如果只有空白项、没有 `fuzzy`，优先推荐“只补空白项”
- 如果语言头错误、占位符或 HTML/XML 片段损坏、旧译稿明显失真，才推荐“全部重新翻译”

默认输出路径要明确告诉用户：

- 传了 `--output`：按用户指定路径输出
- 没传 `--output`：默认输出到 `源文件所在目录/<lang>.po`
- 对 Odoo 模块来说，标准路径通常就是 `i18n/<lang>.po`

### Step 4: 向用户确认后再执行

不管是单模块还是整仓库，都要先确认，再执行。

至少确认这三件事：

- 现在是否执行翻译
- 采用哪种翻译策略
- 是否启用 AI 校对

交互模式下，直接用中文向用户确认。

被其他 skill/agent 调用时，也不要默认直接执行。只有在上游已经明确给出：

- 要翻译的范围
- 翻译策略
- 是否执行

这三项都明确时，才进入执行阶段；否则先把扫描结果和建议返回给调用方。

### Step 5: 执行翻译

#### 源文件选择

- 新建目标语言文件：优先使用 `.pot`
- 已有旧译稿，且策略是“只补空白项”或“补空白项和模糊项”：使用现有 `<lang>.po`
- 已有旧译稿，且策略是“全部重新翻译”：优先使用 `.pot`；如果没有 `.pot`，再退回现有 `<lang>.po`

执行命令时，示例必须显式写出 `--output`，并指向 `i18n/<lang>.po`：

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/translate.py \
  addons/dms/i18n/dms.pot \
  --target-language zh_CN \
  --translation-mode blank \
  --output addons/dms/i18n/zh_CN.po
```

已有旧译稿且要补空白项和模糊项时：

```bash
uv run ${CLAUDE_SKILL_DIR}/scripts/translate.py \
  addons/dms/i18n/zh_CN.po \
  --target-language zh_CN \
  --translation-mode blank_and_fuzzy \
  --output addons/dms/i18n/zh_CN.po
```

如果用户要求关闭 AI 校对，再补 `--no-proofread`。

### Step 6: 翻译后固定校验

翻译脚本执行完成后，必须检查返回结果里的校验信息，不要只看 `success: true`。

至少检查这些项目：

- 输出文件是否存在
- 输出文件名是否为 `<lang>.po`
- 是否还有 `msgstr ""` 残留
- 是否还有 `#, fuzzy` 残留
- 头部 `Language:` 是否正确
- 占位符是否被破坏
- HTML/XML 片段是否被破坏

脚本会返回结构化结果，示例：

```json
{
  "success": true,
  "output_path": "addons/dms/i18n/zh_CN.po",
  "total_entries": 359,
  "translated_entries": 359,
  "proofread_applied": 3,
  "validation_passed": true,
  "validation": {
    "passed": true,
    "exists": true,
    "filename_matches_language": true,
    "empty_msgstr_count": 0,
    "fuzzy_count": 0,
    "language_header_correct": true,
    "placeholder_mismatch_count": 0,
    "markup_mismatch_count": 0,
    "issues": []
  }
}
```

汇报结果时：

- 如果 `validation_passed` 为 `true`：汇报输出路径、翻译数量、校对修正数量
- 如果 `validation_passed` 为 `false`：把 `validation.issues` 原样整理给用户，并明确说明“翻译已产出，但仍需人工复核或重跑”

## 错误处理

| 情况 | 处理 |
|---|---|
| 目录下没有 `__manifest__.py` | 提示这不是标准 Odoo 模块/仓库 |
| 模块没有 `i18n/` 目录 | 提示先导出翻译模板 |
| 没有 `.pot` 且也没有目标语言 `.po` | 提示缺少可用翻译源 |
| `.pot` 是空模板 | 标记为“空模板”，不要直接执行翻译 |
| API 不可达 | 提示检查网络或服务器状态 |
| 翻译超时 | 建议减小 `chunk-size` 或关闭校对后重试 |
| 翻译成功但校验失败 | 明确列出校验问题，不要直接宣称完成 |
