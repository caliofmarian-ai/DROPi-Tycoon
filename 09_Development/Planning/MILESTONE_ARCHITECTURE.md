# Document Information

Document: MILESTONE_ARCHITECTURE.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Planning — Canonical
Author: AI Agent (Report 086)
Language: English
Last Updated: 2026-08-01

---

# Milestone Architecture

## Purpose

This document defines the complete milestone structure for the DROPi Tycoon project across all development phases.

Milestones are the top-level delivery checkpoints used to track progress in GitHub and to bound the scope of related epics and batches.

---

## Milestone Count Summary

- Total milestones: **21**
- Phase 0 milestones: 1 (M-001)
- Phase 1 milestones: 7 (M-002 through M-008)
- Phase 2 milestones: 2 (M-009 through M-010)
- Phase 3 milestones: 2 (M-011 through M-012)
- Phase 4 milestones: 3 (M-013 through M-015)
- Phase 5 milestones: 2 (M-016 through M-017)
- Phase 6 milestones: 1 (M-018)
- Phase 7 milestones: 1 (M-019)
- Phase 8 milestones: 1 (M-020)
- Phase 9 milestones: 1 (M-021)

---

## Milestone Registry

### Phase 0 — Foundation

#### M-001: Foundation & Documentation Complete

- ID: M-001
- Phase: 0
- Title: Foundation & Documentation Complete
- Status: **COMPLETED**
- Description: Canonical documentation framework, project architecture, repository structure, and game design foundations are established and audited.
- Epics: E-001, E-002
- Roadmap Batches: RBATCH-001, RBATCH-002, RBATCH-003
- Depends On: none
- Milestone closes when: all foundation documentation passes consistency audit; repository structure matches canonical specification.

---

### Phase 1 — First Playable Prototype

#### M-002: Prototype Scaffold & Architecture

- ID: M-002
- Phase: 1
- Title: Prototype Scaffold & Architecture
- Status: **COMPLETED**
- Description: GDevelop project scaffold, scene/event architecture, and placeholder asset pipeline established.
- Epics: E-003, E-004
- Roadmap Batches: RBATCH-001, RBATCH-002, RBATCH-003
- Depends On: M-001
- Milestone closes when: GDevelop project opens; scenes exist; placeholder assets are named and structured correctly.

---

#### M-003: World Navigation

- ID: M-003
- Phase: 1
- Title: World Navigation
- Status: **COMPLETED**
- Description: World map, player entity, interactive building entities, tap-to-move input, and camera tracking implemented for Android-first interaction.
- Epics: E-005, E-006
- Roadmap Batches: RBATCH-004, RBATCH-006
- Depends On: M-002
- Milestone closes when: player can navigate the world map with tap-to-move on Android; camera follows player.

---

#### M-004: Order Lifecycle Core

- ID: M-004
- Phase: 1
- Title: Order Lifecycle Core
- Status: **COMPLETED**
- Description: Full order state machine from Created through Completed and Failed, including order generation, proximity-based pickup, delivery completion, and failure path.
- Epics: E-007, E-008, E-009
- Roadmap Batches: RBATCH-005, RBATCH-007, RBATCH-008
- Depends On: M-003
- Milestone closes when: orders progress through Created→Available→Accepted→PickedUp→Completed and PickedUp→Failed; terminal states are protected.

---

#### M-005: Economy, HUD & Game Flow

- ID: M-005
- Phase: 1
- Title: Economy, HUD & Game Flow
- Status: Planned — Not Started
- Description: Economy and reputation outcomes from delivery results; HUD panels and notifications; MainMenu Start/Continue flow with new-game overwrite guard.
- Epics: E-010, E-011, E-012
- Roadmap Batches: RBATCH-009, RBATCH-010, RBATCH-011
- Depends On: M-004
- Milestone closes when: money and reputation update correctly after delivery outcomes; HUD displays active-order information; MainMenu flow is canonically compliant.

---

#### M-006: Company Management & Bicycle

- ID: M-006
- Phase: 1
- Title: Company Management & Bicycle
- Status: Planned — Not Started
- Description: CompanyManagement scene with upgrade purchase flow; bicycle ownership flag and speed effect.
- Epics: E-013, E-014
- Roadmap Batches: RBATCH-012, RBATCH-013
- Depends On: M-005
- Milestone closes when: player can purchase upgrades in CompanyManagement scene; bicycle speed effect applies correctly after acquisition.

---

#### M-007: Save & Load System

- ID: M-007
- Phase: 1
- Title: Save & Load System
- Status: Planned — Blocked (ODR-001, ODR-003 required)
- Description: Local device persistence including save serialization, load validation, and autosave triggers.
- Epics: E-015
- Roadmap Batches: RBATCH-014
- Depends On: M-006
- Owner Gates: ODR-001, ODR-003
- Milestone closes when: player progress persists across sessions; save/load passes all canonical test cases.

---

#### M-008: Prototype v0.1 Verification & Release

- ID: M-008
- Phase: 1
- Title: Prototype v0.1 Verification & Release
- Status: Planned — Not Started
- Description: Mobile optimization and polish; full-loop integration verification; completion-gate verification package for owner review.
- Epics: E-016, E-017
- Roadmap Batches: RBATCH-015, RBATCH-016, RBATCH-017
- Depends On: M-007
- Owner Gates: Human owner approval required (RBATCH-017)
- Milestone closes when: mobile build is playable; all P0/P1 loop behaviors validated; owner review package delivered and approved.

---

### Phase 2 — Company Management

#### M-009: Employee & Financial Systems

- ID: M-009
- Phase: 2
- Title: Employee & Financial Systems
- Status: Planned — Future
- Description: Employee onboarding and salary system; daily operational expenses; financial reporting; customer reputation and review system.
- Epics: E-018, E-019, E-020
- Roadmap Batches: RBATCH-018, RBATCH-019, RBATCH-020, RBATCH-021
- Depends On: M-008
- Milestone closes when: employees generate salary costs; daily expenses apply; financial reports are visible; customer reviews affect reputation.

---

#### M-010: Vehicle Fleet Management

- ID: M-010
- Phase: 2
- Title: Vehicle Fleet Management
- Status: Planned — Future
- Description: Vehicle purchasing catalog, maintenance costs, and Phase 2 integration verification.
- Epics: E-021
- Roadmap Batches: RBATCH-022, RBATCH-023, RBATCH-024
- Depends On: M-009
- Milestone closes when: player can purchase and maintain vehicles; Phase 2 integration passes.

---

### Phase 3 — Logistics Expansion

#### M-011: Warehouse & District System

- ID: M-011
- Phase: 3
- Title: Warehouse & District System
- Status: Planned — Future
- Description: Warehouse infrastructure; multi-district map expansion; delivery zone management.
- Epics: E-022, E-023
- Roadmap Batches: RBATCH-025, RBATCH-026, RBATCH-027
- Depends On: M-010
- Milestone closes when: warehouses are operational; districts are navigable; delivery zones function correctly.

---

#### M-012: Advanced Fleet & Route Optimization

- ID: M-012
- Phase: 3
- Title: Advanced Fleet & Route Optimization
- Status: Planned — Future
- Description: Fleet management dashboard; route optimization engine; vehicle upgrade system; Phase 3 integration verification.
- Epics: E-024, E-025
- Roadmap Batches: RBATCH-028, RBATCH-029, RBATCH-030, RBATCH-031
- Depends On: M-011
- Milestone closes when: fleet can be managed; routes are optimized; vehicle upgrades function; Phase 3 integration passes.

---

### Phase 4 — Drone Technology

#### M-013: Drone Research & Manufacturing

- ID: M-013
- Phase: 4
- Title: Drone Research & Manufacturing
- Status: Planned — Future
- Description: Drone research technology tree; drone manufacturing partners integration.
- Epics: E-026, E-027
- Roadmap Batches: RBATCH-032, RBATCH-033
- Depends On: M-012
- Milestone closes when: drone research is accessible; manufacturing partners are integrated.

---

#### M-014: DronePort Infrastructure

- ID: M-014
- Phase: 4
- Title: DronePort Infrastructure
- Status: Planned — Future
- Description: DronePort construction system; battery swapping network implementation.
- Epics: E-028, E-029
- Roadmap Batches: RBATCH-034, RBATCH-035
- Depends On: M-013
- Milestone closes when: DronePorts can be constructed; battery swapping is operational.

---

#### M-015: Autonomous Drone Operations

- ID: M-015
- Phase: 4
- Title: Autonomous Drone Operations
- Status: Planned — Future
- Description: Autonomous delivery execution; flight restrictions and weather system; Phase 4 integration verification.
- Epics: E-030, E-031
- Roadmap Batches: RBATCH-036, RBATCH-037, RBATCH-038
- Depends On: M-014
- Milestone closes when: drones deliver autonomously; flight restrictions and weather affect operations; Phase 4 integration passes.

---

### Phase 5 — Advanced Economy

#### M-016: Dynamic Market System

- ID: M-016
- Phase: 5
- Title: Dynamic Market System
- Status: Planned — Future
- Description: Dynamic market with inflation, fuel prices, and electricity costs.
- Epics: E-032, E-033
- Roadmap Batches: RBATCH-039
- Depends On: M-015
- Milestone closes when: market prices fluctuate dynamically; fuel and electricity costs affect operations.

---

#### M-017: Financial Instruments & Competition

- ID: M-017
- Phase: 5
- Title: Financial Instruments & Competition
- Status: Planned — Future
- Description: Business loans, investor system, competitor companies, and advanced economy integration.
- Epics: E-034, E-035
- Roadmap Batches: RBATCH-040, RBATCH-041
- Depends On: M-016
- Milestone closes when: loans and investors are accessible; competitor companies operate; advanced economy integration passes.

---

### Phase 6 — Artificial Intelligence

#### M-018: Autonomous Intelligence Systems

- ID: M-018
- Phase: 6
- Title: Autonomous Intelligence Systems
- Status: Planned — Future
- Description: Smart routing, predictive demand, dynamic pricing, and AI dispatch center.
- Epics: E-036, E-037
- Roadmap Batches: RBATCH-042
- Depends On: M-017
- Milestone closes when: AI systems optimize routing and dispatch autonomously.

---

### Phase 7 — International Expansion

#### M-019: International Multi-City Logistics

- ID: M-019
- Phase: 7
- Title: International Multi-City Logistics
- Status: Planned — Future
- Description: Multiple cities, countries, customs, airports, and international logistics regulations.
- Epics: (defined in future planning iteration)
- Roadmap Batches: (defined in future planning iteration)
- Depends On: M-018
- Milestone closes when: international logistics operations are playable.

---

### Phase 8 — Global Corporation

#### M-020: Global Empire & Corporate Systems

- ID: M-020
- Phase: 8
- Title: Global Empire & Corporate Systems
- Status: Planned — Future
- Description: Public company, stock market, franchises, corporate headquarters, worldwide DronePort network.
- Epics: (defined in future planning iteration)
- Roadmap Batches: (defined in future planning iteration)
- Depends On: M-019
- Milestone closes when: global corporation systems are operational.

---

### Phase 9 — Endless Evolution

#### M-021: Multiplayer & Community Systems

- ID: M-021
- Phase: 9
- Title: Multiplayer & Community Systems
- Status: Planned — Future
- Description: Multiplayer, cooperative companies, competitive economy, robotics, autonomous warehouses, space logistics, and community-created content.
- Epics: (defined in future planning iteration)
- Roadmap Batches: (defined in future planning iteration)
- Depends On: M-020
- Milestone closes when: multiplayer and community systems are stable and operational.

---

## Milestone Dependency Summary

```
M-001 (Phase 0 — COMPLETED)
  └── M-002 (Phase 1 — COMPLETED)
        └── M-003 (Phase 1 — COMPLETED)
              └── M-004 (Phase 1 — COMPLETED)
                    └── M-005 (Phase 1 — Planned)
                          └── M-006 (Phase 1 — Planned)
                                └── M-007 (Phase 1 — Blocked: ODR)
                                      └── M-008 (Phase 1 — Planned)
                                            └── M-009 (Phase 2 — Future)
                                                  └── M-010 (Phase 2 — Future)
                                                        └── M-011 (Phase 3 — Future)
                                                              └── M-012 (Phase 3 — Future)
                                                                    └── M-013 (Phase 4 — Future)
                                                                          └── M-014 (Phase 4 — Future)
                                                                                └── M-015 (Phase 4 — Future)
                                                                                      └── M-016 (Phase 5 — Future)
                                                                                            └── M-017 (Phase 5 — Future)
                                                                                                  └── M-018 (Phase 6 — Future)
                                                                                                        └── M-019 (Phase 7 — Future)
                                                                                                              └── M-020 (Phase 8 — Future)
                                                                                                                    └── M-021 (Phase 9 — Future)
```

The dependency graph is a strict linear chain with no cycles.

---

End of Document
