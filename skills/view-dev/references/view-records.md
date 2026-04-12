# 视图记录

> 来源：`docs/obsidian/07 知识库/odoo文档/03_开发者/03_参考/03_用户界面/01_视图记录.md`
>
> 原文章节：`## 视图记录`

视图定义了记录应如何向最终用户展示。它们以 XML 形式指定并作为记录存储，这意味着它们可以独立于其所表示的模型进行编辑。它们非常灵活，允许对所控制的界面进行高度自定义。存在多种视图类型，每种类型代表一种可视化模式：*表单*、*列表*、*看板*等。

## 目录

- [通用结构](#通用结构)
- [视图类型](#视图类型)
- [字段](#字段)
- [继承](#继承)
- [视图解析](#视图解析)
- [继承规范](#继承规范)
- [继承位置](#继承位置)

---

## 通用结构

基本视图通常共享以下定义的通用最小结构。占位符以全大写表示。

```xml
<record id="ADDON.MODEL_view_TYPE" model="ir.ui.view">
  <field name="name">NAME</field>
  <field name="model">MODEL</field>
  <field name="arch" type="xml">
    <VIEW_TYPE>
      <views/>
    </VIEW_TYPE>
  </field>
</record>
```

## 视图类型

视图可以按要呈现的数据形式分为多种类型，包括表单、列表、搜索、看板，以及图表、透视表、日历、时间线、甘特图、网格、地图和 QWeb 模板等专门界面。

| 类型 | 描述 |
| --- | --- |
| 表单 | 显示和编辑单个记录的数据。 |
| 列表 | 查看和编辑多个记录。 |
| 搜索 | 应用过滤器并执行搜索，结果会显示在列表/看板等视图中。 |
| 看板 | 以“卡片”形式呈现记录，可配置为轻量模板。 |
| QWeb/模板 | 用于报表、网站等的模板引擎。 |
| 图表 | 可视化多个记录或记录组的聚合数据。 |
| 透视表 | 以透视表形式展示聚合信息。 |
| 日历 | 以日、周、月或年的日历表单显示事件数据。 |
| 活动/时间线 | 显示在一段时间内的变化方式，适合工作流与提醒。 |
| 甘特图 | 以甘特图形式呈现记录，强调时间轴。 |
| 网格 | 在数值单元格中显示计算信息，但几乎不可配置。 |
| 地图 | 显示记录及它们之间的路线。 |

## 字段

视图记录公开了多个字段。下面的字段名按原文章节顺序还原，以便查阅时更直观。

| 字段 | 要求 | 类型 | 描述 |
| --- | --- | --- | --- |
| `name` | 可选 | `fields.Char` | 主要作为视图名称与助记描述使用。大多数 Odoo 视图名称以模块名开头，并以视图类型结尾。 |
| `model` | 必填 | `fields.Char` | 与视图关联的模型。 |
| `arch` | 可选 | `fields.Text` | 按对应视图类型定义的布局描述。 |
| `groups_id` | 可选 | `fields.Many2many` -> `res.groups` | 控制哪些用户组可以访问当前视图；扩展视图时只有具备权限的用户组才能获得扩展内容。 |
| `priority` | 可选 | `fields.Integer` | 通过 `model` 与 `type` 请求视图时参与默认视图匹配，并决定解析期间继承应用顺序。 |
| `inherit_id` | 可选 | `fields.Many2one` | 引用要继承的父视图；请求当前视图时会先解析最近的主视图，再应用继承规范。 |
| `mode` | 可选 | `fields.Selection` | 控制当前视图是 `extension` 还是 `primary`，常用于委托继承等特殊场景。 |

> [!note]
> 当前上下文和用户访问权限也会影响视图的功能。

## 继承

继承允许在安装模块或运行时根据具体操作自定义视图。透过 `inherit_id`、`mode`、`xpath` 和 `position` 可以插入、替换或移除父视图中的节点。

```xml
<record id="ADDON.MODEL_view_TYPE" model="ir.ui.view">
    <field name="model">MODEL</field>
    <field name="inherit_id" ref="VIEW_REFERENCE"/>
    <field name="mode">MODE</field>
    <field name="arch" type="xml">
        <xpath expr="XPATH" position="POSITION">
            <CONTENT/>
        </xpath>
        <NODE ATTRIBUTES="VALUES" position="POSITION">
            <CONTENT/>
        </NODE>
    </field>
</record>
```

`inherit_id` 与 `mode` 决定了视图解析流程。`xpath` / `NODE` 元素驱动继承规范，`expr` 与 `position` 控制定位行为。

### 视图解析

解析过程可概括为：

1. 如果视图有父视图，先完全解析父视图，再应用当前视图的继承规范。
2. 如果视图没有父视图，直接使用其 `arch`。
3. 查找当前视图中 `mode="extension"` 的子视图，并按深度优先顺序依次应用它们的继承规范。

当多个视图继承同一个父视图时，`priority` 决定应用顺序，最终结果构成请求视图的 `arch`。

### 继承规范

继承规范通常包含两个部分：

1. 定位器，用于匹配父视图中的节点；
2. 内容，用于修改匹配节点。

元素定位器有三种形式：

- `xpath`，使用 `expr` 指定 [XPath](https://en.wikipedia.org/wiki/XPath) 表达式并匹配第一个节点。  
  > [!note] 其余属性会被忽略。
- `field`，匹配具备相同 `name` 的字段节点。  
  > [!note] 额外属性会被忽略。
- 其他元素，需具备相同的 `name` 与属性。  
  > [!note] `position` 与 `version` 属性在定位器中无效。

> [!example]
> ```xml
> <xpath expr="page[@name='pg']/group[@name='gp']/field" position="inside">
>     <field name="description"/>
> </xpath>
>
> <div name="name" position="replace">
>     <field name="name2"/>
> </div>
> ```

为简化 QWeb 视图中的匹配，提供了 `hasclass(*classes)`，用于在节点同时包含所有指定类时匹配。

### 继承位置

继承规范接受一个可选的 `position` 属性，默认 `inside`，用于定义匹配节点的修改方式。

- `inside`：内容被追加到匹配节点内部。  
  > [!example]
  > ```xml
  > <notebook position="inside">
  >     <page string="New feature">
  >         ...
  >     </page>
  > </notebook>
  > ```
- `after` / `before`：内容分别追加到匹配节点之后或之前。  
  > [!example]
  > ```xml
  > <xpath expr="//field[@name='x_field']" position="after">
  >     <field name="x_other_field"/>
  > </xpath>
  > ```
- `replace`：内容替换匹配节点，规范体中可用 `$0` 引用原节点副本。  
  > [!example]
  > ```xml
  > <xpath expr="//field[@name='x_field']" position="replace">
  >     <div class="wrapper">
  >         $0
  >     </div>
  > </xpath>
  > ```
- `attributes`：通过 `<attribute>` 增删节点的属性。  
  > [!example]
  > ```xml
  > <field name="x_field" position="attributes">
  >     <attribute name="invisible">True</attribute>
  >     <attribute name="class" add="mt-1 mb-1" remove="mt-2 mb-2" separator=" "/>
  > </field>
  > ```
- `move`：结合 `position` 控制节点在父结构中的位置。
