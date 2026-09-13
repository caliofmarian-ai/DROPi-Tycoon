# DT-00 Autonomous Runtime Pilot

Document: `DT00_RUNTIME_PILOT.md`
Project: DROPi Tycoon
Authority: GitHub Issue #723
Status: `BOOTSTRAP — NOT ACTIVE UNTIL MERGED, AUTHENTICATED AND INDEPENDENTLY AUDITED`

## Purpose

This is the smallest bounded runtime slice for the Owner-authorized unattended DT-00 operating model.

GitHub remains the canonical authority for code, Issues, Pull Requests, CI evidence, durable handoffs and merge state. OpenAI provides the coding/review agent runtime; it does not replace GitHub authority.

The Project Owner's phone, Termux session or personal computer is not part of the runtime path.

## Runtime choice

The pilot uses GitHub-hosted Actions runners and the official `openai/codex-action@v1` integration.

Reasons for the pilot choice:

- the agent receives an isolated ephemeral checkout;
- the OpenAI API credential is injected only as a GitHub Actions secret;
- the implementation agent can be limited to a workspace permission profile;
- the independent auditor can run read-only;
- structured output schemas provide machine-consumable `READY` / `BLOCKED` / `FAIL` and `PASS` / `FAIL` / `UNKNOWN` results;
- GitHub remains the queue, evidence and merge authority.

The OpenAI Developers ChatGPT plugin is useful for developer-account integration and current documentation access, but the unattended runtime does not depend on a ChatGPT conversation remaining open.

## Initial pilot bounds

The canonical policy currently permits up to three concurrent Issues. This pilot intentionally starts at one concurrent Issue because Issue #723 requires bounded pilot validation before scaling.

The scheduled queue initially contains only Issue #723.

Issue #730 (Sentry observability) remains dependent on an authenticated working runtime and is not selected by the initial scheduler.

## Control-plane separation

The implementation agent is permitted to write only under:

`09_Development/AutonomousAgents/runtime/**`

It is not permitted to modify its own:

- GitHub Actions control-plane;
- autonomous policy;
- deterministic merge evaluator;
- pilot queue/configuration;
- result schemas;
- audit workflow.

A control-plane change requires a separate governed change and independent audit.

## Authentication

The runtime requires the repository secret:

`OPENAI_API_KEY`

The raw key must never be committed, printed, copied into an Issue/PR, persisted in an artifact, or exposed to the implementation prompt.

If the secret is absent, authentication state is `UNKNOWN` and autonomous implementation/merge must stop fail-closed.

## Agent separation

The implementation invocation and audit invocation are separate Codex executions.

Implementation:

- permission profile: `:workspace`;
- no GitHub credential is exposed to the model;
- repository credential persistence is disabled during checkout;
- model writes are constrained by a deterministic changed-path gate after the run.

Independent audit:

- separate job and invocation;
- permission profile: `:read-only`;
- exact PR head SHA supplied to the auditor;
- final result constrained by `audit-result.schema.json`;
- only `PASS` satisfies the canonical audit gate.

## Pilot execution lifecycle

1. Read canonical policy and pilot configuration from the checked-out `main`.
2. Confirm `automation_enabled=true`.
3. Confirm `OPENAI_API_KEY` exists without printing it.
4. Select a queued open Issue carrying the `automation` label.
5. Reject duplicate execution when an open `dt00/auto-<issue>-*` PR already exists.
6. Enforce the canonical attempt limit through durable Issue markers.
7. Run one bounded implementation agent.
8. Validate structured output.
9. Reject any write outside the implementation-agent writable path.
10. Commit and push through a deterministic post-agent GitHub step; the model never receives the GitHub token.
11. Open a PR.
12. Wait for repository checks, including independent exact-head audit.
13. Build merge evidence and evaluate it with `evaluate-merge-gate.mjs`.
14. Merge only on `PASS`.
15. Verify exact post-merge `main` and governance tests.
16. Persist a Romanian Issue report and reset the retry counter only after successful post-merge verification.

## Retry behavior

Attempts are persisted in GitHub Issue comments using machine markers. A successful post-merge verification resets the attempt sequence. The runtime must stop dispatching the same Issue after the canonical maximum implementation attempts is reached and report it as `BLOCKED` until a governed intervention changes the state.

## Player-visible and deployment work

The initial pilot does not authorize the implementation agent to modify player-visible game/runtime files. Therefore player-visible evidence and deployment gates are `NOT_APPLICABLE` for this bootstrap slice.

Scaling the queue to DT domain Issues must add the corresponding risk-specific evidence paths before those Issues become eligible for autonomous merge.

## Bootstrap state

Repository policy already authorizes unattended operation, but authorization is not proof that the runtime is deployed.

This pilot must not be reported as `ACTIVE` until all of the following are true:

- this control-plane change is merged;
- `OPENAI_API_KEY` exists in repository secret storage;
- the independent audit check passes on the exact bootstrap head;
- one bounded pilot run completes through post-merge verification, or produces an evidence-backed fail-closed result.

Until then the truthful state is:

`BOOTSTRAP / AUTHENTICATION OR PILOT EVIDENCE PENDING`
