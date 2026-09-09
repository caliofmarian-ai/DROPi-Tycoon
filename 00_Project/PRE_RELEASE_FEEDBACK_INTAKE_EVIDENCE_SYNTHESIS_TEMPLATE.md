# Document Information

Document: `PRE_RELEASE_FEEDBACK_INTAKE_EVIDENCE_SYNTHESIS_TEMPLATE.md`
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical template — intake not activated
Owner Lane: DT-15 — Marketing / Growth / ASO / Community
Coordination: DT-01, DT-05, DT-07, DT-09, DT-10, DT-13, DT-14, DT-16
Baseline Main: `932a56849d5591a28955c086e96474efcf3bbf60`
Prepared: 2026-09-09

---

# DROPi Tycoon — Pre-Release Feedback Intake + Evidence Synthesis Template

## 1. Purpose

This document defines a privacy-minimized, exact-build-bound template for collecting and synthesizing future owner/tester observations before public release.

It is designed for the player-facing work most likely to require structured evidence before marketing or release claims are activated:

- enlarged Brăila city scale and traversal quality under #614;
- citywide delivery distribution under #615;
- visual story / character / dialogue presentation under #558 and its eventual successors;
- Android candidate startup, controls, lifecycle, persistence and performance;
- related first-session product-quality evidence when it materially affects the same tested build.

This document is a **template and evidence contract only**.

Current state:

`TEMPLATE_READY — INTAKE_NOT_ACTIVATED — TELEMETRY_NOT_AUTHORIZED — CAMPAIGN_NOT_AUTHORIZED`

It does not create a form, endpoint, database, survey service, analytics SDK, tester cohort, campaign, creator outreach flow or Play Console action.

Canonical invariant:

> **Record what was actually observed on an exact build, minimize participant data, separate evidence from interpretation, and never convert roadmap intent into shipped-product claims.**

---

# 2. Relationship to existing canon

This template consumes and does not replace:

1. `00_Project/GROWTH_MARKETING_LAUNCH_STRATEGY.md`;
2. `00_Project/STORE_CREATIVE_PREPRODUCTION_MANIFEST.md`;
3. `00_Project/GOOGLE_PLAY_TEXT_METADATA_PACK.md`;
4. `00_Project/LAUNCH_PRESS_KIT_CREATOR_OUTREACH_PACKAGE.md`;
5. `00_Project/ORGANIC_COMMUNITY_LAUNCH_MEASUREMENT_PLAYBOOK.md`;
6. `00_Project/LEGAL_PRIVACY_COMPLIANCE.md`;
7. exact Android/release evidence owned by DT-14;
8. exact feature/runtime evidence owned by the relevant gameplay specialist;
9. independent release classification owned by DT-16.

If evidence is incomplete, the correct result is uncertainty—not a favorable assumption.

---

# 3. Non-goals

This template does not:

- activate external testing;
- authorize distribution of an APK or AAB;
- authorize Google Play internal/closed/open/production testing;
- authorize creator/community contact;
- authorize paid acquisition;
- install analytics or crash-reporting SDKs;
- create persistent participant identifiers;
- create an advertising identifier;
- collect precise location;
- collect contact lists;
- collect payment information;
- collect authentication credentials;
- define legal bases or consent language;
- replace DT-13 privacy/compliance review;
- replace DT-14 Android acceptance or artifact attestation;
- replace DT-16 release audit;
- create gameplay fixes;
- create issue spam from every comment;
- invent completion, retention, stability or satisfaction metrics;
- infer participant demographics, personality or sensitive traits;
- treat an unmerged branch as release truth;
- treat a merged domain contract as proof of visible Android behavior.

---

# 4. Activation gate

No real participant intake begins from this document alone.

Before a future intake wave can be activated, the orchestrator/owner must explicitly authorize:

- the exact build under test;
- the distribution channel;
- the intended participant group;
- the feedback intake surface;
- the privacy notice/process appropriate to that surface;
- the handling location for intentionally submitted media;
- the responsible triage owners.

Where a Play-distributed build is involved, DT-14 remains authoritative for the permitted track and artifact identity.

Where personal data may be collected, DT-13 must review the intake design before activation.

---

# 5. Exact-build rule

Every build-specific observation must be tied to the exact tested artifact when that identity is available.

Preferred canonical reference:

`build:<distribution-stage>:<source-sha-short>:<artifact-sequence>`

The evidence record may also reference:

- full Git source SHA;
- EAS build ID;
- AAB SHA-256;
- versionName;
- versionCode;
- Play testing track;
- DT-14 attestation record.

Do not store signing secrets, private keys, credentials or private Play tokens.

If exact build identity cannot be established, classify the evidence:

`BUILD_IDENTITY_UNCERTAIN`

Such evidence may identify a theme but cannot prove a release claim or close a build-specific blocker.

---

# 6. Observation source classes

Use a source class, not a participant identity, whenever identity is unnecessary.

Allowed future source classes:

- `OWNER_ANDROID_REVIEW`;
- `INTERNAL_CONTROLLED_TEST`;
- `CLOSED_TEST_VOLUNTARY_FEEDBACK`;
- `QUALIFIED_EXTERNAL_TESTER_FEEDBACK`;
- `CREATOR_EARNED_FEEDBACK` — only after creator contact is separately authorized;
- `COMMUNITY_VOLUNTARY_FEEDBACK` — only after community activity is separately authorized;
- `DETERMINISTIC_INTERNAL_REPRODUCTION`;
- `PLAY_PLATFORM_AGGREGATE_EVIDENCE`.

A source class is not a user profile.

---

# 7. Privacy-minimized intake record

Canonical minimal record:

```text
intakeId
receivedAt
sourceClass
buildRef?
testScenarioId
primaryCategory
secondaryCategories[]
severity
reproducibility
observation
expectedBehavior?
actualBehavior?
participantEvidenceRef?
ownerRoute
linkedIssue?
triageState
```

Optional fields only when materially needed:

```text
deviceClass?
androidVersion?
orientation?
broadInGameArea?
routeClass?
relaunchReproduction?
networkMode?
```

`broadInGameArea` means an in-game location such as district/area/HQ/Station Commons. It must never contain the tester's real-world precise location.

`routeClass` may use only a governed in-game category present in the tested build, for example:

- `local`;
- `adjacent-district`;
- `cross-city`.

If that route classification is not implemented in the exact build, leave the field blank rather than guessing.

---

# 8. Data that must not be requested by default

Do not request or record for ordinary pre-release product feedback:

- legal name;
- personal email;
- phone number;
- home/work address;
- precise GPS coordinates;
- IP address as an analytics field;
- advertising ID;
- Android ID;
- device serial;
- contacts;
- photos unrelated to the defect;
- unrelated notification content;
- date of birth;
- income;
- ethnicity;
- religion;
- political views;
- health information;
- sexual orientation;
- account password;
- auth token;
- recovery codes;
- payment credentials;
- full device dumps when a narrow screenshot/reproduction is enough.

If a future feedback service inherently processes technical metadata, DT-13 must review that service before activation.

---

# 9. Submitted screenshot/video rule

Participant media is accepted only when intentionally submitted for the test/defect purpose.

Before storing or referencing it:

1. verify it is relevant;
2. minimize or redact unrelated personal information;
3. avoid uploading unnecessary full-screen notification/account surfaces to a public issue;
4. store only the reference needed for diagnosis/evidence;
5. do not repurpose tester evidence into marketing creative without separate permission and asset/rights review.

A gameplay screenshot submitted for bug diagnosis is not automatically a testimonial or store asset.

---

# 10. Evidence state vocabulary

Each synthesized statement uses one evidence state:

- `NOT_OBSERVED` — no real observation exists;
- `OBSERVED_ON_EXACT_BUILD` — observed on identified artifact;
- `REPRODUCED_ON_EXACT_BUILD` — deterministically reproduced;
- `MULTIPLE_INDEPENDENT_REPORTS` — multiple independent reports on the same build;
- `BUILD_IDENTITY_UNCERTAIN` — report exists but build cannot be proven;
- `CONFLICTING_EVIDENCE` — meaningful observations disagree;
- `FIX_PENDING_RETEST` — owner reports a fix but no accepted retest yet;
- `RETEST_PASSED` — exact successor build retest passed for scoped condition;
- `RETEST_FAILED` — scoped condition remains;
- `NOT_APPLICABLE_TO_BUILD` — target feature/path is absent by design in that build.

Do not use `PASS` merely because no one reported a defect.

---

# 11. Evidence quality ladder

For build defects, strongest to weakest:

1. deterministic reproduction on exact build;
2. multiple independent exact-build reproductions;
3. one exact-build report with clear media/reproduction;
4. multiple consistent qualitative reports;
5. one exact-build report without reproduction;
6. build-uncertain report;
7. speculation or feature request.

For perception/experience questions, strength comes from repeated independent observations plus exact-build context, not from forcing deterministic reproduction of subjective judgments.

---

# 12. Severity model

Use the merged playbook severity model.

## `S0 — RELEASE STOP`

Examples:

- unrecoverable save/progress corruption;
- severe security/privacy incident;
- production candidate cannot start;
- widespread crash/ANR;
- shipped/public claim materially false for the exact build;
- critical rights/provenance violation in distributed media.

## `S1 — PILOT STOP / FIX BEFORE EXPANSION`

Examples:

- first-session cannot progress;
- repeated primary control failure;
- mission/work loop cannot complete;
- severe Android landscape clipping/input obstruction;
- serious save/resume failure;
- visual story modal makes gameplay unusable;
- city-scale/traversal implementation makes core work impractical on primary target hardware.

## `S2 — MATERIAL IMPROVEMENT`

Examples:

- repeated weak legibility;
- board-like city perception despite larger map intent;
- repeated center/HQ delivery bias in a build meant to test #615;
- outer-city dead-space perception;
- repeated story pacing/character distinction weakness;
- material but recoverable stutter.

## `S3 — OBSERVATION / PREFERENCE`

Examples:

- isolated aesthetic preference;
- optional feature suggestion;
- subjective route preference;
- non-blocking stylistic comment.

Severity describes impact, not how much the team likes or dislikes the feedback.

---

# 13. Canonical test-scenario IDs

These scenario IDs are templates. A scenario is active only if the exact build genuinely contains the required path.

- `scenario:android:cold-start`;
- `scenario:android:background-resume`;
- `scenario:android:back-navigation`;
- `scenario:android:touch-controls`;
- `scenario:android:process-kill-relaunch`;
- `scenario:android:save-continuity`;
- `scenario:android:performance-traversal`;
- `scenario:city-scale:city-presence`;
- `scenario:city-scale:district-separation`;
- `scenario:city-scale:local-vs-cross-city`;
- `scenario:city-scale:outer-area-use`;
- `scenario:delivery-distribution:center-bias`;
- `scenario:delivery-distribution:route-variety`;
- `scenario:delivery-distribution:outer-area-coverage`;
- `scenario:delivery-distribution:producer-logistics`;
- `scenario:visual-story:first-shift`;
- `scenario:visual-story:character-distinction`;
- `scenario:visual-story:modal-controls`;
- `scenario:visual-story:android-back`;
- `scenario:visual-story:first-delivery-consequence`;
- `scenario:first-hour:core-loop`.

Do not activate a scenario because an issue or branch exists. Activate it only for a build containing that testable behavior.

---

# 14. Android candidate intake template

```text
INTAKE TYPE: ANDROID CANDIDATE

Build Ref:
Source Class:
Device Class (only if needed):
Android Version (only if needed):
Orientation:
Network Mode if relevant:
Scenario ID:

Could the app start?          NOT_OBSERVED / YES / NO
Reached playable world?       NOT_OBSERVED / YES / NO
Controls usable?              NOT_OBSERVED / YES / NO
Back behavior correct?        NOT_OBSERVED / YES / NO
Background/resume correct?    NOT_OBSERVED / YES / NO
Relaunch continuity correct?  NOT_OBSERVED / YES / NO
Material stutter/freeze?      NOT_OBSERVED / YES / NO

Observation:
Reproduction Steps:
Severity:
Evidence Ref:
Owner Route:
```

A blank field is preferred to an invented answer.

---

# 15. Enlarged-city #614 intake template

Use only for a build that actually includes the relevant city-scale implementation.

```text
INTAKE TYPE: CITY SCALE / TRAVERSAL

Build Ref:
Scenario ID:
Broad In-Game Area(s):
Transport Mode(s) Actually Used:

City feels like:
- NOT_OBSERVED
- COMPACT_BOARD_OR_LEVEL
- MIXED
- CITY_LIKE

District separation:
- NOT_OBSERVED
- NOT_PERCEPTIBLE
- SOMEWHAT_PERCEPTIBLE
- CLEAR

Local vs cross-city distance:
- NOT_OBSERVED
- NOT_MEANINGFULLY_DIFFERENT
- SOMEWHAT_DIFFERENT
- CLEARLY_DIFFERENT

Outer areas:
- NOT_OBSERVED
- DEAD_SPACE
- MIXED_USEFULNESS
- PURPOSEFUL

Transport progression value:
- NOT_OBSERVED
- NO_VISIBLE_VALUE
- SOME_VALUE
- CLEAR_VALUE

Camera/world-scale perception:
Observation:
Performance Observation:
Severity:
Evidence Ref:
Owner Route:
```

These labels are qualitative evidence categories, not KPI scores.

Primary route: DT-01. Route traversal/ambient behavior to DT-05 when that is the actual defect.

---

# 16. Citywide-delivery #615 intake template

Use only for a build that actually contains governed citywide distribution behavior.

```text
INTAKE TYPE: CITYWIDE DELIVERY DISTRIBUTION

Build Ref:
Scenario ID:
Observation Window / Number of Legitimate Opportunities Seen:

Center/HQ clustering observed?
- NOT_OBSERVED
- HEAVY
- MIXED
- LOW

District/area variety:
- NOT_OBSERVED
- SINGLE_AREA
- LIMITED
- MULTIPLE_DISTINCT_AREAS

Route classes genuinely encountered:
- local
- adjacent-district
- cross-city
- NOT_OBSERVED

Outer/peripheral legitimate work observed?
- NOT_OBSERVED
- YES
- NO

Producer/logistics cause-driven route observed?
- NOT_OBSERVED
- YES
- NO

Repeated endpoint overuse observed?
- NOT_OBSERVED
- YES
- NO

Observation:
Authoritative cause/order reference if available without exposing unrelated state:
Severity:
Evidence Ref:
Owner Route:
```

Never infer fake demand from marker distribution.

Primary route: DT-09. Causal supply/demand defects route to DT-07. Work-access eligibility mismatches route to DT-06.

---

# 17. Visual-story / #558-family intake template

Use only for a build that actually contains the visual-story presentation path.

```text
INTAKE TYPE: VISUAL STORY

Build Ref:
Scenario ID:
Story Beat / Stable Ref if known:

Chapter/dialogue visible?           NOT_OBSERVED / YES / NO
Text readable in landscape?         NOT_OBSERVED / YES / NO
Character visually distinguishable? NOT_OBSERVED / YES / NO
Choice targets usable?              NOT_OBSERVED / YES / NO / N/A
World input blocked while modal?     NOT_OBSERVED / YES / NO
Android Back behaves safely?         NOT_OBSERVED / YES / NO
Premature story beat observed?       NOT_OBSERVED / YES / NO
Duplicate completion/consequence?    NOT_OBSERVED / YES / NO
Gameplay state changed incorrectly?  NOT_OBSERVED / YES / NO

Observation:
Reproduction Steps:
Severity:
Evidence Ref:
Owner Route:
```

Primary route: DT-10 for presentation; DT-08 for canon/content; DT-09 for mission trigger/materialization; economy/state mutations to their authoritative owners.

---

# 18. First-hour synthesis dimensions

For an exact candidate build, synthesize only what was actually tested:

- startup success and time-to-usable-world perception;
- first work discoverability;
- controls and camera clarity;
- Brăila readability and city presence;
- city-scale/traversal perception if present;
- first delivery/work completion;
- citywide work distribution if present;
- story/character presentation if present;
- Personal Money / work consequence clarity if present;
- save/relaunch trust;
- performance/stability;
- marketing expectation fit.

Do not mark an absent future system as a defect unless the tested build was explicitly meant to contain it.

---

# 19. Synthesis packet header

Every synthesis packet begins with:

```text
Synthesis ID:
Prepared At:
Build Ref:
Full Source SHA:
Artifact Attestation Ref:
Distribution Stage:
Authorized Test Scope:
Observation Window:
Source Classes Included:
Total Valid Intake Records:
Build-Uncertain Records Excluded from Build Claims:
Prepared By Lane:
```

If there are no real records:

`Total Valid Intake Records: NOT_OBSERVED`

Do not substitute synthetic sample data.

---

# 20. Evidence synthesis table

Use one row per material theme.

| Theme ID | Category | Evidence state | Real record count | Highest evidence quality | Severity | Build scope | Owner route | Existing issue | Claim impact |
|---|---|---|---:|---|---|---|---|---|---|
| `<theme>` | `<fb:...>` | `NOT_OBSERVED` | `NOT_OBSERVED` | `NOT_OBSERVED` | `NOT_OBSERVED` | `<build>` | `<DT>` | `<issue?>` | `NONE/REVIEW_REQUIRED` |

Counts must come from real valid intake records.

Do not enter fake example counts in the canonical live synthesis.

---

# 21. Repeated-theme rule

A repeated theme may be summarized when multiple valid observations describe materially the same product behavior.

The synthesis must preserve:

- exact build scope;
- number of valid reports;
- whether reports are independent;
- strongest reproduction/evidence state;
- meaningful conflicting evidence;
- severity rationale;
- owner route.

Do not convert repeated comments into a percentage unless the denominator is meaningful and explicitly defined.

---

# 22. Conflicting evidence template

```text
Theme ID:
Build Ref:

Evidence A:
Evidence B:

Possible explanation classes:
- DIFFERENT_DEVICE_CLASS
- DIFFERENT_GAME_STATE
- DIFFERENT_ROUTE_OR_AREA
- NON_DETERMINISTIC_DEFECT
- SUBJECTIVE_PREFERENCE
- BUILD_IDENTITY_UNCERTAIN
- UNKNOWN

Next evidence needed:
Owner route:
Current conclusion: CONFLICTING_EVIDENCE
```

Do not select the more favorable observation merely because it supports marketing.

---

# 23. Claim-impact synthesis

For every material player-facing theme, determine whether existing public/ready-to-publish claims need review.

Allowed states:

- `NO_CLAIM_IMPACT`;
- `CLAIM_REVIEW_REQUIRED`;
- `CLAIM_DOWNGRADE_REQUIRED`;
- `CREATIVE_RECAPTURE_REQUIRED`;
- `PUBLICATION_PAUSE_REQUIRED`;
- `NO_CURRENT_PUBLIC_CLAIM`.

A product defect is not solved by vague copy.

A roadmap feature remains roadmap even if testers say they would like it.

---

# 24. Marketing truth check for #614/#615

Until an exact accepted Android build proves the behavior:

- do not say Brăila already feels like a large real city;
- do not say the player already works across the entire playable city;
- do not say local/adjacent/cross-city work is already a current release feature;
- do not show a map-wide marker spread that is manufactured rather than caused by real authoritative work;
- do not use a future world-scale concept image as gameplay evidence.

Owner/tester observations may later support a claim review, but they do not automatically make a claim GREEN.

---

# 25. Marketing truth check for visual story

Until the relevant exact Android build is accepted:

- do not claim a polished character-driven first hour based only on #558 or canon documents;
- do not use procedural/placeholder character identity as proof of final portrait quality;
- do not claim recurring character memory if the tested runtime does not visibly prove it;
- do not claim choices have persistent consequences unless the exact build demonstrates the governed consequence path.

---

# 26. Android release evidence boundary

This template can summarize Android observations but cannot certify an artifact.

DT-14 remains authoritative for:

- production AAB identity;
- versionName/versionCode;
- signing/attestation;
- permissions;
- target/compile/min SDK;
- native ABI/page-size evidence;
- Play track behavior;
- device compatibility / pre-launch report;
- exact installed build identity.

If the artifact identity is uncertain, do not use intake results to support Play release claims.

---

# 27. Privacy evidence boundary

This template is intentionally compatible with a no-telemetry current product posture.

It does not authorize collection.

If any future intake surface collects/transmits personal data or device/online identifiers, DT-13 must reconcile:

- purpose;
- data categories;
- lawful basis/consent where relevant;
- retention;
- deletion/rights handling;
- processor/transfer behavior;
- minors/target-audience implications;
- privacy notice wording;
- Play Data Safety impact.

A closed GitHub tracker does not override unresolved substantive privacy evidence.

---

# 28. Retention and return metrics

This template does not create D1/D7/D30 measurement.

Unless a lawful, reviewed and reliable cross-session identity mechanism exists, record:

```text
D1: NOT_MEASURABLE_WITH_CURRENT_INSTRUMENTATION
D7: NOT_MEASURABLE_WITH_CURRENT_INSTRUMENTATION
D30: NOT_MEASURABLE_WITH_CURRENT_INSTRUMENTATION
```

Do not replace these values with:

- zero;
- a guess;
- voluntary return intent;
- invitation acceptance;
- aggregate follow-up participation;
- owner impression.

Those can be recorded separately under their real labels.

---

# 29. No fake KPI rule

For any metric without observed, valid evidence, use:

- `NOT_OBSERVED`; or
- `NOT_MEASURABLE_WITH_CURRENT_INSTRUMENTATION`; or
- `NOT_APPLICABLE_TO_BUILD`.

Never use placeholder percentages in a live decision record.

A documentation example must be explicitly labeled `EXAMPLE_ONLY` and must never be copied into a release report as observed data.

---

# 30. Owner Android review packet

A future owner review packet may be prepared as:

```text
OWNER ANDROID REVIEW

Build Ref:
Source SHA:
Artifact Ref:
Date:

Required scenarios:
[ ] cold start
[ ] world entry
[ ] movement/touch
[ ] Back behavior
[ ] background/resume
[ ] process-kill/relaunch
[ ] save continuity
[ ] visual readability
[ ] city-scale scenario if implemented
[ ] citywide delivery scenario if implemented
[ ] visual-story scenario if implemented
[ ] sustained traversal/performance

S0:
S1:
S2:
S3:

Media refs:
Existing issues updated:
New issue justified?:
Overall owner observation:
```

The template does not pre-fill a PASS.

---

# 31. Minimal external tester form — future only

If DT-13 approves an intake surface, the initial questionnaire should remain short.

Candidate fields:

1. Could you start and enter the playable world?
2. What did you think you were supposed to do first?
3. Did you complete a delivery/work objective?
4. What was the biggest thing that made the game harder to use or understand?
5. What part was most interesting?
6. Would you voluntarily play another session?
7. Optional: describe one bug or confusing moment.
8. Optional: attach a screenshot/short recording for that issue.

Build/wave context should be pre-associated operationally where possible rather than asking participants for personal identifiers.

Do not ask demographics merely for growth segmentation.

---

# 32. Scenario-specific optional questions

Only show scenario-specific questions when the tested build actually contains that scope.

For #614:

- Did Brăila feel like a city or a compact game board?
- Could you tell districts/areas apart through distance and structure?
- Did a cross-city trip feel meaningfully longer than local work?
- Did outer areas feel purposeful?

For #615:

- Did legitimate delivery work repeatedly cluster near HQ/center?
- Did you encounter legitimate work across distinct areas?
- Could you distinguish local, adjacent-district and cross-city work when available?

For visual story:

- Were characters visually distinguishable?
- Was dialogue readable without blocking controls incorrectly?
- Did story beats appear to match what had actually happened in gameplay?

Do not ask a question that implies the feature exists when it is absent from the build.

---

# 33. Triage workflow

Canonical flow:

```text
RECEIVE
-> MINIMIZE
-> VERIFY BUILD
-> CLASSIFY CATEGORY
-> CLASSIFY SEVERITY
-> CHECK REPRODUCTION
-> SEARCH EXISTING ISSUE / PR
-> ROUTE TO OWNER
-> ADD EVIDENCE OR CREATE ONE JUSTIFIED ISSUE
-> TRACK FIX
-> RETEST EXACT SUCCESSOR BUILD
-> UPDATE CLAIM STATE IF NEEDED
```

---

# 34. Duplicate-first rule

Before creating any GitHub issue from feedback:

1. search existing open issues;
2. search active specialist PRs;
3. search existing owner feedback issues;
4. attach minimized evidence to the existing owner when appropriate.

Create a new issue only when:

- no current issue owns the behavior;
- evidence is meaningful enough to justify product work;
- the scope is clearly described;
- personal data can be minimized;
- the correct owner lane is known or the orchestrator explicitly triages it.

---

# 35. Routing map

| Observation domain | Primary route |
|---|---|
| Brăila world scale, district spacing, camera/visual scale | DT-01 |
| Pedestrian/traffic/traversal/sector actor behavior | DT-05 |
| Production/supply/demand geographic cause | DT-07 |
| Mission/delivery opportunity distribution | DT-09 |
| Character/dialogue visual presentation | DT-10 |
| Story canon/content semantics | DT-08 |
| Save/relaunch/cargo/mission continuity | DT-02 |
| Player Money/work/wages/Work Capacity | DT-03 |
| Professions/capability/work access | DT-06 |
| Country/locality generalization | DT-11 |
| Monetization expectation / pay-to-win concern | DT-12 |
| Privacy/IP/community safety | DT-13 |
| Android artifact/release/device behavior | DT-14 |
| Claims/positioning/evidence synthesis | DT-15 |
| Cross-domain release severity | DT-16 |

If one report spans multiple owners, select the root authority as primary and list secondary routes. Do not duplicate the same defect into parallel issues.

---

# 36. Current workstream evidence status at template creation

This section records only repository state at the baseline and must be refreshed before actual use.

## #614 enlarged city

Status at template creation:

- owner direction exists;
- active specialist work exists;
- not automatically a current release claim;
- exact accepted Android evidence remains required.

## #615 citywide delivery distribution

Status at template creation:

- owner direction exists;
- DT-09 and DT-07 specialist work is active;
- distribution/cause contracts do not alone prove player-visible citywide work;
- exact build observation remains required.

## visual story

Status at template creation:

- #558 remains a visible specialist PR path;
- owner Android acceptance is required;
- no assumption of `ANDROID_VERIFIED`.

## production Android candidate

Status at template creation:

- #568 production AAB/attestation remains unresolved;
- #591 remains the DT-14 WIP branch at the time of preparation;
- #571 owner/Play Console gate remains separate.

This status section is not a permanent source of truth. Refresh from GitHub before each future wave.

---

# 37. Theme synthesis template

```text
THEME ID:
BUILD REF:
CATEGORY:

Observed statement:
Evidence state:
Valid record count:
Independent report count:
Strongest evidence quality:
Conflicting evidence:
Severity:

Likely owning domain:
Existing issue/PR:
New issue needed?: YES / NO / UNKNOWN

Player impact:
First-session impact:
Release impact:
Claim impact:

Recommended next evidence:
Recommended owner action:
DT-15 action:
```

DT-15 may recommend claim pause/downgrade or request evidence. DT-15 must not implement another lane's product fix.

---

# 38. Synthesis summary template

```text
PRE-RELEASE EVIDENCE SYNTHESIS

Synthesis ID:
Exact Build Ref:
Source SHA:
Artifact Evidence Ref:
Observation Window:
Authorized Scope:
Valid Records:
Excluded Build-Uncertain Records:

S0 RELEASE STOPS:
- NOT_OBSERVED

S1 PILOT STOPS:
- NOT_OBSERVED

S2 MATERIAL THEMES:
- NOT_OBSERVED

S3 OBSERVATIONS:
- NOT_OBSERVED

CITY SCALE / TRAVERSAL:
- NOT_OBSERVED / NOT_APPLICABLE_TO_BUILD

CITYWIDE DELIVERY DISTRIBUTION:
- NOT_OBSERVED / NOT_APPLICABLE_TO_BUILD

VISUAL STORY:
- NOT_OBSERVED / NOT_APPLICABLE_TO_BUILD

ANDROID CANDIDATE:
- NOT_OBSERVED

D1: NOT_MEASURABLE_WITH_CURRENT_INSTRUMENTATION
D7: NOT_MEASURABLE_WITH_CURRENT_INSTRUMENTATION
D30: NOT_MEASURABLE_WITH_CURRENT_INSTRUMENTATION

Claim changes required:
Existing issues updated:
New issues justified:
Retests required:

Decision state:
- STOP
- PAUSE_AND_TRIAGE
- CONTINUE_SAME_SCOPE
- READY_FOR_OWNER/ORCHESTRATOR_REVIEW

Known uncertainty:
```

The default values above are placeholders signaling absence of evidence. They are not results.

---

# 39. Retest template

```text
RETEST

Original Theme / Issue:
Original Build Ref:
Successor Build Ref:
Expected Fix Scope:

Original reproduction repeated first? YES / NO / NOT_APPLICABLE
Result:
- RETEST_PASSED
- RETEST_FAILED
- PARTIAL
- BUILD_IDENTITY_UNCERTAIN

Observation:
Evidence Ref:
Residual severity:
Claim state after retest:
Owner route:
```

A code merge is not equivalent to `RETEST_PASSED` for visible Android behavior.

---

# 40. Claim downgrade template

```text
CLAIM EVIDENCE REVIEW

Claim ID:
Content/Creative IDs affected:
Build Ref that triggered review:
Evidence Theme:
Previous Claim State:

Decision:
- REVIEW_REQUIRED
- DOWNGRADE_TO_ROADMAP
- PAUSE_PUBLICATION
- RECAPTURE_REQUIRED
- NO_CHANGE

Reason:
Owning feature lane consulted:
New evidence required:
```

Never preserve a stronger claim solely because assets or copy have already been produced.

---

# 41. Evidence-to-issue handoff template

```text
ISSUE HANDOFF

Build Ref:
Category:
Severity:
Evidence State:
Valid independent reports:
Deterministic reproduction?:

Minimal problem statement:
Expected behavior:
Observed behavior:
Reproduction steps:
Evidence ref:

Primary owner:
Secondary coordination:
Existing related issues/PRs:
Why this is not a duplicate:

Personal data minimization completed: YES / NO
```

Do not paste full participant conversations when a concise summary is enough.

---

# 42. Evidence synthesis does not equal product acceptance

DT-15 synthesis can answer:

- what was observed;
- what patterns repeat;
- which claims are at risk;
- which owner should receive evidence;
- whether public distribution should pause from a growth/truthfulness perspective.

DT-15 synthesis cannot independently declare:

- `ANDROID_VERIFIED`;
- release-ready AAB;
- legally compliant privacy policy;
- IP clearance;
- mission/economy correctness outside evidence observed;
- a P0 product blocker closed;
- production access granted.

Those decisions remain with their owning authorities.

---

# 43. Negative feedback integrity

Do not:

- suppress negative feedback to improve reported sentiment;
- ask testers to rewrite criticism positively;
- exclude a valid record because it hurts a launch narrative;
- reward positive feedback;
- condition access on praise;
- ask unhappy participants not to review publicly;
- turn mixed creator coverage into an implied endorsement.

Evidence synthesis must preserve material negative findings.

---

# 44. Subjective feedback handling

Subjective observations are valuable when correctly labeled.

Examples:

- `city feels too small`;
- `dialogue feels slow`;
- `route felt repetitive`;
- `character silhouettes felt similar`.

Do not pretend such observations are deterministic defects.

Instead synthesize:

- frequency among valid records;
- exact build;
- scenario;
- whether the theme aligns with objective evidence;
- impact on positioning/first session.

---

# 45. Quantitative counts allowed without telemetry

Manual counts may be reported when derived from real intake records, for example:

- 4 valid reports of label overlap on the same build;
- 3 independent reports that Brăila still feels board-like;
- 2 deterministic reproductions of Android Back failure.

Always state the real record base.

Do not call manual report frequency a population incidence rate.

---

# 46. No denominator laundering

Do not convert:

`3 reports out of 8 submitted feedback records`

into:

`37.5% of players have the defect`

unless the sampling and denominator genuinely support that statement.

The safer report is:

`3 of 8 valid feedback submissions in this exact test wave described the same issue.`

---

# 47. No retention proxy laundering

Do not convert:

- `Would play again = YES`;
- a tester returning for a scheduled follow-up;
- Discord activity;
- repeat comments;
- Play opt-in count;

into D1/D7/D30 retention.

Use their real labels.

---

# 48. Evidence expiry

Evidence is build-scoped.

When a material change affects the relevant system:

- old evidence remains historical;
- current claim state becomes `REVIEW_REQUIRED` where appropriate;
- retest the successor build;
- do not silently carry a visible PASS forward.

Examples of material changes:

- world-scale geometry changes;
- delivery distribution changes;
- dialogue layout/input changes;
- Android shell/runtime packaging changes;
- persistence/save composition changes;
- major performance/asset changes.

---

# 49. Pre-publication evidence preflight

Before a screenshot, trailer clip, store caption, creator brief or public claim uses a tested feature:

- [ ] exact build identified;
- [ ] feature present in that exact build;
- [ ] required owner Android acceptance complete;
- [ ] no unresolved S0/S1 contradicts the claim;
- [ ] media is a real capture, not fake gameplay;
- [ ] media rights/provenance allow external use;
- [ ] claim wording matches observed behavior;
- [ ] old evidence has not expired due to a material change;
- [ ] roadmap items remain labeled roadmap.

Failure of any mandatory item keeps the claim out of current-feature marketing.

---

# 50. Future owner/tester evidence archive structure

Conceptual only:

```text
feedback/
  <buildRef>/
    intake-index.md
    synthesis.md
    retests.md
    media-refs.md
```

Do not implement this archive until the orchestrator assigns storage/retention handling.

If evidence contains personal information, public repository storage may be inappropriate; DT-13 must determine handling.

---

# 51. Intake state machine

Conceptual record states:

```text
RECEIVED
-> MINIMIZED
-> BUILD_VERIFIED | BUILD_UNCERTAIN
-> CLASSIFIED
-> TRIAGED
-> ROUTED
-> LINKED_TO_EXISTING_ISSUE | NEW_ISSUE_JUSTIFIED | NO_ISSUE
-> RETEST_PENDING | SYNTHESIS_ONLY
-> CLOSED
```

This is an operational design, not a runtime implementation.

---

# 52. Synthesis review state machine

```text
DRAFT
-> BUILD_SCOPE_VERIFIED
-> EVIDENCE_CHECKED
-> OWNER_ROUTES_CHECKED
-> CLAIM_IMPACT_CHECKED
-> READY_FOR_ORCHESTRATOR_REVIEW
```

No automatic release approval state exists.

---

# 53. Current open-work interpretation rule

At the time this template was prepared, specialist branches/PRs exist for #614/#615 and visual-story/release work.

Rules:

- an open PR is not release truth;
- green CI on an open product PR is not Android visual acceptance;
- a domain adapter is not a player-facing feature;
- a test contract is not a public claim;
- a WIP AAB branch is not a production artifact;
- a later merge must still be tested on the exact candidate when visual/release behavior matters.

---

# 54. Evidence synthesis and independent audit

DT-16 may consume the final minimized synthesis when recalculating release state.

DT-15 must preserve distinctions between:

- observed exact-build defects;
- missing evidence;
- open implementation work;
- owner acceptance pending;
- legal/release external gates.

Do not present `no report` as `no blocker`.

---

# 55. Intake safety stop

If future intake reveals:

- credential exposure;
- private signing material;
- doxxing;
- serious security/privacy incident;
- sensitive personal data unintentionally posted publicly;

stop normal feedback processing for that evidence and route immediately to DT-13 / security-appropriate handling under orchestrator control.

Do not replicate sensitive material into additional issues or summaries.

---

# 56. Practical first use order — future only

When the owner/orchestrator eventually authorizes use:

1. identify exact Android candidate;
2. select only scenarios present in that candidate;
3. run owner Android review first;
4. minimize and classify observations;
5. update existing issues before creating new ones;
6. synthesize S0/S1 before any wider tester wave;
7. if authorized, collect a small external tester wave using the same exact-build envelope;
8. synthesize recurring qualitative themes;
9. review marketing claims/media against evidence;
10. route retest requests to owning lanes;
11. do not widen exposure until the orchestrator approves the next step.

---

# 57. Example-only blank record

The following demonstrates structure only and contains no observed result:

```text
EXAMPLE_ONLY

intakeId: example-only
receivedAt: NOT_OBSERVED
sourceClass: OWNER_ANDROID_REVIEW
buildRef: NOT_OBSERVED
testScenarioId: scenario:city-scale:city-presence
primaryCategory: fb:city-scale:city-presence
severity: NOT_OBSERVED
reproducibility: NOT_OBSERVED
observation: NOT_OBSERVED
ownerRoute: DT-01
triageState: NOT_OBSERVED
```

Never convert `EXAMPLE_ONLY` into a real observation record.

---

# 58. Handoff boundaries

## DT-15 owns

- this intake/synthesis template;
- evidence organization for growth/expectation decisions;
- qualitative theme synthesis;
- claim-impact review;
- duplicate-first routing discipline;
- privacy-minimized growth feedback requirements.

## DT-01 owns

- Brăila visual scale, district spacing, city perception and related Android visual acceptance.

## DT-05 owns

- living-city actor/traversal/crossing behavior and bounded simulation evidence.

## DT-07 owns

- production/supply/demand causal truth for geographically distributed logistics.

## DT-09 owns

- mission-side citywide opportunity selection/materialization behavior.

## DT-10 owns

- character/dialogue visual presentation and its visible Android acceptance path.

## DT-13 owns

- privacy, data minimization compliance, minors/community safety and evidence-handling requirements.

## DT-14 owns

- Android artifact identity, Play testing/release gates and device compatibility evidence.

## DT-16 owns

- independent release-gate interpretation.

## Central orchestrator / owner owns

- whether any real intake/test wave is activated;
- distribution scope;
- public exposure;
- spend;
- cross-lane priorities.

---

# 59. Current authorization state

At document creation:

`INTAKE_NOT_ACTIVATED`

`PILOT_NOT_AUTHORIZED`

`TELEMETRY_NOT_AUTHORIZED`

`CREATOR_CONTACT_NOT_AUTHORIZED`

`PAID_GROWTH_NOT_AUTHORIZED`

This document prepares a safer future evidence workflow. It does not authorize execution.

---

# 60. Final rule

The pre-release evidence process exists to prevent two failures:

1. shipping or marketing a claim that the exact Android build does not support;
2. collecting more participant data than is necessary to learn what must be fixed.

If the evidence is incomplete, say so.

If the build is not identifiable, say so.

If a metric cannot be measured, use `NOT_MEASURABLE_WITH_CURRENT_INSTRUMENTATION`.

If the feature is not in the tested build, use `NOT_APPLICABLE_TO_BUILD`.

If no observation exists, use `NOT_OBSERVED`.

Truthful uncertainty is valid evidence handling.