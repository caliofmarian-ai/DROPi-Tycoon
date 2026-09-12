# DROPi Tycoon — UNKNOWN and Blocker Register

`UNKNOWN` is a first-class safe state. Missing evidence must never be converted into a fact by inference.

## Active #683 acceptance

### U-683-001 — Final corrected candidate PR/head
- Historical state: PR #684 exact head `89565d26856ccb8776750d072ae2303971550f9c` had all three CI gates `SUCCESS` and fresh-context Auditor #2 returned `FRESH-CONTEXT RECOVERY = PASS`.
- Superseding fact: Auditor #2 found that live DRAFT PR #682 / DT-01 had been omitted from `CURRENT_STATE.json` and the DT-01 handoff. DT-00 accepted this as a material backfill defect and changed PR #684 to correct it.
- Current state: the final corrected PR #684 head is `UNKNOWN` until correction writes stop and live GitHub is re-read. The containing commit cannot embed its own SHA.
- Resolution condition: freeze the corrected live PR head, obtain exact-head CI, run a new independent fresh-context audit on that same head, then perform DT-00 exact-head audit.
- Safe action: the Auditor #2 PASS proves recoverability at the superseded head but does not authorize merge of the corrected head.

### U-683-002 — Fresh-context final verdict on corrected head
- Status: `UNKNOWN`.
- Historical evidence: Auditor #2 PASS on `89565d26856ccb8776750d072ae2303971550f9c`.
- Dependency: Auditor #3 must use a genuinely fresh AI context, start from `BOOTSTRAP.md`, and audit the corrected exact head after revised CI is green.
- Safe action: merge #683 only after the corrected exact head receives `FRESH-CONTEXT RECOVERY = PASS` and DT-00 independent audit.

### U-683-003 — Open-PR omission detection
- Historical defect: the original backfill and validator could validate only PRs already persisted; they could not detect a live open PR omitted by absence. Auditor #2 exposed this through PR #682.
- Current correction: bootstrap now mandates complete live open-PR enumeration and set comparison; `validate-memory.mjs --current-open-prs <complete-live-set>` fails when the supplied live set contains a PR missing from the snapshot.
- Remaining requirement: revised exact-head CI and Auditor #3 must verify this correction.

## Active specialist blockers

### U-DT01-001 — PR #682 orchestration position
- Status: `UNKNOWN`.
- Resolved facts: PR #682 exists, is OPEN and DRAFT, is owned by DT-01 / Issue #491, is based on observed current main `f8453cbaa522a54406940d5056f5a5943627d86c`, has head `8cf6bec6ffa05e255f0282f137668fac3424f782`, and all three exact-head workflow runs are `SUCCESS`.
- Historical defect: #682 existed before the #683 snapshot but was omitted from the first backfill.
- Boundary: #682 is semantic locality-presentation work and is separate from the later Owner-priority DT-19 crop/prep/ingestion -> DT-01 visible city asset-integration sequence.
- Unknown: exact post-#683 merge/rework/order position remains `UNKNOWN` until DT-00 performs a live dependency audit.
- Safe action: HOLD; do not merge/undraft/expand #682 as part of #683.

### U-DT17-001 — #674 current-main reconciliation
- Status: `BLOCKED`.
- Evidence: #674 base predates observed canonical main; DT-22 Pass 004 records exact-head `validate` failure.
- Safe action: DT-17 may reconcile/fix/test only; no merge until current-base/exact-head green and DT-00 re-audit.

### U-DT19-001 — Library ingestion not yet executed
- Status: `BLOCKED_DEPENDENCY`.
- Evidence: #679 explicitly does not ingest binaries; #413 owns Library-to-repository ingestion.
- Safe action: after #683 and DT-00 re-audit/merge decision on #679, assign a governed #413 crop/prep/ingestion slice.

### U-DT19-002 — Visual near-duplicates
- Status: `UNKNOWN`.
- Evidence: byte hashing detects exact duplicates only.
- Safe action: require human/art review where semantic/visual near-duplicate judgement matters.

### U-DT13-001 — Asset commercial/legal clearance
- Status: `UNKNOWN` except where DT-13 evidence explicitly qualifies an asset.
- Safe action: never infer `CLEARED` from Library presence, repository presence, `APPROVED_SOURCE` or runtime integration.

### U-DT07-001 — #676 scope/dependency release
- Status: `BLOCKED`.
- Evidence: DT-22 Pass 004 preserves `HOLD_SCOPE`; #491/#492 sequencing/scope reconciliation remains unresolved.
- Safe action: no DT-07 continuation until DT-00 explicitly releases the hold.

### U-DT16-001 — Final release audit timing
- Status: `BLOCKED_DEPENDENCY`.
- Evidence: DT-16 remains `HOLD_FINAL_AUDIT`.
- Safe action: refresh only after DT-00 declares the upstream merge wave complete enough.

## Governance/evidence gaps

### U-GOV-005 — CI-gated main and Railway deployment
- Status: `BLOCKED_PREREQUISITE`.
- Evidence: live `main` is unprotected; there are no repository rulesets or required checks; Railway reports `source.checkSuites:false`; `validate-mobile-shell` is absent on exact current main because of workflow path filters and its unpinned `expo-doctor` command has produced tool-drift contradictions.
- Safe action: DT-04 first pins the validator and makes the stable Mobile Shell check run on every PR/main SHA. DT-00 audits/merges that prerequisite before any required-check or Railway wait-for-CI setting mutation.

### U-ANDROID-001 — Babylon Android device evidence without Termux/TMux
- Status: `DEVICE_EVIDENCE_PENDING`.
- Evidence: PR #712 strict build and static artifact are green, but hosted CI cannot supply trustworthy WebGL visual evidence and the previous Termux guide conflicts with the current Owner workflow.
- Safe action: keep PR #712 DRAFT; produce a separately packaged GitHub Actions evaluation APK that reuses the existing `game-mobile` shell without EAS/Railway/production signing, then collect exact-build Owner Android evidence.

### U-GOV-006 — Full operational PR registry is stale
- Status: `CONTRADICTORY`.
- Evidence: `CURRENT_STATE.json` records a historical open-PR set while live GitHub contains 16 PRs at the start of the DT-00 orchestration reset.
- Safe action: use live GitHub for every decision, complete DT-22's bounded duplicate/superseded cleanup, then update the entire registry atomically rather than partially normalizing stale entries.

### U-GOV-001 — Main branch protection decision
- Status: `UNKNOWN_OWNER_GOVERNANCE_DECISION`.
- Evidence: DT-22 observed main unprotected/required checks unenforced.
- Safe action: do not change it as part of #683.

### U-GOV-002 — #569 lifecycle contradiction
- Status: `UNKNOWN_RESOLUTION`.
- Evidence: DT-22 found closed/completed state contradicting an issue comment saying it intentionally remained open with blockers.
- Safe action: DT-00/domain owners reconcile before lifecycle normalization.

### U-GOV-003 — #562 completion evidence gap
- Status: `UNKNOWN_RESOLUTION`.
- Evidence: DT-22 found closed/completed state while unresolved P0 requirements remained in body and no completion evidence existed in thread.
- Safe action: DT-00/domain owners reconcile before lifecycle normalization.

### U-GOV-004 — GitHub Project board state
- Status: `UNKNOWN`.
- Evidence: available connector did not expose sufficient Projects-v2 enumeration/mutation during DT-22 audit.
- Safe action: do not invent Project-board existence/status.

## Rule

Every future session must update this register when an UNKNOWN/blocker is resolved, superseded or newly discovered, and must cite the resolving evidence. Historical uncertainty must not be silently deleted.
