# Document Information

Document: GDD.md
Project: DROPi Tycoon
Version: 1.1.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-07

---

# Game Design Document

## Purpose

This document defines the highest-level gameplay design of DROPi Tycoon.

It explains how the player interacts with the world defined by `00_Project/UNIVERSE_DESIGN.md`, the organizations defined by `00_Project/BUSINESS_DESIGN.md`, and the logistics model defined by `00_Project/LOGISTICS_DESIGN.md`.

This document is subordinate to those higher strategic owners and specializes them into playable experience.

---

# Game Identity

DROPi Tycoon is an **Urban RPG + Business Tycoon + Local Marketplace + Multimodal Logistics + Infrastructure Builder + future Drone Network Simulation**.

The game combines personal progression, operational work, strategic planning, economic management, technological progression, company life, infrastructure, competition, and future multiplayer society into one living ecosystem.

**Game first. Ecosystem second.**

The player is a visible person physically inhabiting the world, not a cursor floating above a management dashboard.

The player begins with limited personal capability and direct local work, then gradually gains skills, vehicles, company roles, assets, employees, facilities, infrastructure, market influence, and larger-scale logistics access.

The current single-player path may place the player in control of a starter company/operation early. Long-term gameplay also supports roles such as employee, specialist, founder, executive, and investor as those systems are canonically implemented.

---

# Core Experience

The player should constantly feel that individual actions contribute to something larger.

One delivery teaches the city.

One qualification opens a profession.

One vehicle changes how work can be performed.

One employee becomes productive capacity.

One HQ room becomes a real department.

One local company becomes part of a competitive city economy.

One city becomes part of a regional and international network.

Progress should feel earned, visible, and connected.

---

# World-Embodied Gameplay

Major gameplay systems should exist in the world whenever their physical existence matters.

Examples:

- the player walks or rides through actual accessible streets;
- vehicles are visible owned assets and active transport modes;
- important buildings have entrances/interiors where appropriate;
- HQ departments must exist before their specialist equipment/actions exist;
- employees should increasingly appear in role-appropriate activity;
- parcels/cargo move through custody and logistics locations;
- warehouses, DronePorts, airports, ports, rail, and other infrastructure are world assets;
- civic or training actions may require relevant institutions;
- customers and businesses exist as world/economic participants.

The game may use abstraction for scale and performance, but abstractions must preserve equivalent gameplay consequences.

The old unrestricted marker/cube traversal and developer-style omniscient menu model are temporary/historical prototype behaviors, not final design direction.

---

# Player Interface Philosophy

The interface supports the world; it does not replace it.

## Smartphone

The player's in-world smartphone is the canonical portable interface.

It may progressively support:

- delivery work;
- mission tracking;
- GPS/map;
- messages;
- study/training theory;
- marketplace browsing;
- money/assets information;
- weather/news generated from the game world;
- future investment information;
- future multiplayer communication;
- authorized monitoring/control of advanced systems.

See `07_UI/PLAYER_SMARTPHONE.md`.

## Physical Company Interfaces

Actions that require a place, person, vehicle, parcel, specialist, or infrastructure remain physically grounded unless later progression explicitly authorizes remote operation.

Examples include hiring, fleet handoff, maintenance, practical training, construction, parcel handling, civic registration, and major infrastructure operation.

---

# Movement and Transport

Human movement follows valid streets, sidewalks, entrances, and accessible interior geometry.

Buildings and blocked terrain cannot be crossed.

Terrestrial vehicles use compatible paths; cars/vans and equivalent motor vehicles remain road-bound where the world rules require it.

Transport progression may include:

- Walking;
- Bicycle;
- Electric Scooter;
- Motorcycle;
- Car;
- Delivery Van;
- specialized terrestrial vehicles;
- drones as separate logistics actors;
- rail/air/maritime systems at later scale.

The human operator never becomes an aerial drone.

Drone operations keep the human operator and drone as separate entities under `00_Project/LOGISTICS_DESIGN.md` and `03_Logistics/DRONES.md`.

---

# Design Objectives

## Personal Growth

The player should gain knowledge, qualifications, professions, and responsibilities rather than only money and company level.

---

## Business Growth

A small operation can become a productive organization with people, assets, customers, facilities, infrastructure, ownership, and history.

---

## Strategic Decision Making

Investments create opportunity cost.

Choosing one growth path should delay or change another.

There should not be one universally optimal build.

---

## Operational Management

Running logistics requires balancing interconnected systems such as:

- finances;
- demand;
- fleet;
- employees;
- qualifications;
- infrastructure;
- cargo/custody;
- routes;
- maintenance;
- customer satisfaction;
- technology;
- reputation;
- capacity and reliability.

---

## Visible Consequence

Purchases, failures, upgrades, construction, hiring, transport choice, and company growth should produce understandable visual or systemic consequences.

---

## Living Competition

Multiple companies should eventually compete for customers through actual simulated performance, differentiation, capacity, value, and strategy.

Competition must include recovery/counterplay and must not permit permanent griefing.

---

## Technology Evolution

Technology expands gameplay rather than deleting earlier systems.

Drones do not make terrestrial delivery meaningless. Automation does not erase capacity, infrastructure, cost, or people requirements. Advanced logistics does not invalidate local work.

---

## Endless Progression

The game has no traditional hard ending.

Growth continues through specialization, optimization, expansion, innovation, competition, investment, infrastructure, new worlds, and legacy.

---

# Gameplay Principles

## Simple Input, Deep Systems

Moment-to-moment actions should remain understandable on mobile.

Depth comes from interacting systems, not control complexity.

---

## Visible Consequences

The player should understand what changed and why.

---

## Earned Capability

Money alone cannot unlock every advanced capability.

Depending on the system, progression may require:

- personal qualification;
- company specialist capability;
- infrastructure;
- equipment;
- research;
- reputation;
- authorization;
- previous mastery.

---

## Reward Long-Term Thinking

Planning should consistently matter.

Short-term optimization should be balanced against growth, resilience, reputation, cash flow, specialization, and infrastructure.

---

## Multiple Valid Strategies

Players should not be forced into one company type, one profession, one transport mode, or one investment strategy.

---

## Recovery and Fairness

Meaningful failure is allowed.

Permanent soft-lock, irreversible griefing, or arbitrary loss of core identity/progression is not.

Serious negative effects require recovery, alternative paths, defense, expiration, or rebuilding mechanisms.

---

# Mechanic Evaluation

Every proposed mechanic should answer positively to at least one of these questions:

- Does it create meaningful decisions?
- Does it increase strategic depth?
- Does it improve immersion?
- Does it support personal, company, or world progression?
- Does it interact coherently with existing systems?
- Does it make the living economic/logistics society more believable or playable?
- Does it create a visible consequence worth understanding?

A particularly important project-level test is:

**Does this mechanic help the player evolve from an individual into a meaningful participant in a living economic and logistics society?**

If a proposed feature is only an abstract button/dashboard disconnected from the world and does not require abstraction for usability, it should be redesigned or removed.

---

# Player Motivation

Players are motivated by:

- learning;
- working;
- earning;
- building;
- specializing;
- optimizing;
- collecting;
- investing;
- creating organizations;
- helping organizations grow;
- competing;
- cooperating;
- discovering;
- expanding;
- leaving legacy.

The game should continuously provide meaningful next goals without forcing one path.

---

# Emotional Journey

The intended long-term emotional progression is:

Curiosity

-> Discovery

-> Competence

-> Independence

-> Responsibility

-> Specialization

-> Organization

-> Competition / Cooperation

-> Mastery

-> Innovation

-> Influence

-> Legacy

---

# Company and Society Gameplay

Detailed player/company society rules are specialized in `01_GameDesign/COMPANY_SOCIETY_AND_MULTIPLAYER.md`.

They include:

- real-player and NPC workforce compatibility;
- company formation/authorization;
- education/specialization;
- competition/customer acquisition;
- equity/governance;
- founder legacy;
- future multiplayer authority boundaries;
- Company Heart / Founder Artifact;
- world-scale economic expansion.

Those systems are long-term canon, not current-runtime claims.

---

# HQ Progression

The HQ is a physical progression asset rather than a permanently complete menu shell.

Only constructed/unlocked departments are operational.

Departments may require money, progression, specialists, infrastructure, research, or other authoritative prerequisites.

See `01_GameDesign/HQ_PROGRESSION.md`.

---

# Replayability

Replayability should come from dynamic systems and different choices rather than only scripted content.

Sources may include:

- profession/specialization choices;
- company strategies;
- customer demand;
- regional differences;
- competitor behavior;
- market cycles;
- infrastructure paths;
- technology choices;
- weather/events;
- governance/investment choices;
- future human-player activity.

---

# Multiplayer Principle

Multiplayer enriches the existing game rather than replacing it.

Low-population or offline play must remain viable through NPC/simulated participants.

Before real shared economic state is enabled, Technical Design must provide stable identity, server authority, persistence, migration, concurrency, anti-cheat/anti-duplication, transactions, and moderation where communication exists.

The current game must not display simulated local systems as if real players were already online.

---

# AI-Friendly Design

Gameplay systems must be:

- modular;
- deterministic where appropriate;
- data-driven;
- configurable;
- independently testable;
- explicit about authority and state ownership;
- capable of later server authority without duplicating economic truth.

---

# Vision Traceability

The Core Values in `00_Project/VISION.md` constrain all gameplay design:

- **Freedom** -> multiple valid roles and strategies;
- **Progression** -> earned personal/company/world capability;
- **Realism** -> believable relationships with deliberate abstractions;
- **Accessibility** -> simple mobile interaction and gradual complexity;
- **Innovation** -> technologies expand rather than replace gameplay.

Higher strategic owners additionally constrain this GDD:

- `UNIVERSE_DESIGN.md` defines the society/world;
- `BUSINESS_DESIGN.md` defines organization/business truth;
- `LOGISTICS_DESIGN.md` defines strategic logistics truth.

---

# Real DROPi Boundary

DROPi Tycoon is an independent fictional simulation.

Game inventions must not be represented as real DROPi features.

No gameplay success, simulated market, share system, token concept, or logistics result guarantees real-world financial or business results.

---

# Canonical Rule

**Game Design turns the canonical DROPi Tycoon universe, businesses, and logistics model into an embodied mobile game. The player should be able to work, learn, move, build, manage, compete, cooperate, invest, expand, and see the consequences of those choices in one coherent living world.**

---

End of Document
