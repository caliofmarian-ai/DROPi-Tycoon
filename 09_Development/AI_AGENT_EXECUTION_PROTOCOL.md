# Document Information

Document: AI_AGENT_EXECUTION_PROTOCOL.md
Project: DROPi Tycoon
Version: 1.4.0
Status: AI Development Operations
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-10

---

# AI Agent Execution Protocol

## Purpose

This document defines how AI development agents operate during the creation of DROPi Tycoon.

The goal is to create a controlled workflow where AI agents collaborate while maintaining project consistency.

---

# Operating Principle

AI agents are production assistants.

They do not replace project direction.

The human role remains:

- Vision owner
- Final decision maker
- Quality controller

---

# Agent Execution Order

Agents must operate in the following sequence:

```
Architecture Agent

↓

Game Design Agent

↓

Implementation Agent

↓

Testing Agent

↓

Documentation Agent
```

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

# 4. Testing Agent

## Mission

Verify functionality and player experience.

## Responsibilities

- Test features
- Identify problems
- Verify requirements
- Suggest improvements

## Output

Testing report.

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

Avoid:

- Hidden assumptions
- Unrecorded changes
- Conflicting implementations

---

# DT-00 Orchestration Authority

`DT-00 — CENTRAL ORCHESTRATOR` owns live-state reconciliation, dependency/merge ordering, cross-lane collision control, independent exact-head audit, merge execution and post-merge verification.

DT-00 may:

- implement integration or cross-lane work directly when that is the smallest safe path;
- assign a concrete bounded task to the specialist that owns the domain;
- keep unrelated specialists in `HOLD` rather than creating parallel work without a current dependency need;
- close proven duplicate or superseded PRs with an evidence-backed explanation;
- merge routine non-visible work already authorized by the Project Owner after canonical review and exact-head gates pass.

Specialists must not self-merge or enable auto-merge. Their READY statement is input to DT-00 audit, not merge authority.

A player-visible runtime change requires the applicable owner/device acceptance and must not be merged only because automated checks are green.

After any merge, DT-00 must verify the new exact `main`, applicable exact-main workflows and deployment/runtime evidence. A regression attributable to that merge must be corrected before the work is reported as complete.

Routine work is GitHub-first. Do not require Marian to operate a PC or Termux/TMux. Those commands are reserved for explicit repository synchronization/copying or another separately approved exceptional operation.

External Figma, Canva, Runway and Higgsfield tooling is governed by `09_Development/AI_Project_Memory/AUTHORIZED_TOOLING.md`; it does not expand domain ownership or create parallel code/project authority.

---

# Persistent AI Reporting Requirement

For significant AI tasks, agents must follow:

`09_Development/AI_REPORTING_PROTOCOL.md`

A significant task is not operationally complete until the required persistent report is created or updated according to that protocol.

---

# Persistent AI Project Memory and Handoff Requirement

Every DT-00 and DT specialist session must begin at the deterministic repository bootstrap:

`09_Development/AI_Project_Memory/BOOTSTRAP.md`

A session must not depend on prior ChatGPT conversation memory to reconstruct current operational state.

For every significant session:

`NO DURABLE HANDOFF = SESSION NOT OPERATIONALLY COMPLETE`

Before a significant session is considered closed, paused, superseded, READY, HOLD, or handed off, the repository-backed handoff must preserve at least:

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
- currently forbidden actions;
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

Live GitHub remains authoritative for mutable GitHub state. Before implementation, READY, audit, merge, or lifecycle mutation, agents must re-read current `main`, Issue/PR state, branch/head, mergeability, and exact-head CI as applicable. Persisted state must be reconciled as `CURRENT`, `STALE`, `CONTRADICTORY`, or `UNKNOWN`.

Raw or hidden model chain-of-thought is out of scope. Persist useful engineering conclusions, evidence, decisions, appropriate rationale, constraints, rejected assumptions, ownership, blockers, `UNKNOWN`s, status, and next safe action only.

DT ownership and orchestration assigned by DT-00 take precedence over generic execution-role wording when the repository contains a current DT handoff. No agent may silently take another DT lane's authority.

No self-merge or auto-merge is authorized by this memory protocol.

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

---

# Change Approval Rules

AI agents must request approval before:

- Changing game vision
- Adding major systems
- Modifying architecture
- Expanding MVP scope

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
- Vehicle Fleet PR #288 should resume before the Android application/camera foundation receives Project Owner acceptance.

If the required canonical platform documents disagree, the agent must surface the contradiction before implementation rather than choosing one silently.

---

# Error Handling

If an agent detects:

- Missing information
- Conflicting documents
- Unclear requirements

It must stop and request clarification.

For missing project-continuity context covered by Issue #683, the agent must first exhaust the deterministic repository bootstrap, current handoff, referenced live GitHub state, and relevant canonical authority. It must not require the Project Owner to manually reconstruct context that the persistent-memory protocol is required to preserve. Unresolved evidence remains `UNKNOWN`.

---

# Version Control

Each important AI-generated change should have:

- Version number
- Description
- Test result

---

# MVP Protection

Agents must prioritize:

- Core gameplay
- Stability
- Simplicity

Agents must avoid:

- Feature inflation
- Premature optimization
- Unnecessary complexity

---

# Final Objective

The AI agent system should transform:

Vision

↓

Design

↓

Implementation

↓

Testing

↓

Playable Prototype

---

# Canonical Rule

AI agents build according to the vision and current canonical architecture.

They do not create a different game and they do not revive superseded platform assumptions without Project Owner approval.

For operational continuity, they also consume and maintain the repository-backed Persistent AI Project Memory defined by `09_Development/AI_Project_Memory/BOOTSTRAP.md`; this operational layer does not replace canonical domain authority.

---

End of Document
