# PACKAGE_MANIFEST — Batch007 Portable GDevelop Preview Package

| Field | Value |
|---|---|
| Generated | 2026-07-15 |
| Source Commit | `006126ab84c076b556516d351f90ecdcd73b59cd` |
| Source Branch | `origin/main` |
| Last Merged PR | #77 — BATCH-007 pickup proximity core |
| Independent Verification PR | #78 — Report 080 |
| Reports Present | 079 ✅ 080 ✅ |

---

## Artifacts

| File | Type | Status |
|---|---|---|
| `DROPi_Tycoon_GDevelop_Project_Batch007.zip` | GDevelop source project ZIP | ✅ GENERATED |
| `DROPi_Tycoon_HTML5_Preview_Batch007.zip` | HTML5 preview ZIP | ❌ BLOCKED — GDevelop CLI unavailable |

---

## GDevelop Project ZIP Structure

```
DROPi_Tycoon_GDevelop_Project_Batch007.zip
└── DROPi_Tycoon_GDevelop_Project/
    ├── DROPi_Tycoon.json
    └── Assets/
        ├── Audio/
        │   └── .gitkeep
        ├── Sprites/
        │   ├── building_commercial.png
        │   ├── building_company_small.png
        │   ├── building_residential.png
        │   ├── delivery_point_marker.png
        │   ├── environment_road_tile.png
        │   ├── package_delivery.png
        │   ├── player_character_idle.png
        │   ├── player_character_move.png
        │   └── vehicle_bicycle_basic.png
        └── UI/
            └── icon_money.png
```

---

## Resource Path Validation

All 7 JSON-declared resource paths begin with `Assets/` and resolve correctly relative to `DROPi_Tycoon.json` inside the ZIP. No path correction was required.

| Resource Path | Valid PNG | Resolves |
|---|---|---|
| Assets/Sprites/player_character_idle.png | ✅ | ✅ |
| Assets/Sprites/building_company_small.png | ✅ | ✅ |
| Assets/Sprites/building_residential.png | ✅ | ✅ |
| Assets/Sprites/building_commercial.png | ✅ | ✅ |
| Assets/Sprites/package_delivery.png | ✅ | ✅ |
| Assets/Sprites/delivery_point_marker.png | ✅ | ✅ |
| Assets/Sprites/environment_road_tile.png | ✅ | ✅ |

---

## Asset Hash Validation (SHA-256 prefix)

| Asset | Source Hash | Packaged Hash | Match |
|---|---|---|---|
| building_commercial.png | `71cd2033f8ecd9ae` | `71cd2033f8ecd9ae` | ✅ |
| building_company_small.png | `809452bd18d6e3fa` | `809452bd18d6e3fa` | ✅ |
| building_residential.png | `754f41b9f8dcc569` | `754f41b9f8dcc569` | ✅ |
| delivery_point_marker.png | `4377e08fe2c2be83` | `4377e08fe2c2be83` | ✅ |
| environment_road_tile.png | `75fcb6c0374ef3d1` | `75fcb6c0374ef3d1` | ✅ |
| package_delivery.png | `b19e633b7efdb170` | `b19e633b7efdb170` | ✅ |
| player_character_idle.png | `82d41f4c89e87a28` | `82d41f4c89e87a28` | ✅ |
| player_character_move.png | `b715b38fd2c741fe` | `b715b38fd2c741fe` | ✅ |
| vehicle_bicycle_basic.png | `c4993aa46a965e75` | `c4993aa46a965e75` | ✅ |
| icon_money.png | `078304fde0128d51` | `078304fde0128d51` | ✅ |

Source JSON identical to packaged JSON: ✅ YES (no path corrections were needed)

---

## HTML5 Export — BLOCKED

**Reason:** No official GDevelop CLI (`gdevelop`, `gdevelop-cli`, or `@gdevelop/cli`) is installed in the agent environment. HTML5 export requires the GDevelop headless build toolchain which is not available without network access to npm or a pre-installed GDevelop instance.

**Resolution path:** See AI Report 081 — GitHub Actions approach documented.

---

## Output Classification

**B. GDEVELOP PROJECT ZIP GENERATED — HTML5 EXPORT TOOL UNAVAILABLE**

---

## Android Opening Instructions

### A. Downloading from GitHub PR (Android)
1. Open the PR link in Chrome on Android
2. Tap **Files changed** → navigate to `Builds/Preview/Batch007/`
3. Tap `DROPi_Tycoon_GDevelop_Project_Batch007.zip` → tap **Download**
4. File saves to Downloads folder

### B. Extracting on Android
1. Open the **Files** app (Samsung My Files, Google Files, or any file manager)
2. Navigate to **Downloads**
3. Long-press the ZIP → tap **Extract** or **Unzip**
4. Extract to a memorable folder (e.g. `DROPi_Tycoon_Project/`)

### C. Opening in GDevelop
1. Install **GDevelop** from the Play Store (free)
2. Open GDevelop → tap **Open a project**
3. Navigate to the extracted folder → select `DROPi_Tycoon.json`
4. The project loads with all scenes and assets intact

**Note:** GDevelop mobile app file picker support varies by Android version. If the direct file picker does not show the extracted folder, try moving the extracted folder to internal storage / Documents.

### D. HTML5 Preview (currently unavailable)
HTML5 export is blocked — see GitHub Actions follow-up below.

### E. GitHub Actions Follow-Up (to generate HTML5 preview)
A GitHub Actions workflow can be added to the repository that:
1. Uses `docker run gdevelopapp/gdevelop` or the official GDevelop CI image
2. Exports `Game/DROPi_Tycoon.json` to HTML5
3. Publishes the result to GitHub Pages or as a release artifact
4. The hosted URL can be opened in any Android browser with zero installation

This does not require secrets for a public repository.

---

## Validation Checklist

| # | Check | Result |
|---|---|---|
| 1 | Latest origin/main used (post-BATCH-007) | ✅ |
| 2 | Reports 079 and 080 exist | ✅ |
| 3 | Source project JSON parses | ✅ (3 scenes) |
| 4 | Portable project ZIP exists | ✅ |
| 5 | ZIP extracts successfully | ✅ |
| 6 | Packaged project JSON parses | ✅ |
| 7 | Every packaged resource path resolves | ✅ |
| 8 | All packaged asset hashes match source | ✅ |
| 9 | No source gameplay content changed | ✅ |
| 10 | No BATCH-008 work exists | ✅ |
| 11 | HTML5 preview genuine if created | N/A — blocked |
| 12 | HTML5 archive has index.html at root | N/A — blocked |
| 13 | Output downloadable from Android | ✅ (via GitHub PR) |
| 14 | Secret scan | ✅ (no secrets) |
| 15 | CodeQL | N/A (packaging artifacts only) |
| 16 | Git diff contains only packaging artifacts + report | ✅ |
