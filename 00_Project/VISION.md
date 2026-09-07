# Document Information

Document: VISION.md
Project: DROPi Tycoon
Version: 1.3.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-07

---

# Vision

## Purpose

DROPi Tycoon is more than a business simulation game.

It is a living economic and logistics society experienced from human scale: the player begins as one visible person in a city and can gradually become a courier, specialist, employee, company member, founder, executive, investor, infrastructure operator, and participant in regional, global, and very-late-game off-world logistics networks.

The game combines Urban RPG, Business Tycoon, Local Marketplace, Multimodal Logistics, Infrastructure Building, and future Drone Network simulation into one persistent progression experience.

The project may also serve as a virtual experimentation platform for logistics concepts that could later inform the real DROPi ecosystem, while remaining an independent entertainment product.

---

# Mission

Design the most immersive, scalable, believable, and enjoyable logistics/economic world possible while keeping gameplay intuitive enough to learn quickly and deep enough to support long-term mastery.

Every feature should create meaningful choices, visible consequences, or new strategic relationships rather than repetitive actions or detached administration.

---

# Long-Term Vision

DROPi Tycoon grows from one person performing local work into a living society of people, companies, customers, institutions, markets, vehicles, infrastructure, goods, and technologies.

There should never be one mandatory success path.

Players should be able to build different careers, companies, logistics networks, investment strategies, and legacies while adapting to:

- customer demand;
- competitors;
- workforce capability;
- technology;
- infrastructure;
- economic conditions;
- regional differences;
- regulations represented as gameplay abstractions;
- weather/environmental events;
- future human-player activity where multiplayer exists.

Each playthrough should naturally create a different story.

---

# Core Values

## Freedom

Players decide how to grow, specialize, work, invest, and build organizations.

There is no single predefined success path.

---

## Progression

Growth should feel earned.

Every meaningful unlock should add capability, responsibility, strategic choice, or world access rather than only increasing a number.

---

## Realism

The game should simulate believable human, business, economic, and logistics relationships while remaining fun.

Realism exists to improve gameplay, not to reproduce unnecessary bureaucracy or complexity.

---

## Accessibility

Easy to learn. Difficult to master.

The player should understand the first delivery loop within minutes while discovering advanced company, infrastructure, market, logistics, and governance systems over many hours.

---

## Innovation

Technology is a tool for solving real game-world problems.

New technologies should create new strategic possibilities without making every earlier transport mode, profession, facility, or gameplay system irrelevant.

---

# Game-First Principle

DROPi Tycoon must be a polished game first and an ecosystem reference second.

The player should feel like a person living and acting in a world, not an administrator operating a developer dashboard.

Important purchases, employees, infrastructure, company growth, logistics modes, and economic changes should create visible world consequences whenever feasible.

Abstract interfaces are acceptable where they improve usability, but they must not replace the living world as the primary experience.

---

# Player Fantasy

The core fantasy is broader than permanently being the owner of one company.

The player begins with limited personal capability and can grow through work, learning, relationships, business, investment, and infrastructure.

A player may eventually:

- perform delivery work personally;
- learn professions and qualifications;
- work for or join a company;
- create a company;
- hire or collaborate with people;
- construct productive facilities;
- own and operate multimodal logistics assets;
- create products and trade networks;
- compete for customers;
- invest in companies;
- influence governance;
- build regional and global networks;
- leave a persistent founder or professional legacy.

The current single-player starter-company implementation remains a valid foundation. Future role separation must be introduced through explicit progression and migration rather than discarding existing gameplay.

---

# Success Criteria

DROPi Tycoon succeeds when players:

- enjoy the game without needing the real DROPi application;
- feel personally present in the world;
- understand why their company succeeds or struggles;
- see their investments and decisions change the world;
- discover meaningful professions and specializations;
- use different transport and business strategies successfully;
- build organizations and infrastructure that feel productive;
- compete and cooperate through understandable rules;
- remain engaged through long-term progression without repetitive grind;
- can continue from local gameplay toward much larger economic/logistics networks without the game becoming a collection of disconnected systems.

---

# Relationship with the DROPi Ecosystem

DROPi Tycoon is inspired by the vision of the DROPi platform but is an independent global game.

The game must be extraordinary, complete, and enjoyable even for a player who never uses the real DROPi application and in locations where the real DROPi service does not operate.

The real DROPi application is a separate real-world product and remains authoritative for real DROPi behavior.

The relationship is intentionally complementary:

- DROPi Tycoon simulates the dream and challenges of logistics, local commerce, infrastructure, technology, companies, and economic growth;
- recognizable real-world concepts may be translated into enjoyable fictional systems;
- game concepts, algorithms, training patterns, or logistics models may later inspire or support real DROPi work where separately approved;
- future employee/partner training may reuse suitable terminology, scenarios, or dedicated training modes;
- the entertainment game must never become advertising disguised as mandatory gameplay;
- simulation success must never be represented as a guarantee of real-world business or financial success.

The canonical translation rule is:

**REAL DROPi CONCEPT -> GENERIC SIMULATION MODEL -> TYCOON GAMEPLAY ABSTRACTION**

Tycoon inventions must never be represented as existing real DROPi capabilities without confirmation from the real DROPi project's own canon.

---

# Project Design Hierarchy

The canonical design hierarchy is:

```text
Project Vision
-> Universe Design
-> Business Design
-> Logistics Design
-> Game Design
-> UX Design
-> Technical Design
-> Implementation
-> Verification
-> Historical Reporting
```

Each layer narrows and specializes the layer above it.

Lower-level documents may add detail, but they must not contradict higher-level authority.

## Canonical Strategic Owners

- **Project Vision:** `00_Project/VISION.md`
- **Universe Design:** `00_Project/UNIVERSE_DESIGN.md`
- **Business Design:** `00_Project/BUSINESS_DESIGN.md`
- **Logistics Design:** `00_Project/LOGISTICS_DESIGN.md`
- **Game Design:** `01_GameDesign/GDD.md`
- **UX Design:** `07_UI/` canonical documents
- **Technical Design:** `06_Technical/` canonical documents

System/domain documents in Economy, Logistics, World, AI, UI, and Technical folders specialize these strategic owners within their legitimate domains.

---

# Universe Design

Universe Design is now a materialized canonical domain owned by `00_Project/UNIVERSE_DESIGN.md`.

It defines the persistent world and society: citizens, players, organizations, institutions, infrastructure, regional difference, logical worlds/shards, world-scale progression, fair-access rules, low-population continuity, and the boundary between active local simulation and large-scale persistent state.

Universe Design defines the stage. Game Design defines how the player interacts with that stage.

The mandatory architecture/ownership audit that preceded materialization is recorded in `09_Development/AI_Reports/2026-09-07_103_CANONICAL_OWNERSHIP_AND_ROADMAP_AUDIT.md`.

---

# Business Design

Business Design is owned by `00_Project/BUSINESS_DESIGN.md`.

It defines companies and organizations as living entities: formation, membership, workforce, physical operations, competition, products, valuation, shares, governance, founder identity, infrastructure control, and business continuity.

Detailed financial calculations remain in `02_Economy/`.

---

# Logistics Design

Logistics Design is owned by `00_Project/LOGISTICS_DESIGN.md`.

It defines the strategic movement/custody model from local last-mile work through warehouses, DronePorts, road, rail, air, sea, international hubs, and very-late-game off-world logistics.

Detailed order, routing, vehicle, drone, and DronePort mechanics remain in `03_Logistics/`.

---

# World-Embodied Interaction Direction

The world is the primary place where the player understands the game.

Examples:

- vehicles are visible assets;
- employees become visible participants when their role/activity is represented;
- HQ departments exist only when constructed/unlocked;
- parcels and cargo have custody and locations;
- infrastructure exists in the world;
- civic and specialist actions may require appropriate places;
- the player's smartphone is the portable window into information, communication, study, markets, and monitoring.

The smartphone must not make physical HQ, facilities, vehicles, people, or infrastructure irrelevant.

See `07_UI/PLAYER_SMARTPHONE.md`, `01_GameDesign/HQ_PROGRESSION.md`, and `01_GameDesign/COMPANY_SOCIETY_AND_MULTIPLAYER.md`.

---

# Multiplayer Direction

Multiplayer is a long-term part of the living society, not a separate end-game minigame.

However, real multiplayer state must not be activated before the technical foundations exist.

The project should establish single-player/local business rules first where practical, then introduce:

- stable player identity;
- server-authoritative company/economy state;
- migration from local saves;
- transaction integrity;
- concurrency/conflict handling;
- moderation for communication;
- anti-cheat/anti-duplication;
- persistent world/shard membership.

Real-player employment, company membership, chat, markets, shares, or contested infrastructure then extend the same simulation rather than creating a second economy.

---

# Optional Ecosystem Asset Boundary

A future DROPi ecosystem token/asset may eventually be evaluated as an optional cross-project element.

Current Tycoon canon does **not** authorize:

- blockchain deployment;
- smart contracts;
- wallets;
- tokenomics;
- ticker/supply;
- exchange functionality;
- KYC;
- cash-equivalent rewards;
- token-gated mandatory progression.

Company Money remains sufficient for normal gameplay.

Any future ecosystem asset requires separate cross-project canonical alignment, economic design, security review, legal/regulatory review where applicable, UX review, and explicit Project Owner approval.

It may never bypass qualifications, permits, infrastructure, or earned progression.

---

# Mobile-First Installed Game Direction

DROPi Tycoon is designed and judged primarily as an installed mobile game, beginning with Android.

The primary product/runtime chain is:

```text
GitHub
-> Authoritative Game Runtime
-> Mobile Application Shell
-> Android Development / Release Build
-> Installed Game
-> Google Play Distribution
```

A web build deployed through Railway remains an important secondary preview, smoke-test, diagnostics, and development surface.

The browser is not the final owner-facing quality bar for gameplay composition, camera behavior, orientation, touch interaction, or mobile presentation.

The mobile application must preserve the authoritative game simulation rather than create a second independent gameplay implementation.

See `06_Technical/ARCHITECTURE.md` and `06_Technical/MOBILE_APPLICATION_PLATFORM.md`.

---

# Canonical Rule

**DROPi Tycoon begins with one visible person and one local logistics problem, then grows through earned personal capability, living companies, productive infrastructure, multimodal logistics, competition, investment, multiplayer society, and world-scale expansion. Every lower-level system must strengthen that coherent journey rather than become an isolated menu or unrelated economy.**

---

End of Document
