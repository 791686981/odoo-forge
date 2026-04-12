# 日历

> 来源：`docs/obsidian/07 知识库/odoo文档/03_开发者/03_参考/03_用户界面/02_视图架构.md`
> 原文章节：`## 日历`
>
> 本文件从原始文档中拆分而来，以下内容尽量保留原文，仅做拆分与轻量排版。

日历视图将记录显示为每日、每周、每月或每年日历中的事件。

## 目录

- [基础说明](#基础说明)
- [根元素与上下文](#根元素与上下文)
- [根属性](#根属性)
- [`field` 子元素](#field-子元素)
- [`field` 附加属性](#field-附加属性)
- [模型通用](#模型通用)

---

## 基础说明

> [!note]
> 默认情况下，日历视图会围绕当前日期（今天）居中。可以在 action 的 `context` 中传入 `initial_date`，将初始焦点定位到该日期所在时段（结合 `mode` 生效）。

## 根元素与上下文

日历视图的根元素是 `calendar`：

```xml
<calendar>
    ...
</calendar>
```

## 根属性

下表按原文章节顺序整理日历视图可用的根属性。

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `string` | 视图标题，仅在 action 无名称且 `target="new"`（如对话框）时显示。 | `string` | `''` |
| `create` | 在视图中禁用/启用记录创建。设为 `false` 可禁用创建。 | `bool` | `True` |
| `edit` | 在视图中禁用/启用记录编辑。 | `bool` | `True` |
| `delete` | 通过“操作”下拉菜单禁用/启用删除。设为 `false` 可禁用删除。 | `bool` | `True` |
| `date_start` | 保存事件开始日期的字段名。 | `string` | `''` |
| `date_stop` | 保存事件结束日期的字段名。配置后事件可在日历中拖拽移动。 | `string` | `''` |
| `date_delay` | `date_stop` 的替代项，表示事件持续时间（单位：天）。 | `string` | `''` |
| `color` | 用于颜色分段的字段名。相同分段记录会使用同一高亮颜色，侧栏展示 `display_name` 或头像。 | `string` | `''` |
| `form_view_id` | 创建或编辑事件时打开的表单视图。未设置时回退到当前 action 的表单视图（若有）。 | `string` / `int` | `''` |
| `event_open_popup` | 设为 `true` 时在 `FormViewDialog` 中打开事件，否则通过 `do_action` 在新表单页打开。 | `bool` | `False` |
| `quick_create` | 启用点击快速创建：先仅输入名称创建，失败则回退完整表单对话框。 | `bool` | `False` |
| `quick_create_view_id` | 启用 `quick_create` 时，指定创建事件弹出的视图。 | `string` / `int` | `''` |
| `create_name_field` | 快速创建时用于保存记录文本表示（名称）的字段。 | `string` | `''` |
| `all_day` | 布尔字段名，标记事件是否为全天事件。 | `string` | `''` |
| `mode` | 初始显示模式。可选：`day`、`week`、`month`、`year`。 | `string` | `''` |
| `scales` | 可用刻度列表（逗号分隔）。默认全部可用，取值同 `mode`。 | `string` | `''` |

## `field` 子元素

`calendar` 内可声明 `field` 子元素，用于：

- 声明要聚合或参与日历卡片逻辑的字段；
- 或在日历卡片中直接展示字段值。

```xml
<calendar>
    <field name="name"/>
    <field name="user_id"/>
</calendar>
```

## `field` 附加属性

`field` 在日历视图中可使用以下附加属性（按原文整理）：

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `invisible` | 设为 `True` 时隐藏卡片中的该字段值。 | `bool` / 表达式 | `False` |
| `avatar_field` | 仅适用于 `x2many` 字段，在卡片中显示头像而非 `display_name`。 | `string` | `''` |
| `write_model` | 定义过滤结果写入的目标模型。 | `string` | `''` |
| `write_field` | 定义过滤结果写入的目标字段。 | `string` | `''` |
| `filter_field` | 可选，指定用于保存过滤器状态的字段。 | `string` | `''` |
| `filters` | 设为 `True` 时将该字段加入侧栏过滤器。 | `bool` | `False` |
| `color` | 与 `filters` 配合，为侧栏过滤复选框指定着色字段。 | `string` | `''` |

> [!note]
> 原文说明：可添加一个过滤器并将结果保存到定义模型中；`filter_field` 为可选项，用于保存过滤状态。

## 模型通用

用于默认日历视图的字段。
