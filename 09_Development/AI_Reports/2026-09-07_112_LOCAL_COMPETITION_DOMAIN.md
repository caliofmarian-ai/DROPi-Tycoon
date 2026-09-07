# AI Implementation Report 112 — Local Competition Domain

Date: 2026-09-07
Issue: #374
Parent: #361
Pull Request: #375
Branch: `openai/issue-374-local-competition-domain`

## Scope

This domain-only slice establishes deterministic local customer competition while deliberately leaving the current order generator, revenue settlement, Save v2 payload and visible UI unchanged.

## Implemented

- Added market-performance profiles keyed by stable `BusinessCompanyId`.
- Kept participant control source (`Player` or `Simulated`) separate from economic scoring so NPC and future player-controlled companies use the same market rules.
- Added governed 0–100 performance factors for price/value, delivery speed, reliability, service quality, reputation, geographic coverage and capability/technology.
- Added replaceable centralized weights for deterministic composite service scoring.
- Treated available service capacity as a hard allocation ceiling instead of a cosmetic score.
- Restricted demand participation to matching `Authorized` companies in the requested operating area and service model.
- Added deterministic integer demand allocation with stable tie-breaking.
- Derived market share from actually allocated demand.
- Preserved explicit unserved demand when active capacity cannot cover total demand.
- Added deterministic tests covering authorization/area/service eligibility, score behavior, capacity ceilings, market-share movement, stable ties, unserved demand, and Player/Simulated parity.

## Deliberate boundaries

- No visible competition/market UI.
- No current order-generation rewiring.
- No revenue/reputation settlement integration yet.
- No new hidden persistence state.
- No rendered competitor-agent requirement.
- No sabotage, collusion or harassment mechanics.
- No blockchain/token/payment advantage.
- No Railway configuration changes.

## Verification

GitHub Actions run #249 passed before this report commit:

- 61/61 test files passed.
- 914/914 tests passed.
- `local-competition-domain.test.ts`: 12/12 passed.
- TypeScript and Vite production build passed.
- Production HTTP smoke passed.
- PR-range whitespace validation passed.
- Archived `Game/` runtime unchanged gate passed.
- Canonical planning YAML syntax/count gate passed.
- Active planning crosswalk gate passed.
- Prototype v0.1 owner progression gate passed.

Known non-blocking repository warnings remain unchanged: npm reports 2 vulnerabilities (1 moderate, 1 high), Vite reports a >500 kB bundle warning, and GitHub Actions warns that checkout/setup-node actions target Node 20 while the runner forces Node 24. Project Node remains 22.12.0.

## Acceptance boundary

#374 may close after the final head including this report receives green CI, PR #375 is merged, and the canonical Railway production service successfully deploys the exact merge commit. Parent #361 remains open for atomic runtime activation, economy/reputation integration, visible market feedback and Android owner review.
