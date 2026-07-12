# Document Information

Document: ASSET_IMPORT_GUIDE.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Prototype Technical Design
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-12

---

# Asset Import Guide

## Purpose

This document defines the process for importing and managing assets inside the DROPi Tycoon GDevelop project.

The goal is to keep assets organized, optimized, and easy to replace during development.

---

# Asset Philosophy

During Prototype v0.1, assets exist to support gameplay testing.

The priority order is:

1. Functionality
2. Clarity
3. Performance
4. Visual quality

---

# Asset Categories

The project uses the following asset groups:

```
Assets/

Sprites/

    Characters
    Buildings
    Vehicles
    Objects

UI/

    Buttons
    Icons
    Panels

Audio/

    Music
    Effects

Backgrounds/

    Maps
    Environment
```

---

# Prototype Asset Requirements

The first prototype requires only essential assets.

---

# Character Assets

Required:

## Player Character

Purpose:

Represents the company owner.

Needs:

- Idle image
- Movement image

---

# Building Assets

Required:

## Company Building

Purpose:

Player headquarters.

---

## Customer Buildings

Examples:

- Houses
- Shops
- Restaurants

---

# Object Assets

Required:

## Package

Purpose:

Represents delivery item.

---

## Delivery Marker

Purpose:

Shows:

- Pickup location
- Destination

---

# Vehicle Assets

Prototype:

Optional.

Future:

- Bicycle
- Van
- Drone

---

# UI Assets

Required:

## Buttons

Examples:

- Accept Order
- Upgrade
- Deliver

---

## Icons

Examples:

- Money
- Package
- Location
- Company level

---

# Asset Naming Rules

Use descriptive names.

Good:

```
player_character_idle

building_company_small

icon_money
```

Bad:

```
image1

sprite_final

new_asset
```

---

# Asset Optimization Rules

Assets should consider mobile performance.

Avoid:

- Extremely large images
- Unnecessary animations
- Heavy effects

---

# Temporary Assets

During development it is acceptable to use:

- Placeholder graphics
- Simple shapes
- Basic icons

Gameplay has priority over appearance.

---

# Import Process

For every new asset:

1. Add asset to correct folder.
2. Use clear naming.
3. Configure size.
4. Test performance.
5. Replace placeholders when necessary.

---

# Asset Replacement Strategy

Prototype assets should be easy to replace.

Example:

A temporary building sprite can later be replaced without changing gameplay logic.

---

# Future Asset Expansion

Possible additions:

- Detailed city environments
- Character animations
- Drone models
- Weather effects
- Visual themes

---

# Mobile Performance Rules

Target:

Smooth gameplay on average smartphones.

Consider:

- Number of objects
- Image resolution
- Animation complexity

---

# Canonical Rule

Assets support gameplay.

A simple working game with basic graphics is better than beautiful graphics without gameplay.

---

End of Document