# AI Implementation Report 110 — Personal Capability Foundation

Date: 2026-09-07
Issue: #370
Parent: #359
Pull Request: #371
Branch: `openai/issue-370-personal-capability-domain`

## Purpose

Establish the first authoritative personal profession/education domain without adding a visible Training UI while owner Android review is unavailable.

## Implemented

- Added stable personal capability IDs and specialization families.
- Added `PersonalProgressionState` as a player/session domain separate from `CompanyState`.
- Added a data-driven capability graph with `Learned`, `Available`, `Blocked`, and `Future` states.
- Added canonical starter capability state:
  - Delivery App Literacy
  - Walking Courier Fundamentals
- Added an early Bicycle Operation branch that requires Walking Courier Fundamentals plus a progression-point threshold. Company Money does not satisfy this qualification requirement.
- Added future prerequisite representation for powered two-wheel, road vehicle, operations, technical, business, drone, air, maritime, and rail capability families.
- Added physical HQ department prerequisite support, including the future Bicycle Maintenance + Maintenance department relationship.
- Added a reusable vehicle-capability eligibility query. Current vehicle access remains unchanged in this domain-only slice.
- Added malformed personal-progression sanitization.

## Save v2 Compatibility

The save format remains version 2.

`personalProgression` is an additive optional root field. Existing Save v2 payloads that do not contain this field remain valid and restore the canonical starter personal state. A new save omits the field while the player remains at starter defaults and writes it once meaningful personal progression exists.

No existing company, vehicle, employee, financial, HQ, settings, or urban save field was removed or redefined.

## Tests

Added `game-web/tests/personal-capability-system.test.ts` with 10 focused tests covering:

1. one definition for every stable capability ID;
2. canonical starter state;
3. Bicycle Operation prerequisite and progression-point blocking;
4. Company Money non-bypass;
5. successful early Bicycle Operation learning transition;
6. future facility prerequisite representation;
7. reusable vehicle eligibility query;
8. compact legacy/current Save v2 behavior with starter restoration;
9. real personal progression Save v2 round-trip;
10. malformed-state sanitization.

## CI Evidence — Run #243

Workflow: `DROPi Tycoon Prototype CI`
Run ID: `34111037031`
Head at first complete verification: `d86bb5843b2bfc92ece2f33220a50fd2d615842c`

Result: SUCCESS

- Test files: 59 / 59 passed
- Tests: 891 / 891 passed
- TypeScript + Vite production build: PASS
- Production server HTTP smoke test: PASS
- PR-range whitespace validation: PASS
- Archived `Game/` runtime unchanged: PASS
- Canonical planning YAML validation: PASS
- Active planning crosswalk validation: PASS
- Prototype v0.1 owner progression gate: PASS

Known non-blocking repository warnings remain present and are not represented as resolved:

- Vite production bundle remains above the 500 kB warning threshold.
- `npm audit` reports 2 vulnerabilities: 1 moderate and 1 high.
- GitHub Actions reports that `actions/checkout@v4` and `actions/setup-node@v4` target deprecated Node 20 internals and are being forced to Node 24 by the runner; the project build itself uses Node 22.12.0.

## Scope Boundary

This slice does not add a visible Training screen, does not lock current vehicles, does not represent Tycoon qualifications as real legal licences, and does not introduce blockchain/token/payment progression advantages.

Issue #370 may close after final-head CI and canonical production deployment are green. Parent #359 remains open for the later playable visible training branch and Android owner review.
