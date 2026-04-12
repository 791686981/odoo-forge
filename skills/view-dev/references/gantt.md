# 甘特图

> 来源：`docs/obsidian/07 知识库/odoo文档/03_开发者/03_参考/03_用户界面/02_视图架构.md`
> 原文章节：`## 甘特图`
>
> 本文件从原始文档中拆分而来，以下内容尽量保留原文，仅做拆分与轻量排版。

甘特图视图用于调度场景的时间可视化。根元素为 `<gantt/>`，无子元素，但可通过属性控制分组、拖拽、精度、模板弹层与操作行为。

## 目录

- [根元素](#根元素)
- [根属性总览](#根属性总览)
- [Decoration 条件样式](#decoration-条件样式)
- [操作开关](#操作开关)
- [精度 `precision`](#精度-precision)
- [比例尺与时间窗口](#比例尺与时间窗口)
- [模板与上下文](#模板与上下文)
- [其他行为属性](#其他行为属性)

---

## 根元素

```xml
<gantt/>
```

## 根属性总览

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `string` | 视图标题；仅在 action 无名称且 `target="new"` 时显示。 | `string` | `''` |
| `create` | 是否允许创建记录。 | `bool` | `True` |
| `edit` | 是否允许编辑记录。 | `bool` | `True` |
| `delete` | 是否允许删除记录。 | `bool` | `True` |
| `date_start` | 每条记录开始时间字段。 | `string` | `''` |
| `date_stop` | 每条记录结束时间字段。 | `string` | `''` |
| `dependency_field` | 依赖关系 `many2many` 字段（B 依赖 A 时，从 B 取 A）。 | `string` | `''` |
| `dependency_inverted_field` | 与 `dependency_field` 相反方向的 `many2many` 字段（B 依赖 A 时，从 A 取 B）。 | `string` | `''` |
| `color` | 按字段值给药丸着色。 | `string` | `''` |
| `decoration-{$name}` | 按条件表达式控制样式。 | `Python 表达式` | `False` |
| `default_group_by` | 默认分组字段。 | `string` | `''` |
| `disable_drag_drop` | 设为 `true` 时禁用拖放。 | `bool` | `False` |
| `consolidation` | 记录单元格汇总值字段。 | `string` | `''` |
| `consolidation_max` | 按分组字段配置汇总上限，超限单元格标红。 | `dict` | `{}` |
| `consolidation_exclude` | 设为 `true` 时将任务排除于汇总，并在汇总行显示条纹。 | `string` | `''` |
| `cell_create` | 是否允许在时间槽单元格上快速创建。 | `bool` | `True` |
| `plan` | 是否允许“放大镜”计划操作（安排未分配记录）。 | `bool` | `True` |
| `offset` | 基于比例尺计算默认时间窗口时，对“今天”偏移的单位数。 | `int` | `0` |
| `progress` | 完成百分比字段（`0` 到 `100`）。 | `string` | `''` |
| `precision` | 各比例尺下药丸对齐精度 JSON。 | `JSON` | 见下文 |
| `total_row` | 是否显示记录总数行。 | `bool` | `False` |
| `collapse_first_level` | 按单字段分组时是否允许首层折叠。 | `bool` | `False` |
| `display_unavailability` | 是否显示 `gantt_unavailability` 返回的不可用日期标记。 | `bool` | `False` |
| `default_scale` | 初始比例尺。可选 `day`/`week`/`month`/`year`。 | `string` | `month` |
| `scales` | 允许的比例尺列表（逗号分隔）。 | `string` | 全部允许 |
| `templates` | 定义 `gantt-popover` 模板。 | `QWeb` | `''` |
| `on_create` | 点击“添加”时改为启动客户端动作（XMLID）。 | `string` | `''` |
| `form_view_id` | 创建/编辑时打开的表单视图；未设则回退到 action 的 form view。 | `string` / `int` | `''` |
| `dynamic_range` | 设为 `true` 时从第一条记录开始展示，而非从自然周期起点开始。 | `bool` | `False` |
| `pill_label` | 在周/月比例尺下显示药丸时间标签。 | `bool` | `False` |
| `thumbnails` | 分组为关系字段时，配置组名旁缩略图字段映射。 | `dict` | `{}` |
| （原文末段未给出属性名） | 模型无记录时填充示例数据；示例数据不可交互，执行操作后丢弃。 | `bool` | `False` |

## Decoration 条件样式

`decoration-{$name}` 支持基于记录属性的条件样式。`{$name}` 可为 Bootstrap 上下文颜色之一：`danger`、`info`、`secondary`、`success`、`warning`。

表达式按记录上下文求值；上下文中还可用：

- `uid`：当前用户 ID
- `today`：当前本地日期（`YYYY-MM-DD`）
- `now`：当前本地日期时间（`YYYY-MM-DDhh:mm:ss`）

```xml
<gantt decoration-info="state == 'draft'"
       decoration-danger="state == 'help_needed'"
       decoration-bf="state == 'busy'">
  ...
</gantt>
```

## 操作开关

将 `create` / `cell_create` / `edit` / `delete` / `plan` 设为 `false` 可以禁用对应行为：

- `create`：控制面板“添加”按钮。
- `cell_create`：悬停时间槽单元格时的 `+` 按钮（依赖 `create`）。
- `edit`：打开记录后是否处于可编辑状态。
- `delete`：是否允许通过操作菜单删除记录。
- `plan`：时间槽上的“放大镜”计划按钮（依赖 `edit`）。

> [!example]
> 如果不希望在甘特视图创建记录，且模型需要开始/结束日期，建议同时禁用 `plan`，否则无法找到可安排记录。

## 精度 `precision`

`precision` 是 JSON 对象，用于指定各比例尺下药丸时间对齐策略。

`day` 可选值（默认 `hour`）：

- `hour`：对齐到整点。
- `hour:half`：对齐到半小时。
- `hour:quarter`：对齐到 15 分钟。

`week` 可选值（默认 `day:half`）：

- `day`：对齐到整天。
- `day:half`：对齐到半天。

`month` 可选值（默认 `day:half`）：

- `day`：对齐到整天。
- `day:half`：对齐到半天。

`year`：始终对齐到整天。

示例：

`{"day":"hour:quarter","week":"day:half","month":"day"}`

## 比例尺与时间窗口

- `default_scale`：初始比例尺，取值 `day` / `week` / `month` / `year`。
- `scales`：允许的比例尺列表，默认全部可用。
- `offset`：基于比例尺偏移默认时间窗口。

示例：

- `default_scale="week"` 且 `offset="+1"` 时打开下周。
- `default_scale="month"` 且 `offset="-2"` 时打开两个月前。

## 模板与上下文

`templates` 用于定义 `gantt-popover` 模板（悬停药丸时展示）。

甘特图模板采用 JavaScript QWeb，并提供 `widget` 上下文对象：

- `widget`：当前 `GanttRow()`，可读取元信息。
- `getColor`：可直接在模板上下文中调用，用于颜色整数转换。

`thumbnails` 用于分组为关系字段时显示头像等缩略图，值为字段映射字典。

```xml
<gantt
   date_start="date_start"
   date_stop="date_stop"
   thumbnails="{'user_id': 'image_128'}"
/>
```

当按 `user_id` 分组时，会在用户名旁显示头像。

## 其他行为属性

- `dependency_field` / `dependency_inverted_field`：用于绘制依赖箭头与联动重排。
- `consolidation` / `consolidation_max` / `consolidation_exclude`：用于汇总显示与超限高亮。
- `display_unavailability`：仅做不可用日期视觉提示，不阻止记录安排。
- `dynamic_range`：从第一条记录开始展示甘特时间窗。
- `form_view_id`：创建/编辑时的目标表单视图。
- `on_create`：把“添加”行为改为启动客户端动作（例如 `on_create="%(my_module.my_wizard)d"`）。
