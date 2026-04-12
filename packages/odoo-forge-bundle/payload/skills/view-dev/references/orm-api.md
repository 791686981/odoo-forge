# ORM API

> 来源：`https://docs.odoo.sbggai.top/developer/reference/backend/orm.html`
>
> 本文件从官方 ORM API 参考整理而来，力求还原原文段落顺序，补全目录并用表格/小节提升可读性。

ORM API 涵盖以下主题：

- 分层结构
- 约束一致性与验证
- 对象元数据依赖于其状态
- 通过复杂查询优化处理（一次执行多个操作）
- 字段默认值
- 权限优化
- 持久化对象：PostgreSQL 数据库
- 数据转换
- 多级缓存系统
- 两种不同的继承机制
- 丰富的字段类型：经典类型、关系类型和功能性字段

## 目录

- [模型](#模型)
- [抽象模型](#抽象模型)
- [临时模型](#临时模型)
- [字段](#字段)

---

## 模型

模型通过在 Python 类中声明字段（`fields.Char()`、`fields.Many2one()` 等）来构造：这些字段就是模型的属性。下面是最基础的模型定义示例：

```python
from odoo import models, fields

class AModel(models.Model):
    _name = 'a.model.name'

    field1 = fields.Char()
```

> [!warning]
> 如果字段与方法同名，方法会默默覆盖字段。

默认情况下，字段标签是字段名称的首字母大写形式，也可以通过 `string` 参数覆盖：

```python
field2 = fields.Integer(string="Field Label")
```

默认值可以直接写在字段参数里：

```python
name = fields.Char(default="a value")
```

也可以提供一个函数来计算默认值：

```python
def _default_name(self):
    return self.get_value()

name = fields.Char(default=lambda self: self._default_name())
```

### 基类与实例

所有模型都继承自 `models.Model`（常规持久化模型）、`models.TransientModel`（临时数据/定期清理的模型）或 `models.AbstractModel`（抽象超类）。每个数据库会实例化一份模型类，对应模块安装情况决定哪些模型可用。模型实例即“记录集”，由 `browse()`、`search()` 等方法返回，并承载字段访问与 RPC 操作。

> [!tip]
> 继承 `AbstractModel` 可以创建不连表的模型。

### 模型配置

| 属性 | 说明 |
| --- | --- |
| `_name` | 模型的技术名称（点号命名空间）。 |
| `_auto` | 是否自动生成数据库表（默认 `True`）。设置为 `False` 时需自定义 `init()` 创建表。 |
| `_log_access` | 是否自动生成和更新访问日志字段。默认跟随 `_auto`。 |
| `_table` | 当 `_auto=True` 时使用的 SQL 表名。 |
| `_sql_constraints` | SQL 约束列表，格式通常为 `(name, sql_definition, message)`。 |
| `_register` | 是否在注册表中创建实体实例。 |
| `_abstract` | 模型是否为抽象模型。 |
| `_transient` | 模型是否为临时模型。 |
| `_description` | 模型的非正式名称。 |
| `_inherit` / `_inherits` | `_inherit` 用于原地扩展，`_inherits` 用于组合继承（映射父模型与关系字段）。 |
| `_rec_name` | 作为记录显示名称的字段，默认 `name`。 |
| `_order` | 查询默认排序字段，可覆盖 `_order` 属性。 |
| `_check_company_auto` | 在写入和创建时自动调用 `_check_company` 校验公司一致性。 |
| `_parent_store` / `_parent_path` / `_parent_field` | 控制层次结构字段与索引，有助于 `child_of` / `parent_of` 域运算符。 |
| `_fold_name` | 用于确定看板视图中折叠组的字段。 |
| `_transient_max_count` / `_transient_max_hours` | 临时模型的最大记录数与最大生存小时数（仅用于 `TransientModel`）。 |

> 注册表中每个模型最多实例化一次，对应特定数据库。

### 记录生命周期

ORM 自动生成并更新访问日志字段（参见 `ir.logging` 相关字段），并允许通过 `_check_company` 校验多公司关系字段的公司一致性。

## 抽象模型

`AbstractModel` 是 `odoo.models.BaseModel` 的别名，用于定义无表的超类。它提供共享逻辑供多个模型继承，使得抽象字段与方法可以复用。

> [!seealso]
> `odoo.models.AbstractModel`

## 临时模型

`TransientModel` 专为临时记录设计：数据存储后会定期清理，默认所有用户可以创建记录，但只能访问自己的记录，超级用户具备无限权限。

| 属性 | 说明 |
| --- | --- |
| `_transient_max_count` | 临时记录的最大数量，`0` 表示不限制。 |
| `_transient_max_hours` | 最大空闲生存时间（小时），`0` 表示不限制。 |

实际清理通常每 5 分钟触发一次，因此可以在频繁创建记录时重复调用。

## 字段

字段描述符决定字段如何展示与存储，常见属性如下：

| 属性 | 说明 |
| --- | --- |
| `string` | 用户界面标签，默认字段名首字母大写。 |
| `help` | 鼠标悬停提示文本。 |
| `readonly` | 是否只读（仅影响 UI）。 |
| `required` | 是否必填。 |
| `index` | 索引策略，可设为 `True`/`btree`/`trigram` 等。 |
| `default` | 默认值，可为静态值或回调函数。 |
| `groups` | 逗号分隔的安全组 XML ID，指定字段可见用户。 |
| `company_dependent` | 是否依赖公司（以 JSONB 存储）。 |
| `copy` | 复制记录时是否复制字段值。 |
| `store` | 是否存储在数据库（计算字段默认 `False`）。 |
| `aggregator` | 用于 `read_group()` 的聚合函数，如 `sum`、`count_distinct`、`array_agg`。 |
| `group_expand` | 在当前字段上分组时，用于扩展 `read_group()` 结果的函数。 |
| `compute` | 计算字段的方法名称。 |
| `precompute` | 是否在插入数据库前预计算字段。 |
| `compute_sudo` | 是否以超级用户身份重新计算字段。 |
| `recursive` | 是否存在递归依赖。 |
| `inverse` | 反向写回方法名。 |
| `search` | 自定义搜索方法名。 |
| `related` | 关联字段的字段名称序列。 |
| `default_export_compatible` | 是否在兼容导入的导出中默认导出。 |

> [!note]
> `default` 可传递 `lambda self:` 的函数以依赖上下文。

字段还可以继承 `compute` 函数、`inverse` 方法与 `search` 逻辑，以实现复杂计算与搜索行为。
