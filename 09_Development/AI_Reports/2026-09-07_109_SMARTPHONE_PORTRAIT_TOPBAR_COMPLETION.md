# Document Information

Document: 2026-09-07_109_SMARTPHONE_PORTRAIT_TOPBAR_COMPLETION.md
Project: DROPi Tycoon
Version: 0.1.0
Status: Implementation and CI Evidence
Author: Marian Caliof & OpenAI
Language: English
Date: 2026-09-07
Related Issues: #349, #367
Related Pull Request: #369

## Purpose

Record the completion of the remaining portrait top-HUD separation acceptance item discovered during continued autonomous QA of the player smartphone.

## Finding

PR #368 corrected the smartphone overlay shell itself across the complete canonical Android viewport matrix. Continued acceptance review then identified that portrait `Phone` and `Menu` controls still used the center of the 72 px portrait header (`y=36`) while the status row begins at `y=44`.

Because the permanent compact HUD control contract uses a 44 px local Rectangle hit area, the top-control row extended through y=58 and therefore shared vertical space with the status row. The issue was reopened rather than falsely declared complete.

## Correction

PR #369:

- defines deterministic `topControlY` and `statusY` geometry in `urbanHUDLayout`;
- places the portrait top-control hit row in y=0..44;
- retains the portrait status row beginning at y=44 inside the 72 px header;
- uses the same `topControlY` for both Phone and Menu triggers;
- preserves existing landscape top-bar geometry;
- verifies all supported portrait Android viewports;
- verifies Phone/Menu horizontal separation;
- leaves phone state, Save v2, economy, scene lifecycle and physical-HQ boundaries unchanged.

## CI Evidence

GitHub Actions run: #240 (`34109466103`)

Result: SUCCESS

- 58 / 58 test files passed;
- 881 / 881 tests passed;
- `player-smartphone.test.ts`: 12 / 12 passed;
- `top-navbar-owner-review.test.ts`: 14 / 14 passed;
- TypeScript and Vite production build passed;
- production server HTTP smoke test passed;
- PR-range whitespace validation passed;
- archived `Game/` runtime unchanged gate passed;
- canonical planning YAML validation passed;
- active planning crosswalk validation passed;
- Prototype v0.1 owner progression gate passed.

## Known Non-blocking Warnings

Existing repository warnings remain unresolved and were not introduced by this correction:

- Vite bundle exceeds the 500 kB warning threshold (approximately 1,387.55 kB, gzip 376.24 kB in this run);
- npm audit reports 2 vulnerabilities: 1 moderate and 1 high;
- GitHub Actions reports Node 20 action deprecation while those actions are forced onto the Node 24 runner; project build Node remains 22.12.0.

## Acceptance Boundary

This report verifies deterministic geometry, automated behavior and build integrity. It does not replace installed Android visual/touch review. Parent #349 remains the owner-facing acceptance gate while the owner is unavailable for device review.
