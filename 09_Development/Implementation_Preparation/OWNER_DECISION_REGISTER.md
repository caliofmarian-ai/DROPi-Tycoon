# Document Information

Document: OWNER_DECISION_REGISTER.md
Project: DROPi Tycoon
Version: 1.2.0
Status: Implementation Preparation — Non-Authoritative
Author: AI Agent (PR #56 correction from Report 057; ODR-004 reclassified per Report 085 on 2026-08-01)
Language: English
Last Updated: 2026-08-01

---

# Owner Decision Register (Corrected)

## Scope

This register includes only unresolved decisions that are canonically owner-governed.

ODR-002 from PR #56 was reclassified and removed from this register.
ODR-004 was reclassified and removed from this register on 2026-08-01.

---

## Summary

| ID | Question | Owner decision? | Blocking batch | Blocks BATCH-001? |
|---|---|---|---|---|
| ODR-001 | Should player position be persisted? | Yes | BATCH-013 | No |
| ODR-003 | Which GameSettings fields beyond TutorialStatus persist in v0.1? | Yes | BATCH-013 | No |

---

## ODR-001 — Player Position Persistence

- **Exact question:** Should player position be persisted in Prototype v0.1 saves?
- **Canonical evidence:** `SAVE_SYSTEM.md` says player position is persisted only if required for chosen prototype flow.
- **Supported options:**
  - A) Do not persist player position.
  - B) Persist player position.
- **Recommended option:** A (simpler flow and minimal save complexity).
- **Why this is an Owner decision:** Canonical documents intentionally leave this conditional unresolved.
- **Exact blocking batch:** BATCH-013.
- **Blocking status:** Does not block BATCH-001; blocks later persistence implementation if unresolved.

## ODR-003 — GameSettings Persistence Scope

- **Exact question:** Persist only TutorialStatus, or also Sound/Music/Language/Difficulty?
- **Canonical evidence:** `GAME_DATA_STRUCTURE.md` defines fields; `SAVE_SYSTEM.md` does not finalize persistence scope beyond TutorialStatus.
- **Supported options:**
  - A) Persist all listed GameSettings fields.
  - B) Persist only TutorialStatus in v0.1.
- **Recommended option:** B (minimal persisted scope for prototype).
- **Why this is an Owner decision:** Persistence semantics are canonically owned by save-system authority and unresolved.
- **Exact blocking batch:** BATCH-013.
- **Blocking status:** Does not block BATCH-001; blocks later persistence implementation if unresolved.

---

## Reclassification Record

### Former ODR-002 (Removed)

- **Former question:** Company name input in first session.
- **Reclassification:** Not an Owner decision.
- **Reason:** `FIRST_PLAYABLE_EXPERIENCE.md` already states player chooses company name; this is now treated as canonical requirement coverage in the inventory.
- **Blocking impact:** None on BATCH-001.

### Former ODR-004 (Removed 2026-08-01)

- **Former question:** Which in-game condition triggers DeliveryFailed in v0.1?
- **Reclassification:** Not an unresolved Owner decision. Resolved by canonical documents.
- **Reason:** The preparation register had incorrectly treated the `DeliveryFailed` trigger as unresolved and recommended manual cancellation as Option A. This conflicts with the canonical Prototype v0.1 event boundaries:
  - `09_Development/GAMEPLAY_EVENTS_FLOW.md` explicitly lists "Wrong destination" as a `DeliveryFailed` reason.
  - `09_Development/GAMEPLAY_EVENTS_FLOW.md` confirms the `DeliveryFailed` event maps `PickedUp → Failed`.
  - `09_Development/PROTOTYPE_V0.1.md` confirms terminal states `Completed` and `Failed` are in scope.
  - Cancellation events are excluded from Prototype v0.1 per canonical documents.
  - The Project Owner instructed the AI agent on 2026-08-01 to apply the canonical documents without requesting a duplicate decision.
- **Implemented trigger:** Explicit interaction with a wrong delivery destination while carrying the active package causes `PickedUp → Failed`.
- **Canonical basis:** `GAMEPLAY_EVENTS_FLOW.md`, `PROTOTYPE_V0.1.md`, `ORDERS.md`.
- **Blocking impact:** ODR-004 no longer blocks BATCH-008. BATCH-008 is implemented.

---

End of Document
