# Odoo Forge

Odoo Forge is a productized monorepo for our Odoo-focused agent skills.

## Workspace Layout

- `skills/`: single source of truth for all skills, references, assets, and helper scripts
- `platforms/`: platform-specific plugin templates for Claude Code and Codex
- `packages/odoo-forge/`: npm CLI package used for install, update, doctor, login, and MCP wrapper launch
- `packages/odoo-forge-bundle/`: bundle package that carries install payloads for skills and platform wiring
- `shared/`: shared assets, hook snippets, MCP snippets, and templates
- `docs/`: product docs plus design and implementation plans

## Key Docs

- `docs/architecture.md`: monorepo architecture and MCP runtime model
- `docs/install.md`: install, token configuration, update, and doctor workflow
- `docs/release.md`: npm publish order, release checks, and smoke checklist
- `docs/skill-writing-guidelines.md`: team-wide rules for writing stateless, doc-driven, co-authoring skills

## Current Phase

This repository is being finalized as the internal 1.0 release of Odoo Forge.
The current target is a minimal, team-usable release:

- install from `npm`
- install skills directly into `~/.agents/skills`
- write FlowUS MCP directly into Codex and Claude local config
- update with a single command without cloning the repository
- release the bundle and CLI with a documented npm flow
