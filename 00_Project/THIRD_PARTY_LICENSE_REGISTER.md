# DROPi Tycoon — Third-Party License & Provenance Register

Version: 1.1.0
Status: CANONICAL RELEASE REGISTER — **DRAFT FOR PROFESSIONAL LEGAL REVIEW**
Audit date: 2026-09-08
Continuation review: 2026-09-09
Audit baseline: `main` at `8e340b7131c4bdc890c38ba34e88d94858897cb3`
Coordinates: #409, #411, #412, #413, #414, #561, #565, #570

---

## 1. Purpose

This is the release-facing legal/provenance register for third-party and externally governed material that may ship with DROPi Tycoon.

Every shipped asset, dataset, software dependency, font, icon, sound, music item, reference-derived visual, store image or marketing media item must have enough evidence to establish:

- source/provider/author;
- applicable licence or provider terms;
- commercial-use status;
- modification permission;
- redistribution requirements;
- attribution requirements;
- source/change notices where applicable;
- provenance to the exact runtime/store derivative;
- release status and unresolved legal review.

`free`, `publicly available`, `AI-generated`, `owner-approved` and `open source` are not substitutes for a documented rights basis.

This register is engineering governance, not a final legal opinion. Material licence characterization, trademark clearance and generated-art chain-of-title issues marked for professional review must be resolved by qualified counsel before commercial launch.

---

## 2. Release rule

A material family may ship only when all applicable rows below are either:

- **CLEARED** with retained evidence; or
- covered by a documented, professionally reviewed legal conclusion.

Unresolved material that is not essential should be removed or replaced rather than silently shipped.

Required release evidence should be reproducible from repository state whenever practical.

---

## 3. Register schema

For every material family record:

| Field | Required meaning |
|---|---|
| Asset/data family | What is being distributed or used |
| Source/provider | Original source, provider or author |
| Licence/terms | Exact licence or provider terms/version where known |
| Commercial use | Whether commercial use is permitted under reviewed terms |
| Modification | Whether modification/derivation is permitted |
| Redistribution | Material redistribution/share-alike/source obligations |
| Attribution | Exact credit/link/change notice requirement |
| Provenance evidence | Source URL/snapshot/hash/generation record/manifest |
| Runtime/store derivative | Exact shipped derivative/path |
| Status | CLEARED / REVIEW REQUIRED / BLOCKED / NOT YET SHIPPED |
| Release action | Remaining requirement before commercial release |

---

## 4. OpenStreetMap-derived Brăila data

### 4.1 Current evidence

Repository evidence includes:

- retained Brăila source snapshot at `04_World/City_Plans/Sources/braila-osm-2026-09-08.json`;
- provider identified as OpenStreetMap contributors;
- licence recorded as ODbL 1.0;
- generated `game-web/src/world/brailaLayout.generated.json` with ODbL/source-hash metadata;
- generated Brăila context data with ODbL/source-hash metadata;
- transformation/build scripts retained in repository;
- visible in-game attribution in `game-web/src/ui/UrbanHUD.ts` using `© OpenStreetMap contributors · ODbL`.

### 4.2 Rights/obligations

OSM database material is governed by the Open Database License 1.0 and OpenStreetMap attribution guidance.

Before commercial distribution, qualified review must determine for the exact shipped artifacts whether each relevant output is best characterized as a Database, Derivative Database, Produced Work or another category under the ODbL and what source/share-alike availability mechanism is required.

Engineering must preserve:

- conspicuous attribution appropriate to the product surface;
- an ODbL licence reference/link in legal notices;
- source/snapshot and transformation evidence;
- any required source or derivative-database availability mechanism;
- change notices where required;
- the ability to trace runtime geography to the retained source snapshot.

### 4.3 Register row

| Field | Current record |
|---|---|
| Asset/data family | Brăila OSM-derived streets/building/context geography |
| Source/provider | OpenStreetMap contributors |
| Licence/terms | ODbL 1.0 |
| Commercial use | Permitted subject to licence obligations; final distribution analysis required |
| Modification | Permitted subject to licence obligations |
| Redistribution | ODbL obligations may apply to distributed database/derivative database; exact boundary requires professional review |
| Attribution | OpenStreetMap contributors + ODbL reference |
| Provenance evidence | retained snapshot, source hashes, generation scripts, generated metadata |
| Runtime derivative | Brăila generated layout/context and rendered geographic presentation |
| Status | **REVIEW REQUIRED** |
| Release action | Complete professional ODbL characterization and third-party notice/source-availability design |

**Release blocker:** unresolved ODbL obligations for shipped geography are covered by #565.

Official reference:

https://www.openstreetmap.org/copyright

---

## 5. GeoNames locality data

### 5.1 Current evidence

`04_World/Country_Catalog/EXPANDED_LOCALITY_SOURCE_AUDIT.md` records the selected GeoNames `cities500.zip` source, snapshot/provenance approach and CC BY 4.0 licence.

The repository retains source/version/hash evidence sufficient to support reproducibility of the locality catalog work.

### 5.2 Required release treatment

For any commercial build or distributed data package containing GeoNames-derived material:

- identify GeoNames as the source;
- identify CC BY 4.0;
- provide the licence link/reference;
- indicate modifications/transformations as required;
- retain the exact source snapshot/date/hash;
- ensure attribution appears in an accessible About/Legal/Third-Party Notices surface or other legally sufficient location.

### 5.3 Register row

| Field | Current record |
|---|---|
| Asset/data family | Expanded locality/catalog data |
| Source/provider | GeoNames |
| Licence/terms | CC BY 4.0 |
| Commercial use | Permitted subject to CC BY 4.0 |
| Modification | Permitted subject to CC BY 4.0 |
| Redistribution | Permitted subject to CC BY 4.0 conditions |
| Attribution | GeoNames + CC BY 4.0 + modification/source notice as applicable |
| Provenance evidence | `EXPANDED_LOCALITY_SOURCE_AUDIT.md`, retained snapshot/hash/version evidence |
| Runtime derivative | Country/locality catalog generated data where included in shipped build |
| Status | **REVIEW REQUIRED FOR SHIPPED NOTICE** |
| Release action | Add final user-accessible attribution/third-party notice and verify exact derivative coverage |

**Release blocker:** relevant GeoNames-derived material must not ship without the required attribution evidence.

Official references:

https://www.geonames.org/

https://creativecommons.org/licenses/by/4.0/

---

## 6. Natural Earth

Natural Earth is recorded by existing world-data governance as a public-domain source.

Even where attribution is not legally required, engineering should retain:

- source name;
- dataset/version/date;
- source URL/reference;
- hash or reproducible snapshot identifier;
- transformation scripts;
- output mapping.

| Field | Current record |
|---|---|
| Asset/data family | Natural Earth geographic/world reference data where used |
| Source/provider | Natural Earth |
| Licence/terms | Public-domain source per project provenance record; verify exact downloaded dataset record |
| Commercial use | Expected permitted; retain source evidence |
| Modification | Expected permitted |
| Redistribution | No ODbL-style share-alike assumed; exact source record still retained |
| Attribution | Not treated as mandatory by project record, but credit is acceptable |
| Provenance evidence | world-data governance/source records |
| Status | **CLEARED SUBJECT TO RETAINED PROVENANCE** |
| Release action | Ensure exact source/version/hash remains recorded for each shipped derivative |

---

## 7. Software dependencies

### 7.1 Direct runtime baseline

`game-web/package.json` currently declares direct production dependencies:

- `phaser` 3.90.0;
- `postgres` 3.4.9.

The lockfile contains package-level licence metadata for direct and transitive dependencies.

### 7.2 Required release process

Before each commercial release:

1. generate the complete **production** dependency inventory from the lockfile;
2. record package name/version/licence/source;
3. identify licence-text or notice obligations;
4. flag copyleft, source-disclosure, attribution or unusual commercial restrictions for review;
5. bundle or expose required third-party licence texts/notices;
6. repeat after dependency changes;
7. retain the generated inventory as release evidence.

Do not infer a dependency's rights solely from the fact that it is distributed through npm. The authoritative package/repository licence must be checked where lockfile metadata is insufficient or ambiguous.

| Family | Current status | Release action |
|---|---|---|
| Phaser 3.90.0 | Licence metadata exists in lockfile | Verify authoritative licence and include required notices |
| postgres 3.4.9 | Licence metadata exists in lockfile | Verify authoritative licence and include required notices |
| production transitive dependencies | Not yet consolidated into one release register | Generate inventory and review before release |
| dev-only toolchain | Does not normally ship in production bundle but still requires repository/compliance awareness | Keep separate from shipped dependency notice inventory unless distributed |

Dependency vulnerability/security review remains a separate technical release discipline; licensing approval does not imply security approval.

---

## 8. Project-generated placeholder art

`08_Assets/BATCH_003_PLACEHOLDER_PROVENANCE.md` records the early placeholder PNG family as locally generated by a project agent using simple geometry/Pillow and states that no external assets were downloaded for that batch.

That provenance is useful and should remain retained even if the placeholders are later removed.

Status: **CLEARED AS PROJECT-GENERATED PLACEHOLDER MATERIAL**, subject to the record remaining accurate.

Replacing a placeholder does not transfer its provenance status to the replacement asset; every replacement needs its own record.

---

## 9. Generated world-art families

Current governance includes:

- `08_Assets/Production/Approved_Sources/APPROVED_SOURCE_REGISTER.md`;
- `08_Assets/Production/Approved_Sources/2026-09-07_GENERATED_FAMILY_REGISTRY.md`;
- `08_Assets/Production/Manifests/**`;
- candidate/production/runtime promotion states under #409/#411/#412.

These records establish project/owner **visual approval and lineage**, but visual approval does not by itself answer all commercial IP questions.

Before a generated source family becomes commercially shipped runtime/store material, its legal provenance record should include where feasible:

- generation provider/tool/model/product;
- generation date;
- provider terms/version applicable at generation time;
- project prompts or instruction provenance sufficient for internal traceability where retained;
- reference/input image provenance and permission status;
- confirmation that unlicensed third-party logos/trade dress were not intentionally reproduced;
- human selection/editing/painting/compositing information;
- source hash;
- derivative/runtime hash;
- commercial-use/redistribution conclusion;
- responsible reviewer.

Material brand/key-art assets may also need professional review of chain of title, protectability and trademark/trade-dress risk.

---

## 10. Runtime generated asset finding — `icon-orders.webp`

`game-web/public/assets/production/icon-orders.webp` is already a governed runtime-integrated asset and is identified in repository tests/source as owner-approved generated art.

Current product provenance establishes that it came through the approved asset program, but the release-facing legal record is incomplete unless the exact generation source/provider/terms and derivative lineage are linked to this file.

| Field | Current record |
|---|---|
| Asset/data family | Orders UI icon |
| Source/provider | Approved generated-art family; exact provider/tool record must be linked |
| Licence/terms | Provider terms at generation time not yet consolidated here |
| Commercial use | **REVIEW REQUIRED** |
| Modification | **REVIEW REQUIRED** against provider/source terms |
| Redistribution | **REVIEW REQUIRED** |
| Attribution | Determine after provider/source review |
| Provenance evidence | asset registries + runtime-art adoption code/tests; missing final legal chain record |
| Runtime derivative | `game-web/public/assets/production/icon-orders.webp` |
| Status | **BLOCKED FOR COMMERCIAL RELEASE UNTIL PROVENANCE CLOSED** |
| Release action | Add exact generation/provider/terms/source/derivative record under #565 |

This finding does not require removing the icon from prototype development; it blocks claiming commercial IP clearance until evidence is complete.

---

## 11. Branding assets

The asset canon identifies product branding sources including:

- `dropi-tycoon-logo.png`;
- `dropi-tycoon-app-icon.png`;
- `dropi-tycoon-splash.jpg`.

Before commercial publication, retain for each:

- creation/source provenance;
- generation/design provider and terms where applicable;
- source and final hashes;
- references/input provenance;
- human edits;
- commercial-use conclusion.

Separate from copyright provenance, qualified trademark/name clearance is required for:

- `DROPi`;
- `DROPi Tycoon`;
- logo/wordmark;
- app icon and distinctive source identifiers where applicable.

Repository ownership and owner approval are not substitutes for trademark clearance.

---

## 12. Fonts

No font may be added to a shipped bundle solely because it is downloadable or appears free.

For each font record:

- font family/version;
- author/foundry/provider;
- licence;
- embedding/app distribution rights;
- modification/subsetting rights;
- attribution/notice requirements;
- exact bundled files/hashes.

If only system/browser fonts are referenced and no font binary is distributed, record that boundary rather than inventing a bundled-font licence.

Status: **REVIEW EACH BUNDLED FONT BEFORE SHIPMENT**.

---

## 13. Icons and third-party graphics

Third-party icon packs, map symbols, UI graphics, emoji-derived artwork, stock illustrations or downloaded SVG/PNG files require the same source/licence/provenance treatment as other art.

Do not assume an icon is free for commercial redistribution because a website allows viewing or downloading it.

Project-generated UI icons must still retain generation/source records when material to release provenance.

---

## 14. Audio and music

Runtime code supporting audio does not establish rights to any audio files.

Before music, ambience, voice, effects or radio content ships, record:

- composer/performer/recording owner/provider;
- composition and recording rights where distinct;
- licence/terms;
- commercial game/app synchronization/distribution rights;
- territory/duration limitations;
- attribution requirements;
- modification/looping rights;
- source/final hashes.

No externally sourced music may be placed in trailers, store videos, creator packs or in-game radio without rights covering those uses.

---

## 15. Reference imagery

`08_Assets/Approved_References/**` and source boards may guide visual direction, but a reference being retained internally does not authorize copying protected expression into final art.

For each external reference image used materially in asset production:

- record source;
- classify whether it is project-owned, licensed, public-domain, generated, or used only for factual/style research;
- avoid direct copying of protected characters, logos, packaging or distinctive artwork;
- escalate uncertain reference-to-output similarity for legal review.

---

## 16. Real brands, packaging and trade dress

Default commercial-content rule:

- use fictional companies/products;
- do not use real company logos without explicit permission/licence;
- do not copy distinctive real packaging/trade dress;
- do not imply sponsorship/partnership without authorization;
- do not reproduce branded storefront signs or vehicle liveries merely because real-city geography is used.

Real place names, streets and public geographic identity are legally distinct from private trademarks and commercial branding.

Asset manifests already direct product/cargo art toward generic fictional packaging; this must remain a release invariant.

---

## 17. Store and launch media — #561 / #570

Store screenshots, feature graphics, trailers, launch videos, social assets and creator kits are independently distributed commercial media and must satisfy the same provenance rules as the game binary.

Before publication verify:

- game screenshots reflect the actual build;
- logos/brands visible in captures are authorized or fictional;
- music/audio rights include promotional use;
- stock/reference imagery licences include the required commercial/marketing use;
- generated marketing art has provider/source/terms provenance;
- required third-party attribution is preserved where the media itself requires it;
- no partner/sponsor relationship is implied without authorization;
- legal/privacy disclosures in marketing are consistent with the app.

Agent 15 #561 and Agent 14 #570 should request Agent 13 review of final public assets before publication, not duplicate this register.

---

## 18. Third-party notices surface

Before commercial release, provide an accessible product/store-support route containing applicable:

- OpenStreetMap attribution and ODbL reference;
- GeoNames attribution and CC BY 4.0 reference;
- software dependency licences/notices required for distribution;
- font/icon/audio notices where licences require them;
- other mandatory third-party acknowledgements.

The final presentation may be an About/Legal/Third-Party Notices screen/page plus packaged notice files where appropriate, but it must remain accessible and survive build/store packaging.

A repository-only licence record is not sufficient where a licence requires notice to downstream users.

---

## 19. Release register matrix

| Material family | Current status | Risk | Release blocker? | Required next action | Evidence owner |
|---|---|---|---|---|---|
| OSM-derived Brăila geography | Attribution/provenance exist; distribution characterization unresolved | HIGH | Yes if unresolved | Professional ODbL review + notices/source path | Agent 13 + world-data |
| GeoNames localities | Source/licence/snapshot recorded | HIGH | Yes until shipped attribution is present | Add legal notice and verify derivative scope | Agent 13 + world-data |
| Natural Earth | Public-domain provenance recorded | LOW | No if provenance intact | Retain exact source/version/hash | world-data |
| Phaser/postgres + production transitive deps | Lockfile metadata exists; consolidated release inventory missing | MEDIUM/HIGH | Yes for unresolved mandatory notices/licence conflicts | Generate/review production licence inventory | engineering + Agent 13 |
| BATCH_003 placeholders | Project-generated provenance recorded | LOW | No while record remains accurate | Preserve record or remove with obsolete material | assets |
| Generated source families | Visual/source registries exist; legal generation metadata incomplete | HIGH | Yes for shipped unresolved families | Add provider/terms/input/edit/hash records | assets + Agent 13 |
| `icon-orders.webp` | Runtime integrated; exact legal chain record incomplete | HIGH | Yes for commercial release until closed | Close provenance under #565 | assets + Agent 13 |
| Branding/logo/icon/splash | Product sources identified | HIGH | Yes until creation rights + trademark clearance complete | Provenance + professional trademark review | owner + Agent 13/counsel |
| Fonts | Audit per bundled file | HIGH if introduced unresolved | Yes | Licence/embedding/subsetting register | UI/assets + Agent 13 |
| Audio/music | No rights assumed from runtime code | HIGH if introduced | Yes | Composition/recording/promotional rights register | audio/marketing + Agent 13 |
| External icons/stock/reference art | Per-item review required | HIGH | Yes if unresolved material ships | Source/licence/provenance evidence | asset owner + Agent 13 |
| Store/launch creative #561/#570 | Planned | HIGH | Yes before publication if rights unresolved | Final IP/provenance/disclosure review | Agents 14/15 + Agent 13 |
| Real commercial brands | Fictionalization default | HIGH | Yes unless licensed/cleared | Remove/fictionalize or document permission | content owner + Agent 13 |

---

## 20. Professional review gates

Qualified IP/legal review is required before commercial launch for:

- trademark/name clearance for `DROPi`, `DROPi Tycoon`, logo/icon and promoted names;
- exact ODbL characterization and distribution/source-availability design;
- material generated-art chain-of-title/protectability questions;
- any uncertain third-party reference-to-output similarity;
- any licence with unusual restrictions, copyleft/source-disclosure obligations or commercial-use ambiguity;
- real-brand permissions/sponsorship implications;
- high-value marketing/key art with uncertain provenance.

Engineering can directly solve:

- source/hash manifests;
- dependency inventory generation;
- third-party notices UI/files;
- runtime-to-source traceability;
- provenance metadata fields;
- CI gates that reject missing provenance records;
- fictionalization/removal of unlicensed brands;
- release evidence packaging.

---

## 21. Release checklist

Before marking third-party/IP readiness complete:

- [ ] every shipped third-party dataset has source/licence/provenance evidence;
- [ ] OSM attribution is visible and ODbL distribution obligations are professionally resolved;
- [ ] GeoNames attribution is included in shipped legal notices;
- [ ] Natural Earth provenance is retained;
- [ ] complete production dependency licence inventory is generated and reviewed;
- [ ] required software licence texts/notices are shipped;
- [ ] every runtime art asset is traceable to a cleared source/provenance record;
- [ ] `icon-orders.webp` legal provenance is closed;
- [ ] logo/icon/splash source rights are recorded;
- [ ] trademark clearance is documented;
- [ ] all bundled fonts/icons/audio have reviewed licences;
- [ ] external reference imagery used materially is documented;
- [ ] no unauthorized real logos/packaging/trade dress/liveries remain;
- [ ] store/trailer/creator assets under #561/#570 pass the same rights review;
- [ ] final Third-Party Notices are accessible in the shipped product/support surface;
- [ ] release evidence corresponds to the exact build being submitted.

#565 remains the canonical P0 closure issue for this release gate.

---

End of canonical register.
