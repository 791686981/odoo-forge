# 视图与字段部件

> 来源：`docs/obsidian/07 知识库/odoo文档/03_开发者/03_参考/02_Web框架/10_JavaScript 参考.md`
> 原文章节：`## 视图`
>
> 本文件从原始文档中拆分而来，以下内容尽量保留原文，仅做拆分与轻量排版。

“视图”可以指多个层面：XML 中的 arch、后台的记录定义、前端的 Owl 控制器。本文关注的是 JavaScript 端的视图/字段部件，尤其是 `SomethingController` → `model` → `renderer` 的典型结构，以及各类 field widget 如何渲染字段、提供控件并和用户交互。

## 目录

- [概览](#概览)
- [装饰](#装饰)
- [非关系字段](#非关系字段)
- [数值与统计部件](#数值与统计部件)
- [日期与时间字段](#日期与时间字段)
- [关系与选择控件](#关系与选择控件)
- [多对一、多对多与引用字段](#多对一多对多与引用字段)
- [其他界面部件](#其他界面部件)

---

## 概览

视图部件主要由 Owl 组件驱动，`SomethingController` 会实例化对应的 `model` 再渲染 `renderer`，字段的 widget 负责将模型数据以可交互的形式展示。字段部件不仅负责格式化，也会根据 `options`/`attributes` 调整行为（如只读、装饰、可创建、快速创建等）。

## 装饰

字段部件支持与列表视图类似的装饰属性，用于根据记录状态调整文本颜色。例如：

```xml
<field name="state" decoration-danger="amount &lt; 10000"/>
```

有效的装饰属性包括 `decoration-bf`、`decoration-it`、`decoration-danger`、`decoration-info`、`decoration-muted`、`decoration-primary`、`decoration-success`、`decoration-warning`。每个 `decoration-X` 会映射到 Bootstrap 的 `text-X` 类（除 `text-it`/`text-bf` 外由 Odoo 内部处理），其值必须是针对当前记录的 Python 表达式。


## 非关系字段

### `boolean`

- **支持字段类型**：`boolean`
- **描述**：Boolean 字段的默认 widget。

### `char`

- **支持字段类型**：`char`
- **描述**：Char 字段的默认 widget。

### `text`

- **支持字段类型**：`text`
- **描述**：Text 字段的默认 widget。

### `handle`

- **支持字段类型**：`integer`
- **描述**：以“手柄”形式展示字段，允许拖拽排序记录。
- **警告**：必须用于排序字段；同一列表中不支持多个 handle。

### `email`

- **支持字段类型**：`char`
- **描述**：只读模式下会渲染为带 `mailto:` 的链接。

### `phone`

- **支持字段类型**：`char`
- **描述**：只读模式下根据设备能力渲染为可拨号链接（仅在设备支持时）。

### `url`

- **支持字段类型**：`char`
- **描述**：只读状态下显示为链接，可通过 `text` 属性自定义显示文本。
- **选项**：
  - `website_path`（默认 `false`）：允许值直接以站点内路径开始，否则会强制添加 `http://`。

- **示例**：
```xml
<field name="foo" widget="url" text="Some URL" />
```

### `domain`

- **支持字段类型**：`char`
- **描述**：提供可视化的 domain 编辑器，允许构建静态前缀域。
- **限制**：仅支持静态表达式，不允许动态上下文。
- **选项**：
  - `model`：domain 所作用的 `res_model` 名称。
  - `foldable`（默认 `false`）：是否折叠为紧凑视图。
  - `in_dialog`（默认 `false`）：是否通过对话框编辑。

### `link_button`

- **支持字段类型**：`char`
- **描述**：渲染一个带图标/文本的 span，点击以字段值作为 URL 打开新窗口。

### `image`

- **支持字段类型**：`binary`
- **描述**：将二进制值渲染为图片；若只返回 `bin_size`，会默认渲染文件大小对应的图片。
- **选项**：
  - `preview_image`：提示 Web 客户端使用另一个字段的图片作为默认值。
  - `accepted_file_extensions`：限制选择的文件扩展（参考 `<input type="file">` 的 `accept`）。
- **示例**：
```xml
<field name="image" widget="image" options="{'preview_image': 'image_128'}" />
```

### `binary`

- **支持字段类型**：`binary`
- **描述**：通用文件字段部件，支持上传/下载。
- **属性**：
  - `filename`：利用另一个字段保存原始文件名（例如 `datas_fname`）。
- **选项**：
  - `accepted_file_extensions`：限制可选文件扩展。
- **示例**：
```xml
<field name="datas" filename="datas_fname" />
```

### `badge`

- **支持字段类型**：`char`、`selection`、`many2one`
- **描述**：将字段值渲染为 Bootstrap 徽章；默认背景灰色，可借助装饰机制自定义颜色。
- **示例**：
```xml
<field name="foo" widget="badge" decoration-danger="state == 'cancel'" />
```


## 数值与统计部件

### `integer`

- **支持字段类型**：`integer`
- **描述**：整数字段默认 widget。
- **选项**：
  - `type`（`"text"` 或 `"number"`，默认 `"text"`）：切换为数字输入并取消格式化。
  - `step`：数字增减步进（默认 `1`）。
  - `format`（默认 `true`）：是否根据区域设置格式化。
- **示例**：
```xml
<field name="int_value" options="{'type': 'number'}" />
```

### `float`

- **支持字段类型**：`float`
- **描述**：浮点字段默认 widget，支持 `digits` 属性控制精度。
- **属性**：
  - `digits`：例如 `digits="[42,5]"`。
- **选项**：与 `integer` 相同（`type`、`step`、`format`）。

### `float_time`

- **支持字段类型**：`float`
- **描述**：将浮点值格式化为小时/分钟（如 `0.5 → 0:30`）。

### `float_factor`

- **支持字段类型**：`float`
- **描述**：根据 `options` 中的因子转换值（`value * factor`）。

### `float_toggle`

- **支持字段类型**：`float`
- **描述**：以按钮组替代输入框，允许在选项范围内循环选择。
- **选项**：
  - `factor`、`range`：与 `float_factor` 共享的设置。
- **示例**：
```xml
<field name="days_to_close" widget="float_toggle" options="{'factor': 2, 'range': [0, 4, 8]}" />
```

### `monetary`

- **支持字段类型**：`monetary`、`float`
- **描述**：货币字段支持选项里提供货币字段，否则会回退到默认货币。
- **选项**：
  - `currency_field`：多对一字段名（如 `currency_id`）。
- **示例**：
```xml
<field name="value" widget="monetary" options="{'currency_field': 'currency_id'}" />
```

### `priority`

- **支持字段类型**：`selection`
- **描述**：渲染为星号选择，支持只读/编辑模式。

### `statinfo`

- **支持字段类型**：`integer`、`float`
- **描述**：常用于 `statbutton`，显示数字标签。
- **选项**：
  - `label_field`：若提供，则显示该字段值作为文本。
- **示例**：
```xml
<button name="%(act_payslip_lines)d" icon="fa-money" type="action">
    <field
        name="payslip_count"
        widget="statinfo"
        string="Payslip"
        options="{'label_field': 'label_tasks'}"
    />
</button>
```

### `percentpie`

- **支持字段类型**：`integer`、`float`
- **描述**：显示百分比的饼图（值范围 `0` 到 `100`）。
- **示例**：
```xml
<field name="replied_ratio" string="Replied" widget="percentpie" />
```

### `progressbar`

- **支持字段类型**：`integer`、`float`
- **描述**：以水平进度条显示值，并可配置最大/当前值。
- **选项**：
  - `editable`（布尔）：是否允许编辑。
  - `current_value`：字段名。
  - `max_value`：字段名。
  - `edit_max_value`：是否允许修改 `max_value`。
  - `title`：显示在进度条上方的标题（此标题不会被翻译）。
- **示例**：
```xml
<field
    name="absence_of_today"
    widget="progressbar"
    options="{
        'current_value': 'absence_of_today',
        'max_value': 'total_employee',
        'editable': false,
    }"
/>
```

### `dashboard_graph`

- **支持字段类型**：`char`
- **描述**：框架专用 widget，展示一组 JSON 序列化的数据图表。
- **属性**：
  - `graph_type`：`"line"` 或 `"bar"`。
- **示例**：
```xml
<field name="dashboard_graph_data" widget="dashboard_graph" graph_type="line" />
```

### `ace`

- **支持字段类型**：`char`、`text`
- **描述**：集成 Ace 编辑器，适用于 XML/Python 等文本字段。


## 日期与时间字段

### `date`

- **支持字段类型**：`date`
- **描述**：由文本框与日期选择器组成。
- **选项**：
  - `min_date`/`max_date`：可接受的最早/最晚值（默认 `1000-01-01` ~ `9999-12-31` 或 `"today"`）。
  - `warn_future`：未来值显示警告。
- **示例**：
```xml
<field name="datefield" options="{'min_date': 'today', 'max_date': '2023-12-31'}" />
```

### `datetime`

- **支持字段类型**：`datetime`
- **描述**：值总是在客户端时区中。
- **选项**：
  - 参见日期字段选项。
  - `rounding`：生成分钟增量（默认 `5`）。
  - `show_seconds`、`show_time`：控制是否展示秒/时间部分。
- **示例**：
```xml
<field name="datetimefield" widget="datetime" options="{'show_seconds': false}" />
```

### `daterange`

- **支持字段类型**：`date`、`datetime`
- **描述**：一次性选择开始与结束日期。
- **选项**：
  - `start_date_field` / `end_date_field`：分别指定记录字段（不能同时设置）。
- **示例**：
```xml
<field name="end_date" widget="daterange" options="{'start_date_field': 'start_date'}" />
```

### `remaining_days`

- **支持字段类型**：`date`、`datetime`
- **描述**：只读模式下显示距离今天的天数，编辑模式下表现为普通日期。

## 关系与选择控件

### `selection`

- **支持字段类型**：`selection`
- **描述**：默认 selection 控件。
- **属性**：
  - `placeholder`：无值时显示的提示文本。
- **示例**：
```xml
<field name="tax_id" widget="selection" placeholder="Select a tax" />
```

### `radio`

- **支持字段类型**：`selection`、`many2one`
- **描述**：所有选项以单选按钮呈现，使用 `name_search` 获取标签。
- **选项**：
  - `horizontal`：`true` 时水平排列。
- **示例**：
```xml
<field name="recommended_activity_type_id" widget="radio" options="{'horizontal': true}" />
```

### `selection_badge`

- **支持字段类型**：`selection`、`many2one`
- **描述**：将每个选项渲染为矩形徽章。
- **示例**：
```xml
<field name="recommended_activity_type_id" widget="selection_badge" />
```

### `label_selection`

- **支持字段类型**：`selection`
- **描述**：仅用于展示的不可编辑标签。
- **选项**：
  - `classes`：按值映射 CSS 类。
- **示例**：
```xml
<field
    name="state"
    widget="label_selection"
    options="{
        'classes': {
            'draft': 'default',
            'cancel': 'default',
            'none': 'danger',
        },
    }"
/>
```

### `state_selection`

- **支持字段类型**：`selection`
- **描述**：专用于流程状态，如 Kanban 中的 `stage_id`。
- **示例**：
```xml
<field name="kanban_state" widget="state_selection" />
```

### `list.state_selection`

- **支持字段类型**：`selection`
- **描述**：列表视图专用，默认在图标旁边显示标签，支持 `hide_label` 选项。
- **选项**：
  - `hide_label`：`true` 隐藏图标旁标签。
- **示例**：
```xml
<field name="kanban_state" widget="state_selection" options="{'hide_label': true}" />
```

### `boolean_favorite`

- **支持字段类型**：`boolean`
- **描述**：显示为星形，适合收藏标记。

### `boolean_toggle`

- **支持字段类型**：`boolean`
- **描述**：以开关呈现布尔值。

### `statusbar`

- **支持字段类型**：`selection`、`many2one`
- **描述**：表单顶部的状态栏，显示流程并可选择状态。

### `reference`

- **支持字段类型**：`char`、`reference`
- **描述**：结合了 selection（模型）与 many2one（记录），允许任意模型的记录选择。
- **选项**：
  - `model_field`：指定 `ir.model` 名称后则不展示模型下拉。

## 多对一、多对多与引用字段

### `many2one`

- **支持字段类型**：`many2one`
- **描述**：多对一默认 widget。
- **属性**：
  - `can_create`：是否允许创建相关记录（优先于 `no_create`）。
  - `can_write`：是否允许编辑（默认 `true`）。
- **选项**：
  - `quick_create`：允许快速创建（默认 `true`）。
  - `no_create` / `no_quick_create` / `no_create_edit`：控制各类创建按钮显示。
  - `create_name_field`：快速创建时预填字段，默认 `name`。
  - `always_reload`：`true` 时每次强制 `name_get`（谨慎使用）。
  - `no_open`：`true` 禁止点击打开记录。
- **示例**：
```xml
<field name="currency_id" options="{'no_create': true, 'no_open': true}" />
```

### `many2one_barcode`

- **支持字段类型**：`many2one`
- **描述**：移动端可调用相机扫描条码，然后尝试 `name_search`。
- **行为**：非移动端自动回退到常规 `many2one`。

### `many2one_avatar`

- **支持字段类型**：`many2one`
- **描述**：引导指向继承 `image.mixin` 的模型，显示图像但不附带可点击链接（编辑行为与常规一致）。

### `many2one_avatar_user`

- **支持字段类型**：`many2one`（仅指向 `res.users`）
- **描述**：头像可点击并打开与该用户的聊天窗口。

### `many2one_avatar_employee`

- **支持字段类型**：`many2one`（指向 `hr.employee`）
- **描述**：类似 `many2one_avatar_user`，但适用于员工。

### `attachment_image`

- **支持字段类型**：`many2one`
- **描述**：当字段指向继承 `image.mixin` 的模型时，在界面上展示图片（只读/编辑行为与普通 `many2one` 一致且不会渲染链接）。
- **示例**：
```xml
<field name="displayed_image_id" widget="attachment_image" />
```

### `many2many`

- **支持字段类型**：`many2many`
- **描述**：多对多默认部件。
- **属性**：
  - `mode`：默认显示视图。
  - `domain`：限制数据。
- **选项**：
  - `create_text`：自定义“添加”按钮文本。
  - `link` / `unlink`：控制是否可以添加/移除记录。

### `many2many_binary`

- **支持字段类型**：`many2many`
- **描述**：便于上传/删除多个文件，特定于 `ir.attachment`。
- **选项**：`accepted_file_extensions`（参考 `<input type="file">`）。

### `many2many_tags`

- **支持字段类型**：`many2many`
- **描述**：以标签形式展示关系。
- **选项**：
  - `create`：控制是否可创建（可传域）。
  - `color_field`：配色字段名。
  - `no_edit_color`：`true` 禁止修改颜色。
  - `edit_tags`：`true` 时点击标签可编辑。
- **示例**：
```xml
<field name="category_id" widget="many2many_tags" options="{'create': [['some_other_field', '>', 24]]}" />
```

### `form.many2many_tags`

- **支持字段类型**：`many2many`
- **描述**：表单视图对 `many2many_tags` 的扩展，增加了颜色编辑逻辑。

### `kanban.many2many_tags`

- **支持字段类型**：`many2many`
- **描述**：看板视图专用的 `many2many_tags`。

### `many2many_checkboxes`

- **支持字段类型**：`many2many`
- **描述**：一次性展示复选框列表，可选数量最多 `100`（无法配置）。

### `one2many`

- **支持字段类型**：`one2many`
- **描述**：默认 widget，通常以子列表或子看板呈现。
- **选项**：
  - `create` / `delete`：控制是否允许添加/删除。
  - `create_text`：自定义“添加”按钮文字。
- **示例**：
```xml
<field name="turtles" options="{'create': [['some_other_field', '>', 24]]}" />
```

## 其他界面部件

### `web_ribbon`

- **适用方式**：通过 `<widget name="web_ribbon" />` 使用。
- **描述**：在卡片或表单右上角添加丝带（例如用于“已归档”）。
- **属性**：
  - `title`：显示文本。
  - `tooltip`：提示文本。
  - `bg-class` / `bg_color`：控制丝带的背景颜色。
- **示例**：
```xml
<widget name="web_ribbon" title="Archived" bg_color="text-bg-danger"/>
```

### `week_days`

- **适用方式**：通过 `<widget name="week_days" />` 使用。
- **描述**：渲染一周七天复选框集合。
- **示例**：
```xml
<widget name="week_days" />
```
