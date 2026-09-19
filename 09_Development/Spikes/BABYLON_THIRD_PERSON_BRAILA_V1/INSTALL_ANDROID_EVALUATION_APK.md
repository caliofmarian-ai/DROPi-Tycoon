# Install the Babylon Brăila Android owner-evaluation APK

This APK is an **internal owner-evaluation build** of the Babylon Brăila model-city path.
It is not a production release and it does not represent the old Phaser/2D presentation.

## Expected first-launch flow

The owner-evaluation APK must visibly follow this order:

1. long DROPi Tycoon game introduction cinematic;
2. `CONTINUE TO GAME` once the Babylon city is ready;
3. player access choice:
   - `CONTINUE AS GUEST`;
   - `SIGN IN / CREATE ACCOUNT` (shown honestly as not yet enabled in this evaluation build);
4. Guest path -> choose `MALE` or `FEMALE`;
5. corresponding Recovery Story Film 1;
6. dissolve into 3D gameplay;
7. first objective: `Walk the streets and look for work opportunities.`;
8. recovery state: `ON FOOT · NO PHONE · NO GPS`.

If the APK launches directly into the technical Babylon map without the cinematic/access flow, that build is **FAIL** for owner review.

## Guest evaluation behavior

- Guest creates a local evaluation profile only.
- Guest progress remains local on this device.
- Male/Female selection is protagonist presentation, not a claim about the user's real-world sex/gender.
- Online Google/email authentication is tracked separately under #772 and is not faked in this APK.
- Use `REPLAY INTRO`, `REPLAY STORY FILM` and `CHANGE HERO (EVAL)` rather than uninstalling merely to replay cinematics.

## Install on Android

1. Download the latest successful artifact whose name starts with `dropi-babylon-owner-ready-`.
2. Extract the ZIP.
3. Tap `DROPi-Babylon-Eval-<SHA>.apk`.
4. If Android asks, allow **Install unknown apps** for the Files application and retry.
5. Open `DROPi Babylon Eval`.

The evaluation package is `com.dropi.tycoon.babyloneval`, separate from the production package.

## Controls after the recovery films

- on-screen controls: walk/turn;
- drag: orbit camera;
- pinch: adjust camera distance;
- `RECENTER CAMERA`: restore behind-hero view;
- Android Back: native exit bridge.

Run/sprint, Work Capacity projection and authoritative day/night consumption remain separate active work (#725, #436, #420); do not interpret this APK as final acceptance for those systems.

## Owner evidence requested

Please return a short screen recording showing:
- intro cinematic;
- Continue;
- Guest access;
- Male/Female choice;
- Story Film 1;
- film -> gameplay transition;
- first recovery objective;
- any visual/audio defect.

Physical Android review remains the final player-visible acceptance gate.
