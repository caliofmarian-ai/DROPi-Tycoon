# Document Information

Document: README.md
Project: DROPi Tycoon
Version: 0.1.0
Status: Deployable Web Runtime Candidate
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-08-02

---

# DROPi Tycoon Web Runtime

This folder contains the first deployable browser runtime for DROPi Tycoon.

`game-web/` carries forward migrated BATCH-001 through BATCH-007 behavior, implements BATCH-008 delivery outcomes, has RBATCH-009 economy and reputation outcomes merged and Railway-verified, and adds RBATCH-010 HUD and notifications on a draft PR pending independent review.

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

# Urban RPG / multimodal foundation

The current Game World is a code-drawn neighborhood with collision-constrained
direct movement, a human courier, follow camera, minimap, NPC interactions, a
small HQ and a locked future Main DronePort expansion. Walking and an owned
bicycle can be selected at HQ. No native-shell change or new APK is needed.

- Move with the on-screen directional pad, WASD or arrow keys.
- Follow the gold objective to meet the merchant and activate local marketplace demand.
- Return to HQ and use Action / E to accept work.
- Walk to the marked pickup, use Action / E, then do the same at the customer.
- Buy a bicycle through Company → Vehicle Fleet; return to HQ to select it.
- Company management, employees, finances and procedural sound remain available.
- The ground operator and future aerial drone are separate domain actors.
- Multi-parcel cargo, mission legs, fixed/mobile DronePorts, coverage, lockers and
  employee assignments are architecture foundations, not a complete autonomous network.

Save v2 adds validated merchant-onboarding and active-transport preferences.
Existing company progress and vehicle IDs are retained. As before, position and
unfinished orders reset on application reload; navigating management screens
within a live session preserves the current delivery. No Start New Game is required.

## OWNER ANDROID REVIEW REQUIRED

After deployment of the reviewed web runtime, use the existing installed shell:

1. Launch DROPi Tycoon in landscape → Continue Game → Game World.
2. Confirm a human outside the small HQ, D-pad, minimap and compact HUD.
3. Hold each direction; try walking into the HQ or another building. Movement must
   stop at the footprint and continue along roads/pavements, with the camera following.
4. Follow the gold marker to the merchant; approach until Action becomes available,
   interact to onboard, then return to HQ to accept a local order.
5. Follow the pickup marker, interact to collect, follow the destination and
   interact to deliver. Confirm parcel state, reward and the next HQ objective.
6. Open Company → Vehicle Fleet, buy/use an owned Bicycle, return to the world and
   switch transport at HQ. Confirm a visible rider and increased cargo capacity.
7. Check Company, Employees, Menu and sound controls; look for the locked HQ
   DronePort expansion and verify it does not launch a human into flight.
8. Exit Game and reopen → Continue. Company money, ownership, onboarding and chosen
   owned transport must survive; unfinished jobs and position follow the reset policy above.

Automated checks do not replace physical Android/performance/art-direction review.
Binary approved references were not inspected, and no screenshot is presented as
owner acceptance. See `../01_GameDesign/GAMEPLAY.md` for exact canonical sources,
real facts, game abstractions and deliberate deviations.

# Historical prototype scope (superseded)

The following records the old prototype baseline, not current controls or current
implementation status. In particular, tap-to-move, automatic pickup, large HUD
panels and the old "not implemented" list below are historical:

- Main menu (updated to reflect active economy)
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
- Accept Order button in player-facing HUD (canonical trigger; package-tap remains compatibility path)
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
- **Player-facing HUD**: camera-fixed panel showing Money, Reputation, active-order status, destination, carrying state, and Accept Order button (visible for Available only; hidden for terminal/pre-active states)
- **Delivery lifecycle notifications**: shown once per canonical state transition (Available→Accepted, Accepted→PickedUp, PickedUp→Completed, PickedUp→Failed); idempotent (no per-frame duplicates); 3-second auto-dismiss; timer cleaned up on scene shutdown; responsive width and position derived from canvas size; no overlap with HUD panels or navigation buttons
- Active-order panel automatically hidden when order status is Completed or Failed (no stale panel)
- HUD pointer isolation: Accept button `pointerdown` calls `stopPropagation()` before invoking acceptance, so the scene-level pointer handler never processes the same tap; after the button is hidden the former area is fully unblocked for world input

Not implemented in this milestone:

- RBATCH-011 MainMenu flow (Start/Continue/new-game guard)
- Upgrade-purchase UI
- DROPiCoins logic
- Marketplace
- Payments
- Database
- Save/load
- RBATCH-012 or later gameplay

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
