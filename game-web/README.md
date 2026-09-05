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

The current Game World is an interactive, locally code-drawn city with
collision-constrained movement, a human courier, follow camera, minimap, physical
merchant/customer interactions, a dimensional HQ and a locked future Main
DronePort expansion. Walking and an owned bicycle can be selected at HQ.
No native-shell change or new APK is needed to review a deployed web-runtime update.

- Move with the on-screen directional pad, WASD or arrow keys.
- Follow the gold objective to meet the merchant and activate local marketplace demand.
- Return to HQ and use Action / E to accept work.
- Walk to the marked pickup, use Action / E, then do the same at the customer.
- Buy a bicycle through Menu → Company → Vehicles (Vehicle Fleet); return to HQ to select it.
- Company management, employees, finances and procedural sound remain available.
- Zoom with the minimap's −/+ buttons or two fingers on unobstructed world space.
  Zoom is bounded to 0.65–2×; follow remains active, rotation stays off, and the HUD
  remains at native screen size. The minimap shows districts, current camera
  coverage, HQ, the courier and the active pickup/delivery.
- The ground operator and future aerial drone are separate domain actors.
- Multi-parcel cargo, mission legs, fixed/mobile DronePorts, coverage, lockers and
  employee assignments are architecture foundations, not a complete autonomous network.

Save v2 adds validated merchant-onboarding and active-transport preferences.
Existing company progress and vehicle IDs are retained. As before, position and
unfinished orders reset on application reload; navigating management screens
within a live session preserves the current delivery. No Start New Game is required.

## Living-city visual foundation

- **City scale:** 3200 × 2400 world units, four times the previous 1600 × 1200
  area, populated by 95 buildings and 19 connected roads with pavements.
- **Districts:** Old Town, Cedar Commerce, Foundry Quarter, Station Commons,
  Canal & Quays and Garden Borough. The catalog exposes `City → District[] →
  Location[]`, with building entrances and connected road routes rather than
  arbitrary destination coordinates. This is one city, not a multi-city release.
- **Physical jobs:** eight merchants and 21 customer destinations including
  houses, apartments, offices, studios and yards. Walking/bicycle route pools
  filter on actual connected travel distance and transport range. Order
  sequence and an optional deterministic seed select varied routes without
  changing accepted jobs or introducing random save state.
- **Art:** shared navy, cyan, green and warm-gold tokens; layered roofs,
  storefront identities, windows, shadows, substantial tree canopies and street
  furniture. Human/rider atlases have distinct north/back, south/front, west
  and east frames, with walking/pedaling and carried-parcel variants.
- **Living activity:** bounded, deterministic pedestrian and traffic loops;
  ambient actors do not collide with the player, fulfil orders or alter saves.
- **Company UX:** Company, Vehicle Fleet, Employees, Reviews and Finances use
  shared cards, local illustrations and touch-sized navigation. Money,
  reputation, owned vehicles, staff, reviews and progression come from the
  current company state, including empty/locked states.
- **Mobile workload:** reuse generated local textures/atlases, batch static
  graphics, update HUD at a reduced rate, and skip off-screen ambient rendering.
  This is an implementation budget, not a measured Android frame-rate claim.
- No downloaded art, fonts, scripts, runtime URLs or new dependencies were
  added. Owner references are not backgrounds; all city entities remain real
  Phaser objects. Audio, stable vehicle IDs, Save v2, the optional future
  ecosystem boundary and #319 DronePort architecture remain intact.

## OWNER ANDROID REVIEW REQUIRED

Issue #317 remains open. Automated checks are not visual acceptance, and this PR
must not be merged without the owner's installed-Android review.

The existing installed shell loads the runtime configured by
`EXPO_PUBLIC_DROPITYCOON_GAME_URL` (currently documented as
`https://dropi-tycoon-production.up.railway.app/`). Opening this PR does **not**
deploy it. First arrange an owner-authorized deployment of the exact PR head to
the shell's configured review runtime; do not mistake the old main deployment
for this sprint. This remote shell hosting is pre-existing; the game itself
adds no external asset service. Local validation uses only `127.0.0.1`.

1. Record the reviewed runtime SHA and installed app version/versionCode.
   Launch **DROPi Tycoon → landscape → Continue Game → Game World** (Start Game
   only for a genuinely new save; do not erase existing progress).
2. Inspect HQ, storefronts, vegetation, road/sidewalk detail, pedestrian activity,
   mission HUD, minimap, D-pad and Action button at normal zoom.
3. Walk north, south, west and east, stopping after each direction. Confirm a
   back/front/profile human, carried parcel and stable follow. Buildings and
   tree trunks must block movement without trapping the courier.
4. If not already onboarded, follow gold to a merchant, press Action, return to
   HQ and accept work. At each physical pickup/destination, use Action to
   collect/deliver. Repeat jobs and verify merchant/customer names and actual
   locations vary; money and reviews change only through real delivery outcomes.
5. Open **Menu → Company → Vehicles (Vehicle Fleet)**. Buy a Bicycle only with
   earned Company Money (or use existing ownership); return to Game World,
   approach HQ and choose **Take bicycle**. Ride all four directions: north and
   south must show longitudinal wheels and back/front rider, never the normal
   side-view bicycle. Test cargo, parking and return to walking.
6. Visit the other five districts, including Canal & Quays and Garden Borough;
   inspect physical endpoints and ambient activity. Use −/+ and pinch across
   the full zoom range; HUD/control size must not change. Release fingers
   outside controls, open/close Menu and resume movement without stuck input.
7. Check **Menu → Company → Employees / Reviews / Finances / Vehicles** and
   return navigation. Compare counts, ownership, money and reviews to actual
   progress; check both empty and populated states. Verify sound toggling and
   native Android Back. Main DronePort stays visibly future/locked.
8. Save & Exit, reopen → Continue. Money, ownership, onboarding and selected
   owned transport must survive; position and unfinished orders reset as
   documented. Record any clipping, input defects, frame drops or thermal issues.

Automated checks do not replace physical Android/performance/art-direction review.
No reference attachments were fetched in this recovery. Local browser inspection
was unavailable because the Playwright MCP transport closed; no screenshot or
browser success is claimed. Production HTTP, TypeScript, Vite and deterministic
test results are reported separately in the PR. See `../01_GameDesign/GAMEPLAY.md` for exact canonical sources,
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
