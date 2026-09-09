# Document Information

Document: ACT_II_PORTABLE_RELATIONSHIP_CONSEQUENCE_CONTRACT.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical Narrative Content Contract
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-09
Parent Authority: `01_GameDesign/STORY_BIBLE.md`
Campaign Authority: `01_GameDesign/CAMPAIGN_STRUCTURE.md`
Act II Opening Authority: `01_GameDesign/ACT_II_OPENING_NARRATIVE_CONTRACT.md`
Act II Materiality Authority: `01_GameDesign/ACT_II_SPECIALIZATION_MATERIALITY_NARRATIVE_CONTRACT.md`
Global Start / Migration Requirement: #634

---

# DROPi Tycoon — Act II Portable Relationship / Consequence Narrative Contract

## Purpose

This document defines one bounded **Act II — Choices** narrative slice in which real specialization, stability, responsibility and recovery history changes how recurring characters respond to the player.

The slice is explicitly **location-portable**.

Brăila remains the premium authored reference implementation. Ana Stoica, Radu Marin, Mirela Stan, Petru Neagu, Daria Iancu, Elena Dobre, Victor Lupu, Irina Pavel and Mihai Enache remain valid Brăila canon.

They are not mandatory global NPCs.

The universal emotional structure must work in any governed playable locality that can supply legitimate local story bindings and legitimate work/economy/capability context.

The governing principle is:

> **People remember what the player actually did, not what a hidden relationship score says they are.**

A character may respond differently because the player:

- completed reliable work;
- failed and later recovered;
- left a consequence unresolved;
- respected an authority or capability boundary;
- accepted responsibility and followed through;
- protected financial/work stability;
- invested in a specialization through real evidence;
- changed focus after learning something real;
- relocated to another locality;
- later returned with the old history still intact.

Narrative does not create the underlying work, money, capability, relationship, promotion, locality or migration state.

This document defines:

- universal narrative-role identities;
- locality-specific cast binding rules;
- Brăila reference bindings;
- relationship-event semantic kinds;
- response-selection rules without numeric relationship authority;
- specialization/stability response parity;
- recoverable relationship consequences;
- migration and return semantics;
- persistent-history rules;
- DT-09 mission materialization hooks;
- DT-10 presentation handoff boundaries.

This document does **not** implement:

- mission runtime;
- dialogue UI;
- numeric relationship scores;
- friendship meters;
- reputation points;
- Personal Money or Company Money mutation;
- Work Capacity mutation;
- capability or qualification mutation;
- employer permission;
- employment or promotion state;
- company formation;
- locality identity storage;
- World Instance persistence schema;
- migration state transitions;
- inventory, cargo, orders or production state;
- Android presentation.

---

# 1. Universal Narrative Identity

## 1.1 Portable Template ID

Canonical portable template ID:

`template:act2:relationship-consequence:v1`

Display label:

**Act II — People Remember Patterns**

This template is not tied to Brăila.

A locality-specific implementation may materialize it through local authored content while preserving the universal role and consequence semantics in this document.

## 1.2 Universal Narrative Question

**What do people learn about me from the way I handle responsibility, pressure, limits and recovery?**

This question remains valid whether the player is:

- staying in the starter role;
- building stability;
- moving toward field/mobility work;
- moving toward operations/dispatch;
- moving toward production/technical/warehouse work;
- becoming a stronger professional employee leader;
- changing focus;
- relocating to another locality.

Founder/CEO progression is not required.

---

# 2. Universal Role Registry

The following IDs describe **narrative functions**, not globally fixed people.

- `role:dispatcher-mentor`
- `role:coworker-peer`
- `role:merchant-client`
- `role:household-customer`
- `role:producer-operator`
- `role:trainer-instructor`
- `role:professional-rival`
- `role:operations-planner`
- `role:institutional-contact`

A locality-specific cast may bind one or more of these roles to local characters.

A role definition never creates a character, job, company, business, customer, producer, school, facility or institution.

The locality/story content layer may omit a role when the locality does not yet have a legitimate authored/systemic context for it.

The story must wait, substitute another valid narrative function, or omit the beat rather than fabricate a false local entity.

## 2.1 Dispatcher / Mentor

Narrative function:

- interprets work expectations;
- notices professional patterns;
- challenges the player to distinguish ambition from readiness;
- can acknowledge responsible refusal or recovery;
- cannot grant promotion, capability or employer permission through dialogue.

## 2.2 Coworker / Peer

Narrative function:

- provides comparison without declaring one career superior;
- normalizes changing direction;
- can become a friendly competitor, collaborator or independent professional peer;
- cannot generate work or change wages.

## 2.3 Merchant / Client

Narrative function:

- makes service reliability human and concrete;
- may remember prior service quality;
- may discuss a real current need only if customer/order/demand authority supports it;
- cannot create an order merely because the story needs a merchant scene.

## 2.4 Household Customer

Narrative function:

- represents ordinary civic continuity;
- may notice familiarity, reliability, absence, return or recovery;
- does not become a universal quest giver.

## 2.5 Producer / Operator

Narrative function:

- connects downstream logistics to upstream production/warehouse/technical reality;
- may recognize genuine interest or evidence;
- cannot grant warehouse access, stock, tools, qualifications or a job.

## 2.6 Trainer / Instructor

Narrative function:

- interprets real requirements and evidence;
- distinguishes intention from qualification;
- recognizes attempts and recovery when capability authority confirms them;
- does not mint certificates or capabilities.

## 2.7 Professional Rival

Narrative function:

- demonstrates another competent path;
- can react to real competition, consistency or recovery;
- is not a mandatory villain;
- cannot steal opportunities through scripted cheating unless an owning systemic rule actually permits competition for them.

## 2.8 Operations Planner

Narrative function:

- interprets routing/capacity/coordination tradeoffs;
- may recognize sound boundary decisions;
- cannot create dispatch authority or promotion.

## 2.9 Institutional Contact

Narrative function:

- contextualizes later organizational, infrastructure or civic consequence;
- must not fabricate public authority, legal rights or real-world institutional claims.

---

# 3. Locality-Specific Cast Binding Contract

## 3.1 Binding Principle

A portable story beat resolves:

`universal narrative role -> current locality authored binding -> local character`

The current locality identity must come from the owning World/Locality authority.

DT-08 does not define or persist the runtime locality schema.

The story layer consumes an opaque governed locality identity and a compatible authored-content binding.

## 3.2 No Mandatory Brăila Fallback

If the player begins in or relocates to a supported locality without a Brăila-quality authored cast, the runtime must **not** silently substitute:

- Brăila;
- Ana Stoica;
- Radu Marin;
- Mirela Stan;
- any other Brăila NPC.

A missing local binding must fail closed at the content layer or use a separately governed generic/local template that does not fabricate factual local businesses, institutions or geography.

## 3.3 Binding Is Not Relationship Transfer

Two local characters may fulfill the same universal role without sharing relationship history.

Example:

- Ana Stoica may fulfill `role:dispatcher-mentor` in Brăila;
- a different authored dispatcher/mentor may fulfill the same role in another locality.

The new character does not inherit Ana's trust, disappointment, memory or promises merely because both occupy the same role.

## 3.4 One Character, Multiple Roles

A locality-specific story may bind multiple universal roles to one character only when explicitly authored and believable.

This must never be inferred automatically from sparse locality data.

## 3.5 One Role, Multiple Characters

A locality may have several characters capable of fulfilling a role.

Selection must come from authored/local systemic context rather than a global fixed-name assumption.

---

# 4. Brăila Premium Reference Binding

For Brăila, the canonical Story Bible cast remains a valid premium binding.

| Universal role | Brăila character | Character ID |
| --- | --- | --- |
| `role:dispatcher-mentor` | Ana Stoica | `ana-stoica` |
| `role:coworker-peer` | Radu Marin | `radu-marin` |
| `role:merchant-client` | Mirela Stan | `mirela-stan` |
| `role:household-customer` | Petru Neagu | `petru-neagu` |
| `role:producer-operator` | Daria Iancu | `daria-iancu` |
| `role:trainer-instructor` | Elena Dobre | `elena-dobre` |
| `role:professional-rival` | Victor Lupu | `victor-lupu` |
| `role:operations-planner` | Irina Pavel | `irina-pavel` |
| `role:institutional-contact` | Mihai Enache | `mihai-enache` |

This table is a **Brăila binding**, not a global cast registry.

A non-Brăila player must not meet these characters solely to satisfy the portable Act II template.

---

# 5. Portable Session Template

This bounded relationship/consequence slice uses five portable session functions.

- `session-template:act2:relationships:pattern-not-score`
- `session-template:act2:relationships:choice-becomes-visible`
- `session-template:act2:relationships:recovery-not-erasure`
- `session-template:act2:relationships:local-cast-not-global-cast`
- `session-template:act2:relationships:migration-carries-history`

Portable authored references:

- `story-template:act2:relationships:pattern-not-score`
- `story-template:act2:relationships:choice-becomes-visible`
- `story-template:act2:relationships:recovery-not-erasure`
- `story-template:act2:relationships:local-cast-not-global-cast`
- `story-template:act2:relationships:migration-carries-history`

These are template identities.

DT-09/local authored content may materialize locality-specific authored references through its existing stable registration mechanism.

This document does not prescribe a new mission ID or persistence schema.

---

# 6. Relationship Event Kind Registry

The relationship layer remembers **concrete semantic events**, not a numeric score.

Canonical event-kind IDs:

- `relationship-event:reliable-work-observed`
- `relationship-event:recovered-work-observed`
- `relationship-event:unresolved-failure-observed`
- `relationship-event:boundary-respected`
- `relationship-event:responsibility-followthrough-observed`
- `relationship-event:stability-priority-observed`
- `relationship-event:specialization-evidence-observed`
- `relationship-event:focus-change-observed`
- `relationship-event:departure-acknowledged`
- `relationship-event:return-acknowledged`
- `relationship-event:new-local-context`

These event kinds do not imply a storage implementation.

A materialized relationship-history record must remain scoped to the authoritative World Instance plus the actual character/locality and authoritative source event that justified it.

## 6.1 Reliable Work Observed

Use only when real work/mission settlement confirms a legitimate successful outcome relevant to the character.

It must not be written merely because the player selected a positive dialogue option.

## 6.2 Recovered Work Observed

Use only when a prior real failure/negative consequence was followed by a legitimate recovery event recognized by the owning system.

Recovery does not delete the prior failure.

## 6.3 Unresolved Failure Observed

Use only when the authoritative consequence remains unresolved.

It may change tone or caution.

It does not automatically create a permanent lockout.

## 6.4 Boundary Respected

Use when the player demonstrably refuses, redirects, escalates or requests support instead of pretending to have capability/permission they do not possess.

The source must be a real authored/systemic choice with authoritative boundary context.

## 6.5 Responsibility Followthrough Observed

Use when the player accepts legitimate responsibility and the owning work/mission system confirms followthrough.

It does not grant leadership status.

## 6.6 Stability Priority Observed

Use when `stability-first` or an equivalent current focus is materially supported by real Personal Economy/work/capacity state or a legitimate player allocation choice.

It does not create money, housing improvement or Work Capacity.

## 6.7 Specialization Evidence Observed

Use only when real capability/training/practical/equipment/permission/work evidence becomes true.

Interest alone is insufficient.

## 6.8 Focus Change Observed

Use when the player legitimately records a later career/specialization focus different from earlier history.

Changing focus is not a failure event.

## 6.9 Departure / Return

Use only when an owning relocation/migration authority confirms a real move or return.

Dialogue may not create the move.

---

# 7. Response Selection Without Scores

Characters may respond differently based on combinations of concrete history.

The story must not collapse those facts into:

- friendship points;
- trust percentage;
- hidden karma;
- universal reputation level;
- ambition score.

## 7.1 Response Modes

The following are **copy-selection modes**, not persistent relationship states:

- `response-mode:professional-confidence`
- `response-mode:cautious-professionalism`
- `response-mode:recovery-recognized`
- `response-mode:boundary-respected`
- `response-mode:new-local-context`
- `response-mode:history-remembered-after-return`

The runtime may choose a mode only from available narrative facts and current context.

It must not persist a numeric score merely to make selection easier.

## 7.2 Professional Confidence

May be used when one or more legitimate reliability/followthrough events are relevant to the current character/context.

It does not create employer authorization, promotion, access or better pay.

## 7.3 Cautious Professionalism

May be used when a relevant unresolved failure exists.

The tone may acknowledge uncertainty or require clarity.

The character should not become cruel or permanently hostile by default.

## 7.4 Recovery Recognized

May be used when a real recovery event exists after a real failure.

The character can recognize growth while remembering that the earlier failure happened.

## 7.5 Boundary Respected

May be used when the player acted responsibly by declining or escalating work outside current authority/capability.

The story must not frame every refusal as cowardice.

## 7.6 New Local Context

Used after migration/new-locality entry when the local character has no legitimate relationship history with the player.

The player's personal capabilities/history may still be real, but this new person does not automatically know them.

---

# 8. Specialization / Stability Choice Response Contract

The player’s current focus may change which characters have relevant things to say.

The focus does not create the relationship consequence by itself.

## 8.1 Stability-First

Characters may respond to stability-first as a legitimate professional/personal choice when real context supports it.

Valid narrative reactions include:

- mentor acknowledges responsible pacing;
- coworker treats continued starter work as a real path rather than a failure to advance;
- trainer leaves the development door open without pressure;
- merchant/customer may notice availability patterns only when actual work scheduling/service history supports them.

Forbidden reactions include:

- mocking the player for not becoming an entrepreneur;
- awarding money because the player chose stability;
- magically resolving arrears;
- improving housing through dialogue;
- reducing capability requirements.

## 8.2 Field / Mobility

Relevant characters may acknowledge real mobility evidence such as:

- completed training/practice;
- legitimate equipment acquisition;
- employer permission;
- real field work completed under the new access conditions.

They must not react as though the player is a bicycle/vehicle courier merely because `field-mobility` was selected.

## 8.3 Operations / Dispatch

Mentor, operations planner, coworker or rival may react to real dispatch theory/practice/responsibility evidence.

No character may create a dispatch desk, assignment, authority or promotion solely through dialogue.

## 8.4 Production / Technical / Warehouse

Producer/operator and trainer roles may react to real training, warehouse, facility or technical evidence.

Interest in Daria’s work, or an equivalent producer in another locality, does not create stock, facility access or a job.

## 8.5 Professional Employee Leadership

Mentor, coworker, rival and operations roles may respond to:

- reliable followthrough;
- sound escalation;
- supporting others within legitimate authority;
- responsibility accepted and completed;
- responsible refusal outside authority.

No response may create a supervisor title, management badge, promotion, ownership or salary change.

## 8.6 Focus Change

When later evidence changes the player’s preferred direction, recurring characters may acknowledge the shift.

The story should frame this as learning rather than inconsistency unless concrete harmful behavior exists.

Earlier priority facts remain true history.

---

# 9. Role-Specific Response Guidance

## 9.1 Dispatcher / Mentor

May notice:

- reliability;
- recovery;
- sound boundary decisions;
- responsibility followthrough;
- real specialization evidence;
- responsible stability-first choices.

Must not:

- grant system permission through approval;
- promote through dialogue;
- shame hardship;
- turn every path into entrepreneurship.

Portable base principles:

- after reliable work: **“I can give you context because you have shown you use it carefully.”**
- after recovery: **“The mistake still happened. So did the way you handled what came after.”**
- after a boundary-respecting refusal: **“Knowing when to ask for support is part of being reliable.”**
- after stability-first: **“Protecting the part of your life that keeps everything else standing is still a decision.”**

These are tone references, not mandatory exact lines.

## 9.2 Coworker / Peer

May notice:

- the player staying in familiar work;
- changing specializations;
- becoming more capable;
- taking or deferring real opportunities;
- relocation/absence/return when personally known.

Coworker response should preserve multiple valid futures.

No path is automatically “behind.”

## 9.3 Merchant / Client

May remember:

- clean service;
- recovered service;
- unresolved service failure;
- absence/return if the player previously served this merchant.

The merchant may share or reference a real current need only when demand/order authority confirms it.

No relationship fact creates demand.

## 9.4 Household Customer

May remember:

- familiarity;
- delivery/service continuity;
- a recovery after inconvenience;
- departure and later return.

The customer remains a person, not a career-gating NPC.

## 9.5 Producer / Operator

May respond to:

- real warehouse/technical/production evidence;
- responsible questions about requirements;
- recovery from a logistics consequence that actually affected production.

No relationship memory creates producer inventory, demand, tools or employment.

## 9.6 Trainer / Instructor

May respond differently to:

- stated interest with no evidence yet;
- real theory completion;
- practical attempt;
- failed attempt;
- later successful recovery;
- a focus change.

A failed attempt can produce constructive continuity rather than permanent exclusion.

## 9.7 Professional Rival

May respect:

- consistent legitimate work;
- a real recovery;
- clear boundaries;
- specialization evidence;
- professional focus changes backed by evidence.

The rival is not required to become friendly.

They are required to remain understandable.

---

# 10. Recovery Is Part of Relationship History

## 10.1 Failure Does Not Vanish

When a real failure occurs:

- preserve the failure history;
- allow character response to change appropriately;
- do not rewrite the original outcome after later recovery.

## 10.2 Recovery Requires a Real Event

A relationship cannot be repaired by selecting “sorry” unless an authored/systemic consequence specifically defines apology as part of a legitimate recovery path.

Preferred recovery inputs include:

- later successful work;
- corrected delivery/service;
- reporting/escalation;
- restored obligation;
- additional training/practice;
- responsible followthrough after a mistake.

## 10.3 Recovery Does Not Guarantee Reward

Recovery may restore cooperation or change tone.

It does not automatically create:

- money;
- promotion;
- access;
- equipment;
- qualification;
- new orders;
- relationship score increases.

## 10.4 No Permanent Soft-Lock From Ordinary Mistakes

Ordinary recoverable Act II mistakes should not permanently block the whole campaign.

If one local relationship becomes strained, the story should preserve legitimate future recovery or alternative progression where systems permit it.

---

# 11. Migration / Relocation Narrative Contract

## 11.1 Migration Changes Local Context, Not Personal History

When the owning World/Locality/Persistence authority confirms relocation:

- current locality changes through that authority;
- the local cast binding changes accordingly;
- prior relationship facts remain historical;
- personal capability/career history remains owned by personal progression systems;
- local employer permission/work access must be re-evaluated by owning systems.

Narrative does not teleport or relocate the player.

## 11.2 New Local Cast Does Not Inherit Old Trust

A new locality’s dispatcher/mentor does not inherit the player’s relationship with Ana Stoica or any other prior-locality mentor.

A same-role binding is not identity equivalence.

## 11.3 Prior Relationships Remain Real

Historical facts from prior localities remain part of the World Instance story history.

They may later matter when:

- the player returns;
- a legitimate communication system permits remote contact;
- a future institution/reputation system explicitly shares information;
- a later authored story references the old locality.

Absent such authority, prior characters do not become omniscient remote narrators.

## 11.4 Return to a Prior Locality

If the player legitimately returns:

- resolve the current locality through owning authority;
- restore the locality’s current authored cast binding;
- read preserved relationship history for the actual returning characters;
- allow “history remembered after return” copy where facts support it.

Do not reset the player to a first-meeting scene if durable history proves they already knew the character.

## 11.5 Departure Consequences

A departure may affect relationships only when a real relocation event exists.

Possible narrative meanings:

- a coworker notices absence;
- a merchant no longer expects the same local service pattern;
- a mentor acknowledges a move;
- a prior open consequence remains unresolved locally.

Narrative does not invent travel cost, housing change, employer transfer or legal permission.

## 11.6 Invalid / Missing Locality Binding

If current locality identity or authored binding is invalid/stale/missing:

- fail closed;
- do not silently use Brăila;
- do not silently reuse prior-locality cast;
- do not fabricate a local business or institution;
- surface a governed content-unavailable/wait state to the owning integration layer.

---

# 12. Portable Facts vs Brăila Facts

Existing Brăila narrative facts remain valid for Brăila history.

This document does not rename or rewrite them.

Examples include the already-canonical Act II opening/specialization facts under `fact:braila:*`.

For future non-Brăila implementations, do **not** reuse the literal `braila` namespace.

The portable story layer should bind semantic event kinds to the actual locality identity through the owning mission/story persistence mechanism.

DT-08 defines the semantic meaning.

DT-09/DT-02 own materialization/persistence mechanics according to their existing authority boundaries.

---

# 13. Exactly-Once / Persistence Semantics

Relationship history must be replay-safe.

A relationship consequence should be derived from or linked to a stable authoritative source event/receipt.

The same mission/work/recovery/migration event must not produce duplicate relationship-history consequences after:

- reload;
- mission resume;
- replay;
- reconnect;
- World Instance continuation.

The relationship layer does not create a second mutable ledger.

## 13.1 Required Identity Dimensions

A durable materialization must be able to distinguish, directly or through existing owning-domain identity:

- World Instance;
- actual locality;
- actual character;
- relationship-event kind;
- authoritative source event/receipt.

This document does not prescribe the storage shape.

## 13.2 World Instance Locality

Relationship history is World Instance history.

It must not silently leak between divergent World Instances on the same account.

---

# 14. DT-09 Mission Materialization Handoff

DT-09 may materialize this contract only through real authority bindings.

Preferred structure:

`authoritative player/locality history -> resolved local role binding -> real work/capability/economy/migration fact -> character response -> replay-safe narrative consequence`

Forbidden structure:

`choose dialogue -> add trust points -> unlock mission/reward`

## 14.1 Inputs DT-09 May Read

When available through owning ports:

- current governed locality identity;
- locality-specific cast binding;
- actual character identity;
- Act II initial/checkpoint focus history;
- real work/mission result;
- failure/recovery history;
- capability/training/equipment/permission evidence;
- Personal Economy hardship/stability facts;
- current accepted responsibility and completion evidence;
- relocation/migration event identity;
- prior local relationship-event history.

## 14.2 DT-09 Must Not Own

- locality identity;
- migration state;
- money;
- Work Capacity;
- capability;
- employer permission;
- promotion;
- relationship scores;
- production demand;
- visual presentation state.

---

# 15. DT-10 Visual / Dialogue Presentation Handoff

This PR adds no visible runtime behavior.

Future DT-10 presentation may select character copy/portrait/context only after authoritative narrative signals resolve:

- current locality;
- bound local character;
- relevant relationship event history;
- current response mode.

Presentation must not:

- display Ana globally in every locality;
- invent a local portrait/name without authored binding;
- show a friendship meter unless a separately governed relationship system is explicitly approved later;
- imply a promotion, qualification or money reward from character approval.

Any player-visible implementation remains subject to Android owner acceptance rules.

---

# 16. Brăila Examples — Reference Only

These examples demonstrate the portable rules through Brăila canon.

They are not global dependencies.

## 16.1 Ana — Reliability vs Recovery

If real Act II history proves reliable responsibility followthrough:

Ana may use a more direct/professional-confidence tone.

If a real failure remains unresolved:

Ana may use cautious professionalism.

If the player later legitimately recovers:

Ana may recognize the recovery while remembering the failure.

None of these responses grants promotion or permission.

## 16.2 Radu — Focus Change

If the player begins with field/mobility and later changes to technical/warehouse after real evidence changes their mind, Radu may normalize the transition.

The initial choice remains history.

## 16.3 Mirela — Service Memory

If authoritative order/service history proves clean service, Mirela may recognize consistency.

If prior service failed but a later real repeat service recovered the consequence, Mirela may recognize that recovery.

She does not create a new order just to reward the relationship.

## 16.4 Daria — Technical Interest

Daria may respond differently after real warehouse/technical evidence exists.

She may also respect a player who says “not yet” when capability or permission is missing.

She cannot grant warehouse access through approval.

## 16.5 Elena — Failed Attempt and Return

If capability authority records a failed practical/training attempt and a later legitimate success, Elena may acknowledge the learning arc.

The earlier failure remains part of history.

---

# 17. Non-Brăila Example — Portable Shape Only

Suppose a player starts in another governed playable locality.

The portable story may resolve:

- a local dispatcher/mentor;
- a local coworker;
- a local merchant/client;
- a local trainer;
- other roles only when legitimate local content exists.

The story then uses the same universal relationship-event semantics:

- reliable work observed;
- boundary respected;
- specialization evidence observed;
- stability priority observed;
- recovery observed.

No Brăila name, street, business, employer or geography is injected.

If the locality lacks a legitimate producer context, the producer beat waits or is omitted rather than inventing one.

---

# 18. Acceptance Criteria

This narrative contract is acceptable only if all of the following remain true:

- [ ] the universal emotional/career arc does not require Brăila;
- [ ] Ana/Radu/Mirela/etc. remain valid Brăila canon without becoming mandatory global NPCs;
- [ ] reusable role IDs exist for dispatcher/mentor, coworker, merchant, customer, producer, trainer and rival;
- [ ] locality-specific cast bindings are required before local characters are used;
- [ ] missing locality binding never silently falls back to Brăila;
- [ ] relationship consequences come from concrete authoritative history, not numeric relationship scores;
- [ ] stability-first can produce respectful, meaningful character responses;
- [ ] specialization choices do not count as evidence by themselves;
- [ ] failures remain history after recovery;
- [ ] recovery paths remain possible when owning systems provide legitimate opportunities;
- [ ] migration introduces a new local cast without transferring old trust automatically;
- [ ] prior relationship history survives migration in the World Instance;
- [ ] returning to a prior locality can recover prior character history;
- [ ] no money, capability, promotion, employer permission, mission runtime, locality or migration authority is created here;
- [ ] no fake local demand/business/institution is invented to satisfy a role;
- [ ] DT-09 can materialize the contract through existing exactly-once consequence semantics;
- [ ] DT-10 can later present it without owning the underlying state.

---

# 19. Canonical Closing Principle

> **A place supplies people; the player supplies history. Moving changes who is around them, but it does not erase who they have been.**

DROPi Tycoon should let a player begin in their own governed locality, build a genuinely local life, specialize or protect stability through real systems, form relationships through concrete actions, migrate later without losing history, and return to old places where people can remember what actually happened.

The world may change.

The cast may change.

The player’s past must remain causally real.