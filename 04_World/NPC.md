# Document Information

Document: NPC.md
Project: DROPi Tycoon
Version: 1.2.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-09

---

# NPC System

## Purpose

This document defines the Non-Player Character (NPC) system of DROPi Tycoon.

NPCs represent the people and organizations that exist inside the game world.

They create:

- Delivery demand
- Business opportunities
- Workforce
- Social feedback
- World activity

---

# NPC Philosophy

NPCs are not simple objects that generate orders.

They represent the living population of the world/locality.

A successful player/company must understand and serve the needs of the community and may later recruit, employ, train or contract eligible NPC workers under the same constrained economy used for human players.

---

# NPC Categories

The world contains different types of NPCs.

---

# Customers

## Purpose

Customers create delivery demand.

Examples:

- Residents
- Workers
- Families
- Individual consumers

---

## Characteristics

Customers have:

- Location
- Needs
- Preferences
- Satisfaction level
- Delivery history

---

## Customer Behavior

Customers may consider:

- Delivery speed
- Price
- Reliability
- Company reputation

High-quality service creates loyalty.

---

# Business Owners

## Purpose

Business owners create commercial opportunities.

Examples:

- Restaurant owners
- Shop owners
- Local companies
- Farm/factory/productive-enterprise owners where modeled

---

## Characteristics

Businesses have:

- Order volume
- Contract potential
- Service requirements
- Growth potential
- Workforce requirements
- Productive/service capability where relevant

---

## Business Relationships

The player can develop relationships through:

- Reliable deliveries
- Long-term contracts
- Quality service

Strong relationships create stable revenue and may expose legitimate workforce, investment, supplier or acquisition opportunities under their owning systems.

---

# Employees

## Purpose

Employees represent company workforce.

They allow a company to scale beyond one player's personal abilities.

---

## Employee Attributes

Employees may have:

- Profession / specialist family
- Qualifications
- Experience
- Reliability
- Salary/compensation cost
- Availability
- Current locality / mobility constraints
- Employment/contract relationship
- Compatible facilities/equipment requirements

---

## Employee Progression

Employees can improve through:

- Experience
- Training
- Better equipment
- Education/qualification paths where governed

---

# Competitor NPCs

## Purpose

Future versions may introduce competing companies.

Competitors create:

- Market pressure
- Strategic challenges
- New decisions

---

# NPC Simulation

NPC behavior is influenced by:

- Location
- Time
- Economy
- Weather
- Company reputation
- Employment and available work
- Qualifications and compatible opportunities

---

# NPC Relationships and Entity Loyalty

The company and player build reputation and relationships through real interactions.

Positive relationships create:

- More orders
- Better contracts
- Customer loyalty

Negative experiences create:

- Lost opportunities
- Lower demand

Where an interaction involves a persistent governed entity, successful service may also update an **entity-specific loyalty ledger**.

Entity loyalty is not one universal reward currency. A farm, merchant, factory, household, institution or other persistent counterparty owns its own relationship history with the player/company.

Loyalty may later influence legitimate benefits such as:

- recurring work;
- preferred-customer/provider relationships;
- access to specialized opportunities;
- commercial terms or trust where the market authority permits it;
- specialist discovery opportunities tied to that entity's real economic activity.

Service quality, reliability, failures and broken commitments may affect loyalty. Exact loyalty values, thresholds and curves are balancing data.

---

# Specialist NPC Discovery and Card Fragments

DROPi Tycoon may represent long-term specialist discovery through collectible **Specialist Card Fragments**.

The fragment system is a progression/discovery mechanic around real NPC workforce identities; it does not turn a person's qualification into an abstract company upgrade.

## Governed affinity

A completed legitimate delivery may award Specialist Card Fragments only when the economic entity involved has a governed affinity to that specialist family.

Examples of valid rural/agricultural affinities may include, where the actual simulated economic node supports them:

- animal husbandry;
- horticulture / vegetable production;
- cattle husbandry;
- pig husbandry;
- farm operations;
- agricultural maintenance or logistics.

Other economic nodes may expose different specialist families according to their actual industry, professions and education/capability authorities.

A route label, rural visual theme or arbitrary map location alone must never fabricate specialist affinity.

## Completing a specialist card

Accumulating the governed fragment threshold for a specialist family may unlock access to a recruitable NPC specialist/profile.

Completing a card does **not**:

- grant the player's/company's qualification automatically;
- teleport an employee into the company;
- bypass wages, availability, locality, migration, housing or employment rules;
- bypass required training, facilities, equipment, infrastructure or authorizations;
- make the specialist permanently owned by the player.

The unlocked specialist remains a person/workforce identity. Recruitment/hiring uses the existing labor/company capability authorities. If the specialist later leaves and the company lacks a replacement, capability that depends on that specialist may become unavailable.

## Specialist employment and productive deployment

After legitimate recruitment/contracting, a specialist may be assigned to a compatible job in a real economic entity.

Examples include:

- cattle specialist -> eligible cattle farm;
- pig husbandry specialist -> eligible pig farm;
- horticulture/vegetable specialist -> eligible farm/greenhouse/producer;
- agricultural maintenance/logistics specialist -> eligible agricultural operation;
- manufacturing specialist -> eligible factory/processing site;
- warehouse/dispatch/maintenance specialist -> compatible logistics/industrial facility.

The assignment is valid only if the target company/site has the required employment relationship, locality access, facility, equipment, inputs, authorizations and operating capacity.

A specialist may work:

- directly for the player's company;
- for a company the player legitimately owns/controls or invests in;
- for another enterprise through a governed staffing/service/placement contract;
- for another NPC/human employer independently of the player when the labor market permits.

The player does not own the specialist as property.

## Specialist economic-flow boundary

Economic value from a specialist must come from real work and explicit contracts.

Examples:

- an enterprise employs the NPC, pays compensation, and the enterprise earns revenue/profit from real production/service output;
- a staffing/service company provides the specialist to another enterprise and earns a governed service/placement/management fee while the specialist receives their own compensation;
- an owner/investor receives only legitimate company profit/dividend/distribution from the enterprise's real results.

The game must not duplicate the same labor value by paying the specialist, the player's company and the player personally from an unexplained source.

A recruited specialist can therefore unlock real company capability, but only as part of the full production/company gate defined by `01_GameDesign/COMPANY_SOCIETY_AND_MULTIPLAYER.md` and the Economy authority.

## Reward authority and anti-farming

Specialist fragments are consequences of eligible real work, not random geography and not a second mission engine.

A delivery/work settlement may mint its eligible fragment consequence only once. Replaying the same settlement, reloading a save or transporting/reselling already-existing fragments must not mint the same specialist fragments again.

Self-dealing or wash-trade loops must not create infinite fragments, loyalty, XP or money.

Exact fragment quantities, thresholds and award curves are balancing data.

---

# NPC Movement

Future versions may simulate movement patterns.

Examples:

- People going to work
- Customers visiting businesses
- Traffic patterns
- Specialists relocating for employment/training where governed

Movement should support gameplay, not exist only for visual realism.

---

# MVP NPC Scope

The first playable version includes:

- Basic customers
- Basic business entities
- Simple employees
- Order generation

Advanced specialist recruitment/deployment behavior may be implemented later.

---

# Future Expansion

Possible future systems:

- Individual customer profiles
- Dynamic preferences
- Social reputation
- Employee careers
- Competitor companies
- City population simulation
- Specialist discovery/recruitment through governed economic relationships
- Staffing/service-company contracts
- Specialist migration between companies/localities

---

# Balance Principles

NPC systems must:

- Create meaningful gameplay
- Support the economy
- Make the world feel alive
- Preserve personhood/employment semantics
- Avoid magical passive income or duplicated labor value
- Avoid unnecessary simulation complexity

---

# Canonical Rule

NPCs exist to create a living connection between the player/company and the world.

Every NPC system must improve gameplay decisions or world immersion.

**Specialist Card Fragments may unlock access to recruitable specialist NPCs only through governed economic affinity and exactly-once progression settlement. A recruited specialist may then create real workforce/company capability through legitimate employment or service contracts, but never transfers qualifications magically, never becomes player-owned property, and never generates unexplained duplicated income.**

---

End of Document