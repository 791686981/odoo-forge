# Odoo Forge Release Readiness Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 Odoo Forge internal 1.0 补齐 npm 发版前的最小发布材料、检查脚本和人工冒烟清单。

**Architecture:** 保持最简范围，不新增功能面。只补发版说明、工作区级打包检查命令，以及 Windows 人工冒烟步骤，让 `odoo-forge-bundle` 与 `odoo-forge` 的发布顺序和验证动作清楚可执行。

**Tech Stack:** npm workspaces、`npm pack`、Markdown 文档

---

### Task 1: 增加发布检查脚本

**Files:**
- Modify: `package.json`

**Step 1: 补工作区级脚本**

- 增加：
  - `pack:bundle`
  - `pack:cli`
  - `release:check`

**Step 2: 约束脚本行为**

- `release:check` 至少覆盖：
  - bundle 同步
  - CLI 测试
  - bundle 打包
  - CLI 打包

### Task 2: 编写发布指南

**Files:**
- Create: `docs/release.md`
- Modify: `README.md`

**Step 1: 固定发版顺序**

- 先发 `odoo-forge-bundle`
- 再发 `odoo-forge`

**Step 2: 写清本地检查与发版动作**

- 登录 npm
- 运行 `npm run release:check`
- 发布两个包
- 做安装回归

**Step 3: 写清 Windows 人工冒烟**

- 重点覆盖：
  - `odoo-forge install`
  - `odoo-forge doctor`
  - Codex 配置生成
  - Claude 插件安装

### Task 3: 最终验证

**Files:**
- Verify only

**Step 1: 跑发布检查脚本**

Run: `npm run release:check`
Expected: 测试和两个 `npm pack` 都通过

**Step 2: 回读发布文档**

Run: `sed -n '1,220p' docs/release.md`
Expected: 发版顺序、命令、Windows 冒烟清单都清楚
