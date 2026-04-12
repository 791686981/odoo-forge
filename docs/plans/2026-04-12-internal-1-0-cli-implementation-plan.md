# Odoo Forge Internal 1.0 CLI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 让团队成员通过 `npm i -g odoo-forge` 后，能够直接完成 FlowUS 凭据配置，并在 Codex 与 Claude Code 中安装和使用 Odoo Forge。

**Architecture:** 保持最简方案，只支持 `flowus` 这一条 MCP。CLI 负责本地配置、FlowUS wrapper、Codex wiring、Claude 本地 marketplace 安装；技能内容和平台模板通过 `odoo-forge-bundle` payload 提供。`dev` skill 只做最小去 hub 修正，不做重写。

**Tech Stack:** Node.js ESM、Node 内置 `node:test`、本地文件系统、`claude` CLI、Codex `config.toml`

---

### Task 1: 收口 1.0 资源来源

**Files:**
- Create: `scripts/sync-bundle.mjs`
- Create: `packages/odoo-forge-bundle/index.js`
- Modify: `packages/odoo-forge-bundle/package.json`

**Step 1: 写 bundle 同步测试思路**

- 明确 payload 至少必须包含：
  - `skills/`
  - `platforms/`
  - `config/product.json`

**Step 2: 实现同步脚本**

- 把仓库根目录的 `skills/`、`platforms/`、`config/product.json` 复制到 `packages/odoo-forge-bundle/payload/`
- 每次同步先清理旧 payload，再完整复制

**Step 3: 为 bundle 提供运行时入口**

- 在 `packages/odoo-forge-bundle/index.js` 导出 payload 根目录定位函数
- 让 CLI 可以稳定读取 bundle 内容，不依赖仓库相对路径

**Step 4: 验证**

Run: `node scripts/sync-bundle.mjs`
Expected: `packages/odoo-forge-bundle/payload/` 下出现同步后的目录和文件

### Task 2: 建立 CLI 配置与路径层

**Files:**
- Create: `packages/odoo-forge/src/paths.js`
- Create: `packages/odoo-forge/src/config.js`
- Create: `packages/odoo-forge/test/config.test.js`
- Modify: `packages/odoo-forge/package.json`

**Step 1: 先写失败测试**

- 覆盖：
  - 安装根目录解析
  - 配置文件路径解析
  - FlowUS token 读写

**Step 2: 跑测试确认失败**

Run: `node --test packages/odoo-forge/test/config.test.js`
Expected: 因模块不存在或函数未实现而失败

**Step 3: 实现最小配置层**

- 解析：
  - 安装目录 `~/.odoo-forge`
  - macOS / Windows / Linux 的配置路径
- 读取和写入：
  - `config.json`
  - `state.json`

**Step 4: 再跑测试**

Run: `node --test packages/odoo-forge/test/config.test.js`
Expected: 通过

### Task 3: 建立 Codex wiring

**Files:**
- Create: `packages/odoo-forge/src/codex.js`
- Create: `packages/odoo-forge/test/codex.test.js`

**Step 1: 先写失败测试**

- 覆盖：
  - 受管 `config.toml` 块插入
  - 重复安装时块更新而不重复追加
  - `~/.agents/skills/odoo-forge` 指向 `current/skills`

**Step 2: 跑测试确认失败**

Run: `node --test packages/odoo-forge/test/codex.test.js`
Expected: 因函数不存在而失败

**Step 3: 实现最小 Codex 安装**

- 用受管标记块更新 `~/.codex/config.toml`
- 写入：
  - `command = "odoo-forge"`
  - `args = ["mcp", "flowus"]`
- 创建或刷新技能目录链接

**Step 4: 再跑测试**

Run: `node --test packages/odoo-forge/test/codex.test.js`
Expected: 通过

### Task 4: 建立 Claude 安装器

**Files:**
- Create: `packages/odoo-forge/src/claude.js`
- Create: `packages/odoo-forge/test/claude.test.js`

**Step 1: 先写失败测试**

- 覆盖：
  - 本地 marketplace 目录生成
  - marketplace 名称固定
  - plugin 目录包含 `.claude-plugin/plugin.json`、`.mcp.json`、`skills/`
  - 安装命令序列正确

**Step 2: 跑测试确认失败**

Run: `node --test packages/odoo-forge/test/claude.test.js`
Expected: 因实现缺失而失败

**Step 3: 实现最小 Claude 安装**

- 在 Odoo Forge 安装目录中生成本地 marketplace
- marketplace 只包含一个插件：`odoo-forge`
- 调用：
  - `claude plugin marketplace add <local-marketplace-dir>`
  - `claude plugin install odoo-forge@odoo-forge-marketplace --scope user`
- 更新时调用：
  - `claude plugin marketplace update odoo-forge-marketplace`
  - `claude plugin update odoo-forge@odoo-forge-marketplace --scope user`

**Step 4: 再跑测试**

Run: `node --test packages/odoo-forge/test/claude.test.js`
Expected: 通过

### Task 5: 实现 CLI 命令

**Files:**
- Modify: `packages/odoo-forge/src/index.js`
- Create: `packages/odoo-forge/test/cli.test.js`

**Step 1: 先写失败测试**

- 覆盖：
  - `install`
  - `update`
  - `doctor`
  - `login flowus`
  - `mcp flowus`

**Step 2: 跑测试确认失败**

Run: `node --test packages/odoo-forge/test/cli.test.js`
Expected: 失败

**Step 3: 实现命令**

- `install`
  - 优先读取现有配置
  - 支持 `ODOO_FORGE_FLOWUS_TOKEN`
  - 缺失时交互式提示
  - 安装 bundle runtime
  - 配置 Codex
  - 配置 Claude
- `update`
  - 复用现有 token
  - 刷新 runtime 和平台 wiring
- `doctor`
  - 检查配置、state、runtime、Codex block、Claude marketplace
- `login flowus`
  - 单独写入或覆盖 token
- `mcp flowus`
  - 读取 token
  - 启动 `npx -y flowus-mcp-server@latest`

**Step 4: 再跑测试**

Run: `node --test packages/odoo-forge/test/*.test.js`
Expected: 全通过

### Task 6: 收口平台模板与文档

**Files:**
- Modify: `platforms/claude/mcp.template.json`
- Modify: `platforms/claude/plugin.template.json`
- Modify: `platforms/codex/mcp.template.json`
- Modify: `docs/install.md`
- Modify: `docs/architecture.md`
- Modify: `README.md`
- Modify: `skills/dev/SKILL.md`

**Step 1: 模板收口**

- 去掉 `firecrawl`
- 统一只保留 `flowus`
- 模板不再直连第三方 MCP，而是统一走 `odoo-forge mcp flowus`

**Step 2: 文档收口**

- 安装文档改成最简 1.0 口径
- 架构文档明确“只支持 flowus”
- README 从脚手架口径改成“内部可用版 1.0”

**Step 3: `dev` 最小修正**

- 去掉旧调度口径
- 明确直接读取 FlowUS 的 `PRD / TRD / UAT`
- 明确结果写回 `DEV-PLAN`

### Task 7: 最终验证

**Files:**
- Verify only

**Step 1: 跑 bundle 同步**

Run: `node scripts/sync-bundle.mjs`
Expected: payload 已刷新

**Step 2: 跑 CLI 测试**

Run: `npm test --workspace odoo-forge`
Expected: 测试通过

**Step 3: 跑 doctor**

Run: `npm run doctor`
Expected: 输出本地状态与配置检查结果

**Step 4: 手工 smoke**

- 用环境变量设置 token 跑一次：
  - `ODOO_FORGE_FLOWUS_TOKEN=demo npm --workspace odoo-forge run start -- install`
- 检查：
  - 本地配置是否生成
  - Codex `config.toml` 是否有 Odoo Forge 受管块
  - Odoo Forge 安装目录是否生成 Claude marketplace

