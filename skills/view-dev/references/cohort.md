# 队列 / Cohort

> 来源：`docs/obsidian/07 知识库/odoo文档/03_开发者/03_参考/03_用户界面/02_视图架构.md`
> 原文章节：`## 队列`
> 本文件从原始文档中拆分而来，以下内容尽量保留原文，仅做拆分与轻量排版。

队列视图用于展示数据在一段时间内的变化趋势（例如订阅留存与流失）。点击某个单元格后，会跳转到对应时间区间的记录列表/表单动作。

## 目录

- [默认视图行为](#默认视图行为)
- [基础示例](#基础示例)
- [根元素与根属性](#根元素与根属性)
- [`field` 元素与属性](#field-元素与属性)
- [示例数据填充说明](#示例数据填充说明)

---

## 默认视图行为

> [!note]
> 默认情况下，队列视图将使用与操作中定义的相同的列表视图和表单视图。您可以将列表视图和表单视图传递到操作的上下文中，以设置或覆盖将使用的视图（要使用的上下文键为`form_view_id`和`list_view_id`）。
>

## 基础示例

例如，下面是一个简单的队列视图：

```xml
<cohort string="Subscription" date_start="date_start" date_stop="date" interval="month"/>
```

## 根元素与根属性

队列视图根元素是 `<cohort>`。

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `string` | 视图标题，应描述该队列视图。 | `string` | `''` |
| `date_start` | 有效的 `date` / `datetime` 字段，作为记录开始日期。 | `string` | `''` |
| `date_stop` | 有效的 `date` / `datetime` 字段，作为记录结束日期（用于计算流失）。 | `string` | `''` |
| `disable_linking` | 设为 `1` 时，点击队列单元格不再跳转列表视图。 | `bool` / `int` | `False` |
| `mode` | 模式，`churn` 或 `retention`。`retention` 为默认。 | `string` | `retention` |
| `timeline` | 时间轴方向，`forward`（默认）或 `backward`。 | `string` | `forward` |
| `interval` | 时间粒度，`day` / `week` / `month` / `year`。 | `string` | `month` |
| `measure` | 聚合字段；未设置时按记录数统计。 | `string` | `''` |

`mode` 语义：

- `churn`：从 0% 开始并随时间累积。
- `retention`：从 100% 开始并随时间递减。

`timeline` 语义：

- `forward`：从 `date_start` 到 `date_stop`。
- `backward`：从 `date_stop` 到 `date_start`（适用于 `date_start` 晚于 `date_stop` 的场景）。

## `field` 元素与属性

`<cohort>` 可包含 `<field>` 元素，用于管理可用度量（尤其是隐藏不适合聚合的字段）。

```xml
<cohort ...>
    <field name="amount_total"/>
</cohort>
```

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `name` | 视图中使用的字段名。 | `string` | 必填 |
| `string` | 覆盖字段默认显示名。 | `string` | 字段默认 `string` |
| `invisible` | 若为 `true`，字段不出现在活动/可选度量中；若为域表达式，会在当前行上下文中求值。 | `bool` / 域表达式 | `False` |
| `widget` | 字段显示的替代表示。 | `string` | `''` |

## 示例数据填充说明

原文末段说明：当当前模型无记录时，视图可填充一组示例数据。这些示例值会按字段名/模型做启发式填充（例如 `display_name` 与 `email`），且不可交互；一旦执行创建记录、添加列等操作，示例数据会被丢弃。

> [!note]
> 原文该段仅给出“可选 `bool`，默认 `False`”的信息，但未明确写出属性名；这里按原意保留说明，不额外补写属性名。
