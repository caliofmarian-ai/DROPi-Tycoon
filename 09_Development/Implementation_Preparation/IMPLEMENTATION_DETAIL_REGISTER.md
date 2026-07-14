# Document Information

Document: IMPLEMENTATION_DETAIL_REGISTER.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Implementation Preparation — Non-Authoritative
Author: AI Agent (Prototype v0.1 Implementation Preparation Task)
Language: English
Last Updated: 2026-07-14

---

# Implementation Detail Register

## Purpose

This register records implementation details that AI implementing agents are authorized to choose, because canonical documentation does not constrain them specifically.

These are NOT owner decisions. They are within agent-authorized freedom.

**Every detail here must still satisfy all applicable canonical constraints listed.**

---

# IDR-001 — Starting Money Amount and MovementSpeed Values

## Decision Surface

What specific numeric values should be used for:
- Starting CompanyData.Money (at new game)
- Player.MovementSpeed (walking)
- Player.MovementSpeed (with Bicycle)

## Canonical Constraints

- Starting money must be "enough to begin, limited ability, clear reason to improve" (`FIRST_PLAYABLE_EXPERIENCE.md`, `GAME_BALANCING_RULES.md`)
- Walking speed: must allow world navigation; must be clearly slower than Bicycle
- Bicycle speed: must be "faster" than walking (canonically required — `PROTOTYPE_V0.1.md`, Transportation System / Bicycle)
- Balancing may be adjusted during BATCH-015 (integration testing) and BATCH-016

## Allowed Implementation Freedom

Agent may choose any values that satisfy the canonical constraints above.

Suggested starting values (subject to balance testing):
- Starting money: `100`
- Walking MovementSpeed: `150` pixels/second
- Bicycle MovementSpeed: `300` pixels/second

## Validation Requirement

The chosen values must pass the PROTOTYPE_RELEASE_CHECKLIST.md Section 5 (Balance Checklist):
- Starting resources are reasonable
- First delivery is achievable
- First upgrade is reachable
- Progress feels motivating

---

# IDR-002 — GDevelop Storage Save Key Name

## Decision Surface

What key name is used in GDevelop's local Storage system for the save slot?

## Canonical Constraints

- One local save slot (`SAVE_SYSTEM.md`)
- No specific key name defined in canonical documents

## Allowed Implementation Freedom

Agent may choose any consistent, non-colliding key string.

Suggested value: `DROPi_Tycoon_Save`

## Validation Requirement

Must be used consistently across all save/load operations. Key must not collide with other game data stored under different keys.

---

# IDR-003 — Placeholder Asset Color Coding

## Decision Surface

What colors/shapes are used for placeholder sprites?

## Canonical Constraints

- Placeholder assets are acceptable (`ASSET_IMPORT_GUIDE.md`)
- Placeholders must be visually distinguishable from each other
- Asset names must follow `type_description_variant` convention (`ASSETS.md`)

## Allowed Implementation Freedom

Agent may choose any color coding scheme that makes objects visually distinct.

Suggested scheme is provided in `GDEVELOP_IMPLEMENTATION_ARCHITECTURE.md` Section 18.

## Validation Requirement

Each placeholder sprite must be visually distinguishable from all others in the GameWorld scene.

---

# IDR-004 — Event Group Internal Ordering

## Decision Surface

Within a given external event sheet or scene event sheet, what is the ordering of individual events within an event group?

## Canonical Constraints

- Event groups are named per canonical specification (`GAMEPLAY_EVENTS_FLOW.md`)
- Events must execute in the correct logical sequence (pickup before delivery, etc.)
- State transitions must enforce canonical allowed transitions (`ORDERS.md`)

## Allowed Implementation Freedom

Agent may order events within a group in any order that produces correct behavior.

## Validation Requirement

Correct behavior (state transitions, money updates, UI updates) must occur in the correct sequence. Order of technically equivalent events within a group is unconstrained.

---

# IDR-005 — Notification Display Duration

## Decision Surface

How long should notification popups remain visible before auto-dismissing?

## Canonical Constraints

- Notifications must "inform, not distract" (`UI.md`)
- Specific duration not defined canonically

## Allowed Implementation Freedom

Agent may choose any duration between 1.5 and 4 seconds.

Suggested: 2.5 seconds.

## Validation Requirement

Notifications are readable (enough time) and not distracting (not too long).

---

# IDR-006 — Map Dimensions and Tile Sizes

## Decision Surface

What are the exact pixel dimensions of the game world map and the size of individual map tiles?

## Canonical Constraints

- "Small prototype area" (`FIRST_MAP_DESIGN.md`)
- "Large enough to create movement decisions but small enough for quick testing" (`FIRST_MAP_DESIGN.md`)
- Must contain all required zones: residential, company base, business, pickup areas
- Must be optimized for mobile performance

## Allowed Implementation Freedom

Agent may choose any dimensions that satisfy the "small but navigable" constraint.

Suggested: World size approximately 1440×1600 pixels at 360×640 viewport (4× viewport width, ~2.5× viewport height).

## Validation Requirement

Player must be able to navigate from company base to any delivery location within ~30 seconds of walking. Map must not cause performance issues on mobile.

---

# IDR-007 — Unique Order ID Generation Method

## Decision Surface

How are unique OrderIDs generated?

## Canonical Constraints

- "Order receives unique ID" (`GAMEPLAY_EVENTS_FLOW.md` Order Creation Flow)
- Each order must have a unique OrderID (`CORE_GAMEPLAY_SYSTEMS.md`, `GAME_DATA_STRUCTURE.md`)

## Allowed Implementation Freedom

Agent may use any ID generation method that produces unique values per session.

Options: timestamp + random suffix, incrementing counter, or GDevelop UUID function.

## Validation Requirement

No two orders in a single play session should share the same OrderID.

---

# IDR-008 — Delivery Point Placement on Map

## Decision Surface

Exact map positions (X, Y coordinates) of each DeliveryPoint and Building object.

## Canonical Constraints

- All required building types must be present (residential, commercial, company base, pickup area) at distinct map locations
- Pickup points and destination points must be separate (a pickup point and a destination must be at different locations)
- Navigation must be clear (player always knows where to go)

## Allowed Implementation Freedom

Agent may place objects at any positions that satisfy the zone requirements from `FIRST_MAP_DESIGN.md`.

## Validation Requirement

First delivery route must be "short distance" — Business/Pickup area → Customer Home (per `FIRST_MAP_DESIGN.md`).

---

# IDR-009 — Temporary Debug Object Names

## Decision Surface

If debug helper objects or debug text objects are used during development, what are their names?

## Canonical Constraints

- Debug objects must not appear in release builds
- Debug objects must not interfere with gameplay systems

## Allowed Implementation Freedom

Any names prefixed with `DBG_` or `Debug_` are acceptable.

## Validation Requirement

All debug objects removed or hidden before BATCH-015 integration test.

---

# IDR-010 — Scene Transition Animation

## Decision Surface

Should there be a visual transition effect (fade, slide, etc.) when switching between scenes?

## Canonical Constraints

- `UI.md` states interface should avoid "heavy effects"
- `MOBILE_UI_CONTROLS.md` states "Mobile Performance Rules: avoid too many animations"
- No specific transition effect canonically required

## Allowed Implementation Freedom

Agent may add a simple fade transition or use instant transitions.

## Validation Requirement

Transition must not noticeably impact performance. Must not confuse the player about which scene they are in.

---

End of Document
