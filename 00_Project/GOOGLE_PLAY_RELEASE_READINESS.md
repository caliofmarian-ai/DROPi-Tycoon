# DROPi Tycoon — Google Play / Android Release Readiness

**Owner lane:** Agent 14 — Google Play / Android Release / Store Compliance
**Verified:** 2026-09-09
**Repository:** `caliofmarian-ai/DROPi-Tycoon`
**Audited main:** `8e340b7131c4bdc890c38ba34e88d94858897cb3`
**Primary platform:** Android, landscape
**Authoritative gameplay runtime:** Phaser
**Mobile shell:** React Native / Expo
**Distribution target:** Google Play

This is the canonical engineering and store-compliance control document for moving DROPi Tycoon from a validated Git commit to a Play-distributed Android release. It is not legal advice. Agent 13 owns privacy/legal analysis and must identify matters requiring qualified professional counsel before commercial launch.

---

## 1. Current state

### Play readiness: **40%**

This is a repository readiness score, not a Google-generated score.

| Domain | Weight | Current score | Weighted result | Main reason |
|---|---:|---:|---:|---|
| App identity / versioning | 15% | 85% | 12.75 | Package, name, version and EAS identity exist; Play account state is unverified. |
| Build / artifact readiness | 25% | 50% | 12.50 | Production AAB profile exists; production runtime is still remote-WebView, mobile lockfile is missing, final AAB is unattested. |
| Policy / App Content | 25% | 20% | 5.00 | Privacy policy, Data Safety, audience, IARC and declarations are incomplete. |
| Store listing | 15% | 20% | 3.00 | Approved brand sources exist; compliant export pack and truthful release screenshots remain incomplete. |
| Testing | 10% | 30% | 3.00 | Physical preview testing exists; no Play internal/closed/pre-launch release evidence exists. |
| Release / monitoring / rollback | 10% | 35% | 3.50 | Version ledger exists; production/vitals/rollback evidence does not. |
| **Total** | **100%** |  | **39.75 ≈ 40%** |  |

**Current verdict: NOT READY FOR GOOGLE PLAY PRODUCTION.**

### Already implemented

- App name: `DROPi Tycoon`.
- Android package/application ID: `com.dropi.tycoon`.
- Expo slug: `dropi-tycoon`.
- Android-only Expo shell.
- Landscape configuration and runtime landscape lock.
- EAS project ID: `972b831b-78d0-46ab-8cb8-2b13745a8df7`.
- Semantic version starts at `0.0.0` and is validated between `app.json` and `package.json`.
- Android `versionCode` is governed remotely by EAS and auto-incremented.
- Development and preview profiles build APKs.
- Production profile is configured as `android.buildType: app-bundle`.
- Phaser remains authoritative; React Native/Expo is the native shell.
- Android Back integration exists.
- Owner-approved launcher/logo/splash sources exist.
- A controlled preview APK exists in the mobile build ledger, but it is not a Play production AAB attestation.

### Prototype-only / incomplete

- `game-mobile/App.tsx` currently loads `runtime.gameUrl` in `react-native-webview`.
- `game-mobile/src/runtimeConfig.ts` requires `EXPO_PUBLIC_DROPITYCOON_GAME_URL` over HTTPS.
- Therefore ordinary startup still depends on a remote public webpage rather than a bundled Phaser document.
- `game-mobile/package-lock.json` is absent.
- No canonical production AAB build ID/hash/manifest/ABI/permission attestation exists.
- Play App Signing state is unknown from repository evidence.
- Developer account type, creation date, identity verification, production access and package registration are unknown from repository evidence.
- No publishable DROPi Tycoon privacy policy is present on audited `main`.
- Data Safety, ads declaration, target audience and IARC content rating are incomplete.
- No Play internal/closed/pre-launch release evidence exists.
- Store listing exports and release-candidate screenshots are incomplete.

---

## 2. Focused blocker issues and cross-agent reconciliation

Agent 14 created only the release-specific issues needed for this lane:

- #567 — bundle the Phaser runtime inside the production Android app;
- #568 — produce a reproducible Play AAB and release attestation;
- #569 — complete privacy, Data Safety and App Content declarations;
- #570 — technical/policy-compliant Play listing pack;
- #571 — owner/account-specific Play verification, signing, testing and production-access gate.

Specialist issues created after the first audit are dependencies, not duplicates:

- #560 — authenticated public-profile authority before durable online identity. This becomes a Play privacy/security dependency if online identity is activated for the submitted release.
- #561 — Agent 15 truthful Google Play creative capture pack. This owns creative production; #570 remains Agent 14's technical/store compliance gate and should consume #561 rather than duplicate it.
- #562 — Agent 13 account deletion, retention and data-rights lifecycle. If production account creation is enabled, #569 cannot close until this lifecycle is implemented and reflected in Play declarations.
- #564 — Agent 13 UGC/chat safety gate. If multiplayer chat/UGC is enabled, it becomes a release blocker; otherwise the release record must explicitly state chat/UGC is absent.
- #565 — Agent 13 third-party notices and runtime asset/data provenance release gate. This is a commercial-release blocker because Play listing rights, OSM/GeoNames attribution and dependency licensing must match the shipped artifact.
- #566 — Agent 16 active player/mission/cargo save-load continuity. This is an Android release-quality blocker because process kill/relaunch, upgrade and save/restore must not lose active authoritative state.

Agent 4 owns CI/Railway and currently has active work in PR #549. Agent 14 must not modify `.github/workflows/**`, Railway configuration or production deployment topology in this audit PR.

Agent 12 owns monetization strategy. Agent 14 only owns the Play-compliance gate for any ads, digital purchases or subscriptions that Agent 12 later activates.

Agent 13 owns privacy/legal analysis. Agent 14 owns Play Console completeness and binary/backend-to-declaration consistency.

Agent 15 owns store positioning and creative production. Agent 14 owns asset dimensions, metadata limits, truthfulness and technical compliance.

Agent 16 independently audits the release candidate before production.

---

## 3. Current official Google Play / Android requirements

Requirements below were rechecked against official Google/Android documentation on **2026-09-09**. Re-check them again immediately before any production submission.

### Target API

Starting **2026-08-31**, ordinary new phone/tablet apps and app updates submitted to Google Play must target **Android 16 / API level 36 or higher**.

Expo SDK 57 is API-36-capable, but source configuration is not final proof. #568 must inspect the actual release AAB and record target, compile and minimum SDK values.

### Android App Bundle and signing

New Play apps use Android App Bundles. The repository already configures EAS production builds as `.aab`.

A production candidate still requires:

- exact source SHA;
- exact semantic version and monotonic versionCode;
- production EAS build ID;
- AAB SHA-256;
- final package ID;
- merged permissions;
- ABI/native-library inventory;
- 64-bit compatibility;
- 16 KB page-size compatibility;
- upload certificate SHA-256;
- Play App Signing enrollment/state.

Never commit app-signing keys, upload private keys, keystores, passwords, service-account credentials, Play tokens or credential exports.

### Newer personal developer account testing

Do not assume this applies to the owner.

If and only if the Play developer account is **Personal** and was created after **2023-11-13**, current Google Play guidance requires:

- app setup completed;
- a closed test;
- at least **12 testers** continuously opted in for **at least 14 days**;
- then an application for production access with truthful testing/app/readiness answers.

Internal testing is recommended but does not replace that closed-test requirement for affected accounts. Open testing becomes available after production access under the current rule.

### Android developer verification / package registration

Google's current Play guidance requires developer identity verification and package-name registration. Effective **2026-09-30**, Play packages must be registered under the Android developer verification requirements. Google attempts to auto-register eligible Play packages, but `com.dropi.tycoon` must be confirmed in the owner's Play Console rather than assumed from Git.

### Data Safety and privacy policy

Apps published on closed, open or production tracks must complete Data Safety. Apps exclusively active on internal testing are exempt. Even an app that collects no user data must complete the form and provide a privacy-policy link.

The final declaration must be built from the exact production artifact, all SDKs and every active backend/network flow. Repository absence of an analytics/ad SDK is evidence, not permanent permission to answer future Play forms “No.”

### Account deletion

If the submitted app allows in-app account creation, account deletion must be readily discoverable inside the app and through an external web resource. Associated user data must be deleted except where legitimate retention is transparently disclosed.

Current audited `main` does not activate production account creation. This requirement becomes a hard blocker if account creation lands before release. #562 and #569 govern the dependency.

### Content rating, audience and ads

Before release:

- complete IARC content rating from actual submitted content;
- deliberately select target age groups;
- satisfy Families requirements if child age groups are included;
- declare whether the app contains ads;
- re-audit audience/rating/Data Safety whenever monetization or social features change.

### Permissions

Every permission in the final AAB must have a current core-use requirement. Remove unjustified sensitive/high-risk permissions. Do not request permissions for speculative future features.

### Digital purchases / subscriptions

If the Play-distributed app sells digital goods, virtual currency, game features or subscriptions, use Google Play's billing system where current policy requires it. Do not add a payment shortcut intended to bypass Play policy.

Billing is not active in the audited mobile dependency set, so it is a conditional future blocker, not a reason to add Billing prematurely.

### Third-party rights and notices

#565 must be complete before commercial publication. Store screenshots, listing text, shipped assets and runtime data must not imply rights the project does not possess. OSM/GeoNames and other required attribution/notices must be preserved in a release-appropriate form.

---

## 4. Canonical Play Console checklist

A release may be marked `PLAY_READY` only when all applicable items below are complete.

### App identity

- [x] App name `DROPi Tycoon`.
- [x] Package `com.dropi.tycoon`.
- [x] Expo slug `dropi-tycoon`.
- [x] Android-only shell.
- [x] Landscape configuration.
- [x] EAS project identity recorded.
- [x] Semantic version validation exists.
- [x] Remote monotonic Android versionCode policy exists.
- [ ] Developer account type confirmed in Play Console.
- [ ] Account creation date confirmed if relevant to personal-account testing rules.
- [ ] Developer identity/contact verification confirmed.
- [ ] `com.dropi.tycoon` package registration confirmed.
- [ ] Public developer/store contact details finalized.

### Build / AAB

- [x] EAS `production` profile configured as app-bundle.
- [x] Selected Expo SDK is API-36-capable.
- [ ] `game-mobile/package-lock.json` committed and clean `npm ci` reproducible.
- [ ] Production Phaser runtime bundled; ordinary startup independent of the public Railway webpage.
- [ ] Exact release SHA frozen.
- [ ] Production AAB produced from exact SHA.
- [ ] AAB SHA-256 recorded.
- [ ] EAS production build ID recorded.
- [ ] Final package ID verified.
- [ ] `versionName` verified.
- [ ] monotonic `versionCode` verified.
- [ ] target SDK verified compliant with current Play deadline.
- [ ] compile SDK and min SDK recorded.
- [ ] merged permissions recorded and justified.
- [ ] release artifact is non-debuggable.
- [ ] no dev-client/debug-only surface ships in production.
- [ ] 64-bit compatibility verified.
- [ ] 16 KB page-size compatibility verified.
- [ ] App Bundle Explorer compatibility reviewed.
- [ ] source maps/symbolication strategy sufficient for actionable crash diagnosis.

### Signing / security

- [ ] Play App Signing configured.
- [ ] Upload-key ownership and recovery process controlled outside Git.
- [ ] Public upload certificate fingerprint recorded without private material.
- [x] Mobile `.gitignore` rejects common AAB/APK/signing/credential artifacts.
- [ ] Secret scan confirms no signing/Play credentials in release branch/history.
- [ ] Any later Play API service account remains in approved secret storage only.

### Privacy / App Content

- [ ] Stable public HTTPS privacy-policy URL.
- [ ] Agent 13 production data-flow and retention review complete.
- [ ] Data Safety matches exact binary/backend behavior.
- [ ] Ads declaration accurate.
- [ ] Target audience selected deliberately.
- [ ] Families requirements complete if applicable.
- [ ] IARC completed accurately.
- [ ] Reviewer access instructions supplied if restricted content exists.
- [ ] Final permission list reconciled with Play declarations.
- [ ] #562 deletion/retention lifecycle complete if account creation exists.
- [ ] #564 moderation/report/block controls complete if UGC/chat exists.
- [ ] #565 licensing/attribution gate complete.

### Monetization

- [ ] Agent 12 release monetization scope frozen for candidate.
- [ ] No unused Billing implementation added merely for future use.
- [ ] If digital purchases/subscriptions exist, compliant billing is implemented and tested.
- [ ] Purchase verification and entitlement authority are trustworthy where applicable.
- [ ] Refund/cancel/revoke/restore paths tested where applicable.
- [ ] Privacy/Data Safety/audience re-audited after monetization SDK changes.

### Store listing

- [ ] App title <=30 characters.
- [ ] Short description <=80 characters.
- [ ] Full description <=4000 characters.
- [ ] Play app icon 512x512, 32-bit PNG with alpha, <=1024 KB.
- [ ] Feature graphic 1024x500, JPEG or 24-bit PNG without alpha.
- [ ] Minimum two valid screenshots overall.
- [ ] For this landscape game, prepare at least three authentic 16:9 gameplay screenshots at >=1920x1080 as the baseline recommendation.
- [ ] #561 creative capture pack reconciled with #570 technical compliance gate.
- [ ] Tablet/large-screen screenshot set prepared if genuine tablet distribution/promotion is retained.
- [ ] Screenshots depict the submitted build, not roadmap mockups.
- [ ] Alt text supplied where supported/recommended.
- [ ] Support/contact details complete.
- [ ] Privacy-policy link complete.
- [ ] Preview video decision recorded; if used, it is truthful and predominantly real gameplay.
- [ ] #565 third-party rights/attribution complete.

---

## 5. Build pipeline

### Current first-stage path

```text
GitHub main
  -> Phaser/Vite runtime
  -> public Railway webpage
  -> Expo/React Native WebView
  -> installed Android shell
```

This is acceptable for development/preview. It is not the canonical final production startup architecture.

### Required production path

```text
GitHub main / frozen release SHA
  -> deterministic game-web production build
  -> Phaser web assets bundled into game-mobile
  -> dependency-locked clean mobile build
  -> EAS production AAB
  -> artifact attestation
  -> Google Play internal track
  -> App Bundle Explorer + pre-launch report
  -> owner Android landscape matrix
  -> closed test / production-access gate when applicable
  -> final policy/listing reconciliation
  -> owner-authorized production publication
```

Railway may remain a backend/API dependency where server-authoritative systems require it. The ordinary game document/assets must not require the public Railway webpage simply to start.

### Required candidate record

Each candidate must record:

- source SHA;
- semantic version;
- Android versionCode;
- EAS project/profile/build ID;
- AAB SHA-256;
- package ID;
- target/compile/min SDK;
- merged permission list;
- ABI/native-library inventory;
- 64-bit result;
- 16 KB compatibility result;
- public signing/upload certificate fingerprints where appropriate;
- Play track;
- pre-launch report outcome;
- owner Android acceptance outcome.

---

## 6. Policy dependencies

| Release feature/state | Play consequence | Dependency |
|---|---|---|
| No ads | Ads declaration still required | Agent 14 + Agent 13 evidence |
| Ads enabled | Re-audit ads policy, Data Safety, audience/rating and SDK behavior | Agent 12 + 13 + 14 |
| No production account creation | Account-deletion rule not activated by account creation | Agent 13 + 14 confirm candidate |
| Account creation enabled | In-app + web deletion lifecycle required | #562 + #569 |
| No chat/UGC | UGC moderation declarations not activated | Agent 13 + 14 confirm candidate |
| Chat/UGC enabled | Moderation/report/block/safety becomes release blocker | #564 + #569 |
| No digital purchases | Do not add Billing speculatively | Agent 12 + 14 |
| Digital goods/subscription enabled | Play billing compliance required where applicable | Agent 12 + 14 |
| Online durable identity enabled | Authentication/privacy/security gate applies | #560 + Agent 13 + 14 |
| Third-party datasets/assets shipped | License/notice/attribution gate applies | #565 |
| Children included in audience | Families obligations activate | Agent 13 + 14 + owner |
| Sensitive permission added | Core-use declaration/review may be required | Implementation owner + 13 + 14 |

---

## 7. Store asset requirements

Agent 15 owns creative positioning and #561. Agent 14 verifies technical/store compliance through #570.

| Asset | Release requirement / baseline | Current state |
|---|---|---|
| Play icon | 512x512, 32-bit PNG with alpha, <=1024 KB | Owner-approved source exists; Play export not yet attested. |
| Feature graphic | 1024x500, JPEG or 24-bit PNG without alpha | Missing/unverified. |
| Screenshots | At least 2 valid images overall | Release-candidate set missing. |
| Landscape game set | At least 3 authentic 16:9 gameplay screenshots at >=1920x1080 baseline | Missing. |
| Large-screen set | Prepare only if genuine tablet/large-screen distribution is retained | Conditional. |
| App title | <=30 chars | `DROPi Tycoon` fits. |
| Short description | <=80 chars | Final copy pending. |
| Full description | <=4000 chars | Final copy pending. |
| Preview video | Optional | Decision pending. |

Truthfulness rules:

- use the actual submitted build;
- do not show future systems as currently available;
- do not make unsupported ranking, award, download-count, price or promotion claims;
- do not stretch phone screenshots into fake tablet evidence;
- preserve third-party rights and attribution from #565.

---

## 8. Release tracks and tester plan

### Internal testing

Use first for Play-delivered AAB installation, package/signing, update-path, device compatibility and basic owner acceptance. Internal-only distribution can begin before Data Safety is required for a closed/public track.

### Closed testing

Use after enough app setup and policy surfaces exist. Data Safety applies.

If #571 proves the newer personal-account rule applies, closed testing must maintain at least 12 continuously opted-in testers for 14 days before production-access application. Recruit above the bare minimum where practical so one tester leaving does not break continuity. Record real feedback and actual changes; never fabricate participation.

### Open testing

For affected newer personal accounts, current guidance makes open testing available after production access. It does not substitute for the required closed test.

### Production

Production is permitted only when all applicable blockers are closed and owner authorization is explicit. Do not perform Play Console publication from an agent without that owner-only authorization.

For the first production release, do not rely on a staged-percentage rollback strategy as though an older production version already exists. Reduce risk through internal/closed testing and controlled release scope. For later updates, use staged rollout where appropriate and monitor real Play health data before increasing exposure.

---

## 9. Owner Android acceptance matrix

Landscape Android remains the primary owner-facing acceptance surface.

The exact Play-delivered candidate must test:

- fresh install;
- upgrade from a prior Play-delivered test build;
- cold launch;
- warm launch/resume;
- Android Back;
- landscape/orientation behavior;
- safe areas/insets;
- touch/tap/drag;
- pinch/zoom;
- camera/navigation;
- save/restore;
- #566 active player/mission/cargo continuity;
- background/foreground transition;
- process kill/relaunch;
- offline startup;
- mid-session network loss;
- network recovery;
- low-memory/process recreation where practical;
- frame pacing/performance;
- memory pressure;
- modern 64-bit device/environment;
- 16 KB page-size environment where practical;
- App Bundle Explorer compatibility;
- tablet/large-screen behavior if distributed there;
- pre-launch report stability/compatibility/performance/accessibility findings;
- crash/ANR review.

Historical preview APK validation is useful evidence but never substitutes for testing the exact production AAB candidate.

---

## 10. Signing and security

### Never commit

- `.jks`, `.keystore`, `.p12` or private signing material;
- upload/app-signing private keys;
- keystore passwords;
- EAS credential exports;
- Play service-account JSON/credentials;
- OAuth/client secrets used as secrets;
- Play Console tokens;
- recovery codes;
- production `.env*` files containing secrets;
- generated APK/AAB binaries.

### Safe repository evidence

- package ID;
- EAS project ID;
- public certificate fingerprints;
- build IDs;
- artifact SHA-256;
- versionName/versionCode;
- source commit;
- non-secret Play track/status notes.

Play App Signing should protect the app-signing key. Upload-key ownership and recovery must remain controlled by the owner/project, never by an agent as the only holder.

---

## 11. Release blocker matrix

| ID | Blocker | Severity | Internal | Closed | Production | Owner / dependency |
|---|---|---:|---:|---:|---:|---|
| #567 | Production still loads remote public game document | P0 | Early technical test allowed | Resolve for release-candidate testing | **Blocks** | Android/mobile implementation |
| #568 | Missing lockfile + no production AAB attestation | P0 | Production-AAB test blocked | **Blocks** | **Blocks** | Agent 14 + Agent 4 coordination |
| #569 | Privacy/Data Safety/App Content incomplete | P0 | Internal-only can begin | **Blocks** | **Blocks** | Agent 13 + Agent 14 |
| #571 | Play account/signing/verification/testing state unknown | P0 | Real Play test requires app/signing setup | **Blocks** | **Blocks** | Owner + Agent 14 |
| #562 | Account deletion/retention lifecycle | P0 if accounts activated | Conditional | **Blocks if applicable** | **Blocks if applicable** | Agent 13 |
| #565 | Third-party notices/provenance/licensing incomplete | P0 commercial release | Does not block early technical test | Must be closed before commercial RC | **Blocks** | Agent 13 + asset/data owners |
| #566 | Active mission/cargo/save continuity incomplete | P0 release quality | Testable | **Blocks RC acceptance** | **Blocks** | Agent 16 + gameplay/persistence owner |
| #560 | Online identity auth/privacy incomplete | P0 if online identity activated | Conditional | **Blocks if applicable** | **Blocks if applicable** | Agent 13 + authority owner |
| #564 | UGC/chat safety incomplete | P0 if UGC/chat activated | Conditional | **Blocks if applicable** | **Blocks if applicable** | Agent 13 + multiplayer owner |
| #561/#570 | Store creative + technical listing pack incomplete | P1 until publication | No | Setup dependency | **Blocks listing completion** | Agent 15 + Agent 14 |
| Conditional | Billing/ads activated without re-audit | P0 if activated | Depends | **Blocks** | **Blocks** | Agent 12 + 13 + 14 |

---

## 12. Production release procedure

### Pre-release

1. Freeze exact current `main` SHA for the candidate.
2. Close #567 bundled-runtime requirement.
3. Close #568 reproducible AAB/attestation requirement.
4. Close #569 and applicable #560/#562/#564 privacy/security dependencies.
5. Close #565 licensing/attribution gate.
6. Close #566 save/mission/cargo continuity release gate.
7. Complete #561 creative pack and #570 technical listing compliance.
8. Complete #571 owner/account/signing/testing gate.
9. Freeze Agent 12 monetization scope and re-audit any ads/billing changes.
10. Complete Agent 13 release review.
11. Run Agent 16 independent release audit.
12. Build one final AAB from the frozen SHA. Any code/config change invalidates prior artifact evidence and requires a new candidate build.

### Internal / closed gate

1. Upload the exact attested AAB to the approved Play test track.
2. Verify App Bundle Explorer identity, SDKs, signing, device support and warnings.
3. Review pre-launch report.
4. Complete the owner Android matrix using the Play-delivered build.
5. Complete closed testing and production-access requirement if applicable.
6. Reconcile Data Safety/App Content with the exact uploaded artifact.
7. Reconcile store screenshots/listing with the exact candidate.

### Production gate

1. Confirm listing and countries/regions.
2. Confirm release notes.
3. Confirm no unresolved policy warning.
4. Confirm developer verification/package registration.
5. Confirm signing/versionCode continuity.
6. Confirm no P0 release blocker remains.
7. Obtain explicit owner authorization for production publication.
8. Publish through Play Console only after that authorization.
9. Record release version, source SHA, AAB hash and publication status.

### Post-release

- monitor crashes, ANRs and Android vitals;
- inspect ratings/reviews/support feedback;
- monitor backend health through Agent 4's lane;
- re-open release review if SDKs, privacy behavior, billing, ads, permissions or social features change;
- use staged rollout for later updates where appropriate and supported.

---

## 13. Rollback / emergency procedure

For a staged update, halt rollout when a serious regression appears so additional eligible users do not receive it.

For a release where a previous eligible version can be restored through Play's supported controls, verify the actual Play Console state before relying on rollback behavior.

For a critical first-production defect where no previous production version exists:

1. stop pending publication where possible;
2. if already live and user harm warrants it, unpublish to stop new discovery/downloads;
3. understand existing installs may continue to run;
4. build a corrected candidate with the same package/signing identity and a greater versionCode;
5. keep backend emergency changes in Agent 4's governed lane;
6. repeat release attestation/policy/acceptance gates;
7. document the incident and regression test before republishing.

Never attempt rollback by uploading a lower versionCode or changing package/signing identity.

---

## 14. What can be automated

Good automation candidates, coordinated with Agent 4 before workflow edits:

- semantic version consistency;
- dependency-lock presence and `npm ci` reproducibility;
- production AAB build invocation;
- source SHA/build ID/AAB hash recording;
- manifest package/version/SDK extraction;
- permission diffing;
- ABI/native-library inventory;
- 64-bit and 16 KB compatibility checks;
- debug/release checks;
- secret-pattern scanning;
- unit/type/build tests;
- Play API upload/status retrieval only after an explicitly authorized service account exists in secret storage;
- Android vitals/report retrieval where APIs and authorization permit it.

### Cannot be inferred or autonomously approved

- Play developer account type/creation date;
- legal/developer identity verification state;
- owner agreements and Play App Signing decisions;
- private signing/recovery material;
- target audience and IARC answers;
- final Data Safety attestation;
- tester recruitment and genuine feedback;
- production-access application answers;
- owner physical-device acceptance;
- legal representation/counsel decisions;
- production publication authorization.

Never automate policy answers from guesses.

---

## 15. Official source registry — verified 2026-09-09

| Topic | Official source |
|---|---|
| Target API level | https://developer.android.com/google/play/requirements/target-sdk |
| Target API Play Help | https://support.google.com/googleplay/android-developer/answer/11926878 |
| Expo SDK Android version table | https://docs.expo.dev/versions/latest/ |
| Android App Bundle | https://support.google.com/googleplay/android-developer/answer/9844279 |
| App Bundle architecture | https://developer.android.com/guide/app-bundle |
| Play App Signing | https://support.google.com/googleplay/android-developer/answer/9842756 |
| 64-bit support | https://developer.android.com/google/play/requirements/64-bit |
| 16 KB page sizes | https://developer.android.com/guide/practices/page-sizes |
| New personal-account testing | https://support.google.com/googleplay/android-developer/answer/14151465 |
| Internal/closed/open tests | https://support.google.com/googleplay/android-developer/answer/9845334 |
| Data Safety | https://support.google.com/googleplay/android-developer/answer/10787469 |
| User Data / account deletion | https://support.google.com/googleplay/android-developer/answer/10144311 |
| App Content | https://support.google.com/googleplay/android-developer/answer/9859455 |
| Permissions declaration | https://support.google.com/googleplay/android-developer/answer/9214102 |
| Target audience | https://support.google.com/googleplay/android-developer/answer/9867159 |
| Content ratings | https://support.google.com/googleplay/android-developer/answer/9898843 |
| Ads policy | https://support.google.com/googleplay/android-developer/answer/9857753 |
| Payments policy | https://support.google.com/googleplay/android-developer/answer/9858738 |
| Play Billing | https://developer.android.com/google/play/billing |
| Store listing limits | https://support.google.com/googleplay/android-developer/answer/9859152 |
| Store preview assets | https://support.google.com/googleplay/android-developer/answer/9866151 |
| Registering Play package names | https://support.google.com/googleplay/android-developer/answer/16984799 |
| Android developer verification | https://developer.android.com/developer-verification |
| Play Console verification guide | https://developer.android.com/developer-verification/guides/google-play-console |
| Staged rollouts | https://support.google.com/googleplay/android-developer/answer/6346149 |
| Prepare/roll out release | https://support.google.com/googleplay/android-developer/answer/9859348 |
| Update/unpublish app | https://support.google.com/googleplay/android-developer/answer/9859350 |

### Freshness rule

Immediately before every production release, Agent 14 must re-check at minimum:

- target API deadline;
- personal-account testing/production-access requirements;
- Android developer verification/package-registration requirements;
- Data Safety/App Content requirements;
- Play Billing rules if monetization is enabled;
- store asset dimensions/metadata rules;
- technical-quality requirements shown in Play Console.

Do not treat this snapshot as permanently valid policy.

---

## 16. Definition of done

DROPi Tycoon is **Google Play production ready** only when:

- all applicable P0 blockers are closed with evidence;
- Play Console account/package/signing state is verified without exposing secrets;
- the exact final production AAB is reproducible and attested;
- the app starts its bundled Phaser runtime without requiring the public Railway webpage as the game document;
- policy declarations match exact binary/backend behavior;
- #565 licensing/attribution is complete;
- store material is compliant, truthful and generated from the submitted build;
- required testing, including any account-specific closed-test rule, is complete;
- #566 active player/mission/cargo continuity is accepted on Android;
- owner physical Android landscape acceptance is recorded;
- Agent 13 legal/privacy gate and Agent 16 independent release audit are complete;
- the owner explicitly authorizes production publication.

Until then, the canonical state is `NOT_PLAY_READY`.
