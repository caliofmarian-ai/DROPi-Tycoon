# World Instance Persistence Readiness and Cutover Dependency Matrix

## Status

DT-02 World Persistence reconciliation for #628, with direct audit coverage for #566 and the persistence prerequisites of #645.

Canonical baseline: `main` `7d4d89447c84cc0ba80d7b6576139f7ddf571f36`.

This reconciliation consumes current merged truth:

- #586 — merged Save v2 hero/order/cargo continuity plus mission resume;
- #630 — merged cross-domain persistence composition / single-writer contract;
- #638 — merged DT-03 Player Economy persistence handoff contract;
- #675 — merged DT-11 playable-locality-instance contract for #643;
- `04_World/PLAYABLE_LOCALITY_INSTANCE_CONTRACT.md` — canonical locality-instance handoff;
- `game-web/src/world/playableLocalityInstance.ts` — canonical `PlayableLocalityInstance` implementation, contract version `1.0.0`;
- #645 — relocation persistence remains a separate DT-02 implementation slice and is **not implemented by this PR**.

**No Save wire-format change, PostgreSQL migration, runtime writer activation, server-world activation or relocation implementation is authorized by this reconciliation.**

---

## 1. Canonical authority rules

For every persisted family, exactly one physical persistence authority may be active:

`for each (worldInstanceId, stateFamily): LocalSaveAuthority XOR ServerWorldAuthority`

Runtime/domain authority and durable persistence authority are different roles:

`live authority != durable persistence authority`

A runtime aggregate, projection, sidecar, DTO, source catalog, shadow comparison or release-readiness object is not automatically a persistence writer.

DT-02 composes owner-domain state into the selected persistence envelope. DT-02 does not redefine the semantic owner of that state.

---

## 2. Canonical single-writer map

| State family | Semantic/live authority | Current durable persistence authority | Readiness | DT-02 boundary / next legal step |
| --- | --- | --- | --- | --- |
| World Instance + hero actor identity | DT-02 identity contracts; online trust consumed from DT-17 | Existing B2 identity repository where that mode is selected; Save v2 does not serialize `worldIdentity` | `MERGED + CONSUMABLE`, with online activation separately gated | Do not add a second identity store. Any online cutover must consume trusted DT-17 identity/authorization. |
| Hero position + active order + cargo custody | Runtime world/order/cargo authority | `SaveGameV2.worldContinuity` -> `SaveWorldContinuityV1` | `MERGED + CONSUMABLE` | Save v2 remains the sole local writer for this family until an explicit server cutover. |
| Delivery terminal settlement replay guard | DT-03 settlement semantics consumed by the world-continuity path | `SaveGameV2.worldContinuity.economySettled` for the existing #566 terminal guard | `MERGED + CONSUMABLE` | Preserve the existing exactly-once guard; do not invent parallel money/receipt storage. |
| Mission runtime / resume | DT-09 mission semantics | `SaveGameV2.missionResume` -> `MissionResumePayloadV1` | `MERGED + CONSUMABLE` | Restore referenced world/order/cargo authority before dependent mission state. Mission never becomes a second money/inventory writer. |
| Existing personal progression | `GameSessionState.personalProgression` / `session.personalProgression` | top-level `SaveGameV2.personalProgression` | `MERGED + CONSUMABLE` | Preserve live-vs-durable separation. `SaveWorldContinuityV1` does **not** own personal progression. |
| Player Economy state/receipts beyond the existing #566 terminal guard | DT-03 | Owner persistence handoff is merged, but no new Save/PostgreSQL writer is activated by #663 | `MERGED + CONSUMABLE` handoff; activation absent | A future DT-02 slice may integrate exactly one selected writer only when DT-00 explicitly opens that cutover. |
| Current/home/start locality + relocation history | DT-11 owns locality identity/readiness; DT-02 owns future persistence composition/relocation persistence | **No active dedicated durable writer** | DT-11 input contract `MERGED + CONSUMABLE`; DT-02 persistence implementation absent | Consume canonical `PlayableLocalityInstance` as input. Do not implement #645 in #663 and do not invent locality/readiness semantics. |
| Rich qualification/training/capability evidence | DT-06 | No DT-02 durable writer activated here | owner-domain input only | Wait for the owning persistence handoff/explicit DT-00 slice; never infer qualification from legacy progression. |
| Production inventory/reservations/contracts/custody | DT-07 | No DT-02 durable writer activated here | owner-domain input only | Wait for DT-07 durable aggregate/transaction handoff; projections are not stock truth. |
| World Clock | DT-18 | No DT-02 durable writer activated here | design/runtime input only | DT-18 defines authoritative tick/replay/catch-up semantics before DT-02 persistence. |
| Settlement development / world evolution | DT-18 | No DT-02 durable writer activated here | owner-domain input only | Persist only a future DT-18-governed locality-keyed evolution aggregate; never create a second world engine. |

---

## 3. Save v2 live-to-durable distinction

The current personal-progression path is explicit:

`GameSessionState.personalProgression`

`-> createSaveGame / serializeGameSession`

`-> SaveGameV2.personalProgression`

`-> decodeSave / restoreGameSessionFromSave`

`-> GameSessionState.personalProgression`

This is the canonical mapping on the baseline above.

Important consequences:

- `session.personalProgression` is the live/runtime source, not the durable schema path;
- `SaveGameV2.personalProgression` is the durable Save-v2 field;
- `SaveWorldContinuityV1` remains scoped to its existing world/order/cargo continuity contract and must not acquire an inferred `personalProgression` field;
- older Save v2 payloads may omit `personalProgression` and restore canonical starter progression under the existing additive compatibility rule;
- #663 changes no Save version and requires no migration.

`game-web/tests/personal-capability-system.test.ts` is the existing guard for this mapping. #663 extends that guard only to make the authority separation explicit; it does not create a second persistence test authority.

---

## 4. DT-11 #675 handoff reconciliation

PR #675 is merged and canonical on this baseline.

The owning DT-11 contract is `04_World/PLAYABLE_LOCALITY_INSTANCE_CONTRACT.md`, implemented by `game-web/src/world/playableLocalityInstance.ts`.

The concrete exported instance type is `PlayableLocalityInstance`; its contract version is `1.0.0` through `PLAYABLE_LOCALITY_INSTANCE_CONTRACT_VERSION`.

DT-02 may consume this contract later as a persistence input because it supplies, among other things:

- stable governed locality identity;
- one `worldInstanceId` binding;
- stable `instanceId` identity derived from World Instance + stable locality identity;
- revision-sensitive `materializationKey`;
- fail-closed reuse/re-entry assessment when source, runtime contract, settlement authority, readiness or evidence changes.

Ownership remains strict:

- DT-11 owns locality identity, source provenance and locality readiness semantics;
- DT-18 owns settlement-development state;
- DT-02 owns only future persistence composition, migration and relocation persistence once explicitly authorized;
- a DT-11 materialization DTO is not itself a Save/PostgreSQL writer.

`CATALOGED != PLAYABLE` remains binding.

`LOCALITY IDENTITY IS PERSISTENT; URBAN STATUS IS DYNAMIC` remains binding.

No missing locality/runtime authority may be replaced with Brăila data.

---

## 5. #566 audit

Merged Save v2 continuity already provides one governed local path for:

`hero position -> active order -> cargo custody -> mission resume`

with the existing terminal `economySettled` replay guard on the world-continuity path.

#566 does not imply that every World Instance family is already persisted. In particular, this reconciliation does not add:

- current/home/start locality persistence;
- relocation history;
- Player Economy state beyond already merged/authorized Save fields;
- rich qualification evidence;
- production state;
- durable World Clock;
- settlement-evolution state;
- Android process-kill/relaunch release evidence.

The correct direction remains extension of one governed writer, never one Save implementation per subsystem.

---

## 6. #628 audit — composition remains authoritative

#630 remains the canonical cross-domain persistence composition rule. #663 reconciles the readiness map to current main; it does not replace #630.

The boundary is:

- owner DT defines semantic state, replay identities and domain invariants;
- DT-02 defines persistence composition, compatibility/migration and active-writer cutover;
- projections consume authoritative state but do not become writers;
- local/server authority cutover is explicit per state family;
- continuous dual-write of the same authoritative family is forbidden;
- shadow comparison is diagnostic only and cannot settle gameplay or act as fallback authority.

---

## 7. #645 relocation status after #675

The former DT-11 DTO prerequisite is resolved: the canonical playable-locality-instance contract is now available for consumption.

That does **not** mean relocation persistence is implemented or implicitly authorized inside #663.

Per DT-00, #645 remains out of scope for this PR. When DT-00 explicitly opens the relocation slice, DT-02 must consume DT-11 identity rather than inventing a second locality aggregate, and the bounded persistence design must preserve at least:

1. `homeCountryId`, `homeLocalityId`, `startingLocalityId`, `currentCountryId`, `currentLocalityId` as distinct facts;
2. source/destination resolved through the DT-11 locality/playable-instance authority;
3. one World Instance + hero binding;
4. stable replay/event identity and exactly-once application;
5. relocation history across save/reload/app restart;
6. no rewriting of home/start when current locality changes;
7. no Brăila/home/origin fallback after legitimate relocation;
8. owner-domain validation/rebinding for locality-scoped mission/order/cargo/economy/capability references;
9. no mint/reset of world-scoped economic history;
10. future compatibility with server ownership without trusting client identity.

No relocation fee or synthetic economy transaction may be invented by DT-02.

---

## 8. Migration and cutover decision

**Save v2 wire format: UNCHANGED.**

**PostgreSQL `003_*`: NOT AUTHORIZED.**

**Runtime persistence writer activation: NONE.**

**Server-world activation: NONE.**

**Relocation #645 implementation: NONE.**

Any future persisted-field/schema change requires an explicit compatibility/migration decision in its own authorized slice.

For any future server cutover, the old local writer must cease being authoritative for that state family when the server writer becomes authoritative. Continuous local/server dual-write remains forbidden.

---

## 9. Validation contract for #663

The intended diff is limited to:

- `06_Technical/WORLD_INSTANCE_PERSISTENCE_READINESS_MATRIX.md`;
- the existing persistence guard in `game-web/tests/personal-capability-system.test.ts`.

Required validation before DT-00 re-audit:

- Prototype CI;
- Full automated test suite;
- Docker smoke.

A green result proves this reconciliation does not regress the repository checks. It does not independently qualify Android/Play, security, legal or commercial release acceptance.

---

## 10. Canonical DT-02 rule

**DT-02 composes merged owner-domain handoffs into one authoritative persistence writer per `(worldInstanceId, stateFamily)`. Live authority and durable persistence authority remain explicitly distinct. DT-02 preserves stable replay identities and backward compatibility, restores referenced authorities before dependent projections, and never invents locality, economy, capability, production, world-evolution or authentication semantics owned by another specialist.**
