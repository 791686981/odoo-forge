# Odoo 中的安全性

> 来源：`https://docs.odoo.sbggai.top/developer/reference/backend/security.html`
>
> 本文件整理了官方安全参考的关键机制，尽量保留原文示例并在排版上做轻度拆分以便查阅。

Odoo 除了可以在代码中显式判断权限外，还提供两套数据驱动机制来控制对数据的访问：*访问权限（ACL）* 和 *记录规则*。它们都与组关联，一个用户可以属于多个组，组定义的 ACL/规则会联合起来决定他能读、写、创建、删除哪些模型或记录。

## 目录

- [组](#组)
- [访问权限](#访问权限)
- [记录规则](#记录规则)
- [规则变量](#规则变量)
- [字段访问](#字段访问)
- [安全陷阱](#安全陷阱)
- [SQL 注入](#sql-注入)
- [未转义的字段内容](#未转义的字段内容)
- [转义与清理](#转义与清理)
- [评估内容](#评估内容)
- [访问对象属性](#访问对象属性)

---

## 组

组是 Odoo 安全配置的基础承载对象。访问权限、记录规则和字段级限制都会围绕组来组合与复用。

| 字段 | 说明 |
| --- | --- |
| `name` | 组的用户可读名称，用于说明角色或职责。 |
| `category_id` | 模块类别，用于在用户表单中组织组选项，常表现为互斥选择。 |
| `implied_ids` | 隐式包含的其他组，可理解为便捷继承，用于复用已有权限组合。 |
| `comment` | 对组用途、边界或使用方式的补充说明。 |

> [!note]
> `implied_ids` 只是便捷继承。被隐含的组仍然可以在用户身上显式移除。

## 访问权限

访问权限（ACL）直接将某个组与模型的读/写/创建/删除操作绑定：只要当前用户所属的任一组授予某项操作，他就能执行该操作。它们的权限是累加的，跨组组合成并集。

| 字段 | 说明 |
| --- | --- |
| `perm_read` | 是否允许读取模型数据。 |
| `perm_write` | 是否允许更新该模型的记录。 |
| `perm_create` | 是否允许创建新记录。 |
| `perm_unlink` | 是否允许删除记录。 |
| `group_id` | 绑定到某个组（空值表示授予所有用户）。 |

访问权限以 `perm_*` 属性设置，默认不选中任何项（即所有 CRUD 操作都必须显式打开）。空的 `group_id` 表示非员工（例如门户或公共用户）也会被覆盖。

## 记录规则

记录规则是可选的“域过滤器”，它们在访问权限判断之后逐条评估：只要某条规则的域与记录匹配，就允许选定的操作；未匹配时则拒绝。规则可以绑定一个或多个组，也可以是*全局*规则（没有组约束）。

| 字段 | 说明 |
| --- | --- |
| `name` | 规则名称（可选）。 |
| `model_id` | 规则适用的模型。 |
| `domain_force` | 用于匹配记录的域（Python 表达式）。 |
| `perm_*` | `perm_read`/`perm_create`/`perm_write`/`perm_unlink`，指定该规则针对哪些操作生效。 |
| `groups` | 规则生效的组；为空表示全局规则。 |

规则使用 `groups` 构建权限的 *并集*：只要满足其中之一即可通过。如果某条规则没有组，它会作为 *全局规则* 参与交集逻辑（即所有全局规则必须同时满足）。

### 全局规则与组规则

- 全局规则之间是*交集*关系：若多条全局规则同时适用，则必须全部满足。
- 组规则之间是*并集*关系：若多条组规则适用，满足其中之一即可放行。
- 全局规则集与组规则集之间仍是*交集*关系：第一条组规则加入后，访问范围仍受全局规则上界限制。

> [!note]
> 添加多个全局规则时要小心，因为它们的交集可能完全排除所有访问权限。

## 规则变量

许多记录规则依赖上下文变量来构造域表达式，以下变量在规则中可直接引用：

| 变量 | 说明 |
| --- | --- |
| `time` | Python 的 [`time`](https://docs.python.org/3/library/time.html#module-time) 模块。 |
| `user` | 当前用户（`res.users` 实例）。 |
| `company_id` | 当前选择的公司 ID。 |
| `company_ids` | 当前用户有权访问的公司 ID 列表；多公司场景下通常要结合对应的安全规则一起理解。 |

规则中的 `perm_*method*` 与 ACL 中的字段语义不同，它指定的是 *该规则* 针对哪些操作进行评估；未选中的操作会被忽略。默认情况下所有 CRUD 操作都被选中。

## 字段访问

字段可以通过 `groups` 属性绑定到某些组。若用户不属于该组：

- 该字段会从请求的视图中移除（视图渲染时自动过滤）。
- 它也会从 `fields_get()` 的响应中省略。
- 任何显式的读写尝试都会抛出访问错误。

## 安全陷阱

理解常见的漏洞模式有助于编写安全的业务逻辑。

### 不安全的公共方法

所有公开方法都可以通过 RPC / 外部 API 调用，因此不要信任传入记录和参数（ACL 仅在 CRUD 期间生效）。

```python
# this method is public and its arguments can not be trusted
def action_done(self):
    if self.state == "draft" and self.env.user.has_group('base.manager'):
        self._set_state("done")

# this method is private and can only be called from other python methods
def _set_state(self, new_state):
    self.sudo().write({"state": new_state})
```

即使方法名以 `_` 开头，也需要额外的限制（例如 `sudo` / `check_access_rule`）来防止绕过 ACL。

### 绕过 ORM

直接使用数据库游标会绕过 ORM 提供的自动化（翻译、`active`、访问权限等），还可能让代码更难维护。

```python
# very very wrong
self.env.cr.execute('SELECT id FROM auction_lots WHERE auction_id in (' + ','.join(map(str, ids))+') AND state=%s AND obj_price > 0', ('draft',))
auction_lots_ids = [x[0] for x in self.env.cr.fetchall()]

# no injection, but still wrong
self.env.cr.execute('SELECT id FROM auction_lots WHERE auction_id in %s '\
           'AND state=%s AND obj_price > 0', (tuple(ids), 'draft',))
auction_lots_ids = [x[0] for x in self.env.cr.fetchall()]

# better
auction_lots_ids = self.search([('auction_id','in',ids), ('state','=','draft'), ('obj_price','>',0)])
```

### SQL 注入

不要拼接字符串构造 SQL，始终让 psycopg2 或 ORM 处理参数化。

```python
# the following is very bad:
self.env.cr.execute('SELECT distinct child_id FROM account_account_consol_rel ' +
           'WHERE parent_id IN ('+','.join(map(str, ids))+')')

# better
self.env.cr.execute('SELECT DISTINCT child_id '\
           'FROM account_account_consol_rel '\
           'WHERE parent_id IN %s',
           (tuple(ids),))
```

参考 psycopg2 文档（链接请参阅原文）了解参数化细节。

- [查询参数的问题](http://initd.org/psycopg/docs/usage.html#the-problem-with-the-query-parameters)
- [如何使用 psycopg2 传递参数](http://initd.org/psycopg/docs/usage.html#passing-parameters-to-sql-queries)
- [高级参数类型](http://initd.org/psycopg/docs/usage.html#adaptation-of-python-values-to-sql-types)
- [Psycopg 文档](https://www.psycopg.org/docs/sql.html)

### 未转义的字段内容

切勿用 `t-raw` 渲染来自用户的富文本，因为它们不会自动转义。

```javascript
QWeb.render('insecure_template', {
    info_message: "You have an <strong>important</strong> notification",
})
```

```xml
<div t-name="insecure_template">
    <div id="information-bar"><t t-raw="info_message" /></div>
</div>
```

一旦模板里直接插入 `<strong>` 和用户输入，就会造成 XSS 风险，哪怕它最初看似安全。

更安全的做法是把文本内容和表现样式拆开：

```javascript
QWeb.render('secure_template', {
    message: "You have an important notification on the product:",
    subject: product.name,
})
```

```xml
<div t-name="secure_template">
    <div id="information-bar">
        <div class="info"><t t-esc="message" /></div>
        <div class="subject"><t t-esc="subject" /></div>
    </div>
</div>
```

```css
.subject {
    font-weight: bold;
}
```

### 使用 `Markup` 构造安全内容

`Markup` 类型会自动转义参数，因此可以在格式化字符串前用它包裹模板。

```pycon
>>> Markup('<em>Hello</em> ') + '<foo>'
Markup('<em>Hello</em> &lt;foo&gt;')
>>> Markup('<em>Hello</em> %s') % '<foo>'
Markup('<em>Hello</em> &lt;foo&gt;')
```

不过，这会在某些组合中带来怪异结果，使用时要保持小心，例如：

```pycon
>>> Markup('<a>').replace('>', 'x')
Markup('<a>')
>>> Markup('<a>').replace(Markup('>'), 'x')
Markup('<ax')
```

> [!tip]
> 大多数安全 API 本身就会返回带有内置特性的 `Markup`。

`escape`（`html_escape`）将任意字符串转成 `Markup` 并转义内容。

```python
def get_name(self, to_html=False):
    if to_html:
        return Markup("<strong>%s</strong>") % self.name  # escape the name
    else:
        return self.name

>>> record.name = "<R&D>"
>>> escape(record.get_name())
Markup("&lt;R&amp;D&gt;")
>>> escape(record.get_name(True))
Markup("<strong>&lt;R&amp;D&gt;</strong>")
```

### 转义与清理

> [!warning]
> 只要混合数据与代码，转义就是必须的；这不仅是安全问题，也是正确性问题。

**转义** 将文本转换为代码，把用户数据安全地插入模板。只要混合数据与模板，就必须转义。

```python
>>> from odoo.tools import html_escape, html_sanitize
>>> data = "<R&D>"
>>> code = html_escape(data)
>>> self.website_description = Markup("<strong>%s</strong>") % code
```

**清理** 是在转义之后再处理*代码*，用于剥除不受信任的模式（例如删除 `style`）。它不会对文本起作用，因此只有在代码确实来自用户并且需要剪裁时才用。

```python
>>> html_sanitize(data)
Markup('')
>>> html_sanitize(code)
Markup('<p>&lt;R&amp;D&gt;</p>')
```

```python
>>> html_sanitize(code, strip_classes=True)
Markup('<p>Important Information</p>')
```

### 评估内容

千万别用 `eval` 解析用户数据，可以改用 `safe_eval` 或更安全的 `literal_eval`：

```python
# very bad
domain = eval(self.filter_domain)

# better but still not recommended
from odoo.tools import safe_eval
domain = safe_eval(self.filter_domain)

# good
from ast import literal_eval
domain = literal_eval(self.filter_domain)
```

| 语言 | 数据类型 | 推荐解析器 |
| --- | --- | --- |
| Python | 整数/浮点等 | `int()` / `float()` / `literal_eval()` |
| JavaScript | 对象、列表等 | `JSON.parse()` |

### 访问对象属性

避免直接使用 `getattr`/`setattr` 访问任意字段，它们会绕过访问控制。可以改用记录集的 `__getitem__`：

```python
# unsafe retrieval
def _get_state_value(self, res_id, state_field):
    record = self.sudo().browse(res_id)
    return getattr(record, state_field, False)

# better retrieval
def _get_state_value(self, res_id, state_field):
    record = self.sudo().browse(res_id)
    return record[state_field]
```

无论哪个方法，都要对 ID/字段进行额外校验。
