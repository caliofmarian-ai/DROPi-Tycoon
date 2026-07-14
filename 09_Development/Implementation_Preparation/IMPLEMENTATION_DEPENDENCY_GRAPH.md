# Document Information

Document: IMPLEMENTATION_DEPENDENCY_GRAPH.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Implementation Preparation — Non-Authoritative
Author: AI Agent (Prototype v0.1 Implementation Preparation Task)
Language: English
Last Updated: 2026-07-14

---

# Implementation Dependency Graph

## Purpose

This document defines the explicit dependency relationships between implementation batches for DROPi Tycoon Prototype v0.1.

It identifies the critical path, parallelizable work, blocking dependencies, and integration points.

**This document does not create implementation files. It governs implementation order.**

---

## Legend

```
A ──→ B       B depends on A (A must be completed before B starts)
A ══→ B       B has a strong blocking dependency on A
[ A ║ B ]     A and B can be executed in parallel
(OWNER)       Requires owner decision before execution
```

---

# Dependency Map

## Foundation Layer

```
BATCH-001: Repository & GDevelop Project Foundation
  └─ No dependencies (starting from empty)
```

---

## Project Structure Layer

```
BATCH-002: Scene Scaffold & Global Variable Schema
  └── depends on: BATCH-001

BATCH-003: Asset Directory Structure & Placeholder Assets
  └── depends on: BATCH-001
```

**BATCH-002 and BATCH-003 are parallelizable after BATCH-001.**

---

## World and Player Layer

```
BATCH-004: GameWorld Map & Player Object
  └── depends on: BATCH-002, BATCH-003

BATCH-004 blocks:
  └── All gameplay batches (BATCH-005 through BATCH-011)
```

---

## Core Systems Layer

```
BATCH-005: Order System (generation + lifecycle)
  └── depends on: BATCH-004

BATCH-006: Player Movement & Tap-to-Move
  └── depends on: BATCH-004
```

**BATCH-005 and BATCH-006 are parallelizable after BATCH-004.**

---

## Delivery Loop Layer

```
BATCH-007: Order Acceptance & Pickup
  └── depends on: BATCH-005, BATCH-006

BATCH-008: Delivery Completion & Failure
  └── depends on: BATCH-007

BATCH-009: Economy System (rewards + money)
  └── depends on: BATCH-008
```

---

## UI and Feedback Layer

```
BATCH-010: HUD & Notification System
  └── depends on: BATCH-007, BATCH-009

BATCH-010b: MainMenu Scene (Start/Continue/new game guard)
  └── depends on: BATCH-002
      NOTE: Can begin after BATCH-002 independently of BATCH-005–009
```

**BATCH-010b is parallelizable with BATCH-005 through BATCH-009 but must complete before BATCH-013.**

---

## Progression Layer

```
BATCH-011: Upgrade System & CompanyManagement Scene
  └── depends on: BATCH-009, BATCH-010

BATCH-012: Bicycle Purchase & Movement Speed Effect
  └── depends on: BATCH-011, BATCH-006
```

---

## Persistence Layer

```
BATCH-013: Save & Load System
  └── depends on: BATCH-011, BATCH-012, BATCH-010b
  NOTE: All persisted data must exist (CompanyData, UpgradeList, TutorialStatus)
        before Save/Load can be implemented fully
```

---

## Integration and Validation Layer

```
BATCH-014: Mobile Experience Optimization
  └── depends on: BATCH-010, BATCH-013

BATCH-015: Integration Test — Full Gameplay Loop
  └── depends on: BATCH-014 (all prior batches effectively)

BATCH-016: Prototype Release Checklist Verification (HUMAN APPROVAL REQUIRED)
  └── depends on: BATCH-015
  └── OWNER: Human Project Owner must approve before Prototype v0.1 is declared complete
```

---

# Full Dependency Graph (Text Notation)

```
BATCH-001 (GDevelop Foundation)
    ├──→ BATCH-002 (Scene Scaffold) ──→ BATCH-004 ──→ BATCH-005 ──→ BATCH-007 ──→ BATCH-008 ──→ BATCH-009 ──→ BATCH-010 ──→ BATCH-011 ──→ BATCH-012 ──→ BATCH-013
    │                                                  BATCH-006 ─┘                                                                        └───────────────────────────────────┘
    │         └──→ BATCH-010b (MainMenu) ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────→ BATCH-013
    └──→ BATCH-003 (Assets) ──→ BATCH-004

BATCH-013 ──→ BATCH-014 ──→ BATCH-015 ══→ BATCH-016 (OWNER APPROVAL)
```

---

# Critical Path

The critical path is the minimum sequence of batches that must complete before Prototype v0.1 can be released.

```
BATCH-001
  → BATCH-002
    → BATCH-003 (parallel with 002)
      → BATCH-004
        → BATCH-005 (parallel with 006)
        → BATCH-006
          → BATCH-007
            → BATCH-008
              → BATCH-009
                → BATCH-010 (parallel with 010b)
                  → BATCH-011
                    → BATCH-012
                      → BATCH-013
                        → BATCH-014
                          → BATCH-015
                            → BATCH-016 (OWNER APPROVAL)
```

**Total sequential critical path: 16 batches.**

---

# Parallelizable Work

| Parallel Group | Batches | Condition |
|---|---|---|
| Group A | BATCH-002 + BATCH-003 | Both depend only on BATCH-001 |
| Group B | BATCH-005 + BATCH-006 | Both depend only on BATCH-004 |
| Group C | BATCH-010b (MainMenu) | Can run alongside BATCH-005–012 after BATCH-002 |

---

# Blocking Dependencies

| Blocker | Blocked By | Reason |
|---|---|---|
| BATCH-002 | BATCH-001 | No scene scaffold without project |
| BATCH-004 | BATCH-002, BATCH-003 | Cannot build world without scenes and assets |
| BATCH-007 | BATCH-005 AND BATCH-006 | Acceptance requires both order system and player movement |
| BATCH-013 | All data-creating batches | Cannot persist data that doesn't exist yet |
| BATCH-016 | BATCH-015 AND human approval | Completion gate cannot be verified without full integration |

---

# Integration Points

Key integration points where multiple systems must work together before validation can proceed:

| Integration Point | Systems Involved | Batch |
|---|---|---|
| Player reaches pickup → PackagePickedUp fires | Player movement + Order system + Delivery detection | BATCH-007 |
| Player reaches destination → DeliveryCompleted → Money added → HUD updates | Delivery + Economy + UI | BATCH-008 + BATCH-009 + BATCH-010 |
| Upgrade purchased → UpgradeList updated → Effect applied → Autosave | CompanyManagement + ProgressionSystem + EconomySystem + SaveSystem | BATCH-011 + BATCH-013 |
| Bicycle purchased → BicycleOwned=true → MovementSpeed increased → Persisted | BATCH-012 + BATCH-013 |
| Continue button → Save loaded → CompanyData restored → GameWorld entered | MainMenu + SaveSystem + GameWorld | BATCH-013 |

---

# Dependency Summary Table

| Batch | Depends On | Can Parallelize With |
|---|---|---|
| BATCH-001 | None | — |
| BATCH-002 | BATCH-001 | BATCH-003 |
| BATCH-003 | BATCH-001 | BATCH-002 |
| BATCH-004 | BATCH-002, BATCH-003 | — |
| BATCH-005 | BATCH-004 | BATCH-006 |
| BATCH-006 | BATCH-004 | BATCH-005 |
| BATCH-007 | BATCH-005, BATCH-006 | BATCH-010b |
| BATCH-008 | BATCH-007 | BATCH-010b |
| BATCH-009 | BATCH-008 | BATCH-010b |
| BATCH-010 | BATCH-007, BATCH-009 | BATCH-010b |
| BATCH-010b | BATCH-002 | BATCH-005 through BATCH-012 |
| BATCH-011 | BATCH-009, BATCH-010 | — |
| BATCH-012 | BATCH-011, BATCH-006 | — |
| BATCH-013 | BATCH-011, BATCH-012, BATCH-010b | — |
| BATCH-014 | BATCH-013 | — |
| BATCH-015 | BATCH-014 | — |
| BATCH-016 | BATCH-015 | — (requires human) |

---

# Foundation Dependencies

The following must be resolved before any implementation begins:

1. **GDevelop project file must exist** (BATCH-001) before any scenes can be created
2. **Scene scaffold must exist** (BATCH-002) before any scene-specific events can be written
3. **Placeholder assets must exist** (BATCH-003) before any objects requiring sprites can be added to scenes
4. **Global variable schema must be defined** (BATCH-002) before any system can read/write CompanyData or GameSettings

---

# Save / Load Dependencies

Save & Load (BATCH-013) has the most complex dependencies:

1. `CompanyData.Money` must exist and be populated (BATCH-009)
2. `CompanyData.UpgradeList` must exist and be populated (BATCH-011)
3. `CompanyData.BicycleOwned` must exist (BATCH-012)
4. `GameSettings.TutorialStatus` must exist (BATCH-002 — global variable definition)
5. `SaveFormatVersion` must be defined (BATCH-001 or BATCH-002 — global variable definition)
6. MainMenu Continue/Start New Game guard must exist (BATCH-010b)

All of these must complete before BATCH-013 can be validated.

---

# Testing Dependencies

Test execution order follows implementation order:

1. BATCH-001: project opens and launches ✓
2. BATCH-004: player can move in world ✓
3. BATCH-007: complete pickup cycle ✓
4. BATCH-008: complete delivery cycle ✓
5. BATCH-009: money updates correctly ✓
6. BATCH-010: HUD visible, notifications work ✓
7. BATCH-011: upgrades purchasable ✓
8. BATCH-012: bicycle purchased, speed increases ✓
9. BATCH-013: all 7 persistence test cases pass ✓
10. BATCH-015: full gameplay loop runs without interruption ✓
11. BATCH-016: all 7 release checklist sections verified — human approval ✓

---

# Completion-Gate Dependencies

The completion gate (`PROTOTYPE_RELEASE_CHECKLIST.md`) cannot be verified until:

1. All P0 requirements are implemented and tested (BATCH-001 through BATCH-013)
2. All P1 requirements are implemented and tested (BATCH-014)
3. Full integration test passes (BATCH-015)
4. Human Project Owner reviews and approves (BATCH-016)

**No AI agent may declare Prototype v0.1 complete.** This authority belongs exclusively to the Project Owner through the `PROTOTYPE_RELEASE_CHECKLIST.md` process.

---

End of Document
