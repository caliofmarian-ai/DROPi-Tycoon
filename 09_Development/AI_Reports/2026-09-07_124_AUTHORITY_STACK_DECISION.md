# AI REPORT 124 — AUTHORITY STACK DECISION

Date: 2026-09-07
Issue: #400
Parent: #363
Status: IMPLEMENTED ON BRANCH — CI PENDING

## Objective

Select the first durable persistence and authentication implementation stack after the durable-authority boundary was canonized by #398.

## Decision

Selected architecture:

- PostgreSQL as the durable database engine;
- initial PostgreSQL hosting inside the existing canonical Railway project/environment;
- Better Auth hosted by the existing Node service;
- Expo SecureStore for mobile session material;
- existing authority HTTP boundary evolved from the #394 prototype.

## Rationale

The selected stack keeps the first durable authority implementation inside the existing operational topology, minimizes extra vendors and network hops, preserves PostgreSQL portability, supports transactional/idempotent authority requirements and provides an official Expo-compatible authentication path.

Supabase and Neon remain valid alternatives, but were not selected for the first implementation because they add an external backend/provider boundary before the project needs one.

## Security and identity boundaries

- Better Auth is the framework decision, not the production login-method decision.
- Email/password is not automatically authorized.
- A future login-method child must define verification, recovery, revocation, abuse controls and provider/deep-link requirements.
- Production server authorization derives the actor from authenticated session context, never from caller-provided `actorId`.
- Server/database/auth secrets never enter Git, `VITE_*`, Phaser assets or AsyncStorage.
- Expo SecureStore is the approved mobile session-secret surface for the selected integration.

## Persistence and recovery boundaries

The future provisioning implementation must support:

- versioned/reproducible PostgreSQL migrations;
- durable command receipts and idempotency across restarts;
- scheduled Railway volume backups;
- point-in-time recovery before high-value shared economic authority;
- portable logical PostgreSQL exports;
- documented restore testing;
- fail-closed behavior when durable auth/database is unavailable.

The session-only #394 registry must never become a fallback authority for durable production Company Money, Personal Money, ownership or membership.

## Configuration contract

Only names/responsibilities are selected in this issue:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`

No values are created or committed. Exact Railway reference-variable syntax must be resolved from the active infrastructure during the provisioning child rather than guessed.

## Not implemented

- no PostgreSQL service;
- no volume;
- no Railway variable/secret changes;
- no Better Auth package or schema;
- no production login;
- no account/economic migration;
- no real-money, premium currency, DROPi Token, blockchain, wallet or KYC implementation;
- no visible gameplay/UI change.

## Owner review

No Android owner visual review is required for #400 because this slice is architecture/documentation only.

## Next gate

A separate child of #363 may provision PostgreSQL and the minimum Better Auth/repository foundation only after verifying that the available Railway tooling can create persistent database infrastructure safely. An ephemeral raw PostgreSQL container without durable storage is not an acceptable shortcut.
