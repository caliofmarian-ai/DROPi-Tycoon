#!/usr/bin/env python3
"""Generate DT-19 building fidelity V2 LOD0/LOD1 proof assets and previews."""

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


def apply_bevel(obj: bpy.types.Object, width: float, segments: int) -> None:
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
    image = bpy.data.images.new("TEX_v2_body_stucco", width=size, height=size, alpha=True)
    pixels: list[float] = []
    for y in range(size):
        for x in range(size):
            low = math.sin(x * 0.119 + y * 0.083) * 0.5 + 0.5
            mid = math.sin(x * 0.491 - y * 0.367 + 1.19) * 0.5 + 0.5
            fine = math.sin(x * 1.747 + y * 1.313 + 0.71) * 0.5 + 0.5
            grain = low * 0.50 + mid * 0.32 + fine * 0.18
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
    roughness: float,
    texture: bpy.types.Image | None = None,
    metallic: float = 0.0,
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
        bsdf.inputs["Metallic"].default_value = metallic
        if texture is not None:
            tex = nodes.new("ShaderNodeTexImage")
            tex.name = f"{name}_base_color"
            tex.image = texture
            tex.interpolation = "Linear"
            links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    return material


def create_glass_material(name: str, rgba: list[float], tint_shift: float) -> bpy.types.Material:
    shifted = [
        min(1.0, max(0.0, rgba[0] + tint_shift * 0.35)),
        min(1.0, max(0.0, rgba[1] + tint_shift * 0.55)),
        min(1.0, max(0.0, rgba[2] + tint_shift)),
        1.0,
    ]
    material = create_material(name, shifted, 0.13 + abs(tint_shift) * 0.15, metallic=0.04)
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    if bsdf is not None:
        if "IOR" in bsdf.inputs:
            bsdf.inputs["IOR"].default_value = 1.45
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = 0.22
        elif "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = 0.22
    return material


def add_box(
    name: str,
    location: tuple[float, float, float],
    scale: tuple[float, float, float],
    material: bpy.types.Material | None,
    asset_objects: list[bpy.types.Object],
    bevel: float = 0.0,
    bevel_segments: int = 1,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if material is not None:
        obj.data.materials.append(material)
    apply_bevel(obj, bevel, bevel_segments)
    asset_objects.append(obj)
    return obj


def add_cylinder(
    name: str,
    location: tuple[float, float, float],
    radius: float,
    depth: float,
    rotation: tuple[float, float, float],
    material: bpy.types.Material,
    asset_objects: list[bpy.types.Object],
    vertices: int = 12,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=depth,
        location=location,
        rotation=rotation,
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(material)
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
    bevel_segments: int,
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
    mesh = bpy.data.meshes.new("BuildingV2RoofMesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new("VISUAL_roof", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(material)
    apply_bevel(obj, bevel_width, bevel_segments)
    asset_objects.append(obj)
    return obj


def triangle_count(mesh: bpy.types.Mesh) -> int:
    return sum(max(0, len(poly.vertices) - 2) for poly in mesh.polygons)


def look_at(obj: bpy.types.Object, target: tuple[float, float, float]) -> None:
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def validate_request(request: dict) -> dict:
    if request.get("classification") != "TEST_ONLY_NON_PRODUCTION":
        raise RuntimeError("V2 accepts only TEST_ONLY_NON_PRODUCTION requests")
    if request.get("recipe") != "building_fidelity_v2":
        raise RuntimeError("request.recipe must equal building_fidelity_v2")
    lod = request.get("lodProfile")
    if lod not in {"LOD0", "LOD1"}:
        raise RuntimeError("request.lodProfile must equal LOD0 or LOD1")
    provenance = request.get("provenance", {})
    if provenance.get("sourceType") != "PROCEDURAL_PRIMITIVES" or provenance.get("externalInputs") != []:
        raise RuntimeError("V2 accepts only procedural primitives with zero external inputs")

    params = request["parameters"]
    positive = [
        "width",
        "depth",
        "floorHeight",
        "windowWidth",
        "windowHeight",
        "windowBottom",
        "frameThickness",
        "trimDepth",
        "windowRecess",
        "revealThickness",
        "roofHeight",
        "roofOverhang",
        "fasciaHeight",
        "bodyBevel",
        "detailBevel",
    ]
    for key in positive:
        if float(params[key]) <= 0:
            raise RuntimeError(f"parameters.{key} must be positive")
    for key in ["floors", "frontBays", "sideBays", "bodyTextureSize"]:
        if int(params[key]) <= 0:
            raise RuntimeError(f"parameters.{key} must be positive")
    if int(params["floors"]) > 6 or int(params["frontBays"]) > 8 or int(params["sideBays"]) > 6:
        raise RuntimeError("V2 dimensional count exceeds bounded proof limits")
    if int(params["bodyTextureSize"]) > 256:
        raise RuntimeError("V2 generated texture is bounded to at most 256x256")
    if lod == "LOD0" and request["budget"]["maxTriangles"] > 8000:
        raise RuntimeError("LOD0 budget ceiling exceeds issue #751 contract")
    if lod == "LOD1" and request["budget"]["maxTriangles"] > 4000:
        raise RuntimeError("LOD1 budget ceiling exceeds issue #751 contract")
    return params


def add_front_facade(
    *,
    lod: str,
    params: dict,
    body_height: float,
    body_mat: bpy.types.Material,
    trim_mat: bpy.types.Material,
    metal_mat: bpy.types.Material,
    glass_mats: list[bpy.types.Material],
    asset_objects: list[bpy.types.Object],
) -> tuple[int, int]:
    width = float(params["width"])
    depth = float(params["depth"])
    floor_height = float(params["floorHeight"])
    floors = int(params["floors"])
    bays = int(params["frontBays"])
    window_width = float(params["windowWidth"])
    window_height = float(params["windowHeight"])
    window_bottom = float(params["windowBottom"])
    skin = max(0.08, float(params["trimDepth"]))
    recess = float(params["windowRecess"])
    reveal = float(params["revealThickness"])
    mullion = float(params["mullionWidth"])
    detail_bevel = float(params["detailBevel"])
    outer_y = -depth / 2.0
    skin_y = outer_y + skin / 2.0
    glass_y = outer_y + recess + 0.015
    reveal_y = outer_y + recess / 2.0
    bay_width = width / bays
    door_bay = bays // 2
    front_windows = 0
    mullions = 0

    for floor in range(floors):
        floor_z = floor * floor_height
        bottom_h = window_bottom
        top_h = floor_height - window_bottom - window_height
        if bottom_h > 0:
            add_box(
                f"VISUAL_front_floor_{floor:02d}_bottom",
                (0.0, skin_y, floor_z + bottom_h / 2.0),
                (width, skin, bottom_h),
                body_mat,
                asset_objects,
            )
        if top_h > 0:
            add_box(
                f"VISUAL_front_floor_{floor:02d}_top",
                (0.0, skin_y, floor_z + window_bottom + window_height + top_h / 2.0),
                (width, skin, top_h),
                body_mat,
                asset_objects,
            )

        for bay in range(bays):
            bay_left = -width / 2.0 + bay * bay_width
            bay_center = bay_left + bay_width / 2.0
            if floor == 0 and bay == door_bay:
                add_box(
                    f"VISUAL_front_doorbay_wall_{bay:02d}",
                    (bay_center, skin_y, floor_z + window_bottom + window_height / 2.0),
                    (bay_width, skin, window_height),
                    body_mat,
                    asset_objects,
                )
                continue

            gap_each = max(0.05, (bay_width - window_width) / 2.0)
            add_box(
                f"VISUAL_front_window_{front_windows:02d}_wall_left",
                (bay_left + gap_each / 2.0, skin_y, floor_z + window_bottom + window_height / 2.0),
                (gap_each, skin, window_height),
                body_mat,
                asset_objects,
            )
            add_box(
                f"VISUAL_front_window_{front_windows:02d}_wall_right",
                (bay_left + bay_width - gap_each / 2.0, skin_y, floor_z + window_bottom + window_height / 2.0),
                (gap_each, skin, window_height),
                body_mat,
                asset_objects,
            )

            z = floor_z + window_bottom + window_height / 2.0
            glass_mat = glass_mats[front_windows % len(glass_mats)]
            add_box(
                f"VISUAL_front_window_{front_windows:02d}_glass",
                (bay_center, glass_y, z),
                (window_width, 0.035, window_height),
                glass_mat,
                asset_objects,
                detail_bevel * 0.40,
                1,
            )

            reveal_depth = recess
            add_box(
                f"VISUAL_front_window_{front_windows:02d}_reveal_left",
                (bay_center - window_width / 2.0 - reveal / 2.0, reveal_y, z),
                (reveal, reveal_depth, window_height + reveal * 2.0),
                trim_mat,
                asset_objects,
            )
            add_box(
                f"VISUAL_front_window_{front_windows:02d}_reveal_right",
                (bay_center + window_width / 2.0 + reveal / 2.0, reveal_y, z),
                (reveal, reveal_depth, window_height + reveal * 2.0),
                trim_mat,
                asset_objects,
            )
            add_box(
                f"VISUAL_front_window_{front_windows:02d}_reveal_top",
                (bay_center, reveal_y, z + window_height / 2.0 + reveal / 2.0),
                (window_width, reveal_depth, reveal),
                trim_mat,
                asset_objects,
            )
            add_box(
                f"VISUAL_front_window_{front_windows:02d}_sill",
                (bay_center, outer_y - 0.055, z - window_height / 2.0 - reveal / 2.0),
                (window_width + reveal * 2.4, skin + 0.20, reveal),
                trim_mat,
                asset_objects,
                detail_bevel,
                1,
            )

            if lod == "LOD0" and mullion > 0:
                add_box(
                    f"VISUAL_front_window_{front_windows:02d}_mullion_v",
                    (bay_center, glass_y - 0.022, z),
                    (mullion, 0.045, window_height * 0.94),
                    metal_mat,
                    asset_objects,
                )
                add_box(
                    f"VISUAL_front_window_{front_windows:02d}_mullion_h",
                    (bay_center, glass_y - 0.022, z),
                    (window_width * 0.94, 0.045, mullion),
                    metal_mat,
                    asset_objects,
                )
                mullions += 2
            front_windows += 1

    return front_windows, mullions


def add_right_facade(
    *,
    lod: str,
    params: dict,
    body_mat: bpy.types.Material,
    trim_mat: bpy.types.Material,
    metal_mat: bpy.types.Material,
    glass_mats: list[bpy.types.Material],
    asset_objects: list[bpy.types.Object],
) -> tuple[int, int]:
    width = float(params["width"])
    depth = float(params["depth"])
    floor_height = float(params["floorHeight"])
    floors = int(params["floors"])
    bays = int(params["sideBays"])
    window_width = float(params["windowWidth"])
    window_height = float(params["windowHeight"])
    window_bottom = float(params["windowBottom"])
    skin = max(0.08, float(params["trimDepth"]))
    recess = float(params["windowRecess"])
    reveal = float(params["revealThickness"])
    mullion = float(params["mullionWidth"])
    detail_bevel = float(params["detailBevel"])
    outer_x = width / 2.0
    skin_x = outer_x - skin / 2.0
    glass_x = outer_x - recess - 0.015
    reveal_x = outer_x - recess / 2.0
    bay_width = depth / bays
    side_windows = 0
    mullions = 0

    for floor in range(floors):
        floor_z = floor * floor_height
        bottom_h = window_bottom
        top_h = floor_height - window_bottom - window_height
        if bottom_h > 0:
            add_box(
                f"VISUAL_side_floor_{floor:02d}_bottom",
                (skin_x, 0.0, floor_z + bottom_h / 2.0),
                (skin, depth, bottom_h),
                body_mat,
                asset_objects,
            )
        if top_h > 0:
            add_box(
                f"VISUAL_side_floor_{floor:02d}_top",
                (skin_x, 0.0, floor_z + window_bottom + window_height + top_h / 2.0),
                (skin, depth, top_h),
                body_mat,
                asset_objects,
            )

        for bay in range(bays):
            bay_start = -depth / 2.0 + bay * bay_width
            bay_center = bay_start + bay_width / 2.0
            gap_each = max(0.05, (bay_width - window_width) / 2.0)
            z = floor_z + window_bottom + window_height / 2.0
            add_box(
                f"VISUAL_side_window_{side_windows:02d}_wall_front",
                (skin_x, bay_start + gap_each / 2.0, z),
                (skin, gap_each, window_height),
                body_mat,
                asset_objects,
            )
            add_box(
                f"VISUAL_side_window_{side_windows:02d}_wall_back",
                (skin_x, bay_start + bay_width - gap_each / 2.0, z),
                (skin, gap_each, window_height),
                body_mat,
                asset_objects,
            )
            glass_mat = glass_mats[(side_windows + 1) % len(glass_mats)]
            add_box(
                f"VISUAL_side_window_{side_windows:02d}_glass",
                (glass_x, bay_center, z),
                (0.035, window_width, window_height),
                glass_mat,
                asset_objects,
                detail_bevel * 0.40,
                1,
            )
            add_box(
                f"VISUAL_side_window_{side_windows:02d}_reveal_front",
                (reveal_x, bay_center - window_width / 2.0 - reveal / 2.0, z),
                (recess, reveal, window_height + reveal * 2.0),
                trim_mat,
                asset_objects,
            )
            add_box(
                f"VISUAL_side_window_{side_windows:02d}_reveal_back",
                (reveal_x, bay_center + window_width / 2.0 + reveal / 2.0, z),
                (recess, reveal, window_height + reveal * 2.0),
                trim_mat,
                asset_objects,
            )
            add_box(
                f"VISUAL_side_window_{side_windows:02d}_reveal_top",
                (reveal_x, bay_center, z + window_height / 2.0 + reveal / 2.0),
                (recess, window_width, reveal),
                trim_mat,
                asset_objects,
            )
            add_box(
                f"VISUAL_side_window_{side_windows:02d}_sill",
                (outer_x + 0.055, bay_center, z - window_height / 2.0 - reveal / 2.0),
                (skin + 0.20, window_width + reveal * 2.4, reveal),
                trim_mat,
                asset_objects,
                detail_bevel,
                1,
            )
            if lod == "LOD0" and mullion > 0:
                add_box(
                    f"VISUAL_side_window_{side_windows:02d}_mullion_v",
                    (glass_x + 0.022, bay_center, z),
                    (0.045, mullion, window_height * 0.94),
                    metal_mat,
                    asset_objects,
                )
                add_box(
                    f"VISUAL_side_window_{side_windows:02d}_mullion_h",
                    (glass_x + 0.022, bay_center, z),
                    (0.045, window_width * 0.94, mullion),
                    metal_mat,
                    asset_objects,
                )
                mullions += 2
            side_windows += 1

    return side_windows, mullions


def main() -> int:
    args = parse_args()
    request_path = Path(args.request).resolve()
    out_dir = Path(args.out_dir).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    request = load_request(request_path)
    params = validate_request(request)
    lod = request["lodProfile"]

    width = float(params["width"])
    depth = float(params["depth"])
    floor_height = float(params["floorHeight"])
    floors = int(params["floors"])
    roof_height = float(params["roofHeight"])
    overhang = float(params["roofOverhang"])
    fascia_height = float(params["fasciaHeight"])
    gutter_radius = float(params["gutterRadius"])
    downpipe_radius = float(params["downpipeRadius"])
    body_bevel = float(params["bodyBevel"])
    detail_bevel = float(params["detailBevel"])
    texture_size = int(params["bodyTextureSize"])
    recess = float(params["windowRecess"])
    body_height = floor_height * floors

    clear_scene()
    asset_objects: list[bpy.types.Object] = []

    stucco_path = out_dir / f"{request['requestId']}.generated-stucco.png"
    stucco = create_stucco_texture(stucco_path, list(params["bodyColor"]), texture_size)
    body_mat = create_material("MAT_v2_body", list(params["bodyColor"]), 0.75, stucco)
    trim_mat = create_material("MAT_v2_trim", list(params["trimColor"]), 0.56)
    roof_mat = create_material("MAT_v2_roof", list(params["roofColor"]), 0.64)
    metal_mat = create_material("MAT_v2_metal", list(params["metalColor"]), 0.34, metallic=0.55)
    door_mat = create_material("MAT_v2_door", list(params["doorColor"]), 0.46)
    glass_mats = [
        create_glass_material("MAT_v2_glass_a", list(params["glassColor"]), -0.025),
        create_glass_material("MAT_v2_glass_b", list(params["glassColor"]), 0.0),
        create_glass_material("MAT_v2_glass_c", list(params["glassColor"]), 0.035),
    ]

    core_width = width - 2.0 * recess
    core_depth = depth - 2.0 * recess
    if core_width <= 0 or core_depth <= 0:
        raise RuntimeError("windowRecess is too large for building dimensions")
    add_box(
        "VISUAL_core",
        (0.0, 0.0, body_height / 2.0),
        (core_width, core_depth, body_height),
        body_mat,
        asset_objects,
        body_bevel,
        2 if lod == "LOD0" else 1,
    )

    skin = max(0.08, float(params["trimDepth"]))
    add_box(
        "VISUAL_rear_wall",
        (0.0, depth / 2.0 - skin / 2.0, body_height / 2.0),
        (width, skin, body_height),
        body_mat,
        asset_objects,
    )
    add_box(
        "VISUAL_left_wall",
        (-width / 2.0 + skin / 2.0, 0.0, body_height / 2.0),
        (skin, depth, body_height),
        body_mat,
        asset_objects,
    )

    front_windows, front_mullions = add_front_facade(
        lod=lod,
        params=params,
        body_height=body_height,
        body_mat=body_mat,
        trim_mat=trim_mat,
        metal_mat=metal_mat,
        glass_mats=glass_mats,
        asset_objects=asset_objects,
    )
    side_windows, side_mullions = add_right_facade(
        lod=lod,
        params=params,
        body_mat=body_mat,
        trim_mat=trim_mat,
        metal_mat=metal_mat,
        glass_mats=glass_mats,
        asset_objects=asset_objects,
    )

    front_y = -depth / 2.0 - float(params["trimDepth"]) / 2.0
    door_bay = int(params["frontBays"]) // 2
    bay_width = width / int(params["frontBays"])
    door_x = -width / 2.0 + (door_bay + 0.5) * bay_width
    door_width = min(1.55, bay_width * 0.62)
    door_height = min(2.45, floor_height * 0.78)
    add_box(
        "VISUAL_entrance_door",
        (door_x, front_y - 0.035, door_height / 2.0),
        (door_width, 0.075, door_height),
        door_mat,
        asset_objects,
        detail_bevel,
        2 if lod == "LOD0" else 1,
    )
    add_box(
        "VISUAL_entrance_awning",
        (door_x, front_y - 0.42, door_height + 0.35),
        (door_width + 0.85, 0.80, 0.14),
        trim_mat,
        asset_objects,
        detail_bevel,
        2 if lod == "LOD0" else 1,
    )

    add_box(
        "VISUAL_front_plinth",
        (0.0, -depth / 2.0 - 0.01, 0.27),
        (width + 0.10, 0.16, 0.54),
        trim_mat,
        asset_objects,
        detail_bevel,
        1,
    )
    add_box(
        "VISUAL_right_plinth",
        (width / 2.0 + 0.01, 0.0, 0.27),
        (0.16, depth + 0.10, 0.54),
        trim_mat,
        asset_objects,
        detail_bevel,
        1,
    )
    add_box(
        "VISUAL_front_cornice",
        (0.0, -depth / 2.0 - 0.02, body_height - 0.16),
        (width + 0.30, 0.17, 0.30),
        trim_mat,
        asset_objects,
        detail_bevel,
        1,
    )
    add_box(
        "VISUAL_right_cornice",
        (width / 2.0 + 0.02, 0.0, body_height - 0.16),
        (0.17, depth + 0.30, 0.30),
        trim_mat,
        asset_objects,
        detail_bevel,
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
        2 if lod == "LOD0" else 1,
    )

    eave_x = width / 2.0 + overhang
    eave_length = depth + 2.0 * overhang
    add_box(
        "VISUAL_right_fascia",
        (eave_x, 0.0, body_height + fascia_height / 2.0),
        (0.16, eave_length, fascia_height),
        trim_mat,
        asset_objects,
        detail_bevel,
        1,
    )
    add_box(
        "VISUAL_left_fascia",
        (-eave_x, 0.0, body_height + fascia_height / 2.0),
        (0.16, eave_length, fascia_height),
        trim_mat,
        asset_objects,
        detail_bevel,
        1,
    )

    gutter_count = 0
    downpipe_count = 0
    if lod == "LOD0" and gutter_radius > 0:
        add_cylinder(
            "VISUAL_right_gutter",
            (eave_x + gutter_radius * 0.65, 0.0, body_height + fascia_height * 0.42),
            gutter_radius,
            eave_length,
            (math.radians(90), 0.0, 0.0),
            metal_mat,
            asset_objects,
            12,
        )
        add_cylinder(
            "VISUAL_left_gutter",
            (-eave_x - gutter_radius * 0.65, 0.0, body_height + fascia_height * 0.42),
            gutter_radius,
            eave_length,
            (math.radians(90), 0.0, 0.0),
            metal_mat,
            asset_objects,
            12,
        )
        gutter_count = 2
    if lod == "LOD0" and downpipe_radius > 0:
        add_cylinder(
            "VISUAL_right_downpipe_front",
            (width / 2.0 + 0.14, -depth / 2.0 + 0.18, body_height / 2.0),
            downpipe_radius,
            body_height,
            (0.0, 0.0, 0.0),
            metal_mat,
            asset_objects,
            10,
        )
        downpipe_count = 1

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
    bpy.context.scene["dropi_lod_profile"] = lod

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

    ground_mat = create_material("MAT_v2_preview_ground", [0.11, 0.12, 0.135, 1.0], 0.88)
    bpy.ops.mesh.primitive_plane_add(size=max(width, depth) * 4.5, location=(0.0, 0.0, -0.015))
    ground = bpy.context.active_object
    ground.name = "PREVIEW_ground"
    ground.data.materials.append(ground_mat)

    bpy.ops.object.camera_add(location=(18.5, -24.0, 7.0))
    camera = bpy.context.active_object
    camera.name = "PREVIEW_camera"
    camera.data.lens = 58
    look_at(camera, (0.0, 0.0, body_height * 0.46))
    bpy.context.scene.camera = camera

    bpy.ops.object.light_add(type="AREA", location=(-7.0, -11.0, body_height + 7.0))
    key = bpy.context.active_object
    key.data.energy = 1450.0
    key.data.shape = "DISK"
    key.data.size = 9.0
    look_at(key, (0.0, 0.0, body_height * 0.44))

    bpy.ops.object.light_add(type="AREA", location=(10.0, -3.0, body_height + 1.5))
    fill = bpy.context.active_object
    fill.data.energy = 620.0
    fill.data.size = 7.0
    look_at(fill, (0.0, 0.0, body_height * 0.40))

    bpy.ops.object.light_add(type="AREA", location=(-4.0, 8.0, body_height + 4.0))
    rim = bpy.context.active_object
    rim.data.energy = 760.0
    rim.data.size = 5.0
    look_at(rim, (0.0, 0.0, body_height * 0.55))

    bpy.ops.object.light_add(type="SUN", location=(0.0, 0.0, body_height + 10.0))
    sun = bpy.context.active_object
    sun.rotation_euler = (math.radians(31), math.radians(-16), math.radians(27))
    sun.data.energy = 1.35

    world = bpy.context.scene.world
    world.use_nodes = True
    background = world.node_tree.nodes.get("Background")
    if background is not None:
        background.inputs["Color"].default_value = (0.025, 0.032, 0.048, 1.0)
        background.inputs["Strength"].default_value = 0.42

    preview = request["preview"]
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = int(preview["width"])
    scene.render.resolution_y = int(preview["height"])
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = str(preview_path)
    scene.render.film_transparent = False
    if hasattr(scene, "eevee"):
        if hasattr(scene.eevee, "taa_render_samples"):
            scene.eevee.taa_render_samples = 128 if lod == "LOD0" else 96
        if hasattr(scene.eevee, "use_gtao"):
            scene.eevee.use_gtao = True
            scene.eevee.gtao_distance = 3.0
            scene.eevee.gtao_factor = 1.30
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
        "lodProfile": lod,
        "generator": "Blender",
        "blenderVersion": bpy.app.version_string,
        "meshObjectCount": len(mesh_objects),
        "materialCount": len(materials),
        "triangleCount": triangles,
        "hasCollisionProxy": has_collision,
        "frontWindowCount": front_windows,
        "sideWindowCount": side_windows,
        "mullionObjectCount": front_mullions + side_mullions,
        "gutterCount": gutter_count,
        "downpipeCount": downpipe_count,
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
