# DROPi Tycoon — Phone Money & Ownership Snapshot

Date: 2026-09-07
Issue: #392
Parent: #362
PR: #393

## Scope

The existing in-world `Money & Assets` phone app now exposes a read-only ownership/economy snapshot from authoritative runtime state.

Visible information includes:

- Company Money, retaining its existing meaning and authority;
- Personal Money as a separate balance;
- local player's Internal and External share holdings;
- Internal and External treasury share units;
- cumulative Personal Money dividend income derived from the Personal Money ledger;
- player-facing Founder and current Executive relationship without raw actor identifiers;
- compact reputation, team, fleet and HQ context.

## Authority and compatibility

The phone owns no economic truth. It projects `CompanyState` plus the ownership aggregate materialized by the #390 Save v2 runtime work.

Because `GameSessionState.ownershipEconomy` remains optional at the type boundary for legacy Save v2 compatibility, the phone passes the session value through the canonical ownership sanitizer before rendering. Legacy sessions therefore materialize deterministic defaults instead of failing.

Company Money is not duplicated or reconstructed.

## Interaction boundary

This slice is deliberately read-only.

The phone does not:

- purchase or transfer shares;
- vote or execute governance;
- hire staff;
- buy, assign or maintain vehicles;
- construct HQ departments;
- activate a real exchange or order book.

The locked `Investments` app remains marked `FUTURE`. Major ownership/governance actions remain reserved for a separately gated physical HQ surface.

## Player-facing privacy

The projection does not expose raw EconomicActor IDs, company IDs, employee/vehicle IDs, transaction IDs or receipt identifiers.

## Verification

CI run #281 (`34128131348`) passed on head `2d470ec0ff81ce417151cd0c18bfa4cd3acba2af`:

- 69 / 69 test files passed;
- 1023 / 1023 tests passed;
- TypeScript and Vite production build passed;
- production HTTP smoke passed;
- PR-range whitespace passed;
- archived `Game/` runtime unchanged;
- planning YAML validation passed;
- active planning crosswalk passed;
- Prototype v0.1 owner progression gate passed.

Known nonblocking repository warnings remain unchanged: Vite reports a production chunk above 500 kB; npm audit reports 2 vulnerabilities (1 moderate, 1 high); GitHub Actions reports the existing checkout/setup-node Node 20 deprecation warning while the project build itself uses Node 22.12.0.

## Owner gate

This is a visible Android change. After merge and canonical Railway deployment, explicit owner review under #317 is required before another visible product checkpoint is merged.
