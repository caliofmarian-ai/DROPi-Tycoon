# Document Information

Document: OWNER_DECISION_REGISTER.md
Project: DROPi Tycoon
Version: 1.3.0
Status: Implementation Preparation — Non-Authoritative
Author: AI Agent with Project Owner decisions
Language: English
Last Updated: 2026-09-01

---

# Owner Decision Register

## Scope

This register records canonically owner-governed implementation decisions and their resolution state.

ODR-002 was previously reclassified and removed.
ODR-004 was reclassified and removed on 2026-08-01.
ODR-001 and ODR-003 were resolved by the Project Owner on 2026-09-01 before RBATCH-014 implementation.

---

## Summary

| ID | Question | Decision | Resolution | Blocking impact |
|---|---|---|---|---|
| ODR-001 | Should player position be persisted? | **A — Do not persist player position in Prototype v0.1.** | RESOLVED 2026-09-01 | RBATCH-014 unblocked |
| ODR-003 | Which GameSettings fields beyond TutorialStatus persist in v0.1? | **B — Persist only TutorialStatus in Prototype v0.1.** | RESOLVED 2026-09-01 | RBATCH-014 unblocked |

---

## ODR-001 — Player Position Persistence

- **Exact question:** Should player position be persisted in Prototype v0.1 saves?
- **Canonical evidence:** `06_Technical/SAVE_SYSTEM.md` says player position is persisted only if required for the chosen prototype flow.
- **Supported options:**
  - A) Do not persist player position.
  - B) Persist player position.
- **Recommended option before resolution:** A (simpler flow and minimal save complexity).
- **Owner decision:** **A — Do not persist player position in Prototype v0.1.**
- **Decision date:** 2026-09-01.
- **Implementation consequence:** Save payloads must not include player coordinates. Loading regenerates the world/player starting state and restores progression separately. Active orders remain reset on load according to `SAVE_SYSTEM.md`.
- **Future compatibility:** This v0.1 choice is not a prohibition on later richer world-state persistence. A future save-format version may add position or broader world restoration through an explicit migration.
- **Blocking status:** RESOLVED — no longer blocks RBATCH-014.

## ODR-003 — GameSettings Persistence Scope

- **Exact question:** Persist only TutorialStatus, or also Sound/Music/Language/Difficulty?
- **Canonical evidence:** `09_Development/GAME_DATA_STRUCTURE.md` defines the fields; `06_Technical/SAVE_SYSTEM.md` leaves persistence scope beyond TutorialStatus owner-governed.
- **Supported options:**
  - A) Persist all listed GameSettings fields.
  - B) Persist only TutorialStatus in v0.1.
- **Recommended option before resolution:** B (minimal persisted scope for prototype).
- **Owner decision:** **B — Persist only TutorialStatus in Prototype v0.1.**
- **Decision date:** 2026-09-01.
- **Implementation consequence:** `TutorialStatus` is part of the v0.1 save contract. Language, Sound, Music, and Difficulty must not be serialized into the v0.1 save payload.
- **Future compatibility:** Later save-format versions may add additional settings without changing the v0.1 contract or coupling persistence to rendering technology.
- **Blocking status:** RESOLVED — no longer blocks RBATCH-014.

---

## Owner Direction — Long-Term Visual Quality

On 2026-09-01 the Project Owner clarified that the current prototype visuals are not the intended final quality bar. DROPi Tycoon is expected to evolve into a substantially more polished and visually impressive game over later phases.

This direction does **not** change the minimal functional scope of Prototype v0.1. Instead, implementation should preserve replaceable rendering/assets and avoid coupling core state, persistence, economy, logistics, or progression systems to temporary prototype graphics.

The purpose of the current prototype is to establish reliable gameplay and data foundations that can support later higher-fidelity art, animation, effects, environments, vehicles, buildings, UI presentation, and other visual improvements without rewriting the underlying game logic.

---

## Reclassification Record

### Former ODR-002 (Removed)

- **Former question:** Company name input in first session.
- **Reclassification:** Not an Owner decision.
- **Reason:** `FIRST_PLAYABLE_EXPERIENCE.md` already states the player chooses a company name; this is treated as canonical requirement coverage.
- **Blocking impact:** None.

### Former ODR-004 (Removed 2026-08-01)

- **Former question:** Which in-game condition triggers DeliveryFailed in v0.1?
- **Reclassification:** Not an unresolved Owner decision. Resolved by canonical documents.
- **Reason:** `09_Development/GAMEPLAY_EVENTS_FLOW.md` defines wrong destination as a `DeliveryFailed` reason and maps `PickedUp → Failed`; cancellation remains excluded from Prototype v0.1.
- **Implemented trigger:** Explicit interaction with a wrong delivery destination while carrying the active package causes `PickedUp → Failed`.
- **Canonical basis:** `GAMEPLAY_EVENTS_FLOW.md`, `PROTOTYPE_V0.1.md`, `ORDERS.md`.
- **Blocking impact:** None; BATCH-008 was implemented.

---

End of Document
