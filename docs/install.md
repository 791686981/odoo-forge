# Odoo Forge Install Guide

## Goal

Provide one install and update path for Odoo Forge skills, with the same user experience on macOS and Windows.

The design goal is:

- install through `npm`
- install skills into the shared `~/.agents/skills` directory
- keep repository and package artifacts secret-free
- let each user install and configure their own Notion MCP separately

## Standard Install Flow

### First install

```bash
npm i -g odoo-forge
odoo-forge install
```

### Daily update

```bash
npm i -g odoo-forge@latest
odoo-forge update
```

### Health check

```bash
odoo-forge doctor
```

## Notion MCP

Odoo Forge no longer writes MCP config for Codex or Claude.
Each user should install and configure their own Notion MCP separately on the platform they use.

That means:

- `odoo-forge` does not ask for tokens
- `odoo-forge` does not modify `~/.codex/config.toml`
- `odoo-forge` does not modify `~/.claude.json`
- Notion MCP setup is an environment-level prerequisite, not a CLI feature

## Install Behavior

`odoo-forge install` will:

1. copy skills into `~/.agents/skills`
2. replace same-name Odoo Forge skills with the latest bundled version
3. preserve unrelated custom skills in the same directory
4. remove the old legacy namespace directory `~/.agents/skills/odoo-forge` if it exists

## Local Install Paths

- skills: `~/.agents/skills`

## Why This Model

This model keeps behavior consistent across macOS and Windows because:

- users learn one install flow
- users learn one update flow
- skills live in the shared agent directory used by the local tooling stack
- users manage their own MCP provider outside Odoo Forge

## Implementation Notes

Internal 1.0 intentionally keeps the surface small:

- one shared skills install directory
- one install/update CLI for bundled skills
- no MCP provider installation or token management

Later improvements can add richer doctor output or optional workspace checks, but MCP wiring stays out of scope.
