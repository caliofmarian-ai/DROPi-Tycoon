# DROPi Tycoon Mobile Branding Assets

This directory is reserved for the owner-approved installed-mobile branding assets selected on 2026-09-05.

Do not replace these files with newly generated alternatives unless the Project Owner explicitly changes the visual direction.

Expected production files:

| File | SHA-256 | Role |
|---|---|---|
| `dropi-tycoon-logo.png` | `3aa62f1c6f38d06d52403477ff796665428a55178f5e3a975f38b527f7654616` | official game logo source |
| `dropi-tycoon-app-icon.png` | `f02072f431e93cb822afa40b177f07e1540e539998a3e662b6e8bcfed61fc24f` | Android/store icon source |
| `dropi-tycoon-splash.jpg` | `0524e0a265e5a775d8ae1c6a5ec36f00f7511d9fa548d09ce21054e550ad485c` | installed-app splash/loading artwork source |

The image bytes are imported separately because repository binary upload is handled as an asset-import step. Do not point `app.json` at a file until the file exists in the branch and CI can validate the Expo configuration.

After import, verify checksums with:

```bash
sha256sum assets/branding/dropi-tycoon-logo.png \
  assets/branding/dropi-tycoon-app-icon.png \
  assets/branding/dropi-tycoon-splash.jpg
```

See `08_Assets/ASSETS.md` and MOD-002 in `09_Development/Owner_Directives/` for the approved visual direction.
