# Document Information

Document: README.md
Project: DROPi Tycoon
Version: 0.1.0
Status: Deployable Web Runtime Candidate
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-08-01

---

# DROPi Tycoon Web Runtime

This folder contains the first deployable browser runtime for DROPi Tycoon.

`game-web/` carries forward migrated BATCH-001 through BATCH-007 behavior, implements BATCH-008 delivery outcomes, and adds RBATCH-009 economy and reputation outcomes on a draft PR pending independent review.

The archived/reference GDevelop source remains unchanged in:

- `Game/DROPi_Tycoon.json`
- `Game/Assets/`

---

# Runtime and Tooling

- Runtime library: `phaser` `3.90.0`
- Build tool: `vite` `8.1.1`
- Language: `TypeScript` `6.0.2`
- Test runner: `vitest` `4.1.10`
- Production server: custom Node.js static server at `server/server.mjs`

The active implementation is the standard web-first application maintained in GitHub, deployed through Railway, and later intended for Android packaging.
GDevelop is not used by the active implementation; archived GDevelop files are historical reference only.
Phaser `3.90.0` is the current web-runtime library implementation detail, is replaceable, and is not canonical DROPi Tycoon project technology.

---

# Implemented Prototype Scope

This PR branch implements the following prototype behavior:

- Main menu
- Game world
- Company-management placeholder navigation
- Placeholder world composition
- Player
- Buildings
- Package
- Delivery points
- Road/environment tiles
- Android-first tap-to-move
- Camera follow
- Order states: `Created`, `Available`, `Accepted`, `PickedUp`, `Completed`, `Failed`
- Implemented transitions only:
  - `Created -> Available`
  - `Available -> Accepted`
  - `Accepted -> PickedUp`
  - `PickedUp -> Completed` (correct destination)
  - `PickedUp -> Failed` (wrong destination)
- Tap package to request acceptance
- Automatic pickup on proximity
- `CarryingPackage = true` after pickup
- Tap delivery marker after pickup to register delivery intent
- Delivery within radius (48 px) executes `attemptDelivery`
- Correct destination → `Completed`; wrong destination → `Failed`
- Both outcomes clear `CarryingPackage` and `currentOrder`
- Terminal states `Completed` and `Failed` have no outbound transitions
- Company state: `money` (initial 0) and `reputation` (initial 50)
- Order reward: 100 (owner-approved balancing value)
- Successful delivery (PickedUp→Completed): money +100, reputation +2 (clamped 0..100)
- Failed delivery (PickedUp→Failed): money unchanged (no deduction), reputation −5 (clamped 0..100)
- Economy settlement applied exactly once on terminal transition
- Affordability helper (`canAfford`) available for future upgrade purchasing
- Temporary debug panel shows Money, Reputation, order status, carried-package, guidance

Not implemented in this milestone:

- Final HUD or notification system
- Upgrade-purchase UI
- DROPiCoins logic
- Marketplace
- Payments
- Database
- Save/load
- RBATCH-010 or later gameplay

---

# Assets

Runtime assets were copied from `Game/Assets/Sprites/` into `public/assets/sprites/` without modifying the source files.

Copied runtime assets:

- `player_character_idle.png`
- `player_character_move.png`
- `building_company_small.png`
- `building_residential.png`
- `building_commercial.png`
- `package_delivery.png`
- `delivery_point_marker.png`
- `environment_road_tile.png`

Original provenance remains documented in `08_Assets/BATCH_003_PLACEHOLDER_PROVENANCE.md`.

---

# Environment Variables

Active public variables used by the frontend:

- `VITE_APP_NAME`
- `VITE_APP_VERSION`
- `VITE_GAME_WIDTH`
- `VITE_GAME_HEIGHT`
- `VITE_ENABLE_DEBUG_PANEL`

Server variable:

- `PORT` — supplied automatically by Railway

Do not store gameplay state, wallets, player data, or transaction data in environment variables.

---

# Local Commands

Run from `game-web/`:

```bash
npm ci
npm run test
npm run build
npm run start
```

---

# Railway Settings

Configure the Railway service to use:

- Root Directory: `game-web`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Start Command: `npm run start`

The production server serves `dist/`, listens on `process.env.PORT`, falls back to `3000`, and binds to `0.0.0.0`.
