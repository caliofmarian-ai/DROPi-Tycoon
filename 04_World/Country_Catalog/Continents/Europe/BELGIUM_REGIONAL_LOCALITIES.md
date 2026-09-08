# Belgium Regional Representative Localities

Status: country slice for issue #520 under the Europe rollout.

## Administrative model

- first-order term: `Region / Gewest / Région` / `Regions / Gewesten / Régions`;
- English working term: `territorial region`;
- governed first-order units: **3**;
- official references:
  - https://www.belgium.be/sites/default/files/Brochure_2022_Anglais_web.pdf
  - https://verkiezingen.belgium.be/algemeen/belgische-parlementaire-verkiezingsstructuur
  - https://www.vlaanderen.be/gemeenten-en-provincies/brussel/vlaamse-overheid-in-brussel

## Gameplay density

- retained source candidates for Belgium: **2,256**;
- published representative gameplay nodes: **3**;
- direct source first-order-seat selections: **2**;
- governed source fallbacks: **1**;
- high-density source data remains reference/provenance infrastructure and is not the normal gameplay marker set.

## Multiplayer economy rule

Regional representative nodes belong to the shared world. Their prominence/development is governed by aggregate regional/national multiplayer economy, never by one player’s personal progression.

## Representative set

| Admin1 | Region | Representative locality | Source feature | Selection | Source ref |
|---|---|---|---|---|---|
| BE.BRU | Brussels-Capital Region | Brussels | PPLC | source-first-order-seat-role | geonames:2800866 |
| BE.VLG | Flemish Region | Antwerp | PPL | source-admin-fallback | geonames:2803138 |
| BE.WAL | Walloon Region | Namur | PPLA | source-first-order-seat-role | geonames:2790471 |

## Runtime boundary

This slice materializes representative regional identities and economy authority. It does not require every node to be rendered simultaneously and does not define arbitrary economic thresholds.
