# 消息功能

> 来源：`docs/obsidian/07 知识库/odoo文档/03_开发者/03_参考/01_服务器框架/10_混入类和实用类.md`
> 原文章节：`## 消息功能`
>
> 本文件从原始文档中拆分而来，以下内容尽量保留原文，仅做拆分与轻量排版。

## 目录

- [消息集成](#消息集成)
- [基本消息系统](#基本消息系统)
- [服务器端辅助方法](#服务器端辅助方法)
- [接收消息](#接收消息)
- [关注者管理](#关注者管理)
- [记录更改](#记录更改)
- [子类型](#子类型)
- [自定义通知](#自定义通知)
- [覆盖默认值](#覆盖默认值)
- [邮件别名](#邮件别名)
- [活动跟踪](#活动跟踪)

---

## 消息集成

将消息功能集成到模型中，常见做法是继承 `mail.thread` 并在表单视图加入 `<chatter/>` 组件。

### 基本消息系统

`<chatter/>` 常用选项如下：

| 选项 | 说明 |
| --- | --- |
| `open_attachments` | 默认展开附件区。 |
| `reload_on_attachment` | 添加/删除附件后刷新表单。 |
| `reload_on_follower` | 更新关注者后刷新表单。 |
| `reload_on_post` | 发布新消息后刷新表单。 |

> [!example]
> 创建一个 `business.trip` 模型并启用消息功能：
>
> ```python
> class BusinessTrip(models.Model):
>     _name = 'business.trip'
>     _inherit = ['mail.thread']
>     _description = 'Business Trip'
>
>     name = fields.Char()
>     partner_id = fields.Many2one('res.partner', 'Responsible')
>     guest_ids = fields.Many2many('res.partner', 'Participants')
> ```
>
> ```xml
> <record id="business_trip_form" model="ir.ui.view">
>     <field name="name">business.trip.form</field>
>     <field name="model">business.trip</field>
>     <field name="arch" type="xml">
>         <form string="Business Trip">
>             <chatter open_attachments="True"/>
>         </form>
>     </field>
> </record>
> ```

启用后，用户可在记录上发布消息/内部注释；若邮件网关与收件配置正确，通知可通过邮件发送并自动路由回正确线程。

## 服务器端辅助方法

### 发布消息

在现有线程中发布消息，会创建新的 `mail.message`。

| 参数 | 说明 |
| --- | --- |
| `body` (`str` \| `Markup`) | 消息正文。`str` 会被转义；HTML 内容建议用 `Markup`。 |
| `message_type` (`str`) | 对应 `mail_message.message_type`。 |
| `parent_id` (`int`) | 私密讨论回复时可指定父消息关联。 |
| `attachments` (`list[(name, content)]`) | 附件列表，`content` 不做 base64。 |
| `body_is_html` (`bool`) | 即使 `body` 为 `str`，也按 HTML 处理。 |
| `**kwargs` | 作为新 `mail.message` 的默认列值。 |

返回：新建 `mail.message` 的 ID（`int`）。

### 基于视图渲染并发送/发布

辅助方法：通过 `view_id` 使用 `ir.qweb` 渲染并发送邮件/发布消息。

| 参数 | 说明 |
| --- | --- |
| `record` (`str` \| `ir.ui.view`) | 视图外部 ID 或视图记录。 |

该方法用于模板/撰写器难以批量处理视图时的独立场景。

### 基于模板发送邮件

辅助方法：使用模板渲染消息正文并发送。

| 参数 | 说明 |
| --- | --- |
| `template_id` | 用于渲染正文的模板 ID。 |
| `**kwargs` | 用于创建 `mail.compose.message`（继承 `mail.message`）的参数。 |

## 接收消息

邮件网关处理新邮件时会调用接收方法。邮件可来自新线程或现有线程回复；重写这些方法可按邮件内容更新线程记录（例如抄送转关注者）。

### 新线程消息（`message_new` 语义）

当邮件不属于现有线程时，由 `message_process` 调用。默认行为是基于邮件信息创建新记录。

| 参数 | 说明 |
| --- | --- |
| `msg_dict` (`dict`) | 邮件详情与附件映射。 |
| `custom_values` (`dict`) | 创建新线程记录时传入 `create()` 的附加字段值。 |

返回：新建线程对象 ID（`int`）。

### 现有线程消息（`message_update` 语义）

当邮件属于现有线程时，由 `message_process` 调用。默认行为是按 `update_vals` 更新记录。

| 参数 | 说明 |
| --- | --- |
| `msg_dict` (`dict`) | 邮件详情与附件映射。 |
| `update_vals` (`dict`) | 基于记录 ID 的更新值；为空时不执行写入。 |

返回：`True`（`bool`）。

## 关注者管理

### 添加关注者

将合作伙伴/频道添加为记录关注者。

| 参数 | 说明 |
| --- | --- |
| `partner_ids` (`list[int]`) | 要订阅该记录的合作伙伴 ID。 |
| `channel_ids` (`list[int]`) | 要订阅该记录的频道 ID。 |
| `subtype_ids` (`list[int]`) | 订阅的子类型 ID；`None` 时用默认子类型。 |
| `force` | 为 `True` 时，先移除旧关注者再按给定子类型重建。 |

返回：成功/失败（`bool`）。

### 移除关注者

从记录关注者中移除合作伙伴/频道。

| 参数 | 说明 |
| --- | --- |
| `partner_ids` (`list[int]`) | 要取消订阅的合作伙伴 ID。 |
| `channel_ids` (`list[int]`) | 要取消订阅的频道 ID。 |

返回：`True`（`bool`）。

### 按用户取消订阅

基于用户维度的 `message_subscribe` 包装器。

| 参数 | 说明 |
| --- | --- |
| `user_ids` (`list[int]`) | 要取消订阅的用户 ID；`None` 时取消当前用户。 |

返回：`True`（`bool`）。

## 记录更改

`mail` 模块支持字段跟踪。对字段设置 `tracking=True` 后，字段变化会记录到聊天记录中。

> [!example]
> 跟踪商务旅行名称与负责人变更：
>
> ```python
> class BusinessTrip(models.Model):
>     _name = 'business.trip'
>     _inherit = ['mail.thread']
>     _description = 'Business Trip'
>
>     name = fields.Char(tracking=True)
>     partner_id = fields.Many2one('res.partner', 'Responsible', tracking=True)
>     guest_ids = fields.Many2many('res.partner', 'Participants')
> ```
>
> 每次 `name` 或 `partner_id` 变化都会生成备注；即使 `name` 未改也可能显示在通知中以提供上下文。

## 子类型

子类型用于更细粒度控制通知，允许订阅者只接收特定类型更新。

### `mail.message.subtype` 关键字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | `Char` | 子类型名称，显示于通知定制弹窗。 |
| `description` | `Char` | 发布该子类型消息时附加描述；为空则用 `name`。 |
| `internal` | `Boolean` | 仅员工可见（`base.group_user`）。 |
| `parent_id` | `Many2one` | 子类型关联链路，用于自动订阅。 |
| `relation_field` | `Char` | 关联字段名（如任务的 `project_id`）。 |
| `res_model` | `Char` | 子类型作用模型；为空时作用于所有模型。 |
| `default` | `Boolean` | 订阅时是否默认激活。 |
| `sequence` | `Integer` | 通知定制弹窗中的排序。 |
| `hidden` | `Boolean` | 是否在通知定制弹窗隐藏。 |

### `_track_subtype(init_values)`

根据字段变更返回触发子类型。

| 参数 | 说明 |
| --- | --- |
| `init_values` (`dict`) | 变更前原始值，仅包含被修改字段。 |

返回：子类型完整 external ID；若不触发则 `False`。

> [!example]
> 定义并触发“行程已确认”子类型：
>
> ```xml
> <record id="mt_state_change" model="mail.message.subtype">
>     <field name="name">Trip confirmed</field>
>     <field name="res_model">business.trip</field>
>     <field name="default" eval="True"/>
>     <field name="description">Business Trip confirmed!</field>
> </record>
> ```
>
> ```python
> class BusinessTrip(models.Model):
>     _name = 'business.trip'
>     _inherit = ['mail.thread']
>     _description = 'Business Trip'
>
>     name = fields.Char(tracking=True)
>     partner_id = fields.Many2one('res.partner', 'Responsible', tracking=True)
>     guest_ids = fields.Many2many('res.partner', 'Participants')
>     state = fields.Selection([('draft', 'New'), ('confirmed', 'Confirmed')], tracking=True)
>
>     def _track_subtype(self, init_values):
>         self.ensure_one()
>         if 'state' in init_values and self.state == 'confirmed':
>             return self.env.ref('my_module.mt_state_change')
>         return super(BusinessTrip, self)._track_subtype(init_values)
> ```

## 自定义通知

通知模板可按接收者组显示不同按钮：

- 访问按钮：直接打开记录表单。
- 关注按钮：快速订阅线程。
- 取消关注按钮：快速取消订阅。
- 自定义动作按钮：触发指定路由操作。

这些配置可通过重写 `_notify_get_groups` 控制。

### `_notify_get_groups(message, groups)`

| 参数 | 说明 |
| --- | --- |
| `message` (`record`) | 当前发送中的 `mail.message`。 |
| `groups` (`list[tuple]`) | `(group_name, group_func, group_data)` 元组列表。 |

`group_name` 默认常见值：`user`、`portal`、`customer`。  
`group_func(partner)` 用于判定收件人分组；按列表顺序匹配，首个命中生效。

`group_data` 常见键如下：

| 键 | 说明 |
| --- | --- |
| `has_button_access` | 是否显示访问按钮。 |
| `button_access` | 访问按钮的 URL/标题。 |
| `has_button_follow` | 是否显示关注按钮。 |
| `button_follow` | 关注按钮的 URL/标题。 |
| `has_button_unfollow` | 是否显示取消关注按钮。 |
| `button_unfollow` | 取消关注按钮的 URL/标题。 |
| `actions` | 自定义动作按钮列表（每项含 URL/标题）。 |

### `_notify_get_action_link(link_type, **kwargs)`

根据类型为当前或指定记录生成动作链接。

| 参数 | 说明 |
| --- | --- |
| `link_type` (`str`) | 要生成的链接类型。 |

`link_type` 可选值：

| 类型 | 说明 |
| --- | --- |
| `view` | 打开记录表单。 |
| `assign` | 将当前登录用户赋给记录 `user_id`（若字段存在）。 |
| `follow` | 关注记录。 |
| `unfollow` | 取消关注记录。 |
| `method` | 调用记录方法（`kwargs` 需提供 `method`）。 |
| `new` | 打开空表单创建记录（可用 `action_id` 指定动作）。 |

返回：生成的链接（`str`）。

> [!example]
> 为行程状态通知添加“取消行程”按钮，并仅对行程管理员组可见：
>
> ```python
> class BusinessTrip(models.Model):
>     _name = 'business.trip'
>     _inherit = ['mail.thread', 'mail.alias.mixin']
>     _description = 'Business Trip'
>
>     # Previous code goes here
>
>     def action_cancel(self):
>         self.write({'state': 'draft'})
>
>     def _notify_get_groups(self, message, groups):
>         groups = super(BusinessTrip, self)._notify_get_groups(message, groups)
>         self.ensure_one()
>         if self.state == 'confirmed':
>             app_action = self._notify_get_action_link('method', method='action_cancel')
>             trip_actions = [{'url': app_action, 'title': _('Cancel')}]
>
>         new_group = (
>             'group_trip_manager',
>             lambda partner: any(
>                 user.sudo().has_group('business.group_trip_manager')
>                 for user in partner.user_ids
>             ),
>             {'actions': trip_actions},
>         )
>
>         return [new_group] + groups
> ```

## 覆盖默认值

### `_mail_post_access`

| 项 | 说明 |
| --- | --- |
| 类型 | `Model` |
| 含义 | 模型允许发布消息所需权限；默认 `write`，可改为 `read`。 |

### 常用上下文键

| 上下文键 | 说明 |
| --- | --- |
| `mail_create_nosubscribe` | `create()` 或 `message_post` 时不自动订阅当前用户。 |
| `mail_create_nolog` | `create()` 时不记录“文档已创建”自动消息。 |
| `mail_notrack` | `create()`/`write()` 时不进行字段跟踪。 |
| `tracking_disable` | `create()`/`write()` 时禁用 MailThread 功能（自动订阅、跟踪、发布等）。 |
| `mail_auto_delete` | 自动删除邮件通知（默认 `True`）。 |
| `mail_notify_force_send` | 通知数小于 50 时立即发送而非排队（默认 `True`）。 |
| `mail_notify_user_signature` | 邮件通知中附带当前用户签名（默认 `True`）。 |

## 邮件别名

别名是可配置邮箱地址，通常绑定继承 `mail.alias.mixin` 的父模型；收到邮件后可创建新记录或路由到特定线程。

### 别名与传入网关

别名仍依赖邮件网关，但通常一个收件域即可；路由在 Odoo 内部处理。相较直接配置多个网关地址：

- 配置更集中：多个别名可复用单个传入网关。
- 记录级一致性更好：配置更贴近业务对象。
- 可扩展性更高：Mixin 便于重写并提取邮件数据。

> [!note]
> 别名创建目标模型必须继承 `mail.thread`。

### 集成方式（`mail.alias.mixin`）

与 `mail.thread` 不同，`mail.alias.mixin` 需要重写关键方法：

| 方法 | 说明 |
| --- | --- |
| `_get_alias_model_name(vals)` | 返回别名收到“新线程邮件”时要创建的模型名。 |
| `_get_alias_values()` | 返回别名创建/更新值，常用于设置 `alias_defaults` 等。 |

### 常用别名字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `alias_name` | `Char` | 别名名（如 `jobs` 对应 `jobs@example.com`）。 |
| `alias_user_id` | `Many2one(res.users)` | 新记录默认所有者。 |
| `alias_defaults` | `Text` | Python 字典，作为别名新建记录默认值。 |
| `alias_force_thread_id` | `Integer` | 强制附加到指定线程，禁用新记录创建。 |
| `alias_contact` | `Selection` | 谁可通过该别名发消息：所有人/合作伙伴/关注者。 |

> [!note]
> 别名使用委托继承，可在父对象上直接访问这些字段。

> [!example]
> 为商务旅行添加别名，以邮件创建费用：
>
> ```python
> class BusinessTrip(models.Model):
>     _name = 'business.trip'
>     _inherit = ['mail.thread', 'mail.alias.mixin']
>     _description = 'Business Trip'
>
>     name = fields.Char(tracking=True)
>     partner_id = fields.Many2one('res.partner', 'Responsible', tracking=True)
>     guest_ids = fields.Many2many('res.partner', 'Participants')
>     state = fields.Selection([('draft', 'New'), ('confirmed', 'Confirmed')], tracking=True)
>     expense_ids = fields.One2many('business.expense', 'trip_id', 'Expenses')
>     alias_id = fields.Many2one('mail.alias', string='Alias', ondelete="restrict", required=True)
>
>     def _get_alias_model_name(self, vals):
>         return 'business.expense'
>
>     def _get_alias_values(self):
>         values = super(BusinessTrip, self)._get_alias_values()
>         values['alias_defaults'] = {'trip_id': self.id}
>         values['alias_contact'] = 'followers'
>         return values
>
> class BusinessExpense(models.Model):
>     _name = 'business.expense'
>     _inherit = ['mail.thread']
>     _description = 'Business Expense'
>
>     name = fields.Char()
>     amount = fields.Float('Amount')
>     trip_id = fields.Many2one('business.trip', 'Business Trip')
>     partner_id = fields.Many2one('res.partner', 'Created by')
> ```
>
> ```xml
> <page string="Emails">
>     <group name="group_alias">
>         <label for="alias_name" string="Email Alias"/>
>         <div name="alias_def">
>             <field name="alias_id" class="oe_read_only oe_inline" string="Email Alias" required="0"/>
>             <div class="oe_edit_only oe_inline" name="edit_alias" style="display: inline;">
>                 <field name="alias_name" class="oe_inline"/>
>                 @
>                 <field name="alias_domain" class="oe_inline" readonly="1"/>
>             </div>
>         </div>
>         <field name="alias_contact" class="oe_inline" string="Accept Emails From"/>
>     </group>
> </page>
> ```
>
> 在费用模型中可重写 `message_new()` 从邮件提取字段值：
>
> ```python
> class BusinessExpense(models.Model):
>     # Previous code goes here
>     # ...
>
>     def message_new(self, msg, custom_values=None):
>         name = msg_dict.get('subject', 'New Expense')
>         amount_pattern = '(\\d+(\\.\\d*)?|\\.\\d+)'
>         expense_price = re.findall(amount_pattern, name)
>         price = expense_price and float(expense_price[-1][0]) or 1.0
>         partner = self.env['res.partner'].search([('email', 'ilike', email_address)], limit=1)
>         defaults = {
>             'name': name,
>             'amount': price,
>             'partner_id': partner.id
>         }
>         defaults.update(custom_values or {})
>         res = super(BusinessExpense, self).message_new(msg, custom_values=defaults)
>         return res
> ```

## 活动跟踪

活动（`mail.activity`）用于记录待办动作（如电话、会议）。活动随 `mail` 模块提供，但并不与 `mail.thread` 绑定；可通过 `mail.activity.mixin` 集成。

常见显示方式：

- 表单视图：`activity_ids` + `mail_activity` 小部件
- 看板视图：`activity_ids` + `kanban_activity` 小部件

> [!example]
> ```python
> class BusinessTrip(models.Model):
>     _name = 'business.trip'
>     _inherit = ['mail.thread', 'mail.activity.mixin']
>     _description = 'Business Trip'
>
>     name = fields.Char()
>     # [...]
> ```
>
> ```xml
> <record id="business_trip_form" model="ir.ui.view">
>     <field name="name">business.trip.form</field>
>     <field name="model">business.trip</field>
>     <field name="arch" type="xml">
>         <form string="Business Trip">
>             <chatter>
>                 <field name="message_follower_ids" widget="mail_followers"/>
>                 <field name="activity_ids" widget="mail_activity"/>
>                 <field name="message_ids" widget="mail_thread"/>
>             </chatter>
>         </form>
>     </field>
> </record>
> ```

可参考的集成模型包括：

- `crm.lead`（CRM）
- `sale.order`（销售）
- `project.task`（项目）
