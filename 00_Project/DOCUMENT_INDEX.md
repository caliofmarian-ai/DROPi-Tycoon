# Document Information

Document: DOCUMENT_INDEX.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Documentation Control
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-12

---

# Documentation Index

## Purpose

This document provides a complete map of DROPi Tycoon project documentation.

Its purpose is to:

- Maintain organization
- Prevent duplicated information
- Keep documents connected
- Support AI-assisted development

---

# Project Structure

```
DROPi_Tycoon/

00_Project
01_Vision
02_Economy
03_Logistics
04_World
05_AI
06_Technical
07_UI
08_Assets
09_Development
```

---

# 00_Project

## Purpose

Project identity and management documents.

Contains:

- Project definition
- Current status
- Documentation control

Documents:

```
PROJECT_STATUS.md

DOCUMENT_INDEX.md
```

---

# 01_Vision

## Purpose

Defines the game identity and long-term direction.

Contains:

- Game vision
- Player experience
- Design philosophy

---

# 02_Economy

## Purpose

Defines the in-game economic systems.

Contains:

- Money
- Rewards
- Progression economy
- Upgrades

---

# 03_Logistics

## Purpose

Defines delivery gameplay systems.

Contains:

- Orders
- Packages
- Delivery flow
- Logistics mechanics

---

# 04_World

## Purpose

Defines the game environment.

Contains:

- Map
- Buildings
- NPC
- Weather
- World simulation

---

# 05_AI

## Purpose

Defines artificial intelligence systems that exist inside the game.

Contains:

- AI Systems
- AI Agents
- NPC intelligence
- World simulation behavior

Important:

This folder does not describe AI used for development.

---

# 06_Technical

## Purpose

Defines technical architecture.

Contains:

- Architecture
- Safety systems
- Development methodology

Key documents:

```
ARCHITECTURE.md — system architecture and layer definitions

SAVE_SYSTEM.md — canonical in-game Save & Load specification
                 (owns: save data scope, save triggers, load behavior, corruption handling)

SAFE_SYSTEM.md — development and project-level safety and stability governance
                 (owns: change management, MVP protection, AI development rules, backup strategy)
```

Note: SAVE_SYSTEM.md and SAFE_SYSTEM.md have distinct responsibilities.
SAVE_SYSTEM.md defines in-game persistence. SAFE_SYSTEM.md defines development safety rules.

---

# 07_UI

## Purpose

Defines player interface and experience.

Contains:

- UI design
- UX design

---

# 08_Assets

## Purpose

Defines visual and audio resources.

Contains:

- Asset rules
- Organization
- Optimization guidelines

---

# 09_Development

## Purpose

Defines the creation process.

Contains:

- Development planning
- Testing
- AI-assisted workflow
- Build process

Important documents:

```
AI_DEVELOPMENT_WORKFLOW.md

AI_PROJECT_GENERATION_PLAN.md

AI_REPORTING_PROTOCOL.md

PROTOTYPE_GENERATION_PACKAGE.md

PROTOTYPE_BUILD_PIPELINE.md

AI_AGENT_EXECUTION_PROTOCOL.md

AI_Reports/
```

---

# Document Rules

Every document must have:

- Clear purpose
- Defined responsibility
- Version information
- No duplicated systems

---

# Information Ownership Rules

## Gameplay Rules

Stored in:

01_Vision
02_Economy
03_Logistics
04_World
05_AI

---

## Technical Rules

Stored in:

06_Technical
09_Development

---

## Development Process

Stored in:

09_Development

---

# Consistency Rule

Before adding a new document:

Check:

1. Does this information already exist?
2. Which folder owns this information?
3. Does it affect existing architecture?

---

# Canonical Rule

Every project decision must have one clear home.

The documentation structure must remain simple, searchable, and consistent.

---

End of Document