# Document Information

Document: SAVE_SYSTEM.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-12

---

# Save System

## Purpose

This document defines the canonical in-game Save & Load system for DROPi Tycoon.

It specifies what game state is persisted, when saves occur, how the game loads, and how the system behaves when save data is missing or corrupted.

Development and project-level safety and stability governance is owned by `06_Technical/SAFE_SYSTEM.md`. This document covers only in-game persistence.

---

# Save System Philosophy

The save system must protect player progress without adding unnecessary complexity.

Rules:

- Save the minimum state required to restore meaningful progression.
- Never lose completed progress due to normal game exit.
- Never crash or produce undefined behavior because save data is absent or invalid.
- Keep the implementation minimal for Prototype v0.1 and expand incrementally.

---

# Prototype v0.1 Scope

The following save/load behavior is required before Prototype v0.1 release.

No save/load features beyond this scope are approved for v0.1.

---

# Required Saved Data

The following data must be persisted for Prototype v0.1.

## Company Data

- Company name (if implemented in v0.1)
- Company money
- Company level
- Company reputation (if implemented in v0.1)
- Purchased upgrade levels

## Progression State

- Tutorial completion status
- Current or unlocked progression state

## Player State

- Player position only if required for the chosen prototype flow

## Active Order

- The current active order is cancelled and reset on load.
- Active orders are not restored from save in Prototype v0.1.

## Transient Runtime Data

WorldData, active customers, and all runtime-generated simulation state are not persisted.

They are regenerated on load.

---

# Save Triggers

The game saves automatically after meaningful completed actions.

## Autosave Events

- Delivery completion
- Upgrade purchase
- Progression state change (level up, reputation change)
- Tutorial step completion (if tutorial is implemented)

## Manual Save

- No manual save UI is required for Prototype v0.1.
- If a manual save option is added later, it must follow the same data scope.

---

# Load Behavior

## Continue Game

When a valid save exists, the game loads it automatically on Continue.

The player resumes from the saved progression state.

## Start New Game

Start Game creates new data only when:

- No valid save exists on the device, or
- The player explicitly confirms replacing the existing save.

The game must never silently overwrite a valid save without confirmation.

---

# New Game Behavior

When creating a new game:

- Initialize all required data fields with defined starting values.
- Do not carry over data from a previous save unless the player explicitly requested a new game.

---

# Save Slot Policy

Prototype v0.1 uses one local save slot.

- One save profile per device.
- No multiple slots.
- No named saves.
- No cross-device synchronization.
- No cloud save.
- No account linking.

---

# Autosave Policy

- Autosave triggers after each meaningful completed action as defined above.
- Autosave is silent and requires no player interaction.
- The player must not be able to accidentally skip an autosave by force-closing the game after a meaningful action.

---

# Manual Save Policy

- No manual save is required for Prototype v0.1.
- Future versions may add a manual save option within the same one-slot local policy.

---

# Data Validation

On load, the save system must validate required fields before using them.

Required fields to validate:

- Company money (must be a valid number, zero or greater)
- Company level (must be a valid positive integer)
- Purchased upgrade levels (must be valid non-negative integers)
- Tutorial completion status (must be a valid boolean or equivalent)

If a required field is missing, apply the defined safe default for that field.

Do not use unvalidated values directly from save data.

---

# Missing or Corrupted Save Behavior

- The game must never crash because save data is missing or invalid.
- If no save file exists, start a new game without notification.
- If the save file exists but is unreadable or structurally invalid, inform the player that progress cannot be restored.
- Require player confirmation before replacing a corrupted save with a new game.
- If technically possible, preserve the corrupted save file for debugging before overwriting.
- Apply safe defaults only for fields that cannot be recovered, and only after informing the player.

---

# Version Compatibility

- Save data must include a save format version field.
- On load, validate that the save format version is compatible with the current game version.
- If the save format version is unknown or incompatible, treat the save as unreadable and follow the corrupted save behavior above.
- Future format migrations may be added but are not required for Prototype v0.1.

---

# Mobile Considerations

- Save data is stored on local device storage.
- GDevelop local storage APIs are used for persistence.
- The system must tolerate interrupted saves caused by incoming calls, OS interruptions, or low battery.
- Do not assume save operations are atomic; design save data to be recoverable even if a write is interrupted.

---

# GDevelop Implementation Boundary

The Save System is implemented using GDevelop's built-in local storage or variable persistence mechanisms.

No external backend, server, or cloud API is used.

Implementation must reference this document as the canonical contract for what is saved, when, and how.

---

# Testing Requirements

The following must be verified before Prototype v0.1 release:

- Save after delivery completion: progress is restored on next launch.
- Save after upgrade purchase: upgrade state is restored on next launch.
- Close game mid-session without a save trigger: last saved state is restored correctly.
- Start new game when no save exists: new game initializes correctly.
- Start new game when a valid save exists: confirmation required; no silent overwrite.
- Corrupted save file: game does not crash; player is informed; confirmation required before new game.
- Missing save file: game starts new game without error.

See `09_Development/PROTOTYPE_TESTING_PLAN.md` for full persistence test cases.

---

# Future Expansion

The following are intentionally deferred beyond Prototype v0.1:

- Multiple save slots
- Named saves
- Cloud save
- Cross-device synchronization
- Multiple player profiles
- Full simulation state snapshot
- Complex mid-session world restoration
- Analytics or telemetry around saves

---

# Canonical Rule

The Save System owns all in-game persistence decisions.

No other document may define save data scope, save triggers, or load behavior without referencing and aligning with this document.

---

End of Document