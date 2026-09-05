# Document Information

Document: AI_AGENT_EXECUTION_PROTOCOL.md
Project: DROPi Tycoon
Version: 1.2.0
Status: AI Development Operations
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-05

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

# Persistent AI Reporting Requirement

For significant AI tasks, agents must follow:

`09_Development/AI_REPORTING_PROTOCOL.md`

A significant task is not operationally complete until the required persistent report is created or updated according to that protocol.

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

---

End of Document