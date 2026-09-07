# Document Information

Document: UNIVERSE_DESIGN.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical — Universe Design Authority
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-07

---

# DROPi Tycoon Universe Design

## Purpose

This document is the canonical Universe Design owner for DROPi Tycoon.

It defines the persistent world and society in which all business, logistics, gameplay, UX, and technical systems exist.

Authority order:

`00_Project/VISION.md` -> `00_Project/UNIVERSE_DESIGN.md` -> `00_Project/BUSINESS_DESIGN.md` -> `00_Project/LOGISTICS_DESIGN.md` -> `01_GameDesign/GDD.md` -> domain specializations.

This document defines the stage. It does not define every player interaction, economy formula, route algorithm, rendering implementation, or server topology.

---

# 1. Universe Identity

DROPi Tycoon takes place in a living economic and logistics society.

The world is not a static background for menus. It contains people, companies, customers, institutions, vehicles, goods, buildings, infrastructure, markets, and events that increasingly interact through understandable rules.

The player begins as one visible person in that society and may eventually influence cities, regions, countries, international networks, and very-late-game off-world logistics.

The universe must remain enjoyable and coherent even when the real DROPi platform does not operate in the represented location.

---

# 2. Persistent World Hierarchy

The canonical world scale is:

**Neighborhood -> locality -> city -> region/county -> country/world -> international network -> planetary/off-world network.**

Each layer exists for gameplay meaning rather than map size alone.

## Neighborhood / Locality

Supports:

- direct movement;
- addresses;
- customers;
- local merchants;
- streets and crossings;
- small facilities;
- first delivery work.

## City

The city is the first complete social/economic world.

It may contain:

- multiple neighborhoods/districts;
- competing companies;
- customers and merchants;
- education/training locations;
- company headquarters;
- warehouses and logistics hubs;
- civic institutions;
- marketplace activity;
- transport infrastructure;
- an Economic Museum and other public institutions when those systems exist.

## Region / County

Connects cities through regional logistics, shared infrastructure, resource/demand differences, and longer-distance operations.

## Country / Logical World

A country may be presented to players as one logical world or shard for social identity, competition, market context, and progression.

**A country is not required to equal one physical server.**

Technical deployment, sharding, replication, migration, and regional hosting remain Technical Design concerns.

## International Network

Countries/worlds connect through multimodal gateways, trade flows, companies, infrastructure, and cross-border gameplay abstractions.

## Planetary / Off-World Network

Space or planetary logistics is a very-late-game extension of the same core principles: people, organizations, infrastructure, custody, transport, demand, investment, and governance.

It is not an early-game requirement.

---

# 3. Active Simulation Principle

The universe may be large, but active rendering and high-frequency simulation remain bounded.

Only relevant active areas should carry full runtime cost.

Examples:

- active city;
- active interior;
- active route segment;
- current logistics hub;
- bounded nearby actors.

The project must not attempt to render or simulate an entire country or planet at full fidelity every frame.

Large-scale state may exist abstractly or at lower simulation frequency until the player enters or affects a region.

This rule protects Android performance and future online scalability.

---

# 4. Citizens and Players

The world contains citizens rather than only company statistics.

A citizen may be:

- the player;
- another future real player;
- an NPC/simulated resident;
- an employee;
- a specialist;
- a customer;
- a merchant;
- an investor;
- a company founder or executive;
- a worker inside public or private infrastructure.

Real players and NPCs must not require unrelated parallel economic truths.

Where they perform the same economic role, they should use the same authoritative role/company model with different control sources.

---

# 5. Low-Population World Continuity

The universe must remain playable when few or no other real players are present.

Therefore:

- NPC companies may compete;
- simulated workers may fill company roles;
- simulated customers and merchants create demand;
- public infrastructure continues operating through governed simulation;
- markets may use simulated participants where appropriate;
- a player must never require a fully populated multiplayer server merely to progress through normal gameplay.

Multiplayer enriches the universe; it does not replace the game.

---

# 6. Organizations

The world may contain multiple organization types, including:

- logistics companies;
- merchants and producers;
- educational institutions;
- civic/municipal institutions;
- infrastructure operators;
- marketplace/exchange institutions;
- museums and public-interest locations;
- future cooperative, franchise, or specialized organizations.

Detailed company rules are owned by `00_Project/BUSINESS_DESIGN.md`.

---

# 7. Civic and Public Institutions

Some progression actions belong to visible institutions rather than omnipresent menus.

Possible simulated institutions include:

- city hall;
- commercial registry/business authorization office;
- education/training centers;
- transport qualification facilities;
- airports, ports, rail terminals and public logistics gateways;
- local exchange/market institutions;
- Economic Museum.

These are fictional gameplay abstractions inspired by recognizable real-world concepts.

They must not be presented as exact legal, regulatory, licensing, investment, or governmental procedures.

---

# 8. Infrastructure as World State

Infrastructure is part of the universe, not merely an upgrade number.

Examples include:

- roads;
- highways;
- crossings;
- warehouses;
- distribution hubs;
- DronePorts;
- airports;
- river/sea ports;
- rail terminals;
- energy/support infrastructure;
- future space gateways.

Infrastructure may be public, company-owned, leased, concession-operated, jointly financed, or otherwise controlled through future gameplay rules.

Important infrastructure must have visible location and capacity consequences.

---

# 9. Critical Infrastructure Fair-Access Rule

No company or player may permanently block an entire city/world from normal progression by monopolizing a critical shared gateway.

Critical public-access infrastructure requires one or more safeguards such as:

- regulated access;
- alternative routes;
- public baseline capacity;
- time-limited concessions;
- usage fees without permanent exclusion;
- recovery mechanisms;
- competing infrastructure.

Strategic control may create advantage, revenue, priority, or lower internal cost, but never irreversible world lockout.

---

# 10. Goods, Demand and Regional Difference

Different areas may have different:

- population needs;
- business demand;
- production capacity;
- resource availability;
- transport difficulty;
- infrastructure quality;
- economic conditions;
- environmental conditions.

These differences create logistics opportunities.

Regional dependency must create strategic pressure rather than irreversible starvation or griefing. Essential categories require alternative supply, recovery, or public baseline mechanisms.

---

# 11. Living World Evolution

The world can evolve over time through systems such as:

- businesses opening/closing;
- company growth or decline;
- infrastructure construction;
- customer preference shifts;
- changing traffic and mobility patterns;
- education/specialist availability;
- regional demand changes;
- market cycles;
- weather and seasonal effects;
- public events;
- technology adoption.

World evolution should create new decisions, not random punishment without counterplay.

---

# 12. Visible Consequence Rule

Important state changes should become visible in the world whenever feasible.

Examples:

- buying a vehicle creates a visible owned vehicle;
- hiring creates visible staff/activity when the role is active;
- constructing a department changes the HQ;
- building infrastructure changes the city/network;
- company growth increases operational presence;
- new logistics modes create new moving entities and facilities;
- regional economic changes affect demand, traffic, prices, or visible activity.

The player should be able to see the society and company they are helping create.

---

# 13. Physical World and Digital Surfaces

Digital interfaces exist inside the universe.

The player smartphone is the main portable information/communication surface.

Physical locations remain authoritative for actions that require:

- people;
- equipment;
- vehicles;
- parcels;
- construction;
- training/practical certification;
- civic registration;
- infrastructure operation.

Remote convenience may grow with progression, but the world must never become irrelevant because every action can be performed from an abstract menu.

See `07_UI/PLAYER_SMARTPHONE.md` and `01_GameDesign/HQ_PROGRESSION.md`.

---

# 14. Competition, Cooperation and Recovery

The universe supports competition and cooperation between organizations and players.

Negative effects must remain bounded.

No mechanic may enable:

- permanent destruction of another player's identity;
- irreversible exclusion from core progression;
- permanent destruction of a company's historical identity;
- harassment-driven gameplay;
- unrecoverable resource starvation;
- griefing without defense, expiration, or recovery.

Serious competitive pressure must have counterplay.

---

# 15. Multiplayer World Principle

Future multiplayer should make multiple real players inhabitants of the same authoritative world/economy where appropriate.

Before contested ownership, trading, chat, company membership, or shared infrastructure become live, Technical Design must provide stable identity, persistence, server authority, anti-cheat, transaction integrity, moderation, concurrency handling, and recovery.

The current local game must not pretend that simulated state is already a real multiplayer world.

---

# 16. Relationship to Real DROPi

DROPi Tycoon is an independent fictional game universe.

Real DROPi concepts may inspire simulation through this translation rule:

**REAL DROPi CONCEPT -> GENERIC SIMULATION MODEL -> TYCOON GAMEPLAY ABSTRACTION**

The Tycoon universe may contain fictional institutions, companies, products, technologies, artifacts, planets, market rules, and governance systems that do not exist in the real DROPi product.

Those inventions must never be presented as real DROPi functionality.

---

# 17. Ecosystem Asset Boundary

The universe does not require blockchain, NFT, wallet, token, or real-money systems.

Company Money remains sufficient for normal gameplay.

A future optional ecosystem asset may only be introduced after separate cross-project, economy, security, legal/regulatory, UX, and owner approval.

Such an asset may not bypass qualifications, infrastructure, permits, progression, or normal gameplay.

---

# 18. Specialization Ownership

This document owns universe-level truths.

Lower-level specializations include:

- `04_World/WORLD.md` — world simulation behavior;
- `04_World/MAP.md` — map structure;
- `04_World/BUILDINGS.md` — building behavior;
- `04_World/NPC.md` — NPC behavior;
- `04_World/WEATHER.md` — weather;
- `00_Project/BUSINESS_DESIGN.md` — organization/business design;
- `00_Project/LOGISTICS_DESIGN.md` — strategic logistics design;
- `01_GameDesign/GDD.md` — how players interact with the universe;
- `06_Technical/ARCHITECTURE.md` — how the universe is implemented technically.

Lower-level documents may specialize this universe but must not contradict it.

---

# Canonical Rule

**DROPi Tycoon is a living society first represented at human scale and gradually expanded to city, regional, world, international, and very-late-game planetary scale. Every major system must belong to that society, create understandable consequences, preserve recoverability, and remain playable even without a populated multiplayer world.**

---

End of Document
