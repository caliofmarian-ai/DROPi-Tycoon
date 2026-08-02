# Document Information

Document: PROJECT_STATUS.md
Project: DROPi Tycoon
Version: 1.2.0
Status: Active Development
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-08-02 (RBATCH-009 ECONOMY AND REPUTATION OUTCOMES — DRAFT PR OPEN)

---

# Project Status

## Current Phase

Phase:

Prototype v0.1 — BATCH-008 Delivery Outcomes Merged and Railway-Verified; RBATCH-009 Economy and Reputation Outcomes Implemented on Draft PR Pending Independent Review

---

# Current Objective

Keep the verified public web runtime stable, preserve the merged BATCH-008 evidence, and implement RBATCH-009 economy and reputation outcomes on a draft PR pending independent review before merging.

---

# Project Vision Summary

DROPi Tycoon is a mobile 2D top-down tycoon simulation game.

The player starts with a small delivery company and grows it through:

- Orders
- Deliveries
- Economy management
- Company upgrades
- Expansion

---

# Current Technology

## Active Runtime

The active deployable implementation is the standard code-based web runtime in `game-web/`, deployed through Railway.

Archived/reference runtime:

- Historical GDevelop scaffold in `Game/`

Current toolchain (replaceable implementation detail, not canonical technology):

- Phaser `3.90.0` + Vite `8.1.1` + TypeScript `6.0.2` in `game-web/`

---

## Target Platform

Android Mobile First

Future:

- iOS
- Web
- Desktop

---

# Completed Documentation

Completed:

## Project Foundation

- Vision
- Architecture
- Economy
- Logistics
- World
- AI
- Technical
- UI
- Assets
- Development

---

# Completed Development Planning

Completed:

- First playable experience
- First map design
- Core gameplay systems
- GDevelop structure
- Gameplay events
- Mobile controls
- Balancing rules
- Testing plan
- Development workflow
- AI development workflow

---

# Current Prototype Version

Target:

DROPi Tycoon Prototype v0.1

---

# Prototype Features

Required:

## World

- Small map
- Buildings
- Player location

## Gameplay

- Receive order
- Accept order
- Pickup package
- Deliver package
- Receive reward

## Progression

- Money
- Basic upgrade

## Persistence

- Local Save & Load (required; see `06_Technical/SAVE_SYSTEM.md`)

---

# Not Included In v0.1

Excluded:

- Drone delivery
- DronePorts
- Large cities
- Multiplayer
- Advanced AI simulation
- Complex economy

---

# Current Development Rule

Gameplay before complexity.

The prototype must prove the core idea before expansion.

---

# Next Steps

1. Keep PR #86 open as draft on branch `copilot/copilotrbatch-009-economy-reputation-outcomes` until independent review passes.
2. Preserve the public Railway-verified BATCH-008 runtime evidence in documentation and reports.
3. Complete RBATCH-009 corrections on PR #86, then proceed to merge/deploy/public verification only after independent approval.

---

# Project Health

Architecture:

READY

Documentation:

CORRECTION CAMPAIGN COMPLETE — All F-01 through F-29 findings resolved; Final Documentation Closure Audit completed (see 09_Development/AI_Reports/2026-07-14_054_FINAL_DOCUMENTATION_CLOSURE_AUDIT.md)

Technology:

READY

Implementation:

STARTED — BATCH-001 FOUNDATION COMPLETE; BATCH-002 SCAFFOLD COMPLETE; BATCH-003 PLACEHOLDER ASSETS COMPLETE; BATCH-004 WORLD SETUP COMPLETE; BATCH-005 ORDER LIFECYCLE CORE COMPLETE; BATCH-006 TAP-TO-MOVE + CAMERA COMPLETE; BATCH-007 PICKUP PROXIMITY + ACCEPTED→PICKEDUP CORE IMPLEMENTED AND RAILWAY-VERIFIED (2026-08-01); BATCH-008 DELIVERY OUTCOMES COMPLETE; PR #84 MERGED; RAILWAY REDEPLOYED; PUBLIC COMPLETED/FAILED VERIFICATION PASSED; RBATCH-009 ECONOMY AND REPUTATION OUTCOMES IMPLEMENTED ON DRAFT PR — PENDING INDEPENDENT REVIEW

Implementation Preparation Status:

- Prototype v0.1 implementation preparation package corrected and revalidated against Report 057: 2026-07-14
- Package path: `09_Development/Implementation_Preparation/`
- Final corrected readiness verdict: A — PR #56 CORRECTED AND VERIFIED — SAFE TO MERGE
- Implementation itself: STARTED
- Deployable browser runtime candidate now exists in `game-web/`
- GDevelop project file exists: `Game/DROPi_Tycoon.json`
- Required asset directories exist: `Game/Assets/Sprites`, `Game/Assets/Audio`, `Game/Assets/UI`
- Exactly three implementation scenes exist: `MainMenu`, `GameWorld`, `CompanyManagement`
- Global roots created: `CompanyData`, `GameSettings`, `SaveFormatVersion`
- GameWorld scene/event scaffold wiring created: 3 external event sheets, 7 GameWorld event groups, SceneFlow groups in MainMenu and CompanyManagement, 3 GameWorld scene-variable roots with canonical sub-structures, and 4 GameWorld layers
- Placeholder asset library created: 7 sprite PNG placeholders and 1 UI icon PNG placeholder in canonical asset directories; 2 additional BATCH-004 placeholder sprites added
- Visual world setup created: Player and static world entities placed in GameWorld on Base layer
- Core gameplay logic is now present for order creation/acceptance, tap-to-move, camera follow, and pickup proximity
- Code-based web runtime introduced in `game-web/` using Phaser/Vite/TypeScript; historical GDevelop source remains unchanged
- `OrderSystem` external events contain the BATCH-005 order lifecycle core; `EconomySystem` and `ProgressionSystem` remain empty scaffolds
- A public deployable browser runtime is available at https://dropi-tycoon-production.up.railway.app/ (Railway); archived GDevelop source remains historical/reference-only: `Game/DROPi_Tycoon.json`
- BATCH-001 is complete
- BATCH-002 is complete
- BATCH-003 is complete — placeholder asset library created
- BATCH-004 is complete — visual world setup created; Player and static world entities placed; no movement or gameplay logic implemented; no playable prototype exists
- BATCH-005 is complete — order lifecycle state machine implemented; Created→Available→Accepted event logic added; no pickup/delivery/economy/HUD logic implemented; no playable prototype exists
- BATCH-006 is complete — Tap-to-Move implemented; touch input (primary/Android-first) and mouse fallback (desktop); Player movement toward tapped target; camera follows Player; arrival stops movement; Idle/Move animation switching; movement speed and arrival threshold are configurable scene variables; no pickup/delivery/economy/HUD/AI/save-load logic implemented; no playable prototype exists
- BATCH-007 is implemented — minimal Android-first order acceptance trigger exists on Package touch while order status is Available; automatic pickup proximity exists with configurable `PickupRadius` = 32; Accepted→PickedUp transition sets `PlayerData.CarryingPackage` and `Player.CarryingPackage` true; no delivery completion, failure, reward, economy, HUD, notification, AI, or save/load logic implemented
- BATCH-008 is complete — delivery completion (PickedUp→Completed on correct destination) and failure (PickedUp→Failed on wrong destination) are merged; terminal states have no outbound transitions; CarryingPackage and currentOrder clear in both outcomes; delivery radius = 48; touch-first tap-on-marker intent registration; no reward, Money, or reputation effects; 30 automated tests pass; TypeScript build passes; HTTP 200 smoke test passes
- RBATCH-009 is implemented on a draft PR pending independent review — CompanyState (money=0, reputation=50) and OrderState.reward (100) added; pure settleDeliveryOutcome and canAfford domain functions created in economySettlement.ts; balancing constants in config/balancing.ts; settlement integrated once on PickedUp→terminal transition in GameWorldScene; DebugPanel shows Money, Reputation, order status, guidance; 64 automated tests pass; TypeScript build passes; HTTP 200 smoke test passes; no final HUD, no upgrade UI, no save/load, no RBATCH-010+ behavior
- Web Runtime Migration Milestone 001 is implemented — `game-web/` now builds, tests, produces `dist/`, and starts on a production Node server compatible with Railway root-directory deployment
- Public Railway browser verification of BATCH-007 flow completed on 2026-08-01: Available→Accepted, player travels to package, Accepted→PickedUp, CarryingPackage: true confirmed
- BATCH-008 delivery outcomes merged in `main` and publicly verified in `game-web/`: PickedUp→Completed (correct destination) and wrong-destination PickedUp→Failed both passed; CarryingPackage cleared in both outcomes; no economy/reward/reputation effects introduced
- RBATCH-009 implemented on branch `copilot/copilotrbatch-009-economy-reputation-outcomes` (draft PR #86 open); economy settlement, company state, order reward, and affordability helper implemented; 64 tests pass; pending independent review and Railway deployment verification
- Active owner decisions: ODR-001 (player position persistence), ODR-003 (GameSettings persistence scope)
- ODR-002 reclassified (not an owner decision)
- ODR-004 reclassified 2026-08-01: resolved by canonical documents; wrong-destination interaction triggers Failed; no longer an active owner decision
- PR #84 merged into `main`; Railway redeployed successfully; public `PickedUp → Completed` verification passed; public wrong-destination `PickedUp → Failed` verification passed
- CarryingPackage clears in both BATCH-008 terminal outcomes
- RBATCH-009 economy and reputation settlement implemented; approved balancing values applied; no RBATCH-010+ behavior
- PR #85 was merged into `main` as merge commit `ec76860b362a3ec1a5bdecbb81ebc254e95f5b08`; no residual PR #85 correction branch remains active

---

# Canonical Rule

Every future decision must support the goal:

Create a simple, fun, expandable DROPi Tycoon prototype.

---

End of Document