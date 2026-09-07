# R1 — Owner Decision Register

Status: **RESEARCH ONLY — PARTIALLY DECIDED BY OWNER**  
Parent: #423  
Track: #424

These decisions are intentionally not canonical yet. Owner statements recorded here guide the research model and will be reconciled into canon only after the full Game Logic Research exit gate.

---

## D-R1-001 — Economic hero count per World Instance

### Option A
Allow multiple independent economic heroes/alts per account in the same World Instance.

### Option B — RECOMMENDED
Allow **one primary economic hero per account per World Instance**.

The hero can change professions, employers and companies instead of creating alternate identities.

Decision: **PENDING OWNER**

---

## D-R1-002 — What transfers between World Instances

### Option A
Skills/qualifications and economic capability follow the account into new worlds.

### Option B — RECOMMENDED
Only non-economic account history transfers by default:
- account identity;
- settings/accessibility;
- cosmetics with no economic power;
- historical achievements/profile;
- tutorial familiarity / optional tutorial skip.

The new world's hero re-establishes Personal Money, qualifications/mastery with economic effect, property/assets, shares, employment/membership and economic reputation.

Decision: **PENDING OWNER**

---

## D-R1-003 — Internal company membership

### Option A
A hero may be an internal member of many companies simultaneously.

### Option B — RECOMMENDED
A hero has **one active primary Internal/Member company at a time**.

They may still own external shares in many companies, trade with competitors, perform governed outside contracts where permitted and retain historical Founder identity in old companies.

Decision: **PENDING OWNER**

---

## D-R1-004 — Personal metabolism, consumption and work energy

### Previous recommendation — REJECTED BY OWNER
Treat food, water, housing and personal consumption mainly as soft lifestyle/economy sinks without a meaningful recurring survival/energy constraint.

### Owner direction — ACCEPTED FOR RESEARCH
The human hero is both a **producer and a consumer** in the simulated economy.

Authoritative world time creates recurring personal consumption and operating requirements. The research model must include at minimum:

- food consumption;
- water/basic household consumption;
- Personal Money living costs;
- housing/accommodation costs where applicable;
- a finite personal **Energy / Work Capacity** resource;
- rest/recovery requirements;
- equipment-dependent efficiency;
- fuel/electric charge/energy consumption for personally operated vehicles and equipment;
- maintenance and other recurring ownership costs where applicable.

The hero cannot perform unlimited work continuously. Walking, carrying cargo, operating equipment and completing shifts consume finite personal capacity. Rest, food, water and suitable conditions restore or support capacity according to later balancing rules.

This is an **economic-metabolic loop**, not an arcade punishment loop. Exact hunger/thirst timers, quantities and UI representation remain research/balancing questions.

### Offline / inactive consequence

World time does not freeze merely because a player is offline.

Governed recurring obligations and consumption may continue while the hero is inactive. Depending on their assets, contracts and reserves, an inactive hero may:

- exhaust liquid Personal Money;
- lose optional services or rented privileges;
- become unable to fund fuel/maintenance/travel;
- default on future designed obligations;
- liquidate or lose eligible assets under later insolvency rules;
- become personally insolvent / bankrupt.

Bankruptcy does **not** delete player identity. It returns the person to a recoverable economic state with access to legitimate low-entry work.

Decision: **OWNER DIRECTION RECORDED — research details still open**

---

## D-R1-005 — Hero aging and death

### Option A
Player hero ages out/dies permanently as World Instance years pass.

### Option B — RECOMMENDED
No permanent aging-out/death of the human player's economic identity. Population births/deaths may be simulated abstractly for society, while the player persists. Retirement/inactivity/legacy are social/economic states rather than deletion.

Decision: **PENDING OWNER**

---

## D-R1-006 — Global travel

### Option A
Selecting a country/city on the strategic map instantly teleports the hero there.

### Option B — RECOMMENDED
The strategic map selects/plans destinations; physical presence changes through unlocked transport infrastructure.

Travel may consume tickets/fees, fuel/energy, schedules and modeled time. Long travel may be time-compressed for usability, but route/infrastructure capability remains economically real.

Decision: **PENDING OWNER**

---

## D-R1-007 — Newcomer/recovery floor in mature worlds

### Owner clarification
The recovery floor must **not** make a poor player economically comfortable for free. It guarantees a way back into productive society, not immunity from poverty.

### Revised recommendation
Every World Instance guarantees a non-softlocking **lowest economic rung**:

- basic embodied access and basic phone/application access;
- walking as the lowest transport mode;
- access to water/basic subsistence through a governed mechanism;
- access to the lowest-tier legitimate employment or public/NPC fallback when the human market supplies none;
- access to introductory training;
- a path to earn Personal Money again;
- no free high-value vehicle, company, industrial asset or specialist qualification.

A bankrupt hero may therefore be very poor and constrained, but must still have a path to recover through work.

Decision: **OWNER DIRECTION RECORDED — details continue in R1/R3/R4**

---

## D-R1-008 — Existing prototype save vs fresh multiplayer worlds

### Option A
Import current local Company Money/assets/company ownership directly into a future fresh shared World Instance.

### Option B — RECOMMENDED
Preserve current saves through an explicit legacy/offline/migration path, but do **not** inject existing local economic power into a fresh competitive World Instance.

Decision: **PENDING OWNER**

---

## D-R1-009 — Starting socio-economic position

### Previous broad model
New hero begins as a generic newcomer with several possible introductory work paths.

### Owner direction — ACCEPTED FOR RESEARCH
The intended first-life fantasy is deliberately poor and constrained:

1. the hero begins as a **pedestrian courier / entry employee** rather than a company owner;
2. the hero works for a large incumbent delivery/logistics employer;
3. the earliest work consists of low-value, low-capacity jobs such as flyers, letters/envelopes and other small/light items;
4. the hero is paid primarily **per work day / shift**, not automatically per parcel;
5. the employer owns/controls the commercial operation and the hero initially owns almost no productive capital;
6. the hero must fund personal consumption from wages;
7. early equipment and transport progression comes through saving, buying, studying, qualifying and obtaining the relevant authorizations/access;
8. the hero cannot move directly from pedestrian courier to owning a railway, steelworks, airport or international industrial network merely because enough game time elapsed;
9. advanced ownership requires cumulative capital, knowledge, qualifications, organizational capability, infrastructure access and other prerequisites defined by later tracks.

The owner used **Amazon** as the concrete starting-employer reference. Research must separately decide whether production uses a licensed real brand, an explicit parody/reference, or a fictionalized large incumbent logistics company. Until that legal/brand decision is closed, the economic role is authoritative for research but the final employer name is not.

Decision: **OWNER DIRECTION RECORDED**

---

## D-R1-010 — Capability-gated delivery and equipment progression

### Owner direction — ACCEPTED FOR RESEARCH
No hero can deliver every cargo, operate every vehicle or access every geography from the beginning.

A delivery/service opportunity may require a compatible combination of:

- personal Energy / Work Capacity;
- physical cargo capacity;
- equipment/tool capability;
- vehicle capacity/range;
- fuel/charge/energy availability;
- qualification/training;
- license/authorization/permit abstraction where modeled;
- employer/company permission;
- infrastructure access;
- geographic/world access;
- cargo-handling specialization;
- money for operating/travel costs;
- reputation/experience where justified;
- company capability for advanced commercial work.

Progression therefore emerges from **earning + buying + studying + qualifying + being authorized + gaining organizational/territorial access**, not from one arbitrary player level.

Decision: **OWNER DIRECTION RECORDED**

---

# Revised R1 architecture package

The owner has materially revised the earlier package. The current research direction is now:

- one persistent person can hold multiple orthogonal social/economic roles;
- the person has real recurring consumption and finite work energy;
- vehicles/equipment have operating resources and recurring costs;
- offline time can create economic deterioration and personal insolvency;
- insolvency is severe but recoverable and never deletes identity;
- the first hero state is deliberately poor, employed and pedestrian;
- first income is wage/shift based rather than arbitrary per-parcel money creation;
- cargo, transport, geography and ownership are capability-gated;
- industrial/global power must be built through capital, learning, authorization, people and infrastructure.

R1 remains open until the remaining pending identity/world-transfer/aging/travel/save decisions and the detailed metabolic/offline model are reconciled with R3, R4 and R8.
