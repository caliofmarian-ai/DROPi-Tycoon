# Document Information

Document: BATCH_ARCHITECTURE.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Planning — Canonical
Author: AI Agent (Report 086)
Language: English
Last Updated: 2026-08-01

---

# Batch Architecture

## Purpose

This document defines the complete roadmap batch architecture for DROPi Tycoon.

Roadmap batches (RBATCH-NNN) are the unit of planned work delivery. Each batch is a bounded, dependency-ordered scope of implementation.

Legacy implementation batches BATCH-001 through BATCH-008 are preserved as canonical history and mapped to their RBATCH equivalents.

---

## Batch Count Summary

- Total roadmap batch IDs: **42** (RBATCH-001 through RBATCH-042)
- Legacy completed batches: **8** (RBATCH-001 through RBATCH-008, formerly BATCH-001 through BATCH-008)
- Prototype remaining batches: **9** (RBATCH-009 through RBATCH-017)
- Phase 2 batches: **7** (RBATCH-018 through RBATCH-024)
- Phase 3 batches: **7** (RBATCH-025 through RBATCH-031)
- Phase 4 batches: **7** (RBATCH-032 through RBATCH-038)
- Phase 5 batches: **3** (RBATCH-039 through RBATCH-041)
- Phase 6 batches: **1** (RBATCH-042)

---

## Legacy Batch Traceability

The following mapping preserves traceability from legacy batch identifiers to roadmap batch identifiers.

| Legacy ID | RBATCH ID | Status |
|---|---|---|
| BATCH-001 | RBATCH-001 | COMPLETED |
| BATCH-002 | RBATCH-002 | COMPLETED |
| BATCH-003 | RBATCH-003 | COMPLETED |
| BATCH-004 | RBATCH-004 | COMPLETED |
| BATCH-005 | RBATCH-005 | COMPLETED |
| BATCH-006 | RBATCH-006 | COMPLETED |
| BATCH-007 | RBATCH-007 | COMPLETED |
| BATCH-008 | RBATCH-008 | COMPLETED |

Legacy batch identifiers BATCH-001 through BATCH-008 remain valid references in historical documents and are not planned for reimplementation.

BATCH-009 (legacy) was renamed RBATCH-009 before implementation commenced. BATCH-009 implementation has not started.

---

## Phase 0 — Foundation (Completed)

### RBATCH-001 (Legacy: BATCH-001) — GDevelop Foundation Scaffold

- ID: RBATCH-001
- Legacy ID: BATCH-001
- Status: **COMPLETED**
- Milestone: M-001, M-002
- Epics: E-001, E-002, E-003
- Objective: Create project scaffold (project file, three empty scenes, global vars, asset directories).
- Depends On: none
- Key Artifacts: `Game/DROPi_Tycoon.json`, empty scene list, global variable roots.

---

### RBATCH-002 (Legacy: BATCH-002) — Scene/Event Scaffold Wiring

- ID: RBATCH-002
- Legacy ID: BATCH-002
- Status: **COMPLETED**
- Milestone: M-002
- Epics: E-003
- Objective: Add scene-level event scaffolding and external-sheet bindings.
- Depends On: RBATCH-001
- Key Artifacts: Scene event groups, external event-sheet references.

---

### RBATCH-003 (Legacy: BATCH-003) — Placeholder Asset Setup

- ID: RBATCH-003
- Legacy ID: BATCH-003
- Status: **COMPLETED**
- Milestone: M-002
- Epics: E-004
- Objective: Create placeholder asset library and naming-compliant folder structure.
- Depends On: RBATCH-001
- Key Artifacts: Placeholder sprites, UI stubs, audio stubs, naming map.

---

### RBATCH-004 (Legacy: BATCH-004) — Map/Player/Building World Setup

- ID: RBATCH-004
- Legacy ID: BATCH-004
- Status: **COMPLETED**
- Milestone: M-003
- Epics: E-005
- Objective: Implement map, player placement, and interaction-ready world entities.
- Depends On: RBATCH-002, RBATCH-003
- Key Artifacts: GameWorld map composition, player start placement, building and interaction-point entities.

---

### RBATCH-005 (Legacy: BATCH-005) — Order Generation + Lifecycle Core

- ID: RBATCH-005
- Legacy ID: BATCH-005
- Status: **COMPLETED**
- Milestone: M-004
- Epics: E-007
- Objective: Implement order creation and canonical order-state progression core (Created→Available→Accepted).
- Depends On: RBATCH-004
- Key Artifacts: Order state-machine definition, Created→Available→Accepted lifecycle logic.

---

### RBATCH-006 (Legacy: BATCH-006) — Tap-to-Move + Camera

- ID: RBATCH-006
- Legacy ID: BATCH-006
- Status: **COMPLETED**
- Milestone: M-003
- Epics: E-006
- Objective: Implement Android-first tap-to-move input and camera tracking behavior.
- Depends On: RBATCH-004
- Key Artifacts: Tap-to-move input handling, player movement toward tapped targets, camera follow.

---

### RBATCH-007 (Legacy: BATCH-007) — Pickup Proximity Core

- ID: RBATCH-007
- Legacy ID: BATCH-007
- Status: **COMPLETED**
- Milestone: M-004
- Epics: E-008
- Objective: Implement proximity-based pickup core: minimal accept trigger and Accepted→PickedUp state transition.
- Depends On: RBATCH-005, RBATCH-006
- Key Artifacts: Minimal accept trigger, Accepted→PickedUp state transition, CarryingPackage flag.

---

### RBATCH-008 (Legacy: BATCH-008) — Delivery Completion + Failure Path

- ID: RBATCH-008
- Legacy ID: BATCH-008
- Status: **COMPLETED**
- Milestone: M-004
- Epics: E-009
- Objective: Implement delivery completion and failure branch execution.
- Depends On: RBATCH-007
- Key Artifacts: Destination validation, PickedUp→Completed event, PickedUp→Failed event, terminal-state protection.

---

## Phase 1 Remaining — First Playable Prototype

### RBATCH-009 — Economy Reward & Reputation Updates

- ID: RBATCH-009
- Status: Planned — Not Started
- Milestone: M-005
- Epics: E-010
- Objective: Implement economy and reputation outcomes from delivery results.
- Depends On: RBATCH-008
- Key Artifacts: Money/reputation updates and affordability checks.
- Non-goals: no upgrade UI scene implementation.
- Validation: reward and penalty effects update canonical data correctly.
- Acceptance Criteria: economy state remains coherent with order outcomes.

---

### RBATCH-010 — HUD + Notifications

- ID: RBATCH-010
- Status: Planned — Not Started
- Milestone: M-005
- Epics: E-011
- Objective: Implement GameWorld HUD and feedback/notification surface.
- Depends On: RBATCH-007, RBATCH-009
- Key Artifacts: HUD elements, Accept Order button, notification display.
- Non-goals: no MainMenu save-flow handling.
- Validation: critical UI information visible and responsive.
- Acceptance Criteria: HUD supports full loop execution.

---

### RBATCH-011 — MainMenu Start/Continue Flow

- ID: RBATCH-011
- Status: Planned — Not Started
- Milestone: M-005
- Epics: E-012
- Objective: Implement MainMenu Start/Continue/new-game guard flow.
- Depends On: RBATCH-002
- Key Artifacts: Scene entry flow, overwrite confirmation guard dialog.
- Non-goals: no save serializer implementation.
- Validation: Continue and Start rules align with save policy.
- Acceptance Criteria: menu flow is canonically compliant and isolated.

---

### RBATCH-012 — CompanyManagement + Upgrade Purchase Flow

- ID: RBATCH-012
- Status: Planned — Not Started
- Milestone: M-006
- Epics: E-013
- Objective: Implement CompanyManagement scene and upgrade purchase logic.
- Depends On: RBATCH-009, RBATCH-010
- Key Artifacts: Upgrade UI/actions, CompanyManagement scene flow.
- Non-goals: no bicycle speed effect application yet.
- Validation: upgrades can be purchased within affordability constraints.
- Acceptance Criteria: optional management branch works end-to-end.

---

### RBATCH-013 — Bicycle Ownership + Speed Effect

- ID: RBATCH-013
- Status: Planned — Not Started
- Milestone: M-006
- Epics: E-014
- Objective: Implement bicycle ownership effect on movement speed.
- Depends On: RBATCH-012, RBATCH-006
- Key Artifacts: Bicycle-owned state, speed effect application.
- Validation: movement speed increases after bicycle acquisition.
- Acceptance Criteria: walking vs bicycle behavior distinction is clear.

---

### RBATCH-014 — Save/Load Implementation

- ID: RBATCH-014
- Status: Planned — Blocked (ODR-001, ODR-003 required)
- Milestone: M-007
- Epics: E-015
- Objective: Implement save/load, validation, and autosave policy.
- Owner Gates: ODR-001, ODR-003 required before implementation
- Depends On: RBATCH-012, RBATCH-013, RBATCH-011
- Key Artifacts: Local save storage, load validation, autosave triggers.
- Non-goals: no cloud/backend/multi-slot scope.
- Validation: required save test cases pass; non-persisted fields remain non-persisted.
- Acceptance Criteria: save behavior matches canonical save policy.

---

### RBATCH-015 — Mobile Optimization & Polish

- ID: RBATCH-015
- Status: Planned — Not Started
- Milestone: M-008
- Epics: E-016
- Objective: Mobile fit/finish and performance optimization.
- Depends On: RBATCH-010, RBATCH-014
- Key Artifacts: Tuned UI/controls/performance adjustments.
- Non-goals: no feature-scope expansion.
- Validation: mobile usability checks pass.
- Acceptance Criteria: build is mobile-playable within prototype constraints.

---

### RBATCH-016 — Full-Loop Integration Verification

- ID: RBATCH-016
- Status: Planned — Not Started
- Milestone: M-008
- Epics: E-017
- Objective: Integration test full prototype gameplay loop.
- Depends On: RBATCH-015
- Key Artifacts: Integration validation evidence and defect list.
- Non-goals: no release declaration.
- Validation: loop continuity, system interoperability, and regression checks.
- Acceptance Criteria: all P0/P1 loop behaviors validated.

---

### RBATCH-017 — Release-Checklist Verification Package

- ID: RBATCH-017
- Status: Planned — Not Started
- Milestone: M-008
- Epics: E-017
- Objective: Completion-gate verification package for owner review.
- Depends On: RBATCH-016
- Owner Gates: Human owner approval required
- Key Artifacts: Release-checklist evidence package (no self-approval).
- Non-goals: AI self-declaration of prototype completion.
- Validation: checklist evidence assembled for all sections.
- Acceptance Criteria: package ready for human gate decision.

---

## Phase 2 — Company Management

### RBATCH-018 — Employee Onboarding & Salary System

- ID: RBATCH-018
- Status: Planned — Future
- Milestone: M-009
- Epics: E-018
- Objective: Implement employee hiring workflow and salary deduction mechanics.
- Depends On: RBATCH-017
- Key Artifacts: Employee data model, salary calculation events.

---

### RBATCH-019 — Daily Expenses & Financial Reporting

- ID: RBATCH-019
- Status: Planned — Future
- Milestone: M-009
- Epics: E-019
- Objective: Implement daily operational expense calculation and financial reporting display.
- Depends On: RBATCH-018
- Key Artifacts: Expense engine, financial report UI.

---

### RBATCH-020 — Customer Reputation System

- ID: RBATCH-020
- Status: Planned — Future
- Milestone: M-009
- Epics: E-020
- Objective: Implement customer review collection and reputation impact on economy.
- Depends On: RBATCH-009
- Key Artifacts: Review collection events, reputation scoring model.

---

### RBATCH-021 — Customer Reviews Display

- ID: RBATCH-021
- Status: Planned — Future
- Milestone: M-009
- Epics: E-020
- Objective: Implement customer reviews display in company management UI.
- Depends On: RBATCH-020
- Key Artifacts: Reviews display panel, reputation score widget.

---

### RBATCH-022 — Vehicle Purchasing System

- ID: RBATCH-022
- Status: Planned — Future
- Milestone: M-010
- Epics: E-021
- Objective: Implement vehicle catalog and purchase UI.
- Depends On: RBATCH-019
- Key Artifacts: Vehicle catalog, purchase flow, ownership registry.

---

### RBATCH-023 — Vehicle Maintenance Costs

- ID: RBATCH-023
- Status: Planned — Future
- Milestone: M-010
- Epics: E-021
- Objective: Implement vehicle maintenance cost tracking and deduction.
- Depends On: RBATCH-022
- Key Artifacts: Maintenance cost events, vehicle condition model.

---

### RBATCH-024 — Phase 2 Integration Verification

- ID: RBATCH-024
- Status: Planned — Future
- Milestone: M-010
- Epics: E-021
- Objective: Verify Phase 2 system integration end-to-end.
- Depends On: RBATCH-021, RBATCH-023
- Key Artifacts: Phase 2 integration test evidence.

---

## Phase 3 — Logistics Expansion

### RBATCH-025 — Warehouse Implementation

- ID: RBATCH-025
- Status: Planned — Future
- Milestone: M-011
- Epics: E-022
- Objective: Implement warehouse construction and inventory storage mechanics.
- Depends On: RBATCH-024
- Key Artifacts: Warehouse entity, inventory system, dispatch routing.

---

### RBATCH-026 — Multi-District Map Expansion

- ID: RBATCH-026
- Status: Planned — Future
- Milestone: M-011
- Epics: E-023
- Objective: Expand world map to include multiple city districts.
- Depends On: RBATCH-025
- Key Artifacts: Expanded world map, district boundary definitions.

---

### RBATCH-027 — Delivery Zone Management

- ID: RBATCH-027
- Status: Planned — Future
- Milestone: M-011
- Epics: E-023
- Objective: Implement delivery zone definitions and zone-based order routing.
- Depends On: RBATCH-026
- Key Artifacts: Delivery zone entities, zone assignment logic.

---

### RBATCH-028 — Fleet Management Dashboard

- ID: RBATCH-028
- Status: Planned — Future
- Milestone: M-012
- Epics: E-024
- Objective: Implement fleet management dashboard with vehicle assignment and utilization.
- Depends On: RBATCH-027
- Key Artifacts: Fleet dashboard UI, vehicle assignment events.

---

### RBATCH-029 — Route Optimization Engine

- ID: RBATCH-029
- Status: Planned — Future
- Milestone: M-012
- Epics: E-025
- Objective: Implement automated route optimization for fleet deliveries.
- Depends On: RBATCH-028
- Key Artifacts: Route optimization algorithm, optimized route display.

---

### RBATCH-030 — Vehicle Upgrade System

- ID: RBATCH-030
- Status: Planned — Future
- Milestone: M-012
- Epics: E-025
- Objective: Implement vehicle upgrade progression within fleet management.
- Depends On: RBATCH-029
- Key Artifacts: Vehicle upgrade catalog, upgrade effect application.

---

### RBATCH-031 — Phase 3 Integration Verification

- ID: RBATCH-031
- Status: Planned — Future
- Milestone: M-012
- Epics: E-025
- Objective: Verify Phase 3 system integration end-to-end.
- Depends On: RBATCH-024, RBATCH-030
- Key Artifacts: Phase 3 integration test evidence.

---

## Phase 4 — Drone Technology

### RBATCH-032 — Drone Research System

- ID: RBATCH-032
- Status: Planned — Future
- Milestone: M-013
- Epics: E-026
- Objective: Implement drone research progression and technology unlock tree.
- Depends On: RBATCH-031
- Key Artifacts: Research tree UI, technology unlock events.

---

### RBATCH-033 — Drone Manufacturing Partners

- ID: RBATCH-033
- Status: Planned — Future
- Milestone: M-013
- Epics: E-027
- Objective: Implement manufacturing partner integration for drone procurement.
- Depends On: RBATCH-032
- Key Artifacts: Partner catalog, procurement flow.

---

### RBATCH-034 — DronePort Construction

- ID: RBATCH-034
- Status: Planned — Future
- Milestone: M-014
- Epics: E-028
- Objective: Implement DronePort construction mechanics and management.
- Depends On: RBATCH-033
- Key Artifacts: DronePort entity, construction events, operational states.

---

### RBATCH-035 — Battery Swapping Network

- ID: RBATCH-035
- Status: Planned — Future
- Milestone: M-014
- Epics: E-029
- Objective: Implement battery swapping station network for drone continuity.
- Depends On: RBATCH-034
- Key Artifacts: Battery station entities, swap event logic.

---

### RBATCH-036 — Autonomous Delivery Execution

- ID: RBATCH-036
- Status: Planned — Future
- Milestone: M-015
- Epics: E-030
- Objective: Implement fully autonomous drone delivery execution.
- Depends On: RBATCH-035
- Key Artifacts: Autonomous dispatch AI, drone path events.

---

### RBATCH-037 — Flight Restrictions & Weather

- ID: RBATCH-037
- Status: Planned — Future
- Milestone: M-015
- Epics: E-031
- Objective: Implement flight restriction zones and weather effects on drone operations.
- Depends On: RBATCH-036
- Key Artifacts: Restriction zone definitions, weather event system.

---

### RBATCH-038 — Phase 4 Integration Verification

- ID: RBATCH-038
- Status: Planned — Future
- Milestone: M-015
- Epics: E-031
- Objective: Verify Phase 4 system integration end-to-end.
- Depends On: RBATCH-031, RBATCH-037
- Key Artifacts: Phase 4 integration test evidence.

---

## Phase 5 — Advanced Economy

### RBATCH-039 — Dynamic Market System

- ID: RBATCH-039
- Status: Planned — Future
- Milestone: M-016
- Epics: E-032, E-033
- Objective: Implement dynamic market with inflation, fuel prices, and electricity costs.
- Depends On: RBATCH-038
- Key Artifacts: Market fluctuation engine, price display widgets.

---

### RBATCH-040 — Business Loans & Investor System

- ID: RBATCH-040
- Status: Planned — Future
- Milestone: M-017
- Epics: E-034
- Objective: Implement business loan system and investor relationship management.
- Depends On: RBATCH-039
- Key Artifacts: Loan management UI, investor relationship events.

---

### RBATCH-041 — Competition & Advanced Economy Integration

- ID: RBATCH-041
- Status: Planned — Future
- Milestone: M-017
- Epics: E-035
- Objective: Implement competitor company AI and advanced economy integration verification.
- Depends On: RBATCH-040
- Key Artifacts: Competitor AI, Phase 5 integration test evidence.

---

## Phase 6 — Artificial Intelligence

### RBATCH-042 — Smart Routing & AI Dispatch Foundation

- ID: RBATCH-042
- Status: Planned — Future
- Milestone: M-018
- Epics: E-036, E-037
- Objective: Implement AI-driven routing, predictive demand, dynamic pricing, and autonomous fleet management foundation.
- Depends On: RBATCH-041
- Key Artifacts: Smart routing engine, AI dispatch center, predictive demand model.

---

## Batch ID Contiguity Verification

RBATCH-001 through RBATCH-042 — 42 unique, contiguous IDs confirmed.

No gaps. No duplicates.

---

End of Document
