# Android owner evaluation artifact policy

Status: INTERNAL EVALUATION ONLY

The owner-facing Babylon evaluation APK must not be treated as deliverable merely because Gradle produced an APK archive.

The owner artifact gate requires, on the exact source head:

1. strict Babylon build and existing rendered regression checks;
2. isolated Expo/React Native Android prebuild using the evaluation package `com.dropi.tycoon.babyloneval`;
3. universal preflight APK with a valid Android signature and 16 KB ZIP alignment;
4. successful install on a clean Android emulator;
5. successful launch of the package on that emulator;
6. a second final evaluation APK limited to `arm64-v8a` for a smaller owner download;
7. valid signature, 16 KB alignment, expected package identity and payload integrity on that final APK;
8. SHA-256 attestation and `owner-installability-evidence.txt` bundled with the artifact.

The automated emulator result proves package installability/launchability on the tested Android API and ABI only. It does not prove physical-device FPS, thermal stability, rendering quality, touch quality, or Google Play production readiness.

The canonical public truth boundary remains:

`NON-AUTHORITATIVE TECHNICAL SPIKE — NOT AUTHENTIC GAMEPLAY`
