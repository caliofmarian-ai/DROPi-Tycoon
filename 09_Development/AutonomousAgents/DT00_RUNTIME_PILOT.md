# DT-00 Autonomous Runtime Pilot

Document: `DT00_RUNTIME_PILOT.md`
Project: DROPi Tycoon
Authority: GitHub Issue #723
Status: `HOLD — COST OPTIMIZATION / ZERO NEW METERED CALLS`

## Purpose

This is the smallest bounded runtime slice for the Owner-authorized unattended DT-00 operating model.

GitHub remains the canonical authority for code, Issues, Pull Requests, CI evidence, durable handoffs and merge state. OpenAI provides the coding/review agent runtime; it does not replace GitHub authority.

The Project Owner's phone, Termux session or personal computer is not part of the runtime path.

## Current Owner HOLD

The Project Owner placed the autonomous OpenAI runtime on HOLD after unexpected API spend during bootstrap validation.

While `runtime-pilot.json.costHold=true`:

- no implementation Codex call is authorized;
- no independent Codex audit call is authorized;
- scheduled runs may perform only non-metered deterministic checks and must exit before OpenAI invocation;
- PR #736 remains unmerged;
- existing code/evidence is preserved;
- HOLD release requires a governed change and a configured hard spend limit outside this repository.

This repository must not invent a monthly dollar budget. `monthlyBudgetUsd` remains `null` until the Owner sets one.

## Runtime choice

The pilot uses GitHub-hosted Actions runners and the official `openai/codex-action@v1` integration.

The optimized runtime uses:

- implementation model: `gpt-5.6-luna`;
- implementation effort: `low`;
- independent audit model: `gpt-5.6-luna`;
- independent audit effort: `low`;
- implementation permission profile: `:workspace`;
- audit permission profile: `:read-only`;
- default `codex-action` privilege reduction (`drop-sudo`);
- structured output schemas for machine-readable decisions.

The lower-cost model choice is a pilot operating constraint, not a claim that every future DT task can use the same model. A more expensive model requires an explicit governed cost/capability decision.

## Cost-control invariants

The pilot is fail-closed around API spend.

1. `costHold=true` means zero new OpenAI calls.
2. The scheduler checks at most four times per day (`17 */6 * * *`) after HOLD is released.
3. At most one implementation attempt may start for the pilot Issue in any rolling 24-hour window.
4. One orchestrator run can contain at most two OpenAI calls: one implementation and one independent audit.
5. An exact PR head can receive at most one independent AI audit. A failed audit requires a changed head before another audit call.
6. Pull-request updates never trigger the AI auditor automatically.
7. Deterministic local evidence runs before the independent AI audit. If deterministic validation fails, the AI audit is not called.
8. AI audit is blocked before spend if the candidate exceeds 20 changed files or 250,000 diff bytes.
9. Audit output artifacts are retained for seven days rather than thirty.
10. Post-merge verification is deterministic and must not trigger another AI audit.

These are pilot ceilings. Scaling requires a governed update rather than silent relaxation.

## Initial pilot bounds

The canonical policy permits up to three concurrent Issues. This pilot remains intentionally limited to one concurrent Issue because Issue #723 requires bounded pilot validation before scaling.

The queue initially contains only Issue #723. Issue #730 (Sentry observability) remains outside the initial queue.

## Control-plane separation

The implementation agent may write only under:

`09_Development/AutonomousAgents/runtime/**`

It may not modify:

- GitHub Actions control-plane;
- autonomous policy;
- deterministic merge evaluator;
- pilot queue/configuration;
- result schemas;
- audit workflow;
- game/runtime product surfaces.

Changed paths are checked deterministically after the implementation call and again on the PR before audit/merge.

## Authentication

The runtime requires the repository secret:

`OPENAI_API_KEY`

The raw key must never be committed, printed, copied into an Issue/PR, persisted in an artifact or exposed to an agent prompt.

Missing authentication remains `UNKNOWN` and blocks execution.

## Agent separation

Implementation and audit are distinct Codex executions.

Implementation:

- `gpt-5.6-luna`, `low` effort;
- `:workspace` permission profile;
- no GitHub token in the agent prompt;
- outer deterministic controller owns commit/push/PR actions;
- output constrained by `implementation-result.schema.json`.

Independent audit:

- separate workflow-dispatch invocation;
- `gpt-5.6-luna`, `low` effort;
- `:read-only` permission profile;
- exact PR head and base SHAs supplied explicitly;
- broad repository scanning prohibited by prompt;
- only one audit call per exact head;
- output constrained by `audit-result.schema.json`;
- only `PASS` satisfies the canonical audit gate.

## Optimized execution lifecycle

1. Checkout canonical `main` and run deterministic governance tests.
2. Read policy and `runtime-pilot.json`.
3. If `costHold=true`, exit before any OpenAI call.
4. Require an open queued Issue with the `automation` label.
5. Enforce the rolling 24-hour implementation-attempt ceiling.
6. Confirm `OPENAI_API_KEY` without exposing it.
7. Run one bounded low-cost implementation call.
8. Validate structured result and reject all writes outside `runtime/**`.
9. Outer controller creates branch and PR.
10. Run deterministic exact-head pre-audit checks before spending on audit.
11. Reuse an existing exact-head audit result if one already exists; never audit the same head twice.
12. If no result exists, explicitly dispatch exactly one independent AI audit.
13. On audit failure, close for rework; a changed head is required before another audit call.
14. On `PASS`, run the deterministic merge evaluator and merge only the exact audited head.
15. Verify exact post-merge `main` deterministically without another AI call.
16. Persist a Romanian owner report and stop pilot dispatch after the first verified pilot `PASS`.

## Why this reduces spend

The previous bootstrap path could invoke a high-effort default Codex model repeatedly while workflow issues were being corrected. The optimized path moves all cheap deterministic checks ahead of model invocation, removes automatic PR-triggered AI audits, prevents repeat audits of an unchanged head, reduces model/effort, lowers schedule frequency and limits implementation retries.

The runtime remains intentionally inactive while the Owner HOLD is in force.

## Bootstrap state

Truthful current state:

`HOLD — COST OPTIMIZATION / NOT ACTIVE`

HOLD can be released only after:

- a hard spend limit is configured in OpenAI Platform;
- the Owner explicitly authorizes resume;
- `costHold` is changed to `false` through a governed repository change;
- Issue #723 is made eligible again with the `automation` label;
- the optimized bootstrap receives exact-head deterministic validation and independent audit evidence.
