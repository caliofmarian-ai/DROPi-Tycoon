# Android / Google Play AAB Attestation

**Owner:** DT-14 — Google Play / Android Release

**Issue:** #568

**Status:** SOURCE PREFLIGHT IMPLEMENTED / ACTUAL PRODUCTION AAB PENDING

**Package:** `com.dropi.tycoon`

**Authoritative gameplay runtime:** Phaser (`game-web/`)

**Android shell:** Expo / React Native (`game-mobile/`)

## Purpose

This contract turns an EAS production Android App Bundle into reproducible, reviewable release evidence without committing binaries, signing secrets or Play credentials.

It does not create a second gameplay runtime and does not change Railway ownership.

## Reproducible dependency input

`game-mobile/package-lock.json` is canonical and committed.

The mobile package manager is pinned to:

```text
npm@10.9.2
```

The controlled dependency install for a release candidate is:

```bash
cd game-mobile
npm ci
```

Do not use `EAS_BUILD_SKIP_LOCKFILE_CHECK=1` as the canonical release path.

The existing `version:validate` command additionally validates:

- lockfile v3 exists;
- lockfile package name/version match `package.json`;
- root dependencies and devDependencies match exactly;
- npm version is pinned;
- Android package remains `com.dropi.tycoon`;
- production remains an AAB profile;
- production remains bundled-Phaser mode with no public Railway game-document URL;
- development/preview remain explicitly remote;
- release binaries and credential file classes remain gitignored.

## Source preflight

From a clean checkout of the release commit:

```bash
cd game-mobile
npm ci
npm run release:preflight
```

`release:preflight` runs the release/version/bundled-runtime validators, TypeScript and Expo Doctor.

The production EAS profile must continue to provide:

```text
Node: 22.13.0
Environment: production
Android buildType: app-bundle
Runtime mode: bundled
Remote versionCode source: enabled
Auto increment: enabled
Development client: not enabled
```

## Production build

The owner-authorized EAS command is:

```bash
cd game-mobile
npx eas-cli@latest build --platform android --profile production
```

A build is not considered release evidence until all of the following are known:

- EAS build ID;
- exact 40-character source commit SHA;
- downloaded AAB corresponding to that build;
- resulting Android `versionCode` assigned by the remote version source.

Do not paste EAS tokens, keystore passwords, private keys or credential exports into issues, PRs or release evidence.

## Technical AAB attestation

Prerequisites on the inspection machine:

- Java / `keytool`;
- official Android `bundletool` jar;
- `unzip`;
- GNU/LLVM `readelf` capable of reading Android ELF libraries;
- exact source commit checked out cleanly.

Run:

```bash
cd game-mobile
npm run release:attest:aab -- \
  --aab /path/to/dropi-tycoon.aab \
  --eas-build-id <EAS_BUILD_ID> \
  --source-sha <EXACT_SOURCE_SHA> \
  --bundletool /path/to/bundletool.jar
```

The attestor fails rather than inventing evidence when a required field/tool/check is absent.

It records:

1. source commit;
2. EAS build ID;
3. AAB SHA-256 and size;
4. package name;
5. `versionName` and `versionCode`;
6. `minSdkVersion`;
7. `targetSdkVersion`;
8. compile/platform build SDK value exposed by the bundle manifest;
9. merged permissions;
10. release debuggable state;
11. manifest references to Expo dev launcher/dev menu;
12. AAB upload-certificate SHA-256 fingerprint only;
13. native ABIs;
14. 64-bit presence and 32→64-bit library counterpart gaps;
15. bundletool page-alignment declaration;
16. ELF LOAD segment minimum alignment for every bundled `.so`;
17. bundletool jar SHA-256 used for the inspection.

## API target gate

The attestor currently requires `targetSdkVersion >= 36` because the Google Play new-app/update target requirement in force for ordinary phone/tablet apps from 31 August 2026 is Android 16 / API 36 or newer.

This constant is a release guard, not a substitute for checking current Play policy immediately before submission. If Google raises the requirement later, DT-14 must raise the guard before the next release.

Official target API reference:

- https://developer.android.com/google/play/requirements/target-sdk

## 64-bit gate

For AABs containing native libraries:

- at least one 64-bit ABI must be present;
- if `armeabi-v7a` libraries exist, matching library names must exist under `arm64-v8a`;
- if `x86` libraries exist, matching library names must exist under `x86_64`.

The AAB is not attested when required 64-bit counterparts are absent.

## 16 KB page-size gate

For native code, the technical attestation requires both:

1. `bundletool dump config` reports `PAGE_ALIGNMENT_16K` for the AAB; and
2. every bundled native library reports all ELF `LOAD` segments aligned to at least 16,384 bytes (`2**14`).

This follows Android's current command-line verification guidance. A physical/emulator 16 KB runtime test and Play device-compatibility evidence remain additional release confidence, not something repository CI may claim.

Official Android reference:

- https://developer.android.com/guide/practices/page-sizes

## Signing evidence boundary

The AAB's signing/upload certificate is recorded only as its SHA-256 fingerprint.

The private upload key, keystore, passwords and any Play App Signing private material must never enter Git.

The fingerprint produced from the uploaded AAB does **not** replace Play Console confirmation of Play App Signing. Google Play may re-sign distributed APKs using the Play app-signing key, which is a separate certificate identity from the developer upload key.

## Google Play external gate

After technical AAB attestation passes, the owner must perform the Play-side steps because they require the real Play Console/account:

1. upload the exact AAB to Internal testing;
2. confirm upload is accepted for `com.dropi.tycoon`;
3. inspect App Bundle Explorer for package, versionCode, supported devices/ABIs and signing state;
4. run/review the pre-launch report;
5. retain screenshots/exported facts sufficient to tie Play evidence to the exact AAB SHA-256 and versionCode;
6. do not promote to production until the broader #569/#571 compliance and account gates are satisfied.

## Physical Android acceptance

The production candidate still requires owner testing on a physical Android device in landscape:

1. cold launch with Wi-Fi/mobile data disabled — bundled menu/runtime must still load;
2. start/continue, save, fully close and relaunch — save must remain visible;
3. touch, world drag, pinch/zoom and fixed controls;
4. Android Back behavior;
5. background/resume without blank WebView or runtime reset;
6. restore network and verify backend/network failure is distinct from local asset failure;
7. verify the displayed release/versionCode corresponds to the attested candidate where surfaced.

CI or AAB static analysis alone must never be labeled `ANDROID_VERIFIED`.

## Evidence storage

Text-only evidence belongs under:

```text
game-mobile/release-evidence/
```

The AAB itself remains outside Git and is ignored by repository policy.

A completed release evidence JSON may be committed only after confirming it contains no secrets. The canonical schema is emitted by `scripts/attest-android-aab.mjs`.

## Current blocker

Repository-side deterministic release preparation can be completed without owner secrets.

The following cannot be truthfully completed until an actual production EAS build is authorized and available:

- EAS build ID;
- final remote `versionCode`;
- AAB SHA-256;
- manifest/SDK/permissions extracted from that AAB;
- final ABI and 16 KB results;
- upload certificate fingerprint;
- Play Internal/App Bundle Explorer/pre-launch evidence;
- physical Android acceptance.

Those fields must remain pending rather than being inferred from preview APKs or source configuration.
