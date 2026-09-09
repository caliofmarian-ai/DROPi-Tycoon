# Global Asset Provenance Contract — #565 / #643

Status: **CANONICAL RELEASE EVIDENCE CONTRACT — IMPLEMENTATION HANDOFF**
Owner lane: DT-13 — Legal / IP / Privacy / Safety
Coordinates: #409, #565, #643
Audit baseline: `08e33ad71e11e4f17eeb1f38d530386ee447d334`

## Purpose

Global locality expansion must remain commercially auditable without requiring one bespoke legal dossier for every generated house, prop, crop, citizen or locality variant.

This contract extends the existing #565 release/provenance system for the scalable world-art lineage:

`Global Style -> Regional/Local Archetype -> Locality-Specific Variant -> Runtime Derivative`

It does not replace the DT-19 asset lifecycle or asset registries. DT-19 remains the production-library owner. DT-13 defines the minimum rights/provenance evidence required for commercial release and the conditions that keep a material family blocked.

## 1. Provenance inheritance model

Evidence is recorded at the highest level where a fact is actually shared, then inherited downward.

### A. Family / generation batch record

One record may cover many controlled variants when they share the same material rights basis.

Required where applicable:

- stable family or batch ID;
- visual/semantic family role;
- provider, tool, model/product or import source;
- generation/import date or bounded batch period;
- provider terms/licence identifier and retained evidence or reference to the terms applicable at that time;
- commercial-use and redistribution review state;
- project prompt/instruction or production brief provenance where retained;
- reference/input set identifiers;
- reference/input rights classification;
- source/master hashes where feasible;
- responsible production record/owner approval evidence;
- prohibited-content review result for real brands, logos and distinctive trade dress;
- legal status: `CLEARED`, `REVIEW_REQUIRED`, or `BLOCKED`.

A family/batch record must not claim facts that are unknown. Unknown provider, terms, input rights or generation-session facts remain explicit blockers rather than guessed values.

### B. Regional/local archetype record

An archetype reuses the family/batch rights basis and records only the additional facts that differ.

Required deltas where applicable:

- stable archetype ID;
- parent family/batch ID;
- geographic or cultural scope;
- whether the design is `SOURCE_BACKED`, `GAME_TRANSLATED`, `INSPIRED`, or `FICTIONAL`;
- factual sources used to establish geometry, landmark identity or locality character;
- reference/input additions not already covered by the parent;
- material transformation/authoring notes;
- archetype source/master hash where feasible;
- rights/provenance status for the new material introduced at this layer.

### C. Locality-specific variant record

A locality variant does not repeat inherited provider/licence facts unless they changed.

Required deltas where applicable:

- stable locality variant ID;
- stable locality ID from the geographic authority;
- parent archetype ID;
- exact source-backed facts added for this locality;
- explicit game-translated/inspired elements so the product does not imply invented detail is factual;
- additional reference/input provenance;
- local signage/brand review result;
- variant source hash where feasible;
- rights/provenance status for locality-specific additions.

### D. Runtime derivative record

Every shipped derivative must remain traceable to a governed source lineage.

Required:

- runtime path or asset ID;
- parent source/variant ID;
- production transformation summary such as crop, alpha cleanup, resize, atlas, LOD or compression;
- source hash and runtime derivative hash where feasible;
- runtime integration state;
- applicable notice/attribution surface if any;
- final release status.

A derivative cannot become legally `CLEARED` merely because the parent is visually `APPROVED_SOURCE` or technically `RUNTIME_INTEGRATED`.

## 2. Reference and factual-source classification

Every external reference used materially in production must be classified by what the project is allowed to rely on it for.

Allowed classifications include:

- `PROJECT_OWNED`;
- `LICENSED_FOR_PRODUCTION`;
- `PUBLIC_DOMAIN`;
- `OPEN_DATA_WITH_OBLIGATIONS`;
- `FACTUAL_RESEARCH_ONLY`;
- `STYLE_RESEARCH_ONLY`;
- `UNKNOWN_OR_UNCLEARED`.

`FACTUAL_RESEARCH_ONLY` and `STYLE_RESEARCH_ONLY` do not grant permission to copy protected expression into runtime art.

A public photograph, map screenshot, street-view image, marketing image, concept-art board or other visible reference must never be treated as commercial runtime rights merely because it can be viewed online.

`UNKNOWN_OR_UNCLEARED` material may guide neither a commercial derivative nor a clearance conclusion until the rights basis is resolved or the input is removed from the production lineage.

## 3. Source-backed geography versus game-translated art

The game must distinguish factual geography from artistic interpretation.

### `SOURCE_BACKED`

Use only when the relevant geometry, identity or factual element is supported by a governed source record.

The source family and its licence/provenance must remain linked to the resulting data/art derivative.

### `GAME_TRANSLATED`

Use when governed factual inputs are transformed into a playable layout or stylized representation that is not claimed to be metrically or architecturally exact.

The player-facing product must not imply invented streets, addresses, building details or commercial occupants are factual.

### `INSPIRED`

Use for locality/regional visual language informed by research without claiming a specific depicted building, façade, sign, address or private business is an exact real-world reproduction.

### `FICTIONAL`

Use for intentionally invented structures, companies, packaging, signs and props.

Fictional content remains subject to trademark/trade-dress screening where it could still create confusingly similar commercial identifiers.

## 4. Global geographic data obligations

This contract does not duplicate geographic provenance records.

Shipped world/locality data must continue to reference the existing canonical source evidence for the exact data family used:

- OpenStreetMap-derived material: preserve attribution, retained source/transformation lineage and the unresolved qualified-review boundary for final ODbL Database / Derivative Database / Produced Work characterization and source-availability obligations;
- GeoNames-derived material: preserve CC BY 4.0 attribution, modification/source notice and exact source snapshot/hash lineage;
- Natural Earth-derived material: retain exact source/version/hash provenance even where the source is treated as public domain.

A locality asset record should reference those canonical data records rather than copy and potentially drift their licence conclusions.

## 5. Real brands, logos, storefronts and trade dress

Default rule for scalable locality generation:

- no real-brand logos without separate permission/rights evidence;
- no copied distinctive packaging or trade dress;
- no branded storefront sign or vehicle livery merely because it exists in source geography or reference imagery;
- no implied sponsorship, partnership or endorsement;
- prefer fictional commercial identity unless a real-world use has been separately cleared.

A factual source proving that a branded storefront exists at a location does not itself provide trademark, copyright or trade-dress rights to reproduce that branding in commercial game art.

## 6. Batch scalability rule

Per-city legal bureaucracy is not required for controlled derivatives that introduce no new rights facts.

A downstream record may inherit the parent family/batch evidence when all of the following are true:

1. the provider/tool/terms basis is unchanged;
2. no new external reference/input with independent rights concerns was introduced;
3. no real-brand/logo/trade-dress material was introduced;
4. the derivative remains inside the governed visual family and production policy;
5. the derivative retains an auditable parent ID and hash/path lineage;
6. no new attribution/licence obligation is created.

When any condition fails, record only the new delta and its evidence. Do not duplicate the entire parent dossier.

## 7. Lifecycle interaction

The DT-19 lifecycle remains:

`INVENTORIED -> SPECIFIED -> CANDIDATE -> APPROVED_SOURCE -> PRODUCTION_READY -> RUNTIME_INTEGRATED -> ANDROID_VERIFIED`

Legal/provenance status is an independent release dimension.

Examples:

- `APPROVED_SOURCE + BLOCKED` is valid: visual approval exists but rights evidence is incomplete;
- `RUNTIME_INTEGRATED + REVIEW_REQUIRED` is valid for prototype development but blocks commercial release;
- `ANDROID_VERIFIED` does not imply licence/trademark clearance;
- `CLEARED` does not imply Android, performance or gameplay acceptance.

No lifecycle state may silently upgrade the legal status.

## 8. Minimum handoff between DT-19 and DT-13

DT-19 should retain the production facts and lineage; DT-13 reviews the release evidence and unresolved legal conditions.

For a new generated/imported family or materially new batch, the handoff must identify at minimum:

- stable family/batch ID;
- provider/tool/import source;
- date/batch period;
- terms/licence evidence reference;
- reference/input classifications;
- source/master hash where feasible;
- controlled-variant rule;
- runtime derivatives when they exist;
- unresolved rights questions.

DT-13 does not need to approve every harmless crop/resize when the inherited lineage remains intact.

## 9. Commercial release gate

A shipped asset lineage is release-blocking when any applicable condition remains unresolved, including:

- unknown generation/import provider or rights basis;
- unknown applicable provider terms for material generated externally;
- uncleared material external reference/input used beyond factual/style research;
- missing required attribution or licence notice;
- unresolved ODbL final-distribution characterization for affected shipped material;
- real-brand/logo/trade-dress use without separate clearance;
- runtime derivative with no auditable parent/source lineage;
- legal record claiming clearance solely from owner visual approval, `APPROVED_SOURCE`, `RUNTIME_INTEGRATED`, Android verification, or CI success.

The commercial gate should remain fail-closed until required evidence exists. Removing a nonessential unresolved asset from the release artifact is an acceptable closure path when its removal is itself verified.

## 10. Existing known blockers remain unchanged

This contract does not clear existing #565 blockers.

In particular it does not invent or resolve:

- the exact generation-session/provider/tool/date/terms/input chain for the already integrated orders icon;
- `DROPi` / `DROPi Tycoon` name/logo/icon trademark or chain-of-title clearance;
- final ODbL characterization and source-availability obligations for the commercial distributed artifacts;
- exact final Android release dependency/native licence closure.

Those remain governed by the existing #565 evidence and external review requirements.

## 11. Privacy / identity boundary — #560

This asset-provenance contract does not authorize collection of player/account data.

Separately, #560 remains a hard gate before durable public/online identity. DT-13's legal/privacy boundary is:

- local/offline identity fields must be represented truthfully as local-only while authentication is not configured;
- public profile data must remain separated from private account data;
- durable account/profile writes require authenticated server-side account/actor binding and authorization from DT-17;
- the data inventory/privacy notice must match the actual fields, purposes, storage, retention and disclosure behavior activated in the shipped build;
- no UI or store representation may claim online account, cloud sync, verification or durable profile protection before the technical authority and corresponding privacy evidence exist.

DT-13 does not waive authentication, authorization, replay, enumeration, rate-limit or abuse-control requirements on behalf of the technical owner.

## 12. Release invariant

> Global content scale changes the granularity of recordkeeping, not the evidentiary standard. Shared facts belong at family/batch level; new rights facts are recorded as deltas; every shipped derivative must remain traceable to a rights-governed lineage.
