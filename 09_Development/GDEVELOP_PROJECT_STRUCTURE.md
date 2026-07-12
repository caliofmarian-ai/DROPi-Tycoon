# Document Information

Document: GDEVELOP_PROJECT_STRUCTURE.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Prototype Technical Design
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-12

---

# GDevelop Project Structure

## Purpose

This document defines the internal structure of the DROPi Tycoon project inside GDevelop.

The goal is to keep the project organized, modular, and easy to expand.

---

# Project Organization Philosophy

The project should be organized by gameplay responsibility.

Each component should have a clear purpose.

Avoid placing all logic in one scene or one event sheet.

---

# Main Project Structure

Recommended structure:

```
DROPi_Tycoon/

Scenes/

    MainMenu
    GameWorld
    CompanyManagement


Objects/

    Player
    Package
    Vehicle
    Building
    Customer
    DeliveryPoint


Events/

    PlayerEvents
    OrderEvents
    DeliveryEvents
    EconomyEvents
    UIEvents


Variables/

    PlayerData
    CompanyData
    WorldData
    GameSettings


Assets/

    Sprites
    Audio
    UI


ExternalEvents/

    OrderSystem
    EconomySystem
    ProgressionSystem

```

---

# Scenes

## MainMenu

Purpose:

The starting screen.

Contains:

- Start game
- Settings
- Information

---

## GameWorld

Purpose:

Main gameplay scene.

Contains:

- Map
- Player
- Buildings
- Delivery locations
- Orders

---

## CompanyManagement

Purpose:

Management interface.

Contains:

- Company information
- Upgrades
- Economy overview

---

# Objects

## Player

Responsibilities:

- Movement
- Interaction
- Position tracking

---

## Package

Responsibilities:

- Package state
- Pickup status
- Delivery status

---

## Building

Responsibilities:

- Location identity
- Interaction points

---

## Customer

Responsibilities:

- Order requests
- Satisfaction values

---

## DeliveryPoint

Responsibilities:

- Pickup location
- Destination location

---

# Event Organization

## PlayerEvents

Contains:

- Movement logic
- Interaction detection

---

## OrderEvents

Contains:

- Order creation
- Order acceptance
- Order states

---

## DeliveryEvents

Contains:

- Pickup
- Transport
- Completion

---

## EconomyEvents

Contains:

- Money changes
- Rewards
- Costs

---

## UIEvents

Contains:

- Information display
- Notifications

---

# Variable System

## Player Variables

Examples:

- Position
- Current order
- Inventory

---

## Company Variables

Examples:

- Money
- Reputation
- Level

---

## World Variables

Examples:

- Available orders
- Active locations

---

# Development Rules

## Keep Logic Separated

Example:

Delivery logic should not be inside UI events.

---

## Use Named Variables

Avoid:

```
Variable1
Variable2
```

Prefer:

```
CompanyMoney
CurrentOrder
DeliveryStatus
```

---

## Build Small Systems

Each system should be testable independently.

---

# MVP Implementation Order

1. Create project structure
2. Create GameWorld scene
3. Add player movement
4. Add delivery locations
5. Add order system
6. Add reward system
7. Add upgrades

---

# Future Expansion Compatibility

This structure allows adding:

- Vehicles
- Drone systems
- AI assistants
- Multiple cities
- Advanced economy

without rebuilding the foundation.

---

# Canonical Rule

The GDevelop project structure must remain simple, modular, and focused on gameplay.

Organization exists to make development easier, not more complicated.

---

End of Document