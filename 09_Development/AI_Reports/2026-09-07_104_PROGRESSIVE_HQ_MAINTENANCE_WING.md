# AI Implementation Report — Progressive HQ Maintenance Wing

Date: 2026-09-07
Parent issue: #343
Implementation issue: #352
Pull request: #356
Branch: `openai/issue-352-progressive-hq-maintenance-wing`

## Owner handoff context

The owner confirmed on the installed Android app that the productive employee-fleet implementation from PR #351 works. That acceptance was recorded on #346 and #346 was closed before this task started.

The owner then explicitly instructed continuation with the next task. The next priority was #343, progressive physical HQ growth.

## Audit decision

The existing HQ runtime already contained a visually reserved `MAINTENANCE WING` area labeled as requiring construction. Operations and Dispatch, by contrast, are already part of the current required management loop.

To avoid destabilizing the playable Operations path or creating a second conflicting expansion representation, the first progressive-HQ implementation slice converts the existing Maintenance construction placeholder into authoritative gameplay state.

The original child-issue wording was adjusted accordingly. Issue #352 is the active child implementation issue. Accidental/duplicate tooling issues #353, #354, and #355 were immediately closed and carry no product scope.

## Implemented progression model

`CompanyState` now contains explicit HQ progression state using stable department identifiers.

The initial company begins with only the `Core` headquarters footprint. `Maintenance` exists as a governed future department until constructed.

A reusable `hqProgressionSystem.ts` defines:

- stable department definitions;
- minimum company-level requirements;
- centralized construction cost;
- constructed/unconstructed status;
- missing prerequisites;
- single-charge construction behavior;
- normalized HQ department state.

The current Maintenance cost and level values are centralized prototype balancing values. They are not promoted to permanent game-design pricing canon.

## Physical HQ experience

`HQInteriorScene` now turns the existing Maintenance zone into a real physical construction surface.

Before construction:

- the wing is visibly unfinished;
- the player sees the construction state and current requirement;
- the build action remains locked until authoritative requirements are satisfied;
- operational workshop equipment is absent.

When eligible, the physical HQ surface exposes `BUILD MAINTENANCE` with the authoritative Company Money cost.

After construction:

- Company Money is deducted exactly once;
- the same physical area changes to `MAINTENANCE WING`;
- a workshop foundation becomes visible, including workbench, diagnostics, and tool-rack presentation;
- the result is redrawn without restarting the HQ scene, protecting the previously validated player-return context;
- future mechanic roles and advanced maintenance mechanics have a legitimate physical department to attach to.

## Persistence

Save format remains version 2.

HQ progression is additive and optional in Save v2:

- Core-only saves may omit explicit HQ state;
- an absent optional HQ field defaults cleanly to Core-only and is not classified as corrupted/repaired data;
- explicit canonical `Core` state is accepted normally;
- unknown or duplicate non-Core department entries are repaired safely;
- constructed Maintenance state survives Save / Continue;
- construction cannot be charged again after restoration.

Two Save compatibility defects were found by existing tests during CI and corrected in production code rather than weakening tests:

1. CI #223 initially marked an absent optional HQ field as repaired data.
2. CI #226 then revealed that explicit `Core` was incorrectly treated as a duplicate because the sanitizer pre-seeded the required Core department.

Both behaviors were corrected while preserving existing `urban-save` regression expectations.

## Canonical documentation

Created `01_GameDesign/HQ_PROGRESSION.md` as a canonical gameplay specialization subordinate to Vision, GDD, and global Progression.

The document defines:

- minimum Core HQ footprint;
- explicit constructed-department state;
- visible and non-operational locked space;
- prerequisites beyond money where future systems require them;
- physical-location construction rules;
- staff/equipment visibility gating;
- Save v2 compatibility;
- visible world evolution;
- future extension to Fleet, Operations, HR, Parcel, research, drone, and specialist departments.

`00_Project/DOCUMENT_INDEX.md` was updated to version 1.7.0 and registers the new canonical document.

## Automated verification

Focused HQ tests cover:

- Core-only initial HQ;
- Maintenance lock requirements;
- successful construction and exact Company Money deduction;
- double-charge prevention;
- Save v2 round-trip;
- old Save v2 Core-only defaulting;
- malformed/duplicate department repair.

CI #227 (`34091507397`) completed successfully on implementation head `a39ebd32a03adeca93bd5010779cb16f8f9b97c1` before this report commit.

Successful gates included:

- complete automated test suite;
- TypeScript and production Vite build;
- production server HTTP smoke test;
- PR-range whitespace validation;
- archived `Game/` runtime unchanged;
- canonical planning YAML validation;
- active planning crosswalk validation;
- Prototype v0.1 owner progression gate.

The report commit itself must also pass the same PR CI before merge.

## Known non-blocking warnings

The repository still reports the previously known npm audit findings: one moderate and one high vulnerability. This task does not declare the repository security-clean.

GitHub Actions also reports the existing Node runtime deprecation warning for `actions/checkout@v4` and `actions/setup-node@v4` while the project build itself uses Node 22.12.0.

The Vite bundle-size warning remains a separate optimization concern when emitted by the production build.

## Boundaries preserved

- Company Money remains authoritative.
- Existing fleet and employee productivity behavior is preserved.
- Existing Operations/Dispatch functionality is not hidden behind this first Maintenance slice.
- No global Company menu is restored.
- No token, blockchain, wallet, real-money construction, or multiplayer fabrication is introduced.
- The Phaser runtime remains authoritative; no React Native gameplay rewrite is introduced.
- Android owner acceptance is still required after production deployment.

## Owner validation required after deployment

The owner must verify on the installed Android app that:

1. the Maintenance area is visibly a construction zone before building;
2. the build action is locked when requirements are not met;
3. at sufficient Company Money it becomes buildable;
4. construction deducts the configured cost exactly once;
5. the physical area visibly becomes an operational workshop foundation;
6. Save / Continue preserves the constructed wing;
7. existing HQ navigation, return position, Employees, and Fleet continue to work without freeze or reset.

Issue #352 must remain open until this Android owner validation passes. Parent #343 should remain open for later progressive department slices even after #352 is accepted.
