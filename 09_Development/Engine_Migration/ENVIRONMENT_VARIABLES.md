# Document Information

Document: ENVIRONMENT_VARIABLES.md
Project: DROPi Tycoon
Version: 0.1.0
Status: Active Web Runtime Contract
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-15

---

# Environment Variables

This document defines the active environment-variable contract for the first deployable web runtime in `game-web/`.

Only variables actually consumed by the application are listed here.

---

# Active Frontend Variables

The web runtime currently reads only public `VITE_*` values:

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `VITE_APP_NAME` | No | `DROPi Tycoon` | Browser-visible application name |
| `VITE_APP_VERSION` | No | `0.1.0` | Runtime display version |
| `VITE_GAME_WIDTH` | No | `1280` | Internal canvas width |
| `VITE_GAME_HEIGHT` | No | `720` | Internal canvas height |
| `VITE_ENABLE_DEBUG_PANEL` | No | `true` | Enables temporary debug/status panel |

These values are public build-time configuration.

Do not store secrets in any `VITE_*` variable.

---

# Active Server Variable

| Variable | Required | Source | Purpose |
|---|---|---|---|
| `PORT` | Yes in production | Railway runtime | Production HTTP port for `server/server.mjs` |

The production server:

- reads `process.env.PORT`;
- falls back locally to `3000`;
- binds to `0.0.0.0`.

---

# What Must Not Be Stored In Environment Variables

The following must not be stored in `.env`, `VITE_*`, or any frontend-exposed variable:

- gameplay state;
- player position;
- player save data;
- Money balances;
- DROPiCoins balances;
- marketplace state;
- inventory ownership;
- transaction history;
- item ownership;
- payment state;
- Google Play purchase receipts;
- secret tokens;
- Android signing material.

Money is the canonical standard in-game currency.

DROPiCoins is the approved premium currency.

Neither currency is active in this milestone.

---

# Railway and GitHub Secret Guidance

Future secrets must be stored only in:

- Railway encrypted service variables; or
- GitHub encrypted secrets, where appropriate.

No secret token is required for this milestone.

No database URL is required for this milestone.

---

# Tracked Example Files

Tracked examples:

- `game-web/.env.example`
- `game-web/.env.railway.example`

Real `.env` files must remain ignored by Git.
