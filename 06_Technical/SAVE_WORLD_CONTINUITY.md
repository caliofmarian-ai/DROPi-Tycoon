# Save v2 World Continuity Contract

Issue: #566
Owner lane: DT-02 World Persistence

## Purpose

DROPi Tycoon Save v2 must no longer turn a valid in-progress local delivery into a fresh job at the starting position after reload. This contract adds the smallest governed continuity payload needed to resume the existing local gameplay loop without creating a second gameplay authority or breaking historical Save v2 data.

The top-level save format remains **version 2**. `worldContinuity` is an additive optional field so existing Save v2 payloads remain readable.

## Persisted authority

`worldContinuity.schemaVersion = 1` persists only:

- safe hero world coordinates;
- the current `OrderState` identity and stage;
- the order's existing `economySettled` exactly-once marker;
- explicit cargo custody (`None` or `Player` + `orderId`).

The runtime `PlayerState.currentOrder` and `carryingPackage` flags are not trusted as independent persisted facts. They are reconstructed from the validated order stage:

| Order stage | Restored assignment | Restored player cargo |
| --- | --- | --- |
| `Created` / `Available` | none | none |
| `Accepted` | active order ID | none |
| `PickedUp` | active order ID | player custody |
| `Completed` / `Failed` | none | none |

This prevents a forged or stale duplicated flag from creating cargo that the job state does not own.

## Transient state deliberately excluded

The following are process/input state and are not replayed after reload:

- movement-in-progress;
- tap target;
- pending destination click/selection;
- `acceptRequested` UI intent;
- camera state;
- ambient simulation state;
- dialogue/presentation state.

After restore, movement is stopped, the tap target is placed on the restored hero position, pending delivery selection is cleared, and `acceptRequested` is false.

Movement speed remains derived from the existing company/fleet/active-transport authority after restore rather than being persisted as a second source of truth.

## Hero-position safety

Coordinates must be finite and inside the canonical current world bounds. Unsafe or out-of-bounds coordinates repair to `PLAYER_START`; a valid active order can still be retained.

This is a local Save v2 safety boundary. It does not attempt cross-map coordinate migration. A future map-dataset migration must be explicit and version-aware.

## Exactly-once settlement

The existing delivery settlement authority owns `OrderState.economySettled` and rejects a second settlement when the marker is already true. Save continuity now preserves that marker together with the terminal order and the already-persisted company state.

Therefore a completed/failed settled order cannot become an unsettled replay simply because the process restarted.

A non-terminal order carrying `economySettled: true` is invalid. Decode repairs that marker to false rather than allowing an impossible active-job state.

## Save v2 compatibility and repair

Historical Save v2 payloads do not contain `worldContinuity`. Missing continuity is valid and intentionally keeps the previous safe fallback: materialize a fresh bounded `WorldState` while retaining the historical company/settings/progression domains.

New saves include `worldContinuity`. Malformed optional continuity does not make the whole Save v2 slot incompatible:

- invalid structure or invalid active-order identity drops the continuity extension and falls back safely;
- invalid hero coordinates repair to `PLAYER_START`;
- cargo mismatch repairs from the validated order stage;
- transient accept intent is cleared;
- impossible non-terminal settlement markers are cleared.

The existing staging/primary write protocol, corrupted-save backup behavior, legacy v1 migration and unknown-version rejection remain unchanged.

## Mission Framework boundary

The merged Mission Framework already owns a JSON-safe mission runtime model and sanitization under `game-web/src/missions/**`. DT-02 does **not** copy or reinterpret that model inside `worldContinuity`.

The save schema is the DT-02 authority; mission serialization/resume semantics remain the DT-09 lane. Integration must use the mission-side persistence/resume adapter produced for #566 rather than introducing a second mission engine or duplicating order/cargo/economy state inside mission data.

Until that adapter is integrated, this slice provides complete continuity for the currently live delivery job but does not claim complete authored/systemic mission-chain persistence.

## World Instance / PostgreSQL boundary

This Save v2 extension is the governed compatibility layer for the current local prototype. It does not replace the B2 PostgreSQL World Instance authority introduced by #545 and does not serialize B1 `worldIdentity` into Save v2.

Future trusted World Instance persistence may become authoritative for world-local hero/job/cargo/economic state. Migration must then explicitly define how local Save v2 continuity is imported or retired; both stores must never write the same authoritative online economy concurrently.

## Validation requirements

Automated coverage must prove:

- save after pickup -> reload preserves the same order, stage, hero and player cargo custody;
- transient movement/input does not replay;
- already-settled terminal work cannot settle twice after reload;
- historical Save v2 without continuity remains readable;
- malformed optional continuity repairs or falls back safely;
- invalid duplicated player/cargo facts cannot override the validated order stage.

Installed Android process-kill/relaunch validation remains an owner/release checkpoint once the relevant Android runtime is deployable. This non-visual persistence PR does not claim `ANDROID_VERIFIED`.
