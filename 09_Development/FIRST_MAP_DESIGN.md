# Document Information

Document: FIRST_MAP_DESIGN.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Prototype Design
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-12

---

# First Map Design

## Purpose

This document defines the first playable map of DROPi Tycoon Prototype v0.1.

The purpose of the first map is to provide a small environment where the player can learn and experience the core delivery gameplay loop.

The map should prioritize:

- Clear navigation
- Simple decisions
- Fast gameplay feedback

---

## Scope and Ownership

This document defines the Prototype v0.1 first map implementation. Map design principles and canonical zone/location definitions are owned by `04_World/MAP.md` and `04_World/BUILDINGS.md`. This document narrows those canonical definitions to the prototype scope.

---

# Map Concept

The first map represents a small urban neighborhood where a new delivery company begins operations.

The player starts with limited territory and gradually expands.

---

# Map Style

## Type

2D Top-Down Simulation Map

---

## Scale

Small prototype area.

The map should be large enough to create movement decisions but small enough for quick testing.

---

# Initial Map Layout

The map contains:

```
+---------------------------+

| Residential Area          |
|                           |
|     Customer Homes        |
|                           |
|---------------------------|
|                           |
| Company Base              |
|                           |
|---------------------------|
|                           |
| Shops and Businesses      |
|                           |
|---------------------------|
|                           |
| Delivery Locations        |
|                           |

+---------------------------+
```

---

# Main Locations

## Company Base

Purpose:

The player's starting location.

Contains:

- Company building
- Upgrade interface
- Management access

---

## Residential Area

Purpose:

Main customer delivery area.

Contains:

- Houses
- Customers
- Delivery destinations

---

## Business Area

Purpose:

Order generation.

Contains:

- Restaurants
- Shops
- Small businesses

---

## Storage / Pickup Area

Purpose:

Starting point for packages.

Contains:

- Package collection
- Order preparation

---

# Map Objects

Prototype objects:

## Buildings

- Company office
- Houses
- Shops
- Small businesses

---

## Environment

- Roads
- Sidewalks
- Trees
- Decorative objects

---

## Interactive Objects

- Delivery points
- Pickup points
- Upgrade locations

---

# Navigation Design

Navigation clarity principles are derived from `04_World/MAP.md` (Map Philosophy). The specific prototype implementation applies these principles to the Prototype v0.1 map.

The player should always understand:

- Where they are
- Where the package is
- Where the destination is

Visual guidance:

- Clear icons
- Simple markers
- Short routes

---

# First Delivery Route

The first delivery should be:

Short distance.

Example:

```
Business
    |
    |
Company Area
    |
    |
Customer Home
```

The player learns the complete delivery cycle quickly.

---

# Expansion Preparation

The first map should allow future growth.

Possible future additions:

- New districts
- Warehouses
- DronePorts
- Transportation networks

---

# MVP Map Requirements

The first version requires only:

- One small map
- Basic buildings
- Delivery points
- Player starting location

---

# Performance Requirements

The map must be optimized for mobile devices.

Avoid:

- Excessive objects
- Heavy animations
- Unnecessary details

---

# Design Principles

These principles are derived from `04_World/MAP.md` (Balance Principles and Map Philosophy).

The first map must be:

- Easy to understand
- Fun to explore
- Expandable
- Optimized

---

# Canonical Rule

The first map exists to teach and validate the core delivery experience.

It is the foundation of the future DROPi Tycoon world.

---

End of Document