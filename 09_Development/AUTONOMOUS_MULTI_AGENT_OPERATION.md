# Autonomous Multi-Agent Operation

Document: AUTONOMOUS_MULTI_AGENT_OPERATION.md
Project: DROPi Tycoon
Version: 1.0.0
Status: CANONICAL OPERATING POLICY
Owner authorization: Marian / caliofmarian-ai
Authorization date: 2026-09-13
Primary mission: GitHub Issue #723

---

## 1. Purpose

DROPi Tycoon is authorized to operate through an unattended multi-agent development system. The target operating mode is that the Project Owner manages product direction and reviews completed work, while `DT-00 — CENTRAL ORCHESTRATOR` and bounded specialist agents execute eligible repository work continuously, including while the Owner is offline, asleep or at work.

GitHub remains the canonical authority for code, Issues, Pull Requests, CI evidence, durable project memory and operational handoffs.

This policy supersedes older generic statements that universally required manual Owner/device acceptance for every player-visible merge or universally prohibited DT-00 governed automated merging. It does not erase domain ownership, evidence requirements or fail-closed safety rules.

---

## 2. Authorized unattended lifecycle

For an eligible Issue, DT-00 may autonomously:

1. reconcile current `main`, Issue, dependency, ownership and handoff state;
2. claim the Issue and select only the specialist lanes required by scope;
3. create isolated workspaces/branches;
4. dispatch one or more implementation agents;
5. run repository tests, CI, build and deployment checks;
6. generate visual/runtime evidence such as screenshots, video, logs or deterministic assertions where applicable;
7. dispatch an independent audit/review agent that is not the sole author of the implementation under review;
8. require rework when audit or CI fails;
9. merge the PR when the machine-readable merge gate evaluates to `PASS`;
10. verify the exact post-merge `main` and applicable deployment/runtime state;
11. open and execute a corrective Issue or revert when a regression is attributable to the merge;
12. close Issues proven complete;
13. write durable handoffs and Owner-facing reports in Romanian.

The Owner does not need to manually approve routine merges one-by-one.

---

## 3. Player-visible changes

Player-visible changes are authorized for autonomous merge when their required evidence is satisfied.

Manual Android acceptance by Marian is no longer a universal merge blocker.

For player-visible work, DT-00 must choose evidence appropriate to the affected surface. Evidence may include:

- deterministic screenshots from the authoritative runtime;
- screen recordings or walkthrough video;
- visual regression assertions;
- device/emulator build evidence;
- runtime logs and health checks;
- independent agent review against the Issue acceptance criteria and canonical UI/gameplay requirements.

A screenshot or video is evidence, not authority by itself. The independent auditor must compare the evidence against the canonical requirement and the exact implementation head.

If the required visual/runtime evidence cannot be produced or is ambiguous, the relevant gate remains `UNKNOWN` or `FAIL` and the PR must not merge.

---

## 4. Merge authority

`DT-00 — CENTRAL ORCHESTRATOR` owns autonomous merge authority.

A specialist may implement, test, review or provide evidence, but it may not lower its own required gates. A specialist implementation agent must not be the only reviewer/approver of its own work.

A PR may be merged without Owner interaction when all required gates for its risk class are `PASS` on the exact final head SHA.

Repository-native auto-merge may be used when available. Where repository settings do not expose GitHub native auto-merge, the orchestrator may perform an immediate merge after the same deterministic gate has passed. The absence of GitHub's `allow_auto_merge` setting must not be treated as a requirement for manual Owner merging.

---

## 5. Minimum merge gate

Every autonomous merge requires:

- `scope_authorized = PASS`;
- `ownership_reconciled = PASS`;
- `canonical_main_reconciled = PASS`;
- `exact_head_identified = PASS`;
- `required_tests = PASS`;
- `required_ci = PASS`;
- `independent_audit = PASS`;
- `unresolved_required_evidence = NONE`;
- `mergeability = PASS`;
- `prohibited_action_detected = FALSE`.

Additional domain gates may be required by DT ownership or canonical project documents.

For player-visible changes, `player_visible_evidence = PASS` is additionally required.

For deployment-affecting changes, the applicable build/deployment gate is additionally required.

`UNKNOWN` is never promoted to `PASS` by assumption.

---

## 6. Post-merge gate

A merge is not operationally complete until DT-00 verifies the exact new `main`.

Applicable checks include:

- exact-main CI/workflow result;
- production-image or deployment health where relevant;
- authoritative runtime smoke check;
- persistence/data compatibility where relevant;
- Android/mobile-shell build evidence where relevant;
- no newly introduced blocking regression attributable to the merge.

If the merge causes a regression, DT-00 is authorized to create/activate a corrective task, fix forward or revert using the smallest safe path. The Owner is informed in the subsequent report; routine corrective action does not require the Owner to wake up or manually approve each step.

---

## 7. Queue model

DT agents are permanent roles, not permanently running processes.

DT-00 dispatches only the agents required for currently eligible work and may execute independent lanes concurrently when their write sets and authority do not conflict.

Recommended initial runtime limits:

- maximum concurrent Issues: 3;
- maximum implementation attempts per Issue before `BLOCKED`: 3;
- maximum parallel subagents within one Issue: 3 unless DT-00 records a reason to increase it;
- exponential retry/backoff for transient platform failures;
- one authoritative claim per Issue to prevent duplicate execution.

These limits may be changed by a later evidence-backed operational decision without changing product vision.

---

## 8. Hard stops

This autonomous-development authorization does not itself authorize:

- unbounded or materially new real-money spend;
- purchases, financial transfers, paid advertising spend, real-money marketplace execution or production billing activation unless separately authorized and budgeted;
- signing contracts or legal declarations on behalf of the Owner;
- representing external lawyer, accountant, regulator, store reviewer or other authority approval that has not happened;
- publishing public/commercial claims known to be `UNKNOWN`, unverified or legally uncleared;
- irreversible destructive actions where a version-controlled/recoverable alternative exists;
- secret exfiltration or deliberate weakening of credential/security boundaries;
- silently changing game vision, company strategy or business model outside an existing Owner directive/canonical mission.

When one of these hard stops is the only remaining blocker, the Issue becomes `OWNER_OR_EXTERNAL_AUTHORITY_REQUIRED`; unrelated eligible Issues may continue.

---

## 9. Independent audit rule

The independent auditor must receive:

- the Issue and acceptance criteria;
- relevant canonical authorities;
- exact PR/head SHA;
- changed-file/diff evidence;
- test/CI evidence;
- visual/runtime evidence when required;
- known limitations and `UNKNOWN`s.

The auditor returns one of:

- `PASS`;
- `FAIL` with actionable findings;
- `UNKNOWN` when evidence is insufficient.

Only `PASS` satisfies the independent-audit merge gate.

---

## 10. Owner reporting

The Owner should not need to inspect every agent transcript.

At the end of each unattended work period or reporting window, DT-00 produces a concise report in Romanian containing:

- Issues claimed/executed;
- PRs opened;
- PRs merged;
- Issues closed;
- regressions fixed or reverted;
- failed/retried tasks;
- `BLOCKED` / `UNKNOWN` tasks and reason;
- material canonical decisions made under existing authority;
- current `main` SHA;
- deployment/runtime status where relevant;
- cost/usage telemetry when available;
- next eligible queue.

Raw hidden model chain-of-thought is never required. Evidence, decisions, conclusions, rationale sufficient for audit, and machine state are required.

---

## 11. Emergency stop

The runtime must support a repository-controlled emergency stop.

When `automation_enabled=false` in the machine-readable autonomous-agent policy, no new Issue may be dispatched or merged by the unattended runtime. In-flight work may only perform the minimum safe shutdown/persistence steps unless the policy explicitly permits completion.

The Owner or DT-00 may engage the emergency stop when there is evidence of systemic bad merges, runaway cost, credential compromise, repeated corrupted evidence or platform instability.

---

## 12. Current implementation authority

Issue #723 owns implementation of the unattended runtime, merge gate, queue protocol, recovery logic, evidence protocol, reporting and deployment setup.

Until the runtime itself is deployed and authenticated, this document authorizes the behavior but does not claim that continuous unattended execution is already running.

---

End of document.
