# 网格

> 来源：`docs/obsidian/07 知识库/odoo文档/03_开发者/03_参考/03_用户界面/02_视图架构.md`
> 原文章节：`## 网格`
>
> 本文件从原始文档中拆分而来，以下内容尽量保留原文，仅做拆分与轻量排版。

网格视图用于在行列坐标中展示聚合后的数值数据。该视图有独立架构和额外校验逻辑，配置能力集中在根节点与特定类型字段上。

## 目录

- [限制](#限制)
- [架构总览](#架构总览)
- [根元素 `<grid>`](#根元素-grid)
- [`button` 元素](#button-元素)
- [`field type="row"`](#field-typerow)
- [`field type="col"` 与 `range`](#field-typecol-与-range)
- [`field type="measure"`](#field-typemeasure)
- [服务器交互](#服务器交互)
- [服务器钩子](#服务器钩子)
- [ACL](#acl)
- [上下文键](#上下文键)

---

## 限制

此视图仍在开发中，可能需要扩展或修改。

- 仅 `date` 列字段经过测试；`selection` 和 `many2one` 名义上已支持但未充分测试，`datetime` 未实现。
- 列单元格几乎不可配置，且必须为数值型。
- 单元格调整默认禁用，需显式配置启用。
- 受 `fields_view_get` 后处理限制，`create`、`edit`、`delete` 的 ACL 元数据不会自动挂到根节点。

## 架构总览

网格视图架构由以下元素构成：

```xml
<grid>
    <button .../>
    <field type="row" .../>
    <field type="col" ...>
        <range .../>
    </field>
    <field type="measure" .../>
</grid>
```

## 根元素 `<grid>`

`grid` 是架构根元素，支持以下属性：

| 属性 | 必填 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `string` | 是 | `string` | - | 视图标题。 |
| `create` | 否 | `bool` | `True` | 是否允许创建。 |
| `edit` | 否 | `bool` | `True` | 是否允许编辑。 |
| `delete` | 否 | `bool` | `True` | 是否允许删除。 |
| `adjustment` | 否 | `string` | `''` | 单元格调整模式，`object` 或 `action`。 |
| `adjust_name` | 否 | `string` | `''` | 当 `adjustment` 启用时，方法名或动作 ID。 |
| `hide_line_total` | 否 | `bool` | `False` | 隐藏总计行。 |
| `hide_column_total` | 否 | `bool` | `False` | 隐藏总计列。 |
| `barchart_total` | 否 | `bool` | `False` | 在底部显示基于列总计的条形图。 |
| `create_inline` | 否 | `bool` | `False` | 在底部显示“添加一行”入口。 |
| `display_empty` | 否 | `bool` | `False` | 无数据时仍显示网格，而不是帮助内容。 |

`adjustment` / `adjust_name` 生效时，调整参数会以 `grid_adjust` 注入上下文；`object` 模式下也会作为位置参数传入（紧邻一个空 ID 列表）。常见参数语义：

- `row_domain`：被调整单元格所在行的域。
- `column_field`：被调整单元格所在列字段名。
- `column_value`：被调整单元格所在列值。
- `cell_field`：被调整单元格对应的度量字段。
- `change`：新旧单元格值差值（可正可负）。

> [!note]
> 当 `create_inline="true"` 时，控制面板中的“添加一行”按钮会隐藏。

> [!note]
> 当无数据且未启用 `display_empty` 时，会显示帮助内容而不是网格。

## `button` 元素

`button` 是常规 Odoo 操作按钮，显示在视图头部。

| 属性 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| `string` | 是 | `string` | 按钮标签。 |
| `type` | 是 | `string` | `object` 或 `action`。 |
| `name` | 是 | `string` | 方法名或动作 ID。 |
| `context` | 否 | `expr` | 额外上下文。 |

> [!note]
> 不支持工作流按钮。

服务器回调会提供当前视图中显示的所有记录 ID：

- `object` 按钮：可作为方法参数传递。
- `action` 按钮：可作为上下文 `active_ids` 传递。

## `field type="row"`

`row` 字段用于行分组；若存在搜索视图的 `groupby` 过滤器，会覆盖该分组配置。

视图中 `row` 字段顺序决定分组深度。例如先 `school` 再 `age`，则先按学校分组，再在每个学校内按年龄分组。

## `field type="col"` 与 `range`

`col` 字段用于列分组。列字段可包含 0 个或多个 `range` 子元素定义可切换范围。

`range` 必填属性如下：

| 属性 | 说明 |
| --- | --- |
| `name` | 范围技术名；可通过 `grid_range` 上下文覆盖默认范围（默认为第一个）。 |
| `string` | 范围按钮显示文本。 |
| `span` | 当前页展示跨度，可能触发分页。对 `date` 字段，当前有效值是 `week`、`month`。 |
| `step` | 相邻列步长。对 `date` 字段，当前有效值是 `day`。 |

## `field type="measure"`

`measure` 字段是单元格数值字段，自动通过 `read_group` 聚合。

度量字段可使用 `widget` 属性自定义显示格式。

## 服务器交互

除可选按钮外，网格视图目前主要调用以下方法：

1. `read_grid`
2. `read_grid_domain(field, range)`
3. `adjust_grid`

### `read_grid`

`read_grid`（模块在所有模型上提供）返回网格主体信息。

行标题列表（每项是字典）：

| 键 | 必填 | 说明 |
| --- | --- | --- |
| `values` | 是 | 字典；每个 `row` 字段映射到 `[value, label]`。 |
| `domain` | 是 | 该行源记录域；调整单元格时可能用于复制记录。 |

列标题列表（每项是字典）：

| 键 | 必填 | 说明 |
| --- | --- | --- |
| `values` | 是 | 列值信息，语义同上。 |
| `domain` | 是 | 列域。 |
| `current` | 否 | 是否高亮当前列。 |

网格数据是“行列表 -> 单元格列表 -> 单元格字典”：

| 键 | 必填 | 说明 |
| --- | --- | --- |
| `value` | 是 | 单元格数值。 |
| `domain` | 是 | 匹配该单元格记录的域（应视为不透明）。 |
| `size` | 是 | 单元格分组记录数。 |
| `readonly` | 否 | 该单元格是否只读。 |
| `classes` | 否 | 追加到单元格容器的类名列表。与基础类（前缀 `o_grid_cell_`）冲突时会被忽略。 |

> [!note]
> 网格数据是“密集”的：即使数据库查不到某单元格分组，也会生成带默认值的空单元格。

分页键：

| 键 | 说明 |
| --- | --- |
| `prev` | 假值表示无上一页；否则是可并入视图上下文的分页片段（不透明）。 |
| `next` | 假值表示无下一页；否则是可并入视图上下文的分页片段（不透明）。 |

### `read_grid_domain(field, range)`

`read_grid_domain(field, range)`（模块在所有模型上提供）返回与当前网格跨度匹配的域。`read_grid` 内部也会调用它，外部独立调用可用于配合 `search_count` 或 `read_group`。

### `adjust_grid`

`adjust_grid` 当前尚无完整实现，其语义可能随时间和用例演进。

## 服务器钩子

`read_grid` 会调用多个内部钩子，便于局部定制而不必整体覆写。

| 钩子 | 说明 |
| --- | --- |
| `_grid_format_cell(group, cell_field)` | 将 `read_group` 单组结果转换为网格单元格。 |
| `_grid_make_empty_cell(row_domain, column_domain, view_domain)` | 生成无匹配分组时的空单元格。 |
| `_grid_column_info(name, range)` | 生成 `ColumnMetadata`，用于返回列信息或驱动 `read_group -> read_grid` 转换。 |

`_grid_column_info(name, range)` 相关元数据包括：

| 键 | 说明 |
| --- | --- |
| `grouping` | 列实际分组字段/查询。 |
| `domain` | 当列可分页时，应用到 `read_group` 的域。 |
| `prev` | 上一页分页上下文片段；`False` 表示禁用该方向分页。 |
| `next` | 下一页分页上下文片段；`False` 表示禁用该方向分页。 |
| `values` | 当前页列值列表。 |
| `format` | 将该列值从 `read_group` 格式转为 `read_grid` 格式。 |

`values` 中每一项通常包含：

| 键 | 说明 |
| --- | --- |
| `values` | 字段名到列值的映射（通常是 `name -> value`）。 |
| `domain` | 与该列匹配的域。 |
| `is_current` | 当前列是否应高亮。 |

## ACL

- 若视图不可编辑，则单元格也不可编辑。
- 若视图不可创建，则不会显示“添加一行”按钮。

## 上下文键

| 键 | 说明 |
| --- | --- |
| `grid_range` | 当视图定义多个范围时，指定默认使用的范围。 |
| `grid_anchor` | 覆盖默认列范围锚点。对日期字段，表示跨度计算参考日期；默认是用户时区下的“今天”。 |

