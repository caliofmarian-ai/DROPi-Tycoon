# Document Information

Document: DOCUMENT_INDEX.md
Project: DROPi Tycoon
Version: 1.5.0
Status: Documentation Control
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-05

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
game-web/
```

The canonical mobile platform architecture defines a future managed `game-mobile/` application-shell root. It must be added to this filesystem map when the directory is materially created by the Android application foundation implementation.

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

- `06_Technical/ARCHITECTURE.md` — canonical global technical architecture.
- `06_Technical/MOBILE_APPLICATION_PLATFORM.md` — canonical installed-mobile runtime, Android application-shell, Railway role, camera/viewport, owner-review, and AI continuity specification.
- `06_Technical/SAVE_SYSTEM.md` — canonical in-game Save & Load specification.
- `06_Technical/SAFE_SYSTEM.md` — development/project safety and stability governance.
- `06_Technical/TDD.md`

Note: `MOBILE_APPLICATION_PLATFORM.md` owns the mobile application/platform boundary; `SAVE_SYSTEM.md` owns save semantics; `SAFE_SYSTEM.md` owns development/project safety. These responsibilities remain separate.

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

### Managed implementation-preparation documentation directory

- `09_Development/Implementation_Preparation/` — non-authoritative implementation preparation package for Prototype v0.1.

**Purpose:** Transforms approved canonical documentation into a dependency-ordered, agent-executable implementation plan. Allows future implementation agents to begin without inventing architecture, gameplay behavior, variable names, or scope.

**Ownership:** Created and maintained by AI agents under Project Owner governance. The Project Owner decides when updates are required.

**Discoverability policy:** The package is discoverable as a managed directory. Individual preparation files within it are not individually enumerated in this index.

**Relationship to canonical docs:** This package is **non-authoritative**. It does not override, replace, or supplement any canonical document. If any conflict exists between a preparation file and a canonical document, the canonical document governs. Preparation content is expected to be canonically traceable and must be revalidated whenever corrected or materially updated.

**Maintenance expectations:** Point-in-time preparation artifact. If canonical documents are updated materially during implementation, affected sections of this package should be reviewed and updated. The Project Owner decides when such updates are required.

**Non-authoritative rule:** No content in this directory constitutes a canonical gameplay, architecture, scope, or design decision unless explicitly confirmed by the Project Owner and recorded in the appropriate canonical document.

---

### Managed planning documentation directory

- `09_Development/Planning/` — canonical planning package for milestone, epic, batch, and issue architecture.

**Purpose:** Defines the complete project roadmap planning architecture including milestones, epics, roadmap batches, GitHub issues, dependency graphs, label taxonomy, and GitHub creation plan.

**Ownership:** Created and maintained by AI agents under Project Owner governance. This directory is the authoritative source for planning structure, complete through Phases 0–9.

**Contents (stable enumerated documents):**

- `09_Development/Planning/MILESTONE_ARCHITECTURE.md` — 21 milestones (M-001 through M-021)
- `09_Development/Planning/EPIC_CATALOG.md` — 46 epics (E-001 through E-046)
- `09_Development/Planning/BATCH_ARCHITECTURE.md` — 54 roadmap batches (RBATCH-001 through RBATCH-054)
- `09_Development/Planning/ISSUE_CATALOG.md` — 34 executable issues and 32 planning placeholders
- `09_Development/Planning/DEPENDENCY_GRAPH.md` — acyclic dependency graphs for milestones, epics, and batches
- `09_Development/Planning/LABEL_TAXONOMY.md` — GitHub label taxonomy (122 labels)
- `09_Development/Planning/GITHUB_CREATION_PLAN.md` — GitHub creation instructions
- `09_Development/Planning/github_creation_plan.yaml` — machine-readable GitHub creation plan

**Authority note:** The planning documents in this directory are planning-canonical. They do not override the gameplay canonical documents (`00_Project/ROADMAP.md`, `01_GameDesign/`, `02_Economy/`, etc.). Conflicts between planning scope and gameplay canonical documents must be escalated to the Project Owner.

---

### Managed engine-migration documentation directory

- `09_Development/Engine_Migration/` — migration and deployment documentation for the code-based web runtime.

Stable documents:

- `09_Development/Engine_Migration/ENVIRONMENT_VARIABLES.md`
- `09_Development/Engine_Migration/FUTURE_SERVER_AUTHORITATIVE_ARCHITECTURE_PREPARATION.md`
- `09_Development/Engine_Migration/WEB_RUNTIME_MIGRATION_MILESTONE_001.md`

Authority note:

- `WEB_RUNTIME_MIGRATION_MILESTONE_001.md` documents the historical/deployable web-runtime migration milestone and does not override the current mobile-first platform canon.
- `ENVIRONMENT_VARIABLES.md` documents the active web-runtime configuration contract where that runtime remains deployed.
- `FUTURE_SERVER_AUTHORITATIVE_ARCHITECTURE_PREPARATION.md` is explicitly non-canonical preparation content and does not activate backend scope.
- Current primary-runtime authority is `00_Project/VISION.md`, `06_Technical/ARCHITECTURE.md`, and `06_Technical/MOBILE_APPLICATION_PLATFORM.md`.

---

### Managed Owner Directives directory

- `09_Development/Owner_Directives/` — permanent authoritative location for high-level strategic directives issued directly by the Project Owner.

**Nature of Owner Directives:**

- Owner Directives are authoritative strategic inputs issued by the Project Owner.
- They are **not** automatically canonical documentation. A directive does not become canonical simply by existing in this directory.
- They require dedicated canonical integration tasks before their contents enter the canonical documentation set.
- AI agents **must** inspect this directory before proposing major architectural changes, universe design modifications, business model decisions, or documentation restructuring. See `09_Development/AI_AGENT_EXECUTION_PROTOCOL.md` for the mandatory inspection rule.

**Governance source:** `09_Development/Owner_Directives/README.md`.

Individual Owner Directives are not individually enumerated in this index. The `README.md` within the directory maintains the index of directives.

---

# Planned Future Documentation Architecture

This section registers architecture concepts that are approved in principle but have not yet been fully implemented, reorganized, or created. Registering a concept here does not create any document or directory, and does not transfer or create canonical ownership.

---

## Universe Design Domain

**Status:** Approved emerging domain — awaiting dedicated architecture and ownership audit.

Universe Design is an approved documentation domain of DROPi Tycoon. It is positioned immediately below Project Vision in the design hierarchy:

```
Project Vision
→ Universe Design
→ Business Design
→ Logistics Design
→ Game Design
→ UX Design
→ Technical Design
→ Implementation
→ Verification
→ Historical Reporting
```

Universe Design defines the persistent world and ecosystem. Game Design defines player interaction with that world.

A dedicated architecture and ownership audit is required before Universe Design documents are created or canonical documents are reorganized to reflect this domain.

See `00_Project/VISION.md` for the canonical description of the Universe Design domain.

---

## BIBLE-Level Canonical Documentation

**Status:** Approved future architecture — no BIBLE files exist yet.

The project approves the future use of domain-specific canonical BIBLE documents. BIBLE documents would serve as definitive authoritative references for major design domains (e.g., `WORLD_SIMULATION_BIBLE.md`, `LOGISTICS_BIBLE.md`, `ECONOMY_BIBLE.md`).

No BIBLE files have been created. No BIBLE files should be created without completing the mandatory preparation process.

**BIBLE creation requires all of the following in order:**

1. Complete canonical audit of the target domain;
2. Ownership mapping — identifying all existing documents that touch the domain;
3. Overlap detection — identifying content that would need to move;
4. Contradiction analysis — surfacing any conflicts between existing documents;
5. Migration proposal — describing the full document change;
6. Explicit Project Owner approval.

A BIBLE must not duplicate an existing canonical owner. An approved BIBLE becomes the authoritative single source of truth for its domain; all other documents referencing that domain must defer to it.

---

## External DROPi Canonical Reference Package

**Status:** Planned — package not yet uploaded.

An external reference package named `DROPi_Canonical_Reference.zip` is expected to be provided in the future. The package has not been uploaded. It does not exist in the repository.

**Policy — do not invent or create a placeholder for this package.**

When the real package is uploaded, the following policies govern its treatment:

- The real DROPi repository remains canonical for the real-world DROPi platform.
- DROPi Tycoon remains canonical for its simulation and gameplay adaptation.
- The package is treated as a read-only reference snapshot only.
- Package contents do not automatically become Tycoon canon.
- Package contents must not blindly overwrite Tycoon documentation.
- A dedicated cross-project alignment audit is required before any content is integrated.

**Cross-project alignment audit process (mandatory after upload):**

1. Manifest inspection;
2. Source commit verification;
3. Complete document inventory;
4. Terminology mapping;
5. Architecture mapping;
6. Overlap analysis;
7. Contradiction analysis;
8. Gameplay adaptation analysis;
9. Project Owner approval;
10. Integration into the correct Tycoon canonical owners only.

**Recommended future repository location for external reference snapshots:**

`09_Development/External_References/`

This directory does not exist yet and must not be created until the actual package is ready for upload.

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

# game-web/

## Purpose

Managed root directory containing the active Vite + TypeScript + Phaser game runtime and the secondary Railway/browser deployment surface.

Current state:

- Active authoritative Phaser game/runtime implementation for the current prototype
- Contains the production web server, frontend source, test files, and runtime assets required for Railway/browser preview and smoke validation
- Intended to be hosted/consumed by the mobile application shell rather than duplicated in a second gameplay implementation
- Browser/Railway presentation is secondary to the installed mobile experience under the current platform canon
- Historical GDevelop source remains separately preserved in `Game/`

See `06_Technical/MOBILE_APPLICATION_PLATFORM.md` for the mobile application ownership boundary and intended future `game-mobile/` root.

---

# Information Ownership Rules

- Strategic project/game vision is owned by `00_Project/VISION.md`.
- Gameplay design authority is owned by `01_GameDesign/`.
- Economy, logistics, world, in-game AI, technical, UI, and asset domains are owned by their respective numbered folders.
- Mobile application/runtime platform ownership is defined by `06_Technical/MOBILE_APPLICATION_PLATFORM.md` within the Technical domain.
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