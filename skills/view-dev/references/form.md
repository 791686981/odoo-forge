# 表单

> 来源：`docs/obsidian/07 知识库/odoo文档/03_开发者/03_参考/03_用户界面/02_视图架构.md`
> 原文章节：`## 表单`
>
> 本文件从原始文档中拆分而来，以下内容尽量保留原文，仅做拆分与轻量排版。

表单视图用于显示单个记录的数据。它们由常规的 [HTML](https://en.wikipedia.org/wiki/HTML) 组成，并包含额外的语义和结构组件。

表单视图的根元素是 `form`：

```xml
<form>
    ...
</form>
```

## 目录

- [根属性](#根属性)
- [语义组件](#语义组件)
- [`field`：显示字段值](#field显示字段值)
- [`label`：显示字段标签](#label显示字段标签)
- [`button`：显示操作按钮](#button显示操作按钮)
- [讨论小部件](#讨论小部件)
- [附件预览小部件](#附件预览小部件)
- [结构组件](#结构组件)
- [`group`：定义列布局](#group定义列布局)
- [`sheet`：使布局更具响应性](#sheet使布局更具响应性)
- [`notebook` 和 `page`：添加带标签的部分](#notebook-和-page添加带标签的部分)
- [`newline`：开始新的组行](#newline开始新的组行)
- [`separator`：添加水平间距](#separator添加水平间距)
- [`header`：显示工作流按钮和状态](#header显示工作流按钮和状态)
- [`footer`：显示对话框按钮](#footer显示对话框按钮)
- [按钮容器](#按钮容器)
- [标题容器](#标题容器)

---

## 根属性

可以向根元素 `form` 添加可选属性以自定义视图：

| 属性 | 描述 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `string` | 当动作没有标题且 `target="new"`（如对话框）时显示。 | `string` | `''` |
| `create` | 是否允许创建记录。 | `bool` | `True` |
| `edit` | 是否允许编辑记录。 | `bool` | `True` |
| `duplicate` | 是否允许在操作菜单中复制记录。 | `bool` | `True` |
| `delete` | 是否允许在操作菜单中删除记录。 | `bool` | `True` |
| `js_class` | 用自定义 JavaScript 组件替代标准 form。 | `string` | `''` |
| `disable_autofocus` | 禁用视图中首个字段自动聚焦。 | `bool` | `False` |

## 语义组件

语义组件与 Odoo 系统集成，并允许与其进行交互。

表单视图常见语义组件包括：`field`、`label`、`button`、讨论小部件、附件预览小部件。

占位符使用全大写字母表示。

## `field`：显示字段值

`field` 元素渲染（并可能允许编辑）当前记录的单个字段。

在表单视图中重复使用同一字段是支持的，这些实例可以使用不同的 `invisible` 和 `readonly`。但如果同一字段出现多次且 `required` 不一致，行为不可保证。

```xml
<form>
    <field name="FIELD_NAME"/>
</form>
```

### `field` 属性

| 属性 | 说明 | 类型 | 默认值 | 备注 |
| --- | --- | --- | --- | --- |
| `name` | 要渲染的字段名。 | `string` | - | 必填 |
| `widget` | 字段小部件（影响渲染/编辑方式）。 | `string` | `''` | 可选 |
| `id` | 节点 ID。 | `string` | `''` | 重复字段时用于 `label for` |
| `string` | 字段标签文本。 | `string` | 模型字段 `string` | 可选 |
| `help` | 鼠标悬停提示。 | `string` | `''` | 可选 |
| `options` | 小部件配置。 | Python 表达式（dict） | `{}` | 关系字段常用 `no_create`/`no_quick_create`/`no_open`/`no_create_edit` |
| `readonly` | 是否只读。 | Python 表达式（bool） | `False` | 可选 |
| `required` | 是否必填。 | Python 表达式（bool） | `False` | 可选 |
| `invisible` | 是否隐藏。 | Python 表达式（bool） | `False` | 可选 |
| `groups` | 可见用户组列表（逗号分隔，可用 `!` 排除）。 | `string` | `''` | 可选 |
| `domain` | 选择已有记录时应用的过滤条件。 | Python 表达式（domain） | `[]` | 关系字段 |
| `context` | 取值/创建/搜索时使用的上下文。 | Python 表达式（dict） | `{}` | 关系字段 |
| `nolabel` | 是否隐藏字段标签。 | `bool` | `False` | 作为 `group` 直接子元素时有效 |
| `placeholder` | 空值时显示的帮助文本。 | `string` | `''` | 不建议写数据示例 |
| `mode` | 关系字段显示模式列表。 | `string` | `list` | 允许 `list,form,kanban,graph` |
| `class` | HTML 类名。 | `string` | `''` | 常用类见下文 |
| `filename` | 文件名字段名。 | `string` | `''` | `Binary` 字段 |
| `password` | 是否按密码显示。 | `bool` | `False` | `Char` 字段 |
| `kanban_view_ref` | 移动端选记录时使用的看板视图 XMLID。 | `string` | `''` | 关系字段 |
| `default_focus` | 视图打开时自动聚焦。 | `bool` | `False` | 全视图仅应有一个字段启用 |

常见 Odoo 样式类（用于 `class`）：

- `oe_inline`：防止字段后换行并限制跨度。
- `oe_left` / `oe_right`：将元素浮动到对应方向。
- `oe_read_only` / `oe_edit_only`：仅在对应表单模式下显示。
- `oe_avatar`：图像字段头像样式（最大约 `90x90`）。
- `oe_stat_button`：统计按钮样式。

```xml
<field name="fname" class="oe_inline oe_left oe_avatar"/>
```

```xml
<button type="object" name="ACTION" class="oe_stat_button" icon="FONT_AWESOME" help="HELP">
   <div class="o_field_widget o_stat_info">
      <span class="o_stat_value"><FIELD/></span>
      <span class="o_stat_text">TEXT</span>
   </div>
</button>
```

> [!note]
> `invisible` 常见有两种用途：
> 1. 可用性：减少界面负担。
> 2. 技术性：字段必须在视图中（即便不可见）才能在 Python 表达式中被引用。

```xml
<field name="fname_b" invisible="fname_c != 3 and fname_a == parent.fname_d"/>
<group invisible="fname_c != 4">
    <field name="fname_c"/>
    <field name="fname_d"/>
</group>
```

关系字段节点可以内嵌子视图：

```xml
<field name="children_ids">
   <list>
      <field name="name"/>
   </list>
   <form>
      <field name="id"/>
      <field name="name"/>
   </form>
</field>
```

## `label`：显示字段标签

当 `field` 不在 `group` 内部，或设置了 `nolabel` 时，标签不会自动显示。此时可用 `label` 手动补上。

```xml
<form>
    <div class="col col-md-auto">
        <label for="FIELD_NAME" string="LABEL"/>
        <div>
            <field name="FIELD_NAME" class="oe_inline"/>
        </div>
    </div>
</form>
```

### `label` 属性

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `for` | 关联字段引用（字段名或字段 `id`）。 | `string` | - |
| `string` | 标签文本。 | `string` | 模型字段标签 |
| `class` | HTML 类名。 | `string` | `''` |
| `invisible` | 是否隐藏。 | Python 表达式（bool） | `False` |

> [!note]
> 若同一字段出现多个实例，多个 `label` 的 `for` 必须唯一，并指向对应字段节点的 `id`。

## `button`：显示操作按钮

```xml
<form>
    <button type="object" name="ACTION" string="LABEL"/>
    <button type="object" name="ACTION" icon="FONT_AWESOME"/>
</form>
```

### `button` 属性

| 属性 | 说明 | 类型 | 默认值 | 备注 |
| --- | --- | --- | --- | --- |
| `type` | 按钮行为类型。 | `string` | `''` | `object` 或 `action`；未设置 `special` 时必填 |
| `name` | 方法名或动作 XMLID。 | `string` | `''` | `type=object` 时为方法；`type=action` 时为动作 |
| `string` | 按钮文本，或图标按钮的 `alt` 文本。 | `string` | `''` | 可选 |
| `icon` | 按钮图标。 | `string` | `''` | 可选 |
| `help` | 悬停提示。 | `string` | `''` | 可选 |
| `context` | 执行时合并到上下文。 | Python 表达式（dict） | `{}` | 可选 |
| `groups` | 可见用户组列表。 | `string` | `''` | 可选 |
| `invisible` | 是否隐藏。 | Python 表达式（bool） | `False` | 可选 |
| `class` | HTML 类名。 | `string` | `''` | 可选 |
| `special` | 对话框内按钮特殊行为。 | `string` | `''` | `save`（保存并关闭）/`cancel`（不保存关闭） |
| `confirm` | 执行前确认消息。 | `string` | `''` | 可选 |
| `data-hotkey` | 快捷键。 | `string` | `''` | 例如 `c` 或 `shift+k` |

`type` 说明：

- `object`：调用当前模型方法，`name` 为方法名。
- `action`：加载并执行 `ir.actions` 记录，`name` 为动作 XMLID。

```xml
<button type="object" name="action_create_new" string="Create document"/>
<button type="action" name="addon.action_create_view" string="Create and Edit"/>
```

```xml
<button type="object" name="remove" icon="fa-trash" help="Revoke"/>
```

```xml
<button name="button_confirm" type="object" context="{'BUSINESS_KEY': ANY}" string="LABEL"/>
```

```xml
<button special="cancel" icon="fa-trash"/>
```

```xml
<button name="action_destroye_gate" string="Send the goa'uld" type="object" confirm="Do you confirm the action?"/>
```

```xml
<button type="object" name="action_confirm" string="Confirm" data-hotkey="c"/>
<button type="object" name="action_tear" string="Tear the sheet" data-hotkey="shift+k"/>
```

## 讨论小部件

讨论小部件是通信和日志工具，允许直接从记录（任务、订单、发票、事件、笔记等）发送消息给同事或客户。

当模型继承 `mail.thread` 时，可通过 `oe_chatter` 区块添加：

```xml
<form>
    <sheet>
        ...
    </sheet>
    <div class="oe_chatter">
        <field name="message_follower_ids"/>
        <field name="activity_ids"/>
        <field name="message_ids" options="OPTIONS"/>
    </div>
</form>
```

## 附件预览小部件

附件预览通过带 `o_attachment_preview` 类的空 `div` 添加：

```xml
<form>
    <sheet>
        ...
    </sheet>
    <div class="o_attachment_preview"/>
</form>
```

## 结构组件

结构组件负责布局和视觉组织，逻辑较少。常见组件包括：`group`、`sheet`、`notebook/page`、`newline`、`separator`、`header`、`footer`、按钮容器、标题容器。

## `group`：定义列布局

`group` 用于定义表单列布局。默认 2 列，其直接子元素通常占 1 列并按行填充。

作为 `group` 直接子元素的 `field` 默认会显示标签，且标签与字段各占 1 列。

```xml
<form>
    <group>
        ...
    </group>
</form>
```

### `group` 属性

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `string` | 组标题。 | `string` | `''` |
| `col` | 组内总列数。 | `int` | `2` |
| `colspan` | 子元素占用列数。 | `int` | `1` |
| `invisible` | 是否隐藏。 | Python 表达式（bool） | `False` |

```xml
<group>
    <field name="a" string="custom"/>
    <field name="b"/>
</group>
<group string="title 1">
    <group string="title 2">
        <field name="c"/>
        <field name="d"/>
    </group>
    <group>
        <field name="e"/>
        <field name="f"/>
        <field name="g"/>
    </group>
</group>
<group col="12">
    <group colspan="8">
        <field name="h"/>
    </group>
    <group colspan="4">
        <field name="i"/>
    </group>
</group>
```

## `sheet`：使布局更具响应性

`sheet` 作为 `form` 的直接子元素时，可提供更窄且更响应式的页面布局（居中、边距等），通常包含多个 `group`。

```xml
<form>
    <sheet>
        ...
    </sheet>
</form>
```

## `notebook` 和 `page`：添加带标签的部分

`notebook` 定义标签页区域，每个标签页由 `page` 子元素定义。`notebook` 不应放在 `group` 内部。

```xml
<form>
    <notebook>
        <page string="LABEL">
            ...
        </page>
    </notebook>
</form>
```

### `page` 属性

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `string` | 标签标题。 | `string` | `''` |
| `invisible` | 是否隐藏。 | Python 表达式（bool） | `False` |

```xml
<form>
    <notebook>
        <page string="Page1">
            ...
        </page>
        <page string="Page2">
            ...
        </page>
    </notebook>
</form>
```

## `newline`：开始新的组行

`newline` 用于 `group` 内部，提前结束当前行并换到新行，无需填满剩余列。

```xml
<form>
    <group>
        ...
        <newline/>
        ...
    </group>
</form>
```

```xml
<form>
    <group string="Title 1">
        <group string="Title 1.1">...</group>
        <newline/>
        <group string="Title 1.2">...</group>
        <group string="Title 1.3">...</group>
    </group>
</form>
```

## `separator`：添加水平间距

`separator` 用于在组内元素之间添加分隔（常作为分节标题）。

```xml
<form>
    ...
    <separator/>
    ...
</form>
```

### `separator` 属性

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `string` | 分节标题。 | `string` | `''` |

```xml
<form>
    <group>
        <FIELD/>
        <separator string="Title 1"/>
        <FIELD/>
        <group>
            <FIELD/>
            <separator string="Title 2"/>
            <FIELD/>
        </group>
        <group>
            <FIELD/>
            <FIELD/>
        </group>
    </group>
</form>
```

> [!tip]
> `separator` 适合在同一内部 `group` 中做视觉分隔，同时保留水平对齐。

## `header`：显示工作流按钮和状态

`header` 常与 `sheet` 搭配使用，位于 `sheet` 上方的全宽区域，通常放工作流按钮和状态字段。

```xml
<form>
    <header>
        <BUTTONS/>
    </header>
    <sheet>
        ...
    </sheet>
</form>
```

```xml
<header>
    <button string="Reset" type="object" name="set_draft" invisible="state != 'done'"/>
    <field name="state" widget="statusbar" statusbar_visible="draft,posted" options="{'clickable': 1}"/>
</header>
```

## `footer`：显示对话框按钮

`footer` 用于在对话框底部放置按钮。

```xml
<form>
    <sheet>
        ...
    </sheet>
    <footer>
        <BUTTONS/>
    </footer>
</form>
```

```xml
<footer>
    <button string="Save" special="save"/>
    <button string="Feature action" type="object" name="my_action" class="btn-primary"/>
    <button string="Discard" special="cancel"/>
</footer>
```

当未指定 `footer` 时，会显示标准按钮（保存/放弃等）。

`footer` 的 `replace` 控制是否替换默认按钮：

- `replace="1"`（默认）：替换默认按钮。
- `replace="0"`：在默认按钮旁附加自定义按钮。

```xml
<footer replace="0">
    <button string="Custom added action" type="object" name="my_action" class="btn-primary"/>
</footer>
```

## 按钮容器

可通过 `div`（`name="button_box"`）创建按钮容器。

```xml
<form>
    <div name="button_box">
        <BUTTONS/>
    </div>
</form>
```

```xml
<form>
    <div name="button_box">
        <button type="edit" name="edit" icon="fa-edit" string="Button1"/>
        <button type="object" name="my_action" icon="fa-dollar">
            <field name="total_inv" widget="statinfo" string="Invoices"/>
        </button>
    </div>
</form>
```

## 标题容器

可通过带 `oe_title` 类的 `div` 创建标题字段容器。

```xml
<form>
    <sheet>
        <div class="oe_title">
            <h1><FIELD/></h1>
        </div>
    </sheet>
</form>
```
