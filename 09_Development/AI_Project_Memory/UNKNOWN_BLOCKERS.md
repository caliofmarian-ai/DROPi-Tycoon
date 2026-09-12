# DROPi Tycoon — UNKNOWN and Blocker Register

`UNKNOWN` is a first-class safe state. Missing evidence must never be converted into a fact by inference.

Observed canonical `main`: `60ffc3bf8054b283fd34d3304247b4586462eec5` on 2026-09-12. Mutable repository, CI, deployment and PR state must still be reconciled live before action.

## Third-person runtime decision

### U-ARCH-001 — Babylon Android visual and performance evidence

- Status: `DEVICE_EVIDENCE_PENDING`.
- Evidence: DRAFT PR #712 provides a strict TypeScript Babylon graybox and exact-build CI evidence, but hosted GitHub runners cannot prove real WebGL output, camera behavior or physical Android performance.
- Safe action: keep #712 DRAFT; distribute the separately packaged internal evaluation APK from the exact successful workflow head; collect Owner evidence for `PRESENCE`, `SCALE`, `CAMERA`, `MOTION`, `WORLD READABILITY`, `LIFE` and `POLISH` before the Issue #710 decision.

### U-ARCH-002 — Authoritative-state-to-3D integration boundary

- Status: `BLOCKED_BY_U-ARCH-001`.
- Evidence: the Babylon spike deliberately owns no production economy, mission, save, locality persistence or game-state authority.
- Safe action: only after a promising Android architecture-family verdict, design one compact Brăila integration slice that consumes existing domain/state contracts without duplicating authority.

### U-CANON-001 — Older Phaser/soft-isometric wording conflicts with Owner Directive 004

- Status: `CONTRADICTORY`.
- Evidence: `00_Project/THIRD_PERSON_OPEN_WORLD_VISUAL_EXPERIENCE_CANON.md` explicitly makes conflicting older soft-isometric local-play wording `STALE`, while `00_Project/PROJECT_STATUS.md`, `00_Project/ROADMAP.md`, `00_Project/DOCUMENT_INDEX.md`, `06_Technical/MOBILE_APPLICATION_PLATFORM.md`, `07_UI/VISUAL_DESIGN_SYSTEM.md`, `04_World/WORLD.md` and related documents still present Phaser or elevated soft-isometric presentation as the active baseline.
- Safe action: run a bounded canonical reconciliation after the Issue #710 architecture evidence is available. Preserve historical reports as history; update active canonical/current-state wording without rewriting authoritative domain systems.

## CI and deployment governance

### U-GOV-001 — Main branch and Railway are not yet CI-gated

- Status: `PREREQUISITE_RESOLVED_SETTING_PENDING`.
- Evidence: PR #714 merged at `60ffc3bf8054b283fd34d3304247b4586462eec5`; exact-main `validate`, `validate-mobile-shell` and `production-image-smoke` all passed. Live `main` remains unprotected, and Railway still reports `source.checkSuites:false`.
- Safe action: establish required checks `validate`, `validate-mobile-shell` and `production-image-smoke`, then enable Railway waiting for successful check suites through a separately verified settings mutation path. Do not weaken or rename checks to obtain enforcement.

### U-RAILWAY-001 — Railway configuration source is contradictory

- Status: `CONTRADICTORY`.
- Evidence: the Railway control plane labels the build as `RAILPACK`, while deployment logs show the repository `game-web/Dockerfile` and its healthcheck being used successfully. Effective restart-policy evidence is also incomplete.
- Safe action: preserve the one existing project/environment/service; normalize repository/control-plane configuration only in a bounded DT-04 mission with exact deployment evidence. Do not create another service or environment.

### U-TEST-001 — Expensive city connectivity test has intermittent local timeout

- Status: `NON_BLOCKING_FLAKE_RISK`.
- Evidence: one full local Vitest run timed out at the 5-second test limit in `tests/city-domain.test.ts`; immediate isolated replay passed 11/11, and exact-head plus exact-main GitHub CI passed the complete suite.
- Safe action: retain the assertion and track runtime separately; optimize or assign a justified timeout only if repeated controlled CI evidence proves instability. Do not remove coverage.

## Active PR and release blockers

### U-PR-001 — Historical open branches require rebuild-or-close decisions

- Status: `HOLD_RECONCILIATION`.
- Evidence: PRs #667, #674, #676, #678, #687 and #704 predate the current visual/runtime direction, fail one or more current gates, are non-mergeable, or change player-visible presentation that needs Owner acceptance. PR #685 was replayed on current main but still fails `validate` and carries pre-third-person 2D isometric candidates without an explicit local-runtime exclusion.
- Safe action: do not transplant them blindly. DT-00 must classify each as rebuild from fresh main, superseded/close, or later bounded work after the renderer decision.

### U-ASSET-001 — Asset commercial/legal clearance

- Status: `UNKNOWN` except where DT-13 evidence explicitly qualifies an asset.
- Evidence: Library presence, repository presence, an asset manifest or technical integration does not prove provenance or commercial rights.
- Safe action: preserve DT-13/DT-19 gates before third-party or generated assets enter production/release use.

### U-ASSET-002 — Pre-third-person isometric candidates

- Status: `HOLD_SCOPE`.
- Evidence: the four PR #685 WebP derivatives are 120-144 px 2D isometric/miniature images. They remain technically traceable candidates, but they do not satisfy the canonical local human-scale third-person visual family.
- Safe action: never place them in local playable runtime. Retain only as strategic-map/reference candidates if PR #685 explicitly records that boundary and later passes fresh-main memory reconciliation plus all exact-head checks.

### U-ANDROID-001 — Production Android/Google Play evidence

- Status: `BLOCKED_RELEASE_EVIDENCE`.
- Evidence: a CI-built debug-signed evaluation APK is not a production AAB, Play artifact, production signing result or physical acceptance record.
- Safe action: DT-14 and the Owner collect exact production artifact/device/Play evidence only when a release candidate exists.

### U-GOV-002 — GitHub Project board state

- Status: `UNKNOWN`.
- Evidence: the available repository connector has not exposed sufficient Projects-v2 enumeration/mutation evidence.
- Safe action: do not invent board status; use Issues, PRs, commits, checks and durable repository memory as the current operational evidence.

## Resolved in the 2026-09-12 orchestration reset

- Historical #683 memory-migration gates are resolved; PR #684 is merged and the active registry is being replaced by the live 2026-09-12 snapshot.
- DT-22 Pass 005 closed six proven duplicate/superseded PRs without merge: #686, #702, #671, #690, #688 and #689.
- PR #714 resolved the unpinned/path-filtered Mobile Shell CI prerequisite and was merged with exact-head and exact-main verification.
- PR #705 was then closed unmerged as superseded by #714.

## Rule

Every future session must update this register when an UNKNOWN/blocker is resolved, superseded or newly discovered, and must cite the resolving evidence. Historical uncertainty must not be silently deleted.
