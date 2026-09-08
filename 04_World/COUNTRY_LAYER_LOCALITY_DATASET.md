# Country Layer Representative Locality Dataset

Status: Runtime data contract for Issue #442.

## Source
- Natural Earth `ne_10m_populated_places_simple`
- upstream repository: `nvkelso/natural-earth-vector`
- pinned upstream commit: `ca96624a56bd078437bca8184e78163e5039ad19`
- license: Public Domain

Natural Earth provides real city/town coordinates, capital classification, administrative context and population reference fields. DROPi Tycoon does not ship the full source layer at runtime. `scripts/build_country_locality_catalog.py` deterministically reduces it to a sparse catalog bounded to nine representative locality nodes per rendered country.

## Selection contract
Per country:
1. one national capital where source coverage provides it;
2. up to four representative city nodes in N/E/S/W sectors;
3. up to four smaller secondary-locality nodes in NE/SE/SW/NW sectors;
4. fewer nodes are preserved honestly when source coverage is insufficient;
5. every stored coordinate is a real source coordinate; no locality point is manually invented or repositioned.

A cardinal `urban` candidate must be an Admin-1 capital or have a Natural Earth population reference of at least 15,000. Directional alignment and relative importance then select a representative city for the sector. If no truthful qualifying candidate exists, the sector may remain empty instead of promoting a tiny settlement merely to complete the pattern.

Secondary diagonal nodes intentionally permit smaller towns/localities because their purpose is to represent the rural/smaller-settlement layer requested by the product model.

Directional selection uses each country's source settlement extent only to score geographic sectors. It does not move the source coordinates and it does not claim that the selected places are the only important settlements in that country.

## Coverage
The pinned global geometry contains 175 country/territory geometries. Dataset v1.1.0 provides representative nodes for 174 of them and 1,344 nodes in total, with at most nine per country/territory.

The intentional current coverage gap is `Fr. S. Antarctic Lands` (numeric geography ID `260`). Natural Earth has no populated-place records to support a truthful locality node there. The runtime therefore shows the real territory geometry without inventing a settlement. Coverage gaps are persisted in the generated JSON so they remain auditable.

## Runtime purpose
The catalog powers Country Map inspection. It is not yet an economy, route, travel or ownership model. Future administrative, transport, industry and economy overlays must attach authoritative simulation state to these or later-refined geographic entities rather than turning them into decorative traffic.

## Generator requirements
The committed runtime catalog has no Python/runtime dependency. Regeneration is an offline build-time maintenance task and requires Python plus `pycountry` to reconcile Natural Earth ISO alpha-2 values with the numeric ISO country IDs used by the pinned world-atlas topology.
