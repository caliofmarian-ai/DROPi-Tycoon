# Document Information

Document: ROADMAP.md
Project: DROPi Tycoon
Version: 3.0.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-07

---

# Development Roadmap

## Purpose

This document defines the canonical strategic development order for DROPi Tycoon.

DROPi Tycoon is now a **mobile-first installed game**, beginning with Android.

The authoritative gameplay runtime remains Phaser in `game-web/`. The mobile application shell hosts that runtime for the installed product. Railway remains a secondary deployment, preview, diagnostics, and smoke-test surface.

The roadmap expands existing systems rather than replacing the current game.

---

# Strategic Authority

Roadmap decisions must follow:

`VISION -> UNIVERSE_DESIGN -> BUSINESS_DESIGN -> LOGISTICS_DESIGN -> GDD -> PROGRESSION -> domain canon -> ROADMAP execution planning.`

The historical milestone/epic/RBATCH package in `09_Development/Planning/` remains valuable traceability evidence, but its original Phase 0–9 ordering predates the 2026-09-07 canonical reconciliation.

Until issue #357 completes backlog reconciliation, old Phase numbers and dependency chains must **not** be executed blindly when they conflict with this Roadmap.

Historical IDs are preserved; they will be mapped, updated, absorbed, or closed deliberately rather than deleted.

---

# Development Philosophy

DROPi Tycoon follows these rules:

1. Keep the game playable after every major checkpoint.
2. Preserve completed work whenever it remains compatible with canon.
3. Build systems in dependency order, not issue-number order.
4. Establish deterministic single-player/local rules before contested multiplayer authority where practical.
5. Prepare server authority early enough that mature online ownership/markets are not bolted on after the entire economy is built.
6. Make visible systems feel like a polished mobile game, not developer panels.
7. Require installed Android owner review for visible gameplay changes.
8. Preserve Save compatibility or provide explicit migrations.
9. Keep Company Money sufficient for normal progression.
10. Do not activate blockchain/token/real-money systems without separate approval and review.

---

# Current Foundation — Already Built / Preserved

The current project is not reset by this roadmap.

Existing foundation includes, at minimum:

- authoritative Phaser gameplay runtime;
- installed Android application shell;
- walkable city/world geometry;
- player movement and camera controls;
- delivery lifecycle;
- money/economy settlement;
- reputation and customer reviews;
- employee management;
- productive employee + assigned-vehicle delivery income;
- vehicle ownership/selection;
- financial reporting;
- Save/Continue;
- physical HQ interior;
- physical Marketplace interior;
- HQ management surfaces tied to physical locations;
- progressive HQ construction foundation;
- visual/product-quality direction;
- player-smartphone canon;
- company-society/multiplayer canon;
- Universe, Business, and Logistics strategic design owners.

All compatible completed work remains part of the path forward.

---

# Strategic Wave 0 — Canonical Reconciliation and Backlog Alignment

## Objective

Make the documentation and GitHub backlog describe the same game before more feature implementation proceeds.

## Scope

- materialize Universe Design;
- materialize Business Design;
- materialize Logistics Design;
- reconcile Vision/GDD/Progression/Roadmap;
- reconcile strategic/domain ownership;
- audit current open issues;
- classify issues as KEEP / UPDATE / MERGE-ABSORB / CLOSE-HISTORICAL / NEW-CHILD-NEEDED;
- remap old milestone/epic/batch dependencies to current strategic waves;
- add missing executable issues.

## Status

**IN PROGRESS — issue #357.**

No new gameplay feature should leapfrog this reconciliation.

---

# Strategic Wave 1 — Embodied Local Game Quality

## Objective

Make the existing local courier game stable, readable, touch-safe, visually coherent, and physically believable on Android.

## Core areas

- mobile landscape controls;
- analog joystick/input safety;
- camera/free-look/zoom;
- readable HUD;
- visible courier and vehicles;
- improved city/world art;
- pedestrians/traffic/crossings;
- building/interior reliability;
- audio foundation;
- Save/Exit and platform polish;
- product-quality gate #317.

## Principle

This wave improves the experience of already-existing systems and must not be treated as temporary throwaway work.

Much of this wave is already implemented or underway through the modern owner-feedback issues.

---

# Strategic Wave 2 — Physical Local Company

## Objective

Turn the starter company from a collection of management values into a visibly productive organization.

## Core areas

- productive employee/fleet economy;
- progressive HQ departments;
- employee role visibility;
- Fleet Bay and valid vehicle storage/selection;
- Maintenance/Workshop capability;
- Operations & Dispatch;
- parcel staging/sorting foundation;
- vehicle maintenance costs tied to legitimate maintenance capability;
- company capacity/reliability consequences;
- player smartphone foundation replacing remaining portable abstract Company-menu behavior.

## Current anchors

- productive employee-fleet foundation: implemented through #346 stream;
- HQ progression: #343 / #352 and future department slices;
- smartphone foundation: #349;
- vehicle maintenance backlog must be reconciled with constructed Maintenance capability rather than implemented as an unrelated report-only number.

---

# Strategic Wave 3 — Personal Education, Professions and Legitimate Company Formation

## Objective

Separate personal capability from company capability so the player earns professions and organizational authority.

## Core areas

- personal XP/progression foundation;
- education/training model;
- smartphone theory-study surfaces;
- practical qualification/certification locations;
- bicycle/repair specialization;
- scooter/motorcycle/car/van qualifications;
- dispatch, warehouse, maintenance, business specializations;
- entrepreneurship qualification;
- company formation flow;
- civic/commercial-registry gameplay abstraction;
- local company authorization/capacity rules;
- explicit migration from the current starter-company model when required.

## Dependency rule

Advanced company systems must increasingly require the right combination of qualified people and infrastructure, not money alone.

---

# Strategic Wave 4 — Living City Economy and Competition

## Objective

Make the city an economy containing multiple companies, customers, merchants, goods, and meaningful competition.

## Core areas

- NPC competitor companies first where practical;
- customer acquisition and retention;
- service-quality competition;
- pricing/value strategies;
- reliability/capacity/reputation effects;
- marketing/loyalty gameplay;
- local business authorization scarcity with recoverable entry paths;
- dynamic demand/market foundations;
- local Marketplace depth;
- inventory/listing/product foundations;
- company products/production where separately implemented;
- warehouses and district growth where dependencies are satisfied.

## Principle

The city should remain playable without real human competitors.

Multiplayer later replaces or supplements control sources, not the business rules themselves.

---

# Strategic Wave 5 — Company Value, Investment and Governance Simulation

## Objective

Model mature company ownership and investment safely in deterministic simulation before contested online financial transactions.

## Core areas

- company valuation model;
- business loans/investors;
- 51% internal/member pool + 49% external market pool design baseline;
- share issuance/ownership rules;
- internal member-share exit/redeem rules;
- external portfolio ownership;
- distributable profit/dividends;
- end-of-season dividend default;
- voting/governance;
- founder historical status vs executive control;
- anti-deadlock/anti-collusion rules;
- Company Heart / Founder Artifact design implementation planning;
- Economic Museum integration planning.

## Principle

Company value must respond to real business fundamentals and risk, not a simplistic single-number exploit.

---

# Strategic Wave 6 — Server-Authoritative Online Society Foundation

## Objective

Prepare real multiplayer before activating shared ownership, shared markets, or contested world assets.

## Technical foundation

- stable player/account identity;
- public profile vs private account boundary;
- authentication/session model;
- server-authoritative player/company/economy state;
- migration from local Save state;
- transaction integrity;
- anti-duplication;
- concurrency/conflict resolution;
- reconnect/recovery;
- shard/world membership;
- moderation/report/block/rate-limit infrastructure;
- privacy/media ownership for avatars and communication.

## Player/social activation

After authority is ready:

- real-player company membership;
- real-player employment/specialist roles;
- presence;
- company/local/world communication;
- friends/contacts;
- authoritative player marketplace transactions;
- authoritative investment/share transactions where enabled;
- cooperative and competitive company interaction.

## Offline / Low-Population Rule

NPC companies, workers, merchants, and customers remain valid.

Normal gameplay must not collapse when no other human players are available.

---

# Strategic Wave 7 — Regional and Multi-City Multimodal Logistics

## Objective

Expand beyond one city without creating one giant always-running map.

## Core areas

- multiple cities/active-city transition architecture;
- regional warehouses/distribution centers;
- highway gateways;
- regional contracts;
- explicit inter-city cargo/custody legs;
- rail corridors/terminals;
- DronePort networks;
- airport cargo terminals;
- river/sea ports;
- multi-leg transfer chains;
- regional products/demand dependencies;
- infrastructure ownership/concessions under fair-access safeguards.

## Current anchor

Issue #344 contains useful multimodal hub/custody foundations and should be reconciled with older multi-city/international planning rather than duplicated.

---

# Strategic Wave 8 — International / Global Corporation and Automation

## Objective

Connect country/logical worlds into large-scale multimodal business and logistics networks.

## Core areas

- country/world entry;
- cross-border gameplay abstractions;
- customs handling;
- international air/sea/rail networks;
- global products/trade;
- franchise/network structures;
- worldwide infrastructure coordination;
- advanced AI routing/dispatch;
- predictive demand;
- automation;
- robotics/autonomous warehouses;
- mature corporate governance at global scale;
- resilient global logistics optimization.

## Principle

Automation remains subject to capacity, infrastructure, cost, maintenance, qualification, and authority. It does not become infinite passive income.

---

# Strategic Wave 9 — Frontier / Planetary Expansion and Optional Ecosystem Review

## Objective

Extend the same society/business/logistics principles into very-late-game frontier environments only after Earth-scale systems are mature.

## Possible areas

- space logistics gateways;
- orbital infrastructure;
- planetary settlements/worlds;
- off-world products/resources;
- interplanetary cargo/custody;
- frontier company/infrastructure governance;
- new professions and technologies.

## Optional DROPi Ecosystem Asset Review

Only at a separately approved stage may the project evaluate an optional shared DROPi ecosystem asset/token.

This requires, before implementation:

- separate repository/cross-project canon;
- economic design;
- game-balance review;
- security architecture;
- legal/regulatory review where applicable;
- monetization/UX review;
- explicit owner approval.

This Roadmap does not authorize blockchain, wallet, smart contracts, tokenomics, exchange, KYC, or real-money rewards.

Company Money remains sufficient for normal gameplay.

---

# Cross-Wave Systems

Some systems evolve across several waves rather than belonging to one monolithic phase.

## Drone Progression

Drone gameplay may evolve through:

- personal theory/qualification;
- research;
- workshop/maintenance capability;
- DronePort construction;
- operator/infrastructure requirements;
- local delivery;
- regional networks;
- autonomous operations;
- international/global use.

Therefore old “Drone Phase 4” backlog items remain useful but must be remapped by dependency, not executed as one block.

## Warehouses

Warehouse capability may begin in local company/city growth and later expand into regional/global networks.

## AI / Automation

AI may assist locally before global scale, but progressively stronger automation requires the underlying business/logistics systems to exist first.

## Multiplayer

Identity/server authority arrives before mature shared transactions; large shared worlds expand afterward.

Multiplayer is therefore no longer canonically treated as only a final Phase 9 feature.

---

# Quality and Verification Rules

Every implementation wave must preserve:

- green automated tests;
- TypeScript/build health where applicable;
- Save compatibility/migrations;
- Android input safety;
- mobile performance;
- owner-visible quality;
- physical-world coherence;
- exactly-once economic settlement;
- authority boundaries;
- real DROPi separation.

Visible gameplay changes require installed Android owner review before their acceptance issue is closed.

Documentation/planning-only PRs require CI and canonical consistency review but do not require a new APK or visual Android acceptance unless they change runtime behavior.

---

# Planning Architecture Reconciliation Rule

The existing planning package currently contains:

- 21 milestones;
- 46 epics;
- 54 RBATCH items;
- executable issues and planning placeholders;
- a dependency graph based on the older Phase 0–9 strategy.

Those identifiers are preserved for historical traceability.

Under issue #357, every open item must be classified and mapped to this Roadmap.

Allowed reconciliation outcomes are:

- **KEEP** — scope/order still correct;
- **UPDATE** — useful item, but title/scope/dependency/wave requires change;
- **MERGE-ABSORB** — useful content belongs inside a newer authoritative issue;
- **CLOSE-HISTORICAL** — completed/superseded tracking item with sufficient evidence;
- **NEW-CHILD-NEEDED** — this Roadmap requires an executable issue that does not yet exist.

No historical ID should be deleted from repository history.

---

# Immediate Execution Order After Reconciliation

The near-term sequence is:

1. complete canonical/backlog reconciliation under #357;
2. complete/close any pending owner acceptance for already-merged visible work, including #352 where applicable;
3. continue progressive HQ/specialist capability only according to reconciled dependencies;
4. implement the player smartphone foundation #349;
5. establish personal education/specialization foundation;
6. establish legitimate company formation/authorization;
7. build living local competition/economy;
8. progress toward ownership/governance simulation;
9. establish server-authoritative online foundations before real shared economic state;
10. expand regionally/internationally in staged multimodal slices.

---

# Success Metric

Development is successful when every strategic wave deepens the same coherent experience:

**person -> profession -> productive organization -> competitive city economy -> ownership/governance -> shared society -> regional/global logistics -> frontier legacy.**

The player should never feel that a later phase discarded the game they learned earlier.

---

End of Document
