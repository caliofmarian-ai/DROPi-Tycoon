# DROPi Tycoon Android Build Record — 0.0.0

Date: 2026-09-05

Status: EAS build finished; owner installation/physical validation pending.

## Identity

- Semantic version: `0.0.0`
- Android versionCode: `2`
- Android package: `com.dropi.tycoon`
- EAS project: `@caliofm/dropi-tycoon`
- EAS project ID: `972b831b-78d0-46ab-8cb8-2b13745a8df7`

## Build provenance

- Source commit: `b398ed6138c0b2085c336f719dad7574d646ff24`
- EAS build ID: `eee548e7-4719-4889-a4e1-7e3675e3beda`
- EAS profile: `preview`
- Distribution: `internal`
- Expo SDK: `57.0.0`
- Build started: 2026-09-05 15:34:33 local owner build output
- Build finished: 2026-09-05 15:41:47 local owner build output

## Release scope

This is the first controlled APK in the canonical semantic-version line.

Included owner-visible/native scope:

- canonical visible version `0.0.0`;
- approved DROPi Tycoon launcher icon;
- approved DROPi Tycoon splash/loading artwork;
- approved DROPi Tycoon logo and product identity;
- adaptive two-column Main Menu in landscape;
- `Exit Game` action with save-before-exit behavior;
- native Android exit bridge after successful save;
- Android Back routed through the game hierarchy;
- Phaser runtime remains authoritative;
- existing economy, employees, reviews, save and camera systems retained.

## Required physical-device acceptance

1. App installs separately from the real DROPi application.
2. Approved launcher icon is visible.
3. App launches without browser chrome.
4. Approved splash/loading artwork appears while the Phaser runtime loads.
5. Main Menu displays `v0.0.0`.
6. All five Main Menu actions fit without clipping in landscape.
7. Two-column layout is comfortable to tap.
8. `Exit Game` saves supported progress and closes the Android app.
9. Android Back stays inside the intended game navigation hierarchy.
10. Core gameplay, economy, employees, reviews and camera controls still function.

Owner acceptance result and any defects discovered must be appended after physical testing.
