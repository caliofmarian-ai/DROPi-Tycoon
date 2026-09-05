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

The dedicated EAS project is linked as `@caliofm/dropi-tycoon` with its own build history, credentials and Android package identity.

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

No replacement image generation is authorized unless the Project Owner changes the visual direction.

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

After the EAS project linkage and runtime environment variable are configured:

```bash
npx eas-cli@latest build --platform android --profile development
```

The `development` profile creates an internally distributed Android APK with `expo-dev-client`.

## Owner review target

Owner visual acceptance is performed in the installed Android application.

An installed-build review should confirm:

1. DROPi Tycoon installs as a separate application from the real DROPi app.
2. It opens without Chrome/browser chrome.
3. Gameplay is landscape-first and fills the app surface.
4. Phaser touch input works in the WebView bridge.
5. Android Back behavior is safe.
6. Existing economy, employees, reviews and save semantics are unchanged.
7. Camera fit/follow/pan/zoom are reviewed on the physical device.
8. App icon and loading identity match the owner-approved DROPi Tycoon brand.

## APK build ledger

Every distributed Android artifact must be recorded here after EAS creates it.

| Status | Date | Version | Android versionCode | Source commit | EAS build | Scope | Owner result |
|---|---|---|---:|---|---|---|---|
| Pre-canonical evaluation | 2026-09-05 | 0.1.0 | 1 | `9251702773c1684ad32d003f4d903ae0a5e283b6` | `02b85d59-1dfc-43cf-aea9-43643c0f89a8` | First installed Android evaluation shell; remote Phaser runtime; physical camera/UI review | Functional shell pass; visual hold; Android Back bug discovered |
| Planned — not built | — | 0.0.0 | EAS remote next value | — | — | First controlled APK under canonical semantic-version/release policy | Pending |

The next APK must not be generated merely because repository changes exist. It is created only when the owner-defined `0.0.0` validation scope is ready.
