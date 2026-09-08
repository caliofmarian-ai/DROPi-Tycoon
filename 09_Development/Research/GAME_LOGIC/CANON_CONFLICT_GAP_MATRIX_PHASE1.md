# Game Logic Research — Canon Conflict and Gap Matrix (Phase 1)

Status: **RESEARCH ONLY — NON-CANONICAL**
Parent: #423

## Purpose

Identify where the integrated research model preserves, extends, conflicts with or should eventually replace current canon/runtime assumptions. This file does **not** perform the reconciliation; it tells a later owner-approved reconciliation PR what must change.

Legend:
- `KEEP` — existing canon already aligns.
- `EXTEND` — existing canon is compatible but incomplete.
- `RECONCILE` — wording/ownership must be reconciled.
- `RETIRE/REPLACE` — prototype-era assumption should eventually be superseded after owner approval.
- `OPEN DECISION` — no canonical change until owner chooses.

---

| Domain | Existing truth | Research finding | Status | Reconciliation need |
|---|---|---|---|---|
| Player embodiment | GDD: player is a visible person physically inhabiting the world | Preserved; hero additionally has metabolism, Work Capacity and personal economy | EXTEND | Add consumption/work-capacity specialization without changing embodied principle |
| Starter company | `PROGRESSION.md` says current runtime has starter company for compatibility and is not proof future player starts as owner | Owner now wants poor pedestrian employee start | RECONCILE | Future canonical start should be employee-first; preserve current runtime as legacy migration/prototype compatibility until implementation changes |
| Starter compensation | Runtime delivery completion credits `company.money += activeOrder.reward` per delivery | Owner wants starting hero paid daily/shift wage by employer | RETIRE/REPLACE | Current per-order Company Money reward remains runtime legacy until economic migration; future starter employment must debit employer Company Money and credit Personal Money |
| Delivery jobs | Current runtime order/reward exists as self-contained playable mission | Research requires every delivery to derive from consumer/business/industrial demand, inventory and payer | RETIRE/REPLACE | Replace mission-like reward generation gradually with demand/procurement/contract/custody chain |
| Personal Money | `PERSONAL_FINANCE.md` already separates personal and company ownership | Preserved and becomes central to living costs, wages, purchases and investment | KEEP + EXTEND | Activate in staged runtime migration; add living-cost categories and insolvency rules |
| Company Money | Canon defines separate company funds and operating costs | Preserved | KEEP | Extend sources/sinks and ensure wages, fuel, utilities, inventory and production settle through company ledger |
| Food/water personal consumption | No complete canonical human-player metabolic model | Owner explicitly requires daily food/water consumption | GAP / EXTEND | Add personal consumption specialization after research approval |
| Work energy | No canonical finite hero Work Capacity preventing infinite labor | Owner explicitly requires finite energy/capacity | GAP | Add Work Capacity domain tied to work, rest, food/water, equipment and time |
| Vehicle operating resources | Existing economy mentions energy/fuel/maintenance broadly | Research requires actual route/use-dependent fuel/charge and maintenance economics | EXTEND | Connect vehicle operation to inventory/energy/cost rather than ownership-only progression |
| Cargo eligibility | Canon has earned capability/qualification and transport compatibility | Research adds explicit capability envelope per cargo/job | KEEP + EXTEND | Formalize cargo size/mass/handling/temperature/hazard/vehicle/authorization requirements |
| Progression | `PROGRESSION.md`: Personal Capability + Company Capability + World Access; money alone insufficient | Strongly preserved | KEEP | Expand concrete causal gates: earn/buy/study/qualify/authorize/infrastructure |
| Professions | Canon lists many specialization families | Research turns them into labor-market capability with training/jobs/wages/scarcity | KEEP + EXTEND | Create later profession/qualification authority document and data model |
| Employment | `EMPLOYEES.md` currently models company employees, initial Courier role and deterministic payroll cycle | Research adds human employment contracts, shifts, wage settlement and role market | EXTEND | Keep one workforce truth; human and NPC labor must use compatible employment/payroll semantics |
| Payroll time | `EMPLOYEES.md` explicitly does not invent a game clock | `WORLD.md` now has time and R8 defines shift/daily settlement candidates | EXTEND | Later connect payroll to authoritative R8 cycles, preserving idempotency |
| Player inactivity | Canon protects identity and supports shared-world continuity but lacks full personal offline economics | Owner wants inactivity capable of causing insolvency | RECONCILE / EXTEND | Define which obligations continue, no passive starter wages, bounded default states and catch-up |
| Personal bankruptcy | Canon allows setbacks but lacks detailed personal insolvency | Research requires personal bankruptcy/recovery ladder | GAP | Add insolvency specialization; bankruptcy must not delete identity |
| Company bankruptcy | Business canon permits distress conceptually but lacks complete liquidation/restructuring | Research requires full distress, sale, acquisition, closure and continuity | EXTEND | R2 later specializes liquidation priority, employee/contract/asset consequences |
| Day/night | `WORLD.md` already defines local clock and economic effects | Preserved | KEEP | R8 adds authoritative scheduling/catch-up details |
| Week/season/year | `WORLD.md` already defines market/season/slow cycles | Preserved | KEEP | R8 should own concrete cycle semantics and server settlement |
| World Instances | `WORLD_INSTANCES.md` already defines independent persistent worlds and no economic import from mature worlds | Preserved | KEEP | R1/R8 still need owner decision on account-wide skills/history vs world-local capability |
| Global hierarchy | `WORLD.md`: Global -> Country -> Region -> Locality/External Node -> Detailed Scene | Preserved | KEEP | Map implementation must follow this, not one giant active world |
| Sparse country nodes | Current global-map research establishes representative localities rather than every city | Preserved by R6 | KEEP / EXTEND | Later data-selection methodology needed for all countries |
| External industry | `WORLD.md` already says farms/mines/steelworks/paper/chemical/energy may exist outside towns | Strongly preserved | KEEP | R4/R6 add ownership, contracts, supply chains and acquisition |
| City consumption | `WORLD.md` already says locality growth needs food/energy/materials/jobs/housing/services but not full stock-flow household model | Research makes households/utilities explicit consumers | EXTEND | R5 later owns household cohorts, retail restocking and utility demand |
| Waste/wastewater | Existing asset/world canon does not yet provide complete economy loop | Owner requires waste; research creates collection/treatment/recycling logistics | GAP / EXTEND | Add waste product/custody/utility systems after R4/R5 approval |
| Housing | World tracks housing/service capacity, personal finance mentions future personal purchases | Research needs real rent/property/living-cost and possible housing loss | EXTEND | Later housing specialization; decide homelessness/emergency housing model |
| City growth/decline | `WORLD.md` already defines causal growth, decline, recovery, migration and new settlements | Preserved | KEEP | R5 gives stock/flow implementation detail |
| Rural identity | `WORLD.md` already requires distinct rural development | Preserved; owner adds 1–2 delivery-company target | KEEP + EXTEND | Later market-capacity formula and rural economic content |
| Urban competition | Business canon allows territorial capacity but no exact permanent cap | Owner wants roughly max 5 delivery competitors per city/locality | OPEN BALANCING / OWNER DIRECTION | Preserve as design target; R4/R5 must derive capacity economically rather than hard counter only |
| Industry acquisition | Business canon permits infrastructure/productive ownership generally | Owner explicitly wants contract relationship progressing to acquisition/privatization | EXTEND | R2/R6 must define auctions, sales, concessions, capability and anti-monopoly |
| Vertical integration | Canon allows products/production and infrastructure | Research makes supply-chain ownership an explicit strategy | EXTEND | Add later acquisition/production strategy rules, not automatic upgrade |
| National development | `WORLD.md` already defines dynamic country prosperity/decline | Preserved | KEEP | R6 adds production/trade/infrastructure and possible monetary model |
| National currencies | `WORLD.md` calls national currency a future advanced system | Owner vision wants countries capable of strengthening national currency | OPEN DECISION | Decide universal currency vs national-currency target and reconcile Company Money semantics |
| War/macroeconomic conflict | `WORLD.md` already allows macro conflict/war, no tactical combat | Preserved | KEEP | R6/R8 later define economic triggers/effects/frequency and recovery |
| State disappearance/change | `WORLD.md` already permits merge/split/inactive/re-emerge with stable history IDs | Preserved | KEEP | Later simulation/state-transition rules required |
| Multiplayer human/NPC economy | GDD/company canon says NPC and human roles share one model and low population remains playable | Strongly preserved | KEEP | R7 adds market/labor continuity, anti-collusion and authority specifics |
| Shared authority | `SHARED_AUTHORITY_CONTRACT.md` already defines server/trusted authority, revisions and idempotency | Strongly preserved | KEEP | Extend state-family coverage to inventory/cargo/world time/consumption when implementation reaches them |
| One hero/account/world | Not yet canonical | Research recommends it for market integrity | OPEN DECISION | Owner decision required before identity model canon reconciliation |
| One internal member company | Not yet fully canonical as universal player rule | Research recommends one primary internal company | OPEN DECISION | Owner decision required; external investment remains separate |
| Hero aging/death | Not fully resolved | Research recommends persistent human identity, NPC demographics separate | OPEN DECISION | Owner decision required |
| Travel vs teleport | GDD/world emphasize physical infrastructure; no final global travel settlement | Research recommends infrastructure-backed travel, no map teleport | KEEP + OPEN DETAIL | Likely compatible; owner should approve final global travel rule |
| Prototype save import | Existing docs require explicit migration | Research recommends no unauthoritative economic power imported into fresh multiplayer world | KEEP + OPEN DETAIL | Define legacy/offline/migration presentation |
| Starting employer brand | Owner cites Amazon as desired concrete reference | No current canon authorizes real-brand licensing/use | OPEN DECISION / LEGAL | Research brand/licensing/fictionalization before shipping content |
| Economy core loop | `ECONOMY.md`: Demand -> Orders -> Deliveries -> Revenue -> Expenses -> Profit -> Investment -> Growth | Directionally compatible but too logistics-company-centric for global production society | EXTEND | Replace/expand with universal stock-flow model while preserving business finance logic |
| Market demand | `MARKET.md` says customers/businesses generate demand by population/time/weather/etc. | Preserved but research makes demand consume actual inventory/resources | EXTEND | Move from abstract demand values toward stock/flow procurement |
| Static market MVP | `MARKET.md` allows static values in first playable scope | Incompatible with final persistent global economy but valid historical prototype scope | RETIRE/REPLACE LATER | Keep as historical MVP note; final system uses dynamic local markets |
| Real-world inspired events | World canon permits inspired categories but not exact forecasts | Preserved | KEEP | Use fictional World Instance outcomes and versioned real-world-inspired baselines |

---

# Highest-priority reconciliation conflicts

The largest future canonical/runtime changes are not the global map. They are:

1. **starter ownership -> starter employment**;
2. **per-delivery company reward -> wage + demand-backed company revenue**;
3. **no human metabolic economy -> food/water/Work Capacity/living costs**;
4. **abstract demand -> inventory/consumption/procurement-driven demand**;
5. **offline mostly protective -> offline economic obligations with bounded insolvency**;
6. **company-only finance emphasis -> person + company + city + country stock/flow economy**.

These should not be silently patched into existing canon one document at a time. They need the final owner-approved master model first.

---

# Canon that appears robust and should not be unnecessarily rewritten

The research strongly validates these existing foundations:

- embodied human player;
- Personal Money vs Company Money separation;
- three-axis progression;
- money alone cannot unlock capability;
- physical company/world infrastructure;
- mixed human/NPC workforce;
- global hierarchy with bounded simulation frequency;
- external productive nodes;
- migration/city/country development;
- persistent World Instances;
- stable historical IDs;
- macro rather than tactical war;
- server-authoritative shared economic truth;
- idempotent/revisioned settlement;
- old worlds remain when new worlds open.

The later reconciliation should **extend these**, not rewrite them for novelty.

---

## Research conclusion

The current canon is not fundamentally broken. It has a strong world/business/authority skeleton. The main mismatch is that the current playable economic loop still reflects the prototype's `delivery -> reward -> company money` model, while the owner now wants a much deeper human-consumption and stock-flow society. The research phase exists to bridge that gap deliberately before implementation.
