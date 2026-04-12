# QWeb

> 来源：`docs/obsidian/07 知识库/odoo文档/03_开发者/03_参考/03_用户界面/02_视图架构.md`
> 原文章节：`## QWeb`
>
> 本文件从原始文档拆分而来，以下内容尽量保留原文，仅做拆分与轻量排版。

QWeb 视图是 `arch` 中的标准 QWeb 模板元素，可在模板或实际视图中运行。它不依赖固定根元素，因此在视图模式下必须显式指定 `type`/`model` 才能绑定系统行为。

## 目录

- [qweb-as-template](#qweb-as-template)
- [qweb-as-view](#qweb-as-view)
- [渲染上下文](#渲染上下文)
- [渲染钩子](#渲染钩子)

---

## qweb-as-template

当 QWeb 用作模板时，可通过 `template` 作为快捷方式引用。

## qweb-as-view

作为实际的 qweb 视图（在操作内打开）时，它应定义为具有显式 `type` 和模型的常规视图。

qweb-as-view 对 qweb-as-template 的主要补充包括：

- 带 `o_qweb_cp_buttons` 的 `<nav>` 会把内部按钮提取到控制面板按钮区域，原 `<nav>` 本身会被移除。
- 渲染过程会向标准 QWeb 上下文注入额外变量。
- 还提供额外的渲染钩子。

## 渲染上下文

`qweb-as-view` 会扩展标准 QWeb 上下文，模板可以直接读取以下变量：

| 变量 | 来源 | 用途 |
| --- | --- | --- |
| `model` | 当前视图绑定的模型类 | 访问模型字段与方法。 |
| `domain` | 调用该视图的动作或默认视图域 | 限制渲染结果的记录范围。 |
| `context` | 动作/视图的上下文字典 | 读取默认值、`search_default_*`、`group_by` 之类开关。 |
| `records` | `model.search(domain)` 的惰性代理 | 用于遍历当前记录集；可直接在模板中迭代。 |

如果只是遍历记录而不做更复杂的操作（例如分组），可以直接使用 `records`。

## 渲染钩子

客户端可以调用以下钩子来控制 qweb-as-view 的渲染流程：

| 钩子 | 触发时机 | 描述 |
| --- | --- | --- |
| `_qweb_prepare_context(view_id, domain)` | 渲染开始前 | 准备 qweb-as-view 特定的渲染上下文。 |
| `qweb_render_view(view_id, domain)` | 客户端请求 | 调用上下文准备方法，并最终委托 `env['ir.qweb'].render()` 渲染 HTML。 |
