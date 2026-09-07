# Document Information

Document: UI.md
Project: DROPi Tycoon
Version: 1.1.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-07

---

# User Interface System

## Purpose

This document defines the User Interface (UI) system of DROPi Tycoon.

The UI provides the player with the information and controls required to inhabit the world, perform deliveries, manage a company, understand the simulation, and make strategic decisions.

---

# UI Philosophy

DROPi Tycoon uses a **world-embodied interface**.

The player should feel like a person inside a living logistics world rather than an administrator navigating unrelated abstract dashboards.

Information and actions should appear through the surface that makes sense in the world:

- immediate movement/action information -> gameplay HUD;
- portable information/communication -> player smartphone;
- hiring/fleet/operations/parcels -> physical HQ departments and terminals;
- local trade -> physical Marketplace plus progressively unlocked phone browsing;
- civic/company authorization -> relevant simulated city institutions;
- advanced infrastructure -> the facility that owns the operation.

The player should always understand:

- current company status;
- available actions;
- important events;
- operational problems;
- growth opportunities;
- where an action must physically occur.

The UI should provide information without overwhelming the player.

---

# UI Design Principles

## Clarity

Information must be easy to understand.

Critical gameplay state should be visible or one natural interaction away.

---

## Consistency

Similar actions should use similar interface patterns.

Portable phone apps, physical terminals, and HUD controls may look different but must share a coherent visual language.

---

## Efficiency

The player should access important information quickly without eliminating meaningful physical gameplay.

Convenience must not silently bypass progression, required specialists, departments, vehicles, infrastructure, or locations.

---

## Progressive Information

The interface reveals complexity gradually.

New phone apps, departments, reports, maps, market tools, and operational surfaces appear as the player and company develop.

---

## Game Presentation

Normal player-facing UI must not resemble a debug dashboard.

Avoid:

- raw internal identifiers;
- developer state dumps;
- placeholder admin panels as final presentation;
- globally accessible menus for actions that belong to physical world locations.

See `07_UI/VISUAL_DESIGN_SYSTEM.md`.

---

# Main UI Areas

## Gameplay HUD

The HUD supports immediate play while preserving world visibility.

It may show:

- Company Money or concise economic status;
- active objective/mission;
- Action control;
- analog movement control on touch devices;
- minimap;
- camera/zoom/recenter controls where appropriate;
- critical alerts.

The HUD must remain compact enough for Android landscape and must not become the complete company-management surface.

---

## Player Smartphone

The smartphone is the canonical portable interface.

It may progressively provide:

- delivery app and mission tracking;
- GPS/map/navigation;
- company/employee communication;
- local/world chat when multiplayer exists;
- local/world marketplace browsing when unlocked;
- weather, city and economic information;
- training/study;
- music/radio/media;
- money and asset overview;
- future investment/share information;
- future qualified drone monitoring/control.

The smartphone does not bypass physical actions that canonically require a facility or department.

See `07_UI/PLAYER_SMARTPHONE.md`.

---

## Physical HQ Management Surfaces

The old concept of a globally available abstract `Company` menu is deprecated as a player-facing navigation model.

Company management is anchored in the physical HQ.

Current/future HQ surfaces include:

- Hiring & Staff;
- Fleet Purchase;
- Vehicle Handoff / Fleet Bay;
- Operations & Dispatch;
- Parcel Staging;
- finances/reviews/status through appropriate HQ operational surfaces;
- progressively constructed maintenance, research, DronePort, locker, and other departments.

Opening a physical management surface must preserve the player's live gameplay context. Returning must restore the player to the originating HQ location rather than respawning at the HQ entrance.

---

## Map and GPS Interface

World navigation can be represented at several scales:

- immediate minimap in gameplay;
- camera/free-look inspection;
- smartphone GPS/map;
- future city/regional/national logistics maps.

Map interfaces may display:

- player position;
- zones and districts;
- buildings and customers;
- routes;
- company infrastructure;
- traffic/weather information when available;
- future inter-city/multimodal connections.

Map information must derive from authoritative world state.

---

## Logistics Information

Logistics information may appear through the HUD, phone, Operations & Dispatch, parcel areas, fleet facilities, and other context-appropriate surfaces.

It may include:

- active orders;
- parcel state;
- routes;
- vehicles;
- employees/assignments;
- delivery status;
- capacity and operational constraints.

The UI displays the result of logistics rules; it does not own those rules.

---

## Economy and Investment Information

Financial information may be shown through HQ operations/finance surfaces and, when unlocked, smartphone summaries.

It may include:

- income;
- expenses;
- Company Money;
- profit/loss;
- employee contribution;
- vehicle operating cost;
- investments;
- company valuation;
- future shares/dividends/portfolio data.

The economy remains authoritative in Economy systems. UI presentation cannot mint money, shares, dividends, or rewards independently.

---

## Marketplace Interfaces

The physical Marketplace is a world location.

The smartphone may later support remote browsing and online marketplace features, but physical goods still move through the logistics simulation.

Player-to-player trading must remain visibly future/locked until a server-authoritative multiplayer market exists.

---

# UI Information Hierarchy

Information is organized by importance and context.

## Critical Information

Visible during gameplay or immediately accessible.

Examples:

- active objective;
- immediate delivery state;
- critical warnings;
- concise money/status feedback.

---

## Operational Information

Available through the relevant phone app or physical terminal.

Examples:

- employee status;
- fleet state;
- route details;
- company performance;
- finances;
- reviews.

---

## Advanced Information

Available after progression or through specialized surfaces.

Examples:

- optimization analytics;
- valuation;
- share ownership;
- infrastructure utilization;
- multimodal network performance.

---

# Notifications

The UI provides feedback through context-appropriate notifications.

Examples:

- delivery completed;
- new opportunity available;
- vehicle problem;
- weather change;
- employee event;
- company rating change;
- market/investment event when those systems exist.

Notifications should inform, not distract.

Phone notifications may become a major delivery mechanism for non-critical events.

---

# UI and Game Systems

The UI communicates with game systems through defined interfaces.

The UI does not contain gameplay truth.

Gameplay systems calculate:

- eligibility;
- money;
- ownership;
- assignments;
- delivery results;
- progression;
- market outcomes;
- multiplayer authority.

The UI renders state and requests permitted actions.

---

# Current Runtime Scope

The current playable implementation includes a bounded subset of the long-term UI:

- gameplay HUD;
- physical HQ and Marketplace interiors;
- physical HQ management terminals using existing management surfaces;
- delivery/company/fleet/employee information;
- Android touch controls;
- camera/minimap controls.

The complete player smartphone, multiplayer chat, online player market, share exchange, and advanced multimodal management are future staged systems unless separately implemented and verified.

---

# Future Expansion

Possible future UI systems include:

- richer player smartphone apps;
- advanced analytics;
- AI assistant interface;
- drone control/monitoring center;
- multi-city and world logistics maps;
- company exchange and governance interfaces;
- multiplayer communication and social/company surfaces;
- training/certification interfaces.

---

# Balance Principles

The UI must:

- support decisions;
- reduce confusion;
- present useful information;
- preserve immersion;
- keep the player focused on strategy and physical gameplay;
- reveal complexity progressively;
- avoid replacing the game world with menus.

---

# Canonical Rule

The interface should make DROPi Tycoon's complex simulation feel natural inside the world. Portable information belongs on the smartphone; physical company work belongs in physical facilities; immediate play belongs on the HUD. The player should feel like a person building a company, not an operator of a debug dashboard.

---

End of Document
