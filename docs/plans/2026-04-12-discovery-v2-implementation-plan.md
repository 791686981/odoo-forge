# Discovery V2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a new `discovery-v2` skill as a sibling to the existing `discovery` skill without modifying or deleting the old version.

**Architecture:** Keep the old `skills/discovery/` intact and introduce a new `skills/discovery-v2/` directory. The new skill will be stateless, document-driven, support both new-domain and incremental-revision modes, and use the shared Markdown `待确认事项` document instead of round/state management.

**Tech Stack:** Markdown skill instructions, bundled Markdown references, YAML agent metadata, shared SVG assets.

---

### Task 1: Create the new skill scaffold

**Files:**
- Create: `skills/discovery-v2/SKILL.md`
- Create: `skills/discovery-v2/references/question-dimensions.md`
- Create: `skills/discovery-v2/references/output-template.md`
- Create: `skills/discovery-v2/agents/openai.yaml`
- Copy: `skills/discovery/assets/icon-small.svg` -> `skills/discovery-v2/assets/icon-small.svg`
- Copy: `skills/discovery/assets/icon-large.svg` -> `skills/discovery-v2/assets/icon-large.svg`

**Step 1: Define the skill boundary**

Write the new skill as a domain-level business co-authoring skill, not a hub-managed interview workflow.

**Step 2: Add the bundled references**

Split deep guidance into `references/` so `SKILL.md` stays focused on workflow and guardrails.

**Step 3: Add agent metadata**

Point the new agent YAML at the copied skill icons so the new skill can coexist with the old one cleanly.

### Task 2: Write the core workflow

**Files:**
- Modify: `skills/discovery-v2/SKILL.md`
- Modify: `skills/discovery-v2/references/question-dimensions.md`
- Modify: `skills/discovery-v2/references/output-template.md`

**Step 1: Encode two runtime modes**

Document how the skill distinguishes between:

- new mode: first-time domain discovery
- incremental mode: read current BRD, understand confirmed consensus, then add/update/remove precisely

**Step 2: Encode the co-authoring loop**

Document the required sequence:

1. read upstream docs
2. summarize current understanding and gaps
3. pick one block to push forward
4. discuss deeply
5. write back only confirmed content
6. route unresolved items into the shared `待确认事项`

**Step 3: Preserve deep research quality**

Rewrite the dimension reference so each dimension explains:

- what the dimension is for
- when it counts as “deep enough”
- what red flags indicate the user has only given a surface request
- what must be written into the BRD

### Task 3: Validate the new skill package

**Files:**
- Verify: `skills/discovery-v2/`

**Step 1: Check the directory structure**

Run file listing commands to ensure the new directory contains the expected scaffold and references.

**Step 2: Spot-check the new instructions**

Read back the new `SKILL.md` and references to ensure the final version reflects:

- no hub dependency
- no round management
- two runtime modes
- shared `待确认事项`
- deep business-only discovery

**Step 3: Keep the old version untouched**

Verify that `skills/discovery/` remains unchanged so the user can compare both versions before deciding whether to replace the old one later.
