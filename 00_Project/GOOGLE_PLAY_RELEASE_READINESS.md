# DROPi Tycoon — Google Play / Android Release Readiness

**Owner lane:** Agent 14 — Google Play / Android Release / Store Compliance  
**Verified:** 2026-09-08  
**Repository:** `caliofmarian-ai/DROPi-Tycoon`  
**Audited main:** `8e340b7131c4bdc890c38ba34e88d94858897cb3`  
**Primary platform:** Android, landscape  
**Authoritative gameplay runtime:** Phaser  
**Mobile shell:** React Native / Expo  
**Distribution target:** Google Play  

This file is the canonical release-readiness checklist for moving DROPi Tycoon from a validated Git commit to a Play-distributed Android release.

It is an engineering/compliance control document, not legal advice. Privacy, minors, consumer-protection, account/data-retention, intellectual-property and commercial terms that require legal interpretation must receive Agent 13 review and, where Agent 13 flags it, qualified professional legal review before commercial launch.

---

## 1. Executive status

### Current Play readiness: **40%**

This is a project readiness score, not a Google-generated score.

| Domain | Weight | Current score | Weighted result | Main reason |
|---|---:|---:|---:|---|
| App identity / versioning | 15% | 85% | 12.75 | Package, name, version and EAS identity exist; Play developer/account state is unverified. |
| Build / artifact readiness | 25% | 50% | 12.50 | Production AAB profile and API-36-capable SDK exist; production runtime is still remote-Railway, lockfile is missing, final AAB has not been attested. |
| Policy / App Content | 25% | 20% | 5.00 | No publishable privacy policy, Data Safety, target audience, IARC, ads declaration or final permission declaration exists yet. |
| Store listing | 15% | 20% | 3.00 | Approved brand sources exist; Play-specific dimensions, feature graphic, screenshots and listing copy are incomplete/unverified. |
| Testing | 10% | 30% | 3.00 | Preview Android testing exists, but no Play internal/closed/pre-launch release evidence or complete device matrix exists. |
| Release / monitoring / rollback | 10% | 35% | 3.50 | Version ledger exists; production track, vitals gate and rollback evidence do not. |
| **Total** | **100%** |  | **39.75 ≈ 40%** |  |

### Current release verdict

**NOT READY FOR GOOGLE PLAY PRODUCTION.**

The project has a real Android foundation rather than a placeholder, but it still has production-architecture, reproducibility, Play-account, policy, testing and store-listing blockers.

### Focused blocker issues

- #567 — bundle the Phaser runtime inside the production Android app;
- #568 — produce a reproducible Play AAB and release attestation;
- #569 — complete privacy, Data Safety and App Content declarations;
- #570 — produce the compliant Play listing asset/metadata pack;
- #571 — complete Play Console verification, signing and test-to-production gate.

No substantial mobile architecture change belongs in the initial Agent 14 audit PR. #567 owns that dedicated implementation slice.

---

## 2. Audit scope and coordination

The audit covered:

- latest `main`;
- latest 30 merged PRs available at audit time;
- current open PRs;
- active agent branches;
- #295 Android application foundation;
- #317 owner quality gate;
- `game-mobile/`;
- Expo/EAS configuration;
- Android identity/versioning assumptions;
- mobile dependencies and runtime loading;
- current branding assets;
- privacy/account/chat/analytics/ads/billing surfaces in current canon/runtime;
- signing/secret boundaries;
- current official Google Play / Android release requirements.

### Active coordination boundaries at audit time

Agent 4 has active CI/Railway work in PR #549. This release-readiness slice therefore does **not** modify `.github/workflows/**`, Railway configuration, production Docker configuration or deployment topology.

Agent 12 owns monetization strategy. Agent 14 only defines the Play-compliant release gate for digital purchases/ads/subscriptions.

Agent 13 owns privacy/legal/compliance analysis. Agent 14 owns the requirement that Play declarations match the actual submitted artifact and backend behavior.

Agent 15 owns marketing/creative store positioning. Agent 14 owns the technical dimensions, policy constraints and truthfulness gate for store assets.

Agent 16 should independently verify the final release candidate before production.

---

## 3. Current Android implementation state

### Implemented and usable

| Area | State | Evidence / implication |
|---|---|---|
| App name | PASS | `DROPi Tycoon` in `game-mobile/app.json`. |
| Expo slug | PASS | `dropi-tycoon`. |
| Android package | PASS | `com.dropi.tycoon`. Treat this as immutable after Play publication except through an intentionally new app identity. |
| URL scheme | PASS | `dropitycoon`. |
| Platform | PASS | Android only in Expo platform configuration. |
| Orientation | PASS | Landscape locked in Expo configuration. |
| Expo/EAS project identity | PASS | EAS project ID `972b831b-78d0-46ab-8cb8-2b13745a8df7`. |
| Semantic version | PASS / PRE-1.0 | `0.0.0` synchronized between `app.json` and `package.json`. |
| Android versionCode policy | PASS | EAS remote app version source + `autoIncrement: true`; do not hardcode `android.versionCode` while this policy remains canonical. |
| Preview build | PASS as prototype evidence | Build record exists for `0.0.0`, versionCode 2, EAS preview APK. This is not a Play production AAB attestation. |
| Production build profile | PASS configuration | `eas.json` uses `android.buildType: app-bundle` for `production`. |
| Target API baseline | EXPECTED PASS | Expo SDK 57 official platform table reports `compileSdkVersion=36`, `targetSdkVersion=36`. Final AAB still must be inspected. |
| Minimum Android baseline | EXPECTED | Expo SDK 57 supports Android 7+; record the exact generated `minSdkVersion` from the final AAB before release. |
| Phaser authority | PASS architecture intent | Phaser remains authoritative; React Native is the native shell. |
| Android Back integration | IMPLEMENTED | Existing mobile shell routes Back behavior into game navigation. Release candidate must re-test it. |
| Branding sources | PARTIAL | Owner-approved launcher/logo/splash files exist; store-specific dimensions/format compliance are not yet proven. |

### Prototype-only / incomplete

| Area | State | Release consequence |
|---|---|---|
| Production runtime loading | **BLOCKER** | `App.tsx` currently loads an HTTPS `gameUrl` in WebView; `runtimeConfig.ts` requires `EXPO_PUBLIC_DROPITYCOON_GAME_URL`. Ordinary production startup therefore still depends on the public Railway webpage. See #567. |
| Dependency lockfile | **BLOCKER** | `game-mobile/package-lock.json` is absent even though the mobile release README requires a committed lockfile for controlled EAS builds. See #568. |
| Production AAB evidence | **BLOCKER** | No canonical production AAB build ID/hash/manifest/ABI/permission attestation exists. See #568. |
| Play signing | **BLOCKER / OWNER STATE UNKNOWN** | Repository cannot prove Play App Signing enrollment or upload-key state. See #571. |
| Play developer verification | **BLOCKER / OWNER STATE UNKNOWN** | Account identity/contact/package registration status must be checked in Play Console. See #571. |
| Privacy policy | **BLOCKER before closed/public Play track** | No publishable DROPi Tycoon privacy policy found on `main`. See #569. |
| Data Safety | **BLOCKER before closed/public Play track** | Not completed. See #569. |
| IARC content rating | **BLOCKER** | Not completed. See #569. |
| Target audience | **BLOCKER** | Not selected. See #569. |
| Ads declaration | **BLOCKER declaration** | Current code audit found no AdMob/current ads SDK, but Play declaration still must be completed from the final artifact. See #569. |
| Store listing | **BLOCKER** | Feature graphic, authentic release screenshots, final copy, support details and privacy URL incomplete. See #570. |
| Play testing tracks | **BLOCKER** | No evidence of internal/closed test, pre-launch report or production access. See #571. |

### Current privacy / monetization / social observations

At `main` audited on 2026-09-08:

- mobile dependencies do not include an ad SDK, analytics SDK or Play Billing SDK;
- `game-web` runtime dependencies are Phaser and PostgreSQL client only;
- player analytics are described as future/staged in project documents, not active telemetry;
- multiplayer chat/UGC is described as future/staged and is not an active current release feature;
- Better Auth / production account creation / email-password-social login are explicitly not activated in current technical canon;
- a local World Instance/account identity model exists, but it is not proof of authentication or production user-account creation.

These observations are **not** permission to permanently answer Play forms “No.” The Data Safety/App Content audit must be repeated against the exact release candidate, all bundled SDKs and all active backend/network behavior.

---

## 4. Current official Google Play / Android requirements

All requirements below were re-checked against official Google/Android/Expo documentation on **2026-09-08**.

### Target API

For ordinary phone/tablet apps, new apps and updates submitted from **2026-08-31** must target **Android 16 / API 36 or higher**.

Current Expo SDK 57 documentation reports `targetSdkVersion=36` and `compileSdkVersion=36`, so the selected SDK is capable of compliance. The final submitted AAB remains authoritative and must be inspected.

### Android App Bundle

New Play apps must publish with an **Android App Bundle (`.aab`)**. DROPi Tycoon already configures EAS `production` for `app-bundle`, but a release AAB has not yet been attested.

### Play App Signing

Play App Signing is required for new apps using AABs. Private app signing keys, upload keys, keystores and passwords must never be committed.

### 64-bit

Apps containing native code must support Play's 64-bit requirements. React Native/Expo includes native components, so the final AAB must be inspected rather than assuming compatibility from JavaScript source.

### 16 KB memory page sizes

The current Android compatibility documentation says apps targeting API 35+ must support 16 KB memory page sizes on 64-bit devices and identifies **2027-02-01** as the current update-release enforcement milestone for incompatible updates. DROPi Tycoon should verify support now in #568 rather than wait for enforcement.

### Newer personal developer account testing

Do not assume this applies to the owner.

If the Play Console account is **Personal** and was created after **2023-11-13**, current production-access rules require:

- a closed test;
- at least **12 testers**;
- testers continuously opted in for **at least 14 days**;
- then an application for production access with Play's testing/app/readiness questions.

Internal testing is recommended but does not replace this requirement for an affected account. Open testing becomes available after production access under the current rule.

### Android developer verification — September 2026

Google states that effective **2026-09-30**, Play packages must be registered for Android developer verification. Google attempts to auto-register most Play apps, but the owner must verify the actual state for `com.dropi.tycoon` in Play Console. Identity verification must also be complete.

### Data Safety

Data Safety is required for apps published on **closed, open or production** tracks. Apps active exclusively on internal testing are exempt. Even an app that collects no user data must complete the form and provide a privacy-policy link.

### Account deletion

If the submitted app allows users to create an account in-app, it must provide a readily discoverable account-deletion request path **inside the app and outside the app through a web resource**. Associated user data must be deleted except for transparently disclosed legitimate retention.

Current `main` does not activate production account creation, so this is currently conditional. It becomes a hard release blocker if account creation lands before the release candidate.

### Content rating / audience / ads

- every Play app must have an IARC content rating;
- target age groups must be declared;
- including children in the target audience invokes additional Families policy obligations;
- Play Console requires a declaration whether the app contains ads;
- ads, if added, must comply with the app's content rating and applicable audience rules.

### Permissions

Sensitive/high-risk permissions must be necessary for current, disclosed core functionality. Play may require a permission declaration, reviewer instructions and video evidence. DROPi Tycoon must not request permissions “for future use.”

Current `app.json` has no explicit dangerous-permission request, but the generated `android/` directory is intentionally not committed, so the final merged permission set must be read from the release AAB.

### Digital purchases / subscriptions

If Agent 12 activates in-app payment for digital items, virtual currency, game features or subscriptions in the Play-distributed app, the release must use Google Play's billing system except where a specific current policy exception/program lawfully applies. Do not implement a payment shortcut intended to bypass Play policy.

Billing is not active in the audited current mobile dependency set, so it is a **conditional future release blocker**, not a reason to add Billing prematurely.

### Pre-launch report and Android vitals

Play pre-launch reports are automatically generated for eligible uploaded artifacts and can detect stability, Android compatibility, performance and accessibility problems. Landscape-locked apps are supported.

Current Android vitals bad-behavior thresholds include:

- user-perceived ANR rate: **0.47% overall**, 8% per phone model;
- user-perceived crash rate: **1.09% overall**, 8% per phone model.

Release monitoring must use real Play data; do not fabricate “pass” metrics before enough data exists.

---

## 5. Canonical Play Console release checklist

A release may only be marked `PLAY_READY` when all applicable boxes are complete.

### A. App identity

- [x] App name: `DROPi Tycoon`.
- [x] Package/application ID: `com.dropi.tycoon`.
- [x] Expo slug: `dropi-tycoon`.
- [x] Android-only mobile shell configured.
- [x] Landscape orientation configured.
- [x] EAS project ID recorded.
- [x] `versionName` source controlled by `app.json` / `package.json` semantic version.
- [x] `versionCode` governed remotely by EAS with auto-increment.
- [ ] Developer account type confirmed in Play Console.
- [ ] Developer identity/contact verification confirmed.
- [ ] Package registration for `com.dropi.tycoon` confirmed.
- [ ] Public developer/store contact details finalized.

### B. Build / artifact

- [x] EAS `production` profile produces AAB by configuration.
- [x] Expo SDK 57 selected; official SDK table is API-36 capable.
- [ ] `game-mobile/package-lock.json` committed and clean `npm ci` reproducible.
- [ ] Production Phaser runtime bundled; ordinary startup independent of the public Railway webpage.
- [ ] Exact release commit frozen and recorded.
- [ ] Production EAS AAB produced from that commit.
- [ ] AAB SHA-256 recorded.
- [ ] EAS build ID recorded.
- [ ] Package ID verified from final artifact.
- [ ] `versionName` verified from final artifact.
- [ ] monotonic `versionCode` verified from final artifact.
- [ ] target SDK verified >=36 for current submission requirements.
- [ ] compile SDK recorded.
- [ ] min SDK recorded.
- [ ] merged permissions recorded.
- [ ] no unjustified sensitive/high-risk permission.
- [ ] release build non-debuggable.
- [ ] no development-client/debug-only runtime surface in release artifact.
- [ ] 64-bit support verified.
- [ ] 16 KB page-size compatibility verified for native libraries.
- [ ] App Bundle Explorer shows intended device compatibility.
- [ ] Bundle size reviewed; if Play delivery limits are exceeded, use an approved Play delivery mechanism rather than arbitrary external asset downloading.
- [ ] JavaScript/native symbolication/source-map handling documented where needed for actionable crash diagnostics.

### C. Signing / credentials

- [ ] Play App Signing configured.
- [ ] Upload-key ownership/recovery process documented outside Git.
- [ ] Upload certificate SHA-256 recorded as public evidence only.
- [x] `.gitignore` rejects common AAB/APK/signing/service-account artifacts in the mobile directory.
- [ ] Secret scan confirms no keystore, private key, password, service-account credential or Play token in Git history/release branch.
- [ ] Any Play Developer API service account, if later used, stored only in approved secret storage.

### D. Policy / App Content

- [ ] Stable HTTPS privacy-policy URL.
- [ ] Privacy policy matches actual production data flow and SDKs.
- [ ] Data Safety completed from final artifact/backend behavior.
- [ ] Ads declaration completed and accurate.
- [ ] Target audience/age groups selected deliberately.
- [ ] Families requirements satisfied if any child age group is included.
- [ ] IARC content-rating questionnaire completed accurately.
- [ ] App access/reviewer credentials supplied if restricted content exists.
- [ ] Final AAB permissions reconciled with Play declarations.
- [ ] Account-deletion path complete if in-app account creation exists.
- [ ] UGC/chat moderation/report/block requirements complete if UGC/chat exists.
- [ ] News/financial/other special declarations answered only if actually applicable to release content.
- [ ] Agent 13 legal/privacy launch review complete.

### E. Monetization

- [ ] Agent 12 release monetization scope frozen for the candidate.
- [ ] If no paid digital content exists, no unused Billing implementation is added merely for future use.
- [ ] If digital purchases/subscriptions exist, compliant Play billing architecture is implemented and tested.
- [ ] Server-side purchase verification/entitlement state is authoritative where purchases exist.
- [ ] Refund/cancel/revoke/restore behavior tested where applicable.
- [ ] Data Safety/privacy/ads/audience declarations re-audited after monetization SDK additions.

### F. Store listing

- [ ] Play icon: 512x512, 32-bit PNG with alpha, <=1024 KB.
- [ ] Feature graphic: 1024x500, JPEG or 24-bit PNG without alpha.
- [ ] Minimum two valid screenshots overall.
- [ ] For this game, at least three authentic 16:9 landscape gameplay screenshots at >=1920x1080 prepared for Google's recommended game presentation.
- [ ] Tablet/large-screen screenshot set prepared if tablet distribution/promotion is retained and the app is genuinely tablet-compatible.
- [ ] Screenshots depict the actual submitted game, not mock future systems.
- [ ] Alt text supplied where supported/recommended.
- [ ] App title <=30 characters.
- [ ] Short description <=80 characters.
- [ ] Full description <=4000 characters.
- [ ] No unverifiable “best/#1/top/new/free/download-count/award” claims.
- [ ] Support/contact details complete.
- [ ] Privacy-policy link complete.
- [ ] Preview video decision recorded; if used, meets current YouTube/Play requirements and shows predominantly real gameplay.
- [ ] Third-party IP/licensing/attribution cleared with Agent 13 where required.

### G. Testing

- [ ] Clean fresh install from Play internal track.
- [ ] Upgrade from previous Play-delivered test build.
- [ ] Cold launch.
- [ ] Warm launch/resume.
- [ ] Android Back.
- [ ] Landscape lock / orientation behavior.
- [ ] Insets/safe areas.
- [ ] Touch controls.
- [ ] Pinch/zoom.
- [ ] Camera/navigation behavior.
- [ ] Save state across app kill/relaunch.
- [ ] Background/foreground transition.
- [ ] Offline startup behavior.
- [ ] Network loss during session.
- [ ] Network recovery.
- [ ] Low-memory/process recreation behavior where practical.
- [ ] Performance/frame pacing on owner device.
- [ ] Memory pressure reviewed.
- [ ] At least one modern 64-bit-only device/environment test.
- [ ] 16 KB page-size environment test where practical.
- [ ] Phone compatibility range reviewed in App Bundle Explorer.
- [ ] Tablet/large-screen behavior tested if distributed there.
- [ ] Play pre-launch report reviewed: stability, compatibility, performance, accessibility.
- [ ] No release-blocking crash/ANR issue remains.
- [ ] Closed-test requirement completed if owner account is subject to it.

### H. Release control

- [ ] Release notes written from actual changes.
- [ ] Release candidate SHA/AAB hash/Play version recorded.
- [ ] Policy declarations rechecked after final artifact upload.
- [ ] Country availability explicitly reviewed.
- [ ] Managed publishing decision recorded.
- [ ] First-production-release limitation understood: staged rollout percentages are not available for the first production release.
- [ ] Subsequent updates use staged rollout unless release owner records a reason not to.
- [ ] Android vitals monitored after release.
- [ ] Crash/ANR/user feedback monitored.
- [ ] Rollback/halt path documented and owner knows the Play Console location.

---

## 6. Build pipeline — canonical target

### Current first-stage path

```text
GitHub main
  -> game-web Phaser/Vite runtime
  -> Railway public webpage
  -> Expo/React Native WebView
  -> installed Android APK/AAB shell
```

This is acceptable for development/preview but is **not** the canonical long-term production startup architecture.

### Required production path

```text
GitHub main (frozen release SHA)
  -> deterministic game-web production build
  -> Phaser web assets bundled into game-mobile production artifact
  -> clean dependency-locked Expo/EAS build
  -> signed production AAB
  -> artifact attestation (SHA, version, SDK, permissions, ABI, signing certificate)
  -> Google Play internal test
  -> Play pre-launch report + owner device matrix
  -> closed test / production-access gate when applicable
  -> production release
```

Railway can remain the authorized backend/server endpoint for server-authoritative systems. The boundary is that **the installed game's document/assets must not require the public Railway webpage just to start ordinary gameplay**.

### Deterministic build evidence

Each Play candidate must record at least:

- Git commit SHA;
- semantic version;
- Android versionCode;
- EAS project ID;
- EAS build profile;
- EAS build ID;
- AAB SHA-256;
- target/compile/min SDK;
- package ID;
- permission list;
- ABI/native-library result;
- 16 KB compatibility result;
- upload certificate SHA-256;
- Play track uploaded to;
- pre-launch report outcome;
- owner Android acceptance outcome.

---

## 7. Permissions policy

Current source configuration does not declare a future-sensitive permission merely “just in case.” Preserve that principle.

For every release:

1. read permissions from the final AAB/Play artifact, not only `app.json`;
2. classify each permission as normal or sensitive/high-risk;
3. map it to a current, player-visible feature;
4. remove it if no current feature requires it;
5. if Play requires a declaration, provide the exact core-use-case justification and reviewer evidence;
6. update privacy/Data Safety if data behavior changes.

Do not add broad file access, installed-app visibility, SMS/call-log, location, microphone, camera, contacts or background permissions for speculative future systems.

Network access needed by the game/backend is expected, but final manifest verification remains mandatory.

---

## 8. Store asset requirements

Agent 15 owns creative positioning; Agent 14 verifies these technical constraints.

### Mandatory / baseline

| Asset | Current Play requirement checked 2026-09-08 | DROPi state |
|---|---|---|
| Play app icon | 512x512, 32-bit PNG with alpha, <=1024 KB | Owner-approved icon source exists; exact store export dimensions not yet proven. |
| Feature graphic | 1024x500, JPEG or 24-bit PNG, no alpha | Missing/unverified. |
| Screenshots | Minimum 2 across device types; JPEG or 24-bit PNG, 320-3840 px, max dimension <=2x min dimension | Missing release-candidate set. |
| Game recommendation set | At least 3 authentic 16:9 landscape screenshots at minimum 1920x1080 is highly recommended for games | Missing. |
| Large-screen set | For tablet/Chromebook promotion, Google recommends minimum 4 at 1080-7680 px, 16:9 landscape | Conditional; only from genuine large-screen-compatible build. |
| Title | <=30 chars | `DROPi Tycoon` fits; final listing still must be submitted. |
| Short description | <=80 chars | Missing final copy. |
| Full description | <=4000 chars | Missing final copy. |
| Preview video | Optional; strongly useful for games; public/unlisted embeddable YouTube, non-age-restricted, no ad interference | Not required for first release; decision pending. |

All screenshots and video claims must match the submitted build. Future multiplayer, chat, global economy, monetization, story or other roadmap features must not be presented as shipped features until verified in that release candidate.

---

## 9. Testing plan and owner Android acceptance matrix

The owner-facing acceptance surface remains **physical Android landscape**.

### Required minimum matrix

| Test | Internal track | Closed track | Production candidate |
|---|---:|---:|---:|
| Fresh install | Required | Required | Required |
| Upgrade install | Required after first test version | Required | Required for updates |
| Cold launch | Required | Required | Required |
| Resume | Required | Required | Required |
| Android Back | Required | Required | Required |
| Landscape/orientation | Required | Required | Required |
| Safe areas/insets | Required | Required | Required |
| Touch/tap/drag | Required | Required | Required |
| Pinch/zoom | Required | Required | Required |
| Save/restore | Required | Required | Required |
| Background/foreground | Required | Required | Required |
| Offline startup | Required | Required | Required |
| Mid-session network loss | Required | Required | Required |
| Network recovery | Required | Required | Required |
| Performance/frame pacing | Baseline | Required | Required |
| Memory pressure/process recreation | Baseline | Required | Required |
| 64-bit-only environment | Required before production | Recheck if artifact changes | Required evidence |
| 16 KB page-size environment | Required before enforcement / preferably now | Recheck if native deps change | Required evidence before affected release |
| Play pre-launch report | After AAB upload | Required review | No unresolved blocker |
| Crash/ANR review | Baseline | Required | Required |

### Historical preview evidence boundary

The repository contains a `0.0.0` preview APK build record and #295 records substantial physical Android foundation testing. The build record itself still labels physical validation pending. Therefore historical preview testing is valuable but **not sufficient release evidence** for a future Play AAB. The exact release candidate must be tested again.

### Personal-account tester plan, if applicable

If #571 confirms the owner is subject to the newer personal-account rule:

- recruit more than the bare minimum where practical so a single opt-out does not break continuity;
- ensure at least 12 remain opted in continuously for the full 14-day period;
- give testers a concise real test script based on this matrix;
- collect genuine feedback/issues and record changes made;
- keep all policy/store information accurate during the closed test;
- apply for production access only after the continuous requirement is actually met.

Do not fabricate tester activity or feedback.

---

## 10. Signing and release security

### Never commit

- `.jks` / `.keystore` files;
- signing private keys;
- upload/app-signing private key material;
- keystore passwords;
- EAS credential exports;
- Play service-account credentials;
- OAuth/client secrets used as secrets;
- Play Console tokens;
- recovery codes;
- production `.env.*` files containing secrets;
- generated release APK/AAB binaries.

The Agent 14 initial PR extends `game-mobile/.gitignore` to reject common release artifacts and credential files.

### Allowed repository evidence

It is safe and useful to record:

- public package ID;
- public EAS project ID;
- public certificate SHA-256 fingerprint;
- build ID;
- artifact SHA-256;
- versionCode/versionName;
- source commit;
- non-secret Play track/status evidence.

### Key ownership

Play App Signing should protect the app-signing key. The upload key still requires controlled ownership/recovery. Do not let an agent silently create a key and make itself the only holder of recovery information.

---

## 11. Policy dependency matrix

| Feature/state in release candidate | Play consequence | Owner |
|---|---|---|
| No ads | Ads declaration still required; answer must match artifact | Agent 14 / Agent 13 evidence |
| Ads added | Ads declaration, Data Safety, audience/content-rating and ad SDK compliance re-audit | Agent 12 + 13 + 14 |
| No account creation | Account-deletion rule not triggered by account creation | Agent 13 + 14 confirm release state |
| Account creation added | In-app + web deletion request path required; data deletion/retention policy | Agent 13 + implementation owner + 14 |
| No chat/UGC | UGC moderation requirements not activated | Agent 13 + 14 confirm release state |
| Chat/UGC added | Moderation/report/block and safety/legal controls become release blockers | Agent 13 + multiplayer owner + 14 |
| No digital purchases | Do not add Billing only for future use | Agent 12 + 14 |
| Digital products/virtual currency/subscription added | Play billing policy/integration required unless a current explicit exception/program applies | Agent 12 + 14 |
| Children included in target audience | Families policy requirements activate | Agent 13 + 14 + owner |
| Sensitive permission added | Core-use-case declaration/review may be required | Implementation owner + 13 + 14 |

### Professional legal review required before commercial launch for

At minimum, Agent 13 must decide whether counsel review is required for:

- privacy-policy legal sufficiency and GDPR/EEA handling;
- child/minor targeting or age assurance;
- user-account deletion/retention exceptions;
- player chat/UGC moderation terms;
- paid digital goods/subscription consumer terms/refunds;
- trademark/IP and third-party asset/data licensing;
- any real-money, token, cryptocurrency or regulated financial feature if ever introduced.

---

## 12. Release tracks and production-access plan

### Internal testing

Use first for Play-delivered AAB installation, package/signing, update-path, device compatibility and basic owner acceptance. Internal-only apps are currently exempt from Data Safety display requirements, making this the earliest safe Play artifact test surface.

### Closed testing

Use after app setup/policy surfaces are complete enough for the track. Data Safety applies on closed testing.

If #571 confirms the newer personal-account rule applies, this track must satisfy the 12-tester / continuous-14-day production-access requirement.

### Open testing

Current personal-account guidance says open testing becomes available after production access for affected newer personal accounts. Do not treat open testing as a substitute for the required closed test.

### Production

Production is allowed only after all applicable blockers are closed and owner acceptance is recorded.

**Important:** Google currently does not offer staged rollout percentages for an app's **first production release**. The first production release is published to all eligible users in the selected production countries/regions once released. Risk must therefore be reduced through internal/closed testing and controlled country availability before first public launch.

For **subsequent updates**, use staged rollout and manually increase the percentage after reviewing vitals, crashes/ANRs and feedback. Do not auto-promote an unhealthy release.

---

## 13. Production release procedure

### Pre-release gate

1. Freeze a candidate from current `main`; record SHA.
2. Confirm #567 architecture is complete.
3. Confirm #568 reproducible build/AAB attestation is complete.
4. Confirm #569 policy/App Content is complete.
5. Confirm #570 listing package is complete.
6. Confirm #571 signing/account/testing gate is complete.
7. Confirm Agent 12 monetization scope has not introduced undeclared ads/billing behavior.
8. Confirm Agent 13 release review is complete.
9. Run Agent 16 independent release audit.
10. Build one final production AAB from the frozen SHA; any code/config change invalidates prior artifact evidence and requires a new build.

### Play internal/closed gate

1. Upload the exact attested AAB.
2. Verify App Bundle Explorer identity, SDKs, device support and warnings.
3. Review generated pre-launch report.
4. Complete the owner physical Android landscape matrix using the Play-delivered build.
5. Complete closed testing and production-access requirement if applicable.
6. Reconcile Data Safety/App Content after the final AAB is visible in Play Console.

### Production gate

1. Confirm listing and country availability.
2. Confirm release notes.
3. Confirm no unresolved policy warning.
4. Confirm package registration / Android developer verification state.
5. Confirm signing and versionCode continuity.
6. For first release, explicitly acknowledge that staged percentage rollout is unavailable.
7. Submit/start production publication only with owner authorization.
8. Record release version, source SHA, AAB hash and publication status in repository release evidence.

### Post-release

- monitor crashes/ANRs and Android vitals;
- inspect ratings/reviews and support feedback;
- monitor backend health through Agent 4's operational lane;
- do not silently change Data Safety/ads/audience claims after runtime/SDK changes;
- use staged rollout for subsequent updates unless the release owner records a reason to use another supported Play path.

---

## 14. Rollback / emergency procedure

### During a staged update rollout

For a post-launch update, **halt the staged rollout** immediately if a serious regression appears. Users already on that update remain on it; the halt prevents additional eligible users from receiving it.

### After a fully rolled update

Google Play now supports halting a fully rolled-out release on supported tracks when a previous eligible release exists; the previous release can resume serving new/eligible users. Verify the Play Console state before relying on this path.

### First production release limitation

A first release on a track has no previous version to restore and cannot use the normal “halt back to previous release” behavior. If a critical defect reaches the first production release:

1. stop any pending publication where still possible;
2. if already live and user harm warrants it, **unpublish** the app to stop new users finding/downloading it;
3. understand that existing users can still use the installed app;
4. build and submit a corrected version with the same package/signing identity and a greater versionCode;
5. keep server/backend emergency changes in Agent 4's governed lane;
6. document the incident and regression test before republishing/continuing rollout.

Never attempt rollback by re-uploading a lower `versionCode` or changing the package/signing identity.

---

## 15. What can and cannot be automated

### Good automation candidates

- semantic version consistency;
- dependency-lock presence and `npm ci` reproducibility;
- production AAB build invocation;
- source SHA/build ID/AAB SHA recording;
- package/version/SDK manifest extraction;
- permission diffing;
- ABI/native-library inventory;
- 64-bit/16 KB compatibility checks;
- debug/release manifest checks;
- secret-pattern scanning;
- unit/type/build tests;
- Play Developer API upload/status retrieval if an explicitly authorized service account is later configured in secret storage;
- Android vitals/report retrieval where APIs and authorization permit it.

Agent 4 coordination is required before adding CI workflow automation.

### Owner/manual actions that cannot be safely inferred from Git

- Play developer account type and creation date;
- legal/developer identity verification;
- package-registration state where Play requires account UI action;
- Play App Signing enrollment/key decisions;
- accepting Play agreements;
- selecting target audience and answering content-rating questionnaires truthfully;
- final Data Safety attestation;
- private reviewer/test credentials;
- recruiting and retaining real closed-test users;
- production-access application answers;
- owner physical-device visual/gameplay acceptance;
- final production publication authorization.

Never automate policy answers from guesses.

---

## 16. Official source registry — verified 2026-09-08

| Topic | Official source |
|---|---|
| Target API level | https://developer.android.com/google/play/requirements/target-sdk |
| Target API Play Help | https://support.google.com/googleplay/android-developer/answer/11926878 |
| Expo SDK 57 Android SDK table | https://docs.expo.dev/versions/latest/ |
| Expo SDK 57 release | https://expo.dev/changelog/sdk-57 |
| Android App Bundle | https://support.google.com/googleplay/android-developer/answer/9844279 |
| App Bundle architecture | https://developer.android.com/guide/app-bundle |
| AAB / Play App Signing FAQ | https://developer.android.com/guide/app-bundle/faq |
| Play App Signing | https://support.google.com/googleplay/android-developer/answer/9842756 |
| 64-bit support | https://developer.android.com/google/play/requirements/64-bit |
| 16 KB page sizes | https://developer.android.com/guide/practices/page-sizes |
| Play technical quality / vitals thresholds | https://support.google.com/googleplay/android-developer/answer/17492799 |
| Android vitals | https://support.google.com/googleplay/android-developer/answer/9844486 |
| Pre-launch report | https://support.google.com/googleplay/android-developer/answer/9842757 |
| New personal-account testing | https://support.google.com/googleplay/android-developer/answer/14151465 |
| Internal/closed/open tests | https://support.google.com/googleplay/android-developer/answer/9845334 |
| Data Safety | https://support.google.com/googleplay/android-developer/answer/10787469 |
| User Data / account deletion | https://support.google.com/googleplay/android-developer/answer/10144311 |
| App Content / review preparation | https://support.google.com/googleplay/android-developer/answer/9859455 |
| Permissions declaration | https://support.google.com/googleplay/android-developer/answer/9214102 |
| Sensitive permissions/APIs policy | https://support.google.com/googleplay/android-developer/answer/16558241 |
| Target audience | https://support.google.com/googleplay/android-developer/answer/9867159 |
| Content ratings | https://support.google.com/googleplay/android-developer/answer/9898843 |
| Ads policy | https://support.google.com/googleplay/android-developer/answer/9857753 |
| Payments policy | https://support.google.com/googleplay/android-developer/answer/9858738 |
| Payments explainer | https://support.google.com/googleplay/android-developer/answer/10281818 |
| Play Billing | https://developer.android.com/google/play/billing |
| Play Billing backend | https://developer.android.com/google/play/billing/backend |
| Store listing limits | https://support.google.com/googleplay/android-developer/answer/9859152 |
| Store preview assets | https://support.google.com/googleplay/android-developer/answer/9866151 |
| Package-name verification | https://support.google.com/googleplay/android-developer/answer/16984799 |
| Android developer verification | https://developer.android.com/developer-verification |
| Staged rollouts | https://support.google.com/googleplay/android-developer/answer/6346149 |
| Prepare/roll out release | https://support.google.com/googleplay/android-developer/answer/9859348 |
| Halt fully rolled release | https://support.google.com/googleplay/android-developer/answer/16285429 |
| Update/unpublish app | https://support.google.com/googleplay/android-developer/answer/9859350 |

### Freshness rule

Before every production release, Agent 14 must re-check at minimum:

- target API deadline;
- Play testing/production-access requirements;
- Android developer verification requirements;
- Data Safety/App Content requirements;
- Play Billing requirements if monetization is enabled;
- store asset dimensions/metadata rules;
- any new technical-quality requirement shown in Play Console.

Do not treat this 2026-09-08 snapshot as permanently valid policy.

---

## 17. Release blocker matrix

| ID | Blocker | Severity | Blocks internal test? | Blocks closed test? | Blocks production? | Owner |
|---|---|---:|---:|---:|---:|---|
| #567 | Production still loads public Railway game page | P0 | No for early technical test | Should be resolved before release-candidate closed test | **Yes** | Agent 14/mobile implementation |
| #568 | Missing lockfile + no production AAB attestation | P0 | Production-AAB internal test: **Yes** | **Yes** | **Yes** | Agent 14 + Agent 4 coordination |
| #569 | Privacy/Data Safety/App Content incomplete | P0 | Internal-only can begin | **Yes** | **Yes** | Agent 13 + Agent 14 |
| #570 | Store listing asset/metadata pack incomplete | P1 | No | App setup/listing may constrain track readiness | **Yes** | Agent 15 + Agent 14 |
| #571 | Play account/signing/verification/testing state unknown | P0 | Signing/app setup required for real Play internal test | **Yes** | **Yes** | Owner + Agent 14 |
| Conditional | Billing/ads SDK added without compliance re-audit | P0 if activated | Depends | **Yes** | **Yes** | Agent 12 + 13 + 14 |
| Conditional | Account creation added without deletion path | P0 if activated | No | **Yes** | **Yes** | Auth owner + Agent 13 + 14 |
| Conditional | Chat/UGC added without moderation/safety controls | P0 if activated | No | **Yes** | **Yes** | Multiplayer owner + Agent 13 + 14 |

---

## 18. Definition of done

DROPi Tycoon is **Google Play production ready** only when:

- all current P0 blockers are closed with evidence;
- Play Console account/package/signing state is verified without exposing secrets;
- the exact final production AAB is reproducible and attested;
- the app starts its bundled Phaser runtime without depending on the public Railway webpage;
- policy declarations match the exact binary/backend behavior;
- store material is compliant and truthful;
- required testing, including any account-specific closed-test production-access rule, is complete;
- owner physical Android landscape acceptance is recorded;
- Agent 13 legal/privacy gate and Agent 16 independent release audit are complete;
- the owner explicitly authorizes production publication.

Until then, use `NOT_PLAY_READY` as the canonical state.