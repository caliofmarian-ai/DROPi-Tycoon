# Document Information

Document: DOCUMENT_INDEX.md
Project: DROPi Tycoon
Version: 2.3.0
Status: Documentation Control
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-08

---

# Documentation Index

## Purpose

This document is the canonical documentation map for DROPi Tycoon.

It defines:

- stable live Markdown documents that must be discoverable;
- managed root-level directories;
- documentation ownership and authority;
- directory-policy treatment for dynamic, research, historical, or generated areas.

---

# Indexing Policy

1. Stable live Markdown documents are listed individually where practical.
2. Managed root-level directories are represented explicitly.
3. Dynamic/high-churn research, historical, and report streams may be represented at directory-policy level.
4. Generated internals and build artifacts are not individually enumerated.
5. Discoverability does not change content ownership.
6. Higher-level strategic owners constrain lower-level specializations.
7. Historical reports and research evidence never override live canon.
8. Explicit owner decisions become binding only after they are persisted into the appropriate owner directive/canonical baseline and reconciled into affected domain canon.

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

`game-mobile/` owns the installed Expo/React Native Android application shell.

`game-web/` contains the authoritative Phaser/Vite/TypeScript gameplay runtime and secondary Railway/browser deployment surface.

---

# Root Files

- `README.md` — repository entry point and external-facing project summary.

---

# 00_Project

## Purpose

Strategic design authority, project identity, governance, architecture decisions, roadmap, status, and documentation control.

## Canonical Strategic Owners

- `00_Project/VISION.md` — Level 1 Project Vision Authority.
- `00_Project/UNIVERSE_DESIGN.md` — Level 2 Universe Design Authority: persistent society/world, citizens, organizations, institutions, infrastructure, scale, and fair-access principles.
- `00_Project/BUSINESS_DESIGN.md` — Level 3 Business Design Authority: organizations, workforce, competition, ownership/governance, productive assets, and business/infrastructure relationships.
- `00_Project/LOGISTICS_DESIGN.md` — Level 4 Logistics Design Authority: demand/cargo/custody, multimodal transport, hubs, qualifications, capacity, and local-to-global logistics.
- `00_Project/PHASE1_GAME_ARCHITECTURE_DECISION_BASELINE.md` — owner-approved Phase-1 architecture baseline produced from Game Logic Research #423 and approval gate #434. It binds player/world identity, employment/membership, travel, insolvency/offline life, staged currency/banking/public-economy direction, productive/infrastructure ownership, persistent multiplayer continuity, and the Phase-1 playability direction.
- `00_Project/ROADMAP.md` — canonical strategic development order; v4 maps the approved Phase-1 architecture into causal implementation waves.

## Other Stable Project Documents

- `00_Project/README.md`
- `00_Project/PROJECT_STATUS.md`
- `00_Project/PROJECT_INTAKE_PROTOCOL.md`
- `00_Project/DOCUMENT_INDEX.md`
- `00_Project/PRODUCT_EXPERIENCE_PRINCIPLES.md`
- `00_Project/PRODUCT_EXPERIENCE_CANONICAL_ADDENDUM.md`
- `00_Project/PROJECT_CONSISTENCY_REPORT_TEMPLATE.md`
- `00_Project/INITIAL_REPOSITORY_AUDIT.md`

### Phase-1 Reconciliation Note — 2026-09-08

The owner-approved Phase-1 package does **not** replace the strategic owner hierarchy. It is a cross-domain architecture decision baseline used to reconcile those owners and their specializations.

Key reconciled truths include:

- poor pedestrian employee start rather than automatic company ownership;
- one economic hero per account per World Instance;
- Personal Money and Company Money remain distinct ownership domains;
- human consumption, finite Work Capacity, and living costs are real economic drivers;
- deliveries emerge from demand/inventory/contracts instead of arbitrary money rewards;
- people, companies, cities, industries, and infrastructure participate in one stock-flow economy;
- bankruptcy can be severe but is recoverable;
- economic power is isolated between fresh World Instances;
- strategic-map navigation does not teleport people or cargo;
- the game must remain playable and attractive under the principle **Your work leaves a mark**.

---

# 01_GameDesign

## Purpose

Playable design: hero experience, gameplay structure, progression, objectives, physical HQ progression, and multiplayer society.

Documents:

- `01_GameDesign/GDD.md` — Level 5 global Game Design Authority.
- `01_GameDesign/GAMEPLAY.md` — moment-to-moment and session gameplay; reconciled to the employee-first start and multiple valid long-term careers.
- `01_GameDesign/MISSIONS.md` — player guidance/objectives; mission completion cannot invent unbacked economic value.
- `01_GameDesign/PROGRESSION.md` — three-axis progression: Personal Capability + Company Capability + World Access, with earned qualification/equipment/authorization/infrastructure gates.
- `01_GameDesign/HQ_PROGRESSION.md` — physical HQ growth and department capability.
- `01_GameDesign/COMPANY_SOCIETY_AND_MULTIPLAYER.md` — company membership, mixed human/NPC organizations, society, ownership, governance, and multiplayer specialization.

Authority note:

- `GDD.md` cannot contradict `VISION`, `UNIVERSE_DESIGN`, `BUSINESS_DESIGN`, `LOGISTICS_DESIGN`, or approved architecture decisions.
- Other Game Design documents specialize `GDD.md` and their relevant higher strategic owners.

---

# 02_Economy

## Purpose

Detailed in-game economic, financial, market, workforce, and ownership systems.

Documents:

- `02_Economy/ECONOMY.md` — universal stock-flow economic framework across persons, companies, cities, productive assets, and countries.
- `02_Economy/PERSONAL_FINANCE.md` — Personal Money, wages, living costs, personal insolvency, and player investment ownership.
- `02_Economy/MARKET.md` — inventory/consumption/procurement-driven markets and demand.
- `02_Economy/PRICING.md` — pricing specialization.
- `02_Economy/EMPLOYEES.md` — workforce, employment/payroll, and human/NPC compatibility.
- `02_Economy/PRODUCTION_AND_TRADE.md` — productive chains and trade.
- `02_Economy/VALUATION.md` — company valuation.
- `02_Economy/DIVIDENDS.md` — distributable company-to-person settlement.
- `02_Economy/EQUITY_SETTLEMENT.md` — share settlement.
- `02_Economy/GOVERNANCE.md` — economic/company governance specialization.

Authority note:

`02_Economy/*` specializes `BUSINESS_DESIGN`, Game Design, and World rules. It owns economic calculations and conservation but does not redefine strategic company/world identity.

No economy feature may create unexplained money, goods, labor, capacity, or settlement outside the canonical stock-flow model.

---

# 03_Logistics

## Purpose

Detailed logistics gameplay systems.

Documents:

- `03_Logistics/LOGISTICS.md`
- `03_Logistics/ORDERS.md` — current prototype technical state machine remains compatible, while mature settlement is demand/custody/payer-backed rather than `reward applied` as final economic truth.
- `03_Logistics/ROUTING.md`
- `03_Logistics/VEHICLES.md`
- `03_Logistics/DRONES.md`
- `03_Logistics/DRONEPORTS.md`

Authority note:

`03_Logistics/*` specializes `00_Project/LOGISTICS_DESIGN.md`. Cargo, people, and inventory must not teleport between economic locations because a UI action occurred.

---

# 04_World

## Purpose

Detailed world simulation, global map, buildings, population/NPCs, environment, and weather.

Documents:

- `04_World/WORLD.md` — living global world, authoritative time, consumption, production, migration, development/decline, events, and multi-resolution simulation.
- `04_World/MAP.md` — Global -> Country -> Administrative Region -> Representative Locality / External Economic Node -> Detailed Local Scene; strategic map is observation/planning/travel, not teleportation.
- `04_World/GLOBAL_MAP_DATASET.md` — versioned Natural Earth/world-atlas provenance, license and runtime-truth boundary for the strategic Global Map.
- `04_World/COUNTRY_LAYER_LOCALITY_DATASET.md` — pinned Natural Earth populated-place provenance and sparse capital/city/locality selection contract for Country Layer nodes.
- `04_World/BUILDINGS.md`
- `04_World/NPC.md`
- `04_World/WEATHER.md`

Authority note:

`04_World/*` specializes `00_Project/UNIVERSE_DESIGN.md`. All countries may participate strategically, while detailed simulation remains sparse and bounded for scalability.

---

# 05_AI

## Purpose

In-game artificial intelligence systems.

Documents:

- `05_AI/AI_SYSTEM.md`
- `05_AI/AI_AGENTS.md`

Important: this folder defines **in-game AI**, not AI-assisted development workflow.

AI/automation must obey the same authoritative economy, labor, cargo, capacity, and infrastructure rules as human-controlled actors. NPC fallback cannot create infinite free resources.

---

# 06_Technical

## Purpose

Level 7 Technical Design, persistence, and shared-authority specifications.

Documents:

- `06_Technical/ARCHITECTURE.md` — global technical architecture.
- `06_Technical/MOBILE_APPLICATION_PLATFORM.md` — installed-mobile runtime, Android application shell, and Railway role.
- `06_Technical/SAVE_SYSTEM.md` — local Save/Load plus explicit legacy boundary for migration into future multiplayer worlds.
- `06_Technical/SHARED_AUTHORITY_CONTRACT.md` — trusted/server authority for shared identity, money, inventory, cargo, contracts, ownership, world time, and settlement.
- `06_Technical/WORLD_INSTANCES.md` — persistent independent global economies, economic isolation, one hero/world, and multi-resolution/catch-up requirements.
- `06_Technical/DURABLE_AUTHORITY_AND_AUTHENTICATION.md`
- `06_Technical/DURABLE_AUTHORITY_STACK_DECISION.md`
- `06_Technical/SERVER_AUTHORITY_PROTOTYPE.md`
- `06_Technical/SAFE_SYSTEM.md`
- `06_Technical/TDD.md`

Technical Design implements approved gameplay/economic truth; it does not redefine product rules because a different implementation would be easier.

---

# 07_UI

## Purpose

Level 6 UX/UI Design and player-interface specialization.

Documents:

- `07_UI/UI.md`
- `07_UI/UX.md`
- `07_UI/VISUAL_DESIGN_SYSTEM.md` — canonical Stylized 3D Pre-Rendered Mobile World direction.
- `07_UI/PLAYER_SMARTPHONE.md` — canonical portable in-world smartphone surface and physical-location boundary.

UX/UI must support world-embodied gameplay rather than replace physical systems with omniscient management screens.

Player-facing features should satisfy the Phase-1 R9 playability principles: meaningful choice, clarity, visible consequence, economic causality, variety, recovery, asynchronous compatibility where appropriate, and Android usability.

---

# 08_Assets

## Purpose

Asset standards, approved references, world-art canon, production planning, and resource governance.

Documents/managed areas:

- `08_Assets/ASSETS.md`
- `08_Assets/WORLD_ASSET_BIBLE.md`
- `08_Assets/MASTER_ASSET_PLAN_V2.md`
- `08_Assets/BATCH_003_PLACEHOLDER_PROVENANCE.md`
- `08_Assets/Approved_References/`
- `08_Assets/Production/`

Authority note:

`WORLD_ASSET_BIBLE.md` is an explicitly owner-authorized lower-level specialization. Asset generation remains demand-driven: search, reuse, and deduplicate existing approved material before generating new source art.

---

# 09_Development

## Purpose

Implementation process, research, planning support, verification, reporting, and historical evidence.

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

## Managed Game Logic Research Directory

- `09_Development/Research/GAME_LOGIC/` — Phase-1 R1-R9 research archive from #423 and merged PR #425.

Rules:

- research files remain **NON-CANONICAL evidence** even after merge;
- approved conclusions are represented by `00_Project/PHASE1_GAME_ARCHITECTURE_DECISION_BASELINE.md`, Owner Directive 005, and reconciled domain documents;
- research wording cannot override reconciled canon;
- future research may identify new decisions but must pass owner approval before changing canonical architecture.

## Managed Historical Report Directory

- `09_Development/AI_Reports/` — historical audit/report stream.
- Governance source: `09_Development/AI_REPORTING_PROTOCOL.md`.
- Individual reports are not enumerated here.
- Reports are evidence, not live canonical authority.

## Managed Implementation-Preparation Directory

- `09_Development/Implementation_Preparation/` — non-authoritative implementation guidance that must be revalidated after material canonical changes.

## Managed Planning Directory

- `09_Development/Planning/` — planning-canonical milestone/epic/batch/issue architecture and current causal execution crosswalk.

Stable planning documents:

- `09_Development/Planning/MILESTONE_ARCHITECTURE.md`
- `09_Development/Planning/EPIC_CATALOG.md`
- `09_Development/Planning/BATCH_ARCHITECTURE.md`
- `09_Development/Planning/ISSUE_CATALOG.md` — historical/current catalog identities; old execution status/order does not override Roadmap v4.
- `09_Development/Planning/DEPENDENCY_GRAPH.md` — v2 current causal graph plus preserved legacy graph.
- `09_Development/Planning/PHASE1_IMPLEMENTATION_SEQUENCE.md` — canonical execution crosswalk from approved Phase-1 architecture to active implementation tracks/issues.
- `09_Development/Planning/LABEL_TAXONOMY.md`
- `09_Development/Planning/GITHUB_CREATION_PLAN.md`
- `09_Development/Planning/github_creation_plan.yaml`

Historical M/E/RBATCH identities must be preserved. Execution order must be reconciled downward from current strategic canon rather than inferred from old numeric ordering.

## Managed Engine-Migration Directory

- `09_Development/Engine_Migration/`

Stable documents:

- `09_Development/Engine_Migration/ENVIRONMENT_VARIABLES.md`
- `09_Development/Engine_Migration/FUTURE_SERVER_AUTHORITATIVE_ARCHITECTURE_PREPARATION.md`
- `09_Development/Engine_Migration/WEB_RUNTIME_MIGRATION_MILESTONE_001.md`

These documents cannot override current mobile-first or shared-authority canon.

## Managed Owner Directives Directory

- `09_Development/Owner_Directives/` — binding owner input requiring deliberate canonical integration.
- `09_Development/Owner_Directives/2026-09-08_MASTER_OWNER_DIRECTIVE_005_PHASE1_GAME_ARCHITECTURE_APPROVAL.md` — records approval of the complete Phase-1 architecture package and authorizes its reconciliation.

Governance source: `09_Development/Owner_Directives/README.md`.

---

# BIBLE-Level Documentation

## Authorized BIBLE

The Project Owner explicitly authorized `08_Assets/WORLD_ASSET_BIBLE.md` on 2026-09-07 after the required domain audit/reconciliation.

This authorization is specific to the world-art/asset domain.

`WORLD_ASSET_BIBLE.md` must remain subordinate to higher Universe, Business, Logistics, Game, World, UI, and Technical authority and must not redefine gameplay/economic behavior outside its asset domain.

## Other Future BIBLE Documents

No other BIBLE document is automatically authorized by the world-art decision.

Any additional BIBLE document requires:

1. complete domain audit;
2. ownership mapping;
3. overlap detection;
4. contradiction analysis;
5. migration proposal;
6. explicit Project Owner approval.

---

# External DROPi Canonical Reference Package

**Status:** Planned — package not uploaded in this repository.

A future `DROPi_Canonical_Reference.zip` may provide a read-only snapshot of real DROPi canon.

Until such a package exists:

- do not invent it;
- do not create a placeholder pretending it exists;
- do not claim Tycoon gameplay inventions are real DROPi features.

When uploaded, integration requires a dedicated cross-project alignment audit covering manifest/source verification, terminology, architecture, overlap, contradictions, gameplay adaptation, and explicit Owner approval.

The real DROPi repository remains authoritative for the real product.

---

# Game/

Historical/managed GDevelop lineage/reference. It is not the authoritative gameplay runtime.

---

# Builds/

Managed generated/exported build-output area. Generated build artifacts are not individually indexed.

---

# game-mobile/

Installed Expo/React Native application shell. It owns native lifecycle, orientation, system UI, Android bridge behavior, packaging, and EAS integration while hosting the authoritative Phaser runtime.

Canonical authority: `06_Technical/MOBILE_APPLICATION_PLATFORM.md` and `06_Technical/ARCHITECTURE.md`.

---

# game-web/

Authoritative Phaser/Vite/TypeScript gameplay runtime plus secondary web deployment surface.

The project must not create a second independent React Native gameplay implementation.

---

# Global Document Authority Hierarchy

## Level 1 — Project Vision

`00_Project/VISION.md`

## Level 2 — Universe Design

`00_Project/UNIVERSE_DESIGN.md`

## Level 3 — Business Design

`00_Project/BUSINESS_DESIGN.md`

## Level 4 — Logistics Design

`00_Project/LOGISTICS_DESIGN.md`

## Cross-Domain Approved Architecture Baselines

Owner-approved decision baselines such as `00_Project/PHASE1_GAME_ARCHITECTURE_DECISION_BASELINE.md` constrain all affected domains until deliberately superseded by a later owner decision. They do not erase domain ownership.

## Level 5 — Game Design

`01_GameDesign/GDD.md` and legitimate specializations.

## Level 6 — UX Design

`07_UI/` canonical UI/UX documents.

## Level 7 — Technical Design

`06_Technical/` canonical documents.

## Level 8 — Implementation / Prototype Scope

Implementation specs, code, balancing/configuration, and prototype-scope documents.

## Level 9 — Verification

Tests, CI, owner acceptance, deployment evidence, and audits.

## Level 10 — Historical / Research Evidence

Research archives, AI reports, migration reports, old planning evidence, and historical implementation records.

Evidence does not create new product truth by itself.

---

# Conflict-Resolution Rules

1. **Owner decisions are binding** once persisted into the appropriate owner directive/decision baseline and reconciled into affected canon.
2. **Higher authority wins.** Lower-level documents cannot contradict higher-level documents.
3. **Approved cross-domain architecture baselines constrain every affected specialization.**
4. **Specialization is allowed** within legitimate ownership boundaries.
5. **Specificity alone does not override authority.**
6. **Same-level conflict requires deliberate reconciliation.**
7. **Recency alone does not create authority.**
8. **Research/reports are evidence only.**
9. **Implementation is not canon by accident.** Existing runtime remains legacy compatibility where it conflicts with approved future architecture until a dedicated migration PR changes behavior.
10. **Current Roadmap/planning crosswalk controls execution order.** Historical ISSUE/M/E/RBATCH status or numeric order does not outrank newer approved planning.
11. **Real DROPi remains separate.** Tycoon canon cannot redefine the real DROPi product.

---

# Maintenance Rule

When files are added, removed, moved, or materially change authority:

1. keep this index aligned with the real repository filesystem;
2. register stable live canonical documents;
3. classify research/historical streams explicitly as non-authoritative;
4. update authority descriptions when ownership changes;
5. remove obsolete future/planned wording after materialization;
6. never present nonexistent implementation as live capability;
7. preserve legacy runtime compatibility explicitly when canon moves ahead of implementation;
8. after major canon reconciliation, revalidate roadmap/planning/implementation-preparation documents before execution.

---

# Canonical Rule

**Every important project truth must have one clear owner, approved cross-domain decisions must be reconciled into every affected owner, and planning/implementation must flow downward from current canon rather than upward from prototype behavior, old issue numbering, or research evidence.**

---

End of Document
