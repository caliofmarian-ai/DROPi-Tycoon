# Document Information

Document: 2026-09-07_108_SMARTPHONE_ANDROID_PORTRAIT_CORRECTION.md
Project: DROPi Tycoon
Version: 0.1.0
Status: Implementation and CI Evidence
Author: Marian Caliof & OpenAI
Language: English
Date: 2026-09-07
Related Issues: #349, #367
Related Pull Request: #368

## Purpose

Record the autonomous post-merge QA finding and corrective implementation for the player smartphone Android portrait layout.

## Finding

PR #366 introduced the canonical first player-smartphone shell and passed its original test suite. A subsequent repository-level QA pass compared the phone layout against `SUPPORTED_ANDROID_VIEWPORTS` and found that the phone shell enforced a 500 px minimum width while supported portrait Android viewports include widths of 360 px and 412 px.

This was an objective coverage defect: the initial smartphone test validated compact landscape but did not iterate the canonical Android viewport matrix.

## Correction

Issue #367 and PR #368:

- make portrait phone width derive from the actual viewport with safe edge insets;
- use a stacked portrait flow: live apps, locked FUTURE apps, then truthful content;
- retain the compact two-pane landscape presentation;
- preserve minimum 48 px phone touch targets;
- keep the shell, Close control, future tiles and content within viewport bounds;
- extend deterministic smartphone geometry tests to every entry in `SUPPORTED_ANDROID_VIEWPORTS`;
- preserve same-scene overlay semantics, authoritative-state projection, Save v2 compatibility and physical-HQ action boundaries.

No gameplay-domain state, economy logic, Save schema, Railway configuration or React Native gameplay architecture was changed.

## CI Evidence

GitHub Actions run: #237 (`34108664904`)

Result: SUCCESS

- 58 / 58 test files passed;
- 878 / 878 tests passed;
- `player-smartphone.test.ts`: 12 / 12 passed;
- TypeScript and Vite production build passed;
- production server HTTP smoke test passed;
- PR-range whitespace validation passed;
- archived `Game/` runtime unchanged gate passed;
- canonical planning YAML validation passed;
- active planning crosswalk validation passed;
- Prototype v0.1 owner progression gate passed.

## Known Non-blocking Warnings

The repository still reports the already-known warnings:

- Vite production bundle exceeds the 500 kB warning threshold (approximately 1,387.46 kB, gzip 376.21 kB in this run);
- npm audit reports 2 vulnerabilities: 1 moderate and 1 high;
- GitHub Actions reports that actions targeting Node 20 are currently forced onto the Node 24 runner, while the project build itself uses Node 22.12.0.

These warnings were not introduced by #367 and are not represented as resolved.

## Acceptance Boundary

Automated and production-deployment evidence can verify geometry contracts, build integrity and deployment status. Installed-device visual/touch acceptance remains a separate owner gate and must not be fabricated while the owner is unavailable for Android review.
