# UI 图标

> 来源：`https://docs.odoo.sbggai.top/developer/reference/user_interface/icons.html`
> 原文章节：`## 图标`
>
> 本文件从原始文档中拆分而来，以下内容尽量保留原文，仅做拆分与轻量排版。

Odoo 的用户界面主要依赖于 [FontAwesome4 图标](https://fontawesome.com/v4/icons/)。

为了弥补 FontAwesome 在特定功能图标上的不足，我们设计了自己的图标字体。这些图标可以通过主类 `oi` 和具体的图标类结合渲染出来。

> [!example]
> ```html
> <i class="oi oi-odoo"/>
> ```
>

## 图标

| 图标类 1 | 图标类 2 | 图标类 3 | 图标类 4 |
| --- | --- | --- | --- |
| `oi-odoo` | `oi-view` | `oi-view-kanban` | `oi-view-list` |
| `oi-view-cohort` | `oi-view-pivot` | `oi-text-break` | `oi-text-inline` |
| `oi-text-wrap` | `oi-text-effect` | `oi-search` | `oi-group` |
| `oi-settings-adjust` | `oi-panel-right` | `oi-launch` | `oi-apps` |
| `oi-studio` | `oi-voip` | `oi-gif-picker` | `oi-close` |
| `oi-chevron-down` | `oi-chevron-left` | `oi-chevron-right` | `oi-chevron-up` |
| `oi-arrows-h` | `oi-arrows-v` | `oi-arrow-down-left` | `oi-arrow-down-right` |
| `oi-arrow-down` | `oi-arrow-left` | `oi-arrow-right` | `oi-arrow-up-left` |
| `oi-arrow-up-right` | `oi-arrow-up` | `oi-draggable` | `oi-archive` |
| `oi-unarchive` | `oi-smile-add` |  |  |

## RTL 适配

方向性图标具有 RTL（从右到左）适配功能，当选择 RTL 语言时，图标会旋转 180 度。

- `oi-chevron-left`
- `oi-chevron-right`
- `oi-arrow-down-left`
- `oi-arrow-down-right`
- `oi-arrow-left`
- `oi-arrow-right`
- `oi-arrow-up-left`
- `oi-arrow-up-right`
