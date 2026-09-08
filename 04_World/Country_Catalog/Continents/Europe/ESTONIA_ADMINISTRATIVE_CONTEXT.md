# Estonia Administrative Context

Status: governed country context for issue #536 under the Europe country-by-country rollout.

## Current territorial model

DROPi uses Estonia's **15 counties (`maakonnad`)** as the first-order territorial/statistical regional layer:

- Harju County
- Hiiu County
- Ida-Viru County
- Jõgeva County
- Järva County
- Lääne County
- Lääne-Viru County
- Põlva County
- Pärnu County
- Rapla County
- Saare County
- Tartu County
- Valga County
- Viljandi County
- Võru County

Current official references:
- Statistics Estonia regional statistics: https://www.stat.ee/en/find-statistics/statistics-by-region
- Statistics Estonia 2026 county datasets: https://stat.ee/en/node/277893
- Ministry of the Interior city/rural-municipality governments grouped by county, updated 2026-07-01: https://www.siseministeerium.ee/linna-ja-vallavalitsused

## Governance semantic boundary

The county layer is a real territorial/statistical subdivision used in current official Estonian data and public administration grouping. DROPi must not present that layer as a duplicate elected local-government tier.

Current operative local government is exercised by city and rural-municipality governments inside the county territories. The regional gameplay node therefore means **territorial/economic aggregation**, not a fabricated county government.

This distinction matters because the shared economy later aggregates company activity, employment, production, logistics, infrastructure and investment by territory even when institutional authority is exercised at a different level.

## Retained-source result

The pinned GeoNames snapshot contains **218 Estonia candidate localities** across exactly **15 admin1 units**, with full locality coverage.

Each county has a direct source `PPLA` representative, except Harju County where Tallinn is `PPLC` and therefore carries both national-capital and regional-node semantics.

No fallback representative is required.

## Representative locality semantics

Representative localities are stable source-backed gameplay/indexing nodes. Their selection does not imply that every county institution or every local-government function is legally vested in that settlement.

Tallinn remains Estonia's unique national-capital locality.

## Multiplayer economy

All 15 county nodes belong to the shared Estonian world economy. Their future prominence and development are aggregate regional/national multiplayer outcomes rather than one player's progression. No arbitrary numeric activation threshold is introduced in this country slice.
