# Document Information

Document: DOCUMENT_INDEX.md
Project: DROPi Tycoon
Version: 2.0.0
Status: Documentation Control
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-07

---

# Documentation Index

## Purpose

This document is the canonical documentation map for DROPi Tycoon.

It defines:

- stable live Markdown documents that must be discoverable;
- managed root-level directories;
- documentation ownership and authority;
- directory-policy treatment for dynamic, historical, or generated areas.

---

# Indexing Policy

1. Stable live Markdown documents are listed individually.
2. Managed root-level directories are represented explicitly.
3. Dynamic/high-churn historical streams may be represented at directory-policy level.
4. Generated internals and build artifacts are not individually enumerated.
5. Discoverability does not change content ownership.
6. Higher-level strategic owners constrain lower-level specializations.
7. Historical reports and old planning evidence never override live canon.

---

# Repository Structure

```text
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
game-mobile/
game-web/
```

`game-mobile/` is materially present and owns the installed mobile application shell implementation.

`game-web/` contains the authoritative Phaser gameplay runtime and secondary Railway/browser deployment surface.

---

# Root Files

- `README.md` — repository entry point and external-facing project summary.

---

# 00_Project

## Purpose

Strategic design authority, project identity, governance, intake, roadmap, status, and documentation control.

## Canonical Strategic Owners

- `00_Project/VISION.md` — Level 1 Project Vision Authority.
- `00_Project/UNIVERSE_DESIGN.md` — Level 2 Universe Design Authority: persistent society/world, citizens, organizations, institutions, infrastructure, scale, world-access/fairness principles.
- `00_Project/BUSINESS_DESIGN.md` — Level 3 Business Design Authority: organizations, formation, workforce, competition, ownership/governance, founder legacy, products, business/infrastructure relationships.
- `00_Project/LOGISTICS_DESIGN.md` — Level 4 Logistics Design Authority: strategic custody, transport, multimodal flows, hubs, qualifications, infrastructure, local-to-global logistics.
- `00_Project/ROADMAP.md` — canonical strategic development order; currently uses reconciled Strategic Waves rather than the historical Phase 0–9 execution order.

## Other Stable Project Documents

- `00_Project/README.md`
- `00_Project/PROJECT_STATUS.md`
- `00_Project/PROJECT_INTAKE_PROTOCOL.md`
- `00_Project/DOCUMENT_INDEX.md`
- `00_Project/PRODUCT_EXPERIENCE_PRINCIPLES.md` — owner-approved product-experience principles.
- `00_Project/PRODUCT_EXPERIENCE_CANONICAL_ADDENDUM.md` — canonical product-experience addendum.
- `00_Project/PROJECT_CONSISTENCY_REPORT_TEMPLATE.md` — consistency-report template.
- `00_Project/INITIAL_REPOSITORY_AUDIT.md` — stable historical audit.

The Universe/Business/Logistics strategic owners were materialized only after the mandatory architecture/ownership audit recorded in `09_Development/AI_Reports/2026-09-07_103_CANONICAL_OWNERSHIP_AND_ROADMAP_AUDIT.md`.

---

# 01_GameDesign

## Purpose

Playable design: player experience, gameplay structure, progression, missions, physical HQ progression, and company-society specialization.

Documents:

- `01_GameDesign/GDD.md` — Level 5 global Game Design Authority. It defines player interaction with the Universe/Business/Logistics strategic models.
- `01_GameDesign/GAMEPLAY.md`
- `01_GameDesign/MISSIONS.md`
- `01_GameDesign/PROGRESSION.md` — canonical three-axis progression model: Personal Capability + Company Capability + World Access.
- `01_GameDesign/HQ_PROGRESSION.md` — physical HQ growth, department construction/unlock state, prerequisites, visibility gating, and persistence.
- `01_GameDesign/COMPANY_SOCIETY_AND_MULTIPLAYER.md` — gameplay specialization for player/company society, education, competition, equity/governance, founder legacy, multiplayer staging, and world-scale economic expansion.

Authority note:

- `GDD.md` cannot contradict `VISION`, `UNIVERSE_DESIGN`, `BUSINESS_DESIGN`, or `LOGISTICS_DESIGN`.
- Other Game Design documents specialize `GDD.md` and their relevant higher strategic owners.

---

# 02_Economy

## Purpose

Detailed in-game financial/economic systems.

Documents:

- `02_Economy/ECONOMY.md` — financial economy and Company Money rules.
- `02_Economy/MARKET.md`
- `02_Economy/PRICING.md`
- `02_Economy/EMPLOYEES.md` — detailed workforce/economic rules.

Authority note:

`02_Economy/*` specializes `00_Project/BUSINESS_DESIGN.md` and Game Design. It owns detailed economic calculations but does not redefine strategic company identity, universe rules, or gameplay authority.

---

# 03_Logistics

## Purpose

Detailed logistics gameplay systems.

Documents:

- `03_Logistics/LOGISTICS.md` — detailed core logistics gameplay system.
- `03_Logistics/ORDERS.md`
- `03_Logistics/ROUTING.md`
- `03_Logistics/VEHICLES.md`
- `03_Logistics/DRONES.md`
- `03_Logistics/DRONEPORTS.md`

Authority note:

`03_Logistics/*` specializes `00_Project/LOGISTICS_DESIGN.md` into detailed order, routing, vehicle, drone, DronePort, and delivery behavior.

---

# 04_World

## Purpose

Detailed world simulation, map, buildings, NPCs, environment, and weather.

Documents:

- `04_World/WORLD.md`
- `04_World/MAP.md`
- `04_World/BUILDINGS.md`
- `04_World/NPC.md`
- `04_World/WEATHER.md`

Authority note:

`04_World/*` specializes `00_Project/UNIVERSE_DESIGN.md` into concrete world/simulation rules. World documents do not override universe-level society, scale, fair-access, or low-population continuity principles.

---

# 05_AI

## Purpose

In-game artificial intelligence systems.

Documents:

- `05_AI/AI_SYSTEM.md`
- `05_AI/AI_AGENTS.md`

Important: this folder defines **in-game AI**, not AI-assisted development workflow.

AI/automation must remain constrained by Game, Business, Logistics, Economy, and Technical authority; it cannot create unexplained economic or logistics truth.

---

# 06_Technical

## Purpose

Level 7 Technical Design and implementation-governance specifications.

Documents:

- `06_Technical/ARCHITECTURE.md` — global technical architecture.
- `06_Technical/MOBILE_APPLICATION_PLATFORM.md` — installed-mobile runtime, Android application shell, Railway role, camera/viewport, owner-review, and AI continuity specification.
- `06_Technical/SAVE_SYSTEM.md` — in-game Save & Load specification.
- `06_Technical/SAFE_SYSTEM.md` — development/project safety and stability governance.
- `06_Technical/TDD.md`

Technical Design implements the approved product/game model; it does not redefine strategic gameplay merely because an implementation is easier.

`MOBILE_APPLICATION_PLATFORM.md`, `SAVE_SYSTEM.md`, and `SAFE_SYSTEM.md` retain separate ownership boundaries.

---

# 07_UI

## Purpose

Level 6 UX/UI Design and player-interface specialization.

Documents:

- `07_UI/UI.md`
- `07_UI/UX.md`
- `07_UI/VISUAL_DESIGN_SYSTEM.md` — canonical visual and interaction direction.
- `07_UI/PLAYER_SMARTPHONE.md` — canonical portable in-world smartphone surface and physical-location boundary.

UX/UI must support world-embodied gameplay rather than replace physical game systems with omniscient menus.

---

# 08_Assets

## Purpose

Asset standards, approved references, and resource governance.

Documents:

- `08_Assets/ASSETS.md`

---

# 09_Development

## Purpose

Implementation process, workflow, planning support, verification, reporting, and historical evidence.

## Stable Top-Level Documents

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

---

## Managed Historical Report Directory

- `09_Development/AI_Reports/` — historical AI task/audit/report stream.
- Governance source: `09_Development/AI_REPORTING_PROTOCOL.md`.
- Individual reports are not enumerated in this index.
- Reports are evidence, not live canonical authority.

---

## Managed Implementation-Preparation Directory

- `09_Development/Implementation_Preparation/` — non-authoritative implementation-preparation package.

Purpose:

Transforms approved canon into executable implementation guidance.

Rules:

- does not override canonical design;
- must be revalidated after material canonical changes;
- outdated preparation is historical guidance, not authority;
- Project Owner governance remains binding.

---

## Managed Planning Directory

- `09_Development/Planning/` — planning-canonical milestone/epic/batch/issue architecture.

Stable planning documents:

- `09_Development/Planning/MILESTONE_ARCHITECTURE.md`
- `09_Development/Planning/EPIC_CATALOG.md`
- `09_Development/Planning/BATCH_ARCHITECTURE.md`
- `09_Development/Planning/ISSUE_CATALOG.md`
- `09_Development/Planning/DEPENDENCY_GRAPH.md`
- `09_Development/Planning/LABEL_TAXONOMY.md`
- `09_Development/Planning/GITHUB_CREATION_PLAN.md`
- `09_Development/Planning/github_creation_plan.yaml`

### Reconciliation State — 2026-09-07

The planning package was created under the older Phase 0–9 strategic roadmap and therefore remains authoritative for **historical planning identity/traceability**, but its old execution order is under active reconciliation in issue #357.

The current strategic execution order is owned by `00_Project/ROADMAP.md` v3.x.

Until reconciliation completes:

- preserve all M/E/RBATCH IDs;
- do not delete historical identifiers;
- do not execute an old dependency merely because it has a lower ID;
- where old planning conflicts with current strategic canon, current higher-level canon governs;
- classify items as KEEP / UPDATE / MERGE-ABSORB / CLOSE-HISTORICAL / NEW-CHILD-NEEDED.

After #357, the planning files must be updated or explicitly crosswalked so this temporary reconciliation state is removed.

---

## Managed Engine-Migration Directory

- `09_Development/Engine_Migration/`

Stable documents:

- `09_Development/Engine_Migration/ENVIRONMENT_VARIABLES.md`
- `09_Development/Engine_Migration/FUTURE_SERVER_AUTHORITATIVE_ARCHITECTURE_PREPARATION.md`
- `09_Development/Engine_Migration/WEB_RUNTIME_MIGRATION_MILESTONE_001.md`

Authority notes:

- `WEB_RUNTIME_MIGRATION_MILESTONE_001.md` is historical/deployable-web migration evidence and does not override mobile-first canon.
- `ENVIRONMENT_VARIABLES.md` documents the active web-runtime configuration contract where relevant.
- `FUTURE_SERVER_AUTHORITATIVE_ARCHITECTURE_PREPARATION.md` is preparation only; it does not activate a backend by itself.
- Primary platform authority remains `VISION.md`, `ARCHITECTURE.md`, and `MOBILE_APPLICATION_PLATFORM.md`.

---

## Managed Owner Directives Directory

- `09_Development/Owner_Directives/` — authoritative owner strategic inputs requiring deliberate canonical integration.

Rules:

- directives are binding owner input;
- directives do not automatically become canonical system documents;
- affected canon must be deliberately reconciled/updated;
- agents must inspect directives before major architectural, universe, business, documentation, or product-direction changes.

Governance source: `09_Development/Owner_Directives/README.md`.

---

# Future BIBLE-Level Documentation

**Status:** Approved future architecture concept — no BIBLE files currently authorized or created.

Potential domain BIBLE documents remain a future option only.

Creating a BIBLE still requires:

1. complete domain audit;
2. ownership mapping;
3. overlap detection;
4. contradiction analysis;
5. migration proposal;
6. explicit Project Owner approval.

The 2026-09-07 Universe/Business/Logistics audit authorized the three strategic bridge documents created in `00_Project/`; it **does not** automatically authorize BIBLE documents.

A future BIBLE must not duplicate an existing canonical owner.

---

# External DROPi Canonical Reference Package

**Status:** Planned — package not uploaded.

A future `DROPi_Canonical_Reference.zip` may provide a read-only snapshot of real DROPi canon.

Until the real package exists:

- do not invent it;
- do not create a placeholder;
- do not claim Tycoon gameplay inventions are real DROPi features.

When uploaded, integration requires a dedicated cross-project alignment audit covering manifest/source verification, terminology, architecture, overlap, contradictions, gameplay adaptation, and explicit Owner approval.

The real DROPi repository remains authoritative for the real product.

---

# Game/

## Purpose

Historical/managed game project area.

Current role:

- archived GDevelop lineage/reference;
- not the authoritative current gameplay runtime.

Generated/internal files are not individually indexed here.

---

# Builds/

## Purpose

Managed generated/exported build-output area.

Generated build artifacts are not individually indexed.

---

# game-mobile/

## Purpose

Installed mobile application shell implementation.

Current state:

- materially present;
- Expo / React Native application shell;
- hosts the authoritative Phaser runtime rather than reimplementing gameplay;
- owns native lifecycle, orientation, system UI, Android Back/native bridge behavior, packaging, and EAS build integration;
- supports installed Android owner review.

Canonical authority: `06_Technical/MOBILE_APPLICATION_PLATFORM.md` and `06_Technical/ARCHITECTURE.md`.

---

# game-web/

## Purpose

Authoritative Phaser/Vite/TypeScript gameplay runtime plus secondary web deployment surface.

Current state:

- owns gameplay rendering/simulation/runtime behavior;
- contains production web server, frontend source, tests, and runtime assets;
- consumed by the mobile application shell during the current staged architecture;
- deployed through the original Railway service for preview/smoke/runtime delivery where currently configured;
- browser/Railway presentation remains secondary to installed Android owner/player quality evaluation.

The project must not create a second independent React Native gameplay implementation.

---

# Global Document Authority Hierarchy

The previous five-level hierarchy is superseded by the strategic hierarchy approved in `VISION.md` and materialized after the 2026-09-07 ownership audit.

## Level 1 — Project Vision

`00_Project/VISION.md`

Owns non-negotiable project identity and strategic purpose.

## Level 2 — Universe Design

`00_Project/UNIVERSE_DESIGN.md`

Owns persistent society/world truths.

## Level 3 — Business Design

`00_Project/BUSINESS_DESIGN.md`

Owns organization/business truths.

## Level 4 — Logistics Design

`00_Project/LOGISTICS_DESIGN.md`

Owns strategic logistics/custody/network truths.

## Level 5 — Game Design

`01_GameDesign/GDD.md` and its legitimate specializations.

Owns how the player interacts with the higher-level model.

## Level 6 — UX Design

`07_UI/` canonical UI/UX documents and project-experience specializations.

Own player-interface presentation/interaction without overriding gameplay truth.

## Level 7 — Technical Design

`06_Technical/` canonical documents.

Own implementation architecture, runtime/platform, persistence, safety, and later server-authority mechanics.

## Level 8 — Implementation / Prototype Scope

Implementation specs, code, balancing/configuration, and prototype-scope documents.

These realize higher authority and may not redefine it silently.

## Level 9 — Verification

Tests, CI, owner acceptance, deployment evidence, consistency checks, and audit results.

Verification proves behavior; it does not create new product truth by itself.

## Level 10 — Historical Reporting

AI reports, migration reports, old planning evidence, and historical implementation records.

Historical evidence never overrides current live canon.

---

# Domain Ownership Rules

Strategic hierarchy and domain ownership work together.

Examples:

- Universe Design owns the societal/world-level rule; `04_World/` owns detailed world simulation under it.
- Business Design owns company identity/governance principles; `02_Economy/` owns detailed economic calculations under it.
- Logistics Design owns multimodal/custody principles; `03_Logistics/` owns detailed logistics mechanics under it.
- GDD owns playable interaction; specialized Game Design docs narrow it.
- UX cannot invent game authority merely because a screen displays something.
- Technical code cannot silently create new game canon.

---

# Conflict-Resolution Rules

1. **Owner decisions are binding.** Explicit Project Owner decisions override AI interpretation and must be persisted into the correct canonical owner before dependent implementation.
2. **Higher authority wins.** Lower-level documents cannot contradict higher-level documents.
3. **Specialization is allowed.** Lower levels may detail or narrow higher-level rules within legitimate scope.
4. **Specificity alone does not override authority.** A more detailed implementation document does not outrank a strategic owner.
5. **Domain ownership remains binding.** A document outside its legitimate domain cannot redefine that domain.
6. **Same-level conflict requires reconciliation.** Do not silently choose between conflicting same-authority owners.
7. **Recency alone does not create authority.** Newer timestamp/version/commit does not outrank hierarchy.
8. **Reports are evidence only.** AI reports never override live canonical docs.
9. **Implementation is not canon by accident.** Existing code is preserved where compatible, but incompatible implementation must be reconciled rather than treated as higher truth.
10. **Real DROPi remains separate.** Tycoon canon cannot redefine the real DROPi product.

---

# Maintenance Rule

When files are added, removed, moved, or materially change authority:

1. keep this index aligned with the real repository filesystem;
2. individually register stable live Markdown documents;
3. keep generated/historical streams represented through directory policy where appropriate;
4. update authority descriptions when ownership changes;
5. remove obsolete “future/planned” statements after materialization;
6. never introduce paths that do not exist as if they were live implementation.

---

# Canonical Rule

**Every important project truth must have one clear owner, every specialization must know which higher authority it serves, and planning/implementation must always reconcile downward from the current strategic canon rather than upward from historical issue numbering.**

---

End of Document
