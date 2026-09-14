# Issue #569 — Current Release Data-Flow Inventory

Status: SCOPED SENTRY SOURCE UPDATE — FINAL AAB / NETWORK REVALIDATION REQUIRED
Date: 2026-09-14
Original Android baseline: `647adfe31e38c47ad73e3a4e98ece70407ffa28c`
Sentry source baseline: PR #733, implementation `32b855a5fa4bdb3a167e45dbe6006b60d93c1d60`; Docker build-argument correction `906c75a361bad794714a680a500ae651f5a341b7`.
Owner lane: DT-13 Legal / Privacy / IP
Coordinates: #560, #562, #564, #568, #569, #571, #732, #733, #734, #735

## Purpose and evidence scope

Record application data flows before Google Play declarations are completed. The 2026-09-14 update reconciles Sentry browser diagnostics only; unchanged Android/gameplay findings below retain their original baseline and are not a new full-release audit.

This is engineering/compliance evidence, not a legal opinion, external legal approval or a Play Console submission. Final declaration truth must be revalidated against the exact signed AAB from #568 because native dependency resolution, manifest merging, build variables and SDK behavior can differ from source-level assumptions.

## Release artifact boundary

The original audited production profile is `game-mobile/eas.json -> build.production`:

- Android `app-bundle`;
- `EXPO_PUBLIC_DROPITYCOON_RUNTIME_MODE=bundled`;
- no production `developmentClient: true` setting;
- Phaser/Vite runtime packaged into the application by #567/#590;
- local runtime served from `http://127.0.0.1:17831` by `game-mobile/src/bundledRuntime.ts`;
- bundled WebView navigation limited to that local origin in `game-mobile/App.tsx`.

Development and preview APK profiles intentionally use the remote runtime and are **not** the production Data Safety baseline. Hosted `game-web` and an Android-bundled web build are separate artifacts. A Railway variable does not establish an EAS build variable or final-AAB behavior.

## Executive finding

The original Android baseline was designed to keep ordinary gameplay state on-device. That historical finding must not be generalized into a claim that current hosted DROPi Tycoon has no off-device diagnostics.

PR #733 adds `@sentry/browser` to shared web source. With a non-empty DSN included at Vite build time, the hosted browser runtime initializes Sentry before Phaser and can send diagnostic/error data off-device to Sentry. With no DSN or a whitespace-only DSN, the application does not initialize this SDK.

**Do not publish a final "no user data collected or shared" declaration from this document.** Android production remains subject to exact-AAB dependency, build-variable and network evidence. Sentry project settings, IP handling, retention and processor arrangements remain unverified where explicitly marked below. This scoped source reconciliation does not certify service-wide legal compliance or Google Play readiness.

## 1. Android shell / local runtime flow

### Installed assets

`game-mobile/src/bundledRuntime.ts` copies packaged Phaser runtime assets into the app document directory and serves them through a loopback-only static server bound to `127.0.0.1:17831`.

Data involved:

- packaged HTML/JavaScript/CSS/data/assets;
- bundled runtime manifest;
- copied runtime files in app-private document storage.

Destination: same device.

Off-device transmission by this asset-copy flow: **NO**.

User data: **NO**; these are application files. Other SDK flows must be assessed separately.

### WebView

Production bundled mode allows the local runtime origin and denies file-URL universal access. `domStorageEnabled` is enabled so the Phaser runtime can use browser-local storage.

The local HTTP loopback connection is an intra-device implementation detail. It is not a transmission to DROPi Tycoon, Railway or another third party. Navigation restrictions alone are not evidence that all SDK network requests are blocked.

## 2. Local game save

`game-web/src/persistence/browserSaveStorage.ts` uses `window.localStorage` when available.

Current Save v2 key families include:

- `dropi.tycoon.save.v2`;
- `dropi.tycoon.save.staging.v2`;
- `dropi.tycoon.save.corrupted-backup.v2` when repair/replacement requires a backup.

Current Save v2 may contain game-only state including:

- company name and fictional company progression;
- virtual company money, level and reputation;
- fictional employee IDs, names, roles, salaries and status;
- payroll and virtual financial totals;
- customer review/order identifiers and game-generated review text;
- purchased game upgrades;
- owned vehicle IDs/types/employee assignments;
- HQ construction/unlock state;
- tutorial and sound settings;
- merchant onboarding and selected transport;
- fictional personal capability/progression state;
- ownership/economy simulation state.

At the original baseline, `SaveGameV2` does **not** serialize `worldIdentity`; #566 persistence changes invalidate that finding when merged.

Storage location: WebView/application-local storage on the device.

Off-device transmission by the save implementation found: **NO**. This does not exclude diagnostic context captured by a separately initialized SDK.

Retention: until overwritten by game save behavior, app storage is cleared, or the app is uninstalled, subject to Android/WebView storage behavior.

Deletion at the original baseline: there is no production online account to delete. Local application data can be removed through operating-system app-data controls/uninstall. Any future in-app erase-all function must be reflected here and in the Privacy Policy.

## 3. Local World Instance / account / hero identity

`game-web/src/types/worldIdentity.ts` defines:

- `worldInstanceId`;
- `accountId`;
- `heroActorId`;
- baseline/map dataset versions;
- local identity mode.

`game-web/src/systems/worldIdentitySystem.ts` initializes fixed local/offline identifiers such as `acct_local_primary_v1` and derives the hero actor ID deterministically. The source explicitly states that the fingerprint is local/offline only and is never authentication proof.

Original baseline behavior:

- no email address;
- no phone number;
- no password;
- no user-entered username;
- no OAuth/social sign-in;
- no production authentication;
- no account creation UI;
- no client call to `/api/authority/*` was found under `game-web/src`.

Classification: **game-local technical identity, not a production online user account**.

Off-device transmission by the identity implementation found: **NO**.

## 4. Map / locality requests

The two explicit `fetch(...)` implementations found in the original `game-web/src` baseline load relative game-data URLs:

- `game-web/src/world/expandedLocalityCatalog.ts` loads `data/expanded-localities-v1/...`;
- `game-web/src/scenes/GlobalMapScene.ts` loads a build-generated relative regional catalog URL such as `data/<country>-regional-localities-v1.json`.

`game-web/vite.config.ts` constructs those regional URLs as relative `data/...` paths.

In the production bundled Android runtime, those requests resolve against `127.0.0.1:17831` and remain on-device. They do not request device geolocation and do not transmit the player's physical location.

This explicit-fetch inventory is not an exhaustive SDK network inventory after #733. Sentry's default integrations may attach request/navigation breadcrumbs to diagnostics.

## 5. Railway / server authority

`game-web/server/server.mjs` hosts the web build and the prototype `/api/authority/*` surface for web/server development.

Important boundary:

- endpoint existence is not evidence that the production Android client calls it;
- no `/api/authority` client reference was found under `game-web/src` at the original baseline;
- production Android startup no longer loads the public Railway webpage because #567/#590 made the Phaser runtime authoritative inside the installed app;
- hosted browsers do contact Railway and may additionally contact Sentry when the hosted build includes a DSN.

The server application code at the original baseline does not explicitly log requester IP address, User-Agent, request headers or request body. It logs startup/shutdown and selected authority-store mode.

**Provider-level infrastructure logging is not established by repository source.** Railway/reverse-proxy operational metadata, retention and processor terms require review for hosted use. IP address and request metadata can become privacy-relevant even if application code does not log them explicitly.

## 6. Analytics

No Google Analytics, Firebase Analytics, Amplitude, Mixpanel or equivalent gameplay/product analytics SDK/configuration was found at the original baseline. No dedicated gameplay telemetry endpoint was found.

Sentry error/diagnostic processing is addressed in section 10 and must not be hidden behind a "no analytics" statement. Default SDK diagnostic/session/breadcrumb behavior must be included in final network validation; `tracesSampleRate=0` is not proof of zero network traffic.

Final AAB verification required: **YES**.

## 7. Advertising

Original source/runtime search finding: **NOT IMPLEMENTED / NOT FOUND**.

No AdMob or other ads SDK is declared in the audited `game-mobile/package.json`; no advertising implementation was found in release source.

Advertising ID access: **NOT DECLARED / NOT FOUND IN SOURCE**.

Ads served by the audited release: **NO, based on source**.

Final AAB / manifest verification required: **YES**.

## 8. Real-money purchases / subscriptions

Original source/runtime search finding: **NOT IMPLEMENTED / NOT FOUND**.

No Google Play Billing dependency or real-money purchase client was found. Gameplay purchases use fictional/virtual company money inside the simulation and are not real-world transactions.

Payment information collected by the app: **NONE FOUND**.

Real-money purchase history collected by the app: **NONE FOUND**.

Future implementation of the V1 commercial catalog or Play Billing invalidates this evidence snapshot and requires a new #569 audit before submission.

## 9. Chat, multiplayer messaging and UGC

Original source/runtime finding: **NOT ACTIVE IN CURRENT RELEASE**.

The repository contains future architecture/issues for multiplayer/chat/UGC, but no production client chat/UGC implementation was found at the original baseline:

- no player-to-player chat;
- no public posts;
- no uploaded player images/content;
- no report/block/moderation flow because there is no active UGC surface.

#564 remains the mandatory gate before public chat/UGC is enabled.

## 10. Crash, diagnostics and error telemetry — Sentry update #734

Source finding: **IMPLEMENTED CONDITIONALLY IN PR #733; DEPLOYMENT AND EVENT RECEIPT REQUIRE SEPARATE EVIDENCE**.

### Activation and destination

`game-web/src/main.ts` calls `initBrowserObservability()` before Phaser startup. `game-web/src/observability/sentry.ts` obtains `import.meta.env.VITE_SENTRY_DSN` and `MODE`; `buildSentryConfig()` returns null for an absent/blank DSN. Otherwise it initializes `@sentry/browser` and sets `dropi.runtime=game-web`.

Vite embeds this public ingestion DSN at build time. Railway's Docker build must declare `ARG VITE_SENTRY_DSN` in the builder stage. Runtime variable-name presence alone is not proof of an enabled deployed browser client. `SENTRY_AUTH_TOKEN` is server-side administrative/API authentication material and must never enter a browser bundle, public artifact or log.

Destination with DSN enabled: the Sentry ingestion project addressed by that DSN. This is **off-device diagnostics/error processing by a third-party service**, not on-device-only storage. Actual org/project mapping must be verified; an onboarding email for another platform/project is not connection evidence.

### Data categories and limits of evidence

Supported diagnostic categories include exception/error type and message, stack traces/source locations, runtime/browser context, environment and application tags. SDK default integrations can add request URL/referrer/User-Agent context and console, navigation, DOM or network breadcrumbs. Diagnostic text or URLs can contain personal information even without an application `setUser()` call. Actual emitted categories and effective scrubbing must be checked against a captured event; do not claim this list is an observed production payload.

Enforced source options: `sendDefaultPii=false`, `tracesSampleRate=0`. The application does not explicitly activate Session Replay, profiling, feedback UI, performance tracing or an Android-native Sentry SDK. Transitive replay/feedback packages in the npm lockfile do not prove those products are enabled.

**`sendDefaultPii=false` does not prove all telemetry is anonymous or scrubbed.** IP-address handling is **UNKNOWN** until project/organization `scrubIPAddresses`, `dataScrubber`, `dataScrubberDefaults` and relevant scrubbing rules, or captured-event evidence, establish effective behavior. Sentry service-region, retention, deletion arrangements, processor terms and any required privacy notice/lawful-basis assessment are **NOT VERIFIED by this source audit**. No external legal approval is asserted.

### Android separation and release gate

A Railway DSN does not prove an EAS-produced bundled runtime contains that DSN. Conversely, local-origin navigation restrictions do not prove SDK requests cannot leave the device. Final Android SDK/dependency, embedded-config, manifest and network inspection remain mandatory. Play Data Safety answers remain provisional; do not declare final no-collection/no-sharing or release readiness from the hosted browser check.

### Controlled verification boundary

One synthetic error may be generated in an isolated browser session of the deployed application for owner-authorized verification, using a unique marker without player data. Record deployment SHA, UTC timestamp, event ID, project and expected `production` / `dropi.runtime=game-web` metadata. A browser transport response and a subsequent authenticated Sentry event lookup are distinct evidence. Never emit or print credentials, real player payloads, arbitrary event bodies or raw network logs. Server-side verification uses existing runtime credentials only for bounded read-only Sentry API requests; it does not create a public diagnostics endpoint or modify Sentry settings.

## 11. Support / contact data

No in-app support form, support backend or declared privacy/support email was found in the original release source. The application does not collect support-message data through such a channel at that baseline.

A public privacy point of contact is nevertheless required for the Google Play privacy policy.

**OWNER INPUT REQUIRED — privacy/support contact mechanism.**

If email/web support is added, the provider, data categories, purpose, lawful basis where applicable, retention and deletion process must be added to this inventory.

## 12. Permissions / device data

The audited `game-mobile/app.json` declares no explicit Android runtime permission list. The shell uses landscape/orientation, local filesystem for packaged runtime preparation, local loopback serving and WebView.

Source evidence alone is insufficient to determine the final merged Android manifest because native libraries can contribute permissions during build.

#568 / DT-14 must provide the final AAB permission inventory. Until that exists, do not make a final Play permissions declaration and do not claim that the binary requests zero permissions.

## 13. Direct mobile runtime libraries

Originally audited mobile runtime dependencies:

- `@dr.pogodin/react-native-fs` 2.40.1;
- `@dr.pogodin/react-native-static-server` 0.27.1;
- Expo 57 runtime packages;
- `react` / `react-native`;
- `react-native-webview`.

No ads, analytics, Play Billing or native application crash-reporting SDK was declared directly at that baseline. PR #733 adds a **web JavaScript SDK**, which must also be assessed if present inside an Android web bundle.

**SDK behavior rule:** package-name review is not enough for Data Safety. Before submission, use the resolved production dependency graph / Play SDK Index where applicable and network-observe the exact AAB. Any automatic off-device SDK transmission must be assessed even when DROPi Tycoon application code never calls it directly.

## 14. Data-flow matrix

Unchanged rows retain the original Android baseline, not a full 2026-09-14 re-audit.

| Data / behavior | Accessed or created? | Stored on device? | Off-device transmission | Third-party processing | Retention / deletion | Confidence |
|---|---|---|---|---|---|---|
| Game save/progression | Yes | Yes | No save-upload path found | No direct save flow found | Local storage; clear app data/uninstall or overwrite | Original source baseline |
| Local world/account/hero technical IDs | Yes | In live state; original Save v2 does not persist them | No direct path found | No direct flow found | Process/session unless persistence changes | Original source baseline |
| Physical device location | No permission/API found | No | No direct path found | No direct flow found | N/A | Source-level only |
| Email/phone/password | No current account UI at baseline | No | No account path found | No account flow found | N/A | Original source baseline |
| Player chat/messages/UGC | No | No | No | No | N/A | Original source baseline |
| Ads / Advertising ID | No implementation found | No app use found | No ads flow found | No ads flow found | N/A | AAB verification required |
| Gameplay/product analytics | No dedicated implementation found | No telemetry store found | Separate Sentry diagnostics below | Separate Sentry diagnostics below | N/A | AAB/network verification required |
| Sentry browser crash/diagnostics | Conditional on build-time DSN | SDK transient state possible | YES when enabled; receipt not yet established by source | Sentry ingestion project; mapping verify | Provider retention/deletion UNKNOWN | Source verified; deployed event and scrubbing UNKNOWN |
| Android-bundled Sentry behavior | Shared web dependency exists | Depends on final web bundle | UNKNOWN until exact-AAB/network check | UNKNOWN until exact-AAB/network check | UNKNOWN | Railway config is not EAS/AAB evidence |
| Real-money purchase/payment data | No implementation found | No | No payment flow found | No payment flow found | N/A | Original source baseline |
| Relative map/catalog reads | Yes | Bundled/cached locally | Loopback/local asset in bundled Android; hosted requests use hosting | Hosted provider processing possible | App bundle/cache/storage lifecycle | Artifact-dependent |
| Railway authority prototype | Server exists | Server may hold prototype state when separately used | Original Android client call not found | Provider-dependent when contacted | Review before activation | Original client-wiring baseline |
| Hosting access logs/IP | Not established by app source | Provider-dependent | Hosted browsers contact hosting; bundled normal path differs | Provider-dependent | PROVIDER REVIEW REQUIRED | UNKNOWN provider settings |
| Support/contact submissions | No support channel in audited app | No | No support flow found | No support flow found | OWNER INPUT REQUIRED if added | Original source baseline |

## 15. Changes that invalidate this snapshot

Repeat the audit before Play submission if any of the following merge or activate:

- #560 authenticated/public profile authority;
- #562 production account lifecycle/deletion;
- #564 multiplayer/chat/UGC;
- #566 changes to persisted save/world identity fields;
- #568 final AAB changes native SDKs or permissions;
- real-money monetization, Play Billing, subscriptions or ads;
- analytics/crash reporting configuration, SDK defaults, DSN or scrubbing changes beyond the scoped #733 source update;
- push notifications;
- cloud saves;
- remote config;
- support/contact forms;
- external media/upload features;
- any new backend call from production Android.

## Evidence paths

- `game-mobile/eas.json`
- `game-mobile/App.tsx`
- `game-mobile/src/bundledRuntime.ts`
- `game-mobile/app.json`
- `game-mobile/package.json`
- `game-web/src/persistence/browserSaveStorage.ts`
- `game-web/src/persistence/saveSystem.ts`
- `game-web/src/types/game.ts`
- `game-web/src/types/worldIdentity.ts`
- `game-web/src/systems/worldIdentitySystem.ts`
- `game-web/src/world/expandedLocalityCatalog.ts`
- `game-web/src/scenes/GlobalMapScene.ts`
- `game-web/src/world/regionalMapCatalog.ts`
- `game-web/vite.config.ts`
- `game-web/server/server.mjs`
- `game-web/src/observability/sentry.ts`
- `game-web/src/observability/sentryConfig.ts`
- `game-web/tests/sentry-config.test.ts`
- `game-web/Dockerfile`
- `game-web/public/legal/dependency-license-inventory.json`
- `game-web/public/legal/third-party-notices.html`

## Official references

Google Play Data Safety (SDK/off-device transmission and exact-artifact assessment):
https://support.google.com/googleplay/android-developer/answer/10787469

Sentry project/organization scrubbing controls and event schema:
https://docs.sentry.io/api/projects/update-a-project/
https://docs.sentry.io/api/organizations/update-an-organization/
https://docs.sentry.io/api/events/retrieve-an-event-for-a-project/

Railway Docker build-time arguments:
https://docs.railway.com/builds/dockerfiles
