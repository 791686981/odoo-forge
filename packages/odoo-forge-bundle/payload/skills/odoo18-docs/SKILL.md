---
name: odoo18-docs
description: Odoo 官方文档问答与能力查证助手。基于本地知识库查询 Odoo 18 官方文档，既可回答系统功能与开发问题，也可在方案设计阶段核实官方模块能力和边界。模块检索请使用 module-research，模块精读请使用 module-report。
---
# Odoo QA

## 定位

这是一个面向 Odoo 官方文档的问答 Skill，基于本地知识库（包含用户文档、数据库管理、开发者指南、贡献指南四大板块），提供准确的 Odoo 系统级解答。

默认优先使用当前 skill 内置的本地文档；本地不够时，再使用可用工具联网搜索补充。

> **OCA / 第三方模块检索**：请使用 `module-research` skill。  
> **模块精读与结构化报告**：请使用 `module-report` skill。

## 核心能力一

当前 skill 的内部资料分为两层：
- `references/catalog/`：四个板块的目录文档，只列目录树，方便先浏览结构
- `references/docs/`：四大板块下复制进 skill 的原始 Markdown 文档

### 四大板块

| 板块 | 目录 | 说明 |
|------|------|------|
| **applications** | `references/docs/applications/` | 面向最终用户、业务配置和功能使用，优先回答"这个功能怎么用""在哪里配置""业务流程怎么走"等应用问题（如销售、采购、库存、制造、会计等）。 |
| **administration** | `references/docs/administration/` | 面向安装、部署、托管、升级、数据库维护、Odoo.sh 等运维与平台主题。 |
| **developer** | `references/docs/developer/` | 面向模块开发、ORM、视图、动作、安全、Web 框架、API、教程与操作指南。 |
| **contributing** | `references/docs/contributing/` | 面向编码规范、Git 流程、文档编写、RST 规范与贡献方式。 |

### 官方文档工作流与查找原则

1. **定位板块**：先判断问题属于哪个板块，必要时可以跨板块联合查询。
2. **查阅目录**：先读对应的 `references/catalog/*-catalog.md` 缩小范围，确认这个板块下有哪些目录和文件。
3. **阅读原文**：再到 `references/docs/` 中按路径、文件名和标题打开相关原文。
4. **基于事实**：基于文档原文回答，不要假装凭空记忆整套 Odoo 文档。
5. **线索匹配**：问题里出现中英文关键词、模块名、功能名、技术词时，都可以作为匹配线索。

### 文档来源与 URL 映射

本地文档转换自 Odoo 18 官方文档的 RST 源文件，每个 Markdown 文件都包含对应的在线文档 URL：

- **基础 URL**: `https://docs.odoo.sbggai.top/`
- **URL 映射文件**: `references/url-mapping.json`
- **Frontmatter**: 每个 Markdown 文件头部包含 `source_url` 字段

**URL 生成规则**：
```
references/docs/{section}/{path}.md → https://docs.odoo.sbggai.top/{section}/{path}
```

例如：
- 本地文件：`references/docs/developer/tutorials/discover_js_framework/02_build_a_dashboard.md`
- 在线文档：`https://docs.odoo.sbggai.top/developer/tutorials/discover_js_framework/02_build_a_dashboard`

## 回答规则

- 默认先给结论，再说明依据来自哪些文档或模块。
- 当用于 `solution` 等方案设计场景时，优先输出“官方能力查证”结构，而不是长篇解释。
- 用户是直接问答场景时，附上主要依据文档的 `source_url` 地址, 输出格式如下，方便点击回原文：
  ```
  **参考文档来源：**
  - [title 中文翻译](source_url)
  - [title 中文翻译](source_url)
  ```
- 如果当前只是研发过程中的内部查询，或被别的 skill 当作基础导览能力使用，不必主动输出 `source_url`。
- 不确定时直接说不确定，并指出下一步该看哪篇文档或查哪类资料。

## 官方能力查证模式

当 `solution`、模块选型或能力边界判断类任务调用本 skill 时，按下面的结构输出：

```markdown
## 官方能力查证

| 模块 | 文档依据 | 核心能力 | 关键边界 | 对当前需求的结论 |
|------|----------|----------|----------|------------------|
| {模块} | {文档标题 / source_url} | {能力} | {边界} | 可直接用 / 部分可用 / 不适合 |
```

推荐顺序：

1. 先定位最相关的官方模块或文档章节
2. 再总结核心能力和关键边界
3. 最后给出对当前需求的结论

不要把“官方文档提到过相关概念”误说成“官方模块已经完整支持”。

## 联网兜底

在以下情况下使用联网搜索等其他工具补充：

- 本地没有相关主题或内容明显不完整
- 用户明确要求最新资料
- 问题依赖当前版本、外部服务或社区经验

联网时优先使用更可靠的一手资料或高质量资料；如果引用社区内容，要明确其权威性可能弱于官方文档。
