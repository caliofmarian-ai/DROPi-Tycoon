# Physical geography visual layer

Implementation record for #535 / #492. Natural Earth provides a visual land-cover/shaded-relief overview, named rivers, lakes and physical landform labels. `SOURCES.json` pins upstream files by SHA-256 and the vector repository commit. The generated layer contains 449 named river features, 326 named lake features and 406 physical landform labels.

This is cartographic imagery, not elevation simulation. Landform labels do not establish administrative regions. Water outlines do not establish navigability, available water stock or port/transport capacity. Lake coloring comes from the relief image; vector outlines do not fill over its islands.

The Romanian county layer contains the 42 Natural Earth first-order geometries matched by GeoNames county identity. The Sud-Est camera extent groups Brăila, Buzău, Constanța, Galați, Tulcea and Vrancea. This is the NUTS-2 development-region grouping; it is distinct from the county level. Membership was checked against [GISCO NUTS 2024](https://gisco-services.ec.europa.eu/distribution/v2/nuts/). No GISCO polygon geometry is redistributed here.

## Rebuild

Download the exact files in `SOURCES.json` into a source directory, using the pinned Natural Earth vector commit and specified relief archive URL. Preserve registry keys as local filenames. The build rejects mismatched input hashes.

```sh
python scripts/build_visual_geography.py --source-dir /path/to/pinned-sources
```

Requires Pillow. `--vectors-only` regenerates vectors and administrative extracts without recompressing the already generated relief tiles. Production browsers request only local generated assets; no third-party tile subscription or API key is required.

Natural Earth data are [public domain](https://www.naturalearthdata.com/about/terms-of-use/). Dataset descriptions: [relief](https://www.naturalearthdata.com/downloads/50m-raster-data/50m-natural-earth-1/), [rivers](https://www.naturalearthdata.com/downloads/50m-physical-vectors/50m-rivers-lake-centerlines/), [lakes](https://www.naturalearthdata.com/downloads/50m-physical-vectors/50m-lakes-reservoirs/).

## Natural-resource inventory boundary (#493)

The global/country/region resource inventory is a separate governed data/economy authority. The map layer cannot supply quantities of ore, fuel, timber, agricultural production, renewable generation or usable water. No resource reserve is inferred from a map color or assigned a fictional zero.

Canonical resource semantics now live in `02_Economy/GLOBAL_RESOURCE_ECONOMY.md` and `00_Project/GLOBAL_WORLD_ECONOMY_CANON.md`.

Inventory records require: stable resource/deposit/basin identity; source and license; source year and retrieval date; geometry and resolution; country/region ownership resolution; resource category; measurement type; numeric value and unit when known; explicit missing/estimated status; and separate extraction/production/transport capacity.

Country totals must not be uniformly distributed across regions. Shared rivers and deposits need explicit allocation to avoid double counting.

Required categories include minerals/construction materials, fossil energy, fresh water, forests/biomass, agricultural land/output, marine resources and renewable-energy potential. Occurrence, reserve, recoverable quantity, annual production, theoretical potential and installed capacity are different measurements.

A verified source family for water work is [FAO AQUASTAT](https://www.fao.org/aquastat/en/overview/), which supplies country water-resource/use and irrigation information. This visual-geography slice imports none of those quantities. Mineral, energy, agriculture, forest and other source families must likewise be retained, licensed and reconciled before economic authority consumes them.

## Baseline vs simulation

Source-backed physical/resource data seed a versioned World Instance baseline. Later extraction, depletion, productive capacity, ownership, infrastructure, settlement growth and trade are simulated World Instance state and must not be represented as current real-world facts.
