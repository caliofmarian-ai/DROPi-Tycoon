# Document Information

Document: COMPANY_SOCIETY_AND_MULTIPLAYER.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical Gameplay Specialization
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-07

---

# Company Society and Multiplayer Gameplay

## Purpose

This document canonically specializes the long-term company, society, competition, education, ownership, governance, multiplayer, and world-expansion direction of DROPi Tycoon.

It is subordinate to `00_Project/VISION.md` and `01_GameDesign/GDD.md`. It must be interpreted together with the authoritative economy, logistics, world, UI, technical, and persistence documents. It does not activate every system described here in the current runtime.

The project remains:

**Urban RPG + Business Tycoon + Local Marketplace + Multimodal Logistics + Infrastructure Builder + future Drone Network Simulation.**

**Game first. Ecosystem second.**

Company Money remains sufficient for normal gameplay. No real DROPi service, future ecosystem asset, or real-money participation is required to enjoy or progress through the game.

---

# 1. Core Social Fantasy

The player begins as one visible person in a living city and can grow into a founder, specialist, employee, investor, infrastructure operator, or executive participant in a much larger logistics society.

The world must not become a collection of detached management screens. People, companies, customers, facilities, vehicles, goods, infrastructure, and institutions must increasingly exist as visible world entities with understandable consequences.

The long-term fantasy is not simply "own the biggest delivery company." It is:

- learn useful professions;
- perform work personally;
- form or join organizations;
- specialize;
- build productive infrastructure;
- compete and cooperate with other companies;
- create products and logistics networks;
- invest in companies;
- influence local and global economies;
- leave a persistent company and founder legacy.

---

# 2. Player Identity, Education and Specialization

Player progression is gradual. Experience, progression points, Company Money, training access, facilities, and prerequisites may all contribute to education.

Canonical specialization families may include:

- smartphone and delivery-app literacy;
- walking courier fundamentals;
- bicycle riding;
- bicycle repair and maintenance;
- electric scooter operation;
- motorcycle operation;
- car driving;
- van driving and cargo handling;
- dispatch and route operations;
- entrepreneurship and company administration;
- drone operator/pilot qualification;
- drone maintenance and technical operations;
- aircraft pilot/air-cargo operations;
- ship/fluvial/sea operations;
- rail/locomotive operations;
- warehouse, sorting, maintenance, finance, research, and other future specialist branches.

Not every specialization is available from the beginning.

Some qualifications are personal and can be studied independently. Others require:

- membership in a company;
- a constructed company department;
- specialist equipment;
- an instructor or qualified employee;
- research;
- a municipal, infrastructure, or progression prerequisite.

A company cannot unlock an advanced building, vehicle, service, or technology merely because it has enough money. Required trained people and required infrastructure must also exist when the relevant system calls for them.

This creates a two-way progression relationship:

**Player grows the company -> company unlocks learning opportunities -> specialists unlock new company capability.**

---

# 3. Company Formation and Local Authorization

Creating a company is a major progression milestone rather than a free menu action.

A future company-formation flow may require:

- a meaningful Company Money threshold;
- entrepreneurship/business qualification;
- an available company slot or operating authorization in the target area;
- required starting personnel or specialist capacity;
- an appropriate physical registration location such as a simulated city hall or commercial registry.

Cities and districts may limit the number or density of companies that can be directly authorized in an area. Capacity must be designed for competition and world believability without permanently excluding players from progression.

Municipal registration and authorization are fictional gameplay abstractions. They must not be presented as accurate real-world legal procedures.

---

# 4. Companies as Mixed Human and Simulated Organizations

DROPi Tycoon is designed to support multiplayer society in the long term.

Company members may eventually be:

- real player founders;
- real player employees;
- real player specialists;
- real player executives;
- real player investors;
- simulated/NPC employees and operational agents.

The game must remain playable when a world has few human players. Therefore simulated personnel remain valid and necessary.

Real players can eventually take roles that are currently simulated, but all roles must use one authoritative company/workforce model rather than parallel "real player employee" and "NPC employee" economic truths.

The current runtime contains only the authoritative employee roles already defined in `02_Economy/EMPLOYEES.md`. Future roles must be added deliberately; scenes must not fabricate managers, dispatchers, mechanics, pilots, or other specialists before the model supports them.

---

# 5. Physical Company Operations

The company is not an abstract global menu.

Company capabilities belong to physical places where appropriate:

- Hiring and onboarding -> staff/hiring area;
- Fleet purchase and handoff -> fleet bay;
- Dispatch and company status -> Operations & Dispatch;
- Parcel handling -> staging/sorting;
- Maintenance -> constructed workshop;
- Drone operations -> compatible DronePort/control facility;
- Advanced research -> constructed research capability;
- Government/registration actions -> relevant simulated civic institution;
- Airport/port/rail operations -> corresponding infrastructure.

Portable information and communication belong primarily to the player's smartphone. See `07_UI/PLAYER_SMARTPHONE.md`.

The smartphone may inspect, communicate, plan, monitor, study, and access remote services as unlocked, but it does not automatically bypass physical-location requirements.

---

# 6. Competition and Customer Acquisition

Multiple companies may coexist in the same city and compete for customers.

Customer acquisition and retention may respond to:

- price/value;
- service speed;
- on-time delivery rate;
- reliability;
- service quality;
- customer rating;
- geographic coverage;
- available vehicle and infrastructure capacity;
- specialist services;
- technology;
- customer support;
- marketing;
- loyalty programs;
- company reputation and history.

Company rating may decrease for simulated causes such as:

- repeated late deliveries;
- failed deliveries;
- damaged or mishandled goods;
- poor customer experience;
- insufficient capacity;
- unsafe or unreliable operations;
- financial distress that degrades service;
- broken promises or contract failures.

A company can lose customers naturally. Other companies can attract those customers by offering better value or differentiated services.

---

# 7. Competitive Disruption and Anti-Griefing

The game may later include bounded competitive disruption or "sabotage" mechanics as strategic gameplay.

Such mechanics must be fictional, non-violent, reversible, and have counterplay. Examples can focus on lawful-feeling game abstractions such as aggressive marketing, poaching contracts, price campaigns, intelligence/research advantages, temporary reputation contests, or competitive bids.

The system must not support:

- real-world harmful instructions;
- harassment of real players;
- permanent destruction of another player's identity or account;
- irreversible world lockout;
- griefing that makes recovery impossible.

Every serious negative competitive effect requires a recovery path, cost, cooldown, defense, or expiration mechanism.

---

# 8. World Hierarchy and Multiplayer Worlds

The world expands in stages:

**Neighborhood -> locality -> city -> region/county -> country -> international network -> very-late-game planetary/off-world network.**

A country may be presented to players as one logical world or shard for social identity and competition. This is a gameplay concept, not a technical requirement that one country equals one physical server.

Technical server topology, sharding, replication, regional hosting, migration, and load balancing remain implementation concerns under Technical architecture.

Active simulation and rendering remain region-scoped. The project must not attempt to keep an entire planet as one always-rendered active map.

---

# 9. Inter-City and Multimodal Expansion

As players and companies progress, travel and logistics expand beyond one city through staged infrastructure:

- side roads and highways;
- rail corridors and terminals;
- airports and air cargo;
- rivers and fluvial ports;
- sea ports and maritime routes;
- distribution centers and warehouses;
- DronePorts and drone networks;
- future space/planetary gateways.

This direction extends the staged architecture in issue #344. It must not be implemented as one giant PR.

Companies may build, finance, lease, operate, win concessions for, or otherwise obtain gameplay control over strategic infrastructure when the relevant system is implemented.

Strategic control may grant:

- capacity;
- routing priority;
- service revenue;
- lower internal logistics cost;
- access to new transport modes;
- competitive reach.

Critical shared infrastructure requires public-access or anti-monopoly safeguards so one company cannot permanently prevent an entire world from progressing.

---

# 10. Goods, Production and Regional Demand

Companies may eventually develop proprietary goods or product lines in addition to logistics services.

A company can:

- research a product;
- improve it;
- manufacture or source it;
- store it;
- market it;
- transport it;
- sell it locally or internationally.

Regions can have different demand, scarcity, production capacity, and dependencies for categories of goods. These relationships create logistics opportunities and strategic trade routes.

Regional dependency must generate economic pressure and opportunity, not permanent starvation or irreversible griefing. Essential systems must have alternative supply paths or recovery mechanisms.

---

# 11. Company Valuation and Local Exchange

A mature company may eventually become listed on an in-game local exchange.

The owner-approved design starting point is:

- **51% internal/member share pool**;
- **49% external/non-member market pool**.

This percentage model is a gameplay design baseline and may later receive detailed balancing while preserving the principle that internal members retain a structurally protected participation pool and outside investors can materially participate.

A player may hold shares in multiple companies, including neighboring competitors, subject to future anti-collusion and market-integrity rules.

Company valuation must not be a simplistic single linear number. It should eventually respond to a basket of factors such as:

- revenue;
- sustainable profit;
- cash flow;
- assets;
- debt and liabilities;
- reputation;
- customer base;
- growth rate;
- technology;
- infrastructure;
- employee/specialist capability;
- service reliability;
- market demand;
- operational risk;
- strategic position.

A stronger company therefore becomes more valuable and harder to displace naturally through the economy.

---

# 12. Shares, Membership and Exit

Internal/member shares represent participation tied to active membership and company governance.

A member who wants to leave should normally be able to sell, transfer, or redeem eligible internal holdings through defined company-market rules before departure.

If a player leaves a company while still holding member-restricted shares that cannot legally remain with a non-member under the game rules, those shares return to the company treasury/internal pool and become available for eligible internal acquisition. The departing player does not carry those member-restricted governance rights into the new company.

This consequence must be clearly disclosed before departure and must not silently confiscate external investments.

External market shares held in other companies are separate portfolio assets and are not automatically lost merely because the player changes operational company membership.

Assigned company equipment, employment permissions, and internal operational rights are also separate from external investment ownership.

---

# 13. Dividends and Governance

Companies may distribute dividends from distributable profit.

The default design target is an **end-of-season dividend settlement**, because it creates a readable business cycle and discourages high-frequency exploitation. Later governance or company progression may support alternative cadences if balancing permits.

Dividends must come from actual distributable game profit/cash under the economy rules; they are not guaranteed rewards.

Voting power may scale with eligible voting shares. Governance can influence meaningful company decisions, but veto systems must not create permanent deadlocks.

Future governance may include:

- executive appointment/removal;
- large capital investments;
- infrastructure projects;
- dividend policy;
- mergers/acquisitions when separately designed;
- strategic expansion;
- high-value asset sale;
- company-heart/artifact decisions.

---

# 14. Founder, Executive Control and Legacy

The player who creates a company becomes its permanent historical **Founder**.

Founder and executive control are not the same thing.

The founder may begin with the strongest internal ownership and leadership position, but over time legitimate investment and governance can allow other players to obtain stronger executive influence or replace the founder as active executive leader.

The original founder keeps the Founder historical role even after losing executive control.

Certain late-game legacy unlocks may require founder continuity. If the real founder becomes inactive for a sufficiently long period, a future researched and expensive **Founder Legacy / Founder Replica** system may provide continuity without pretending to recreate a real person. This is fictional gameplay technology and must be balanced so inactivity cannot permanently freeze a mature company.

---

# 15. Company Heart and Economic Museum

A sufficiently mature company may create a unique historical collectible tied to its founder and identity: the **Company Heart / Founder Artifact**.

It can serve as:

- a company-history object;
- a prestige collectible;
- a museum object;
- a high-value tradable game asset under controlled rules;
- a symbol that can be physically transported or protected.

If the original artifact leaves company control, the company may suffer a temporary brand, morale, productivity, or valuation shock for defined seasons. The new holder may gain a bounded prestige/morale benefit.

However:

- the company's database identity and history can never be deleted because another player bought the artifact;
- the penalty is never permanent;
- a recovery, replica, restoration, or reacquisition path must exist;
- this mechanic must not enable permanent griefing.

Cities may contain an **Economic Museum** that records major company history and displays original artifacts, replicas, founder memorabilia, products, and souvenirs.

The Company Heart is an in-game collectible concept. It is **not** an NFT and does not require blockchain.

---

# 16. Multiplayer Authority and Migration Principle

Current DROPi Tycoon gameplay is not yet a server-authoritative multiplayer economy.

Before real multiplayer company ownership, trading, chat, shares, or contested world assets are activated, the project requires a dedicated technical architecture and migration stage covering at minimum:

- player accounts and stable identity;
- server-authoritative company/economy state;
- concurrency and conflict resolution;
- anti-cheat and anti-duplication rules;
- authoritative market transactions;
- moderation and reporting for player communication;
- persistence and recovery;
- shard/world membership;
- migration from current local Save without corrupting existing progress;
- offline/low-population behavior;
- capacity and performance architecture.

Single-player simulation should establish the business rules first where practical. Online authority should then extend those rules instead of creating a second economy.

---

# 17. DROPi Ecosystem Asset Boundary

A future DROPi ecosystem token or asset may eventually have an optional role across DROPi Tycoon and the real DROPi ecosystem.

This document does **not** implement or authorize:

- blockchain;
- smart contracts;
- a wallet;
- ticker or supply;
- tokenomics;
- exchange functionality;
- KYC;
- real-money rewards;
- cash-equivalent gameplay;
- token-gated mandatory progression.

Company Money remains the authoritative gameplay currency and must remain sufficient for normal progression.

Any future ecosystem asset must be optional and cannot create pay-to-win power, skip specialist qualifications, bypass permits, replace earned infrastructure, or guarantee business success.

The technical isolation in `06_Technical/ARCHITECTURE.md` remains binding.

---

# 18. Relationship to the Real DROPi Product

Tycoon follows this translation rule:

**REAL DROPi CONCEPT -> GENERIC SIMULATION MODEL -> TYCOON GAMEPLAY ABSTRACTION**

The real DROPi repository and its canonical reference material remain authoritative for the real product.

A Tycoon invention such as a Company Heart, fictional commercial-registry slot, planetary logistics gateway, governance mechanic, or competitive disruption system must never be presented as an existing real DROPi feature.

---

# 19. Staged Implementation Order

This document is long-term canon, not one implementation batch.

The preferred staged order from the current project state is:

1. productive employee/idle-vehicle economy (#346);
2. progressive HQ departments and real specialist gates (#343);
3. player smartphone foundation and removal of remaining abstract player-facing company-menu concepts;
4. player education/specialization foundation;
5. single-player company registration, territorial capacity, competition, customer loyalty and rating depth;
6. company valuation, shares, dividends, governance and founder continuity simulation;
7. server-authoritative multiplayer architecture and Save migration design;
8. player accounts, company membership, communication and authoritative market transactions;
9. staged inter-city/international multimodal expansion (#344);
10. late world-scale infrastructure and planetary expansion;
11. only after separate cross-project, economic, security and legal review: optional ecosystem-asset integration.

Every stage must receive its own issue/batch/PR boundaries, tests, CI verification, and installed Android owner review when visible gameplay changes are involved.

---

# Canonical Rule

DROPi Tycoon grows from one courier into a living society of people, companies, markets, infrastructure and logistics networks. Progression must be earned through capability, specialization, people, infrastructure, economic performance and strategic decisions—not through abstract menu unlocks or pay-to-win shortcuts.

---

End of Document
