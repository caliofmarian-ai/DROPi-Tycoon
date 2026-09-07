# Document Information

Document: 2026-09-07_106_PLAYER_SMARTPHONE_FOUNDATION.md
Project: DROPi Tycoon
Version: 1.0.0
Status: AI Implementation Report
Author: Marian Caliof & OpenAI
Language: English
Date: 2026-09-07
Related Issue: #349
Parent Direction: #348
Canonical Owner: `07_UI/PLAYER_SMARTPHONE.md`

---

# Player Smartphone Foundation Implementation Report

## Purpose

Implement the first truthful in-world player smartphone surface after the strategic canon/backlog reconciliation completed in PR #365.

The implementation must preserve embodied physical gameplay and must not create fake online systems or a remote replacement for HQ operations.

## Implementation Strategy

The phone is implemented as a fixed-screen Phaser overlay owned by the existing `UrbanHUD` inside `GameWorldScene`.

It is intentionally **not** a new Phaser scene. Opening or closing it therefore does not replace/restart the world scene and does not create a new persistence boundary.

The existing `UrbanHUD.isMenuOpen()` modal-input contract now returns true for either the ordinary menu or the smartphone. This reuses existing world-input guards for movement, action, transport switching, zoom and camera gestures.

## Live Applications

The first slice exposes exactly three live surfaces derived from existing authoritative runtime state:

1. **Delivery**
   - current order status;
   - current objective;
   - pickup/destination route labels;
   - cargo state;
   - authoritative reward.

2. **Map**
   - current district/area;
   - active transport;
   - current objective;
   - distance to objective;
   - clear statement that detailed routing remains in the world map.

3. **Money & Assets**
   - company name;
   - Company Money;
   - reputation;
   - active/total employees;
   - owned/assigned fleet counts;
   - constructed HQ department count.

No smartphone-owned economy, mission, employee, fleet or progression state was introduced.

## Future / Locked Applications

The phone visibly labels the following as `FUTURE` rather than pretending they exist:

- Communications;
- Training;
- Marketplace;
- Weather / News;
- Investments;
- Drone Ops.

This preserves the canonical future phone architecture without fabricating multiplayer, live chat, online markets, live news, investment/share systems or drone control.

## Physical HQ Boundary

The phone does not provide actions for:

- hiring or staff management;
- fleet purchase or vehicle handoff;
- company operations/dispatch actions;
- HQ construction;
- parcel handoff/sorting;
- practical training/certification;
- maintenance or future infrastructure operations.

The overlay contains the explicit player-facing reminder: `Physical HQ actions stay at HQ.`

## Persistence

No Save v2 schema change is required.

The phone is a projection of already-authoritative runtime state. Opening/closing the phone does not alter the save contract.

## Files

Added:
- `game-web/src/ui/PlayerSmartphone.ts`
- `game-web/tests/player-smartphone.test.ts`
- `09_Development/AI_Reports/2026-09-07_106_PLAYER_SMARTPHONE_FOUNDATION.md`

Updated:
- `game-web/src/ui/UrbanHUD.ts`

## Test Coverage

Dedicated tests verify:

- compact Android landscape phone bounds;
- canonical touch-target floor for phone controls;
- authoritative delivery/map/company projection;
- internal employee/vehicle IDs are not exposed in player-facing snapshots;
- unavailable systems remain future-only;
- the phone uses a HUD overlay instead of a new scene/restart;
- physical company actions are absent from the phone interaction surface.

## Owner Acceptance Required

After merge and deployment, installed Android owner review must confirm:

1. `Phone` is visible and touchable in normal city gameplay;
2. opening the phone does not move the courier or alter camera/world context;
3. Delivery, Map and Money & Assets show current real state;
4. future apps are visibly unavailable;
5. HQ-only functions cannot be executed from the phone;
6. closing the phone returns to the exact prior city position/context;
7. joystick, Action and camera gestures resume normally after close;
8. no overlap, freeze, black screen or unusable touch target occurs at the owner device viewport.

Do not close #349 until this Android review is explicitly confirmed.

---

End of Report
