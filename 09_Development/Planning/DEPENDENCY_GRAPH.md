# Document Information

Document: DEPENDENCY_GRAPH.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Planning — Canonical
Author: AI Agent (Report 086)
Language: English
Last Updated: 2026-08-01

---

# Dependency Graph

## Purpose

This document defines the complete dependency relationships for milestones, epics, and roadmap batches.

All graphs are verified to be acyclic (DAG).

---

## Milestone Dependency Graph

Milestones form a strict linear chain. No parallel or diverging milestone paths exist at this planning stage.

```
M-001 (Phase 0 — Foundation — COMPLETED)
  └─► M-002 (Phase 1 — Prototype Scaffold — COMPLETED)
        └─► M-003 (Phase 1 — World Navigation — COMPLETED)
              └─► M-004 (Phase 1 — Order Lifecycle Core — COMPLETED)
                    └─► M-005 (Phase 1 — Economy, HUD & Game Flow — Planned)
                          └─► M-006 (Phase 1 — Company Management & Bicycle — Planned)
                                └─► M-007 (Phase 1 — Save & Load System — Blocked: ODR)
                                      └─► M-008 (Phase 1 — Prototype v0.1 Verification — Planned)
                                            └─► M-009 (Phase 2 — Employee & Financial Systems — Future)
                                                  └─► M-010 (Phase 2 — Vehicle Fleet Management — Future)
                                                        └─► M-011 (Phase 3 — Warehouse & District — Future)
                                                              └─► M-012 (Phase 3 — Advanced Fleet — Future)
                                                                    └─► M-013 (Phase 4 — Drone Research — Future)
                                                                          └─► M-014 (Phase 4 — DronePort — Future)
                                                                                └─► M-015 (Phase 4 — Drone Ops — Future)
                                                                                      └─► M-016 (Phase 5 — Dynamic Market — Future)
                                                                                            └─► M-017 (Phase 5 — Finance & Competition — Future)
                                                                                                  └─► M-018 (Phase 6 — AI Systems — Future)
                                                                                                        └─► M-019 (Phase 7 — International — Future)
                                                                                                              └─► M-020 (Phase 8 — Global — Future)
                                                                                                                    └─► M-021 (Phase 9 — Endless — Future)
```

**Cycle check:** No cycles. Strict linear chain of 21 nodes.

---

## Epic Dependency Graph

Epics may have cross-milestone dependencies. All dependencies are listed below.

```
E-001 (no deps)
E-002 (no deps)
E-003 ─► E-001
E-004 ─► E-003
E-005 ─► E-003, E-004
E-006 ─► E-005
E-007 ─► E-005
E-008 ─► E-007, E-006
E-009 ─► E-008
E-010 ─► E-009
E-011 ─► E-010
E-012 ─► E-003
E-013 ─► E-010, E-011
E-014 ─► E-013, E-006
E-015 ─► E-013, E-014, E-012
E-016 ─► E-015
E-017 ─► E-016
E-018 ─► E-017
E-019 ─► E-018
E-020 ─► E-010
E-021 ─► E-019
E-022 ─► E-021
E-023 ─► E-022
E-024 ─► E-023
E-025 ─► E-024
E-026 ─► E-025
E-027 ─► E-026
E-028 ─► E-027
E-029 ─► E-028
E-030 ─► E-029
E-031 ─► E-030
E-032 ─► E-031
E-033 ─► E-032
E-034 ─► E-032
E-035 ─► E-034
E-036 ─► E-035
E-037 ─► E-036
```

**Topological order (one valid ordering):**
E-001, E-002, E-003, E-004, E-005, E-006, E-007, E-008, E-009, E-010, E-011, E-012, E-013, E-014, E-015, E-016, E-017, E-018, E-019, E-020, E-021, E-022, E-023, E-024, E-025, E-026, E-027, E-028, E-029, E-030, E-031, E-032, E-033, E-034, E-035, E-036, E-037

**Cycle check:** No cycles. All back-edges verified absent.

Note: E-020 (Customer Reputation) depends on E-010 (Economy Core), not E-017, reflecting a cross-milestone dependency within the Phase 2 epic design. This creates a convergent dependency path at E-021 but does not introduce a cycle.

---

## Batch Dependency Graph

### Completed Batches (RBATCH-001 through RBATCH-008)

```
RBATCH-001 (no deps — COMPLETED)
  ├─► RBATCH-002 (COMPLETED)
  └─► RBATCH-003 (COMPLETED)
        └─► RBATCH-004 (COMPLETED) ◄─ RBATCH-002
              ├─► RBATCH-005 (COMPLETED)
              │     └─► RBATCH-007 (COMPLETED) ◄─ RBATCH-006
              └─► RBATCH-006 (COMPLETED)
                    └─► RBATCH-007
                          └─► RBATCH-008 (COMPLETED)
```

### Prototype Remaining Batches (RBATCH-009 through RBATCH-017)

```
RBATCH-008
  └─► RBATCH-009 (Not Started)
        └─► RBATCH-010 (Not Started) ◄─ RBATCH-007
              └─► RBATCH-012 (Not Started) ◄─ RBATCH-009
                    └─► RBATCH-013 (Not Started) ◄─ RBATCH-006
                          └─► RBATCH-014 (Blocked: ODR) ◄─ RBATCH-011, RBATCH-012
                                └─► RBATCH-015 (Not Started) ◄─ RBATCH-010
                                      └─► RBATCH-016 (Not Started)
                                            └─► RBATCH-017 (Not Started)

RBATCH-002
  └─► RBATCH-011 (Not Started)
        └─► RBATCH-014
```

### Phase 2 Batches (RBATCH-018 through RBATCH-024)

```
RBATCH-017
  └─► RBATCH-018 (Future)
        └─► RBATCH-019 (Future)
              └─► RBATCH-022 (Future)
                    └─► RBATCH-023 (Future)
                          └─► RBATCH-024 (Future) ◄─ RBATCH-021

RBATCH-009
  └─► RBATCH-020 (Future)
        └─► RBATCH-021 (Future)
              └─► RBATCH-024
```

### Phase 3 Batches (RBATCH-025 through RBATCH-031)

```
RBATCH-024
  └─► RBATCH-025 (Future)
        └─► RBATCH-026 (Future)
              └─► RBATCH-027 (Future)
                    └─► RBATCH-028 (Future)
                          └─► RBATCH-029 (Future)
                                └─► RBATCH-030 (Future)
                                      └─► RBATCH-031 (Future) ◄─ RBATCH-024
```

### Phase 4 Batches (RBATCH-032 through RBATCH-038)

```
RBATCH-031
  └─► RBATCH-032 (Future)
        └─► RBATCH-033 (Future)
              └─► RBATCH-034 (Future)
                    └─► RBATCH-035 (Future)
                          └─► RBATCH-036 (Future)
                                └─► RBATCH-037 (Future)
                                      └─► RBATCH-038 (Future) ◄─ RBATCH-031
```

### Phase 5–6 Batches (RBATCH-039 through RBATCH-042)

```
RBATCH-038
  └─► RBATCH-039 (Future)
        └─► RBATCH-040 (Future)
              └─► RBATCH-041 (Future)
                    └─► RBATCH-042 (Future)
```

**Cycle check:** All batch dependency paths verified. No cycles. The graph is a DAG.

---

## Dependency Cross-Reference Table

| Batch | Depends On |
|---|---|
| RBATCH-001 | none |
| RBATCH-002 | RBATCH-001 |
| RBATCH-003 | RBATCH-001 |
| RBATCH-004 | RBATCH-002, RBATCH-003 |
| RBATCH-005 | RBATCH-004 |
| RBATCH-006 | RBATCH-004 |
| RBATCH-007 | RBATCH-005, RBATCH-006 |
| RBATCH-008 | RBATCH-007 |
| RBATCH-009 | RBATCH-008 |
| RBATCH-010 | RBATCH-007, RBATCH-009 |
| RBATCH-011 | RBATCH-002 |
| RBATCH-012 | RBATCH-009, RBATCH-010 |
| RBATCH-013 | RBATCH-012, RBATCH-006 |
| RBATCH-014 | RBATCH-012, RBATCH-013, RBATCH-011 |
| RBATCH-015 | RBATCH-010, RBATCH-014 |
| RBATCH-016 | RBATCH-015 |
| RBATCH-017 | RBATCH-016 |
| RBATCH-018 | RBATCH-017 |
| RBATCH-019 | RBATCH-018 |
| RBATCH-020 | RBATCH-009 |
| RBATCH-021 | RBATCH-020 |
| RBATCH-022 | RBATCH-019 |
| RBATCH-023 | RBATCH-022 |
| RBATCH-024 | RBATCH-021, RBATCH-023 |
| RBATCH-025 | RBATCH-024 |
| RBATCH-026 | RBATCH-025 |
| RBATCH-027 | RBATCH-026 |
| RBATCH-028 | RBATCH-027 |
| RBATCH-029 | RBATCH-028 |
| RBATCH-030 | RBATCH-029 |
| RBATCH-031 | RBATCH-024, RBATCH-030 |
| RBATCH-032 | RBATCH-031 |
| RBATCH-033 | RBATCH-032 |
| RBATCH-034 | RBATCH-033 |
| RBATCH-035 | RBATCH-034 |
| RBATCH-036 | RBATCH-035 |
| RBATCH-037 | RBATCH-036 |
| RBATCH-038 | RBATCH-031, RBATCH-037 |
| RBATCH-039 | RBATCH-038 |
| RBATCH-040 | RBATCH-039 |
| RBATCH-041 | RBATCH-040 |
| RBATCH-042 | RBATCH-041 |

---

## Acyclicity Proof Summary

- Milestone graph: 21 nodes, strict linear chain, 0 back-edges. Acyclic.
- Epic graph: 37 nodes, topological order exists, 0 back-edges verified. Acyclic.
- Batch graph: 42 nodes, topological order exists, 0 back-edges verified. Acyclic.

All dependency graphs pass DAG validation.

---

End of Document
