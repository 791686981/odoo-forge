# 直接安装到 .agents 的极简安装模型设计

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把 Odoo Forge 内部 1.0 的安装模型改成“技能直装到 `~/.agents/skills`，Codex 和 Claude 都直接写 FlowUS MCP”，去掉运行时目录和 Claude 插件依赖。

**Architecture:** CLI 不再维护 `~/.odoo-forge` 运行时，也不再生成 Claude marketplace。安装时直接把 bundle 里的 `skills/` 复制到 `~/.agents/skills/odoo-forge`，然后分别更新 `~/.codex/config.toml` 和 `~/.claude.json` 中的 `flowus` 配置。`login flowus` 也复用同一套写入逻辑。

**Tech Stack:** Node.js、`node:test`、本地 JSON/TOML 文本写入

---

### Task 1: 重定安装目标与配置入口

**Files:**
- Modify: `packages/odoo-forge/src/paths.js`
- Modify: `packages/odoo-forge/src/codex.js`
- Modify: `packages/odoo-forge/src/claude.js`
- Test: `packages/odoo-forge/test/config.test.js`
- Test: `packages/odoo-forge/test/codex.test.js`
- Test: `packages/odoo-forge/test/claude.test.js`

### Task 2: 改写 install / update / login / doctor 逻辑

**Files:**
- Modify: `packages/odoo-forge/src/index.js`
- Test: `packages/odoo-forge/test/cli.test.js`

### Task 3: 更新文档口径

**Files:**
- Modify: `README.md`
- Modify: `docs/install.md`
- Modify: `docs/architecture.md`
- Modify: `docs/release.md`

### Task 4: 验证

**Files:**
- Run: `npm test --workspace odoo-forge`
- Run: `npm run release:check`
