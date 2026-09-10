# Document Information

Document: AI_AGENT_EXECUTION_PROTOCOL.md  
Project: DROPi Tycoon  
Version: 1.3.0  
Status: AI Development Operations  
Author: Marian Caliof & OpenAI  
Language: English  
Last Updated: 2026-09-10

---

# AI Agent Execution Protocol

## Purpose

This document defines how AI development agents operate during the creation of DROPi Tycoon. Agents collaborate through explicit authority, GitHub evidence, persistent repository-backed handoffs and current canonical project documents.

AI agents are production assistants. The Project Owner remains vision owner, final decision maker and quality controller.

## Deterministic session bootstrap

Every new DT-00 or DT specialist session MUST begin at:

`09_Development/AI_Project_Memory/BOOTSTRAP.md`

A session must not rely on prior ChatGPT conversation memory to reconstruct current operational state.

The bootstrap defines the mandatory read order, live-GitHub reconciliation rule, authority-layer separation and safe-resume procedure.

## Persistent operational-memory invariant

For every significant session:

`NO DURABLE HANDOFF = SESSION NOT OPERATIONALLY COMPLETE`

Before a significant session is considered closed, paused, superseded, READY, HOLD or handed off, repository-backed state must preserve at least:

- agent identity;
- ownership boundary;
- mission;
- observed canonical main SHA and live-reconciliation requirement;
- Issue/PR/branch/head SHA where applicable;
- exact status;
- material findings and evidence;
- Owner decisions/directives;
- materially important rejected assumptions;
- unresolved UNKNOWNs;
- blockers/dependencies;
- exact-head CI state where relevant;
- currently forbidden actions;
- next safe action;
- canonical/report references.

Missing evidence is `UNKNOWN`. It must never be filled from assumption or fabricated history.

The current durable handoff authority is:

`09_Development/AI_Project_Memory/HANDOFFS.json`

The current project-operational snapshot is:

`09_Development/AI_Project_Memory/CURRENT_STATE.json`

## Live GitHub rule

Repository memory stores the last durable observation. Before implementation, READY, audit, merge or lifecycle mutation, agents must re-read live GitHub for mutable state including:

- current `main` SHA;
- Issue state/body/comments;
- PR state/base/head/draft/mergeability;
- branch head;
- exact-head checks/CI;
- merge state.

Live GitHub wins for mutable GitHub state. Persisted values must be classified `CURRENT`, `STALE`, `CONTRADICTORY` or `UNKNOWN` when reconciled.

## Authority-layer separation

Agents must keep these layers distinct:

1. canonical project/domain authority;
2. historical `09_Development/AI_Reports/`;
3. operational project memory;
4. agent/session handoffs;
5. durable decision records;
6. UNKNOWN/blocker register.

Operational memory and AI reports must never silently rewrite gameplay, architecture, economy, legal or other domain authority.

Raw/hidden model chain-of-thought is out of scope. Persist useful engineering conclusions, evidence, decisions, appropriate rationale, constraints, rejected assumptions, ownership, blockers, UNKNOWNs, status and next safe action only.

## Agent execution roles

Where a task uses the legacy execution-role model, the sequence remains:

```text
Architecture Agent
-> Game Design Agent
-> Implementation Agent
-> Testing Agent
-> Documentation Agent
```

DT ownership and orchestration assigned by DT-00 take precedence for current multi-agent work. No role may take another DT lane's canonical authority without explicit reconciliation.

### Architecture Agent
Protect project structure, verify consistency/dependencies, prevent unnecessary complexity and confirm implementation direction.

### Game Design Agent
Transform approved concepts into playable mechanics, review player experience/progression and maintain MVP focus.

### Implementation Agent
Convert approved specifications into the current runtime/application architecture. Inspect current canonical platform/runtime documents before selecting tools or targets. Do not revive superseded GDevelop/Web-First assumptions or duplicate canonical domain rules in platform shells.

### Testing Agent
Verify requirements, functionality, regressions and player experience using exact evidence.

### Documentation Agent
Maintain project knowledge, canonical documentation where authorized, version history, persistent reports and durable operational handoffs.

## Agent communication rules

Agents communicate through repository documentation, defined outputs, GitHub evidence, durable handoffs and clear decisions.

Avoid hidden assumptions, unrecorded changes, stale-state claims and conflicting implementations.

Owner-facing material execution reports must follow the current DT-00 reporting contract. Marian-facing operational explanations are written in Romanian; technical identifiers, paths, SHAs, code, commands and machine-status tokens may remain in English.

## Persistent AI reporting requirement

Significant AI tasks must also follow:

`09_Development/AI_REPORTING_PROTOCOL.md`

Historical reporting and current operational handoff are complementary requirements. Completing one does not waive the other.

## Task execution format

Every task should define:

```text
Task Name
Objective
Required Input
Expected Output
Validation Method
```

## Change approval and ownership rules

Agents must not independently change game vision, add major systems, modify architecture, expand MVP scope or take another specialist's authority. Material conflicts or scope expansion require DT-00/Owner reconciliation.

No self-merge or auto-merge is authorized by this protocol. Current DT-00 governance controls merge approval and exact-head verification.

## Owner Directives inspection rule

Before proposing or implementing any major change to architecture, universe design, business model, logistics, economy, marketplace, runtime or documentation structure, inspect:

`09_Development/Owner_Directives/`

Rules:

1. Relevant Owner Directives must be acknowledged and considered.
2. They must never be silently ignored.
3. They must not be copied wholesale into canonical domain documents; integration requires a governed task.
4. Conflicts with existing canon must be surfaced, never silently overwritten.

Owner Directives are authoritative strategic inputs, not automatically canonical domain specifications. See `09_Development/Owner_Directives/README.md`.

## Mobile platform canon inspection rule

Before major platform/runtime/Android/Expo/deployment/camera/viewport/persistence-adapter/distribution change, read and reconcile:

1. `00_Project/VISION.md`;
2. `06_Technical/ARCHITECTURE.md`;
3. `06_Technical/MOBILE_APPLICATION_PLATFORM.md`;
4. `06_Technical/SAVE_SYSTEM.md` when persistence is affected;
5. `00_Project/PROJECT_STATUS.md` and the active GitHub Issue/PR.

Do not assume Chrome/Railway is the primary final gameplay surface, that the browser is the Owner acceptance target, that Expo requires rewriting Phaser gameplay in React Native, that one fixed browser/camera geometry fits all Android devices, or that a native shell authorizes unrelated gameplay/economy/domain changes.

If required canonical platform documents disagree, surface the contradiction before implementation.

## Error handling

When information is missing or conflicting:

- first inspect the deterministic bootstrap, durable handoff, referenced GitHub state and relevant canonical authority;
- record unresolved information as `UNKNOWN`;
- stop only the unsafe dependent action when the conflict cannot be resolved from authoritative evidence;
- escalate through DT-00/Owner when a real authority decision is required.

Do not ask the Owner to manually reconstruct project context that #683 requires the repository to preserve.

## Version control and validation

Important AI-generated changes require traceable commits, clear description and validation evidence. Exact-head CI must be used when relevant to a merge/readiness decision.

Persistent-memory structure can be checked with:

```bash
node 09_Development/AI_Project_Memory/validate-memory.mjs
```

The validator supplements, but never replaces, live GitHub reconciliation and DT-00 audit.

## MVP protection

Prioritize core gameplay, stability and simplicity. Avoid feature inflation, premature optimization and unnecessary complexity.

## Canonical rule

AI agents build according to the vision, current canonical architecture, current DT ownership and repository-backed operational state.

They do not create a different game, revive superseded platform assumptions or depend on private conversation memory for project continuity.

---

End of Document
