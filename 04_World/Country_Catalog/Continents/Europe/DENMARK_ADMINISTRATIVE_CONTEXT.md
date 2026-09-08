# Denmark Administrative Context

Status: governed country context for issue #530 under the Europe country-by-country rollout.

## Current 2026 territorial model

DROPi uses Denmark's **five current regions** as the active first-order regional gameplay/economy layer through **31 December 2026**:

1. Capital Region of Denmark (`Region Hovedstaden`)
2. Central Denmark Region (`Region Midtjylland`)
3. North Denmark Region (`Region Nordjylland`)
4. Region Zealand (`Region Sjælland`)
5. Region of Southern Denmark (`Region Syddanmark`)

Current/statutory references:
- https://www.dst.dk/en/Statistik/dokumentation/nomenklaturer/nuts
- https://www.dst.dk/en/Statistik/emner/oekonomi/offentlig-oekonomi/regionernes-regnskaber-og-budgetter
- https://www.elections.im.dk/Media/638061785153051178/Act%20on%20Regions.pdf

The retained GeoNames snapshot aligns directly with exactly five Danish admin1 units and provides a direct `PPLC` or `PPLA` representative for every unit.

## Governed 2027 transition

Region Hovedstaden and Region Sjælland are scheduled to merge into **Region Østdanmark / East Denmark Region** on **1 January 2027**.

Official transition references:
- https://www.regionoest.dk/
- https://www.regionh.dk/region-oestdanmark/sider/region-oestdanmark-sammenlaegning.aspx
- https://www.regionoest.dk/om-region-oestdanmark/en-ny-region-i-danmark

Current 2026 official transition material describes 2026 as a preparation/transition year. The existing Region Hovedstaden and Region Sjælland continue their existing operations through 31 December 2026. The new region becomes operational on 1 January 2027.

## DROPi temporal rule

The repository therefore records temporal validity instead of treating either structure as timeless:
- current five-region ownership is active through `2026-12-31`;
- the East Denmark transition has `effectiveFrom=2027-01-01`;
- the future region is not an additional live 2026 territory;
- source region identities remain auditable so later state migration can reconcile old and new ownership;
- when the game timeline applies the transition, companies, logistics, employment, investment and aggregate economy must migrate continuously rather than reset or duplicate.

## Representative locality semantics

The 2026 representative set is:
- Capital Region of Denmark → Copenhagen (`PPLC`);
- Central Denmark Region → Viborg (`PPLA`);
- North Denmark Region → Aalborg (`PPLA`);
- Region Zealand → Sorø (`PPLA`);
- Region of Southern Denmark → Vejle (`PPLA`).

Copenhagen retains national-capital semantics. Regional representative identity remains a gameplay/indexing role and does not imply that every future administrative function must remain attached to the same city after the 2027 structural transition.

## Multiplayer economy

All five current regional nodes belong to the shared Danish world economy. Development and prominence are collective regional/national outcomes, not personal player unlocks. No arbitrary numeric activation thresholds are introduced in this country slice.
