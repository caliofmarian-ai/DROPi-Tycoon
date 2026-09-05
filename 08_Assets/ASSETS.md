# Document Information

Document: ASSETS.md
Project: DROPi Tycoon
Version: 1.1.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-05

---

# Game Assets System

## Purpose

This document defines the asset management system and approved product-identity direction of DROPi Tycoon.

Assets represent all visual, audio, and interactive resources used to create the game experience.

The asset system ensures consistency, organization, future scalability, and traceability between owner-approved visual references and runtime implementation.

---

# Asset Philosophy

Assets should support gameplay, readability, character, and immersion.

Every asset should have a clear purpose.

DROPi Tycoon is game-first. The visual identity must make the installed application feel like a deliberate game product rather than a technical prototype, browser wrapper, generic business dashboard, or developer utility.

The goal is not unnecessary visual complexity. The goal is a coherent, enjoyable simulation where the player can see the company, people, vehicles, marketplace and infrastructure they are building.

---

# Approved Product Identity — 2026-09-05

The Project Owner approved the current colorful DROPi Tycoon identity and explicitly instructed the project to use the already-generated approved images rather than generate additional alternatives for the current adoption step.

The approved visual language includes:

- a bold, friendly `DROPi Tycoon` game wordmark;
- the `O` / location-pin visual language;
- city and local-business imagery;
- drone delivery as a major recognizable capability;
- parcel/logistics imagery;
- bright blue/cyan as a core technology/route color;
- green as growth/community/success language;
- gold/orange as value, progression and premium/reward language;
- dark/deep-blue support surfaces for contrast;
- an optimistic, approachable tycoon-game style rather than photorealistic corporate presentation.

The approved identity should become the basis for:

- Android application icon;
- splash/loading presentation;
- main-menu branding;
- future in-game buttons/cards/HUD accents;
- future marketplace, DronePort, vehicle and employee presentation.

The owner decision is recorded in `09_Development/Owner_Directives/2026-09-05_MASTER_OWNER_DIRECTIVE_002_Product_Identity_and_Visible_Operations.md`.

---

# Approved Production Asset Set

The current owner-approved production identity files are:

| Asset | Intended repository/runtime role | SHA-256 |
|---|---|---|
| `dropi-tycoon-logo.png` | DROPi Tycoon logo / wordmark source | `3aa62f1c6f38d06d52403477ff796665428a55178f5e3a975f38b527f7654616` |
| `dropi-tycoon-app-icon.png` | Android / store application icon source | `f02072f431e93cb822afa40b177f07e1540e539998a3e662b6e8bcfed61fc24f` |
| `dropi-tycoon-splash.jpg` | installed-app splash/loading artwork source | `0524e0a265e5a775d8ae1c6a5ec36f00f7511d9fa548d09ce21054e550ad485c` |

The mobile application copies belong under:

```text
game-mobile/assets/branding/
```

Runtime-specific derivatives may be created from these approved sources when required by platform dimensions or compression, but the visual identity must not be silently redesigned during optimization.

---

# Approved Simulation Reference Set

The following owner-approved reference boards are directional references rather than literal final screenshots:

| Reference | Purpose | SHA-256 |
|---|---|---|
| `dropi-tycoon-brand-concept-e.jpg` | ecosystem identity: marketplace + drones + community + future token direction | `f00e587cf4211f9b352a657bc8bc8f195be0ffab4a678662404f762de4216c71` |
| `delivery-progression-reference.jpg` | visible delivery progression: on foot → bicycle → motorbike → car → van → DronePort/drone operations | `8a6a869dedff04ad670d7650a7cccd4b89aedc2d04e98deca739be1bd67122a3` |
| `dropi-port-employee-activity-reference.jpg` | visible DronePort interior and employee operational activity | `40a9140f71407ab583c192ac4c97d0cbfa97685ce5704bf9a7c62e95efc576ff` |

Reference copies belong under:

```text
08_Assets/Approved_References/
```

These boards guide visual design and communicate owner intent. They do not by themselves authorize out-of-sequence gameplay mechanics, real-world financial functionality, or hardcoded systems.

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
- Brand/logo assets
- Marketplace and DronePort visual assets

---

# World Assets

## Purpose

Create the playable environment.

Examples:

- Roads
- Houses
- Shops
- Warehouses
- Marketplace locations
- DronePorts
- Trees
- Urban elements

World assets should support map readability and make business activity visible.

---

# Vehicle Assets

## Purpose

Represent transportation systems and make ownership/progression recognizable.

Examples:

- On-foot courier representation
- Bicycle
- Scooter / motorbike
- Car
- Van
- Drone
- Future logistics vehicles

Vehicles should communicate their gameplay role visually. The long-term implementation should not use one generic placeholder representation for every transportation mode.

Detailed progression behavior remains owned by gameplay/logistics canon.

---

# Character Assets

## Purpose

Represent people inside the simulation.

Examples:

- Customers
- Employees
- Business owners
- Couriers
- Drone operators
- Dispatch and facility staff

Characters should support world immersion. Employees should eventually have visible work/activity representation rather than existing only as statistics or menu rows.

Detailed employee AI and scheduling remain owned outside this asset document.

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
- Logo and branded menu treatments

UI assets should prioritize clarity while sharing one recognizable DROPi Tycoon visual language.

---

# Audio Assets

## Purpose

Create atmosphere, game feel and immediate feedback.

Includes:

- Background music
- UI interaction sounds
- Order acceptance sounds
- Delivery success/failure sounds
- Reward/money sounds
- Hiring/onboarding sounds
- Warning/error sounds
- Vehicle/drone activity sounds
- Environment/marketplace ambience

The Project Owner identified the current silent experience as a product-quality gap. Audio is therefore an explicit future product-experience requirement, although audio implementation remains separately scoped.

---

# Animation Assets

## Purpose

Create movement and life.

Examples:

- Vehicle movement
- Walking/cycling/riding character animation
- Drone flight
- Delivery actions
- Employee facility activity
- Interface transitions

---

# Asset Organization

Asset categories are engine-agnostic. Physical storage follows the active runtime architecture.

Current active locations include:

```text
game-web/
    public/ or runtime asset locations used by the authoritative Phaser game

game-mobile/
    assets/branding/    installed Android shell branding, icon and splash sources

08_Assets/
    Approved_References/    owner-approved design/reference boards
```

Historical GDevelop asset layout remains historical/reference material and does not override the active Phaser + installed-mobile architecture.

When an asset is duplicated for runtime reasons, the derivative should preserve a traceable name or checksum relationship to its approved source.

---

# Asset Naming Rules

Assets should use clear names.

Good examples:

```text
vehicle_bicycle_basic
dropi-tycoon-app-icon.png
drone_delivery_basic
employee_dispatcher_idle
```

Bad example:

```text
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
- Suitable for the approved game style
- Legible at mobile sizes
- Traceable to an approved source when derived

---

# MVP / Current Foundation Asset Scope

The playable foundation requires:

- readable map/world assets;
- recognizable buildings;
- visible transport/player representation;
- mobile-friendly UI elements;
- branded application identity;
- essential audio feedback as the product-experience layer matures.

Prototype scope may use temporary placeholders, but placeholders are not the final quality bar.

---

# Future Expansion

Possible future asset systems:

- Detailed city environments
- Advanced character models
- Drone animations
- DronePort interiors and operational animation
- Visible employee work states
- Marketplace activity
- Weather effects
- Richer lighting and transitions
- Audio/music layers

---

# Asset Management Rules

Before adding or generating new assets, check:

- Is the asset needed?
- Does it improve gameplay or product identity?
- Does it match the approved visual direction?
- Does an approved usable asset already exist?

Do not generate replacement concepts merely because a new AI session starts. Reuse approved assets unless the Project Owner requests a new direction.

---

# Canonical Rule

Assets exist to support the simulation experience.

A good asset improves understanding, immersion, game feel and gameplay value.

**The player should be able to see the company and ecosystem they are building, not only read their state in menus.**

---

End of Document