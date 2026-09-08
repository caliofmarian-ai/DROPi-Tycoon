# Global Country Catalog Audit

Status: VERIFIED if `scripts/verify_country_catalog_chapters.py` exits successfully.

Parent: #446

## Global accounting

- rendered topology geometries: **175**
- chapter entries: **175**
- representative locality nodes: **1344**
- PASS: **156**
- REVIEW: **18**
- GAP: **1**
- duplicate geometry assignments: **0**
- missing geometry assignments: **0**

## Chapter totals

| Chapter | Geometries | Nodes | PASS | REVIEW | GAP |
|---|---:|---:|---:|---:|---:|
| Africa | 50 | 416 | 43 | 7 | 0 |
| Asia | 46 | 356 | 41 | 5 | 0 |
| Europe | 39 | 290 | 37 | 2 | 0 |
| North America | 18 | 133 | 18 | 0 | 0 |
| South America | 13 | 107 | 10 | 3 | 0 |
| Oceania | 7 | 37 | 7 | 0 | 0 |
| Special | 2 | 5 | 0 | 1 | 1 |

## Open semantic/data reviews

Every unresolved REVIEW entry has a dedicated issue and a matching persistent entry in `COUNTRY_REVIEW_REGISTRY.json`.

#456, #457, #458, #459, #460, #461, #462, #464, #465, #466, #467, #468, #469, #472, #473, #474, #477, #478

## Exit-gate proof for #446

The verifier enforces the following repository invariants:

1. every rendered topology geometry appears in exactly one continent/special chapter;
2. no chapter contains a geometry absent from the rendered topology;
3. every chapter summary matches its derived row/node/state counts;
4. every country/territory has at most nine representative nodes;
5. every REVIEW row links a dedicated GitHub issue and matches the persistent review registry;
6. every GAP has a documented reason;
7. unresolved semantic corrections remain isolated in their dedicated issues rather than being silently rewritten in the pinned source catalog.

This audit closes the country-by-country accounting/curation scope. It does not claim that the linked REVIEW issues are already corrected in runtime data.
