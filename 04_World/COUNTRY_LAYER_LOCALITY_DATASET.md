# Country Layer Representative Locality Dataset

Status: Runtime data contract for Issue #442.

## Source
- Natural Earth `ne_10m_populated_places_simple`
- upstream repository: `nvkelso/natural-earth-vector`
- pinned upstream commit: `ca96624a56bd078437bca8184e78163e5039ad19`
- license: Public Domain

Natural Earth provides real city/town coordinates, capital classification, administrative context and population reference fields. DROPi Tycoon does not ship the full source layer at runtime. A deterministic build step reduces it to a sparse catalog bounded to nine representative locality nodes per rendered country.

## Selection contract
Per country:
1. one national capital where source coverage provides it;
2. up to four representative urban nodes in N/E/S/W sectors;
3. up to four smaller secondary-locality nodes in NE/SE/SW/NW sectors;
4. fewer nodes are preserved honestly when source coverage is insufficient;
5. every stored coordinate is a real source coordinate; no locality point is manually invented or repositioned.

Directional selection uses each country's source settlement extent only to score geographic sectors. It does not move the source coordinates and it does not claim that the selected places are the only important settlements in that country.

## Runtime purpose
The catalog powers Country Map inspection. It is not yet an economy, route, travel or ownership model. Future administrative, transport, industry and economy overlays must attach authoritative simulation state to these or later-refined geographic entities rather than turning them into decorative traffic.
