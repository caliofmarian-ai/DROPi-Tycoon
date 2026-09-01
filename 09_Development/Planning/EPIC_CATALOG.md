# Document Information

Document: EPIC_CATALOG.md
Project: DROPi Tycoon
Version: 1.3.0
Status: Planning — Canonical
Author: AI Agent (Report 087; RBATCH-011 reconciliation Report 091)
Language: English
Last Updated: 2026-09-01

---

# Epic Catalog

## Count Summary

- Total epics: **46**
- `E-001` and `E-002` remain completed canonical-documentation epics without legacy implementation-batch ownership.

## Epic Registry

| ID | Phase | Milestone | Title | Status | Batches | Depends On |
|---|---|---|---|---|---|---|
| E-001 | 0 | M-001 | Repository Structure & Documentation Framework | COMPLETED | none | none |
| E-002 | 0 | M-001 | Canonical Game Design Foundation | COMPLETED | none | none |
| E-003 | 1 | M-002 | Historical Scaffold & Runtime Foundation | COMPLETED | RBATCH-001, RBATCH-002 | E-001 |
| E-004 | 1 | M-002 | Asset Pipeline & Placeholder Assets | COMPLETED | RBATCH-003 | E-003 |
| E-005 | 1 | M-003 | World Map & Environment | COMPLETED | RBATCH-004 | E-003, E-004 |
| E-006 | 1 | M-003 | Player Movement & Camera | COMPLETED | RBATCH-006 | E-005 |
| E-007 | 1 | M-004 | Order Generation System | COMPLETED | RBATCH-005 | E-005 |
| E-008 | 1 | M-004 | Pickup Proximity System | COMPLETED | RBATCH-007 | E-007, E-006 |
| E-009 | 1 | M-004 | Delivery Completion & Failure | COMPLETED | RBATCH-008 | E-008 |
| E-010 | 1 | M-005 | Economy & Reputation Core | COMPLETED — merged PR #86 and Railway-verified 2026-08-02 | RBATCH-009 | E-009 |
| E-011 | 1 | M-005 | HUD & Notifications | MERGED — pending Railway/public verification | RBATCH-010 | E-010 |
| E-012 | 1 | M-005 | MainMenu & Game Flow | MERGED in PR #255 — pending Railway/public verification | RBATCH-011 | E-003 |
| E-013 | 1 | M-006 | Company Management Scene | MERGED in PR #256 — pending Railway/public verification | RBATCH-012 | E-010, E-011 |
| E-014 | 1 | M-006 | Bicycle Ownership System | MERGED in PR #257 — pending Railway/public verification | RBATCH-013 | E-013, E-006 |
| E-015 | 1 | M-007 | Save & Load System | PR #259 — validation complete; pending merge | RBATCH-014 | E-013, E-014, E-012 |
| E-016 | 1 | M-008 | Mobile Optimization | Planned — Not Started | RBATCH-015 | E-015 |
| E-017 | 1 | M-008 | Full-Loop Integration Verification | Planned — Not Started | RBATCH-016, RBATCH-017 | E-016 |
| E-018 | 2 | M-009 | Employee Management System | Planned — Future | RBATCH-018 | E-017 |
| E-019 | 2 | M-009 | Financial Reporting & Daily Costs | Planned — Future | RBATCH-019 | E-018 |
| E-020 | 2 | M-009 | Customer Review & Reputation System | Planned — Future | RBATCH-020, RBATCH-021 | E-010 |
| E-021 | 2 | M-010 | Vehicle Fleet Management | Planned — Future | RBATCH-022, RBATCH-023, RBATCH-024 | E-018, E-019, E-020 |
| E-022 | 3 | M-011 | Warehouse Infrastructure | Planned — Future | RBATCH-025 | E-021 |
| E-023 | 3 | M-011 | Multi-District Map Expansion | Planned — Future | RBATCH-026, RBATCH-027 | E-022 |
| E-024 | 3 | M-012 | Fleet Management System | Planned — Future | RBATCH-028 | E-023 |
| E-025 | 3 | M-012 | Route Optimization & Vehicle Upgrades | Planned — Future | RBATCH-029, RBATCH-030, RBATCH-031 | E-024 |
| E-026 | 4 | M-013 | Drone Research & Technology Tree | Planned — Future | RBATCH-032 | E-025 |
| E-027 | 4 | M-013 | Drone Manufacturing Partners | Planned — Future | RBATCH-033 | E-026 |
| E-028 | 4 | M-014 | DronePort Infrastructure System | Planned — Future | RBATCH-034 | E-027 |
| E-029 | 4 | M-014 | Battery Swapping Network | Planned — Future | RBATCH-035 | E-028 |
| E-030 | 4 | M-015 | Autonomous Delivery System | Planned — Future | RBATCH-036 | E-029 |
| E-031 | 4 | M-015 | Flight Restrictions & Weather | Planned — Future | RBATCH-037, RBATCH-038 | E-030 |
| E-032 | 5 | M-016 | Dynamic Market System | Planned — Future | RBATCH-039 | E-031 |
| E-033 | 5 | M-016 | Fuel & Electricity Economy | Planned — Future | RBATCH-039 | E-032 |
| E-034 | 5 | M-017 | Business Loans & Investors | Planned — Future | RBATCH-040 | E-032 |
| E-035 | 5 | M-017 | Competition & Market Rivals | Planned — Future | RBATCH-041 | E-033, E-034 |
| E-036 | 6 | M-018 | Smart Routing & Predictive Demand | Planned — Future | RBATCH-042 | E-035 |
| E-037 | 6 | M-018 | AI Dispatch & Autonomous Fleet | Planned — Future | RBATCH-042 | E-036 |
| E-038 | 7 | M-019 | International Operations Foundation | Planned — Future | RBATCH-043, RBATCH-044 | E-037 |
| E-039 | 7 | M-019 | Cross-Border Compliance & Customs | Planned — Future | RBATCH-045 | E-038 |
| E-040 | 7 | M-019 | International Intermodal Gateways | Planned — Future | RBATCH-046 | E-039 |
| E-041 | 8 | M-020 | Corporate Governance & Headquarters | Planned — Future | RBATCH-047 | E-040 |
| E-042 | 8 | M-020 | Public Markets & Investor Governance | Planned — Future | RBATCH-048 | E-041 |
| E-043 | 8 | M-020 | Franchise & Worldwide Network Orchestration | Planned — Future | RBATCH-049, RBATCH-050 | E-041, E-042 |
| E-044 | 9 | M-021 | Shared-World Multiplayer Foundation | Planned — Future | RBATCH-051, RBATCH-052 | E-043 |
| E-045 | 9 | M-021 | Robotics & Autonomous Operations Growth | Planned — Future | RBATCH-053 | E-044 |
| E-046 | 9 | M-021 | Community & Frontier Expansion Governance | Planned — Future | RBATCH-054 | E-044, E-045 |

---

End of Document