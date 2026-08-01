# Document Information

Document: LABEL_TAXONOMY.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Planning — Canonical
Author: AI Agent (Report 086)
Language: English
Last Updated: 2026-08-01

---

# Label Taxonomy

## Purpose

This document defines the canonical label taxonomy for GitHub Issues in the DROPi Tycoon repository.

Labels are organized into namespaced groups using a `namespace:value` convention.

---

## Label Convention

All labels follow the format: `namespace:value`

Labels are applied consistently across issues to enable filtering by type, phase, batch, and epic.

---

## Label Groups

### Type Labels

Used to classify the kind of work an issue represents.

| Label | Color | Description |
|---|---|---|
| `type:implementation` | `#0075ca` | Gameplay or system implementation work |
| `type:design` | `#7057ff` | Design decisions and architecture specifications |
| `type:verification` | `#e4e669` | Testing, validation, and integration verification |
| `type:documentation` | `#cfd3d7` | Documentation creation or updates |
| `type:bug` | `#d73a4a` | Bug fix for a confirmed defect |
| `type:refactor` | `#e99695` | Code refactoring without functional change |
| `type:planning` | `#f9d0c4` | Planning, roadmap, or architectural definition |

---

### Phase Labels

Used to identify which development phase an issue belongs to.

| Label | Color | Description |
|---|---|---|
| `phase:0` | `#bfd4f2` | Phase 0 — Foundation |
| `phase:1` | `#d4c5f9` | Phase 1 — First Playable Prototype |
| `phase:2` | `#c2e0c6` | Phase 2 — Company Management |
| `phase:3` | `#fef2c0` | Phase 3 — Logistics Expansion |
| `phase:4` | `#fbd3c8` | Phase 4 — Drone Technology |
| `phase:5` | `#e8d7f0` | Phase 5 — Advanced Economy |
| `phase:6` | `#daf2e4` | Phase 6 — Artificial Intelligence |
| `phase:7` | `#fce8d0` | Phase 7 — International Expansion |
| `phase:8` | `#d0e8fc` | Phase 8 — Global Corporation |
| `phase:9` | `#f0f0f0` | Phase 9 — Endless Evolution |

---

### Batch Labels

Used to associate an issue with a specific roadmap batch.

| Label | Color | Description |
|---|---|---|
| `batch:rbatch-001` | `#ededed` | RBATCH-001 (Legacy BATCH-001 — Completed) |
| `batch:rbatch-002` | `#ededed` | RBATCH-002 (Legacy BATCH-002 — Completed) |
| `batch:rbatch-003` | `#ededed` | RBATCH-003 (Legacy BATCH-003 — Completed) |
| `batch:rbatch-004` | `#ededed` | RBATCH-004 (Legacy BATCH-004 — Completed) |
| `batch:rbatch-005` | `#ededed` | RBATCH-005 (Legacy BATCH-005 — Completed) |
| `batch:rbatch-006` | `#ededed` | RBATCH-006 (Legacy BATCH-006 — Completed) |
| `batch:rbatch-007` | `#ededed` | RBATCH-007 (Legacy BATCH-007 — Completed) |
| `batch:rbatch-008` | `#ededed` | RBATCH-008 (Legacy BATCH-008 — Completed) |
| `batch:rbatch-009` | `#0e8a16` | RBATCH-009 — Economy Reward & Reputation |
| `batch:rbatch-010` | `#0e8a16` | RBATCH-010 — HUD & Notifications |
| `batch:rbatch-011` | `#0e8a16` | RBATCH-011 — MainMenu Flow |
| `batch:rbatch-012` | `#0e8a16` | RBATCH-012 — CompanyManagement |
| `batch:rbatch-013` | `#0e8a16` | RBATCH-013 — Bicycle Ownership |
| `batch:rbatch-014` | `#fbca04` | RBATCH-014 — Save/Load (Blocked) |
| `batch:rbatch-015` | `#0e8a16` | RBATCH-015 — Mobile Optimization |
| `batch:rbatch-016` | `#0e8a16` | RBATCH-016 — Integration Verification |
| `batch:rbatch-017` | `#0e8a16` | RBATCH-017 — Release Checklist |
| `batch:rbatch-018` | `#84b6eb` | RBATCH-018 — Employee Onboarding |
| `batch:rbatch-019` | `#84b6eb` | RBATCH-019 — Financial Reporting |
| `batch:rbatch-020` | `#84b6eb` | RBATCH-020 — Customer Reputation |
| `batch:rbatch-021` | `#84b6eb` | RBATCH-021 — Reviews Display |
| `batch:rbatch-022` | `#84b6eb` | RBATCH-022 — Vehicle Purchasing |
| `batch:rbatch-023` | `#84b6eb` | RBATCH-023 — Vehicle Maintenance |
| `batch:rbatch-024` | `#84b6eb` | RBATCH-024 — Phase 2 Integration |
| `batch:rbatch-025` | `#c5def5` | RBATCH-025 — Warehouse |
| `batch:rbatch-026` | `#c5def5` | RBATCH-026 — Multi-District Map |
| `batch:rbatch-027` | `#c5def5` | RBATCH-027 — Delivery Zones |
| `batch:rbatch-028` | `#c5def5` | RBATCH-028 — Fleet Dashboard |
| `batch:rbatch-029` | `#c5def5` | RBATCH-029 — Route Optimization |
| `batch:rbatch-030` | `#c5def5` | RBATCH-030 — Vehicle Upgrades |
| `batch:rbatch-031` | `#c5def5` | RBATCH-031 — Phase 3 Integration |
| `batch:rbatch-032` | `#f9c513` | RBATCH-032 — Drone Research |
| `batch:rbatch-033` | `#f9c513` | RBATCH-033 — Drone Manufacturing |
| `batch:rbatch-034` | `#f9c513` | RBATCH-034 — DronePort Construction |
| `batch:rbatch-035` | `#f9c513` | RBATCH-035 — Battery Swapping |
| `batch:rbatch-036` | `#f9c513` | RBATCH-036 — Autonomous Delivery |
| `batch:rbatch-037` | `#f9c513` | RBATCH-037 — Flight Restrictions |
| `batch:rbatch-038` | `#f9c513` | RBATCH-038 — Phase 4 Integration |
| `batch:rbatch-039` | `#e11d48` | RBATCH-039 — Dynamic Market |
| `batch:rbatch-040` | `#e11d48` | RBATCH-040 — Loans & Investors |
| `batch:rbatch-041` | `#e11d48` | RBATCH-041 — Competition |
| `batch:rbatch-042` | `#a855f7` | RBATCH-042 — AI Dispatch Foundation |

---

### Epic Labels

Used to associate an issue with a named epic.

| Label | Color | Description |
|---|---|---|
| `epic:repo-documentation` | `#bfd4f2` | E-001 Repository Structure & Documentation |
| `epic:game-design-foundation` | `#bfd4f2` | E-002 Canonical Game Design Foundation |
| `epic:gdevelop-scaffold` | `#d4c5f9` | E-003 GDevelop Project Scaffold |
| `epic:asset-pipeline` | `#d4c5f9` | E-004 Asset Pipeline & Placeholder Assets |
| `epic:world-map` | `#d4c5f9` | E-005 World Map & Environment |
| `epic:player-movement` | `#d4c5f9` | E-006 Player Movement & Camera |
| `epic:order-generation` | `#d4c5f9` | E-007 Order Generation System |
| `epic:pickup-proximity` | `#d4c5f9` | E-008 Pickup Proximity System |
| `epic:delivery-completion` | `#d4c5f9` | E-009 Delivery Completion & Failure |
| `epic:economy-reputation` | `#d4c5f9` | E-010 Economy & Reputation Core |
| `epic:hud-notifications` | `#d4c5f9` | E-011 HUD & Notifications |
| `epic:mainmenu-gameflow` | `#d4c5f9` | E-012 MainMenu & Game Flow |
| `epic:company-management` | `#d4c5f9` | E-013 Company Management Scene |
| `epic:bicycle-ownership` | `#d4c5f9` | E-014 Bicycle Ownership System |
| `epic:save-load` | `#d4c5f9` | E-015 Save & Load System |
| `epic:mobile-optimization` | `#d4c5f9` | E-016 Mobile Optimization |
| `epic:integration-verification` | `#d4c5f9` | E-017 Full-Loop Integration Verification |
| `epic:employee-management` | `#c2e0c6` | E-018 Employee Management System |
| `epic:financial-reporting` | `#c2e0c6` | E-019 Financial Reporting & Daily Costs |
| `epic:customer-reputation` | `#c2e0c6` | E-020 Customer Reputation System |
| `epic:vehicle-fleet` | `#c2e0c6` | E-021 Vehicle Fleet Management |
| `epic:warehouse` | `#fef2c0` | E-022 Warehouse Infrastructure |
| `epic:multi-district` | `#fef2c0` | E-023 Multi-District Map Expansion |
| `epic:fleet-management` | `#fef2c0` | E-024 Fleet Management System |
| `epic:route-optimization` | `#fef2c0` | E-025 Route Optimization Engine |
| `epic:drone-research` | `#fbd3c8` | E-026 Drone Research & Technology Tree |
| `epic:drone-manufacturing` | `#fbd3c8` | E-027 Drone Manufacturing Partners |
| `epic:droneport` | `#fbd3c8` | E-028 DronePort Infrastructure System |
| `epic:battery-swapping` | `#fbd3c8` | E-029 Battery Swapping Network |
| `epic:autonomous-delivery` | `#fbd3c8` | E-030 Autonomous Delivery System |
| `epic:flight-restrictions` | `#fbd3c8` | E-031 Flight Restrictions & Weather |
| `epic:dynamic-market` | `#e8d7f0` | E-032 Dynamic Market System |
| `epic:fuel-electricity` | `#e8d7f0` | E-033 Fuel & Electricity Economy |
| `epic:loans-investors` | `#e8d7f0` | E-034 Business Loans & Investors |
| `epic:competition` | `#e8d7f0` | E-035 Competition & Market Rivals |
| `epic:smart-routing` | `#daf2e4` | E-036 Smart Routing & Predictive Demand |
| `epic:ai-dispatch` | `#daf2e4` | E-037 AI Dispatch & Autonomous Fleet |

---

### Status Labels

Used to indicate the current work status of an issue.

| Label | Color | Description |
|---|---|---|
| `status:blocked` | `#e4e669` | Blocked by an owner decision or external dependency |
| `status:in-progress` | `#0075ca` | Actively being implemented |
| `status:ready` | `#0e8a16` | Ready for implementation |
| `status:needs-design` | `#7057ff` | Requires design decision before implementation |
| `status:future` | `#cfd3d7` | Deferred to future planning iteration |

---

## Label Creation Note

Labels are defined here for planning purposes only.

Actual GitHub label objects must NOT be created during this PR.

Labels will be created as part of the GitHub setup workflow described in `GITHUB_CREATION_PLAN.md` and `github_creation_plan.yaml`.

---

End of Document
