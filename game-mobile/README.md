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

The new EAS project will receive its own EAS Project ID, build history, credentials, development clients, preview builds and production releases.

## First account-link step

From `game-mobile/`, after dependencies are installed and the Expo account is authenticated:

```bash
npx eas-cli@latest init
```

When EAS asks what to link, create/select a **new project for DROPi Tycoon**. Do not select the existing DROPi application project.

After successful initialization, EAS writes the new project ID into the Expo configuration. Commit that linkage to this repository before the first cloud build.

## Runtime configuration

The first-stage mobile shell does not hardcode the Railway URL in application code.

Copy `.env.example` to `.env` for local development, or configure the equivalent EAS environment variable:

```text
EXPO_PUBLIC_DROPITYCOON_GAME_URL=https://dropi-tycoon-production.up.railway.app/
```

The shell intentionally refuses to start the remote game if this variable is missing or not HTTPS.

## Development build

Install dependencies:

```bash
npm install
```

Validate the shell:

```bash
npm run typecheck
npx expo-doctor
```

After the new EAS project is linked and the runtime environment variable is configured:

```bash
npx eas-cli@latest build --platform android --profile development
```

The `development` profile creates an internally distributed Android APK with `expo-dev-client`.

## Owner review target

Owner visual acceptance moves from Chrome to the installed Android development build.

The first installed-build review must confirm:

1. DROPi Tycoon installs as a separate application from the real DROPi app.
2. It opens without Chrome/browser chrome.
3. Gameplay is landscape-first and fills the app surface.
4. Phaser touch input works in the WebView bridge.
5. Android Back behavior is safe.
6. Existing economy, employees, reviews and save semantics are unchanged.
7. Camera fit/follow/pan/zoom are reviewed on the physical device before Vehicle Fleet PR #288 resumes.
