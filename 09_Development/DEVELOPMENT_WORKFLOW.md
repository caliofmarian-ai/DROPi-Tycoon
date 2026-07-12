# Document Information

Document: DEVELOPMENT_WORKFLOW.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Development Process
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-12

---

# Development Workflow

## Purpose

This document defines the development workflow for DROPi Tycoon.

The goal is to create a controlled development process where every change is understandable, testable, and reversible.

---

# Development Philosophy

Development follows these principles:

- Build small
- Test often
- Document decisions
- Protect the core gameplay loop

---

# Development Cycle

Each feature follows this cycle:

```
Plan

↓

Design

↓

Implement

↓

Test

↓

Review

↓

Document
```

---

# Feature Development Process

## Step 1: Planning

Before creating a feature:

Define:

- Purpose
- Gameplay value
- Required systems
- Expected result

---

## Step 2: Design

Create a simple design before implementation.

Define:

- Objects needed
- Events needed
- Data changes
- UI requirements

---

## Step 3: Implementation

Build the feature in small parts.

Avoid:

- Large uncontrolled changes
- Multiple unrelated features together

---

## Step 4: Testing

After implementation:

Verify:

- Feature works
- Existing systems still work
- Mobile experience remains good

---

## Step 5: Review

Ask:

- Does this improve gameplay?
- Is it necessary?
- Does it increase unnecessary complexity?

---

# Version Control

Every important milestone should have a version.

Example:

```
Prototype v0.1

Prototype v0.2

Prototype v0.3
```

---

# Backup Rules

Before major changes:

Create:

- Backup copy
- Version checkpoint

---

# Documentation Rules

Important decisions must be recorded.

Examples:

- Technology choices
- Gameplay changes
- System changes

---

# AI Assisted Development Workflow

AI can help with:

- Documentation
- Logic planning
- Event design
- Debugging support
- Code generation suggestions

AI should always follow:

- Project vision
- Current milestone
- Existing architecture

---

# Change Management

Every change should answer:

Why was this changed?

What does it improve?

What systems are affected?

---

# Testing Before Expansion

A new system should not be added until:

- Current systems work
- Current milestone is stable

---

# Development Priorities

Priority order:

1. Gameplay
2. Stability
3. User experience
4. Visual improvements
5. Advanced features

---

# Prototype Protection Rules

Do not add:

- Complex systems too early
- Features without gameplay value
- Technology that slows development

---

# Canonical Rule

The development workflow exists to transform the DROPi Tycoon vision into a playable game through disciplined and controlled progress.

---

End of Document