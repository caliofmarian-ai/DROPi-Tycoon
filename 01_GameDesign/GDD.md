# Document Information

Document: GDD.md
Project: DROPi Tycoon
Version: 1.2.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-08

---

# Game Design Document

## Purpose

This document defines the highest-level gameplay design of DROPi Tycoon.

It explains how the player interacts with the world defined by `00_Project/UNIVERSE_DESIGN.md`, the organizations defined by `00_Project/BUSINESS_DESIGN.md`, the logistics model defined by `00_Project/LOGISTICS_DESIGN.md`, and the owner-approved architecture decisions recorded in `00_Project/PHASE1_GAME_ARCHITECTURE_DECISION_BASELINE.md`.

This document is subordinate to those higher strategic owners and specializes them into playable experience.

---

# Game Identity

DROPi Tycoon is an **Urban RPG + Business Tycoon + Local Marketplace + Multimodal Logistics + Infrastructure Builder + future Drone Network Simulation**.

The game combines personal progression, operational work, strategic planning, economic management, technological progression, company life, infrastructure, competition, and future multiplayer society into one living ecosystem.

**Game first. Ecosystem second.**

The player is a visible person physically inhabiting the world, not a cursor floating above a management dashboard.

The canonical human starting state is deliberately modest: the player begins poor, on foot, as an employee of a large fictional incumbent delivery employer, performing introductory light work such as flyers, letters, and small parcels.

The player earns wages, consumes personal resources, manages finite Work Capacity, and gradually gains education, qualifications, equipment, transport, career choices, company membership, entrepreneurship capability, assets, employees, facilities, infrastructure, investment access, and larger-scale logistics reach.

The current runtime still contains a starter-company object and per-delivery Company Money reward path. Those are legacy/prototype implementation truths retained for compatibility until a dedicated migration changes save/economy behavior. They no longer define the intended canonical human start.

---

# Core Experience Promise

The central experiential promise is:

> **Your work leaves a mark.**

The player should regularly see at least one of three forms of progress:

1. **I changed myself** — knowledge, qualification, equipment, transport, housing, finances, reputation, profession, or responsibility.
2. **I changed something I own or belong to** — company, HQ, fleet, warehouse, productive facility, route network, team, or investment.
3. **I changed the world** — a person/business was supplied, inventory recovered, a project advanced, infrastructure opened, an industry resumed, a locality changed, or a transport/economic network evolved.

If a meaningful session only increases a hidden number in a menu, the design should be questioned.

---

# Human Economic Life

The player participates in the economy as a worker, consumer, learner, traveler, member, owner, and investor depending on progression.

Canonical personal-economic concepts include:

- Personal Money distinct from Company Money;
- wages/salary for actual work;
- food and water consumption;
- housing/living costs;
- finite Work Capacity and rest/recovery;
- personal equipment/transport costs where applicable;
- education/training costs where applicable;
- poverty, insolvency, housing loss, bankruptcy, and recovery.

Exact values are balancing data, not fixed GDD constants.

Offline time can create legitimate consequences, but it must not manufacture starter wages or active-use costs for activities that did not occur.

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
- warehouses, DronePorts, airports, ports, rail, farms, factories, utilities, and other infrastructure are world assets;
- civic or training actions may require relevant institutions;
- customers, households, businesses, productive facilities, and institutions exist as world/economic participants.

The game may use abstraction for scale and performance, but abstractions must preserve equivalent gameplay/economic consequences.

The old unrestricted marker/cube traversal and developer-style omniscient menu model are temporary/historical prototype behaviors, not final design direction.

---

# Player Interface Philosophy

The interface supports the world; it does not replace it.

## Smartphone

The player's in-world smartphone is the canonical portable interface.

It may progressively support:

- delivery/work offers and active assignments;
- contract/task tracking;
- GPS/map;
- messages;
- study/training theory;
- marketplace browsing;
- personal/company money and asset information;
- weather/news generated from the game world;
- future investment information;
- future multiplayer communication;
- authorized monitoring/control of advanced systems.

See `07_UI/PLAYER_SMARTPHONE.md`.

## Physical Company Interfaces

Actions that require a place, person, vehicle, parcel, specialist, institution, or infrastructure remain physically grounded unless later progression explicitly authorizes remote operation.

Examples include hiring, fleet handoff, maintenance, practical training, construction, parcel handling, civic registration, production, warehouse work, and major infrastructure operation.

---

# Movement, Travel and Transport

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
- public/contracted road transport;
- drones as separate logistics actors;
- rail;
- air;
- river/sea transport;
- very-late-game frontier systems where canonically enabled.

Strategic maps do not provide free economic teleportation. Presence changes through unlocked transport infrastructure with time/cost consequences. Time compression is allowed where needed for usability.

The human operator never becomes an aerial drone. Drone operations keep the human operator and drone as separate entities under `00_Project/LOGISTICS_DESIGN.md` and `03_Logistics/DRONES.md`.

---

# Design Objectives

## Personal Growth

The player should gain knowledge, qualifications, professions, stability, assets, and responsibilities rather than only money and company level.

## Business Growth

A small operation can become a productive organization with people, assets, customers, facilities, inventory, infrastructure, ownership, risk, and history.

The player can progress from employee to specialist, founder, executive, infrastructure operator, investor, or other compatible roles rather than being permanently forced into company ownership.

## Strategic Decision Making

Investments create opportunity cost.

Choosing one growth path should delay or change another. There should not be one universally optimal build.

## Operational Management

Running logistics/business requires balancing interconnected systems such as:

- Personal Money and Company Money;
- demand and procurement;
- inventory and cargo custody;
- fleet and transport capacity;
- employees and qualifications;
- infrastructure;
- routes and transfer hubs;
- fuel/energy;
- maintenance;
- customer satisfaction;
- technology;
- reputation;
- production inputs/outputs;
- waste/reverse logistics;
- cash flow and resilience.

## Visible Consequence

Purchases, failures, deliveries, upgrades, construction, hiring, transport choice, production, shortages, and company/world growth should produce understandable visual or systemic consequences tied to authoritative state.

## Living Competition

Multiple companies should eventually compete for customers through actual simulated performance, differentiation, capacity, value, and strategy.

Competition must include recovery/counterplay and must not permit permanent griefing or infrastructure softlock.

Roughly five meaningful last-mile competitors is an urban design target and normally one to two is a rural target, subject to economic capacity rather than a naive permanent counter.

## Technology Evolution

Technology expands gameplay rather than deleting earlier systems.

Drones do not make terrestrial delivery meaningless. Automation does not erase capacity, infrastructure, cost, people, energy, inventory, or qualification requirements.

## Endless Progression

The game has no traditional hard ending.

Growth continues through specialization, optimization, expansion, innovation, competition, cooperation, investment, infrastructure, new World Instances, discovery, world contribution, and legacy.

---

# Gameplay Principles

## Simple Input, Deep Systems

Moment-to-moment actions should remain understandable on mobile.

Depth comes from interacting systems, not control complexity.

## Causal Economy

Meaningful work should normally come from a real need, inventory imbalance, production requirement, contract, infrastructure project, service requirement, or other world-economic cause.

The canonical causal direction is broadly:

`Need/Requirement -> Demand/Procurement -> Order/Contract -> Cargo/Custody -> Work/Transport/Production -> Settlement -> Consumption/Use/Output -> Waste/Next Demand -> Visible Consequence`.

Infinite random tasks that create unexplained money are not the final economy model.

## Visible Consequences

The player should understand what changed and why.

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

## Reward Long-Term Thinking

Planning should consistently matter.

Short-term optimization should be balanced against stability, living costs, growth, resilience, reputation, cash flow, specialization, inventory, people, and infrastructure.

## Multiple Valid Strategies

Players should not be forced into one company type, one profession, one transport mode, or one investment strategy.

## Recovery and Fairness

Meaningful failure is allowed.

The player may lose money, housing, customers, assets, company control, or even a company through legitimate economic failure.

Ordinary failure must not delete the human identity or create an unrecoverable soft-lock. The world must provide a legitimate productive rung from which rebuilding is possible.

---

# Person, Company and Investment Identity

One economic hero exists per account per World Instance.

The same person can change career, employer, profession, location, company membership, company control, and investment portfolio.

A person has one primary Internal/Member company relationship at a time, while compatible jobs/contracts and external investments may coexist under their own rules.

Employment, membership, executive authority, and external ownership are distinct.

Broad corporate control grows through legitimate ownership, acquisitions, and subsidiaries rather than unlimited shell companies used to manufacture fake competitors.

---

# World Instance Principle

Multiple persistent World Instances may coexist.

A fresh World Instance does not import economic power from a mature one by default.

Settings, cosmetics, history/achievements, and other explicitly non-economic account data may follow the account, while money, productive qualifications, inventory, property, companies, shares, reputation, infrastructure control, and productive assets remain world-local by default.

Opening a new world does not delete older worlds.

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

Every player-facing implementation slice should also be evaluated against `09_Development/Research/GAME_LOGIC/R9_PLAYABILITY_INTEGRATION_GATE.md` until a later canonical implementation gate replaces it.

A particularly important project-level test is:

**Does this mechanic help the player evolve from an individual into a meaningful participant in a living economic and logistics society?**

If a proposed feature is only an abstract button/dashboard disconnected from the world and does not require abstraction for usability, it should be redesigned or removed.

---

# Player Motivation

Players are motivated by:

- autonomy and meaningful choice;
- competence and mastery;
- learning;
- working and earning;
- visible construction/improvement;
- ownership and customization;
- specializing;
- optimizing;
- collecting and discovering;
- investing;
- creating or belonging to organizations;
- helping people/organizations/localities grow;
- competing;
- cooperating;
- traveling and expanding;
- recovery/comeback stories;
- leaving a visible legacy.

The reason to return should be primarily **"I want to continue what I am building"**, not punishment for missing a login window.

---

# Emotional Journey

The intended long-term emotional progression is:

Curiosity

-> Discovery

-> Competence

-> Stability / Independence

-> Responsibility

-> Specialization

-> Organization

-> Competition / Cooperation

-> Mastery

-> Innovation

-> Influence

-> Legacy

Setbacks may temporarily move the player backward economically without erasing personal history.

---

# Company and Society Gameplay

Detailed player/company society rules are specialized in `01_GameDesign/COMPANY_SOCIETY_AND_MULTIPLAYER.md`.

They include:

- real-player and NPC workforce compatibility;
- employment and membership distinctions;
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

The player's starter employee phase does not imply ownership of a private HQ.

Once the player legitimately belongs to/controls a company with an HQ, only constructed/unlocked departments are operational.

Departments may require money, progression, specialists, infrastructure, research, or other authoritative prerequisites.

See `01_GameDesign/HQ_PROGRESSION.md`.

---

# Replayability

Replayability should come from dynamic systems and different choices rather than only scripted content.

Sources may include:

- profession/specialization choices;
- employer/company strategies;
- local needs and customer demand;
- regional differences;
- competitor behavior;
- production/inventory constraints;
- market cycles;
- infrastructure paths;
- technology choices;
- weather/events;
- governance/investment choices;
- migration and city change;
- future human-player activity;
- separate evolving World Instances.

---

# Multiplayer Principle

Multiplayer enriches the existing game rather than replacing it.

Low-population or offline play must remain viable through bounded NPC/simulated participants that obey real costs, inventory, production, and authority rules rather than generating infinite free resources.

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

World scale must use multi-resolution simulation rather than attempting to simulate every actor at frame rate.

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
- `LOGISTICS_DESIGN.md` defines strategic logistics truth;
- `PHASE1_GAME_ARCHITECTURE_DECISION_BASELINE.md` resolves the approved Phase-1 architecture decisions those documents must obey during reconciliation.

---

# Real DROPi Boundary

DROPi Tycoon is an independent fictional simulation.

Game inventions must not be represented as real DROPi features.

No gameplay success, simulated market, share system, token concept, or logistics result guarantees real-world financial or business results.

---

# Canonical Rule

**Game Design turns the canonical DROPi Tycoon universe, businesses, logistics, and owner-approved architecture into an embodied mobile game. The player begins as a real person with limited means, works and consumes resources, learns and earns capability, can join/build/control productive organizations, and should visibly change themselves, their organizations, and the wider world through meaningful choices.**

---

End of Document
