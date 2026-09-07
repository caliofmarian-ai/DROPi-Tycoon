# AI REPORT 122 — SESSION AUTHORITY TRANSPORT

Date: 2026-09-07
Issue: #394
Parent: #363
PR: #397
Status: IMPLEMENTED ON BRANCH — FINAL REPORT-INCLUSIVE CI PENDING

## Objective

Materialize the first real network authority boundary on the existing DROPi Tycoon production server without falsely claiming durable multiplayer state or production authentication.

## Implemented

- added `game-web/server/session-authority.mjs`;
- extended the existing `game-web/server/server.mjs` rather than creating another service;
- added bounded `/api/authority/*` HTTP routes on the same Node process;
- implemented server-process ownership of public-profile aggregate revision, first-seen command IDs, authoritative sequence and receipts;
- implemented `CreatePublicProfile` and `SetDisplayName` only;
- implemented optimistic `expectedRevision` conflict detection;
- implemented exact command replay without duplicate mutation;
- implemented conflicting command-ID detection when the same ID is reused with different intent;
- implemented receipt lookup for reconnect reconciliation;
- withheld internal owner actor ID from public profile reads;
- implemented strict JSON/content-type/request-size/ID/display-name/capacity validation;
- documented the session-only/non-durable boundary in `06_Technical/SERVER_AUTHORITY_PROTOTYPE.md`;
- preserved existing SPA/static hosting behavior outside `/api/authority/*`.

## Explicit honesty boundary

This slice does **not** provide durable accounts or production authentication.

The authority registry is memory-resident and resets on process restart/deployment. Therefore it does not own Company Money, Personal Money, shares, dividends, governance, company membership, marketplace settlement, world presence or chat.

The internal owner actor ID is only a process-lifetime consistency guard. It must not be represented as an authenticated account system.

## Tests

New file: `game-web/tests/session-authority-server.test.ts`

Coverage includes:

1. explicit session-only/non-authenticated status surface;
2. separate HTTP clients observing the same server-owned revision;
3. exact replay without a second mutation;
4. stale revision rejection;
5. accepted current-revision update incrementing exactly once;
6. command-ID reuse with different intent rejected as conflict;
7. another actor ID unable to mutate an existing process-owned profile;
8. receipt lookup for reconnect;
9. malformed JSON and wrong content type fail closed;
10. process restart resets the non-durable registry.

## First full CI evidence

GitHub Actions run: `34131811222`

Result: SUCCESS

- Test files: 70/70 passed
- Tests: 1033/1033 passed
- New server authority tests: 10/10 passed
- TypeScript and Vite production build: PASS
- Production server HTTP smoke: PASS
- PR-range whitespace: PASS
- archived `Game/` unchanged: PASS
- canonical planning YAML: PASS
- active planning crosswalk: PASS
- Prototype v0.1 owner progression gate: PASS

Known repository warnings remain unresolved and are not introduced by this slice:

- Vite production bundle remains above 500 kB;
- `npm audit` reports 2 vulnerabilities (1 moderate, 1 high);
- GitHub Actions warns that checkout/setup-node actions target Node 20 while the runner forces Node 24; the project runtime itself is configured for Node 22.12.0.

## Railway boundary

No Railway project, environment, service, variable or service configuration is changed by this implementation.

After final report-inclusive CI, merge must deploy only through the existing canonical production topology:

- Project: `5dbea950-2484-46e2-a64d-3040b8d42f3c`
- Environment: `09e4bb35-9330-4191-b907-e2c45855ef5f`
- Service: `27e4ba12-d290-4df9-b711-092be032a9f8`

## Follow-up

After #394, parent #363 must remain open. The next migration gate is a governed choice and implementation of durable persistence plus real authentication before any shared economic state can become server-authoritative.

No Android owner review is required for #394 because this slice changes no visible gameplay or application UI. Visible issue #392 remains independently pending owner Android review under #317.
