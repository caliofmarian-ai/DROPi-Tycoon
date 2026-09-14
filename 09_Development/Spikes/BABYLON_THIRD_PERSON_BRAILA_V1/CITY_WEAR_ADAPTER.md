# Static city custom-wear adapter

Issues #726 / #731, existing evaluation PR #712. Integration base de1ba5d32f28b947d7cd8d1024fbf0c97394373e. All concurrent camera, contact, frame timing and rendered touch gates remain intact.

## Diagnosis

Owner recording Recording_20260914_073123.mp4, visible build 768b4b34, shows red/black authored street surfaces. The actual bundled Street_2Lane.gltf carries normalized vertex colors with red at 65535 while green/blue range down to zero (street decals green/blue only 0–40). Generic glTF COLOR_0 multiplies the material base color. The source pack documents custom vertex-color-controlled wear, so applying those channels as unconditional base-color tint is not the intended shader behavior.

Primary source pack: https://quaternius.com/packs/downtowncitymegakit.html . glTF vertex-color semantics: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html . Checked 2026-09-14.

## Bounded derivative

setupCityVertexWear.mjs runs after the existing material/atlas restoration. It removes the COLOR_0 binding only from MI_* static primitives in the explicit nine-file city allowlist; source binary/accessors remain, the original accessor is recorded in primitive extras. It checks that geometry, UVs, buffers, hierarchy and restored material bindings remain unchanged. Native custom wear is not implemented; the current derivative intentionally uses neutral base material/atlas presentation.

No vehicle/tree GLB, human skin/clothing, collision geometry or gameplay state is changed. Character/jacket colors must not be globally suppressed. Five embedded adapter checks cover neutralization, unrelated colors, source non-mutation, pure-function idempotence and skinned-asset exclusion. Actual derivative verification and final hashes are written to assets/environment/wear-adapter/PROVENANCE.json. Prior pipeline-stage hashes are preserved as lineage rather than treated as final bytes.

## Remaining gates

Render the final derivative and inspect roads/buildings; passing the derivative checks does not prove attractive materials or the Runway visual target. Street footprint/curb alignment, actual Android performance and visual acceptance remain separate checks. This is an evaluation candidate, not production/commercial asset clearance.

Contact diagnostics in this same batch expose each failed actor's pose, position, measured speed and frame duration. The first failed sample is retained even if a later frame recovers. This adds evidence and does not change or weaken any contact threshold.
