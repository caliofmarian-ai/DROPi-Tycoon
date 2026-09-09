# Android release evidence

This directory stores **text-only, non-secret release attestations** for controlled Android artifacts.

Do not commit:

- `.aab` or `.apk` binaries;
- keystores or private keys;
- passwords, tokens or EAS credential exports;
- Play service-account JSON;
- full certificate/private credential material.

Those file classes are protected by `game-mobile/.gitignore`.

## Production AAB evidence

After an EAS production build is complete, download the exact `.aab`, check out the exact source commit used by EAS, obtain the official `bundletool` jar, and run:

```bash
npm run release:attest:aab -- \
  --aab /path/to/dropi-tycoon.aab \
  --eas-build-id <EAS_BUILD_ID> \
  --source-sha <EXACT_40_CHAR_SOURCE_SHA> \
  --bundletool /path/to/bundletool.jar
```

The script writes JSON evidence here by default. It records only release-safe facts:

- exact source SHA and EAS build ID;
- AAB filename, byte size and SHA-256;
- package, versionName and versionCode;
- min/target/compile SDK values from the bundle manifest;
- merged manifest permissions;
- debuggable/dev-launcher checks;
- upload-certificate SHA-256 fingerprint only;
- native ABIs and 64-bit counterpart checks;
- bundle page-alignment declaration;
- per-library ELF LOAD alignment for 16 KB support;
- bundletool SHA-256 used for inspection.

A technical attestation is **not** Play release approval. The following remain external gates and must be recorded separately before production promotion:

1. Google Play Internal testing accepts the AAB.
2. App Bundle Explorer confirms package/version/device compatibility and the expected Play signing state.
3. The pre-launch report is reviewed.
4. Physical Android landscape cold launch, offline start, save/relaunch, background/resume, Back, touch and pinch/zoom are accepted by the owner.

Never mark `ANDROID_VERIFIED` from repository CI alone.
