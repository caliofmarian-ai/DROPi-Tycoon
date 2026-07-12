# Document Information

Document: PROTOTYPE_TECH_STACK.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Development Decision
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-12

---

# Prototype Technology Stack

## Purpose

This document defines the technology choices for DROPi Tycoon Prototype v0.1.

The goal is to select tools that allow fast development, easy iteration, and future expansion.

---

# Technology Decision

## Game Engine

Selected Engine:

GDevelop

---

# Reason For Selection

GDevelop was selected because it supports the project goals:

- Mobile-first development
- Fast prototyping
- Visual event system
- Low programming barrier
- Browser-based workflow
- Suitable for 2D simulation games

---

# Target Platform

Primary Target:

Android Mobile

Future Targets:

- iOS
- Web
- Desktop

---

# Game Type

Prototype Type:

2D Top-Down Tycoon Simulation

The first version focuses on:

- Management
- Delivery gameplay
- Company progression
- Strategic decisions

---

# Development Approach

The prototype will use:

- Visual event logic
- Modular game objects
- Data-driven systems
- Simple simulation rules

---

# Project Structure

Initial structure:

```
DROPi_Tycoon/

Scenes/
  MainMenu
  GameWorld
  CompanyManagement

Objects/
  Player
  Vehicle
  Customer
  Building
  Package

Systems/
  Orders
  Economy
  Progression
  UI

Assets/
  Sprites
  Audio
  UI

Data/
  Configuration
  Balancing
```

---

# Development Principles

## Prototype First

The first goal is a playable experience.

Not:

- Perfect graphics
- Complex simulation
- Advanced AI

---

## Simple Systems

Every system should be easy to understand and modify.

---

## Mobile Optimization

The game should consider:

- Touch controls
- Performance limitations
- Small screens
- Simple interfaces

---

# AI Assisted Development

AI tools may assist with:

- Game design
- Logic planning
- Documentation
- Event system creation
- Testing ideas

AI should follow project documentation.

---

# MVP Technical Scope

Prototype v0.1 requires:

- One playable map
- Basic delivery mechanic
- Simple economy
- Basic upgrades
- Mobile interface

---

# Future Technology Expansion

Possible future improvements:

- Advanced simulation
- More complex AI
- Larger worlds
- Multiplayer systems

These are not part of Prototype v0.1.

---

# Canonical Rule

Technology choices must serve gameplay.

The engine is a tool to create the DROPi Tycoon experience, not the objective itself.

---

End of Document