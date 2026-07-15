# Document Information

Document: PROJECT_STATUS.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Active Development
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-15 (WEB RUNTIME MIGRATION MILESTONE 001)

---

# Project Status

## Current Phase

Phase:

Prototype v0.1 Web Runtime Migration — Railway-Deployable Browser Runtime Candidate Implemented

---

# Current Objective

Validate the new deployable browser runtime candidate on Railway without changing canonical gameplay scope.

The current focus is not the final game.

The focus is creating a stable first playable prototype.

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

## Game Engine

GDevelop remains the archived/reference implementation source.

Web runtime candidate:

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

1. Run Android/HTML5 runtime preview for the combined BATCH-006/BATCH-007 accept, movement, camera, and pickup flow.
2. Keep BATCH-008 blocked until BATCH-007 runtime preview is reviewed.

---

# Project Health

Architecture:

READY

Documentation:

CORRECTION CAMPAIGN COMPLETE — All F-01 through F-29 findings resolved; Final Documentation Closure Audit completed (see 09_Development/AI_Reports/2026-07-14_054_FINAL_DOCUMENTATION_CLOSURE_AUDIT.md)

Technology:

READY

Implementation:

STARTED — BATCH-001 FOUNDATION COMPLETE; BATCH-002 SCAFFOLD COMPLETE; BATCH-003 PLACEHOLDER ASSETS COMPLETE; BATCH-004 WORLD SETUP COMPLETE; BATCH-005 ORDER LIFECYCLE CORE COMPLETE; BATCH-006 TAP-TO-MOVE + CAMERA COMPLETE; BATCH-007 PICKUP PROXIMITY + ACCEPTED→PICKEDUP CORE IMPLEMENTED; FIRST DEPLOYABLE WEB RUNTIME CANDIDATE CREATED IN `game-web/`; OWNER RAILWAY VALIDATION PENDING

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
- No playable build exists
- BATCH-001 is complete
- BATCH-002 is complete
- BATCH-003 is complete — placeholder asset library created
- BATCH-004 is complete — visual world setup created; Player and static world entities placed; no movement or gameplay logic implemented; no playable prototype exists
- BATCH-005 is complete — order lifecycle state machine implemented; Created→Available→Accepted event logic added; no pickup/delivery/economy/HUD logic implemented; no playable prototype exists
- BATCH-006 is complete — Tap-to-Move implemented; touch input (primary/Android-first) and mouse fallback (desktop); Player movement toward tapped target; camera follows Player; arrival stops movement; Idle/Move animation switching; movement speed and arrival threshold are configurable scene variables; no pickup/delivery/economy/HUD/AI/save-load logic implemented; no playable prototype exists
- BATCH-007 is implemented — minimal Android-first order acceptance trigger exists on Package touch while order status is Available; automatic pickup proximity exists with configurable `PickupRadius` = 32; Accepted→PickedUp transition sets `PlayerData.CarryingPackage` and `Player.CarryingPackage` true; no delivery completion, failure, reward, economy, HUD, notification, AI, or save/load logic implemented
- Web Runtime Migration Milestone 001 is implemented — `game-web/` now builds, tests, produces `dist/`, and starts on a production Node server compatible with Railway root-directory deployment
- Public Railway browser verification is still pending; no public URL has been verified in-repo
- Active owner decisions: ODR-001 (player position persistence), ODR-003 (GameSettings persistence scope), ODR-004 (failure trigger definition)
- ODR-002 reclassified (not an owner decision)
- No owner decision blocks BATCH-007

---

# Canonical Rule

Every future decision must support the goal:

Create a simple, fun, expandable DROPi Tycoon prototype.

---

End of Document