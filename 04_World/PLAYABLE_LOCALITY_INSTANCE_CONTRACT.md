# Playable Locality Instance Contract

Status: DT-11 executable handoff for #643 and #634.

Contract implementation: `game-web/src/world/playableLocalityInstance.ts`.

## Purpose

The Country/Locality Catalog is geographic identity authority. It is not a city-runtime generator and it is not evidence that a cataloged locality is playable or release-ready.

This contract defines the DT-11 boundary:

`Country -> first-order region/source surface -> stable locality identity -> readiness -> World Instance-bound PlayableLocalityInstance`

It deliberately does not create roads, buildings, economy, missions, population, settlement growth, persistence, release artifacts, legal clearance, or a Brăila fallback.

Canonical invariants:

- `CATALOGED != PLAYABLE`;
- `LOCALITY IDENTITY IS PERSISTENT; URBAN STATUS IS DYNAMIC`;
- Brăila is the premium/reference locality, not an architecture exception;
- same technical gameplay contracts do not imply copied local architecture;
- a source/data/readiness update does not create a second locality identity;
- no runtime may materialize a playable locality from a name/coordinate alone.

## 1. DT-11 identity input

`GovernedLocalityIdentity` carries source-governed identity only:

- `localityId` — stable DROPi locality identity;
- `countryId` — governed country geometry/catalog identity;
- `regionSourceRef` — governed first-order/statistical source surface;
- `sourceRef` — upstream locality reference;
- `sourceCatalog` — repository catalog supplying the locality;
- `sourceCheckpoint` — pinned source/data checkpoint;
- source latitude/longitude.

Coordinates remain source geography. They are not playable layout coordinates and must not be rewritten to encode gameplay scale.

## 2. Readiness authority

DT-11 owns this locality-readiness/content-quality lifecycle:

`CATALOGED -> SOURCE_READY -> PLAYABLE_CONTRACT_READY -> STANDARD_PLAYABLE -> PREMIUM_BESPOKE(optional) -> RELEASE_VERIFIED`

`PREMIUM_BESPOKE` is optional. The two valid release-readiness paths are therefore:

`STANDARD_PLAYABLE -> RELEASE_VERIFIED`

and:

`STANDARD_PLAYABLE -> PREMIUM_BESPOKE -> RELEASE_VERIFIED`

Meanings:

- `CATALOGED`: governed locality identity exists; not playable.
- `SOURCE_READY`: required geographic/source identity is ready; still not playable.
- `PLAYABLE_CONTRACT_READY`: explicit runtime-composition contract exists.
- `STANDARD_PLAYABLE`: governed standard playable-content/runtime coverage exists for the locality's actual context.
- `PREMIUM_BESPOKE`: richer locality-specific authored/visual coverage exists on the same architecture. Brăila is the premium calibration/reference locality.
- `RELEASE_VERIFIED`: DT-11 locality readiness has been verified against explicit evidence references supplied by the authorities that own those evidence domains.

`CATALOGED` and `SOURCE_READY` fail closed even when valid name, source identity and coordinates exist.

Readiness is not settlement development. DT-11 does not define or transition `LATENT`, `HAMLET`, `VILLAGE`, `TOWN`, `CITY`, `LARGE_CITY`, or equivalent DT-18 states. `STANDARD_PLAYABLE`, `PREMIUM_BESPOKE`, and `RELEASE_VERIFIED` do not imply any settlement tier.

## 3. Runtime handoff boundary

A materializable locality requires an opaque `PlayableLocalityRuntimeContractRef`:

- `contractRef`;
- `contractVersion`.

This proves only that the runtime-composition handoff exists. DT-11 does not own the referenced roads, visuals, simulation, economy, missions, spawn implementation, or other downstream systems.

No missing runtime authority may be replaced with Brăila data merely to make materialization pass.

## 4. Settlement-development binding

Every materialization request carries `SettlementDevelopmentAuthorityRef`:

- opaque `authorityRef`;
- the same stable `localityId`.

The locality IDs must match exactly. DT-11 stores no settlement tier and infers no urban maturity from population, feature code, city name, readiness, or premium status.

DT-18 remains the sole owner of settlement evolution.

## 5. RELEASE_VERIFIED evidence boundary

`RELEASE_VERIFIED` requires `LocalityReleaseVerification` with:

- `contentBasis`: either `STANDARD_PLAYABLE` or `PREMIUM_BESPOKE`;
- one or more `LocalityReleaseEvidenceRef` entries containing `authorityRef`, `evidenceRef`, and `evidenceVersion`.

These references are intentionally opaque. DT-11 verifies that the references are structurally present, non-empty and non-duplicated; it does not reinterpret their evidence or become their authority.

This means:

- DT-14 continues to own Android/AAB/Play release-artifact evidence;
- DT-13 continues to own legal/licence/provenance qualification and legal clearance boundaries;
- DT-16 continues to own independent release/audit conclusions;
- any other owning domain remains responsible for the evidence it supplies.

`RELEASE_VERIFIED` therefore does **not** mean:

- settlement maturity;
- automatic Android/AAB/Play verification;
- automatic legal or commercial clearance;
- universal product release approval;
- proof that every global locality is release-ready.

Release evidence is forbidden on non-`RELEASE_VERIFIED` materialization requests, so ordinary playable readiness cannot silently masquerade as release verification.

## 6. Stable instance identity and revision key

`instanceId` derives only from:

`worldInstanceId + stable localityId`

It intentionally excludes source checkpoint, runtime-contract version, readiness and release evidence. Therefore the same locality in the same World Instance keeps one identity as reviewed data/readiness changes.

`materializationKey` is revision-sensitive and binds:

- World Instance;
- locality ID;
- source ref;
- source checkpoint;
- runtime contract ref/version;
- readiness at materialization;
- release verification content basis and evidence references when present.

A readiness promotion or evidence revision changes the materialization key but not the locality instance ID. Consumers must reconcile explicitly rather than silently rewriting locality history.

## 7. Fail-closed restore/re-entry semantics

`assessPlayableLocalityReuse(...)` rejects:

- malformed existing instances;
- another World Instance;
- another locality;
- changed/relabelled source identity;
- changed source checkpoint;
- changed runtime contract;
- changed settlement-development authority;
- changed readiness;
- changed release evidence.

A stale instance is not automatically overwritten. DT-02 may consume this distinction later, but this DT-11 slice adds no Save, PostgreSQL writer, migration, or relocation behavior.

## 8. Source geography vs playable layout

`GovernedLocalityIdentity.latitude/longitude` remain source coordinates only.

Playable geometry belongs to the referenced runtime/local visual authority and may be a governed game translation. Global gameplay scale must preserve source identity instead of rewriting catalog coordinates.

This contract does not claim exact streets, landmarks, addresses, architecture or boundaries where governed evidence is absent.

## 9. Test proof

`game-web/tests/playable-locality-instance.test.ts` proves:

- `CATALOGED` and `SOURCE_READY` cannot materialize;
- `PLAYABLE_CONTRACT_READY`, `STANDARD_PLAYABLE`, and `PREMIUM_BESPOKE` share one architecture;
- `RELEASE_VERIFIED` requires explicit owning-authority evidence references;
- both `STANDARD_PLAYABLE -> RELEASE_VERIFIED` and `PREMIUM_BESPOKE -> RELEASE_VERIFIED` are valid;
- malformed/duplicate release evidence fails closed;
- release evidence cannot be attached to a non-release readiness state;
- readiness/evidence changes preserve instance identity but require reconciliation;
- Brăila can be premium without becoming settlement authority or a global fallback;
- a non-Brăila source-backed locality uses the same contract;
- source/runtime/settlement/world drift fails closed;
- exact replay remains deterministic.

All `RELEASE_VERIFIED` tests use an explicitly synthetic test locality and `test:*` evidence refs. They are contract tests only and do not promote Brăila, Reykjavík, or any real locality to actual release-verified product status.

## 10. Explicit non-goals

This slice does not:

- define the launch-locality selection list;
- mark any real locality `RELEASE_VERIFIED`;
- promote catalog records automatically;
- create a generic city from sparse catalog data;
- create settlement tiers or growth rules;
- create economy, production, mission, story or Living City content;
- create or alter roads/routes/spawn points/POIs;
- change Brăila geometry or source data;
- add Save schema/persistence/migrations;
- implement relocation #645;
- create or attest Android/AAB/Play artifacts;
- make legal/commercial-clearance decisions;
- claim global-playability release acceptance.

## Consumer handoff

After merge, downstream code consumes the stable locality identity plus revision-sensitive handoffs and must fail closed when required bindings are absent or stale.

DT-02 may later design home/start/current locality persistence against this merged identity rather than inventing a second locality aggregate. DT-01/05/07/09/18 consume the same stable World Instance/locality identity while retaining ownership of their domains. DT-14/DT-13/DT-16 remain owners of their release/legal/audit evidence and conclusions.

No consumer is authorized to treat `CATALOGED` or `SOURCE_READY` as playable, or to treat `RELEASE_VERIFIED` as a substitute for another authority's evidence.
