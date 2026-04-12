# 映射

> 来源：`docs/obsidian/07 知识库/odoo文档/03_开发者/03_参考/03_用户界面/02_视图架构.md`
> 原文章节：`## 映射`
>
> 本文件从原始文档中拆分而来，以下内容尽量保留原文，仅做拆分与轻量排版。

此视图能够在地图上显示记录及其之间的路线。记录由大头针表示，也可以在与大头针关联的弹出窗口中显示模型字段。

## 目录

- [简介](#简介)
- [API](#api)
- [根元素与根属性](#根元素与根属性)
- [`field` 子元素](#field-子元素)
- [示例](#示例)

---

## 简介

> [!note]
> 应用该视图的模型应包含一个 `res.partner` 的 many2one 字段，因为定位依赖 `res.partner` 上的地址和坐标字段。

## API

该视图使用位置数据平台的 API 来获取瓦片（地图背景）、进行地理编码（将地址转换为坐标集）以及获取路线。视图实现了两个 API：OpenStreetMap 和 MapBox。默认使用 OpenStreetMap，它可以获取[瓦片](https://nominatim.org/release-docs/develop/)并进行[地理编码](https://wiki.openstreetmap.org/wiki/Tile_data_server)。此 API 不需要令牌。一旦在通用设置中提供了有效的[MapBox](https://docs.mapbox.com/api/)令牌，视图将切换到 MapBox API。此 API 更快，并允许计算路线。可以通过[注册](https://account.mapbox.com/auth/signup/)MapBox 获取令牌。

## 根元素与根属性

视图根元素是 `<map>`：

```xml
<map>
    ...
</map>
```

`<map>` 可用属性如下：

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `res_partner` | 包含 `res.partner` 的 many2one 字段。未提供时会回退为创建空地图。 | `string` | `''` |
| `default_order` | 覆盖模型默认排序。该字段必须属于当前模型，而不是 `res.partner`。 | `string` | `''` |
| `routing` | 设为 `1` 时显示记录间路线。要求有效 MapBox 令牌，且至少 2 条已定位记录。 | `bool` / `int` | `0` |
| `hide_name` | 设为 `1` 时隐藏大头针弹窗中的名称。 | `bool` / `int` | `0` |
| `hide_address` | 设为 `1` 时隐藏大头针弹窗中的地址。 | `bool` / `int` | `0` |
| `hide_title` | 设为 `1` 时隐藏标记列表标题。 | `bool` / `int` | `0` |
| `panel_title` | 标记列表标题。未提供时用 action 名称；若不在 action 中则为“项目”。 | `string` | `''` |
| `limit` | 最大获取记录数，必须为正整数。 | `int` | `80` |

## `field` 子元素

`<map>` 可包含多个 `<field>` 子元素。每个 `<field>` 都会在标记弹出窗口中渲染为一行。

`<field>` 属性如下：

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `name` | 要显示的字段名。 | `string` | 必填 |
| `string` | 显示在字段内容之前的文本，可作描述。 | `string` | 字段默认 `string` |

## 示例

```xml
<map res_partner="partner_id" default_order="date_begin" routing="1" hide_name="1">
    <field name="partner_id" string="Customer Name"/>
</map>
```
