# 列表

> 来源：`docs/obsidian/07 知识库/odoo文档/03_开发者/03_参考/03_用户界面/02_视图架构.md`
> 原文章节：`## 列表`
>
> 本文件从原始文档中拆分而来，以下内容尽量保留原文，仅做拆分与轻量排版。

列表视图的根元素是`list`（旧称`tree`）。

> [!note]
> 原文配有 `list.svg` 结构示意图；此处保留等价的根结构示例。

```xml
<list>
    ...
</list>
```

## 目录

- [根属性](#根属性)
- [组件概览](#组件概览)
- [字段属性](#字段属性)
- [按钮属性](#按钮属性)
- [`groupby`](#groupby)
- [`header`](#header)
- [`control` / `create`](#control--create)
- [示例](#示例)
- [其他提示](#其他提示)

---

## 根属性

可以向根元素`list`添加如下属性来自定义视图行为。

| 属性 | 说明 | 类型 | 默认 | 备注 |
| --- | --- | --- | --- | --- |
| `string` | 界面标题，仅在 `target="new"` 且 action 无标题时显示 | `Char` | `''` |  |
| `create` | 是否允许新建记录 | `bool` | `True` |  |
| `edit` | 是否允许编辑记录 | `bool` | `True` | 启用此属性才能使用内联编辑等功能 |
| `delete` | 是否允许删除 | `bool` | `True` |  |
| `import` | 是否允许导入数据 | `bool` | `True` |  |
| `export_xlsx` | 是否允许导出 XLSX | `bool` | `True` |  |
| `editable` | 内联编辑模式，可选 `top` / `bottom` | `char` | `''` | 基于此创建的内联表单继承 form 视图属性 |
| `multi_edit` | 批量编辑功能；仅接受 `'1'` | `char` | `''` |  |
| `open_form_view` | 每行末尾显示打开表单按钮（需可编辑） | `bool` | `False` |  |
| `default_group_by` | 默认按字段分组 | `char` | `''` | 由 `search` / action 影响 |
| `default_order` | 覆盖 `_order` | `char` | `''` | 可写 `sequence,name desc` 等 |
| `decoration-*` | 行装饰，例如 `decoration-danger` | `expr` | `False` | 评估为布尔表达式 |
| `limit` | 每页默认记录数 | `int` | `80（x2many 40）` |  |
| `groups_limit` | 分组时默认每页组数 | `int` | `80（x2many 40）` |  |
| `expand` | 分组后是否默认展开 | `bool` | `False` | 组数多时可能很慢 |
| `sample` | 空数据时是否展示示例记录 | `bool` | `False` | 示例记录不可交互 |

> [!warning]
> 如果 `edit="False"`，`editable`、`multi_edit`、`open_form_view` 等控制就地编辑的属性都失效。

> [!note]
> `sample="True"` 会生成演示记录，例如 `res.users` 会用 `firstname.lastname@sample.demo`，但用户无法更改这些内容。

---

## 组件概览

列表视图支持以下子元素：`field`、`button`、`groupby`、`header`、`control` / `create`。
占位符使用全大写字母表示。

### 字段属性

| 属性 | 说明 | 类型 | 默认 | 备注 |
| --- | --- | --- | --- | --- |
| `name` | 字段名 | `Char` | 必填 |  |
| `widget` | 渲染小部件 | `Char` |  | 引用 `field` 注册表 |
| `string` | 列标题 | `Char` |  |  |
| `optional` | 是否允许用户切换显隐（`show`/`hide`） | `Char` |  |  |
| `readonly` | 行级只读 | `expr` | `False` | 逻辑引用 `record` |
| `required` | 必填规则 | `expr` | `False` |  |
| `invisible` | 单元格隐藏 | `expr` | `False` | 可用于技术性保留字段 |
| `column_invisible` | 整列隐藏 | `expr` | `False` | 与 `invisible` 不同，计算时不包含子树 |
| `groups` | 组权限控制 | `Char` | `''` | 支持 `!` 前缀 |
| `decoration-*` | 行装饰 | `expr` | `False` | 示例：`decoration-info="state == 'draft'"` |
| `sum` / `avg` | 聚合显示（当前页） | `Char` | `''` | 需与字段 aggregator 匹配 |
| `width` | 指定像素宽度 | `Char` | `''` | 例如 `width="40px"` |
| `nolabel` | 表头留空（不可排序） | `Char` | `''` |  |

如果列表可能分组，不建议将数值字段放最后一列，分页器会与聚合行挤在一起。

> [!example]
> ```xml
> <list>
>     <field name="name" optional="show"/>
>     <field name="state" optional="show"/>
>     <field name="amount_total" sum="Total"/>
>     <field name="currency_id"/>
> </list>
> ```

> [!note]
> `column_invisible` 适合整列条件控制，`invisible` 适合每条记录的显示逻辑。

> [!example]
> ```xml
> <list>
>     <field name="name" string="My Custom Name"/>
>     <field name="amount" sum="Total"/>
>     <field name="currency_id"/>
>     <field name="tax_id"/>
> </list>
> ```

### 按钮属性

| 属性 | 说明 | 类型 | 默认 | 备注 |
| --- | --- | --- | --- | --- |
| `type` | `object` / `action` / `edit` | `Char` |  | `edit` 常用于直接打开表单 |
| `name` | 方法名或动作 XMLID | `Char` |  |  |
| `string` | 按钮文本（`icon` 时作 alt） | `Char` |  |  |
| `icon` | 图标 | `Char` |  |  |
| `help` | 悬浮提示 | `Char` |  |  |
| `context` | 执行时合并上下文 | `expr` | `{}` |  |
| `groups` | 权限控制 | `Char` | `''` |  |
| `invisible` | 当前行是否显示 | `expr` | `False` |  |
| `column_invisible` | 整列是否显示 | `expr` | `False` |  |
| `class` | CSS 类 | `Char` | `''` | `oe_stat_button` 等 |

> [!note]
> 列表按钮可以使用和表单一样的 `type="object"`、`type="action"`，但 `header` 会额外提供 `display="always"`。

> [!example]
> ```xml
> <list>
>     <field name="name"/>
>     <button type="edit" name="edit" icon="fa-edit" title="Edit"/>
>     <button type="object" name="my_method" string="Button1" column_invisible="context.get('hide_button')" invisible="amount &gt; 3"/>
>     <field name="amount"/>
>     <field name="currency_id"/>
>     <field name="tax_id"/>
> </list>
> ```

---

### `groupby`

| 属性 | 说明 | 类型 | 默认 | 备注 |
| --- | --- | --- | --- | --- |
| `name` | 用于分组标题的 Many2one 字段 | `Char` | 必填 | 该字段决定组头对象 |

`groupby` 支持嵌套 `button`（用于编辑）和 `field`（用于修饰符），这些字段不会直接渲染。
在 `groupby` 内可以放一个 `type="edit"` 的按钮，用于直接打开分组头（Many2one 记录）的表单。

> [!example]
> ```xml
> <list>
>     <field name="partner_id"/>
>     <groupby name="partner_id">
>         <button type="edit" name="edit" icon="fa-edit"/>
>         <field name="email"/>
>     </groupby>
> </list>
> ```

> [!note]
> `groupby` 内的字段只为条件提供值，不会显示出来。

---

### `header`

`header` 中的按钮位于控制面板上，而不是某一行；使用 `display="always"` 可以在无选中时也展示。

`header` 内的 `button` 与列表行按钮基本一致，但额外支持：

| 属性 | 说明 | 类型 | 默认 | 备注 |
| --- | --- | --- | --- | --- |
| `display` | `always` / `selection` | `Char` | `''` | `always` 表示无需选中记录也显示 |

> [!note]
> `header` 常用于批量动作、导出按钮等。

> [!example]
> ```xml
> <header>
>     <button name="toDoAlways" type="object" string="Always displayed" display="always"/>
>     <button name="toDoSelection" type="object" string="Displayed if selection"/>
> </header>
> ```

---

### `control` / `create`

`control` 提供了额外的“添加行”入口，仅在 x2many 列表中有意义。定义任意 `create` 会覆盖默认的“添加一行”按钮。

`control` 本身不带属性；每个创建按钮通过 `create` 子元素定义：

| `create` 属性 | 说明 | 类型 | 默认 | 备注 |
| --- | --- | --- | --- | --- |
| `string` | 按钮文本 | `Char` | 必填 |  |
| `context` | 创建时合并到上下文 | `expr` | `{}` | 常用于设置默认值 |

> [!note]
> `control` / `create` 不适用于主列表，而是 x2many 细节行的场景。

## 示例

```xml
<list editable="bottom" multi_edit="1" default_order="sequence,name desc">
    <header>
        <button name="action_mass_confirm" type="object" string="Confirm" display="always"/>
    </header>
    <field name="sequence" widget="handle"/>
    <field name="name" optional="show"/>
    <field name="amount_total" sum="Total"/>
    <button name="action_open" type="object" icon="fa-external-link" help="Open"/>
    <groupby name="partner_id">
        <field name="email"/>
        <button type="edit" name="edit" icon="fa-edit"/>
    </groupby>
    <control>
        <create string="Add a line"/>
        <create string="Add a section" context="{'default_type': 'section'}"/>
    </control>
</list>
```

## 其他提示

- 列表不支持同一字段重复出现。
- `editable`、`multi_edit`、`open_form_view` 都依赖 `edit="True"` 才有意义。
- `column_invisible` 与 `invisible` 要分别为列与单元格逻辑使用。
- `groupby`、`header`、`control/create` 三者的职责要分清，避免在同一位置堆叠。
