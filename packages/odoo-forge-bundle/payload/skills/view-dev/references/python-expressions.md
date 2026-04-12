# Python 表达式

> 来源：`docs/obsidian/07 知识库/odoo文档/03_开发者/03_参考/03_用户界面/02_视图架构.md`
> 原文章节：`## Python 表达式`
>
> 本文件从原始文档中拆分而来，以下内容尽量保留原文，仅做拆分与轻量排版。

在评估节点属性时（例如 `readonly` 修饰符），可以提供一个 Python 表达式。表达式会在当前视图上下文中执行，并可访问模型字段与环境变量来控制界面行为。

## 目录

- [可用变量](#可用变量)
- [示例](#示例)

---

## 可用变量

| 变量 | 描述 |
| --- | --- |
| 所有字段 | 当前视图中所有字段的名称和值；列表视图里被 `column_invisible` 标记的字段会被排除，关系字段以 ID 列表形式提供。 |
| `id` | 当前记录的 ID。 |
| `parent` | 当前字段所在容器的记录，仅在子视图（如关系字段中的 `<form>`）中可用。 |
| `context` | 当前视图的上下文字典，可以读取默认值或行为开关。 |
| `uid` | 当前用户的 ID。 |
| `today` | 本地日期，格式为 `YYYY-MM-DD`。 |
| `now` | 本地日期时间，格式为 `YYYY-MM-DDhh:mm:ss`。 |

## 示例

### 示例 1：基于上下文与字段值控制可见性

```xml
<field name="field_a" readonly="True"/>
<field name="field_b" invisible="context.get('show_me') and field_a == 4"/>
```

### 示例 2：在子视图中使用 `parent`

```xml
<field name="field_a"/>
<field name="x2m">
    <!-- sub-view -->
    <form>
        <field name="field_b" invisible="parent.field_a"/>
    </form>
</field>
```
