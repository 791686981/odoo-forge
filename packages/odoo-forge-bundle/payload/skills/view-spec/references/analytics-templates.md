# 分析视图规格模板（Pivot / Graph / Calendar）

这几种视图结构简单，**不需要 ASCII 线框图**，用文字描述 + 字段表即可。

---

## Pivot 视图（透视表）

### 什么时候用

管理员/分析师需要多维度交叉统计时。典型场景：按设备×月份统计维修费用、按客户×产品统计销售额。

### 输出格式

```markdown
### Pivot 视图

**默认布局：**
- 行：{分组字段}（如设备、客户）
- 列：{时间字段}:month（如报修日期按月）
- 度量：{数值字段}（如维修总费用、数量）

**度量字段**

| 度量 | 字段 | 聚合 | 说明 |
|------|------|------|------|
| 维修总费用 | total_cost | sum | 默认显示 |
| 工单数 | __count | count | — |

**分组维度**

| 维度 | 字段 | 用法 |
|------|------|------|
| 设备 | equipment_id | 行分组 |
| 故障类别 | category | 行分组 |
| 报修日期 | date_reported | 列分组（按月/季/年） |
| 维修负责人 | assigned_to | 行分组 |
```

### 关键属性

| 属性 | 说明 | 示例 |
|------|------|------|
| `default_order` | 默认排序 | `total_cost desc` |
| `disable_linking` | 禁止点击单元格跳转到明细 | `disable_linking="True"` |
| `display_quantity` | 显示数量列 | `display_quantity="True"` |
| 字段 `type="measure"` | 标记为度量 | 数值类字段 |
| 字段 `type="row"` | 默认行分组 | 维度字段 |
| 字段 `type="col"` | 默认列分组 | 通常是时间字段 |

---

## Graph 视图（图表）

### 什么时候用

需要可视化趋势、分布、占比时。典型场景：维修数量月度趋势折线图、故障类别分布饼图。

### 图表类型

| 类型 | 属性值 | 适用场景 |
|------|--------|---------|
| 柱状图 | `type="bar"` | 分类对比（默认） |
| 折线图 | `type="line"` | 时间趋势 |
| 饼图 | `type="pie"` | 占比分布 |

### 输出格式

```markdown
### Graph 视图

**默认图表：** 柱状图

**字段配置**

| 字段 | 角色 | 说明 |
|------|------|------|
| date_reported | X 轴（按月分组） | 时间维度 |
| total_cost | Y 轴（度量，sum） | 费用汇总 |
| category | 分组（颜色区分） | 按故障类别分色 |

**推荐图表组合：**
- 柱状图：按月统计维修费用（X=月份，Y=费用，分色=故障类别）
- 饼图：故障类别占比
- 折线图：月度维修数量趋势
```

### 关键属性

| 属性 | 说明 |
|------|------|
| `type` | bar / line / pie |
| `stacked` | 堆叠模式（仅 bar/line），`stacked="True"` |
| `cumulative` | 累计模式（仅 line），`cumulative="True"` |
| `order` | 排序，如 `order="desc"` |
| 字段 `type="row"` | X 轴 / 分组维度 |
| 字段 `type="measure"` | Y 轴 / 度量 |

---

## Calendar 视图（日历）

### 什么时候用

记录有日期/时间维度，需要在日历上查看排期时。典型场景：计划维修日期排期、服务预约日历。

### 输出格式

```markdown
### Calendar 视图

**日期字段：** date_scheduled（计划维修日期）
**结束日期：**（无，单日事件）
**卡片标题：** title（报修标题）
**颜色分组：** assigned_to（按维修负责人分色）

**卡片显示字段**

| 字段 | 说明 |
|------|------|
| title | 显示为事件标题 |
| equipment_id | 副标题 |
| assigned_to | 颜色区分 |
| priority | 显示在卡片上 |
```

### 关键属性

| 属性 | 说明 | 示例 |
|------|------|------|
| `date_start` | 开始日期/时间字段 | `date_start="date_scheduled"` |
| `date_stop` | 结束日期/时间字段（可选） | `date_stop="date_end"` |
| `date_delay` | 持续时长（小时，替代 date_stop） | `date_delay="duration"` |
| `color` | 颜色分组字段 | `color="assigned_to"` |
| `mode` | 默认视图模式 | `month` / `week` / `day` |
| `event_open_popup` | 点击事件弹窗编辑 | `event_open_popup="True"` |
| `quick_create` | 点击空白区域快速创建 | `quick_create="True"` |
| `all_day` | 全天事件字段 | `all_day="is_all_day"` |

---

## 与 Form/List/Search 的配合

分析视图通常不独立存在，而是作为现有 action 的附加视图模式：

```markdown
### 菜单 Action 视图模式

| 菜单项 | 视图模式 |
|--------|---------|
| 全部工单 | list, kanban, form, pivot, graph |
| 维修排期 | calendar, list, form |
```

用户在页面右上角通过视图切换图标切换。不需要为 Pivot/Graph/Calendar 单独创建菜单。

### 共用 Search 视图

Pivot/Graph/Calendar 共用同一个 Search 视图的筛选器和分组。设计 Search 时要考虑分析视图的需求：
- 时间筛选（本月/本季度/本年）对 Pivot/Graph 很重要
- 分组维度要跟 Pivot 的行/列分组一致
