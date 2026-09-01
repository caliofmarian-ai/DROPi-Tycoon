# Document Information

Document: PROJECT_STATUS.md
Project: DROPi Tycoon
Version: 1.2.0
Status: Active Development
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-01 (RBATCH-016 merged in PR #265; RBATCH-017 release checklist pending human owner approval)

---

# Project Status

## Current Phase

Phase:

Prototype v0.1 — RBATCH-010 through RBATCH-016 MERGED; automated integration verified; RBATCH-017 Release-Checklist Verification Package pending human owner approval

---

# Current Objective

Await explicit human owner approval for RBATCH-017, then assemble the release-checklist evidence and owner review package without self-approval claims. Railway/public/physical-device evidence remains distinct from automated CI evidence.

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

1. Complete final-head CI and merge PR #263 for RBATCH-015 Mobile Optimization.
2. Verify responsive viewport fit and comfortable touch interaction on the public Railway runtime using representative Android portrait and landscape sizes.
3. Proceed to RBATCH-016 Full-Loop Integration Verification after the RBATCH-015 merge checkpoint is reconciled.

---

# Project Health

Architecture:

READY

Documentation:

CORRECTION CAMPAIGN COMPLETE — All F-01 through F-29 findings resolved; Final Documentation Closure Audit completed (see 09_Development/AI_Reports/2026-07-14_054_FINAL_DOCUMENTATION_CLOSURE_AUDIT.md)

Technology:

READY

Implementation:

STARTED — BATCH-001 FOUNDATION COMPLETE; BATCH-002 SCAFFOLD COMPLETE; BATCH-003 PLACEHOLDER ASSETS COMPLETE; BATCH-004 WORLD SETUP COMPLETE; BATCH-005 ORDER LIFECYCLE CORE COMPLETE; BATCH-006 TAP-TO-MOVE + CAMERA COMPLETE; BATCH-007 PICKUP PROXIMITY + ACCEPTED→PICKEDUP CORE IMPLEMENTED AND RAILWAY-VERIFIED (2026-08-01); BATCH-008 DELIVERY OUTCOMES COMPLETE; PR #84 MERGED; RAILWAY REDEPLOYED; PUBLIC COMPLETED/FAILED VERIFICATION PASSED; RBATCH-009 ECONOMY AND REPUTATION OUTCOMES COMPLETED — MERGED IN PR #86, RAILWAY-VERIFIED 2026-08-02, 73/73 TESTS (implementation head: `10c1b4df1703015367bd68e504d5713656681289`, merge commit: `b449769f2cfdfcf915ad2680e68960dc902d8796`); RBATCH-010 HUD + NOTIFICATIONS MERGED IN PR #253 — PENDING RAILWAY/PUBLIC VERIFICATION; RBATCH-011 MAINMENU FLOW MERGED IN PR #255 — PENDING RAILWAY/PUBLIC VERIFICATION; RBATCH-012 COMPANYMANAGEMENT + UPGRADE PURCHASE FLOW PR #256 VALIDATED — PENDING MERGE

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
- RBATCH-009 is COMPLETED and merged — CompanyState (money=0, reputation=50) and OrderState.reward (100) added; pure settleDeliveryOutcome and canAfford domain functions created in economySettlement.ts; balancing constants in config/balancing.ts; settlement integrated once on PickedUp→terminal transition in GameWorldScene; DebugPanel shows Money, Reputation, order status, guidance; 73 automated tests passed (final independently verified result); TypeScript build passes; HTTP 200 smoke test passes; merged in PR #86, Railway-verified 2026-08-02; implementation head: `10c1b4df1703015367bd68e504d5713656681289`; merge commit: `b449769f2cfdfcf915ad2680e68960dc902d8796`; no upgrade UI, no save/load; RBATCH-010 HUD + Notifications merged in PR #253 — Railway/public verification pending
- Web Runtime Migration Milestone 001 is implemented — `game-web/` now builds, tests, produces `dist/`, and starts on a production Node server compatible with Railway root-directory deployment
- Public Railway browser verification of BATCH-007 flow completed on 2026-08-01: Available→Accepted, player travels to package, Accepted→PickedUp, CarryingPackage: true confirmed
- BATCH-008 delivery outcomes merged in `main` and publicly verified in `game-web/`: PickedUp→Completed (correct destination) and wrong-destination PickedUp→Failed both passed; CarryingPackage cleared in both outcomes; no economy/reward/reputation effects introduced
- RBATCH-009 completed and merged in PR #86 (branch `copilot/copilotrbatch-009-economy-reputation-outcomes`); economy settlement, company state, order reward, and affordability helper implemented; 73 tests passed (final independently verified); Railway-verified 2026-08-02
- Planning materialization reconciliation verified on 2026-08-02: labels 122/122; milestones 21/21; epics 46/46; batch issues 54/54; executable issues 34/34; planning placeholders 32/32; total canonical planning issues 166/166
- M-005 status: In Progress
- E-010 status: COMPLETED through merged and Railway-verified RBATCH-009
- E-011 status: MERGED in PR #253 — pending Railway/public verification
- E-012 status: MERGED in PR #255 — pending Railway/public verification
- E-013 status: MERGED in PR #256 — pending Railway/public verification
- RBATCH-010 status: MERGED — pending Railway/public verification
- RBATCH-011 status: MERGED in PR #255 — pending Railway/public verification
- RBATCH-012 status: MERGED in PR #256 — pending Railway/public verification
- ISSUE-005/ISSUE-006/ISSUE-007 status: merged through PR #253; GitHub issues closed; Railway/public verification still pending at RBATCH-010 level
- ISSUE-008 status: completed and merged through PR #255; GitHub issue closed; Railway/public verification remains at RBATCH-011 level
- ISSUE-010/ISSUE-011 status: COMPLETED — merged PR #256; Railway/public verification pending at RBATCH-012 level
- ISSUE-009 is implemented on PR #259 with an explicit in-game overwrite confirmation guard
- Owner decisions resolved 2026-09-01: ODR-001=A (do not persist player position); ODR-003=B (persist only TutorialStatus from GameSettings)

- M-007 status: In Progress
- E-015 status: MERGED in PR #259 — pending Railway/public verification
- RBATCH-014 status: MERGED in PR #259 — pending Railway/public verification
- ISSUE-009/ISSUE-014/ISSUE-015/ISSUE-016/ISSUE-017 status: COMPLETED — merged PR #259; Railway/public verification pending at RBATCH-014 level
- RBATCH-014 validation run `33559283892`: 242/242 tests passed across 8 files; TypeScript/Vite build, HTTP smoke, whitespace, archived `Game/` guard, YAML syntax/counts and pre-reconciliation planning crosswalk passed
- Save/Load v1 persists company progression and TutorialStatus only; player position, active order, WorldData and other GameSettings are excluded by the resolved owner decisions
- Current prototype visuals are explicitly temporary; persistence and gameplay state remain decoupled from rendering/assets so later high-fidelity visual evolution does not require Save/Load rewrites

- M-008 status: In Progress
- E-016 status: MERGED in PR #263 — pending Railway/public mobile verification
- RBATCH-015 status: MERGED in PR #263 — pending Railway/public mobile verification
- ISSUE-018/ISSUE-019 status: COMPLETED — merged PR #263; Railway/public verification pending at RBATCH-015 level
- RBATCH-015 validation run `33562041087`: 274/274 tests passed across 9 files, including 32/32 mobile viewport/touch tests; TypeScript/Vite build, HTTP smoke, whitespace, archived `Game/` guard, YAML syntax/counts and planning crosswalk passed
- Mobile implementation supports representative portrait and landscape Android viewports without declaring either orientation permanent canon
- Touch comfort is enforced in actual screen-space canvas pixels through an implementation-level threshold; the threshold is not canonical gameplay design
- ODR-002 reclassified (not an owner decision)
- ODR-004 reclassified 2026-08-01: resolved by canonical documents; wrong-destination interaction triggers Failed; no longer an active owner decision
- PR #84 merged into `main`; Railway redeployed successfully; public `PickedUp → Completed` verification passed; public wrong-destination `PickedUp → Failed` verification passed
- CarryingPackage clears in both BATCH-008 terminal outcomes
- RBATCH-009 economy and reputation settlement implemented; approved balancing values applied; RBATCH-010 HUD + Notifications merged in PR #253 — Railway/public verification pending; no RBATCH-011+ implementation exists
- PR #85 was merged into `main` as merge commit `ec76860b362a3ec1a5bdecbb81ebc254e95f5b08`; no residual PR #85 correction branch remains active

---

# Canonical Rule

Every future decision must support the goal:

Create a simple, fun, expandable DROPi Tycoon prototype.

---

End of Document