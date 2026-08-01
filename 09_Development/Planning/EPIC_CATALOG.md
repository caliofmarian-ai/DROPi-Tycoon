# Document Information

Document: EPIC_CATALOG.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Planning — Canonical
Author: AI Agent (Report 086)
Language: English
Last Updated: 2026-08-01

---

# Epic Catalog

## Purpose

This document enumerates all epics for the DROPi Tycoon project, organized by milestone and development phase.

An epic is a named cluster of related functionality that maps to one or more roadmap batches and is bounded by a parent milestone.

---

## Epic Count Summary

- Total epics: **37**
- Phase 0 epics: 2 (E-001 through E-002)
- Phase 1 epics: 15 (E-003 through E-017)
- Phase 2 epics: 4 (E-018 through E-021)
- Phase 3 epics: 4 (E-022 through E-025)
- Phase 4 epics: 6 (E-026 through E-031)
- Phase 5 epics: 4 (E-032 through E-035)
- Phase 6 epics: 2 (E-036 through E-037)

---

## Epic Registry

### Phase 0 — Foundation

#### E-001: Repository Structure & Documentation Framework

- ID: E-001
- Phase: 0
- Milestone: M-001
- Title: Repository Structure & Documentation Framework
- Status: **COMPLETED**
- Description: Canonical documentation framework including all project documents, directory structure, consistency audit, and document index.
- Roadmap Batches: RBATCH-001, RBATCH-002, RBATCH-003
- Depends On: none

---

#### E-002: Canonical Game Design Foundation

- ID: E-002
- Phase: 0
- Milestone: M-001
- Title: Canonical Game Design Foundation
- Status: **COMPLETED**
- Description: GDD, gameplay specification, progression design, economy rules, logistics design, world design, UI wireframes, and technical architecture documents.
- Roadmap Batches: RBATCH-001
- Depends On: none

---

### Phase 1 — First Playable Prototype

#### E-003: GDevelop Project Scaffold

- ID: E-003
- Phase: 1
- Milestone: M-002
- Title: GDevelop Project Scaffold
- Status: **COMPLETED**
- Description: GDevelop project file creation, three scene definitions, global variable scaffolding, external event-sheet bindings.
- Roadmap Batches: RBATCH-001, RBATCH-002
- Depends On: E-001

---

#### E-004: Asset Pipeline & Placeholder Assets

- ID: E-004
- Phase: 1
- Milestone: M-002
- Title: Asset Pipeline & Placeholder Assets
- Status: **COMPLETED**
- Description: Placeholder sprites, UI elements, and audio stubs organized into naming-compliant asset directories.
- Roadmap Batches: RBATCH-003
- Depends On: E-003

---

#### E-005: World Map & Environment

- ID: E-005
- Phase: 1
- Milestone: M-003
- Title: World Map & Environment
- Status: **COMPLETED**
- Description: GameWorld map composition, player start placement, building entities, and interaction-point definitions.
- Roadmap Batches: RBATCH-004
- Depends On: E-003, E-004

---

#### E-006: Player Movement & Camera

- ID: E-006
- Phase: 1
- Milestone: M-003
- Title: Player Movement & Camera
- Status: **COMPLETED**
- Description: Android-first tap-to-move input handling, player movement toward tapped world targets, camera follow behavior.
- Roadmap Batches: RBATCH-006
- Depends On: E-005

---

#### E-007: Order Generation System

- ID: E-007
- Phase: 1
- Milestone: M-004
- Title: Order Generation System
- Status: **COMPLETED**
- Description: Order creation event, canonical order-state initialization (Created→Available), and minimal accept trigger.
- Roadmap Batches: RBATCH-005
- Depends On: E-005

---

#### E-008: Pickup Proximity System

- ID: E-008
- Phase: 1
- Milestone: M-004
- Title: Pickup Proximity System
- Status: **COMPLETED**
- Description: Proximity-based order acceptance flow (Available→Accepted) and Accepted→PickedUp state transition.
- Roadmap Batches: RBATCH-007
- Depends On: E-007, E-006

---

#### E-009: Delivery Completion & Failure

- ID: E-009
- Phase: 1
- Milestone: M-004
- Title: Delivery Completion & Failure
- Status: **COMPLETED**
- Description: Destination validation, delivery completion event (PickedUp→Completed), failure path (PickedUp→Failed), terminal-state protection.
- Roadmap Batches: RBATCH-008
- Depends On: E-008

---

#### E-010: Economy & Reputation Core

- ID: E-010
- Phase: 1
- Milestone: M-005
- Title: Economy & Reputation Core
- Status: Planned — Not Started
- Description: Money reward and penalty application after delivery outcomes; reputation increase and decrease logic; affordability checks.
- Roadmap Batches: RBATCH-009
- Depends On: E-009

---

#### E-011: HUD & Notifications

- ID: E-011
- Phase: 1
- Milestone: M-005
- Title: HUD & Notifications
- Status: Planned — Not Started
- Description: Active-order HUD panel, Accept Order button, delivery status notifications, and HUD visibility rules.
- Roadmap Batches: RBATCH-010
- Depends On: E-010

---

#### E-012: MainMenu & Game Flow

- ID: E-012
- Phase: 1
- Milestone: M-005
- Title: MainMenu & Game Flow
- Status: Planned — Not Started
- Description: MainMenu scene with Start/Continue entry logic and new-game overwrite guard (save-guard dialog).
- Roadmap Batches: RBATCH-011
- Depends On: E-003

---

#### E-013: Company Management Scene

- ID: E-013
- Phase: 1
- Milestone: M-006
- Title: Company Management Scene
- Status: Planned — Not Started
- Description: CompanyManagement scene navigation and upgrade purchase flow with affordability enforcement.
- Roadmap Batches: RBATCH-012
- Depends On: E-010, E-011

---

#### E-014: Bicycle Ownership System

- ID: E-014
- Phase: 1
- Milestone: M-006
- Title: Bicycle Ownership System
- Status: Planned — Not Started
- Description: Bicycle ownership flag, speed effect application on player movement after bicycle acquisition.
- Roadmap Batches: RBATCH-013
- Depends On: E-013, E-006

---

#### E-015: Save & Load System

- ID: E-015
- Phase: 1
- Milestone: M-007
- Title: Save & Load System
- Status: Planned — Blocked (ODR-001, ODR-003)
- Description: Local device persistence: save-game serialization, deserialization, load validation, and autosave triggers.
- Roadmap Batches: RBATCH-014
- Owner Gates: ODR-001, ODR-003
- Depends On: E-013, E-014, E-012

---

#### E-016: Mobile Optimization

- ID: E-016
- Phase: 1
- Milestone: M-008
- Title: Mobile Optimization
- Status: Planned — Not Started
- Description: Mobile viewport scaling, touch interaction target sizing, performance optimization for Android-first build.
- Roadmap Batches: RBATCH-015
- Depends On: E-015

---

#### E-017: Full-Loop Integration Verification

- ID: E-017
- Phase: 1
- Milestone: M-008
- Title: Full-Loop Integration Verification
- Status: Planned — Not Started
- Description: Complete prototype gameplay loop integration test suite; release-checklist evidence package for owner review.
- Roadmap Batches: RBATCH-016, RBATCH-017
- Depends On: E-016

---

### Phase 2 — Company Management

#### E-018: Employee Management System

- ID: E-018
- Phase: 2
- Milestone: M-009
- Title: Employee Management System
- Status: Planned — Future
- Description: Employee hiring, salary deduction, and daily payroll calculations.
- Roadmap Batches: RBATCH-018
- Depends On: E-017

---

#### E-019: Financial Reporting & Daily Costs

- ID: E-019
- Phase: 2
- Milestone: M-009
- Title: Financial Reporting & Daily Costs
- Status: Planned — Future
- Description: Daily expense calculation, financial report display, and operational cost modeling.
- Roadmap Batches: RBATCH-019
- Depends On: E-018

---

#### E-020: Customer Reputation System

- ID: E-020
- Phase: 2
- Milestone: M-009
- Title: Customer Reputation System
- Status: Planned — Future
- Description: Customer review collection, reputation score display, and review impact on economy.
- Roadmap Batches: RBATCH-020, RBATCH-021
- Depends On: E-010

---

#### E-021: Vehicle Fleet Management

- ID: E-021
- Phase: 2
- Milestone: M-010
- Title: Vehicle Fleet Management
- Status: Planned — Future
- Description: Vehicle catalog and purchase UI, maintenance cost tracking, and Phase 2 integration verification.
- Roadmap Batches: RBATCH-022, RBATCH-023, RBATCH-024
- Depends On: E-019

---

### Phase 3 — Logistics Expansion

#### E-022: Warehouse Infrastructure

- ID: E-022
- Phase: 3
- Milestone: M-011
- Title: Warehouse Infrastructure
- Status: Planned — Future
- Description: Warehouse construction, inventory storage, and dispatch routing from warehouse locations.
- Roadmap Batches: RBATCH-025
- Depends On: E-021

---

#### E-023: Multi-District Map Expansion

- ID: E-023
- Phase: 3
- Milestone: M-011
- Title: Multi-District Map Expansion
- Status: Planned — Future
- Description: Additional city districts, expanded world map, and delivery zone boundary definitions.
- Roadmap Batches: RBATCH-026, RBATCH-027
- Depends On: E-022

---

#### E-024: Fleet Management System

- ID: E-024
- Phase: 3
- Milestone: M-012
- Title: Fleet Management System
- Status: Planned — Future
- Description: Fleet management dashboard with vehicle assignment, utilization tracking, and upgrade management.
- Roadmap Batches: RBATCH-028
- Depends On: E-023

---

#### E-025: Route Optimization Engine

- ID: E-025
- Phase: 3
- Milestone: M-012
- Title: Route Optimization Engine
- Status: Planned — Future
- Description: Automated route optimization, vehicle upgrade system, and Phase 3 integration verification.
- Roadmap Batches: RBATCH-029, RBATCH-030, RBATCH-031
- Depends On: E-024

---

### Phase 4 — Drone Technology

#### E-026: Drone Research & Technology Tree

- ID: E-026
- Phase: 4
- Milestone: M-013
- Title: Drone Research & Technology Tree
- Status: Planned — Future
- Description: Drone research progression system and technology unlock tree.
- Roadmap Batches: RBATCH-032
- Depends On: E-025

---

#### E-027: Drone Manufacturing Partners

- ID: E-027
- Phase: 4
- Milestone: M-013
- Title: Drone Manufacturing Partners
- Status: Planned — Future
- Description: Manufacturing partner integration for drone procurement.
- Roadmap Batches: RBATCH-033
- Depends On: E-026

---

#### E-028: DronePort Infrastructure System

- ID: E-028
- Phase: 4
- Milestone: M-014
- Title: DronePort Infrastructure System
- Status: Planned — Future
- Description: DronePort construction mechanics and operational management.
- Roadmap Batches: RBATCH-034
- Depends On: E-027

---

#### E-029: Battery Swapping Network

- ID: E-029
- Phase: 4
- Milestone: M-014
- Title: Battery Swapping Network
- Status: Planned — Future
- Description: Battery swapping station network for drone continuity operations.
- Roadmap Batches: RBATCH-035
- Depends On: E-028

---

#### E-030: Autonomous Delivery System

- ID: E-030
- Phase: 4
- Milestone: M-015
- Title: Autonomous Delivery System
- Status: Planned — Future
- Description: Fully autonomous drone delivery execution without manual player direction.
- Roadmap Batches: RBATCH-036
- Depends On: E-029

---

#### E-031: Flight Restrictions & Weather

- ID: E-031
- Phase: 4
- Milestone: M-015
- Title: Flight Restrictions & Weather
- Status: Planned — Future
- Description: Flight restriction zones, weather effects on drone operations, and Phase 4 integration verification.
- Roadmap Batches: RBATCH-037, RBATCH-038
- Depends On: E-030

---

### Phase 5 — Advanced Economy

#### E-032: Dynamic Market System

- ID: E-032
- Phase: 5
- Milestone: M-016
- Title: Dynamic Market System
- Status: Planned — Future
- Description: Dynamic market price fluctuations, inflation modeling, and demand-driven pricing.
- Roadmap Batches: RBATCH-039
- Depends On: E-031

---

#### E-033: Fuel & Electricity Economy

- ID: E-033
- Phase: 5
- Milestone: M-016
- Title: Fuel & Electricity Economy
- Status: Planned — Future
- Description: Fuel price modeling and electricity cost mechanics for drone operations.
- Roadmap Batches: RBATCH-039
- Depends On: E-032

---

#### E-034: Business Loans & Investors

- ID: E-034
- Phase: 5
- Milestone: M-017
- Title: Business Loans & Investors
- Status: Planned — Future
- Description: Business loan system with repayment mechanics and investor relationship management.
- Roadmap Batches: RBATCH-040
- Depends On: E-032

---

#### E-035: Competition & Market Rivals

- ID: E-035
- Phase: 5
- Milestone: M-017
- Title: Competition & Market Rivals
- Status: Planned — Future
- Description: Competitor company AI, market rivalry mechanics, and advanced economy integration verification.
- Roadmap Batches: RBATCH-041
- Depends On: E-034

---

### Phase 6 — Artificial Intelligence

#### E-036: Smart Routing & Predictive Demand

- ID: E-036
- Phase: 6
- Milestone: M-018
- Title: Smart Routing & Predictive Demand
- Status: Planned — Future
- Description: AI-driven route optimization and predictive demand modeling for order management.
- Roadmap Batches: RBATCH-042
- Depends On: E-035

---

#### E-037: AI Dispatch & Autonomous Fleet

- ID: E-037
- Phase: 6
- Milestone: M-018
- Title: AI Dispatch & Autonomous Fleet
- Status: Planned — Future
- Description: Dynamic pricing AI, autonomous fleet management system, and AI dispatch center.
- Roadmap Batches: RBATCH-042
- Depends On: E-036

---

## Epic Dependency Summary

All epic dependencies are forward-compatible with the milestone dependency chain. No cycles exist. Phases 7–9 epics are deferred to future planning iterations.

---

End of Document
