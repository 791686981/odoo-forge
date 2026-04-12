# QWeb 模板

> 来源：`https://docs.odoo.sbggai.top/developer/reference/frontend/qweb.html`
>
> 本文件按原始 QWeb 模板参考拆分，对照二级/三级标题还原全部章节，尽量保留原文示例与提示，只做排版优化。

QWeb 是 Odoo 主要采用的 XML 模板引擎，模板规则通过 `t-` 前缀属性表达行为，`<t>` 元素用于执行指令但本身不渲染 DOM。

## 目录

- [输出](#输出)
- [条件语句](#条件语句)
- [循环](#循环)
- [循环变量速查](#循环变量速查)
- [属性指令](#属性指令)
- [设置变量](#设置变量)
- [调用子模板](#调用子模板)
- [高级输出](#高级输出)
- [已弃用的输出指令](#已弃用的输出指令)
- [Python 相关指令](#python-相关指令)
- [调试](#调试)
- [缓存](#缓存)
- [辅助工具](#辅助工具)
- [API](#api)
- [JavaScript 专用指令](#javascript-专用指令)
- [旧的继承机制（已弃用）](#旧的继承机制已弃用)

---

## 输出

`<t t-out="expr"/>` 会对结果做 HTML 转义，防止[XSS](https://en.wikipedia.org/wiki/Cross-site_scripting)攻击：

```xml
<p><t t-out="value"/></p>
```

当 `value=42` 时渲染 `<p>42</p>`；需要原样输出请参见“高级输出”。

## 条件语句

`<t t-if="expr">` 只在表达式为真时渲染，任何元素都能承载该属性：

```xml
<div>
    <t t-if="condition">
        <p>ok</p>
    </t>
</div>
```

`<p t-if="condition">` 与上述等效，链式条件使用 `t-elif`/`t-else`：

```xml
<div>
    <p t-if="user.birthday == today()">Happy birthday!</p>
    <p t-elif="user.login == 'root'">Welcome master!</p>
    <p t-else="">Welcome!</p>
</div>
```

## 循环

`<t t-foreach="sequence" t-as="item">` 迭代数组、映射或整数区间（整数形式即 `[0,1,...n-1]`，但这种写法已弃用）：

```xml
<t t-foreach="[1, 2, 3]" t-as="i">
    <p><t t-out="i"/></p>
</t>
```

可以赋予任何元素该属性：

```xml
<p t-foreach="[1, 2, 3]" t-as="i">
    <t t-out="i"/>
</p>
```

### 循环变量速查

| 变量 | 说明 | 可用范围 |
| --- | --- | --- |
| `$as` | 等于 `t-as` 指定名称 | 当前 `foreach` |
| `$as_all` | 被迭代对象（数组或映射） | 当前 `foreach` |
| `$as_value` | 当前值（映射则为 value） | 当前 `foreach` |
| `$as_index` | 当前索引（从 0 起） | 当前 `foreach` |
| `$as_size` | 集合长度（若可用） | 当前 `foreach` |
| `$as_first` | 是否首项 | 当前 `foreach` |
| `$as_last` | 是否末项 | 当前 `foreach` |
| `$as_parity` | `"even"` / `"odd"` | 当前 `foreach` |
| `$as_even` | 布尔，索引是否偶数 | 当前 `foreach` |
| `$as_odd` | 布尔，索引是否奇数 | 当前 `foreach` |

其中 `$as` 会被 `t-as` 指定的名字替换，例如 `t-as="item"` 时，对应变量会变成 `item_index`、`item_value` 等。

这些变量仅在 `foreach` 作用域内有效；若同名变量在循环外已经存在，则循环结束后会把最终值复制回外部上下文，新建变量则不会泄漏到作用域外。

## 属性指令

通过 `t-att` 系列指令动态设置属性：

| 指令 | 描述 |
| --- | --- |
| `t-att-$name` | 求值后赋值给名为 `$name` 的属性，例如 `<div t-att-a="42"/>` → `<div a="42">`。 |
| `t-attf-$name` | 以格式化字符串生成属性值，支持 `{{...}}`（Jinja）或 `#{...}`（Ruby）。可用于类的切换。 |
| `t-att=mapping` | 传入字典，映射中的所有键值都转换为属性。 |
| `t-att=pair` | 传入 `[name, value]` 或 tuple，生成单个属性。 |

```xml
<t t-foreach="[1, 2, 3]" t-as="item">
    <li t-attf-class="row {{ (item_index % 2 === 0) ? 'even' : 'odd' }}">
        <t t-out="item"/>
    </li>
</t>
```

> [!tip]
> 格式化字符串支持 `{{code}}` 与 `#{code}` 两种语法。

## 设置变量

`<t t-set="name" t-value="expr"/>` 定义变量；若未传 `t-value`，则节点主体渲染结果即变量值：

```xml
<t t-set="foo" t-value="2 + 1"/>
<t t-out="foo"/>
```

```xml
<t t-set="foo">
    <li>ok</li>
</t>
<t t-out="foo"/>
```

变量在 `t-set` 作用域外仍保留。

## 调用子模板

`<t t-call="template_name"/>` 在当前上下文中渲染指定模板：

```xml
<t t-call="other-template"/>
```

上下文包括父层变量。可以在 `t-call` 内设置值，调用体可在被调用模板中通过特殊变量 `0` 访问：

```xml
<t t-call="other-template">
    <t t-set="var" t-value="1"/>
</t>
```

调用体示例输出：

```xml
<div>
    This template was called with content:
    <t t-out="0"/>
</div>
```

## 高级输出

默认 `t-out` 会自动转义；若想绕过可使用安全标记或 `markupsafe.Markup`。

### Python

下列 API 输出默认不再转义：

- `odoo.fields.Html` 字段
- `html_escape()` / `markupsafe.escape()`（同义，安全）
- `html_sanitize()`
- `markupsafe.Markup`（*警告*：它表明你认定内容安全，但不会验证，因此谨慎使用）
- `to_text()`（不会回收安全标志）

> [!warning]
> `markupsafe.Markup` 是断言内容安全的类型，但并不自动校验，需要谨慎。

### 强制双重转义

若内容已被标记为安全但仍需转义，可调用 `str(content)`（Python）或 `String(content)`（JavaScript）剥离安全标志：

> [!note]
> `Markup` 比 `Markup()` 更丰富，字符串拼接在 Python 中会产生带安全标记的 `Markup`，而在 JavaScript 中则可能生成普通 `String`，从而泄露未转义内容。

### 已弃用的输出指令

| 指令 | 说明 |
| --- | --- |
| `esc` | `out` 的别名，功能相同但语义模糊。 |
| `raw` | 不转义内容；15.0 版后下架，建议用 `out` + `markupsafe.Markup`。 |
| `t-raw` | 已弃用，输出原始 HTML 带来高风险。 |

## Python 相关指令

| 指令 / 能力 | 说明 |
| --- | --- |
| `t-field` | 仅在“智能记录”（`browse` 返回）上可用，自动格式化字段，并集成网站富文本。 |
| `t-options` | 常与 `t-field` 或 `widget` 配合使用；参数取决于具体字段或 widget。 |
| 资产包相关指令 | 用于组织与注入模块资源（样式、脚本等）。 |

## 调试

| 指令 | 说明 |
| --- | --- |
| `t-debug` | 在渲染期间触发调试器断点（调试器激活时生效）。 |
| `t-log` | 求值并 `console.log` 当前表达式（JavaScript QWeb）。 |
| `t-js` | 在节点内执行 JavaScript，通常接收 `ctx` 参数访问当前上下文。 |

`t-js` 示例：

```xml
<t t-set="foo" t-value="42"/>
<t t-js="ctx">
    console.log("Foo is", ctx.foo);
</t>
```

## 缓存

`t-cache` / `t-nocache` 用于控制局部渲染缓存。

### `t-cache`

`<div t-cache="expr">` 会缓存被标记区域的渲染结果，子指令通常只在首次渲染时执行。适用于依赖少量数据、且命中率高的片段。

缓存键表达式应谨慎设计（例如记录 ID、`write_date` 等），以便数据更新时能自动失效。

### `t-nocache`

`<div t-nocache="">` 强制该节点每次重新渲染。该区域只能访问根上下文（控制器提供），不能访问局部 `t-set`。

### `t-nocache-*`

在 `t-cache` 区域内，`t-set` / `t-foreach` 拥有独立作用域，可能与外部同名变量产生差异。若内部再嵌套 `t-cache`，每段都有独立缓存键。

可以用 `t-nocache-*="expr"` 缓存“动态值槽位”：

```xml
<section t-cache="records">
    <article t-foreach="records" t-as="record">
        <footer t-nocache="dynamic part" t-nocache-cached_value="record.qty">
            <span t-out="counter + cached_value"/>
        </footer>
    </article>
</section>
```

示例说明：`t-cache` 缓存主体片段，`t-nocache` 保留动态输出。

## 辅助工具

| 工具 / API | 说明 |
| --- | --- |
| `http.request.render('template', values)` | 在控制器内渲染模板并返回 `Response`；自动注入 `request`、`debug` 等上下文。 |
| `ir.qweb._render()` | 通过 ID/外部 ID 渲染数据库模板，支持 `_prepare_environment` 设置默认上下文。 |
| `request` / `debug` / `quote_plus` / `json` / `time` / `datetime` / `keep_query` | 常见上下文变量或工具。 |
| `load(ref)()` | 将 XML 文档或节点加载为模板。 |

## API

| API / 对象 | 说明 |
| --- | --- |
| `core.qweb.render(template, context)` | 直接渲染模块模板。 |
| QWeb 实例 API | 提供加载、解析、编译等能力。 |
| `QWeb2.Engine()` | 作为“模板命名空间”，支持自定义前缀、调试模式、jQuery、文本翻译函数等，也暴露 `request` / `debug` / `json` 等常用值。 |

## JavaScript 专用指令

### 定义模板

`<t t-name="template-name">` 必须放在 `<templates>` 的顶层：

```xml
<templates>
    <t t-name="template-name">
        ...
    </t>
</templates>
```

### 模板继承

- `t-inherit`：父模板名称
- `t-inherit-mode`：`primary`（创建新子模板）或 `extension`（就地修改）
- `t-name`（可选）：主模式下作为新模板名称；扩展模式下作为注释辅助查找

更改通过 XPath 指令完成（参见 [XPath](https://developer.mozilla.org/en-US/docs/Web/XPath) 文档）。示例 `t-inherit` / `t-inherit-mode`：

```xml
<t t-name="child.template" t-inherit="base.template" t-inherit-mode="primary">
    <xpath expr="//ul" position="inside">
        <li>new element</li>
    </xpath>
</t>
```

就地扩展：

```xml
<t t-inherit="base.template" t-inherit-mode="extension">
    <xpath expr="//tr[1]" position="after">
        <tr><td>new cell</td></tr>
    </xpath>
</t>
```

## 旧的继承机制（已弃用）

`<t t-extend="base.template">` 配合 `t-jquery`/`t-operation` 操作节点：

| `t-operation` | 作用 |
| --- | --- |
| `append` | 在上下文节点末尾添加 |
| `prepend` | 插入到上下文节点之前 |
| `before` | 插入到上下文节点前 |
| `after` | 插入到上下文节点后 |
| `inner` | 替换上下文子节点 |
| `replace` | 替换上下文节点 |

`attributes` 操作将文本设为属性值；`t-jquery` 默认将模板主体当作 JavaScript 在上下文节点执行，`this` 指向节点。

> [!warning]
> 尽管强大，旧机制难调试，建议优先采用 `t-inherit`/`t-inherit-mode`。
