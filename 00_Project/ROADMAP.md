# Document Information

Document: ROADMAP.md
Project: DROPi Tycoon
Version: 2.0.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-08-01

---

# Development Roadmap

## Purpose

This document defines the long-term development strategy for DROPi Tycoon.

The objective is to build the game incrementally while maintaining a stable, scalable, and AI-friendly architecture.

Every new feature should build upon previously completed systems.

---

# Development Philosophy

DROPi Tycoon follows an iterative development model.

Each milestone delivers a playable version of the game while expanding existing systems rather than replacing them.

No feature should require rewriting the core architecture.

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

Current Phase

---

# Phase 1 — First Playable Prototype

Objective:

Deliver a minimal but fully playable logistics game.

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
- Avoid unnecessary complexity.
- Remain compatible with future expansions.
- Preserve save-game compatibility whenever possible.

---

# Success Metric

Development is considered successful when every milestone results in a complete, enjoyable, and stable gameplay experience.

---

# Planning Architecture Reference

The full milestone, epic, batch, and issue architecture for this roadmap is defined in the planning package:

- `09_Development/Planning/MILESTONE_ARCHITECTURE.md` — 21 milestones (M-001 through M-021)
- `09_Development/Planning/EPIC_CATALOG.md` — 37 epics (E-001 through E-037)
- `09_Development/Planning/BATCH_ARCHITECTURE.md` — 42 roadmap batches (RBATCH-001 through RBATCH-042)
- `09_Development/Planning/ISSUE_CATALOG.md` — 31 executable issues, 12 future placeholders
- `09_Development/Planning/DEPENDENCY_GRAPH.md` — acyclic dependency graphs
- `09_Development/Planning/LABEL_TAXONOMY.md` — GitHub label taxonomy
- `09_Development/Planning/GITHUB_CREATION_PLAN.md` — GitHub creation instructions
- `09_Development/Planning/github_creation_plan.yaml` — machine-readable creation plan

## Counts at a Glance

| Item | Count |
|---|---|
| Milestones | 21 |
| Epics | 37 |
| Roadmap Batches | 42 (RBATCH-001 through RBATCH-042) |
| Legacy Completed Batches | 8 (BATCH-001 through BATCH-008 → RBATCH-001 through RBATCH-008) |
| Executable Issues | 31 |
| Future Placeholders | 12 |

## Milestone Summary

| ID | Phase | Title | Status |
|---|---|---|---|
| M-001 | 0 | Foundation & Documentation Complete | COMPLETED |
| M-002 | 1 | Prototype Scaffold & Architecture | COMPLETED |
| M-003 | 1 | World Navigation | COMPLETED |
| M-004 | 1 | Order Lifecycle Core | COMPLETED |
| M-005 | 1 | Economy, HUD & Game Flow | Planned |
| M-006 | 1 | Company Management & Bicycle | Planned |
| M-007 | 1 | Save & Load System | Blocked (ODR-001, ODR-003) |
| M-008 | 1 | Prototype v0.1 Verification & Release | Planned |
| M-009 | 2 | Employee & Financial Systems | Future |
| M-010 | 2 | Vehicle Fleet Management | Future |
| M-011 | 3 | Warehouse & District System | Future |
| M-012 | 3 | Advanced Fleet & Route Optimization | Future |
| M-013 | 4 | Drone Research & Manufacturing | Future |
| M-014 | 4 | DronePort Infrastructure | Future |
| M-015 | 4 | Autonomous Drone Operations | Future |
| M-016 | 5 | Dynamic Market System | Future |
| M-017 | 5 | Financial Instruments & Competition | Future |
| M-018 | 6 | Autonomous Intelligence Systems | Future |
| M-019 | 7 | International Multi-City Logistics | Future |
| M-020 | 8 | Global Empire & Corporate Systems | Future |
| M-021 | 9 | Multiplayer & Community Systems | Future |

---

End of Document