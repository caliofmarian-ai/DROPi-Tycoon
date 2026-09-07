# DURABLE AUTHORITY STACK DECISION

## Document Information

Project: DROPi Tycoon
Status: Canonical Technical Decision
Authority level: Level 7 — Technical Design
Parent authority: `06_Technical/DURABLE_AUTHORITY_AND_AUTHENTICATION.md`
Coordinates: Issue #363, child #400
Date: 2026-09-07

---

## 1. Decision

The first approved implementation stack for durable server authority is:

- **Database engine:** PostgreSQL
- **Initial database hosting target:** a PostgreSQL service inside the existing canonical Railway project and production environment
- **Authentication framework:** Better Auth hosted by the existing Node server
- **Mobile session storage:** Expo SecureStore
- **Authority transport:** the existing Node HTTP authority boundary, evolved from the session-only #394 prototype

This decision selects architecture only. It does not provision infrastructure, install dependencies, create accounts, migrate game state or activate production authentication.

---

## 2. Why This Stack

### 2.1 Railway PostgreSQL

PostgreSQL satisfies the durable-authority requirements already defined by canon:

- unique constraints for command and entity IDs;
- transactional state mutation;
- optimistic concurrency/revision checks;
- durable command receipts and idempotency records;
- event/audit persistence;
- atomic cross-domain economic settlement;
- schema migration support;
- logical export and provider portability.

Hosting the first PostgreSQL service in the same Railway project/environment as the existing Node service is preferred because it:

- minimizes new operational surfaces for the Project Owner;
- keeps the application and database inside the existing protected deployment topology;
- supports private service-to-service connectivity;
- avoids adding an external database network hop to every authoritative command;
- keeps Railway deployment, logs and operational ownership in one environment.

Railway remains an infrastructure provider, not a gameplay or economy authority. PostgreSQL data is authoritative only after the relevant domain has explicitly migrated under a governed issue.

### 2.2 Better Auth

Better Auth is selected as the authentication framework because it can run inside the existing Node server and use PostgreSQL as its durable store.

This provides:

- authenticated server context without trusting caller-provided `actorId`;
- an owner-maintainable, self-hosted application boundary;
- database-backed account/session state;
- replaceable login/provider methods;
- Expo/React Native integration;
- secure mobile session/cookie storage through Expo SecureStore.

Better Auth is the framework choice. It does not by itself approve a specific production sign-in method.

---

## 3. Approved Topology

```text
Installed Android app / Phaser runtime
        |
        | HTTPS
        v
Existing canonical Node service
        |
        +--> Better Auth request/session boundary
        |
        +--> Shared authority command API
        |
        | Railway private service connectivity
        v
PostgreSQL service in the same canonical Railway project/environment
        |
        +--> authentication/account data
        +--> authority aggregate revisions
        +--> command idempotency/receipts
        +--> authority events/audit records
        +--> later migrated shared-state repositories
```

The PostgreSQL service is a separate infrastructure service from the Node runtime. The game/web service remains the application/API boundary; the database is not exposed as a client-side API.

---

## 4. Database Organization

The first durable database may contain multiple logical domains, but they must remain explicitly separated by schema/table ownership and repository boundaries.

Recommended logical separation:

- authentication/account/session data;
- public profile data;
- authority command/idempotency data;
- authority aggregate/event/audit data;
- future company/membership/economic state only after individual migration approval.

A dedicated authentication schema is preferred when it integrates cleanly with the selected Better Auth migration setup. If the implementation uses the default PostgreSQL schema instead, table naming and ownership must still prevent accidental overlap with game-domain tables.

No production schema may be edited manually as an undocumented one-off operation.

---

## 5. Configuration and Secret Contract

The provisioning implementation may introduce server-only configuration with the following responsibilities.

### Database connection

- `DATABASE_URL` — server-only PostgreSQL connection string supplied from the future Railway PostgreSQL service.

The exact Railway reference-variable syntax must be taken from the active Railway configuration at provisioning time. It must not be guessed or hardcoded in canon.

### Better Auth

- `BETTER_AUTH_SECRET` — high-entropy server-only signing/cryptographic secret.
- `BETTER_AUTH_URL` — canonical server base URL used by the authentication framework where required.

Additional trusted-origin, application-scheme or provider configuration may be introduced only by the child issue that activates the corresponding login method.

Rules:

- secret values never enter Git;
- secret values never enter `VITE_*` variables;
- secret values never enter Phaser client assets;
- production database credentials are never embedded in the installed game;
- mobile authentication session material uses secure platform storage, not AsyncStorage.

---

## 6. Authentication Method Gate

Selecting Better Auth does **not** automatically enable email/password, magic link, Google, Apple or any other login method.

A production login method must have its own implementation child defining:

- account creation/linking behavior;
- identity verification;
- recovery behavior;
- logout/revocation;
- abuse/rate-limit rules;
- provider secrets where applicable;
- Android deep-link/redirect behavior where applicable;
- owner/player support implications.

Email/password must not be activated merely to display a login screen. If email/password is selected later, email verification and account/password recovery must be designed and operational before it can protect durable economic identity.

---

## 7. Mobile Session Boundary

For Expo/React Native:

- session/cookie material must be stored with Expo SecureStore or the secure mechanism required by the approved Better Auth Expo integration;
- AsyncStorage is not approved for authentication secrets or durable session credentials;
- the Phaser runtime must not become the primary credential store;
- the mobile shell may bridge authenticated requests/session state to the game runtime only through an explicitly designed interface;
- public profile information can be projected into gameplay separately from private account/session material.

No native login UI is activated by this decision.

---

## 8. Migration Contract

Database schema evolution must be versioned and reproducible.

Required rules:

1. schema changes are represented by committed migrations or equivalent reproducible migration definitions;
2. migrations are reviewed in a dedicated PR;
3. CI must validate migration/schema behavior before production application;
4. production schema changes must never rely on ad-hoc dashboard edits as the only source of truth;
5. destructive migrations require explicit data-preservation/rollback analysis;
6. application deployment must remain compatible with the migration order used for that release;
7. economic-domain migration cannot occur until authentication and durable command replay are proven independently.

Better Auth-generated schema/migrations may be used, but their output becomes reviewed repository material rather than an invisible production mutation.

---

## 9. Backup and Recovery Contract

Before durable shared economic authority is considered production-ready, the PostgreSQL service must have layered recovery evidence.

Required target:

- scheduled Railway volume backups;
- point-in-time recovery where the selected Railway/PostgreSQL topology supports it and before high-value shared economic state is activated;
- periodic portable PostgreSQL logical dumps using `pg_dump` or equivalent;
- at least one documented restore drill before high-value economic authority is trusted;
- restoration checks for revisions, command receipts/idempotency records and economic invariants.

Provider-native snapshots alone are not sufficient as the only long-term portability strategy. Logical exports must remain possible so the project can move providers if necessary.

---

## 10. Rollback and Failure Policy

The current #394 memory-resident authority prototype remains useful for non-economic development/testing, but it is **not** a fallback authority for durable production state.

If the durable database or authentication layer fails:

- durable economic writes must fail closed;
- the client must not invent a successful local transaction;
- Company Money, Personal Money, shares or membership must not silently fall back to an in-memory registry;
- already-migrated authoritative data must remain recoverable from durable persistence/backups;
- rollback must use a compatible application/database version or a governed forward-fix path.

The app may continue local/offline presentation or explicitly local gameplay only where the migrated state-family policy permits it.

---

## 11. Cost and Owner-Maintainability Posture

This architecture deliberately minimizes the number of providers and operational surfaces.

Railway billing is usage-based and actual monthly database cost depends on allocated/consumed compute, memory, storage, backups and traffic. This decision does not promise a fixed monthly database price.

Cost controls for the provisioning child must include:

- smallest safe initial resource footprint;
- monitoring of actual database resource usage;
- bounded backup retention appropriate to the prototype stage;
- no unnecessary replica or service duplication;
- a documented export path to another PostgreSQL provider if costs or requirements materially change.

The Project Owner must be able to understand where the application runs, where data lives, how to export it and how to restore it without dependence on undocumented agent knowledge.

---

## 12. Alternatives Considered

### 12.1 Supabase PostgreSQL + Supabase Auth

Advantages:

- integrated PostgreSQL and authentication platform;
- convenient management surface;
- useful prototype tier.

Reasons not selected for the first implementation:

- introduces a second backend operational authority while the canonical app already runs on Railway;
- production-grade backup posture depends on paid capabilities and plan choices;
- application-to-database/auth traffic crosses provider boundaries;
- creates more project-owner operational surface before it is required.

Supabase remains a valid future alternative if its operational or product benefits later outweigh provider consolidation.

### 12.2 Neon PostgreSQL + Neon Auth / Better Auth

Advantages:

- PostgreSQL portability;
- low-cost/serverless development posture;
- authentication offering based on Better Auth;
- scale-to-zero can be efficient for low activity.

Reasons not selected for the first implementation:

- creates an external network hop from the Railway application service;
- adds a second infrastructure provider/operator surface;
- scale-to-zero/cold-start behavior is less attractive for frequent authoritative multiplayer/economic commands unless configured for continuously available capacity.

Neon remains a valid future portability/cost alternative.

---

## 13. Explicit Non-Goals

This decision does not authorize or implement:

- PostgreSQL service creation;
- Railway variables/secrets;
- Better Auth dependency installation;
- Better Auth schema migrations;
- production account creation;
- a login screen;
- email/password or social login activation;
- Company Money migration;
- Personal Money migration;
- equity/membership/marketplace migration;
- real-money payments;
- premium currency;
- blockchain, DROPi Token, wallet or KYC functionality;
- visible gameplay/UI change.

---

## 14. Next Governed Step

The next child of #363 may provision the selected PostgreSQL service and introduce the minimum Better Auth/server repository foundation.

That child must first verify available Railway tooling and the exact safe provisioning path. It must not create an ephemeral PostgreSQL container without persistent storage merely to satisfy this ADR.

Real shared economic state migration begins only after durable persistence, authentication, restart/replay behavior, migration and recovery tests are independently green.
