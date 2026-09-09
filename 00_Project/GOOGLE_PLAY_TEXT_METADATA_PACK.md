# Document Information

Document: GOOGLE_PLAY_TEXT_METADATA_PACK.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical textual Google Play metadata pack for #570
Owner Lane: DT-15 — Marketing / Growth / ASO
Coordination: DT-14 — Google Play / Android Release
Language: English
Baseline Main: `647adfe31e38c47ad73e3a4e98ece70407ffa28c`
Prepared: 2026-09-09

---

# DROPi Tycoon — Google Play Text Metadata Pack

## 1. Purpose

This document is the canonical **textual** Google Play metadata source for #570.

It prepares:

- app-title options and the current recommendation;
- short-description copy;
- modular full-description copy;
- feature/benefit hierarchy;
- claim-to-evidence mapping;
- screenshot-caption governance;
- trailer text-card governance;
- localization-ready string IDs;
- first localization priorities;
- store keyword/theme guidance;
- accessibility / alt-text drafts for planned assets.

This document does **not**:

- create or upload a Google Play listing;
- create screenshots, a feature graphic, icon derivative or trailer;
- mark any visual as `ANDROID_VERIFIED`;
- promote an AMBER, BLUE or RED gameplay claim to production use;
- close #561;
- close #565, #567, #568, #569, #570 or #571;
- authorize a release date, pre-registration, creator spend or paid acquisition.

The governing rule remains:

> **Market the playable truth. Describe the roadmap as a roadmap. Never sell documentation as gameplay.**

---

# 2. Current release-truth checkpoint

## 2.1 Main audited

This pack is based on exact `main`:

`647adfe31e38c47ad73e3a4e98ece70407ffa28c`

The latest integration wave includes, among other work:

- Player Economy runtime adapter;
- Personal Capability work-access adapter;
- mission resume contract;
- first-hour narrative IDs/content contract;
- producer demand -> systemic mission integration;
- V1 monetization catalog/entitlement strategy;
- #561 store-creative pre-production manifest;
- Germany representative locality data;
- #565 engineering provenance/third-party-notice implementation;
- #567 bundled Phaser production-runtime implementation.

These merges improve implementation readiness. They do **not** automatically make their strongest claims production-store safe.

## 2.2 Release gates still material to metadata

At this checkpoint:

- #561 remains open because real owner-validated production captures do not yet exist;
- #565 remains open for unresolved generated-art provenance, brand/trademark clearance and final ODbL legal characterization;
- #567 is implemented in source, but the physical Android acceptance required by that issue is not complete;
- #568 remains open for an exact reproducible production AAB and artifact attestation;
- #569 remains open for Privacy Policy, Data Safety and App Content declarations;
- #570 remains open for the final combined Play listing package;
- #571 remains an owner-side Play Console/signing/testing/production-access gate;
- visible PRs #547, #551 and #558 remain pending the owner Android acceptance process;
- PR #586 remains open, so a seamless active world/job/cargo resume claim is not promoted merely because #566 currently shows closed in GitHub.

## 2.3 Current claim activation state

The canonical #561 manifest requires a claim to be implemented, integrated and owner-validated on the exact Android release candidate before it becomes GREEN.

At this checkpoint, the project still has **zero production-enabled gameplay marketing claims** under that strict definition.

Therefore:

- the metadata text is **TEXT_READY**;
- gameplay-dependent lines remain **PUBLICATION_HOLD** until their listed claims become GREEN;
- screenshot captions have **no active production caption** yet;
- trailer gameplay text cards have **no active production message** yet;
- only brand-identification text may exist without implying unverified gameplay.

This is intentional. #570 must not become a route around #561 or #317.

---

# 3. Google Play textual constraints

Official Play guidance rechecked on 2026-09-09:

- app name: maximum 30 characters;
- short description: maximum 80 characters;
- full description: maximum 4,000 characters;
- avoid repetitive or irrelevant keyword stuffing;
- metadata must accurately describe actual functionality/content;
- do not use ranking, award, download-count, price or promotional claims as metadata hooks;
- do not use `download now`, `install now`, `play now` or similar calls-to-action in the short description;
- all localized listing text is subject to the same policy expectations;
- the default Play listing language is normally English (United States), with additional localized listings added separately.

Official source register:

- https://support.google.com/googleplay/android-developer/answer/9859152
- https://support.google.com/googleplay/android-developer/answer/9866151
- https://support.google.com/googleplay/android-developer/answer/13393723
- https://support.google.com/googleplay/android-developer/answer/9898842

DT-14 remains the final authority for then-current Play technical/policy validation before upload.

---

# 4. App title

## 4.1 Options

| Option | Text | Characters | Status | Notes |
|---|---|---:|---|---|
| A | `DROPi Tycoon` | 12 | **Recommended now** | Brand-first; adds no unverified feature/category promise. |
| B | `DROPi Tycoon: Logistics` | 23 | HOLD until `CLM-019` GREEN | Stronger ASO/category clarity once the exact candidate proves the logistics + tycoon experience. |
| C | `DROPi Logistics Tycoon` | 22 | Test alternative after `CLM-019` GREEN | Clear category words but weaker brand cadence than Option B. |

## 4.2 Recommendation

**Current canonical title recommendation: `DROPi Tycoon`.**

Reason:

- it is the existing product identity;
- it does not spend the title field on a feature/category promise while the strict claim registry has no GREEN gameplay claim;
- it leaves room for a later Play Store Listing Experiment once the exact candidate proves the category promise.

When `CLM-019` becomes GREEN, test Option B against Option A rather than changing the title by assumption.

## 4.3 Prohibited title patterns

Do not use:

- `DROPi Tycoon: Best Logistics Game`;
- `DROPi Tycoon: #1 Delivery Game`;
- `DROPi Tycoon: Free Logistics`;
- `DROPi Tycoon: Global Multiplayer`;
- `DROPi Tycoon: Truck Simulator`;
- `DROPi Tycoon: Drone Empire`.

These are policy-risky, misleading, unsupported or expectation-mismatched.

---

# 5. Short description

## 5.1 Recommended release-target copy

`Start local, take delivery work, and build your path in logistics.`

Character count: **66 / 80**.

Claim dependencies:

- `CLM-002` — embodied person/hero inside Brăila;
- `CLM-004` — local delivery work;
- `CLM-018` — start-local positioning;
- `CLM-019` — logistics/tycoon category fit.

Current state:

**PUBLICATION_HOLD — all listed gameplay/category dependencies must be GREEN on the submitted candidate.**

## 5.2 Reduced fallback copy

`Take local delivery work and build your path in DROPi Tycoon.`

Character count: **61 / 80**.

Use only if:

- `CLM-004` is GREEN;
- the broader `CLM-019` logistics/tycoon positioning still needs a narrower formulation.

## 5.3 Brand-only emergency fallback

`Build your future in DROPi Tycoon.`

This avoids an unsupported gameplay promise, but it is intentionally **not recommended** as a production listing because it does not explain the game's core purpose well enough.

If the stronger copy cannot become truthful before submission, the correct action is to delay the listing rather than hide an under-validated product behind vague copy.

---

# 6. Full description

## 6.1 Release-target base description

The following base description is text-ready but must not be published until every referenced base claim is GREEN:

> DROPi Tycoon is a human-scale logistics simulation built around starting small and learning a city through work.
>
> Begin as one person in Brăila. Move through the city at street level, take local delivery work, and use the in-world smartphone to follow active jobs. Complete deliveries and move between street-level play and wider strategic views.
>
> The store page shows only systems verified in the submitted Android build. Features still in development are not presented as current gameplay.

Base claim dependencies:

- `CLM-002` — embodied player;
- `CLM-003` — Brăila city foundation;
- `CLM-004` — delivery work;
- `CLM-005` — in-world smartphone/order surface;
- `CLM-006` — street-to-strategic scale;
- `CLM-019` — human-scale logistics category.

## 6.2 Optional GREEN-only modules

Append a module only when every claim listed for that module is GREEN on the submitted build.

### Module A — Company / HQ

Copy:

> Grow beyond individual work into company and HQ decisions as your responsibilities expand.

Dependency:

- `CLM-007`.

### Module B — Career / professions

Copy:

> Build capability through real work access, qualifications and profession progression instead of receiving every role from the start.

Dependencies:

- `CLM-008`;
- `CLM-009`.

### Module C — Story / recurring characters

Copy:

> Meet recurring characters and follow authored missions whose outcomes stay connected to the same world and work systems.

Dependencies:

- `CLM-011`;
- `CLM-012`.

### Module D — Supply / production causality

Copy:

> Respond to logistics opportunities created by real inventory, supply and demand inside the simulation.

Dependencies:

- `CLM-010`;
- `CLM-020` only if visible world consequence language is also used.

### Module E — Save / resume continuity

No production module is authorized yet.

Never add wording such as:

`Continue every active job exactly where you left it.`

until the integrated current-main implementation and installed Android process-kill/relaunch evidence support that promise.

## 6.3 Feature bullet construction rule

If bullets are used in the eventual Play description, regenerate them from GREEN claims only.

Example structure after validation:

- street-level Brăila gameplay;
- local delivery work;
- in-world smartphone objectives;
- wider strategic views;
- company/HQ progression;
- career/profession progression;
- recurring narrative characters;
- systemic supply/demand opportunities.

A bullet is removed, not softened, if its supporting claim is not GREEN.

## 6.4 Prohibited full-description claims

Do not publish statements implying current availability of:

- globally playable city-by-city worlds;
- multiplayer company society or chat;
- drone-network gameplay;
- real-money cosmetics/VIP/ads merely because a commercial catalog document exists;
- persistent story consequences before authored runtime integration is verified;
- seamless active-job resume before the current integrated candidate proves it;
- `world's first`, `most realistic`, `best`, `#1`, `ultimate` or similar unsupported superiority claims;
- real-money earning, cash-out, token/NFT or investment functionality.

---

# 7. Feature / benefit hierarchy

This is the order marketing should use once claims become GREEN.

| Priority | Player benefit | Claim IDs | Current state |
|---|---|---|---|
| 1 | Be a person inside the city, not only an abstract fleet manager | `CLM-002`, `CLM-003` | HOLD |
| 2 | Take understandable local delivery work | `CLM-004` | HOLD |
| 3 | Keep work connected to the in-world smartphone | `CLM-005` | HOLD |
| 4 | Move between street-level action and wider strategic views | `CLM-006` | HOLD |
| 5 | Grow from work toward company/HQ responsibility | `CLM-007` | HOLD |
| 6 | Build career capability and professions | `CLM-008`, `CLM-009` | HOLD |
| 7 | Meet recurring characters and authored story | `CLM-011`, `CLM-012` | HOLD |
| 8 | Experience supply/demand/production causality | `CLM-010`, `CLM-020` | HOLD |

The first four are the preferred initial release story because they are the nearest existing runtime proof points. `HOLD` does not mean removed from the product; it means not yet authorized for production-store messaging.

---

# 8. Claim -> evidence matrix

| Claim | Current evidence on latest main | Release-marketing status | Required promotion evidence |
|---|---|---|---|
| `CLM-001` Android-first landscape game | `game-mobile/app.json`; #590 source implementation | AMBER | #568 exact production AAB + physical Android acceptance |
| `CLM-002` embodied hero in Brăila | existing runtime foundation | AMBER | exact candidate capture + #317 owner acceptance |
| `CLM-003` real-map-inspired Brăila | runtime/data foundation + OSM notices implementation | AMBER | candidate capture + #317 + unresolved #565 legal/provenance closure |
| `CLM-004` local delivery work | existing delivery loop | AMBER | exact candidate end-to-end Android proof; no stale branch-only behavior |
| `CLM-005` in-world smartphone work surface | current runtime surface | AMBER | exact Android visual acceptance |
| `CLM-006` street-to-strategic view | current zoom/world foundation | AMBER | exact Android visual acceptance |
| `CLM-007` company/HQ/employee gameplay | existing runtime foundation | AMBER | #317-quality owner acceptance |
| `CLM-008` employee-first scarcity/work journey | Player Economy + runtime adapter merged | AMBER | actual first-session GameSession integration and Android proof |
| `CLM-009` professions/work eligibility | capability + work-access adapter merged | AMBER | player-facing normal-flow integration and Android proof |
| `CLM-010` causal supply/demand work | production + systemic mission bridge merged | AMBER | player-facing normal-flow integration and Android proof |
| `CLM-011` recurring story characters playable | story canon exists; #558 still not accepted mainline player proof | BLUE | merged visible story integration + owner acceptance |
| `CLM-012` persistent authored choices | mission/story contracts exist | BLUE | integrated authored mission + persistence + visible consequence proof |
| `CLM-013` seamless active hero/job/cargo resume | #566 currently closed, but #586 remains open and no physical integrated proof exists | RED/HOLD | integrated mainline save + mission contract + Android process-kill/relaunch proof |
| `CLM-014` globally playable cities | country/locality data != playable city implementation | RED | actual release functionality |
| `CLM-015` multiplayer/chat | roadmap only | BLUE | implementation + safety/compliance + release proof |
| `CLM-016` drone network | roadmap only | BLUE | implementation + release proof |
| `CLM-017` paid monetization available | strategy/catalog only; no live store/payment path | RED | separate commercial implementation + Play/legal evidence |
| `CLM-018` `Start local. Build a logistics legacy.` | positioning candidate | AMBER | expectation-match review against release candidate |
| `CLM-019` human-scale logistics RPG/tycoon | positioning candidate | AMBER | first-session evidence supports both category halves |
| `CLM-020` visible world/economic consequence | partial domain foundations | BLUE | player-visible causal consequence proof |

### Important issue-state rule

A GitHub issue moving to `closed` is not, by itself, marketing evidence.

For example, #566 currently appears closed while #586 is still open and installed Android process-kill/relaunch evidence is absent. `CLM-013` therefore remains unavailable for production copy.

---

# 9. Screenshot captions

## 9.1 Current production state

**ACTIVE PRODUCTION SCREENSHOT CAPTIONS: NONE.**

The #561 registry currently has no GREEN gameplay claim on an exact owner-validated Android release candidate.

The table below stores **caption candidates**, not active production copy. A caption becomes active only when every dependency in its row is GREEN.

| Slot | Candidate caption | Claim dependencies | Current activation |
|---|---|---|---|
| SS-01 | `Work the city from street level.` | `CLM-002`, `CLM-003` | HOLD |
| SS-02 | `Take local delivery work.` | `CLM-004`, `CLM-005` | HOLD |
| SS-03 | `From street level to bigger decisions.` | `CLM-006` | HOLD |
| SS-04 | `Finish the job. Build momentum.` | `CLM-004` | HOLD |
| SS-05 | `Turn work into a business.` | `CLM-007` | HOLD |
| SS-06 | `Build your career through capability.` | `CLM-008`, `CLM-009` | HOLD |
| SS-07 | `Meet the people behind the work.` | `CLM-011` | HOLD |
| SS-08 | `Follow the demand. Move what the economy needs.` | `CLM-010`, `CLM-020` | HOLD |

No screenshot should carry a caption whose evidence is weaker than the frame itself.

---

# 10. Trailer textual messaging

## 10.1 Current production state

No gameplay-dependent trailer card is active while the claim registry contains zero GREEN gameplay claims.

A brand-only title card may use:

`DROPi Tycoon`

Nothing else is authorized as current gameplay marketing until its dependency is GREEN.

## 10.2 Planned 20–30 second text-card sequence

| Approx. point | Candidate card | Dependencies | Current state |
|---|---|---|---|
| 0–3s | `Start local.` | `CLM-002`, `CLM-003`, `CLM-018` | HOLD |
| 3–8s | `Take local work.` | `CLM-004` | HOLD |
| 8–13s | `Learn the city.` | `CLM-003`, `CLM-006` | HOLD |
| 13–19s | `Build your path.` | at minimum `CLM-004`; stronger version requires `CLM-007` | HOLD |
| 19–25s | `Think bigger.` | `CLM-006`, optionally `CLM-007` | HOLD |
| Final | `DROPi Tycoon` | brand identity | TEXT READY |
| Final optional | `Start local. Build a logistics legacy.` | `CLM-018`, `CLM-019` | HOLD |

Rules:

- text must follow the footage, never lead it into implying a feature that is not shown;
- no statistics, awards, ranking, price, `free`, download count or superiority language;
- no `global`, `multiplayer`, `drone`, `production economy`, `career`, `story choice` or `seamless resume` wording until the matching claim is GREEN;
- final preview-video compliance remains DT-14/#570 responsibility.

---

# 11. Localization-ready string structure

Use stable semantic IDs rather than storing copy only inside image files.

## 11.1 Core metadata IDs

- `store.title.primary`
- `store.title.aso_logistics`
- `store.short.primary`
- `store.short.reduced`
- `store.full.intro`
- `store.full.core_work`
- `store.full.transparency`
- `store.full.module.company`
- `store.full.module.career`
- `store.full.module.story`
- `store.full.module.production`

## 11.2 Screenshot IDs

For each screenshot `01` through `08`:

- `store.screenshot.01.caption`
- `store.screenshot.01.alt`
- through
- `store.screenshot.08.caption`
- `store.screenshot.08.alt`

Do not burn translated text irreversibly into the only retained source capture. Keep raw captures so each locale can receive a clean overlay variant.

## 11.3 Trailer IDs

- `store.trailer.card.start_local`
- `store.trailer.card.local_work`
- `store.trailer.card.learn_city`
- `store.trailer.card.build_path`
- `store.trailer.card.think_bigger`
- `store.trailer.card.tagline`

## 11.4 Translation rules

- translate meaning, not English word order;
- do not concatenate translated fragments at runtime for store assets;
- preserve the `DROPi Tycoon` brand spelling unless legal/brand review requires otherwise;
- do not translate a feature module that is disabled in the source release listing;
- every locale inherits the same claim dependency as the source string;
- translation cannot turn a cautious English statement into a stronger claim;
- human review is required before production publication of the first Romanian listing and any later paid localization.

---

# 12. First localization markets / languages

## Phase 0 — English source

**Locale:** `en-US`

Role:

- canonical source listing;
- broad international readability;
- matches the normal Play default-language workflow;
- source for future translation memory and creator/press materials.

## Phase 1 — Romanian

**Locale:** `ro-RO`

Recommendation: **first full localization after the English source is release-ready.**

Why:

- Brăila is the current authentic city anchor;
- Romanian is the project's strongest authenticity wedge;
- the owner can review Romanian nuance directly;
- it allows Romanian creator/community outreach without paying for speculative localization volume.

Do not treat Romanian localization as evidence that all Romania/world localities are fully playable.

## Phase 2 — Evidence-driven candidates

Candidates after real store traffic, retention and support evidence:

1. `de-DE`;
2. `pl-PL`.

These are **test candidates**, not automatic launch commitments. Localize only when actual acquisition/creator/store evidence justifies the support burden.

## Later candidates

Possible later test locales from the broader growth strategy include:

- `fr-FR`;
- `es-ES`;
- `pt-BR`;
- `tr-TR`.

No large localization spend is authorized by this document.

`en-GB` should be added only if wording, support or market testing needs a distinct British/Irish English listing; do not duplicate the entire source listing without a measurable reason.

---

# 13. Store keyword / theme research

## 13.1 Current category language observed

Current Google Play competitor listings use combinations such as:

- `transport tycoon`;
- `logistics empire`;
- `truck manager`;
- `transport simulation`;
- `city building`;
- `logistics strategy`;
- `business empire`.

Current examples rechecked on 2026-09-09:

- Transport Tycoon Empire: City — https://play.google.com/store/apps/details?id=tycoon.building.simulator.games.aldagames.com
- Logistics Empire Truck Manager — https://play.google.com/store/apps/details?id=com.xyrality.bb

## 13.2 DROPi theme hierarchy

Use naturally, never as a repeated keyword block.

Primary themes once supported by GREEN release evidence:

- `logistics tycoon`;
- `business tycoon`;
- `delivery game`;
- `management simulation`;
- `logistics simulation`.

Secondary only when corresponding gameplay is GREEN:

- `career simulation`;
- `city logistics`;
- `company management`;
- `supply chain`;
- `production management`;
- `transport network`.

## 13.3 Themes to avoid now

Do not optimize the production listing around:

- `truck simulator` — creates a driving-simulator expectation the product does not currently own;
- `global empire` — overstates current playable-world reach;
- `multiplayer` — not current release functionality;
- `drone` — future direction;
- `stock market` — unsupported;
- `crypto`, `token`, `NFT`, `earn money` — not part of the current game release;
- `free`, `best`, `#1`, `top` — promotional/ranking language and poor metadata practice.

## 13.4 ASO title test recommendation

Once `CLM-019` is GREEN and enough store traffic exists, test:

- Control: `DROPi Tycoon`;
- Variant: `DROPi Tycoon: Logistics`.

Do not assume the extra keyword wins. Use the Play listing experiment result and downstream retained-player quality, not click-through alone.

---

# 14. Accessibility / alt-text copy

Alt text must describe the actual final asset. The drafts below are therefore templates and cannot be finalized until the exact asset exists.

All drafts are below 140 characters.

| Asset | Draft alt text | Activation rule |
|---|---|---|
| App icon | `DROPi Tycoon app icon.` | Final brand/provenance review |
| Feature graphic | `DROPi Tycoon promotional artwork showing the verified release setting and player-facing logistics theme.` | Rewrite to match actual graphic + GREEN claims |
| SS-01 | `Player character moving through the Brăila game world in landscape view.` | `CLM-002`, `CLM-003` GREEN + exact frame match |
| SS-02 | `In-game smartphone showing a delivery objective beside the Brăila game world.` | `CLM-004`, `CLM-005` GREEN + exact frame match |
| SS-03 | `Wider strategic game view reached from the street-level Brăila experience.` | `CLM-006` GREEN + exact frame match |
| SS-04 | `Delivery completion shown in the game with the authentic release-build result.` | `CLM-004` GREEN + exact frame match |
| SS-05 | `Company or HQ management screen from the verified Android release build.` | `CLM-007` GREEN + exact frame match |
| SS-06 | `Career or profession progression shown in verified release gameplay.` | `CLM-008`, `CLM-009` GREEN + exact frame match |
| SS-07 | `Named character dialogue shown in the verified Android release build.` | `CLM-011` GREEN + exact frame match |
| SS-08 | `Supply and demand gameplay shown through a verified production or logistics opportunity.` | `CLM-010` GREEN + exact frame match |

Accessibility rules:

- describe what the user can see, not only the marketing slogan over it;
- do not insert unsupported feature claims into alt text;
- include key context such as player, city, smartphone or management surface only if visible;
- avoid repeating the entire caption word-for-word if the image needs more useful description;
- localized graphics require localized alt text when the visible/meaningful content changes.

---

# 15. Publication assembly algorithm

Before any Play submission, build the final textual listing deterministically:

1. identify the exact production AAB SHA/source commit from #568;
2. copy the current claim registry;
3. mark GREEN only where exact-build + owner evidence exists;
4. select `store.title.primary` unless `CLM-019` is GREEN and an approved ASO test chooses the logistics variant;
5. enable the short description only when every dependency is GREEN;
6. assemble the full description from the base plus GREEN optional modules only;
7. enable only screenshot captions whose frame and dependencies are GREEN;
8. enable only trailer text cards whose footage and dependencies are GREEN;
9. finalize alt text from the exact assets;
10. run DT-14 policy/format validation;
11. run #565 legal/provenance review for every shipped/listing asset and brand claim;
12. ensure #569 declarations describe the same release behavior;
13. owner reviews the final listing before Play Console publication.

Any failed step blocks publication; do not compensate by weakening evidence requirements.

---

# 16. #570 textual acceptance checklist

DT-15 textual portion is complete when:

- [x] title options and recommendation exist;
- [x] title lengths are within Play limits;
- [x] short-description options exist and are within 80 characters;
- [x] modular full-description source exists and is within the 4,000-character field budget when assembled from authorized modules;
- [x] feature/benefit hierarchy exists;
- [x] claim-to-evidence matrix exists;
- [x] screenshot captions are explicitly gated to GREEN evidence;
- [x] trailer textual messaging is explicitly gated to GREEN evidence;
- [x] localization-ready string IDs exist;
- [x] first localization priorities exist;
- [x] keyword/theme guidance exists without keyword stuffing;
- [x] accessibility/alt-text drafts exist;
- [x] current blockers and owner/DT-14 boundaries are explicit.

#570 itself remains open until its non-textual and owner/Play requirements are complete.

---

# 17. Ownership and handoff

## DT-15 owns

- commercial wording;
- feature/benefit hierarchy;
- claim truthfulness in marketing copy;
- screenshot caption text;
- trailer message text;
- ASO theme strategy;
- localization priority and source strings;
- expectation matching between listing and actual game.

## DT-14 owns / verifies

- current Play field and asset technical requirements;
- submitted-build matching;
- Play Console configuration;
- final asset technical compliance;
- production AAB evidence under #568;
- policy declaration consistency with #569;
- Play track/release readiness and #571 owner-side gates.

## DT-13 / #565 remains authoritative for

- brand/trademark clearance;
- third-party asset/data rights;
- generated-art provenance;
- OSM/GeoNames/Natural Earth obligations;
- release-facing legal notices.

## Owner required later

The owner must review the final release listing and provide any Play Console/account-only evidence when #571 reaches that stage.

No owner action is required merely to merge this documentation-only textual pack.

---

# 18. Final DT-15 decision

The strongest release-target positioning remains:

**Start local. Build a logistics legacy.**

But the strongest truthful action **today** is not to publish that line yet.

The current release process must first convert the relevant gameplay claims from AMBER/BLUE to GREEN using exact-candidate Android evidence.

The correct growth sequence is:

`verified gameplay -> GREEN claim -> matching store text -> matching real capture -> Play compliance -> publication`

Never reverse that order.
