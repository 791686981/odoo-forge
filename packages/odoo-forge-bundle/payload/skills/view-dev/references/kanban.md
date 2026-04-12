# 看板

> 来源：`docs/obsidian/07 知识库/odoo文档/03_开发者/03_参考/03_用户界面/02_视图架构.md`
> 原文章节：`## 看板`
>
> 本文件从原始文档中拆分而来，以下内容尽量保留原文，仅做拆分与轻量排版。

看板视图用作[看板](https://en.wikipedia.org/wiki/Kanban_board)可视化工具，它们将记录显示为“卡片”，介于列表视图和表单视图之间。记录可以按列分组，用于工作流管理，也可以不分组，仅用于可视化。

看板视图的根元素是`kanban`。

> [!note]
> 原文包含看板结构示意图（`kanban.svg`）。
> ```xml
> <kanban>
>     ...
> </kanban>
> ```

> [!note]
> 看板视图最多加载十列，之后的列会折叠但仍可点击展开。

## 目录

- [根属性](#根属性)
- [组件概览](#组件概览)
- [templates：定义卡片结构](#templates定义卡片结构)
- [渲染上下文](#渲染上下文)
- [按钮和链接](#按钮和链接)
- [部件](#部件)
- [布局](#布局)
- [`field`：声明额外字段](#field声明额外字段)
- [`header`：在控制面板显示按钮](#header在控制面板显示按钮)
- [`progressbar`：在列顶部显示进度条](#progressbar在列顶部显示进度条)

---

## 根属性

`kanban` 根元素接受大量可选属性以控制卡片行为、分组、列操作等。以下表格汇总了文档中明确列出的属性：

| 属性 | 说明 | 类型 | 默认 | 备注 |
| --- | --- | --- | --- | --- |
| `string` | 界面标题；仅在打开 `target="new"` 且 action 无名称时显示 | `Char` | `''` | |
| `create` | 是否允许通过 UI 创建记录 | `bool` | `True` | |
| `edit` | 是否允许编辑记录 | `bool` | `True` | |
| `delete` | 是否允许通过操作菜单删除记录 | `bool` | `True` | |
| `default_group_by` | 当没有 action/context 指定分组时，默认按字段分组 | `Char` | `''` | |
| `default_order` | 覆盖模型 `_order`，可以用空格 + `desc` 指定方向 | `Char` | `''` | 例如 `default_order="sequence,name desc"` |
| `class` | 添加到根 HTML 元素的 CSS 类 | `Char` | `''` | |
| `examples` | 绑定到 `KanbanExamplesRegistry` 的示例 key（分组时） | `Char` | `''` | [utm 模块例子](https://github.com/odoo/odoo/blob/18.0/addons/utm/static/src/js/utm_campaign_kanban_examples.js) |
| `add_column` | 是否显示“添加列”按钮 | `bool` | `True` | |
| `gear_delete` | 是否允许通过齿轮菜单删除列 | `bool` | `True` | |
| `gear_edit` | 是否允许通过齿轮菜单编辑列 | `bool` | `True` | |
| `reorder_column` | 列是否可拖拽排序 | `bool` | `True` | |
| `draggable` | 分组看板中卡片是否可拖动 | `bool` | `True` | |
| `archivable` | 有 `active` 字段的记录是否可归档/取消归档 | `bool` | `True` | |
| `quick_create` | 是否允许在看板中快速创建记录 | `bool` | `False` | 仅在按 many2one/selection/char/bool 分组时为 `True` |
| `quick_create_view` | 快速创建时打开的 form view | `Char` | `''` | |
| `on_create` | 点击快速创建时触发的自定义 action；`quick_create` 设置为 `'quick_create'` 时启用 | `Char` | `''` | |
| `can_open` | 点击卡片是否自动打开表单 | `bool` | `True` | 设置 `False` 可禁用 |
| `highlight_color` | 为卡片左边框着色的整数字段 | `Char` | `''` | |
| `sample` | 模型无记录时是否填充示例卡片 | `bool` | `False` | 示例数据不可交互，字段有启发式内容（如 `display_name`、`email`） |

> [!note]
> `sample="True"` 会生成演示记录（例如 `res.users` 出现 `firstname.lastname@sample.demo`），但这些数据不会保留在数据库中。

## 组件概览

看板视图支持以下子元素：`templates`、`field`（声明额外字段）、`header`、`progressbar`。后续各节会对单独组件逐一展开。

### `templates`：定义卡片结构

`templates` 包含一个或多个 QWeb 模板，用于渲染卡片。必须至少声明一个名为 `card` 的模板，还可以定义一个 `menu` 模板（通过卡片右上角的三点按钮切换）。模板使用 JavaScript QWeb 编写。

```xml
<kanban>
   <templates>
      <t t-name="card">
         <field name="name"/>
      </t>
   </templates>
</kanban>
```

> [!warning]
> 这些模板基于 QWeb，而非 Owl，因此无法使用 `t-on-click` 等 Owl 指令。

### 字段

模板中的 `<field>` 元素用于渲染字段，只有以下属性：

| 属性 | 说明 | 类型 | 默认 | 备注 |
| --- | --- | --- | --- | --- |
| `name` | 字段名（必填） | `Char` | 必填 | |
| `widget` | 渲染使用的小部件，引用注册在 `fields` 注册表的 Owl 组件 | `Char` | `''` | 示例：`widget="kanban_handle"` 或 `widget="many2many_tags"` |

默认情况下 `<field>` 会被包裹在 `<span>` 中；指定 `widget` 时渲染交由部件控制。

某些小部件可丰富卡片交互：
- `kanban_handle`：允许拖拽排序卡片。
- `kanban_color_picker` + 根属性 `highlight_color`：让用户调整卡片颜色。

> [!seealso]
> 详见 JavaScript 参考中的字段部分，了解 `fields` 和 `view_widgets` 注册组件。

### 渲染上下文

Kanban 模板通过 QWeb 引擎渲染，模板中可直接访问以下变量：

- `record`：对象，包含视图请求的所有字段，每个字段有 `value`（格式化值）和 `raw_value`（原始值），可在 `t-if` 中使用。例如 `<field name="parent_id" t-if="!record.is_company.raw_value"/>`。
- `widget`：包含 `editable` / `deletable` 布尔值，指示当前用户是否拥有对应权限，可用于菜单中的条件渲染。
- `readonly`：若视图只读则为 `true`。
- `mobile`：若在移动端打开时为 `true`。
- `luxon`：Luxon 日期/时间对象，便于在模板内处理日期。
- `JSON`：JavaScript 的全局 JSON，对字段值做 `JSON.parse(...)`。

> [!example]
> ```xml
> <kanban>
>    <templates>
>       <t t-name="card">
>          <field name="name"/>
>          <t t-if="widget.deletable" t-name="menu">
>             <a role="menuitem" type="delete" class="dropdown-item">Delete</a>
>          </t>
>       </t>
>    </templates>
> </kanban>
> ```

当前上下文来自打开视图的动作或嵌套在 one2many/many2many 字段中的嵌套看板。

### 按钮和链接

Kanban 模板中的 `<button>` 和 `<a>` 也遵循 QWeb 规则，但 `type` 属性会触发视图特定行为：

- `action` / `object`：与常规按钮一致。
- `open`: 在表单视图中打开当前卡片。
- `delete`: 删除并移除卡片。
- `archive` / `unarchive`: 归档或取消归档卡片记录。
- `cover`: 选择一张图片作为记录的封面。

> [!tip]
> 可在菜单模板中依据 `widget.editable`、`widget.deletable` 显示相应操作。

### 部件

使用 `<widget name="..."/>` 插入由 JavaScript 生成的动态内容，`name` 对应 `view_widgets` 注册表中的 Owl 组件。详见 JavaScript 参考中的部件部分。

### 布局

卡片默认是 `flex-column` 容器，可通过标准 HTML + [Bootstrap 工具类](https://getbootstrap.com/docs/5.0/utilities/api/) 构建更复杂的布局。常见做法是在 `<t>` 上添加 `class`，用 `<footer>` 固定底部字段：

```xml
<kanban>
   <templates>
      <t t-name="card">
         <field class="fw-bold fs-5" name="display_name"/>
         <field class="text-muted" name="parent_id"/>
         <field name="tag_ids" widget="many2many_tags"/>
         <footer>
            <field name="priority" widget="priority"/><!-- 左下角 -->
            <field class="ms-auto" name="activity_ids" widget="kanban_activity"/><!-- 右下角 -->
         </footer>
      </t>
   </templates>
</kanban>
```

使用 `<aside>` + `<main>` 可并排展示图像与字段，给 `<t>` 添加 `flex-row`，并利用 `o_kanban_aside_full` 取消 `<aside>` 内边距让图像扩展至边界。

> [!tip]
> `o_kanban_aside_full` 会移除侧边距，从而让封面图像铺满卡片边界。

### `field`：声明额外字段

在 `templates` 外部也能声明 `<field>`，用于获取在模板条件中使用但不直接显示的字段。

```xml
<kanban>
   <field name="is_company"/>
   <templates>
      <t t-name="card">
         <field name="name"/>
         <field t-if="!record.is_company.raw_value" name="parent_id"/>
      </t>
   </templates>
</kanban>
```

### `header`：在控制面板中显示按钮

`<header>` 只接受 `<button>` 子元素，类似列表视图的按钮。附加属性：

| 属性 | 说明 | 类型 | 默认 | 备注 |
| --- | --- | --- | --- | --- |
| `display` | `always` / `selection`；控制按钮是否依赖选中记录 | `Char` | `''` | 看板不支持选中，因此只能使用 `always` |

```xml
<kanban>
   <header>
      <button name="toDoAlways" type="object" string="Always" display="always"/>
   </header>
   ...
</kanban>
```

> [!warning]
> 看板视图不能选中记录，因此 `display="selection"` 无效，只能用 `always`。

### `progressbar`：在列顶部显示进度条

`<progressbar>` 在分组看板的列顶部渲染进度条，可根据字段值映射颜色，并显示某字段总和。

```xml
<kanban>
    <progressbar field="activity_state"
                 colors="{'planned': 'success', 'today': 'warning', 'overdue': 'danger'}"
                 sum_field="expected_revenue"/>
    <templates>...</templates>
</kanban>
```

| 属性 | 说明 | 类型 | 默认 | 备注 |
| --- | --- | --- | --- | --- |
| `field` | 进度条基于的字段（用于分组聚合） | `Char` | 必填 | |
| `colors` | 字段值到颜色（`muted`/`success`/`warning`/`danger`）的映射 | `JSON` | 必填 | |
| `sum_field` | 显示总和的字段，未设置时显示记录数 | `Char` | `''` | |

> [!note]
> 颜色映射示例中 `planned` 映射为 `success`、`today` 为 `warning`、`overdue` 为 `danger`。见图 `kanban_progressbar.svg`。
