# Document Information

Document: AI_AGENT_EXECUTION_PROTOCOL.md
Project: DROPi Tycoon
Version: 1.0.0
Status: AI Development Operations
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-12

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

Convert specifications into GDevelop implementation.

## Responsibilities

- Create scenes
- Configure objects
- Build event logic
- Connect systems

## Output

Working game components.

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

AI agents build according to the vision.

They do not create a different game.

---

End of Document