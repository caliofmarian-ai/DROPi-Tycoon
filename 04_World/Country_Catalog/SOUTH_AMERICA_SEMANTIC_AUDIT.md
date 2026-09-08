# South America Country Catalog — Semantic Audit

Parent: #451
Umbrella: #446

Status: current-reality semantic audit supporting the generated South America chapter.

## Confirmed review cases

### Bolivia — geometry 068
The generated catalog currently promotes La Paz as the sole `capital` node. Bolivian institutional material identifies Sucre as the capital of Bolivia, while the executive and legislative seats are located in La Paz. The Country Layer requires role-aware semantics instead of one misleading capital label. Tracked in #472.

### Chile — geometry 152
The generated catalog currently promotes Valparaiso as the `capital` node. Official Chilean sources identify Santiago as the national capital. Valparaiso is the seat of the National Congress and a major port/metropolitan centre. Tracked in #473.

### Falkland Islands / Malvinas — geometry 238
The generated catalog represents the territory with Stanley as a normal territorial capital but does not carry sovereignty-status semantics. The United Nations continues to treat the Question of the Falkland Islands (Malvinas) as an unresolved sovereignty dispute involving Argentina and the United Kingdom. The Country Layer must preserve neutral status semantics and must not encode either claim as settled fact. Tracked in #474.

## Remaining chapter entries
Argentina, Brazil, Colombia, Ecuador, Guyana, Paraguay, Peru, Suriname, Uruguay and Venezuela pass the current structural and capital-role review surface for this chapter.

## Rule
`PASS` requires both structural validity and no known current-reality semantic contradiction. `REVIEW` is used when the pinned source is stale, role-incomplete or politically/status-sensitive enough that the runtime must not present it as an uncontested fact.
