# DROPi Tycoon Mobile

This directory is the native application shell for DROPi Tycoon.

It is intentionally separate from the real DROPi mobile application and from that application's Expo/EAS project.

## Product boundary

- `game-web/` remains the authoritative Phaser game runtime.
- `game-mobile/` hosts that runtime inside an installable Expo/React Native Android application.
- The first development stage loads the Phaser runtime from Railway through `react-native-webview`.
- The production target is to bundle the Phaser runtime with the installed game so ordinary startup does not depend on the public Railway page.

See `06_Technical/MOBILE_APPLICATION_PLATFORM.md` for the canonical platform contract.

## Expo/EAS isolation rule

**Do not link this directory to the existing real DROPi Expo project.**

Use the same Expo account if desired, but create a new EAS project dedicated to the game.

Expected identity:

- App name: `DROPi Tycoon`
- Expo slug: `dropi-tycoon`
- Android package: `com.dropi.tycoon`
- URL scheme: `dropitycoon`
- EAS project: `@caliofm/dropi-tycoon`
- EAS project ID: `972b831b-78d0-46ab-8cb8-2b13745a8df7`

The EAS project has its own build history, credentials, development clients, preview builds and production releases.

## Runtime configuration

The first-stage mobile shell does not hardcode the Railway URL in application code.

Copy `.env.example` to `.env` for local development, or configure the equivalent EAS environment variable:

```text
EXPO_PUBLIC_DROPITYCOON_GAME_URL=https://dropi-tycoon-production.up.railway.app/
```

The shell intentionally refuses to start the remote game if this variable is missing or not HTTPS.

## Approved installed-app identity

Owner-approved branding sources live under:

```text
assets/branding/
```

Current wiring:

- `dropi-tycoon-app-icon.png` is the Expo application icon source;
- `dropi-tycoon-logo.png` is used by the native loading/error surface;
- the approved portrait `dropi-tycoon-splash.jpg` remains preserved as a source/reference and is not blindly promoted to the landscape loading surface because its composition is portrait-oriented and includes future-token wording that requires a separate owner review before public runtime use.

No replacement image generation is authorized unless the Project Owner explicitly changes the visual direction.

## Canonical release versioning

Every controlled Android build uses numeric semantic versioning:

```text
MAJOR.MINOR.PATCH
```

The controlled mobile release line begins at `0.0.0`.

- PATCH (`0.0.1`, `0.0.2`, `0.1.1`) is used for bug fixes, local polish and compatibility corrections that do not materially expand the player's capabilities.
- MINOR (`0.1.0`, `0.2.0`, `0.3.0`) is used for meaningful new gameplay, systems, product-experience or visual/audio capability.
- MAJOR (`1.0.0`, `2.0.0`) is reserved for major product maturity or compatibility transitions. `1.0.0` is the first fully promoted public release line, not merely the first internal APK.

`app.json` `expo.version` and `package.json` `version` must always match. CI enforces this rule.

Android `versionCode` is separate from the semantic version. EAS owns it remotely and `autoIncrement: true` is required for every build profile so every APK/AAB receives a monotonically increasing Android build number.

The semantic version must be deliberately advanced before a new controlled APK when the release scope requires it. `versionCode` must never be manually reset or reused.

Before any EAS build, a committed dependency lockfile is required. Do not use `EAS_BUILD_SKIP_LOCKFILE_CHECK=1` as the normal release path.

The canonical development-process rule is owned by `09_Development/PROTOTYPE_BUILD_PIPELINE.md`.

## Mobile APK release ledger

This ledger records actual EAS Android build artifacts, not every repository merge.

| Release | Android versionCode | Date | Source commit | EAS build | Status | Scope / evidence |
|---|---:|---|---|---|---|---|
| Pre-canonical evaluation build (legacy metadata `0.1.0`) | 1 | 2026-09-05 | `9251702773c1684ad32d003f4d903ae0a5e283b6` | `02b85d59-1dfc-43cf-aea9-43643c0f89a8` | Installed / owner evaluated | First installed Android APK. Confirmed direct app launch, landscape shell, Phaser touch/gameplay, economy/employees/reviews. Exposed Android Back navigation defect later fixed by PR #302. Retained for history but not part of the controlled SemVer release line. |
| `0.0.0` | next remote value after 1 | Pending | Pending | Pending | Planned | First controlled APK after canonical versioning. Must include a committed lockfile and a release-scope entry before build submission. |

For every future APK/AAB, add one row with:

1. semantic version;
2. Android versionCode;
3. date;
4. exact source commit;
5. EAS build ID or build URL;
6. release scope;
7. owner validation result and any discovered defects.

## Development build

Install dependencies:

```bash
npm install
```

Validate the shell:

```bash
npm run version:validate
npm run typecheck
npm run doctor
```

After the EAS project is linked and the runtime environment variable is configured:

```bash
npx eas-cli@latest build --platform android --profile development
```

The `development` profile creates an internally distributed Android APK with `expo-dev-client`.

Do not submit a build solely because code was merged. A build is created only when a defined release scope is ready for physical-device owner review.

## Owner review target

Owner visual acceptance is performed on the installed Android build, not Chrome.

Every installed-build review must confirm the release-specific scope plus the standing platform regression checks:

1. DROPi Tycoon installs as a separate application from the real DROPi app.
2. It opens without Chrome/browser chrome.
3. Gameplay is landscape-first and fills the app surface.
4. Phaser touch input works in the WebView bridge.
5. Android Back behavior is safe.
6. Existing economy, employees, reviews and save semantics remain valid unless intentionally changed by the release.
7. Camera fit/follow/pan/zoom remains usable on the physical device.
8. The tested semantic version and Android versionCode are recorded in this ledger.
9. App icon and loading identity match the owner-approved DROPi Tycoon brand when those native surfaces are part of the release scope.
