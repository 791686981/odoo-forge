# 图表

> 来源：`docs/obsidian/07 知识库/odoo文档/03_开发者/03_参考/03_用户界面/02_视图架构.md`
> 原文章节：`## 图表`
>
> 本文件从原始文档中拆分而来，以下内容尽量保留原文，仅做拆分与轻量排版。

图表视图用于可视化多个记录或记录组的聚合。其根元素是 `graph`。

## 目录

- [根元素与根属性](#根元素与根属性)
- [`field` 元素与属性](#field-元素与属性)
- [度量与限制](#度量与限制)
- [格式化与示例](#格式化与示例)

---

## 根元素与根属性

```xml
<graph>
    ...
</graph>
```

`graph` 根元素可配置以下属性：

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `type` | 图表类型，可选 `bar`、`pie`、`line`。 | `string` | `bar` |
| `stacked` | 仅用于 `bar` 图表。设为 `0` 可禁用组内条形初始堆叠。 | `string` / `int` | `1`（隐含） |
| `disable_linking` | 设为 `1` 时，点击图表不会跳转到列表视图。 | `string` / `int` | `0`（隐含） |
| `order` | 设定后，x 轴值会按给定顺序（`asc` / `desc`）依据度量排序；仅用于 `bar` 与 `pie`。 | `string` | `''` |
| `string` | 跳转到列表视图时，显示在面包屑中的标题文本。 | `string` | `''` |
| （原文此处未给出属性名） | 若当前模型无记录，可填充一组示例记录；示例数据不可交互，执行操作后会被丢弃。 | `bool` | `False` |

## `field` 元素与属性

图表视图中唯一允许的子元素是 `field`。

```xml
<graph>
    <field name="category_id"/>
    <field name="amount_total" type="measure"/>
</graph>
```

`field` 可使用以下属性：

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `name` | 视图中使用的字段名；用于分组（非聚合）时依赖该属性。 | `string` | 必填 |
| `invisible` | 若为 `true`，该字段不会出现在活动度量或可选度量中。 | `bool` | `False` |
| `type` | 设为 `measure` 时，该字段作为组内聚合值而非分组条件。 | `string` | `''` |
| `interval` | 日期/日期时间字段按间隔分组，可选 `day`、`week`、`month`、`quarter`、`year`。 | `string` | `month` |
| `string` | 仅用于 `type="measure"` 字段，覆盖字段默认显示名。 | `string` | 字段默认 `string` |
| `widget` | 指定字段格式化器。常见为 `float_time`、`monetary`。 | `string` | `''` |

> [!note]
> `type="measure"` 主要对最后一个具备该属性的字段生效；其他带 `string` 的 measure 字段可用于控制显示名称。

## 度量与限制

度量会自动从模型字段中生成，仅使用可聚合字段，并按字段显示名的字母顺序排序。

> [!warning]
> 图表视图的聚合是在数据库内容上执行的，非存储的函数字段不能在图表视图中使用。

## 格式化与示例

在图表视图中，可以通过 `field` 的 `widget` 指定格式化方式。常见格式化器包括 `float_time` 和 `monetary`。

```xml
<field name="working_hours_close" widget="float_time"/>
```
