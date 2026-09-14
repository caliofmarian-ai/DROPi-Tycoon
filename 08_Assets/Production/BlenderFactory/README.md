# DT-19 Autonomous Blender Asset Factory

Issue: #742  
Parent: #409  
Governance: #411  
Inventory/dedup authority: #414  
Existing Library ingestion owner: #413

## Purpose

This directory provides the first bounded server-side Blender headless pipeline for DROPi Tycoon.

The factory converts an explicit, governed asset request into a candidate `.glb` plus a machine-readable generation report. It is designed for unattended agent/CI execution and has no dependency on Marian's phone or PC.

## Authority boundaries

- `08_Assets/Production/asset-inventory.v1.json` remains the single machine-readable DT-19 inventory/dedup authority.
- `08_Assets/Production/DEMAND_DRIVEN_GENERATION_POLICY.md` remains the generation-policy authority.
- DT-13 remains the sole legal/licence/provenance qualification authority.
- DT-14 remains the release/Android artifact authority.
- #413 owns governed ingestion of already-existing persistent-Library source assets.
- Factory output is **never promoted automatically**. Generation success means only that a bounded candidate passed the technical checks encoded in its request.

The factory must not:
- regenerate an approved source family merely to grow the library;
- infer legal/commercial clearance;
- write secrets or personal data into reports;
- promote a generated candidate to `PRODUCTION_READY`, `RUNTIME_INTEGRATED`, or `ANDROID_VERIFIED`;
- bypass runtime/domain owners that define the actual visual requirement.

## Workflow

1. An executable Issue/PR establishes a missing visual/runtime capability.
2. DT-19 checks the canonical inventory and existing source families.
3. A request JSON records the missing capability, dedup audit, provenance basis, parameters and budgets.
4. `asset_factory.py preflight` fails closed unless the request is complete and policy-safe.
5. Blender runs in background mode using `blender_generate_asset.py`.
6. Blender exports a GLB and generation report into temporary CI storage.
7. `asset_factory.py postflight` validates the GLB header and reported budgets.
8. CI may upload the proof output as an ephemeral workflow artifact for audit.
9. A later governed PR may register/promote an actual asset only through the existing DT-19 lifecycle and DT-13/DT-14 gates.

## Local/server commands

Preflight:

```bash
python3 08_Assets/Production/BlenderFactory/tools/asset_factory.py preflight \
  --request 08_Assets/Production/BlenderFactory/requests/ci-proof-building.request.json
```

Headless generation:

```bash
mkdir -p /tmp/dropi-asset-proof

blender --background \
  --python 08_Assets/Production/BlenderFactory/tools/blender_generate_asset.py \
  -- \
  --request 08_Assets/Production/BlenderFactory/requests/ci-proof-building.request.json \
  --out-dir /tmp/dropi-asset-proof
```

Postflight:

```bash
python3 08_Assets/Production/BlenderFactory/tools/asset_factory.py postflight \
  --request 08_Assets/Production/BlenderFactory/requests/ci-proof-building.request.json \
  --report /tmp/dropi-asset-proof/ci-proof-building.report.json \
  --glb /tmp/dropi-asset-proof/ci-proof-building.glb
```

## Initial proof fixture

`requests/ci-proof-building.request.json` is deliberately:

`TEST_ONLY_NON_PRODUCTION`

It exists only to prove that the server/CI pipeline can execute Blender deterministically and enforce budgets. It is not owner-approved production art and is not registered in `asset-inventory.v1.json`.

## Expansion rule

Later generators may add controlled parameterized buildings, props, vegetation, roads, vehicles, LOD chains, collision proxies and preview renders. Each expansion must remain request-driven, auditable and compatible with the existing inventory/dedup authority.
