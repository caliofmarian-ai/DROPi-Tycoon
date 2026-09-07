# AI Implementation Report 111 — Local Business Formation Domain

Date: 2026-09-07
Issue: #372
Parent: #360
Pull Request: #373
Branch: `openai/issue-372-business-formation-domain`

## Purpose

Establish the non-visible company identity, local registry, municipal-authorization abstraction, and formation-eligibility domain while owner Android review is unavailable.

## Implemented

- Added opaque economic actor, company and operating-area identifier semantics.
- Added deterministic local-only actor/company ID factories. Future server-authoritative IDs may use different opaque values without changing domain fields.
- Added a local business registry capable of representing multiple company identities and persistent founder history at the domain level.
- Added fictional business authorization states: Pending, Authorized, Suspended, Denied and Closed.
- Added deterministic authorization transition rules.
- Added `LocalCourier` as the first governed service model.
- Added centralized prototype formation-resource tuning in `BALANCING`.
- Added formation eligibility that evaluates:
  - Entrepreneurship capability;
  - service-specific personal capability;
  - governed in-game resources;
  - local operating-area/service capacity;
  - company-ID uniqueness;
  - whether the actor already founds an active company.
- Added explicit block reasons and resource/capacity diagnostics.
- Added capacity occupancy rules where Pending, Authorized and Suspended companies occupy capacity while Denied and Closed records release it.
- Added independent-actor and historical-founder queries so a closed company does not erase founder history while normal participation can recover.
- Added registry sanitization and clone helpers for later persistence integration.

## Runtime / Save Boundary

The current starter `CompanyState`, `GameSessionState`, and Save v2 payload remain unchanged.

The business registry is deliberately not attached to runtime persistence in this domain-only slice because no playable company-formation flow activates it yet. This avoids introducing hidden mutable state that could be lost on Continue. The registry has explicit sanitization/clone contracts so the later governed playable slice can add persistence atomically with activation and migration behavior.

No City Hall UI was introduced, so this slice creates no new Android visual acceptance checkpoint.

## Tests

Added `game-web/tests/business-formation-domain.test.ts` with 11 focused tests covering:

1. service-model definition completeness;
2. deterministic local ID factories;
3. independent-player representation;
4. qualification requirements and money non-bypass;
5. minimum governed game resources;
6. successful formation submission into Pending authorization;
7. bounded local capacity denial;
8. recoverable capacity after company closure;
9. founder-history preservation after closure;
10. invalid authorization-transition rejection;
11. malformed/duplicate registry sanitization while accepting future opaque server IDs.

## CI Evidence — Run #246

Workflow: `DROPi Tycoon Prototype CI`
Run ID: `34112332735`
Head at first complete verification: `f0a4a009bd65ec815a4f38cfb2d757ae2a4e2a7c`

Result: SUCCESS

- Test files: 60 / 60 passed
- Tests: 902 / 902 passed
- TypeScript + Vite production build: PASS
- Production server HTTP smoke test: PASS
- PR-range whitespace validation: PASS
- Archived `Game/` runtime unchanged: PASS
- Canonical planning YAML validation: PASS
- Active planning crosswalk validation: PASS
- Prototype v0.1 owner progression gate: PASS

Known non-blocking repository warnings remain present and are not represented as resolved:

- Vite production bundle remains above the 500 kB warning threshold (about 1,389.82 kB, gzip 376.81 kB in this run).
- `npm audit` reports 2 vulnerabilities: 1 moderate and 1 high.
- GitHub Actions reports that `actions/checkout@v4` and `actions/setup-node@v4` target deprecated Node 20 internals and are being forced to Node 24 by the runner; the project build itself uses Node 22.12.0.

## Scope Boundary

This slice is a fictional Tycoon business domain, not legal advice or a representation of real incorporation law. It does not add multiplayer authority, real-world payments, blockchain/token bypasses, national company law, or a visible City Hall flow.

Issue #372 may close after final-head CI and canonical production deployment are green. Parent #360 remains open for activation/persistence of the bounded playable formation flow and Android owner review.
