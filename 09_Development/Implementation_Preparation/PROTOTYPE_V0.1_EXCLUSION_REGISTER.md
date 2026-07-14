# Document Information

Document: PROTOTYPE_V0.1_EXCLUSION_REGISTER.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Implementation Preparation — Non-Authoritative
Author: AI Agent (Prototype v0.1 Implementation Preparation Task)
Language: English
Last Updated: 2026-07-14

---

# Prototype v0.1 Exclusion Register

## Purpose

This register explicitly records all features that must NOT enter Prototype v0.1.

Exclusions are derived from canonical documents, not from this task instruction alone.

The presence of a feature here means that if it appears in any implementation batch, that batch must be rejected.

---

## How to Use This Register

Before approving any implementation batch, verify that no batch introduces any feature listed in this register.

If a feature below is accidentally included in a batch, reject the batch and remove the feature before re-submission.

---

# Section 1 — Verified Exclusions from Canonical Documents

## EXC-001 — DronePorts

| Field | Value |
|---|---|
| Feature | DronePorts |
| Status | EXCLUDED from Prototype v0.1 |
| Canonical Sources | `PROTOTYPE_V0.1.md` Systems Not Included; `PROJECT_STATUS.md` Not Included In v0.1; `PROTOTYPE_RELEASE_CHECKLIST.md` Not Required For Prototype Release |
| Canonical Quote | "DronePorts — Systems Not Included" (`PROTOTYPE_V0.1.md`) |
| Roadmap Position | Phase 4 — Drone Technology (`ROADMAP.md`) |
| Note | DronePorts appear in `01_GameDesign/MISSIONS.md` (Stage 7+ qualifier) and `03_Logistics/DRONEPORTS.md` but both are confirmed as post-Prototype features. |

## EXC-002 — Drone Delivery

| Field | Value |
|---|---|
| Feature | Drone delivery, autonomous drone flight, drone operations |
| Status | EXCLUDED from Prototype v0.1 |
| Canonical Sources | `PROTOTYPE_V0.1.md` Systems Not Included; `FIRST_PLAYABLE_EXPERIENCE.md` Prototype Limitations; `PROTOTYPE_RELEASE_CHECKLIST.md` |
| Canonical Quote | "Drone delivery — Systems Not Included" (`PROTOTYPE_V0.1.md`) |
| Roadmap Position | Phase 4 |
| Note | `FIRST_PLAYABLE_EXPERIENCE.md` mentions "Drone (future options)" in Step 2 — this is a future option label only, not a Prototype v0.1 inclusion. |

## EXC-003 — Multiple Cities

| Field | Value |
|---|---|
| Feature | Multiple cities, city expansion, international cities |
| Status | EXCLUDED from Prototype v0.1 |
| Canonical Sources | `PROTOTYPE_V0.1.md` Systems Not Included; `PROJECT_STATUS.md` Not Included |
| Canonical Quote | "Multiple cities — Systems Not Included" (`PROTOTYPE_V0.1.md`) |
| Roadmap Position | Phase 7+ |

## EXC-004 — Multiplayer

| Field | Value |
|---|---|
| Feature | Multiplayer, cooperative play, competitive mode |
| Status | EXCLUDED from Prototype v0.1 |
| Canonical Sources | `PROTOTYPE_V0.1.md` Systems Not Included; `PROJECT_STATUS.md` Not Included; `PROTOTYPE_RELEASE_CHECKLIST.md` |
| Canonical Quote | "Multiplayer — Systems Not Included" (`PROTOTYPE_V0.1.md`) |
| Roadmap Position | Phase 9 |

## EXC-005 — Advanced AI / AI Automation

| Field | Value |
|---|---|
| Feature | Advanced AI agents, AI dispatch, AI fleet management, smart routing, predictive demand, AI employees |
| Status | EXCLUDED from Prototype v0.1 |
| Canonical Sources | `PROTOTYPE_V0.1.md` AI Scope (basic order generation only); Systems Not Included; `AI_SYSTEM.md` MVP AI Scope |
| Canonical Quote | "Advanced AI simulation — Not Included In v0.1" (`PROJECT_STATUS.md`); "Advanced AI systems are not included." (`PROTOTYPE_V0.1.md`) |
| Roadmap Position | Phase 6 |

## EXC-006 — Complex Economy

| Field | Value |
|---|---|
| Feature | Dynamic pricing, inflation, loans, investors, stock market, taxes, international currencies, insurance, financial reports, business valuation, cash flow analysis |
| Status | EXCLUDED from Prototype v0.1 |
| Canonical Sources | `PROTOTYPE_V0.1.md` Systems Not Included; `PROJECT_STATUS.md` Not Included; `ECONOMY.md` MVP Economy Scope |
| Canonical Quote | "Complex economy — Not Included In v0.1" (`PROJECT_STATUS.md`) |

## EXC-007 — Vehicles Beyond Bicycle

| Field | Value |
|---|---|
| Feature | Vans, motorcycles, electric scooters, trucks, autonomous vehicles, delivery robots |
| Status | EXCLUDED from Prototype v0.1 |
| Canonical Sources | `PROTOTYPE_V0.1.md` Transportation System (walking + Bicycle only); `VEHICLES.md` MVP Vehicle Scope |
| Canonical Quote | "No further vehicles are required for Prototype v0.1." (`PROTOTYPE_V0.1.md`) |
| Note | The Bicycle IS included. All other vehicles are excluded. |

## EXC-008 — Employee Hiring and Management

| Field | Value |
|---|---|
| Feature | Employee hiring, salaries, training, dispatching employees for deliveries, employee AI |
| Status | EXCLUDED from Prototype v0.1 |
| Canonical Sources | `PROGRESSION.md` Stage 2 (employees are Stage 2 feature); `CORE_GAMEPLAY_SYSTEMS.md` MVP Exclusions |
| Note | Player is the sole courier in Prototype v0.1 per `PROGRESSION.md` Stage 1. |

## EXC-009 — Cloud Save / Cross-Device Sync

| Field | Value |
|---|---|
| Feature | Cloud save, cross-device synchronization, account linking, multiple player profiles |
| Status | EXCLUDED from Prototype v0.1 |
| Canonical Sources | `SAVE_SYSTEM.md` Save Slot Policy; Future Expansion section |
| Canonical Quote | "No cross-device synchronization. No cloud save. No account linking." (`SAVE_SYSTEM.md`) |

## EXC-010 — Multiple Save Slots

| Field | Value |
|---|---|
| Feature | Multiple save slots, named saves |
| Status | EXCLUDED from Prototype v0.1 |
| Canonical Sources | `SAVE_SYSTEM.md` Save Slot Policy |
| Canonical Quote | "Prototype v0.1 uses one local save slot. No multiple slots. No named saves." (`SAVE_SYSTEM.md`) |

## EXC-011 — Online / Backend Services

| Field | Value |
|---|---|
| Feature | Server backend, online API, REST endpoints, database server, analytics backend |
| Status | EXCLUDED from Prototype v0.1 |
| Canonical Sources | `SAVE_SYSTEM.md` GDevelop Implementation Boundary; `PROTOTYPE_V0.1.md` |
| Canonical Quote | "No external backend, server, or cloud API is used." (`SAVE_SYSTEM.md`) |

## EXC-012 — Warehouses and Distribution Infrastructure

| Field | Value |
|---|---|
| Feature | Warehouses, distribution hubs, logistics centers, depot management |
| Status | EXCLUDED from Prototype v0.1 |
| Canonical Sources | `PROGRESSION.md` Stage 4+ |

## EXC-013 — Route Planning and Optimization Systems

| Field | Value |
|---|---|
| Feature | AI route optimization, automated dispatch, delivery zone management, fleet routing |
| Status | EXCLUDED from Prototype v0.1 |
| Canonical Sources | `CORE_GAMEPLAY_SYSTEMS.md` MVP Exclusions |
| Canonical Quote | "Not included: ...Route optimization..." (`CORE_GAMEPLAY_SYSTEMS.md`) |

## EXC-014 — Weather System

| Field | Value |
|---|---|
| Feature | Weather effects (rain, snow), traffic simulation, environmental challenges |
| Status | EXCLUDED from Prototype v0.1 |
| Canonical Sources | `CORE_GAMEPLAY_SYSTEMS.md` MVP Exclusions; `GAMEPLAY.md` Dynamic Gameplay (future systems) |

## EXC-015 — Multi-Package Orders

| Field | Value |
|---|---|
| Feature | Multi-package delivery, bulk orders, cargo capacity management |
| Status | EXCLUDED from Prototype v0.1 |
| Canonical Sources | `CORE_GAMEPLAY_SYSTEMS.md` MVP Order Rules (one active order at a time) |

## EXC-016 — Competitive Bidding and Contract Orders

| Field | Value |
|---|---|
| Feature | Competitive order bidding, contract systems, business partnerships |
| Status | EXCLUDED from Prototype v0.1 |
| Canonical Sources | `ORDERS.md` Order Availability (future versions); `CORE_GAMEPLAY_SYSTEMS.md` MVP Order Rules |

## EXC-017 — Advanced Vehicle Mechanics

| Field | Value |
|---|---|
| Feature | Vehicle maintenance, fuel systems, damage, enter/exit animations, reliability systems for Bicycle |
| Status | EXCLUDED from Prototype v0.1 |
| Canonical Sources | `PROTOTYPE_V0.1.md` Transportation System / Bicycle |
| Canonical Quote | "No advanced vehicle mechanics (maintenance, fuel, damage, enter/exit animation) are required for Prototype v0.1." |

## EXC-018 — Advanced AI Game Agents

| Field | Value |
|---|---|
| Feature | In-game AI employees, AI-controlled couriers, autonomous logistics AI, recommendation AI, Logistics AI agent |
| Status | EXCLUDED from Prototype v0.1 |
| Canonical Sources | `AI_SYSTEM.md` MVP AI Scope; `AI_AGENTS.md`; `PROTOTYPE_V0.1.md` |
| Note | Basic order generation (automated order creation) IS included. In-game AI agents for operations are not. |

## EXC-019 — Building Upgrades and City Development

| Field | Value |
|---|---|
| Feature | Building evolution, real estate investment, city growth simulation, urban development |
| Status | EXCLUDED from Prototype v0.1 |
| Canonical Sources | `BUILDINGS.md` Future Expansion section |

## EXC-020 — Tutorials Beyond First-Session Guidance

| Field | Value |
|---|---|
| Feature | Extended tutorial systems, tooltip overlays, forced tutorial sequences beyond first delivery |
| Status | NOT REQUIRED for Prototype v0.1 (beyond first-session guidance) |
| Canonical Sources | `FIRST_PLAYABLE_EXPERIENCE.md` — "tutorial teaches through actions, no long explanations" |
| Note | This is a guidance limit, not a hard exclusion. Tutorial completion tracking IS required. |

---

# Section 2 — Exclusion Verification Status

| Exclusion | Verified in Requirements Inventory | Verified in Architecture | Verified in Batch Plan |
|---|---|---|---|
| EXC-001 DronePorts | ✓ REQ-EXC-001 | ✓ Not in scene list or objects | ✓ No batch covers DronePorts |
| EXC-002 Drones | ✓ REQ-EXC-002 | ✓ Not in architecture | ✓ No batch covers drones |
| EXC-003 Multiple Cities | ✓ REQ-EXC-003 | ✓ One map only | ✓ One map in BATCH-004 |
| EXC-004 Multiplayer | ✓ REQ-EXC-004 | ✓ Not in architecture | ✓ No batch covers multiplayer |
| EXC-005 Advanced AI | ✓ REQ-152 | ✓ Basic order gen only | ✓ Only basic AI in BATCH-005 |
| EXC-006 Complex Economy | ✓ REQ-162, 163 | ✓ Money only | ✓ BATCH-009 money only |
| EXC-007 Other Vehicles | ✓ REQ-EXC-007 | ✓ Bicycle only | ✓ BATCH-012 Bicycle only |
| EXC-008 Employees | ✓ REQ-155 | ✓ Player only | ✓ No employee batch |
| EXC-009 Cloud Save | ✓ REQ-121, 135 | ✓ Local only | ✓ BATCH-013 local only |
| EXC-010 Multiple Slots | ✓ REQ-121 | ✓ One slot | ✓ BATCH-013 one slot |
| EXC-011 Online Backend | ✓ REQ-135 | ✓ GDevelop storage only | ✓ No backend batch |
| EXC-012 Warehouses | ✓ | ✓ | ✓ |
| EXC-013 Route Planning | ✓ REQ-157 | ✓ | ✓ |
| EXC-014 Weather | ✓ | ✓ | ✓ |
| EXC-015 Multi-Package | ✓ REQ-156 | ✓ | ✓ |
| EXC-016 Contract Bidding | ✓ | ✓ | ✓ |
| EXC-017 Vehicle Mechanics | ✓ REQ-079b | ✓ | ✓ |
| EXC-018 AI Agents | ✓ REQ-152 | ✓ | ✓ |
| EXC-019 Building Upgrades | ✓ | ✓ | ✓ |
| EXC-020 Extended Tutorials | ✓ | ✓ | ✓ |

**All exclusions verified against requirements inventory, architecture, and batch plan.**

---

# Section 3 — Exclusion Monitoring Rule

During any implementation batch execution:

1. Before submitting any batch PR: check that no excluded feature has been introduced
2. If an excluded feature is found in a batch: **REJECT the batch** and remove the feature before resubmission
3. If a Project Owner explicitly decides to bring an excluded feature into Prototype v0.1: that decision must be recorded in the appropriate canonical document first, then this register updated accordingly

---

End of Document
