# Issue #569 — Current Release Data-Flow Inventory

Status: CURRENT-SOURCE EVIDENCE — FINAL AAB / NETWORK REVALIDATION REQUIRED
Date: 2026-09-09
Baseline: `647adfe31e38c47ad73e3a4e98ece70407ffa28c`
Owner lane: DT-13 Legal / Privacy / IP
Coordinates: #560, #562, #564, #568, #569, #571

## Purpose

Record what the current Android production source actually accesses, stores, transmits, shares, retains and deletes before Google Play declarations are completed.

This is engineering/compliance evidence, not a legal opinion and not a Play Console submission. Final declaration truth must be revalidated against the exact signed AAB from #568 because native dependency resolution, manifest merging and SDK behavior can differ from source-level assumptions.

## Release artifact boundary

The audited production profile is `game-mobile/eas.json -> build.production`:

- Android `app-bundle`;
- `EXPO_PUBLIC_DROPITYCOON_RUNTIME_MODE=bundled`;
- no production `developmentClient: true` setting;
- Phaser/Vite runtime packaged into the application by #567/#590;
- local runtime served from `http://127.0.0.1:17831` by `game-mobile/src/bundledRuntime.ts`;
- bundled WebView navigation limited to that local origin in `game-mobile/App.tsx`.

Development and preview APK profiles intentionally use the remote runtime and are **not** the production Data Safety baseline.

## Executive finding

At this source baseline, the production Android client is designed to keep ordinary gameplay state on the device and no implemented client path was found that sends account/profile/gameplay data to DROPi Tycoon servers or third-party analytics/advertising services.

The proposed Google Play Data Safety answer can therefore start from **no user data collected or shared**, but only as a conditional proposal until #568 provides final-AAB permission/SDK evidence and a release-network inspection confirms that included native SDKs do not transmit user data automatically.

## 1. Android shell / local runtime flow

### Installed assets

`game-mobile/src/bundledRuntime.ts` copies packaged Phaser runtime assets into the app document directory and serves them through a loopback-only static server bound to `127.0.0.1:17831`.

Data involved:

- packaged HTML/JavaScript/CSS/data/assets;
- bundled runtime manifest;
- copied runtime files in app-private document storage.

Destination: same device.

Off-device transmission: **NO**.

User data: **NO**; these are application files.

### WebView

Production bundled mode allows the local runtime origin and denies file-URL universal access. `domStorageEnabled` is enabled so the Phaser runtime can use browser-local storage.

The local HTTP loopback connection is an intra-device implementation detail. It is not a transmission to DROPi Tycoon, Railway or another third party.

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

The current `SaveGameV2` does **not** serialize `worldIdentity`; the open #566 persistence work may change the save shape later and therefore invalidates this snapshot when merged.

Storage location: WebView/application-local storage on the device.

Off-device transmission found: **NO**.

Retention: until overwritten by game save behavior, app storage is cleared, or the app is uninstalled, subject to Android/WebView storage behavior.

Deletion today: there is no production online account to delete. Local application data can be removed through operating-system app-data controls/uninstall. Any future in-app erase-all function must be reflected here and in the Privacy Policy.

## 3. Local World Instance / account / hero identity

`game-web/src/types/worldIdentity.ts` defines:

- `worldInstanceId`;
- `accountId`;
- `heroActorId`;
- baseline/map dataset versions;
- local identity mode.

`game-web/src/systems/worldIdentitySystem.ts` currently initializes fixed local/offline identifiers such as `acct_local_primary_v1` and derives the hero actor ID deterministically. The source explicitly states that the fingerprint is local/offline only and is never authentication proof.

Current behavior:

- no email address;
- no phone number;
- no password;
- no user-entered username;
- no OAuth/social sign-in;
- no production authentication;
- no account creation UI;
- no client call to `/api/authority/*` was found under `game-web/src`.

Classification: **game-local technical identity, not a production online user account**.

Off-device transmission found: **NO**.

## 4. Map / locality requests

The two explicit `fetch(...)` implementations found in `game-web/src` load relative game-data URLs:

- `game-web/src/world/expandedLocalityCatalog.ts` loads `data/expanded-localities-v1/...`;
- `game-web/src/scenes/GlobalMapScene.ts` loads a build-generated relative regional catalog URL such as `data/<country>-regional-localities-v1.json`.

`game-web/vite.config.ts` constructs those regional URLs as relative `data/...` paths.

In the production bundled Android runtime, those requests resolve against `127.0.0.1:17831` and remain on-device.

They do not request device geolocation and do not transmit the player's physical location.

## 5. Railway / server authority

`game-web/server/server.mjs` still hosts the web build and the prototype `/api/authority/*` surface for web/server development.

Important boundary:

- endpoint existence is not evidence that the production Android client calls it;
- no `/api/authority` client reference was found under `game-web/src` at this baseline;
- production Android startup no longer loads the public Railway webpage because #567/#590 made the Phaser runtime authoritative inside the installed app.

The server application code does not explicitly log requester IP address, User-Agent, request headers or request body. It logs startup/shutdown and selected authority-store mode.

**Provider-level infrastructure logging is not established by repository source.** Railway/reverse-proxy operational metadata, retention and processor terms must be reviewed before any production client begins contacting the hosted backend. If future app traffic reaches Railway, IP address and request metadata can become Data Safety/privacy-relevant even if application code does not call `console.log(request.socket.remoteAddress)`.

## 6. Analytics

Source/runtime search finding: **NOT IMPLEMENTED / NOT FOUND**.

No Google Analytics, Firebase Analytics, Amplitude, Mixpanel or equivalent application analytics SDK/configuration was found in current release source/dependency declarations.

No gameplay telemetry endpoint was found.

Data transmitted for analytics: **NONE FOUND**.

Final AAB verification required: **YES**.

## 7. Advertising

Source/runtime search finding: **NOT IMPLEMENTED / NOT FOUND**.

No AdMob or other ads SDK is declared in `game-mobile/package.json`; no advertising implementation was found in release source.

Advertising ID access: **NOT DECLARED / NOT FOUND IN SOURCE**.

Ads served by current release: **NO, based on source**.

Final AAB / manifest verification required: **YES**.

## 8. Real-money purchases / subscriptions

Source/runtime search finding: **NOT IMPLEMENTED / NOT FOUND**.

No Google Play Billing dependency or real-money purchase client was found. Current gameplay purchases use fictional/virtual company money inside the simulation and are not real-world transactions.

Payment information collected by the app: **NONE FOUND**.

Real-money purchase history collected by the app: **NONE FOUND**.

Future implementation of the V1 commercial catalog or Play Billing invalidates this evidence snapshot and requires a new #569 audit before submission.

## 9. Chat, multiplayer messaging and UGC

Source/runtime finding: **NOT ACTIVE IN CURRENT RELEASE**.

The repository contains future architecture/issues for multiplayer/chat/UGC, but no current production client chat/UGC implementation was found.

Current release therefore has:

- no player-to-player chat;
- no public posts;
- no uploaded player images/content;
- no report/block/moderation flow because there is no active UGC surface.

#564 remains the mandatory gate before public chat/UGC is enabled.

## 10. Crash, diagnostics and error telemetry

Source/runtime search finding: **NO APPLICATION CRASH/ERROR TELEMETRY SDK OR ENDPOINT FOUND**.

The app displays local startup/load errors to the user. No Sentry/Firebase Crashlytics-equivalent integration was found in current source.

This does not prove that the final platform binary contains no provider/runtime diagnostics. #568 must inspect the resolved production AAB and relevant SDK provider documentation before the Data Safety form is finalized.

## 11. Support / contact data

No in-app support form, support backend or declared privacy/support email was found in current release source.

The application therefore does not currently collect support-message data itself.

A public privacy point of contact is nevertheless required for the Google Play privacy policy.

**OWNER INPUT REQUIRED — privacy/support contact mechanism.**

If email/web support is added, the provider, data categories, purpose, lawful basis where applicable, retention and deletion process must be added to this inventory.

## 12. Permissions / device data

`game-mobile/app.json` declares no explicit Android runtime permission list. The shell uses landscape/orientation, local filesystem for packaged runtime preparation, local loopback serving and WebView.

Source evidence alone is insufficient to determine the final merged Android manifest because native libraries can contribute permissions during build.

#568 / DT-14 must provide the final AAB permission inventory. Until that exists, do not make a final Play permissions declaration and do not claim that the binary requests zero permissions.

## 13. Direct mobile runtime libraries

Current declared mobile runtime dependencies:

- `@dr.pogodin/react-native-fs` 2.40.1;
- `@dr.pogodin/react-native-static-server` 0.27.1;
- Expo 57 runtime packages;
- `react` / `react-native`;
- `react-native-webview`.

No ads, analytics, Play Billing or application crash-reporting SDK is declared directly.

**SDK behavior rule:** package-name review is not enough for Data Safety. Before submission, use the resolved production dependency graph / Play SDK Index where applicable and network-observe the exact AAB. Any automatic off-device SDK transmission must be disclosed even when DROPi Tycoon application code never calls it directly.

## 14. Current data-flow matrix

| Data / behavior | Accessed or created? | Stored on device? | Transmitted off device by current source? | Shared with third party by current source? | Retention / deletion | Confidence |
|---|---|---|---|---|---|---|
| Game save/progression | Yes | Yes | No path found | No | Local app/WebView storage; clear app data/uninstall or overwrite | High |
| Local world/account/hero technical IDs | Yes | In live state; current Save v2 does not persist them | No path found | No | Process/session unless later persistence changes | High |
| Physical device location | No permission/API found | No | No | No | N/A | High source-level |
| Email/phone/password | No current account UI | No | No | No | N/A | High |
| Player chat/messages/UGC | No | No | No | No | N/A | High |
| Ads / Advertising ID | No implementation found | No app use found | No | No | N/A | High source-level; AAB verify |
| Analytics/app activity telemetry | No implementation found | No telemetry store found | No | No | N/A | High source-level; AAB verify |
| Crash/error telemetry | No application telemetry implementation found | Local UI error only | No app path found | No | N/A | Medium-high; AAB/SDK verify |
| Real-money purchase/payment data | No | No | No | No | N/A | High |
| Relative map/catalog reads | Yes | Bundled/cached locally | No; loopback/local asset | No | App bundle/cache/storage lifecycle | High |
| Railway authority prototype | Server exists | Server may hold prototype state when separately used | Current Android client call not found | Provider processing not applicable to current Android flow | Review before activation | High for no client wiring |
| Hosting access logs/IP | Not controlled by app source | Provider-dependent | Current Android app does not contact Railway in normal bundled path | Provider-dependent | **PROVIDER REVIEW REQUIRED before backend activation** | Medium |
| Support/contact submissions | No support channel in app | No | No | No | **OWNER INPUT REQUIRED if support channel added** | High |

## 15. Changes that invalidate this snapshot

Repeat the audit before Play submission if any of the following merge or activate:

- #560 authenticated/public profile authority;
- #562 production account lifecycle/deletion;
- #564 multiplayer/chat/UGC;
- #566 changes to persisted save/world identity fields;
- #568 final AAB changes native SDKs or permissions;
- real-money monetization, Play Billing, subscriptions or ads;
- analytics/crash reporting;
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

## Official Play reference

Google Play defines collection for Data Safety as transmission of data from the app off the user's device and requires developers to include transmission by libraries/SDKs. On-device-only access does not need to be declared as collection when the data is never transmitted off device:

https://support.google.com/googleplay/android-developer/answer/10787469
