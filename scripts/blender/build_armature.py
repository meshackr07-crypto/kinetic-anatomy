# T-026: build the BodyArmature from scripts/blender/naming.json (frozen).
# Verifies every mesh name, renders joint-overlay previews, saves
# assets-raw/body_rigged.blend WITHOUT the helper spheres.
# Usage: blender -b assets-raw/body_work.blend -P scripts/blender/build_armature.py
import json
import math
import os

import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.abspath(os.path.join(HERE, "..", "..", "assets-raw"))
with open(os.path.join(HERE, "naming.json"), encoding="utf-8") as f:
    SPEC = json.load(f)

report = {"bones_created": [], "warnings": [], "mesh_check": {}}

# ---- verify meshes match the frozen lists ----
expected_meshes = (set(SPEC["muscle_meshes"]) | set(SPEC["bone_meshes"])
                   | {SPEC["skin_mesh"]})
actual_meshes = {o.name for o in bpy.data.objects if o.type == "MESH"}
report["mesh_check"] = {
    "missing": sorted(expected_meshes - actual_meshes),
    "unexpected": sorted(actual_meshes - expected_meshes),
}
if report["mesh_check"]["missing"]:
    report["warnings"].append(
        f"missing meshes: {report['mesh_check']['missing']}")

# ---- build armature ----
arm_data = bpy.data.armatures.new(SPEC["armature"])
arm = bpy.data.objects.new(SPEC["armature"], arm_data)
bpy.context.scene.collection.objects.link(arm)
bpy.context.view_layer.objects.active = arm
bpy.ops.object.mode_set(mode="EDIT")
by_name = {}
for b in SPEC["bones"]:
    eb = arm_data.edit_bones.new(b["name"])
    eb.head = b["head"]
    eb.tail = b["tail"]
    eb.roll = 0.0
    by_name[b["name"]] = eb
for b in SPEC["bones"]:
    if b["parent"]:
        child = by_name[b["name"]]
        parent = by_name[b["parent"]]
        child.parent = parent
        dist = (parent.tail - child.head).length
        child.use_connect = dist < 0.001
bpy.ops.object.mode_set(mode="OBJECT")
report["bones_created"] = [b["name"] for b in SPEC["bones"]]
report["bone_count"] = len(report["bones_created"])

# ---- joint spheres for the overlay preview ----
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.012, location=(0, 0, 0))
template = bpy.context.view_layer.objects.active
spheres = []
for b in SPEC["bones"]:
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.012, location=b["head"])
    spheres.append(bpy.context.view_layer.objects.active.name)
bpy.data.objects.remove(template, do_unlink=True)
mat = bpy.data.materials.new("JointRed")
mat.use_nodes = True
bsdf = mat.node_tree.nodes.get("Principled BSDF")
if bsdf is not None:
    bsdf.inputs["Base Color"].default_value = (1.0, 0.05, 0.05, 1.0)
for name in spheres:
    bpy.data.objects[name].data.materials.append(mat)

# ---- render setup: bones layer + red joint dots, front and side ----
scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = 4
world = bpy.data.worlds.new("PreviewWorld")
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
if bg is not None:
    bg.inputs["Color"].default_value = (1.0, 1.0, 1.0, 1.0)
    bg.inputs["Strength"].default_value = 1.0
scene.world = world
sun_data = bpy.data.lights.new("PreviewSun", "SUN")
sun_data.energy = 3.0
sun = bpy.data.objects.new("PreviewSun", sun_data)
scene.collection.objects.link(sun)
sun.rotation_euler = (0.6, 0.0, 0.3)
cam_data = bpy.data.cameras.new("PreviewCam")
cam = bpy.data.objects.new("PreviewCam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam

bone_names = set(SPEC["bone_meshes"])
views = {
    "rig-front": (0.0, -3.4, 1.0),
    "rig-side": (3.4, 0.0, 1.0),
}
for fname, loc in views.items():
    cam.location = loc
    target = bpy.data.objects.new("PreviewTarget", None)
    scene.collection.objects.link(target)
    target.location = (0.0, 0.0, 0.9)
    track = cam.constraints.new("TRACK_TO")
    track.target = target
    track.track_axis = "TRACK_NEGATIVE_Z"
    track.up_axis = "UP_Y"
    for o in bpy.data.objects:
        if o.type == "MESH":
            is_bone = o.name in bone_names
            is_sphere = o.name in spheres
            o.hide_render = not (is_bone or is_sphere)
    scene.render.resolution_x = 600
    scene.render.resolution_y = 800
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = os.path.join(RAW, fname + ".png")
    bpy.ops.render.render(write_still=True)
    print(f"rendered {fname}.png")
    scene.collection.objects.unlink(target)
    bpy.data.objects.remove(target, do_unlink=True)
    cam.constraints.remove(track)

# ---- remove helpers, save rigged file ----
for name in spheres:
    o = bpy.data.objects.get(name)
    if o is not None:
        bpy.data.objects.remove(o, do_unlink=True)
bpy.data.materials.remove(mat)
bpy.ops.wm.save_as_mainfile(
    filepath=os.path.join(RAW, "body_rigged.blend"))

print("RIG_JSON_START")
print(json.dumps(report, indent=1))
print("RIG_JSON_END")
print("RIG_DONE")
