# Document Information

Document: ROADMAP.md
Project: DROPi Tycoon
Version: 2.3.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-01

---

# Development Roadmap

DROPi Tycoon remains a web-first project. The active deployable runtime is the standard code-based web runtime in `game-web/`, deployed through Railway; archived GDevelop work in `Game/` remains historical/reference-only. Specific libraries, frameworks, and engines are replaceable implementation details rather than canonical technology.

## Purpose

This document defines the long-term development strategy for DROPi Tycoon.

The objective is to build the game incrementally while maintaining a stable, scalable, and AI-friendly architecture.

Every new feature should build upon previously completed systems.

---

# Development Philosophy

DROPi Tycoon follows an iterative development model.

Each milestone delivers a playable version of the game while expanding existing systems rather than replacing them.

No feature should require rewriting the core architecture.

## Long-Term Visual Quality Direction

The minimal visual presentation of Prototype v0.1 is a temporary development stage, not the intended final quality bar for DROPi Tycoon.

The long-term product is expected to evolve toward a substantially richer, polished, and visually impressive game experience. Later phases may improve or replace prototype presentation through higher-fidelity art, environments, buildings, vehicles, characters, animation, lighting, visual effects, UI presentation, audio-visual feedback, and other production-quality assets.

The word **minimal** in Phase 1 describes implementation scope only. It must never be interpreted as a permanent limit on visual quality, depth, ambition, or production value.

Core systems — including economy, logistics, progression, Save/Load, simulation state, and game rules — must remain sufficiently separated from rendering and temporary assets so visual technology and art direction can evolve without rewriting the underlying game logic.

---

# Phase 0 — Foundation

Objective:

Create a solid technical and design foundation.

Deliverables:

- Canonical documentation
- Project architecture
- Core gameplay definition
- UI wireframes
- Technical architecture
- Repository structure
- Asset pipeline

Status:

Completed — canonical documentation foundation established.

---

# Phase 1 — First Playable Prototype

Objective:

Deliver a minimal but fully playable logistics game. The minimal scope validates gameplay foundations; it does not define the final visual quality of the product.

Features:

- Small city map
- One courier
- Walking deliveries
- Bicycle deliveries
- Basic customer system
- Package generation
- Simple economy
- Save & Load (local device persistence; see `06_Technical/SAVE_SYSTEM.md`)
- Basic UI

Success Criteria:

The player can start a company, deliver packages, earn money, and continue growing.

---

# Phase 2 — Company Management

Features:

- Employees
- Salaries
- Daily expenses
- Company reputation
- Financial reports
- Vehicle purchasing
- Maintenance costs
- Customer reviews

---

# Phase 3 — Logistics Expansion

Features:

- Warehouses
- Multiple city districts
- Delivery zones
- Fleet management
- Route optimization
- Vehicle upgrades

---

# Phase 4 — Drone Technology

Features:

- Drone research
- Drone manufacturing partners
- DronePorts
- Battery swapping
- Autonomous deliveries
- Flight restrictions
- Weather effects

---

# Phase 5 — Advanced Economy

Features:

- Dynamic market
- Inflation
- Fuel prices
- Electricity costs
- Business loans
- Investors
- Competitors

---

# Phase 6 — Artificial Intelligence

Features:

- Smart routing
- Predictive demand
- Dynamic pricing
- Autonomous fleet management
- AI dispatch center

---

# Phase 7 — International Expansion

Features:

- Multiple cities
- Multiple countries
- Different regulations
- Customs
- Airports
- Ports
- International logistics

---

# Phase 8 — Global Corporation

Features:

- Public company
- Stock market
- Franchises
- Corporate headquarters
- Worldwide DronePort network

---

# Phase 9 — Endless Evolution

Future systems may include:

- Multiplayer
- Cooperative companies
- Competitive economy
- Robotics
- Autonomous warehouses
- Smart cities
- Space logistics
- Community-created content

---

# Guiding Principles

Every phase must:

- Be playable.
- Improve existing systems.
- Avoid unnecessary complexity that does not improve the player experience.
- Remain compatible with future expansions.
- Preserve save-game compatibility whenever possible.
- Allow visual fidelity and presentation quality to improve without forcing core-system rewrites.

---

# Success Metric

Development is considered successful when every milestone results in a complete, enjoyable, and stable gameplay experience while preserving the path toward the long-term product-quality target.

## Planning Architecture Reference

- `09_Development/Planning/MILESTONE_ARCHITECTURE.md` — 21 milestones
- `09_Development/Planning/EPIC_CATALOG.md` — 46 epics
- `09_Development/Planning/BATCH_ARCHITECTURE.md` — 54 roadmap batches
- `09_Development/Planning/ISSUE_CATALOG.md` — 34 executable issues and 32 planning placeholders
- `09_Development/Planning/DEPENDENCY_GRAPH.md` — milestone, epic, and batch graphs validated acyclic
- `09_Development/Planning/LABEL_TAXONOMY.md` — 122 labels
- `09_Development/Planning/GITHUB_CREATION_PLAN.md` — non-destructive GitHub creation procedure and Owner Directive coverage matrix
- `09_Development/Planning/github_creation_plan.yaml` — machine-readable planning package

## Derived Planning Summary

| Item | Count |
|---|---|
| Milestones | 21 |
| Epics | 46 |
| Roadmap Batches | 54 (`RBATCH-001..RBATCH-054`) |
| Legacy Crosswalk Entries | 17 |
| Executable Issues | 34 |
| Planning Placeholders | 32 |
| Labels | 122 |

## Milestone Summary

| ID | Phase | Title | Status |
|---|---|---|---|
| M-001 | 0 | Foundation & Documentation Complete | COMPLETED |
| M-002 | 1 | Prototype Scaffold & Runtime Foundation | COMPLETED |
| M-003 | 1 | World Navigation | COMPLETED |
| M-004 | 1 | Order Lifecycle Core | COMPLETED |
| M-005 | 1 | Economy, HUD & Game Flow | In Progress |
| M-006 | 1 | Company Management & Bicycle | In Progress |
| M-007 | 1 | Save & Load System | In Progress |
| M-008 | 1 | Prototype v0.1 Verification & Release | In Progress |
| M-009 | 2 | Employee & Financial Systems | Planned — Future |
| M-010 | 2 | Vehicle Fleet Management | Planned — Future |
| M-011 | 3 | Warehouse & District System | Planned — Future |
| M-012 | 3 | Advanced Fleet & Route Optimization | Planned — Future |
| M-013 | 4 | Drone Research & Manufacturing | Planned — Future |
| M-014 | 4 | DronePort Infrastructure | Planned — Future |
| M-015 | 4 | Autonomous Drone Operations | Planned — Future |
| M-016 | 5 | Dynamic Market System | Planned — Future |
| M-017 | 5 | Financial Instruments & Competition | Planned — Future |
| M-018 | 6 | Autonomous Intelligence Systems | Planned — Future |
| M-019 | 7 | International Multi-City Logistics | Planned — Future |
| M-020 | 8 | Global Empire & Corporate Systems | Planned — Future |
| M-021 | 9 | Multiplayer & Community Systems | Planned — Future |

## Legacy Numbering Authority Rule

Legacy `BATCH-001..BATCH-016` plus `BATCH-010b` remain historical lineage only. `M-001` / `E-001` / `E-002` are completed canonical-documentation owners and are not evidenced by historical `BATCH-001`. Historical `BATCH-001` maps to `RBATCH-001` under `M-002` / `E-003`. Execute only the mapped `RBATCH-*` identifiers from `09_Development/Planning/BATCH_ARCHITECTURE.md`; use `09_Development/Implementation_Preparation/IMPLEMENTATION_BATCH_PLAN.md` as lineage evidence, not authoritative current planning.

---

End of Document