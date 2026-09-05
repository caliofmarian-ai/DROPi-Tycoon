# Document Information

Document: GAMEPLAY.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-07-12

---

# Gameplay Design

## Urban RPG direction — owner decision, 2026-09-05

The active gameplay direction is Urban RPG + Business Tycoon + Local Marketplace
+ Multimodal Logistics + Future Drone Network Simulation. The player is a person,
not a map cursor. Free-map straight-line terrestrial traversal is deprecated.
Phaser 3 + TypeScript + Vite in `game-web/` remains authoritative; the installed
Expo/React Native Android landscape shell hosts it, rather than reimplementing it.

The first neighborhood supports direct directional movement, collision, a follow
camera, minimap, physical HQ, merchant onboarding, parcel pickup and delivery.
Walking and an owned bicycle are embodied transport choices. Progression extends
to scooter/motorcycle, car, van, then separately operated drones. A transport
profile includes range, capacity, operating cost and eligible mission modes, not
merely speed. Larger transport and multi-stop workflows remain foundations.

The HQ is one evolving facility: local office and parcel staging first, then
administration, marketplace coordination, employees, sorting, terrestrial dispatch,
maintenance, batteries, charging, lockers and drone launch/recovery. Future
employees are assigned to physical activity locations. A locked expansion marker
communicates this future without implying that drone operations are playable.

### Source authority and transformation

REAL DROPi CONCEPT → GENERIC SIMULATION MODEL → TYCOON GAMEPLAY ABSTRACTION.
The real ecosystem remains authoritative in `caliofmarian-ai/dropi-mobile`.
Runtime code, backend integration and production schemas are not imported.
Primary sources outrank derived blueprints; roadmap entries are not deployed facts.

Textual sources inspected for this sprint in `caliofmarian-ai/dropi-mobile`:

- `DROPi_Canonical_Reference/README_FOR_DROPi_TYCOON.md`
- `DROPi_Canonical_Reference/CANONICAL_KNOWLEDGE_INDEX.md`
- `DROPi_Canonical_Reference/CANONICAL_MANIFEST.md` (relevant authority entries)
- `DROPi_Canonical_Reference/03_Logistics/Delivery/DELIVERY_MULTIMODAL.md`
- `DROPi_Canonical_Reference/02_Architecture/Historical_Archive/SYSTEM_ARCHITECTURE.md`
- `DROPi_Canonical_Reference/02_Architecture/Blueprint/DROPi_6_LAYERS_EXPLAINED.md`
- `DROPi_Canonical_Reference/01_Vision/Recovered_04_ZIP/02_VOLUME_I_STRATEGY/Cap_03_Solution_Overview.md`
- `canonical-structure.md`
- `app/(tabs)/droneport.tsx`
- `shared/types.ts`
- `docs/planning/IMPLEMENTATION_COVERAGE_AUDIT.md`
- `BLUEPRINT/DROPi_ROADMAP_BY_LAYERS.md` (physical-core planning sections)

**REAL DROPi FACTS USED:** multimodal delivery includes terrestrial modes and
merchant → DronePort → client transfers. The multimodal reference defines
DronePorts as consolidation points, logistics buffers and transfer hubs;
failed drone reception triggers fallback. Marketplace listings do not guarantee
drone delivery. App orchestration is distinct from marketplace requests.

**Authority limits:** historical architecture describes reception, transfer,
batteries, physical audit and non-drone fallback, not proof of live operation.
The current DronePort screen contains demo station values; these are not canonical
capacity limits. Shared types do not establish fixed/mobile taxonomy, lockers or
complete custody rules. The derived roadmap marks live capacity, waiting-parcel
buffers and terrestrial fallback automation as planned work.

**NOT DIRECTLY INSPECTED:** all binary source documents and approved images.
The manifest/index identify primary DronePort material under
`DROPi_Canonical_Reference/04_DronePorts/MasterPlan/02_PRODUS & TEHNOLOGIE/`,
including `09_INFRASTRUCTURA DRONEPORT -STANDARD^LJ HARDWARE-J SOFTWARE-J PROCEDURI.docx`
and the chapter-9 audit/annex documents. Their contents are not inferred from their
names. No official real-world fixed/mobile classifications or service radii are
claimed from uninspected material.

The owner-approved target art paths remain:
`08_Assets/Approved_References/dropi-tycoon-brand-concept-e.jpg`,
`08_Assets/Approved_References/delivery-progression-reference.jpg`, and
`08_Assets/Approved_References/dropi-port-employee-activity-reference.jpg`.
Their approval is accepted by owner declaration; no binary inspection, new AI art
or literal reference-image gameplay backgrounds are required.

### TYCOON GAMEPLAY ABSTRACTIONS

- One local merchant demonstrates physical shop/NPC → onboarding → digital listing
  eligibility → delivery demand. This is not the real marketplace onboarding process.
- Central transport profiles use game-space distances, capacities and costs, not
  asserted real DROPi operating values. Existing vehicle IDs remain stable; car is
  a future domain mode rather than a new purchased fleet item in this sprint.
- Delivery missions comprise legs, parcels and custody locations. Future transfer,
  customer collection and fallback legs may use HQ, fixed or mobile infrastructure.
- HQ, fixed and mobile DronePorts are simulation infrastructure types. Capacity,
  coverage and deterministic fallback selection are game models, not real taxonomy.
- Smart Parcel Lockers are future/simulated capabilities, not claimed live real-app
  functionality. No real locker security or autonomous drone routing is implemented.

### DELIBERATE DEVIATIONS

The local district is compact and hand-authored. Roads allow simplified pedestrian
crossing without traffic simulation. Merchant onboarding uses one proximity action
instead of real commercial authorization. Player-employees are a Tycoon company
mechanic; the real reference describes independent pilots, not DROPi employees.
The HQ/Main DronePort integration and first-class mobile DronePort direction come
from the owner's game requirements, not invented contents of binary canon.

The human/operator actor is ground-bound. Drones are separate aerial actors with
available, in-flight, charging and maintenance states. Only contracts are introduced
now: launch control, autonomous flights, multi-city networks and locker workflows
remain future implementation. Final art quality and Android usability require
physical owner review; automated tests cannot certify those subjective outcomes.

## Purpose

This document defines how the player interacts with DROPi Tycoon.

It describes the gameplay loop, player actions, progression of interaction, and the principles that govern moment-to-moment gameplay.

---

# Core Gameplay Philosophy

DROPi Tycoon is designed around one simple idea:

Small actions create large consequences.

The player should never feel overwhelmed by mechanics.

Instead, new gameplay systems are introduced naturally as the company grows.

Complexity emerges through interaction between systems rather than difficult controls.

---

# Core Gameplay Loop

**Scope Clarification:** This document describes the general and long-term gameplay loop for DROPi Tycoon. Prototype v0.1 uses the reduced canonical loop defined in `09_Development/PROTOTYPE_V0.1.md`; that document is the authoritative owner of the Prototype v0.1 loop.

Every gameplay session follows the same high-level cycle.

Receive Customer Demand

↓

Accept Delivery Orders

↓

Plan Logistics

↓

Assign Resources

↓

Deliver Packages

↓

Generate Revenue

↓

Pay Expenses

↓

Analyze Performance

↓

Invest in Growth

↓

Expand Operations

↓

Repeat

Each cycle should make the company larger, smarter, and more efficient.

---

# Early Game

The player begins as an independent courier on foot.

Starting resources include:

- Small amount of cash
- One smartphone
- One backpack

The player does not start with a vehicle.

The Bicycle is the first purchasable vehicle. It is not starting equipment. For Prototype v0.1 scope, see `09_Development/PROTOTYPE_V0.1.md`.

At this stage, the player performs deliveries personally.

The objective is to understand the fundamentals of logistics.

---

# Mid Game

As revenue increases, management becomes more important than manual work.

New responsibilities include:

- Hiring employees
- Purchasing vehicles
- Managing deliveries
- Expanding delivery zones
- Building infrastructure

The player transitions from worker to manager.

---

# Late Game

Manual deliveries disappear almost entirely.

The player's role becomes strategic.

Responsibilities include:

- Company expansion
- Technology research
- AI management
- Drone operations
- Financial planning
- Global logistics optimization

The player becomes the CEO of an international corporation.

---

# Player Actions

The player can:

- Accept orders
- Reject orders
- Purchase vehicles
- Hire employees
- Build infrastructure
- Upgrade technology
- Expand territories
- Monitor company performance
- Respond to unexpected events

Every action affects multiple gameplay systems.

---

# Decision Making

The game rewards planning.

Every investment competes with another opportunity.

Examples:

Buying another bicycle may delay purchasing a delivery van.

Expanding into a new district may reduce available cash for research.

Players continuously balance short-term profit against long-term growth.

---

# Dynamic Gameplay

The world changes constantly.

Examples include:

- Rush hours
- Rain
- Snow
- Traffic
- Holidays
- Special events
- Customer behavior
- Market demand

Players must adapt rather than follow fixed strategies.

---

# Failure

Failure is part of progression.

Companies may experience:

- Financial losses
- Delivery delays
- Poor customer reviews
- Equipment failures
- Employee shortages

Failure creates learning opportunities instead of permanent punishment.

---

# Success

Success is measured by more than money.

Players are encouraged to optimize:

- Delivery speed
- Customer satisfaction
- Company reputation
- Operational efficiency
- Sustainability
- Innovation

The strongest company is not necessarily the richest.

---

# Gameplay Rules

Every mechanic added to the game must satisfy the following requirements:

- Easy to understand
- Interesting to master
- Connected to existing systems
- Capable of future expansion
- Fun before realistic

If realism reduces enjoyment, gameplay always has priority.

---

# Canonical Rule

This document defines the official gameplay structure for DROPi Tycoon.

All future gameplay systems must remain consistent with these principles unless superseded by a newer canonical version.

---

End of Document