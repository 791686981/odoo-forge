# 搜索

> 来源：`docs/obsidian/07 知识库/odoo文档/03_开发者/03_参考/03_用户界面/02_视图架构.md`
> 原文章节：`## 搜索`
>
> 本文件从原始文档中拆分而来，以下内容尽量保留原文，仅做拆分与轻量排版。

搜索视图只用于筛选另一视图的记录（通常是列表或图表），自身不直接展示内容。它的根元素是 `search`，不接受任何属性，所有行为由内部的字段、过滤器、分组等元素决定。

> [!note]
> 原文包含搜索视图结构示意图（`search.svg`）。
> ```xml
> <search>
>     ...
> </search>
> ```
>
## 目录

- [搜索视图简介](#搜索视图简介)
- [组件](#组件)
- [field：基于字段值进行过滤](#field基于字段值进行过滤)
- [filter：创建预定义过滤器](#filter创建预定义过滤器)
- [separator：分隔过滤器组](#separator分隔过滤器组)
- [group：分隔过滤器组](#group分隔过滤器组)
- [searchpanel：显示搜索面板](#searchpanel显示搜索面板)
- [searchpanel 字段属性](#searchpanel字段属性)
- [搜索默认值](#搜索默认值)

---

## 搜索视图简介

`search` 的子元素决定 UI 上展示的控件：是直接显示多个字段，还是把过滤器嵌套在下拉中。搜索视图常与 `actions` 中的默认 `domain`/`context`、`group_by` 以及 `search_default_*` 结合，形成打开界面时的默认筛选。

## 组件

搜索视图支持以下子元素，它们也会影响搜索面板或过滤器下拉的结构：

- `field`：基于字段值构建过滤限定。
- `filter`：预定义过滤器，支持默认启用、日期周期、分组等。
- `separator`：在连续过滤器之间插入视觉断点。
- `group`：为多个过滤器创建分组或复杂布局。
- `searchpanel`：在多记录视图左侧展示快速筛选栏。

### field：基于字段值进行过滤

`field` 元素将用户输入转换为搜索域，默认形式为 `[(name, operator, value)]`，多个字段以 `AND` 组合。

| 属性 | 说明 | 类型 | 默认 | 备注 |
| --- | --- | --- | --- | --- |
| `name` | 要过滤的字段名称 | `string` | 必填 |  |
| `string` | 字段标签 | `string` | 模型字段的 `string` 属性 |  |
| `operator` | 覆盖默认运算符，如 `=`、`ilike`、`child_of` 等 | `string` | 取决于字段类型 |  |
| `filter_domain` | 使用 `self` 构建的自定义域，优先级高于 `operator` | `Python 表达式` | `[]` | 适合跨字段或有特殊逻辑的筛选 |
| `context` | 合并到目标视图的上下文，可用 `self` 读取输入值 | `Python 表达式` | `{}` |  |
| `completion_domain` | 自动完成功能（如 Many2one）返回结果的额外域 | `Python 表达式` | `[]` |  |
| `groups` | 以逗号分隔的用户组列表，支持 `!` 排除 | `string` | `''` | 例如 `groups="base.group_no_one,!base.group_multi_company"` |
| `invisible` | 控制是否显示，`False` 为可见 | `Python 表达式` | `False` | 可用于提前加载字段供表达式引用 |

> [!note]
> `invisible` 有两个用途：
>
> - 提高可读性，避免视图过载；
> - 提前在视图中定义字段，以便在表达式中使用。

> [!example]
> ```xml
> <field name="fname_b" invisible="fname_c != 3 and fname_a == parent.fname_d"/>
> <group invisible="fname_c != 4">
>     <field name="fname_c"/>
>     <field name="fname_d"/>
> </group>
> ```

> [!note]
> 原文包含 `field` 用法示意图（`search_field.svg`）。
> ```xml
> <search>
>     <field name="name" string="My Custom Name"/>
>     <field name="amount"/>
>     <field name="currency_id"/>
>     <field name="ref" filter_domain="[('name', 'like', self)]"/>
> </search>
> ```

### filter：创建预定义过滤器

`filter` 元素可以定义常用筛选、设置默认启用项，或为上下文/分组提供额外数据。

| 属性 | 说明 | 类型 | 默认 | 备注 |
| --- | --- | --- | --- | --- |
| `name` | 技术名称，可被 `search_default_*` 或继承引用 | `string` | 必填 |  |
| `string` | 显示标签 | `string` | 必填 |  |
| `help` | 悬浮提示 | `string` | `''` |  |
| `domain` | 附加到操作域的 Python 表达式 | `Python 表达式` | `[]` | 记录必须满足 |
| `date` | 绑定 `date`/`datetime` 字段，以生成时间相关子项 | `string` | `''` | 需要具备时间信息的字段 |
| `start_month` | 日期过滤器可选的最早月份（相对当前月） | `int` | `-2` | 仅对设置 `date` 的过滤器生效 |
| `end_month` | 日期过滤器可选的最晚月份（相对当前月） | `int` | `0` |  |
| `start_year` | 日期过滤器可选的最早年份（相对当前年） | `int` | `-2` |  |
| `end_year` | 日期过滤器可选的最晚年份（相对当前年） | `int` | `0` |  |
| `default_period` | 默认开启的周期或 `custom_*` 过滤器 ID | `string` | `month`（不可用则取最近月份） | 可选值：`第一季度`/`第二季度`/`第三季度`/`第四季度`/`month±x`/`year±x`/同级自定义过滤器名称（需加 `custom_`） |
| `invisible` | 控制是否显示 | `Python 表达式` | `False` | 同 `field` 的用例 |
| `groups` | 界定可见组，支持 `!` 排除 | `string` | `''` |  |
| `context` | 合并到上下文，可用于 `group_by` 等 | `Python 表达式` | `{}` | 通过 `context={'group_by': 'field_id:interval'}` 控制分组；`read_groups` 可能受 `group_expand` 影响 |

> [!note]
> `invisible` 可用于避免界面拥挤，也可为表达式预留字段。

> [!example]
> ```xml
> <field name="fname_b" invisible="fname_c != 3 and fname_a == parent.fname_d"/>
> <group invisible="fname_c != 4">
>     <field name="fname_c"/>
>     <field name="fname_d"/>
> </group>
> ```

> [!example]
> ```xml
> <field name="FIELD_NAME" groups="base.group_no_one,!base.group_multi_company"/>
> ```

> [!note]
> `read_groups` 结果在分组时可能受 `group_expand` 影响，导致出现空分组。详情见 `odoo.fields.Field` 相关文档。

> [!warning]
> 过滤器之间若未用 `separator`/`group` 或其他元素分隔，会被视为包容组合，最终通过 `OR` 而非默认的 `AND`。

> [!example]
> ```xml
> <filter domain="[('state', '=', 'draft')]"/>
> <filter domain="[('state', '=', 'done')]"/>
> ```
> `state` 为 `draft` 或 `done` 的记录都会展示。

> [!example]
> ```xml
> <filter domain="[('state', '=', 'draft')]"/>
> <separator/>
> <filter domain="[('delay', '<', 15)]"/>
> ```
> `state` 为 `draft` 且 `delay < 15` 的记录才会展示。

> [!note]
> 原文包含 `filter` 用法示意图（`search_filter.svg`）。
> ```xml
> <search>
>     <filter string="My Custom Name" domain="[('name', 'ilike', 'AAA')]"/>
>     <filter string="My orders" domain="[('user_id', '=', uid)]"/>
>     <filter string="Category" context="{'group_by': 'category_id'}"/>
> </search>
> ```

### separator：分隔过滤器组

`separator` 在简单搜索视图中提供视觉间隔，避免过滤器拥挤。更复杂的布局建议使用 `group`。

```xml
<search>
    <FILTERS/>
    <separator/>
    <FILTERS/>
</search>
```

`separator` 无属性可设置。

### group：分隔过滤器组

`group` 可容纳多个过滤器、按钮或说明，用于更丰富的搜索结构。

```xml
<search>
    <group>
        <FILTERS/>
    </group>
</search>
```

`group` 也没有额外属性。

### searchpanel：显示搜索面板

`searchpanel` 在多记录视图（如列表）左侧渲染快速筛选栏，仅允许 `field` 子元素。

```xml
<search>
    <searchpanel>
        <FIELDS/>
    </searchpanel>
</search>
```

#### searchpanel 字段属性

| 属性 | 说明 | 类型 | 默认 | 备注 |
| --- | --- | --- | --- | --- |
| `name` | 要筛选的字段 | `string` | 必填 |  |
| `string` | 字段标签 | `string` | 模型字段的 `string` 属性 |  |
| `select` | 控制可选值模式，`one` 允许单选，`multi` 允许多选 | `string` | `one` | `one` 适用于 `many2one`/`selection`，`multi` 还支持 `many2many`；决定是否生成值计数器 |
| `groups` | 控制可见用户组，支持 `!` 排除 | `string` | `''` |  |
| `icon` | 字段图标 | `string` | `''` |  |
| `color` | 字段颜色 | `string` | `''` |  |
| `domain` | 附加域，记录必须满足 | `Python 表达式` | `[]` |  |
| `limit` | 单字段可获取值的最大数量，超出显示错误；`0` 表示无限 | `int` | `200` | 用于规避性能问题，亦可重写 `search_panel_select_range`/`search_panel_select_multi_range` |
| `context` | 合并上下文，可控制 `group_by`、`group_expand` 等 | `Python 表达式` | `{}` | 只在 `many2one`/`many2many` 上有效，常用于 `context={'group_by': 'field_id:interval'}` |

`select="one"` 字段可以选择在父节点下展示子类别还是直接平铺；`select="multi"` 字段可启用计数器，只在计数器非零时展示结果。

> [!tip]
> 通过 `limit` 控制数量是避免性能下降的常用手段，另一种解决方案是重写 `search_panel_select_range`/`search_panel_select_multi_range`。
>
> [!example]
> ```xml
> <searchpanel>
>     <field name="department_id"/>
>     <field name="manager_id" select="multi" domain="[('department_id', '=', department_id)]"/>
> </searchpanel>
> ```

## 搜索默认值

可以通过操作上下文的 `search_default_*name*` 键预设字段或过滤器。

- 字段：值即写入字段的内容。
- 过滤器：值为布尔值或数字。

> [!example]
> 对于字段 `foo` 和过滤器 `bar`，以下上下文会在 `acro` 上搜索 `foo` 并默认启用 `bar`：
>
> ```python
> {
>     'search_default_foo': 'acro',
>     'search_default_bar': 1
> }
> ```

可以使用 1 到 99 的数值设置默认 `groupby` 过滤器的启用顺序。

> [!example]
> 对于 `groupby` 过滤器 `foo` 和 `bar`，以下上下文会先启用 `bar`，再启用 `foo`：
>
> ```python
> {
>     'search_default_foo': 2,
>     'search_default_bar': 1
> }
> ```
