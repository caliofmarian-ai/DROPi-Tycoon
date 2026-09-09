# Document Information

Document: ACT_II_SPECIALIZATION_MATERIALITY_NARRATIVE_CONTRACT.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical Narrative Content Contract
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-09
Parent Authority: `01_GameDesign/STORY_BIBLE.md`
Campaign Authority: `01_GameDesign/CAMPAIGN_STRUCTURE.md`
Act II Opening Authority: `01_GameDesign/ACT_II_OPENING_NARRATIVE_CONTRACT.md`
Capability Authority: `06_Technical/PERSONAL_CAPABILITY_RUNTIME.md`
Player Economy Authority: `02_Economy/PLAYER_ECONOMY_HARDSHIP_LIFECYCLE.md` and merged Player Economy runtime

---

# DROPi Tycoon — Act II Specialization Materiality Narrative Contract

## Purpose

This document defines the next bounded narrative slice of **Act II — Choices** after the canonical Act II opening.

The Act II opening allowed the player to name a current priority without locking a permanent career identity.

This slice asks the next question:

**When does a direction stop being an idea and start becoming a real commitment?**

The canonical progression is:

**PRIORITY -> EVIDENCE -> COST -> LEGITIMATE OPPORTUNITY / WAIT -> REASSESSMENT**

The governing principle is:

> **A specialization becomes materially meaningful only when authoritative systems make the player confront something real: a requirement, a blocker, a cost, a permission boundary, a capacity limit, a legitimate opportunity, or a consequence.**

Choosing a direction in dialogue has no gameplay authority by itself.

Selecting `field-mobility` does not create a bicycle.

Selecting `operations-dispatch` does not create a dispatch job.

Selecting `production-technical-warehouse` does not create warehouse access or a workshop.

Selecting `professional-leadership` does not create a promotion or management title.

Selecting `stability-first` does not create money, erase arrears, increase Work Capacity, or magically improve housing.

The player must interact with real conditions supplied by the systems that own those conditions.

This slice preserves five equally legitimate pacing/future positions:

- stability-first;
- field / mobility;
- operations / dispatch;
- production / technical / warehouse;
- professional employee leadership.

Founder / entrepreneur remains a valid future later, but it is not required, not implied as the mature path, and not the reward for completing this slice.

This document defines:

- stable sequence, session, beat, choice and `authoredRef` IDs;
- exact intake from the Act II opening priority facts;
- read-only narrative bindings to Personal Capability and Player Economy;
- direction-specific materiality rules;
- real opportunity-cost semantics;
- capability-versus-permission-versus-equipment distinctions;
- legitimate waiting and stability-first progression;
- recoverable mistakes;
- recurring-character continuity;
- visible-consequence boundaries;
- persistent semantic narrative facts;
- DT-09 mission materialization hooks.

This document does **not** implement:

- mission runtime;
- dialogue UI;
- Save schema;
- Personal Money mutation;
- Company Money mutation;
- wages;
- living-cost values;
- arrears settlement;
- Work Capacity mutation;
- capability acquisition;
- theory/practical-training completion;
- qualification grants;
- supervised-experience grants;
- equipment or vehicle ownership;
- employer permission;
- profession mutation;
- promotion;
- company formation;
- inventory, cargo, orders or production state;
- map geometry;
- Android presentation.

---

# 1. Canonical Identity

## 1.1 Parent Act

Canonical Act II arc ID remains:

`arc:braila:act2:choices`

This document does not replace that ID.

## 1.2 Sequence ID

Canonical sequence ID:

`sequence:braila:act2:specialization-materiality`

Display label:

**Act II — When a Direction Costs Something**

Narrative question:

**What am I willing to protect, spend, practice, postpone or refuse in order to become capable of carrying a different responsibility?**

## 1.3 Sequence Completion Fact

`fact:braila:act2:specialization-materiality:completed`

This fact means the bounded slice has been narratively processed.

It does not mean:

- a permanent profession has been selected;
- a capability has necessarily been earned;
- a new job has necessarily been obtained;
- a vehicle has been acquired;
- the player is financially stable;
- the player owns a company;
- Act II is complete.

---

# 2. Entry Contract

Preferred narrative entry evidence:

- `fact:braila:act2:opening:completed`;
- `fact:braila:act2:core:available`.

The sequence should also consume exactly one initial-priority history fact when available:

- `fact:braila:act2:opening:initial-priority:stability-first`;
- `fact:braila:act2:opening:initial-priority:field-mobility`;
- `fact:braila:act2:opening:initial-priority:operations-dispatch`;
- `fact:braila:act2:opening:initial-priority:production-technical-warehouse`;
- `fact:braila:act2:opening:initial-priority:professional-leadership`.

That fact is historical.

It is not a permanent class lock.

If persistence cannot yet expose the priority fact, this slice must wait or enter through a governed compatibility path supplied by DT-09. Narrative must not guess the player’s prior choice from unrelated state.

---

# 3. Stable Session Registry

The sequence uses five canonical narrative sessions.

| Session ID | Display title | Narrative function |
| --- | --- | --- |
| `session:braila:act2:specialization:read-the-gap` | Read the Gap | Turn a stated priority into one real requirement/blocker picture |
| `session:braila:act2:specialization:what-the-next-step-costs` | What the Next Step Costs | Make opportunity cost materially visible |
| `session:braila:act2:specialization:proof-before-permission` | Proof Before Permission | Separate capability, equipment, permission and current access |
| `session:braila:act2:specialization:work-that-fits` | Work That Fits | Meet a legitimate aligned opportunity, recovery path or valid wait state |
| `session:braila:act2:specialization:choose-again` | Choose Again | Reassess focus without erasing earlier history |

The sessions may take longer than five play sessions.

Narrative pacing must yield to authoritative state.

If the real next requirement takes time, money, training, recovery, equipment, employer authorization or another system-owned condition, the story waits rather than manufacturing a shortcut.

---

# 4. Stable Mission-Facing Authored References

DT-09 may materialize one or more missions around each session while preserving these authored identities:

- `story:braila:act2:specialization:read-the-gap`;
- `story:braila:act2:specialization:what-the-next-step-costs`;
- `story:braila:act2:specialization:proof-before-permission`;
- `story:braila:act2:specialization:work-that-fits`;
- `story:braila:act2:specialization:choose-again`.

These are stable narrative references.

They are not mission IDs.

---

# 5. Stable Beat Registry

## 5.1 Read the Gap

- `beat:braila:act2:specialization:read-the-gap:history-is-not-lock`;
- `beat:braila:act2:specialization:read-the-gap:one-real-gap`;
- `beat:braila:act2:specialization:read-the-gap:blocker-with-a-name`;
- `beat:braila:act2:specialization:read-the-gap:title-does-not-grant-capability`.

## 5.2 What the Next Step Costs

- `beat:braila:act2:specialization:what-the-next-step-costs:real-competing-use`;
- `beat:braila:act2:specialization:what-the-next-step-costs:protect-something-real`;
- `beat:braila:act2:specialization:what-the-next-step-costs:no-fake-sacrifice`;
- `beat:braila:act2:specialization:what-the-next-step-costs:allocation-leaves-history`.

## 5.3 Proof Before Permission

- `beat:braila:act2:specialization:proof-before-permission:capability-is-not-access`;
- `beat:braila:act2:specialization:proof-before-permission:equipment-is-not-qualification`;
- `beat:braila:act2:specialization:proof-before-permission:permission-is-not-capability`;
- `beat:braila:act2:specialization:proof-before-permission:current-state-still-matters`.

## 5.4 Work That Fits

- `beat:braila:act2:specialization:work-that-fits:aligned-opportunity-or-valid-wait`;
- `beat:braila:act2:specialization:work-that-fits:one-more-real-boundary`;
- `beat:braila:act2:specialization:work-that-fits:attempt-or-defer`;
- `beat:braila:act2:specialization:work-that-fits:consequence-is-authoritative`.

## 5.5 Choose Again

- `beat:braila:act2:specialization:choose-again:what-changed`;
- `beat:braila:act2:specialization:choose-again:initial-choice-remains-history`;
- `beat:braila:act2:specialization:choose-again:checkpoint-focus`;
- `beat:braila:act2:specialization:choose-again:next-door-remains-earned`.

---

# 6. Read-Only Capability Authority Contract

Personal Capability answers:

**What can this human currently do, and why?**

Narrative may read the capability authority.

Narrative may not mutate it.

## 6.1 Requirement Families Narrative May Interpret

When returned by authoritative capability/work-access evaluation, narrative may interpret requirements for:

- prerequisite capability;
- theory;
- practical training;
- supervised experience;
- fictional qualification;
- equipment;
- vehicle class;
- cargo capability;
- facility/infrastructure;
- employment;
- employer permission;
- company capability;
- world access;
- Personal Money;
- Work Capacity;
- current-shift availability.

Narrative should prefer player-readable labels/messages supplied by the capability authority.

It must not expose raw internal IDs when a safer player-facing label exists.

## 6.2 Core Rule

A profession label is identity/intent, not permission.

A direction fact is narrative history, not permission.

A capability is evidence, not automatically current work access.

Current work access remains an intersection of personal evidence and real runtime context.

## 6.3 Known Canonical Examples

The current capability authority already contains examples that may become narrative material when they are actually relevant:

### Field / Mobility

`BicycleOperation` requires:

- `WalkingCourierFundamentals`;
- bicycle road theory;
- bicycle handling practical training.

Actual `bicycle-light-parcel-delivery` additionally requires current real facts including:

- active employment;
- bicycle delivery employer authorization;
- compatible bicycle equipment/vehicle class;
- light-parcel handling;
- sufficient authoritative Work Capacity;
- current-shift availability.

Advanced powered-two-wheel and road-delivery paths have their own capability, practical, qualification, equipment, employer-permission and current-access boundaries.

Narrative must not promise that completing one requirement automatically grants the rest.

### Operations / Dispatch

`DispatchOperations` currently requires:

- Delivery App Literacy;
- dispatch and route theory;
- dispatch and route practical training.

The `DispatchOperator` profession label does not itself create employment, a dispatch station, employer permission or a dispatch assignment.

### Production / Technical / Warehouse

`WarehouseOperations` currently requires:

- Walking Courier Fundamentals;
- warehouse sorting practical training;
- warehouse operations qualification.

`VehicleMaintenance` currently depends on earlier technical capability, practical training, a maintenance workshop and a technical-maintenance qualification.

Narrative may explain the causal meaning of these requirements only when the relevant opportunity exists.

It must not create the workshop, qualification or job.

### Professional Employee Leadership

There is currently no canonical `ProfessionalLeader` profession ID that narrative is allowed to invent.

This direction remains a narrative career future expressed through real employer responsibility, experience, trust and later role authority when those systems expose it.

Narrative must not manufacture a supervisor badge, promotion, management permission or salary change.

## 6.4 Career Switching Remains Legitimate

The merged profession runtime preserves career history and allows profession changes without granting capability, changing employment or creating ownership.

This slice therefore treats focus changes as legitimate history.

It does not frame changing direction as failure.

---

# 7. Read-Only Player Economy Contract

Player Economy owns:

- Personal Money;
- employer Company Money;
- wage settlement;
- living costs;
- arrears;
- financial status;
- housing status;
- productive-work records;
- Work Capacity mutation.

Narrative may read these states when an owning adapter supplies them.

Narrative may never edit them.

## 7.1 Financial States That May Matter Narratively

When authoritative state supplies them, the slice may distinguish:

- `Stable`;
- `Insolvent`;
- `Recovering`.

Housing may distinguish:

- `Housed`;
- `EmergencyHousing`.

No state is a morality label.

No hardship state means the player chose badly as a person.

## 7.2 Stability-First Must Be Concrete

`stability-first` becomes materially meaningful only through real conditions.

Examples include:

- protecting Personal Money needed for an actual living obligation;
- clearing real arrears through existing ledger-backed Personal Money;
- continuing legitimate paid work while a development step would create unacceptable pressure;
- protecting Work Capacity needed for productive work or recovery;
- waiting through `Recovering` until a subsequent legitimate paid living obligation confirms `Stable`;
- choosing not to spend on equipment/training while a real financial constraint exists.

Narrative must not invent a fake savings threshold, fake rent bill or fake equipment price.

## 7.3 Stable Players May Still Choose Stability

A player does not need to be Insolvent or in Emergency Housing to choose stability-first.

A stable player may legitimately decide to:

- build more breathing room through existing income systems;
- preserve Work Capacity;
- avoid an opportunity that is currently too costly;
- wait for a better-timed training/work opportunity;
- continue a career they already value.

The story must not punish the player for refusing artificial urgency.

## 7.4 Hardship Recovery Is Not a Career Gate

Insolvency or Emergency Housing does not permanently lock specialization.

When authoritative requirements permit it, a player may still learn, work or explore directions.

When requirements do not permit it, the story explains the real blocker and leaves a recovery path.

No career is sold as a magical escape from hardship.

---

# 8. Priority Intake and Continuity

## 8.1 Initial Priority Is Historical

The Act II opening wrote exactly one initial-priority fact.

This slice respects it.

It does not silently overwrite it.

## 8.2 Stable Direction IDs

The existing direction IDs remain canonical:

- `direction:field-mobility`;
- `direction:operations-dispatch`;
- `direction:production-technical-warehouse`;
- `direction:professional-leadership`.

The existing pacing priority remains:

- `priority:stability-first`.

## 8.3 No Fifth Profession Rule

`stability-first` is not a profession.

`professional-leadership` is not automatically a profession ID either.

Narrative direction vocabulary and runtime profession vocabulary must not be collapsed into one enum merely for convenience.

## 8.4 Initial-Priority Intake Facts

When the relevant initial-priority history is successfully read and acknowledged, write exactly one processing fact:

- `fact:braila:act2:specialization:initial-priority-processed:stability-first`;
- `fact:braila:act2:specialization:initial-priority-processed:field-mobility`;
- `fact:braila:act2:specialization:initial-priority-processed:operations-dispatch`;
- `fact:braila:act2:specialization:initial-priority-processed:production-technical-warehouse`;
- `fact:braila:act2:specialization:initial-priority-processed:professional-leadership`.

These are processing facts only.

---

# 9. Direction Materiality Contract

A direction is materially meaningful for this slice only when at least one authoritative condition changes the player’s possible action.

## 9.1 Valid Materiality Evidence

At least one of the following must be real:

- a capability requirement is unmet;
- a capability requirement is newly met;
- a training/practice opportunity exists;
- a qualification requirement exists;
- an equipment/vehicle requirement exists;
- employer permission is missing or present;
- a facility/infrastructure requirement matters;
- Work Capacity blocks or enables a legitimate action;
- Personal Money blocks or enables a modeled step;
- current-shift availability blocks or enables a step;
- a legitimate aligned work opportunity becomes available;
- a legitimate aligned work opportunity remains unavailable for a known reason;
- a real stability/hardship obligation changes what can responsibly be prioritized.

## 9.2 Invalid Materiality Evidence

The following are insufficient by themselves:

- selecting a dialogue option;
- a character saying the player is talented;
- reaching a level number unrelated to capability authority;
- owning money without satisfying other requirements;
- owning equipment without qualification/permission;
- holding a profession label without capability/access;
- completing a narrative beat whose underlying system state did not change.

## 9.3 First Materiality Facts

When materiality is legitimately demonstrated for a direction, the story may write:

- `fact:braila:act2:specialization:materiality:first-confirmed:stability-first`;
- `fact:braila:act2:specialization:materiality:first-confirmed:field-mobility`;
- `fact:braila:act2:specialization:materiality:first-confirmed:operations-dispatch`;
- `fact:braila:act2:specialization:materiality:first-confirmed:production-technical-warehouse`;
- `fact:braila:act2:specialization:materiality:first-confirmed:professional-leadership`.

A fact means the direction encountered a real condition.

It does not mean the condition was successfully satisfied.

---

# 10. Session One — Read the Gap

Session ID:

`session:braila:act2:specialization:read-the-gap`

Authored ref:

`story:braila:act2:specialization:read-the-gap`

Primary function:

**PRIORITY -> EVIDENCE**

## 10.1 History Is Not Lock

Beat ID:

`beat:braila:act2:specialization:read-the-gap:history-is-not-lock`

Elena line ID:

`line:elena:act2-specialization:history-is-not-lock`

Base copy:

> You chose what to look at first. That is useful. It is not a contract with your future.

Persistent fact:

`fact:braila:act2:specialization:career-focus:change-remains-legitimate`

## 10.2 One Real Gap

Beat ID:

`beat:braila:act2:specialization:read-the-gap:one-real-gap`

The story should expose one currently meaningful gap rather than dumping an entire career tree.

The gap must come from authoritative state.

Examples:

- bicycle theory is not yet complete;
- practical training is missing;
- qualification is missing;
- the player lacks a compatible bicycle;
- employer permission is missing;
- Dispatch Operations theory/practice remains incomplete;
- Warehouse Operations qualification remains incomplete;
- a maintenance workshop is unavailable;
- Personal Money is insufficient for a modeled step;
- Work Capacity is currently insufficient;
- current shift availability blocks participation;
- a leadership opportunity has no real employer authority behind it yet;
- stability pressure makes development timing legitimately poor.

Persistent fact:

`fact:braila:act2:specialization:gap:first-authoritative-gap-read`

The exact blocker remains owned by the source system.

## 10.3 Blocker With a Name

Beat ID:

`beat:braila:act2:specialization:read-the-gap:blocker-with-a-name`

Elena line ID:

`line:elena:act2-specialization:blocker-with-a-name`

Base copy:

> “Not allowed yet” is useless unless you know why. Find the real blocker. Then you can decide whether it is worth solving.

Narrative should use the capability system’s player-readable blocker message when one exists.

It must not replace a real blocker with a vague story-only excuse.

## 10.4 Title Does Not Grant Capability

Beat ID:

`beat:braila:act2:specialization:read-the-gap:title-does-not-grant-capability`

Ana line ID:

`line:ana:act2-specialization:title-does-not-grant-capability`

Base copy:

> I can call you ambitious. I cannot call you qualified just because the word sounds good on a schedule.

Persistent fact:

`fact:braila:act2:specialization:principle:title-is-not-permission`

---

# 11. Direction-Specific Read-the-Gap Variants

## 11.1 Stability-First

Primary characters:

- Ana;
- optionally Petru for human continuity, never as a finance adviser.

The gap is not “become richer.”

The gap must be a real stability condition such as an obligation, arrears, recovery state, current Work Capacity pressure or another economy-owned condition.

Ana line ID:

`line:ana:act2-specialization:stability-gap`

Base copy:

> If your next step makes everything else less stable, then stability is part of the work. Protect what is actually at risk first.

## 11.2 Field / Mobility

Primary characters:

- Radu;
- Elena;
- Ana when employer permission is relevant.

Radu line ID:

`line:radu:act2-specialization:mobility-gap`

Base copy:

> A bicycle looks like speed from the pavement. From here it looks like theory, practice, equipment, permission and enough capacity to use it properly.

Use bicycle language only when bicycle progression is the actual relevant next step.

If another mobility path is authoritative, adapt the line to the real path.

## 11.3 Operations / Dispatch

Primary characters:

- Elena;
- Irina when `fact:met:irina-pavel` or another legitimate introduction condition exists;
- Ana.

Irina line ID:

`line:irina:act2-specialization:dispatch-gap`

Base copy:

> Seeing the route is not the same as being trusted to shape it. Learn the operation first. Authority comes from somewhere real.

## 11.4 Production / Technical / Warehouse

Primary characters:

- Daria;
- Elena.

Daria line ID:

`line:daria:act2-specialization:production-gap`

Base copy:

> Closer to the cause means closer to the rules. Stock, handling, tools and facilities all stop being background once you are responsible for them.

## 11.5 Professional Employee Leadership

Primary characters:

- Ana;
- Victor when legitimate professional context exists.

Ana line ID:

`line:ana:act2-specialization:leadership-gap`

Base copy:

> Leadership is not the moment somebody gives you a louder title. It starts when the employer can trust you with responsibility that actually exists.

No promotion is implied.

---

# 12. Session Two — What the Next Step Costs

Session ID:

`session:braila:act2:specialization:what-the-next-step-costs`

Authored ref:

`story:braila:act2:specialization:what-the-next-step-costs`

Primary function:

**EVIDENCE -> COST**

The player now knows at least one real gap.

This session asks whether closing that gap is currently worth the real tradeoff.

## 12.1 Real Competing Use

Beat ID:

`beat:braila:act2:specialization:what-the-next-step-costs:real-competing-use`

At least two legitimate uses of a constrained resource must exist before a choice is presented.

Possible constrained resources include:

- time;
- Work Capacity;
- Personal Money;
- current shift availability;
- access to a training/practice opportunity;
- an existing work commitment;
- recovery obligations.

Narrative must not create a fake second option simply to make a menu look meaningful.

## 12.2 Canonical Allocation Choice

Choice ID:

`choice:braila:act2:specialization:next-step-allocation`

Canonical semantic option IDs:

- `protect-stability`;
- `invest-in-capability`;
- `keep-working-and-reassess`;
- `accept-qualified-responsibility`.

Runtime must present only options that are genuinely legitimate in current authoritative state.

This is not required to be a four-button UI.

## 12.3 Protect Stability

Meaning:

The player protects an existing financial, capacity, housing, recovery or work commitment rather than taking the development step now.

Persistent fact for the first such material decision:

`fact:braila:act2:specialization:allocation:first:protect-stability`

This is not cowardice and does not reduce a hidden ambition score.

## 12.4 Invest in Capability

Meaning:

The player chooses a legitimate system-owned training, practice, qualification, equipment or other requirement step that they can actually pursue.

Persistent fact:

`fact:braila:act2:specialization:allocation:first:invest-in-capability`

Narrative does not complete the step.

## 12.5 Keep Working and Reassess

Meaning:

The player continues legitimate current work while waiting for better timing, funds, capacity, availability or information.

Persistent fact:

`fact:braila:act2:specialization:allocation:first:keep-working-and-reassess`

This may be a stability decision even when the player remains interested in a specialization.

## 12.6 Accept Qualified Responsibility

Meaning:

A legitimate higher-responsibility opportunity already exists and the player currently satisfies all required authority/capability conditions to accept it.

Persistent fact:

`fact:braila:act2:specialization:allocation:first:accept-qualified-responsibility`

This option must not appear from narrative desire alone.

## 12.7 No Fake Sacrifice

Beat ID:

`beat:braila:act2:specialization:what-the-next-step-costs:no-fake-sacrifice`

Radu line ID:

`line:radu:act2-specialization:no-fake-sacrifice`

Base copy:

> If nothing real is competing for the same time, money or energy, then it is not a hard choice. It is just a speech about one.

Persistent fact:

`fact:braila:act2:specialization:principle:opportunity-cost-must-be-real`

---

# 13. Stability-First Continuation

Stability-first is a complete legitimate branch through this slice.

It must not feel like the player selected “do nothing.”

## 13.1 Stable / Housed Variant

When authoritative economy state is `Stable` and `Housed`, stability-first may mean deliberately continuing current work, preserving capacity or refusing a poorly timed development step.

Ana line ID:

`line:ana:act2-specialization:stable-is-still-a-choice`

Base copy:

> Stable does not mean finished. It means you have something worth protecting while you decide what comes next.

## 13.2 Insolvent Variant

When authoritative state is `Insolvent`, the story may acknowledge real arrears pressure without inventing shame or a shortcut.

Line ID:

`line:ana:act2-specialization:insolvent-priority`

Base copy:

> You can still have a future while money is tight. But pretending the arrears are not real will not make the next step cheaper.

## 13.3 Emergency Housing Variant

When authoritative housing is `EmergencyHousing`, the story must treat it as a bounded safety/recovery state, not a failure ending.

Line ID:

`line:ana:act2-specialization:emergency-housing-priority`

Base copy:

> Safety first. The career doors are still there. We do not need to lie about today to keep tomorrow open.

## 13.4 Recovering Variant

When authoritative financial status is `Recovering`, the story should respect that recovery is ongoing until the economy authority confirms Stable.

Line ID:

`line:elena:act2-specialization:recovering-is-progress`

Base copy:

> Recovery is already a process with requirements. Finish what has to become true. Then decide what else you want to add.

## 13.5 Stability Materiality Fact

When a real economy/work condition actually shapes the player’s decision:

`fact:braila:act2:specialization:materiality:first-confirmed:stability-first`

No hardship state is required for this fact if another real stability constraint is authoritative.

---

# 14. Session Three — Proof Before Permission

Session ID:

`session:braila:act2:specialization:proof-before-permission`

Authored ref:

`story:braila:act2:specialization:proof-before-permission`

Primary function:

**COST -> AUTHORITY UNDERSTANDING**

This session makes one of the project’s most important progression distinctions explicit:

> **Being capable, owning equipment and being authorized are different facts.**

## 14.1 Capability Is Not Access

Beat ID:

`beat:braila:act2:specialization:proof-before-permission:capability-is-not-access`

Elena line ID:

`line:elena:act2-specialization:capability-is-not-access`

Base copy:

> Evidence proves something about you. Access also depends on the work, the equipment, the employer, the place and the moment.

Persistent fact:

`fact:braila:act2:specialization:authority:capability-is-not-access-understood`

## 14.2 Equipment Is Not Qualification

Beat ID:

`beat:braila:act2:specialization:proof-before-permission:equipment-is-not-qualification`

Radu line ID:

`line:radu:act2-specialization:equipment-is-not-qualification`

Base copy:

> Buying the thing does not mean I know how to use it for work. I would rather learn that before the road teaches me the expensive way.

Use equipment language only when a real equipment requirement is relevant.

Persistent fact:

`fact:braila:act2:specialization:authority:equipment-is-not-qualification-understood`

## 14.3 Permission Is Not Capability

Beat ID:

`beat:braila:act2:specialization:proof-before-permission:permission-is-not-capability`

Ana line ID:

`line:ana:act2-specialization:permission-is-not-capability`

Base copy:

> Permission tells you what the employer is willing to let you do. It does not replace the evidence that you can do it.

Persistent fact:

`fact:braila:act2:specialization:authority:permission-is-not-capability-understood`

## 14.4 Current State Still Matters

Beat ID:

`beat:braila:act2:specialization:proof-before-permission:current-state-still-matters`

Even a capable and authorized player may be blocked by current real context such as:

- insufficient Work Capacity;
- no current shift availability;
- missing required equipment at this moment;
- unavailable facility;
- unavailable world access;
- unavailable cargo capability;
- another owned commitment.

Ana line ID:

`line:ana:act2-specialization:current-state-still-matters`

Base copy:

> Qualified yesterday does not mean available right now. Check the person, the work and the conditions together.

Persistent fact:

`fact:braila:act2:specialization:authority:intersection-first-understood`

---

# 15. Direction-Specific Proof / Permission Semantics

## 15.1 Field / Mobility

A valid mobility progression may reach several distinct states:

- interested but missing theory/practice;
- capability earned but no compatible equipment;
- capability/equipment present but employer authorization missing;
- all of the above present but current Work Capacity or shift availability blocks work;
- fully eligible for a real aligned activity.

The story should make these states feel different.

It must not collapse them into `LOCKED`.

## 15.2 Operations / Dispatch

Dispatch Operations capability evidence does not automatically create:

- an employer dispatch role;
- access to a dispatch station;
- route-authority permission;
- a promotion.

Irina line ID:

`line:irina:act2-specialization:dispatch-permission-boundary`

Base copy:

> Knowing how to reason about the route is one requirement. Being the person authorized to change it is another.

## 15.3 Production / Technical / Warehouse

Warehouse or technical capability does not create:

- facility access;
- workshop access;
- inventory authority;
- production control;
- employment.

Daria line ID:

`line:daria:act2-specialization:facility-boundary`

Base copy:

> Skill matters. So does the place you are allowed to use it, the tools that are actually there and the work that actually needs doing.

## 15.4 Professional Employee Leadership

Professional leadership remains bounded by actual employer systems.

If no real higher-responsibility opportunity exists, the correct narrative state is **not yet available**.

Ana line ID:

`line:ana:act2-specialization:leadership-not-yet`

Base copy:

> I can notice your judgment before there is a bigger role to give you. Recognition is real. A vacancy is a different fact.

This distinction must be preserved.

---

# 16. Session Four — Work That Fits

Session ID:

`session:braila:act2:specialization:work-that-fits`

Authored ref:

`story:braila:act2:specialization:work-that-fits`

Primary function:

**AUTHORITY UNDERSTANDING -> LEGITIMATE OPPORTUNITY / VALID WAIT**

This session does not guarantee a new job.

It tests whether the player can recognize what currently fits their real state.

## 16.1 Aligned Opportunity or Valid Wait

Beat ID:

`beat:braila:act2:specialization:work-that-fits:aligned-opportunity-or-valid-wait`

An aligned opportunity may be:

- a real training/practice opportunity;
- a supervised-experience opportunity;
- an eligible higher-responsibility work opportunity;
- legitimate current basic work that protects stability;
- a recovery opportunity;
- a real wait condition until a missing requirement changes.

Narrative must not create an opportunity just because the player chose a direction.

## 16.2 One More Real Boundary

Beat ID:

`beat:braila:act2:specialization:work-that-fits:one-more-real-boundary`

The first aligned opportunity should ideally reveal that progression remains contextual.

Examples:

- the player completed training but still needs employer permission;
- permission exists but equipment is absent;
- capability and equipment exist but Work Capacity is depleted;
- the player is fully eligible, but an existing commitment makes taking the opportunity irresponsible;
- the player remains stability-first because a real recovery obligation still matters.

The story should never add an arbitrary extra blocker after all real requirements are met.

## 16.3 Canonical Opportunity Response Choice

Choice ID:

`choice:braila:act2:specialization:aligned-opportunity-response`

Canonical semantic option IDs:

- `take-eligible-opportunity`;
- `protect-existing-commitment`;
- `request-authorized-support`;
- `decline-not-ready`;
- `continue-stability-first`.

Only legitimate options may be presented.

## 16.4 Take Eligible Opportunity

Meaning:

The source systems prove the player is eligible and the opportunity is real.

Persistent fact:

`fact:braila:act2:specialization:opportunity:first-response:take-eligible-opportunity`

Narrative does not settle the work itself.

## 16.5 Protect Existing Commitment

Meaning:

The player declines or postpones the aligned opportunity because an already accepted responsibility legitimately has priority.

Persistent fact:

`fact:braila:act2:specialization:opportunity:first-response:protect-existing-commitment`

No moral penalty.

## 16.6 Request Authorized Support

Meaning:

The player escalates through a real employer/operations channel rather than pretending capacity or authority exists.

Persistent fact:

`fact:braila:act2:specialization:opportunity:first-response:request-authorized-support`

## 16.7 Decline Not Ready

Meaning:

The player recognizes that one or more real requirements are not yet satisfied.

Persistent fact:

`fact:braila:act2:specialization:opportunity:first-response:decline-not-ready`

This is professional judgment, not failure.

## 16.8 Continue Stability-First

Meaning:

The player deliberately continues legitimate stability/recovery/current-work priorities rather than accelerating specialization.

Persistent fact:

`fact:braila:act2:specialization:opportunity:first-response:continue-stability-first`

---

# 17. Material Outcome Classification

This slice uses semantic outcome classes to describe what became true.

They do not mutate capability, money or employment.

## 17.1 READY_AND_USED

Meaning:

A real aligned opportunity existed, the player was legitimately eligible, and the owning system confirms the opportunity was used/completed sufficiently for narrative acknowledgment.

Persistent fact:

`fact:braila:act2:specialization:outcome:ready-and-used`

## 17.2 READY_BUT_DEFERRED

Meaning:

The player was legitimately ready for an aligned opportunity but chose to protect another valid priority.

Persistent fact:

`fact:braila:act2:specialization:outcome:ready-but-deferred`

## 17.3 NOT_YET_ELIGIBLE

Meaning:

At least one real requirement still blocks the aligned opportunity.

Persistent fact:

`fact:braila:act2:specialization:outcome:not-yet-eligible`

This is not mission failure.

## 17.4 STABILITY_PRIORITIZED

Meaning:

A real economy/work/recovery condition made stability the chosen material priority during this slice.

Persistent fact:

`fact:braila:act2:specialization:outcome:stability-prioritized`

## 17.5 RECOVERED_AFTER_MISTAKE

Meaning:

A real specialization-linked attempt or responsibility produced a failure/mistake, then authoritative recovery occurred during the slice.

Persistent fact:

`fact:braila:act2:specialization:outcome:recovered-after-mistake`

## 17.6 UNRESOLVED_MISTAKE

Meaning:

A real specialization-linked mistake remains unresolved at the end of the slice.

Persistent fact:

`fact:braila:act2:specialization:outcome:unresolved-mistake`

The story continues.

## 17.7 Classification Rule

The runtime may need more than one semantic fact when different dimensions coexist.

For example, the player may be `NOT_YET_ELIGIBLE` for bicycle work while simultaneously having `STABILITY_PRIORITIZED` as the chosen response.

Do not force mutually exclusive outcome modeling when the real states are orthogonal.

---

# 18. Recoverable Mistake Contract

## 18.1 Valid Specialization-Linked Mistakes

Only authoritative events may create mistake history.

Examples include:

- failing a modeled practical/training attempt;
- accepting work that later fails through real mission rules;
- overcommitting Work Capacity when the owning system permits that mistake;
- using poor prioritization that causes a real customer/producer/employer consequence;
- reporting too late when a real reporting path exists;
- taking a development step and missing an already-owned responsibility.

## 18.2 Forbidden Fake Mistakes

Do not force:

- a bicycle crash because mobility was selected;
- a failed exam that no system models;
- a warehouse accident for drama;
- a dispatch mistake before the player has actual dispatch authority;
- a financial penalty from dialogue;
- a promotion loss from a narrative flag.

## 18.3 Recovery

Recovery may require real:

- additional practice;
- later successful work;
- reporting/escalation;
- capacity restoration;
- relationship repair through real outcomes;
- financial recovery;
- waiting for the next legitimate opportunity.

Recovery adds history.

It does not erase the original mistake.

## 18.4 Recovery Facts

- `fact:braila:act2:specialization:mistake:first-recorded`;
- `fact:braila:act2:specialization:mistake:first-recovered`;
- `fact:braila:act2:specialization:mistake:partial-recovery`;
- `fact:braila:act2:specialization:mistake:unresolved`.

---

# 19. Recurring Character Continuity

## 19.1 Ana Stoica — Responsibility Boundary

Character ID:

`ana-stoica`

Act II materiality role:

Ana distinguishes professional trust from employer authority.

She may acknowledge judgment, reliability and readiness to learn.

She must not manufacture:

- employer permission;
- promotion;
- Work Capacity;
- training completion;
- a role vacancy.

## 19.2 Elena Dobre — Evidence Interpreter

Character ID:

`elena-dobre`

Elena explains why a requirement exists and helps the player read the gap.

She does not grant evidence through dialogue.

Her narrative function is to make capability requirements understandable without trivializing them.

## 19.3 Radu Marin — Experiment Without Destiny

Character ID:

`radu-marin`

Radu may pursue mobility, technical work or another real path according to his own story.

He demonstrates that:

- one step can be useful even if it is not permanent;
- equipment has opportunity cost;
- training can be postponed;
- a failed attempt can be repeated when the system allows it.

He must not exist solely to validate the player’s choice.

## 19.4 Daria Iancu — Responsibility Near the Cause

Character ID:

`daria-iancu`

Daria connects production/warehouse/technical capability to real operational stakes.

She does not grant access to inventory, facilities or jobs.

## 19.5 Irina Pavel — Operations Authority, When Introduced

Character ID:

`irina-pavel`

Irina may deepen operations/dispatch materiality when a legitimate operations context exists.

If the player has not legitimately met her, do not force her into the slice.

## 19.6 Victor Lupu — Competent Alternative

Character ID:

`victor-lupu`

Victor may demonstrate a valid professional specialization path without entrepreneurship.

Victor line ID:

`line:victor:act2-specialization:professional-materiality`

Base copy:

> A title is cheap. The expensive part is becoming the person who can still do the work when the easy conditions disappear.

## 19.7 Mirela Stan — Customers See Outcomes, Not Career Menus

Character ID:

`mirela-stan`

Mirela should react only to real service outcomes.

She does not care that the player clicked `field-mobility` or `operations-dispatch`.

This preserves the principle that specialization matters because behavior and capability change, not because the UI says so.

## 19.8 Petru Neagu — Continuity of Ordinary Life

Character ID:

`petru-neagu`

Petru may notice real routine/equipment/work changes when they are actually visible.

He remains a city relationship, not a progression tutorial.

---

# 20. Session Five — Choose Again

Session ID:

`session:braila:act2:specialization:choose-again`

Authored ref:

`story:braila:act2:specialization:choose-again`

Primary function:

**LEGITIMATE OPPORTUNITY / WAIT -> REASSESSMENT**

The player should leave this slice knowing more than they knew when they selected the initial priority.

The correct next focus may be the same.

It may also change.

## 20.1 What Changed

Beat ID:

`beat:braila:act2:specialization:choose-again:what-changed`

Narrative should summarize only real changes such as:

- a requirement became satisfied;
- a new blocker became visible;
- a training/practice attempt was completed or failed;
- equipment was actually acquired;
- employer permission actually changed;
- Work Capacity or financial state changed;
- a legitimate opportunity was used or deferred;
- a mistake was recovered or remains open.

Persistent fact:

`fact:braila:act2:specialization:reassessment:first-real-change-reviewed`

## 20.2 Initial Choice Remains History

Beat ID:

`beat:braila:act2:specialization:choose-again:initial-choice-remains-history`

Radu line ID:

`line:radu:act2-specialization:initial-choice-remains-history`

Base copy:

> The first choice told us what we knew then. Keeping it in history does not mean we have to keep pretending nothing changed.

## 20.3 Checkpoint Focus Choice

Choice ID:

`choice:braila:act2:specialization:checkpoint-one-focus`

Canonical semantic option IDs:

- `stability-first`;
- `field-mobility`;
- `operations-dispatch`;
- `production-technical-warehouse`;
- `professional-leadership`.

This is a new historical checkpoint.

It does not rewrite the Act II opening initial-priority fact.

## 20.4 Checkpoint Focus Facts

Exactly one checkpoint-one focus fact may be written when this choice is legitimately processed:

- `fact:braila:act2:specialization:checkpoint1-focus:stability-first`;
- `fact:braila:act2:specialization:checkpoint1-focus:field-mobility`;
- `fact:braila:act2:specialization:checkpoint1-focus:operations-dispatch`;
- `fact:braila:act2:specialization:checkpoint1-focus:production-technical-warehouse`;
- `fact:braila:act2:specialization:checkpoint1-focus:professional-leadership`.

Later slices may create later checkpoint facts.

Do not mutate this historical checkpoint in place.

## 20.5 Next Door Remains Earned

Beat ID:

`beat:braila:act2:specialization:choose-again:next-door-remains-earned`

Elena line ID:

`line:elena:act2-specialization:next-door-remains-earned`

Base copy:

> Keep the direction if it still fits. Change it if the evidence changed your mind. Either way, the next door opens because its requirements become true, not because we agreed to call it your path.

Closing reflection line ID:

`line:act2-specialization:closing-reflection`

Base copy:

> A direction stopped being an idea when it started costing me something real. Now I know what I am actually choosing.

Persistent fact:

`fact:braila:act2:specialization-materiality:completed`

---

# 21. Persistent Narrative Fact Registry

## 21.1 Entry / Priority Processing

- `fact:braila:act2:specialization:initial-priority-processed:stability-first`;
- `fact:braila:act2:specialization:initial-priority-processed:field-mobility`;
- `fact:braila:act2:specialization:initial-priority-processed:operations-dispatch`;
- `fact:braila:act2:specialization:initial-priority-processed:production-technical-warehouse`;
- `fact:braila:act2:specialization:initial-priority-processed:professional-leadership`.

Exactly one should correspond to the consumed initial-priority history.

## 21.2 Gap / Principle Facts

- `fact:braila:act2:specialization:career-focus:change-remains-legitimate`;
- `fact:braila:act2:specialization:gap:first-authoritative-gap-read`;
- `fact:braila:act2:specialization:principle:title-is-not-permission`;
- `fact:braila:act2:specialization:principle:opportunity-cost-must-be-real`.

## 21.3 Materiality Facts

- `fact:braila:act2:specialization:materiality:first-confirmed:stability-first`;
- `fact:braila:act2:specialization:materiality:first-confirmed:field-mobility`;
- `fact:braila:act2:specialization:materiality:first-confirmed:operations-dispatch`;
- `fact:braila:act2:specialization:materiality:first-confirmed:production-technical-warehouse`;
- `fact:braila:act2:specialization:materiality:first-confirmed:professional-leadership`.

Materiality facts may coexist over time if the player legitimately explores more than one direction.

## 21.4 Allocation Facts

- `fact:braila:act2:specialization:allocation:first:protect-stability`;
- `fact:braila:act2:specialization:allocation:first:invest-in-capability`;
- `fact:braila:act2:specialization:allocation:first:keep-working-and-reassess`;
- `fact:braila:act2:specialization:allocation:first:accept-qualified-responsibility`.

The runtime should write only the first applicable processed allocation-history fact for this authored choice.

## 21.5 Authority-Understanding Facts

- `fact:braila:act2:specialization:authority:capability-is-not-access-understood`;
- `fact:braila:act2:specialization:authority:equipment-is-not-qualification-understood`;
- `fact:braila:act2:specialization:authority:permission-is-not-capability-understood`;
- `fact:braila:act2:specialization:authority:intersection-first-understood`.

## 21.6 Opportunity Response Facts

- `fact:braila:act2:specialization:opportunity:first-response:take-eligible-opportunity`;
- `fact:braila:act2:specialization:opportunity:first-response:protect-existing-commitment`;
- `fact:braila:act2:specialization:opportunity:first-response:request-authorized-support`;
- `fact:braila:act2:specialization:opportunity:first-response:decline-not-ready`;
- `fact:braila:act2:specialization:opportunity:first-response:continue-stability-first`.

## 21.7 Outcome Facts

- `fact:braila:act2:specialization:outcome:ready-and-used`;
- `fact:braila:act2:specialization:outcome:ready-but-deferred`;
- `fact:braila:act2:specialization:outcome:not-yet-eligible`;
- `fact:braila:act2:specialization:outcome:stability-prioritized`;
- `fact:braila:act2:specialization:outcome:recovered-after-mistake`;
- `fact:braila:act2:specialization:outcome:unresolved-mistake`.

These are semantic dimensions and are not necessarily mutually exclusive.

## 21.8 Mistake / Recovery Facts

- `fact:braila:act2:specialization:mistake:first-recorded`;
- `fact:braila:act2:specialization:mistake:first-recovered`;
- `fact:braila:act2:specialization:mistake:partial-recovery`;
- `fact:braila:act2:specialization:mistake:unresolved`.

## 21.9 Reassessment / Checkpoint Facts

- `fact:braila:act2:specialization:reassessment:first-real-change-reviewed`;
- `fact:braila:act2:specialization:checkpoint1-focus:stability-first`;
- `fact:braila:act2:specialization:checkpoint1-focus:field-mobility`;
- `fact:braila:act2:specialization:checkpoint1-focus:operations-dispatch`;
- `fact:braila:act2:specialization:checkpoint1-focus:production-technical-warehouse`;
- `fact:braila:act2:specialization:checkpoint1-focus:professional-leadership`;
- `fact:braila:act2:specialization-materiality:completed`.

---

# 22. Persistent Consequence Rules

## 22.1 World-Local Scope

All facts in this document are World Instance narrative history unless a future canonical authority explicitly says otherwise.

They must not become universal account history across divergent World Instances.

## 22.2 Earlier History Is Not Rewritten

The Act II opening initial-priority fact remains true as history even when checkpoint-one focus differs.

A failed attempt remains failed even after later recovery.

An unresolved blocker remains part of history even after it is later satisfied.

## 22.3 Narrative Facts Cannot Create Authority

Facts in this document cannot directly create or mutate:

- Personal Money;
- Company Money;
- wages;
- arrears;
- living-cost settlement;
- financial status;
- housing status;
- Work Capacity;
- capability evidence;
- theory completion;
- practical training;
- supervised experience;
- qualification;
- equipment;
- vehicles;
- employer permission;
- employment;
- promotion;
- inventory;
- cargo;
- orders;
- production;
- infrastructure;
- company ownership;
- geography.

## 22.4 No Universal Ambition Meter

Do not collapse the player’s choices into a hidden ambition score where specialization is always positive and stability is always negative.

The game should remember concrete choices and outcomes instead.

---

# 23. Visible Consequence Contract

This is a narrative/content PR only.

Any later visible implementation belongs to DT-10 / relevant presentation owners and remains subject to Android quality governance.

## 23.1 Valid Visible Consequences

Presentation may show only system-confirmed changes such as:

- a bicycle or other equipment that was actually acquired;
- a real training/work-access surface becoming available;
- the player legitimately appearing in a different work context after access exists;
- a real workshop/facility becoming accessible through owning systems;
- an actual hardship/recovery state being represented truthfully;
- changed customer/employer/producer outcomes produced by real work;
- a real competitor taking work the player deferred.

## 23.2 Forbidden Visible Consequences

Do not show:

- a bicycle because the player chose mobility;
- a dispatch desk because operations was selected;
- a workshop badge because technical work was selected;
- a supervisor uniform because leadership was selected;
- a richer home because stability-first was selected;
- a congratulatory promotion from dialogue;
- a fake training certificate;
- a magically recovered bank balance;
- a new company because the slice completed.

## 23.3 Visible Materiality Fact

When a real system-confirmed material change associated with this slice is truthfully presented:

`fact:braila:act2:specialization:visible-material-change:confirmed`

This fact records presentation only.

It does not create the change.

---

# 24. DT-09 Mission Materialization Contract

DT-09 may materialize this slice only through real authority bindings.

## 24.1 Required Binding Families

The mission/content adapter should be able to receive or resolve opaque authoritative references for applicable dimensions including:

- Act II opening completion;
- initial-priority history;
- current profession history when relevant;
- selected capability/profession information target;
- capability acquisition requirement evaluation;
- work-access requirement evaluation;
- player-readable blocker messages;
- Personal Money sufficiency when a real modeled cost exists;
- financial status and housing status when relevant;
- arrears/recovery status when relevant;
- Work Capacity sufficiency;
- current-shift availability;
- equipment/vehicle facts;
- employer permission;
- employment status;
- facility/infrastructure availability;
- training/practice/supervised-experience opportunity references;
- real aligned work opportunity references;
- existing accepted-work commitments;
- settlement/completion evidence owned by external domains;
- real failure/recovery evidence;
- visible-consequence evidence when later presentation is implemented.

DT-08 does not define the TypeScript interface.

## 24.2 Materialization Rule

DT-09 should never implement:

`priority selected -> spawn career mission -> grant reward`

Preferred structure:

`historical priority -> real authority read -> meaningful gap/cost -> legitimate opportunity or valid wait -> system-owned outcome -> narrative memory`

## 24.3 No Second Capability Engine

DT-09 must not duplicate requirement logic in mission code.

Mission availability should read capability/work-access authority rather than restating its own qualification tree.

## 24.4 No Second Economy

DT-09 must not create narrative-only money costs, wages, arrears, Work Capacity or recovery transactions.

## 24.5 Exactly-Once Narrative Intent

When mission runtime emits semantic consequences for facts in this document, it should preserve the Mission Framework’s existing exactly-once/replay-safe consequence semantics.

Narrative facts must not duplicate on resume/replay.

---

# 25. DT-06 Personal Capability Handoff

DT-06 owns:

- capability definitions;
- theory/practical/supervised/qualification requirements;
- profession identity/history runtime;
- work-access evaluation;
- blocker classification/messages;
- capability-versus-equipment/employer/world/current-state intersection.

DT-08 owns only narrative meaning around those facts.

If capability requirements change canonically later, narrative should bind to the updated authority rather than preserve stale hardcoded requirements merely because this document gave examples.

---

# 26. DT-03 Player Economy Handoff

DT-03 owns:

- Personal Money;
- employer treasury;
- wages;
- productive-work settlement;
- living costs;
- arrears;
- `Stable` / `Insolvent` / `Recovering` financial state;
- `Housed` / `EmergencyHousing` state;
- Work Capacity mutation;
- hardship recovery.

DT-08 may contextualize these states.

DT-08 may not manufacture them.

---

# 27. DT-07 Production / Supply Handoff

If production/warehouse/technical specialization later intersects real producer work, DT-07 remains authoritative for:

- producer need;
- inventory;
- reservations;
- consumption/next-demand causality;
- systemic producer opportunities;
- physical recovery semantics.

A Daria scene cannot create a producer shortage or warehouse job.

---

# 28. Leadership-Specific Guardrail

Professional employee leadership is intentionally preserved as a complete future even though current profession/runtime catalogs do not expose a canonical `ProfessionalLeader` profession ID.

Therefore:

- do not invent such an ID in narrative or mission code;
- do not map `direction:professional-leadership` to `Entrepreneur`;
- do not interpret management as ownership;
- do not require company formation to progress this direction;
- do not manufacture a promotion to make the branch feel complete;
- do allow real employer responsibility/experience/role systems to materialize it later.

The player may remain an employee for the entire career arc and still achieve substantial responsibility, status, expertise and legacy.

---

# 29. Founder / Entrepreneur Boundary

The merged profession catalog contains `Entrepreneur` and `Entrepreneurship` capability concepts.

This document does not delete or devalue them.

They are simply outside the required focus of this bounded slice.

Founder/entrepreneur progression remains optional later and must continue to respect company-formation governance.

The story must not quietly reinterpret any of these as entrepreneurship prerequisites:

- field / mobility;
- operations / dispatch;
- production / technical / warehouse;
- professional employee leadership;
- stability-first.

---

# 30. Brăila Narrative Anchors

The slice remains grounded in Brăila without inventing street geometry.

## Station Commons

Narrative function:

Employer authority, work availability, capacity, dispatch horizon and professional boundaries.

Primary characters:

- Ana;
- Radu;
- Irina when legitimate.

## Foundry Quarter

Narrative function:

Production/warehouse/technical responsibility becomes materially legible when real systems support it.

Primary character:

- Daria.

## Brăila Commerce

Narrative function:

Customers reveal whether specialization actually improves or changes real service outcomes.

Primary character:

- Mirela.

## Old Town

Narrative function:

Ordinary-life continuity and reminder that progression exists inside a city of people, not inside a career menu.

Primary character:

- Petru.

## Geographic Rule

No street, address, workshop or facility is created by this document.

Runtime binds narrative to source-backed world authority.

---

# 31. Acceptance Contract

A later implementation is compliant with this narrative slice only when all applicable rules hold.

## Priority / History

- Act II opening initial priority is consumed, not rewritten;
- focus switching remains legitimate;
- stability-first is not converted into a profession;
- professional leadership is not converted into entrepreneurship.

## Materiality

- at least one real blocker/requirement/cost/opportunity makes the direction materially meaningful;
- dialogue alone cannot satisfy materiality;
- no fake second option is invented to create drama;
- valid waiting can advance narrative understanding.

## Capability

- profession labels do not grant capability;
- capability does not automatically grant current work access;
- equipment does not replace qualification;
- employer permission does not replace capability;
- current Work Capacity / shift / equipment / world context can still matter.

## Economy

- narrative creates no money;
- narrative creates no Work Capacity;
- hardship is never used as a shame mechanic;
- Emergency Housing remains a safety/recovery state, not a career ending;
- stability-first can be valid in Stable, Insolvent or Recovering states when real conditions support the decision.

## Career Futures

- field/mobility remains complete;
- operations/dispatch remains complete;
- production/technical/warehouse remains complete;
- professional employee leadership remains complete;
- founder/CEO remains optional later.

## Opportunity / Recovery

- aligned opportunities come from real systems;
- `not yet eligible` is not mission failure;
- protecting an existing commitment is legitimate;
- mistakes occur only when authoritative systems record them;
- recovery adds history rather than erasing it.

## Persistence

- semantic facts are world-local;
- replay/resume must not duplicate consequence facts;
- checkpoint-one focus does not delete initial-priority history.

## Presentation

- visible changes require system-confirmed state;
- no fake equipment, promotion, money, facility access or career transformation is shown.

---

# 32. Ownership Boundary

After this document merges:

- **DT-08 Story Director** owns the authored meaning, IDs and consequence semantics in this document;
- **DT-09 Missions & Campaign** owns mission/runtime materialization and replay-safe mission consequences;
- **DT-06 Professions & Personal Capability** owns capability/profession/work-access truth;
- **DT-03 Player Economy** owns Personal Money, wages, living costs, hardship and Work Capacity;
- **DT-07 Production & Supply Chain** owns producer/inventory causality;
- **DT-02 World Persistence** owns durable Save storage;
- **DT-10 Characters & Dialogue / Visual Storytelling** owns later visible narrative presentation;
- **DT-01 / DT-05** retain their world visual/living-city authority boundaries.

No owner should duplicate another domain merely to make this slice trigger earlier.

---

# Final Canonical Principle

Act II becomes meaningful when ambition meets reality.

The player is free to want a different future, but wanting does not create qualification, equipment, permission, money, capacity or opportunity.

The game should respect the player enough to let **not yet**, **not this time**, **I need stability first**, and **I changed my mind** be real professional choices.

Specialization matters when the world finally asks the player to prove, protect or give up something real.

**A direction is not a destiny. It becomes a path only when the player starts paying its real cost.**
