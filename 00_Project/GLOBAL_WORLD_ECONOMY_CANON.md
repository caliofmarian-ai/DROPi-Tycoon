# Document Information

Document: GLOBAL_WORLD_ECONOMY_CANON.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical — Cross-Domain Global World Authority
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-09

---

# Global World Economy Canon

## Purpose

This document fixes the cross-domain rules for DROPi Tycoon's global world after the 2026-09-09 owner directives on global locality playability, global 10x city scale, locally authentic visual identity, economy-driven settlement evolution, natural resources, production/trade, professions, education/research, and cooperative company progression.

It reconciles and constrains `04_World/WORLD.md`, `04_World/MAP.md`, `02_Economy/ECONOMY.md`, `02_Economy/PRODUCTION_AND_TRADE.md`, `01_GameDesign/PROGRESSION.md`, `00_Project/BUSINESS_DESIGN.md`, `00_Project/LOGISTICS_DESIGN.md`, and the governed world-data/asset pipelines.

Where older wording implies that only a small manually selected set of real localities can exist in the world model, this document supersedes that interpretation. Rendering and high-frequency simulation remain sparse; **world identity does not**.

---

# 1. Canonical World Principle

DROPi Tycoon models one persistent global economic society per World Instance.

The world contains governed identities for countries, administrative regions, localities, external economic sites, infrastructure corridors, natural-resource areas, institutions, companies, population/workforce state and trade relationships.

Not every locality begins as a city and not every locality runs a detailed scene simultaneously.

The authoritative distinction is:

**global identity coverage is broad; urbanization, activation and rendering are dynamic and bounded.**

---

# 2. Stable Locality Identity, Dynamic Settlement Development

A locality may exist in the world dataset from the beginning while its settlement development remains low.

Canonical development states are conceptually:

`LATENT / UNDEVELOPED -> RURAL_POINT -> HAMLET -> VILLAGE -> SMALL_TOWN -> TOWN -> CITY -> LARGE_CITY / METROPOLITAN`

Exact enum names are implementation details, but the distinction is binding.

Locality identity is stable. Settlement class is mutable World Instance state.

A catalog record must never automatically instantiate a mature city.

A low-tier locality may appear at appropriate zoom as:

- undeveloped or agricultural land;
- one or two isolated houses/buildings;
- a farm/resource operation;
- a road junction;
- a tiny village cluster;
- a strategic locality marker before detailed activation.

Its urbanized footprint can later expand while retaining the same stable locality identity and history.

---

# 3. Economy-Driven Settlement Evolution

Settlement growth must be caused by legitimate economic and infrastructure state rather than an arbitrary city-level unlock.

Canonical causal loop:

`resource / demand / route opportunity`
`-> company or institutional investment`
`-> extraction / farming / production / infrastructure / services`
`-> jobs`
`-> workers and specialists`
`-> housing and utilities`
`-> commerce and public/service demand`
`-> higher settlement development`
`-> new demand, professions, firms and routes`
`-> further opportunity`

Growth may be stimulated by players, player groups, NPC/simulated companies, public/world institutions or mixed projects under the same authority rules.

Money alone cannot instantiate development. Projects may require materials, logistics, land/site access, utilities, specialists, qualifications, equipment, time and operating capacity.

Development is not permanently monotonic. Loss of jobs, connectivity, services, resources, firms or population may produce stagnation or decline, with visible and recoverable consequences.

---

# 4. Global 10x Playable-Distance Baseline

All current and future governed playable settlements use one reusable playable-distance scale baseline:

**`CITY_PLAYABLE_DISTANCE_SCALE_BASELINE = 10`**

Brăila is the calibration/reference city, not the owner of this rule.

The 10x baseline applies to governed intra-settlement positional separation and playable traversal scale. It must not blindly multiply doors, building footprints, road widths or every hero-scale measurement.

A hamlet remains physically and functionally smaller than a town; a town remains smaller than a metropolis because their governed urbanized footprints, street networks and district structures differ.

When economic growth creates new streets, housing, industrial areas or districts, that new geometry inherits the same global scale contract automatically.

Android performance is solved through streaming, chunking, sector activation, LOD, culling and bounded simulation — never by shrinking the world back into a miniature board.

---

# 5. Global Style, Local Reality

All playable localities share the canonical visual language:

**Stylized 3D Pre-Rendered Mobile World / premium mobile tycoon / elevated soft-isometric or 3/4 presentation.**

They must not share one generic architecture kit presented as local truth.

Each locality/country/region should derive visual identity from governed real-world inspiration where available, including:

- street pattern and density;
- building typologies and materials;
- roof forms and facade families;
- vegetation/climate cues;
- industrial/agricultural character;
- transport infrastructure;
- public-space patterns;
- ports, rail, utilities and logistics where locally relevant;
- source-backed landmark identity where legally/provenance-safe.

The scalable art pipeline is:

`Global DROPi Art Style -> Regional/Local Archetype -> Locality-Specific Variants -> Runtime Derivatives`

Missing runtime-required assets may be generated under the governed asset pipeline, then cut out, cleaned, optimized, atlased and integrated with provenance records.

Do not invent a factual landmark/address and present it as real when source truth is absent.

---

# 6. Natural Resources as Governed World Inputs

Natural resources are strategic world inputs and must not be inferred from map color, visual geography or unsupported assumptions.

Governed resource families include, where supported:

- minerals and construction materials;
- fossil energy;
- fresh water;
- forests/biomass;
- agricultural land and agricultural output potential;
- fisheries/marine resources;
- renewable-energy potential;
- other canonically added resources.

Occurrence, reserve, recoverable quantity, annual extraction/production, theoretical potential, installed capacity and transport capacity are distinct measurements.

Each authoritative baseline record requires stable identity, source/provenance, source date/year, retrieval/version information, geography/resolution, measurement type, value/unit where known and explicit missing/estimated state.

Country totals must not be uniformly spread across regions. Shared deposits, basins and rivers require explicit allocation semantics to avoid double counting.

The real-world baseline seeds a World Instance; simulation owns future depletion, investment, production and trade.

---

# 7. Country, Region and Local Economy Profiles

Economic simulation is hierarchical:

**Global -> Country -> Region -> Locality / External Economic Node -> Company / Household / Facility.**

Country and regional profiles may summarize:

- resource availability;
- production capacity;
- population/workforce;
- specialist supply;
- education/research capacity;
- infrastructure and gateway capacity;
- imports/exports;
- inventories and scarcity pressure;
- energy/water constraints;
- business ecosystem;
- service capacity;
- settlement development;
- major investment and disruption state.

Aggregation must conserve the same underlying stock-flow economy. A country-level summary cannot create goods or money that do not exist in lower-level or explicitly aggregated authoritative stocks/flows.

---

# 8. Production and Trade

Products must circulate through causal production and logistics chains.

Examples:

`ore -> processing -> metal -> components -> machinery / vehicles / construction`

`grain -> milling -> food processing -> merchant -> household consumption`

`timber -> lumber/pulp -> furniture/paper/packaging -> warehouse -> market`

`resource + specialists + infrastructure + utilities -> industrial output -> inventory -> trade -> consumption / further production`

Production requires the appropriate combination of inputs, capacity, workforce/specialists, equipment, utilities, maintenance, storage, transport access and time.

Goods do not teleport between markets. Logistics/custody moves real inventory or authoritative aggregated equivalents.

Shortage and surplus create legitimate trade opportunity. Trade creates routes, contracts, infrastructure pressure and investment incentives.

---

# 9. Need and Demand

Demand is caused by modeled need.

Demand may arise from:

- households/population;
- businesses and merchants;
- production recipes;
- construction projects;
- infrastructure maintenance;
- utilities;
- hospitals/services where modeled;
- schools/research institutions;
- tourism/events;
- recovery/emergency state;
- regional/national deficits.

A mission or delivery must not create demand merely because gameplay needs a task.

The preferred chain remains:

**Need -> Demand/Procurement -> Order/Contract -> Inventory/Cargo/Labor -> Work/Production/Transport -> Settlement -> Consumption/Use/Output -> Waste/New Need -> Visible Consequence.**

---

# 10. Companies and Local Economic Ecosystems

Companies should exist because the economy supports their function.

A locality's company mix may evolve from:

- local population and consumption;
- resources;
- agriculture/industry;
- transport access;
- trade flows;
- service gaps;
- construction;
- specialist availability;
- education/research institutions;
- player/NPC investment.

Different places therefore need different combinations of firms and professions.

A port economy, mining settlement, agricultural district, financial/service center, industrial city and university/research center should not share identical business ecosystems.

NPC/simulated firms provide bounded continuity where human participation is low and obey the same stock-flow and capacity rules.

---

# 11. Professions and Specialist Capacity

Specialists are productive strategic capacity, not decorative NPC labels.

Advanced company or infrastructure actions may require specific qualified people in addition to money and equipment.

Examples include transport, maritime, rail, aviation, industrial maintenance, energy/utilities, engineering, agriculture, production supervision, logistics, research and advanced technology.

The profession/specialist requirement must derive from the actual capability being operated.

A company cannot unlock/build/operate an advanced system merely by paying for it when trained people are canonically required.

If required specialists leave or become unavailable, affected capability may degrade or pause unless replacement capacity exists.

---

# 12. Education, Training and Research Geography

Education and research institutions are geographically meaningful world infrastructure.

Programs may exist at particular schools, vocational centers, universities, academies, company facilities, laboratories or specialist institutes.

For real-world-inspired institutions/programs, factual claims must be researched from current public sources with provenance and verification date. The game may translate real education into simplified fictional gameplay requirements; it must not claim exact legal equivalence unless supported.

A qualification can require:

- theory;
- practical training;
- supervised experience;
- assessment;
- prerequisite qualifications;
- specific equipment/facility;
- travel/relocation;
- tuition/cost;
- time.

Some rare capabilities may require a player or employee to travel to another region/country because the required training institution is not locally available.

Research institutions may later unlock technologies, processes, productivity improvements or new infrastructure capabilities through governed research rather than arbitrary level rewards.

---

# 13. Group and Company Education Sponsorship

Human players may cooperate economically to create specialist capacity.

A company/group may finance a member's education through an explicit sponsorship arrangement with:

- student/member identity;
- course/program/institution;
- qualification target;
- cost and contributors;
- company and/or Personal Money ownership boundaries;
- duration;
- attendance/training state;
- completion/assessment evidence;
- resulting personal capability;
- optional company contractual obligations where later canonized.

Players may transfer/support money only through governed transactions; money must not be duplicated.

The qualification belongs to the trained person unless a separate corporate technology/research asset is explicitly modeled. Company capability depends on actually having access to the qualified specialist.

---

# 14. New Player Origin and Migration

A new registered player must not silently spawn in Brăila.

The model distinguishes at minimum:

- nationality/origin identity where collected;
- home country/locality;
- starting country/locality;
- current country/locality;
- relocation history.

The starting locality should be a supported playable locality appropriate to the player's selected/validated origin context under onboarding rules.

If the exact home locality is not yet urbanized enough for a mature city experience, gameplay should reflect its actual current settlement tier rather than secretly substituting Brăila.

Players may later migrate/relocate through legitimate travel, employment, study, company expansion, personal choice or world events. Persistence must preserve current locality and history exactly once.

---

# 15. Locality Playability and Zoom

Every locality exposed as enterable must have a truthful playable state appropriate to its current development.

Semantic zoom remains:

**Global -> Country -> Administrative Region -> Locality/Settlement -> District/Area where present -> Hero.**

A hamlet does not need fake city districts. A city does.

Zooming never teleports people, cargo or ownership state.

Locality rendering must assemble governed spatial identity, locally appropriate art, economic nodes, population/traffic budgets, mission/work surfaces and persistence state.

---

# 16. Locality Readiness and Development Are Separate Axes

Do not conflate content/data readiness with economic development.

Recommended readiness axis:

`CATALOGED -> SOURCE_READY -> PLAYABLE_CONTRACT_READY -> RELEASE_VERIFIED`

Recommended settlement axis:

`LATENT -> RURAL_POINT -> HAMLET -> VILLAGE -> TOWN -> CITY -> LARGE_CITY`

A locality may therefore be `SOURCE_READY + HAMLET`, `RELEASE_VERIFIED + VILLAGE`, or `RELEASE_VERIFIED + CITY`.

Brăila is the premium calibration/reference implementation, not the universal starting settlement or universal architectural template.

---

# 17. Multiplayer and Group Development

Future multiplayer companies/groups share the same economy rather than a separate multiplayer economy.

Group members may specialize in complementary professions, finance each other's training, operate different departments, manage production/logistics, invest in infrastructure and collectively stimulate settlement development.

A complex project may require a team composition rather than one omnipotent character.

Example:

`company capital + materials + site + logistics + engineer + electrical specialist + qualified operators + infrastructure`
`-> productive project`
`-> jobs/output`
`-> local development`

The departure of a required specialist can reduce operational capability until another qualified specialist is available.

---

# 18. Source and Provenance Boundary

Real-world-inspired baseline facts must be source-backed and versioned where they materially influence factual representation.

This applies especially to:

- locality/country geography;
- natural resources;
- infrastructure;
- major industry baselines;
- education/training/research institutions;
- climate/environmental characteristics;
- locally distinctive architecture/visual references.

Runtime economic values after World Instance creation are simulation state and must not be presented as current real-world facts.

Research evidence does not automatically become gameplay authority. It must be transformed through the appropriate canonical domain contract.

---

# 19. Release Architecture Proof

Before claiming a global launch architecture, tests must demonstrate the full causal lifecycle in materially different places, including:

- Brăila as premium calibration city;
- another Romanian locality;
- a non-Romanian European locality;
- a materially different locality/archetype;
- at least one low-tier settlement that grows from legitimate economic causes.

Required proof includes:

`new player -> correct start locality -> zoom/enter -> legitimate work -> movement -> pickup/cargo -> delivery -> settlement/economy -> visible story/consequence -> save/reload -> continued locality -> investment/production -> settlement evolution -> relocation -> another locality`

Global contract tests then validate the launch dataset without requiring every locality to be rendered simultaneously.

---

# Canonical Rule

**DROPi Tycoon's world is globally identified but locally and economically evolved. Real-world geography, resources, institutions and visual identity seed the baseline; one conserved economy drives production, trade, professions, education, migration and settlement growth; every new street, factory, farm, school, company and city must be a consequence of legitimate world state; and the player's work can visibly change the geography of opportunity.**

---

End of Document
