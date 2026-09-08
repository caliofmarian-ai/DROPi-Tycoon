# Country Semantic Metadata Contract

Status: Canonical runtime semantics contract for country and territory presentation.

Coordinates: #418 #453 #459 #460 #461 #462 #464 #465 #466 #473 #478 #481 #482

Runtime data: `game-web/public/data/country-semantic-metadata-v1.json`

Source-backed locality role overrides: `04_World/Country_Catalog/COUNTRY_LOCALITY_ROLE_OVERRIDES.json`

Authoritative locality supplements: `04_World/Country_Catalog/COUNTRY_LOCALITY_AUTHORITATIVE_SUPPLEMENTS.json`

## Why this layer exists

The representative-locality catalog intentionally keeps a small structural role vocabulary (`capital`, `urban`, `secondary`) because it is used for sparse map placement and is normally derived from the pinned Natural Earth populated-place source.

That structural role is not sufficient to describe current real-world semantics. Some geometries require distinctions such as constitutional capital, administrative capital, legislative seat, judicial capital, principal administrative centre, commercial capital, claimed capital, research/logistics station, territory status, de facto administration, or disputed recognition.

DROPi therefore keeps political/status and role semantics in a separate source-governed metadata layer rather than forcing every case into one generic `capital` field.

## Governing principles

1. Geographic rendering does not assert sovereignty, recognition or statehood.
2. Internal geometry IDs such as `XKX`, `XNC` and `XSL` are DROPi serialization keys, not ISO codes or political statements.
3. Locality coordinates must remain source-backed. The normal path is the pinned Natural Earth feature; a reviewed locality absent from that snapshot may use an explicitly governed authoritative supplement carrying its own institutional provenance and original coordinate text.
4. Politically sensitive wording must cite authoritative or institutional sources and record an access/review date.
5. The runtime may display multiple place roles for one geometry when reality requires them.
5a. `territoryStatus`, when present, records a source-governed territory classification separately from locality roles and must state whether final status is resolved.
6. A node marked `capital` by the structural locality dataset must not automatically be rendered to players as `National capital` when semantic metadata provides a more accurate role label.
7. Missing locality coverage remains explicit. Semantic metadata must not fabricate a capital solely to remove a GAP.
8. Source changes and contemporary political-status changes require a new review and metadata version update.
9. A current-reality capital correction may change which locality receives the structural `capital` role only through the governed role-override registry. The locality must either resolve uniquely in the pinned source snapshot or reference an approved authoritative supplement.
10. Governed display names may normalize a source-backed locality name, but the underlying coordinate and provenance must remain unchanged. A supplement must preserve its source coordinate text and deterministic decimal conversion.
11. An authoritative supplement is exceptional current-reality gap remediation, not a second free-form map database and not a license to add estimated coordinates.
12. Multi-capital countries may use one structural `capital` slot for sparse-map stability, but player-facing semantics must preserve every official capital function and must not describe that structural slot as the only national capital when reality is plural.

## Stable special-status entries

### Kosovo (`XKX`) — #478

DROPi follows a status-neutral presentation. The EU routinely uses a Kosovo designation expressly stated to be without prejudice to positions on status and linked to UNSCR 1244 (1999) and the ICJ opinion. Pristina remains the source-backed locality used by the Country Layer, while the runtime wording makes clear that geographic and administrative presentation is not a sovereignty assertion.

### N. Cyprus (`XNC`) — #481

The runtime describes the rendered northern part of Cyprus using the European Commission / Protocol 10 framing: the Government of the Republic of Cyprus does not exercise effective control there and the EU acquis is suspended pending a settlement. The pinned locality source does not currently map representative places safely to `XNC`, so the Country Layer keeps the locality GAP instead of inventing a capital or settlement node.

### Somaliland (`XSL`) — #482

The runtime distinguishes de facto administration from universally settled recognition. UN material documents Somaliland institutions and administration. Israel officially recognized Somaliland on 26 December 2025; UN Security Council proceedings also record Somalia's rejection and sovereignty/territorial-integrity position. The runtime therefore presents Hargeysa as a principal administrative centre rather than silently turning the source `capital` flag into an uncontested national-capital claim.

### Western Sahara (`732`) — #462

Western Sahara remains geographically in the Africa chapter under the one-geometry/one-chapter rule established by #453. The United Nations continues to list Western Sahara as a Non-Self-Governing Territory, and the 2026 C-24 working-paper index includes Western Sahara as A/AC.109/2026/17. MINURSO remains an active United Nations peacekeeping mission in the Territory.

DROPi therefore records a structured `territoryStatus` classification of `un-non-self-governing-territory` with `finalStatusResolved: false`. The runtime status label is `UN Non-Self-Governing Territory`. This is a source-governed UN classification, not a DROPi sovereignty decision.

The pinned Natural Earth locality catalog contains only Bir Lehlou for geometry `732` and assigns it the structural sparse-map capital slot. DROPi preserves that source-backed locality and coordinate, but semantic metadata overrides its player-facing role to `Source-backed representative locality`. The source structural flag must never be surfaced as an uncontested `National capital` claim.

This reconciles #462 with the Special Territory and Cross-Region Classification ledger from #453: special political/status governance does not require moving or duplicating a geometry into the generated `Special` continent chapter.

## Current-reality capital corrections

Most entries use `COUNTRY_LOCALITY_ROLE_OVERRIDES.json` to select a different locality already present in the pinned Natural Earth source. The generator fails if a governed source locality cannot be resolved uniquely, so no ordinary correction may silently introduce coordinates or a synthetic settlement.

When the reviewed current locality does not exist in the pinned snapshot at all, the role override may reference an entry from `COUNTRY_LOCALITY_AUTHORITATIVE_SUPPLEMENTS.json`. That supplement must satisfy the stricter provenance contract described below.

### Japan (`392`) — #464

Tokyo is the current national capital. The pinned source previously caused Kyoto to receive the structural capital slot in the sparse catalog. The governed override selects the source-backed Tokyo locality as `capital` and preserves Kyoto as a non-capital representative city.

### Myanmar (`104`) — #465

Nay Pyi Taw is the national capital. Yangon remains a major commercial hub. The governed override selects a source-backed Nay Pyi Taw/Naypyidaw spelling from the pinned source and normalizes the player-facing display name to `Nay Pyi Taw`; Yangon remains a non-capital representative node.

### Sri Lanka (`144`) — #466

Sri Jayewardenepura Kotte and Colombo cannot be represented truthfully by one generic capital label. The governed structural override selects the source-backed Kotte locality for the `capital` slot, while semantic metadata presents it as the administrative/national capital and presents Colombo separately as the commercial capital.

### Chile (`152`) — #473

Santiago is the national capital. Valparaíso hosts the National Congress. The governed override assigns the source-backed Santiago locality to the structural capital slot and preserves source-backed Valparaíso as a non-capital representative locality with an explicit legislative-seat semantic role.

### Equatorial Guinea (`226`) — #459

Decree-Law No. 1/2026 declared Ciudad de la Paz the capital of Equatorial Guinea on 2 January 2026 and provided a one-year transition for state institutions to take measures for transfer and effective establishment in the new capital. The pinned Natural Earth snapshot predates this current-reality change and does not contain Ciudad de la Paz / former Oyala in geometry `226`.

The governed role override therefore references `equatorial-guinea-ciudad-de-la-paz-2026` from the authoritative supplement registry. The supplement uses the UK Permanent Committee on Geographical Names factfile coordinate `01°35′33″N 10°49′25″E`, preserves that original text and records the deterministic decimal conversion. Ciudad de la Paz receives the structural `capital` slot; Natural Earth-backed Malabo remains represented separately and semantic metadata labels it `Former capital / transition city`.

The legal-capital effective date and the institutional-transition period are deliberately kept distinct: the runtime must not continue calling Malabo the current national capital merely because institutional relocation may continue during the transition.

### South Africa (`710`) — #460

The South African Government identifies three national capital functions: Pretoria is the administrative capital, Cape Town is the legislative capital where Parliament is located, and Bloemfontein is the judicial capital and home to the Supreme Court of Appeal. The same official government overview states that the Constitutional Court is located in Johannesburg.

Natural Earth's pinned locality source contains Pretoria, Cape Town, Bloemfontein and Johannesburg as distinct source-backed localities. DROPi therefore does not need an authoritative supplement. The governed override assigns Pretoria the one structural `capital` slot used by the sparse-map model and forces all three other cities to remain in the <=9 representative-node budget.

Player-facing semantics are authoritative over the structural slot:
- Pretoria — `Administrative capital`;
- Cape Town — `Legislative capital / Parliament`;
- Bloemfontein — `Judicial capital / Supreme Court of Appeal`;
- Johannesburg — `Major city / Constitutional Court`.

Johannesburg must never be described as South Africa's sole national capital simply because Natural Earth marks it with a capital-class feature. Likewise, Cape Town and Bloemfontein must not disappear from the sparse Country Layer merely because only one structural `capital` slot exists.

### Tanzania (`834`) — #461

The Dodoma Capital City (Declaration) Act, 2018 establishes Dodoma as the Capital City of the United Republic of Tanzania. Tanzania's official diplomatic country profile likewise identifies Dodoma as the capital city while describing Dar es Salaam as the commercial capital and major seaport for Tanzania Mainland.

Both localities resolve uniquely in the pinned Natural Earth source. The governed override therefore assigns Dodoma the structural `capital` slot and forces Dar es Salaam to remain in the <=9 sparse representative-node budget without adding or moving coordinates. Player-facing semantic metadata labels Dodoma `National capital` and Dar es Salaam `Commercial capital / major seaport`.

This correction is geographic/semantic only. It must not be interpreted as activating, relocating or otherwise changing DROPi logistics, port, route or economy simulation.

## Role-override registry contract

`COUNTRY_LOCALITY_ROLE_OVERRIDES.json` is deliberately narrower than semantic metadata. It governs which reviewed localities occupy sparse-map structural roles but does not contain arbitrary longitude/latitude fields.

The generator enforces:

- the registry's baseline source target is the same pinned Natural Earth commit as the locality generator;
- each governed source-backed current capital resolves to exactly one locality within that geometry's Natural Earth locality pool;
- every source-backed required representative also resolves exactly once;
- coordinates for ordinary overrides are copied from the pinned feature and are never stored in the role-override registry;
- a current capital absent from Natural Earth must reference an existing authoritative supplement rather than embedding coordinates in the role override;
- current structural capitals receive the `capital` role and `CAPITAL` sector;
- required former, secondary, multi-capital or role-bearing cities are retained without receiving `capital` by inertia;
- at most nine representative nodes remain allowed per geometry.

## Multi-capital semantic contract

The runtime semantic layer, not the single structural `capital` flag, is authoritative for a country's constitutional and functional capital model.

For a multi-capital geometry:
- every official capital locality required by reviewed sources must be present in the sparse node set when source coverage allows it;
- each official function must receive a separate `placeRoles` entry;
- major non-capital institutional cities may receive their own role where that distinction prevents a misleading capital label;
- UI rendering must prefer a matching semantic place-role label over the generic structural role;
- regression tests must verify both the retained locality set and the semantic labels.

South Africa is the reference implementation for three simultaneous national capital functions.

## Authoritative supplement contract

`COUNTRY_LOCALITY_AUTHORITATIVE_SUPPLEMENTS.json` is the exceptional coordinate-bearing registry. It exists only for reviewed current-reality localities absent from the pinned Natural Earth snapshot.

Every supplement must record:

- a review issue;
- the target geometry ID;
- the canonical locality name and relevant former names when documented;
- an institutional source reference with an HTTPS URL;
- the source's original coordinate text;
- deterministic decimal longitude/latitude derived from that coordinate;
- administrative context where available;
- the effective date when the supplement is used to govern a time-sensitive role.

Generated runtime nodes sourced from this registry must expose `sourceKind: authoritative-supplement`, `supplementRef`, `sourceRef`, `sourceCoordinateText` and `effectiveOn`. This provenance is part of the runtime data contract, not build-only commentary.

A supplement may not be created from a visual map estimate, generic search-result pin, undocumented coordinate pair or a desire to fill all nine sparse-map sectors. If a trustworthy institutional coordinate cannot be established, the correct result is an explicit unresolved review/GAP rather than fabrication.

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

## Africa multi-role capital corrections — #456 #457 #458

Benin, Burundi and Côte d’Ivoire use the governed locality-role override registry to distinguish the source-backed structural capital node from a separately retained economic/government city. Porto-Novo/Cotonou, Gitega/Bujumbura and Yamoussoukro/Abidjan remain source-backed Natural Earth localities; player-facing role labels are governed by official national sources.

## Bolivia capital-role correction — #472

Bolivia is governed as a multi-role capital case: Sucre is the constitutional/national capital and La Paz remains the principal government seat and executive/legislative centre. Both localities remain Natural Earth-backed; the role override contains no manual coordinates.
