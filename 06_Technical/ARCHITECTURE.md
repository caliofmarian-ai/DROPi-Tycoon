# Document Information

Document: ARCHITECTURE.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-12

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

Every technical decision must support gameplay, performance, maintainability, and future expansion.

---

End of Document