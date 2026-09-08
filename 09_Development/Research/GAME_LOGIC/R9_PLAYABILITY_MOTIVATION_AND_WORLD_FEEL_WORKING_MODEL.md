# R9 — Playability, Motivation, Beauty and Community Contribution Working Model

Status: **RESEARCH WORKING PAPER — NON-CANONICAL**
Parent: #423
Track: #433

## Purpose

R1–R8 explain how DROPi Tycoon's economy and persistent world can function causally. R9 asks a different question:

> Why would a human enjoy inhabiting that system, feel proud of what they changed, and want to return?

The project must not become a correct but joyless economic spreadsheet. Economic depth is valuable only when it produces satisfying moment-to-moment play, visible progress, personal authorship, attachment and social meaning.

This paper translates compatible engagement principles from successful games and motivation research into original DROPi Tycoon systems. It does not copy protected content, art, writing, maps, characters or branded mechanics.

Companion operational research:
- `R9_COMPARATIVE_DESIGN_TRANSLATION_MATRIX.md` — translates reference-game strengths into original DROPi principles and cautions;
- `R9_PLAYABILITY_INTEGRATION_GATE.md` — defines the acceptance gate later gameplay systems and player-facing PRs must satisfy.

---

# 1. Research evidence

## 1.1 Autonomy, competence and relatedness

Self-Determination Theory research applied to games repeatedly links enjoyable and sustained play with three needs:

- **autonomy** — meaningful choice over goals and strategies;
- **competence** — feeling increasingly capable and receiving clear feedback;
- **relatedness** — feeling connected to other people, characters or a shared purpose.

Useful practical findings include:

- controls should be easy to learn;
- feedback should be clear and consistent;
- players should have meaningful choices rather than one mandatory route;
- cooperative social interaction can increase engagement.

DROPi should deliberately satisfy all three rather than relying on rewards, timers or grind.

References:
- https://selfdeterminationtheory.org/player-experience-of-needs-satisfaction-pens/
- https://selfdeterminationtheory.org/SDT/documents/2010_PrzybylskiRigbyRyan_ROGP.pdf

## 1.2 Stardew Valley — restoration, routine and attachment

Useful principles:

- a modest starting position can become satisfying when improvement is visible;
- recurring daily activities create rhythm without requiring one rigid objective;
- rebuilding community infrastructure gives individual work public meaning;
- relationships and collections create goals beyond money;
- home/farm customization creates ownership and identity.

Reference:
- https://www.stardewvalley.net/about/

## 1.3 Animal Crossing — personal ownership and gentle world variation

Useful principles:

- players care more about spaces they can personalize;
- ordinary days can feel different through time, seasons, visitors and discoveries;
- collections give low-pressure long-term goals;
- visiting and showing other players' creations creates social motivation without competitive dominance.

References:
- https://animalcrossing.nintendo.com/new-horizons/explore/
- https://animalcrossing.nintendo.com/new-horizons/create/
- https://animalcrossing.nintendo.com/new-horizons/share/

## 1.4 Euro Truck Simulator 2 — transport fantasy and vehicle attachment

Useful principles:

- travel itself can be enjoyable when movement, vehicle feel, scenery and route choice are satisfying;
- there does not need to be one mandatory career path;
- skills can unlock different job families;
- buying and customizing a personally meaningful vehicle creates attachment;
- map expansion makes progression physically visible.

Reference:
- https://eurotrucksimulator2.com/about.php

## 1.5 Factorio — manual beginnings become visible systems

Useful principles:

- begin with low capability and direct manual work;
- gradually replace repetitive labor with tools, machines, infrastructure and automation;
- every upgrade should visibly alter how the player solves problems;
- bottlenecks create self-authored goals;
- scale transformation is intrinsically satisfying because the player can compare the current system with what they built earlier.

References:
- https://www.factorio.com/game/content
- https://wiki.factorio.com/

## 1.6 Cities: Skylines — visible consequences and player-shaped development

Useful principles:

- citizens and companies should react to services and economic conditions;
- upgrades should add new capability, not only increase a number;
- progression can offer branches so players shape development priorities;
- city growth is more meaningful when the player can see how decisions affect people, land use and infrastructure.

References:
- https://www.paradoxinteractive.com/games/cities-skylines-ii/features/game-progression
- https://www.paradoxinteractive.com/games/cities-skylines-ii/features/economy-production
- https://www.paradoxinteractive.com/games/cities-skylines-ii/features/city-services-districts-policies

## 1.7 Death Stranding — asynchronous contribution

Useful principle:

Players can care deeply about infrastructure that helps strangers even when there is no direct economic reward. Shared roads and other structures demonstrated that contribution and appreciation can motivate continued play without requiring all players to be online together.

A non-economic appreciation signal can therefore be valuable if it cannot be farmed into economic power.

Reference:
- https://blog.playstation.com/2025/05/08/death-stranding-2-an-interview-with-hideo-kojima/

## 1.8 No Man's Sky — discovery, milestones and community journeys

Useful principles:

- discovery can be a progression path separate from wealth;
- milestone sets provide medium-term direction without dictating one exact order;
- community goals can pool progress across players;
- social rendezvous and shared projects can create a sense that many players inhabit the same world;
- time-limited content should not erase the player's permanent world history.

References:
- https://www.nomanssky.com/expeditions-update/
- https://www.nomanssky.com/

## 1.9 EVE Online — corporations, mentorship and self-authored group goals

Useful principles:

- player organizations create social identity and long-term attachment;
- experienced players can mentor newcomers;
- corporation projects turn broad organizational ambitions into concrete contributions;
- different careers can coexist inside one shared economy.

Reference:
- https://www.eveonline.com/eve-academy/corporations

---

# 2. DROPi playability thesis

The central experiential promise should become:

> **Your work leaves a mark.**

The player should regularly see three forms of progress:

1. **I changed myself** — skills, qualifications, equipment, vehicle, home, finances, reputation and career.
2. **I changed something I own or belong to** — company, HQ, fleet, warehouse, farm, factory, route network or team.
3. **I changed the world** — a customer was supplied, a shop restocked, a building advanced, a district recovered, infrastructure opened, an industry restarted or a community project progressed.

If a session produces only a larger number in a menu, the design has failed this principle.

---

# 3. Six motivation pillars

## 3.1 Agency — "I choose my path"

The player should repeatedly choose between meaningful alternatives such as:

- work now vs study;
- save vs buy equipment;
- bicycle vs powered vehicle;
- dense short route vs longer higher-value route;
- employment vs independent work vs entrepreneurship;
- logistics vs technical vs industrial vs management specialization;
- expand locally vs enter another city;
- own transport assets vs contract capacity;
- specialize in food, medical, industrial, waste, cold-chain, air, maritime or other logistics;
- invest in personal comfort vs productive capital;
- maximize profit vs reliability/reputation/community development.

Choices must create different consequences rather than converge immediately to one dominant path.

## 3.2 Competence — "I am getting better"

Competence should come from both character progression and player skill.

Character capability:

- qualifications;
- licenses/authorizations;
- equipment;
- vehicles;
- company departments;
- specialists;
- infrastructure access.

Player skill:

- route planning;
- cargo selection;
- batching stops;
- energy/time management;
- vehicle control;
- loading strategy;
- contract evaluation;
- buying at the right scale;
- managing bottlenecks;
- choosing when not to accept an unprofitable job.

The game should clearly explain why a result was good or bad.

## 3.3 Ownership — "This is mine"

Attachment increases when the player can recognize their own history in the world.

Personal ownership surfaces can include:

- character appearance;
- clothing/workwear;
- phone case/theme;
- backpack/courier equipment;
- bicycle/vehicle colors and accessories;
- home/apartment furnishing;
- personal garage;
- qualification certificates/trophies;
- personal photo/history wall;
- favorite routes/locations.

Company identity can include:

- name;
- logo/livery;
- uniforms;
- vehicle fleet appearance;
- HQ interior/exterior upgrades;
- depot signage;
- company colors;
- operational layout;
- historical achievements.

Customization must not alter the coherent DROPi visual style.

## 3.4 Visible consequence — "The world noticed"

This is a mandatory DROPi differentiator.

Examples:

| Player action | Immediate result | Visible world consequence |
|---|---|---|
| Deliver bread/food stock | merchant inventory rises | shelves/crates/customer activity visibly recover |
| Deliver medicine | pharmacy/clinic stock rises | medical facility returns to normal service state |
| Deliver construction materials | construction inventory rises | building/project visibly advances a stage |
| Deliver machine parts | factory maintenance input arrives | machinery/factory can visibly resume operation |
| Deliver fertilizer/seeds | farm input arrives | next agricultural production stage becomes possible |
| Collect municipal waste | waste stock falls | streets/collection points visibly improve |
| Deliver fuel/energy supply | operating stock restored | fleet/facility can resume activity |
| Supply a community bridge/project | project inventory rises | physical construction appears progressively |
| Hire a worker | workforce capability rises | person physically appears at company/facility when relevant |
| Buy a vehicle | productive capability rises | vehicle physically exists at HQ/garage/depot |

The simulation and presentation must use the same event where possible: the visual consequence is not a fake animation disconnected from economic truth.

## 3.5 Discovery and variety — "I wonder what happens next"

Variety can come from systems rather than random mission text:

- changing city demand;
- different customers and locations;
- day/night;
- weather;
- traffic;
- seasons;
- new construction;
- businesses opening/closing;
- shortages/surpluses;
- special cargo;
- temporary events;
- newly accessible districts;
- regional architecture;
- new routes and infrastructure;
- NPC life changes;
- new professions and employers;
- market opportunities.

The city should become familiar enough to feel like home but dynamic enough not to feel solved.

## 3.6 Relatedness — "I matter to others"

Relatedness can exist with NPCs and humans.

NPC layers:

- recurring coworkers;
- supervisors;
- merchants;
- customers;
- trainers;
- mechanics;
- employees;
- neighbors;
- business contacts.

They should remember meaningful history where affordable:

- worked together before;
- reliable courier;
- helped during shortage;
- former employee;
- trained by this mentor;
- supplied this business repeatedly.

Human layers:

- company membership;
- mentorship;
- shared projects;
- contracts;
- convoys/teams;
- community achievements;
- optional social visits;
- recognition/appreciation.

---

# 4. Session design

DROPi should support useful play at different available times.

## 2-minute session

The player can:

- check current world/personal state;
- collect an offline summary;
- inspect company/market alerts;
- make one small planning decision;
- accept/schedule a later task;
- buy a needed item;
- respond to a company decision.

The player should not need to begin a long mandatory shift.

## 10-minute session

The player can:

- complete a compact local route;
- make several deliveries;
- restock/buy supplies;
- handle one training step;
- maintain/customize equipment;
- complete a small company/community contribution.

## 30-minute session

The player can:

- complete a meaningful work shift;
- plan and execute a multi-stop route;
- earn and settle wages/costs;
- make a meaningful purchase;
- progress a qualification;
- participate in a larger company operation.

## Long session

The player can:

- explore another district/city;
- coordinate with others;
- restructure a company route network;
- buy/manage assets;
- operate a production/logistics chain;
- participate in major infrastructure/industry projects;
- travel regionally/internationally when capable.

No session duration should be the only efficient way to progress.

---

# 5. First-hour experience

The first hour must communicate the long-term fantasy without giving the player advanced power for free.

## Minute 0–5 — embodied poverty, not helplessness

The player enters the world as a real person on foot.

Must immediately experience:

- attractive city ambience;
- responsive movement;
- readable phone/job interface;
- a clear employer/work objective;
- nearby NPC life;
- first tiny meaningful route choice.

Do not begin with ten menus explaining the global economy.

## Minute 5–15 — first satisfying work

The first deliveries should:

- be short;
- use easy-to-understand cargo;
- provide satisfying pickup/drop feedback;
- show recipients/world reacting;
- teach scanning/custody/route basics naturally;
- consume enough Work Capacity to introduce the concept without forcing immediate failure.

## Minute 15–30 — first economic decision

After wage settlement the player should see:

- gross earnings;
- basic costs;
- remaining Personal Money;
- one or more realistic choices for the surplus.

Examples:

- food/basic need;
- save toward bicycle;
- buy a better courier bag;
- begin entry training;
- improve a personal comfort/appearance item.

The first purchase should be physically or functionally noticeable.

## Minute 30–60 — first authored goal

The game should stop telling the player exactly what to do and present at least two credible next goals.

Example:

- save for a bicycle and increase route efficiency;
- pursue a qualification/promotion path;
- improve personal stability/housing;
- explore another employer/side opportunity when eligible.

The player leaves the first hour with a sentence like:

> "I want to get that bicycle / qualification / better route next."

That sentence is more valuable than an arbitrary level number.

---

# 6. Making deliveries fun

Delivery is the foundation and cannot become repetitive waypoint touching.

## 6.1 Route skill

Offer meaningful choices:

- stop order;
- shortcuts;
- pedestrian-only paths;
- stairs/elevators/building entrances;
- traffic/congestion;
- parking/loading access;
- weather exposure;
- time windows;
- battery/fuel/energy range.

## 6.2 Cargo differences

Cargo should change gameplay.

Examples:

- letters/flyers — light, high stop density;
- food — time-sensitive;
- medicine — reliability/priority;
- fragile goods — handling risk;
- heavy parcels — energy/equipment constraint;
- cold-chain — temperature/equipment constraint;
- high-value electronics — security/reliability;
- pallet freight — warehouse/vehicle equipment;
- waste/recycling — reverse logistics;
- industrial parts — production consequences;
- hazardous/special cargo — qualification and route constraints.

## 6.3 Customer/location variation

Destinations should not all be identical door markers.

Possible contexts:

- apartment entrance;
- house;
- office reception;
- store back door;
- restaurant;
- pharmacy;
- hospital;
- warehouse loading bay;
- construction site;
- farm;
- factory gate;
- port/airport/rail terminal.

## 6.4 Delivery feedback

A successful handoff should feel good through restrained feedback:

- clear animation;
- parcel/cargo visibly changes custody;
- sound/haptic feedback where appropriate;
- recipient reaction;
- route progress clarity;
- immediate explanation of economic effect when meaningful.

Avoid casino-like reward explosions for ordinary work.

---

# 7. The "I built this" system

Construction/ownership should leave persistent physical evidence.

## Personal scale

- upgraded room/home;
- bicycle/vehicle in the world;
- better work gear;
- visible qualifications;
- personal storage/garage.

## Company scale

- HQ rooms/departments;
- desks/staff;
- garage/fleet;
- warehouse racks/inventory;
- maintenance workshop;
- charging/fuel infrastructure;
- company signs/livery;
- later factories/farms/terminals.

## City/community scale

- repaired road/bridge;
- new depot;
- public charging point;
- park/market restoration;
- waste/recycling facility;
- rail/port/airport expansion;
- new housing/industrial project;
- emergency reconstruction.

The player should be able to inspect major projects and see contribution provenance such as:

- materials delivered by player/company;
- labor contributed;
- finance contributed;
- project completion history.

This information should be factual and non-boastful, not a pay-to-display leaderboard.

---

# 8. Asynchronous community contribution

DROPi can combine strong solo play with persistent community meaning.

## Community project model

Example:

```text
city needs new bridge
-> project requires steel + concrete + machinery + specialists + money + time
-> many human/NPC actors can contribute independently
-> progress persists
-> construction visibly advances
-> completed bridge changes routes and economic capacity
-> contributors receive historical recognition, not free economic multiplication
```

A player can meaningfully help without needing to meet strangers at the same real-world hour.

## Appreciation

A lightweight appreciation/thanks signal can exist for:

- helpful infrastructure;
- mentoring;
- excellent service;
- useful company/community contribution.

Recommended rule:

**appreciation does not directly convert into money, XP or market power.**

This reduces farming and preserves its social meaning.

## Optional synchronous play

Examples:

- delivery convoy;
- warehouse shift;
- port loading operation;
- major construction delivery wave;
- disaster recovery;
- company meeting/event.

Synchronous participation can be memorable but must not be required for normal progression.

---

# 9. NPC attachment and recurring stories

The world should contain recognizable people rather than endless anonymous spawn units.

Not every NPC needs a full life simulation, but selected local actors can persist:

- supervisor who gave the player's first job;
- merchant repeatedly supplied by the player;
- mechanic who services the first vehicle;
- trainer who taught a qualification;
- coworker who later changes company;
- employee the player later hires;
- customer/business that grows from a kiosk into a larger operation.

Economic events can therefore become personal stories.

Example:

> The bakery the player supplied during the early pedestrian phase later expands, becomes a recurring company customer, hires more people and eventually opens a second location.

The system does not need scripted cutscenes for every step. Persistent world state can create the story.

---

# 10. Collections, discovery and history

Long-term goals should exist outside pure net worth.

Possible collections/history surfaces:

- professions/qualifications earned;
- vehicles owned/operated;
- cities/countries visited;
- companies worked for/founded;
- product categories handled;
- special cargo completed;
- landmarks/infrastructure discovered;
- personal career timeline;
- major community projects contributed to;
- economic crises/recoveries lived through;
- rare regional products/industries encountered;
- photo/postcard travel journal if later useful.

Collections should reward curiosity, not force repetitive completion of trivial tasks.

---

# 11. Events without manipulative FOMO

World events can improve variety:

- seasonal harvest;
- city festival;
- industrial maintenance shutdown;
- weather disruption;
- temporary shortage;
- new business opening;
- major construction project;
- tourism surge;
- port congestion;
- infrastructure failure/recovery;
- community development campaign.

Rules:

- missing an event must not permanently cripple progression;
- important economic opportunities recur through systems;
- avoid daily-login streak punishment;
- avoid essential exclusive power locked behind short real-world windows;
- old World Instance history remains meaningful even when an event ends.

---

# 12. Failure must create a comeback story

R1 allows poverty and bankruptcy. R9 adds the experiential requirement:

**setback should create a clear next problem the player wants to solve.**

Bad model:

```text
log in after absence
-> everything gone
-> huge unexplained negative balance
-> no obvious recovery
-> quit game
```

Better model:

```text
return
-> concise history of what happened
-> current protected identity/skills shown
-> losses explained causally
-> immediate basic work/recovery opportunities visible
-> first recovery milestone is achievable
-> later rebuilding can create a memorable comeback history
```

A former tycoon returning to pedestrian work can be emotionally powerful if the world remembers the history and recovery is possible.

---

# 13. Beauty and world feel

The owner requires an attractive coherent virtual world.

Approved research direction for art remains:

**Stylized 3D Pre-Rendered Mobile World with soft-isometric / 3⁄4 presentation**, consistent across characters, animals, nature, products, vehicles, buildings and infrastructure.

Visual beauty should come from more than asset resolution.

## Living ambience

- pedestrians with varied identities;
- traffic appropriate to district/time;
- workers at facilities;
- customers entering/leaving businesses;
- loading/unloading activity;
- birds/animals/nature where appropriate;
- day/night lighting changes;
- weather;
- seasonal vegetation/details;
- construction activity;
- visible waste/cleanliness only when relevant;
- trains, aircraft and vessels where world scale permits.

## Audio

Audio should communicate place and state:

- footsteps/cycle/vehicle sound;
- city ambience;
- shop/cafe/market ambience;
- warehouse machinery;
- port/rail/airport atmosphere;
- weather;
- subtle confirmation sounds;
- music/radio through the smartphone when implemented.

Avoid constant notification noise.

## Camera and feedback

- readable 3/4 world view;
- small contextual camera emphasis for major purchases/construction completion;
- no excessive screen shake;
- important physical changes should be easy to notice;
- UI should not permanently cover the world the player is meant to care about.

---

# 14. Keep economic depth below the surface until needed

A major lesson from successful simulation games is that complex systems do not require constant complex interaction.

DROPi can simulate:

- prices;
- inventories;
- labor;
- utilities;
- waste;
- contracts;
- company cash flow;
- city development;

while the beginner initially sees only:

- what do I need now?;
- what work can I do?;
- what did I earn?;
- what did it cost?;
- what changed?;
- what can I improve next?

Advanced dashboards unlock as the player's role needs them.

Complexity should be **discoverable depth**, not onboarding burden.

---

# 15. Anti-dark-pattern rules

DROPi should aim for long-term attachment, not compulsive manipulation.

Research recommendation:

- no pay-to-win economic power;
- no purchasable real-money Work Capacity refills;
- no essential progression through loot boxes;
- no punishment for breaking daily-login streaks;
- no fake countdowns;
- no arbitrary wait timer when meaningful gameplay could resolve the problem;
- no hidden probability designed to exploit spending;
- no generic "offline income" that rewards not playing more than playing;
- no notification spam;
- no deliberate confusion between cosmetic and economically powerful purchases.

The reason to return should be:

> "I want to continue what I am building."

not:

> "The game will punish me if I do not open it today."

---

# 16. Feature priority from R9

## MUST — foundational playability

1. Responsive movement and interaction.
2. Satisfying pickup/cargo/delivery feedback.
3. Deliveries with route/cargo/location variety.
4. Visible world consequences for important economic actions.
5. Clear short-term and medium-term player-authored goals.
6. Personal equipment/vehicle/property progression that is visible.
7. Attractive living-city ambience.
8. Understandable income-cost-profit feedback.
9. Career choices rather than one mandatory ladder.
10. Failure with clear recovery.
11. NPC continuity sufficient for the world to feel inhabited.
12. Async-friendly persistent world design.

## SHOULD — strong attachment

1. Vehicle/character/home/company customization.
2. Persistent recurring NPC contacts.
3. Community infrastructure/development projects.
4. Collections/discovery/career history.
5. Company projects and mentorship.
6. Seasonal/systemic events.
7. Regional identity and architecture variation.
8. Contribution provenance/recognition.
9. Optional synchronous cooperative operations.

## LATER — mature-world enrichment

1. Large community expeditions/development campaigns.
2. Advanced photo/travel journal systems.
3. World-history museums/archives.
4. Rich late-game mentoring institutions.
5. Global heritage/prestige systems with no unfair economic transfer.

## REJECT unless future evidence overturns this

1. Delivery as repeated identical waypoint touching.
2. One global XP bar unlocking unrelated capabilities.
3. Pure clicker/idle-company gameplay replacing embodied activity.
4. Mandatory multiplayer for ordinary progression.
5. Infinite random missions without economic origin.
6. Cosmetic buildings with no world/economic meaning when presented as productive assets.
7. Punitive survival micromanagement requiring constant food/water clicks.
8. Dark-pattern daily streaks/FOMO as the primary retention mechanism.

---

# 17. Playtest questions

Every major playable batch should test more than bugs.

After 10 minutes, ask:

- Did I enjoy moving and doing the work?
- Did I understand what I was trying to achieve?
- Did any choice feel like mine?
- Did I see a consequence of my action?

After one session, ask:

- What did I change in my person/company/world?
- What do I want to obtain or accomplish next?
- Did I learn something that makes me better at the game?
- Did any place, asset, NPC or organization become meaningful to me?

After repeated sessions, ask:

- Does the world feel different because of previous play?
- Am I choosing a strategy or merely repeating the highest-paying task?
- Are setbacks producing new decisions or only frustration?
- Does community activity add meaning without making solo play irrelevant?

A build can be technically correct and still fail R9 if players cannot answer these positively.

---

# 18. R9 synthesis

The best fit for DROPi is not to imitate one successful game. It is to combine compatible strengths around its unique economic/logistics identity:

- the **personal attachment and routine** of life-simulation games;
- the **transport fantasy and vehicle ownership** of driving simulators;
- the **visible scaling and automation** of production games;
- the **cause-and-effect city growth** of city builders;
- the **persistent organizations and economy** of MMOs;
- the **asynchronous shared construction** of community-driven worlds;
- the **discovery and milestone variety** of exploration games.

DROPi's original unifying mechanic can be stronger than any individual borrowed principle:

> **Every meaningful delivery is part of a real need, and satisfying that need can visibly change a person, business, project, city, industry or transport network. The player is not merely moving parcels through a map; they are physically moving the economy forward.**

That should become the playability lens used to evaluate later canonical reconciliation and implementation.
