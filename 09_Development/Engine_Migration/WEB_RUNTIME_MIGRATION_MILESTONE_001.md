# Document Information

Document: WEB_RUNTIME_MIGRATION_MILESTONE_001.md
Project: DROPi Tycoon
Version: 0.1.0
Status: Migration Milestone Implemented
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-15

---

# Web Runtime Migration Milestone 001

This milestone creates the first deployable browser runtime candidate for DROPi Tycoon under `game-web/`.

The existing canonical design and previous implementation work are preserved.

The GDevelop implementation remains archived/reference-only and is not deleted or rewritten.

The web runtime is now the new deployable implementation candidate for Railway.

Final migration approval occurs only after the Project Owner tests the Railway browser build.

---

# Scope

Only BATCH-001 through BATCH-007 behavior was ported.

No canonical gameplay change occurred.

No BATCH-008 or later functionality was implemented.

No marketplace, premium purchasing, backend wallet, or database runtime is active in this milestone.

---

# Runtime Decision

Selected runtime/library:

- `phaser` `3.90.0`

Supporting toolchain:

- `vite` `8.1.1`
- `typescript` `6.0.2`
- `vitest` `4.1.10`

Reason:

Phaser is a code-based HTML5 2D runtime that can be maintained entirely through GitHub without requiring the Project Owner to use an external visual editor.

---

# Preserved Historical Artifacts

The following historical/reference artifacts remain unchanged:

- `Game/DROPi_Tycoon.json`
- `Game/Assets/`
- canonical project documentation;
- historical AI reports.

The web runtime copies only the minimum required placeholder runtime assets into `game-web/public/assets/sprites/`.

---

# Ported Behavior

The web runtime reproduces the currently merged prototype behavior:

1. Main menu
2. Game world
3. Company-management placeholder navigation
4. Existing placeholder world composition
5. Player
6. Buildings
7. Package
8. Delivery points
9. Road/environment tiles
10. Android-first tap-to-move
11. Camera following Player
12. Order states: `Created`, `Available`, `Accepted`, `PickedUp`, `Completed`, `Failed`
13. Implemented transitions only:
    - `Created -> Available`
    - `Available -> Accepted`
    - `Accepted -> PickedUp`
14. Minimal Android-compatible acceptance interaction
15. Automatic pickup on correct proximity
16. `CarryingPackage = true` after pickup
17. No delivery completion
18. No reward or Money modification
19. No DROPiCoins functionality
20. No marketplace

---

# Temporary UI

The runtime includes a temporary debug/status panel showing:

- current order status;
- `CarryingPackage` state;
- short touch instruction.

It is explicitly temporary/debug UI and not a final HUD.

---

# Railway Deployment Model

Railway should run the service from:

- Root Directory: `game-web`
- Install: `npm ci`
- Build: `npm run build`
- Start: `npm run start`

The production server:

- serves `dist/`;
- listens on `process.env.PORT`;
- falls back to `3000` locally;
- binds to `0.0.0.0`;
- serves `index.html`;
- serves static assets;
- supports browser-navigation fallback to `index.html`.

No database is required.

No secrets are required.

No persistent volume is required.

---

# Migration Approval Boundary

This milestone does not itself make the deployment canonically approved.

Approval happens only after:

1. Railway redeploys the new `game-web/` runtime; and
2. the Project Owner confirms the public browser build on Android.

---

# Future Work Boundary

Future marketplace/backend architecture is planned but not implemented.

The future server-authoritative preparation note is non-canonical and does not activate any backend service in the current milestone.
