# Document Information

Document: README.md
Project: DROPi Tycoon
Version: 1.1.0
Status: Active
Author: Marian Caliof
Language: English
Last Updated: 2026-09-05

---

# Owner Directives

## Purpose

This directory is the permanent, authoritative location for high-level strategic directives issued directly by the Project Owner of DROPi Tycoon.

Owner Directives document official strategic decisions, architectural directions, universe design choices, business model decisions, and other high-level intentions that originate from the Project Owner.

---

## Authority and Scope

- **Owner Directives are authoritative strategic inputs.** They represent the Project Owner's official intentions and decisions.
- **Owner Directives are not automatically canonical documentation.** A directive does not become part of the canonical documentation set simply by existing in this directory.
- **Integration requires a dedicated task.** The contents of an Owner Directive must be integrated into canonical documents (BIBLE files, architecture documents, universe guides, game design documents, etc.) only through a dedicated audit and canonical integration task, never silently or automatically.

---

## Rules for AI Agents

AI agents working on this repository **must** follow these rules regarding Owner Directives:

1. **Inspect this directory before proposing major changes.** Before proposing or implementing changes to architecture, universe design, business model, logistics, economy, marketplace, runtime, or documentation structure, AI agents must check this directory for relevant directives.

2. **Never silently ignore an Owner Directive.** If a relevant directive exists, its contents must be acknowledged and considered.

3. **Never copy an Owner Directive wholesale into canonical documents.** Directives are inputs, not final outputs. Integration must be deliberate, audited, and attributed.

4. **Identify the correct canonical owner for every concept.** Before integrating any concept from a directive, the agent must determine which canonical document should own that concept (e.g., BIBLE, GDD, Architecture Guide, Economy Document).

5. **Report conflicts, never silently resolve them.** If a directive conflicts with an existing canonical document, the conflict must be surfaced and reported. It must never be silently overwritten or merged without explicit Project Owner review.

6. **Superseded directives must remain historically traceable.** Even if a later directive supersedes an earlier one, the earlier directive must remain in this directory. Historical traceability is required.

---

## Naming Convention

All Owner Directives in this directory must follow this naming convention:

```
YYYY-MM-DD_MASTER_OWNER_DIRECTIVE_NNN_<optional-short-title>.md
```

**Examples:**
- `2026-07-16_MASTER_OWNER_DIRECTIVE_001.md`
- `2026-08-01_MASTER_OWNER_DIRECTIVE_002_Universe_Expansion.md`

The date prefix ensures chronological ordering and historical traceability.

---

## Index of Directives

| File | Date | Status | Summary |
|------|------|--------|---------|
| [2026-07-16_MASTER_OWNER_DIRECTIVE_001.md](./2026-07-16_MASTER_OWNER_DIRECTIVE_001.md) | 2026-07-16 | Draft – Project Owner Decisions | Master directive for canonical architecture, universe design, documentation structure, web-first continuity, and cross-project alignment. |
| [2026-09-05_MASTER_OWNER_DIRECTIVE_002_Product_Identity_and_Visible_Operations.md](./2026-09-05_MASTER_OWNER_DIRECTIVE_002_Product_Identity_and_Visible_Operations.md) | 2026-09-05 | Owner Approved — Canonical Integration Required by Domain | Approved DROPi Tycoon identity, use of existing brand assets, visible multimodal progression, drone/operator separation, visible employee activity, DronePort interior direction, audio requirement, and future shared-token direction. |

---

## Integration Workflow

When an Owner Directive is ready to be integrated into canonical documentation:

1. Open a dedicated canonical integration task referencing the directive by its file name.
2. Identify every concept in the directive and its target canonical document.
3. Audit for conflicts with existing canonical documents and report them.
4. Integrate concept-by-concept with explicit attribution to the source directive.
5. Update the index table above to reflect the directive's integration status.

Do not integrate directive content outside of this workflow.
