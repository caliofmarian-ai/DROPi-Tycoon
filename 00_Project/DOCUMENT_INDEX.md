# Document Information

Document: DOCUMENT_INDEX.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Documentation Control
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-13

---

# Documentation Index

## Purpose

This document is the canonical documentation map for DROPi-Tycoon.

It defines:

- every stable live Markdown document that must be individually discoverable;
- every managed root-level directory that must be represented;
- directory-policy treatment for dynamic, historical, or generated areas.

---

## Indexing Policy

1. Stable live Markdown documents are listed individually.
2. Managed root-level directories are always represented, even when placeholder-only.
3. Dynamic/high-churn historical streams are represented at directory-policy level when appropriate.
4. Generated internals and build artifacts are not individually enumerated here.
5. Document discoverability in this index does not change canonical ownership of content.

---

# Project Structure

```
DROPi-Tycoon/

README.md
00_Project/
01_GameDesign/
02_Economy/
03_Logistics/
04_World/
05_AI/
06_Technical/
07_UI/
08_Assets/
09_Development/
Game/
Builds/
```

---

# Root Files

- `README.md` — repository entry point and external-facing project summary.

---

# 00_Project

## Purpose

Project identity, governance, intake, status, and documentation control.

Documents:

- `00_Project/README.md`
- `00_Project/VISION.md` — canonical project/game vision owner.
- `00_Project/PROJECT_STATUS.md`
- `00_Project/ROADMAP.md`
- `00_Project/PROJECT_INTAKE_PROTOCOL.md`
- `00_Project/DOCUMENT_INDEX.md`
- `00_Project/PROJECT_CONSISTENCY_REPORT_TEMPLATE.md` — template document.
- `00_Project/INITIAL_REPOSITORY_AUDIT.md` — stable historical audit document.

---

# 01_GameDesign

## Purpose

High-level game design, gameplay structure, progression, and mission definitions.

Documents:

- `01_GameDesign/GDD.md`
- `01_GameDesign/GAMEPLAY.md`
- `01_GameDesign/MISSIONS.md`
- `01_GameDesign/PROGRESSION.md`

Note: `00_Project/VISION.md` owns canonical project/game vision. `01_GameDesign/` owns gameplay design specification.

---

# 02_Economy

## Purpose

In-game economy systems.

Documents:

- `02_Economy/ECONOMY.md`
- `02_Economy/MARKET.md`
- `02_Economy/PRICING.md`

---

# 03_Logistics

## Purpose

Delivery and logistics gameplay systems.

Documents:

- `03_Logistics/LOGISTICS.md`
- `03_Logistics/ORDERS.md`
- `03_Logistics/ROUTING.md`
- `03_Logistics/VEHICLES.md`
- `03_Logistics/DRONES.md`
- `03_Logistics/DRONEPORTS.md`

---

# 04_World

## Purpose

World simulation, map, and environment definitions.

Documents:

- `04_World/WORLD.md`
- `04_World/MAP.md`
- `04_World/BUILDINGS.md`
- `04_World/NPC.md`
- `04_World/WEATHER.md`

---

# 05_AI

## Purpose

In-game artificial intelligence systems.

Documents:

- `05_AI/AI_SYSTEM.md`
- `05_AI/AI_AGENTS.md`

Important: this folder defines in-game AI, not AI-assisted development workflow.

---

# 06_Technical

## Purpose

Technical architecture and implementation governance.

Documents:

- `06_Technical/ARCHITECTURE.md`
- `06_Technical/SAVE_SYSTEM.md` — canonical in-game Save & Load specification.
- `06_Technical/SAFE_SYSTEM.md` — development/project safety and stability governance.
- `06_Technical/TDD.md`

Note: `SAVE_SYSTEM.md` and `SAFE_SYSTEM.md` have distinct responsibilities and remain separate.

---

# 07_UI

## Purpose

Player interface and user experience definitions.

Documents:

- `07_UI/UI.md`
- `07_UI/UX.md`

---

# 08_Assets

## Purpose

Asset standards and resource governance.

Documents:

- `08_Assets/ASSETS.md`

---

# 09_Development

## Purpose

Development process, workflow, planning, implementation support, and reporting governance.

Stable top-level documents:

- `09_Development/AI_AGENT_EXECUTION_PROTOCOL.md`
- `09_Development/AI_DEVELOPMENT_WORKFLOW.md`
- `09_Development/AI_PROJECT_GENERATION_PLAN.md`
- `09_Development/AI_REPORTING_PROTOCOL.md`
- `09_Development/ASSET_IMPORT_GUIDE.md`
- `09_Development/CHANGELOG.md`
- `09_Development/CORE_GAMEPLAY_SYSTEMS.md`
- `09_Development/DEVELOPMENT_WORKFLOW.md`
- `09_Development/FIRST_MAP_DESIGN.md`
- `09_Development/FIRST_PLAYABLE_EXPERIENCE.md`
- `09_Development/GAMEPLAY_EVENTS_FLOW.md`
- `09_Development/GAME_BALANCING_RULES.md`
- `09_Development/GAME_DATA_STRUCTURE.md`
- `09_Development/GDEVELOP_PROJECT_STRUCTURE.md`
- `09_Development/GITHUB_WORKFLOW.md`
- `09_Development/IDEAS.md`
- `09_Development/MOBILE_UI_CONTROLS.md`
- `09_Development/PROTOTYPE_BUILD_PIPELINE.md`
- `09_Development/PROTOTYPE_GENERATION_PACKAGE.md`
- `09_Development/PROTOTYPE_MILESTONES.md`
- `09_Development/PROTOTYPE_RELEASE_CHECKLIST.md`
- `09_Development/PROTOTYPE_TECH_STACK.md`
- `09_Development/PROTOTYPE_TESTING_PLAN.md`
- `09_Development/PROTOTYPE_V0.1.md`
- `09_Development/TASKS.md`

### Managed historical report directory

- `09_Development/AI_Reports/` — historical AI task report stream.
- Governance source: `09_Development/AI_REPORTING_PROTOCOL.md`.
- Individual AI reports are not enumerated in this index.
- Latest report sequence values are not stored in this index.

---

# Game/

## Purpose

Managed root directory for live editable game project/source files.

Current state:

- Placeholder-only (`Game/.gitkeep`).
- Internal/generated game project internals are not individually indexed here.

---

# Builds/

## Purpose

Managed root directory for generated/exported game build outputs.

Current state:

- Placeholder-only (`Builds/.gitkeep`).
- Generated build artifacts are not individually indexed here.

---

# Information Ownership Rules

- Strategic project/game vision is owned by `00_Project/VISION.md`.
- Gameplay design authority is owned by `01_GameDesign/`.
- Economy, logistics, world, in-game AI, technical, UI, and asset domains are owned by their respective numbered folders.
- Development process/governance is owned by `09_Development/`.
- Historical AI reports in `09_Development/AI_Reports/` are non-canonical records unless a canonical document is explicitly updated.

---

# Document Authority Hierarchy

This section records the global document authority hierarchy approved by the Project Owner to resolve audit finding F-27. It governs how conflicts between documents are resolved across the entire repository.

## Approved Five-Level Hierarchy

**Level 1 — Project Vision Authority**
`00_Project/VISION.md` — project identity and non-negotiable vision constraints.

**Level 2 — Global Gameplay Design Authority**
`01_GameDesign/GDD.md` — global gameplay design rules.

**Level 3 — Canonical System / Domain Authority**
Canonical system/domain documents in:
- `02_Economy/`
- `03_Logistics/`
- `04_World/`
- `05_AI/`
- `06_Technical/`
- `07_UI/`

These documents own domain-specific rules within their respective domains.

**Level 4 — Prototype Scope Authority**
`09_Development/PROTOTYPE_V0.1.md` — Prototype v0.1 scope constraints.

**Level 5 — Implementation Specification Authority**
`09_Development/` implementation specifications — documents describing how the approved canonical design and prototype scope are implemented.

## Conflict-Resolution Rules

The following rules apply when documents at different authority levels appear to conflict:

1. **Detail, specialization, and narrowing:** Lower-priority documents may detail, specialize, or narrow higher-priority rules within their legitimate scope. This is permitted and does not constitute a contradiction.
2. **No contradiction of higher-priority documents:** Lower-priority documents must not contradict higher-priority documents. If a contradiction exists, the higher-priority document governs.
3. **Specificity does not override authority:** A more specific document does not automatically override a higher-priority document. Authority level takes precedence over specificity.
4. **Domain ownership remains binding:** Domain ownership still applies. A document outside a domain must not redefine that domain's canonical rules.
5. **Same-level conflict escalation:** If two canonical documents at the same authority level conflict and ownership/scope rules do not resolve the conflict, the AI agent must stop the affected change and escalate the conflict to the Project Owner.
6. **Historical AI reports never override live canonical documents:** Reports in `09_Development/AI_Reports/` are evidence and traceability records only. They never override current live canonical documents.
7. **Recency does not override authority:** A newer modification date, version number, commit order, or report sequence number alone does not override a higher-priority canonical document.
8. **Project Owner decisions are binding:** Explicit Project Owner decisions override AI interpretation. Owner decisions must be persisted into the appropriate canonical document before dependent implementation proceeds.

---

# Maintenance Rule

When files are added, removed, or moved:

1. Keep this index aligned with the real repository filesystem.
2. Individually register new stable live Markdown documents in their owning section.
3. Keep dynamic/generated/historical streams represented via directory-policy rules where applicable.
4. Do not introduce obsolete paths or folder names.

---

# Canonical Rule

Every project decision must have one clear canonical home, and this index must remain accurate, searchable, and internally consistent.

---

End of Document
