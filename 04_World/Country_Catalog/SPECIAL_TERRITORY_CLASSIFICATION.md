# Special Territory and Cross-Region Classification

Status: Canonical audit ledger for #453.

Parent: #446
Special-territory audit: #453

## Governing rule

Geographic chapter placement does **not** assert sovereignty or statehood. The Country Catalog may keep a territory, dependency or disputed geometry in the populated-continent chapter where it is geographically rendered, while this ledger preserves its non-standard political/data classification.

The pinned geometry/locality source remains Natural Earth at upstream commit `ca96624a56bd078437bca8184e78163e5039ad19`. Manual semantic review issues do not silently rewrite that source.

## Explicit classification

| Geometry ID | Rendered geometry | Geographic chapter | Classification | Audit state | Governance |
|---:|---|---|---|---|---|
| 732 | W. Sahara | Africa | indeterminate/disputed territory | REVIEW | #462 — neutral territory-status semantics required |
| 376 | Israel | Asia | special disputed-status semantics in source | REVIEW | #467 — capital/status semantics require neutral handling |
| 275 | Palestine | Asia | indeterminate/disputed status in source | REVIEW | #468 — capital/status semantics require neutral handling |
| None | Kosovo | Europe | disputed/non-standard geometry identity | REVIEW | #478 — replace unsafe `None` catalog identity and preserve neutral status semantics |
| 304 | Greenland | North America | territory within the Kingdom of Denmark | PASS | remain geographically in North America; do not infer independent sovereignty from chapter placement |
| 630 | Puerto Rico | North America | United States dependency/territory | PASS | remain geographically in North America; do not infer independent sovereignty from chapter placement |
| 540 | New Caledonia | Oceania | French dependency / sui-generis territory | PASS | remain geographically in Oceania; do not infer independent sovereignty from chapter placement |
| 238 | Falkland Is. / Malvinas | South America | disputed territory | REVIEW | #474 — neutral unresolved-sovereignty semantics required |
| 010 | Antarctica | Special | Antarctic Treaty / indeterminate sovereignty geometry | REVIEW | #477 — McMurdo is a research/logistics station, not a sovereign national capital |
| 260 | Fr. S. Antarctic Lands | Special | French dependency with no permanent population in the audited source contract | GAP | intentional geometry-only coverage until a truthful supported facility/locality contract is adopted |

## Source-field false positives excluded from Special governance

The Natural Earth `TYPE` field alone is not a sovereignty classifier. Two rendered states entered the automated candidate list because their `TYPE` value is `Sovereignty`, despite `ADMIN == SOVEREIGNT` and ordinary sovereign-state treatment in the current catalog:

- Cuba (`192`) — remains North America PASS.
- Kazakhstan (`398`) — remains Asia PASS.

They are not Special-territory anomalies.

## Antarctic rule

Antarctica must not expose a national-capital concept. Real research/logistics stations may be represented as facilities, but no station may be promoted to a sovereign capital. Territorial positions must remain neutral under the Antarctic Treaty framework.

## French Southern and Antarctic Lands rule

The current zero-node result is intentional. The audited TAAF source states that the territory has no permanent population. The catalog must not fabricate a town or capital merely to satisfy a visual pattern. Future scientific/logistics facilities may only be added through an authoritative facility-level source contract.

## Cross-chapter reconciliation rule

A special-status geometry appears in exactly one geographic manifest. This ledger references it but does not duplicate it into the `Special` chapter unless the continent mapper itself classifies the geometry as `Special`.

Consequently:

- Western Sahara remains in Africa;
- Israel and Palestine remain in Asia;
- Kosovo remains in Europe;
- Greenland and Puerto Rico remain in North America;
- New Caledonia remains in Oceania;
- Falkland Islands/Malvinas remain in South America;
- Antarctica and French Southern and Antarctic Lands remain in Special.

This preserves one-geometry/one-chapter accounting while keeping political/status semantics explicit.

## Exit gate for #453

The Special chapter is complete when:

1. Antarctica is REVIEW-linked to #477 rather than silently accepted as having a capital;
2. French Southern and Antarctic Lands remains an intentional documented GAP;
3. Kosovo's non-numeric identity is REVIEW-linked to #478;
4. all cross-region special-status geometries above are classified without duplication;
5. temporary audit artifacts/workflows are absent from the final PR diff.
