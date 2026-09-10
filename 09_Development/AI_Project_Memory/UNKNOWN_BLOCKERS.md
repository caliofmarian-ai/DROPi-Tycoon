# DROPi Tycoon — UNKNOWN and Blocker Register

`UNKNOWN` is a first-class safe state. Missing evidence must never be converted into a fact by inference.

## Active #683 acceptance

### U-683-001 — Final candidate PR/head
- Status: `UNKNOWN` until the implementation branch diverges and the PR is opened.
- Resolution: live-read the #683 PR and exact head after implementation commits.
- Safe action: do not claim exact-head acceptance or merge before that reconciliation.

### U-683-002 — Fresh-context final verdict
- Status: `UNKNOWN`.
- Dependency: a genuinely fresh AI context with zero prior DROPi Tycoon conversation history must start from `BOOTSTRAP.md` and execute the disaster-recovery audit.
- Safe action: merge #683 only after `FRESH-CONTEXT RECOVERY = PASS`.

## Active specialist blockers

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
