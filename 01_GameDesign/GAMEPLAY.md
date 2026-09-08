# Document Information

Document: GAMEPLAY.md
Project: DROPi Tycoon
Version: 2.0.0
Status: Canonical — Gameplay Specialization
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-08

---

# Gameplay Design

## Purpose

This document defines how the player experiences DROPi Tycoon moment to moment and across sessions.

It specializes `01_GameDesign/GDD.md`, `01_GameDesign/PROGRESSION.md`, and `00_Project/PHASE1_GAME_ARCHITECTURE_DECISION_BASELINE.md`.

The active product identity remains:

**Urban RPG + Business Tycoon + Local Marketplace + Multimodal Logistics + Infrastructure Builder + future Drone Network Simulation.**

The player is a person in the world, not a map cursor or permanent management screen.

Phaser 3 + TypeScript + Vite in `game-web/` remains the authoritative gameplay runtime; the installed Expo/React Native Android landscape shell hosts it rather than reimplementing gameplay.

---

# 1. Core Gameplay Promise

> **Your work leaves a mark.**

A meaningful play session should usually change at least one of:

- the player/person;
- an organization or asset the player belongs to/owns;
- the surrounding world/economy.

The player should understand what changed and why.

---

# 2. Canonical Starting Experience

The player begins:

- poor/financially constrained;
- on foot;
- with a smartphone and basic carrying equipment;
- as an employee of a large fictional incumbent delivery/logistics company;
- doing accessible light work such as flyers, letters and small parcels;
- without a privately owned mature company, HQ or vehicle.

The first goals are practical and self-authored: complete a legitimate shift, earn a wage, meet basic living needs, learn the city, improve equipment, save for a Bicycle or begin training.

The current runtime still initializes company-owned state for prototype compatibility. That does not redefine the canonical start.

---

# 3. Person-Level Session Loop

A common early loop is:

**Check current needs/capability**

-> **Choose eligible work / learning / personal action**

-> **Travel physically to the relevant context**

-> **Perform work / pickup / route / handoff / study / purchase**

-> **Consume time and Work Capacity / operating resources**

-> **Receive authoritative outcome and wage/payment where eligible**

-> **Pay/plan living and personal costs**

-> **Observe what changed**

-> **Choose the next goal**

The player is not required to spend every session working. Planning, training, shopping, maintenance, exploration, company decisions and community contribution can all be legitimate play depending on progression.

---

# 4. Economic / Logistics Loop

A mature economic opportunity follows causal world state:

**Need / Production Requirement**

-> **Demand / Procurement**

-> **Order / Contract**

-> **Inventory / Cargo / Custody**

-> **Qualified Work / Vehicle / Route / Infrastructure**

-> **Delivery / Production / Service**

-> **Settlement**

-> **Consumption / Use / Output**

-> **Visible Consequence / New Requirement**

The player may participate in only one part of that chain depending on their role.

---

# 5. Making Delivery Fun

Delivery cannot become repeated identical waypoint touching.

## Route Choice

Meaningful differences may include:

- stop order;
- shortcuts/pedestrian paths;
- traffic/congestion;
- parking/loading access;
- weather exposure;
- stairs/entrances where appropriate;
- time windows;
- fuel/charge/range;
- Work Capacity.

## Cargo Difference

Cargo can alter gameplay through:

- weight/volume;
- food/time sensitivity;
- fragile handling;
- medical priority;
- cold-chain;
- security/high value;
- pallet/industrial handling;
- special/hazardous requirements when governed;
- waste/reverse logistics.

## Destination Difference

Destinations can include homes, apartments, offices, shops, restaurants, pharmacies, hospitals, warehouses, construction sites, farms, factories, rail/air/port terminals and other valid facilities.

## Handoff Feedback

Successful handoff should clearly communicate custody change, route progress and meaningful recipient/economic effect through animation, sound/haptic feedback where appropriate, NPC/world reaction and concise information.

Avoid casino-like reward explosions for ordinary work.

---

# 6. Work Capacity and Living Economy

The player has finite Work Capacity.

Work, travel and some activities consume capacity/time; food, water and rest support recovery according to balancing rules.

The player also has personal living costs including housing and other governed expenses.

These mechanics exist to create planning and economic meaning, not repetitive survival micromanagement.

No real-money Work Capacity refill is permitted.

---

# 7. Career Freedom

DROPi Tycoon does **not** force one linear transformation from courier to CEO.

The player may remain or become:

- courier/transport worker;
- specialist;
- dispatcher/warehouse/maintenance/industrial worker;
- multi-job worker where compatible;
- independent contractor where enabled;
- company member;
- founder;
- executive;
- producer/merchant;
- infrastructure operator;
- investor;
- combinations allowed by role/membership rules.

Management becomes available as a path when the player legitimately acquires responsibility; it does not erase embodied work or make earlier professions worthless.

Late-game play may alternate between strategic management and direct world activity according to player choice and operational need.

---

# 8. Company Gameplay

Company gameplay begins only when the player legitimately has the relevant employment, membership, executive or ownership relationship.

Possible responsibilities include:

- hiring and staffing;
- fleet/equipment;
- dispatch/capacity;
- procurement/inventory;
- facilities/HQ;
- maintenance;
- production;
- contracts/customers;
- finance/cash flow;
- research/technology;
- infrastructure;
- investments/acquisitions;
- governance where enabled.

Physical operations remain embodied where their location matters.

---

# 9. Personal and Company Ownership

Personal Money and Company Money are separate.

The player does not automatically own company vehicles, funds, HQ or inventory merely because they can use/manage them through employment or executive authority.

A person has one primary Internal/Member company relationship at a time, may have compatible multiple jobs/contracts, and may hold external investments separately.

---

# 10. Travel and World Expansion

The player expands through real access:

**Neighborhood -> Locality -> City -> Region -> Country -> International Network -> later Frontier/Off-World**.

Strategic map selection is not economic teleportation.

Walking, road transport, public/contract transport, rail, air and river/sea infrastructure move the person/cargo with appropriate access, cost and time. Long journeys may use time compression.

---

# 11. Dynamic World

Variation comes from interacting systems rather than infinite random mission text.

Examples:

- changing demand/inventory;
- businesses opening/closing;
- construction;
- traffic;
- weather/day/night/seasons;
- shortages/surpluses;
- jobs and migration;
- production changes;
- infrastructure projects/failures;
- company competition;
- community projects;
- regional architecture/products;
- World Instance history.

The city should become familiar enough to feel like home but dynamic enough not to feel solved.

---

# 12. Failure and Comeback

Failure can be meaningful and severe.

The person may experience:

- low/zero Personal Money;
- housing loss;
- unemployment;
- failed contracts/work;
- vehicle/asset loss through governed rules;
- company failure/control loss;
- bankruptcy.

The world should explain the cause and show a legitimate next recovery step.

Human identity/history and valid earned capability survive normal bankruptcy. A former tycoon may return to basic employment and rebuild.

---

# 13. Session Lengths

The game should support different available time without making one duration uniquely efficient.

## Very short session

- inspect state/alerts;
- make a planning/purchase decision;
- review offline history;
- accept/schedule eligible future work.

## Short session

- complete a compact route;
- train/maintain equipment;
- contribute to a small company/community need.

## Medium session

- complete a meaningful shift/multi-stop route;
- settle costs/wages;
- make a meaningful purchase/training/company decision.

## Long session

- explore/travel;
- restructure operations;
- manage production/logistics chains;
- participate in major company/infrastructure/community work.

---

# 14. Offline / Return Experience

The world may continue while the player is away.

On return, the player should receive a concise causal summary:

- what changed;
- what obligations settled;
- what the company/world did legitimately;
- what did **not** happen because no active work occurred;
- what requires attention/recovery.

No generic magical offline income or punitive daily-login streak is required.

---

# 15. World Contribution and Attachment

Persistent physical evidence should create ownership/attachment.

Examples:

- personal room/home/equipment/vehicle;
- company HQ/fleet/warehouse/factory/farm;
- recurring NPC relationships;
- restored shop/business;
- construction/infrastructure progress;
- city/community projects;
- contribution history.

Community contribution can be asynchronous. Appreciation/recognition should not automatically convert into economic power.

---

# 16. Interface Boundary

The smartphone is the canonical portable interface for work, GPS, messages, study, marketplace information, news/weather and later authorized remote controls.

The interface supports the world rather than replacing physical systems with omniscient menus.

See `07_UI/PLAYER_SMARTPHONE.md`.

---

# 17. Real DROPi Transformation Boundary

Tycoon follows:

**REAL DROPi CONCEPT -> GENERIC SIMULATION MODEL -> TYCOON GAMEPLAY ABSTRACTION.**

The real DROPi repository remains authoritative for the real product.

Tycoon may use grounded concepts such as multimodal delivery, merchant/customer handoff, DronePorts, custody, storage and fallback, but Tycoon-specific game progression, values, infrastructure control, company society and fictional world outcomes must not be presented as deployed real DROPi facts.

The human/operator remains ground-bound; drones are separate logistics actors.

---

# 18. Future Ecosystem Asset Boundary

A future DROPi ecosystem asset remains optional and separate from Personal Money/Company Money.

It cannot gate core gameplay, buy Work Capacity, create speed/cargo advantages, bypass qualifications/infrastructure, convert into ordinary economic power, or become pay-to-win.

No wallet, blockchain, tokenomics or real-money settlement is activated by this gameplay canon.

---

# 19. Playability Gate

Every player-facing gameplay implementation should be evaluated against:

`09_Development/Research/GAME_LOGIC/R9_PLAYABILITY_INTEGRATION_GATE.md`

Key dimensions:

- FUN;
- CHOICE;
- CLARITY;
- VISIBLE_CONSEQUENCE;
- ECONOMIC_CAUSALITY;
- VARIETY;
- RECOVERY;
- ASYNC;
- ANDROID.

A feature can be technically correct and still fail if the work is dull, choices are fake, consequences are invisible, or mobile interaction is poor.

---

# 20. Runtime Boundary

The current runtime contains legacy/prototype assumptions including starter company state, direct order rewards and incomplete personal economy.

Those remain functional until dedicated migration PRs replace them.

Canonical documentation changes do not silently mutate runtime state/save schemas.

---

# Canonical Rule

**DROPi Tycoon gameplay begins with a real person doing understandable work in a living city, then expands through self-authored career, company, investment, production and world choices. Work must come from real economic causes, capability must be earned, travel must be embodied, failure must allow comeback, and meaningful play should leave a visible mark on the person, organization or world.**

---

End of Document
