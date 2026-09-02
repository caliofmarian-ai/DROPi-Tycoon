# DROPi Tycoon Prototype v0.1 — Release Evidence Matrix

Date: 2026-09-01
Batch: RBATCH-017
Issues: #208 / ISSUE-022, #209 / ISSUE-023
Authoritative gate: `09_Development/PROTOTYPE_RELEASE_CHECKLIST.md`

## Purpose

This document evaluates all seven release-checklist sections using the strongest evidence currently available. It does not convert automated evidence into human observation and does not declare Prototype v0.1 released.

## Evidence states

- **AUTOMATED PASS** — deterministic source/tests/build/CI evidence exists.
- **HUMAN / DEVICE / PUBLIC CHECK PENDING** — real observation outside repository CI is required.
- **FINAL OWNER SIGN-OFF PENDING** — the final completion decision required by REQ-187 is not yet recorded.

## Baseline evidence

- RBATCH-016 report: `09_Development/AI_Reports/2026-09-01_096_RBATCH_016_FULL_LOOP_INTEGRATION_VERIFICATION.md`.
- PR #265 CI `33563515533`: SUCCESS.
- Post-merge RBATCH-016 `main` CI `33563908596`: SUCCESS.
- Post-RBATCH-016 checkpoint `main` CI `33564613672`: SUCCESS.
- RBATCH-017 PR #267 CI `33566223185`: SUCCESS.
- RBATCH-017 post-merge `main` CI `33566313283`: SUCCESS.
- Full suite covers order lifecycle, HUD, MainMenu, company management, Bicycle, Save/Load, mobile viewport/touch, notifications and connected full-loop integration.

## 1. Project Stability

| Criterion | Status | Evidence |
|---|---|---|
| Deployable web runtime opens correctly | AUTOMATED PASS | Production build and local production-server HTTP smoke pass in CI. |
| No critical errors | AUTOMATED PASS for tested scope | Full tests, TypeScript/Vite build and HTTP smoke pass. |
| Game launches successfully | AUTOMATED PASS | HTTP smoke returns a non-empty production page. |
| Main scene loads correctly | AUTOMATED PASS for implemented flow | MainMenu/GameWorld contracts and tests pass. |
| No broken references | AUTOMATED PASS for compiled paths | TypeScript/Vite build and full suite pass. |

Section 1: **AUTOMATED PASS** for repository/runtime contracts; public browser observation remains separate.

## 2. Core Gameplay

| Area | Status | Evidence |
|---|---|---|
| Enter world / move / interact | AUTOMATED PASS | MainMenu, movement/input, HUD and interaction coverage. |
| Generate / accept / display order | AUTOMATED PASS | Order-system, HUD and full-loop integration tests. |
| Pickup / destination / completion | AUTOMATED PASS | Lifecycle and full-loop success path. |
| Rewards / money / upgrade cost | AUTOMATED PASS | Economy, company-management, Bicycle and integration coverage. |
| Failure / reputation consequence | AUTOMATED PASS | Wrong-destination failure integration scenario. |

Section 2: **AUTOMATED PASS**.

## 3. User Interface

| Criterion | Status | Evidence |
|---|---|---|
| Money visible | AUTOMATED PASS | HUD tests. |
| Active order visible | AUTOMATED PASS | HUD and propagation tests. |
| Buttons functional | AUTOMATED PASS | MainMenu, HUD and CompanyManagement tests. |
| Messages understandable | HUMAN CHECK PENDING | Text behavior is deterministic; comprehension is observational. |
| Interface works on mobile screens | AUTOMATED PASS for layout contracts; DEVICE CHECK PENDING | Representative viewport/touch tests pass. |

Section 3: **MIXED — functional automation passes; human clarity/device observation pending**.

## 4. Mobile Experience

| Criterion | Status | Evidence |
|---|---|---|
| Touch controls work | AUTOMATED PASS for contracts; DEVICE CHECK PENDING | Touch/input tests pass. |
| Buttons easy to press | AUTOMATED PASS for hit-area contracts; DEVICE CHECK PENDING | Touch-target tests pass. |
| Text readable | HUMAN DEVICE CHECK PENDING | Headless CI cannot certify real-phone readability. |
| Performance acceptable | PHYSICAL DEVICE / PUBLIC RUNTIME CHECK PENDING | Build/smoke is not a device benchmark. |
| Different screen sizes work | AUTOMATED PASS for representative contracts; DEVICE CHECK PENDING | Portrait/landscape viewport tests pass. |

Section 4: **MIXED — deterministic contracts pass; physical-device readability/performance pending**.

## 5. Balance

| Criterion | Status | Evidence |
|---|---|---|
| Starting resources permit play | AUTOMATED PASS | Fresh-start integration enters the delivery loop. |
| First delivery achievable | AUTOMATED PASS | Fresh-start success scenario completes delivery. |
| Rewards feel meaningful | HUMAN CHECK PENDING | Subjective. |
| First upgrade reachable | AUTOMATED PASS | Delivery → Bicycle purchase covered by integration. |
| Progress feels motivating | HUMAN CHECK PENDING | Subjective. |

Section 5: **MIXED — deterministic reachability passes; subjective balance pending**.

## 6. Quality

| Criterion | Status | Evidence |
|---|---|---|
| No gameplay-breaking bugs | AUTOMATED PASS for tested scope | Full suite/build/connected loop pass. |
| No confusing interactions | HUMAN CHECK PENDING | Requires player observation. |
| Player understands objective | HUMAN CHECK PENDING | Requires player observation. |
| First five minutes enjoyable | HUMAN CHECK PENDING | Subjective player-experience check. |

Section 6: **MIXED — automated stability passes; UX quality remains human**.

## 7. Save & Load

| Criterion | Status | Evidence |
|---|---|---|
| Save after delivery completion | AUTOMATED PASS | Autosave policy + full-loop integration. |
| Save after upgrade purchase | AUTOMATED PASS | Save-system + Bicycle/full-loop coverage. |
| Continue restores correct state | AUTOMATED PASS | Decode/restore + integration continuity. |
| Earned money/upgrades persist | AUTOMATED PASS | Serialization/restore + integration. |
| New Game with no save | AUTOMATED PASS | Missing-slot/New Game path coverage. |
| Valid save overwrite confirmation | AUTOMATED PASS | RBATCH-014 overwrite guard coverage. |
| Corrupted/unreadable save safe | AUTOMATED PASS | Corrupted/incompatible validation tests. |
| Restore failure is surfaced | AUTOMATED PASS for implemented recovery contract | MainMenu/save recovery coverage. |
| Invalid save replacement protected | AUTOMATED PASS | Invalid raw save preserved before explicit replacement. |

Section 7: **AUTOMATED PASS**.

## REQ-185..REQ-188

- **REQ-185 — PASS:** final completion authority remains `PROTOTYPE_RELEASE_CHECKLIST.md`.
- **REQ-186 — PASS:** all seven sections are explicitly evaluated above.
- **REQ-187 — FINAL OWNER SIGN-OFF PENDING:** RBATCH-017 execution approval is recorded, but final completion approval is intentionally separate.
- **REQ-188 — PASS:** implementation preparation did not pre-check release items; authoritative boxes remain unchecked pending final owner review.

## Current release verdict

**EVIDENCE PACKAGE MERGED — FINAL RELEASE SIGN-OFF NOT YET RECORDED.**

Remaining blockers to a truthful final release declaration are the human/device/public/subjective observations in the owner review package and the final explicit owner decision.


---

## Final owner progression evidence — 2026-09-02

**FINAL OWNER SIGN-OFF RECORDED — PHASE-2 PROGRESSION AUTHORIZED**

Evidence chain:
- PR #282 merged as `a9f39df2486522764df5444ce8c63036890a6e52`;
- permanent PR CI `33674562397`: SUCCESS, 361/361 tests;
- post-merge `main` CI `33674673217`: SUCCESS;
- real Android/public Railway recheck: owner confirmed the corrected build works;
- owner explicitly requested progression to game evolution.

No unobserved historical manual check is fabricated. Residual deep regression items remain technical debt rather than a Phase-2 execution blocker.
