# Document Information

Document: VISION.md
Project: DROPi Tycoon
Version: 1.2.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-05

---

# Vision

## Purpose

DROPi Tycoon is more than a business simulation game.

It is a living logistics sandbox where players experience the complete journey of building, managing, and evolving a modern delivery company from a single courier into a global autonomous logistics network.

The project also serves as a virtual experimentation platform for logistics concepts that may later be integrated into the real DROPi ecosystem.

---

# Mission

Design the most immersive, scalable, and realistic logistics management game while keeping gameplay intuitive, rewarding, and enjoyable for both casual and advanced players.

Every feature should encourage strategic thinking rather than repetitive actions.

---

# Long-Term Vision

The long-term objective is to create a simulation where every company grows differently.

There should never be a single optimal strategy.

Players should continuously adapt to changing technologies, customer demands, economic conditions, competitors, regulations, and environmental events.

Each playthrough should naturally create a unique story.

---

# Core Values

## Freedom

Players decide how to build their company.

There are no predefined success paths.

---

## Progression

Growth should always feel earned.

Every unlock should introduce meaningful gameplay rather than simply increasing numbers.

---

## Realism

The game should simulate believable logistics systems while remaining fun.

Realism exists to improve gameplay—not to create unnecessary complexity.

---

## Accessibility

Easy to learn.

Difficult to master.

Players should understand the fundamentals within minutes while discovering advanced systems over many hours.

---

## Innovation

Technology is a tool for solving operational challenges.

New technologies should create new strategic opportunities instead of replacing gameplay.

---

# Design Philosophy

Gameplay design principles and mechanic evaluation rules are defined canonically in `01_GameDesign/GDD.md`.

---

# The Player Fantasy

The player should feel like the founder of a revolutionary logistics company.

Starting with almost nothing, they gradually build an organization that transforms cities, industries, and eventually the world through innovation and intelligent management.

The experience should inspire creativity, planning, and entrepreneurship.

---

# Success Criteria

DROPi Tycoon succeeds when players:

- enjoy experimenting with different business strategies;
- feel rewarded for long-term planning;
- continuously discover new mechanics;
- create unique logistics networks;
- remain engaged for hundreds of hours without repetitive gameplay.

---

# Relationship with the DROPi Ecosystem

DROPi Tycoon is inspired by the vision of the DROPi platform but is designed as an independent global game.

The game must be extraordinary, complete, and enjoyable even for a player who never uses the real DROPi application and even in countries or cities where the real DROPi service does not operate.

The real DROPi application is a separate real-world product that may initially operate only in selected cities or regions and expand over time.

The relationship between the products is intentionally complementary:

- DROPi Tycoon lets players experience the dream and challenges of building a logistics company in a simulated world;
- gameplay systems should be inspired by recognizable real-world human, operational, economic, environmental, and logistics consequences while remaining fun;
- the game can introduce players to concepts that exist or may later exist in the real DROPi ecosystem;
- future DROPi employee or partner training may reuse game concepts, terminology, scenarios, or dedicated training modes where appropriate;
- the entertainment game must not become an advertisement disguised as gameplay and must not require access to the real DROPi service;
- simulation success must never be presented as a guarantee of real-world financial success.

Whenever possible, gameplay systems should be architected so that concepts, algorithms, balancing ideas, training patterns, and logistics models can be reused or adapted for future DROPi products without coupling the game to the current operational implementation of the real company.

---

# Project Design Hierarchy

The project organizes its design and documentation into the following domains, ordered from highest to lowest abstraction:

```
Project Vision
→ Universe Design
→ Business Design
→ Logistics Design
→ Game Design
→ UX Design
→ Technical Design
→ Implementation
→ Verification
→ Historical Reporting
```

Each level narrows and specializes the level above it. Lower-level documents must not contradict higher-level documents.

---

# Universe Design

**Status:** Approved emerging domain — awaiting dedicated architecture and ownership audit.

Universe Design is the domain that defines the persistent world and ecosystem in which DROPi Tycoon takes place. It sits immediately below Project Vision in the design hierarchy.

Universe Design is distinct from Game Design:

- **Universe Design** defines the persistent world and ecosystem — the stage.
- **Game Design** defines player interaction with that world — the gameplay.

Universe Design may eventually cover:

- Persistent Earth-scale simulation
- Continents, countries, regions, cities, districts, streets, and operational areas
- Time and weather systems
- Population simulation
- Companies and competitive entities
- Regional evolution and infrastructure
- DronePort networks and logistics ecosystems
- Regional economies
- Technology evolution
- World events

A dedicated architecture and ownership audit is required before Universe Design documents are created or existing documents are reorganized to reflect this domain. Universe Design is not yet fully assigned to a canonical owner or directory. This entry records the domain as officially approved and awaiting that audit.

See `00_Project/DOCUMENT_INDEX.md` for the documentation index entry and planned architecture registration.

---

# Mobile-First Installed Game Direction

DROPi Tycoon is designed and judged primarily as an installed mobile game, beginning with Android.

The primary product/runtime chain is:

```text
GitHub
→ Authoritative Game Runtime
→ Mobile Application Shell
→ Android Development / Release Build
→ Installed Game
→ Google Play Distribution
```

A web build deployed through Railway remains an important secondary preview, smoke-test, diagnostics, and development surface. The browser is not the final owner-facing quality bar for gameplay composition, camera behavior, orientation, or mobile experience.

The mobile application must preserve the authoritative game simulation rather than create a second independent implementation of gameplay rules.

Implementation technologies are replaceable technical choices, but the currently approved mobile implementation baseline and change-control rules are recorded canonically in `06_Technical/MOBILE_APPLICATION_PLATFORM.md`.

See `06_Technical/ARCHITECTURE.md` for the technical architecture and `06_Technical/MOBILE_APPLICATION_PLATFORM.md` for the canonical mobile runtime/platform specification.

---

End of Document