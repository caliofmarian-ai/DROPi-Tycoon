# Document Information

Document: OWNER_DECISION_REGISTER.md
Project: DROPi Tycoon
Version: 1.1.0
Status: Implementation Preparation — Non-Authoritative
Author: AI Agent (PR #56 correction from Report 057)
Language: English
Last Updated: 2026-07-14

---

# Owner Decision Register (Corrected)

## Scope

This register includes only unresolved decisions that are canonically owner-governed.

ODR-002 from PR #56 was reclassified and removed from this register.

---

## Summary

| ID | Question | Owner decision? | Blocking batch | Blocks BATCH-001? |
|---|---|---|---|---|
| ODR-001 | Should player position be persisted? | Yes | BATCH-013 | No |
| ODR-003 | Which GameSettings fields beyond TutorialStatus persist in v0.1? | Yes | BATCH-013 | No |
| ODR-004 | What concrete gameplay condition triggers DeliveryFailed? | Yes | BATCH-008 | No |

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

## ODR-004 — DeliveryFailed Trigger Definition

- **Exact question:** Which in-game condition triggers DeliveryFailed in v0.1?
- **Canonical evidence:** `PROTOTYPE_V0.1.md` requires failure branch; `GAMEPLAY_EVENTS_FLOW.md` gives examples, not one binding trigger.
- **Supported options:**
  - A) Manual cancel action.
  - B) Wrong destination interaction.
  - C) Timeout condition.
  - D) Combined subset approved by owner.
- **Recommended option:** A (minimal and testable in prototype scope).
- **Why this is an Owner decision:** This directly changes player-facing gameplay behavior.
- **Exact blocking batch:** BATCH-008.
- **Blocking status:** Does not block BATCH-001; blocks later failure implementation if unresolved.

---

## Reclassification Record

### Former ODR-002 (Removed)

- **Former question:** Company name input in first session.
- **Reclassification:** Not an Owner decision.
- **Reason:** `FIRST_PLAYABLE_EXPERIENCE.md` already states player chooses company name; this is now treated as canonical requirement coverage in the inventory.
- **Blocking impact:** None on BATCH-001.

---

End of Document
