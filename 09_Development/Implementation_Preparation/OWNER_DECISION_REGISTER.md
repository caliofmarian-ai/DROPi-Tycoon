# Document Information

Document: OWNER_DECISION_REGISTER.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Implementation Preparation — Non-Authoritative
Author: AI Agent (Prototype v0.1 Implementation Preparation Task)
Language: English
Last Updated: 2026-07-14

---

# Owner Decision Register

## Purpose

This register records every unresolved owner decision discovered during Prototype v0.1 implementation preparation.

These are decisions where canonical documentation does not provide a deterministic answer and where the Project Owner must make a choice before or during implementation.

Items classified as `IMPLEMENTATION DETAIL — AGENT MAY CHOOSE` are NOT listed here — those are in the separate `IMPLEMENTATION_DETAIL_REGISTER.md`.

---

## Classification

| Status | Meaning |
|---|---|
| **BLOCKING** | Blocks Batch 001 or the entire implementation from starting |
| **NON-BLOCKING** | Does not block Batch 001; must be resolved before the indicated batch |

---

## Summary

| ID | Decision | Blocks Batch | Blocking? |
|---|---|---|---|
| ODR-001 | Player position persistence | BATCH-013 | NON-BLOCKING |
| ODR-002 | Company name input in first session | BATCH-010b | NON-BLOCKING |
| ODR-003 | GameSettings persistence scope | BATCH-013 | NON-BLOCKING |
| ODR-004 | Failure trigger definition for Prototype v0.1 | BATCH-008 | NON-BLOCKING |

**None of these decisions block Batch 001. Batch 001 may begin.**

---

# ODR-001 — Player Position Persistence

## Question

Should the player's current map position be included in the save data for Prototype v0.1?

## Why the Decision Is Required

`SAVE_SYSTEM.md` (Required Saved Data / Player State) states:

> "Player position only if required for the chosen prototype flow."

This creates a conditional — it requires a decision about the prototype flow. The condition is genuine: if the player always starts at CompanyBase after loading, position need not be saved. If the player resumes from their last position, it must be saved.

## Canonical Documents Involved

- `SAVE_SYSTEM.md` — Required Saved Data / Player State

## Options Supported by Current Documentation

**Option A:** Do NOT persist player position.
- Player always starts at CompanyBase location when continuing the game.
- Simpler save data.
- Active order is already cancelled on load — starting at base is consistent.

**Option B:** DO persist player position.
- Player resumes from exact map position after closing and reopening.
- More immersive, but adds a save field.

## Recommended Option

**Option A — do not persist player position.**

Reasoning: The canonical requirement cancels the active order on load. Since the player has no delivery in progress on Continue, resuming at CompanyBase is a natural and simple flow. This minimizes save complexity per the SAFE System guidance and SAVE_SYSTEM.md's "save minimum state required" principle.

## Impact If Deferred

If deferred to BATCH-013 implementation: the implementing agent should default to Option A (do not persist position) unless the Project Owner overrides before BATCH-013 begins.

## Blocks Batch 001?

**No.** Position persistence is a BATCH-013 concern.

## Blocks Later Implementation?

Mildly. Must be resolved before BATCH-013 is executed. Default: Option A.

---

# ODR-002 — Company Name Input in First Session

## Question

Should the player be asked to input a company name at game start in Prototype v0.1?

## Why the Decision Is Required

`FIRST_PLAYABLE_EXPERIENCE.md` (Starting Situation / Company) states:

> "Player chooses company name."

`SAVE_SYSTEM.md` (Required Saved Data / Company Data) states:

> "Company name (if implemented in v0.1)"

This conditional language indicates the Project Owner has not made a final commitment.

## Canonical Documents Involved

- `FIRST_PLAYABLE_EXPERIENCE.md` — Starting Situation / Company
- `SAVE_SYSTEM.md` — Required Saved Data / Company Data

## Options Supported by Current Documentation

**Option A:** Implement company name input in the first-session flow.
- A text input prompt appears when starting a new game.
- CompanyData.CompanyName is set and persisted.
- Consistent with the first playable experience design.

**Option B:** Skip company name input for Prototype v0.1.
- CompanyData.CompanyName defaults to a fixed value (e.g., "My Company") or is left empty.
- Reduces first-session friction.
- SAVE_SYSTEM.md's conditional language supports deferral.

## Recommended Option

**Option A — implement company name input.**

Reasoning: `FIRST_PLAYABLE_EXPERIENCE.md` explicitly states "Player chooses company name." The save system conditional is permissive, not prohibitive. The emotional experience of naming your company on day one supports the "Starting small and building" fantasy (PROTOTYPE_V0.1.md, Prototype Vision).

## Impact If Deferred

If deferred or skipped: CompanyName defaults to empty or "My Company" — not ideal for player connection. SAVE_SYSTEM.md must be updated to remove the conditional if the decision is made to permanently skip it.

## Blocks Batch 001?

**No.**

## Blocks Later Implementation?

Must be resolved before BATCH-010b (MainMenu scene implementation).

---

# ODR-003 — GameSettings Persistence Scope

## Question

Which GameSettings fields (Sound, Music, Language, Difficulty) should be persisted in the Prototype v0.1 save?

## Why the Decision Is Required

`SAVE_SYSTEM.md` (Required Saved Data) states:

> "Language, Sound, Music, and Difficulty settings persistence is defined in `06_Technical/SAVE_SYSTEM.md`."

This self-referential statement does not specify whether these fields are persisted in Prototype v0.1 or deferred to a later version.

`GAME_DATA_STRUCTURE.md` (GameSettings) states these fields exist but does not specify their persistence scope.

## Canonical Documents Involved

- `SAVE_SYSTEM.md` — Required Saved Data / GameSettings
- `GAME_DATA_STRUCTURE.md` — GameSettings

## Options Supported by Current Documentation

**Option A:** Persist all GameSettings fields (TutorialStatus, Sound, Music, Language, Difficulty).
- Full settings experience.

**Option B:** Persist only TutorialStatus (the only explicitly required field).
- Sound, Music, Language, Difficulty reset to defaults on each launch.
- Minimal scope per SAVE_SYSTEM.md "save minimum state" philosophy.

## Recommended Option

**Option B — persist only TutorialStatus for Prototype v0.1.**

Reasoning: SAVE_SYSTEM.md explicitly requires TutorialStatus. Sound/Music/Language/Difficulty are secondary settings features. The "save minimum state required" philosophy supports deferral. This can be expanded in a post-prototype update without architecture changes.

## Impact If Deferred

Minimal. Settings reset on each launch — slightly less polished but not a gameplay blocker.

## Blocks Batch 001?

**No.**

## Blocks Later Implementation?

Must be resolved before BATCH-013.

---

# ODR-004 — Failure Trigger Definition

## Question

What are the specific conditions that trigger a `DeliveryFailed` event (PickedUp → Failed) in Prototype v0.1?

## Why the Decision Is Required

`PROTOTYPE_V0.1.md` (Failure Branch) states:

> "Delivery fails [PickedUp → Failed] — Display existing failure and reputation consequences — Return to Receive Order"

It does not define specific trigger conditions. `GAMEPLAY_EVENTS_FLOW.md` (Error Events / Delivery Failed) lists possible reasons:

> "Wrong destination, Cancelled order, Time exceeded"

But these are listed as examples only, not as binding Prototype v0.1 requirements. None of these are required features in Prototype v0.1 canonical documents.

## Canonical Documents Involved

- `PROTOTYPE_V0.1.md` — Failure Branch
- `GAMEPLAY_EVENTS_FLOW.md` — Error Events / Delivery Failed

## Options Supported by Current Documentation

**Option A:** Time-limited delivery (order expires after N seconds) — triggers failure on timeout.
- Adds urgency/tension to deliveries.
- Requires a timer implementation.

**Option B:** Manual cancel button — player can cancel a PickedUp delivery.
- Simpler.
- Teaches failure consequence without requiring timer logic.

**Option C:** Wrong destination interaction — triggers failure if player attempts delivery at wrong point.
- Requires wrong-destination detection logic.

**Option D:** Combination of Options B and C (no timer in v0.1).
- Reasonable scope for prototype.

## Recommended Option

**Option B — manual cancel button (player-triggered failure), for Prototype v0.1.**

Reasoning: `PROTOTYPE_V0.1.md` does not canonically mandate a timer. A manual cancel is the simplest way to test the failure path without adding timer complexity. Timers may be added in a post-prototype iteration. This keeps the implementation within the "simplest architecture consistent with canonical documentation" principle.

## Impact If Deferred

The failure path (REQ-065) is P1 (required before release). Must be resolved before BATCH-008.

## Blocks Batch 001?

**No.**

## Blocks Later Implementation?

Must be resolved before BATCH-008 (Delivery Completion & Failure).

---

End of Document
