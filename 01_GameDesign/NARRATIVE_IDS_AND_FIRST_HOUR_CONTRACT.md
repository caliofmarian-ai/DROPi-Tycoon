# Document Information

Document: NARRATIVE_IDS_AND_FIRST_HOUR_CONTRACT.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical Narrative Identity and Authored-Content Contract
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-09
Parent Authority: `01_GameDesign/STORY_BIBLE.md`
Campaign Authority: `01_GameDesign/CAMPAIGN_STRUCTURE.md`

---

# DROPi Tycoon Narrative IDs and First-Hour Authored Contract

## Purpose

This document gives the merged Story Bible a stable identity layer that mission, persistence and visual-storytelling implementations can reference without turning display copy, temporary runtime IDs or implementation placeholders into canon.

It defines:

- stable canonical character IDs;
- stable first-day arc and beat IDs;
- stable mission-facing `authoredRef` values;
- stable dialogue/content line IDs;
- the authored contract for the first hour in Brăila;
- the canonical content contract for **One Small Thing**;
- bounded first-hour branch semantics;
- persistent narrative fact IDs and consequence rules;
- migration guidance for the existing neutral Mission Framework blueprint and the current visual-storytelling branch.

This document does **not** own:

- mission state-machine implementation;
- Save v2 schema or persistence transport;
- economy values or wage settlement;
- capability eligibility;
- order, cargo or inventory authority;
- map geometry or location IDs;
- dialogue UI implementation;
- character art or Android presentation.

Those systems may consume this contract. They must not be duplicated here.

---

# 1. Stable-ID Rules

Narrative IDs are durable references, not player-facing copy.

## 1.1 Format

Canonical narrative IDs use lowercase ASCII kebab-case with colon-separated namespaces.

Examples:

- `ana-stoica`
- `arc:braila:first-day`
- `beat:braila:first-day:one-small-thing`
- `story:braila:first-day:one-small-thing`
- `line:ana:first-standard`
- `fact:mirela:first-service:clean`

## 1.2 Immutability

Once a canonical narrative ID ships in merged canon, its meaning must not silently change.

A display name, translated label, rewritten sentence or implementation refactor does not justify changing the stable ID.

If an entity is intentionally replaced by a genuinely different entity, create a new ID and preserve migration/history explicitly.

## 1.3 IDs Must Not Contain Volatile Metadata

Do not put these into stable narrative IDs:

- issue numbers;
- PR numbers;
- branch names;
- dates;
- temporary implementation labels such as `placeholder`;
- localization text;
- version suffixes such as `v1` when the identity itself is unchanged.

Content revisions belong in content metadata, not identity.

## 1.4 Narrative IDs Are Not World Geometry IDs

Narrative may refer to Station Commons, Brăila Commerce, Old Town and other established places, but it does not mint a second map/location namespace.

Mission/runtime owners bind narrative beats to authoritative world location IDs.

## 1.5 Narrative IDs Are Not Mission Instance IDs

The mission engine owns `missionId`, stage IDs, objective IDs and runtime state.

Story Director canon owns `authoredRef`.

A mission implementation may be replaced, split or recomposed while preserving the same authored story identity.

---

# 2. Canonical Character IDs

These IDs are the stable identity keys for the recurring cast defined by the Story Bible.

| Character ID | Display name | Canonical opening role |
| --- | --- | --- |
| `ana-stoica` | Ana Stoica | First dispatcher / mentor |
| `radu-marin` | Radu Marin | Coworker / friend / friendly competitor |
| `mirela-stan` | Mirela Stan | Merchant / first recurring business customer |
| `petru-neagu` | Petru Neagu | Recurring household customer / city memory |
| `daria-iancu` | Daria Iancu | Local producer / business owner |
| `elena-dobre` | Elena Dobre | Trainer / instructor |
| `victor-lupu` | Victor Lupu | Competitor / rival professional |
| `irina-pavel` | Irina Pavel | Operations planner / future colleague or partner |
| `mihai-enache` | Mihai Enache | Institutional representative |

The first seven IDs deliberately match the current DT-10 visual-storytelling identity keys. DT-10 may consume them directly when reconciling its visible PR.

A character may change employer, title, clothing, relationship to the player or later-world role without changing character ID.

---

# 3. Canonical First-Day Arc

Canonical arc ID:

`arc:braila:first-day`

Display label:

**Prologue — The First Day**

Theme:

**Can anybody rely on me?**

The arc begins with the player as a poor walking employee in Brăila and ends when the player has completed a meaningful first shift mini-arc, met several people who can remember them, seen that paid work has consequences, and understood that tomorrow can contain more than one legitimate direction.

The arc is not completed merely because a tutorial panel was dismissed.

---

# 4. Canonical First-Hour Beat IDs

The first hour uses the eight beats already defined in `CAMPAIGN_STRUCTURE.md`.

| Beat ID | Display label | Primary narrative function |
| --- | --- | --- |
| `beat:braila:first-day:a-place-to-start` | A Place to Start | Establish modest stability, Brăila and immediate need for work |
| `beat:braila:first-day:the-first-standard` | The First Standard | Ana establishes one professional rule that matters now |
| `beat:braila:first-day:one-small-thing` | One Small Thing | First causal delivery to Mirela |
| `beat:braila:first-day:a-person-not-an-address` | A Person, Not an Address | Contrast business delivery with household service through Petru |
| `beat:braila:first-day:capacity-has-a-cost` | Capacity Has a Cost | Show finite human capacity and a legitimate bounded choice |
| `beat:braila:first-day:first-consequence` | First Consequence | Previous work produces remembered follow-up |
| `beat:braila:first-day:first-pay-means-something` | First Pay Means Something | A real wage settlement creates competing life choices |
| `beat:braila:first-day:tomorrow-has-more-than-one-direction` | Tomorrow Has More Than One Direction | Close the hour with earned career possibility |

These IDs remain stable even if pacing changes or one beat is implemented through several mission definitions/presentation sequences.

---

# 5. Mission-Facing Stable Authored References

Mission implementations that represent these beats should use the following stable authored references where `MissionSource.kind === 'Authored'`.

| Story authoredRef | Canonical beat |
| --- | --- |
| `story:braila:first-day:a-place-to-start` | A Place to Start |
| `story:braila:first-day:the-first-standard` | The First Standard |
| `story:braila:first-day:one-small-thing` | One Small Thing |
| `story:braila:first-day:a-person-not-an-address` | A Person, Not an Address |
| `story:braila:first-day:capacity-has-a-cost` | Capacity Has a Cost |
| `story:braila:first-day:first-consequence` | First Consequence |
| `story:braila:first-day:first-pay-means-something` | First Pay Means Something |
| `story:braila:first-day:tomorrow-has-more-than-one-direction` | Tomorrow Has More Than One Direction |

Mission runtime is free to use one mission per beat, multiple missions per beat or event-driven presentation where appropriate.

The authored reference is the semantic bridge back to canon.

---

# 6. First-Hour Cast Contract

The canonical first hour introduces exactly these recurring characters unless authoritative availability prevents a beat from occurring immediately:

1. Ana Stoica — required opening dispatcher contact.
2. Radu Marin — required early coworker/peer contact.
3. Mirela Stan — required first recurring merchant relationship.
4. Petru Neagu — required first recurring household relationship.

Daria Iancu, Elena Dobre and Victor Lupu are horizon characters. They may be mentioned or visually foreshadowed only when this does not imply unavailable gameplay state. Their substantive introduction belongs after the first-hour core unless an authoritative system makes an earlier appearance legitimate.

Irina Pavel and Mihai Enache are not required in the first hour.

---

# 7. First-Hour Authored Content Contract

This section owns narrative meaning and base authored copy. Runtime may localize, line-break or lightly adapt phrasing for UI constraints while preserving meaning and speaker intent.

## 7.1 Beat 1 — A Place to Start

Beat ID:

`beat:braila:first-day:a-place-to-start`

Authored ref:

`story:braila:first-day:a-place-to-start`

Required facts before presentation:

- fresh-world hero exists;
- Brăila is current starting city;
- player is an employee of the opening incumbent logistics employer;
- player does not own a company or private HQ;
- walking/light work is the available opening work mode.

Canonical presentation intent:

The player should feel economically small, not narratively insignificant.

Base chapter line ID:

`line:prologue:first-shift-card`

Base copy:

> Brăila. First shift. One phone, one backpack, and a day that has to add up.

Ana phone line ID:

`line:ana:first-phone-report`

Base copy:

> Station Commons. Report to dispatch on time. Walking and light work only today. Bring the phone.

Forbidden implications:

- the player owns Northstar;
- the player owns a fleet;
- the player has already founded DROPi or another company;
- the phone is an omnipotent admin console.

## 7.2 Beat 2 — The First Standard

Beat ID:

`beat:braila:first-day:the-first-standard`

Authored ref:

`story:braila:first-day:the-first-standard`

Primary character:

`ana-stoica`

Ana line ID:

`line:ana:first-standard`

Base copy:

> Check the address. Keep custody clean. Do not promise what you cannot deliver. Reliable beats impressive.

Radu meeting line ID:

`line:radu:first-meeting`

Base copy:

> First day? Good. Then neither of us has to pretend this route is easy. I’m Radu.

Narrative intent:

Ana treats the player as inexperienced, not incompetent. Radu establishes that coworkers have their own lives and ambitions.

No capability, vehicle or promotion is granted by this conversation.

## 7.3 Beat 3 — One Small Thing

Beat ID:

`beat:braila:first-day:one-small-thing`

Authored ref:

`story:braila:first-day:one-small-thing`

Primary recurring customer:

`mirela-stan`

Detailed contract is in Section 8.

## 7.4 Beat 4 — A Person, Not an Address

Beat ID:

`beat:braila:first-day:a-person-not-an-address`

Authored ref:

`story:braila:first-day:a-person-not-an-address`

Primary recurring customer:

`petru-neagu`

Required authority:

A real household delivery/handoff or another authoritative household-service event must exist. Narrative must not spawn a fake parcel merely to introduce Petru.

Petru first line ID:

`line:petru:first-handoff`

Base copy:

> The address was the easy part. Getting the right thing to the right person is the part I remember.

Narrative intent:

Petru is independent and observant. He is not written as helpless, sentimental tutorial decoration or a lore oracle.

Persistent introduction fact:

`fact:met:petru-neagu`

## 7.5 Beat 5 — Capacity Has a Cost

Beat ID:

`beat:braila:first-day:capacity-has-a-cost`

Authored ref:

`story:braila:first-day:capacity-has-a-cost`

Primary peer:

`radu-marin`

This beat may expose a choice only when the mission/economy/capability authorities prove both options are legitimate.

Canonical choice ID:

`choice:braila:first-day:capacity-priority`

Canonical option IDs:

- `protect-commitment`
- `assist-through-dispatch`

### Option — protect-commitment

Meaning:

The player keeps the work already accepted and preserves enough Work Capacity/time to complete it reliably.

This is not a selfish or cowardly option.

Persistent fact:

`fact:braila:first-day:capacity-choice:protect-commitment`

### Option — assist-through-dispatch

Meaning:

The player accepts additional legitimate help/work for Radu only through the actual employer/dispatch process and only if eligibility, time and Work Capacity allow it.

This option must consume the real resources/capacity associated with the work. It cannot create an invisible free favor mission.

Persistent fact:

`fact:braila:first-day:capacity-choice:assist-through-dispatch`

### Choice omission rule

If the runtime cannot truthfully offer both options, do not present a fake binary choice. The beat may instead communicate finite capacity through observation and continue without writing either choice fact.

## 7.6 Beat 6 — First Consequence

Beat ID:

`beat:braila:first-day:first-consequence`

Authored ref:

`story:braila:first-day:first-consequence`

The consequence must read real history from One Small Thing, the household service beat and/or the capacity choice.

Ana clean-work line ID:

`line:ana:first-consequence-clean`

Base copy:

> Good. Not dramatic. Just clean work somebody can rely on. That is how the next responsibility starts.

Ana recovery line ID:

`line:ana:first-consequence-recovered`

Base copy:

> A problem is not the same as a cover-up. You recovered it and reported what happened. Learn from that.

Ana failed-work line ID:

`line:ana:first-consequence-failed`

Base copy:

> We do not erase a bad route. We close the record, fix what can be fixed, and decide what you are ready for next.

The player must never receive heroic praise for routine work.

## 7.7 Beat 7 — First Pay Means Something

Beat ID:

`beat:braila:first-day:first-pay-means-something`

Authored ref:

`story:braila:first-day:first-pay-means-something`

Required authority:

A real exactly-once wage/shift settlement has occurred through Player Economy.

Narrative must read the settled fact. It must never choose the wage amount.

Persistent fact after the player has observed/acknowledged the real settlement:

`fact:braila:first-day:first-wage-observed`

Base reflection line ID:

`line:prologue:first-pay-reflection`

Base copy:

> Paid work buys breathing room. What comes next still has a cost: living, saving, equipment, training, time.

If no authoritative wage settlement has occurred yet, this beat waits. It is not simulated with fake money.

## 7.8 Beat 8 — Tomorrow Has More Than One Direction

Beat ID:

`beat:braila:first-day:tomorrow-has-more-than-one-direction`

Authored ref:

`story:braila:first-day:tomorrow-has-more-than-one-direction`

Radu horizon line ID:

`line:radu:first-career-horizon`

Base copy:

> Walking is where I started, not where I plan to stop. I’m looking at bicycle work first, then something technical if I can qualify.

Ana horizon line ID:

`line:ana:first-career-horizon`

Base copy:

> Reliability opens conversations. Capability decides which ones you are actually ready for.

Closing line ID:

`line:prologue:first-hour-close`

Base copy:

> I have a job today. Tomorrow can become something else.

This beat may expose training/work information only when the underlying capability/opportunity surfaces actually exist.

---

# 8. One Small Thing — Canonical Authored Contract

## 8.1 Identity

Beat ID:

`beat:braila:first-day:one-small-thing`

Authored ref:

`story:braila:first-day:one-small-thing`

Display title:

**One Small Thing**

Narrative purpose:

The first delivery matters because a real small business is waiting for something it needs, not because the tutorial needs a waypoint.

## 8.2 Required System Facts

The authored beat may become active only when runtime can bind:

- the real opening employer identity;
- an authoritative active shift/job context;
- a real order/delivery reference;
- authoritative parcel/cargo identity;
- authoritative pickup/custody state;
- Mirela’s actor identity and legitimate recipient/business context;
- an authoritative Brăila Commerce destination;
- real completion/failure events;
- economic settlement reference owned outside narrative.

## 8.3 Product Rule

The exact goods are not narrative canon.

The authoritative inventory/order system chooses the actual item.

Suitable story-compatible categories include ordinary receipt, label, packaging or other light business consumables, but narrative must display the actual authoritative item when one exists.

Do not hardcode a fictional item that conflicts with inventory state.

## 8.4 Mirela Pre-Handoff Line

Line ID:

`line:mirela:one-small-thing-arrival`

Base copy:

> You’re from Northstar? Good. I’m waiting on this for today’s orders, not for decoration.

The current employer display name may be adapted if the opening-employer brand is ever canonically migrated while the same underlying entity/history remains.

## 8.5 Outcome Classification

One Small Thing has three narrative outcome classes.

They are classifications of authoritative mission/logistics history, not separate fake quest outcomes.

### CLEAN

Meaning:

The authoritative delivery completes without a recorded failure/retry complication that requires recovery narration, with cargo/custody accepted as valid by the logistics authority.

Persistent fact:

`fact:mirela:first-service:clean`

Mirela line ID:

`line:mirela:one-small-thing-clean`

Base copy:

> That was simple. Simple is good when people are waiting on you. I’ll remember that.

### RECOVERED

Meaning:

A real recoverable complication, retry or delay occurred, but the delivery was legitimately completed and the record remains honest.

Persistent fact:

`fact:mirela:first-service:recovered`

Mirela line ID:

`line:mirela:one-small-thing-recovered`

Base copy:

> I needed it earlier. But you came back and finished what you could finish. Next time, tell me sooner if the system lets you.

The final sentence is presented only when a real communication mechanic exists. Otherwise omit it rather than pretending the player had a communication option.

### FAILED

Meaning:

The authoritative delivery reaches a real failed terminal outcome or the recovery window ends without legitimate completion.

Persistent fact:

`fact:mirela:first-service:failed`

Mirela line ID:

`line:mirela:one-small-thing-failed`

Base copy:

> I still have orders waiting. Fix the record with dispatch first. Then we can talk about the next one.

Failure does not remove Mirela from the story forever.

## 8.6 Mutual Exclusivity

For one first-service history, exactly one of these outcome facts may be canonical at a time:

- `fact:mirela:first-service:clean`
- `fact:mirela:first-service:recovered`
- `fact:mirela:first-service:failed`

If a runtime correction changes the authoritative final state before durable settlement, persistence must retain the final legitimate classification only.

After durable settlement, later recovery should create a new recovery/history fact rather than rewriting old history silently.

## 8.7 Economic Rule

One Small Thing creates no quest-money reward.

Mission may reference the real delivery/shift settlement through `EconomicSettlementReference`, but Personal Economy remains sole owner of amounts, debits, credits and exactly-once settlement.

## 8.8 Relationship Rule

The three Mirela facts are concrete remembered history.

A relationship system may derive trust/reputation deltas from them, but the Story Bible does not canonize a universal numeric friendship score.

## 8.9 Completion Rule

Narrative completion requires the authoritative delivery outcome to exist.

Closing a dialogue card is never sufficient to mark One Small Thing completed.

---

# 9. Persistent Narrative Fact Registry — First Hour

These are stable semantic fact IDs that persistence/mission systems may store or expose when their schema supports them.

They are not an instruction for DT-08 to modify Save v2.

## 9.1 Character introduction facts

- `fact:met:ana-stoica`
- `fact:met:radu-marin`
- `fact:met:mirela-stan`
- `fact:met:petru-neagu`

## 9.2 One Small Thing outcome facts

- `fact:mirela:first-service:clean`
- `fact:mirela:first-service:recovered`
- `fact:mirela:first-service:failed`

## 9.3 Capacity-choice facts

- `fact:braila:first-day:capacity-choice:protect-commitment`
- `fact:braila:first-day:capacity-choice:assist-through-dispatch`

These are mutually exclusive only when the choice was actually presented and completed.

## 9.4 Economy-observation fact

- `fact:braila:first-day:first-wage-observed`

This fact may exist only after real Player Economy settlement evidence exists.

## 9.5 First-day completion fact

- `fact:braila:first-day:completed`

This fact means the narrative first-day mini-arc reached its legitimate completion contract. It must not be set merely by time elapsed.

Minimum semantic evidence:

- Ana met;
- Radu met;
- One Small Thing reached a durable authoritative outcome;
- Mirela met;
- Petru household relationship beat completed when an authoritative household-service event exists;
- first consequence presented from real history;
- the career-horizon closing beat presented;
- first-pay beat completed if a wage settlement was available within the first-hour arc, otherwise that beat remains event-driven and may resolve shortly afterward without blocking the entire campaign indefinitely.

---

# 10. Persistent-Consequence Rules

## 10.1 Remember Facts, Not Only Scores

Future dialogue should be able to distinguish:

- a clean first service;
- a recovered first service;
- a failed first service;
- a player who protected an existing commitment;
- a player who legitimately helped through dispatch;
- whether a character has actually met the player.

A single relationship number cannot substitute for these facts.

## 10.2 Consequences Cannot Invent Authority

Narrative facts may influence later authored eligibility, dialogue variants or relationship interpretation.

They cannot by themselves create:

- money;
- inventory;
- cargo;
- qualifications;
- vehicle ownership;
- employment;
- company ownership;
- infrastructure;
- contracts that authoritative systems have not made available.

## 10.3 World-Local History

These facts are World Instance history.

Different World Instances may share the canonical opening structure and later diverge.

Do not make a relationship outcome global to every World Instance on the account.

## 10.4 Recovery Preserves History

A failure may be followed by later recovery.

Later recovery should add remembered context rather than deleting the fact that the original failure occurred, unless the original record was genuinely corrected before durable settlement.

---

# 11. Mission Framework Reconciliation Contract

The merged neutral first-hour blueprint in `game-web/src/missions/brailaFirstHourBlueprint.ts` intentionally uses placeholders pending Agent 8 canon.

DT-09 may reconcile it later without changing mission-engine architecture.

Recommended semantic mapping:

| Current neutral mission role | Canonical story binding |
| --- | --- |
| `first-hour:meet-dispatcher` | `story:braila:first-day:a-place-to-start` + `story:braila:first-day:the-first-standard` |
| `first-hour:light-job` | `story:braila:first-day:one-small-thing` |
| `first-hour:meet-local-contact` | `story:braila:first-day:a-person-not-an-address` with Petru when a real household event exists |
| `first-hour:complication-choice` | `story:braila:first-day:capacity-has-a-cost` |
| neutral choice outcomes | `story:braila:first-day:first-consequence` |
| `first-hour:return-report` | first-consequence reporting/closure with Ana |
| `first-hour:next-opportunity` | `story:braila:first-day:tomorrow-has-more-than-one-direction` |

`first-pay-means-something` is primarily event-driven from a real Player Economy wage settlement and does not require a fake delivery mission solely to make the beat happen.

The neutral placeholder `agent8-canon-pending` should eventually be replaced by the stable `story:*` authored references above in DT-09-owned mission code.

DT-08 does not perform that runtime edit in this PR.

---

# 12. Visual Storytelling Reconciliation Contract

DT-10 currently uses the same first seven character slugs, which are now canonical.

Existing provisional visual sequence/beat IDs may remain implementation-local, but each visible presentation beat should bind to one canonical story beat or line ID.

Recommended mapping:

| Current visual concept | Canonical narrative binding |
| --- | --- |
| First Shift chapter card | `line:prologue:first-shift-card` / `beat:braila:first-day:a-place-to-start` |
| Ana first brief | `line:ana:first-standard` / `beat:braila:first-day:the-first-standard` |
| Radu first meeting | `line:radu:first-meeting` / `beat:braila:first-day:the-first-standard` |
| First merchant relationship | `beat:braila:first-day:one-small-thing` / `mirela-stan` |
| First household relationship | `beat:braila:first-day:a-person-not-an-address` / `petru-neagu` |
| First complication | `beat:braila:first-day:capacity-has-a-cost` when authoritative mission state exists |
| First mission consequence | `beat:braila:first-day:first-consequence` |
| Next opportunity card | `beat:braila:first-day:tomorrow-has-more-than-one-direction` |

Visible implementation remains DT-10-owned and remains subject to #317 Android owner acceptance.

DT-08 does not modify DT-10 files in this PR.

---

# 13. Authoring Guardrails

First-hour narrative must not:

- call routine delivery work heroic;
- make Ana a quest dispenser detached from employer operations;
- make Radu exist only to praise the player;
- make Mirela a tutorial prop whose business need disappears after one click;
- make Petru helpless or sentimental shorthand;
- use Victor as a cartoon villain;
- grant bicycle capability through dialogue;
- grant wages through dialogue;
- create fixed quest cash;
- create fake inventory;
- invent a player-owned HQ/company;
- force entrepreneurship as the only successful path;
- punish the player morally for protecting finite Work Capacity;
- present a choice whose alternatives are not both actually available;
- rewrite failed history merely to preserve a success-only campaign.

---

# 14. Acceptance Contract

A first-hour implementation is narratively compliant only when all applicable checks pass.

## Identity

- recurring cast uses the stable character IDs in this document;
- authored mission content uses stable `story:*` references rather than `agent8-canon-pending`;
- display-copy edits do not create new entity IDs.

## One Small Thing

- uses a real order/cargo reference;
- uses real pickup/custody/delivery authority;
- binds Mirela as a remembered person/business;
- does not create quest money;
- persists a truthful clean/recovered/failed first-service history when persistence support exists.

## Branching

- capacity choice is offered only when both options are legitimate;
- no branch fabricates work, capacity, money or relationship authority;
- protecting a commitment is not written as moral failure;
- helping Radu must go through valid dispatch/employer process.

## Consequence

- first consequence is selected from real prior history;
- failure has a recovery path;
- dialogue cannot erase a durable failed outcome;
- future scenes can distinguish meaningful first-hour facts rather than relying only on a single score.

## Career horizon

- first hour ends with more than one legitimate future direction;
- employee/specialist paths remain complete futures;
- bicycle, technical, training and founder paths remain gated by their real systems.

---

# 15. Ownership Boundary

After this document merges:

- **DT-08 Story Director** owns future changes to stable narrative identity, character meaning, authored beat meaning and canonical dialogue/content intent.
- **DT-09 Missions & Campaign** owns mission/runtime realization, IDs inside its runtime domain, event handling and mission-side resume behavior.
- **DT-10 Characters & Dialogue / Visual Storytelling** owns player-visible dialogue presentation, character visual identity implementation and Android-visible narrative UX.
- **DT-02 World Persistence** owns Save v2-compatible durable storage and restoration authority.
- **DT-03 Player Economy** owns wages, Personal Money, employer treasury and Work Capacity settlement.
- **DT-06 Professions & Personal Capability** owns work eligibility and qualifications.
- **DT-07 Production & Supply Chain** owns causal inventory/producer opportunities.

No specialist should copy another specialist’s authority into a parallel system merely to make the first hour easier to script.

---

# Final Canonical Principle

The first hour is not a tutorial story pasted on top of the simulation.

It is the first remembered history produced by the simulation and interpreted through recurring people.

**A real need creates real work. Real work creates a real consequence. A person remembers it. That memory becomes the beginning of the player’s story.**
