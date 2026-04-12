# Solution V2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a new `solution-v2` skill as a sibling to the existing `solution` skill without modifying or deleting the old version.

**Architecture:** Keep the old `skills/solution/` intact and introduce a new `skills/solution-v2/` directory. The new skill will preserve the old solution structure, but replace `hub`-era mechanics with direct FlowUS page lookup, a “research plan first” kickoff, and problem-driven subagent usage.

**Tech Stack:** Markdown skill instructions, bundled Markdown references, YAML agent metadata, shared SVG assets.

---

### Task 1: Create the new skill scaffold

**Files:**
- Create: `skills/solution-v2/SKILL.md`
- Create: `skills/solution-v2/references/output-template.md`
- Create: `skills/solution-v2/references/modeling-guide.md`
- Create: `skills/solution-v2/agents/openai.yaml`
- Copy: `skills/solution/assets/icon-small.svg` -> `skills/solution-v2/assets/icon-small.svg`
- Copy: `skills/solution/assets/icon-large.svg` -> `skills/solution-v2/assets/icon-large.svg`

**Step 1: Preserve the old shape**

Keep the old strengths: overall blueprint first, then demand mapping, then GAP analysis.

**Step 2: Split heavy reference**

Move the old embedded output structure into `references/output-template.md` so `SKILL.md` focuses on workflow and guardrails.

**Step 3: Reuse modeling guidance**

Carry over the existing business-layer modeling guidance so the new skill keeps the same strong modeling backbone.

### Task 2: Replace hub-era mechanics

**Files:**
- Modify: `skills/solution-v2/SKILL.md`

**Step 1: Bind to FlowUS directly**

Document that the skill starts from `产品设计`, reads `全局资源`, then enters the target domain root and uses `BRD`, `Solution`, and `待确认事项` there.

**Step 2: Add a research-plan kickoff**

Require the skill to output a short “本轮方案研究计划” before running research and drafting an initial solution.

**Step 3: Use subagents by question, not by ritual**

Make `odoo18-docs` the base check, then add `module-research`, `module-report`, `industry-practice`, and `company-rules` only when the current uncertainty justifies them.

### Task 3: Align with the new document system

**Files:**
- Verify: `skills/solution-v2/`

**Step 1: Use the new document names**

The domain-level solution document is `Solution`, not `方案设计`.

**Step 2: Use domain-root pending items**

Unresolved solution issues go to the current domain root page `待确认事项`, not to a hub return payload.

**Step 3: Preserve stable mapping IDs**

Keep stable `GAP-*` numbering across incremental updates so downstream docs can reference them reliably.
