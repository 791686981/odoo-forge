# Odoo Forge Architecture

## Goal

Turn the repository into a productized monorepo that supports:

- one source of truth for skills
- one npm install and update entrypoint
- installing and updating without cloning the repo on user machines

## Source of Truth

`skills/` remains the only authoritative content source.
No generated payload directory should contain its own long-lived editable copy of the same skill content.

## Package Split

- `packages/odoo-forge/`: CLI package
- `packages/odoo-forge-bundle/`: generated bundle package

The CLI stays intentionally small.
The bundle contains the install-time payload copied into the shared local skills directory.

## Runtime Model

The intended runtime model is:

1. users install and update through `npm`
2. skills are copied into `~/.agents/skills`
3. users configure their own Notion MCP directly in Codex or Claude
4. Odoo Forge focuses only on skill content and packaging

## Install And Update Model

The intended install and update flow is:

1. install `odoo-forge` from `npm`
2. run `odoo-forge install`
3. copy skills into the shared agents directory

Implemented commands for internal 1.0:

```text
odoo-forge install
odoo-forge update
odoo-forge doctor
```

## Local Install Model

The intended local installation layout is:

```text
~/.agents/
└── skills/
```

## Scope Boundary

Internal 1.0 deliberately does not include:

- MCP provider installation or token management
- rollback orchestration
- per-platform wiring templates
