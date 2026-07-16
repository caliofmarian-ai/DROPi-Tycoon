# Document Information

Document: SAFE_SYSTEM.md
Project: DROPi Tycoon
Version: 1.1.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-16

---

# Safe System Framework

## Purpose

This document defines the safety and stability rules for DROPi Tycoon development.

The purpose of this system is to protect the game architecture from uncontrolled changes, unnecessary complexity, and accidental project damage.

Note: In-game save and load persistence is a separate responsibility owned exclusively by `06_Technical/SAVE_SYSTEM.md`. This document covers only development and project-level safety and stability governance.

---

# Safe Development Philosophy

DROPi Tycoon development follows controlled evolution.

Every change must:

- Have a clear purpose
- Respect existing architecture
- Preserve gameplay quality
- Avoid unnecessary complexity

---

# Core Safety Principles

## Modular Changes

New features should be added as independent systems whenever possible.

A new feature should not unnecessarily modify unrelated systems.

---

## Documentation First

Important systems must be documented before implementation.

Documentation defines:

- Purpose
- Rules
- Dependencies
- Limitations

---

## MVP Protection

The first playable version must remain the priority.

Future ideas should not delay the core game experience.

---

# Change Management

Before adding a major system:

Evaluate:

- Why is this needed?
- Does it improve gameplay?
- Does it increase complexity?
- Is it required now or later?

---

# AI Development Safety

AI-assisted development must follow controlled rules.

AI agents must:

- Respect existing documents
- Avoid creating unnecessary files
- Explain major changes
- Maintain consistency

---

# Version Safety

Important milestones should be preserved.

Recommended structure:

Prototype

↓

Alpha

↓

Beta

↓

Release Candidate

---

# Backup Strategy

Before major changes:

Create:

- Backup version
- Change description
- Rollback possibility

---

# Dependency Safety

Systems should avoid unnecessary dependencies.

Example:

The economy system should not directly control vehicles.

Instead:

Economy communicates through defined interfaces.

---

# Complexity Control

Avoid:

- Over-engineering
- Premature optimization
- Unnecessary simulation details

A simple working system is better than a complex unfinished system.

---

# Testing Safety

Before integrating changes:

Verify:

- Existing systems still work
- Game loop remains stable
- Player experience is preserved

---

# MVP Safety Rules

The first version should prioritize:

- Fun gameplay loop
- Stable systems
- Clear progression
- Understandable mechanics

Advanced features must wait until the foundation is proven.

---

# Future Expansion Protection

Future systems must be compatible with the existing architecture.

Examples:

Drone systems should extend logistics.

They should not replace the entire logistics foundation.

---

# Canonical Rule

Safety means protecting the vision of DROPi Tycoon.

Every technical decision must help the game grow without losing direction.

---

# Owner-Maintainability Principle

DROPi Tycoon must remain continuable by the Project Owner and any capable AI assistant using only:

- GitHub (repository and pull requests);
- Railway (deployment and deployment logs);
- Canonical documentation in the repository;
- Repository files and standard web-development workflows.

**The project must not permanently depend on:**

- GitHub Copilot credits or any specific AI agent credit pool;
- One specific AI agent or AI model;
- Proprietary visual editors or closed project formats;
- Undocumented manual knowledge held outside the repository;
- Non-exportable systems or one private development machine.

**AI agents may accelerate work**, but all knowledge and implementation must remain recoverable from the repository alone. If a concept exists only in an AI conversation and not in the repository, it is not durably part of the project.

**Recovery requirement:**

A new collaborator — human or AI — must be able to understand, continue, and deploy the project by reading only the canonical repository documentation and the repository files.

---

End of Document
