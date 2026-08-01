# Document Information

Document: GITHUB_CREATION_PLAN.md
Project: DROPi Tycoon
Version: 1.2.0
Status: Planning — Canonical
Author: AI Agent (Report 087)
Language: English
Last Updated: 2026-08-01

---

# GitHub Creation Plan

This is a planning document only. No GitHub milestones, labels, issues, or Projects are created or modified by this PR.

## Final Counts

| Item | Count |
|---|---|
| Milestones | 21 |
| Epics | 46 |
| Batches | 54 |
| Labels | 122 |
| Executable Issues | 34 |
| Future Placeholders | 32 |

## Inspection Boundary and Required Limitation

- Existing GitHub milestone objects were not directly inspected.
- Existing labels, issues, and Projects must also be reconciled before creation.
- No claim may be made that those objects were inspected if the available tools did not support it.
- The creation plan must not run until manual or independent reconciliation and owner approval occur.

Independent repository issue search for `RBATCH` does not prove that labels, milestones, or Projects were absent. Manual or independent reconciliation remains mandatory.

## Status Authorization Policy

- Use status:ready only when the issue is implementation-authorized and its parent milestone and batch are not Planned — Future.
- Use status:future when the specification exists but parent roadmap status still prevents implementation authorization.
- Do not create or assign future-status executable issues as active implementation work until manual reconciliation, owner approval, and parent-status advancement occur.

## Non-Destructive Execution Procedure

1. **Owner approval gate** — stop unless the Project Owner explicitly authorizes creation after independent reconciliation.
2. **Existing-object inventory and reconciliation** — inventory current milestones, labels, issues, and Projects before any create action.
3. **Conflict reporting behaviour** — if an existing object conflicts on title, meaning, status, colour, or hierarchy, stop and produce a conflict report rather than mutating it.
4. **Milestone reconciliation/creation** — reconcile milestones against the YAML IDs and titles first; create only missing milestones after approval.
5. **Label reconciliation/creation** — reconcile label names and colours against `LABEL_TAXONOMY.md`; create only missing labels non-destructively.
6. **Issue/placeholder creation order** — create implementation-authorized executable issues before any future-status executable specifications; create planning placeholders only after milestone/label reconciliation.
7. **Dependency and parent assignment** — after creation, assign the canonical milestone, labels, and dependency references from `github_creation_plan.yaml` without improvisation.
8. **Duplicate prevention / idempotency rules** — never create a second object when the canonical ID label or title-equivalent object already exists; update nothing without separate approval.
9. **Verification after creation** — re-query the repository to confirm object counts, labels, milestone links, dependencies, and status policy alignment.
10. **Stop conditions** — stop immediately on ambiguous ownership, missing inspection capability, duplicate risk, unauthorized destructive change, or parent/child mismatch.
11. **Explicit prohibition** — deletion, renaming, replacement, state rewriting, or Project mutation require separate explicit approval and are out of scope for this plan.

## Owner Directive Coverage Matrix

| Strategic Domain | Mapping | References | Notes |
|---|---|---|---|
| global persistent world architecture | Explicitly deferred owner-gated planning item | M-021, E-044, RBATCH-051, RBATCH-052, 06_Technical/SAVE_SYSTEM.md | Dedicated multiplayer canonical architecture audit required before executable implementation. |
| hierarchical world scale | Existing milestone/epic/batch/placeholder | M-019, E-038, E-040, RBATCH-043, RBATCH-046 | Represented through multi-city and intermodal expansion planning. |
| visibility versus operational access | Explicitly deferred owner-gated planning item | M-019, E-038, E-039 | Ownership and canonical location remain owner-directed and require manual integration. |
| company expansion | Existing milestone/epic/batch/placeholder | M-006, E-013, E-014, M-020, E-043 | Early company growth and later franchise expansion are both represented. |
| logistics infrastructure | Existing milestone/epic/batch/placeholder | M-011, E-022, M-014, E-028, M-019, E-040 | Warehouse, DronePort, and gateway infrastructure are planned. |
| DronePort architecture | Existing milestone/epic/batch/placeholder | 03_Logistics/DRONEPORTS.md, M-014, E-028, RBATCH-034 | DronePort planning is explicit and remains future work. |
| logistics coverage | Existing milestone/epic/batch/placeholder | 03_Logistics/LOGISTICS.md, M-019, E-038, E-039, E-040 | Coverage expands from prototype logistics to international operations. |
| multimodal logistics | Existing milestone/epic/batch/placeholder | M-019, E-040, RBATCH-046 | International intermodal gateways cover the multimodal branch. |
| global and regional economy | Existing milestone/epic/batch/placeholder | M-016, E-032, E-033, M-017, E-034, E-035 | Regional and macro-economy planning exists in phases 5 and 8. |
| marketplace and player-to-player economy | Explicitly deferred owner-gated planning item | 02_Economy/MARKET.md, M-017, E-035 | Marketplace expansion beyond existing canon remains owner-gated and not decomposed into executable work. |
| standard/premium currency separation | Explicitly deferred owner-gated planning item | 02_Economy/ECONOMY.md | Owner directive raises this as strategy; no canonical implementation authorization exists yet. |
| vehicle categories, models, instances, attributes, maintenance, upgrades, and marketplace | Existing milestone/epic/batch/placeholder | 03_Logistics/VEHICLES.md, M-010, E-021, RBATCH-022, RBATCH-023, M-012, E-025, RBATCH-030 | Vehicle marketplace ownership remains deferred even though purchase/maintenance/upgrade branches are planned. |
| company identity and value | Cross-cutting governance requirement | 00_Project/VISION.md, 01_GameDesign/PROGRESSION.md, M-006, M-020 | Company identity/value spans canonical vision plus future governance/corporate milestones. |
| employees | Existing milestone/epic/batch/issue/placeholder | M-009, E-018, RBATCH-018, ISSUE-024, ISSUE-026, ISSUE-032 | Employee management is explicitly planned. |
| partners | Existing milestone/epic/batch/placeholder | M-013, E-027, RBATCH-033 | Manufacturing/logistics partner planning exists. |
| merchants | Cross-cutting governance requirement | 03_Logistics/LOGISTICS.md, 03_Logistics/ORDERS.md | Merchants remain part of current logistics canon but do not yet have a separate planning branch. |
| AI roles | Existing milestone/epic/batch/placeholder | 05_AI/AI_SYSTEM.md, 05_AI/AI_AGENTS.md, M-018, E-036, E-037, M-021, E-045 | Routing, dispatch, and later robotics/autonomy are planned. |
| corporate growth | Existing milestone/epic/batch/placeholder | M-017, E-034, E-035, M-020, E-041, E-042, E-043 | Financial competition and governance phases represent corporate growth. |
| player and progression philosophy | Cross-cutting governance requirement | 01_GameDesign/PROGRESSION.md, 09_Development/PROTOTYPE_V0.1.md, M-005, M-006 | Progression remains canon-owned and planning must not outrun prototype philosophy. |
| difficulty and failure | Cross-cutting governance requirement | 09_Development/GAME_BALANCING_RULES.md, ISSUE-003, ISSUE-004 | Failure effects remain canon/balancing-governed and no extra penalty is authorized. |
| multiplayer | Explicitly deferred owner-gated planning item | M-021, E-044, RBATCH-051, RBATCH-052 | Multiplayer requires owner-gated canonical architecture before implementation. |
| persistence | Existing milestone/epic/batch/issue/placeholder | 06_Technical/SAVE_SYSTEM.md, M-007, E-015, RBATCH-014, ISSUE-014, ISSUE-015, ISSUE-016, ISSUE-017 | Persistence is planned but blocked by ODR-001 and ODR-003. |
| backward compatibility | Cross-cutting governance requirement | 00_Project/ROADMAP.md, 06_Technical/SAVE_SYSTEM.md | Save compatibility and roadmap stability are governance obligations rather than standalone implementation work. |
| community/frontier expansion | Explicitly deferred owner-gated planning item | M-021, E-046, RBATCH-054, PLACEHOLDER-030 | Owner-gated late-phase expansion only. |
| cross-project canonical-alignment obligations | Cross-cutting governance requirement | 00_Project/ROADMAP.md, 00_Project/PROJECT_STATUS.md, 09_Development/Owner_Directives/2026-07-16_MASTER_OWNER_DIRECTIVE_001.md | Alignment obligations are documented as governance and require deliberate canonical integration, not automatic implementation. |

## Pre-Execution Checklist

- [ ] Owner approval obtained
- [ ] Existing GitHub milestones reconciled
- [ ] Existing GitHub labels reconciled
- [ ] Existing GitHub issues and Projects reconciled
- [ ] `github_creation_plan.yaml` parsed successfully
- [ ] Future-status executable issues remain non-authorized until parent roadmap status advances
- [ ] No destructive action has been implicitly authorized

---

End of Document
