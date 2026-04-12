# Odoo Forge Install Guide

## Goal

Provide one install and update path for both Claude Code and Codex, with the same user experience on macOS and Windows.

Internal 1.0 only supports one MCP:

- `flowus`

The design goal is:

- install through `npm`
- install skills into the shared `~/.agents/skills` directory
- write personal FlowUS credentials directly into local MCP config
- keep repository and package artifacts secret-free

## Standard Install Flow

### First install

```bash
npm i -g odoo-forge
odoo-forge install
```

### Daily update

```bash
odoo-forge update
```

### Health check

```bash
odoo-forge doctor
```

## FlowUS Token Setup

Each user should enter their own FlowUS token.
Do not hardcode shared tokens into templates, manifests, or repository files.

### Recommended default: interactive

```bash
odoo-forge install
```

If `flowus.token` is missing, `odoo-forge` should prompt:

```text
FlowUS token is required.
Paste your FlowUS token:
```

### Explicit interactive setup

```bash
odoo-forge login flowus
```

### Environment-variable-based setup

macOS / bash / zsh:

```bash
ODOO_FORGE_FLOWUS_TOKEN=<TOKEN> odoo-forge install
```

Windows PowerShell:

```powershell
$env:ODOO_FORGE_FLOWUS_TOKEN="<TOKEN>"
odoo-forge install
```

## Install Behavior

`odoo-forge install` will:

1. read `ODOO_FORGE_FLOWUS_TOKEN` or `FLOWUS_TOKEN` if present
2. if the token is missing, try to reuse the current Codex or Claude MCP token
3. prompt interactively only when the token is still missing
4. copy skills into `~/.agents/skills/odoo-forge`
5. write a managed `flowus` block into `~/.codex/config.toml`
6. write `mcpServers.flowus` into `~/.claude.json`

## Local Install Paths

- skills: `~/.agents/skills/odoo-forge`
- Codex MCP: `~/.codex/config.toml`
- Claude MCP: `~/.claude.json`

## MCP Launch Strategy

Claude Code and Codex should both launch FlowUS directly through `npx`:

```json
{
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "flowus-mcp-server@latest"],
  "env": {
    "FLOWUS_TOKEN": "<user-token>"
  }
}
```

## Why This Model

This model keeps behavior consistent across macOS and Windows because:

- users learn one install flow
- users learn one update flow
- Codex and Claude both read the same MCP shape
- skills live in the shared agent directory used by the local tooling stack
- users can inspect and debug the final MCP config directly

## Implementation Notes

Internal 1.0 intentionally keeps the surface small:

- one MCP: `flowus`
- one Codex MCP block
- one Claude MCP entry
- one shared skills install directory

Later improvements can add more MCP servers and more flexible config management.
