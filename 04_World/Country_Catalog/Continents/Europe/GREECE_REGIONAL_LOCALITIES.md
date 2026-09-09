# Greece Regional Representative Localities

Status: country slice for issue #592 under the Europe rollout.

## Administrative model

- ordinary first-order gameplay term: `Περιφέρεια` / `Περιφέρειες`;
- English working term: `Region`;
- governed ordinary Regions: **13**;
- Gov.gr identifies these as Greece's second-level local government authorities;
- Mount Athos / Aghion Oros is preserved separately as a constitutional self-governed part of the Greek State under Article 105 and is **not** flattened into a fourteenth ordinary Region;
- official references:
  - https://www.gov.gr/en/regions
  - https://www.gov.gr/upourgeia/upourgeio-esoterikon/topike-autodioikese-periphereies
  - https://www.hellenicparliament.gr/vouli-ton-ellinon/to-politevma/syntagma/article-109/

## Gameplay density

- retained GeoNames `GR` candidates in the pinned `cities500` snapshot: **1,986**;
- retained GeoNames admin1 source surfaces: **14** (13 Regions + Mount Athos);
- published normal Country LOD regional representatives: **13**;
- direct source first-order-seat selections: **13**;
- governed source fallbacks: **0**;
- high-density source data remains reference/provenance infrastructure and is not the normal gameplay marker set.

## Special constitutional surface

GeoNames exposes `GR.736572` Mount Athos and `geonames:735972` Karyes as its first-order seat. DROPi retains those source identities for provenance and future special-territory handling, but Karyes is not published as a normal Region representative because Mount Athos is governed constitutionally outside the ordinary 13-Region local-government model.

## Multiplayer economy rule

Regional representative nodes belong to the shared world. Their prominence/development is governed by aggregate regional/national multiplayer economy, never by one player's personal progression.

## Representative set

| Admin1 | Region | Representative locality | Source feature | Selection | Source ref |
|---|---|---|---|---|---|
| GR.ESYE31 | Attica | Athens | PPLC | source-first-order-seat-role | geonames:264371 |
| GR.ESYE24 | Central Greece | Lamía | PPLA | source-first-order-seat-role | geonames:258620 |
| GR.ESYE12 | Central Macedonia | Thessaloníki | PPLA | source-first-order-seat-role | geonames:734077 |
| GR.ESYE43 | Crete | Irákleion | PPLA | source-first-order-seat-role | geonames:261745 |
| GR.ESYE11 | Eastern Macedonia and Thrace | Komotiní | PPLA | source-first-order-seat-role | geonames:735640 |
| GR.ESYE21 | Epirus | Ioánnina | PPLA | source-first-order-seat-role | geonames:261779 |
| GR.ESYE22 | Ionian Islands | Corfu | PPLA | source-first-order-seat-role | geonames:2463679 |
| GR.ESYE41 | North Aegean | Mytilene | PPLA | source-first-order-seat-role | geonames:256866 |
| GR.ESYE25 | Peloponnese | Trípoli | PPLA | source-first-order-seat-role | geonames:252601 |
| GR.ESYE42 | Southern Aegean | Ermoúpolis | PPLA | source-first-order-seat-role | geonames:262603 |
| GR.ESYE14 | Thessaly | Lárisa | PPLA | source-first-order-seat-role | geonames:258576 |
| GR.ESYE23 | Western Greece | Pátra | PPLA | source-first-order-seat-role | geonames:255683 |
| GR.ESYE13 | Western Macedonia | Kozáni | PPLA | source-first-order-seat-role | geonames:735563 |

## Runtime boundary

Current runtime country geometry `300` is a two-component `MultiPolygon`. This slice does not invent internal Region polygons or a fabricated Mount Athos boundary. It materializes stable administrative/locality identities and shared-economy authority only.

**No high-density settlement dump is introduced.**

**Representative locality prominence remains shared-world/economy driven, not personal-player progression.**
