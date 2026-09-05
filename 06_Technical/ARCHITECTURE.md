# Document Information

Document: ARCHITECTURE.md
Project: DROPi Tycoon
Version: 1.2.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-05

---

# Game Architecture

## Purpose

This document defines the technical architecture of DROPi Tycoon.

The architecture describes how game systems are organized, how they communicate, and how the simulation is built.

The goal is to create a scalable game structure that supports future expansion while keeping the first playable version simple.

---

# Architecture Philosophy

DROPi Tycoon follows a modular game architecture.

Each major gameplay system should be independent but able to communicate with other systems.

The architecture must support:

- Easy development
- Safe modifications
- Future expansion
- Testing
- AI-assisted development

---

# Core Architecture Layers

The game is organized into several main layers.

---

# Game Core Layer

## Purpose

The foundation of the game.

Responsibilities:

- Game state management
- Time progression
- Core rules
- System coordination

The Game Core does not contain specific gameplay features.

It provides the environment where systems operate.

---

# Simulation Layer

## Purpose

Controls the living simulation.

Includes:

- World simulation
- Economy simulation
- Customer behavior
- Business activity
- Events

The simulation layer creates the game world behavior.

---

# Gameplay Systems Layer

## Purpose

Contains the main player-facing mechanics.

Examples:

- Logistics system
- Vehicle system
- Order system
- Company management
- Expansion system

---

# World Layer

## Purpose

Controls the game environment.

Includes:

- Map
- Buildings
- NPCs
- Weather
- Zones

---

# AI Layer

## Purpose

Provides intelligent behaviors and assistance.

Includes:

- Simulation AI
- Recommendation systems
- Future automation systems

---

# User Interface Layer

## Purpose

Provides player interaction.

Includes:

- Menus
- Information panels
- Management screens
- Notifications

The UI should display information without controlling core logic.

---

# Data Layer

## Purpose

Stores game information.

Examples:

- Player progress
- Company state
- World state
- Settings

## Save System

Game-state persistence is owned by the Save System.

The Save System defines what data is persisted, when saves occur, how the game loads, and how corrupted or missing saves are handled.

See `06_Technical/SAVE_SYSTEM.md` for the canonical Save & Load specification.

## Safe System

Development and project-level safety and stability governance is owned by the Safe System.

See `06_Technical/SAFE_SYSTEM.md` for development safety rules.

---

# Mobile Application Layer

## Purpose

Hosts the authoritative game runtime inside the installed mobile product.

Responsibilities include:

- native application startup and lifecycle;
- device orientation and immersive presentation;
- safe-area and Android system-bar handling;
- platform Back behavior;
- native packaging and distribution;
- platform integration required by future mobile features.

The Mobile Application Layer must not become a duplicate gameplay implementation.

The authoritative game simulation remains owned by the game runtime and domain systems.

See `06_Technical/MOBILE_APPLICATION_PLATFORM.md` for the canonical platform/runtime specification and current approved implementation baseline.

---

# System Communication

Game systems communicate through defined interfaces.

Example:

Order System

↓

Logistics System

↓

Vehicle System

↓

World System

↓

Economy System

---

Systems should avoid direct dependency whenever possible.

---

# Game Loop Architecture

The main game loop manages:

1. Input processing

2. Simulation update

3. System calculations

4. World updates

5. Rendering

6. Player feedback

---

# MVP Architecture Scope

The first playable version includes:

- Basic game core
- Simple simulation loop
- Basic world
- Delivery gameplay
- Economy feedback
- Simple UI

Advanced architecture is introduced only when required.

---

# Expansion Strategy

Future systems can be added as independent modules.

Examples:

- Drone network
- Advanced AI
- Multiple cities
- Multiplayer features
- Complex economy

---

# Development Principles

The architecture must follow:

## Simplicity

Do not build systems before gameplay requires them.

---

## Modularity

Systems should be replaceable and expandable.

---

## Stability

Changes in one system should not break unrelated systems.

---

## Testability

Important systems must be easy to verify.

---

# Canonical Rule

DROPi Tycoon architecture is designed for a simulation game.

Every technical decision must support gameplay, performance, maintainability, mobile product quality, and future expansion.

---

# Mobile-First Application Architecture

DROPi Tycoon is built and judged primarily as an installed mobile game, beginning with Android.

The primary platform chain is:

```text
GitHub
→ Authoritative Game Runtime
→ Mobile Application Shell
→ Android Development / Release Build
→ Installed Android Game
→ Google Play Distribution
```

A secondary web chain remains supported:

```text
GitHub
→ Web Build
→ Railway Deployment
→ Browser Preview / Smoke Test
```

**Key decisions:**

- The installed mobile application is the primary player-facing and Project Owner review surface.
- The browser is a secondary development, preview, diagnostics, and smoke-test surface rather than the final gameplay quality bar.
- The authoritative game runtime owns gameplay, rendering, world state, economy, employees, reviews, vehicles, and related simulation rules.
- The mobile application shell owns native lifecycle, orientation, fullscreen/system UI handling, packaging, and native platform integration.
- Mobile migration must not silently create a second gameplay implementation.
- Railway remains valuable infrastructure but is not the permanent primary runtime dependency for normal production game startup.
- Google Play remains the target Android distribution channel.

## Current Runtime Baseline

The current approved game runtime is Phaser.

The approved mobile migration baseline uses an Expo / React Native shell, Expo development builds, EAS Build, and a first-stage WebView bridge to host the Phaser runtime without rewriting the game.

The first development stage may load the Railway-hosted runtime for rapid iteration. The production target is to package the game runtime with the mobile application so the installed game does not depend on browser chrome or the public Railway page for normal startup.

Technology substitutions remain possible, but material replacement of the approved runtime/platform baseline requires explicit Project Owner approval and canonical documentation updates before migration.

See `06_Technical/MOBILE_APPLICATION_PLATFORM.md` for the full ownership boundaries, camera/viewport requirements, AI continuity rules, and change control.

See `00_Project/VISION.md` for the strategic mobile-first direction and the relationship between DROPi Tycoon and the real DROPi ecosystem.

Historical Web-First migration reports remain historical records and must not override the current canonical direction.

---

# Owner-Maintainability Architecture Principle

The architecture must support project continuity without depending on proprietary tools, single agents, or undocumented knowledge.

Platform decisions that materially affect future sessions must be recorded in canonical repository documentation rather than existing only in chat history.

See `06_Technical/SAFE_SYSTEM.md` for the full Owner-Maintainability principle.

---

End of Document