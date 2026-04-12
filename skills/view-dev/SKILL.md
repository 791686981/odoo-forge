---
name: view-dev
description: 当需要查阅 Odoo 视图开发文档、判断应读取哪些 Odoo UI/视图参考文件，或基于参考文档回答 XML 视图、继承视图、动作、字段部件、搜索、看板/列表/表单布局及相关 ORM 或安全规则问题时使用。
---

# Odoo View Development

## 定位

这是一个面向 Odoo 视图开发的文档导览库。

`SKILL.md` 只负责回答三件事：

1. 这次问题应该先查哪几本文档。
2. 每本文档主要覆盖什么主题。
3. 多个主题交叉时，应该按什么顺序组合阅读。

具体规范不写在这里，统一放在 `references/` 各本书里。那些书以原始文档为主，只做拆分、归类和轻量排版，不主动压缩成摘要。

## 导览规则

1. 先判定问题类型，再决定读哪几本书，不要上来就把所有文档一起加载。
2. 先读“机制书”，再读“具体视图书”；先读“主归属文档”，再读补充文档。
3. 用户要完整规范时，优先指向整本书；不要用 `SKILL.md` 代替原始 reference。
4. 一个事实尽量只在一本文档里作为主归属出现；本页只做索引和分流，不重复重写规则。
5. 如果问题跨多个主题，优先按本页“常见阅读路径”选 2 到 4 本书组合阅读。

## 如何使用这个 Skill

- 先在“书目总表”里判断主题归属。
- 再在“常见阅读路径”里判断阅读顺序。
- 最后只打开当前问题真正需要的 `references/*.md`。

## 快速判断

| 如果你要查…… | 先看这些 |
| --- | --- |
| 继承视图、`xpath`、`position`、主视图/扩展视图 | `view-records.md` |
| 按钮跳转、弹窗、`context`、`domain`、`target` | `actions.md` |
| `readonly`、`invisible`、`required`、`parent`、`uid` | `python-expressions.md` |
| 字段 widget、状态条、标签、多对多 tags、图片 | `field-widgets.md` |
| form/list/search/kanban/calendar/gantt 等具体视图 | 对应具体视图书 |
| 权限、`groups`、记录规则、字段可见性 | `security.md` |
| chatter、followers、activity、消息线程 | `mail-thread.md` |
| 模型字段、记录集、上下文、ORM 语义 | `orm-api.md` |
| QWeb 指令、模板语法、QWeb 视图 | `qweb-templates.md`、`qweb.md` |

## 书目总表

### 基础机制

| 文件 | 主要讲什么 | 什么时候读 | 主要来源 |
| --- | --- | --- | --- |
| `references/view-records.md` | `ir.ui.view` 记录结构、`inherit_id`、`mode`、`priority`、`xpath`、`position`、视图解析 | 只要涉及继承视图、`xpath`、为什么 patch 不生效、主视图/扩展视图关系 | `03_用户界面/01_视图记录.md` |
| `references/actions.md` | `ir.actions.act_window`、`target`、`views`、`domain`、`context`、绑定动作、服务端动作等 | 按钮跳转、打开表单/列表、弹窗、默认搜索条件、上下文注入 | `01_服务器框架/03_操作.md` |
| `references/orm-api.md` | 模型、字段、记录集、环境、上下文、常见 ORM 方法、继承扩展 | 视图字段背后的模型语义、字段类型、`context`、`domain`、默认值、`group_by` 来源 | `01_服务器框架/01_ORM API/00_ORM API.md` |
| `references/security.md` | 访问权限、记录规则、字段访问、安全陷阱 | `groups`、字段是否能看见、按钮是否该给、为什么前端可见但后端报权限错误 | `01_服务器框架/06_Odoo 中的安全性.md` |
| `references/field-widgets.md` | 视图字段部件、view widget、常见 widget 的支持字段类型和选项 | 查 `statusbar`、`many2many_tags`、`image`、`priority`、`statinfo`、`mail_activity` 等部件 | `02_Web框架/10_JavaScript 参考.md` 中的 `## 视图`、`## 字段` |
| `references/qweb-templates.md` | QWeb 模板语法与模板机制 | 看板模板、QWeb 视图、模板指令本身怎么写 | `02_Web框架/12_QWeb 模板.md` |
| `references/mail-thread.md` | `mail.thread`、chatter、activity、小组件与消息功能接入 | form 里要加聊天区、活动区、关注者、消息线程时 | `01_服务器框架/10_混入类和实用类.md` 中的 `## 消息功能` |
| `references/ui-icons.md` | UI 图标参考 | 按钮 `icon`、界面图标查找 | `03_用户界面/04_UI 图标.md` |

### 视图架构总则

| 文件 | 主要讲什么 | 什么时候读 | 主要来源 |
| --- | --- | --- | --- |
| `references/common-architecture.md` | 视图架构的总体规则、RNG 约束、上下文和权限会怎样影响视图行为 | 不确定某条规则属于哪种视图、要先建立总框架时 | `03_用户界面/02_视图架构.md` 的 `## 通用架构` |
| `references/python-expressions.md` | `readonly`、`required`、`invisible`、`domain`、`context`、`parent`、`uid`、`today`、`now` | 动态显示、动态只读、关系字段过滤、表达式报错、`column_invisible` 之类问题 | `03_用户界面/02_视图架构.md` 的 `## Python 表达式` |

### 具体视图

| 文件 | 主要讲什么 | 什么时候读 | 主要来源 |
| --- | --- | --- | --- |
| `references/form.md` | form 视图完整架构，含 `field`、`label`、`button`、`group`、`sheet`、`notebook`、`header`、`footer` 等 | 新建 form、改 form 布局、改表单按钮区、查 `button_box` / `oe_title` / chatter 放法 | `03_用户界面/02_视图架构.md` 的 `## 表单` |
| `references/settings.md` | settings 视图中的 `app`、`block`、`setting` | 写系统设置页、配置页 | `03_用户界面/02_视图架构.md` 的 `## 设置` |
| `references/list.md` | list 视图完整架构，含根属性、列、按钮、`groupby`、`header`、`control/create` | 列表列定义、内联编辑、分组头、批量动作、x2many 行创建 | `03_用户界面/02_视图架构.md` 的 `## 列表` |
| `references/search.md` | search 视图、`field`、`filter`、`separator`、`group`、`searchpanel`、默认搜索值 | 搜索栏、筛选器、默认搜索、搜索面板、group by | `03_用户界面/02_视图架构.md` 的 `## 搜索` |
| `references/kanban.md` | kanban 根属性、`templates`、卡片字段、按钮链接、`header`、`progressbar` | 看板卡片结构、拖拽、快速创建、列头进度条 | `03_用户界面/02_视图架构.md` 的 `## 看板` |
| `references/qweb.md` | qweb-as-view 基础规则 | qweb 视图、控制面板按钮提取、qweb 渲染上下文 | `03_用户界面/02_视图架构.md` 的 `## QWeb` |
| `references/graph.md` | 图表视图 | 图表聚合、条形图、饼图、折线图 | `03_用户界面/02_视图架构.md` 的 `## 图表` |
| `references/pivot.md` | 透视表视图 | 透视分析、度量与维度 | `03_用户界面/02_视图架构.md` 的 `## 透视表` |
| `references/calendar.md` | 日历视图 | 事件类模型、日历展示 | `03_用户界面/02_视图架构.md` 的 `## 日历` |
| `references/activity.md` | 活动视图 | 活动流、活动看板 | `03_用户界面/02_视图架构.md` 的 `## 活动` |
| `references/cohort.md` | 队列 / cohort 视图 | 留存、转化、分期分析类场景 | `03_用户界面/02_视图架构.md` 的 `## 队列` |
| `references/grid.md` | 网格视图 | 数值网格、可编辑单元格 | `03_用户界面/02_视图架构.md` 的 `## 网格` |
| `references/gantt.md` | 甘特图视图 | 排程、时间轴规划 | `03_用户界面/02_视图架构.md` 的 `## 甘特图` |
| `references/map.md` | 地图视图 | 地理位置与路线展示 | `03_用户界面/02_视图架构.md` 的 `## 映射` |

## 常见阅读路径

### 新建 Form

按这个顺序读：

1. `references/view-records.md`
2. `references/common-architecture.md`
3. `references/python-expressions.md`
4. `references/form.md`
5. `references/field-widgets.md`
6. `references/actions.md`
7. `references/orm-api.md`
8. `references/security.md`

如果涉及 chatter / activity，再补：

9. `references/mail-thread.md`

### 改 Inherited Form

按这个顺序读：

1. `references/view-records.md`
2. `references/form.md`
3. `references/python-expressions.md`
4. `references/field-widgets.md`
5. `references/actions.md`
6. `references/security.md`

### 查 Widget

按这个顺序读：

1. `references/field-widgets.md`
2. 对应具体视图书，例如 `references/form.md`、`references/list.md`、`references/kanban.md`
3. 如果是 QWeb 模板中的字段或结构，再补 `references/qweb-templates.md`
4. 如果 widget 依赖消息功能，再补 `references/mail-thread.md`

### 查按钮 / Action / Context

按这个顺序读：

1. 对应具体视图书
2. `references/actions.md`
3. `references/python-expressions.md`
4. `references/security.md`
5. 必要时补 `references/orm-api.md`

### 查权限 / Groups / 安全

按这个顺序读：

1. `references/security.md`
2. `references/view-records.md`
3. `references/python-expressions.md`
4. 对应具体视图书

### 查 Search / 默认筛选 / Group By

按这个顺序读：

1. `references/search.md`
2. `references/actions.md`
3. `references/python-expressions.md`
4. 必要时补 `references/orm-api.md`

## 回答原则

- 如果用户问“这个怎么写”，先指出应读哪几本书，再基于那些书回答。
- 如果用户问“完整规范”，优先引导读取整本 reference，不把整本书压成几句摘要。
- 如果用户问“为什么不生效”，优先联查 `view-records`、`actions`、`security`、`orm-api` 与对应具体视图书。
- 如果用户只是要找文档，本页应先完成“分流”和“选书”，不要提前复述过多细节。

## 目录说明

- `references/`：完整书册
- `assets/`：后续可放 XPath 模板、XML 片段、示意图
- `scripts/`：后续可放视图定位、章节索引、文档校验脚本
