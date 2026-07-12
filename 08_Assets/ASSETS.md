# Document Information

Document: ASSETS.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-12

---

# Game Assets System

## Purpose

This document defines the asset management system of DROPi Tycoon.

Assets represent all visual, audio, and interactive resources used to create the game experience.

The asset system ensures consistency, organization, and future scalability.

---

# Asset Philosophy

Assets should support gameplay and immersion.

Every asset should have a clear purpose.

The goal is not to create unnecessary visual complexity, but to build a clear and enjoyable simulation environment.

---

# Asset Categories

The game contains several asset categories.

---

# Visual Assets

## Purpose

Define the visual appearance of the game world.

Includes:

- Buildings
- Vehicles
- Characters
- Environment elements
- Icons
- Interface graphics

---

# World Assets

## Purpose

Create the playable environment.

Examples:

- Roads
- Houses
- Shops
- Warehouses
- Trees
- Urban elements

World assets should support map readability.

---

# Vehicle Assets

## Purpose

Represent transportation systems.

Examples:

- Bicycle
- Scooter
- Van
- Drone
- Future logistics vehicles

Vehicles should communicate their gameplay role visually.

---

# Character Assets

## Purpose

Represent people inside the simulation.

Examples:

- Customers
- Employees
- Business owners

Characters should support world immersion.

---

# UI Assets

## Purpose

Support player interaction.

Examples:

- Buttons
- Icons
- Panels
- Indicators
- Notifications

UI assets should prioritize clarity.

---

# Audio Assets

## Purpose

Create atmosphere and feedback.

Includes:

- Background music
- Sound effects
- Interaction sounds
- Environment sounds

---

# Animation Assets

## Purpose

Create movement and life.

Examples:

- Vehicle movement
- Character animations
- Delivery actions
- Interface transitions

---

# Asset Organization

Assets should follow a clear structure.

The physical GDevelop project folder topology is canonically defined in:

`09_Development/GDEVELOP_PROJECT_STRUCTURE.md`

The canonical GDevelop asset folders are:

```
Assets/

    Sprites
    Audio
    UI
```

Conceptual asset categories (Visual Assets, World Assets, Vehicle Assets, Character Assets, UI Assets, Audio Assets, Animation Assets) are classifications used for asset planning and communication. They are not additional physical folder hierarchies. All physical assets are placed inside the canonical folders above.

Note: Visual, World, Vehicle, and Character assets are stored under `Assets/Sprites`. UI assets are stored under `Assets/UI`. Audio assets are stored under `Assets/Audio`.

---

# Asset Naming Rules

Assets should use clear names.

Good example:

```
vehicle_bicycle_basic
```

Bad example:

```
object123_final2
```

Naming should describe:

- Object type
- Function
- Version if necessary

---

# Asset Quality Principles

Assets should be:

- Consistent
- Optimized
- Easy to identify
- Suitable for the game style

---

# MVP Asset Scope

The first playable version requires:

- Basic map assets
- Simple buildings
- Basic vehicles
- Minimal UI elements
- Essential sounds

The focus is gameplay, not visual perfection.

---

# Future Expansion

Possible future asset systems:

- Detailed city environments
- Advanced character models
- Drone animations
- Weather effects
- Custom visual styles

---

# Asset Management Rules

Before adding new assets:

Check:

- Is the asset needed?
- Does it improve gameplay?
- Does it match the visual direction?

Avoid unnecessary asset creation.

---

# Canonical Rule

Assets exist to support the simulation experience.

A good asset improves understanding, immersion, and gameplay value.

---

End of Document