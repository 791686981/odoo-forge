# Auxiliary Skills Alignment Plan

**Goal:** Align the supporting skills used by `solution-v2` so they behave more like focused subagents and less like standalone heavy workflows.

**Scope:**
- `module-research`
- `module-report`
- `industry-practice`
- `company-rules`
- `odoo18-docs`

## Intended outcomes

1. `module-research` becomes a clean module-search skill that returns concise candidate summaries.
2. `module-report` becomes the formal module-report writer that persists reports into FlowUS `项目Wiki / 模块报告`.
3. `industry-practice` removes hub-era assumptions and better supports solution-stage industry advice.
4. `company-rules` adds explicit solution-support behavior in addition to consultation and audit.
5. `odoo18-docs` gains a clear “official capability verification” mode for solution design.

## Design choices

- Keep the existing skill names instead of adding another round of `-v2` siblings.
- Change mechanics first, not the useful domain content.
- Optimize for `solution-v2` subagent calls while preserving direct standalone usage.
- Keep search and report responsibilities clearly separated.
