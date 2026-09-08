# Country Semantic Metadata Contract

Status: Canonical runtime semantics contract for country and territory presentation.

Coordinates: #418 #464 #465 #466 #473 #478 #481 #482

Runtime data: `game-web/public/data/country-semantic-metadata-v1.json`

Source-backed locality role overrides: `04_World/Country_Catalog/COUNTRY_LOCALITY_ROLE_OVERRIDES.json`

## Why this layer exists

The representative-locality catalog intentionally keeps a small structural role vocabulary (`capital`, `urban`, `secondary`) because it is derived from a pinned Natural Earth populated-place source and is used for sparse map placement.

That structural role is not sufficient to describe current real-world semantics. Some geometries require distinctions such as constitutional capital, administrative capital, legislative seat, principal administrative centre, commercial capital, claimed capital, research/logistics station, territory status, de facto administration, or disputed recognition.

DROPi therefore keeps political/status and role semantics in a separate source-governed metadata layer rather than forcing every case into one generic `capital` field.

## Governing principles

1. Geographic rendering does not assert sovereignty, recognition or statehood.
2. Internal geometry IDs such as `XKX`, `XNC` and `XSL` are DROPi serialization keys, not ISO codes or political statements.
3. Locality coordinates remain source-backed; semantic metadata may relabel the meaning of a source-backed place but must not invent coordinates or settlements.
4. Politically sensitive wording must cite authoritative or institutional sources and record an access/review date.
5. The runtime may display multiple place roles for one geometry when reality requires them.
6. A source-backed node marked `capital` by the locality dataset must not automatically be rendered to players as `National capital` when semantic metadata provides a more accurate role label.
7. Missing locality coverage remains explicit. Semantic metadata must not fabricate a capital solely to remove a GAP.
8. Source changes and contemporary political-status changes require a new review and metadata version update.
9. A current-reality capital correction may change which source-backed locality receives the structural `capital` role, but only through the governed role-override registry and only when the locality resolves uniquely in the pinned source snapshot.
10. Governed display names may normalize a source-backed locality name, but longitude/latitude and source provenance must remain unchanged.

## Stable special-status entries

### Kosovo (`XKX`) — #478

DROPi follows a status-neutral presentation. The EU routinely uses a Kosovo designation expressly stated to be without prejudice to positions on status and linked to UNSCR 1244 (1999) and the ICJ opinion. Pristina remains the source-backed locality used by the Country Layer, while the runtime wording makes clear that geographic and administrative presentation is not a sovereignty assertion.

### N. Cyprus (`XNC`) — #481

The runtime describes the rendered northern part of Cyprus using the European Commission / Protocol 10 framing: the Government of the Republic of Cyprus does not exercise effective control there and the EU acquis is suspended pending a settlement. The pinned locality source does not currently map representative places safely to `XNC`, so the Country Layer keeps the locality GAP instead of inventing a capital or settlement node.

### Somaliland (`XSL`) — #482

The runtime distinguishes de facto administration from universally settled recognition. UN material documents Somaliland institutions and administration. Israel officially recognized Somaliland on 26 December 2025; UN Security Council proceedings also record Somalia's rejection and sovereignty/territorial-integrity position. The runtime therefore presents Hargeysa as a principal administrative centre rather than silently turning the source `capital` flag into an uncontested national-capital claim.

## Current-reality capital corrections

These entries use `COUNTRY_LOCALITY_ROLE_OVERRIDES.json` to select a different locality already present in the pinned Natural Earth source. The generator fails if a governed locality cannot be resolved uniquely, so no correction may silently introduce coordinates or a synthetic settlement.

### Japan (`392`) — #464

Tokyo is the current national capital. The pinned source previously caused Kyoto to receive the structural capital slot in the sparse catalog. The governed override selects the source-backed Tokyo locality as `capital` and preserves Kyoto as a non-capital representative city.

### Myanmar (`104`) — #465

Nay Pyi Taw is the national capital. Yangon remains a major commercial hub. The governed override selects a source-backed Nay Pyi Taw/Naypyidaw spelling from the pinned source and normalizes the player-facing display name to `Nay Pyi Taw`; Yangon remains a non-capital representative node.

### Sri Lanka (`144`) — #466

Sri Jayewardenepura Kotte and Colombo cannot be represented truthfully by one generic capital label. The governed structural override selects the source-backed Kotte locality for the `capital` slot, while semantic metadata presents it as the administrative/national capital and presents Colombo separately as the commercial capital.

### Chile (`152`) — #473

Santiago is the national capital. Valparaíso hosts the National Congress. The governed override assigns the source-backed Santiago locality to the structural capital slot and preserves source-backed Valparaíso as a non-capital representative locality with an explicit legislative-seat semantic role.

## Role-override registry contract

`COUNTRY_LOCALITY_ROLE_OVERRIDES.json` is deliberately narrower than semantic metadata. It may only govern which localities from the pinned source occupy sparse-map structural roles.

The generator enforces:

- the registry must target the same pinned Natural Earth commit as the locality generator;
- each governed current capital must resolve to exactly one source locality within that geometry's locality pool;
- every required representative must also resolve exactly once;
- coordinates are copied from the pinned feature and are never stored in the override registry;
- current capitals receive the structural `capital` role and `CAPITAL` sector;
- required former/secondary role cities are retained without receiving `capital` by inertia;
- at most nine representative nodes remain allowed per geometry.

## Extensibility

`placeRoles` is intentionally an array rather than a single capital override. Future reviewed entries can therefore express multiple simultaneous roles without changing the locality-coordinate contract. Examples include:

- constitutional or political capital;
- executive/administrative seat;
- legislative seat;
- judicial seat;
- commercial/economic capital;
- claimed capital;
- principal administrative centre;
- research/logistics station.

This layer is the required path for the remaining multi-capital and politically sensitive Country Catalog reviews. It must be extended instead of encoding those distinctions as arbitrary hardcoded UI strings.
