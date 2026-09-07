# Document Information

Document: ENVIRONMENT_VARIABLES.md
Project: DROPi Tycoon
Version: 0.2.0
Status: Active Web Runtime Contract
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-07

---

# Environment Variables

This document defines the active environment-variable contract for the current deployable web runtime in `game-web/`.

Only variables actually consumed by the application are listed here.

Economy, identity and server-authority terminology is owned by current canonical design/technical documents. This file does not create currencies, wallets, accounts, authentication providers, databases or payment systems.

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

As of 2026-09-07, the canonical production service has no approved database/authentication variable contract. The session authority prototype under `/api/authority/*` is deliberately non-durable and unauthenticated.

---

# What Must Not Be Stored In Frontend/Public Environment Variables

The following must not be stored in `.env` files committed to Git, public `VITE_*` variables, or any frontend-exposed configuration:

- gameplay state;
- player position;
- player save data;
- Company Money balances;
- Personal Money balances;
- company equity/share holdings;
- marketplace state;
- inventory ownership;
- transaction history;
- item ownership;
- payment state;
- purchase receipts;
- secret/session tokens;
- authentication-provider secrets;
- database credentials;
- Android signing material;
- future ecosystem-token private keys or custody secrets.

Company Money, Personal Money and company equity are defined by current Business/Economy canon. Historical references in older migration material to generic `Money` wallets or `DROPiCoins` do not create current authority and do not activate a premium currency.

---

# Railway and GitHub Secret Guidance

Future server secrets, if and when their owning systems are approved, must be stored only in an approved encrypted secret surface such as:

- Railway encrypted service variables; or
- GitHub encrypted secrets, where appropriate to build/deployment automation.

The exact secret contract must be introduced by the issue that selects and provisions the corresponding authentication/persistence provider.

No database URL, authentication secret, payment secret, wallet secret or token secret is part of the currently approved production contract.

See `06_Technical/DURABLE_AUTHORITY_AND_AUTHENTICATION.md` for the canonical future persistence/authentication boundary.

---

# Tracked Example Files

Tracked examples:

- `game-web/.env.example`
- `game-web/.env.railway.example`

Real `.env` files must remain ignored by Git.
