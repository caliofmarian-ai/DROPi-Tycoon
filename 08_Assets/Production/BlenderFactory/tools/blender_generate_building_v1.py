#!/usr/bin/env python3
"""Generate a deterministic detailed building + high-quality preview for DT-19 CI evidence."""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


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
    for image in list(bpy.data.images):
        if image.name != "Render Result":
            bpy.data.images.remove(image)


def apply_bevel(obj: bpy.types.Object, width: float, segments: int = 1) -> None:
    if width <= 0 or obj.type != "MESH":
        return
    modifier = obj.modifiers.new(name="DROPiBevel", type="BEVEL")
    modifier.width = float(width)
    modifier.segments = int(max(1, segments))
    modifier.limit_method = "ANGLE"
    modifier.angle_limit = math.radians(25.0)
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    obj.select_set(False)


def create_stucco_texture(path: Path, base_rgba: list[float], size: int) -> bpy.types.Image:
    image = bpy.data.images.new("TEX_body_stucco", width=size, height=size, alpha=True)
    pixels: list[float] = []
    for y in range(size):
        for x in range(size):
            low = math.sin(x * 0.137 + y * 0.071) * 0.5 + 0.5
            mid = math.sin(x * 0.517 - y * 0.389 + 1.73) * 0.5 + 0.5
            fine = math.sin(x * 1.913 + y * 1.271 + 0.41) * 0.5 + 0.5
            grain = low * 0.48 + mid * 0.34 + fine * 0.18
            variation = 0.90 + grain * 0.16
            pixels.extend(
                [
                    min(1.0, max(0.0, base_rgba[0] * variation)),
                    min(1.0, max(0.0, base_rgba[1] * variation)),
                    min(1.0, max(0.0, base_rgba[2] * variation)),
                    1.0,
                ]
            )
    image.pixels.foreach_set(pixels)
    image.filepath_raw = str(path)
    image.file_format = "PNG"
    image.save()
    return image


def create_material(
    name: str,
    rgba: list[float],
    roughness: float = 0.72,
    texture: bpy.types.Image | None = None,
) -> bpy.types.Material:
    material = bpy.data.materials.new(name=name)
    material.use_nodes = True
    material.diffuse_color = rgba
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    if bsdf is not None:
        bsdf.inputs["Base Color"].default_value = rgba
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = 0.0
        if texture is not None:
            tex = nodes.new("ShaderNodeTexImage")
            tex.name = f"{name}_base_color"
            tex.image = texture
            tex.interpolation = "Linear"
            links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    return material


def create_glass_material(name: str, rgba: list[float]) -> bpy.types.Material:
    material = create_material(name, rgba, 0.16)
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    if bsdf is not None:
        if "IOR" in bsdf.inputs:
            bsdf.inputs["IOR"].default_value = 1.45
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = 0.18
        elif "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = 0.18
        bsdf.inputs["Metallic"].default_value = 0.04
    return material


def add_box(
    name: str,
    location: tuple[float, float, float],
    scale: tuple[float, float, float],
    material: bpy.types.Material | None,
    asset_objects: list[bpy.types.Object],
    bevel_width: float = 0.0,
    bevel_segments: int = 1,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if material is not None:
        obj.data.materials.append(material)
    apply_bevel(obj, bevel_width, bevel_segments)
    asset_objects.append(obj)
    return obj


def add_gable_roof(
    width: float,
    depth: float,
    base_z: float,
    roof_height: float,
    overhang: float,
    material: bpy.types.Material,
    asset_objects: list[bpy.types.Object],
    bevel_width: float,
) -> bpy.types.Object:
    x = width / 2.0 + overhang
    y = depth / 2.0 + overhang
    z0 = base_z
    z1 = base_z + roof_height
    verts = [
        (-x, -y, z0),
        (x, -y, z0),
        (0.0, -y, z1),
        (-x, y, z0),
        (x, y, z0),
        (0.0, y, z1),
    ]
    faces = [
        (0, 1, 2),
        (3, 5, 4),
        (0, 3, 4, 1),
        (1, 4, 5, 2),
        (2, 5, 3, 0),
    ]
    mesh = bpy.data.meshes.new("BuildingV1RoofMesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new("VISUAL_roof", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(material)
    apply_bevel(obj, bevel_width, 2)
    asset_objects.append(obj)
    return obj


def add_front_window(
    index: int,
    x: float,
    y: float,
    z: float,
    width: float,
    height: float,
    frame: float,
    depth: float,
    detail_bevel: float,
    glass: bpy.types.Material,
    trim: bpy.types.Material,
    asset_objects: list[bpy.types.Object],
) -> None:
    prefix = f"VISUAL_front_window_{index:02d}"
    add_box(
        f"{prefix}_glass",
        (x, y, z),
        (width, depth * 0.35, height),
        glass,
        asset_objects,
        detail_bevel * 0.65,
        1,
    )
    outer_w = width + 2 * frame
    outer_h = height + 2 * frame
    add_box(f"{prefix}_top", (x, y - depth * 0.15, z + outer_h / 2 - frame / 2), (outer_w, depth, frame), trim, asset_objects)
    add_box(f"{prefix}_bottom", (x, y - depth * 0.15, z - outer_h / 2 + frame / 2), (outer_w, depth, frame), trim, asset_objects)
    add_box(f"{prefix}_left", (x - outer_w / 2 + frame / 2, y - depth * 0.15, z), (frame, depth, outer_h), trim, asset_objects)
    add_box(f"{prefix}_right", (x + outer_w / 2 - frame / 2, y - depth * 0.15, z), (frame, depth, outer_h), trim, asset_objects)
    add_box(
        f"{prefix}_sill",
        (x, y - depth * 0.28, z - outer_h / 2 - 0.05),
        (outer_w + 0.22, depth * 1.25, 0.10),
        trim,
        asset_objects,
        detail_bevel,
        1,
    )


def add_side_window(
    index: int,
    x: float,
    y: float,
    z: float,
    width: float,
    height: float,
    frame: float,
    depth: float,
    detail_bevel: float,
    glass: bpy.types.Material,
    trim: bpy.types.Material,
    asset_objects: list[bpy.types.Object],
) -> None:
    prefix = f"VISUAL_side_window_{index:02d}"
    add_box(
        f"{prefix}_glass",
        (x, y, z),
        (depth * 0.35, width, height),
        glass,
        asset_objects,
        detail_bevel * 0.65,
        1,
    )
    outer_w = width + 2 * frame
    outer_h = height + 2 * frame
    add_box(f"{prefix}_top", (x + depth * 0.15, y, z + outer_h / 2 - frame / 2), (depth, outer_w, frame), trim, asset_objects)
    add_box(f"{prefix}_bottom", (x + depth * 0.15, y, z - outer_h / 2 + frame / 2), (depth, outer_w, frame), trim, asset_objects)
    add_box(f"{prefix}_left", (x + depth * 0.15, y - outer_w / 2 + frame / 2, z), (depth, frame, outer_h), trim, asset_objects)
    add_box(f"{prefix}_right", (x + depth * 0.15, y + outer_w / 2 - frame / 2, z), (depth, frame, outer_h), trim, asset_objects)
    add_box(
        f"{prefix}_sill",
        (x + depth * 0.28, y, z - outer_h / 2 - 0.05),
        (depth * 1.25, outer_w + 0.22, 0.10),
        trim,
        asset_objects,
        detail_bevel,
        1,
    )


def triangle_count(mesh: bpy.types.Mesh) -> int:
    return sum(max(0, len(poly.vertices) - 2) for poly in mesh.polygons)


def look_at(obj: bpy.types.Object, target: tuple[float, float, float]) -> None:
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def validate_request_parameters(request: dict) -> dict:
    if request.get("classification") != "TEST_ONLY_NON_PRODUCTION":
        raise RuntimeError("building v1 generator only accepts TEST_ONLY_NON_PRODUCTION requests")
    if request.get("recipe") != "building_facade_v1":
        raise RuntimeError("request.recipe must equal building_facade_v1")
    provenance = request.get("provenance", {})
    if provenance.get("sourceType") != "PROCEDURAL_PRIMITIVES" or provenance.get("externalInputs") != []:
        raise RuntimeError("building v1 generator accepts only procedural primitives with zero external inputs")

    params = request["parameters"]
    positive_float_keys = [
        "width",
        "depth",
        "floorHeight",
        "windowWidth",
        "windowHeight",
        "windowBottom",
        "frameThickness",
        "trimDepth",
        "roofHeight",
        "roofOverhang",
        "bodyBevel",
        "detailBevel",
    ]
    for key in positive_float_keys:
        if float(params[key]) <= 0:
            raise RuntimeError(f"parameters.{key} must be positive")
    for key in ["floors", "frontBays", "sideBays", "bodyTextureSize"]:
        value = int(params[key])
        if value <= 0:
            raise RuntimeError(f"parameters.{key} must be positive")
    if int(params["floors"]) > 6:
        raise RuntimeError("building v1 proof is bounded to at most 6 floors")
    if int(params["frontBays"]) > 8 or int(params["sideBays"]) > 6:
        raise RuntimeError("building v1 bay count exceeds bounded proof limits")
    if int(params["bodyTextureSize"]) > 256:
        raise RuntimeError("building v1 generated texture is bounded to at most 256x256")
    return params


def main() -> int:
    args = parse_args()
    request_path = Path(args.request).resolve()
    out_dir = Path(args.out_dir).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    request = load_request(request_path)
    params = validate_request_parameters(request)

    width = float(params["width"])
    depth = float(params["depth"])
    floor_height = float(params["floorHeight"])
    floors = int(params["floors"])
    front_bays = int(params["frontBays"])
    side_bays = int(params["sideBays"])
    window_width = float(params["windowWidth"])
    window_height = float(params["windowHeight"])
    window_bottom = float(params["windowBottom"])
    frame = float(params["frameThickness"])
    trim_depth = float(params["trimDepth"])
    roof_height = float(params["roofHeight"])
    overhang = float(params["roofOverhang"])
    body_bevel = float(params["bodyBevel"])
    detail_bevel = float(params["detailBevel"])
    texture_size = int(params["bodyTextureSize"])
    body_height = floor_height * floors

    if window_bottom + window_height + frame * 2 >= floor_height:
        raise RuntimeError("window assembly must fit inside one floor height")
    if window_width + frame * 2 >= width / front_bays:
        raise RuntimeError("front window assembly exceeds bay width")
    if window_width + frame * 2 >= depth / side_bays:
        raise RuntimeError("side window assembly exceeds bay width")

    clear_scene()
    asset_objects: list[bpy.types.Object] = []

    stucco_path = out_dir / "generated-body-stucco.png"
    stucco_image = create_stucco_texture(stucco_path, list(params["bodyColor"]), texture_size)
    body_mat = create_material("MAT_body", list(params["bodyColor"]), 0.76, stucco_image)
    trim_mat = create_material("MAT_trim", list(params["trimColor"]), 0.58)
    glass_mat = create_glass_material("MAT_glass", list(params["glassColor"]))
    roof_mat = create_material("MAT_roof", list(params["roofColor"]), 0.66)
    door_mat = create_material("MAT_door", list(params["doorColor"]), 0.48)

    add_box(
        "VISUAL_body",
        (0.0, 0.0, body_height / 2.0),
        (width, depth, body_height),
        body_mat,
        asset_objects,
        body_bevel,
        3,
    )

    front_y = -depth / 2.0 - trim_depth / 2.0
    side_x = width / 2.0 + trim_depth / 2.0
    door_bay = front_bays // 2
    front_index = 0
    side_index = 0

    for floor in range(floors):
        z = floor * floor_height + window_bottom + window_height / 2.0
        for bay in range(front_bays):
            if floor == 0 and bay == door_bay:
                continue
            x = -width / 2.0 + (bay + 0.5) * (width / front_bays)
            add_front_window(
                front_index,
                x,
                front_y,
                z,
                window_width,
                window_height,
                frame,
                trim_depth,
                detail_bevel,
                glass_mat,
                trim_mat,
                asset_objects,
            )
            front_index += 1

        for bay in range(side_bays):
            y = -depth / 2.0 + (bay + 0.5) * (depth / side_bays)
            add_side_window(
                side_index,
                side_x,
                y,
                z,
                window_width,
                window_height,
                frame,
                trim_depth,
                detail_bevel,
                glass_mat,
                trim_mat,
                asset_objects,
            )
            side_index += 1

    door_x = -width / 2.0 + (door_bay + 0.5) * (width / front_bays)
    door_width = min(1.55, width / front_bays * 0.62)
    door_height = min(2.45, floor_height * 0.78)
    door_z = door_height / 2.0
    add_box(
        "VISUAL_entrance_door",
        (door_x, front_y - trim_depth * 0.05, door_z),
        (door_width, trim_depth * 0.55, door_height),
        door_mat,
        asset_objects,
        detail_bevel,
        2,
    )
    door_outer_w = door_width + frame * 2
    add_box("VISUAL_entrance_top", (door_x, front_y - trim_depth * 0.20, door_height + frame / 2), (door_outer_w, trim_depth, frame), trim_mat, asset_objects)
    add_box("VISUAL_entrance_left", (door_x - door_outer_w / 2 + frame / 2, front_y - trim_depth * 0.20, door_z), (frame, trim_depth, door_height + frame), trim_mat, asset_objects)
    add_box("VISUAL_entrance_right", (door_x + door_outer_w / 2 - frame / 2, front_y - trim_depth * 0.20, door_z), (frame, trim_depth, door_height + frame), trim_mat, asset_objects)
    add_box(
        "VISUAL_entrance_awning",
        (door_x, front_y - 0.42, door_height + 0.35),
        (door_outer_w + 0.45, 0.80, 0.14),
        trim_mat,
        asset_objects,
        detail_bevel,
        2,
    )

    add_box(
        "VISUAL_front_plinth",
        (0.0, front_y, 0.28),
        (width + 0.08, trim_depth, 0.56),
        trim_mat,
        asset_objects,
        detail_bevel,
        1,
    )
    add_box(
        "VISUAL_side_plinth",
        (side_x, 0.0, 0.28),
        (trim_depth, depth + 0.08, 0.56),
        trim_mat,
        asset_objects,
        detail_bevel,
        1,
    )
    add_box(
        "VISUAL_front_cornice",
        (0.0, front_y - trim_depth * 0.12, body_height - 0.16),
        (width + 0.28, trim_depth * 1.25, 0.30),
        trim_mat,
        asset_objects,
        detail_bevel,
        2,
    )
    add_box(
        "VISUAL_side_cornice",
        (side_x + trim_depth * 0.12, 0.0, body_height - 0.16),
        (trim_depth * 1.25, depth + 0.28, 0.30),
        trim_mat,
        asset_objects,
        detail_bevel,
        2,
    )

    pilaster_width = min(0.20, width / front_bays * 0.08)
    for boundary in range(front_bays + 1):
        x = -width / 2.0 + boundary * (width / front_bays)
        add_box(
            f"VISUAL_front_pilaster_{boundary:02d}",
            (x, front_y - trim_depth * 0.12, body_height / 2.0),
            (pilaster_width, trim_depth * 1.15, body_height),
            trim_mat,
            asset_objects,
            detail_bevel * 0.75,
            1,
        )

    add_gable_roof(
        width,
        depth,
        body_height,
        roof_height,
        overhang,
        roof_mat,
        asset_objects,
        body_bevel * 0.65,
    )

    collider = add_box(
        "COLLIDER_building",
        (0.0, 0.0, body_height / 2.0),
        (width, depth, body_height),
        None,
        asset_objects,
    )
    collider.display_type = "WIRE"
    collider.hide_render = True
    collider["dropi_collision_proxy"] = True

    bpy.context.scene.unit_settings.system = "METRIC"
    bpy.context.scene.unit_settings.scale_length = 1.0
    bpy.context.scene["dropi_request_id"] = request["requestId"]
    bpy.context.scene["dropi_classification"] = request["classification"]
    bpy.context.scene["dropi_recipe"] = request["recipe"]

    glb_path = out_dir / f"{request['requestId']}.glb"
    report_path = out_dir / f"{request['requestId']}.report.json"
    preview_path = out_dir / f"{request['requestId']}.preview.png"

    bpy.ops.object.select_all(action="DESELECT")
    for obj in asset_objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = asset_objects[0]
    bpy.ops.export_scene.gltf(
        filepath=str(glb_path),
        export_format="GLB",
        use_selection=True,
        export_yup=True,
        export_extras=True,
        export_materials="EXPORT",
    )

    mesh_objects = [obj for obj in asset_objects if obj.type == "MESH"]
    materials = {slot.material.name for obj in mesh_objects for slot in obj.material_slots if slot.material}
    triangles = sum(triangle_count(obj.data) for obj in mesh_objects)
    has_collision = any(bool(obj.get("dropi_collision_proxy")) for obj in mesh_objects)

    bpy.ops.object.select_all(action="DESELECT")
    ground_mat = create_material("MAT_preview_ground", [0.12, 0.13, 0.145, 1.0], 0.88)
    bpy.ops.mesh.primitive_plane_add(size=max(width, depth) * 4.5, location=(0.0, 0.0, -0.015))
    ground = bpy.context.active_object
    ground.name = "PREVIEW_ground"
    ground.data.materials.append(ground_mat)

    bpy.ops.object.camera_add(location=(18.5, -24.0, 7.2))
    camera = bpy.context.active_object
    camera.name = "PREVIEW_camera"
    camera.data.lens = 58
    look_at(camera, (0.0, 0.0, body_height * 0.47))
    bpy.context.scene.camera = camera

    bpy.ops.object.light_add(type="AREA", location=(-7.0, -11.0, body_height + 7.0))
    key = bpy.context.active_object
    key.name = "PREVIEW_key"
    key.data.energy = 1450.0
    key.data.shape = "DISK"
    key.data.size = 9.0
    look_at(key, (0.0, 0.0, body_height * 0.45))

    bpy.ops.object.light_add(type="AREA", location=(10.0, -3.0, body_height + 1.5))
    fill = bpy.context.active_object
    fill.name = "PREVIEW_fill"
    fill.data.energy = 620.0
    fill.data.size = 7.0
    look_at(fill, (0.0, 0.0, body_height * 0.40))

    bpy.ops.object.light_add(type="AREA", location=(-4.0, 8.0, body_height + 4.0))
    rim = bpy.context.active_object
    rim.name = "PREVIEW_rim"
    rim.data.energy = 760.0
    rim.data.size = 5.0
    look_at(rim, (0.0, 0.0, body_height * 0.55))

    bpy.ops.object.light_add(type="SUN", location=(0.0, 0.0, body_height + 10.0))
    sun = bpy.context.active_object
    sun.name = "PREVIEW_sun"
    sun.rotation_euler = (math.radians(31), math.radians(-16), math.radians(27))
    sun.data.energy = 1.35

    world = bpy.context.scene.world
    world.use_nodes = True
    background = world.node_tree.nodes.get("Background")
    if background is not None:
        background.inputs["Color"].default_value = (0.025, 0.032, 0.048, 1.0)
        background.inputs["Strength"].default_value = 0.42

    preview = request.get("preview", {})
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = int(preview.get("width", 1024))
    scene.render.resolution_y = int(preview.get("height", 1024))
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = str(preview_path)
    scene.render.film_transparent = False
    if hasattr(scene, "eevee"):
        if hasattr(scene.eevee, "taa_render_samples"):
            scene.eevee.taa_render_samples = 128
        if hasattr(scene.eevee, "use_gtao"):
            scene.eevee.use_gtao = True
            scene.eevee.gtao_distance = 3.0
            scene.eevee.gtao_factor = 1.25
    try:
        scene.view_settings.look = "AgX - Medium High Contrast"
    except (TypeError, ValueError):
        pass
    bpy.ops.render.render(write_still=True)

    report = {
        "schemaVersion": 1,
        "requestId": request["requestId"],
        "classification": request["classification"],
        "recipe": request["recipe"],
        "generator": "Blender",
        "blenderVersion": bpy.app.version_string,
        "meshObjectCount": len(mesh_objects),
        "materialCount": len(materials),
        "triangleCount": triangles,
        "hasCollisionProxy": has_collision,
        "frontWindowCount": front_index,
        "sideWindowCount": side_index,
        "generatedTextureCount": 1,
        "previewWidth": scene.render.resolution_x,
        "previewHeight": scene.render.resolution_y,
        "glbFile": glb_path.name,
        "previewFile": preview_path.name,
        "automaticPromotion": False,
        "lifecycleCeiling": "CANDIDATE",
        "truthBoundary": "TEST_ONLY_NON_PRODUCTION",
    }
    report_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
