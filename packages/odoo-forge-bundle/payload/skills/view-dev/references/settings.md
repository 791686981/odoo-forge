# 设置

> 来源：`docs/obsidian/07 知识库/odoo文档/03_开发者/03_参考/03_用户界面/02_视图架构.md`
> 原文章节：`## 设置`
>
> 本文件从原始文档中拆分而来，以下内容尽量保留原文，仅做拆分与轻量排版。

设置视图是表单视图的一种定制，它们在集中位置显示设置配置条目，内置搜索栏与侧边栏（应用导航）。

> [!example]
> ```xml
> <app string="CRM" name="crm">
>     <setting type="header" string="Foo">
>         <field name="foo" title="Foo?."/>
>         <button name="nameAction" type="object" string="Button"/>
>     </setting>
>     <block title="Title of group Bar">
>         <setting help="this is bar" documentation="/applications/technical/web/settings/this_is_a_test.html">
>             <field name="bar"/>
>         </setting>
>         <setting string="This is Big BAR" company_specific="1">
>             <field name="bar"/>
>         </setting>
>     </block>
>     <block title="Title of group Foo">
>         <setting string="Personalize setting" help="this is a full personalize setting">
>             <div>This is a different setting</div>
>         </setting>
>     </block>
> </app>
> ```

## 目录

- [设置视图简介](#设置视图简介)
- [组件](#组件)
- [`app`：声明应用程序](#app声明应用程序)
- [`block`：声明一组设置](#block声明一组设置)
- [`setting`：声明设置](#setting声明设置)

---

## 设置视图简介

设置视图继承表单视图的语义组件，但额外引入搜索/侧边栏结构，方便在单个页面中编辑多组设置。

## 组件

设置视图接受表单视图中的 `field`、`label`、`button` 元素，以及三个额外子元素：`app`、`block`、`setting`。占位符以全大写字母表示。

### `app`：声明应用程序

`app` 元素在设置视图的侧边栏中注册一个应用项，并充当搜索时的分隔符。

```xml
<form>
    <app string="NAME" name="TECHNICAL_NAME">
    ...
    </app>
</form>
```

| 属性 | 说明 | 类型 | 默认 | 备注 |
| --- | --- | --- | --- | --- |
| `string` | 应用在界面中显示的名称 | `string` | `''` | 必填 |
| `name` | 应用的技术名称（通常与模块名一致） | `string` | `''` | 必填，用于计算图标路径 |
| `icon` | 相对于模块的图标路径 | `string` | `/*name*/static/description/icon.png` | 默认使用 `name` 生成的路径 |
| `groups` | 仅对这些组可见，可用 `!` 前缀排除 | `string` | `''` | 示例：`base.group_no_one,!base.group_multi_company` |
| `invisible` | 控制是否隐藏 | `Python 表达式` | `False` | 与其他视图组件一致，支持 `True`/`False` 表达式 |

> [!note]
> `invisible` 属性既用来控制可用性（避免界面过载）也用来提前声明字段以供表达式使用。

> [!example]
> ```xml
> <field name="fname_b" invisible="fname_c != 3 and fname_a == parent.fname_d"/>
> <group invisible="fname_c != 4">
>     <field name="fname_c"/>
>     <field name="fname_d"/>
> </group>
> ```

### `block`：声明一组设置

`block` 元素将多个设置按分组组织，常用于给出标题与说明。

```xml
<form>
    <app string="NAME" name="TECHNICAL_NAME">
        ...
        <block title="TITLE">
            ...
        </block>
        ...
    </app>
</form>
```

| 属性 | 说明 | 类型 | 默认 | 备注 |
| --- | --- | --- | --- | --- |
| `title` | 分组头部显示的标题 | `string` | `''` | 可用于搜索 |
| `description` | 标题下方的描述文本 | `string` | `''` | 可用于搜索 |
| `groups` | 仅对这些组可见 | `string` | `''` | 支持 `!` 排除 |
| `invisible` | 控制是否隐藏 | `Python 表达式` | `False` | 用法同上 |

### `setting`：声明设置

`setting` 元素定义真正的设置项。第一个字段决定标签：布尔字段出现在左侧，其他字段出现在右侧顶部。若设置了 `type="header"`，该设置以横幅形式呈现，标明后续配置项的作用域（例如网站、公司）。

```xml
<form>
    <app string="NAME" name="TECHNICAL_NAME">
        <block title="TITLE">
            ...
            <setting string="SETTING_NAME">
                ...
                <field name="FIELD_NAME"/>
                ...
            </setting>
            ...
        </block>
    </app>
</form>
```

| 属性 | 说明 | 类型 | 默认 | 备注 |
| --- | --- | --- | --- | --- |
| `type` | `header` 可将设置渲染为横幅 | `string` | `''` | 其他值按常规展示 |
| `string` | 设置标签或排序参考（第一个字段的标签） | `string` | `''` | 用作标签文本 |
| `help` | 鼠标悬停提示文本 | `string` | `''` |  |
| `description` | 标签下方的描述（带 `text-muted` 样式） | `string` | `''` |  |
| `company_specific` | 若设置为 `'1'`，会在标签旁显示公司图标 | `string` | `''` |  |
| `documentation` | 点击文档图标时的路径 | `string` | `''` | 支持绝对或相对路径（相对基于 `https://www.odoo.com/documentation/<version>`） |
| `groups` | 仅对这些组可见（支持 `!` 排除） | `string` | `''` |  |
| `invisible` | 控制是否隐藏 | `Python 表达式` | `False` |  |

> [!example]
> ```xml
> <field name="FIELD_NAME" groups="base.group_no_one,!base.group_multi_company"/>
> ```
