# Document Information

Document: BUSINESS_DESIGN.md
Project: DROPi Tycoon
Version: 1.1.0
Status: Canonical — Business Design Authority
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-08

---

# DROPi Tycoon Business Design

## Purpose

This document is the canonical Business Design owner for DROPi Tycoon.

It defines how companies and economic organizations exist, form, grow, compete, employ people, own productive assets, interact with institutions, attract investment, fail/restructure, and create legacy inside the universe.

Authority order:

`VISION` -> `UNIVERSE_DESIGN` -> `BUSINESS_DESIGN` -> `LOGISTICS_DESIGN` -> `GDD` -> domain specializations.

This document is reconciled with `00_Project/PHASE1_GAME_ARCHITECTURE_DECISION_BASELINE.md`.

Detailed economy calculations remain owned by `02_Economy/*`. Detailed employee mechanics remain owned by `02_Economy/EMPLOYEES.md`. Detailed gameplay presentation remains owned by Game Design and UI documents.

---

# 1. Business Identity

A company is a persistent organization inside the world, not a menu container.

A company may own or control:

- Company Money and financial obligations;
- employees and member roles;
- vehicles/equipment;
- headquarters and departments;
- warehouses and logistics infrastructure;
- products and inventory;
- farms/factories/industrial assets when legitimately acquired;
- customer relationships;
- contracts;
- research and technology;
- shares/governance rights when those systems exist;
- concessions/access rights where governed;
- historical identity and founder legacy.

Company state should increasingly have visible operational consequences in the world.

---

# 2. Player Relationship to Business

The player is a person before being a company owner.

The canonical start is a poor pedestrian employee of a large fictional incumbent logistics employer, not a mature company founder.

A player may eventually be:

- independent citizen;
- employee;
- specialist;
- company member;
- founder;
- executive;
- infrastructure operator;
- producer/merchant;
- investor/shareholder;
- independent worker/contractor where rules allow.

Canonical relationship rules:

- one economic hero per account per World Instance;
- one primary Internal/Member company relationship at a time;
- compatible multiple jobs/contracts may exist when schedules, permissions and conflicts allow them;
- External investment is separate from operational membership;
- broader corporate control grows through legitimate shares, acquisitions and subsidiaries rather than unlimited shell companies used to manufacture fake competition or bypass territorial limits.

The current single-player runtime uses a starter company/operation for compatibility. That is legacy implementation truth until a migration is completed; it is not the canonical starting identity.

---

# 3. Company Formation

Creating a company is a progression milestone, not an unrestricted global menu action.

A future company-formation path may require multiple conditions, including:

- sufficient legitimate startup capital/resources from Personal Money, investors, authorized grants or other governed sources;
- entrepreneurship/business qualification;
- an available local business authorization/capacity opportunity;
- minimum specialist capability for the chosen service/industry model;
- an appropriate physical registration location or civic institution;
- compliance with gameplay rules for the target locality/World Instance.

Company formation creates a distinct Company Money treasury/accounting domain; it does not convert the founder's entire Personal Money balance into Company Money automatically.

Exact numbers are balancing decisions unless separately made canonical.

Municipal/company registration is a fictional gameplay abstraction, not a real legal procedure.

---

# 4. Territorial Capacity and Business Authorization

Cities or districts may limit active company density to create meaningful competition and believable local economies.

Roughly five meaningful last-mile competitors is an urban design target; rural localities normally support one to two meaningful competitors. These are capacity/balance targets, not permanently hardcoded universal counts.

Capacity rules must:

- reflect demand, population, infrastructure and market viability;
- create scarcity without permanent player exclusion;
- support NPC and future real-player companies;
- permit new entrants through turnover, expansion, alternative districts, auctions/permissions, failing-firm acquisition or other recoverable systems;
- avoid permanent monopoly lockout.

Business authorization is a world/economy mechanic, not a real-world licensing simulation.

---

# 5. Workforce Model

A company may include both real players and simulated/NPC workers.

The same economic role should use compatible authoritative workforce semantics regardless of whether control comes from a human player or simulation AI.

Possible long-term participation includes:

- couriers;
- dispatch/operations specialists;
- maintenance specialists;
- warehouse/sorting staff;
- agricultural/production staff;
- industrial specialists;
- drone specialists;
- multimodal transport specialists;
- finance/administration;
- research/technology;
- executives/managers;
- other roles added through explicit canonical extension.

The current runtime must not fabricate unsupported specialist roles merely for visual presentation.

---

# 6. Productive Employment Rule

Employees are productive company resources, not decorative costs.

When qualified staff, valid assignments, infrastructure, demand, inputs and operational capacity exist, employees should be capable of creating useful output such as:

- deliveries;
- sorting/handling;
- maintenance;
- dispatch support;
- infrastructure operation;
- production;
- agricultural work;
- specialist services.

Productivity must remain tied to authoritative state and costs.

No employee should generate unexplained money merely because they exist.

Starter player wages require actual work; offline absence does not manufacture salary.

---

# 7. Physical Company Operations

Business capabilities belong to real places where appropriate.

Examples:

- hiring/onboarding -> HR/staff area;
- fleet purchase/handoff -> Fleet Bay;
- dispatch/status -> Operations & Dispatch;
- parcel handling -> staging/sorting;
- maintenance -> constructed workshop;
- research -> research capability;
- drone operations -> valid DronePort/control facility;
- company registration -> civic/registration institution;
- production -> relevant farm/factory/industrial site;
- major infrastructure actions -> corresponding facility or world location.

The smartphone may show information, planning, communication, and unlocked remote controls, but it does not automatically bypass physical requirements.

---

# 8. Headquarters as Business Capability

A private company HQ is not a starting entitlement of the poor-employee phase.

When a company legitimately owns/operates an HQ, that HQ is the physical embodiment of company maturity.

It starts with only the minimum viable operational footprint and expands through governed construction.

Departments create capability, capacity, specialist workplaces, equipment, and visual growth.

Money alone does not automatically make every department operational. Departments may require qualified staff, company maturity, reputation, research, fleet scale, permits/authorizations, prerequisite infrastructure or operating demand.

See `01_GameDesign/HQ_PROGRESSION.md`.

---

# 9. Customer Market and Competition

Multiple companies may compete for customers in the same locality/world.

Customer acquisition and retention may respond to:

- price/value;
- delivery speed;
- reliability;
- service quality;
- customer rating;
- capacity;
- specialist services;
- geographic coverage;
- technology;
- support quality;
- loyalty programs;
- reputation;
- company history/trust;
- inventory/production availability where relevant.

A company can lose customers because its actual simulated performance deteriorates.

Competition should emerge from understandable business consequences rather than arbitrary score stealing.

---

# 10. Competitive Pressure and Anti-Griefing

Competitive mechanics may include price competition, marketing, contract bidding, technology, improved service quality, loyalty strategies, workforce recruitment, infrastructure advantage and bounded fictional disruption.

Any serious negative mechanic must remain reversible and include counterplay, cost, defense, cooldown, expiration, alternative access, restructuring or recovery.

No business mechanic may permanently destroy another player's account/person identity or make recovery impossible.

---

# 11. Products, Production and Commerce

A mature company may create/source/operate product lines in addition to logistics services.

Business capability may include:

- research/design;
- sourcing/procurement;
- agriculture/extraction relationships;
- manufacturing/processing;
- quality improvement;
- inventory/storage;
- marketing;
- transport;
- local/international sale.

Product systems must connect to real inputs, inventory, consumption/demand, logistics and regional economic differences rather than exist as isolated passive income.

---

# 12. Company Money

Company Money is the financial ownership/accounting domain belonging to a company.

It may be used for wages, inventory/procurement, vehicles, fuel/energy, maintenance, infrastructure, construction, employer-funded training, research, operating costs, expansion and authorized investments/acquisitions.

Company Money is distinct from Personal Money.

`Company Money` is not a permanent universal currency claim. Future national currencies may give company balances currency denomination while preserving company ownership.

Detailed accounting rules are owned by `02_Economy/ECONOMY.md`.

---

# 13. Company Lifecycle and Failure

Companies can grow, stagnate, restructure, be acquired, or fail.

Possible distress consequences include:

- cash-flow shortage;
- inability to pay wages/suppliers;
- loss of customers/contracts;
- asset sale;
- workforce reduction;
- restructuring;
- equity/control change;
- acquisition/merger;
- liquidation/closure.

Company failure does not delete the human player's identity. A former founder/executive may return to employment or other productive work and rebuild.

Detailed liquidation priority and settlement remain Economy/Technical specializations.

---

# 14. Productive Asset Relationships and Acquisition

A company may progress through relationships with productive facilities:

**occasional service -> recurring contract -> strategic investment -> governed acquisition/concession/control**, where eligible.

Eligible targets may include farms, factories, processing plants, warehouses, energy/industrial facilities and other productive nodes.

Acquisition/control requires appropriate combinations of:

- capital;
- transaction/sale/auction/concession availability;
- specialist workforce;
- authorizations;
- infrastructure;
- operating capability;
- ongoing inputs/maintenance.

Ownership does not create free production and does not bypass capacity/input requirements.

---

# 15. Company Valuation

A mature company may have an in-game valuation based on a basket of fundamentals such as revenue, sustainable profit, cash flow, assets, liabilities, customers, reputation, growth, infrastructure, technology, specialists, reliability, market demand, operational risk and strategic position.

Exact formulas remain detailed economy design.

---

# 16. Equity Structure

The owner-approved design starting point for a mature listed company remains:

- **51% internal/member pool**;
- **49% external/non-member market pool**.

This expresses a protected participation pool for active members and meaningful outside investment access.

Detailed issuance, pricing, dilution, voting classes, anti-collusion, market-making and legal abstractions require separate economic design.

---

# 17. Member Shares and Exit

Internal/member-restricted shares require current membership eligibility.

The owner-approved exit rule remains:

- when a player definitively leaves the company, all remaining Internal/Member shares held in that company are forfeited;
- forfeited units return to the company internal treasury pool;
- they are not destroyed or redistributed for free;
- eligible active members may later purchase treasury shares through an explicit paid Personal Money -> Company Money settlement;
- the departing player has no automatic right to keep Internal/Member shares after final exit;
- unrelated External portfolio holdings remain the player's investment assets.

Company equipment, employment rights, membership shares, executive control and external portfolio ownership are distinct.

---

# 18. Dividends

Companies may distribute dividends only from actual distributable game profit/cash under future economy rules.

The current design target is end-of-season settlement.

Dividends are not guaranteed rewards and must settle company-to-person without creating money from nothing.

---

# 19. Governance

Future governance may influence executive appointment/removal, strategic investment, infrastructure projects, dividend policy, expansion, high-value asset sales, mergers/acquisitions and founder-artifact decisions.

Voting power may depend on eligible voting shares, but governance must avoid permanent deadlock/griefing.

The founder can lose executive control through legitimate governance without losing historical Founder identity.

---

# 20. Founder and Executive Identity

The creator of a company becomes its permanent historical **Founder**.

Founder and executive control are separate.

The founder may begin as dominant owner/executive but can later lose active leadership through legitimate governance or investment changes.

Founder historical identity remains part of company history.

Late-game continuity mechanics may exist only as fictional gameplay systems with recovery paths; they must never claim to recreate a real human identity.

---

# 21. Company Heart / Founder Artifact

A mature company may create a unique historical collectible: the Company Heart / Founder Artifact.

It may function as a prestige/history object, museum exhibit, governed tradable in-game collectible, or source of bounded temporary morale/brand effects.

Loss/sale may create a temporary company shock, but company identity/history cannot be deleted, effects cannot be permanent, and recovery/replica/restoration must remain possible.

No blockchain/NFT system is required.

---

# 22. Infrastructure Ownership and Business Advantage

Companies may build, finance, lease, operate, own or obtain concessions around infrastructure where the world/economy permits.

Business advantages may include capacity, lower internal costs, routing priority, service revenue, market reach and access to new transport modes.

Essential infrastructure remains subject to fair-access safeguards. One company must not permanently softlock a locality/country by denying essential corridors or utilities.

---

# 23. World Instance Boundary

Companies, shares, productive assets, reputation, contracts and Company Money are World-Instance-local economic power by default.

A fresh World Instance does not import a mature world's company empire.

Prototype/local company state may be preserved historically but requires explicit migration and cannot silently become authoritative economic power in a fresh shared world.

---

# 24. Multiplayer Business Authority

Real-player employment, membership, ownership, share trading, governance, acquisitions and contested assets require trusted/server-authoritative business state.

Before activation, Technical Design must provide stable person/world identity, transaction integrity, concurrency/conflict resolution, anti-duplication, anti-cheat, moderation where communication exists, durable persistence and recovery.

Single-player/local simulation should establish business rules first where practical so multiplayer extends the same model rather than creating a second economy.

---

# 25. Relationship to Real DROPi

Tycoon business systems are fictional gameplay abstractions.

Company permits, shares, Company Heart, founder governance, products, concessions and other Tycoon mechanics must not be represented as real DROPi legal/business features unless separately confirmed by real DROPi canon.

The starting incumbent logistics employer is fictional by default unless a separate real-brand permission/licensing review explicitly authorizes otherwise.

---

# 26. Specialization Ownership

Detailed owners include:

- `02_Economy/ECONOMY.md` — stock-flow financial/economic authority;
- `02_Economy/PERSONAL_FINANCE.md` — personal money/living/insolvency;
- `02_Economy/EMPLOYEES.md` — workforce rules;
- `02_Economy/MARKET.md` and `PRICING.md` — market/pricing detail;
- `01_GameDesign/COMPANY_SOCIETY_AND_MULTIPLAYER.md` — player-facing company society/multiplayer;
- `01_GameDesign/HQ_PROGRESSION.md` — HQ progression;
- `03_Logistics/*` — logistics execution;
- `04_World/*` — physical company/world representation;
- `06_Technical/*` — technical authority and server architecture.

---

# Canonical Rule

**A DROPi Tycoon company is a living organization made of people, money, inventory, productive assets, customers, contracts, infrastructure, knowledge, risk, ownership and history. The person is distinct from the company; company growth must be legitimate and operational; productive facilities may be contracted/invested/acquired; and neither money nor ownership alone may bypass people, inputs, qualifications, infrastructure, capacity, fair access or governance.**

---

End of Document
