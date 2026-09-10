# DROPi Tycoon — Durable Operational Decisions

This file records operational/project-continuity decisions that materially constrain current or future AI work. It is not a gameplay/domain specification.

## D-683-001 — Repository-backed continuity

**Decision:** Project-critical operational continuity must not depend on ChatGPT conversation memory.

**Source:** Issue #683.

**Consequence:** Every significant DT session consumes and maintains repository-backed project memory.

**Rejected assumption:** A conversation summary or remembered chat state is sufficient durable authority.

---

## D-683-002 — No durable handoff means not operationally complete

**Decision:** `NO DURABLE HANDOFF = SESSION NOT OPERATIONALLY COMPLETE`.

A significant session cannot be treated as closed, paused, superseded, READY, HOLD or handed off until its repository-backed handoff preserves the required state.

**Source:** Issue #683.

---

## D-683-003 — Authority-layer separation

**Decision:** Keep canonical project/domain authority, historical AI reports, operational project memory, agent/session handoffs, durable decisions and the UNKNOWN/blocker register separate.

**Source:** Issue #683.

**Rejected assumption:** Historical `09_Development/AI_Reports/` automatically describe current operational truth.

---

## D-683-004 — Live GitHub is authoritative for mutable GitHub state

**Decision:** Before action, READY, audit or merge, re-read live main/Issue/PR/branch/head/checks. Persisted operational state is a last-known snapshot and must be reconciled.

**Source:** Issue #683 and `09_Development/GITHUB_WORKFLOW.md`.

**Rejected assumption:** A previously recorded SHA, mergeability value or CI result remains current merely because it is in a handoff.

---

## D-683-005 — #683 ownership and merge lock

**Decision:** #683 is a dedicated DT-00 governance/integration lane. DT-22 is a state source/consumer. DT-04 retains `.github/workflows/**`. No gameplay/domain specialist owns #683.

While the migration is in flight, normal specialist merges do not leapfrog #683 unless DT-00 records a new dependency decision.

**Source:** Issue #683 comment `5623698591`.

---

## D-683-006 — Raw chain-of-thought is out of scope

**Decision:** Persist conclusions, evidence, decisions, appropriate engineering rationale, constraints, rejected assumptions, ownership, blockers, UNKNOWNs, current status and next safe action. Do not persist raw/hidden model chain-of-thought.

**Source:** Issue #683.

---

## D-OWNER-001 — Owner-visible reporting

**Decision:** GitHub remains the technical evidence/journal, but the Project Owner must receive a meaningful Romanian chat summary after material work. The summary distinguishes BEFORE, CHANGED, AFTER, PLAYER/GAME IMPACT, MERGE STATUS, RISKS/WHAT REMAINS and NEXT OWNER ACTION.

**Source:** Issue #681 comment `5622216568`; backfilled Owner language directive 2026-09-10.

**Rejected assumption:** `continui`, `READY`, or a PR comment alone is a sufficient owner report.

---

## D-ASSET-001 — Persistent Library presence is not repository/legal readiness

**Decision:** Keep these dimensions separate:

`LIBRARY_PRESENT != REPOSITORY_ATTESTED != DT-19 production lifecycle != DT-13 legal/commercial qualification`.

**Source:** PR #679, DT-00 Library correction and Issue #681 Pass 004.

**Rejected assumption:** “binary not attested on main” means the asset does not exist.

---

## D-ASSET-002 — Asset preparation before visible city integration

**Decision:** Owner priority is to begin making the city visibly use the existing Library asset work. DT-19 must govern crop/prep/dimensions/lineage/repository ingestion first; DT-01 then consumes repository-ready assets for visible city placement. Do not bypass provenance/lineage/duplicate controls.

**Source:** Owner directive backfilled during #683 migration, coordinated with PR #679 and #413 ownership.

---

## D-EVOLUTION-001 — #665 is a bounded foundation, not complete city evolution

**Decision:** PR #665 is merged/exact-main verified, but parent #651 remains OPEN. Production `specialistIndex` and `infrastructureIndex` evidence remains explicit model proxy, not real DT-06 specialist or DT-20 facility truth.

**Source:** PR #665 and Issue #681 Pass 004.

---

## D-ECONOMY-001 — Exactly-once progression settlement boundary

**Decision:** The delivery transaction/root idempotency identity governs money + XP + entity loyalty + eligible specialist fragments exactly once. Fragments do not grant qualification, employment, specialist capability or company capability.

**Source:** merged PR #673 and current DT-00 handoff.

---

## D-GOV-001 — Branch protection is not silently changed

**Decision:** Existing evidence shows `main` branch protection/required-check enforcement is not active. #683 does not silently change that state; any change requires the owning governance/CI decision.

**Source:** DT-22 #681 audit evidence.
