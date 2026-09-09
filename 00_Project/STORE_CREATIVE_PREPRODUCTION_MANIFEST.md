# Document Information

Document: STORE_CREATIVE_PREPRODUCTION_MANIFEST.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical pre-production manifest for #561
Owner Lane: DT-15 — Marketing / Growth / ASO
Language: English
Baseline Main: `65413103c7ae4e1951ac63aacc8e1232643e0bd0`
Prepared: 2026-09-09

---

# DROPi Tycoon — Store Creative Pre-Production Manifest

## 1. Purpose

This document prepares the **pre-production** portion of #561 without creating, fabricating, staging or publishing false gameplay captures.

It defines:

- the store-creative asset manifest;
- the canonical claim registry used by screenshots, trailer, feature graphic and creator-facing store material;
- the screenshot shot plan;
- the 20–30 second trailer shot plan;
- capture provenance requirements;
- truthfulness and release gates;
- the handoff boundary between DT-15 growth/creative work and DT-14 Google Play compliance under #570.

This document does **not**:

- create a screenshot;
- create fake gameplay;
- create a feature graphic;
- create a trailer;
- alter runtime code;
- alter Android packaging;
- declare the current build `ANDROID_VERIFIED`;
- close #561;
- close #570;
- authorize a Play Console upload;
- authorize a release date, paid campaign or pre-registration campaign.

The governing rule remains:

> **Market the playable truth. Describe the roadmap as a roadmap. Never sell documentation as gameplay.**

---

# 2. Source-of-truth hierarchy

For every future creative, use this authority order:

1. the exact candidate Android build being captured;
2. the exact Git SHA associated with that build;
3. owner physical-device validation evidence for the visible slice;
4. canonical runtime/gameplay state on that SHA;
5. `00_Project/GROWTH_MARKETING_LAUNCH_STRATEGY.md`;
6. `00_Project/GOOGLE_PLAY_RELEASE_READINESS.md` for Play constraints;
7. `00_Project/LEGAL_PRIVACY_COMPLIANCE.md` and `00_Project/THIRD_PARTY_LICENSE_REGISTER.md` for rights/compliance boundaries;
8. roadmap/story/design documents only as roadmap context, never as proof that a feature is shipped.

A merged design, domain model, test fixture, data catalog or canonical story document is not by itself evidence that a player can experience the advertised feature in the submitted Android build.

---

# 3. Audited baseline

## 3.1 Current central-orchestrator main

This manifest was prepared from:

`65413103c7ae4e1951ac63aacc8e1232643e0bd0`

That checkpoint includes the integration wave containing, among others:

- Player Economy foundation (#548);
- Professions / Personal Capability foundation (#555);
- Production / Supply Chain foundation (#556);
- Story Bible / Campaign canon (#557);
- Mission Framework (#559);
- France representative-locality data (#574);
- Real-world monetization strategy (#572);
- Legal / privacy / third-party-license baseline (#576);
- Google Play / Android release-readiness canon (#575);
- Growth / marketing / launch strategy (#577).

These merges materially improve product foundations, but they do **not** automatically make their strongest promises store-safe.

## 3.2 Current Android identity

Current repository identity is:

- app name: `DROPi Tycoon`;
- semantic version in `game-mobile/app.json`: `0.0.0`;
- orientation: landscape;
- platform: Android;
- package: `com.dropi.tycoon`;
- launcher icon source: `game-mobile/assets/branding/dropi-tycoon-app-icon.png`.

The existing `game-mobile/BUILD_RECORD_0.0.0.md` points to an older source commit, not the current main checkpoint, and records physical owner validation as pending in that build record.

Therefore this document declares **zero current production-ready gameplay screenshots**.

## 3.3 Current visible-work caveat

At preparation time, visible specialist work still exists outside current main, including:

- #547 Brăila semantic-label / pinch-quality work — open and explicitly pending owner Android acceptance;
- #551 Living City crossing work — open and pending owner Android acceptance;
- #558 Visual Storytelling — open draft and not `ANDROID_VERIFIED`.

No store creative may capture those branch-only features as if they are part of the current production candidate.

---

# 4. Claim status model

Use the four statuses already defined by the canonical growth strategy.

| Status | Meaning | Production store use |
|---|---|---|
| `GREEN` | Implemented, integrated and owner-validated on the exact current Android release candidate | Allowed |
| `AMBER` | Implemented/merged or otherwise evidenced, but not fully integrated, visible, release-complete or owner-validated | Not allowed as a production claim |
| `BLUE` | Canonical roadmap/design direction, not materially player-facing in the release candidate | Roadmap/devlog only |
| `RED` | False for the candidate, contradicted by known defect, obsolete, speculative or misleading | Prohibited |

## 4.1 GREEN promotion rule

A claim can move to `GREEN` only when all applicable conditions are true:

- implementation is in the exact source SHA captured;
- the player can reach the behavior through normal gameplay;
- the visual shown is not a debug/dev-only surface;
- the claim survives restart/save/resume where continuity is material;
- owner physically validates the relevant slice on Android landscape;
- #317 quality expectations are met for the visible scene;
- rights/provenance are cleared under #565 where third-party/generated assets or data appear;
- DT-14 confirms the screenshot/metadata is acceptable under #570 for production use.

A passing unit test, merged PR or canonical Markdown file is insufficient on its own.

---

# 5. Canonical claim registry

The registry below is intentionally conservative. It is the starting state for pre-production planning, not a launch claim list.

| ID | Candidate claim / concept | Status now | Evidence type | Production use now | Promotion requirement |
|---|---|---|---|---|---|
| `CLM-001` | DROPi Tycoon is an Android-first landscape game | `AMBER` | Repository/app configuration | No | Exact candidate build + DT-14 artifact verification |
| `CLM-002` | The player is embodied as a person/hero inside Brăila | `AMBER` | Current runtime foundation | No | Current candidate capture + #317 owner validation |
| `CLM-003` | Brăila uses a real-map-inspired street/address/city foundation | `AMBER` | Current runtime/data foundation | No | Current candidate capture + #317 + #565/OSM release review |
| `CLM-004` | The player can take and complete local delivery work | `AMBER` | Existing gameplay foundation | No | Exact-candidate end-to-end Android proof and continuity check |
| `CLM-005` | Delivery/order information is presented through the in-world smartphone experience | `AMBER` | Existing runtime surface | No | Current Android visual validation and clean capture |
| `CLM-006` | The player can move from street-level play toward wider strategic/world views | `AMBER` | Current hero/world zoom foundation | No | Exact-candidate visual validation with no branch-only features |
| `CLM-007` | Company/HQ/employee-management gameplay is part of the experience | `AMBER` | Existing runtime foundations | No | #317-quality presentation + owner validation on candidate |
| `CLM-008` | The canonical journey starts as a poor employee / from personal economic scarcity | `AMBER` | Player Economy domain merged | No | Runtime/GameSession integration + first-session Android proof |
| `CLM-009` | Players earn professions, qualifications and work eligibility | `AMBER` | Capability domain merged | No | Player-facing integrated work-access flow + owner proof |
| `CLM-010` | Supply, demand, inventory and production causally create logistics opportunities | `AMBER` | Production domain merged | No | Visible integrated systemic loop in normal gameplay |
| `CLM-011` | Recurring named characters and authored story are part of the playable opening | `BLUE` | Story canon exists; visible storytelling not in current main | No | Runtime integration + merged visual presentation + owner proof |
| `CLM-012` | Player choices create persistent authored narrative consequences | `BLUE` | Mission framework/campaign design | No | Authored content + persistence + visible consequence proof |
| `CLM-013` | Saving and relaunching seamlessly resumes the same active hero/job/cargo state | `RED` | Known blocker #566 | Prohibited | #566 closed with Android process-kill/relaunch evidence |
| `CLM-014` | The current release offers globally playable city-by-city logistics gameplay | `RED` | Global/country data does not prove full playable cities | Prohibited | Actual playable release scope must support the claim |
| `CLM-015` | Multiplayer/company society/chat is available now | `BLUE` | Future/canonical direction | Prohibited as current feature | Implemented, safe, compliant and release-validated multiplayer |
| `CLM-016` | Drone-network gameplay is available now | `BLUE` | Future direction | Prohibited as current feature | Player-facing release implementation and validation |
| `CLM-017` | Paid cosmetics, VIP, rewarded ads or other real-money monetization is available now | `RED` | Strategy exists; runtime monetization not present | Prohibited | Separate commercial implementation/release gates |
| `CLM-018` | `Start local. Build a logistics legacy.` is the launch tagline | `AMBER` | Approved growth positioning candidate | Not final | Release-candidate expectation-match review |
| `CLM-019` | `Human-scale logistics RPG + business tycoon simulation` is the category position | `AMBER` | Canonical growth positioning | Not a feature claim yet | Ensure first-session/build evidence supports both halves |
| `CLM-020` | `Your work leaves a mark` / economic action visibly changes the world | `BLUE` | Product promise with partial domain foundations | No | Visible causal world consequences in candidate |

## 5.1 Immediate forbidden marketing statements

Until the corresponding promotion gate is met, do not use production-store copy such as:

- `Seamlessly continue every job where you left off`;
- `Explore playable cities around the world`;
- `Build a global multiplayer logistics empire`;
- `Master dozens of playable professions`;
- `Run a living production economy`;
- `Shape every relationship through story choices`;
- `Build your drone network`;
- `Trade with real players`;
- any statement implying that country-catalog coverage equals complete local playable-world coverage;
- any statement implying that a merged domain engine is already visible and accessible in the normal first-session flow.

---

# 6. Store creative asset manifest

No binary creative is produced by this PR. The following entries reserve the expected production artifacts and their evidence requirements.

| Creative ID | Asset | Required output | Current state | Claim dependency | Handoff |
|---|---|---|---|---|---|
| `CRE-ICON-001` | Google Play icon | 512x512 Play-compliant icon derived from approved identity | Source identity exists; final compliance not proven | Brand/provenance | #570 + #565 |
| `CRE-FG-001` | Feature graphic | 1024x500 promotional graphic | Brief only; no asset produced | `CLM-018`, release-safe visual cues | #570 + #565 |
| `CRE-SS-001` | Screenshot 1 | Authentic landscape gameplay, target >=1920x1080 output | Shot plan only | `CLM-002`, `CLM-003` | #570 |
| `CRE-SS-002` | Screenshot 2 | Authentic landscape gameplay, target >=1920x1080 output | Shot plan only | `CLM-004`, `CLM-005` | #570 |
| `CRE-SS-003` | Screenshot 3 | Authentic landscape gameplay, target >=1920x1080 output | Shot plan only | `CLM-006` | #570 |
| `CRE-SS-004` | Screenshot 4 | Authentic delivery consequence/completion frame | Shot plan only | `CLM-004` | #570 |
| `CRE-SS-005` | Screenshot 5 | Company/HQ/management frame | Conditional shot only | `CLM-007` | #317 + #570 |
| `CRE-SS-006` | Screenshot 6 | Career/profession progression frame | Blocked pre-production concept | `CLM-008`, `CLM-009` | Integration + #570 |
| `CRE-SS-007` | Screenshot 7 | Character/story frame | Blocked pre-production concept | `CLM-011`, `CLM-012` | DT-10 + #570 |
| `CRE-SS-008` | Screenshot 8 | Causal supply/demand/production frame | Blocked pre-production concept | `CLM-010`, `CLM-020` | Integration + #570 |
| `CRE-TR-001` | Core preview trailer | 20–30 second real-gameplay cut | Shot plan only | Only GREEN claims in final cut | #570 + #565 |

## 6.1 Store asset count target

Planning target:

- mandatory production set: at least the Play-required minimum validated by DT-14;
- project quality target: **3 strong landscape screenshots first**, then expand toward **6–8** only when later claims genuinely become GREEN;
- never fill the carousel with weak menu screens merely to reach a target count.

The first three screenshots should be capable of explaining the current game fantasy without the viewer reading the long description.

---

# 7. Screenshot shot plan

## 7.1 `CRE-SS-001` — Street-level identity

**Working benefit:** `Work the city from street level.`

Required frame:

- recognizable embodied hero;
- Brăila world visible at useful gameplay scale;
- streets/city context legible;
- no debug panel dominating the frame;
- no branch-only semantic labels unless that branch is merged into the captured SHA and owner accepted;
- required OSM attribution remains visible wherever the shipped experience requires it.

Claims:

- `CLM-002`;
- `CLM-003`.

Current eligibility:

`AMBER — CAPTURE CANDIDATE ONLY.`

Production blocker:

- exact candidate Android build not yet established;
- #317 remains open;
- current #547 visual work remains separately pending owner acceptance;
- #565 must clear release-facing data/asset provenance obligations.

Suggested overlay after GREEN:

`Work the city from street level.`

Alt-text draft after actual frame exists:

`Player courier moving through the Brăila game world in landscape view.`

Do not finalize alt text until the exact frame is known.

## 7.2 `CRE-SS-002` — First work / smartphone

**Working benefit:** `Take local delivery work.`

Required frame:

- in-world smartphone/order surface open or visibly integrated with the world;
- a real reachable order/objective from the captured build;
- surrounding gameplay still recognizable;
- no fabricated order, destination, reward, timer or mission text added in editing.

Claims:

- `CLM-004`;
- `CLM-005`.

Current eligibility:

`AMBER — CAPTURE CANDIDATE ONLY.`

Production blocker:

- current exact-build visual validation;
- #566 must be considered if the message implies persistent job continuity.

Suggested overlay after GREEN:

`Take real work. Learn the city.`

Never use:

`Your jobs always resume exactly where you left them` while #566 is unresolved.

## 7.3 `CRE-SS-003` — Street to strategy

**Working benefit:** `See the city. Think bigger.`

Required frame:

- actual wider strategic/world view reached through normal gameplay;
- ideally retain enough context to make the scale transition understandable;
- never imply that every visible country/locality is a complete playable city.

Claim:

- `CLM-006`.

Current eligibility:

`AMBER — CAPTURE CANDIDATE ONLY.`

Suggested overlay after GREEN:

`From street level to bigger decisions.`

Forbidden overlay:

`Play every city in the world.`

## 7.4 `CRE-SS-004` — Complete the work

**Working benefit:** `Finish the delivery. Build momentum.`

Required frame:

- authentic delivery completion or accepted authoritative result state;
- reward/progression feedback only if it is actually produced by the current candidate;
- no manually edited money, reputation, cargo or mission values.

Claim:

- `CLM-004`.

Current eligibility:

`AMBER — CAPTURE CANDIDATE ONLY.`

Special rule:

Do not frame the screenshot as proof of seamless save/resume while #566 remains open.

## 7.5 `CRE-SS-005` — Company / HQ

**Working benefit:** `Turn work into a business.`

Required frame:

- real current company/HQ/employee gameplay;
- commercial-quality presentation under #317;
- no developer-style panel used as the hero screenshot;
- no ownership state that contradicts the release candidate's actual player lifecycle.

Claim:

- `CLM-007`.

Current eligibility:

`AMBER — CONDITIONAL.`

This shot is not required in the first three. If its presentation is materially weaker than street-level gameplay, omit it rather than weaken the store page.

## 7.6 `CRE-SS-006` — Career progression

**Working benefit:** `Build capability before you build power.`

Claims:

- `CLM-008`;
- `CLM-009`.

Current eligibility:

`BLOCKED.`

Reason:

The merged economy/capability foundations are not sufficient evidence that the full first-session career/profession journey is visibly integrated.

Do not create a fake profession tree, mock qualification UI or staged unlock screenshot.

## 7.7 `CRE-SS-007` — Story / recurring characters

**Working benefit:** `Meet the people behind the work.`

Claims:

- `CLM-011`;
- `CLM-012`.

Current eligibility:

`BLOCKED.`

Reason:

Story Bible and Mission Framework are merged, but visible storytelling remains a separate unfinished visible lane at preparation time.

Do not use character canon, concept art or procedural portrait design as proof that the current submitted build contains the scene.

## 7.8 `CRE-SS-008` — Causal economy

**Working benefit:** `Supply and demand create the work.`

Claims:

- `CLM-010`;
- `CLM-020`.

Current eligibility:

`BLOCKED.`

Reason:

Production/supply-chain domain foundations are merged, but the store screenshot must prove player-visible causal integration rather than a domain model or test.

Do not manufacture inventory shortages or chart values for marketing.

---

# 8. Recommended production carousel order

Once the relevant claims become GREEN, the preferred ordering is:

1. `CRE-SS-001` — human-scale Brăila identity;
2. `CRE-SS-002` — actual local work / smartphone;
3. `CRE-SS-003` — wider strategic scale;
4. `CRE-SS-004` — completion/progression result;
5. `CRE-SS-005` — company/HQ only if visually strong and lifecycle-accurate;
6. `CRE-SS-006` — career/profession only after integrated;
7. `CRE-SS-007` — story only after visible and accepted;
8. `CRE-SS-008` — supply/demand only after visibly causal.

If only four claims are GREEN at production time, ship four strong screenshots rather than padding the set with roadmap material.

---

# 9. Trailer shot plan — `CRE-TR-001`

## 9.1 Format

Target core cut:

- duration: 20–30 seconds;
- real gameplay dominant;
- no long logo intro;
- understandable with sound disabled;
- text overlays short and localizable;
- no ads in the preview-video experience;
- no unlicensed music/audio;
- no roadmap-only footage.

## 9.2 Primary shot list

| Time | Shot | Claim IDs | Status now | Fallback |
|---|---|---|---|---|
| `0.0–2.5s` | Hero already moving in Brăila; immediate street-level proof | `CLM-002`, `CLM-003` | AMBER | Hold on clean current-world movement |
| `2.5–6.0s` | Approach an objective / open in-world smartphone order | `CLM-004`, `CLM-005` | AMBER | Use only clean current order state |
| `6.0–10.5s` | Pickup / cargo interaction | `CLM-004` | AMBER | Extend movement toward delivery |
| `10.5–14.5s` | Delivery completion / authentic result feedback | `CLM-004` | AMBER | Use a second clean delivery-world beat |
| `14.5–19.0s` | Company/HQ or career escalation | `CLM-007` or later `CLM-008/009` | CONDITIONAL/BLOCKED | Replace with additional city/logistics proof |
| `19.0–24.0s` | Street-to-strategic/world scale transition | `CLM-006` | AMBER | Wider Brăila view only |
| `24.0–28.0s` | Logo + release-safe tagline | `CLM-018` | AMBER | Logo + `DROPi Tycoon` only |

## 9.3 Production-cut rule

A shot is removed from the final cut if any claim attached to it is not GREEN on the exact captured candidate.

The trailer must still work if all company/career/story/production shots are removed. The safe fallback narrative is:

`person in Brăila -> local work -> pickup/delivery -> wider strategic view -> DROPi Tycoon`.

## 9.4 Overlay script candidates

These are working copy, not final release copy:

- `Start local.`
- `Take the work.`
- `Learn the city.`
- `Think bigger.`
- final candidate: `Start local. Build a logistics legacy.`

Do not place `Build a logistics legacy` in the production trailer if the release candidate does not materially support growth beyond the local delivery loop.

## 9.5 Audio rule

Default pre-production assumption:

- no third-party music;
- no stock soundtrack without documented commercial rights;
- game audio may be used only if its own provenance/release status is valid;
- music/audio selection must satisfy #565 before production publication.

---

# 10. Feature graphic brief — `CRE-FG-001`

No feature graphic is created in this task.

Future brief:

- product identity is primary;
- hero/person and Brăila/logistics context may be used only in a manner consistent with shipped gameplay;
- promotional illustration may be used as promotional illustration, but must not masquerade as a gameplay screenshot;
- do not include drone swarms, multiplayer players, huge fleets, factories, global city networks or other systems merely because they exist in roadmap/canon;
- any recurring character shown must be part of the release experience and use legally cleared production art;
- optional tagline is `Start local. Build a logistics legacy.` only after expectation-match review.

The final file-format, dimensions and Play metadata validation belong to #570 / DT-14.

---

# 11. Icon brief — `CRE-ICON-001`

Existing approved identity sources must be reused before inventing a new store identity.

Known repository sources include:

- `game-mobile/assets/branding/dropi-tycoon-app-icon.png`;
- `game-mobile/assets/branding/dropi-tycoon-logo.png`;
- corresponding governed branding references under `08_Assets/`.

Pre-production rule:

- do not redesign the brand simply to create activity;
- verify small-size recognition and Play presentation later;
- do not add truck imagery so strongly that the listing promises a dedicated truck-driving simulator;
- final Play pixel/file compliance belongs to #570;
- commercial-rights/provenance clearance belongs to #565.

---

# 12. Capture provenance contract

Every raw screenshot and trailer source clip must have an accompanying manifest record containing at least:

```text
creativeId
captureUtc
sourceGitSha
versionName
versionCode
buildChannelOrTrack
EasBuildIdIfApplicable
aabSha256IfApplicable
deviceModel
androidVersion
nativeCaptureWidth
nativeCaptureHeight
orientation
sceneOrPlayerPath
playerStateSummary
claimIds
rawFileName
rawFileSha256
cropOrEditDescription
overlayTextIfAny
thirdPartyVisibleElements
ownerVisualValidation
agent13RightsReview
agent14PlayReview
productionEligible
```

## 12.1 Editing rules

Allowed when truthful:

- crop to a Play-safe aspect ratio without changing gameplay meaning;
- resize without stretching;
- add a concise marketing text overlay outside critical UI;
- apply ordinary export compression;
- redact accidental private/testing identifiers if the redaction does not misrepresent gameplay.

Prohibited:

- compositing a fake HUD;
- adding a vehicle/character/building not present in the raw frame;
- replacing a debug surface with a fabricated production UI;
- changing money, cargo, inventory, route, reward or mission values;
- editing in a fake destination or street;
- merging two gameplay moments into a single image that appears to be one real frame;
- stretching phone captures to imitate tablet compatibility;
- hiding a material defect that changes the player's expectation of the experience.

---

# 13. Screenshot capture protocol

For each candidate screenshot:

1. identify exact candidate SHA;
2. confirm candidate build is the build intended for the applicable Play test/release track;
3. record versionName/versionCode/build ID before play;
4. reset or prepare game state through normal supported gameplay only;
5. navigate to the intended scene without dev-console state injection unless the result can also be reached normally and the capture record explicitly documents setup;
6. verify no unrelated debug/developer overlays are visible;
7. capture raw Android landscape frame;
8. preserve the raw file unchanged;
9. calculate/store its SHA-256 in the capture manifest;
10. assign claim IDs;
11. compare each claim to the registry;
12. reject the frame if any necessary claim is not GREEN for production;
13. perform only permitted crop/export edits;
14. retain edit description and derived-file hash;
15. obtain owner visual acceptance for #317-sensitive material;
16. obtain #565 rights/provenance clearance where applicable;
17. hand the accepted creative to DT-14/#570 for Play technical/policy validation.

---

# 14. Production eligibility checklist

A screenshot or trailer clip is production-eligible only when all applicable boxes are true:

- [ ] Raw source is from the exact submitted/release-candidate build.
- [ ] Source Git SHA is recorded.
- [ ] Build/version identity is recorded.
- [ ] Raw source file hash is recorded.
- [ ] Every represented claim is `GREEN`.
- [ ] No branch-only feature is shown unless that branch is merged into the captured SHA.
- [ ] No future system is implied through overlay copy.
- [ ] #317-visible quality is owner accepted.
- [ ] #566 continuity defect is not contradicted by copy or footage.
- [ ] #565 rights/provenance requirements are satisfied for visible assets/data/audio.
- [ ] Any privacy-sensitive/test identifiers are absent or safely handled.
- [ ] DT-14 confirms Play technical/policy requirements under #570.
- [ ] Final file is not stretched or materially deceptive.
- [ ] Alt text describes the actual final frame.

---

# 15. Current blocker map for #561

## P0 / hard production blockers

### #317 — owner visual quality gate

Store material must not immortalize prototype/debug presentation as the commercial identity.

### #565 — third-party notices / asset and data provenance

Commercial store material must not use unresolved third-party/generated assets, marks, music or data presentation without the required rights and attribution treatment.

### #566 — active save/mission/cargo continuity

Do not advertise seamless evolving-run/job continuity while this known blocker is unresolved.

### #567 / #568 — production Android runtime and reproducible AAB

The final store pack must correspond to the real production-candidate Android architecture/artifact, not an obsolete preview build.

### #569 — privacy / Data Safety / App Content

This primarily gates release rather than the composition of a screenshot, but the final listing package cannot be production-complete without consistent declarations.

### #570 — Play listing technical/policy packaging

DT-15 owns creative truth/message selection. DT-14 owns final Play-format/policy compliance and listing packaging.

## Visible-claim dependencies

- #547 must be merged and owner accepted before its semantic-label/pinch presentation can appear in production creative;
- #551 must be merged and owner accepted before its crossing/living-city visual behavior is marketed as current;
- #558 must be merged, reconciled and owner accepted before its character/dialogue scenes can appear in production creative.

---

# 16. DT-15 / DT-14 handoff contract

## DT-15 owns

- claim registry;
- message hierarchy;
- screenshot benefit/order strategy;
- trailer story structure;
- creative expectation matching;
- truthful overlay copy;
- rejection of roadmap-only marketing.

## DT-14 / #570 owns

- Play asset technical specifications and final compliance verification;
- final submitted-build matching;
- Play metadata limits;
- Play Console asset package;
- feature-graphic/icon/screenshot format verification;
- preview-video platform requirements;
- release-track timing and production submission process.

Neither lane may override #565 rights/provenance or #317 owner visual acceptance.

---

# 17. Localization preparation

Do not localize screenshots before the base English frame and claim are approved.

Initial preparation order when production creative exists:

1. English master;
2. Romanian localized overlay variant if retained for the release/testing strategy;
3. later languages only after actual market/support prioritization.

For every localized overlay:

- preserve the same underlying gameplay frame;
- translate benefit copy, not gameplay facts into stronger promises;
- do not expand a GREEN English claim into a non-GREEN localized claim;
- maintain safe margins and legibility in landscape;
- keep an overlay-free master for future experiments.

---

# 18. Naming convention for future creative files

Suggested deterministic naming:

```text
dropi-tycoon_<creative-id>_<locale>_<versionName>_<versionCode>_<shortSha>_<variant>.<ext>
```

Examples after real capture exists:

```text
dropi-tycoon_CRE-SS-001_en_0.0.1_12_a1b2c3d_base.png
dropi-tycoon_CRE-TR-001_en_0.0.1_12_a1b2c3d_store.mp4
```

Do not use these examples as evidence that version `0.0.1` or versionCode `12` exists; they demonstrate naming shape only.

---

# 19. Pre-production deliverable status

Completed by this document:

- [x] exact current-main baseline recorded;
- [x] current Android/build mismatch noted;
- [x] claim registry created;
- [x] current unsafe claims explicitly blocked;
- [x] 8-slot screenshot plan created;
- [x] 20–30 second trailer plan created;
- [x] feature-graphic brief created;
- [x] icon brief created;
- [x] raw capture provenance contract created;
- [x] allowed/prohibited editing rules created;
- [x] DT-15 / DT-14 handoff documented;
- [x] #317/#565/#566/#567–#570 dependencies reconciled;
- [x] no fake capture created.

Still required before #561 can close:

- [ ] production-candidate Android build exists and is identified;
- [ ] current visible slice passes owner Android quality acceptance;
- [ ] minimum required GREEN claims exist for a coherent first-three-screenshot narrative;
- [ ] real raw captures are produced and hashed;
- [ ] derived store images are produced from those real captures;
- [ ] icon and feature graphic are finalized from cleared sources;
- [ ] trailer is cut from real candidate gameplay only;
- [ ] rights/provenance review is complete;
- [ ] DT-14/#570 validates technical and Play policy compliance;
- [ ] owner approves final production store pack.

---

# 20. Immediate next capture decision

Do **not** begin production screenshot capture merely because this manifest exists.

The next valid capture checkpoint is the first Android release/test candidate for which:

- the exact Git SHA is known;
- relevant visible work is merged;
- #317 acceptance is obtained for the scenes being marketed;
- included claims can be promoted to GREEN;
- the build is sufficiently close to the submitted architecture that screenshots will not immediately become obsolete.

Until then, use this manifest to prepare framing, state setup and messaging only.
