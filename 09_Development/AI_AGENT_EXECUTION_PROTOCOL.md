# Document Information

Document: AI_AGENT_EXECUTION_PROTOCOL.md
Project: DROPi Tycoon
Version: 1.5.0
Status: AI Development Operations
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-13

---

# AI Agent Execution Protocol

## Purpose

This document defines how AI development agents operate during the creation of DROPi Tycoon.

The goal is to create a controlled workflow where AI agents collaborate while maintaining project consistency and may execute eligible work unattended under the autonomous operating policy.

The autonomous execution authority is defined by:

`09_Development/AUTONOMOUS_MULTI_AGENT_OPERATION.md`

and its machine-readable gate contract:

`09_Development/AI_Project_Memory/AUTONOMOUS_AGENT_POLICY.json`

---

# Operating Principle

AI agents are production assistants operating under repository-backed authority and Project Owner direction.

The human role remains:

- Vision owner
- Final authority for strategic product decisions and exceptional hard stops
- Recipient/reviewer of autonomous execution reports

Routine authorized implementation, testing, independent audit, merge, corrective action and Issue closure do not require the Project Owner to manually operate every step.

---

# Agent Execution Order

Agents must operate in the following sequence when those roles are applicable to the task:

```
Architecture Agent

↓

Game Design Agent

↓

Implementation Agent

↓

Testing / Independent Audit Agent

↓

Documentation Agent

↓

DT-00 Merge / Post-Merge Verification
```

DT-00 may run independent non-conflicting lanes concurrently when ownership and write sets are reconciled.

---

# 1. Architecture Agent

## Mission

Protect the project structure.

## Responsibilities

- Verify consistency between documents
- Check dependencies
- Prevent unnecessary complexity
- Confirm implementation direction

## Output

Architecture approval or correction request.

---

# 2. Game Design Agent

## Mission

Transform concepts into playable mechanics.

## Responsibilities

- Define gameplay rules
- Review player experience
- Validate progression
- Maintain MVP focus

## Output

Gameplay specifications.

---

# 3. Implementation Agent

## Mission

Convert approved specifications into the current approved runtime and application architecture.

## Responsibilities

- Inspect the current canonical platform/runtime documents before choosing tools or targets
- Create or modify scenes and application surfaces
- Configure game/runtime objects
- Build game logic through the authoritative game runtime
- Connect systems without duplicating canonical domain rules in platform shells

## Output

Working game components in the currently approved architecture.

Historical GDevelop, Web-First, or other superseded implementation reports must not be treated as current platform authority.

---

# 4. Testing / Independent Audit Agent

## Mission

Verify functionality, player experience, acceptance criteria and merge evidence independently from the implementation author where required.

## Responsibilities

- Test features
- Identify problems
- Verify requirements
- Inspect the exact implementation head
- Inspect required CI and runtime/visual evidence
- Return `PASS`, `FAIL`, or `UNKNOWN`
- Require rework when evidence or implementation is insufficient

## Output

Testing/audit report and machine-consumable gate result.

An implementing agent must not be the sole independent auditor of its own merge.

---

# 5. Documentation Agent

## Mission

Maintain project knowledge.

## Responsibilities

- Update MD files
- Record changes
- Maintain version history

## Output

Updated documentation.

---

# Agent Communication Rules

Agents must communicate through:

- Documentation
- Defined outputs
- Clear decisions
- GitHub Issues / PRs / checks / durable handoffs

Avoid:

- Hidden assumptions
- Unrecorded changes
- Conflicting implementations
- promoting `UNKNOWN` to fact without evidence

---

# DT-00 Orchestration Authority

`DT-00 — CENTRAL ORCHESTRATOR` owns live-state reconciliation, dependency/merge ordering, cross-lane collision control, independent exact-head audit, merge execution, post-merge verification and unattended queue operation.

DT-00 may:

- implement integration or cross-lane work directly when that is the smallest safe path;
- assign a concrete bounded task to the specialist that owns the domain;
- keep unrelated specialists in `HOLD` rather than creating parallel work without a current dependency need;
- close proven duplicate or superseded PRs with an evidence-backed explanation;
- claim eligible Issues and dispatch specialists while the Project Owner is offline;
- require rework after failed CI/audit/evidence;
- merge routine and player-visible work already authorized by existing canon/Owner direction after the applicable exact-head gates pass;
- close Issues proven complete;
- fix forward or revert regressions attributable to an autonomous merge;
- report completed/failed/blocked work to the Project Owner after execution.

Specialists must not unilaterally lower gates or treat their own READY statement as sufficient merge authority. Automated merge is authorized only through the DT-00 governed merge gate. A specialist may participate in a runtime that lands its work after an independent audit and required gates pass.

Player-visible runtime changes do not universally require manual Android/device acceptance by Marian before merge. They require the applicable player-visible evidence defined by `09_Development/AUTONOMOUS_MULTI_AGENT_OPERATION.md` and an independent audit on the exact final head.

Where GitHub native auto-merge is unavailable or disabled, DT-00 may execute the merge immediately after the same deterministic gate passes.

After any merge, DT-00 must verify the new exact `main`, applicable exact-main workflows and deployment/runtime evidence. A regression attributable to that merge must be corrected or reverted before the task is reported as operationally complete, unless the corrective task is explicitly persisted as `BLOCKED` with evidence.

Routine work is GitHub-first. Do not require Marian to operate a PC or Termux/TMux. Those commands are reserved for explicit repository synchronization/copying or another separately approved exceptional operation.

External Figma, Canva, Runway and Higgsfield tooling is governed by `09_Development/AI_Project_Memory/AUTHORIZED_TOOLING.md`; it does not expand domain ownership or create parallel code/project authority.

---

# Autonomous Unattended Operation

When `automation_enabled=true` in `09_Development/AI_Project_Memory/AUTONOMOUS_AGENT_POLICY.json`, DT-00 may operate the eligible queue unattended.

The unattended lifecycle is:

`ELIGIBLE -> CLAIMED -> RUNNING -> AUDIT -> MERGE_READY -> MERGED -> POST_MERGE_VERIFY -> DONE`

Failure paths include:

`REWORK`, `BLOCKED`, and `OWNER_OR_EXTERNAL_AUTHORITY_REQUIRED`.

The runtime must not create duplicate execution for the same claimed Issue.

The runtime must respect concurrency, retry, audit and emergency-stop controls from the machine-readable policy.

---

# Persistent AI Reporting Requirement

For significant AI tasks, agents must follow:

`09_Development/AI_REPORTING_PROTOCOL.md`

A significant task is not operationally complete until the required persistent report is created or updated according to that protocol.

Autonomous execution additionally requires an Owner-facing summary in Romanian covering executed/merged/closed/failed/blocked work for the reporting window.

---

# Persistent AI Project Memory and Handoff Requirement

Every DT-00 and DT specialist session must begin at the deterministic repository bootstrap:

`09_Development/AI_Project_Memory/BOOTSTRAP.md`

A session must not depend on prior ChatGPT conversation memory to reconstruct current operational state.

For every significant session:

`NO DURABLE HANDOFF = SESSION NOT OPERATIONALLY COMPLETE`

Before a significant session is considered closed, paused, superseded, READY, HOLD, merged, DONE, BLOCKED or handed off, the repository-backed handoff must preserve at least:

- agent identity;
- ownership boundary;
- mission;
- observed canonical `main` SHA plus a live-reconciliation requirement;
- Issue/PR/branch/head SHA where applicable;
- exact status;
- material findings and evidence;
- Owner decisions/directives;
- materially important rejected assumptions;
- unresolved `UNKNOWN`s;
- blockers/dependencies;
- exact-head CI state where relevant;
- currently forbidden actions/hard stops;
- next safe action;
- canonical/report references.

Missing evidence remains `UNKNOWN` and must not be reconstructed from assumption.

The persistent-memory layers are intentionally separate:

1. canonical project/domain authority;
2. historical `09_Development/AI_Reports/`;
3. operational project memory;
4. agent/session handoffs;
5. durable decision records;
6. the `UNKNOWN`/blocker register.

Current operational files live under:

`09_Development/AI_Project_Memory/`

Live GitHub remains authoritative for mutable GitHub state. Before implementation, READY, audit, merge, lifecycle mutation or Issue closure, agents must re-read current `main`, Issue/PR state, branch/head, mergeability, and exact-head CI as applicable. Persisted state must be reconciled as `CURRENT`, `STALE`, `CONTRADICTORY`, or `UNKNOWN`.

Raw or hidden model chain-of-thought is out of scope. Persist useful engineering conclusions, evidence, decisions, appropriate rationale, constraints, rejected assumptions, ownership, blockers, `UNKNOWN`s, status, and next safe action only.

DT ownership and orchestration assigned by DT-00 take precedence over generic execution-role wording when the repository contains a current DT handoff. No agent may silently take another DT lane's authority.

Unilateral specialist self-merge remains forbidden. DT-00 governed automated merge is authorized when `AUTONOMOUS_AGENT_POLICY.json` is enabled and all required exact-head gates are `PASS`.

The memory validator may be run with:

```bash
node 09_Development/AI_Project_Memory/validate-memory.mjs
```

The validator supplements, but does not replace, live GitHub reconciliation and DT-00 exact-head audit.

Owner-facing material operational reports for Marian are written in Romanian. Exact technical identifiers, paths, SHAs, code, commands, and machine-status tokens may remain in English.

---

# Task Execution Format

Every task should contain:

```
Task Name

Objective

Required Input

Expected Output

Validation Method
```

For autonomous execution, the Issue should also expose enough acceptance criteria to determine a finite gate outcome without interactive supervision.

---

# Change Approval Rules

Routine implementation and evolution already covered by existing Project Owner directives, Issues and canonical architecture are authorized for autonomous execution and merge.

Separate Project Owner authority is required before an agent may intentionally:

- change the game vision itself;
- create a materially new business model not covered by an Owner directive;
- incur materially new/unbounded real-money spend;
- execute a legal/commercial commitment requiring external authority;
- perform an irreversible destructive operation when a recoverable alternative exists.

Adding or modifying implementation architecture is not automatically a hard stop when it is the smallest safe implementation of an already-authorized objective, but the change must be recorded, independently audited and remain consistent with canonical architecture authority.

---

# Owner Directives Inspection Rule

Before proposing or implementing any major change to architecture, universe design, business model, logistics, economy, marketplace, runtime, or documentation structure, AI agents **must** inspect:

`09_Development/Owner_Directives/`

**Rules:**

1. If a relevant Owner Directive exists, its contents must be acknowledged and considered before any proposal proceeds.
2. An Owner Directive must never be silently ignored.
3. An Owner Directive must never be copied wholesale into canonical documents. Integration requires a dedicated canonical integration task.
4. If a directive conflicts with existing canonical documents, the conflict must be surfaced and reported — never silently merged or overwritten.

Owner Directives are authoritative strategic inputs from the Project Owner. They are not automatically canonical documentation. See `09_Development/Owner_Directives/README.md` for the complete governance rules.

---

# Mobile Platform Canon Inspection Rule

Before proposing or implementing any major platform, runtime, Android packaging, Expo/native-shell, deployment, camera, viewport, persistence-adapter, or distribution change, AI agents **must** read and reconcile:

1. `00_Project/VISION.md`;
2. `06_Technical/ARCHITECTURE.md`;
3. `06_Technical/MOBILE_APPLICATION_PLATFORM.md`;
4. `06_Technical/SAVE_SYSTEM.md` when persistence is affected;
5. `00_Project/PROJECT_STATUS.md` and the active GitHub issue/PR.

Current platform authority explicitly supersedes older historical Web-First or GDevelop implementation reports where they conflict.

Agents must not assume that:

- Chrome/Railway is the primary final gameplay surface;
- the browser is still the Project Owner acceptance target;
- adding an Expo/React Native shell means rewriting Phaser gameplay in React Native;
- fixed browser dimensions or one hardcoded camera zoom are acceptable for all Android devices;
- a native-shell migration authorizes changes to gameplay, economy, employees, reviews, or other domain rules;
- Vehicle Fleet PR #288 should resume before the Android application/camera foundation receives Project Owner acceptance where that old dependency has not been superseded by newer canonical evidence.

If the required canonical platform documents disagree, the agent must surface the contradiction before implementation rather than choosing one silently.

For autonomous player-visible work, the independent-audit and visual/runtime evidence rules in `AUTONOMOUS_MULTI_AGENT_OPERATION.md` determine whether the work may merge without manual device acceptance.

---

# Error Handling

If an agent detects missing information, conflicting documents or unclear requirements, it must first exhaust deterministic repository bootstrap, current handoffs, relevant Owner Directives, live GitHub evidence and canonical authority.

If the ambiguity can be resolved by existing authority/evidence, the agent proceeds and records the rationale.

If the ambiguity affects a required merge gate and cannot be resolved, the gate remains `UNKNOWN`; the task becomes `BLOCKED` or `OWNER_OR_EXTERNAL_AUTHORITY_REQUIRED` as appropriate. Unrelated eligible work continues.

For missing project-continuity context covered by Issue #683, the agent must not require the Project Owner to manually reconstruct context that the persistent-memory protocol is required to preserve.

---

# Version Control

Each important AI-generated change should have:

- Version number or traceable Git commit
- Description
- Test result
- Issue/PR evidence where applicable

---

# MVP Protection

Agents must prioritize:

- Core gameplay
- Stability
- Simplicity
- Evidence-backed autonomous progress

Agents must avoid:

- Feature inflation
- Premature optimization
- Unnecessary complexity
- creating work merely to keep agents busy

---

# Final Objective

The AI agent system should transform:

Vision

↓

Canonical Issues / Objectives

↓

Autonomous Orchestration

↓

Design / Implementation

↓

Testing / Independent Audit

↓

Governed Merge / Post-Merge Verification

↓

Playable Prototype + Owner Report

---

# Canonical Rule

AI agents build according to the vision and current canonical architecture.

They do not create a different game and they do not revive superseded platform assumptions without Project Owner authority.

For operational continuity, they consume and maintain the repository-backed Persistent AI Project Memory defined by `09_Development/AI_Project_Memory/BOOTSTRAP.md`; this operational layer does not replace canonical domain authority.

The unattended runtime is governed by `09_Development/AUTONOMOUS_MULTI_AGENT_OPERATION.md` and `09_Development/AI_Project_Memory/AUTONOMOUS_AGENT_POLICY.json`.

---

End of Document
