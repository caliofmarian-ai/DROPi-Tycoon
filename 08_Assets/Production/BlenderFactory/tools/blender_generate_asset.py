#!/usr/bin/env python3
"""Generate the DT-19 CI proof asset with Blender in background mode."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import bpy


def parse_args() -> argparse.Namespace:
    argv = sys.argv
    argv = argv[argv.index("--") + 1 :] if "--" in argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--request", required=True)
    parser.add_argument("--out-dir", required=True)
    return parser.parse_args(argv)


def load_request(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for material in list(bpy.data.materials):
        bpy.data.materials.remove(material)


def create_material(name: str, rgba: list[float]) -> bpy.types.Material:
    material = bpy.data.materials.new(name=name)
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    if bsdf is not None:
        bsdf.inputs["Base Color"].default_value = rgba
        bsdf.inputs["Roughness"].default_value = 0.72
        bsdf.inputs["Metallic"].default_value = 0.0
    return material


def add_box(name: str, location: tuple[float, float, float], scale: tuple[float, float, float], material=None):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if material is not None:
        obj.data.materials.append(material)
    return obj


def add_roof(width: float, depth: float, base_z: float, roof_height: float, material):
    y = depth / 2.0
    x = width / 2.0
    z0 = base_z
    z1 = base_z + roof_height
    verts = [
        (-x, -y, z0), (x, -y, z0), (0.0, -y, z1),
        (-x, y, z0), (x, y, z0), (0.0, y, z1),
    ]
    faces = [
        (0, 1, 2),
        (3, 5, 4),
        (0, 3, 4, 1),
        (1, 4, 5, 2),
        (2, 5, 3, 0),
    ]
    mesh = bpy.data.meshes.new("ProofRoofMesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new("VISUAL_roof", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(material)
    return obj


def triangle_count(mesh: bpy.types.Mesh) -> int:
    return sum(max(0, len(poly.vertices) - 2) for poly in mesh.polygons)


def main() -> int:
    args = parse_args()
    request_path = Path(args.request).resolve()
    out_dir = Path(args.out_dir).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    request = load_request(request_path)

    if request.get("classification") != "TEST_ONLY_NON_PRODUCTION":
        raise RuntimeError("baseline generator only accepts TEST_ONLY_NON_PRODUCTION requests")
    if request.get("provenance", {}).get("sourceType") != "PROCEDURAL_PRIMITIVES":
        raise RuntimeError("baseline generator only accepts PROCEDURAL_PRIMITIVES")

    params = request["parameters"]
    width = float(params["width"])
    depth = float(params["depth"])
    floor_height = float(params["floorHeight"])
    floors = int(params["floors"])
    roof_height = float(params["roofHeight"])
    if width <= 0 or depth <= 0 or floor_height <= 0 or floors <= 0 or roof_height <= 0:
        raise RuntimeError("all geometric parameters must be positive")

    body_height = floor_height * floors
    clear_scene()

    body_mat = create_material("MAT_body", list(params["bodyColor"]))
    roof_mat = create_material("MAT_roof", list(params["roofColor"]))

    add_box(
        "VISUAL_body",
        (0.0, 0.0, body_height / 2.0),
        (width, depth, body_height),
        body_mat,
    )
    add_roof(width, depth, body_height, roof_height, roof_mat)

    collider = add_box(
        "COLLIDER_building",
        (0.0, 0.0, body_height / 2.0),
        (width, depth, body_height),
        None,
    )
    collider.display_type = "WIRE"
    collider.hide_render = True
    collider["dropi_collision_proxy"] = True

    bpy.context.scene.unit_settings.system = "METRIC"
    bpy.context.scene.unit_settings.scale_length = 1.0
    bpy.context.scene["dropi_request_id"] = request["requestId"]
    bpy.context.scene["dropi_classification"] = request["classification"]

    glb_path = out_dir / f"{request['requestId']}.glb"
    report_path = out_dir / f"{request['requestId']}.report.json"

    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(
        filepath=str(glb_path),
        export_format="GLB",
        use_selection=True,
        export_yup=True,
        export_extras=True,
        export_materials="EXPORT",
    )

    mesh_objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    materials = {slot.material.name for obj in mesh_objects for slot in obj.material_slots if slot.material}
    triangles = sum(triangle_count(obj.data) for obj in mesh_objects)
    has_collision = any(bool(obj.get("dropi_collision_proxy")) for obj in mesh_objects)

    report = {
        "schemaVersion": 1,
        "requestId": request["requestId"],
        "classification": request["classification"],
        "generator": "Blender",
        "blenderVersion": bpy.app.version_string,
        "meshObjectCount": len(mesh_objects),
        "materialCount": len(materials),
        "triangleCount": triangles,
        "hasCollisionProxy": has_collision,
        "glbFile": glb_path.name,
        "automaticPromotion": False,
        "lifecycleCeiling": "CANDIDATE",
        "truthBoundary": "TEST_ONLY_NON_PRODUCTION"
    }
    report_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
