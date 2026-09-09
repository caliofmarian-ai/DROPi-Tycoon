# Germany Regional Representative Localities

Status: country slice for issue #579 under the Europe rollout.

## Administrative model

- first-order term: `Land` / `Länder`;
- English working term: `federal state`;
- governed first-order units: **16**;
- official references:
  - https://gdz.bkg.bund.de/index.php/default/verwaltungskarte-1-2-500-000-laender-vk2500-l.html
  - https://www.bundesregierung.de/breg-de/schwerpunkte/deutsche-einheit/einigungsvertrag-353990
  - https://www.migration-gesundheit.bund.de/fileadmin/Dateien/pdfs_neu_2022/gesundheitswesen/willkommen-in-deutschland_english.pdf
  - https://www.transparenz.bremen.de/metainformationen/landesverfassung-der-freien-hansestadt-bremen-in-der-fassung-der-bekanntmachung-vom-12-august-2019-150860
  - https://www.hamburg.de/politik-und-verwaltung/

## Gameplay density

- retained source candidates for Germany: **11,920**;
- published representative gameplay nodes: **16**;
- direct source first-order-seat selections: **16**;
- governed source fallbacks: **0**;
- high-density source data remains reference/provenance infrastructure and is not the normal gameplay marker set.

## Multiplayer economy rule

Regional representative nodes belong to the shared world. Their prominence/development is governed by aggregate regional/national multiplayer economy, never by one player’s personal progression.

## Representative set

| Admin1 | Region | Representative locality | Source feature | Selection | Source ref |
|---|---|---|---|---|---|
| DE.01 | Baden-Württemberg | Stuttgart | PPLA | source-first-order-seat-role | geonames:2825297 |
| DE.02 | Bayern | Munich | PPLA | source-first-order-seat-role | geonames:2867714 |
| DE.03 | Bremen | Bremen | PPLA | source-first-order-seat-role | geonames:2944388 |
| DE.04 | Hamburg | Hamburg | PPLA | source-first-order-seat-role | geonames:2911298 |
| DE.05 | Hessen | Wiesbaden | PPLA | source-first-order-seat-role | geonames:2809346 |
| DE.06 | Niedersachsen | Hannover | PPLA | source-first-order-seat-role | geonames:2910831 |
| DE.07 | Nordrhein-Westfalen | Düsseldorf | PPLA | source-first-order-seat-role | geonames:2934246 |
| DE.08 | Rheinland-Pfalz | Mainz | PPLA | source-first-order-seat-role | geonames:2874225 |
| DE.09 | Saarland | Saarbrücken | PPLA | source-first-order-seat-role | geonames:2842647 |
| DE.10 | Schleswig-Holstein | Kiel | PPLA | source-first-order-seat-role | geonames:2891122 |
| DE.11 | Brandenburg | Potsdam | PPLA | source-first-order-seat-role | geonames:2852458 |
| DE.12 | Mecklenburg-Vorpommern | Schwerin | PPLA | source-first-order-seat-role | geonames:2834282 |
| DE.13 | Sachsen | Dresden | PPLA | source-first-order-seat-role | geonames:2935022 |
| DE.14 | Sachsen-Anhalt | Magdeburg | PPLA | source-first-order-seat-role | geonames:2874545 |
| DE.15 | Thüringen | Erfurt | PPLA | source-first-order-seat-role | geonames:2929670 |
| DE.16 | Berlin | Berlin | PPLC | source-first-order-seat-role | geonames:2950159 |

## Runtime boundary

This slice materializes representative regional identities and economy authority. It does not require every node to be rendered simultaneously and does not define arbitrary economic thresholds.

## Germany exceptions

- Berlin, Bremen and Hamburg are governed as city-state Länder.
- The Land Bremen contains the municipalities Bremen and Bremerhaven; Bremen is the single representative Land capital node, while Bremerhaven remains source geography.
- Berlin is both federal capital and Land representative and is the only node with national-capital semantics.
- Runtime geometry `276` is one coarse `Polygon`; no internal Land polygons are fabricated by this slice.
