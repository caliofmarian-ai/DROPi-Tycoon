# Document Information

Document: PLAYER_SMARTPHONE.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical UI Specialization
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-07

---

# Player Smartphone

## Purpose

This document defines the player's in-world smartphone as the canonical portable interface surface of DROPi Tycoon.

The smartphone replaces the long-term idea of an omnipresent abstract `Company` menu while preserving physical world interaction for actions that logically require a location, department, vehicle, facility, or institution.

The player already starts with a Smartphone in the canonical progression model. The phone begins simple and gains capability as the player learns, joins or creates a company, unlocks services, and constructs supporting infrastructure.

---

# Design Principle

The player should feel like a person using a phone inside the game world, not an administrator operating a debug dashboard.

The phone must be:

- visually coherent with a premium mobile game;
- quick to open and close;
- readable in Android landscape;
- progressively unlocked;
- connected to authoritative gameplay state;
- useful while the player is moving through the world;
- incapable of bypassing physical gameplay merely for convenience.

The phone UI displays and requests actions. Domain systems remain responsible for gameplay truth.

---

# Portable Functions

The smartphone may progressively host the following applications or surfaces.

## Delivery App

May provide:

- available delivery opportunities;
- accepted mission status;
- pickup/drop-off information;
- parcel requirements;
- delivery history;
- courier availability and future company assignment information.

Accepting work may still depend on current service, location, capacity, qualifications, or company rules.

## GPS and Map

May provide:

- current position;
- destination;
- route guidance;
- company facilities;
- customers and relevant businesses;
- district/city information;
- future inter-city routes;
- traffic/weather overlays when unlocked.

The phone map complements the gameplay minimap and camera; it does not replace the physical world.

## Mission Tracking

May show:

- current objectives;
- delivery stages;
- deadlines;
- cargo status;
- route legs;
- required vehicle or qualification;
- mission rewards and risks.

## Communications

May support:

- employee/company messages;
- dispatch communication;
- company announcements;
- future direct player messaging;
- local city chat;
- world/shard chat;
- market negotiation surfaces where separately authorized.

Online communication requires future moderation, reporting, blocking, account identity, and server-authoritative architecture before activation.

## Marketplace

May provide remote browsing of:

- local merchant listings;
- player marketplace listings when multiplayer exists;
- world marketplace listings when unlocked;
- company product listings;
- order status and transaction history.

Browsing remotely does not imply every physical handoff can happen remotely. Goods still move through the logistics simulation.

## Money and Assets

May show:

- Company Money;
- personal/player financial information when later modeled;
- owned or assigned vehicles;
- company assets;
- future investment portfolio;
- future share holdings;
- dividends and valuation information when the exchange system exists.

A future ecosystem asset, if ever implemented, must remain separately identified from Company Money.

## Training and Qualifications

May host or launch online study for qualifications that are canonically eligible for remote learning.

Examples may include:

- delivery-app literacy;
- route/safety theory;
- entrepreneurship theory;
- vehicle theory;
- company procedures;
- drone theory.

Practical certification may still require a physical facility, instructor, vehicle, simulator, test location, or company department.

## Weather and City Information

May provide:

- weather forecast;
- current conditions;
- road/traffic warnings;
- city events;
- economic events;
- service disruptions;
- news about local businesses and competing companies when the relevant simulation exists.

This information should be generated from the game world and simulation, not presented as real-world news unless a separately approved live-data feature exists.

## Music and Radio

The phone may function as an immersive audio controller for:

- game radio stations;
- music channels;
- company/news broadcasts;
- ambient audio preferences.

Any licensed or external media integration requires separate rights and technical review. The base game can use authored or simulated in-game media.

## Drone Operations

When the player has the required qualification and the company owns/operates compatible drone infrastructure, the phone may provide a portable monitoring or control surface for approved drone operations.

The human player does not become the drone. The operator remains physically represented at an appropriate HQ/DronePort/control context when the operation requires it, while the drone is a separate world entity.

Portable monitoring must not silently bypass required launch, custody, safety, infrastructure, or authorization rules.

## Advertising and Media

The game may later contain simulated in-world advertising, company marketing, sponsored-looking fictional content, or rewarded game systems only after separate UX/economy review.

This document does not authorize real advertising networks, paid ads, real-money monetization, or reward mechanics.

---

# Physical Location Boundary

The smartphone is a portable information and communication surface, not an omnipotent remote-control menu.

Unless a later progression system explicitly authorizes remote operation, the following kinds of actions remain tied to physical places:

- hiring/onboarding actions requiring the Hiring area;
- vehicle purchase, inspection, handoff, or maintenance requiring Fleet/Workshop areas;
- construction and infrastructure upgrades;
- parcel sorting and physical handoff;
- civic/company registration actions;
- airport, port, rail, warehouse, or DronePort physical operations;
- practical training and certification;
- activities requiring specialist equipment.

Remote inspection, scheduling, messaging, study, market browsing, and status checking can be available earlier.

---

# Progressive Unlock Model

Phone capability should unfold with the player's progression rather than exposing the whole game at level one.

A possible progression pattern is:

1. basic phone + delivery app + simple map;
2. mission history and company messages;
3. improved GPS, weather and city information;
4. training applications;
5. marketplace and company operations information;
6. employee communication and advanced analytics;
7. investments and exchange information;
8. advanced multimodal control/monitoring;
9. future multiplayer chat/world-market capability;
10. future drone/advanced infrastructure control surfaces.

Exact unlock levels and costs remain balancing decisions.

---

# Multiplayer Boundary

The phone is the natural future interface for multiplayer communication and market access, but current local gameplay must not pretend those services are online.

Before real multiplayer features are enabled, the Technical architecture must provide authoritative identity, persistence, transactions, moderation, anti-cheat, and concurrency handling as required by `01_GameDesign/COMPANY_SOCIETY_AND_MULTIPLAYER.md`.

Unavailable online functions must be visibly locked/future rather than simulated as if connected to real players.

---

# Visual and Interaction Rules

The smartphone should visually read as an object/interface within the game world.

Rules:

- do not cover the entire game with a desktop-like administration screen unless a specific app needs focused detail;
- preserve a clear way to close the phone and return to the exact gameplay context;
- do not reset player position, active mission, camera state, or company state merely by opening/closing the phone;
- use touch-safe controls and native Phaser input primitives where the authoritative runtime requires them;
- keep app icons, navigation, typography, and notifications consistent with `07_UI/VISUAL_DESIGN_SYSTEM.md`;
- avoid debug labels, developer state dumps, or raw internal identifiers in normal player presentation;
- show only information the player's progression and current game systems legitimately expose.

---

# Relationship to HQ Management

The physical HQ remains essential.

The smartphone and HQ have different roles:

**Phone:** portable information, communication, planning, study, monitoring, market browsing, mission access.

**HQ:** physical company operation, personnel, fleet, parcels, constructed departments, specialist equipment, major company actions.

A mature company may later unlock remote management conveniences, but those conveniences must be earned and must not make the evolving physical HQ irrelevant.

---

# Economy and Ecosystem Boundary

The smartphone can display Company Money and future economic systems, but it does not define them.

No wallet, blockchain, tokenomics, exchange-to-real-money, KYC, or ecosystem-token purchase flow is authorized by this document.

If a future DROPi ecosystem asset is added, it must remain optional, separately labeled, and non-pay-to-win under the boundaries in `06_Technical/ARCHITECTURE.md` and `01_GameDesign/COMPANY_SOCIETY_AND_MULTIPLAYER.md`.

---

# Canonical Rule

The player's smartphone is the portable window into the living DROPi Tycoon world. It should make information and communication feel natural while preserving the importance of physical places, people, qualifications, vehicles, infrastructure, and real gameplay actions.

---

End of Document
