# Document Information

Document: ACT_I_CAPSTONE_A_CHAIN_OF_SMALL_THINGS.md
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

---

# DROPi Tycoon — Act I Capstone: A Chain of Small Things

## Purpose

This document defines the canonical Act I capstone for Brăila and the clean narrative transition into Act II.

The capstone is titled:

**A Chain of Small Things**

Its purpose is to prove that the player has progressed from completing isolated tasks to understanding and carrying responsibility inside a connected local economic system.

The capstone must feel larger than the first hour without becoming a disaster movie, a CEO origin story, a scripted fake shortage, or a sequence of unrelated errands.

It should make the player understand one central idea:

> A city does not fail or recover in one dramatic moment. It changes when many small dependencies either hold or break.

The capstone therefore links real, authoritative local needs across multiple Brăila actors and places.

It defines:

- stable capstone narrative IDs;
- stable beat IDs and mission-facing `authoredRef` values;
- a canonical interdependent-chain shape without hardcoding cargo;
- history intake from the first hour and early Act I;
- recurring-cast continuation;
- competing legitimate priorities;
- recoverable mistake semantics;
- consequence classifications;
- visible consequence rules aligned with **Your work leaves a mark**;
- first real specialization pressure;
- persistent semantic narrative facts;
- explicit DT-09 mission-materialization hooks;
- the narrative transition into Act II — Choices.

This document does **not** implement:

- mission runtime;
- mission state serialization;
- dialogue UI;
- economy mutation;
- wage values;
- inventory authority;
- producer simulation;
- order creation;
- cargo identity;
- Work Capacity accounting;
- capability or qualification grants;
- employment changes;
- company formation;
- map geometry;
- Android presentation.

Those authorities remain outside DT-08.

---

# 1. Canonical Identity

## 1.1 Arc ID

Canonical Act I capstone arc ID:

`arc:braila:act1:capstone`

Display label:

**Act I — Earning Trust: A Chain of Small Things**

Narrative question:

**Can people rely on me when one piece of work affects several others?**

## 1.2 Capstone Session ID

`session:braila:act1:capstone:a-chain-of-small-things`

## 1.3 Primary Authored Reference

`story:braila:act1:capstone:a-chain-of-small-things`

This is the stable umbrella `authoredRef` for the capstone.

DT-09 may materialize the capstone through one mission, several authored missions, or a hybrid authored/systemic sequence, but the semantic identity must remain stable.

## 1.4 Chain ID

Canonical semantic chain ID:

`chain:braila:act1:a-chain-of-small-things`

This ID identifies the authored relationship among authoritative producer, logistics, merchant, and downstream-service facts.

It does not identify cargo, an order, a parcel, a warehouse record, or a mission instance.

---

# 2. Stable Beat Registry

The capstone uses eight canonical beats.

| Beat ID | Display label | Narrative function |
| --- | --- | --- |
| `beat:braila:act1:capstone:the-chain-appears` | The Chain Appears | Several local facts become one causal situation |
| `beat:braila:act1:capstone:people-on-both-ends` | People on Both Ends | Make the upstream/downstream human stakes visible |
| `beat:braila:act1:capstone:what-do-you-protect` | What Do You Protect? | Present legitimate competing priorities |
| `beat:braila:act1:capstone:work-under-pressure` | Work Under Pressure | Player performs only real authorized work |
| `beat:braila:act1:capstone:recovery-is-still-work` | Recovery Is Still Work | Preserve mistakes and legitimate recovery |
| `beat:braila:act1:capstone:the-city-shows-the-result` | The City Shows the Result | Show only system-confirmed visible consequence |
| `beat:braila:act1:capstone:responsibility-with-a-name` | Responsibility With a Name | Recurring cast recognizes a pattern, not heroism |
| `beat:braila:act1:capstone:three-doors-forward` | Three Doors Forward | Transition into Act II without forcing a career |

---

# 3. Stable Mission-Facing Authored References

Each beat has a stable story identity.

- `story:braila:act1:capstone:the-chain-appears`
- `story:braila:act1:capstone:people-on-both-ends`
- `story:braila:act1:capstone:what-do-you-protect`
- `story:braila:act1:capstone:work-under-pressure`
- `story:braila:act1:capstone:recovery-is-still-work`
- `story:braila:act1:capstone:the-city-shows-the-result`
- `story:braila:act1:capstone:responsibility-with-a-name`
- `story:braila:act1:capstone:three-doors-forward`

These are narrative authored identities, not mission IDs.

DT-09 owns concrete mission IDs, stages, objectives, event processing, retries, completion receipts, resume semantics, and exactly-once consequence intent emission.

---

# 4. Entry Contract

The capstone should not appear merely because a timer elapsed.

## 4.1 Narrative Entry Evidence

Preferred narrative prerequisite:

`fact:braila:act1:early-sessions:completed`

The capstone may also read earlier facts individually when runtime has them.

## 4.2 Required Authoritative Situation

A real local causal chain must exist or be materializable from authoritative current-world facts.

At minimum, the implementation must be able to bind:

1. one real upstream producer/supply pressure or other causal source;
2. one real logistics movement or capacity responsibility;
3. one real downstream business/customer commitment affected by that movement;
4. one authoritative outcome signal that can prove whether the connected situation improved, partially improved, or remained unresolved.

The capstone must not invent these facts just to satisfy the story.

If the world cannot currently produce a valid connected chain, the capstone waits.

## 4.3 No Hardcoded Cargo Rule

Narrative does not canonize the item being moved.

The actual item may be packaging, a consumable, a component, finished stock, a document, or another valid light-cargo identity only if the authoritative order/inventory/producer systems say so.

The UI should display the authoritative item identity when available.

The story must never create a fake `capstone parcel` independent of real logistics state.

---

# 5. Canonical Interdependent Brăila Chain Shape

The capstone is one connected situation, not four errands.

The canonical authored shape is:

**real upstream pressure -> real movement/capacity need -> real downstream business dependency -> real human/service consequence**

The exact authoritative entities may vary by World Instance.

## 5.1 Upstream Anchor — Daria / Foundry Quarter

Primary recurring character:

`daria-iancu`

Narrative function:

Daria gives the upstream problem a human and operational face.

The source pressure may be one of the legitimate conditions already permitted by production/supply-chain authority, for example:

- required input below operational need;
- delayed inbound order;
- constrained storage;
- output waiting on a required real input;
- downstream commitment at risk because upstream flow is constrained.

Narrative does not choose which condition exists.

It reads the condition that authority provides.

## 5.2 Movement Anchor — Ana / Station Commons

Primary recurring character:

`ana-stoica`

Supporting character:

`radu-marin`

Narrative function:

Station Commons makes the middle of the chain legible: assignments, capacity, custody, schedule, responsibility, and reallocation.

The player should see that moving the right thing is not enough if the wrong commitment is protected, capacity is overbooked, or a problem is reported too late.

## 5.3 Downstream Business Anchor — Mirela / Brăila Commerce

Primary recurring character:

`mirela-stan`

Narrative function:

Mirela demonstrates that upstream pressure and logistics choices affect a business already known to the player.

Her involvement requires a real current downstream dependency or order/customer relationship.

Narrative must not create an artificial dependence merely because Mirela is a recurring character.

## 5.4 Human-Service Anchor — Petru / Old Town, When Authoritative

Primary recurring character:

`petru-neagu`

Petru may be the final human-service anchor only when a real household/service consequence can be tied to the authoritative chain.

If no valid downstream Petru interaction exists, do not fabricate one.

A different authoritative downstream recipient may satisfy the chain while Petru appears later as neighborhood memory rather than as fake mission cargo.

## 5.5 Competitive Anchor — Victor, Optional

Character:

`victor-lupu`

Victor may appear only when real competitive logistics context exists.

He may:

- serve a legitimate part of the market;
- protect one of his own commitments;
- win work fairly;
- cooperate on a shared constraint if system rules allow it;
- demonstrate that another professional can make a reasonable decision different from the player’s.

He must not sabotage the chain to manufacture drama.

---

# 6. History Intake — First Hour

The capstone may consume these merged first-hour facts without rewriting them:

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

These facts change tone, trust, and which authored variants are appropriate.

They do not create inventory, assignments, money, or access.

---

# 7. History Intake — Early Act I

The capstone may also consume:

- `fact:braila:act1:reliability-pattern:recognized`
- `fact:braila:act1:responsibility-principle:first-learned`
- `fact:braila:act1:early-responsibility:recognized`
- `fact:braila:act1:cross-district-recognition:first-achieved`
- `fact:braila:act1:supply-chain-causality:first-observed`
- `fact:braila:act1:foundry-pressure:stabilized`
- `fact:braila:act1:foundry-pressure:partially-recovered`
- `fact:braila:act1:foundry-pressure:unresolved`
- `fact:braila:act1:foundry-pressure:later-recovery`
- `fact:braila:act1:priority-choice:finish-owned-commitment`
- `fact:braila:act1:priority-choice:request-dispatch-reallocation`
- `fact:braila:act1:priority-choice:accept-authorized-assist`
- `fact:braila:act1:overcommitment:first-recovered`
- `fact:braila:act1:specialization-horizon:opened`
- `fact:mirela:relationship:first-failure-repaired`
- `fact:met:daria-iancu`
- `fact:met:elena-dobre`
- `fact:met:victor-lupu`
- `fact:braila:act1:early-sessions:completed`

History modifies context.

History does not guarantee success.

---

# 8. Earlier Consequences Must Matter

## 8.1 Mirela

### Earlier clean history

If the first service and repeat history were clean, Mirela begins the capstone with cautious operational trust and higher expectations.

Base line ID:

`line:mirela:act1-capstone:history-clean`

Base copy:

> I know you can do clean work. That is why I am telling you what this delay actually affects instead of just asking where the parcel is.

### Earlier recovered history

If the first service was recovered, Mirela acknowledges improvement but watches whether pressure causes old mistakes to return.

Line ID:

`line:mirela:act1-capstone:history-recovered`

Base copy:

> We already learned what happens when a small delay grows teeth. If something changes this time, I want the truth early.

The final clause is used only when a real communication/reporting path exists.

### Earlier failed but unrepaired history

If durable first-service failure remains unrepaired, Mirela is professionally skeptical.

Line ID:

`line:mirela:act1-capstone:history-failed`

Base copy:

> I remember the first bad run. I am not asking for a promise. I am asking whether this chain can actually hold today.

Her involvement does not mean she has forgiven the player.

### Earlier failure repaired

If `fact:mirela:relationship:first-failure-repaired` exists, the capstone may acknowledge that earned repair.

Line ID:

`line:mirela:act1-capstone:history-repaired`

Base copy:

> You fixed the pattern, not the past. That matters more to me than pretending the first mistake never happened.

## 8.2 Radu

Earlier assistance or workload boundaries influence peer context.

If the player previously helped through dispatch, Radu may trust coordination but must not assume the player will always absorb extra work.

If the player protected an existing commitment, Radu should treat that as legitimate professional judgment.

If an overcommitment was later recovered, Radu may reference the lesson without humiliation.

Line ID:

`line:radu:act1-capstone:capacity-memory`

Base copy:

> We already learned that two promises do not become possible just because both matter. Let’s make the work fit the people this time.

## 8.3 Daria

Earlier Foundry pressure changes Daria’s posture.

If stabilized:

She sees the player as somebody who has observed one real supply-chain problem before.

If partially recovered:

She expects the player to understand that a problem can be improved without being erased.

If unresolved:

The capstone may become a legitimate continuation only when current authority shows the chain still matters.

If later recovered:

Daria may explicitly distinguish recovery from invulnerability.

Line ID:

`line:daria:act1-capstone:history-memory`

Base copy:

> Last time you saw one weak link. Today the important part is seeing what that link is connected to.

---

# 9. Beat One — The Chain Appears

Beat ID:

`beat:braila:act1:capstone:the-chain-appears`

Authored ref:

`story:braila:act1:capstone:the-chain-appears`

## 9.1 Required Authority

The beat may activate only when DT-09 can bind a verified chain-evidence reference supplied by authoritative systems.

The chain evidence must prove that at least two distinct economic/logistics edges are causally related.

Examples of valid edge relationships include:

- producer input -> producer output availability;
- producer output -> merchant stock/order fulfillment;
- merchant stock/order -> downstream customer commitment;
- logistics capacity -> ability to protect one of the above commitments.

## 9.2 Daria Line

Line ID:

`line:daria:act1-capstone:chain-appears`

Base copy:

> Nothing here is one job anymore. One input affects one output. One output affects one order. One order affects somebody who has already made another promise.

## 9.3 Ana Line

Line ID:

`line:ana:act1-capstone:chain-appears`

Base copy:

> Do not treat this like three urgent icons. Find the dependency. Then decide what actually protects the chain.

## 9.4 Persistent Fact

After the player legitimately receives/observes the connected authority context:

`fact:braila:act1:capstone:chain:first-recognized`

This fact means the player has encountered the authored connected situation.

It does not mean they solved it.

---

# 10. Beat Two — People on Both Ends

Beat ID:

`beat:braila:act1:capstone:people-on-both-ends`

Authored ref:

`story:braila:act1:capstone:people-on-both-ends`

Narrative function:

Translate causal state into human stakes without replacing the state.

## 10.1 Daria Upstream Stake

Daria explains what the authoritative producer pressure means operationally.

She must reference the real current context when available.

She does not claim the factory will close forever unless an authoritative system actually supports such a consequence.

## 10.2 Mirela Downstream Stake

Mirela explains what the actual downstream dependency means for her current business commitments.

Line ID:

`line:mirela:act1-capstone:downstream-stake`

Base copy:

> My problem is not that I like having stock on a shelf. My problem is that somebody else is waiting on what I said I could provide.

## 10.3 Petru or Other Recipient

If a real household/service dependency is linked to the chain, Petru or another legitimate recipient can make the final edge visible.

Petru line ID:

`line:petru:act1-capstone:downstream-stake`

Base copy:

> To you it may be the last stop. To me it is the thing I planned the rest of my day around.

If Petru is not truly linked to the chain, do not use this line.

## 10.4 Persistent Fact

`fact:braila:act1:capstone:human-dependency:first-understood`

This is semantic memory of the authored beat.

It must follow real chain evidence.

---

# 11. Beat Three — What Do You Protect?

Beat ID:

`beat:braila:act1:capstone:what-do-you-protect`

Authored ref:

`story:braila:act1:capstone:what-do-you-protect`

The capstone must create pressure through legitimate competing priorities.

It must not create a morality puzzle where one obviously good button exists.

## 11.1 Canonical Choice ID

`choice:braila:act1:capstone:responsibility-priority`

## 11.2 Canonical Option IDs

- `protect-existing-commitment`
- `protect-chain-bottleneck`
- `coordinate-reallocation`

Runtime exposes only options that are actually valid in current authoritative state.

The choice may therefore appear as two options, three options, or no explicit choice if only one legitimate action exists.

## 11.3 Option — protect-existing-commitment

Meaning:

The player protects work they already accepted rather than abandoning it to chase a newly visible problem.

This is a legitimate responsibility-first choice.

Persistent fact:

`fact:braila:act1:capstone:priority:protect-existing-commitment`

No moral penalty is canonical.

## 11.4 Option — protect-chain-bottleneck

Meaning:

The player takes an authorized action aimed at the verified chain-critical bottleneck when capability, employer permission, Work Capacity, time, and job authority allow it.

Persistent fact:

`fact:braila:act1:capstone:priority:protect-chain-bottleneck`

This option cannot appear merely because narrative labels something `critical`.

The runtime must have authoritative evidence.

## 11.5 Option — coordinate-reallocation

Meaning:

The player reports the situation and uses real dispatch/organizational authority to move work among eligible people instead of personally carrying every task.

Persistent fact:

`fact:braila:act1:capstone:priority:coordinate-reallocation`

This option is available only when real reallocation support exists.

## 11.6 Ana Principle Line

Line ID:

`line:ana:act1-capstone:priority-principle`

Base copy:

> Responsibility is not choosing the loudest problem. It is knowing which promise breaks next if nobody acts.

---

# 12. First Real Specialization Pressure

The capstone should make specialization matter operationally for the first time.

It still must not grant a profession.

## 12.1 Specialization Pressure Principle

Different people may be capable of protecting different parts of the chain.

The player should begin to feel that future capability choices affect which problems they can personally solve.

## 12.2 Field Reliability / Mobility Signal

Stable signal ID:

`specialization-signal:act1-capstone:field-mobility`

Meaning:

The player sees value in faster/wider field access, route reliability, or legitimate transport progression.

This does not grant bicycle or vehicle capability.

## 12.3 Operations / Dispatch Signal

Stable signal ID:

`specialization-signal:act1-capstone:operations-dispatch`

Meaning:

The player sees that coordinating several valid workers/commitments may protect more of the chain than personally carrying one additional parcel.

This does not grant dispatcher authority.

## 12.4 Production / Technical / Warehouse Signal

Stable signal ID:

`specialization-signal:act1-capstone:production-technical-warehouse`

Meaning:

The player sees that upstream production, storage, handling, maintenance, and technical capability can matter before last-mile work begins.

This does not grant production, maintenance, warehouse, or technical capability.

## 12.5 Optional Professional Leadership Signal

Stable signal ID:

`specialization-signal:act1-capstone:professional-leadership`

Meaning:

The player sees a future where responsibility can grow inside employment through judgment, coordination, mentorship, or management.

This is explicitly not a company-ownership signal.

## 12.6 Signal Fact Rule

Narrative may record that a signal was meaningfully presented:

- `fact:braila:act1:capstone:specialization-signal:field-mobility`
- `fact:braila:act1:capstone:specialization-signal:operations-dispatch`
- `fact:braila:act1:capstone:specialization-signal:production-technical-warehouse`
- `fact:braila:act1:capstone:specialization-signal:professional-leadership`

Several may coexist.

None means a profession was selected.

---

# 13. Beat Four — Work Under Pressure

Beat ID:

`beat:braila:act1:capstone:work-under-pressure`

Authored ref:

`story:braila:act1:capstone:work-under-pressure`

## 13.1 Core Rule

The player must perform only real work offered through authoritative systems.

Narrative does not create invisible work to make the capstone dramatic.

## 13.2 Valid Work Forms

Depending on actual current player eligibility and system state, capstone work may include:

- an authoritative delivery/custody movement;
- an authorized additional assignment;
- a real recovery/retry;
- a dispatch-supported reallocation;
- a legitimate producer/supply opportunity already emitted by production authority;
- another system-backed job consistent with the player’s current capability.

## 13.3 Invalid Shortcuts

Narrative must not:

- teleport cargo;
- mark an order delivered through dialogue;
- refill Work Capacity;
- invent a qualification;
- convert a failed order to success;
- create an employer payment;
- debit/credit money;
- create producer output;
- create stock;
- grant a vehicle;
- bypass custody.

## 13.4 Radu Line

Line ID:

`line:radu:act1-capstone:work-under-pressure`

Base copy:

> We do not both have to do everything. We have to make sure the things we accept actually get finished by somebody who can do them.

## 13.5 Persistent Fact

After the player legitimately completes at least one capstone-linked authorized responsibility:

`fact:braila:act1:capstone:authorized-responsibility:first-completed`

---

# 14. Mistake Classes

The capstone must support recoverable mistakes.

Mistakes are classified from real mission/logistics/system history.

## 14.1 REPORTABLE_PRESSURE

The player identifies a risk and reports/escalates before a commitment fails.

This is not failure.

Persistent fact:

`fact:braila:act1:capstone:pressure:reported-early`

## 14.2 RECOVERED_MISTAKE

A real problem occurs, but legitimate recovery closes the relevant work while preserving cost/history.

Persistent fact:

`fact:braila:act1:capstone:mistake:recovered`

## 14.3 PARTIAL_RECOVERY

Some linked commitment is protected, but delay, capacity cost, lost opportunity, or another authoritative consequence remains.

Persistent fact:

`fact:braila:act1:capstone:mistake:partial-recovery`

## 14.4 UNRESOLVED_FAILURE

A real linked commitment fails or the relevant recovery window closes without legitimate completion.

Persistent fact:

`fact:braila:act1:capstone:mistake:unresolved`

Failure does not block the entire campaign forever.

---

# 15. Beat Five — Recovery Is Still Work

Beat ID:

`beat:braila:act1:capstone:recovery-is-still-work`

Authored ref:

`story:braila:act1:capstone:recovery-is-still-work`

This beat appears when authoritative history contains a recoverable problem, partial recovery, or unresolved result.

## 15.1 Ana Recovery Line

Line ID:

`line:ana:act1-capstone:recovery`

Base copy:

> The mistake is already part of the record. Recovery is deciding what can still be protected without lying about what was lost.

## 15.2 Daria Recovery Line

Line ID:

`line:daria:act1-capstone:recovery`

Base copy:

> Production does not care whether the problem was dramatic. It cares what is available now, what is late, and what we can still make good on.

## 15.3 Mirela Recovery Line

Line ID:

`line:mirela:act1-capstone:recovery`

Base copy:

> I can work with a delay I understand. I cannot work with a promise nobody can still keep.

Use communication-specific wording only when a real communication/reporting path exists.

## 15.4 Later Recovery Fact

If an unresolved capstone situation is later legitimately improved after durable failure:

`fact:braila:act1:capstone:later-recovery`

The original unresolved fact remains.

---

# 16. Capstone Outcome Classification

The capstone has four semantic outcome classes.

They classify authoritative history.

They do not directly settle money, inventory, or mission state.

## 16.1 STABILIZED

Meaning:

The chain-critical need is legitimately protected well enough that the targeted downstream commitment remains viable, with no unresolved capstone-critical failure.

Persistent fact:

`fact:braila:act1:capstone:outcome:stabilized`

## 16.2 CONTAINED

Meaning:

The player/team prevents the pressure from spreading to every connected commitment, but at least one real cost, delay, missed opportunity, or degraded outcome remains.

Persistent fact:

`fact:braila:act1:capstone:outcome:contained`

## 16.3 RECOVERED_AFTER_FAILURE

Meaning:

A real capstone-linked failure occurred, then legitimate recovery restored part or all of the chain while preserving the failed historical record.

Persistent fact:

`fact:braila:act1:capstone:outcome:recovered-after-failure`

## 16.4 UNRESOLVED

Meaning:

The connected situation remains unresolved or a protected downstream commitment fails without later recovery during the capstone window.

Persistent fact:

`fact:braila:act1:capstone:outcome:unresolved`

## 16.5 Mutual Exclusivity

For the first durable capstone resolution, exactly one primary outcome fact should be selected.

Later recovery adds context rather than rewriting the primary durable outcome.

---

# 17. Relationship Consequences

Relationships should remember concrete capstone conduct.

## 17.1 Ana — Responsibility Recognition

If the player demonstrates honest prioritization, valid escalation, and/or competent completion:

`fact:ana:act1-capstone:responsibility-recognized`

This is not a promotion.

Ana line ID:

`line:ana:act1-capstone:responsibility-recognized`

Base copy:

> I can give instructions to almost anybody. What I need are people who can tell which instruction still makes sense when the situation changes.

## 17.2 Daria — Operational Trust

When the player legitimately helps protect or recover a producer-linked chain:

`fact:daria:act1-capstone:operational-trust-earned`

Daria line ID:

`line:daria:act1-capstone:trust-earned`

Base copy:

> You looked past the parcel and kept track of the dependency. That is useful to me.

## 17.3 Mirela — Pressure Memory

When the player’s real actions protect or honestly recover her downstream commitment:

`fact:mirela:act1-capstone:pressure-handled`

If the chain remains unresolved:

`fact:mirela:act1-capstone:pressure-unresolved`

These facts may coexist with older clean/recovered/failed history.

## 17.4 Radu — Coordination Memory

When the player and Radu legitimately coordinate without unsafe overcommitment:

`fact:radu:act1-capstone:coordination-earned`

Radu line ID:

`line:radu:act1-capstone:coordination-earned`

Base copy:

> That felt different. Not more work. Better-shaped work.

## 17.5 Victor — Professional Respect, Optional

When Victor is legitimately present and the player behaves professionally:

`fact:victor:act1-capstone:professional-respect:first-earned`

Victor line ID:

`line:victor:act1-capstone:professional-respect`

Base copy:

> You protected what you could actually protect. That is harder to compete with than somebody who just says yes to everything.

Victor remains a competitor.

---

# 18. Beat Six — The City Shows the Result

Beat ID:

`beat:braila:act1:capstone:the-city-shows-the-result`

Authored ref:

`story:braila:act1:capstone:the-city-shows-the-result`

This beat expresses **Your work leaves a mark**.

It must be grounded in actual world/economic state.

## 18.1 Valid Visible Consequences

The presentation layer may show only consequences for which authoritative state confirms a change.

Examples include:

- Daria’s affected production flow resumes or remains constrained;
- a real producer output becomes available again;
- Mirela’s relevant stock/order can proceed or remains delayed;
- a downstream recipient receives the real linked service/order;
- Station Commons workload/assignment pressure changes in a way the system can expose;
- the relevant local business relationship remains damaged after unresolved failure;
- a legitimate competitor fulfills work the player did not take.

## 18.2 Forbidden Visible Consequences

Do not show:

- a magically busier district because a dialogue completed;
- stock appearing without inventory authority;
- repaired buildings without world-state authority;
- a crowd celebrating routine delivery work;
- a company logo replacing another company because of one mission;
- wealth growth not backed by economy;
- a fake `city saved` banner.

## 18.3 Visible Consequence Fact

When at least one visible consequence is confirmed by authoritative state and presented:

`fact:braila:act1:capstone:visible-consequence:confirmed`

## 18.4 Capstone Reflection Line

Line ID:

`line:act1-capstone:work-leaves-a-mark`

Base copy:

> Nothing here changed because I was important. I became important because something real changed after the work was done.

This line is reflective narrative intent and may be adapted for presentation style.

---

# 19. Beat Seven — Responsibility With a Name

Beat ID:

`beat:braila:act1:capstone:responsibility-with-a-name`

Authored ref:

`story:braila:act1:capstone:responsibility-with-a-name`

The player is no longer anonymous in the local working network.

This does not mean celebrity, ownership, or executive status.

## 19.1 Recognition Rule

Recognition should derive from accumulated facts such as:

- repeated reliability;
- honest recovery;
- cross-district relationships;
- valid workload judgment;
- producer/supply understanding;
- capstone conduct.

## 19.2 Ana Line

Line ID:

`line:ana:act1-capstone:act1-recognition`

Base copy:

> At the start I needed to know whether you could finish one route. Now I need to know what kind of responsibility you want to become good at.

## 19.3 Petru Line, If Previously Met

Line ID:

`line:petru:act1-capstone:recognition`

Base copy:

> You used to look at the map like every street was separate. You do not anymore.

## 19.4 Act I Completion Fact

When the capstone reaches a durable primary outcome and the responsibility-recognition beat legitimately completes:

`fact:braila:act1:completed`

This fact means Act I’s narrative question has been answered sufficiently to enter Act II.

It does not mean every Act I relationship is repaired or every local problem is solved.

---

# 20. Act I Completion Contract

Act I completion must not require perfect success.

The player may enter Act II after a stabilized, contained, recovered-after-failure, or unresolved capstone outcome when the narrative has legitimately processed the consequence.

Minimum semantic evidence:

- early Act I history exists;
- a real connected chain was recognized;
- the player faced at least one legitimate responsibility decision or equivalent constrained situation;
- real authorized work or legitimate escalation occurred;
- a durable capstone outcome was classified;
- the consequence was acknowledged by recurring cast;
- at least one specialization direction became meaningfully legible;
- unresolved mistakes remain in history rather than being silently erased.

Act II is about choices, not about proving the player never failed.

---

# 21. Transition Identity — Act I to Act II

Canonical transition ID:

`transition:braila:act1-to-act2:choices`

Persistent transition-available fact:

`fact:braila:act2:transition:available`

This is narrative eligibility only.

It does not grant a job, capability, vehicle, company, map region, or training enrollment.

---

# 22. Act II Narrative Identity

Canonical Act II arc ID:

`arc:braila:act2:choices`

Display label:

**Act II — Choices**

Act II question:

**What kind of responsibility do I want, and what am I willing to give up to become capable of carrying it?**

The player now has enough history that opportunity has real cost.

Act II should increasingly ask the player to choose among legitimate paths rather than simply accepting every available task.

---

# 23. Beat Eight — Three Doors Forward

Beat ID:

`beat:braila:act1:capstone:three-doors-forward`

Authored ref:

`story:braila:act1:capstone:three-doors-forward`

The beat presents directions, not destiny.

## 23.1 Door A — Field / Mobility Responsibility

Narrative promise:

Become a stronger field operator through legitimate capability, equipment, transport, and experience progression.

Possible future identities include:

- trusted walking courier;
- bicycle courier when eligible/equipped;
- later vehicle operator when eligible;
- specialist field logistics work.

No unlock is granted by this beat.

## 23.2 Door B — Operations / Dispatch Responsibility

Narrative promise:

Move closer to assignment design, capacity decisions, routing, coordination, and later operational leadership when requirements are met.

No dispatch permission is granted by this beat.

## 23.3 Door C — Production / Technical / Warehouse Responsibility

Narrative promise:

Move closer to stock flow, handling, warehouse, technical, maintenance, or production-side work through legitimate training and work access.

No qualification is granted by this beat.

## 23.4 Additional Legitimate Paths

The game may later support:

- long-term career employee progression;
- specialist professional paths;
- management;
- contracting where authorized;
- production/merchant work;
- infrastructure operation;
- entrepreneurship/founding later.

Founder is one possible future identity, not the implied correct answer.

## 23.5 Elena Line

Line ID:

`line:elena:act1-capstone:three-doors`

Base copy:

> You have enough experience now to see the doors. That is not the same as being qualified to walk through all of them.

## 23.6 Ana Closing Line

Line ID:

`line:ana:act1-capstone:act2-transition`

Base copy:

> Keep working if you need stability. Train if you want different responsibility. Apply when you meet the requirements. There is no prize for rushing into the wrong role.

## 23.7 Closing Reflection

Line ID:

`line:act1-capstone:closing-reflection`

Base copy:

> The city knows what I have done. Now I have to decide what I want to become good enough to do next.

---

# 24. Persistent Narrative Fact Registry — Act I Capstone

## 24.1 Entry / understanding facts

- `fact:braila:act1:capstone:chain:first-recognized`
- `fact:braila:act1:capstone:human-dependency:first-understood`
- `fact:braila:act1:capstone:authorized-responsibility:first-completed`

## 24.2 Priority-choice facts

- `fact:braila:act1:capstone:priority:protect-existing-commitment`
- `fact:braila:act1:capstone:priority:protect-chain-bottleneck`
- `fact:braila:act1:capstone:priority:coordinate-reallocation`

## 24.3 Pressure / mistake facts

- `fact:braila:act1:capstone:pressure:reported-early`
- `fact:braila:act1:capstone:mistake:recovered`
- `fact:braila:act1:capstone:mistake:partial-recovery`
- `fact:braila:act1:capstone:mistake:unresolved`
- `fact:braila:act1:capstone:later-recovery`

## 24.4 Primary outcome facts

- `fact:braila:act1:capstone:outcome:stabilized`
- `fact:braila:act1:capstone:outcome:contained`
- `fact:braila:act1:capstone:outcome:recovered-after-failure`
- `fact:braila:act1:capstone:outcome:unresolved`

Exactly one primary outcome should describe the first durable capstone resolution.

## 24.5 Relationship consequence facts

- `fact:ana:act1-capstone:responsibility-recognized`
- `fact:daria:act1-capstone:operational-trust-earned`
- `fact:mirela:act1-capstone:pressure-handled`
- `fact:mirela:act1-capstone:pressure-unresolved`
- `fact:radu:act1-capstone:coordination-earned`
- `fact:victor:act1-capstone:professional-respect:first-earned`

## 24.6 Specialization-signal facts

- `fact:braila:act1:capstone:specialization-signal:field-mobility`
- `fact:braila:act1:capstone:specialization-signal:operations-dispatch`
- `fact:braila:act1:capstone:specialization-signal:production-technical-warehouse`
- `fact:braila:act1:capstone:specialization-signal:professional-leadership`

## 24.7 Visible consequence / progression facts

- `fact:braila:act1:capstone:visible-consequence:confirmed`
- `fact:braila:act1:completed`
- `fact:braila:act2:transition:available`

---

# 25. Persistent Consequence Rules

## 25.1 World-Local History

All capstone facts are World Instance history.

They must not become global account history across different World Instances.

## 25.2 Failure Is Historical, Not Terminal Identity

A durable failure remains part of history.

Later recovery may add context.

It must not rewrite the original event into a fictional clean success.

## 25.3 Choice Facts Describe Conduct, Not Morality

Priority choices should be remembered as operational decisions.

Do not map them directly to good/evil morality.

## 25.4 Facts Cannot Create Authority

Narrative facts cannot directly create:

- Personal Money;
- Company Money;
- wages;
- Work Capacity;
- inventory;
- cargo;
- production output;
- orders;
- contracts;
- qualifications;
- capabilities;
- equipment;
- vehicles;
- employment;
- company ownership;
- shares;
- infrastructure;
- map geometry;
- territorial access.

---

# 26. DT-09 Mission Materialization Contract

DT-09 may materialize this capstone only from real authority bindings.

## 26.1 Required Binding Families

The authored mission adapter should be able to receive or resolve opaque authoritative references for:

- capstone chain evidence;
- producer/supply cause;
- affected producer actor/location;
- linked order/delivery references;
- linked parcel/cargo references where real cargo exists;
- downstream merchant actor/location;
- downstream recipient actor/location when real;
- employer/dispatch context;
- current player eligibility/capability evidence;
- current work/capacity availability evidence;
- settlement references owned by economy where applicable;
- final authoritative chain outcome evidence.

DT-08 does not define the TypeScript shape.

## 26.2 Recommended Mission Composition

DT-09 may use these semantic authored units:

1. `story:braila:act1:capstone:the-chain-appears`
2. `story:braila:act1:capstone:people-on-both-ends`
3. `story:braila:act1:capstone:what-do-you-protect`
4. `story:braila:act1:capstone:work-under-pressure`
5. `story:braila:act1:capstone:recovery-is-still-work` when needed
6. `story:braila:act1:capstone:the-city-shows-the-result`
7. `story:braila:act1:capstone:responsibility-with-a-name`
8. `story:braila:act1:capstone:three-doors-forward`

The runtime may combine adjacent authored units if state transitions remain truthful and resume-safe.

## 26.3 Mission Category Guidance

Possible mission categories include:

- `CampaignStory` for the capstone spine;
- `Character` for relationship acknowledgement;
- `Employer` for dispatch responsibility;
- `ProducerSupplyChain` only when the cause comes from production authority;
- `Career` for Act II horizon presentation without granting capability.

The story source remains `Authored` for authored capstone missions.

A real producer opportunity may remain `Systemic` and be referenced by the authored capstone instead of being copied into an authored fake producer mission.

## 26.4 Delivery Reference Rule

Any `MissionDeliveryReference` must refer to a real authoritative delivery/order/parcel set.

Do not create a narrative-only delivery reference.

## 26.5 Settlement Rule

If a capstone mission references economic settlement, it may use `EconomicSettlementReference` only for an already valid external settlement reference.

Narrative never supplies an amount.

## 26.6 Choice Rule

DT-09 should expose only priority options proven legitimate by current world facts.

If only one response is possible, do not fake a choice.

## 26.7 Failure Rule

Failure handling must preserve:

- real failed order/mission history;
- recovery availability where legitimate;
- completion receipts;
- exactly-once consequence intents;
- resume-safe choice history.

The capstone narrative may continue after failure once the consequence is processed.

## 26.8 Resume Rule

If the game saves mid-capstone, mission-side resume must restore:

- current authored mission identity;
- current stage/objectives;
- completed objective IDs;
- chosen priority option;
- processed event IDs;
- emitted consequence intent IDs;
- unresolved external references.

DT-09 and DT-02 own the concrete persistence path.

DT-08 owns only the meaning of the facts.

---

# 27. DT-07 Production / Supply Chain Handoff

DT-07 remains sole owner of producer/supply causality.

The capstone expects DT-07 or equivalent production authority to provide real cause evidence when the upstream link is production-driven.

Narrative may read:

- pressure exists;
- which real item/context is affected;
- whether flow is blocked, constrained, or restored;
- whether downstream commitments are causally connected.

Narrative may not mutate those facts.

---

# 28. DT-03 Player Economy Handoff

DT-03 remains sole owner of:

- Personal Money;
- employer treasury;
- wage settlement;
- Work Capacity accounting.

Capstone pressure may acknowledge that the player cannot do infinite work.

Narrative may not refill capacity, create bonus money, or convert story completion into arbitrary cash.

---

# 29. DT-06 Professions / Capability Handoff

DT-06 remains sole owner of capability and work-access eligibility.

The capstone’s specialization signals are questions and future directions.

They do not grant:

- bicycle capability;
- vehicle operation;
- dispatch authority;
- warehouse authority;
- technical qualification;
- production role;
- training completion;
- employer permission.

DT-09 should gate any role-specific authored work on real DT-06-readable eligibility.

---

# 30. DT-10 Visual Storytelling Handoff

The visible layer may later present capstone beats only after authoritative mission/system signals exist.

Recommended visible moments:

- Daria physically contextualizes the upstream problem;
- Station Commons shows Ana/Radu under real workload pressure;
- Mirela reacts according to actual downstream consequence and prior history;
- Petru appears only if truly part of the linked chain;
- the visible city/business state reflects only confirmed authoritative change;
- Act II horizon presentation shows several credible futures without announcing a fake promotion.

Visible implementation remains subject to #317 and owner Android acceptance.

---

# 31. Brăila Story Anchors

## Foundry Quarter

Capstone function:

Cause becomes visible before cargo exists.

Primary character:

Daria.

## Station Commons

Capstone function:

Responsibility, assignment, capacity, reallocation, and specialization pressure become visible.

Primary characters:

Ana and Radu.

## Brăila Commerce

Capstone function:

The downstream business effect of upstream/logistics decisions becomes personal.

Primary character:

Mirela.

## Old Town

Capstone function:

When a real linked household/service need exists, the final consequence reaches a familiar person rather than a waypoint.

Primary character:

Petru when authoritative.

## Canal & Quays

Capstone function:

Optional horizon only.

It may foreshadow future regional movement but is not required to complete Act I.

## Geographic Rule

This document adds no streets, addresses, entrances, or map geometry.

Runtime uses authoritative source-backed world locations.

---

# 32. Career-Neutral Outcome Rule

A successful Act I capstone does not mean:

- become CEO;
- found DROPi;
- buy a company;
- leave Northstar;
- become a manager;
- buy a vehicle;
- enroll in training;
- choose a permanent specialization immediately.

The capstone earns perspective and credibility.

Act II turns that credibility into choices.

A player may remain a professional employee indefinitely and still reach influence and legacy.

---

# 33. Act II Transition Variants

The transition tone may reflect capstone outcome.

## 33.1 After STABILIZED

Tone:

The player has proof they can handle connected responsibility when conditions align.

Ana should increase expectations without declaring mastery.

## 33.2 After CONTAINED

Tone:

The player learns that good judgment can reduce damage even when not everything can be saved.

This is a strong professional outcome, not a lesser ending.

## 33.3 After RECOVERED_AFTER_FAILURE

Tone:

The player enters Act II with a visible mistake and proof of recovery.

Characters remember both.

## 33.4 After UNRESOLVED

Tone:

The player enters Act II with unfinished history.

Some relationships may be colder, some opportunities may require rebuilding, but career growth remains possible.

Act II begins from consequence, not reset.

---

# 34. Acceptance Contract

A future implementation is narratively compliant only if all applicable checks pass.

## Connected chain

- capstone uses an interdependent local chain;
- at least two causal economic/logistics edges are authoritative;
- events are not unrelated errands stitched together by dialogue;
- cargo is not hardcoded by narrative.

## Earlier history

- Mirela variants reflect real prior service history;
- Radu remembers prior workload/coordination context appropriately;
- Daria’s posture reflects earlier Foundry history where available;
- durable failure is not rewritten.

## Responsibility

- competing priorities are legitimate;
- protecting an existing commitment is valid;
- protecting a chain bottleneck requires real authority;
- reallocation requires real dispatch support;
- overcommitment is not framed as heroism.

## Work

- player performs only authorized real work;
- no dialogue changes order/cargo/economy truth;
- mission outcome derives from actual events;
- failure has a legitimate recovery path where possible.

## Specialization

- field/mobility, operations/dispatch, and production/technical/warehouse futures are legible;
- no capability is granted by story;
- non-founder career paths remain complete;
- entrepreneurship is not the capstone reward.

## Visible consequence

- **Your work leaves a mark** is shown through system-confirmed change;
- no fake city transformation is presented;
- unresolved outcomes may remain visibly unresolved.

## Act II transition

- Act I may complete after imperfect outcomes once consequences are processed;
- Act II begins with choices, not a forced career selection;
- world-local history carries forward.

---

# 35. Ownership Boundary

After this document merges:

- **DT-08 Story Director** owns the stable authored meaning, IDs, relationship interpretation, capstone consequence semantics, and Act II narrative transition defined here.
- **DT-09 Missions & Campaign** owns mission/runtime realization, event handling, stage design, mission IDs, resume semantics, and consequence intent processing.
- **DT-10 Characters & Dialogue** owns visible narrative presentation and Android narrative UX.
- **DT-02 World Persistence** owns durable Save integration.
- **DT-03 Player Economy** owns money, wages, employer treasury, and Work Capacity.
- **DT-06 Professions & Personal Capability** owns capability, qualification, permission, and work eligibility.
- **DT-07 Production & Supply Chain** owns producer, inventory, supply-demand, and causal opportunity authority.
- **DT-01 / DT-05** retain world-presentation and living-city ownership.

No specialist should create a parallel authority solely to make the capstone easier to script.

---

# Final Canonical Principle

Act I begins with one small delivery and ends when the player can see the chain around it.

The player has not become powerful.

They have become responsible enough to understand that one ordinary decision can protect one worker, one business, one customer, and one promise at the same time — or force a legitimate tradeoff among them.

That is the first real proof of the game’s promise:

**Your work leaves a mark.**

Act II begins when the player understands the next question:

**What kind of responsibility do I want to become capable of carrying?**
