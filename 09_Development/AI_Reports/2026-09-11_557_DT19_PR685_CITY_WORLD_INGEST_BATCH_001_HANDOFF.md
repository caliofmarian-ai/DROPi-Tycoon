# DT-19 — PR #685 City/World Ingest Batch 001 Handoff

- Report ID: `2026-09-11_557_DT19_PR685_CITY_WORLD_INGEST_BATCH_001_HANDOFF`
- Reconciled: 2026-09-12
- Agent: `DT-19 — ART ASSET PIPELINE / PRODUCTION LIBRARY`
- Repository: `caliofmarian-ai/DROPi-Tycoon`
- Issue: `#413`
- Pull request: `#685`
- Branch: `agent/dt19-413-city-world-ingest-batch-001-r1`
- Canonical reconciliation base: `f1d4396f64aa7a0fcfbcc37322d9fe6a6731066f`
- Pre-correction branch head: `fabe73e437d6a7fe4d439ac33b14260a0a6a2ce4`
- Containing correction head: `UNKNOWN — SELF-SHA / LIVE GITHUB RE-READ REQUIRED`
- Status at containing-write time: `ACTIVE — LOCAL VALIDATION PASS / EXACT-HEAD CI PENDING`

## Mission

Reconcile the same bounded four-byte PR #685 onto current canonical `main` without overwriting the operational registry introduced by PR #713. Preserve the exact WebP bytes and `CANDIDATE` lifecycle while enforcing the owner-approved third-person visual canon and fail-closing every unproven rights fact.

This PR performs no runtime placement, gameplay, economy, save, backend, mobile, CI-workflow or locality mutation.

## Canonical visual-use gate

Batch classification:

- `STRATEGIC_MAP_OR_REFERENCE_ONLY`
- `FORBIDDEN_FOR_LOCAL_HUMAN_SCALE_THIRD_PERSON_RUNTIME`
- `NOT_SUITABLE_AS_DIRECT_LOCAL_THIRD_PERSON_GAMEPLAY_ART`

The four assets are small 2D isometric/miniature WebP images. They cannot directly represent full-height, human-scale local buildings under `00_Project/THIRD_PERSON_OPEN_WORLD_VISUAL_EXPERIENCE_CANON.md`.

Strategic-map use is only a possible future review lane. Repository ingestion does not itself approve any player-visible use.

## Exact bounded asset list and immutable byte identity

| Asset | Dimensions | Bytes | Git blob SHA-1 | SHA-256 | Asset-use classification |
|---|---:|---:|---|---|---|
| `school_01.webp` | 144x85 | 6,294 | `27a3f73904456d937a34f6132862fad01d96b115` | `f2cbaae170893eb82ee59f557cddf9e390836716852c4b5e20a03b94cb0b57a0` | `REFERENCE_ONLY`; embedded `SCHOOL` text |
| `train_station_01.webp` | 144x86 | 6,540 | `f6a16d79ab9d09c41e76fd71ff38202e1329c477` | `4378545827c30c98a8e360407d536733ce9ff20372136104571b04c2ff8859e6` | `REFERENCE_ONLY`; embedded `TRAIN STATION` text |
| `historic_european_building_01.webp` | 144x122 | 7,780 | `32b848f03a55aa55737b692e11406f541e7e6af3` | `aea4e74511f3d860357c9e5b7adcf05fa3f580a02c7378bf6ef6c9346b1262bc` | `STRATEGIC_MAP_OR_REFERENCE_ONLY` |
| `modern_office_building_01.webp` | 120x142 | 4,374 | `05eca6138d396a90e1d2cafc798223d83f086c8e` | `d97f1c104a764ebd9334919129f8b778c1cbca1b3d6df020812d74479567ecc2` | `STRATEGIC_MAP_OR_REFERENCE_ONLY` |

All four remain `CANDIDATE`. Their Git blob identities are unchanged from pre-correction head `fabe73e437d6a7fe4d439ac33b14260a0a6a2ce4`.

Issue #413 requires label-contaminated crops to be reference-only. The school and station candidates therefore cannot be promoted as strategic-map art without a new clean derivative and a separately governed review.

## Source-board metadata evidence

Read-only Library metadata established:

| Source board | Library file ID | Created UTC | Bytes | Evidence |
|---|---|---|---:|---|
| `/DROPi Tycoon/image-gen-1(8).png` | `file_00000000ff2c81f4b146df2c8ebe64c8` | `2026-09-07T19:41:51.514314Z` | 2,593,109 | `model_generated: true` |
| `/DROPi Tycoon/image-gen-2(8).png` | `file_00000000290081f4a028a6b7642e5425` | `2026-09-07T19:41:55.863924Z` | 2,705,120 | `model_generated: true` |
| `/DROPi Tycoon/image-gen-5(1).png` | `file_00000000a5cc81f49304e75f2d85cca4` | `2026-09-07T19:42:05.150483Z` | 2,505,992 | `model_generated: true` |

This metadata proves Library presence, file identity/path, creation time and the model-generated indicator only.

The following remain fail-closed `UNKNOWN_OR_UNCLEARED` because no retained evidence was found:

- exact provider;
- generation tool;
- model/product;
- applicable provider terms/licence evidence;
- input/reference set rights;
- commercial-use review;
- redistribution review;
- DT-13 legal/commercial qualification.

Independent source-board byte, dimension and recovered-region re-verification remains `UNKNOWN`: the Library materialization attempt returned HTTP 502. The manifest retains the previously recorded source SHA-256, dimensions and recovered regions as declared lineage, not as newly independently verified facts.

Commercial release remains `BLOCKED_PENDING_DT13_EVIDENCE`. Owner approval, `APPROVED_SOURCE`, repository presence, CI or future runtime wiring cannot substitute for DT-13 evidence.

## Reproducibility truth

Two different reproducibility claims must remain separate:

1. The exact committed candidate derivative bytes are reproducible from Git by their path, Git blob SHA-1, SHA-256 and file size.
2. Recreating those same bytes from the Library source boards is `NOT_REPRODUCIBLE_FROM_RECORDED_EVIDENCE`.

The historical crop, alpha-cleaning, resize, encoder product/version, encoder options and quality settings remain `UNKNOWN_RECOVERED_EXISTING_WORK`. This PR does not pretend that a source board plus a region rectangle can reproduce the exact derivative encoding.

## Inventory and runtime boundary

The inventory:

- records three source-family collections and exactly four files;
- keeps all three collections at `CANDIDATE`;
- records `STRATEGIC_MAP_OR_REFERENCE_ONLY`;
- records `FORBIDDEN_FOR_LOCAL_HUMAN_SCALE_THIRD_PERSON_RUNTIME`;
- fail-closes provenance and commercial/redistribution evidence as `UNKNOWN_OR_UNCLEARED`;
- records school/station as `REFERENCE_ONLY`;
- references the canonical third-person visual authority.

The four files exist only under `08_Assets/Production/Candidates/City_World_Ingest_Batch_001/`. They are not present in `game-web/public`, are not referenced by `game-web/src`, are absent from `runtimeArtifacts`, and are not bundled by the production `game-web` Docker context.

## Registry reconciliation

PR #713 is canonical on main through merge commit `f1d4396f64aa7a0fcfbcc37322d9fe6a6731066f`.

This reconciliation:

- preserves every DT-00 through DT-23 record from that main;
- replaces only the DT-19 record;
- does not modify `CURRENT_STATE.json`;
- removes the invalid historical status `RECONCILED_PENDING_EXACT_HEAD_CI`;
- preserves live reconciliation and Self-SHA requirements.

## Local validation before publication

- Modified JSON parse: `PASS`.
- `verify_asset_inventory.mjs`: `PASS` — 11 families, 4 collections, 13 Library artifacts, 67 inventoried artifacts, 13 runtime artifacts, 2 declared reuse sets.
- Persistent-memory validator: `PASS` — 24 handoffs / 10 persisted snapshot PR records.
- Focused asset/inventory tests: `PASS` — 2 files, 14 tests.
- Full automated test suite: `PASS` — 158 files passed, 3 skipped; 1,660 tests passed, 18 skipped.
- TypeScript and Vite production build: `PASS` — 117 modules.
- `git diff --check`: `PASS`.

The existing approximately 3.2 MB minified / 973 kB gzip production bundle warning is unchanged by this candidate-only PR; none of these four assets enter the runtime bundle.

The persisted snapshot count is not a live GitHub count. After PR #713 merged and superseded PR #703 closed, live GitHub contained eight open PRs at this re-read. PR #685 does not modify `CURRENT_STATE.json`; live GitHub remains the operational authority and must be re-read by DT-00.

## Exact-head acceptance still required

After publication, the same containing head must return:

- `validate = SUCCESS`
- `validate-mobile-shell = SUCCESS`
- `production-image-smoke = SUCCESS`

Local validation and green unrelated workflows do not substitute for this exact-head gate. DT-19 does not self-merge or enable auto-merge.

## Permitted future use

After merge, the bytes may remain in the governed repository candidate library.

A future bounded mission may assess:

- the two unlabelled architecture candidates for a strategic-map presentation;
- the labelled school/station images as reference inputs only;
- creation of new clean strategic-map derivatives, if justified and rights-qualified.

No future task may treat this ingestion as authorization to use any of these four images in the local human-scale third-person world.

## Remaining blockers

- Exact-head CI for the containing correction commit is pending live GitHub evidence.
- Provider/tool/model, terms/licence, reference/input rights and commercial/redistribution evidence remain `UNKNOWN_OR_UNCLEARED`.
- DT-13 qualification is required before any commercial/runtime promotion.
- Strategic-map use remains unaccepted pending a separate bounded visual/runtime review.
- Production 3D asset structure remains downstream of the Issue #710 renderer architecture decision.

## Forbidden actions preserved

- Do not modify or regenerate the four WebP bytes in this PR.
- Do not promote them beyond `CANDIDATE`.
- Do not integrate them into runtime.
- Do not use them as local human-scale third-person buildings.
- Do not infer legal/commercial clearance.
- Do not overwrite another DT handoff or modify `CURRENT_STATE.json`.
- Do not self-merge or enable auto-merge.

## References

- PR #685
- Issue #413
- Issue #710
- PR #713 / canonical main `f1d4396f64aa7a0fcfbcc37322d9fe6a6731066f`
- `00_Project/THIRD_PERSON_OPEN_WORLD_VISUAL_EXPERIENCE_CANON.md`
- `08_Assets/Production/Manifests/CITY_WORLD_INGEST_BATCH_001.json`
- `08_Assets/Production/asset-inventory.v1.json`
- `09_Development/Compliance/GLOBAL_ASSET_PROVENANCE_CONTRACT_565_643.md`
- `game-web/tests/asset-city-world-ingest-batch-001.test.ts`
- `game-web/tests/asset-inventory-governance.test.ts`
- `09_Development/AI_Project_Memory/HANDOFFS.json`
- `09_Development/AI_Project_Memory/BOOTSTRAP.md`
