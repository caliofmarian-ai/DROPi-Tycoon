# Game Logic Research — Phase 1 Exit Audit

Status: **RESEARCH ONLY — NON-CANONICAL**
Parent: #423

## Purpose

Determine whether Phase 1 has enough causal and experiential coverage to move from open-ended research toward owner architecture decisions and canonical reconciliation.

The audit deliberately separates:

1. **model completeness** — do we know how the system is supposed to work?;
2. **owner architecture decisions** — choices that change long-term rules and data contracts;
3. **balancing values** — numbers that should be tuned through simulation/playtesting rather than frozen in canon.

---

# 1. Track status

| Track | Core question | Phase-1 status | Remaining before canon reconciliation |
|---|---|---|---|
| R1 Hero | Who is the player, how do they live, work, progress, fail and recover? | SUBSTANTIALLY CLOSED | owner decisions on identity/world transfer/aging/travel/save migration |
| R2 Company | How is a company born, financed, staffed, expanded, acquired or failed? | SUBSTANTIALLY CLOSED | ownership/control, credit, infrastructure/privatization details |
| R3 Labor | How are professions learned, hired, paid and made scarce/useful? | SUBSTANTIALLY CLOSED | multi-employment/qualification renewal are later policy details |
| R4 Economy | Where do goods/money originate, move, get consumed and leave? | SUBSTANTIALLY CLOSED | currency/monetary authority, banking and public-money depth |
| R5 City | How do people, housing, jobs, utilities, waste and construction create growth/decline? | SUBSTANTIALLY CLOSED | housing/public-service governance depth and balancing granularity |
| R6 Country | How do regions, trade, infrastructure, migration and industry create prosperity/decline? | SUBSTANTIALLY CLOSED | national currency/public budget/infrastructure ownership decisions |
| R7 Multiplayer | How do humans/NPCs cooperate/compete asynchronously under trusted authority? | SUBSTANTIALLY CLOSED | final identity/company-control rules and later moderation/privacy detail |
| R8 Time | How do day/night, shifts, production, offline consequences and World Instances evolve? | SUBSTANTIALLY CLOSED | time ratios/grace periods are balancing; world-transfer policy is owner architecture |
| R9 Playability | Why is the system enjoyable, visible, personal and socially meaningful? | SUBSTANTIALLY CLOSED | validate through later playtests; no new fundamental track required now |

Phase 1 therefore has enough structure to stop expanding horizontally and move to owner decisions.

---

# 2. Causal closure tests

The research can now trace the following without an undefined magical reward/source:

## Starter courier

```text
personal needs
-> need for Personal Money
-> employer has commercial logistics demand
-> work shift
-> Work Capacity/time consumed
-> employer service output/revenue
-> Company Money wage debit
-> Personal Money wage credit
-> food/water/housing purchases
-> merchants/providers receive demand
-> restocking/procurement
-> new logistics demand
```

## Factory supply

```text
market/industry needs output
-> factory needs inputs + specialists + energy + time
-> procurement
-> logistics contract
-> cargo custody and transport
-> factory production
-> output inventory + waste
-> downstream buyer/market
```

## City growth

```text
productive investment
-> jobs/wages
-> migration
-> housing demand/construction
-> consumption
-> retail/services
-> logistics
-> infrastructure
-> increased productive capacity
```

## Country trade

```text
regional surplus/deficit
-> price/procurement opportunity
-> domestic or cross-border contract
-> infrastructure-backed transport
-> inventory/price/production consequences
-> investment/migration response
```

## Community infrastructure

```text
real city/network need
-> project requires materials + labor + money + specialists + time
-> human/NPC contributions occur asynchronously
-> construction state advances
-> physical world changes
-> route/economic capacity changes
-> contribution remains in world history
```

These examples establish that the game can now be reasoned from human scale to global scale with the same economic grammar.

---

# 3. Playability closure tests

Phase 1 can also answer:

- what is enjoyable in the first minutes;
- how 2/10/30-minute and long sessions remain useful;
- how delivery gameplay gains route/cargo/location variety;
- how progress changes verbs rather than only numbers;
- how ownership creates attachment;
- how meaningful economic events create visible world consequences;
- how persistent NPC relationships can create emergent stories;
- how community projects add asynchronous meaning;
- how failure can become a comeback story;
- how complex simulation remains below a simple beginner-facing surface;
- which retention dark patterns are explicitly rejected.

R9 therefore closes the previous gap between `economically coherent` and `worth playing` at research level. Later implementation must still prove these claims through playtesting.

---

# 4. Architecture decisions that still require owner approval

The following are genuinely architecture-defining and should be approved before canonical reconciliation.

## Identity / World Instances

1. one economic hero per account per World Instance;
2. fresh worlds transfer only non-economic account history/cosmetics, not productive economic power;
3. prototype/local save remains legacy/offline history rather than injecting economic assets into fresh multiplayer worlds;
4. human hero persists rather than aging out/dying through ordinary World Instance years.

## Company/social identity

5. one primary internal/member company relationship at a time;
6. compatible multiple jobs/contracts may exist subject to schedule/conflict rules;
7. one person does not create unlimited shell operating companies; expansion happens through one primary operating relationship plus legitimate share portfolios, acquisitions and subsidiaries.

## Geography

8. global movement is infrastructure-backed and time/cost based; map selection never grants free economic teleportation.

## Failure

9. housing can be lost into a recoverable No Housing/Emergency Housing state;
10. legitimate fixed obligations and basic living consumption continue offline while active-use costs stop;
11. bankruptcy never deletes identity and returns the player to a legitimate lowest productive rung.

## Economy/public layer

12. architecture supports national currencies as a staged long-term target;
13. banking/credit is allowed later only after the core stock-flow economy is stable;
14. simplified taxation/public budgets are allowed later where they close infrastructure/service money loops;
15. essential infrastructure uses mixed ownership/concession/access safeguards rather than unrestricted private softlock power;
16. eligible productive industry can be acquired/privatized through governed sales/auctions/concessions.

## Continuity/multiplayer

17. bounded NPC baseline keeps essential markets, employment and production alive without infinite/free resources;
18. geopolitical/war systems, if used, remain fictional macroeconomic/logistics events with historical state continuity rather than tactical combat;
19. global society uses multi-resolution simulation rather than simulating every person at full fidelity everywhere;
20. initial incumbent logistics employer is fictional by default unless real-brand permission is separately secured.

These correspond to the recommended architecture package in `MASTER_DECISION_REGISTER_PHASE1.md`.

---

# 5. Owner directions already established and not reopened unnecessarily

The following should be treated as owner-directed research truth unless the owner changes them:

- global scope with all countries strategically represented;
- sparse representative locality model plus external economic nodes;
- poor pedestrian employee start;
- early flyers/letters/light cargo;
- primarily day/shift wage at the start;
- real food/water/living consumption;
- finite Work Capacity and rest;
- vehicle fuel/charge/maintenance economics;
- capability-gated progression through money + learning + qualification + authorization + infrastructure;
- real supply/demand/procurement/custody chain behind deliveries;
- people, companies and cities consume resources and create waste;
- dynamic city/country growth and decline;
- urban roughly five / rural one-to-two meaningful last-mile competitors as design targets;
- industrial contracts can mature toward investment/acquisition;
- old World Instances remain when new worlds open;
- game must be attractive, enjoyable and visibly shaped by player/community contribution;
- no advance bulk asset generation when existing assets or real implementation need do not justify it.

---

# 6. Balancing values that should NOT block canon reconciliation

Do not ask the owner to permanently choose these now:

- minutes per game day;
- exact Work Capacity points/rates;
- kilograms/meters per fatigue unit;
- food/water quantities;
- wages;
- rent;
- vehicle/fuel/electricity prices;
- maintenance rates;
- training prices/durations;
- bankruptcy grace duration;
- production recipe quantities;
- tax rates;
- currency formula coefficients;
- season length;
- NPC productivity coefficient;
- exact local competitor-capacity formula around owner targets.

These belong to versioned configuration, economic simulations, telemetry and playtesting.

---

# 7. Recommended Phase-1 exit sequence

```text
PHASE-1 RESEARCH ARCHIVE MERGED AS NON-CANONICAL
-> OWNER APPROVES / AMENDS ARCHITECTURE DECISION PACKAGE
-> GAME_LOGIC_MASTER_MODEL promoted from research draft to owner-approved model
-> dedicated CANON RECONCILIATION branch/PR
-> conflict matrix resolved document by document
-> implementation dependency graph generated
-> implementation epics/issues ordered by causal prerequisites + R9 playability value
-> playable vertical slices implemented and owner-tested in meaningful batches
```

Do not implement the full global economy in one rewrite.

The first mature-economic vertical slice should contain the DNA of the final game:

```text
poor person
-> real need/consumption
-> real employer
-> real work shift
-> real wage
-> real merchant/customer demand
-> real cargo custody
-> visible downstream consequence
-> meaningful personal choice/progression
```

Later slices expand the same grammar toward company, production, city, country and global trade.

---

## Phase-1 conclusion

**The research is now broad enough to stop inventing new top-level systems. The remaining blockers are owner architecture decisions, followed by canonical reconciliation and empirical balancing/playtesting — not more open-ended concept generation.**
