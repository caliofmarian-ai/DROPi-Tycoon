# Document Information

Document: ACT_II_OPENING_NARRATIVE_CONTRACT.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical Narrative Content Contract
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-09
Parent Authority: `01_GameDesign/STORY_BIBLE.md`
Campaign Authority: `01_GameDesign/CAMPAIGN_STRUCTURE.md`
First-Hour Identity Authority: `01_GameDesign/NARRATIVE_IDS_AND_FIRST_HOUR_CONTRACT.md`
Early Act I Authority: `01_GameDesign/ACT_I_EARLY_SESSIONS_NARRATIVE_CONTRACT.md`
Act I Capstone Authority: `01_GameDesign/ACT_I_CAPSTONE_A_CHAIN_OF_SMALL_THINGS.md`

---

# DROPi Tycoon — Act II Opening Narrative Contract

## Purpose

This document defines the canonical opening of **Act II — Choices** in Brăila.

Act I asked whether people could rely on the player when work became connected and consequential.

Act II begins after that question has been answered well enough to move forward, including when the answer contains failure, partial recovery, unresolved cost, or unfinished relationships.

The opening progression is:

**STABILITY / INDEPENDENCE -> RESPONSIBILITY -> SPECIALIZATION**

The central Act II question remains:

**What kind of responsibility do I want, and what am I willing to give up to become capable of carrying it?**

This opening makes one distinction canonical:

> **Independence is not synonymous with entrepreneurship.**

A player may become more independent by building financial breathing room, protecting their own time, choosing work deliberately, gaining capability, becoming a trusted specialist, or accepting larger responsibility inside employment.

Founding a company may become one valid future later. It is not the implied correct route, the Act II reward, or the proof that the player has matured.

This document defines:

- stable Act II opening IDs;
- stable session, beat, choice and mission-facing `authoredRef` values;
- exact intake semantics for all four Act I capstone outcomes;
- recurring-character continuity;
- a stability/independence narrative layer that reads real economy state without creating money;
- legitimate competing priorities around time, Work Capacity, paid work and capability development;
- responsibility without ownership or fake promotion;
- early specialization pressure across several complete career futures;
- recoverable mistake semantics;
- visible-consequence rules tied only to authoritative state;
- persistent semantic fact IDs;
- explicit DT-09 materialization hooks.

This document does **not** implement:

- mission runtime;
- mission state or Save serialization;
- dialogue UI;
- Personal Money or Company Money mutation;
- wages or living-cost values;
- Work Capacity accounting;
- inventory, cargo, orders or producer authority;
- qualifications or capability grants;
- vehicle ownership;
- employment or promotion state;
- company formation;
- map geometry;
- Android presentation.

---

# 1. Canonical Act II Identity

The Act I capstone already established the canonical Act II arc ID:

`arc:braila:act2:choices`

Display label:

**Act II — Choices**

This document does not replace that ID.

## 1.1 Opening Sequence ID

Canonical opening-sequence ID:

`sequence:braila:act2:opening`

Display label:

**Act II Opening — Room to Choose**

Narrative progression:

**STABILITY / INDEPENDENCE -> RESPONSIBILITY -> SPECIALIZATION**

## 1.2 Opening Completion Fact

`fact:braila:act2:opening:completed`

This fact means the Act II opening sequence has been narratively processed.

It does not mean:

- the player selected a permanent profession;
- the player owns a company;
- the player is financially secure forever;
- unresolved Act I consequences disappeared;
- the player qualifies for every path they explored.

---

# 2. Entry Contract

Act II opening should become narratively eligible only after Act I has legitimately completed.

Preferred entry evidence:

- `fact:braila:act1:completed`
- `fact:braila:act2:transition:available`

At least one primary Act I capstone outcome must also be available when persistence supports those facts:

- `fact:braila:act1:capstone:outcome:stabilized`
- `fact:braila:act1:capstone:outcome:contained`
- `fact:braila:act1:capstone:outcome:recovered-after-failure`
- `fact:braila:act1:capstone:outcome:unresolved`

Exactly one of those four facts describes the first durable Act I capstone resolution.

The Act II opening consumes that history.

It never rewrites it.

---

# 3. Stable Session Registry

The opening sequence uses five canonical narrative sessions.

| Session ID | Display title | Progression function |
| --- | --- | --- |
| `session:braila:act2:opening:what-remains` | What Remains | Process Act I consequence honestly |
| `session:braila:act2:opening:breathing-room` | Breathing Room | Make stability, time and capacity legible |
| `session:braila:act2:opening:responsibility-without-ownership` | Responsibility Without Ownership | Accept, redirect or decline legitimate responsibility |
| `session:braila:act2:opening:the-cost-of-a-door` | The Cost of a Door | Expose real specialization requirements and opportunity cost |
| `session:braila:act2:opening:first-direction` | First Direction | Record a current priority without locking the career |

These sessions may be paced across more than five play sessions if authoritative world/economy/capability state requires waiting.

Narrative pacing must not manufacture authority merely to preserve a fixed schedule.

---

# 4. Stable Mission-Facing Authored References

DT-09 may materialize each session through one or more missions while preserving these authored identities:

- `story:braila:act2:opening:what-remains`
- `story:braila:act2:opening:breathing-room`
- `story:braila:act2:opening:responsibility-without-ownership`
- `story:braila:act2:opening:the-cost-of-a-door`
- `story:braila:act2:opening:first-direction`

These are stable narrative references.

They are not mission IDs.

---

# 5. Stable Beat Registry

## 5.1 Session One — What Remains

- `beat:braila:act2:opening:what-remains:the-result-is-history`
- `beat:braila:act2:opening:what-remains:people-remember`
- `beat:braila:act2:opening:what-remains:open-loops-remain-open`
- `beat:braila:act2:opening:what-remains:room-after-pressure`

## 5.2 Session Two — Breathing Room

- `beat:braila:act2:opening:breathing-room:stability-is-state`
- `beat:braila:act2:opening:breathing-room:time-has-a-cost`
- `beat:braila:act2:opening:breathing-room:choose-what-to-protect`
- `beat:braila:act2:opening:breathing-room:independence-without-ownership`

## 5.3 Session Three — Responsibility Without Ownership

- `beat:braila:act2:opening:responsibility-without-ownership:trusted-with-context`
- `beat:braila:act2:opening:responsibility-without-ownership:legitimate-boundaries`
- `beat:braila:act2:opening:responsibility-without-ownership:mistake-and-recovery`
- `beat:braila:act2:opening:responsibility-without-ownership:responsibility-is-not-title`

## 5.4 Session Four — The Cost of a Door

- `beat:braila:act2:opening:the-cost-of-a-door:requirements-not-promises`
- `beat:braila:act2:opening:the-cost-of-a-door:four-complete-futures`
- `beat:braila:act2:opening:the-cost-of-a-door:opportunity-cost`
- `beat:braila:act2:opening:the-cost-of-a-door:not-yet-is-valid`

## 5.5 Session Five — First Direction

- `beat:braila:act2:opening:first-direction:name-the-priority`
- `beat:braila:act2:opening:first-direction:keep-the-door-open`
- `beat:braila:act2:opening:first-direction:next-responsibility`
- `beat:braila:act2:opening:first-direction:act2-core-horizon`

---

# 6. Act I Outcome Intake

The Act II opening must feel different depending on what actually happened in **A Chain of Small Things**.

The outcome changes context, pressure and relationships.

It does not change the fundamental right to continue playing.

## 6.1 STABILIZED Intake

Source fact:

`fact:braila:act1:capstone:outcome:stabilized`

Narrative meaning:

The chain-critical need was protected well enough that the targeted downstream commitment remained viable.

Act II consequence:

The player enters with stronger local confidence and higher expectations.

The story must not treat one stabilized situation as permanent security.

Ana line ID:

`line:ana:act2-opening:outcome-stabilized`

Base copy:

> You held that chain together. Good. Do not confuse one good pressure day with a life that cannot still come apart. Decide what you want to make more reliable next.

Persistent processing fact:

`fact:braila:act2:opening:history:stabilized-processed`

## 6.2 CONTAINED Intake

Source fact:

`fact:braila:act1:capstone:outcome:contained`

Narrative meaning:

The pressure was prevented from spreading completely, but a real delay, cost, missed opportunity or degraded outcome remains.

Act II consequence:

The player learns that competent work often means limiting damage, not producing perfect endings.

Ana line ID:

`line:ana:act2-opening:outcome-contained`

Base copy:

> You stopped one problem from becoming three. Something still cost somebody. Both facts are true. That is the level of judgment Act II starts with.

Persistent processing fact:

`fact:braila:act2:opening:history:contained-processed`

## 6.3 RECOVERED_AFTER_FAILURE Intake

Source fact:

`fact:braila:act1:capstone:outcome:recovered-after-failure`

Narrative meaning:

A real failure occurred and later work legitimately restored some or all of the chain.

Act II consequence:

Recovery becomes part of the player’s professional identity without rewriting the failed event into clean success.

Ana line ID:

`line:ana:act2-opening:outcome-recovered-after-failure`

Base copy:

> Recovery is a skill. It is not a time machine. Remember both the failure and what you did after it.

Persistent processing fact:

`fact:braila:act2:opening:history:recovered-after-failure-processed`

## 6.4 UNRESOLVED Intake

Source fact:

`fact:braila:act1:capstone:outcome:unresolved`

Narrative meaning:

The connected situation remained unresolved or a protected commitment failed without capstone-window recovery.

Act II consequence:

The player enters Act II with an open loop.

This is not a campaign failure state.

The unresolved history may continue to affect Mirela, Daria, employer trust, workload or later recovery only when authoritative systems still expose a real consequence.

Ana line ID:

`line:ana:act2-opening:outcome-unresolved`

Base copy:

> We are not calling it fixed because the chapter changed. The record stays open where the world says it is open. You still have to decide what you become next.

Persistent processing fact:

`fact:braila:act2:opening:history:unresolved-processed`

## 6.5 Outcome Processing Rule

Exactly one outcome-processing fact should represent the first Act II intake of the durable Act I capstone resolution.

Later recovery may add new context.

It must not delete the original Act I outcome fact.

---

# 7. Session One — What Remains

Session ID:

`session:braila:act2:opening:what-remains`

Authored ref:

`story:braila:act2:opening:what-remains`

Primary function:

**CONSEQUENCE -> STABILITY AWARENESS**

Primary recurring cast:

- `ana-stoica`
- `radu-marin`
- `mirela-stan` when affected history exists
- `daria-iancu` when producer-linked history exists
- `petru-neagu` when a linked household/service history exists

## 7.1 The Result Is History

Beat ID:

`beat:braila:act2:opening:what-remains:the-result-is-history`

The game should acknowledge the real Act I outcome without replaying the capstone as a summary cutscene detached from world state.

Required semantic evidence:

- Act I completion;
- one durable primary capstone outcome;
- any relationship consequences already persisted.

Persistent fact:

`fact:braila:act2:opening:capstone-history:first-acknowledged`

## 7.2 People Remember

Beat ID:

`beat:braila:act2:opening:what-remains:people-remember`

Characters should reflect only facts they could legitimately know through the narrative/world relationship.

### Mirela

If `fact:mirela:act1-capstone:pressure-handled` exists:

Line ID:

`line:mirela:act2-opening:pressure-handled`

Base copy:

> What mattered to me was that the chain became usable again. I remember who helped make that true.

If `fact:mirela:act1-capstone:pressure-unresolved` exists:

Line ID:

`line:mirela:act2-opening:pressure-unresolved`

Base copy:

> I am still working around what did not get fixed. That does not erase everything you did before. It does change what I can rely on today.

### Daria

If `fact:daria:act1-capstone:operational-trust-earned` exists:

Line ID:

`line:daria:act2-opening:operational-trust`

Base copy:

> You understand now that the parcel is usually the end of somebody else’s process. Keep that perspective and you can become useful in more than one role.

### Radu

If `fact:radu:act1-capstone:coordination-earned` exists:

Line ID:

`line:radu:act2-opening:coordination-memory`

Base copy:

> I used to think progress meant carrying more. Now I think it might mean knowing what should be carried by whom.

## 7.3 Open Loops Remain Open

Beat ID:

`beat:braila:act2:opening:what-remains:open-loops-remain-open`

An unresolved customer, producer, workload or recovery state may remain available when the authoritative system says it remains real.

The opening must not block every Act II path until every historical problem is perfectly repaired.

A player can build new capability while an old relationship remains damaged.

A player can continue working while a producer issue has not fully recovered.

A player can repair later.

Optional later-recovery acknowledgement fact:

`fact:braila:act2:opening:act1-open-loop:later-progress-acknowledged`

This fact does not replace:

`fact:braila:act1:capstone:outcome:unresolved`

## 7.4 Room After Pressure

Beat ID:

`beat:braila:act2:opening:what-remains:room-after-pressure`

Ana line ID:

`line:ana:act2-opening:room-after-pressure`

Base copy:

> The emergency part is over, or at least named. Now comes the harder question: what do you do when nobody is forcing the next choice on you?

Persistent fact:

`fact:braila:act2:opening:choice-space:first-opened`

---

# 8. Stability and Independence Philosophy

## 8.1 Stability Is Not Wealth

Stability means the player has enough reliable state to make at least some deliberate choices instead of reacting to every immediate pressure.

It may involve:

- regular paid work;
- manageable living-cost pressure;
- sufficient Work Capacity to choose between valid opportunities;
- time available for training or recovery;
- a predictable employment relationship;
- trusted recurring customers or coworkers;
- access to more than one legitimate opportunity.

Narrative does not define numeric thresholds.

Player Economy and other authorities own those values.

## 8.2 Independence Is Not Company Ownership

Canonical definition for this stage:

**Independence is the growing ability to choose which responsibility to accept, protect, postpone or prepare for without pretending every opportunity must be taken.**

This can occur while the player remains:

- an employee;
- a walking courier;
- a trainee;
- a specialist;
- a dispatcher;
- a warehouse worker;
- a technical worker;
- a professional team lead later.

Company formation remains a later optional system.

## 8.3 Stability-First Is a Valid Direction

A player may deliberately choose to keep earning, rest, repair arrears, rebuild Work Capacity or postpone specialization.

Narrative must not frame this as cowardice, stagnation or failure.

The game’s long-term progression remains available later when authoritative requirements are met.

---

# 9. Session Two — Breathing Room

Session ID:

`session:braila:act2:opening:breathing-room`

Authored ref:

`story:braila:act2:opening:breathing-room`

Primary function:

**STABILITY AWARENESS -> INDEPENDENT PRIORITIZATION**

## 9.1 Stability Is State

Beat ID:

`beat:braila:act2:opening:breathing-room:stability-is-state`

Required authority:

Narrative may read only high-level, read-only Player Economy and Work Capacity evidence exposed by the correct domain adapters.

Examples of legitimate narrative categories include:

- stability improving;
- immediate living pressure present;
- arrears/recovery pressure present;
- Work Capacity sufficient for current work;
- Work Capacity constrained;
- a real wage settlement exists;
- no settled wage yet.

Narrative must not invent balances or choose monetary values.

Base reflection line ID:

`line:act2-opening:stability-is-state`

Base copy:

> Stability is not a badge. It is what remains after work, living costs, rest and tomorrow’s obligations all meet the same reality.

Persistent fact:

`fact:braila:act2:opening:stability-state:first-read`

## 9.2 Time Has a Cost

Beat ID:

`beat:braila:act2:opening:breathing-room:time-has-a-cost`

Elena may participate when a legitimate training-information opportunity exists.

Elena line ID:

`line:elena:act2-opening:time-cost`

Base copy:

> Training costs more than the fee, if there is one. It costs time, attention, practice and the work you cannot be doing at the same moment.

Narrative must not assume training has a fee when the capability system does not say so.

## 9.3 Canonical Time-and-Stability Choice

Choice ID:

`choice:braila:act2:opening:time-and-stability`

Canonical option IDs:

- `keep-building-stability`
- `reserve-capacity-for-development`
- `accept-qualified-responsibility`

Runtime may expose only options that are actually legitimate.

The choice may be omitted when the authoritative state cannot support meaningful alternatives.

### keep-building-stability

Meaning:

The player prioritizes paid work, recovery from living pressure, rest, or another legitimate stabilizing action already available through authoritative systems.

Persistent fact:

`fact:braila:act2:opening:time-choice:keep-building-stability`

This choice does not close specialization later.

### reserve-capacity-for-development

Meaning:

The player deliberately preserves time/Work Capacity for a legitimate training, practice, assessment, information or development opportunity that actually exists.

Persistent fact:

`fact:braila:act2:opening:time-choice:reserve-capacity-for-development`

This fact does not grant capability or prove training completion.

### accept-qualified-responsibility

Meaning:

The player accepts a real additional responsibility only when eligibility, employer permission, schedule and Work Capacity permit it.

Persistent fact:

`fact:braila:act2:opening:time-choice:accept-qualified-responsibility`

## 9.4 Choose What to Protect

Beat ID:

`beat:braila:act2:opening:breathing-room:choose-what-to-protect`

Ana line ID:

`line:ana:act2-opening:choose-what-to-protect`

Base copy:

> You cannot build stability by saying yes until there is nothing left to protect. Work, rest, training and promises all consume something real.

## 9.5 Independence Without Ownership

Beat ID:

`beat:braila:act2:opening:breathing-room:independence-without-ownership`

Radu line ID:

`line:radu:act2-opening:independence-without-ownership`

Base copy:

> I used to think independence meant working for nobody. Right now I would settle for choosing my next step because it fits me, not because I panicked into it.

Persistent fact:

`fact:braila:act2:opening:independence-principle:first-understood`

---

# 10. Session Three — Responsibility Without Ownership

Session ID:

`session:braila:act2:opening:responsibility-without-ownership`

Authored ref:

`story:braila:act2:opening:responsibility-without-ownership`

Primary function:

**INDEPENDENT PRIORITIZATION -> RESPONSIBILITY**

The session proves that meaningful responsibility can increase before ownership, management title or entrepreneurship.

## 10.1 Trusted With Context

Beat ID:

`beat:braila:act2:opening:responsibility-without-ownership:trusted-with-context`

Ana may offer or contextualize a larger responsibility only when a real eligible opportunity exists.

The responsibility may involve one of several legitimate domains:

- protecting a more consequential field handoff;
- coordinating a real dispatch/reallocation decision through proper authority;
- assisting a producer/warehouse/technical workflow within current capability;
- supporting a peer without taking unauthorized custody or authority;
- taking responsibility for reporting/closing a real operational exception.

Narrative does not canonize one implementation as the only correct Act II route.

Ana line ID:

`line:ana:act2-opening:trusted-with-context`

Base copy:

> I am not giving you a bigger title. I am giving you more context. What you do with that context tells me what responsibility you may be ready to train for next.

Persistent fact:

`fact:braila:act2:opening:responsibility-context:first-received`

## 10.2 Legitimate Boundary Choice

Choice ID:

`choice:braila:act2:opening:responsibility-boundary`

Canonical option IDs:

- `accept-within-authority`
- `request-reallocation-or-support`
- `decline-outside-current-capability`

Only legitimate options should appear.

### accept-within-authority

Meaning:

The player accepts responsibility because current capability, permission, Work Capacity and schedule support it.

Persistent fact:

`fact:braila:act2:opening:responsibility-boundary:accepted-within-authority`

### request-reallocation-or-support

Meaning:

The player recognizes the responsibility matters but requires legitimate support, reassignment or coordination.

Persistent fact:

`fact:braila:act2:opening:responsibility-boundary:requested-support`

### decline-outside-current-capability

Meaning:

The player declines or redirects work they are not currently qualified, permitted, equipped or capable of performing safely and legitimately.

Persistent fact:

`fact:braila:act2:opening:responsibility-boundary:declined-outside-capability`

This option is not moral failure.

## 10.3 Responsibility Is Not Title

Beat ID:

`beat:braila:act2:opening:responsibility-without-ownership:responsibility-is-not-title`

Elena line ID:

`line:elena:act2-opening:responsibility-not-title`

Base copy:

> The safest person in a room is not always the person with the biggest title. Sometimes it is the person who knows exactly where their authority ends.

Persistent fact:

`fact:braila:act2:opening:responsibility-principle:authority-boundary-understood`

## 10.4 Mistake and Recovery

Beat ID:

`beat:braila:act2:opening:responsibility-without-ownership:mistake-and-recovery`

Act II must continue to allow mistakes.

Examples of legitimate mistakes include only events authoritative systems actually record, such as:

- accepting too much work;
- reporting a problem too late;
- failing an authorized task;
- misunderstanding a schedule or assignment;
- beginning a development path and failing an assessment when the capability system supports that state;
- declining something too late and requiring reallocation.

Narrative cannot fabricate a mistake for drama.

Recovery may require:

- honest reporting;
- legitimate reallocation;
- a retry or later second chance;
- additional training/practice;
- later reliable work;
- rebuilding relationship trust.

Recovery fact family:

- `fact:braila:act2:opening:responsibility-mistake:first-recorded`
- `fact:braila:act2:opening:responsibility-mistake:first-recovered`
- `fact:braila:act2:opening:responsibility-mistake:partial-recovery`
- `fact:braila:act2:opening:responsibility-mistake:unresolved`

Recovery facts add history.

They do not erase the original mistake.

---

# 11. Recurring Cast Continuity

## 11.1 Ana Stoica — Responsibility Gatekeeper, Not Destiny Writer

Character ID:

`ana-stoica`

Act II opening role:

Ana increasingly judges decision quality rather than route completion.

She may:

- trust the player with more context;
- point toward legitimate opportunities;
- support a request for training or reassignment when employer systems permit;
- reject unsafe overreach;
- recognize professional judgment.

She must not:

- hand out qualifications;
- make the player a manager by dialogue;
- imply entrepreneurship is the next true step.

## 11.2 Radu Marin — A Peer Making His Own Choices

Character ID:

`radu-marin`

Radu should begin making an independent path decision of his own.

He may remain interested in bicycle work while also considering a technical future.

His choice does not need to match the player’s.

Radu line ID:

`line:radu:act2-opening:his-own-choice`

Base copy:

> I can keep chasing the next route upgrade, or I can start building toward the technical work I actually want. I am still deciding which cost I can carry first.

Narrative purpose:

The player sees that adulthood/progression means tradeoffs for other people too.

## 11.3 Mirela Stan — Reliability Has Economic Context

Character ID:

`mirela-stan`

Mirela remains a merchant with her own business interests.

She may value the player’s reliability without becoming a guaranteed contract source.

If authoritative systems expose continued business opportunity, her history may influence tone or authored eligibility.

Narrative cannot manufacture customer demand because Mirela likes the player.

## 11.4 Daria Iancu — Production-Side Responsibility Horizon

Character ID:

`daria-iancu`

Daria may expose the production/technical/warehouse future only when the relevant systems can describe real work or requirements.

Daria line ID:

`line:daria:act2-opening:production-horizon`

Base copy:

> If you want to work closer to the cause instead of the last mile, learn what the inputs, storage and handling rules demand. Curiosity is useful. Permission and capability still matter.

## 11.5 Elena Dobre — Requirements Become Concrete

Character ID:

`elena-dobre`

Elena becomes the primary narrative interpreter of training, evidence and qualification requirements.

She does not own those requirements.

DT-06 capability authority remains canonical.

## 11.6 Victor Lupu — Another Valid Professional Future

Character ID:

`victor-lupu`

Victor may demonstrate competent career specialization without becoming a villain.

Victor line ID:

`line:victor:act2-opening:professional-path`

Base copy:

> You do not need to own the company to become hard to replace. Pick a responsibility, get good enough that people trust you with it, and keep your record clean when pressure arrives.

## 11.7 Petru Neagu — Social Continuity

Character ID:

`petru-neagu`

Petru may notice the player’s routine, fatigue, changing equipment or growing familiarity only when those states are actually visible/known.

He remains a person in the city, not a career counsellor.

## 11.8 Irina Pavel — Optional Operations Introduction

Character ID:

`irina-pavel`

Irina may receive her substantive first appearance during the Act II opening only when an authoritative operations/dispatch planning context exists.

If no such context exists, do not introduce her merely because the story document names her.

Optional introduction fact:

`fact:met:irina-pavel`

Irina line ID:

`line:irina:act2-opening:first-operations-contact`

Base copy:

> Routing is not drawing the shortest line. It is deciding which constraint is allowed to move and which promise is not.

---

# 12. Four Complete Career Futures

The Act II opening must keep at least four non-founder futures fully legitimate.

## 12.1 Field / Mobility

Stable direction ID:

`direction:field-mobility`

Narrative promise:

Become a more capable field logistics professional through real equipment, transport, experience and qualification requirements.

Possible futures include:

- trusted walking courier;
- bicycle courier when eligible and equipped;
- later vehicle work when eligible;
- specialist field logistics;
- high-reliability delivery work.

## 12.2 Operations / Dispatch

Stable direction ID:

`direction:operations-dispatch`

Narrative promise:

Move toward assignment, capacity, route, exception and coordination responsibility.

This may remain an employee career indefinitely.

## 12.3 Production / Technical / Warehouse

Stable direction ID:

`direction:production-technical-warehouse`

Narrative promise:

Move closer to input/output flow, handling, storage, maintenance, production or technical responsibility through valid capability paths.

## 12.4 Professional Employee Leadership

Stable direction ID:

`direction:professional-leadership`

Narrative promise:

Become a trusted senior employee, shift lead, coordinator, supervisor or later manager when real experience and employer requirements support it.

Leadership does not require ownership.

## 12.5 Stability-First Is Not a Fifth Profession

Stable priority ID:

`priority:stability-first`

Meaning:

The player chooses not to prioritize a new specialization yet.

They continue building money/time/capacity/recovery stability through legitimate systems.

This is a pacing decision, not a profession identity.

---

# 13. Session Four — The Cost of a Door

Session ID:

`session:braila:act2:opening:the-cost-of-a-door`

Authored ref:

`story:braila:act2:opening:the-cost-of-a-door`

Primary function:

**RESPONSIBILITY -> SPECIALIZATION PRESSURE**

## 13.1 Requirements, Not Promises

Beat ID:

`beat:braila:act2:opening:the-cost-of-a-door:requirements-not-promises`

Elena line ID:

`line:elena:act2-opening:requirements-not-promises`

Base copy:

> A real path has requirements you can fail, practice you can repeat and evidence you have to earn. If the only requirement is wanting the title, it is not a real path yet.

Narrative must read requirement descriptions from the capability/profession authority when available.

It must not hardcode a fake qualification tree.

## 13.2 Four Complete Futures

Beat ID:

`beat:braila:act2:opening:the-cost-of-a-door:four-complete-futures`

All four directions should be understandable as complete lives/careers.

None is merely a temporary step toward founding a company.

Persistent exploration facts may be written when the player legitimately receives information about a direction:

- `fact:braila:act2:opening:direction-explored:field-mobility`
- `fact:braila:act2:opening:direction-explored:operations-dispatch`
- `fact:braila:act2:opening:direction-explored:production-technical-warehouse`
- `fact:braila:act2:opening:direction-explored:professional-leadership`

These facts may coexist.

Exploring a path is not choosing it.

## 13.3 Opportunity Cost

Beat ID:

`beat:braila:act2:opening:the-cost-of-a-door:opportunity-cost`

Opportunity cost may come from real state such as:

- training time versus paid shift time;
- equipment purchase versus other personal spending;
- rest versus extra work;
- taking a lower-immediate-reward learning opportunity versus familiar work;
- remaining in a stable current role while waiting for requirements;
- accepting a responsibility that consumes capacity needed elsewhere.

Narrative must not invent costs that the relevant authority does not model.

Radu line ID:

`line:radu:act2-opening:opportunity-cost`

Base copy:

> Every door looks cheap when you only count the thing written on the sign. The real price is everything else you cannot do at the same time.

## 13.4 Not Yet Is Valid

Beat ID:

`beat:braila:act2:opening:the-cost-of-a-door:not-yet-is-valid`

Ana line ID:

`line:ana:act2-opening:not-yet-valid`

Base copy:

> “Not yet” is a professional answer when you know what has to become true first.

Persistent fact:

`fact:braila:act2:opening:not-yet:legitimate-choice-understood`

---

# 14. Session Five — First Direction

Session ID:

`session:braila:act2:opening:first-direction`

Authored ref:

`story:braila:act2:opening:first-direction`

Primary function:

**SPECIALIZATION PRESSURE -> CURRENT PRIORITY**

The player names a current direction.

They do not lock a permanent identity.

## 14.1 Canonical First-Priority Choice

Choice ID:

`choice:braila:act2:opening:first-priority`

Canonical option IDs:

- `stability-first`
- `field-mobility`
- `operations-dispatch`
- `production-technical-warehouse`
- `professional-leadership`

This is a narrative priority declaration.

It does not grant access.

## 14.2 Priority Facts

Exactly one initial-priority fact may be written for the first completed priority declaration:

- `fact:braila:act2:opening:initial-priority:stability-first`
- `fact:braila:act2:opening:initial-priority:field-mobility`
- `fact:braila:act2:opening:initial-priority:operations-dispatch`
- `fact:braila:act2:opening:initial-priority:production-technical-warehouse`
- `fact:braila:act2:opening:initial-priority:professional-leadership`

This records history, not a permanent class lock.

If the player later changes focus, new later history may be added without deleting the initial priority.

## 14.3 Name the Priority

Beat ID:

`beat:braila:act2:opening:first-direction:name-the-priority`

Elena line ID:

`line:elena:act2-opening:name-the-priority`

Base copy:

> Pick what you want to prepare for next. Not forever. Next. Then let the requirements tell you what work still separates interest from capability.

## 14.4 Keep the Door Open

Beat ID:

`beat:braila:act2:opening:first-direction:keep-the-door-open`

The story must preserve route switching.

Career history remains remembered, but changing professions or focus later is legitimate.

Radu line ID:

`line:radu:act2-opening:keep-the-door-open`

Base copy:

> If I start with bicycle work and end up technical later, that does not make the first step fake. It just means I learned more about myself on the way.

Persistent fact:

`fact:braila:act2:opening:career-switching:legitimate-understood`

## 14.5 Next Responsibility

Beat ID:

`beat:braila:act2:opening:first-direction:next-responsibility`

The next concrete opportunity must come from authoritative systems appropriate to the player’s current eligibility and world state.

Narrative may point toward:

- available basic work;
- valid training information;
- supervised experience;
- eligible higher-responsibility work;
- a recovery task;
- a wait condition until requirements are met.

Narrative must not materialize the opportunity itself.

## 14.6 Act II Core Horizon

Beat ID:

`beat:braila:act2:opening:first-direction:act2-core-horizon`

Closing reflection line ID:

`line:act2-opening:closing-reflection`

Base copy:

> Act I taught me that my work affects other people. Act II starts when I decide which kind of responsibility is worth preparing myself to carry.

Persistent facts:

- `fact:braila:act2:opening:completed`
- `fact:braila:act2:core:available`

`fact:braila:act2:core:available` is narrative eligibility only.

It grants no profession, job, vehicle, company or geography.

---

# 15. Visible Consequence Contract

Act II opening should make prior history feel persistent, but visible presentation is subordinate to authority.

## 15.1 Valid Visible Consequences

DT-10/living-city presentation may show a consequence only when the underlying system confirms it.

Examples include:

- Daria’s production flow remains resumed, constrained or later recovered;
- Mirela’s relevant stock/order/service state reflects the real chain outcome;
- a real unresolved customer consequence remains visible;
- a legitimate competitor serves work the player did not take;
- Station Commons workload state changes through actual mission/dispatch authority;
- the player’s real equipment changes after an authoritative acquisition;
- a real training or work-access surface becomes available after requirements are met.

## 15.2 Forbidden Visible Consequences

Do not show:

- a richer apartment because the player selected `stability-first`;
- a bicycle because the player expressed interest in mobility;
- a dispatcher desk assignment because the player chose operations;
- factory access because Daria likes the player;
- a management badge because Ana recognized judgment;
- repaired stock because a dialogue closed;
- a city banner declaring the player independent;
- crowds celebrating career selection.

## 15.3 Visible History Fact

When at least one system-confirmed prior consequence is truthfully presented during Act II opening:

`fact:braila:act2:opening:visible-history:confirmed`

This fact records presentation of confirmed history.

It does not create the underlying state.

---

# 16. Recoverable Mistake Contract

Act II should become more demanding without becoming success-only.

## 16.1 Valid Mistake Sources

Narrative may interpret only mistakes recorded by authoritative systems.

Potential categories include:

- workload overcommitment;
- failure to complete accepted work;
- delayed escalation;
- failed training/practical/assessment attempt when modeled;
- accepting responsibility without sufficient remaining capacity when the system permits such a mistake;
- a customer/producer consequence caused by legitimate but poor prioritization;
- missed opportunity because another commitment was protected.

## 16.2 No Fake Failure

Do not force a failure merely to create drama.

A player who makes good decisions may have a clean Act II opening.

The narrative tension should come from real tradeoffs, not mandatory punishment.

## 16.3 Recovery Principles

Recovery requires something real such as:

- reporting;
- reallocation;
- later successful work;
- additional training/practice;
- restoring Work Capacity;
- rebuilding trust;
- waiting for the next legitimate opportunity;
- resolving a previously open Act I consequence.

Recovery does not erase:

- lost time;
- failed work;
- customer impact;
- producer impact;
- relationship memory;
- prior outcome facts.

---

# 17. Persistent Narrative Fact Registry — Act II Opening

## 17.1 Outcome-processing facts

- `fact:braila:act2:opening:history:stabilized-processed`
- `fact:braila:act2:opening:history:contained-processed`
- `fact:braila:act2:opening:history:recovered-after-failure-processed`
- `fact:braila:act2:opening:history:unresolved-processed`

Exactly one should describe the first processed Act I capstone outcome.

## 17.2 Consequence / choice-space facts

- `fact:braila:act2:opening:capstone-history:first-acknowledged`
- `fact:braila:act2:opening:act1-open-loop:later-progress-acknowledged`
- `fact:braila:act2:opening:choice-space:first-opened`
- `fact:braila:act2:opening:visible-history:confirmed`

## 17.3 Stability / independence facts

- `fact:braila:act2:opening:stability-state:first-read`
- `fact:braila:act2:opening:time-choice:keep-building-stability`
- `fact:braila:act2:opening:time-choice:reserve-capacity-for-development`
- `fact:braila:act2:opening:time-choice:accept-qualified-responsibility`
- `fact:braila:act2:opening:independence-principle:first-understood`

## 17.4 Responsibility facts

- `fact:braila:act2:opening:responsibility-context:first-received`
- `fact:braila:act2:opening:responsibility-boundary:accepted-within-authority`
- `fact:braila:act2:opening:responsibility-boundary:requested-support`
- `fact:braila:act2:opening:responsibility-boundary:declined-outside-capability`
- `fact:braila:act2:opening:responsibility-principle:authority-boundary-understood`

## 17.5 Mistake/recovery facts

- `fact:braila:act2:opening:responsibility-mistake:first-recorded`
- `fact:braila:act2:opening:responsibility-mistake:first-recovered`
- `fact:braila:act2:opening:responsibility-mistake:partial-recovery`
- `fact:braila:act2:opening:responsibility-mistake:unresolved`

## 17.6 Direction-exploration facts

- `fact:braila:act2:opening:direction-explored:field-mobility`
- `fact:braila:act2:opening:direction-explored:operations-dispatch`
- `fact:braila:act2:opening:direction-explored:production-technical-warehouse`
- `fact:braila:act2:opening:direction-explored:professional-leadership`
- `fact:braila:act2:opening:not-yet:legitimate-choice-understood`

Direction-exploration facts may coexist.

## 17.7 Initial-priority facts

- `fact:braila:act2:opening:initial-priority:stability-first`
- `fact:braila:act2:opening:initial-priority:field-mobility`
- `fact:braila:act2:opening:initial-priority:operations-dispatch`
- `fact:braila:act2:opening:initial-priority:production-technical-warehouse`
- `fact:braila:act2:opening:initial-priority:professional-leadership`

Exactly one initial-priority fact is written for the first completed priority declaration.

It is historical, not a permanent career lock.

## 17.8 Progression facts

- `fact:braila:act2:opening:career-switching:legitimate-understood`
- `fact:braila:act2:opening:completed`
- `fact:braila:act2:core:available`

---

# 18. Persistent Consequence Rules

## 18.1 World-Local Scope

Act II opening facts are World Instance history.

They must not become universal account history across different World Instances.

## 18.2 Historical Facts Do Not Grant Authority

A narrative fact may influence later authored dialogue, variant selection or story eligibility.

It cannot create:

- Personal Money;
- Company Money;
- wages;
- Work Capacity;
- cargo;
- inventory;
- production output;
- orders;
- customer demand;
- qualifications;
- capability;
- equipment;
- vehicles;
- employment;
- promotion;
- company ownership;
- shares;
- infrastructure;
- territory or map access.

## 18.3 Initial Priority Is Not Permanent Identity

Later career switching must remain possible.

Do not delete the initial-priority fact.

Add later history that reflects the new direction.

## 18.4 Stability Is Dynamic

A player who is stable today may face pressure later.

A player under pressure today may recover later.

Narrative must not convert a temporary economic condition into a permanent character label.

---

# 19. DT-09 Mission Materialization Contract

DT-09 may materialize the Act II opening through one or more authored missions per session.

## 19.1 Required Binding Families

The mission-side adapter should receive or resolve opaque authoritative references for applicable state such as:

- Act I completion;
- Act I capstone primary outcome;
- relationship/consequence facts;
- current employer and permission context;
- current eligible work opportunities;
- current Work Capacity/schedule availability evidence;
- read-only Player Economy stability categories;
- real wage/arrears/recovery evidence when exposed;
- training/information/practice opportunities;
- capability requirement references;
- actor/location availability;
- real producer/order/delivery references when a session uses them;
- visible-consequence evidence;
- authoritative completion/failure events.

DT-08 does not define the TypeScript interface.

## 19.2 Recommended Authored Mission Composition

| Narrative session | Stable authoredRef |
| --- | --- |
| What Remains | `story:braila:act2:opening:what-remains` |
| Breathing Room | `story:braila:act2:opening:breathing-room` |
| Responsibility Without Ownership | `story:braila:act2:opening:responsibility-without-ownership` |
| The Cost of a Door | `story:braila:act2:opening:the-cost-of-a-door` |
| First Direction | `story:braila:act2:opening:first-direction` |

DT-09 may split a session into several mission definitions when authoritative references differ.

It may also keep some beats event-driven when no mission should exist solely for presentation.

## 19.3 Choice Materialization Rule

A narrative choice must not be rendered as actionable when its option is impossible in current authoritative state.

Examples:

- do not offer training attendance when no training opportunity exists;
- do not offer extra responsibility when eligibility fails;
- do not offer dispatch coordination when employer permission is absent;
- do not offer an inventory task without real inventory authority;
- do not offer a vehicle path as current work when the player lacks required capability/equipment.

## 19.4 No Settlement Ownership

Authored mission consequences may reference real settlement through the existing economy contract.

Narrative does not choose wage/reward amounts.

No fixed quest-money reward is canonized in this document.

---

# 20. Player Economy Handoff

DT-03 owns:

- Personal Money;
- employer treasury;
- wages;
- living-cost pressure;
- arrears/recovery state;
- Work Capacity accounting;
- exactly-once economic settlement.

Act II narrative may consume read-only semantic categories sufficient to explain tradeoffs.

It must not duplicate the economy model.

---

# 21. Professions and Capability Handoff

DT-06 owns:

- capability truth;
- theory/practical/supervised evidence;
- qualifications;
- equipment/vehicle requirements;
- employer permission;
- work-access eligibility.

Act II narrative may explain requirements and remember interests.

It must never grant capability through dialogue or story completion.

---

# 22. Production / Supply Handoff

DT-07 owns:

- producer demand;
- stock/input/output state;
- reservation lifecycle;
- causal producer opportunities;
- physical recovery rules.

Daria-linked story beats may consume that truth.

They must not create producer pressure or inventory.

---

# 23. Persistence Handoff

DT-02 owns Save v2-compatible persistence authority.

DT-09 owns mission-side resume semantics.

DT-08 defines stable semantic facts only.

Persistence may store/expose them when the appropriate schema/mission consequence path supports them.

This document does not modify Save.

---

# 24. Visual Storytelling Handoff

DT-10 may later present Act II beats after its visible branch is reconciled and authoritative event signals exist.

Potential visible moments include:

- different Act I outcome debriefs;
- persistent merchant/producer consequences;
- Ana offering context rather than tutorial instruction;
- Elena presenting requirement information;
- Radu choosing a different path from the player;
- optional Irina operations introduction;
- a truthful current-priority reflection.

All visible implementation remains subject to #317 and owner Android acceptance.

Narrative presentation must not fire before the event/state it describes.

---

# 25. Career-Neutrality Rules

Act II opening must never imply:

- founder/CEO is the true route;
- employee progression is a lesser ending;
- management is superior to technical specialization;
- mobility progression is merely tutorial content;
- production/warehouse work is a side activity rather than a complete career;
- a player who chooses stability-first is failing to progress;
- changing career later invalidates earlier progress.

A mature DROPi Tycoon career can remain professional employment indefinitely.

---

# 26. Acceptance Contract

A future implementation of this narrative opening is compliant only when all applicable checks pass.

## 26.1 Act I History

- consumes exactly one durable capstone outcome;
- preserves unresolved or failed history;
- does not require perfect success for Act II entry;
- recurring characters remember only facts legitimately available to them.

## 26.2 Stability / Independence

- stability is read from real state rather than awarded by story;
- narrative defines independence as choice/control, not ownership;
- stability-first is a valid priority;
- no fake balance, wage, living-cost or Work Capacity number is created.

## 26.3 Responsibility

- additional responsibility requires real eligibility/permission/context;
- declining work outside current capability is legitimate;
- requesting support/reallocation is legitimate;
- responsibility does not imply promotion or ownership;
- mistakes are recoverable when real systems support recovery.

## 26.4 Specialization

- field/mobility remains complete;
- operations/dispatch remains complete;
- production/technical/warehouse remains complete;
- professional employee leadership remains complete;
- founder is not required;
- interest/priority does not grant access;
- initial priority can change later.

## 26.5 Visible Consequences

- visible history is shown only when authoritative state proves it;
- no equipment, role, stock, building or wealth appears because dialogue completed;
- unresolved consequences may remain visible into Act II.

## 26.6 Mission Handoff

- stable `story:*` authoredRefs are preserved;
- choices are materialized only when options are legitimate;
- DT-09 owns mission IDs/stages/events/resume;
- economy, capability, production and Save authority remain external.

---

# 27. Ownership Boundary

After this document merges:

- **DT-08 Story Director** owns Act II opening narrative meaning, stable IDs, authoredRefs and semantic consequence intent.
- **DT-09 Missions & Campaign** owns mission realization, objectives, stages, events, failure policy, consequence emission and resume behavior.
- **DT-10 Characters & Dialogue** owns visible dialogue/character presentation and Android narrative UX.
- **DT-02 World Persistence** owns durable Save storage/restoration.
- **DT-03 Player Economy** owns money, wages, living pressure and Work Capacity.
- **DT-06 Professions & Personal Capability** owns requirements, eligibility and qualifications.
- **DT-07 Production & Supply Chain** owns producer/inventory causality.
- **DT-01 / DT-05** retain visual geography and living-city presentation authority.

No specialist should duplicate another authority simply to force an Act II beat to occur.

---

# Final Canonical Principle

Act I proves that the player’s work can matter to other people.

Act II begins when the player has enough history to ask a harder question:

**Which responsibility is worth becoming capable of carrying?**

The answer can be field work, dispatch, production, technical expertise, warehouse operations, employee leadership, or simply building enough stability to choose later.

The player does not become independent because a company belongs to them.

**They become more independent when their next step is a deliberate choice instead of an automatic reaction.**