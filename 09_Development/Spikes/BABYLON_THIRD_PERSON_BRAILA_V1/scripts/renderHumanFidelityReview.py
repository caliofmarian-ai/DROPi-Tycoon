import bpy
import json
import os
from pathlib import Path
from mathutils import Vector

ROOT = Path(os.environ["DROPI_HUMAN_OUT"]).resolve()
REPORT = json.loads((ROOT / "human-fidelity-report.json").read_text(encoding="utf-8"))


def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for collection in (bpy.data.meshes, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        for block in list(collection):
            if block.users == 0:
                collection.remove(block)


def bounds():
    corners = []
    for obj in bpy.context.scene.objects:
        if obj.type != "MESH" or obj.name.startswith("review-"):
            continue
        for corner in obj.bound_box:
            corners.append(obj.matrix_world @ Vector(corner))
    if not corners:
        raise RuntimeError("Imported candidate has no renderable mesh")
    minimum = Vector((min(p.x for p in corners), min(p.y for p in corners), min(p.z for p in corners)))
    maximum = Vector((max(p.x for p in corners), max(p.y for p in corners), max(p.z for p in corners)))
    return minimum, maximum


def look_at(obj, target):
    obj.rotation_euler = (target - obj.location).to_track_quat("-Z", "Y").to_euler()


def classify_material(name):
    lowered = name.lower()
    if "high-poly" in lowered or "eye" in lowered:
        return "eyes"
    if "body" in lowered:
        return "skin"
    if "hair" in lowered or "short" in lowered or "bob" in lowered:
        return "hair"
    if "teeth" in lowered:
        return "teeth"
    if "shoe" in lowered:
        return "shoes"
    return "clothes"


def normalize_review_materials():
    settings = {
        "skin": (0.50, 0.32),
        "eyes": (0.23, 0.50),
        "hair": (0.62, 0.30),
        "teeth": (0.34, 0.38),
        "shoes": (0.48, 0.38),
        "clothes": (0.72, 0.30),
    }
    categories = {}
    for material in bpy.data.materials:
        category = classify_material(material.name)
        roughness, specular = settings[category]
        categories[material.name] = category
        material.use_nodes = True
        bsdf = material.node_tree.nodes.get("Principled BSDF")
        if bsdf is None:
            continue
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = roughness
        if "Metallic" in bsdf.inputs:
            bsdf.inputs["Metallic"].default_value = 0.0
        if "IOR Level" in bsdf.inputs:
            bsdf.inputs["IOR Level"].default_value = specular
    return categories


def add_area(name, position, target, energy, size, color):
    data = bpy.data.lights.new(name, type="AREA")
    data.energy = energy
    data.shape = "DISK"
    data.size = size
    data.color = color
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.location = position
    look_at(obj, target)
    return obj


def render_identity(entry):
    reset_scene()
    source = ROOT / entry["glb"]["file"]
    bpy.ops.import_scene.gltf(filepath=str(source), import_pack_images=True)
    categories = normalize_review_materials()
    minimum, maximum = bounds()
    center = (minimum + maximum) * 0.5
    height = maximum.z - minimum.z
    if height <= 0.1:
        raise RuntimeError(f"Invalid candidate height for {entry['identity']}: {height}")
    front = float(entry["previewFrontSignY"])

    world = bpy.context.scene.world
    world.use_nodes = True
    background = world.node_tree.nodes.get("Background")
    background.inputs["Color"].default_value = (0.025, 0.032, 0.045, 1.0)
    background.inputs["Strength"].default_value = 0.12

    bpy.ops.mesh.primitive_plane_add(size=height * 4.0, location=(center.x, center.y, minimum.z - 0.004))
    floor = bpy.context.active_object
    floor.name = "review-floor"
    floor_material = bpy.data.materials.new("review-floor-material")
    floor_material.use_nodes = True
    floor_bsdf = floor_material.node_tree.nodes.get("Principled BSDF")
    floor_bsdf.inputs["Base Color"].default_value = (0.075, 0.085, 0.10, 1.0)
    floor_bsdf.inputs["Roughness"].default_value = 0.86
    floor.data.materials.append(floor_material)

    add_area("review-key", center + Vector((height * 0.72, front * height * 1.05, height * 0.72)), center, 180, height * 0.75, (1.0, 0.91, 0.84))
    add_area("review-fill", center + Vector((-height * 0.85, front * height * 0.72, height * 0.30)), center, 72, height * 0.80, (0.76, 0.84, 1.0))
    add_area("review-rim", center + Vector((height * 0.35, -front * height * 0.75, height * 0.92)), center, 95, height * 0.58, (0.86, 0.92, 1.0))

    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGB"
    scene.render.film_transparent = False
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.view_settings.exposure = -0.45

    camera_data = bpy.data.cameras.new("review-camera")
    camera = bpy.data.objects.new("review-camera", camera_data)
    bpy.context.collection.objects.link(camera)
    scene.camera = camera

    camera_data.lens = 58
    camera.location = center + Vector((height * 0.08, front * height * 1.58, height * 0.04))
    look_at(camera, center + Vector((0, 0, height * 0.02)))
    scene.render.resolution_x = 600
    scene.render.resolution_y = 900
    scene.render.filepath = str(ROOT / f"review-{entry['identity']}-full.png")
    bpy.ops.render.render(write_still=True)

    face_target = Vector((center.x, center.y, minimum.z + height * 0.82))
    camera_data.lens = 78
    camera.location = face_target + Vector((height * 0.02, front * height * 0.47, height * 0.015))
    look_at(camera, face_target)
    scene.render.resolution_x = 768
    scene.render.resolution_y = 768
    scene.render.filepath = str(ROOT / f"review-{entry['identity']}-face.png")
    bpy.ops.render.render(write_still=True)

    return {"identity": entry["identity"], "materialCategories": categories}


review = {
    "status": "REVIEW_RENDER_ONLY_NOT_RUNTIME_ACCEPTANCE",
    "purpose": "Neutral, bounded lighting/material review of the generated GLB candidates. These preview overrides do not silently modify the shipped GLB.",
    "identities": [render_identity(entry) for entry in REPORT["identities"]],
}
(ROOT / "human-fidelity-review-render.json").write_text(json.dumps(review, indent=2) + "\n", encoding="utf-8")
print(json.dumps(review, indent=2))
