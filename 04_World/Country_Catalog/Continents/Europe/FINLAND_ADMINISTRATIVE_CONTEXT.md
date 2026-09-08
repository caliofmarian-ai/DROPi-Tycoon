# Finland Administrative Context

Status: canonical country context for issue #538 under Europe rollout #508.

## Current 2026 regional model

Statistics Finland's **Regions 2026** classification is valid from 1 January 2026, reports no region changes on that date, and includes **19 regions (`maakunnat`)**. The regional council territories correspond to the regions and regional councils are responsible for regional development in their operating areas.

Official source:
- https://stat.fi/en/luokitukset/maakunta/maakunta_1_20260101

## Åland boundary

Åland is region **21** in the official Finnish regional classification. It is also an autonomous region with its own Parliament and Government and legislative/budgetary powers in devolved fields.

Official Åland source:
- https://www.aland.ax/en/facts-about-aland

DROPi therefore models Åland as one of Finland's 19 first-order regional/economic territories while preserving its autonomous status. This does **not** create a second national sovereignty surface or duplicate territorial ownership.

## Retained-source crosswalk

The retained GeoNames release exposes:
- `FI`: 18 admin1 regional records and 930 candidate localities;
- `AX`: Åland as a separate source country code with 21 candidate localities across three internal source admin1 groups.

The source split is a provider/data-model fact, not DROPi political semantics. For official Finland region 21 Åland, DROPi uses the Statistics Finland region identity and the retained `AX` locality corpus for source-backed representative selection. Mariehamn (`geonames:3041732`, `PPLC`) becomes the Åland regional representative with role `autonomous-region-capital-and-regional-node`, never Finland's national capital.

Helsinki remains Finland's unique `national-capital-and-regional-node`.

## Gameplay/economy rule

All 19 regional nodes belong to the shared Finland economy. `personalPlayerProgressionUnlock=false` and no arbitrary numeric development thresholds are introduced here.
