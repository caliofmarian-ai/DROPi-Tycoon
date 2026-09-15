import bpy
import hashlib
import importlib
import json
import os
import random
import sys
from pathlib import Path
from mathutils import Vector

OUT = Path(os.environ.get("DROPI_HUMAN_OUT", "/tmp/dropi-human-fidelity"))
OUT.mkdir(parents=True, exist_ok=True)
ASSET_ROOT = Path(os.environ["DROPI_MAKEHUMAN_ASSET_ROOT"]).resolve()

MPFB_COMMIT = os.environ.get("DROPI_MPFB_COMMIT", "UNKNOWN")
SYSTEM_ASSET_SHA256 = os.environ.get("DROPI_MAKEHUMAN_ASSET_SHA256", "UNKNOWN")


def dynamic_import(suffix, symbol):
    for module_name in list(sys.modules):
        if module_name.endswith(suffix):
            module = importlib.import_module(module_name)
            if not hasattr(module, symbol):
                raise AttributeError(f"Module {module_name} has no {symbol}")
            return getattr(module, symbol)
    raise RuntimeError(f"MPFB module ending in {suffix} is not loaded")


HumanService = dynamic_import("mpfb.services.humanservice", "HumanService")
TargetService = dynamic_import("mpfb.services.targetservice", "TargetService")
ObjectService = dynamic_import("mpfb.services.objectservice", "ObjectService")
ExportService = dynamic_import("mpfb.services.exportservice", "ExportService")
LocationService = dynamic_import("mpfb.services.locationservice", "LocationService")
HumanObjectProperties = dynamic_import("mpfb.entities.objectproperties", "HumanObjectProperties")

FACE_SECTIONS = ("head", "forehead", "eyebrows", "eyes", "nose", "mouth", "chin", "ears")

IDENTITIES = [
    {
        "id": "hero-courier-v1",
        "seed": 13071,
        "macro": {"gender": 0.0, "age": 0.30, "muscle": 0.52, "weight": 0.43, "height": 0.57, "proportions": 0.54, "caucasian": 0.68, "asian": 0.18, "african": 0.14},
        "skin": "young_caucasian_male.mhmat",
        "assets": [("eyes", "high-poly.mhclo", "Eyes"), ("eyebrows", "eyebrow004.mhclo", "Eyebrows"), ("eyelashes", "eyelashes01.mhclo", "Eyelashes"), ("teeth", "teeth_base.mhclo", "Teeth"), ("hair", "short03.mhclo", "Hair"), ("clothes", "male_worksuit01.mhclo", "Clothes"), ("clothes", "shoes06.mhclo", "Clothes")],
    },
    {
        "id": "specialist-logistics-v1",
        "seed": 24119,
        "macro": {"gender": 1.0, "age": 0.43, "muscle": 0.38, "weight": 0.49, "height": 0.48, "proportions": 0.46, "caucasian": 0.42, "asian": 0.16, "african": 0.42},
        "skin": "middleage_african_female.mhmat",
        "assets": [("eyes", "high-poly.mhclo", "Eyes"), ("eyebrows", "eyebrow009.mhclo", "Eyebrows"), ("eyelashes", "eyelashes02.mhclo", "Eyelashes"), ("teeth", "teeth_base.mhclo", "Teeth"), ("hair", "bob02.mhclo", "Hair"), ("clothes", "female_casualsuit02.mhclo", "Clothes"), ("clothes", "shoes04.mhclo", "Clothes")],
    },
    {
        "id": "specialist-technical-v1",
        "seed": 37139,
        "macro": {"gender": 0.0, "age": 0.36, "muscle": 0.45, "weight": 0.39, "height": 0.63, "proportions": 0.61, "caucasian": 0.18, "asian": 0.68, "african": 0.14},
        "skin": "young_asian_male.mhmat",
        "assets": [("eyes", "high-poly.mhclo", "Eyes"), ("eyebrows", "eyebrow002.mhclo", "Eyebrows"), ("eyelashes", "eyelashes01.mhclo", "Eyelashes"), ("teeth", "teeth_base.mhclo", "Teeth"), ("hair", "short01.mhclo", "Hair"), ("clothes", "male_casualsuit04.mhclo", "Clothes"), ("clothes", "shoes02.mhclo", "Clothes")],
    },
]


def sha256_file(path):
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def resolve_asset_path(subdir, filename):
    root = ASSET_ROOT / subdir
    if not root.is_dir():
        raise RuntimeError(f"MakeHuman asset category missing: {subdir}")
    direct = root / filename
    if direct.exists():
        return str(direct.resolve())
    matches = sorted(path for path in root.rglob(filename) if path.is_file())
    if len(matches) != 1:
        raise RuntimeError(
            f"Expected exactly one MakeHuman asset {subdir}/{filename}; found {len(matches)}: "
            + ", ".join(str(path.relative_to(ASSET_ROOT)) for path in matches[:8])
        )
    return str(matches[0].resolve())


def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        for block in list(datablocks):
            if block.users == 0:
                datablocks.remove(block)


def apply_macro(basemesh, values):
    for key, value in values.items():
        HumanObjectProperties.set_value(key, float(value), entity_reference=basemesh)
    TargetService.reapply_macro_details(basemesh)


def resolve_target_path(section, target_name):
    root = Path(LocationService.get_mpfb_data("targets")) / section
    for extension in (".target.gz", ".target"):
        candidate = root / f"{target_name}{extension}"
        if candidate.exists():
            return str(candidate)
    return None


def apply_face_identity(basemesh, seed):
    metadata_path = Path(LocationService.get_mpfb_data("targets")) / "target.json"
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    rng = random.Random(seed)
    applied = []
    for section_name in FACE_SECTIONS:
        section = metadata.get(section_name)
        if not section:
            continue
        candidates = []
        for category in section.get("categories", []):
            if category.get("has_left_and_right"):
                continue
            opposites = category.get("opposites", {})
            negative = opposites.get("negative-unsided") or ""
            positive = opposites.get("positive-unsided") or ""
            if negative and positive:
                candidates.append((category.get("name", "unnamed"), negative, positive))
        rng.shuffle(candidates)
        for category_name, negative, positive in candidates[:2]:
            target_name = positive if rng.random() >= 0.5 else negative
            target_path = resolve_target_path(section_name, target_name)
            if not target_path:
                continue
            weight = round(rng.uniform(0.16, 0.34), 4)
            TargetService.load_target(basemesh, target_path, weight=weight)
            applied.append({"section": section_name, "category": category_name, "target": target_name, "weight": weight})
    return applied


def add_asset(basemesh, subdir, filename, asset_type):
    return HumanService.add_mhclo_asset(
        resolve_asset_path(subdir, filename),
        basemesh,
        asset_type=asset_type,
        material_type="GAMEENGINE",
    )


def set_skin(basemesh, filename):
    HumanService.set_character_skin(resolve_asset_path("skins", filename), basemesh, skin_type="GAMEENGINE")


def hierarchy_objects(root):
    seen = set()
    ordered = []
    stack = [root]
    while stack:
        obj = stack.pop()
        if obj.name in seen:
            continue
        seen.add(obj.name)
        ordered.append(obj)
        stack.extend(list(obj.children))
    return ordered


def bounds_for(objects, require_mesh=True):
    corners = []
    for obj in objects:
        if obj.type != "MESH" or not obj.visible_get():
            continue
        for corner in obj.bound_box:
            corners.append(obj.matrix_world @ Vector(corner))
    if not corners:
        if require_mesh:
            raise RuntimeError("No mesh bounds found")
        return None
    mins = Vector((min(v.x for v in corners), min(v.y for v in corners), min(v.z for v in corners)))
    maxs = Vector((max(v.x for v in corners), max(v.y for v in corners), max(v.z for v in corners)))
    return mins, maxs


def infer_front_sign(basemesh):
    body_bounds = bounds_for([basemesh])
    body_center_y = (body_bounds[0].y + body_bounds[1].y) * 0.5
    eyes = ObjectService.find_object_of_type_amongst_nearest_relatives(basemesh, "Eyes")
    if eyes is None:
        raise RuntimeError("Cannot infer character front: Eyes asset is missing")
    eye_bounds = bounds_for(hierarchy_objects(eyes))
    eye_center_y = (eye_bounds[0].y + eye_bounds[1].y) * 0.5
    delta = eye_center_y - body_center_y
    if abs(delta) < 0.001:
        raise RuntimeError(f"Cannot infer character front: eye/body Y delta too small ({delta})")
    return 1.0 if delta > 0 else -1.0


def look_at(obj, target):
    obj.rotation_euler = (target - obj.location).to_track_quat("-Z", "Y").to_euler()


def make_material(name, color, roughness):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (*color, 1.0)
        bsdf.inputs["Roughness"].default_value = roughness
    return mat


def setup_preview_scene(character_objects, front_sign, preview_name):
    mins, maxs = bounds_for(character_objects)
    center = (mins + maxs) * 0.5
    height = max(maxs.z - mins.z, 0.1)

    bpy.ops.mesh.primitive_plane_add(size=height * 4.0, location=(center.x, center.y, mins.z - 0.005))
    floor = bpy.context.active_object
    floor.name = "preview-floor"
    floor.data.materials.append(make_material("preview-floor-material", (0.12, 0.135, 0.15), 0.9))

    world = bpy.context.scene.world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    bg.inputs["Color"].default_value = (0.035, 0.045, 0.06, 1.0)
    bg.inputs["Strength"].default_value = 0.35

    def area(name, location, energy, size, color):
        data = bpy.data.lights.new(name, type="AREA")
        data.energy = energy
        data.shape = "DISK"
        data.size = size
        data.color = color
        light = bpy.data.objects.new(name, data)
        bpy.context.collection.objects.link(light)
        light.location = location
        look_at(light, center)

    area("key", center + Vector((height * 0.8, front_sign * height * 1.2, height * 0.8)), 1150, height * 0.8, (1.0, 0.88, 0.78))
    area("fill", center + Vector((-height * 0.9, front_sign * height * 0.8, height * 0.35)), 650, height * 0.65, (0.72, 0.83, 1.0))
    area("rim", center + Vector((height * 0.3, -front_sign * height * 0.9, height * 1.0)), 900, height * 0.55, (0.85, 0.92, 1.0))

    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGB"
    scene.render.film_transparent = False
    scene.view_settings.look = "AgX - Medium High Contrast"

    camera_data = bpy.data.cameras.new("preview-camera")
    camera = bpy.data.objects.new("preview-camera", camera_data)
    bpy.context.collection.objects.link(camera)
    scene.camera = camera
    camera_data.lens = 58

    camera.location = center + Vector((height * 0.10, front_sign * height * 1.55, height * 0.05))
    look_at(camera, center + Vector((0, 0, height * 0.02)))
    scene.render.resolution_x = 600
    scene.render.resolution_y = 900
    scene.render.filepath = str(OUT / f"{preview_name}-full.png")
    bpy.ops.render.render(write_still=True)

    face_target = Vector((center.x, center.y, mins.z + height * 0.82))
    camera.location = face_target + Vector((height * 0.04, front_sign * height * 0.50, height * 0.015))
    camera_data.lens = 72
    look_at(camera, face_target)
    scene.render.resolution_x = 768
    scene.render.resolution_y = 768
    scene.render.filepath = str(OUT / f"{preview_name}-face.png")
    bpy.ops.render.render(write_still=True)


def mesh_stats(objects):
    triangles = 0
    mesh_objects = 0
    materials = set()
    vertices = 0
    for obj in objects:
        if obj.type != "MESH":
            continue
        mesh_objects += 1
        mesh = obj.data
        vertices += len(mesh.vertices)
        triangles += sum(max(0, len(poly.vertices) - 2) for poly in mesh.polygons)
        for material in mesh.materials:
            if material:
                materials.add(material.name)
    return {"meshObjects": mesh_objects, "vertices": vertices, "triangles": triangles, "materials": len(materials)}


def export_character(basemesh, identity_id):
    export_root = ExportService.create_character_copy(basemesh, name_suffix="_export")
    export_basemesh = ObjectService.find_object_of_type_amongst_nearest_relatives(export_root, "Basemesh")
    if export_basemesh is None:
        raise RuntimeError("Export copy is missing its Basemesh")
    ExportService.bake_modifiers_remove_helpers(
        export_basemesh,
        bake_masks=True,
        bake_subdiv=False,
        remove_helpers=True,
        also_proxy=True,
    )
    bpy.ops.object.select_all(action="DESELECT")
    export_objects = hierarchy_objects(export_root)
    for obj in export_objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = export_root
    output = OUT / f"{identity_id}.glb"
    bpy.ops.export_scene.gltf(
        filepath=str(output),
        export_format="GLB",
        use_selection=True,
        export_animations=False,
        export_apply=True,
        export_yup=True,
        export_materials="EXPORT",
    )
    return output, mesh_stats(export_objects)


def build_identity(config):
    reset_scene()
    basemesh = HumanService.create_human(feet_on_ground=True)
    basemesh.name = f"{config['id']}.body"
    apply_macro(basemesh, config["macro"])
    facial_targets = apply_face_identity(basemesh, config["seed"])
    set_skin(basemesh, config["skin"])
    HumanService.add_builtin_rig(basemesh, "game_engine")
    equipped = []
    for subdir, filename, asset_type in config["assets"]:
        add_asset(basemesh, subdir, filename, asset_type)
        equipped.append(f"{subdir}/{filename}")

    original_objects = hierarchy_objects(basemesh)
    original_stats = mesh_stats(original_objects)
    front_sign = infer_front_sign(basemesh)
    setup_preview_scene(original_objects, front_sign, config["id"])
    glb_path, export_stats = export_character(basemesh, config["id"])
    return {
        "identity": config["id"],
        "macro": config["macro"],
        "skin": config["skin"],
        "equippedAssets": equipped,
        "facialTargets": facial_targets,
        "previewFrontSignY": front_sign,
        "sourceStats": original_stats,
        "exportStats": export_stats,
        "glb": {"file": glb_path.name, "bytes": glb_path.stat().st_size, "sha256": sha256_file(glb_path)},
    }


report = {
    "status": "CANDIDATE_NOT_RELEASE_CLEARED",
    "purpose": "P0 human-fidelity evaluation: close-readable faces/hair/hands and visibly distinct identities for DROPi Tycoon. Not yet runtime-integrated or Android-accepted.",
    "generator": {
        "mpfbCommit": MPFB_COMMIT,
        "makeHumanSystemAssetPackSha256": SYSTEM_ASSET_SHA256,
        "blender": bpy.app.version_string,
        "licenseBoundary": "MPFB/MakeHuman core graphical assets are treated as CC0 candidates; DT-13 must still qualify the exact shipped derivatives and source record.",
    },
    "identities": [],
}

for config in IDENTITIES:
    report["identities"].append(build_identity(config))

(OUT / "human-fidelity-report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, indent=2))
