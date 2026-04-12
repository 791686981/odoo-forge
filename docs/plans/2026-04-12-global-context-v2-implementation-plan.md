# Global Context V2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a new `global-context-v2` skill as a sibling to the existing `global-context` skill without modifying or deleting the old version.

**Architecture:** Keep the old `skills/global-context/` intact and introduce a new `skills/global-context-v2/` directory. The new skill will be stateless, document-driven, bind directly to FlowUS `产品设计 -> 全局资源`, and write unresolved project-level questions into the `待确认事项` page under `全局资源`.

**Tech Stack:** Markdown skill instructions, bundled Markdown references, YAML agent metadata, shared SVG assets.

---

### Task 1: Create the new skill scaffold

**Files:**
- Create: `skills/global-context-v2/SKILL.md`
- Create: `skills/global-context-v2/references/document-specs.md`
- Create: `skills/global-context-v2/agents/openai.yaml`
- Copy: `skills/global-context/assets/icon-small.svg` -> `skills/global-context-v2/assets/icon-small.svg`
- Copy: `skills/global-context/assets/icon-large.svg` -> `skills/global-context-v2/assets/icon-large.svg`

**Step 1: Define the new boundary**

Write the new skill as a FlowUS-driven project context co-authoring skill, not a hub-managed document builder.

**Step 2: Keep heavy guidance in references**

Move page-level depth expectations and prompting hints into `references/document-specs.md` so `SKILL.md` stays focused on workflow and guardrails.

**Step 3: Add agent metadata**

Point the new agent YAML at the copied icons so the new version can coexist with the old one cleanly.

### Task 2: Encode the new workflow

**Files:**
- Modify: `skills/global-context-v2/SKILL.md`
- Modify: `skills/global-context-v2/references/document-specs.md`

**Step 1: Bind the skill to the real FlowUS tree**

Document that the skill always starts from `产品设计`, then enters `全局资源`, and creates missing project-level pages there when needed.

**Step 2: Encode three runtime modes**

Document how the skill distinguishes between:

- initial build: first-time setup of project-level context
- incremental maintenance: add or revise one page precisely
- health check: inspect completeness and freshness without rewriting everything

**Step 3: Keep unresolved issues lightweight**

Document that unresolved project-level issues live in the FlowUS page `全局资源/待确认事项`, using checkbox items, instead of hub state or local Markdown.

### Task 3: Align with shared repo rules

**Files:**
- Modify: `docs/skill-writing-guidelines.md`
- Verify: `skills/global-context-v2/`

**Step 1: Add the global-context exception**

Clarify that the shared `待确认事项` convention uses the current scope root:

- `global-context` uses `全局资源`
- domain-oriented skills use the current business domain root

**Step 2: Spot-check the final package**

Read back the new skill and the shared rules to ensure they agree on:

- final docs live in FlowUS
- no hub dependency
- no round management
- FlowUS-first page lookup
- lightweight unresolved-question handling
