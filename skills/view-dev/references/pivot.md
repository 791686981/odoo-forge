# 透视表

> 来源：`docs/obsidian/07 知识库/odoo文档/03_开发者/03_参考/03_用户界面/02_视图架构.md`
> 原文章节：`## 透视表`
> 本文件从原始文档中拆分而来，以下内容尽量保留原文，仅做拆分与轻量排版。

透视表视图用于将聚合结果可视化为透视表。其根元素是 `<pivot>`。

## 目录

- [根元素](#根元素)
- [根属性](#根属性)
- [`field` 元素](#field-元素)
- [`field` 属性](#field-属性)
- [度量与聚合规则](#度量与聚合规则)
- [限制与注意事项](#限制与注意事项)
- [字段格式化（widget）](#字段格式化widget)
- [示例](#示例)

---

## 根元素

```xml
<pivot>
    ...
</pivot>
```

## 根属性

`pivot` 根元素可配置以下属性：

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `disable_linking` | 设为 `1` 时，移除透视表单元格到列表视图的链接。 | `bool` / `int` | `False` |
| `display_quantity` | 设为 `1` 时，默认显示数量列。 | `bool` / `int` | `False` |
| `default_order` | 设置默认排序的度量及顺序（`asc` 或 `desc`）。 | `string` | `''` |
| `sample` | 当前模型无记录时，是否填充一组示例记录。 | `bool` | `False` |

> [!note]
> 原文中的“示例记录”描述以散段出现，未紧邻属性名；此处按上下文整理为 `sample` 属性。

关于 `sample`：

- 虚拟记录会按字段名/模型应用启发式填充。
- 例如 `res.users.display_name` 会生成示例人名，`email` 会类似 `firstname.lastname@sample.demo`。
- 用户无法与这些虚拟数据交互；一旦执行创建记录、添加列等操作，示例数据会被丢弃。

## `field` 元素

透视表视图中唯一允许的子元素是 `field`。

## `field` 属性

| 属性 | 说明 | 类型 | 默认值 | 备注 |
| --- | --- | --- | --- | --- |
| `name` | 要在视图中使用的字段名。 | `string` | 必填 | 用于分组或聚合 |
| `string` | 显示名称，覆盖字段默认 `string`。 | `string` | 字段默认值 |  |
| `type` | 字段角色：`row` / `col` / `measure`。 | `string` | `row` | 用于定义分组轴或度量 |
| `interval` | 日期/日期时间字段的分组粒度：`day` / `week` / `month` / `quarter` / `year`。 | `string` | `month` | 仅日期相关字段有效 |
| `invisible` | 为 `true` 时，不出现在活动度量或可选度量中。 | `bool` | `False` | 常用于不适合聚合的字段（如单位不一致） |
| `widget` | 指定字段格式化器。 | `string` | `''` | 常用：`date` / `datetime` / `float_time` / `monetary` |

`type` 的取值语义：

- `row`：按字段进行行分组。
- `col`：按字段进行列分组。
- `measure`：作为组内聚合值。

## 度量与聚合规则

- 度量会自动从模型字段生成。
- 仅可聚合字段会被作为候选度量。
- 候选度量按字段的 `string` 字母顺序排序。

## 限制与注意事项

> [!warning]
> 与图表视图类似，透视表聚合在数据库内容上执行，非存储的函数字段不能用于透视表视图。

## 字段格式化（widget）

在透视表中可通过 `field` 的 `widget` 属性指定格式化器，常用包括：

- `date`
- `datetime`
- `float_time`
- `monetary`

## 示例

默认排序示例：

```xml
<pivot default_order="foo asc">
   <field name="foo" type="measure"/>
</pivot>
```

工时透视表示例：

```xml
<pivot string="Timesheet">
    <field name="employee_id" type="row"/>
    <field name="date" interval="month" type="col"/>
    <field name="unit_amount" type="measure" widget="float_time"/>
</pivot>
```
