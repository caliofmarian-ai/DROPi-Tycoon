# R1 — Human Player / Hero Life-Cycle Research

Status: **RESEARCH WORKING PAPER — NON-CANONICAL**
Parent: #423
Track: #424
Last updated: 2026-09-08

## 1. Research question

What can one human player do and become from the first minute of a fresh World Instance through mature multiplayer society, while preserving meaningful work, freedom to specialize, failure recovery, asynchronous play and a fair relationship between personal progress, company power and world evolution?

This paper does not change canon. It audits current canon, identifies gaps, compares useful design patterns and proposes a recommended model for owner review.

---

## 2. Existing canonical anchors that should be preserved

Current canon already establishes several strong principles:

1. The player is a visible embodied person, not merely a company account.
2. Progression has three coupled axes: Personal Capability, Company Capability and World Access.
3. A player may become a courier, specialist, employee/member, founder, executive, producer/merchant, infrastructure operator or investor.
4. Employment, company membership, operational authority and investment ownership are separate concepts.
5. Personal Money and Company Money are separate ownership domains.
6. Multiplayer must extend the same economic rules rather than create a second economy.
7. Simulated/NPC participants remain necessary so low-population worlds stay playable.
8. Shared economic truth eventually becomes server-authoritative.
9. World Instances are economically isolated by default; mature-world money/assets cannot be imported into a fresh world.
10. Ordinary setbacks must not permanently destroy player identity or normal progression.

Primary audited documents:

- `00_Project/VISION.md`
- `00_Project/BUSINESS_DESIGN.md`
- `01_GameDesign/PROGRESSION.md`
- `01_GameDesign/COMPANY_SOCIETY_AND_MULTIPLAYER.md`
- `02_Economy/PERSONAL_FINANCE.md`
- `02_Economy/EMPLOYEES.md`
- `04_World/WORLD.md`
- `06_Technical/SHARED_AUTHORITY_CONTRACT.md`
- `06_Technical/WORLD_INSTANCES.md`

---

## 3. Core audit finding: a player must not have one exclusive `role`

A future multiplayer player can simultaneously be:

- a trained mechanic;
- an employee of Company A;
- an internal member of Company A;
- an external shareholder in Company B;
- the owner of a personal van;
- temporarily performing an independent repair contract;
- physically present in another city for training.

Therefore a single `PlayerRole = Founder | Courier | Mechanic | Investor` model would collapse independent truths and create contradictions.

### Recommended identity decomposition

The player should instead be represented through orthogonal state families:

1. **Account Identity** — global login/profile identity.
2. **World Hero / Economic Actor** — the person's persistent identity inside one World Instance.
3. **Personal Capability Portfolio** — qualifications, experience and profession mastery.
4. **Employment Relationships** — current employment contracts/assignments.
5. **Company Membership Relationships** — internal membership/governance eligibility.
6. **Operational Authority** — permissions to act for a company/facility.
7. **Ownership Portfolio** — personal assets and external investments.
8. **World Presence** — current locality, travel state and world access.

The UI may summarize these as a career, but the domain model should not flatten them into one role flag.

---

## 4. Account identity vs World Hero identity

### Model A — one global progression character

Skills, money, assets and career follow the account into every World Instance.

**Advantages**
- low repetition;
- strong attachment to one global character.

**Problems**
- destroys fresh-world economic fairness;
- allows veterans to import productive power;
- weakens the purpose of new World Instances;
- creates severe balancing pressure between old and new players.

### Model B — global account identity + world-local economic hero

The account persists globally, but each World Instance contains its own economic actor/hero state.

**Account-wide candidates**
- stable account identity;
- accessibility/settings;
- cosmetic ownership that carries no economic power;
- historical achievements and world-history record;
- tutorial knowledge / optional tutorial skip;
- social identity subject to moderation design.

**World-local state**
- Personal Money;
- location/travel state;
- personal vehicles/tools/property;
- operational qualifications and profession mastery;
- employment/membership;
- company ownership and shares;
- inventory;
- contracts;
- reputation that affects that world's economy;
- infrastructure/productive ownership.

**Recommendation: Model B.**

A fresh world should reset economic power while preserving the person's account history. Tutorial familiarity may be recognized, but it must not silently grant economic assets or production capacity.

---

## 5. Number of player economic actors per world

### Model A — unlimited alternate heroes in one World Instance

This increases role-play flexibility but makes self-dealing, labor bypass, market manipulation, fake company membership and anti-monopoly enforcement substantially harder.

### Model B — one primary economic hero per account per World Instance

A single account has one authoritative economic person in a given world. The same person may change professions, employers, companies and strategies without creating alts.

**Recommendation: Model B for the initial multiplayer architecture.**

The design should favor one flexible person over many alternate economic identities. Additional avatars can be reconsidered only with explicit anti-abuse rules.

---

## 6. Proposed player life-cycle graph

This is a graph, not a mandatory level ladder.

```text
WORLD ARRIVAL / RESIDENT
        |
        v
INTRODUCTORY WORK + BASIC NAVIGATION
        |
        +-----------------------------+
        |                             |
        v                             v
INDEPENDENT GIG WORK             ENTRY EMPLOYMENT
        |                             |
        +-------------+---------------+
                      |
                      v
             QUALIFICATION / SKILL
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
     CAREER       COMPANY      INDEPENDENT
    SPECIALIST     MEMBER       OPERATOR
          |           |           |
          +-----+-----+-----------+
                |
                v
       ENTREPRENEUR / FOUNDER
                |
       +--------+---------+
       |                  |
       v                  v
  EXECUTIVE /        PRODUCER /
  GOVERNANCE          INFRASTRUCTURE
       |                  |
       +--------+---------+
                |
                v
     REGIONAL / GLOBAL ACTIVITY
                |
       +--------+---------+----------------+
       |                  |                |
       v                  v                v
  MASTER          INVESTOR /         MENTOR /
 SPECIALIST        PORTFOLIO          LEGACY
```

A player may never found a company and still reach meaningful late-game mastery.

---

## 7. World arrival and the starter floor

A player must be able to start in both:

- a newly launched World Instance;
- a mature World Instance that has existed for months or years.

The starter experience should not assume the player owns a company.

### Recommended starter floor

The world guarantees access to:

- persistent personal identity;
- basic clothing/avatar presentation;
- smartphone/basic delivery application access;
- basic parcel-carrying capability/backpack;
- walking;
- orientation/tutorial access;
- at least one legitimate route to basic income;
- access to introductory training;
- a non-softlocking location from which public/entry transport and work can be reached.

This guarantee is not the same as giving large amounts of free currency.

### Mature-world protection

A late entrant must not face a world where every useful job requires qualifications/assets they cannot obtain.

Possible mechanisms to test in economy research:

- demand-backed public starter contracts;
- NPC/simulated employers of last resort;
- apprenticeships offered by real/NPC companies;
- temporary starter accommodation or housing floor;
- indexed entry wages/training support where justified by local cost conditions;
- recommendations toward labor-short regions;
- public transport/relocation fallback.

The mature world can be difficult, but it cannot be economically sealed against newcomers.

---

## 8. Profession and qualification philosophy

### Linear-class model

Player chooses a career/class and later changes it through respec or a new character.

**Rejected direction:** too restrictive for a logistics society.

### Portfolio model

One person accumulates qualifications across profession families. Some advanced capabilities require prerequisites, practical experience, equipment, facilities or instructors.

**Recommended direction.**

The player should be able to become, over time, for example:

- courier + van driver;
- mechanic + fleet supervisor;
- warehouse operator + dispatcher;
- drone operator + technician;
- maritime specialist + port operator;
- finance specialist + investor;
- entrepreneur + logistics specialist.

Mastery in one field should create advantage, but not permanently prevent learning another field.

### Qualification decay

Recommendation: **no automatic skill decay merely because the player is offline.**

Renewal/certification should exist only if it creates a meaningful decision for a specific advanced system; it must not become a repetitive maintenance treadmill.

---

## 9. Employment and independent work

The hero must be economically viable without owning a company.

### Employment relationships may include

- task/gig contract;
- temporary shift/work package;
- continuing employment agreement;
- specialist service contract;
- executive/management appointment;
- apprenticeship/training placement.

Detailed wage formulas belong to R3/R4, but R1 establishes these requirements:

1. employment is a relationship, not ownership of the player;
2. the player can quit under governed consequences;
3. the company can terminate under governed consequences;
4. salary/wage transfers must debit company money and credit personal money when activated;
5. being offline cannot require an employer to pay unlimited unproductive salary by default;
6. asynchronous roles need explicit availability/work-output rules;
7. NPC substitution or unfilled-capacity behavior must prevent one absent human from freezing a whole company.

### Primary company membership recommendation

For internal membership/governance, the initial multiplayer model should use **one active internal member company at a time per hero**.

This is separate from:

- external share ownership in many companies;
- temporary outside service contracts;
- marketplace transactions;
- customer/supplier relationships.

Reason: the current internal-share exit rule and future governance become far more coherent if a person has one primary internal organizational membership at a time.

This remains an owner decision, not canon.

---

## 10. Personal Money and personal assets

Existing canon already separates Personal Money from Company Money.

R1 proposes that Personal Money eventually supports player-life decisions such as:

- training/education;
- personal tools/equipment;
- personal transport;
- travel;
- personal housing/property;
- marketplace consumption;
- external share investment;
- selected fees/services.

### What should not become mandatory survival micromanagement

DROPi Tycoon is not primarily a hunger/sleep survival game.

Recommendation:

- food, housing and household consumption may contribute to the simulated population economy;
- the human player's personal housing can create comfort, storage, prestige, location and financial choices;
- absence of luxury housing should not prevent the player from taking basic jobs;
- do not require repetitive eating/sleep meters unless a later dedicated design proves they improve the logistics/economic fantasy.

### Debt

Current Personal Money cannot go negative.

Recommendation: keep personal unsecured debt/credit out of the first multiplayer economy. Add it only after bankruptcy, collateral, default and abuse rules are fully designed.

---

## 11. Personal travel and world presence

The strategic map is not a teleport menu.

Recommended rule:

- map navigation reveals/selects destinations;
- the hero changes physical presence through available transport/infrastructure;
- travel consumes modeled time and/or money where appropriate;
- walking/local movement remains embodied at detailed scale;
- long-distance travel may use time compression or scheduled transitions rather than forcing the player to watch hours of transit;
- a last-resort recovery path must prevent permanent stranding.

A player can therefore genuinely relocate between localities, regions and countries as the world opens.

---

## 12. Failure and recovery matrix

### Personal Money reaches zero

The player keeps identity, basic phone/basic access and qualifications already earned unless another explicit rule applies.

Recovery routes:
- entry-level work;
- employment;
- sell eligible personal assets;
- move to a region with labor demand;
- public/apprenticeship opportunities.

No permanent economic softlock.

### Player is fired

The employment relationship ends; personal identity, skills and lawful personal assets remain.

Recovery:
- seek new employer;
- accept gig work;
- retrain;
- relocate;
- start a company when eligible.

### Player quits a company

Employment/membership/authority consequences settle explicitly.

Existing canon's internal-member-share exit rule must be reconciled during final canon review. External portfolio shares remain a distinct investment domain.

### Player's company fails

The person survives the company.

Potential losses may include investment value, position, company-controlled equipment and company income, but not personal identity or earned personal capability.

### Founder disappears / becomes inactive

The company must not freeze indefinitely.

Research direction:
- grace period;
- delegated authority;
- governance succession;
- NPC/AI operational continuity where appropriate;
- founder remains historical identity even if executive control changes.

### Player returns after long absence

The player receives an authoritative catch-up summary:
- elapsed world time;
- expired/completed contracts;
- employment/membership changes;
- investment/company events;
- location/travel state;
- major world changes relevant to them.

No duplicate economic settlement may occur during catch-up.

---

## 13. Offline and asynchronous multiplayer

Players live in different time zones and cannot be online continuously.

R1 recommends the following design principles:

1. No ordinary player can permanently destroy another person's identity while they sleep.
2. Production, markets and world simulation continue under server authority.
3. Human work contracts have explicit deadlines/availability windows rather than hidden daily-login expectations.
4. Companies can delegate operational authority.
5. Critical roles must have substitution/recruitment/recovery mechanisms.
6. Inactivity can reduce an individual's operational influence, but must not delete historical identity.
7. No core progression system should require a synchronized population of players to be online simultaneously.

Asynchronous design is a first-class multiplayer requirement, not an accessibility afterthought.

---

## 14. Late-game personal motivations

If money becomes abundant, the human player still needs meaningful goals.

Recommended late-game motivations include:

- master professions and rare specialist capability;
- lead complex multimodal operations;
- mentor/train newer players;
- build a respected career independent of ownership;
- participate in major infrastructure projects;
- operate strategic facilities;
- build an investment portfolio;
- serve in company governance;
- establish or restore industries/regions;
- create products and logistics networks;
- contribute to a city's/country's historical development;
- collect world-history achievements/artifacts/cosmetics with no mandatory pay-to-win power;
- move into a newly launched World Instance for a fresh economic challenge while retaining account history only.

Late game should become broader and more socially/economically consequential, not simply larger delivery payouts.

---

## 15. External design references and lessons

These references are comparative inputs, not authorities over DROPi canon.

### Albion Online — classless progression

Official beginner guidance emphasizes a classless character that can change play style and progress different paths on one character.

Lesson for DROPi:
- favor one flexible person with a capability portfolio rather than locking the account into one career class.

Reference: https://albiononline.com/news/beginner-guide

### Eco — contracts for goods, labor and services

Eco supports contracts not only for items but also work/labor and services such as transport and road building.

Lesson for DROPi:
- independent work, employment tasks and specialist services can share a governed contract framework instead of inventing unrelated mission systems.

References:
- https://wiki.play.eco/en/Economy
- https://wiki.play.eco/en/Contracts

### Prosperous Universe — asynchronous persistent economy

Its public design explicitly emphasizes playing at one's own pace without a looming destruction threat while absent. Its workforce/population systems also connect productive capacity to worker availability and needs.

Lesson for DROPi:
- the world can remain persistent without requiring continuous online presence;
- workforce scarcity can matter economically while still requiring reserve/recovery mechanisms for newcomers and changing demand.

References:
- https://prosperousuniverse.com/about/
- https://handbook.apex.prosperousuniverse.com/wiki/efficiency-factors/
- https://handbook.apex.prosperousuniverse.com/tutorials/legacy-tutorials/planetary-population/index.html

### Foxhole — visible contribution chain

Its logistics loop clearly links gathering, refining, production, storage and delivery.

Lesson for DROPi:
- a player's work should change real inventory/capacity in the shared world rather than complete an abstract mission disconnected from production/consumption.

Reference: https://foxhole.wiki.gg/wiki/Logistics

### EVE Online — economy instrumentation

EVE's Monthly Economic Reports track production, mining, destruction, price indexes and currency faucets.

Lesson for DROPi:
- once Personal Money and shared multiplayer settlement are active, every major income source and sink should be measurable; balancing cannot rely on intuition alone.

Reference: https://www.eveonline.com/news/t/monthly-economic-reports

---

## 16. Current canon gaps / contradictions found by R1

### G-R1-001 — starter company vs person-first multiplayer start

Current runtime starts with a company for compatibility, while long-term canon says the person need not begin as a mature founder.

Research recommendation:
- preserve current offline/runtime progression;
- do not silently import its company ownership into a fresh shared world;
- define an explicit migration/legacy-world path during multiplayer transition.

### G-R1-002 — account identity vs world hero not yet explicit

`WORLD_INSTANCES.md` isolates economic power, but the exact account/world-actor split is not yet a canonical data contract.

### G-R1-003 — employment exists conceptually but human employment contract is undefined

NPC payroll exists; player wages are acknowledged but not activated.

### G-R1-004 — personal life expenses/property are open-ended

Personal Money canon allows future personal expenses but does not define which player-life systems create meaningful sinks.

### G-R1-005 — mature-world newcomer floor is undefined

Current documents prevent permanent exclusion in principle but do not define how a zero-asset newcomer actually enters an advanced economy.

### G-R1-006 — inactivity/succession behavior is incomplete

Founder/executive distinction exists, but exact inactivity, delegation and return transitions are unresolved.

### G-R1-007 — multi-company operational affiliation needs a rule

Investment in multiple companies is allowed directionally, but simultaneous employment/internal membership boundaries are not closed.

### G-R1-008 — player travel between global map layers is not fully defined

World access is canonical, but strategic map selection versus physical travel requires a clear rule.

### G-R1-009 — late-game personal purpose needs explicit design

Current canon has endless progression but needs a stronger non-founder/non-owner endgame.

---

## 17. Recommended R1 working model

Pending owner approval, the strongest coherent model is:

1. one stable account identity;
2. one primary economic hero per account per World Instance;
3. world-local economic power and operational qualifications;
4. account-wide non-economic history/cosmetics/tutorial familiarity only;
5. profession portfolio rather than class locking;
6. one primary internal company membership at a time, while external investments and governed outside contracts remain possible;
7. player can remain an employee/specialist forever and still reach late game;
8. personal and company money remain strictly separate;
9. no permanent player death or skill decay from being offline;
10. no hard survival micromanagement as the core game loop;
11. physical/strategic travel instead of map teleportation;
12. mature worlds guarantee a basic recovery/entry floor;
13. ordinary company failure never destroys the person;
14. absence triggers governed delegation/succession rather than freezing the organization;
15. late game emphasizes mastery, influence, infrastructure, mentoring, investing, world history and new-world challenges.

---

## 18. Items requiring owner decision before R1 can be closed

- D-R1-001: one economic hero per account per World Instance?
- D-R1-002: should operational qualifications be fully world-local, while only tutorial/history remains account-wide?
- D-R1-003: one active internal company membership at a time?
- D-R1-004: should personal housing be progression/comfort/property rather than a mandatory hunger/survival system?
- D-R1-005: confirm no permanent hero death/aging-out mechanic.
- D-R1-006: confirm global travel requires infrastructure/time/cost rather than instant map teleportation.
- D-R1-007: confirm mature-world starter/recovery floor even when the player has zero money/assets.
- D-R1-008: confirm current prototype saves must not inject economic power into fresh multiplayer World Instances.

These decisions should be resolved before canonical reconciliation of R1.

---

## R1 provisional conclusion

The hero should be a persistent economic person, not a class and not a synonym for a company. The strongest multiplayer model allows one person to accumulate professions, change employers, found or leave organizations, invest, travel, fail, recover and contribute to world history while keeping personal capability, organizational authority and economic ownership as distinct state families.
