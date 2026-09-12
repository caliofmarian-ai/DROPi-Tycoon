# DT-16 — Independent Product / Release Audit

## Current audit point

- Repository: `caliofmarian-ai/DROPi-Tycoon`
- Audited branch: `main`
- Audited canonical HEAD: `8016dfe6d6e7f5f0a5dcb53f216691c555f5b0fa`
- Previous frozen baseline: `08e33ad71e11e4f17eeb1f38d530386ee447d334`
- Previous intermediate audit baseline: `d3a57d9814869eb5110f6f55ca53ce2db2299918`
- Audit refresh date: 2026-09-10
- Auditor: `DT-16 — INDEPENDENT PRODUCT / RELEASE AUDITOR`
- Role: independent evidence/classification reviewer; not a remediation builder

PR #573 remains historical only. This document is a fresh audit of the repository state at the exact canonical SHA above. PR descriptions and issue closure state are not treated as sufficient evidence when the current repository or current CI contradicts them.

## Executive verdict

**PUBLIC / COMMERCIAL RELEASE: NO-GO**

Current effective release picture:

- **11 effective unconditional P0 blocker groups**;
- **4 effective P1 risks**;
- **3 conditional P0 trust/safety gates** that remain conditional only while the corresponding production capabilities remain disabled;
- canonical `main` currently has a **red Prototype CI `validate` gate**, even though production Docker smoke remains green and prior candidate build evidence is green;
- physical Android, exact production AAB, Play, legal/privacy and multi-locality release evidence remain incomplete.

The project has materially advanced since the old frozen snapshot. Canonical main now includes, at minimum, merged #662, #668, #669, #670, #672 and #673. Those merges improve reusable world-visual authority, narrative portability, provenance governance, marketing evidence discipline, Story presentation gating and exactly-once delivery progression settlement. They do not yet compose into a release-ready player lifecycle.

---

## Exact current CI state

Canonical SHA: `8016dfe6d6e7f5f0a5dcb53f216691c555f5b0fa`.

Observed current integration evidence:

- `Production Docker Runtime Smoke` / `production-image-smoke`: **PASS**;
- Railway commit deployment status: **SUCCESS**;
- Prototype CI build evidence on the merged #670 candidate: **PASS**;
- exact-current-main `DROPi Tycoon Prototype CI` / `validate`: **FAIL**;
- exact failing workflow step: **`Run full automated test suite`**;
- in that exact-main failed validate run, downstream `TypeScript and production build` is **SKIPPED**, not a second failure.

The green candidate/build evidence must not be used to call exact current main green. Conversely, DT-16 does not infer that the TypeScript/build itself is broken merely because the exact-main validate job stopped earlier in the test suite.

**No root cause is asserted by this audit.** The only evidence-backed statement is that the exact-current-main validate job fails in the full automated test suite. Root-cause triage belongs to **DT-04 — CI / Railway / Integration Guardian**.

Audit consequence: exact current main does not satisfy the project's required green-integration condition. This is a release-blocking P0 until DT-04 provides a verified green canonical-main result or DT-00 explicitly changes the gate.

---

## Canonical merge facts newly integrated

### #662 — reusable global 10× playable-city visual scale authority

Current main contains `game-web/src/world/playableCityScale.ts` as a locality-neutral visual-distance authority.

Canonical facts now visible in source:

- `CITY_PLAYABLE_DISTANCE_SCALE_BASELINE = 10`;
- visual scale version remains explicit;
- Android resident detail is bounded independently of total locality extent;
- generic visual scale does not own locality adjacency, road connectivity, route classes, mission topology or logistics truth;
- locality-specific calibration remains outside the generic module.

Audit consequence: the previous P1 claiming that the 10× Brăila calibration was ahead of a reusable global visual authority is **retired**. Physical Android visual acceptance remains unresolved under #317/DT-14 and is not implied by this source contract.

### #668 — portable first-hour narrative binding contract

Current main contains `01_GameDesign/FIRST_HOUR_LOCALITY_PORTABILITY_CONTRACT.md`.

Canonical facts:

- Brăila remains premium bespoke narrative content, not a universal fallback;
- global narrative role, Brăila-specific named character, locality-specific binding and portable narrative event are explicitly separated;
- portable first-hour meaning must bind to the actual current locality and legitimate local work/economic causes;
- `CATALOGED` does not mean story-ready;
- missing locality/cast/economic truth must not be replaced by invented Brăila content.

Audit consequence: narrative architecture is materially more locality-safe, but #668 is a design contract and does not itself prove a second playable locality, runtime materialization, persistence or Android acceptance.

### #669 — scalable global asset provenance/legal qualification contract

Current main contains the DT-13 family/batch -> archetype -> locality variant -> runtime derivative provenance contract and its Compliance index entry.

Canonical facts:

- source-backed, game-translated, inspired and fictional classifications are separated;
- downstream derivatives must remain traceable to governed source lineage;
- legal/provenance status is independent of DT-19 production lifecycle status;
- unknown rights/provider/terms/input facts fail closed rather than being invented;
- the contract expressly does **not** clear existing #565 commercial blockers or #560 authenticated-identity requirements.

Audit consequence: #565 evidence quality improves materially; commercial clearance remains unsatisfied.

### #670 — marketing claim evidence audit

Current main contains `00_Project/DT15_MARKETING_CLAIM_EVIDENCE_AUDIT_2026-09-09.md`.

Canonical value of this merge is governance: repository implementation is not automatically a public marketing claim, and external claims require the exact distributed/captured Android candidate plus applicable release gates.

The #670 document is itself a dated evidence snapshot and contains statements tied to its own older audited SHA. DT-16 therefore consumes its evidence-state discipline, not stale runtime assertions that are contradicted by newer canonical source such as #662.

Audit consequence: marketing truthfulness governance is stronger, but production store/creator evidence remains blocked downstream of an accepted build and physical capture.

### #672 — authoritative first-hour Story presentation adapter

Current main contains `game-web/src/narrative/firstHourStoryPresentationAdapter.ts` plus focused tests.

Canonical source now proves a fail-closed presentation bridge that:

- consumes explicit DT-08 Story trigger/gate/role evidence;
- requires DT-09 mission locality to equal the supplied DT-11-backed current locality;
- rejects missing authority, missing facts, mismatched mission gates and invalid role bindings;
- blocks already-acknowledged replay;
- requests DT-09 acknowledgement only after presentation completion;
- does not decide Story from screen-open, revenue, raw Save envelopes or active-order heuristics.

Current code search for `presentFirstHourStoryTrigger` finds the adapter and its test, not an ordinary gameplay scene/provider consumer. Therefore this is not evidence that the full trigger -> visible presentation -> durable acknowledgement chain is mounted in normal gameplay.

Audit consequence: P0 Story evidence improves substantially, but the player-facing composition gate remains open.

### #673 — exactly-once delivery progression settlement authority

Current main contains `game-web/src/economy/deliveryProgressionSettlement.ts` plus tests and runtime documentation.

Canonical source now proves a bounded DT-03 settlement authority for legitimate settled deliveries, including:

- replay-safe stable delivery settlement receipt identity;
- productive work toward the existing wage path rather than per-parcel money minting;
- player XP;
- entity loyalty;
- eligible specialist fragments;
- anti-self-dealing/anti-wash behavior for marketplace fulfillment;
- no specialist-fragment remint merely because an existing fragment is transported.

The source explicitly states that this settlement state is **not mounted into GameSession persistence yet** and requires the persistence owner to commit the relevant state atomically before live save/reload activation. Current code search finds the settlement function in the authority module and tests, not an ordinary gameplay persistence consumer.

Audit consequence: settlement semantics are much stronger, but the durable visible Player Economy lifecycle P0 remains open.

---

## Current strongest evidence

### 1. Save / world / mission continuity is materially repaired at source level

Current main retains governed Save continuity for hero position, active order, cargo derived from order stage, terminal settlement marker discipline and transient-input reset. This materially supersedes the old #573 claim that Save necessarily reconstructs a fresh job at HQ.

Physical Android process-kill/relaunch acceptance is still separate evidence and is not inferred from source tests.

### 2. Global 10× visual scaling is now a reusable locality-neutral source contract

#662 is canonical. The old architectural concern that reusable scale policy lived only behind Brăila-owned authority is no longer current. Brăila remains a premium calibration/specialization, while generic visual-distance policy is separated from routing/geographic truth.

### 3. Story portability and presentation authority are stronger but not fully composed

#668 provides the canonical locality-portable narrative meaning/binding rule. #672 provides a fail-closed executable presentation adapter. Together they remove substantial ambiguity around Brăila fallback and presentation eligibility.

They still do not prove the normal-game runtime has one mounted provider that supplies the authoritative mission/locality/story evidence and persists the resulting acknowledgement exactly once.

### 4. Delivery reward/progression settlement now has an explicit exactly-once authority

#673 is a meaningful DT-03 improvement. It validates the authoritative consequence boundary before applying money-related productive-work progress, XP, loyalty and fragment consequences, and it rejects replay/self-dealing cases.

Its own source preserves the current persistence limitation, so this is not yet durable save/relaunch proof.

### 5. Provenance and marketing evidence governance are stronger

#669 establishes scalable fail-closed provenance lineage. #670 establishes that public claims must remain downstream of exact-build/capture/release evidence. Neither merge turns repository-source progress into commercial clearance or a production marketing claim.

### 6. Current integration truth is mixed, not green

Production Docker smoke and Railway are green, but exact-current-main Prototype CI `validate` is red in the full automated test suite. This is now one of the strongest release facts because a green source baseline is a prerequisite for trusting higher-level acceptance work.

---

## Effective P0 blocker list

### P0-1 — Player Economy is not yet one durable, visible first-hour authority

**Primary owner:** DT-03  
**Persistence coordination:** DT-02  
**UX/mission coordination:** DT-21 / DT-09  
**Tracks:** #436, #653, merged #625/#638/#673

Canonical improvement: #673 supplies replay-safe delivery progression settlement for money-related productive-work consequence + XP + loyalty + eligible fragments.

Still missing from release proof:

- one active single-writer durable integration for the complete first-hour Personal Money / settlement receipt / progression state;
- atomic save/reload behavior for #673 settlement state with its existing Player Economy and progression state;
- ordinary-gameplay player-visible proof that Personal Money is distinct from Company Money;
- save/process-restart proof without mint/reset/duplication.

#673 source explicitly says the settlement state is not mounted into GameSession persistence yet.

**Status:** `EXECUTABLE`, cross-DT persistence composition required.

### P0-2 — Authoritative first-hour Story is not yet fully mounted into ordinary gameplay

**Primary owners:** DT-08 + DT-09 + DT-10  
**Tracks:** #552/#553/#554, merged #558/#647/#668/#672

Canonical improvement:

- #668 defines locality-portable first-hour semantics with no Brăila fallback;
- #672 provides a fail-closed presentation adapter and stable acknowledgement request boundary.

Still missing from current main release proof:

`authoritative current-locality mission/economy fact -> Story trigger -> ordinary gameplay provider -> visible presentation -> DT-09 durable acknowledgement -> progression`

Code search shows the #672 presentation entry point in its adapter and tests, not a normal gameplay scene/provider consumer.

**Status:** `EXECUTABLE`; physical Android acceptance follows later.

### P0-3 — Owner product-quality / physical Android gameplay acceptance remains open

**Primary surface owners:** DT-01 + DT-21 + DT-10  
**Acceptance owner:** DT-14  
**Gate:** #317

#662 improves source architecture and bounds detail residency, but no source contract substitutes for exact-release-candidate physical Android acceptance of readability, camera, labels, touch, safe areas, frame behavior and overall player-facing quality.

**Status:** `BLOCKED/DEFERRED` for final acceptance until a physical release candidate exists; source-quality work remains executable.

### P0-4 — Bundled production runtime lacks physical release-candidate acceptance

**Primary owner:** DT-14  
**CI coordination:** DT-04  
**Track:** #567

Source supports bundled Phaser production mode. Release proof still requires the installed candidate to demonstrate cold/offline startup, local asset loading, Back/touch/landscape behavior, save/relaunch/resume and bundled-origin integrity.

**Status:** `BLOCKED ON REAL AAB / PHYSICAL ANDROID EVIDENCE`.

### P0-5 — Exact production AAB / Play Internal attestation is absent

**Primary owner:** DT-14  
**CI coordination:** DT-04  
**Track:** #568

Repository preparation does not supply the real release artifact evidence: exact EAS build ID/source SHA/AAB hash, final manifest/permissions/SDKs, signing fingerprint, ABI/64-bit, 16 KB page-size verification, Play App Bundle Explorer/pre-launch results and physical acceptance.

**Status:** `BLOCKED ON EXTERNAL BUILD / PLAY / DEVICE ACTIONS`.

### P0-6 — Play privacy / Data Safety / App Content gate remains substantively unsatisfied

**Primary owner:** DT-13  
**Play coordination:** DT-14 + Project Owner  
**Track:** #569

Administrative closure is not accepted as release proof where the evidence package still requires owner/controller/contact/target-audience facts, exact-AAB permission/native-SDK/network evidence, published policy surfaces and Play Console declarations.

**Status:** `BLOCKED ON OWNER INPUT + #568 + PLAY CONSOLE + QUALIFIED REVIEW WHERE REQUIRED`.

### P0-7 — Commercial IP/license/provenance clearance remains blocked

**Primary owner:** DT-13  
**Asset handoff:** DT-19  
**Track:** #565  
**Canonical improvement:** #669

#669 materially strengthens the scalable provenance model and fail-closed lineage requirements. It explicitly does not resolve the known commercial blockers such as missing historical generation/provider/terms/input facts where applicable, branding chain-of-title/trademark clearance, final ODbL characterization/source-availability obligations or exact final native dependency licence closure.

**Status:** evidence stronger; severity unchanged. `PARTLY EXECUTABLE`, final clearance externally/factually blocked where evidence is unavailable.

### P0-8 — Play Console verification/signing/test-to-production gate is not satisfied

**Primary owner:** DT-14 + Project Owner  
**Track:** #571

No current repository evidence can substitute for owner/account-specific Play developer verification, package registration, Play App Signing, required testing state and production access.

**Status:** `BLOCKED ON PROJECT OWNER / PLAY CONSOLE`.

### P0-9 — Global playable-locality + origin/current-locality/relocation lifecycle is still absent on main

**Primary owner:** DT-11  
**Persistence:** DT-02  
**Coordinates:** #643/#634/#645

#668 makes first-hour narrative semantics portable, #669 makes global asset provenance scalable and #662 makes visual scale reusable. None of those is the missing geographic/runtime authority.

Current canonical persistence documentation still marks Catalog locality -> `PlayableLocalityInstance` as `ABSENT + DESIGN_INPUT_ONLY`. Current main does not contain the executable DT-11 instance contract. A branch/PR proposing it is not canonical evidence until merged.

Required release proof remains:

`choose/start locality -> enter -> legitimate local work -> pickup/custody -> delivery -> settlement -> story consequence -> save/relaunch -> relocate -> second materially different functional locality`

without Brăila fallback.

**Status:** DT-11 contract work is executable; DT-02 relocation remains blocked on canonical DT-11 identity/runtime handoff.

### P0-10 — Economy-driven settlement evolution has no merged durable end-to-end proof

**Primary owner:** DT-18  
**Causal inputs:** DT-07 / DT-06 / DT-20 / DT-03 as applicable  
**Persistence:** DT-02  
**Track:** #651 with #420

Current main still does not contain the reviewed DT-18 settlement-evolution runtime slice. The relevant DT-18 work remains outside canonical main and therefore cannot be counted as release evidence.

Release proof still requires stable dynamic development state/reasons/evidence, legitimate economic cause -> consequence, structural ticks independent of FPS, a gameplay consequence such as new legitimate work/trade, durable save/reload, and no catalog/player-level shortcut to fake urban maturity.

**Status:** `EXECUTABLE`; persistence activation later coordinates with DT-02.

### P0-11 — Exact canonical main fails Prototype CI validate

**Primary owner:** DT-04  
**Coordination:** owning lane(s) only after DT-04 evidence identifies the regression

At canonical `8016dfe6d6e7f5f0a5dcb53f216691c555f5b0fa`:

- production-image-smoke is PASS;
- Railway deployment status is SUCCESS;
- Prototype CI candidate/build evidence exists as PASS;
- exact-main `validate` is FAIL;
- the exact failed step is `Run full automated test suite`;
- downstream TypeScript/build is skipped in that failed exact-main run.

DT-16 does **not** diagnose which test or merge caused the failure without exact evidence. DT-04 owns root-cause triage and integration regression assignment.

**Status:** `EXECUTABLE — DT-04 TRIAGE REQUIRED`; release remains NO-GO while exact canonical main is red.

---

## Effective P1 risk list

### P1-1 — Single-writer persistence composition is documented better than it is integrated

**Owner:** DT-02 / #628

Save continuity has improved, but Player Economy/#673 receipts, rich capabilities, locality identity/relocation and future evolution state still do not all share one active durable writer/cutover. The risk is dual or partial truth across local Save, runtime sidecars and future PostgreSQL authority.

### P1-2 — `main` does not technically enforce CI as a merge prerequisite

**Owner:** DT-04 + DT-00/repository administration

Canonical branch metadata reports branch protection disabled with no required status checks. The current red exact-main validate result makes this governance weakness operationally significant rather than theoretical.

Open CI hardening work is not counted as canonical until merged.

### P1-3 — Domain breadth still outruns one composed player lifecycle

**Owner:** DT-00 orchestration across DT lanes

#662/#668/#669/#672/#673 are individually meaningful authority improvements. Release confidence still depends on composition: a contract/unit test does not prove that the shipped player can encounter, understand, persist and continue the state through the intended gameplay loop.

### P1-4 — Store/creator evidence remains downstream of an accepted exact build

**Owner:** DT-15  
**Tracks:** #561/#563  
**Canonical improvement:** #670

#670 now provides a useful evidence-state discipline that prevents source/roadmap facts from becoming public claims. Its dated runtime rows must still be re-audited when current source changes, as #662 already demonstrates.

No production marketing claim should be promoted from the current red exact-main baseline or without exact Android capture and applicable owner/legal/release acceptance.

### Retired P1 — Brăila 10× calibration ahead of reusable visual authority

This previous risk is no longer current as stated. #662 moved reusable 10× playable-distance/detail policy into the locality-neutral `playableCityScale.ts` authority and keeps Brăila-specific compatibility behavior outside the generic routing/geographic boundary.

Physical Android visual quality remains covered by P0-3 rather than being double-counted here.

---

## Conditional P0 gates

These remain conditional only while the corresponding production capability is disabled.

1. **#560 — authenticated/durable online identity and write authorization.** #669 restates the privacy/legal boundary but does not solve server-established actor identity/authorization. Owner: DT-17.
2. **#562 — account deletion/data-rights lifecycle.** Becomes hard P0 before production account creation/cloud account persistence is activated. Owners: DT-17 technical + DT-13 legal/privacy.
3. **#564 — UGC/chat moderation/report/block safety.** Becomes hard P0 before public player chat/UGC is activated. Technical ownership per DT-00; DT-13 owns release-gate review.

No capability is authorized for activation by this audit.

---

## Blocked vs executable summary

### Executable from current canon

- DT-04: establish exact root cause for current-main full-suite failure and restore a green canonical validate gate; DT-16 assigns no presumed culprit.
- DT-03 + DT-02: mount #673 settlement authority into one durable replay-safe persistence transaction without creating a second writer.
- DT-08/09/10: mount the #668/#672 Story path into ordinary gameplay using actual current-locality/mission authority and durable DT-09 acknowledgement.
- DT-11: land the canonical Catalog -> `PlayableLocalityInstance` identity/readiness/runtime handoff before relocation can be considered canonical.
- DT-18: land the reviewed deterministic settlement-evolution authority and versioned persistence handoff without taking DT-02 writer ownership.
- DT-13/19: consume #669 lineage rules without converting contract existence into commercial clearance.

### Blocked on another owning contract

- DT-02 current/home/start locality + relocation: blocked until a canonical DT-11 playable-locality contract exists.
- durable World Evolution writer: blocked until reviewed DT-18 handoff exists and DT-00 assigns DT-02 integration.
- ordinary non-Brăila first-hour experience: blocked on actual playable-locality + legitimate mission/economic/materialized Story inputs, not merely portable narrative documentation.

### External / owner / physical evidence blocked

- exact EAS production AAB and attestation;
- physical Android cold/offline/resume/save/back/touch/readability acceptance;
- Play Internal/App Bundle Explorer/pre-launch evidence;
- Play developer-account verification/signing/testing/production access;
- final #569 owner/privacy/target-audience/Play declarations;
- final #565 rights/trademark/ODbL/native licence qualification where external facts/review are required.

---

## Current largest missing player experience

The largest missing product experience remains one composed, persistent locality-authoritative first-hour lifecycle:

> The player starts in a governed current locality, receives legitimate local work, performs pickup/custody/delivery, receives the exactly-once Personal Money/progression consequences, sees the authoritative locality-bound Story consequence, survives save/process restart, and can later relocate replay-safely into a second materially different functional locality — all on one exact bundled Android release candidate and without Brăila fallback.

#668, #672 and #673 make important pieces of this chain much more credible. Their existence also makes the remaining gap more precise: **composition and durable player-facing materialization**, not absence of domain contracts.

---

## False-completeness / evidence-discipline findings

1. **Current CI:** candidate/branch build success does not override the exact-current-main validate failure.
2. **#662:** reusable source authority exists, but that is not physical Android visual acceptance.
3. **#668:** portable narrative semantics exist, but documentation is not a second-locality runtime proof.
4. **#669:** canonical provenance contract exists, but contract existence is not commercial clearance.
5. **#670:** evidence matrix governance is useful, but its dated runtime assertions are not immutable canon after later source changes.
6. **#672:** presentation adapter/tests exist, but no ordinary-gameplay consumer was found for its entry point on current main.
7. **#673:** exactly-once settlement authority/tests exist, but its source explicitly states live GameSession persistence is not mounted yet.
8. **#569:** administrative issue closure cannot substitute for substantive Play/privacy completion where required evidence remains absent.
9. **Green Docker/Railway:** proves those surfaces only; it does not imply Prototype CI, Android, Play, security, legal or marketing acceptance.

---

## DT ownership map for effective defects

| Effective defect | Primary owner | Required coordination |
| --- | --- | --- |
| Durable visible Player Economy / #673 settlement composition | DT-03 | DT-02, DT-09, DT-21 |
| First-hour Story ordinary-gameplay composition | DT-08/DT-09/DT-10 | DT-11, DT-03, DT-21 |
| Product-quality Android gameplay acceptance | DT-01/DT-21 + DT-14 acceptance | DT-10, DT-04 |
| Bundled runtime physical acceptance | DT-14 | DT-04, DT-02 |
| Exact AAB / Play Internal attestation | DT-14 | DT-04, Project Owner |
| Privacy/Data Safety/App Content | DT-13 | DT-14, Project Owner, #568 |
| IP/license/provenance | DT-13 | DT-19, DT-14, Project Owner |
| Play Console verification/signing/testing | DT-14 + Project Owner | DT-13 where declarations intersect |
| Playable-locality / relocation lifecycle | DT-11 | DT-02 plus consuming gameplay lanes |
| World time / settlement evolution | DT-18 | DT-07/06/20/03 inputs, DT-02 persistence |
| Exact-main Prototype CI regression | DT-04 | culprit lane only after evidence-based triage |
| Required-check / branch-protection governance | DT-04 + DT-00/admin | all lanes consume gates |
| Truthful store/creator evidence | DT-15 | DT-14, DT-13, DT-16 |

---

## Release decision

### Current decision

**NO-GO for public/commercial Google Play release.**

The current red exact-main Prototype CI validate gate is independently sufficient to prevent a release GO. Even after that is repaired, the other P0 product, Android, Play, privacy/legal and multi-locality gates must still be satisfied.

### Evidence required before a future GO can be considered

- exact canonical-main CI green across required integration gates;
- exact bundled production AAB attestation;
- physical Android release-candidate acceptance;
- Play Console/internal-track verification;
- final privacy/Data Safety/App Content evidence;
- commercial IP/provenance clearance;
- one composed first-hour employee/economy/story/save lifecycle;
- multi-locality playable/relocation proof;
- economy-driven persisted settlement-evolution proof required by #651.

No branch-only PR, isolated unit test, dated documentation snapshot, issue closure state, CI from a different tree, concept screenshot or source contract is sufficient by itself.

---

## Audit scope / non-actions

DT-16 changed only this audit artifact in PR #667 and reconciles the PR branch against canonical main.

DT-16 did **not**:

- diagnose or repair the current CI failure;
- modify gameplay;
- modify economy/runtime settlement behavior;
- modify Story presentation behavior;
- modify Save/persistence;
- modify Android source;
- activate authentication, durable online authority, UGC or monetization;
- modify Railway;
- perform Play Console actions;
- provide a legal waiver or commercial clearance;
- create a duplicate issue;
- merge or auto-merge any PR.

Central Orchestrator owns remediation order and future DT-16 missions.
