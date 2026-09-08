# Document Information

Document: DEPENDENCY_GRAPH.md
Project: DROPi Tycoon
Version: 2.0.1
Status: Planning — Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-08

---

# Dependency Graph

## Purpose

This document owns the current planning dependency interpretation.

The historical M/E/RBATCH graph is preserved below for traceability, but its old numeric/phase ordering is **not the current execution graph**.

Current execution follows:

- `00_Project/ROADMAP.md` v4+;
- `09_Development/Planning/PHASE1_IMPLEMENTATION_SEQUENCE.md`;
- current canonical domain prerequisites.

---

# 1. Current Causal Execution Graph

```text
CANON-BASELINE
|
+-- WORLD-GEOGRAPHY ------------------------> GLOBAL-MAP (#418)
|                                               |
|                                               +--> COUNTRY/REGION DRILL-DOWN
|                                               +--> SMARTPHONE-GPS (#349)
|
+-- WORLD-INSTANCE/ACTOR (#421) ------------+---------------------------+
|                                                                        |
+-- AUTHORITATIVE-TIME (#420) --------------+--> HUMAN-ECONOMIC-LIFE --+--> CAUSAL-LOCAL-ECONOMY (#419)
|                                                 | #436                  |     | inventory/demand
|                                                 | Personal Money        |     | cargo/custody
|                                                 | living costs          |     | settlement
|                                                 | Work Capacity         |     | visible consequence
|                                                 | wages                 |     |
|                                                                        |     |
+-- EXISTING-CITY/HQ/VEHICLE FOUNDATION --------------------------------+-----+
                                                                              |
                                                                              +--> PROFESSIONS/EQUIPMENT (#437)
                                                                              +--> COMPANY-FORMATION (#438)
                                                                                         |
CAUSAL-LOCAL-ECONOMY + PROFESSIONS + COMPANY-FORMATION -----------------------------> LIVING-CITY/PRODUCTION

WORLD-INSTANCE + TIME + CAUSAL-ECONOMY + COMPANY-FORMATION -----------------------> TRUSTED-MULTIPLAYER-AUTHORITY

GLOBAL-MAP + LIVING-CITY/PRODUCTION + TRUSTED-MULTIPLAYER-AUTHORITY ---------------> REGIONAL/NATIONAL MULTIMODAL

REGIONAL/NATIONAL MULTIMODAL ------------------------------------------------------> GLOBAL DYNAMIC ECONOMY/WORLD HISTORY
```

The Global Map is the first major visible checkpoint. Invisible foundations may proceed in parallel, but visible overlays cannot fabricate unfinished economy/traffic/world state.

---

# 2. Current Near-Term Dependency Nodes

| Node | Depends On | Existing Anchor | Execution Rule |
|---|---|---|---|
| Global geography/data | approved map/world canon | #417 | all countries, versioned dataset, no single-country hardcode |
| Global Map UI | geography/data | #418 | first major visible checkpoint; no fake economy |
| World Instance + world actor | Phase-1 baseline | #421 | can run parallel to map |
| Authoritative clock | Phase-1 baseline | #420 | clock first; slow cycles later |
| Personal Money/lifecycle | World actor + clock + economy ledger | #436 | employee-first start, living costs, Work Capacity |
| Causal inventory/order/cargo | economy canon + time interfaces | #419 first slice | replace arbitrary reward causality progressively |
| Smartphone/GPS hierarchy | stable map hierarchy + existing phone canon | #349 | one map truth |
| Professions/equipment | personal lifecycle + time/economy | #437 | earned capability |
| Company formation | Personal Money + professions + economy | #438 | no automatic founder start |
| Living city/production | causal economy + labor/company foundation | #419/#420 | population/production/waste/competition |
| Shared multiplayer authority | world actor + settlement domains | #348 + technical canon | migrate state family by family |
| Regional/global operations | map + local economy + authority/custody | #344 | no teleport; multi-leg logistics |

---

# 3. Parallelism Rules

Parallel implementation is allowed when one track does not invent authoritative state owned by another unfinished track.

Allowed examples:

- render country boundaries while economic overlays are absent;
- build pure World Instance IDs while current local Save remains untouched;
- implement deterministic clock domain before connecting every slow-cycle consumer;
- design Personal Money ledger before real networking, using a local authoritative adapter;
- extend visual locality nodes before acquisition/ownership UI exists.

Forbidden examples:

- fake trade lines presented as real simulated traffic;
- granting Personal Money from unexplained mission rewards;
- moving cargo through map selection;
- client-authoritative multiplayer money/ownership;
- purchasing a railway/industry solely because a level threshold was reached;
- making a new hero the owner of the legacy starter company without an explicit migration rule.

---

# 4. Legacy Planning Graph Status

The v1.x graph below was valid for its historical planning architecture and remains useful for identifying old ordering assumptions.

Classification:

**LEGACY ORDER / TRACEABILITY — DO NOT EXECUTE BLINDLY.**

Any historical milestone/epic/RBATCH used for new work must first be mapped to a current strategic wave/track and classified as KEEP / UPDATE / MERGE-ABSORB / CLOSE-HISTORICAL / NEW-CHILD-NEEDED.

---

# 5. Historical Milestone Dependencies

| Milestone | Historical Depends On |
|---|---|
| M-001 | none |
| M-002 | M-001 |
| M-003 | M-002 |
| M-004 | M-003 |
| M-005 | M-004 |
| M-006 | M-005 |
| M-007 | M-006 |
| M-008 | M-007 |
| M-009 | M-008 |
| M-010 | M-009 |
| M-011 | M-010 |
| M-012 | M-011 |
| M-013 | M-012 |
| M-014 | M-013 |
| M-015 | M-014 |
| M-016 | M-015 |
| M-017 | M-016 |
| M-018 | M-017 |
| M-019 | M-018 |
| M-020 | M-019 |
| M-021 | M-020 |

This chain is historical sequence evidence, not a current requirement that every later capability wait for every prior milestone number.

---

# 6. Historical Epic Dependencies

| Epic | Historical Depends On |
|---|---|
| E-001 | none |
| E-002 | none |
| E-003 | E-001 |
| E-004 | E-003 |
| E-005 | E-003, E-004 |
| E-006 | E-005 |
| E-007 | E-005 |
| E-008 | E-007, E-006 |
| E-009 | E-008 |
| E-010 | E-009 |
| E-011 | E-010 |
| E-012 | E-003 |
| E-013 | E-010, E-011 |
| E-014 | E-013, E-006 |
| E-015 | E-013, E-014, E-012 |
| E-016 | E-015 |
| E-017 | E-016 |
| E-018 | E-017 |
| E-019 | E-018 |
| E-020 | E-010 |
| E-021 | E-018, E-019, E-020 |
| E-022 | E-021 |
| E-023 | E-022 |
| E-024 | E-023 |
| E-025 | E-024 |
| E-026 | E-025 |
| E-027 | E-026 |
| E-028 | E-027 |
| E-029 | E-028 |
| E-030 | E-029 |
| E-031 | E-030 |
| E-032 | E-031 |
| E-033 | E-032 |
| E-034 | E-032 |
| E-035 | E-033, E-034 |
| E-036 | E-035 |
| E-037 | E-036 |
| E-038 | E-037 |
| E-039 | E-038 |
| E-040 | E-039 |
| E-041 | E-040 |
| E-042 | E-041 |
| E-043 | E-041, E-042 |
| E-044 | E-043 |
| E-045 | E-044 |
| E-046 | E-044, E-045 |

---

# 7. Historical RBATCH Dependencies

| Batch | Historical Depends On |
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
| RBATCH-043 | RBATCH-042 |
| RBATCH-044 | RBATCH-043 |
| RBATCH-045 | RBATCH-044 |
| RBATCH-046 | RBATCH-045 |
| RBATCH-047 | RBATCH-046 |
| RBATCH-048 | RBATCH-047 |
| RBATCH-049 | RBATCH-047 |
| RBATCH-050 | RBATCH-048, RBATCH-049 |
| RBATCH-051 | RBATCH-050 |
| RBATCH-052 | RBATCH-051 |
| RBATCH-053 | RBATCH-052 |
| RBATCH-054 | RBATCH-053 |

---

# 8. Acyclicity and Current Validation

The current causal graph is intentionally acyclic at the architecture level:

- identity/time/economy foundations precede systems that consume their truth;
- visible map work may proceed in parallel only while remaining read-only/sparse where underlying simulation is absent;
- trusted multiplayer authority precedes contested shared writes;
- regional/global operational networks depend on local economic/custody truth;
- global dynamic history depends on operational regional/global systems.

Historical graph acyclicity remains true but does not imply current execution priority.

---

# Canonical Planning Rule

**Dependency means causal truth, not numeric seniority. Historical identifiers remain traceable, while current execution follows the Phase-1 causal graph and Roadmap v4.**

---

End of Document
