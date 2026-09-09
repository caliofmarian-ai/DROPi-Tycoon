# DT-15 Marketing Claim Evidence Audit — 2026-09-09

## Document information

- Project: DROPi Tycoon
- Owner lane: DT-15 — Growth / ASO / Community / Launch
- Target issues: #561, #563
- Audited canonical `main`: `08e33ad71e11e4f17eeb1f38d530386ee447d334`
- Audit date: 2026-09-09
- Status: `AUDIT_SNAPSHOT — NO_PUBLIC_CLAIM_PROMOTED_GREEN`

This is a narrow evidence snapshot. It **does not replace** `STORE_CREATIVE_PREPRODUCTION_MANIFEST.md`, `LAUNCH_PRESS_KIT_CREATOR_OUTREACH_PACKAGE.md`, Google Play release authority, legal authority, or runtime authority. It consumes those existing authorities and records what the exact audited `main` can and cannot currently support as external marketing evidence.

The snapshot must be re-audited after a relevant runtime, Android-build, release-gate, global-locality, legal/provenance, or owner-acceptance change.

## 1. Governing rule

A repository implementation is not automatically a public marketing claim.

For production store, press, creator, community, trailer, screenshot, or acquisition use, a player-facing claim is publishable only when the exact distributed/captured Android candidate provides the experience and the applicable acceptance gates are satisfied.

At this audited SHA:

- `main` was created by the owner-directed merge of #641 with a known Prototype CI failure accepted temporarily;
- that merge explicitly states that it is neither `ORCHESTRATOR_TECHNICALLY_VERIFIED` nor `ANDROID_VERIFIED`;
- #568 still lacks the actual production AAB / Play Internal / physical Android acceptance evidence;
- #317 remains an open player-facing quality gate;
- #565 remains an open commercial provenance/legal gate;
- #566 remains an open save/mission continuity P0 blocker;
- #643 remains an open global functional-locality P0 program.

Therefore **source evidence may be useful for planning capture, but no current player-facing marketing claim is promoted to production `GREEN` by this audit.**

## 2. Evidence-state vocabulary

| State | Meaning in this audit | External production use |
|---|---|---|
| `SOURCE_EVIDENCED` | Exact audited source contains the implementation/foundation described. | Not sufficient by itself. |
| `BUILD_EVIDENCED` | The exact candidate build carrying the source has verified artifact provenance. | Still requires any applicable visual/owner/legal/Play gate. |
| `CAPTURE_EVIDENCED` | Real candidate Android gameplay capture demonstrates the claimed player experience. | Candidate for DT-15 truth review. |
| `PUBLIC_GREEN` | Exact-build evidence plus all applicable owner, DT-14, DT-13 and product-quality gates are satisfied. | Allowed. |
| `BLOCKED` | Evidence chain is incomplete or contradicts the proposed claim. | Not allowed as a current feature claim. |

Repository documents, data catalogs, unit tests, issue descriptions, domain contracts and roadmap canon may support an audit, but they never substitute for exact-build player-facing evidence where the marketing claim is experiential.

## 3. Current evidence matrix

| ID | Marketing claim / concept | Exact audited runtime/source evidence | Exact build/version evidence | Required screenshot/video proof | Current public status | Primary blocker / handoff |
|---|---|---|---|---|---|---|
| `EV-01` | DROPi Tycoon targets Android landscape gameplay. | `game-mobile/app.json`: Android platform, landscape orientation, package `com.dropi.tycoon`, bundled Phaser runtime plugin. | Repository version remains `0.0.0`. Existing `BUILD_RECORD_0.0.0.md` is a **preview/internal** build from source `b398ed6...`, not this audited SHA; physical validation remains pending. | Installed exact-candidate Android launch showing landscape game, no browser chrome/dev shell; provenance record tied to the same source SHA. | `BLOCKED` | DT-14 / #568, #570. |
| `EV-02` | The player can experience a playable Brăila locality. | `game-web/src/world/city.ts` constructs the current `CITY` as `cityId: 'braila'` from governed world zones, roads, buildings and route points. `worldLayout.ts` consumes the generated Brăila layout. | No exact current-main Android candidate is physically validated. | Clean Android gameplay frame showing the player inside the actual Brăila runtime at readable street/locality scale; no debug-dominant presentation. | `BLOCKED` | #317 + DT-14 exact candidate. |
| `EV-03` | Brăila currently uses a 10× playable-distance calibration. | `game-web/src/world/brailaPlayableScale.ts` defines `BRAILA_PLAYABLE_DISTANCE_SCALE = 10`; `worldLayout.ts` consumes the Brăila expansion helpers. | #641 is merged into this SHA, but the merge records known Prototype CI failure and explicitly lacks technical/Android verification. | Android footage showing meaningful district/travel separation and camera readability at the shipped scale; capture must not imply surveyed real-world metres. | `BLOCKED` | #614 reconciliation / DT-01, DT-04, DT-14. |
| `EV-04` | The shipped runtime has one reusable global 10× playable-city authority. | **Contradicted by current code.** `worldLayout.ts` imports `BRAILA_PLAYABLE_DISTANCE_SCALE`, `BRAILA_PLAYABLE_SCALE_VERSION` and `expandBraila*`; `city.ts` exports the current `CITY` as Brăila. Canonical documents describe a global baseline, but the audited runtime still exposes Brăila-specific authority. | No exact multi-locality candidate evidence. | Before this claim can exist: real captures from multiple materially different localities on one governed build, all consuming a locality-generic runtime contract. | `BLOCKED` | DT-01/DT-11/#614/#643. Do not market documentation as runtime proof. |
| `EV-05` | The in-world smartphone exposes Delivery, Map and Money & Assets. | `game-web/src/ui/PlayerSmartphone.ts` defines those three live apps and projects current order, objective, route/cargo/reward, local area/transport/target/distance, and authoritative money/ownership/team/fleet/HQ state. The phone is an overlay rather than a replacement Phaser scene. | No exact current-main Android visual acceptance. | Android landscape capture with the phone open over the real game context; the shown order/money/fleet values must be live state, not edited text. A close/reopen clip should preserve game context if that behavior is part of the message. | `BLOCKED` | DT-21/#349/#317 + DT-14 capture evidence. |
| `EV-06` | Local delivery work exists as a real runtime foundation. | Existing city/order runtime plus `game-web/src/missions/citywideDeliveryDistribution.ts`, which consumes an existing order/delivery reference, governed origin/destination identities, spatial classification and work-eligibility authority without manufacturing demand, cargo, money or capability. | No exact current-main end-to-end Android proof; save continuity remains blocked by #566. | One uninterrupted Android clip: legitimate available work -> accept -> pickup/custody -> travel -> deliver -> accepted completion/result. Any reward text shown must be the real authoritative result. | `BLOCKED` | DT-09/DT-03/DT-06 integration evidence + #566 + #317/DT-14. |
| `EV-07` | Citywide route variety can include local, adjacent-district and cross-city work. | `citywideDeliveryDistribution.ts` recognizes `local`, `adjacent-district`, `cross-city` and delegates classification to world spatial authority rather than inventing DT-09 distance thresholds. | Current spatial implementation remains coupled to Brăila-specific scale/classification code; no Android acceptance. | A future capture set must show genuinely different route classes produced by the candidate, not staged labels. At least one route should visibly communicate materially greater cross-city travel. | `BLOCKED` | DT-01/#614 + DT-09/#615 + exact Android proof. |
| `EV-08` | The first-hour story has authored/locality-aware runtime handoff foundations. | `game-web/src/narrative/firstHourStoryRuntimeHandoff.ts` defines portable narrative role IDs, explicit Brăila character bindings, mission/outcome-gated presentation triggers and the rule that there is **no Brăila fallback** for another locality's missing role binding. | No exact current-main Android visual-story acceptance. | Android footage of the actual first-hour presentation in normal play: named character/presentation -> real mission beat -> real consequence. No document-only story promise. | `BLOCKED` | DT-08/DT-10 player-facing integration + #317 + DT-14. |
| `EV-09` | Company / HQ / employees / fleet are part of current player-facing state. | `PlayerSmartphone.ts` projects company name/money, active employees, fleet counts/assignments and constructed HQ departments from runtime state; the older preview build record also lists existing economy/employees. | The available build record is not the current SHA, and #317 explicitly rejects developer/prototype-style presentation as commercial proof. | Commercial-quality Android frame/clip showing the actual company/HQ/fleet interaction, not merely a debug/status readout. | `BLOCKED` | DT-20 + DT-21/#317 + DT-14. |
| `EV-10` | Supply/demand can causally create logistics opportunities. | `citywideDeliveryDistribution.ts` requires a real `causeRef`, existing order and exact delivery reference; it does not create demand itself. This proves a consumption boundary, not the complete visible causal economy loop. | No exact Android candidate proves the full cause -> opportunity -> mission -> settlement -> world consequence loop. | A truthful sequence must show a source-backed/local economic cause, resulting legitimate work, completion and visible consequence without manually staged values. | `BLOCKED` | DT-07 + DT-09 + DT-03 + DT-18 integration. |
| `EV-11` | Saving/relaunching resumes the same active hero/job/cargo state. | Current authoritative release issue #566 states the active `WorldState` is not preserved and the runtime reconstructs active job/cargo/hero continuity. | No qualifying Android process-kill/relaunch acceptance exists. | Only after #566: record exact candidate, accept/pick up cargo, move materially, save/kill process, relaunch, continue same valid hero/job/cargo with no duplicate settlement. | `BLOCKED` | DT-02/#566. This claim is currently prohibited. |
| `EV-12` | DROPi Tycoon is globally playable city-by-city in the current build. | **Not proven and current runtime evidence is Brăila-specific.** #643 also explicitly separates catalog/source records from playable locality readiness. | No exact candidate demonstrates the required multi-locality lifecycle. | Multi-locality proof described in Section 4, captured from one exact candidate with materially different local realities. | `BLOCKED` | DT-11/#643 + DT-16 release acceptance. |
| `EV-13` | DROPi Tycoon is Google Play / production Android ready. | Repository-side release preflight and AAB attestation tooling exists after #659, but #568 records that the actual production AAB, artifact inspection, Play Internal evidence and physical Android acceptance remain pending. | No production AAB attestation for this audited SHA. | Not a screenshot-only claim. Requires DT-14 artifact attestation + Play Internal/pre-launch evidence + physical Android verification. | `BLOCKED` | DT-14/#568/#570; #565 also remains a commercial gate. |
| `EV-14` | Creator/press seeding can start now. | `LAUNCH_PRESS_KIT_CREATOR_OUTREACH_PACKAGE.md` exists, but its canonical status is `PACKAGE_READY_FOR_REVIEW — OUTREACH_NOT_AUTHORIZED`; #561 also records an orchestrator hold on paid growth/outreach while global/core product evidence is incomplete. | No approved creator candidate build or production media set is tied to this SHA. | Before seeding: exact approved build instructions, owner-validated screenshots/B-roll, known issues, cleared media/branding, public contact and a source-backed creator shortlist. | `BLOCKED` | DT-15 remains on evidence-preparation only; DT-13/14/Owner gates. |

## 4. Required future multi-locality evidence slots

The existing store manifest already owns the general creative plan. This section adds only the **new evidence slots required by #643** before any wording such as `playable across multiple cities`, `global world`, `choose your city`, or equivalent can be considered.

A single Brăila scene with a changed city label is invalid evidence.

### `ML-EV-01` — Brăila premium reference

Capture from the exact candidate:

- locality identity visible through real player-facing world context;
- street/area scale and local visual identity;
- legitimate local work;
- pickup/custody/travel/delivery completion;
- no debug-only evidence substituted for gameplay.

Purpose: prove the premium reference experience, not globality by itself.

### `ML-EV-02` — second Romanian locality

Must be a distinct governed locality, not a Brăila reskin.

Capture:

- enter/open the locality through the real locality/world flow;
- locally distinct layout/identity where source/readiness supports it;
- legitimate locality-scoped work and mission endpoints;
- one completed work loop.

Purpose: prove the reusable system is not Brăila-only inside Romania.

### `ML-EV-03` — non-Romanian European locality

Capture:

- actual non-Romanian locality identity;
- materially local architecture/layout/context rather than renamed Romanian assets where inappropriate;
- legitimate work generated/materialized in that locality;
- normal traversal and delivery completion.

Purpose: prove country/locality portability, not catalog coverage.

### `ML-EV-04` — materially different locality archetype/scale

Use a locality that meaningfully differs in size, density, settlement-development state, or geographic/urban character.

Capture must demonstrate that:

- the same gameplay contracts survive the difference;
- the locality is not artificially inflated into a mature city merely because it exists in the catalog;
- visual and runtime budgets adapt without removing functional play.

Purpose: prove the architecture is not a fixed Brăila-shaped template.

### `ML-EV-05` — relocation / continuity evidence

Only after DT-02 and #643 dependencies permit it:

- begin in one supported locality;
- preserve authoritative state;
- relocate exactly once through the governed flow;
- enter the destination's legitimate runtime;
- save/relaunch where continuity is material;
- prove no silent return to Brăila and no duplicated economic settlement.

Purpose: support any future claim that the player can move between functional localities.

## 5. Creative evidence requirements for #561

No screenshot, trailer or feature graphic is generated by this audit.

For every future production screenshot/video asset:

1. record exact source SHA;
2. record exact Android build identity and artifact provenance;
3. retain the raw capture;
4. record device/resolution/orientation;
5. record any crop/overlay/edit without changing gameplay facts;
6. map the asset to one or more evidence IDs from the canonical claim registry / this audit;
7. remove the asset from production use if its claim is no longer true on the submitted build.

Minimum truthful capture sequence once gates are satisfied:

- screenshot 1: strongest street/locality identity;
- screenshot 2: real work + in-world smartphone/objective;
- screenshot 3: actual scale/strategic transition without implying dead map nodes are playable;
- later screenshots only for claims that become `PUBLIC_GREEN`;
- 20–30 second preview video only from real gameplay on the exact candidate.

A global/multi-locality claim additionally requires `ML-EV-01` through the relevant multi-locality slots. Catalog pins, country JSON, canonical documents or automated tests are not store creative evidence.

## 6. #563 press / creator activation decision

Current decision: `OUTREACH_NOT_AUTHORIZED`.

Allowed now:

- maintain factual internal press-kit structure;
- prepare evidence slots;
- prepare an unpaid micro-creator targeting method without contacting creators;
- describe long-term systems explicitly as roadmap/vision where context requires it.

Not authorized now:

- public creator seeding based on this audited SHA;
- paid growth;
- release-date claims;
- globally playable city claims;
- distribution of screenshots/B-roll that have not passed exact-build truth review;
- implying that source-level first-hour, production, profession, settlement-evolution or global-world foundations are already fully player-facing release features.

## 7. Audit verdict

### Strongest current source-level evidence

- Android landscape configuration and bundled Phaser shell path;
- a Brăila runtime locality with 10× Brăila-specific playable-distance implementation;
- in-world smartphone projection of live Delivery / Map / Money & Assets state;
- citywide delivery-distribution authority that consumes legitimate existing causes/orders/delivery references;
- locality-aware first-hour narrative handoff foundations.

### Strongest current blockers

1. current `main` explicitly carries an accepted Prototype CI failure and lacks technical/Android verification after #641;
2. no exact production AAB / Play Internal / physical Android evidence for this SHA;
3. #317 commercial visual-quality gate remains open;
4. #566 save/mission/cargo continuity remains a P0 blocker;
5. #643 multi-locality functional proof is absent;
6. current runtime city/scale authority still exposes Brăila-specific implementation where global reusable authority is required;
7. #565 commercial provenance/legal gate remains open.

### DT-15 release/growth verdict

`NO-GO FOR PRODUCTION STORE CLAIM PROMOTION`

`NO-GO FOR PUBLIC GLOBAL-PLAYABILITY CLAIM`

`NO-GO FOR CREATOR/PAID GROWTH ACTIVATION`

`GO FOR INTERNAL EVIDENCE PLANNING ONLY`

No existing `AMBER`, `BLUE` or source-only feature is promoted to `PUBLIC_GREEN` by this audit.

## 8. Cross-DT dependencies

- DT-01 / #614: locality-generic playable-scale/spatial authority and Brăila visual calibration.
- DT-02 / #566: authoritative active-world save/relaunch continuity.
- DT-03, DT-06, DT-07, DT-09, DT-18: prove the real causal work/economy chain if it is marketed.
- DT-08 / DT-10: player-facing story/character proof.
- DT-11 / #643: Catalog -> PlayableLocalityInstance/readiness and multi-locality proof.
- DT-13 / #565: commercial rights/provenance clearance.
- DT-14 / #568/#570: exact release artifact, physical Android and Play listing compliance.
- DT-16: independent acceptance before any global-playability release claim.
- DT-21: premium smartphone/HUD/player-facing presentation truth.

## 9. Suggested next DT-15 slice after DT-00 approval/merge

Do not begin automatically.

After this audit is merged, DT-15 should wait for `NEXT MISSION` from DT-00. The next executable growth slice should be triggered by new product evidence, not by a desire to fill marketing inventory. The likely activation point is an exact Android candidate with at least one newly owner-validated `GREEN` player benefit or the first #643 multi-locality proof ready for truthful capture.
