# Android Bundled Phaser Runtime

**Owner:** DT-14 — Google Play / Android Release
**Issue:** #567
**Baseline:** `65413103c7ae4e1951ac63aacc8e1232643e0bd0`
**Status:** implemented in source; production AAB and physical Android acceptance remain required

## Purpose

The production Android application must start the authoritative Phaser runtime from files packaged inside the installed application. The public Railway webpage is not the production game document.

Phaser remains the only gameplay runtime. React Native / Expo remains the Android shell. Railway may continue to host separately authorized backend/API services, but loss of Railway or general network connectivity must not prevent the packaged game document and static gameplay assets from loading.

## Profile contract

| EAS profile | Runtime mode | Game document |
|---|---|---|
| `development` | `remote` | HTTPS URL from `EXPO_PUBLIC_DROPITYCOON_GAME_URL` |
| `preview` | `remote` | HTTPS URL from `EXPO_PUBLIC_DROPITYCOON_GAME_URL` |
| `production` | `bundled` | app-packaged Phaser build served on fixed loopback origin |

`production` intentionally does not define `EXPO_PUBLIC_DROPITYCOON_GAME_URL` in `eas.json`. Even if a legacy account-level environment variable remains present, bundled mode ignores it as a game-document source.

## Build path

Production mobile dependency installation runs `game-mobile/scripts/prepare-bundled-runtime.mjs` before Expo prebuild:

1. require the canonical `game-web/package-lock.json`;
2. run `npm ci` in `game-web`;
3. run the ordinary authoritative Phaser `npm run build`;
4. verify required runtime outputs;
5. hash the complete `game-web/dist` payload and write `dropi-runtime-manifest.json`;
6. during Expo prebuild, `withBundledPhaserRuntime` copies that exact dist into `android/app/src/main/assets/dropi-game`;
7. Gradle/EAS then packages those files into the Android binary.

No second Phaser source tree is introduced and generated `game-web/dist` remains a build artifact rather than committed source.

## Android runtime path

Android WebView `file://` loading is not used. Phaser loads JSON, images and other runtime resources using normal browser URL behavior, and Android security guidance discourages relaxing file-origin access.

Instead:

1. the app reads the packaged runtime manifest from Android assets;
2. if the matching payload is not already installed in the app-private document directory, `copyFileAssets()` copies `dropi-game` there;
3. an embedded static server binds only to `127.0.0.1:17831`;
4. the WebView loads `http://127.0.0.1:17831/index.html`;
5. the WebView navigation allowlist permits only that exact loopback origin in bundled mode.

The port is deliberately fixed. Web Storage, including the current browser-local Save system, is origin-scoped; changing the port on every launch would create a different origin and make existing local progress appear missing.

The runtime manifest prevents unnecessary full asset extraction on every cold start while ensuring an app update with a different bundled payload replaces stale extracted files.

## Network security

Production prebuild writes an Android Network Security Configuration with:

- cleartext disabled by default;
- cleartext enabled only for `127.0.0.1`;
- no non-local static-server binding;
- no production remote-game fallback;
- WebView file access disabled;
- WebView mixed-content mode set to `never`.

Development and preview retain the existing HTTPS-only remote bridge and do not need the bundled-loopback native modification.

## Backend boundary

The current submitted gameplay source does not consume `/api/authority/*` from the browser runtime. The authority prototype remains separately governed and must not be silently treated as authenticated production backend state.

When a production backend becomes active, its client configuration must use an explicit authenticated HTTPS backend origin. It must not depend on relative `/api/*` paths that would resolve to the local static game server.

## Failure semantics

The native shell differentiates two startup classes:

- **bundled asset/server failure:** reports that the installed Phaser runtime could not start/load and explicitly identifies it as local app-asset failure rather than Railway/network outage;
- **remote development/preview failure:** reports a remote runtime/network/configuration failure.

There is no production fallback from bundled mode to the public Railway webpage.

## Validation gates

Repository validation must prove:

- production mode is `bundled` and development/preview are `remote`;
- production profile contains no remote game-document URL;
- native dependencies are pinned;
- config plugin is registered and only executes in bundled mode;
- local server remains loopback-only on the stable port;
- Android cleartext is limited to loopback;
- WebView bundled navigation is origin-restricted;
- Mobile Shell CI typecheck/Expo Doctor/config validation remains green.

#568 still owns the final reproducible AAB attestation, including native ABI, 64-bit, 16 KB page-size compatibility, merged manifest/permissions, package/version/signing and artifact hash. The new embedded native server/filesystem dependencies are explicitly part of that attestation surface.

## Owner Android acceptance still required

Do not mark #567 `ANDROID_VERIFIED` from CI alone. Test the Play/EAS-built candidate on physical Android landscape:

1. disable Wi-Fi/mobile data before launch and confirm the main menu/game assets still load;
2. start/continue a game, create a save, fully close the app, reopen it and confirm the same save remains visible;
3. confirm touch, drag, pinch/zoom and Android Back still behave correctly;
4. background and resume the app and confirm the local runtime returns without a blank WebView;
5. restore network and confirm ordinary play is unchanged;
6. where a real backend feature is later enabled, test backend loss separately from local asset startup.

Until that physical candidate test and #568 artifact validation are complete, #567 is implementation-complete in source but not release-accepted.
