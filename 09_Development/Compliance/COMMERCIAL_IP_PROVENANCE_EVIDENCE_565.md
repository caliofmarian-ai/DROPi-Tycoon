# Issue #565 — Commercial IP / Provenance Evidence Closure

Status: **REPOSITORY EVIDENCE CLOSED WHERE POSSIBLE — COMMERCIAL RELEASE REMAINS BLOCKED**
Date: 2026-09-09
Audit baseline: `ca1a463539635312654a7ba680fee615d03330d8`
Owner lane: DT-13 — Legal / Privacy / IP
Coordinates: #409, #411, #412, #413, #414, #565, #568, #570

## Purpose

This continuation closes evidence-only gaps that can be proven from the repository after the first #565 enforcement slice. It does not make trademark filings, accept provider terms, interpret ODbL for the final product, grant a press-asset licence, or claim legal clearance.

Machine-readable evidence is shipped at:

`game-web/public/legal/commercial-release-evidence.json`

The existing release artifacts remain authoritative for their narrower scopes:

- `game-web/public/legal/dependency-license-inventory.json` — exact **game-web** production npm closure;
- `game-web/public/legal/runtime-provenance.json` — shipped Phaser runtime asset/data provenance;
- `game-web/public/legal/third-party-notices.html` — user-accessible third-party notices;
- `game-web/scripts/verify-third-party-release.mjs` — deterministic consistency/commercial gate.

---

## 1. Executive result

Repository evidence now supports these conclusions:

1. the current `game-web/package-lock.json` still matches the exact production web dependency inventory created by the first #565 slice;
2. the commercial Android product also contains an Expo/React Native shell whose exact resolved dependency/licence closure cannot yet be proven because `game-mobile/package-lock.json` is absent;
3. the three current mobile branding files exist and have repository hashes, owner-approval evidence and explicit press/public-use HOLDs, but that evidence is not trademark or chain-of-title clearance;
4. the generated `icon-orders.webp` has owner/runtime approval and source-family lineage, but the repository still lacks the exact provider/tool/date/terms/input/derivative chain needed to close commercial provenance;
5. OSM, GeoNames and Natural Earth notice/provenance surfaces remain present;
6. no bundled custom font binaries / `@font-face` declaration and no bundled audio/music/voice media were found in the current repository audit;
7. production Android bundling must now treat the legal notice/evidence files as required runtime output, preventing accidental omission from the installed product.

Commercial release therefore remains **BLOCKED**.

---

## 2. Third-party notice completeness

### Existing shipped notice

`game-web/public/legal/third-party-notices.html` currently contains:

- `© OpenStreetMap contributors` and ODbL 1.0 reference/link;
- GeoNames + CC BY 4.0 + transformation/source-snapshot notice;
- Natural Earth public-domain provenance;
- `world-atlas@2.0.2` ISC notice;
- Phaser 3.90.0 MIT notice;
- EventEmitter3 5.0.4 MIT notice;
- Postgres.js 3.4.9 Unlicense notice.

Main Menu → Information → Third-party notices links to this surface.

### Scope correction

The existing `dependency-license-inventory.json` is an exact inventory of the **game-web production npm closure**, not the entire Android AAB dependency graph.

The Android shell must not be represented as licence-complete until #568 provides a canonical mobile lockfile and release-artifact dependency/native evidence.

**ENGINEERING EVIDENCE REQUIRED — #568.**

---

## 3. Web dependency licence inventory

Current repository truth:

- `game-web/package-lock.json` exists;
- its Git blob remains `29c7efc9b5e9b642e37eb4606757596584e2b38f` at this audit;
- the exact production closure remains:
  - Phaser 3.90.0 — MIT;
  - EventEmitter3 5.0.4 — MIT;
  - Postgres.js 3.4.9 — Unlicense.

The deterministic verifier recalculates that closure from the lockfile and rejects drift.

No evidence gap remains for the current **web-runtime npm closure**.

---

## 4. Android/mobile dependency licence closure

Current `game-mobile/package.json` declares production dependencies including Expo, React Native, React Native WebView, local-filesystem/static-server modules and Expo shell modules.

However:

`game-mobile/package-lock.json` = **NOT PRESENT** at the audit baseline.

Therefore DT-13 does not infer:

- the exact resolved transitive package set;
- exact versions hidden behind semver ranges;
- licences of that unresolved closure;
- native/Gradle dependency notices ultimately present in the AAB.

Machine-readable blocker:

`mobile-release-dependency-license-closure`

Required closure path:

1. #568 creates/commits the canonical mobile lockfile;
2. build the actual production AAB from an exact commit;
3. resolve npm/native dependency inventory from that release path;
4. identify licence/notice/source obligations;
5. update shipped notices and machine-readable inventory;
6. rerun #565 commercial gate.

Until then, **commercial Android dependency licence evidence is incomplete**.

---

## 5. OSM / GeoNames / Natural Earth attribution surfaces

### OpenStreetMap

Evidence present:

- runtime footer: `© OpenStreetMap contributors · ODbL`;
- packaged notice at `/legal/third-party-notices.html#openstreetmap`;
- retained Brăila source snapshot/transformation evidence;
- runtime provenance entry.

Remaining conclusion:

**QUALIFIED REVIEW REQUIRED** — exact ODbL characterization of final distributed Database / Derivative Database / Produced Work outputs and corresponding source-availability/share-alike mechanism.

No engineering evidence should rename that uncertainty as clearance.

### GeoNames

Evidence present:

- packaged GeoNames attribution;
- CC BY 4.0 reference;
- transformation notice;
- retained `cities500.zip` and `admin1CodesASCII.txt` hash evidence;
- source tag and regional runtime metadata;
- verifier checks every current Europe regional-locality runtime file for source/provider/licence metadata.

Repository evidence gap: **none identified for current attribution/provenance mechanics**.

### Natural Earth / world-atlas

Evidence present:

- Natural Earth public-domain provenance;
- packaged credit/terms link;
- world-atlas 2.0.2 ISC notice;
- runtime provenance and source/version records;
- deterministic file/source checks.

Repository evidence gap: **none identified for current provenance mechanics**.

---

## 6. Generated runtime asset — `icon-orders.webp`

Repository truth proves:

- exact runtime path exists;
- runtime adoption is governed/tested;
- asset is owner-approved;
- approved generated-family registry exists;
- current runtime-provenance manifest marks the asset `BLOCKED`.

Repository truth does **not** prove:

- exact generation provider/tool/model/product;
- generation timestamp/date;
- account/plan entitlement and provider terms applicable at generation time;
- exact prompt/instruction record;
- input/reference image provenance;
- human edits/compositing chain;
- source-file-to-runtime derivative mapping beyond the current family-level evidence.

Evidence slot:

**OWNER INPUT REQUIRED** — generation-session factual record, if available.
**QUALIFIED REVIEW REQUIRED** — provider-terms / commercial chain-of-title conclusion after the facts are complete.

This slice does not fabricate those values.

---

## 7. Mobile branding / media evidence

The following files exist in `game-mobile/assets/branding/` and are registered in both the branding README and `08_Assets/ASSETS.md`:

| Asset ID | Path | Declared SHA-256 | Repository state |
|---|---|---|---|
| `BRAND-LOGO-001` | `dropi-tycoon-logo.png` | `3aa62f1c6f38d06d52403477ff796665428a55178f5e3a975f38b527f7654616` | owner-approved / external-use HOLD #565 |
| `BRAND-ICON-001` | `dropi-tycoon-app-icon.png` | `f02072f431e93cb822afa40b177f07e1540e539998a3e662b6e8bcfed61fc24f` | owner-approved / external-use HOLD #565 |
| `BRAND-SPLASH-001` | `dropi-tycoon-splash.jpg` | `0524e0a265e5a775d8ae1c6a5ec36f00f7511d9fa548d09ce21054e550ad485c` | owner-approved / external-use HOLD #565 |

The launch/creator package already states that #565 does not grant a press-asset licence.

What repository evidence closes:

- exact file identity/path;
- intended application/store role;
- owner visual approval;
- declared SHA-256;
- Git blob identity at audit time;
- explicit external-use HOLD.

What remains unresolved:

**OWNER INPUT REQUIRED**

- original creation/provider/source chain;
- generation/design provider and applicable terms where relevant;
- reference/input provenance and human edits where relevant.

**QUALIFIED REVIEW REQUIRED**

- `DROPi` / `DROPi Tycoon` trademark/name clearance;
- logo/icon trademark/trade-dress risk;
- final copyright/chain-of-title conclusion for commercial publication.

Owner approval is evidence of product governance, not legal clearance.

---

## 8. Fonts / audio / music / voice

Current repository search found no:

- `.woff`, `.woff2`, `.ttf` or `.otf` bundled font evidence;
- `@font-face` declaration;
- `.mp3`, `.ogg`, `.wav` or `.m4a` bundled audio/music/voice media evidence.

Current release evidence is therefore:

`NO CUSTOM FONT OR AUDIO/MUSIC/VOICE MEDIA FOUND IN REPOSITORY AUDIT`.

This is not a permanent exemption. Any future file adoption reopens #565 provenance/notice review for that family.

---

## 9. User-visible notice placement / Android packaging

Web/runtime navigation already exists:

Main Menu → Information → Third-party notices.

The production Android app bundles the built Phaser runtime. Prior to this continuation, `prepare-bundled-runtime.mjs` collected the entire `dist/` tree but did not explicitly fail when legal files were absent.

This continuation makes these output files mandatory:

- `legal/third-party-notices.html`;
- `legal/dependency-license-inventory.json`;
- `legal/runtime-provenance.json`;
- `legal/commercial-release-evidence.json`.

If any disappear from the Vite output, production mobile preparation must fail before packaging.

This converts notice placement from an incidental Vite-copy behavior into a deterministic Android release requirement.

---

## 10. Commercial blockers after this evidence closure

| Blocker | Evidence state | Owner/legal action |
|---|---|---|
| `generated-orders-icon-chain-of-title` | repo lineage exists; exact generation facts absent | `OWNER INPUT REQUIRED` + `QUALIFIED REVIEW REQUIRED` |
| `branding-chain-of-title-and-trademark` | files/hashes/approval/HOLD proven; commercial chain/trademark not proven | `OWNER INPUT REQUIRED` + `QUALIFIED REVIEW REQUIRED` |
| `osm-commercial-distribution-characterization` | attribution/provenance/source evidence present | `QUALIFIED REVIEW REQUIRED` |
| `mobile-release-dependency-license-closure` | manifest exists; lockfile absent | #568 engineering evidence, then licence review as needed |

No blocker above may be converted to `CLEARED` by changing a boolean without attaching the required evidence.

---

## 11. Release invariant

> **Repository evidence may prove what exists, where it came from, what is missing, and whether a release gate must fail. It must never substitute an owner fact that was not recorded or a qualified legal conclusion that has not been made.**

#565 remains OPEN after this PR unless all external evidence/review gates are later satisfied.
