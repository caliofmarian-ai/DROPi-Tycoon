# Document Information

Document: `ORGANIC_COMMUNITY_LAUNCH_MEASUREMENT_PLAYBOOK.md`
Project: DROPi Tycoon
Version: 1.0.1
Status: Canonical design contract — future organic pilot only
Owner Lane: DT-15 — Marketing / Growth / ASO / Community
Coordination: DT-13 Legal / Privacy / IP; DT-14 Android / Google Play Release; DT-16 Independent Audit; product-domain owners for routed feedback
Baseline Main: `b8aa2f622a28234b7907e1935d28538331ff9fe5`
Latest Reconciliation Main: `d33cb0a60ceaaca16113af752349f1b4aa30d075`
Prepared: 2026-09-09

---

# DROPi Tycoon — Organic Community + Launch Measurement Playbook

## 1. Purpose

This document defines the measurement, feedback, claim-review and escalation contract for a **future unpaid organic launch pilot**.

It is designed to answer four questions without turning growth work into a second product authority:

1. Where did a qualified player/tester discover the build?
2. Did the build deliver the first-session experience it publicly promised?
3. What prevented the player from continuing or returning?
4. Which product owner should receive the evidence?

The playbook is intentionally privacy-minimized and implementation-ready, but it does **not** activate telemetry, community outreach, creator outreach, paid acquisition, Play publication or analytics infrastructure.

At this baseline:

- no campaign is active;
- no creator/community outreach is authorized;
- no paid spend is authorized;
- no analytics SDK is installed by this document;
- no new personal-data collection is authorized;
- #568 production-AAB attestation remains open;
- #571 Play Console/test-to-production gate remains open;
- #569 has a prepared compliance evidence package but final artifact-dependent declarations and owner/legal inputs remain material release conditions;
- authentic player-facing creative remains gated by #561 and owner Android evidence;
- visible PRs remain subject to their own Android owner acceptance rules.

Canonical invariant:

> **Measure only what genuinely exists, collect only what is necessary, and never optimize distribution faster than the product can safely absorb feedback.**

---

# 2. Non-goals

This document does not:

- install or select an analytics SDK;
- create an advertising identifier or device fingerprint;
- assign persistent cross-app identifiers;
- collect email, phone number, precise location, IP address or contact lists for growth analytics;
- create player accounts;
- create creator affiliate codes;
- create referral rewards;
- create paid influencer agreements;
- contact creators, journalists, testers or communities;
- open a Discord server or other community service;
- publish a Google Play listing;
- upload an AAB;
- change gameplay;
- change missions, economy, professions, production, persistence or Android behavior;
- define legal bases or consent language in place of DT-13 / qualified legal review;
- claim metrics that have not actually been observed;
- set fake retention baselines;
- buy followers, reviews, installs, comments, likes or community members;
- require positive coverage or positive tester feedback.

---

# 3. Authority and source hierarchy

This playbook consumes, and does not override:

1. `00_Project/VISION.md` — game-first product purpose;
2. `00_Project/GROWTH_MARKETING_LAUNCH_STRATEGY.md` — positioning, launch phases and growth gates;
3. `00_Project/STORE_CREATIVE_PREPRODUCTION_MANIFEST.md` — truthful claim/capture governance for #561;
4. `00_Project/GOOGLE_PLAY_TEXT_METADATA_PACK.md` — truthful listing text governance;
5. `00_Project/LAUNCH_PRESS_KIT_CREATOR_OUTREACH_PACKAGE.md` — earned press/creator package and editorial independence;
6. `00_Project/LEGAL_PRIVACY_COMPLIANCE.md` — privacy/compliance boundaries;
7. `09_Development/Compliance/CURRENT_RELEASE_DATA_FLOW_569.md` and related #569 evidence — current data-flow truth;
8. DT-14 release evidence for #568/#571 — exact build and distribution authority;
9. current merged gameplay/runtime evidence — only source for player-facing feature truth.

If these sources conflict, the stricter release/privacy/truthfulness gate wins until the owning specialist resolves the conflict.

---

# 4. Current activation state

The current state of this playbook is:

`DESIGN_READY — PILOT_NOT_AUTHORIZED — TELEMETRY_NOT_AUTHORIZED`

No event in this document should be interpreted as evidence that such telemetry currently exists.

The event and cohort contracts are **future schemas** that may be implemented only after:

- the exact collection purpose is approved;
- DT-13 reconciles the data map and lawful/privacy requirements;
- the shipped build behavior is known;
- #568 identifies final native dependencies/permissions/SDK behavior;
- #569 declarations are updated to match the exact behavior if telemetry changes the data map;
- retention/deletion rules are defined;
- minors/target-audience implications are resolved;
- the chosen analytics implementation has a reviewed processor/data-transfer profile where applicable.

Until those conditions are satisfied, use only non-personal aggregate platform data already lawfully available and manually recorded qualitative feedback that the participant intentionally provides.

---

# 5. Measurement principles

## 5.1 Minimum necessary data

Every proposed field must answer a defined product/growth question.

If removing a field does not prevent a decision, remove the field.

Do not collect data merely because an SDK offers it.

## 5.2 Aggregate before individual

Prefer:

- total views;
- total clicks where the platform already provides them lawfully;
- total qualified tester invitations;
- total successful build installations where Play/internal distribution provides an aggregate;
- aggregate mission completion rate where lawful product telemetry exists;
- aggregate feedback category counts.

Avoid persistent person-level histories unless a real product decision requires them and privacy review approves them.

## 5.3 Build truth before campaign truth

Every measurement record must identify the exact build or content version it describes.

A result from one build must not be silently attributed to a later build.

## 5.4 No optimization around harmful behavior

Do not optimize for:

- rage clicks;
- manipulative notifications;
- misleading thumbnails;
- false scarcity;
- forced sharing;
- spam invitations;
- review gating;
- hiding criticism;
- requiring positive sentiment for access;
- excessive permission requests;
- retention created by punishment rather than value.

## 5.5 Qualified evidence beats vanity metrics

Follower count, impressions and raw views are context, not proof that players enjoy the game.

Higher-value evidence includes:

- successful exact-build installation;
- first-session completion;
- real delivery/mission completion;
- return behavior where lawfully measurable;
- specific Android usability reports;
- repeated qualitative themes from independent participants;
- unsolicited sharing or recommendation;
- creator/community questions demonstrating understood product positioning.

---

# 6. Channel and source taxonomy

Every organic source uses a stable **aggregate source ID**.

Source IDs identify a distribution surface or content unit, not a person.

Format:

`src:<channel>:<surface>:<slug>`

Examples:

- `src:owned:github:devlog-001`
- `src:owned:website:alpha-page`
- `src:community:reddit:tycoon-post-001`
- `src:community:discord:alpha-announcement-001`
- `src:social:youtube:short-001`
- `src:social:tiktok:clip-001`
- `src:social:instagram:reel-001`
- `src:social:x:devlog-001`
- `src:creator:youtube:earned-001`
- `src:creator:tiktok:earned-001`
- `src:press:web:earned-001`
- `src:play:internal:wave-001`
- `src:play:closed:wave-001`
- `src:direct:owner:manual-invite-wave-001`

## 6.1 Channel families

| Family | Meaning | Initial use |
|---|---|---|
| `owned` | Publisher-controlled public surfaces | devlog / landing page only when authorized |
| `community` | Third-party or publisher community spaces | future unpaid participation |
| `social` | Organic social publication | future factual clips/posts |
| `creator` | Independent earned creator coverage | future unpaid outreach |
| `press` | Independent editorial coverage | future earned press |
| `play` | Google Play testing surfaces | only after DT-14 distribution gate |
| `direct` | Small controlled tester invitation wave | future owner-approved testing |

## 6.2 Forbidden source encoding

A source ID must not embed:

- creator email address;
- username if a non-identifying internal creator reference is sufficient;
- phone number;
- IP address;
- device ID;
- real-world precise location;
- advertising ID;
- account password/token;
- private invite token;
- personal demographic inference.

---

# 7. Content unit registry

Each public content unit should have a non-personal registry entry before publication.

Required fields:

```text
contentId
sourceId
contentType
language
marketContext
claimIds[]
evidenceBuildRef
creativeEvidenceRefs[]
publishState
publishedAt?        # only after real publication
platformPublicUrl?  # only after real publication
```

Allowed `publishState`:

- `DRAFT`
- `CLAIM_REVIEW`
- `READY`
- `PUBLISHED`
- `PAUSED`
- `RETIRED`

`PUBLISHED` is prohibited until claim review passes.

No content record may invent a future publication date or URL.

---

# 8. Build and cohort references

## 8.1 Build reference

A measurement must identify the exact tested artifact.

Canonical format:

`build:<channel>:<source-sha-short>:<artifact-sequence>`

Examples only as schema illustrations:

- `build:android-internal:abc1234:01`
- `build:android-closed:abc1234:01`

A real build reference is created only when DT-14 provides the exact source SHA and artifact evidence.

Where available, the build registry may separately hold:

- full Git SHA;
- EAS build ID;
- AAB SHA-256;
- versionName;
- versionCode;
- Play track;
- attestation reference.

Do not put signing secrets, private keys or credentials into measurement records.

## 8.2 Cohort reference

A cohort is an **aggregate testing wave**, not a hidden user profile.

Format:

`cohort:<stage>:<market-or-language>:<wave>`

Examples:

- `cohort:internal:en:wave-01`
- `cohort:closed:ro:wave-01`
- `cohort:organic:en:wave-01`

A cohort must not encode a participant's identity.

## 8.3 Cohort membership

Until a privacy-reviewed account/telemetry implementation exists, cohort membership should be derived from distribution context rather than an analytics identity.

Examples:

- Play internal testing wave;
- Play closed testing wave;
- manually invited testing batch;
- aggregate source campaign slug.

Do not generate a persistent marketing user ID merely to calculate cohort retention.

---

# 9. Measurement tiers

## Tier 0 — repository/design only

Current state.

Permitted:

- content/claim planning;
- build-reference schema;
- feedback taxonomy;
- issue-routing design;
- stop/go decision templates.

No player data exists.

## Tier 1 — non-personal aggregate platform evidence

Permitted only when the corresponding channel is active and data is genuinely provided by the platform.

Possible examples:

- public content impressions;
- public video views;
- aggregate link clicks supplied by the platform;
- Play aggregate install/tester counts;
- public comment counts.

Do not combine platform aggregates to infer individual behavior.

## Tier 2 — participant-provided qualitative evidence

Possible after a real controlled test begins.

Examples:

- voluntary feedback text;
- voluntary bug description;
- screenshot/video intentionally submitted for diagnosis;
- self-reported device model only when necessary for an Android defect;
- self-reported session outcome.

The intake surface must provide appropriate privacy information before collecting personal data.

## Tier 3 — first-party product telemetry

**Not currently authorized.**

May exist only after privacy/release review.

Used for product events such as activation or mission completion where an implementation is real and lawful.

## Tier 4 — persistent return/retention measurement

**Higher privacy threshold. Not currently authorized.**

Classic D1/D7/D30 measurement usually requires linking activity across sessions using an account, pseudonymous installation identifier or equivalent stable mechanism.

Do not create that mechanism solely for growth reporting without DT-13 review and explicit implementation authority.

---

# 10. Future event contract

This section defines semantic events only. It does not authorize collection.

Every event that eventually exists must be generated from real runtime state rather than UI impression guesses.

Base envelope:

```text
schemaVersion
buildRef
cohortRef?          # aggregate testing context when known
sourceId?           # aggregate acquisition/content context when lawfully available
eventName
eventVersion
gameClockContext?   # only if needed for game-state interpretation
occurredAt          # implementation-defined, privacy-reviewed
```

Do not add device fingerprint, advertising ID, precise location, contacts or unrelated profile attributes to the base envelope.

---

# 11. Activation signals

Activation is not one vanity event.

A future pilot should distinguish the following semantic milestones when they actually exist in the released build:

## `app_runtime_ready`

Meaning:

The authoritative packaged game runtime successfully reached the usable entry surface.

Use:

Detect startup failure, blank WebView or packaging failure.

## `world_session_started`

Meaning:

The player entered a playable world session.

Use:

Separate successful launch from actual gameplay entry.

## `first_authoritative_work_available`

Meaning:

A legitimate first work opportunity is available under current gameplay authority.

Use:

Detect onboarding paths that never expose understandable work.

## `first_authoritative_work_accepted`

Meaning:

The player legitimately accepted a governed work/order/mission opportunity.

## `first_delivery_or_work_completed`

Meaning:

The first authoritative work unit reached legitimate completion and settlement/consequence handling where applicable.

This event must not be emitted merely because a completion animation played.

## `first_session_core_loop_reached`

Meaning:

A versioned derived milestone whose prerequisites are explicitly documented for the exact build.

It may be used only when the product team agrees what constitutes the release candidate's core first-session loop.

Do not silently change its definition between builds.

---

# 12. Mission and story signals

These events become eligible only when the relevant mission/story runtime is in the actual tested build.

Possible semantic events:

- `authored_mission_started`
- `authored_mission_completed`
- `authored_mission_failed_recoverably`
- `authored_mission_resumed`
- `first_hour_story_completed`

Minimum dimensions:

- stable authored mission/story reference;
- buildRef;
- result class.

Do not collect free-form narrative text as telemetry.

Do not infer player morality, personality or sensitive traits from narrative choices.

Choice analytics require separate review before implementation and are not part of the minimal pilot.

---

# 13. Return and retention signals

## 13.1 No fake D1/D7/D30

Do not report D1, D7 or D30 retention until the implementation can lawfully and reliably connect sessions across the required period.

Without a reviewed stable identifier or account, the correct value is:

`NOT_MEASURABLE_WITH_CURRENT_INSTRUMENTATION`

—not zero, not an estimate.

## 13.2 Minimal future return event

If a lawful persistent identity mechanism later exists, a semantic event may be:

`world_session_returned`

The analytics layer may derive return windows from event timestamps under an approved retention model.

Do not encode `day1`, `day7` or `day30` directly in runtime code unless the analytics design specifically requires it.

## 13.3 Lower-data alternatives before persistent telemetry

Before Tier 4 telemetry, use:

- aggregate Play tester participation where available;
- voluntary tester survey question: `Would you choose to play another session?`;
- voluntary follow-up participation in a scheduled test wave;
- qualitative `wanted_to_return` / `did_not_want_to_return` coding only when directly stated.

Do not represent those alternatives as D1/D7/D30 retention.

---

# 14. Performance and stability signals

The unpaid pilot must prioritize evidence that distribution is not amplifying a broken build.

Future runtime or Play evidence may include:

- startup failure rate;
- crash rate;
- ANR rate;
- blank/failed WebView startup;
- save-load failure;
- process-kill/relaunch continuity failure;
- severe frame-time/stutter evidence;
- device compatibility failure.

DT-14 and DT-16 remain authorities for exact release/stability interpretation.

No DT-15 document may redefine Android acceptance.

---

# 15. Qualitative feedback taxonomy

Every feedback item receives one primary category and optional secondary categories.

Format:

`fb:<domain>:<topic>`

## 15.1 Android visual quality

- `fb:android-visual:readability`
- `fb:android-visual:label-overlap`
- `fb:android-visual:hud-collision`
- `fb:android-visual:scale-clarity`
- `fb:android-visual:debug-looking-ui`
- `fb:android-visual:character-distinction`
- `fb:android-visual:story-presentation`

Primary routing: DT-01 or DT-10 depending on the surface.

## 15.2 Controls and camera

- `fb:controls:movement`
- `fb:controls:touch-target`
- `fb:controls:pinch-zoom`
- `fb:controls:pan`
- `fb:controls:android-back`
- `fb:controls:accidental-input`

Primary routing: visible gameplay/UX owner, with DT-01/DT-05/DT-10 where their surface owns the defect.

## 15.3 Story and character experience

- `fb:story:opening-clarity`
- `fb:story:character-memory`
- `fb:story:dialogue-quality`
- `fb:story:pacing`
- `fb:story:consequence-clarity`
- `fb:story:premature-beat`

Primary routing: DT-08 canon or DT-10 presentation, with DT-09 when mission materialization is involved.

## 15.4 Missions and work loop

- `fb:mission:objective-clarity`
- `fb:mission:authority-mismatch`
- `fb:mission:blocked-progress`
- `fb:mission:duplicate-completion`
- `fb:mission:failure-recovery`
- `fb:mission:resume-continuity`

Primary routing: DT-09; Save continuity to DT-02.

## 15.5 Economy and progression

- `fb:economy:reward-clarity`
- `fb:economy:money-inconsistency`
- `fb:economy:work-capacity`
- `fb:economy:progression-pressure`
- `fb:economy:grind-perception`
- `fb:economy:pay-to-win-concern`

Primary routing: DT-03 or DT-12 for commercial perception.

## 15.6 Capability/professions

- `fb:capability:eligibility-clarity`
- `fb:capability:training-clarity`
- `fb:capability:role-access`
- `fb:capability:qualification-confusion`

Primary routing: DT-06.

## 15.7 Production/logistics

- `fb:production:supply-causality`
- `fb:production:inventory-clarity`
- `fb:production:demand-clarity`
- `fb:production:logistics-opportunity`

Primary routing: DT-07.

## 15.8 Living city

- `fb:city:pedestrian-behavior`
- `fb:city:vehicle-behavior`
- `fb:city:crossing-legibility`
- `fb:city:liveness`
- `fb:city:collision`

Primary routing: DT-05.

## 15.9 Persistence

- `fb:persistence:save-missing`
- `fb:persistence:hero-position`
- `fb:persistence:active-job`
- `fb:persistence:cargo`
- `fb:persistence:mission-resume`
- `fb:persistence:duplicate-settlement`

Primary routing: DT-02.

## 15.10 Performance/stability

- `fb:performance:startup`
- `fb:performance:crash`
- `fb:performance:freeze`
- `fb:performance:stutter`
- `fb:performance:memory`
- `fb:performance:network-confusion`

Primary routing: DT-14 for Android/release, DT-04 for CI/runtime packaging when relevant.

## 15.11 Marketing truth and expectation fit

- `fb:marketing:claim-mismatch`
- `fb:marketing:unclear-positioning`
- `fb:marketing:screenshot-mismatch`
- `fb:marketing:roadmap-confusion`
- `fb:marketing:genre-mismatch`

Primary routing: DT-15, with owning feature specialist consulted before claim revision.

## 15.12 Privacy/safety/community

- `fb:privacy:unexpected-data-request`
- `fb:privacy:consent-confusion`
- `fb:community:harassment`
- `fb:community:moderation`
- `fb:community:minor-safety`
- `fb:community:impersonation`

Primary routing: DT-13; affected external community operations pause until reviewed.

## 15.13 Future city-scale, traversal and delivery-distribution quality — owner direction #614/#615

These categories exist so future owner/tester evidence can evaluate the enlarged-city direction without implying that #614 or #615 is already implemented, merged, Android-accepted or marketable.

City-scale and traversal:

- `fb:city-scale:board-like-compression`
- `fb:city-scale:city-presence`
- `fb:city-scale:district-separation`
- `fb:city-scale:urban-hierarchy`
- `fb:city-scale:local-vs-cross-city-distance`
- `fb:city-scale:walking-distance-pressure`
- `fb:city-scale:transport-progression-value`
- `fb:city-scale:outer-area-dead-space`
- `fb:city-scale:camera-scale-perception`
- `fb:city-scale:sector-transition`

Primary routing: DT-01 for playable Brăila scale/presentation, DT-05 for traversal/living-city behavior, DT-11 only after a validated Brăila scale contract is generalized to other cities.

Delivery distribution:

- `fb:delivery-distribution:center-bias`
- `fb:delivery-distribution:hq-bias`
- `fb:delivery-distribution:district-variety`
- `fb:delivery-distribution:local-route-variety`
- `fb:delivery-distribution:adjacent-district-variety`
- `fb:delivery-distribution:cross-city-variety`
- `fb:delivery-distribution:outer-area-coverage`
- `fb:delivery-distribution:producer-logistics-route`
- `fb:delivery-distribution:repeat-endpoint-overuse`
- `fb:delivery-distribution:route-distance-legibility`
- `fb:delivery-distribution:transport-eligibility-fit`

Primary routing: DT-09 for citywide delivery opportunity/materialization distribution, DT-07 for authoritative supply/demand causes, DT-06 when work-access eligibility is the actual cause, and DT-01/DT-05 where the observed problem is route scale/traversal rather than mission selection.

Android/performance compatibility of the larger-city direction:

- `fb:city-scale-performance:frame-time`
- `fb:city-scale-performance:streaming-stutter`
- `fb:city-scale-performance:sector-pop-in`
- `fb:city-scale-performance:memory-pressure`
- `fb:city-scale-performance:actor-density-collapse`

Primary routing: DT-04/DT-14 for performance/release evidence, with DT-01/DT-05 consulted for the owning city presentation/simulation contract.

Truthfulness rule:

- #614 and #615 are **future product-quality targets**, not shipped marketing claims;
- no screenshot, post, trailer, ASO copy or creator brief may describe enlarged-city scale or citywide delivery distribution as current until the exact Android build proves the behavior and required owner acceptance is complete;
- qualitative reports about these categories are evidence about a tested build only, never evidence that the roadmap target is globally complete.

---

# 16. Feedback record contract

Minimal internal feedback record:

```text
feedbackId
receivedAt
buildRef?              # exact build if known
sourceId?               # aggregate source if known
cohortRef?              # aggregate test wave if known
primaryCategory
secondaryCategories[]
severity
reproducibility
summary
ownerRoute
status
linkedIssue?            # only after triage creates/reuses one
```

Optional fields only when necessary:

```text
deviceClass?            # broad class or self-reported model for a real Android defect
osVersion?              # only when needed for compatibility diagnosis
participantEvidenceRef? # reference to intentionally submitted screenshot/video
```

Do not copy unnecessary personal identifiers into GitHub issues.

If a report contains personal information, redact/minimize before creating a public repository issue.

---

# 17. Feedback severity

## `S0 — RELEASE STOP`

Examples:

- reproducible data loss;
- progress corruption;
- severe security/privacy incident;
- misleading production claim about absent functionality;
- build cannot start on supported target devices;
- widespread crash/ANR condition;
- unsafe community/minor incident requiring immediate containment.

Action:

Pause affected distribution/content immediately and route to owning P0 authority.

## `S1 — PILOT STOP / FIX BEFORE EXPANSION`

Examples:

- first-session blocker;
- repeated control failure;
- mission cannot complete;
- severe UI clipping on primary Android landscape;
- repeat save/resume defect without confirmed permanent data loss;
- content promise materially overstates actual experience.

Action:

Do not expand the pilot until triaged and accepted.

## `S2 — MATERIAL IMPROVEMENT`

Examples:

- repeated readability issue;
- confusing objective;
- weak progression explanation;
- visible but recoverable story/mission pacing problem;
- performance degradation that does not block play.

Action:

Route into prioritized product backlog; expansion decision depends on frequency and first-session impact.

## `S3 — OBSERVATION / PREFERENCE`

Examples:

- aesthetic preference;
- optional feature request;
- isolated low-impact confusion;
- personal content preference.

Action:

Aggregate themes before creating work.

---

# 18. Issue-routing workflow

Community feedback must not produce issue spam.

Canonical flow:

```text
RAW FEEDBACK
-> MINIMIZE PERSONAL DATA
-> CLASSIFY
-> CHECK DUPLICATE / EXISTING ISSUE
-> VERIFY AGAINST EXACT BUILD
-> ASSIGN OWNER LANE
-> CREATE OR UPDATE ONE EVIDENCE-BACKED ISSUE
-> TRACK RESOLUTION
-> RE-TEST ON A NEW EXACT BUILD
```

## 18.1 Duplicate-first rule

Before creating an issue:

1. search current open issues/PRs;
2. search known release blockers;
3. check whether the report is already owned by a specialist;
4. add evidence to the existing issue when appropriate.

Create a new issue only when:

- the behavior is reproducible or materially evidenced;
- no existing issue owns it;
- the impact justifies repository work;
- the issue can be described without unnecessary personal data.

## 18.2 Routing map

| Domain | Primary owner |
|---|---|
| Brăila Android visual/zoom/HUD | DT-01 |
| Brăila city-scale / district-distance perception (#614) | DT-01 |
| Save/world/job/cargo continuity | DT-02 |
| Player Money/work/wages/hardship | DT-03 |
| CI / production bundle / Railway planning | DT-04 |
| pedestrian/traffic/living-city behavior | DT-05 |
| professions/capability/training/work access | DT-06 |
| production/supply/inventory demand | DT-07 |
| story canon/cast/arc consequences | DT-08 |
| mission framework/materialization | DT-09 |
| citywide delivery distribution (#615) | DT-09 |
| character/dialogue visual presentation | DT-10 |
| country/locality catalog | DT-11 |
| commercial catalog/entitlements/pay-to-win perception | DT-12 |
| privacy/IP/community safety/disclosure | DT-13 |
| Android build/Play/release/device compatibility | DT-14 |
| positioning/claim/community/organic growth | DT-15 |
| cross-product release severity / independent gate | DT-16 |

If ownership is ambiguous, route to the central orchestrator instead of assigning two competing owners.

---

# 19. Claim-to-evidence gate before every external post

Every external post, screenshot, trailer clip, creator brief or press statement must pass this gate.

## 19.1 Required review tuple

```text
contentId
claimIds[]
exactBuildRef
proofRefs[]
claimStatusAtReview
reviewedAt
reviewOwner
```

## 19.2 Pass conditions

A player-facing claim may be presented as current only when:

1. the claim is implemented in the exact referenced build;
2. the build includes the relevant runtime path;
3. required Android owner acceptance is complete where applicable;
4. screenshots/video are real captures from the validated build;
5. legal/IP/provenance gates allow external use of the attached media;
6. wording matches what the capture/build proves;
7. no newer merge invalidates the evidence relationship.

## 19.3 Fail conditions

Do not publish when:

- the claim is roadmap-only;
- the feature exists only as domain/canon documentation;
- the feature is merged but not player-visible;
- the feature is on an unmerged branch;
- the screenshot is a mockup presented as gameplay;
- a future city dataset is presented as a fully playable city;
- a mission registry is presented as visible story presentation when the UI is absent/unaccepted;
- a commercial entitlement domain is presented as a live purchase system;
- a Play/privacy declaration has not been reconciled to the exact artifact;
- the capture contains uncleared branding/assets;
- #614 enlarged-city intent is presented as current before the exact build visibly demonstrates it;
- #615 citywide delivery-distribution intent is presented as current before legitimate distributed work is proven in the exact build.

## 19.4 Content state downgrade

If a previously GREEN claim becomes uncertain after a material build change:

`GREEN -> REVIEW_REQUIRED`

Stop reusing old media until revalidated.

---

# 20. Organic pilot stages

## Stage A — evidence rehearsal

No external audience.

Goals:

- verify content claim checklist;
- verify feedback taxonomy;
- verify routing map;
- verify build/cohort references;
- dry-run decision log with synthetic process examples clearly labeled `EXAMPLE`, not observed data.

## Stage B — owner-approved tiny test wave

Future only.

Prerequisites:

- exact build evidence;
- owner-approved distribution path;
- privacy-safe feedback intake;
- no P0 release blocker that makes testing unsafe or meaningless;
- clear known-issues note;
- authentic captures if public content is used.

Goal:

Find severe first-session failures before broader organic exposure.

## Stage C — controlled organic niche pilot

Future only.

Possible surfaces:

- small tycoon/simulation communities where participation is permitted;
- unpaid micro-creator outreach;
- Romanian gaming niche where Brăila context is relevant;
- English-language simulation niche;
- Play closed test when DT-14 authorizes it.

Goal:

Validate positioning, first-session clarity and product stability—not maximize reach.

## Stage D — broader earned launch

Not authorized by this document.

Requires product/release/creative/privacy gates and sufficient evidence from earlier stages.

---

# 21. Stop/go escalation thresholds

The project currently has no observed organic pilot dataset, so this section defines **decision rules**, not claimed current performance.

No percentage below should be represented as an observed baseline unless a real cohort produced it.

## 21.1 Hard STOP conditions — no sample-size requirement

Stop affected distribution immediately if any credible report/evidence shows:

- security/privacy incident;
- credential/token exposure;
- severe data corruption or unrecoverable save loss;
- production build cannot start;
- material store/post claim proven false for the exact build;
- illegal/unlicensed media or unresolved rights issue in distributed creative;
- serious community safety incident;
- reviewer/tester is being pressured for positive coverage;
- paid/bought engagement is introduced without explicit owner authorization.

## 21.2 PAUSE-AND-TRIAGE conditions

Pause expansion when:

- two independent qualified participants reproduce the same S1 first-session blocker on the same exact build; or
- one deterministic internal reproduction confirms an S1 issue; or
- a cluster of reports indicates the same Android control/visual defect and the owning specialist has not yet triaged it; or
- feedback repeatedly shows that a headline claim creates a materially different expectation from the actual build; or
- exact-build identity cannot be established for incoming feedback.

These are operational triage rules, not game-industry performance benchmarks.

## 21.3 GO-TO-NEXT-WAVE conditions

Expansion to the next **organic** wave may be considered only when:

- no open S0 exists for the tested build;
- no unaccepted S1 first-session blocker remains;
- claim-to-evidence review is current;
- distribution/build instructions are current;
- privacy/compliance intake rules are current;
- severe feedback has an owner and resolution status;
- qualitative feedback shows participants can describe the core fantasy without being corrected by marketing copy;
- the central orchestrator/owner agrees the next wave is appropriate.

This is necessary but not sufficient for paid acquisition.

## 21.4 Paid acquisition remains a separate gate

Nothing in this playbook authorizes paid UA.

Paid acquisition remains downstream of the canonical Growth strategy, retention evidence, attribution readiness and DT-12 economics.

---

# 22. Quantitative decision framework after lawful telemetry exists

When a real lawful measurement implementation exists, DT-15 may compute:

- `source_to_install_rate` where source clicks and installs are validly attributable;
- `install_to_runtime_ready_rate`;
- `runtime_ready_to_world_session_rate`;
- `world_session_to_first_work_accept_rate`;
- `first_work_accept_to_completion_rate`;
- `first_session_core_loop_rate`;
- `return_rate` for defined windows only when cross-session linking is lawful/reliable;
- mission completion/failure/recovery rates;
- severe-feedback incidence per tested build.

Every metric definition must record:

```text
metricId
numerator
denominator
inclusionRule
exclusionRule
identityRequirement
privacyStatus
buildScope
minimumEvidenceRule
decisionUse
```

No metric should be added merely because it is common in marketing dashboards.

Until lawful/reliable implementation exists, all cross-session retention/engagement measures that require identity linkage remain:

`NOT_MEASURABLE_WITH_CURRENT_INSTRUMENTATION`

---

# 23. Metric integrity rules

## 23.1 Denominator must be explicit

Do not say `40% completed` without saying 40% of what eligible population/event base.

## 23.2 Build mixing prohibited

Do not combine incompatible builds in one funnel unless explicitly reporting a multi-build aggregate and the change is known not to affect the metric.

## 23.3 Missing telemetry is not zero

Missing event = `UNKNOWN` unless a reliable upstream/downstream invariant proves otherwise.

Cross-session retention/engagement that cannot be lawfully linked is not `UNKNOWN` and is not zero; it is explicitly:

`NOT_MEASURABLE_WITH_CURRENT_INSTRUMENTATION`

## 23.4 Bot/invalid traffic

Use platform-provided invalid-traffic filtering where available.

Do not create invasive fingerprinting solely to classify bot traffic for an unpaid pilot.

## 23.5 Small samples

Small organic cohorts are directional.

Report counts alongside rates.

Do not present unstable small-sample rates as market forecasts.

---

# 24. Qualitative pilot report template

For each exact build/wave:

```text
Pilot ID:
Build Ref:
Cohort Ref:
Authorized Surfaces:
Observation Window:
Qualified Participants / Aggregate Count:

S0 Findings:
S1 Findings:
S2 Themes:
S3 Themes:

First-session clarity:
Android visuals:
Controls:
Story/characters:
Missions/work loop:
City scale / district separation:
Traversal / route-distance perception:
Delivery geographic distribution:
Outer-area usefulness / dead-space perception:
Persistence:
Performance:
Marketing expectation fit:
Privacy/community safety:

Existing issues updated:
New issues created:
Claims downgraded/review-required:
Owner routing summary:

Decision:
- STOP
- PAUSE_AND_TRIAGE
- CONTINUE_SAME_WAVE
- CONSIDER_NEXT_ORGANIC_WAVE

Decision evidence:
Known uncertainty:
```

Never auto-upgrade to `CONSIDER_NEXT_ORGANIC_WAVE` solely from view counts.

---

# 25. Android feedback capture protocol

When owner/testers later provide Android evidence, request only what is needed.

Preferred:

- exact buildRef;
- device model only if compatibility diagnosis requires it;
- Android version only if compatibility diagnosis requires it;
- short reproduction steps;
- screenshot or short recording intentionally submitted;
- whether issue reproduced after relaunch;
- relevant game location/state;
- for #614/#615 evidence, broad in-game district/area or route class (`local`, `adjacent-district`, `cross-city`) when that concept exists in the tested build—never the tester's real-world location.

Avoid:

- full device dumps;
- unrelated notification content;
- personal photos/contact lists;
- account credentials;
- complete system logs containing unrelated personal information.

If a screenshot/video exposes personal information, redact before storing in a public issue.

---

# 26. Community response policy

When future community feedback is active:

- acknowledge the report without promising a fix date;
- ask for only the minimum reproduction detail;
- do not argue with negative experience;
- distinguish subjective preference from reproducible defect;
- do not delete criticism because it is negative;
- moderate harassment, threats, doxxing, spam and prohibited content under a published community policy;
- never retaliate against a creator/reviewer for negative coverage;
- never condition future build access on positive sentiment;
- correct material factual errors respectfully and with evidence;
- do not reveal private tester information in public responses.

---

# 27. Review and rating integrity

Do not:

- gate review prompts behind positive sentiment;
- ask unhappy users not to review;
- offer rewards for positive reviews;
- buy reviews;
- coordinate fake reviews;
- require five-star ratings for access or support;
- quote private feedback publicly without permission when it could identify the person.

Future review prompts, if introduced, require DT-13/DT-14 policy review and must use platform-compliant mechanisms.

---

# 28. Creator/press measurement boundary

For unpaid creator/press outreach, record at most what is needed to manage the relationship and evaluate aggregate fit.

Internal creator reference:

`creator:<platform>:<nonsecret-slug>`

Possible operational fields:

- public channel URL;
- public business contact route where provided for contact;
- audience-fit category;
- language/market;
- outreach state;
- coverage public URL if published;
- sourceId;
- aggregate public performance where available;
- disclosure state if a material connection exists.

Do not enrich creator records with inferred sensitive personal data.

Do not scrape private contact information.

The initial pilot remains unpaid; no compensation field should imply payment occurred when none occurred.

---

# 29. Attribution without surveillance

Preferred order:

1. platform-native aggregate attribution;
2. aggregate campaign/source slug;
3. Play testing-track/wave context;
4. voluntary self-report (`Where did you hear about the game?`) if an approved survey exists;
5. privacy-reviewed first-party attribution only if necessary later.

Avoid deploying cross-site/cross-app tracking merely to improve precision for a small unpaid pilot.

A source slug must identify a content unit or wave, not a person.

---

# 30. Survey minimum

If a future feedback form is approved, start with a minimal question set.

Candidate questions:

1. Which exact build/test link did you use? — preferably prefilled non-personally by test wave.
2. Could you start the game successfully?
3. What did you think the game wanted you to do first?
4. Did you complete a delivery/work objective?
5. What was the biggest thing that made play harder?
6. What was the most interesting part?
7. Would you choose to play another session?
8. Optional free-text feedback.

For a future build that actually contains #614/#615 work, an owner-approved test script may ask narrowly:

- Did Brăila feel like a city or like a compact board/level?
- Could you perceive a meaningful difference between a local route and a cross-city route?
- Did legitimate work appear across distinct areas rather than repeatedly around HQ/center?
- Did outer areas feel useful or like dead space?
- Did longer traversal make bicycle/vehicle progression feel more meaningful?

These questions are future feedback prompts only. Their presence does not claim the behavior exists today.

Only ask device model/Android version when needed for a technical issue.

Do not ask age, gender, income, ethnicity, religion, political views, health status or exact location for ordinary growth measurement.

Target-audience/minor compliance uses separate DT-13/DT-14 governed processes rather than unnecessary survey profiling.

---

# 31. Claim mismatch handling

If a participant says the marketing promised something they could not find:

1. identify the exact contentId/sourceId;
2. identify the exact buildRef;
3. map the statement to claim IDs;
4. verify whether the claim was GREEN at publication;
5. reproduce the feature path if applicable;
6. classify:
   - `CONTENT_WORDING_DEFECT`;
   - `BUILD_REGRESSION`;
   - `DISCOVERABILITY_DEFECT`;
   - `ROADMAP_MISREPRESENTATION`;
   - `USER_MISINTERPRETATION_WITH_VALID_COPY`;
7. pause the content if truthfulness is uncertain;
8. route product defects to the owner lane;
9. revise content only after authoritative feature truth is known.

Do not solve a product defect by making the marketing more ambiguous.

---

# 32. Content experiment boundary

Organic content experiments may test framing only after publication is authorized.

Allowed future test dimensions:

- opening hook;
- thumbnail crop from real approved footage;
- order of truthful screenshots;
- headline emphasis among GREEN claims;
- language/localization;
- content duration/format.

Not allowed:

- fake UI;
- fabricated economy/progression state;
- roadmapped feature thumbnails presented as gameplay;
- misleading before/after comparisons;
- fake player counts;
- fake reviews/testimonials;
- synthetic engagement passed off as community response.

---

# 33. Organic source scorecard

A future source can be evaluated with evidence-backed dimensions:

- qualified install/test participation;
- first-session activation where lawfully measurable;
- severe-defect incidence;
- feedback usefulness;
- expectation fit;
- return evidence where lawfully measurable;
- community quality;
- moderation/support cost;
- creator/editorial fit.

Do not rank a source solely by raw reach.

Do not calculate CAC for unpaid sources as zero-cost without acknowledging internal time/asset/support cost when commercial planning later compares channels.

---

# 34. Stop-loss for organic distribution

Organic does not mean free of risk.

Stop or pause a source when:

- it repeatedly attracts an audience expecting a different genre due to our framing;
- moderation/safety burden exceeds the team's ability to respond responsibly;
- support volume hides reproducible P0/P1 defects;
- source-specific copy creates material claim confusion;
- source participation rules prohibit promotional behavior being used;
- the product owner cannot process the feedback volume;
- external attention is scaling faster than release readiness.

Do not continue posting merely to maintain cadence.

---

# 35. Decision log contract

Every pilot expansion/pause decision should create a concise internal record:

```text
decisionId
date
buildRef
cohortRef
sourcesReviewed[]
knownS0
knownS1
materialS2Themes[]
claimReviewState
privacyReviewState
releaseGateState
decision
rationale
decisionOwner
```

No personal participant identifiers belong in the decision log.

---

# 36. Pre-pilot activation checklist

All must be true before first external unpaid pilot activity:

- [ ] Central orchestrator/owner authorizes the pilot scope.
- [ ] Exact buildRef exists.
- [ ] DT-14 confirms permitted build distribution channel.
- [ ] #568 evidence required for that distribution stage is satisfied.
- [ ] #571 owner/account state permits the selected Play testing track where Play is used.
- [ ] DT-13 confirms feedback intake/privacy handling.
- [ ] Current #569 declaration/privacy state is reconciled if data behavior changes.
- [ ] #561 provides truthful, rights-cleared real media if public creative is used.
- [ ] Claim registry is current for the exact build.
- [ ] Known issues are written honestly.
- [ ] Feedback routing owners are available.
- [ ] No unaccepted S0 condition exists.
- [ ] Community rules exist for any publisher-controlled community surface.
- [ ] No paid spend or compensation is hidden inside the pilot.

---

# 37. Telemetry implementation gate

Before any first-party event emitter is merged:

1. identify exact event(s) and decision purpose;
2. prove the decision cannot be answered adequately with less data;
3. define all fields;
4. classify whether any field is personal data / online identifier;
5. select architecture/provider only after review;
6. document destination and processor role;
7. define retention;
8. define deletion/rights behavior where applicable;
9. review international transfers where applicable;
10. review consent/ePrivacy implications where applicable;
11. review target-age/minor implications;
12. update Data Safety/privacy evidence before shipping if behavior changes;
13. add deterministic tests that prevent accidental extra fields;
14. validate network behavior on the exact release artifact.

DT-15 specifies growth questions. DT-13 owns privacy/compliance analysis. DT-14 owns release-artifact verification. No lane may silently bypass another.

---

# 38. Telemetry schema minimization tests

A future implementation should fail CI when a minimal event unexpectedly gains prohibited or unreviewed fields.

Examples of fields requiring explicit review before any inclusion:

- email;
- phone;
- IP persisted by first-party analytics;
- advertising ID;
- Android ID;
- hardware serial;
- precise GPS;
- contacts;
- free-form chat/message content;
- account real name;
- birth date;
- payment token;
- purchase receipt payload;
- authentication token.

The safest default is absence.

---

# 39. Data retention posture

No analytics retention period is authorized by this document.

When telemetry is implemented, retention must be purpose-specific and approved.

Rules:

- aggregate reports may be retained longer than raw person-linked events when aggregation genuinely removes linkability;
- raw identifiers should not be retained merely for historical curiosity;
- debug logs should not silently become permanent analytics archives;
- deletion/retention must match public notices and processor configuration;
- a later provider default does not override the project's approved retention policy.

---

# 40. Current claim/evidence posture for measurement

As of this document's baseline and latest reconciliation:

- merged domain systems may be measured only if/when they are actually wired into the tested player-facing runtime;
- Save v2 continuity is merged in source but still requires installed Android release-candidate evidence before marketing it as a proven seamless-resume benefit;
- Story/Mission canon and registries do not by themselves prove visible narrative presentation;
- visible story presentation remains subject to its own Android acceptance path;
- country catalog expansion does not mean detailed playable global cities;
- commercial entitlement code does not mean Play Billing or purchases are active;
- production Android bundled-runtime source work does not replace #568 artifact attestation;
- #614 is an active owner direction for enlarged playable-city scale, not proof that an exact accepted Android build already provides that experience;
- #615 is an active owner direction for citywide delivery distribution, not proof that legitimate work is already geographically distributed across the full city in an accepted build;
- no current analytics event exists merely because this document names it.

---

# 41. Initial qualitative hypotheses — not findings

The following are **hypotheses to test**, not current user evidence:

1. `person -> local work -> responsibility -> larger logistics role` is more legible than leading with feature breadth.
2. Brăila authenticity differentiates the game when shown with real player-scale interaction rather than map-data claims.
3. Tycoon/simulation audiences will value causal logistics depth if the first session remains clear.
4. Story/recurring characters may broaden appeal once visual presentation is accepted.
5. Android control/readability defects can erase positioning gains even when systems are deep.
6. The most valuable early feedback will come from qualified simulation players rather than broad low-intent traffic.
7. A Brăila build that visibly communicates meaningful district separation and local-vs-cross-city travel should strengthen the value of transport progression, but this remains unproven until tested.
8. Legitimate work distributed across multiple urban contexts should make a larger city feel purposeful rather than empty, but this remains unproven until #615 behavior is actually present in the tested build.

A hypothesis becomes evidence only after a real pilot produces observations.

---

# 42. First future organic pilot questions

When authorization arrives, the first pilot should seek evidence for:

- Can participants explain what DROPi Tycoon is after one short session?
- Can they start the Android build without assistance?
- Can they find and complete the first legitimate work loop?
- Do controls and labels remain usable in landscape?
- Does save/relaunch behavior protect confidence?
- Do story/mission elements fire only when genuinely integrated?
- Does the build feel like a game rather than a debug/admin interface?
- If the tested build actually includes #614-scale work, does Brăila feel like a city rather than a compact board?
- If the tested build actually includes #615 distribution work, do legitimate routes use distinct urban contexts rather than repeatedly clustering around HQ/center?
- Which claim or screenshot best matches what players actually valued?
- What is the strongest reason a participant would voluntarily return?
- What is the strongest reason they would stop?

---

# 43. Reporting cadence

Do not create reporting rituals before there is a real pilot.

Once a pilot exists:

- S0 findings: route immediately;
- S1 findings: route before expanding the cohort;
- wave summary: once per completed test wave;
- content/source review: after enough real evidence exists to support a decision;
- no daily vanity dashboard requirement for tiny cohorts.

---

# 44. Public transparency principles

When discussing early testing publicly:

- call alpha/beta/test builds what they are;
- distinguish current features from roadmap;
- acknowledge known material defects that affect the invited test purpose;
- do not imply broad availability when access is limited;
- do not imply user counts that cannot be substantiated;
- do not imply press/creator endorsements;
- do not imply that a creator's coverage was positive if it was mixed/negative;
- do not imply privacy properties that have not been reconciled to the exact build;
- do not describe the #614 larger-city direction or #615 citywide work-distribution direction as shipped until exact-build evidence supports it.

---

# 45. Dark-pattern prohibition

The organic pilot must not use:

- forced invite loops;
- countdowns without real deadlines;
- fake limited slots;
- fake waitlists;
- disguised advertisements;
- preselected consent for optional tracking;
- confusing privacy controls;
- repeated notification nags;
- deceptive close buttons;
- artificially delayed rewards to pressure re-entry;
- review gating;
- shame/fear messaging for inactivity;
- rewards conditioned on positive public statements.

Growth that depends on deception is a product defect, not a successful acquisition strategy.

---

# 46. Community integrity principles

Future official community spaces should optimize for useful conversation rather than visible size.

Do not:

- seed fake member accounts;
- buy members;
- automate fake conversation;
- hide material developer affiliation;
- impersonate players;
- publish private tester messages without permission;
- create dozens of empty channels to appear large;
- use bots to fabricate activity.

A small real community is preferable to a large synthetic one.

---

# 47. Owner-facing pilot dashboard — conceptual only

If a dashboard is later implemented, its first screen should prioritize:

1. exact active build;
2. active test wave;
3. S0/S1 unresolved findings;
4. first-session funnel where lawful telemetry exists;
5. qualitative top themes;
6. claim mismatch alerts;
7. Android compatibility/stability evidence;
8. return/retention only when truly measurable;
9. source evidence;
10. next decision and owner.

Do not lead with raw followers, impressions or likes.

No dashboard implementation is part of this PR.

---

# 48. Data model sketch — future implementation

Conceptual aggregate records:

```ts
interface OrganicSourceDefinition {
  sourceId: string;
  channelFamily: string;
  surface: string;
  language: string;
  marketContext?: string;
}

interface BuildEvidenceRef {
  buildRef: string;
  sourceSha: string;
  distributionStage: string;
  artifactAttestationRef?: string;
}

interface PilotWaveDefinition {
  pilotId: string;
  cohortRef: string;
  buildRef: string;
  sourceIds: string[];
  state: 'PLANNED' | 'AUTHORIZED' | 'ACTIVE' | 'PAUSED' | 'COMPLETE';
}

interface QualitativeFeedbackRecord {
  feedbackId: string;
  buildRef?: string;
  sourceId?: string;
  cohortRef?: string;
  primaryCategory: string;
  severity: 'S0' | 'S1' | 'S2' | 'S3';
  summary: string;
  ownerRoute: string;
  status: string;
}
```

These are design sketches only. They do not authorize a database or tracking service.

---

# 49. No-personal-profile invariant

The growth measurement model must not require a consolidated marketing profile such as:

```text
person -> all sources -> all sessions -> all choices -> all purchases -> all community posts
```

That architecture is not necessary for the initial unpaid pilot and is prohibited by this design.

If a future commercial use case genuinely requires broader identity linkage, it needs a new scoped design/privacy review.

---

# 50. Interaction with commercial entitlements

Current commercial-domain code is presentation-only/non-pay-to-win and does not authorize purchase execution.

The organic pilot must not:

- promise paid products are purchasable;
- infer purchase propensity from gameplay;
- segment vulnerable players for monetization;
- alter difficulty/rewards based on spending status;
- use supporter cosmetics as hidden progression advantages.

Future monetization measurement requires DT-12 + DT-13 + DT-14 coordination and explicit owner approval.

---

# 51. Interaction with minors

The pilot must not infer or collect age unnecessarily.

Target-audience decisions belong to Play/legal release work.

If children/minors are deliberately included in a future test/community:

- DT-13 must review the specific intake/community/consent/moderation model;
- DT-14 must reconcile Play target-audience requirements;
- community contact and data collection must not begin until required safeguards exist.

This playbook does not authorize a child-directed pilot.

---

# 52. Interaction with Discord/Reddit/social platforms

Before using a community/platform:

- follow its current rules;
- identify developer affiliation where relevant;
- do not spam promotional posts;
- do not use automation to evade rate/anti-spam rules;
- do not collect platform user data into a private database merely because it is publicly visible;
- store only operationally necessary public contact/reference information.

Platform-specific execution rules must be rechecked at activation time because they can change.

---

# 53. External feedback -> repository evidence

A repository issue should contain:

- summarized defect/theme;
- exact buildRef;
- reproduction when available;
- minimized screenshot/video evidence reference;
- severity rationale;
- affected canonical domain;
- source count such as `reported by 3 independent participants`, when true;
- no unnecessary participant identity.

Do not paste entire community conversations into GitHub when a concise evidence summary is sufficient.

---

# 54. Evidence quality ladder

From strongest to weakest for product defects:

1. deterministic reproduction on exact build;
2. multiple independent exact-build reproductions;
3. one participant report with clear reproduction evidence;
4. multiple consistent qualitative reports without reproduction;
5. one unverified report;
6. speculation / feature request.

From strongest to weakest for positioning:

1. repeated independent explanation/behavior consistent with the intended fantasy;
2. observed completion plus matching qualitative feedback;
3. repeated voluntary comments/questions;
4. click/view behavior without play evidence;
5. impressions only.

---

# 55. Early success definition

The first organic pilot succeeds if it produces **decision-quality evidence**, even if the conclusion is to pause distribution.

Success is not defined as:

- many views;
- many Discord members;
- many followers;
- positive-only comments;
- press coverage count;
- a specific retention number invented before measurement exists.

A pilot that discovers a release blocker before wider exposure is valuable.

---

# 56. Escalation to central orchestrator

Escalate when:

- feedback spans more than one specialist authority;
- issue ownership is disputed;
- a claim depends on conflicting canonical sources;
- an S0 requires coordinated rollback/disablement;
- product and marketing evidence disagree materially;
- privacy/release gates conflict with a planned growth action;
- the next cohort would materially increase public exposure.

DT-15 must not resolve cross-lane authority disputes by editing another specialist's system.

---

# 57. Next implementation slices after this design

None are automatically authorized.

Potential later slices, only after orchestrator assignment:

1. a repository-only claim/content registry validator;
2. a privacy-reviewed feedback intake template;
3. aggregate pilot reporting tooling;
4. minimal lawful product event instrumentation;
5. Play/website source tagging;
6. owner dashboard.

Each must have its own scoped authority and must not be inferred from this document.

---

# 58. Current blockers to activation

At this baseline, external pilot activation remains blocked or constrained by:

- #568 — exact reproducible production AAB / artifact attestation;
- #571 — owner-specific Play Console verification/signing/test-to-production state;
- final artifact-dependent #569 privacy/Data Safety/App Content reconciliation and owner/legal inputs, despite the tracker currently showing completed;
- #565 remaining commercial IP/provenance clearance items where relevant to external assets;
- #561 authentic owner-validated creative capture pack;
- #317 and visible Android acceptance gates for player-facing quality;
- #614/#615 owner-directed city-scale and citywide-delivery quality work remains future until exact-build implementation/acceptance evidence exists;
- unresolved release-audit findings as maintained by DT-16.

This document removes no release blocker.

---

# 59. Handoff boundaries

## DT-15 owns

- organic source taxonomy;
- growth questions;
- claim/content preflight;
- qualitative feedback taxonomy;
- organic stop/go playbook;
- source/cohort reporting design;
- expectation-fit interpretation.

## DT-13 owns

- privacy/data minimization legal/compliance interpretation;
- lawful basis/consent/ePrivacy analysis;
- processor/transfer/retention review;
- minors/community safety requirements;
- disclosure/community policy boundaries.

## DT-14 owns

- exact Android artifact identity;
- Play test track availability;
- production AAB evidence;
- signing/permissions/device compatibility;
- release network/native behavior evidence.

## DT-16 owns

- independent release severity/gate audit.

## Domain specialists own

- fixes and acceptance for feedback routed into their system.

## Project Owner / central orchestrator owns

- activation of an external pilot;
- any spend;
- account/Play owner actions;
- major public launch timing;
- cross-lane priority/merge order.

---

# 60. Final activation rule

Until explicitly changed by the central orchestrator/owner, the state remains:

`PILOT_NOT_AUTHORIZED`

`TELEMETRY_NOT_AUTHORIZED`

`PAID_GROWTH_NOT_AUTHORIZED`

`CREATOR_CONTACT_NOT_AUTHORIZED`

The repository may prepare truthful systems and evidence in advance.

It must not manufacture the launch before the product, legal, privacy, Android and creative evidence is ready.
