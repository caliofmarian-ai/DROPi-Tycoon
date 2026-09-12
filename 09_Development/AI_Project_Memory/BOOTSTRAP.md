# DROPi Tycoon — Persistent AI Project Memory Bootstrap

## Purpose

This is the deterministic bootstrap entry point for every fresh DT-00 or DT specialist session.

A fresh AI agent must be able to recover safe operational continuity from the repository and live GitHub without prior ChatGPT conversation history.

**Required invariant:**

`NO DURABLE HANDOFF = SESSION NOT OPERATIONALLY COMPLETE`

Raw or hidden model chain-of-thought is not project memory and must never be persisted.

## Mandatory read order

A fresh agent MUST start here and then read, in order:

1. `09_Development/AI_AGENT_EXECUTION_PROTOCOL.md`
2. `09_Development/AI_REPORTING_PROTOCOL.md`
3. `09_Development/GITHUB_WORKFLOW.md`
4. `09_Development/AI_Project_Memory/CURRENT_STATE.json`
5. `09_Development/AI_Project_Memory/HANDOFFS.json`
6. `09_Development/AI_Project_Memory/DECISIONS.md`
7. `09_Development/AI_Project_Memory/AUTHORIZED_TOOLING.md`
8. `09_Development/AI_Project_Memory/UNKNOWN_BLOCKERS.md`
9. The active GitHub Issue/PR/comments referenced by the applicable handoff.
10. Any canonical project/domain documents referenced by that mission.

Do not replace this bounded read order with repository-wide guesswork.

## Authority layers — keep separate

The following layers have different purposes and MUST NOT silently override one another:

1. **Canonical project/domain authority** — existing approved project, game, technical, economy, asset, legal and release documents.
2. **Historical AI reports** — `09_Development/AI_Reports/`. These preserve significant task history and evidence; they are not automatically current operational truth.
3. **Operational project memory** — `CURRENT_STATE.json`. This is a current snapshot plus reconciliation instructions, not domain authority.
4. **Agent/session handoffs** — `HANDOFFS.json`. These preserve lane ownership, mission, status, evidence, blockers and next safe action.
5. **Durable decision records** — `DECISIONS.md`. These preserve materially important orchestration/Owner decisions and rejected assumptions.
6. **UNKNOWN/blocker register** — `UNKNOWN_BLOCKERS.md`. Missing or unresolved evidence remains explicit.

If two layers conflict, do not silently choose the convenient one. Apply the authority and reconciliation rules below.

## Live GitHub reconciliation — mandatory before action

Mutable GitHub facts MUST be re-read live before implementation, READY claims, audit, merge or lifecycle mutation:

- canonical `main` SHA;
- the **complete repository-wide set of currently open pull requests**;
- Issue state/body/comments;
- PR state, base, head, draft and mergeability;
- exact-head checks/CI;
- branch existence/head;
- merge state.

`CURRENT_STATE.json` and `HANDOFFS.json` record the last durable observation. They are expected to become stale as GitHub moves.

**Live GitHub wins for mutable GitHub state.**

### Complete live open-PR inventory gate

Before any orchestration, READY, audit, merge or lifecycle decision, enumerate every live open PR in `caliofmarian-ai/DROPi-Tycoon` — not only PRs already referenced by a handoff.

Compare the live set of PR numbers with `CURRENT_STATE.json.activePullRequests` as unordered sets.

- A live open PR absent from the snapshot is a **material memory omission**. Classify it `CONTRADICTORY`, inspect its live PR/Issue evidence, preserve unresolved ownership/order as `UNKNOWN`, update the operational memory, and do not make an unsafe merge/orchestration decision until reconciled.
- A persisted PR no longer present in the live open set is `STALE`; reconcile its live merged/closed state before action.
- If the live PR's owner or dependency is not provable, do not infer it. Record `UNKNOWN` and use the fail-closed safe action.

This gate prevents omission-by-absence: a PR cannot disappear from operational awareness merely because an earlier snapshot or handoff did not mention it.

For each material persisted value, classify it as:

- `CURRENT`
- `STALE`
- `CONTRADICTORY`
- `UNKNOWN`

A stale snapshot is not permission to improvise. Reconcile it and update the durable handoff before the significant session becomes operationally complete.

### Self-SHA rule

A commit cannot contain its own Git SHA. Therefore an operational-memory commit may only persist the last observed branch/main SHA and mark live reconciliation required. A fresh agent must query live GitHub for the containing/current commit SHA. This is not a missing-history exception.

## Fresh-session recovery procedure

1. Read this file and the mandatory files above.
2. Enumerate the complete live repository open-PR set and compare it with `CURRENT_STATE.json.activePullRequests`.
3. Reconcile every missing-live or stale-persisted PR before making orchestration/merge decisions.
4. Identify the requested DT lane from `HANDOFFS.json`.
5. Re-read live `main`.
6. Re-read every active Issue/PR/branch referenced by that lane.
7. Re-read exact-head CI when the lane can affect a merge or READY decision.
8. Compare durable snapshot to live GitHub and classify CURRENT/STALE/CONTRADICTORY/UNKNOWN.
9. Read only the canonical/domain authorities needed for the mission.
10. Continue from `nextSafeAction` only if it is still compatible with live state and ownership boundaries.
11. If a contradiction could cause unsafe work or merge, stop that action and escalate through DT-00.
12. Before significant session close/pause/supersede/READY/HOLD/handoff, update durable operational memory and create/update the historical report required by `AI_REPORTING_PROTOCOL.md`.

## Significant-session durable handoff requirement

Before a significant DT session is considered closed, paused, superseded, READY, HOLD or handed off, repository-backed state must preserve at least:

- agent identity;
- ownership boundary;
- mission;
- observed canonical main SHA plus live-reconciliation requirement;
- issue/PR/branch/head SHA where applicable;
- exact status;
- material findings;
- evidence;
- Owner decisions/directives;
- materially important rejected assumptions;
- unresolved UNKNOWNs;
- blockers/dependencies;
- exact-head CI state where relevant;
- actions currently forbidden;
- next safe action;
- canonical/report references.

If a fact is unavailable, write `UNKNOWN`. Do not infer it from old conversations.

## Historical report relationship

`09_Development/AI_Reports/` remains the historical audit trail required by `AI_REPORTING_PROTOCOL.md`.

Do not copy historical reports wholesale into operational memory.

Operational memory should reference the report/Issue/PR that supports a material fact and preserve only the minimum current state needed to resume safely.

## Validation

Run structural validation:

```bash
node 09_Development/AI_Project_Memory/validate-memory.mjs
```

Optional live-main staleness check:

```bash
node 09_Development/AI_Project_Memory/validate-memory.mjs --current-main <40-char-live-main-sha>
```

For a recovery/audit/orchestration gate, supply the complete live open-PR set obtained from GitHub:

```bash
node 09_Development/AI_Project_Memory/validate-memory.mjs --current-open-prs <comma-separated-live-open-pr-numbers>
```

Example syntax only: `--current-open-prs 684,682,679`. The actual list must come from live GitHub and must be complete; list order is irrelevant.

The validator does not query GitHub itself. It checks the live observations supplied by the caller and does not replace DT-00 live-state audit.

## Mutation boundary

This memory system records operational knowledge. It does not authorize:

- gameplay changes;
- economy changes;
- monetization changes;
- legal-policy expansion;
- domain-authority rewrites;
- unrelated refactors;
- CI workflow changes outside DT-04 ownership.

## Owner operating surface

Normal work is GitHub-first: branch, Pull Request, exact-head CI, DT-00 audit, controlled merge and post-merge verification. Do not require Marian to use a PC or Termux/TMux for routine development, previews or testing.

Use Termux/TMux-assisted commands only when Marian explicitly requests repository synchronization/copying to a phone, computer or server, or separately approves another exceptional operation. If such a command is required, provide one complete copy-paste block with all paths and no interactive editor.

Connected Figma, Canva, Runway and Higgsfield capabilities may be used under `AUTHORIZED_TOOLING.md`. They remain auxiliary work surfaces; GitHub remains the single source of truth and all implementation code stays repository-backed.

## Owner-facing language

Owner-facing operational reports for Marian are written in Romanian. Repository technical identifiers, exact file/branch names, SHAs, code, commands and canonical machine-status tokens may remain in English.

## Canonical bootstrap rule

A future agent must not require prior ChatGPT conversation memory to determine the project's current safe operating state.

If material continuation still requires an old conversation, the persistent-memory protocol has failed and the gap must be repaired in the repository.
