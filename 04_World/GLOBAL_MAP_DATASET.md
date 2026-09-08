# DROPi Tycoon Global Map Dataset

## Document status

- Status: Canonical world-data provenance record
- Scope: Global strategic map geography only
- Runtime consumer: `game-web/src/scenes/GlobalMapScene.ts`
- Imported file: `game-web/public/data/world-atlas-countries-110m.json`
- Related issue: #418

## Dataset

The first runtime Global Map uses the pinned file distributed by:

- package: `world-atlas`
- version: `2.0.2`
- file: `countries-110m.json`
- runtime repository copy: `game-web/public/data/world-atlas-countries-110m.json`

`world-atlas@2.0.2` is a TopoJSON redistribution derived from Natural Earth Admin 0 country boundaries at the 1:110m scale. Its own documentation identifies Natural Earth data version 4.1.0 as the upstream source for this release.

The 1:110m scale is intentionally used for the global strategic layer because it is small enough for mobile rendering and sufficiently recognizable for world/country selection. Detailed country, regional and local views may later use additional governed datasets where the zoom level requires more detail.

## License and permitted use

Natural Earth states that its raster and vector map data are in the public domain and may be used and modified for personal, educational and commercial projects.

`world-atlas` package metadata uses the ISC license for its redistribution/tooling package.

Source references:

- `https://www.naturalearthdata.com/about/terms-of-use/`
- `https://www.naturalearthdata.com/downloads/110m-cultural-vectors/`
- `https://www.npmjs.com/package/world-atlas`
- `https://github.com/topojson/world-atlas`

## Provenance and reproducibility

The repository copy was imported from the version-pinned distribution URL:

`https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json`

Repository Git blob SHA after import:

`055d19ffcf3133435978527737ff8ad37a568c59`

Imported file size:

`107761 bytes`

The one-time GitHub Action used to transport the file into the branch was removed after successful import. Runtime code does not fetch the CDN copy.

## Political/geographic representation boundary

This dataset is used as recognizable strategic geography, not as a declaration of DROPi Tycoon political policy.

Natural Earth and `world-atlas` have their own boundary/generalization choices. Country IDs and shapes are therefore source-data identifiers and map geometry, not live legal, diplomatic or geopolitical claims by the game.

Future disputed-boundary presentation or alternative point-of-view requirements must be handled as an explicit world-data policy decision rather than silently editing geometry.

## Runtime truth boundary

The map geometry does **not** imply that economic simulation exists for every country.

The first slice is intentionally honest:

- country geometry exists;
- countries can be selected;
- Global -> Country drill-down is structurally available;
- economy/logistics overlays remain `NotActivated` until authoritative domain state exists;
- opening, panning, zooming or drilling into the strategic map never teleports the hero, company assets or cargo.

Later issues may bind country/region/locality entities to World Instance, production, demand, infrastructure and logistics state without replacing this geographic provenance contract.
