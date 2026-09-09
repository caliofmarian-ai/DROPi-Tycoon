# Document Information

Document: FIRST_HOUR_LOCALITY_PORTABILITY_CONTRACT.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical Narrative Portability Contract
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-09
Parent Authority: `01_GameDesign/STORY_BIBLE.md`
Brăila Authored Authority: `01_GameDesign/NARRATIVE_IDS_AND_FIRST_HOUR_CONTRACT.md`
Campaign Authority: `01_GameDesign/CAMPAIGN_STRUCTURE.md`
Universal Narrative-Role Authority: `01_GameDesign/ACT_II_PORTABLE_RELATIONSHIP_CONSEQUENCE_CONTRACT.md`
Global Start Requirement: #634
Global Functional-Locality Requirement: #643
Settlement Evolution Requirement: #651

---

# DROPi Tycoon — First-Hour Locality Portability Contract

## Purpose

This document reconciles the canonical Brăila first-hour story with the global-start and global-functional-locality requirements.

It defines the narrative bridge between:

`portable first-hour meaning -> current locality -> locality-specific cast/content binding -> legitimate mission/work materialization`

without turning Brăila, Ana Stoica, Radu Marin, Mirela Stan, Petru Neagu, Northstar's Brăila workplace, or any Brăila district into universal global dependencies.

Brăila remains the **PREMIUM_BESPOKE narrative reference implementation**. Its named cast, authored lines, places, relationship history and `story:braila:first-day:*` identities remain canonical Brăila content.

The universal layer is the **emotional/narrative function** of the first hour, not a copied Brăila script with renamed labels.

Canonical rule:

> **SAME NARRATIVE FUNCTIONS + DIFFERENT LOCAL PEOPLE + LEGITIMATE LOCAL CAUSES.**

This document does not create a second role registry, mission engine, locality catalog, persistence system, economy, work system or dialogue UI.

---

# 1. Audit Result and Authority Reconciliation

The current canon contains four facts that must coexist without contradiction.

## 1.1 Brăila Story Bible Canon Is Valuable and Must Survive

`STORY_BIBLE.md`, `CAMPAIGN_STRUCTURE.md` and `NARRATIVE_IDS_AND_FIRST_HOUR_CONTRACT.md` define a detailed Brăila opening with:

- the employee-first economic situation;
- Ana Stoica as dispatcher/mentor;
- Radu Marin as coworker/peer;
- Mirela Stan as recurring merchant/client;
- Petru Neagu as recurring household customer;
- Station Commons, Brăila Commerce and Old Town as authored Brăila contexts;
- eight first-hour beats;
- stable `arc:braila:first-day`, `beat:braila:*`, `story:braila:*`, line and fact identities.

Those identities remain valid. They are not renamed into generic IDs and they are not reassigned to another locality.

## 1.2 The Existing Brăila Runtime Registry Is a Specialization, Not the Global Template

`game-web/src/missions/brailaFirstHourAuthoredRegistry.ts` is explicitly a Brăila-authored registry.

That specialization is not itself a defect.

The defect would be treating it as the only first-hour path for every starting locality or silently invoking it when the current locality is not Brăila.

DT-08 does not change that mission runtime in this slice.

## 1.3 A Universal Role Vocabulary Already Exists

`ACT_II_PORTABLE_RELATIONSHIP_CONSEQUENCE_CONTRACT.md` already owns the reusable narrative-role identities and locality-specific binding principle.

This document **consumes** that authority. It does not create a competing registry.

The first hour primarily consumes:

- `role:dispatcher-mentor`;
- `role:coworker-peer`;
- `role:merchant-client`;
- `role:household-customer`.

Later first-day/Act I content may additionally consume the existing producer, trainer, rival, operations and institutional roles when legitimate local context exists.

## 1.4 The Missing Contract Was the First-Hour Bridge

Before this document, the project had:

- a strong Brăila first-hour authored contract;
- a later portable narrative-role contract;
- a global requirement that players may begin outside Brăila;

but no explicit canonical rule connecting those three layers for the opening hour.

This document fills only that gap.

---

# 2. Four Separate Narrative Concepts

These concepts must not be collapsed.

## 2.1 Global Narrative Role

A global narrative role describes **what a person contributes to the story**, not who that person is.

Examples use the already-canonical role authority:

- `role:dispatcher-mentor` = interprets work standards and professional responsibility;
- `role:coworker-peer` = makes another worker's goals, limits and choices visible;
- `role:merchant-client` = makes service reliability matter to a real local business relationship;
- `role:household-customer` = makes service personal rather than purely transactional.

A role does not own:

- a character name;
- a real-world identity;
- an employer;
- a locality;
- a mission;
- a relationship score;
- a world location.

## 2.2 Brăila-Specific Named Character

A Brăila-specific named character is a persistent authored person in Brăila canon.

Examples:

- `ana-stoica`;
- `radu-marin`;
- `mirela-stan`;
- `petru-neagu`.

Those identities belong to those people and their actual authored histories.

They are not role aliases and are never substituted into another locality merely because another locality needs the same narrative function.

## 2.3 Locality-Specific Binding

A locality-specific binding means:

`universal narrative role -> actual current locality -> actual authored/local character`

The runtime locality identity comes from the owning World/Locality authority. DT-08 consumes it as an opaque governed identity and does not mint a parallel locality ID.

A binding may also refer to legitimate local employer/customer/facility/world context, but those entities must come from or be reconciled with their owning authorities.

A locality binding must never fabricate a real-world business, address, institution, street or factual identity merely to satisfy story structure.

Fictional local characters and fictional companies may exist when intentionally authored and clearly part of the game world, but they must still be bound to legitimate playable locality context rather than to invented factual geography.

## 2.4 Portable Narrative Event

A portable narrative event is the location-neutral **meaning** of an authored beat.

It states:

- the emotional function;
- required narrative role(s), if any;
- required authoritative gameplay facts;
- the consequence semantics that may be authored;

without fixing:

- a city name;
- a person name;
- a district;
- a route;
- a cargo item;
- a wage amount;
- a mission instance ID.

DT-09 may materialize a mission or sequence for such an event through the existing Mission Framework only when legitimate local authority satisfies the requirements.

---

# 3. Portable First-Day Template Identity

Canonical portable template family:

`story-template:first-day`

This is a semantic authored-content template family, not a mission instance and not a replacement for Brăila authored refs.

The eight stable portable event identities are:

| Portable event identity | Display function |
| --- | --- |
| `story-template:first-day:a-place-to-start` | A Place to Start |
| `story-template:first-day:the-first-standard` | The First Standard |
| `story-template:first-day:one-small-thing` | One Small Thing |
| `story-template:first-day:a-person-not-an-address` | A Person, Not an Address |
| `story-template:first-day:capacity-has-a-cost` | Capacity Has a Cost |
| `story-template:first-day:first-consequence` | First Consequence |
| `story-template:first-day:first-pay-means-something` | First Pay Means Something |
| `story-template:first-day:tomorrow-has-more-than-one-direction` | Tomorrow Has More Than One Direction |

These IDs identify universal narrative meaning only.

They do not replace or mutate the existing Brăila identities.

---

# 4. Brăila Premium Binding

For Brăila, the portable template resolves to the existing authored canon.

| Portable event | Brăila authored specialization | Required/primary Brăila binding |
| --- | --- | --- |
| `story-template:first-day:a-place-to-start` | `story:braila:first-day:a-place-to-start` | Ana / Brăila opening work context |
| `story-template:first-day:the-first-standard` | `story:braila:first-day:the-first-standard` | Ana + Radu |
| `story-template:first-day:one-small-thing` | `story:braila:first-day:one-small-thing` | Mirela + legitimate local delivery |
| `story-template:first-day:a-person-not-an-address` | `story:braila:first-day:a-person-not-an-address` | Petru + legitimate household service |
| `story-template:first-day:capacity-has-a-cost` | `story:braila:first-day:capacity-has-a-cost` | Radu + legitimate capacity/dispatch context |
| `story-template:first-day:first-consequence` | `story:braila:first-day:first-consequence` | actual previously involved Brăila character(s) |
| `story-template:first-day:first-pay-means-something` | `story:braila:first-day:first-pay-means-something` | authoritative wage settlement |
| `story-template:first-day:tomorrow-has-more-than-one-direction` | `story:braila:first-day:tomorrow-has-more-than-one-direction` | Ana/Radu + legitimate visible opportunity horizon |

This table is a **specialization mapping**, not a global fallback map.

The existing Brăila line IDs and copy remain Brăila-only wherever they name Brăila, Station Commons, Brăila Commerce, Old Town or a named Brăila character.

Example:

> `Brăila. First shift. One phone, one backpack, and a day that has to add up.`

is authentic Brăila authored copy.

It must not be shown in Dublin, Paris, Tokyo, New York, another Romanian locality or any other non-Brăila locality by changing only the place label.

---

# 5. Portable First-Hour Beat Semantics

## 5.1 A Place to Start

Portable event:

`story-template:first-day:a-place-to-start`

Universal narrative function:

- establish that the player begins economically small but personally significant;
- establish immediate need for legitimate productive work;
- establish current local reality rather than a universal Brăila biography.

Required authoritative facts:

- fresh-world hero exists;
- current starting locality is authoritative;
- a legitimate opening work/employment context exists in that locality;
- the player does not already own the opening employer/company infrastructure;
- opening transport/capability state is legitimate.

No locality may satisfy this event by silently returning the hero to Brăila.

## 5.2 The First Standard

Portable event:

`story-template:first-day:the-first-standard`

Primary roles:

- `role:dispatcher-mentor`;
- `role:coworker-peer` where a legitimate peer exists.

Universal narrative function:

- establish one real professional standard that matters immediately;
- show that coworkers have their own goals and pressures;
- treat inexperience as a beginning, not incompetence.

A local mentor cannot grant capability, qualification, promotion or authority through dialogue.

## 5.3 One Small Thing

Portable event:

`story-template:first-day:one-small-thing`

Primary role:

- `role:merchant-client`.

Universal narrative function:

- first work matters because a real local need exists;
- the player sees a human/business consequence behind a job;
- pickup, custody, route, delivery and consequence remain attached to real system state.

Required authority:

- legitimate local order/work need;
- legitimate cargo/custody path;
- legitimate local endpoint;
- legitimate completion/failure outcome.

The story may not create fake local demand merely because the template expects a merchant beat.

## 5.4 A Person, Not an Address

Portable event:

`story-template:first-day:a-person-not-an-address`

Primary role:

- `role:household-customer`.

Universal narrative function:

- contrast service to a person/household with service to a business;
- create a first remembered human relationship outside the workplace.

This beat is optional when no legitimate household-service event exists yet.

It must not spawn a fake parcel or fake resident solely to complete a checklist.

## 5.5 Capacity Has a Cost

Portable event:

`story-template:first-day:capacity-has-a-cost`

Primary roles:

- `role:coworker-peer` and/or `role:dispatcher-mentor`.

Universal narrative function:

- finite time and Work Capacity create a real limit;
- protecting an existing commitment is legitimate;
- helping another worker must go through legitimate work/dispatch authority when work is involved.

The narrative may expose a choice only when the owning systems prove the options are real.

## 5.6 First Consequence

Portable event:

`story-template:first-day:first-consequence`

Universal narrative function:

- a prior action is remembered by the actual person/organization affected;
- reliable work, recovery and unresolved failure produce meaningfully different authored responses.

The consequence must read actual history.

The role used here is determined by the real earlier event. The story must not substitute a globally fixed mentor/customer when another local person was actually involved.

## 5.7 First Pay Means Something

Portable event:

`story-template:first-day:first-pay-means-something`

Universal narrative function:

- the player understands that paid work produces breathing room but also opportunity cost;
- money competes with legitimate living, equipment, saving, training and time pressures where those systems exist.

Required authority:

- a real exactly-once settlement has occurred.

Narrative never chooses or mints the amount.

## 5.8 Tomorrow Has More Than One Direction

Portable event:

`story-template:first-day:tomorrow-has-more-than-one-direction`

Primary roles:

- `role:dispatcher-mentor` and/or `role:coworker-peer`;
- another existing role only when the local opportunity context makes it legitimate.

Universal narrative function:

- close the first hour with earned possibility rather than a mandatory founder/CEO path;
- show that reliability may open conversations while real capability determines access;
- preserve multiple legitimate career directions.

The story must not advertise a training, vehicle, profession, facility or job path that the player-facing authoritative systems cannot actually support.

---

# 6. Locality Resolution Rules

The narrative layer follows this resolution order.

## 6.1 Resolve the Actual Current Starting Locality

The current locality comes from the owning World/Locality/World Instance authority.

DT-08 does not infer it from:

- nationality;
- IP address;
- GPS;
- device locale;
- last viewed world-map location;
- Brăila as a default constant.

## 6.2 Check That the Locality Can Legitimately Host the Beat

A locality may expose a portable story event only when the required local gameplay/economic/world context is legitimate.

`CATALOGED` does not mean story-ready.

A locality that is `LATENT`, a rural point, hamlet, village or another low-development settlement under #651 must not receive a fake mature-city depot, merchant district, workforce or courier network merely because the canonical Brăila first hour contains those things.

If legitimate local causes support comparable work, the portable narrative function may materialize through that real context.

If they do not, the beat waits, adapts through a separately authored legitimate local structure, or the locality is not exposed as supporting that starter story path yet.

## 6.3 Resolve a Locality-Specific Cast Binding

The story content layer resolves required universal roles to actual characters authored for the current locality.

The binding must preserve:

- stable character identity;
- actual locality association;
- real relationship history for that character;
- compatibility with the local employer/customer/work context.

A missing binding must not silently select a Brăila character.

## 6.4 Resolve the Local Authored Specialization

A locality-specific authored specialization may provide:

- local lines;
- character-specific tone;
- local environmental references;
- culturally/locality-appropriate fictional context;
- optional local beat variants.

It must preserve the portable event's semantic function and authority gates.

It must not create factual local claims that source/world authority does not support.

## 6.5 Materialize Through Existing Gameplay Authorities

DT-09 may materialize the selected authored event through the existing Mission Framework and legitimate local endpoints.

DT-08 does not prescribe a second mission state machine.

---

# 7. No-Brăila-Fallback Rule

For any non-Brăila starting locality, the following are forbidden unless the player has actually travelled to Brăila and the story intentionally enters Brăila canon:

- `ana-stoica` as automatic opening mentor;
- `radu-marin` as automatic coworker;
- `mirela-stan` as automatic first merchant;
- `petru-neagu` as automatic household customer;
- Station Commons as automatic work location;
- Brăila Commerce as automatic merchant destination;
- Old Town as automatic household destination;
- `arc:braila:first-day` as the locality's own first-day identity;
- `story:braila:first-day:*` as the locality's own authored references;
- Brăila-specific line copy with only the city label swapped.

If a non-Brăila locality lacks its own valid binding, the correct state is **content not yet legitimately materialized**, not `fallback-to-Brăila`.

---

# 8. Relationship and History Semantics

## 8.1 Roles Do Not Carry Relationship History

Relationship history belongs to actual characters and the events they experienced.

Two people fulfilling `role:dispatcher-mentor` do not share trust, disappointment, promises or memories.

## 8.2 Locality Does Not Erase Old Relationships

Relocating away from Brăila does not delete Ana, Radu, Mirela or Petru history.

Likewise, returning to a locality may allow its actual cast to remember prior events when persistence authority proves those events still belong to the World Instance.

## 8.3 New Locality Means New Local Human Context

When the player enters a different locality, new characters may know the player's externally observable professional history only when a legitimate game mechanism supports that knowledge.

They do not automatically inherit another locality's personal relationship history.

## 8.4 Narrative Facts Must Remain Source-Event Grounded

Narrative consequences may be authored from real event history.

DT-08 does not create:

- hidden universal friendship points;
- universal trust percentages;
- role-level relationship state shared across characters.

---

# 9. Brăila Authenticity Preservation

Global portability does not flatten Brăila.

The following remain valid Brăila-specific authored strengths:

- Ana's exact personality and mentor arc;
- Radu's technical-career aspiration;
- Mirela's merchant history;
- Petru's city-memory function;
- Brăila district identities;
- Danube/port/industrial narrative texture;
- local authored copy and pacing;
- later Brăila-specific recurring consequences.

Other localities should not be forced to reproduce those exact biographies or urban meanings.

They should satisfy the same narrative functions through their own believable local people and legitimate local economic/world circumstances.

Portability therefore means:

`preserve universal emotional logic`

not:

`clone Brăila and rename the nouns`.

---

# 10. Cross-DT Consumption Boundaries

## DT-11 — Global World / Localities

Supplies governed locality identity, readiness and the Catalog -> PlayableLocalityInstance boundary.

DT-08 does not create locality records.

## DT-18 — World Time & Evolution

Supplies settlement-development truth when narrative must know whether a locality is latent, rural, hamlet, village, town, city or larger.

DT-08 does not promote a settlement through dialogue.

## DT-07 — Production / Supply / Resources

Supplies legitimate local economic causes when a story beat depends on demand, production, stock or local work need.

DT-08 does not fabricate shortages or demand.

## DT-09 — Missions / Campaign / Delivery Materialization

Consumes the portable event identity plus the chosen locality specialization and materializes legitimate work through the existing Mission Framework.

DT-09 must extend/reconcile the current mission authority; it must not create a second mission engine for global starts.

## DT-03 — Player Economy & Marketplace

Supplies authoritative settlement/reward evidence.

DT-08 never chooses payout amounts.

## DT-06 — Professions / Skills / Education

Supplies capability/qualification/work-eligibility truth.

Dialogue never grants capability.

## DT-02 — World Persistence

Persists current locality and durable history using the single persistence authority.

DT-08 owns semantic narrative identities, not Save schema.

## DT-10 — Characters / Dialogue / Visual Storytelling

Presents the actual locality-bound cast and consequence.

DT-10 must not present Ana/Radu/other Brăila identities as universal placeholders in non-Brăila localities.

---

# 11. Required Evidence for a Non-Brăila First Hour

A non-Brăila locality is not narrative-first-hour-ready merely because the portable template exists.

At minimum, evidence must show:

1. the actual starting locality is governed and currently playable for the required context;
2. the locality has a legitimate opening work/employment context;
3. required narrative roles resolve to actual locality-specific characters where the beat requires them;
4. first work comes from legitimate local mission/economic authority;
5. destinations are legitimate local endpoints rather than Brăila IDs or renamed placeholders;
6. any settlement is authoritative and replay-safe;
7. consequence presentation reads the actual character/event history;
8. save/reload remains in the correct locality;
9. no Brăila-specific authored ref, actor or location appears as an implicit fallback;
10. settlement-development state is respected rather than forcing urban story content into an undeveloped locality.

This evidence belongs to cross-DT integration and release proof. This document defines the narrative acceptance boundary only.

---

# 12. Canonical Interpretation of Existing First-Hour Documents

After this portability contract:

- `STORY_BIBLE.md` remains the canonical emotional/story authority and Brăila premium authored reference;
- `CAMPAIGN_STRUCTURE.md` remains the campaign pacing authority; its Brăila opening is the premium reference materialization of the portable first-day functions;
- `NARRATIVE_IDS_AND_FIRST_HOUR_CONTRACT.md` remains the canonical Brăila first-hour authored identity/content contract;
- `ACT_II_PORTABLE_RELATIONSHIP_CONSEQUENCE_CONTRACT.md` remains the authority for the existing universal narrative-role vocabulary and locality-specific relationship-binding semantics;
- this document owns the missing **first-hour portability bridge** between those authorities and #634/#643.

No existing Brăila stable ID is deprecated by this slice.

No runtime migration is required by this documentation-only contract.

---

# 13. Acceptance

This contract is satisfied at narrative-design level when all of the following are true:

- [x] global narrative roles are explicitly distinct from named characters;
- [x] Brăila named cast is explicitly a locality-specific premium binding;
- [x] locality-specific binding is explicitly distinct from the universal role;
- [x] portable first-hour event identities exist without replacing Brăila authored refs;
- [x] the eight first-hour narrative functions are location-portable in meaning;
- [x] Ana/Radu/Mirela/Petru are forbidden as automatic non-Brăila fallbacks;
- [x] Brăila-specific copy/locations remain authentic Brăila content rather than generic templates;
- [x] relationship history stays attached to actual characters rather than role slots;
- [x] #651 settlement-development state is respected;
- [x] mission/economy/locality/persistence/UI authorities remain external and are not duplicated.

Runtime/global release acceptance remains blocked until the owning DT lanes demonstrate the same lifecycle in multiple materially different playable localities.
