# Odoo Forge Architecture

## Goal

Turn the repository into a productized monorepo that supports:

- one source of truth for skills
- one npm install and update entrypoint
- Claude Code and Codex from the same repository
- installing and updating without cloning the repo on user machines

## Source of Truth

`skills/` remains the only authoritative content source.
No platform-specific directory should contain its own long-lived copy of the same skill content.

## Platform Split

- `platforms/claude/` stores Claude Code plugin templates
- `platforms/codex/` stores Codex plugin templates

These directories only contain template metadata and platform wiring.
Installable payloads are generated into `packages/odoo-forge-bundle/`.

## Package Split

- `packages/odoo-forge/`: CLI package
- `packages/odoo-forge-bundle/`: generated bundle package

The CLI should stay relatively stable.
The bundle contains the install-time payload copied into local Odoo Forge runtime directories.

## MCP Runtime Model

The intended runtime model is:

1. users install and update through `npm`
2. skills are copied into `~/.agents/skills/odoo-forge`
3. Codex gets a managed `flowus` block in `~/.codex/config.toml`
4. Claude gets `mcpServers.flowus` in `~/.claude.json`
5. both platforms launch FlowUS directly with `npx -y flowus-mcp-server@latest`

Credentials still must never be committed into repository files or npm templates.
Each user writes their own token locally during `install` or `login flowus`.

## Install And Update Model

The intended install and update flow is:

1. install `odoo-forge` from `npm`
2. run `odoo-forge install`
3. if required credentials are missing, prompt the user interactively
4. copy skills into the shared agents directory
5. generate or refresh Claude Code and Codex MCP wiring

Implemented commands for internal 1.0:

```text
odoo-forge install
odoo-forge update
odoo-forge doctor
odoo-forge login flowus
odoo-forge mcp flowus
```

## Platform Wiring Model

Internal 1.0 uses direct MCP wiring per platform:

- Codex:
  - append a managed `flowus` block to `~/.codex/config.toml`
  - include `FLOWUS_TOKEN` directly in the managed block
- Claude Code:
  - write `mcpServers.flowus` into `~/.claude.json`
  - include `FLOWUS_TOKEN` directly in that object

## Local Install Model

The intended local installation layout is:

```text
~/.agents/
└── skills/
    └── odoo-forge/

~/.codex/
└── config.toml

~/.claude.json
```

## Scope Boundary

Internal 1.0 deliberately does not include:

- multiple MCP providers
- encrypted local config storage
- rollback orchestration
- Claude plugin marketplace flows
