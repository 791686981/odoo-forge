# 操作

> 来源：`https://docs.odoo.sbggai.top/developer/reference/backend/actions.html`
>
> 本文件从 Odoo 动作参考文档整理而来，以下内容尽量保留原意，仅做分节与轻量排版。

动作定义了系统对用户操作（登录、点击按钮、选择记录等）的响应行为，既可以以数据库记录形式存在，也可以在按钮方法里直接返回字典。

## 目录

- [动作共有属性](#动作共有属性)
- [获取动作](#获取动作)
- [绑定](#绑定)
- [窗口动作 (`ir.actions.act_window`)](#窗口动作-iractionsact_window)
- [视图生成](#视图生成)
- [URL 动作 (`ir.actions.act_url`)](#url-动作-iractionsact_url)
- [服务端动作 (`ir.actions.server`)](#服务端动作-iractionsserver)
- [报告动作 (`ir.actions.report`)](#报告动作-iractionsreport)
- [客户端动作 (`ir.actions.client`)](#客户端动作-iractionsclient)
- [计划动作 (`ir.cron`)](#计划动作-ircron)

---

## 动作共有属性

所有动作都包含两个必填字段：

| 字段 | 说明 |
| --- | --- |
| `type` | 动作类别，决定可用字段以及如何解释它。 |
| `name` | 动作的简短、面向用户的描述，客户端可能会显示。 |

## 获取动作

客户端可以通过以下几种形式获取动作：

- `False`：如果当前有任何动作对话框正在打开，则关闭它。
- 字符串：若匹配到 [客户端动作](#客户端动作-iractionsclient) 的 `tag`，则解释为客户端动作；否则当作数字使用。
- 数字：从数据库读取相应的动作记录，可以是数据库 ID 或 external id。
- 字典：作为客户端动作描述符处理并执行。

## 绑定

部分动作（窗口/报告等）会出现在某个模型的上下文菜单中，以下字段控制动作的挂载方式：

| 字段 | 说明 | 备注 |
| --- | --- | --- |
| `binding_model_id` | 指定绑定的模型 | 服务端动作使用 `model_id`。 |
| `binding_type` | 决定动作出现在哪张菜单下 | `action` 表示“操作”菜单，`report` 表示“打印”菜单。 |
| `binding_view_types` | 以逗号分隔的视图类型 | 例如 `list,form`，默认同时在列表和表单中展示。 |

> [!note]
> `binding_model_id` 只针对绑定动作；服务端动作通过 `model_id` 控制挂载模型。

## 窗口动作 (`ir.actions.act_window`)

窗口动作让某个模型在特定视图中可视化（表单、列表、图表等），通常用于按钮、菜单或行为跳转。

| 字段 | 说明 | 备注 |
| --- | --- | --- |
| `res_model` | 要展示的模型 | |
| `views` | `(view_id, view_type)` 对列表 | 第二项是视图类型（`form`/`list`/`graph`...），第一项可选数据库 ID；默认会取模型对应类型的缺省视图。 |
| `res_id` | 默认打开的记录 | 仅 `form` 视图时有效，其他视图会创建新记录。 |
| `search_view_id` | `(id,name)` 对 | 指定用于此动作的搜索视图（否则默认）。 |
| `target` | 打开方式 | 可选值：`current`（默认）、`fullscreen`、`new`（弹窗）、`main`（清除面包屑）。 |
| `context` | 额外上下文 | 传递给视图的字典，可注入默认值、隐藏字段等。 |
| `domain` | 额外筛选条件 | 隐式追加到视图的默认搜索中。 |
| `limit` | 列表默认记录数 | Web 客户端默认 80。 |

```json
{
    "type": "ir.actions.act_window",
    "res_model": "res.partner",
    "views": [[false, "list"], [false, "form"]],
    "domain": [["customer", "=", true]],
}
```

```json
{
    "type": "ir.actions.act_window",
    "res_model": "product.product",
    "views": [[false, "form"]],
    "res_id": a_product_id,
    "target": "new",
}
```

### 数据库视图字段

| 字段 | 说明 | 备注 |
| --- | --- | --- |
| `view_mode` | 逗号分隔的视图类型 | 不要带空格，所有类型会出现在生成的 `views` 列表中（至少有一个 `False`）。 |
| `view_ids` | 多对多视图对象 | 定义 `views` 的初始内容。技术上不是标准多对多关系，因为它还带有顺序字段，并且可以只定义视图类型而不带视图 ID。 |
| `view_id` | 指定的具体视图 | 如果该类型未被 `view_ids` 填充，仍会追加到 `views`。 |

> [!note]
> 若想为模型允许多个固定视图，建议使用 `ir.actions.act_window.view`：
> ```xml
> <record model="ir.actions.act_window.view" id="test_action_tree">
>    <field name="sequence" eval="1"/>
>    <field name="view_mode">list</field>
>    <field name="view_id" ref="view_test_tree"/>
>    <field name="act_window_id" ref="test_action"/>
> </record>
> ```

### 视图生成

服务器端 `views` 的生成逻辑：

1. 先按 `view_ids` 中的 `(id,type)`（按 `sequence`）添加。
2. 若 `view_id` 对应的类型尚未填充，追加该 `(id,type)`。
3. 对 `view_mode` 中尚未覆盖的类型追加 `(False,type)`。

## URL 动作 (`ir.actions.act_url`)

用于打开指定 URL（内部网页、外部页面或下载）。

| 字段 | 说明 | 备注 |
| --- | --- | --- |
| `url` | 目标地址 | |
| `target` | 打开方式 | `new`（新标签页）、`self`（当前内容替换）或 `download`。 |

```json
{
    "type": "ir.actions.act_url",
    "url": "https://odoo.com",
    "target": "self",
}
```

## 服务端动作 (`ir.actions.server`)

服务器动作可自动执行（例如规则触发），也可手动通过“更多”菜单运行。支持多种行为（执行 Python 代码、创建记录、写入记录、执行多个动作）。

| 字段 | 说明 | 备注 |
| --- | --- | --- |
| `id` | 要运行的服务端动作 | 数据库 ID。 |
| `context` | 运行时上下文 | 字典，可传递默认值、记录 ID 等。 |
| `model_id` | 对应模型 | |
| `state` | 动作的执行方式 | `code`/`object_create`/`object_write`/`multi`。 |

### 状态字段

| 字段 | 说明 | 适用状态 |
| --- | --- | --- |
| `code` | 执行的 Python 代码段 | `code` |
| `crud_model_id` | 创建记录时的目标模型 | `object_create` |
| `link_field_id` | 指向 `ir.model.fields` 的 m2o | 创建时把新记录写入指定字段，模型需匹配。 |
| `fields_lines` | 覆盖字段的 `One2many` | 一个 `One2many` 配置表，内部包含 `col1` / `value` / `type`。 |
| `child_ids` | 多动作下要执行的子动作 | `multi` |

`fields_lines` 内部字段示例如下：

| 字段 | 说明 |
| --- | --- |
| `col1` | 要设置的字段（创建时为 `crud_model_id`，更新时为 `model_id`）。 |
| `value` | 要赋的值，依据 `type` 解释。 |
| `type` | `value` 表示字面值，`equation` 表示 Python 表达式。 |

如果某个子动作返回动作，`child_ids` 的最终结果会把最后一个动作交给客户端。

#### Python 代码示例

```xml
<record model="ir.actions.server" id="print_instance">
    <field name="name">Res Partner Server Action</field>
    <field name="model_id" ref="model_res_partner"/>
    <field name="state">code</field>
    <field name="code">
        raise Warning(record.name)
    </field>
</record>
```

如果满足特定条件，可以把 `action` 变量返回给客户端：

```xml
<record model="ir.actions.server" id="print_instance">
    <field name="name">Res Partner Server Action</field>
    <field name="model_id" ref="model_res_partner"/>
    <field name="state">code</field>
    <field name="code">
        if record.some_condition():
            action = {
                "type": "ir.actions.act_window",
                "view_mode": "form",
                "res_model": record._name,
                "res_id": record.id,
            }
    </field>
</record>
```

### 求值上下文

- `model`：通过 `model_id` 链接到的模型对象。
- `record` / `records`：触发动作的记录集（可能为空）。
- `env`：当前 Odoo 环境。
- `datetime`/`dateutil`/`time`/`timezone`：对应 Python 模块。
- `log:log(message,level='info')`：向 `ir.logging` 写调试信息。
- `Warning`：用于抛出 `Warning` 异常。

## 报告动作 (`ir.actions.report`)

用于触发打印报告。如需在模型视图的“打印”菜单中显示，还必须设定绑定的 `binding_model_id`（`binding_type` 可不填，`report` 会隐式设置）。

| 字段 | 说明 | 备注 |
| --- | --- | --- |
| `name` | 报告名称 | 如未指定 `print_report_name`，此值即文件名；否则仅作为描述。 |
| `model` | 关联模型 | |
| `report_type` | 渲染方式 | `qweb-pdf` 用于 PDF，`qweb-html` 用于 HTML。 |
| `report_name` | 渲染模板名 | 使用 qweb 模板（external id）。 |
| `print_report_name` | 文件名称表达式 | 可以通过 Python 表达式定义。 |
| `groups_id` | 查看/打印权限 | `Many2many` 指向用户组。 |
| `multi` | 是否在表单中隐藏 | `True` 时不会出现在表单视图。 |
| `paperformat_id` | 纸张格式 | `Many2one` 指向纸张格式；未设则用公司默认。 |
| `attachment_use` | 首次生成后复用 | `True` 时只生成一次并复用。 |
| `attachment` | 报告名称表达式 | 运行时可通过 `object` 访问当前记录。 |

## 客户端动作 (`ir.actions.client`)

客户端动作完全在前端实现，服务器只负责下发指令。

| 字段 | 说明 | 备注 |
| --- | --- | --- |
| `tag` | 动作标签 | 任意字符串，客户端需识别并处理。 |
| `params` | 附加参数 | Python 字典，会与 `tag` 一起发送。 |
| `target` | 打开位置 | `current`（默认）、`fullscreen`、`new`。 |

```json
{
    "type": "ir.actions.client",
    "tag": "pos.ui"
}
```

> [!seealso]
> - [教程：客户端动作](../../tutorials/web.html#howtos-web-client-actions)

## 计划动作 (`ir.cron`)

计划动作按预定义频率自动触发模型方法。

| 字段 | 说明 | 备注 |
| --- | --- | --- |
| `name` | 计划名称 | 主要用于日志。 |
| `interval_number` | 时间间隔数 | 与 `interval_type` 组合定义频率。 |
| `interval_type` | 单位 | `minutes`/`hours`/`days`/`weeks`/`months`。 |
| `model_id` | 触发模型 | |
| `code` | 要执行的表达式 | 通常写 `model.<method>()`。 |
| `nextcall` | 下次执行时间 | 日期/时间格式。 |
| `priority` | 优先级 | 同时执行时的排序。 |

### 高级用法：批处理

为避免长时间占用工作线程，建议在计划动作中分批处理：

```python
self.env['ir.cron']._notify_progress(done=XX:int, remaining=XX:int)
```

该 API 让调度器知道进度，默认每次处理 10 个批次，剩余任务会尽快再调度。

### 高级用法：触发器

需要时可直接从业务代码触发计划动作：

```python
action_record._trigger(at=XX:date)
```

### 安全性

- 连续三次错误或超时会跳过当前执行。
- 连续五次失败且至少七天内，动作会被停用并通知管理员。
