# R1 — Hero Day Loop and Failure Ladder

Status: **RESEARCH WORKING PAPER — NON-CANONICAL**
Parent: #423
Track: #424

## Purpose

Translate the owner's consumption, energy, employment and insolvency direction into a playable daily loop without yet fixing permanent numeric balance values.

---

# 1. The starting workday

The first meaningful game loop should feel like the life of a poor entry worker, not a miniature CEO dashboard.

Conceptual day:

```text
Wake / recover
-> satisfy basic consumption
-> check Personal Money and daily obligations
-> travel/walk to work access point
-> start employer shift
-> receive route/work package compatible with current capability
-> perform low-tier deliveries
-> consume Work Capacity over time
-> take rest/break/recovery when needed
-> complete/end shift
-> authoritative employer settlement
-> receive daily/shift wage into Personal Money
-> buy food/water/basic needs
-> pay/settle accommodation and recurring obligations when due
-> choose: rest, study, shop, maintain equipment, socialize, additional eligible work
-> sleep/rest / next operating day
```

The player should immediately understand the economic question:

> How much did I earn, how much did living and working cost me, and what can I afford to improve next?

---

# 2. Starting employer work package

The entry employer owns commercial demand and allocates only work that fits the hero's capability.

Initial tasks may include:

- flyer distribution;
- letters/envelopes;
- documents;
- extremely small/light parcels;
- short pedestrian routes.

A route has at minimum:

- employer identity;
- work/shift identity;
- assigned service area;
- allowed cargo set;
- expected work window;
- workload/capacity target;
- quality/reliability rules;
- wage settlement rule.

The hero is not paid magical money for clicking each destination. The company pays for the completed work relationship/shift from its authoritative company finances.

---

# 3. Daily wage model

The owner's desired starting model is **day/shift wage first**.

Research baseline:

```text
eligible shift accepted
+ required minimum productive participation
+ valid attendance/work output
+ no disqualifying failure
-> shift closes
-> Company Money debit
-> Personal Money wage credit
```

Later employment models can add:

- productivity bonus;
- overtime;
- specialist premium;
- hazard/complexity premium;
- reliability bonus;
- promotion raise;
- salaried management roles;
- independent per-job contracts.

Those are later progression, not the initial compensation model.

---

# 4. Work Capacity during a day

Work Capacity prevents infinite activity.

Conceptual influences:

## Capacity decreases with
- walking distance;
- carried mass/volume;
- repeated loading/unloading;
- cycling/manual transport;
- long continuous work;
- poor prior rest;
- inadequate consumption;
- selected demanding training/practical work.

## Capacity is preserved/improved by
- adequate food/water;
- rest;
- better carrying equipment;
- vehicle assistance;
- efficient routing;
- profession mastery where justified;
- suitable work conditions.

## Capacity can restrict
- walking speed;
- maximum safe cargo;
- ability to start another demanding task;
- work quality/reliability if the player ignores severe fatigue;
- eligibility for overtime/additional work.

The system should discourage exploitation through endless shifts while avoiding constant nuisance clicks.

---

# 5. Consumption settlement

R1 recommends two complementary representations:

## Active-session representation
The player can see/understand immediate needs and current Work Capacity.

## Economic-day settlement
Recurring baseline consumption and obligations are settled on authoritative economic time rather than requiring a click for every sip of water or every meal calorie.

This allows food/water to be real goods and costs without turning the game into repetitive inventory micromanagement.

Exact granularity remains balancing research.

---

# 6. Personal financial ladder

The hero can move through economic states rather than only `has money / game over`.

```text
STABLE
  |
  v
TIGHT CASH FLOW
  |
  v
SUBSISTENCE PRESSURE
  |
  v
ARREARS / SERVICE LOSS
  |
  v
ASSET LIQUIDATION PRESSURE
  |
  v
PERSONAL INSOLVENCY / BANKRUPTCY
  |
  v
RECOVERY EMPLOYMENT
  |
  v
STABILIZATION
```

Transitions depend on actual obligations/assets and later insolvency rules.

---

# 7. Consequences must be causal

Examples:

### Cannot afford fuel
The vehicle is not deleted. It becomes unusable for fueled work until refueled; the hero may walk, sell it, seek lower-cost work or obtain legitimate assistance/credit only if later systems permit.

### Cannot afford food/basic consumption
Work Capacity and living stability deteriorate under the final balance model. The system routes the player toward emergency/basic subsistence and low-entry work rather than deleting the account.

### Cannot pay rent
A grace/default process may eventually reduce housing quality, terminate the rental or move the hero into a lower housing state. Exact rules belong to later housing/insolvency research.

### Cannot maintain vehicle
Condition degrades or the vehicle becomes unavailable/unsafe after governed thresholds. It cannot generate free productive capacity indefinitely.

### Cannot pay for training
The qualification does not unlock. The player must continue saving, seek employer-sponsored training, scholarship/apprenticeship mechanisms or choose another route.

---

# 8. Homelessness / emergency housing — research question

The owner requires real living costs and bankruptcy. Therefore R1 must research whether a hero can enter a formal **No Housing / Emergency Housing** state.

Candidate model:

- housing can be lost through insolvency;
- the hero's identity remains;
- storage, rest efficiency, comfort and location options worsen;
- low-tier employment remains reachable;
- public/emergency/basic shelter may exist as a minimum recovery service depending on the city/country model;
- shelter is not equivalent to normal owned/rented housing and should not remove the incentive to recover.

This must be reconciled with R5 city public services and R6 country policy variation before canonization.

---

# 9. Inactivity and catch-up

On login after absence, the server should settle elapsed slow economic cycles in summarized form rather than replay every minute.

Catch-up can include:

- living-cost settlements;
- rent/service status changes;
- vehicle/property recurring obligations;
- employment status changes;
- company/investment results;
- expired contracts;
- world-market changes relevant to the hero.

Starting wage does not continue merely because the hero remained employed on paper while producing no work.

The catch-up system must cap/settle insolvency rather than create absurd unbounded negative balances.

---

# 10. The first progression ladder

The starter progression can now be expressed causally:

```text
POOR PEDESTRIAN EMPLOYEE
-> survive daily living costs
-> complete shifts reliably
-> accumulate small savings
-> improve basic gear / carrying equipment
-> study introductory transport capability
-> obtain/buy first efficient transport
-> access better work
-> improve net daily surplus
-> build qualifications and reputation
-> choose career specialization or entrepreneurship
```

This is intentionally very far from:

```text
start game -> earn arbitrary XP -> click railway company unlock
```

---

# 11. Promotion inside the incumbent company

The starting employer can itself provide early progression without forcing entrepreneurship.

Possible career ladder to research:

```text
Pedestrian leaflet/letter courier
-> small-parcel pedestrian courier
-> bicycle courier
-> powered light-vehicle courier
-> driver / van courier
-> senior courier / route specialist
-> dispatcher / warehouse / maintenance training path
-> supervisor / specialist path
```

Promotion can depend on:

- reliability;
- attendance/work history;
- qualifications;
- employer demand;
- available positions;
- local labor-market conditions;
- training completion;
- equipment/authorization where personal ownership is relevant.

The player may leave at any point for another employer, independent work or later entrepreneurship.

---

# 12. Profitability is net, not gross

For both the hero and later companies:

```text
Gross income
- food/water/living costs
- housing
- travel
- fuel/energy
- maintenance
- equipment depreciation/consumables
- training/authorization costs
- other governed obligations
= Personal Net Surplus / Deficit
```

The player's equipment strategy matters because it changes both productive capacity and expenses.

A poorly chosen expensive vehicle can make a player less profitable than a bicycle courier on a short dense route.

---

# 13. Research boundary

R1 does not fix permanent values for:

- calories/liters;
- exact energy points;
- shift duration;
- wage amount;
- rent amount;
- fuel prices;
- vehicle depreciation;
- bankruptcy grace periods.

Those values require R3/R4/R5/R8 and balancing simulations.

R1 fixes the causal requirement: **time creates needs and costs; productive work consumes capacity; income must fund life and progression; failure has escalating economic consequences; recovery returns the person to legitimate work rather than resetting or deleting identity.**
