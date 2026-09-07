# BATCH 001 — WORLD FOUNDATION ASSET MANIFEST

Project: DROPi Tycoon
Status: EXECUTABLE — INVENTORIED / SPECIFICATION IN PROGRESS
Date: 2026-09-07
Canonical owners: `08_Assets/WORLD_ASSET_BIBLE.md`, `08_Assets/MASTER_ASSET_PLAN_V2.md`

---

## Purpose

This is the first production manifest for the expanded DROPi Tycoon world-art program.

It is intentionally focused on **diversity + visible products + company identity** before multiplying thousands of derivatives.

Generated files must remain Candidate until reviewed and must not be copied into the live runtime without integration review.

---

# A. Human Identity Seed

Target: 48 materially distinct people before broad animation multiplication.

| Family ID | Count | Role direction | Candidate output | Runtime dimensions |
|---|---:|---|---|---|
| HUM-CIT | 12 | general citizens/customers across varied age, face, skin tone, hair, silhouette and clothing | identity/portrait + world reference | 64x64 world derivative when integrated; portrait contract TBD by UI surface |
| HUM-COUR | 8 | couriers/delivery workers with distinct identities | identity reference; selected identities receive directional transport atlases | current courier atlas 448x896, 112x112 cells when integrated |
| HUM-MER | 6 | merchants/business owners | identity/portrait + storefront/work reference | 64x64 world derivative where needed |
| HUM-WHS | 6 | warehouse/sorting/logistics workers | identity + role/equipment reference | 64x64 / scene-prop derivative as implementation requires |
| HUM-FARM | 4 | farmers/agricultural workers | identity + rural work reference | runtime contract per agricultural slice |
| HUM-MECH | 4 | mechanics/maintenance specialists | identity + workshop work reference | HQ/interior derivative per scene contract |
| HUM-MGMT | 4 | office/management specialists | identity + office/work reference | portrait + interior derivative |
| HUM-MULTI | 4 | drone, rail, airport and port specialist visual-direction seed | identity + profession equipment reference | future runtime contract per transport slice |

### Human acceptance

- no obvious same-face cloning;
- no shirt-color-only diversity;
- coherent DROPi Tycoon 3D pre-rendered style;
- materially different silhouettes and identities;
- profession equipment readable;
- recurring identity can be preserved across portrait/world/animation derivatives.

---

# B. Product and Cargo Seed

Target: 60–100 initial product/packaging candidates.

| Product family | Minimum product forms | Logistics forms |
|---|---:|---|
| Fresh produce | 6 | crate, box, pallet |
| Bakery | 5 | retail pack, delivery box, tray/crate |
| Dairy/chilled | 5 | chilled pack, carton, refrigerated tote/pallet |
| Beverages | 6 | bottle/can pack, crate, pallet |
| Household/retail | 6 | retail item, carton, parcel |
| Electronics | 6 | device/accessory, protective box, parcel/pallet |
| Medical/pharma | 6 | medicine/consumable, medical parcel, insulated/special case |
| Industrial parts/tools | 6 | tool/part, crate, pallet |
| Construction materials | 6 | unit/bundle, pallet, bulk-safe visual abstraction |
| Agricultural goods | 6 | produce/input, sack/crate, pallet |
| Energy/technical goods | 6 | battery/module, protected case, pallet |

### Product acceptance

- the player can visually distinguish major categories without reading a paragraph;
- packaging corresponds plausibly to the category;
- cargo art is generic fictional game art, not copied real-world brand packaging;
- products can connect to the canonical supplier -> production -> storage -> distribution -> customer flow.

---

# C. Company / Building Foundation Seed

Target: 24–40 candidate buildings/companies across 12 functional families.

| Family ID | Company type | Initial variants | Product/logistics link |
|---|---|---:|---|
| CO-GROC | grocery/supermarket | 3 | food, beverages, household |
| CO-BAKE | bakery | 2–3 | bakery goods |
| CO-PHAR | pharmacy/medical supplier | 2–3 | medical/pharma |
| CO-ELEC | electronics retailer | 2–3 | electronics |
| CO-FOOD | café/restaurant | 2–3 | food/beverages |
| CO-WORK | local manufacturer/workshop | 2–3 | industrial parts/tools |
| CO-CNST | construction/material supplier | 2–3 | construction materials |
| CO-AGRI | agricultural producer | 2–3 | produce/agricultural inputs |
| CO-WHSE | warehouse/distribution company | 3 | multi-category storage/distribution |
| CO-LOGI | courier/logistics company | 3 | parcels/multi-category cargo |
| CO-COLD | cold-chain operator | 2–3 | chilled/frozen/medical |
| CO-TECH | technology company | 2–3 | electronics/technical goods |

### Building acceptance

- architecture changes materially across families;
- variants change more than color;
- loading/storage/product function is readable where relevant;
- style remains coherent with the approved first asset direction;
- final runtime pixel size is not assigned until the correct building footprint is selected.

---

# D. Existing Runtime Contracts to Respect

| Class | Contract |
|---|---|
| Courier transport atlas | 448x896 transparent; 4x8 cells; 112x112 cell |
| Ambient citizen atlas | 256x256; 4x4 cells; 64x64 cell |
| Static ambient citizen | 64x64 |
| Residential/shop building derivative | current target 138x156 |
| Depot/industrial derivative | current target 164x156 |
| HQ exterior derivative | current target 208x176 |
| Tree family | current target 96x104 |
| UI icon master | recommended 96x96; normally rendered ~48x48/responsive |
| HQ / Marketplace scene | 1200x720 logical scene; modular props rather than flat scene bitmap |

---

# E. Generation Sequence

1. Human diversity seed contact sheet/family candidates.
2. Product + packaging seed contact sheet/family candidates.
3. Company/building foundation contact sheet/family candidates.
4. Owner/project family-level visual checkpoint.
5. Generate production-ready individual assets for approved families.
6. Create only the directional/animation/runtime derivatives required by current executable gameplay.
7. Integrate selected assets under #327/#332/#406-compatible runtime PRs.
8. Android verify player-visible integration.

---

# F. Asset Status Rule

Valid status values:

- `INVENTORIED`
- `SPECIFIED`
- `CANDIDATE`
- `APPROVED_SOURCE`
- `PRODUCTION_READY`
- `RUNTIME_INTEGRATED`
- `ANDROID_VERIFIED`

Current batch state: **INVENTORIED / SPECIFICATION IN PROGRESS**.

---

# Batch Rule

**The first batch proves diversity, economic visibility and style consistency. It must not maximize file count before those three properties are demonstrated.**

---

End of Manifest
