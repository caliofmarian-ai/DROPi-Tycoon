# Document Information

Document: ACT_I_EARLY_SESSIONS_NARRATIVE_CONTRACT.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical Narrative Content Contract
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-09
Parent Authority: `01_GameDesign/STORY_BIBLE.md`
Campaign Authority: `01_GameDesign/CAMPAIGN_STRUCTURE.md`
First-Hour Identity Authority: `01_GameDesign/NARRATIVE_IDS_AND_FIRST_HOUR_CONTRACT.md`

---

# DROPi Tycoon — Act I Early Sessions Narrative Contract

## Purpose

This document defines the next canonical Brăila narrative slice after the first-hour spine.

It covers roughly the next **five meaningful play sessions** and advances Act I through:

**COMPETENCE -> LOCAL RELATIONSHIPS -> RESPONSIBILITY -> FIRST SPECIALIZATION PRESSURE**

The slice is designed to make the player feel increasingly known and useful without making them powerful too early.

It defines:

- stable Act I early-session IDs;
- stable beat IDs and mission-facing `authoredRef` values;
- continuation rules for first-hour relationship outcomes;
- one meaningful logistics/economic complication driven by authoritative state;
- Brăila narrative anchors;
- bounded competing priorities;
- recovery paths after mistakes;
- first specialization signals;
- persistent semantic narrative facts;
- authored content intent and base lines for recurring characters.

This document does **not** implement:

- mission runtime;
- dialogue UI;
- economy mutation;
- wage amounts;
- qualifications;
- inventory or order authority;
- Save schema;
- map geometry;
- Android presentation.

---

# 1. Slice Identity

Canonical arc ID:

`arc:braila:act1-early`

Display label:

**Act I — Earning Trust: Becoming Known**

Narrative question:

**What happens after one good shift stops being enough?**

The first hour proves that the player can be useful once.

This slice asks whether the player can become useful **consistently**, to different people, under pressure, while beginning to decide what kind of worker they may become.

The slice must not assume that the player:

- owns a company;
- owns a vehicle;
- has chosen a specialization;
- has completed training;
- is financially secure;
- succeeded cleanly in every first-hour beat.

---

# 2. Stable-ID Rules

All rules from `NARRATIVE_IDS_AND_FIRST_HOUR_CONTRACT.md` remain binding.

Narrative IDs are durable semantic references.

Mission runtime may split or combine implementation missions while preserving these authored identities.

## 2.1 Session IDs

- `session:braila:act1:familiar-routes`
- `session:braila:act1:before-the-parcel`
- `session:braila:act1:two-things-at-once`
- `session:braila:act1:what-could-i-learn`
- `session:braila:act1:a-name-people-know`

## 2.2 Session Authored References

- `story:braila:act1:familiar-routes`
- `story:braila:act1:before-the-parcel`
- `story:braila:act1:two-things-at-once`
- `story:braila:act1:what-could-i-learn`
- `story:braila:act1:a-name-people-know`

These `story:*` values are the canonical mission-facing authored identities.

They are not required to equal mission instance IDs.

---

# 3. First-Hour History Intake

This slice consumes first-hour narrative facts without rewriting them.

## 3.1 Required History Awareness

When available, authored variants may read:

- `fact:mirela:first-service:clean`
- `fact:mirela:first-service:recovered`
- `fact:mirela:first-service:failed`
- `fact:braila:first-day:capacity-choice:protect-commitment`
- `fact:braila:first-day:capacity-choice:assist-through-dispatch`
- `fact:braila:first-day:first-wage-observed`
- `fact:braila:first-day:completed`
- `fact:met:ana-stoica`
- `fact:met:radu-marin`
- `fact:met:mirela-stan`
- `fact:met:petru-neagu`

## 3.2 History Must Matter Without Becoming Destiny

A clean first service should create easier trust, not permanent loyalty.

A recovered first service should preserve some caution and some respect.

A failed first service should produce a harder next conversation, not remove Mirela permanently.

Helping Radu should not make him indebted forever.

Protecting an existing commitment should not make Radu resent the player by default.

The player is building history, not choosing permanent morality flags.

---

# 4. Recurring Cast Continuation

## Ana Stoica — `ana-stoica`

Act I early role:

From supervisor giving instructions to supervisor deciding what level of responsibility the player can safely handle.

Ana should increasingly speak less about controls and more about judgment.

She notices:

- reliability;
- honesty after mistakes;
- workload judgment;
- whether the player reports problems instead of hiding them;
- whether the player can serve different customer types consistently.

## Radu Marin — `radu-marin`

Act I early role:

Peer whose own career pressure becomes visible.

Radu should have opportunities, mistakes and ambitions that do not exist only to mirror the player.

He can reveal:

- interest in bicycle work;
- interest in technical/fleet work later;
- concern about cost and qualification requirements;
- pride when he improves;
- frustration when he overcommits.

## Mirela Stan — `mirela-stan`

Act I early role:

First merchant relationship that moves from introduction to repeat-service memory.

Her relationship should reflect actual service history.

She may request or prefer reliable service when authoritative order/customer systems support it, but narrative cannot create a contract merely because she likes the player.

## Petru Neagu — `petru-neagu`

Act I early role:

Neighborhood continuity and proof that repeated routes create familiarity.

Petru should remember conduct, not worship progression.

He may recognize the player, notice changes in the city, or comment on service reliability without becoming an exposition device.

## Daria Iancu — `daria-iancu`

Act I early role:

Substantive introduction to the world before the parcel.

Daria connects production, stock, packaging, storage and logistics into one causal chain.

Her business is not a tutorial factory and is not owned by the player.

## Elena Dobre — `elena-dobre`

Act I early role:

First clear signal that specialization requires real learning and evidence.

Elena does not grant capability through dialogue.

## Victor Lupu — `victor-lupu`

Act I early role:

Brief legitimate competitive presence.

Victor should demonstrate that another professional or carrier can serve customers competently.

He is not a villain and should not sabotage the player in this slice.

---

# 5. Session One — Familiar Routes

Session ID:

`session:braila:act1:familiar-routes`

Authored ref:

`story:braila:act1:familiar-routes`

Primary progression function:

**COMPETENCE -> LOCAL RELATIONSHIPS**

Primary Brăila anchors:

- Station Commons;
- Brăila Commerce;
- Old Town.

## 5.1 Beat Registry

- `beat:braila:act1:familiar-routes:less-supervision`
- `beat:braila:act1:familiar-routes:mirela-remembers`
- `beat:braila:act1:familiar-routes:petru-recognizes`
- `beat:braila:act1:familiar-routes:reliability-pattern`

## 5.2 Less Supervision

Beat ID:

`beat:braila:act1:familiar-routes:less-supervision`

Required authority:

The player has legitimate available work and has completed the first-day story minimum.

Ana line ID:

`line:ana:act1:familiar-routes:less-supervision`

Base copy:

> I’m not going to narrate every turn today. Check the work, check yourself, and tell dispatch early if something stops adding up.

Narrative meaning:

The player is trusted with more judgment, not magically promoted.

Persistent fact after legitimate presentation:

`fact:braila:act1:ana:reduced-supervision`

## 5.3 Mirela Remembers

Beat ID:

`beat:braila:act1:familiar-routes:mirela-remembers`

This beat must select from real first-service history.

### CLEAN variant

Line ID:

`line:mirela:act1:return-after-clean`

Base copy:

> I remember you. Last time I could get back to my own work instead of chasing the delivery. Keep it that way.

### RECOVERED variant

Line ID:

`line:mirela:act1:return-after-recovered`

Base copy:

> You came back and closed the last problem properly. Good. I still notice the clock, though.

### FAILED variant

Line ID:

`line:mirela:act1:return-after-failed`

Base copy:

> We had a bad first run. That does not mean the next one has to be bad. Show me the difference.

Persistent continuation facts:

- `fact:mirela:repeat-contact:after-clean`
- `fact:mirela:repeat-contact:after-recovered`
- `fact:mirela:repeat-contact:after-failed`

Exactly one should be written for the first repeat-contact classification when the relevant history exists.

## 5.4 Petru Recognizes

Beat ID:

`beat:braila:act1:familiar-routes:petru-recognizes`

Line ID:

`line:petru:act1:recognition`

Base copy:

> Back again? Good. A city starts feeling smaller when the same people keep their word.

Persistent fact:

`fact:petru:repeat-contact:first-recognition`

Narrative meaning:

Repeated routes create social geography.

## 5.5 Reliability Pattern

Beat ID:

`beat:braila:act1:familiar-routes:reliability-pattern`

This beat should appear only after multiple authoritative work outcomes exist.

Ana may acknowledge a pattern, not a single success.

Line ID:

`line:ana:act1:reliability-pattern`

Base copy:

> One clean route can be luck. A pattern is what I can schedule around.

Persistent fact:

`fact:braila:act1:reliability-pattern:recognized`

This fact does not grant a role, wage, capability or promotion.

---

# 6. Session Two — Before the Parcel

Session ID:

`session:braila:act1:before-the-parcel`

Authored ref:

`story:braila:act1:before-the-parcel`

Primary progression function:

**LOCAL RELATIONSHIPS -> SYSTEM UNDERSTANDING**

Primary Brăila anchor:

- Foundry Quarter.

Primary new recurring character:

`daria-iancu`

## 6.1 Beat Registry

- `beat:braila:act1:before-the-parcel:foundry-introduction`
- `beat:braila:act1:before-the-parcel:real-input-pressure`
- `beat:braila:act1:before-the-parcel:chain-before-courier`
- `beat:braila:act1:before-the-parcel:recovery-or-escalation`

## 6.2 Foundry Introduction

Beat ID:

`beat:braila:act1:before-the-parcel:foundry-introduction`

Daria line ID:

`line:daria:act1:first-introduction`

Base copy:

> People notice the parcel at the door. I notice everything that had to happen before there was a parcel at all.

Persistent fact:

`fact:met:daria-iancu`

## 6.3 The Meaningful Logistics/Economic Complication

Canonical complication ID:

`complication:braila:act1:foundry-replenishment-pressure`

Beat ID:

`beat:braila:act1:before-the-parcel:real-input-pressure`

This is the required meaningful logistical/economic complication for this narrative slice.

It is **not** a fixed scripted shortage.

It may activate only when authoritative producer/inventory/order state proves a real pressure such as:

- a required input is below operational need;
- an expected inbound order is delayed or failed;
- an output cannot be prepared because a required consumable/input is unavailable;
- storage/capacity limits create a real bottleneck;
- a real downstream customer commitment is at risk because upstream flow is constrained.

Narrative must display the real authoritative item/context when available.

Narrative must not invent a hardcoded missing product.

## 6.4 Daria Pressure Line

Line ID:

`line:daria:act1:foundry-pressure`

Base copy:

> The delivery is the visible part. The problem started earlier. Something this place needs is not where it needs to be, when it needs to be there.

## 6.5 Chain Before Courier

Beat ID:

`beat:braila:act1:before-the-parcel:chain-before-courier`

Narrative meaning:

The player learns that courier work is one role inside a larger stock-flow system.

Ana line ID:

`line:ana:act1:chain-before-courier`

Base copy:

> You cannot deliver what does not exist, and you cannot promise what the system cannot move. Read the cause before you chase the symptom.

Persistent fact after the player legitimately experiences the causal chain:

`fact:braila:act1:supply-chain-causality:first-observed`

## 6.6 Outcome Classes

The complication has semantic outcomes selected from authoritative history.

### STABILIZED

Meaning:

The underlying logistics/producer need is legitimately resolved before the protected downstream commitment fails.

Persistent fact:

`fact:braila:act1:foundry-pressure:stabilized`

### PARTIALLY_RECOVERED

Meaning:

Some need is restored, but cost, delay, lost capacity or an affected commitment remains in authoritative history.

Persistent fact:

`fact:braila:act1:foundry-pressure:partially-recovered`

### UNRESOLVED

Meaning:

The authoritative pressure remains unresolved or causes a real downstream failure.

Persistent fact:

`fact:braila:act1:foundry-pressure:unresolved`

These outcomes are mutually exclusive for the first durable instance of this authored complication.

## 6.7 Recovery Rule

An unresolved outcome must not end Daria’s story.

Later legitimate work may create:

`fact:braila:act1:foundry-pressure:later-recovery`

The original unresolved history remains remembered.

---

# 7. Session Three — Two Things at Once

Session ID:

`session:braila:act1:two-things-at-once`

Authored ref:

`story:braila:act1:two-things-at-once`

Primary progression function:

**SYSTEM UNDERSTANDING -> RESPONSIBILITY**

Primary Brăila anchors:

- Station Commons;
- current valid work route;
- optionally Foundry Quarter or Brăila Commerce when authoritative state supports it.

## 7.1 Beat Registry

- `beat:braila:act1:two-things-at-once:radu-under-pressure`
- `beat:braila:act1:two-things-at-once:competing-priorities`
- `beat:braila:act1:two-things-at-once:report-the-tradeoff`
- `beat:braila:act1:two-things-at-once:responsibility-not-heroics`

## 7.2 Radu Under Pressure

Beat ID:

`beat:braila:act1:two-things-at-once:radu-under-pressure`

Radu line ID:

`line:radu:act1:overcommitment`

Base copy:

> I thought taking more meant moving faster. Turns out sometimes it just means having two promises you cannot both keep.

Narrative meaning:

Radu experiences his own workload problem.

The player is not automatically responsible for fixing it.

## 7.3 Canonical Responsibility Choice

Choice ID:

`choice:braila:act1:competing-priorities`

Canonical option IDs:

- `finish-owned-commitment`
- `request-dispatch-reallocation`
- `accept-authorized-assist`

The runtime may present only options that are actually legitimate.

This is not required to be a three-button choice.

### finish-owned-commitment

Meaning:

The player protects work already accepted and does not overcommit.

Persistent fact:

`fact:braila:act1:priority-choice:finish-owned-commitment`

### request-dispatch-reallocation

Meaning:

The player reports the pressure and asks dispatch to reallocate work through legitimate employer authority.

Persistent fact:

`fact:braila:act1:priority-choice:request-dispatch-reallocation`

### accept-authorized-assist

Meaning:

The player accepts additional work only after real dispatch authorization and only when Work Capacity, time, capability and job eligibility permit it.

Persistent fact:

`fact:braila:act1:priority-choice:accept-authorized-assist`

## 7.4 Choice Guardrail

The story must never present helping Radu as the only compassionate option.

Professional responsibility may mean saying no, escalating early or finishing an existing commitment.

## 7.5 Report the Tradeoff

Beat ID:

`beat:braila:act1:two-things-at-once:report-the-tradeoff`

Ana line ID:

`line:ana:act1:tradeoff-report`

Base copy:

> Responsibility is not carrying everything yourself. It is knowing what you own, what you can still take, and what needs to move to somebody else.

Persistent fact:

`fact:braila:act1:responsibility-principle:first-learned`

## 7.6 Recovery After Overcommitment

If the player legitimately overcommits and causes failure, the recovery path is:

1. preserve the failed authoritative record;
2. report what happened;
3. complete any legitimate recovery work if available;
4. receive a later opportunity at an appropriate responsibility level;
5. do not reset relationships to neutral magically.

Optional recovery fact:

`fact:braila:act1:overcommitment:first-recovered`

---

# 8. Session Four — What Could I Learn?

Session ID:

`session:braila:act1:what-could-i-learn`

Authored ref:

`story:braila:act1:what-could-i-learn`

Primary progression function:

**RESPONSIBILITY -> FIRST SPECIALIZATION PRESSURE**

Primary recurring character:

`elena-dobre`

Supporting recurring characters:

- `ana-stoica`
- `radu-marin`
- optionally `daria-iancu`

## 8.1 Beat Registry

- `beat:braila:act1:what-could-i-learn:training-introduction`
- `beat:braila:act1:what-could-i-learn:capability-not-title`
- `beat:braila:act1:what-could-i-learn:three-directions`
- `beat:braila:act1:what-could-i-learn:cost-of-specializing`

## 8.2 Training Introduction

Beat ID:

`beat:braila:act1:what-could-i-learn:training-introduction`

Required authority:

A legitimate training/profession information opportunity exists or can be presented without implying enrollment.

Elena line ID:

`line:elena:act1:first-introduction`

Base copy:

> A job title tells me what somebody called you. Capability tells me what you can actually do, under what conditions, and with what evidence.

Persistent fact:

`fact:met:elena-dobre`

## 8.3 No Shortcut Rule

Elena must never grant:

- bicycle capability;
- technical qualification;
- warehouse authority;
- dispatch role;
- vehicle access;
- certification;
- employer permission;

through conversation.

Narrative may expose requirements and opportunity only.

## 8.4 Three Early Specialization Directions

The slice should make at least three legitimate directions understandable without forcing a selection.

### Direction A — Field Reliability / Mobility

Narrative identity:

Become a stronger courier/field operator, potentially progressing toward bicycle or later vehicle work when eligibility and equipment exist.

Stable specialization hint ID:

`specialization-hint:field-mobility`

### Direction B — Operations / Dispatch

Narrative identity:

Learn how assignments, capacity and routes fit together; eventually take more operational responsibility when real requirements are met.

Stable specialization hint ID:

`specialization-hint:operations-dispatch`

### Direction C — Production / Technical / Warehouse

Narrative identity:

Move closer to inventory, production, maintenance, handling or warehouse systems through appropriate capability paths.

Stable specialization hint ID:

`specialization-hint:production-technical-warehouse`

The player may see all three without choosing one.

## 8.5 Radu Career Pressure

Radu line ID:

`line:radu:act1:specialization-pressure`

Base copy:

> I keep looking at bicycle work because it opens more routes. But the technical side is what I actually want long term. I cannot pay for every next step at once.

Narrative meaning:

Specialization has opportunity cost.

## 8.6 Ana Career Principle

Ana line ID:

`line:ana:act1:specialization-principle`

Base copy:

> Do not choose a title because it sounds bigger. Choose the kind of responsibility you want to become good enough to carry.

Persistent fact after the player sees the specialization horizon:

`fact:braila:act1:specialization-horizon:opened`

No profession is selected by this fact.

---

# 9. Session Five — A Name People Know

Session ID:

`session:braila:act1:a-name-people-know`

Authored ref:

`story:braila:act1:a-name-people-know`

Primary progression function:

**FIRST SPECIALIZATION PRESSURE -> EARLY ACT I RESPONSIBILITY MILESTONE**

This is not the end of Act I.

It is the end of this early-session slice.

## 9.1 Beat Registry

- `beat:braila:act1:a-name-people-know:cross-district-memory`
- `beat:braila:act1:a-name-people-know:competitor-presence`
- `beat:braila:act1:a-name-people-know:earned-responsibility`
- `beat:braila:act1:a-name-people-know:next-pressure`

## 9.2 Cross-District Memory

Beat ID:

`beat:braila:act1:a-name-people-know:cross-district-memory`

This beat becomes eligible only when the player has legitimate remembered history with more than one recurring person/place.

Narrative target:

The player should feel that Brăila is becoming a network of known people rather than a set of destinations.

Possible remembered anchors:

- Ana at Station Commons;
- Mirela in Brăila Commerce;
- Petru in Old Town;
- Daria in Foundry Quarter.

Persistent fact:

`fact:braila:act1:cross-district-recognition:first-achieved`

This fact does not mean celebrity status.

## 9.3 Competitor Presence

Beat ID:

`beat:braila:act1:a-name-people-know:competitor-presence`

Primary character:

`victor-lupu`

Victor may appear only when an authoritative competing-logistics context can be represented honestly.

Victor line ID:

`line:victor:act1:first-professional-contact`

Base copy:

> I’ve heard your name from a couple of stops. That means you are doing enough work to be noticed. It does not mean those customers belong to you.

Persistent fact:

`fact:met:victor-lupu`

Narrative meaning:

Competition is legitimate and customers have agency.

Victor does not threaten, sabotage or become a villain.

## 9.4 Earned Responsibility

Beat ID:

`beat:braila:act1:a-name-people-know:earned-responsibility`

Ana may recognize that the player can now handle a slightly broader class of judgment or responsibility **only if authoritative work/capability rules allow it**.

Ana line ID:

`line:ana:act1:earned-responsibility`

Base copy:

> You are not new enough for every decision to be somebody else’s problem anymore. That is responsibility, not a promotion speech.

Persistent narrative fact:

`fact:braila:act1:early-responsibility:recognized`

This fact must not directly grant access.

## 9.5 Next Pressure

Beat ID:

`beat:braila:act1:a-name-people-know:next-pressure`

Closing line ID:

`line:act1:early-slice-close`

Base copy:

> More people know what I can do now. The next question is what I want to become responsible for.

Persistent completion fact:

`fact:braila:act1:early-sessions:completed`

This indicates the narrative slice completed legitimately.

It does not mean Act I is complete.

---

# 10. Relationship Continuation Matrix

## Mirela

### If first service was CLEAN

Early posture:

Cautious trust.

Narrative consequence:

Less explanation, higher expectation.

Failure after early trust should matter because reliability had begun to form.

### If first service was RECOVERED

Early posture:

Respect mixed with caution.

Narrative consequence:

Mirela notices whether the player communicates and improves when mechanics support it.

### If first service was FAILED

Early posture:

Professional skepticism.

Narrative consequence:

A legitimate successful repeat service can begin repair.

Repair fact:

`fact:mirela:relationship:first-failure-repaired`

This fact may be written only after later authoritative service justifies it.

## Radu

If the first-hour capacity choice was `assist-through-dispatch`, Radu may acknowledge that help without treating it as permanent debt.

Line ID:

`line:radu:act1:remembered-assist`

Base copy:

> You helped when dispatch could actually move the work. I remember it. I also know you cannot carry my route every time.

If the first-hour choice was `protect-commitment`, Radu should not shame the player.

Line ID:

`line:radu:act1:remembered-boundary`

Base copy:

> You kept the work you already owned. Fair. I needed to learn that asking does not create capacity.

---

# 11. Persistent Narrative Fact Registry — Early Act I

## 11.1 Session progression facts

- `fact:braila:act1:familiar-routes:completed`
- `fact:braila:act1:before-the-parcel:completed`
- `fact:braila:act1:two-things-at-once:completed`
- `fact:braila:act1:what-could-i-learn:completed`
- `fact:braila:act1:a-name-people-know:completed`
- `fact:braila:act1:early-sessions:completed`

## 11.2 Character continuation facts

- `fact:petru:repeat-contact:first-recognition`
- `fact:met:daria-iancu`
- `fact:met:elena-dobre`
- `fact:met:victor-lupu`

## 11.3 Mirela continuation facts

- `fact:mirela:repeat-contact:after-clean`
- `fact:mirela:repeat-contact:after-recovered`
- `fact:mirela:repeat-contact:after-failed`
- `fact:mirela:relationship:first-failure-repaired`

## 11.4 Competence and responsibility facts

- `fact:braila:act1:ana:reduced-supervision`
- `fact:braila:act1:reliability-pattern:recognized`
- `fact:braila:act1:responsibility-principle:first-learned`
- `fact:braila:act1:early-responsibility:recognized`
- `fact:braila:act1:cross-district-recognition:first-achieved`

## 11.5 Supply-chain complication facts

- `fact:braila:act1:supply-chain-causality:first-observed`
- `fact:braila:act1:foundry-pressure:stabilized`
- `fact:braila:act1:foundry-pressure:partially-recovered`
- `fact:braila:act1:foundry-pressure:unresolved`
- `fact:braila:act1:foundry-pressure:later-recovery`

## 11.6 Priority-choice facts

- `fact:braila:act1:priority-choice:finish-owned-commitment`
- `fact:braila:act1:priority-choice:request-dispatch-reallocation`
- `fact:braila:act1:priority-choice:accept-authorized-assist`
- `fact:braila:act1:overcommitment:first-recovered`

## 11.7 Specialization facts

- `fact:braila:act1:specialization-horizon:opened`

The specialization-horizon fact does not imply a selected profession.

---

# 12. Persistent Consequence Rules

## 12.1 World-Local Scope

All facts in this document describe World Instance history.

They must not become universal account-level history across different World Instances.

## 12.2 Immutable Historical Meaning

A later recovery may add a fact.

It must not silently rewrite a durable prior failure into success.

## 12.3 No Authority Creation

Narrative facts may influence authored variants and later story eligibility.

They cannot themselves create:

- Personal Money;
- Company Money;
- wages;
- inventory;
- cargo;
- producer output;
- Work Capacity;
- capability;
- qualification;
- equipment;
- vehicle ownership;
- employment;
- company ownership;
- infrastructure;
- map access;
- contracts.

## 12.4 Relationship Memory Is Concrete

Future scenes should be able to distinguish:

- reliable repeated service;
- recovered failure;
- unresolved failure;
- sensible workload boundaries;
- early escalation through dispatch;
- overcommitment and later recovery;
- whether the player has actually met a recurring character.

Do not collapse all of this into one universal friendship score.

---

# 13. Brăila Story Anchors

## Station Commons

Function in this slice:

Work identity becomes professional judgment.

Key recurring people:

- Ana;
- Radu.

## Brăila Commerce

Function in this slice:

Repeated merchant service becomes remembered reliability.

Key recurring person:

- Mirela.

## Old Town

Function in this slice:

Repeated household service becomes neighborhood familiarity.

Key recurring person:

- Petru.

## Foundry Quarter

Function in this slice:

The player learns that logistics begins before pickup.

Key recurring person:

- Daria.

## Canal & Quays

Function in this slice:

Optional distant horizon only.

It may foreshadow larger transport systems when authoritative world access supports it.

## Geographic Rule

This document creates no street names, addresses or map geometry.

Runtime binds beats to source-backed world locations.

---

# 14. Career Neutrality and Non-CEO Rule

This slice must preserve complete futures for:

- career courier;
- bicycle/vehicle field operator when legitimately qualified/equipped;
- dispatcher/operations worker;
- warehouse/logistics worker;
- technical/maintenance worker;
- production-side worker;
- manager later;
- founder later;
- other legitimate professions supported by the capability system.

No authored line may imply:

- entrepreneurship is the true ending;
- remaining an employee is failure;
- company ownership equals maturity;
- a title is more important than capability;
- the player is destined to found DROPi or another company.

---

# 15. Mission Runtime Handoff Contract

DT-09 may realize this content through one or more authored missions per session.

Mission implementation should preserve these stable authored references:

| Narrative session | Stable authoredRef |
| --- | --- |
| Familiar Routes | `story:braila:act1:familiar-routes` |
| Before the Parcel | `story:braila:act1:before-the-parcel` |
| Two Things at Once | `story:braila:act1:two-things-at-once` |
| What Could I Learn? | `story:braila:act1:what-could-i-learn` |
| A Name People Know | `story:braila:act1:a-name-people-know` |

Mission runtime owns:

- mission IDs;
- stages;
- objectives;
- signal handling;
- retries;
- resume behavior;
- exactly-once mission consequence intent handling.

DT-08 owns only the authored meaning and stable story references.

---

# 16. Production / Economy Handoff Contract

The Foundry complication depends on real causal state.

DT-07 / production authority owns:

- producer need;
- input/output inventory;
- causal supply/demand opportunity;
- warehouse/storage state;
- real producer mission opportunity source.

DT-03 / Player Economy owns:

- Personal Money;
- employer treasury;
- wage settlement;
- Work Capacity accounting.

Narrative may interpret the consequences.

It must not manufacture them.

---

# 17. Professions Handoff Contract

DT-06 owns capability and qualification truth.

Narrative may expose specialization pressure and explain why capability matters.

Narrative must not decide that the player qualifies.

The first specialization horizon should remain useful even when the player chooses to delay training and continue earning through basic work.

---

# 18. Visual Storytelling Handoff Contract

DT-10 may later present these beats visually after its visible PR is reconciled and appropriate mission/system signals exist.

Recommended visible anchors:

- Mirela recognition after real repeat service;
- Daria introduction only when a real producer context exists;
- Radu workload beat only when valid work/capacity context exists;
- Elena introduction only when a legitimate training-information opportunity exists;
- Victor appearance only when competitive context exists.

Dialogue presentation must not fire before the authoritative event it describes.

Visible implementation remains subject to #317 and owner Android acceptance.

---

# 19. Recovery Design Rules

## Mistake Is Not Identity

A failed route, poor judgment or unresolved complication may lower trust or opportunity.

It does not make the player permanently incompetent.

## Recovery Requires Real Work

Recovery should require one or more of:

- reporting the problem;
- completing legitimate recovery work;
- demonstrating reliable later service;
- declining impossible work sooner;
- gaining required capability later;
- rebuilding a customer relationship through actual outcomes.

## Recovery Does Not Erase Cost

If a failure caused a real lost order, delayed production, employer cost or relationship consequence, recovery does not pretend that cost never happened.

---

# 20. Acceptance Contract

This narrative slice is compliant only when later implementation preserves all applicable rules.

## Competence

- repeated work, not one tutorial completion, creates recognition;
- Ana reduces supervision without granting artificial promotion;
- player can make mistakes and recover.

## Relationships

- Mirela remembers clean/recovered/failed first service differently;
- Petru recognition comes from repeat legitimate contact;
- Radu remembers boundaries or legitimate help without permanent debt;
- Daria, Elena and Victor enter for system-supported reasons.

## Responsibility

- competing priorities are real;
- protecting an existing commitment is legitimate;
- dispatch escalation is legitimate;
- authorized assistance consumes real capacity/resources;
- story does not reward overcommitment as heroism.

## Economic/logistics complication

- Foundry pressure derives from authoritative producer/inventory/order state;
- exact missing item or bottleneck is not hardcoded by narrative;
- outcome class reflects real history;
- unresolved failure has a later recovery path.

## Specialization

- at least three legitimate future directions are understandable;
- no training dialogue grants capability;
- no profession is selected merely because the story beat played;
- non-founder paths remain complete.

## Persistence semantics

- stable facts can distinguish meaningful history;
- later recovery adds context rather than silently rewriting history;
- world-local facts remain world-local.

---

# 21. Ownership Boundary

After this document merges:

- **DT-08 Story Director** owns the stable authored meaning, IDs and narrative consequences defined here.
- **DT-09 Missions & Campaign** owns mission/runtime realization and resume semantics.
- **DT-10 Characters & Dialogue** owns visible narrative presentation and Android dialogue UX.
- **DT-02 World Persistence** owns durable Save storage.
- **DT-03 Player Economy** owns money, wages and Work Capacity.
- **DT-06 Professions & Personal Capability** owns work eligibility and qualifications.
- **DT-07 Production & Supply Chain** owns producer/inventory causality.
- **DT-01 / DT-05** retain their world-presentation and living-city ownership boundaries.

No implementation owner should duplicate another domain merely to make this narrative slice easier to trigger.

---

# Final Canonical Principle

The player becomes important in Brăila before becoming powerful.

They become known because work repeats, relationships remember, mistakes have consequences, responsibility requires judgment, and every specialization demands something real from the person choosing it.

**First the city learns your name. Then your choices decide what that name means.**