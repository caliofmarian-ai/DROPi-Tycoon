# Issue #569 — Google Play App Content Evidence

Status: PRE-SUBMISSION EVIDENCE — PLAY CONSOLE NOT UPDATED
Date: 2026-09-09
Source baseline: `647adfe31e38c47ad73e3a4e98ece70407ffa28c`
Owner lane: DT-13 Legal / Privacy / IP
Play artifact owner: DT-14 / #568

## Purpose

Prepare evidence-backed responses for Google Play App Content declarations without inventing owner decisions, legal conclusions or final-AAB facts.

This document is not a Play Console submission and does not claim Google/legal approval.

Official App Content overview reviewed 2026-09-09:

https://support.google.com/googleplay/android-developer/answer/9859455

## 1. Privacy policy

Current requirement: Google Play User Data policy requires all apps to have a privacy policy in Play Console and within the app, including apps that do not access personal/sensitive user data.

Official reference:

https://support.google.com/googleplay/android-developer/answer/10144311

Current DROPi Tycoon state:

- canonical legal/privacy engineering baseline exists;
- #569 privacy policy draft exists at `00_Project/PRIVACY_POLICY_DRAFT_569.md` on this branch;
- a final public privacy-policy URL does not yet exist in repository evidence;
- an in-app privacy-policy link/text was not found in current production UI;
- controller/developer identity/contact details required for publication are incomplete.

Play response state: **BLOCKED — DO NOT SUBMIT**.

Required inputs/actions:

- **OWNER INPUT REQUIRED — exact developer/controller legal identity used for publication**;
- **OWNER INPUT REQUIRED — privacy contact mechanism**;
- **OWNER INPUT REQUIRED — jurisdiction-appropriate address/business details if required**;
- qualified review of final wording where jurisdiction-sensitive;
- publish final policy at stable public HTTPS URL, active/non-geofenced and non-PDF;
- add policy in-app and in Play Console.

## 2. Ads declaration

Question: Does the app contain ads?

**PROPOSED ANSWER: NO.**

Evidence:

- no ads SDK declared in current `game-mobile/package.json`;
- no ads/AdMob implementation found in current release source audit;
- no runtime advertising surface identified;
- current real-world monetization documents explicitly do not mean an ads SDK is implemented.

Final condition: #568 must verify the submitted AAB/native dependencies and release network behavior.

If ads are added before submission, this answer becomes invalid and the app must be re-audited, including Families implications if any child age group is selected.

Official ads policy:

https://support.google.com/googleplay/android-developer/answer/9857753

## 3. App access / sign-in details

Current production release has no login/account creation UI and no authenticated content gate.

**PROPOSED ANSWER: All functionality is available without special access.**

Reviewer credentials: **NOT REQUIRED for this source baseline**.

Evidence:

- local/offline World Instance/account/hero identity is technical game identity, not authentication;
- no email/phone/password/OAuth flow found;
- no current `/api/authority/*` client wiring found in `game-web/src`;
- production startup uses bundled local runtime.

If #560 or another authentication implementation activates before submission, this answer must be replaced and valid reviewer-only credentials/instructions must be supplied.

Official review/access reference:

https://support.google.com/googleplay/android-developer/answer/9859455

## 4. Target audience and content

**FINAL AGE GROUP SELECTION: OWNER INPUT REQUIRED.**

No agent may choose the target audience solely to simplify policy obligations. The Play Console selection must match the actual product design, store creative, language, characters, marketing and intended users.

Current engineering/legal recommendation:

- do not intentionally select child age groups unless the owner deliberately intends DROPi Tycoon to target children and completes the full Families compliance stack;
- if any selected age group includes children, apply Google Play Families requirements and re-review SDKs, data, ads/monetization, social features and content;
- youthful/stylized visuals and marketing can affect Google's assessment, so the store listing must match the declared audience.

This recommendation is not a final legal age classification.

Official references:

https://support.google.com/googleplay/android-developer/answer/9867159

https://support.google.com/googleplay/android-developer/answer/9893335

Jurisdiction-sensitive child definitions/consent obligations require qualified review.

## 5. Content rating / IARC evidence

The final IARC questionnaire must be completed from the exact submitted game and actual enabled features. DT-13 can provide current factual evidence but must not invent the resulting rating.

Current release facts found in source/canon:

- game genre/content: tycoon, delivery, company management, logistics, world/city map and progression;
- virtual company economy and fictional game purchases exist;
- no real-money gambling/wagering/casino mechanic found;
- no paid randomized loot-box implementation found;
- no real-money purchase/Play Billing implementation found;
- no player chat/UGC/social messaging active;
- no advertising implementation found;
- no dating/sexual-content feature identified;
- no user-generated public content active;
- no crypto/token/real-world financial product is implemented in this release.

**CONTENT-RATING OWNER/REVIEW INPUT REQUIRED:** inspect the exact submitted visual/story/runtime content for violence, fear, language, substance references, user interaction or other IARC categories before answering. Future story/visual PRs may alter those facts.

Official content-rating reference:

https://support.google.com/googleplay/android-developer/answer/9859655

## 6. Data Safety

Use the dedicated evidence snapshot:

`09_Development/Compliance/GOOGLE_PLAY_DATA_SAFETY_EVIDENCE_569.md`

Current source-level proposal: **no user data collected; no user data shared**, conditional on #568 final-AAB/SDK/network verification.

Do not copy the proposal into Play Console before that condition is satisfied.

## 7. Account deletion

Current release does not enable production account creation.

**Current applicability:** Play account-deletion requirement for in-app-created accounts is not triggered by the local technical `accountId` because it is not a registered/authenticated online account and has no account-creation flow.

#562 remains mandatory before any production account creation is enabled.

If accounts activate before release:

- provide readily discoverable in-app deletion initiation;
- provide an external web deletion/request resource;
- delete associated user data subject only to documented legitimate retention exceptions;
- update Privacy Policy and Data Safety.

Official reference:

https://support.google.com/googleplay/android-developer/answer/13327111

## 8. User-generated content / chat

Current release: **ABSENT**.

No current player-to-player chat, public posting, image upload, creator UGC or social-message feature is active.

Therefore no current UGC declaration should imply that public chat exists.

If #564 functionality activates before release, submission is blocked until terms/community rules, moderation, reporting, blocking, child-safety and retention/deletion controls are implemented and re-audited.

## 9. Financial features / real-world monetization

Current release contains a fictional in-game economy only.

Current source audit found:

- no Play Billing;
- no subscription implementation;
- no real-money purchases;
- no real-world financial account/service;
- no crypto/token implementation.

Future commercial catalog planning does not change current artifact truth.

Any implementation of billing, subscriptions, paid currency, token/crypto or real-world financial service requires a new policy/payment/regulatory review before release.

## 10. Permissions declaration

`game-mobile/app.json` contains no explicit Android permission list.

This is **not** enough to declare the final AAB permission set because native dependencies/config plugins can add manifest entries during build.

Required #568 evidence before submission:

- final merged manifest / AAB permission list;
- requested dangerous/sensitive permissions;
- services/providers/receivers relevant to data handling;
- justification/removal of permissions not required for current core functionality;
- any Play Permissions Declaration Form applicability.

Current proposed position: **no high-risk/sensitive permission use is intentionally implemented by DROPi Tycoon source**.

Do not submit that as final until artifact inspection confirms it.

Official permissions reference:

https://support.google.com/googleplay/android-developer/answer/9214102

## 11. News / government / health / financial-service special declarations

Current release is a fictional game and no implemented release feature was found that makes it:

- a news app;
- a government app;
- a health app;
- a real-world financial-services app.

If Play Console exposes category-specific questions, answer from actual product functionality and do not infer exemptions beyond the question wording current at submission time.

## 12. Reviewer instruction evidence

For the current no-login bundled release, suggested factual reviewer notes for DT-14 to adapt in Play Console where relevant:

- launch normally; no account or credential is required;
- game runtime is bundled in the installed app;
- landscape orientation is expected;
- core gameplay begins from Main Menu -> Start Game / Continue Game;
- no special location, membership, subscription or external authorization is required to reach reviewed gameplay;
- if the exact submission changes this behavior, replace these instructions.

## 13. Declaration matrix

| Play/App Content area | Proposed current response | Can submit now? | Remaining gate |
|---|---|---|---|
| Privacy policy | Required | NO | Owner identity/contact + qualified review + public HTTPS publication + in-app link |
| Ads | No ads | NOT YET | Final AAB/SDK verification |
| App access | All functionality available without special access | NOT YET | Final submitted build verification |
| Target audience | **OWNER INPUT REQUIRED** | NO | Owner decision + Families/legal review if children selected |
| IARC content rating | Questionnaire required | NO | Exact submitted content review / Play questionnaire |
| Data Safety | Proposed no collection/no sharing | NO | #568 exact AAB/SDK/network proof |
| Account deletion | No production account creation | NOT YET | Reconfirm no account creation in final build |
| UGC/chat | Absent | NOT YET | Reconfirm final build; #564 if activated |
| Permissions | No high-risk use intentionally implemented | NO | #568 final merged manifest/AAB |
| Real-money purchases | Absent | NOT YET | Reconfirm final build |

## 14. Change-control rule

Any material release feature merged after this audit must be checked against this matrix before Play submission. In particular, do not reuse these answers automatically after changes to auth, persistence/cloud sync, monetization, ads, analytics, crash reporting, UGC, support or Android dependencies.
