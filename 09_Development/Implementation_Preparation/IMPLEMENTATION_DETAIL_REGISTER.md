# Document Information

Document: IMPLEMENTATION_DETAIL_REGISTER.md
Project: DROPi Tycoon
Version: 1.1.0
Status: Implementation Preparation — Non-Authoritative
Author: AI Agent (PR #56 correction from Report 057)
Language: English
Last Updated: 2026-07-14

---

# Implementation Detail Register (Corrected)

## Rule

Only implementation-owned choices that do not redefine canonical gameplay/economy/progression/scope/persistence semantics are listed.

---

## IDR-001 — Starting Money Numeric Value

- **Canonical constraints:** Must be a small but functional starting amount (`FIRST_PLAYABLE_EXPERIENCE.md`, `GAME_BALANCING_RULES.md`).
- **Allowed freedom:** Exact number is implementation-selected.
- **Validation:** First delivery and first upgrade must remain reachable in test/balance batches.

## IDR-002 — Save-Key String Name

- **Canonical constraints:** One local save slot, no backend/cloud (`SAVE_SYSTEM.md`).
- **Allowed freedom:** Exact local storage key string.
- **Validation:** Same key is used consistently for save/load.

## IDR-003 — Placeholder Asset Color/Shape Coding

- **Canonical constraints:** Placeholders allowed and replaceable (`ASSET_IMPORT_GUIDE.md`).
- **Allowed freedom:** Exact placeholder visuals.
- **Validation:** Visual differentiation is clear and gameplay logic does not depend on placeholder art.

## IDR-004 — Internal Event Ordering Within Event Groups

- **Canonical constraints:** State transitions and outcomes must remain canonical (`ORDERS.md`, `GAMEPLAY_EVENTS_FLOW.md`).
- **Allowed freedom:** Technical action order within the same logically equivalent event group.
- **Validation:** Behavior remains correct under canonical state machine.

## IDR-005 — Notification Display Duration

- **Canonical constraints:** Notifications must inform, not distract (`UI.md`).
- **Allowed freedom:** Exact timing value.
- **Validation:** Readable and non-disruptive during mobile testing.

## IDR-006 — Map Coordinates and Layout Placement

- **Canonical constraints:** Must include required zones and remain small/navigable (`FIRST_MAP_DESIGN.md`).
- **Allowed freedom:** Exact X/Y positions and tile sizing.
- **Validation:** Core loop route remains clear and testable.

## IDR-007 — OrderID Generation Method

- **Canonical constraints:** Order IDs must be unique (`GAME_DATA_STRUCTURE.md`, `CORE_GAMEPLAY_SYSTEMS.md`).
- **Allowed freedom:** Implementation mechanism (counter/timestamp/UUID pattern).
- **Validation:** No duplicate IDs in session tests.

## IDR-008 — MainMenu→GameWorld Transition Pattern

- **Canonical constraints:** Scene responsibilities are canonical; exact transition implementation is not fixed.
- **Allowed freedom:** Transition implementation pattern (direct change scene, wrapped event group, etc.).
- **Validation:** Start/Continue enters GameWorld according to save rules.

## IDR-009 — CompanyManagement→GameWorld Return Pattern

- **Canonical constraints:** Optional management branch must return to gameplay loop (`PROTOTYPE_V0.1.md`).
- **Allowed freedom:** Exact return-event structure.
- **Validation:** Return works without creating new gameplay scope.

## IDR-010 — Scene-Variable Ownership Placement

- **Canonical constraints:** `PlayerData`, `ActiveOrder`, `WorldData` structures are canonical.
- **Allowed freedom:** Where those structures live at scene level for implementation (`GameWorld` placement used by this package).
- **Validation:** Ownership stays consistent across architecture, batch plan, and first batch docs.

## IDR-011 — UI Layer Partition Names/Ordering

- **Canonical constraints:** HUD visibility requirements are canonical.
- **Allowed freedom:** Exact layer naming/order for Base/Notifications/Modal around HUD.
- **Validation:** UI visibility, readability, and layering behavior pass mobile checks.

---

End of Document
