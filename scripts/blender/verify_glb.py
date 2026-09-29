# T-027 verification: re-import public/models/body.glb, check structure,
# bend elbow + knee + spine, render the pose.
# Usage: blender -b -P scripts/blender/verify_glb.py
import json
import math
import os

import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
RAW = os.path.join(ROOT, "assets-raw")
GLB = os.path.join(ROOT, "public", "models", "body.glb")

report = {"meshes": [], "armatures": {}, "warnings": []}

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)

for o in bpy.data.objects:
    if o.type == "MESH":
        tris = sum(len(p.vertices) - 2 for p in o.data.polygons)
        groups = [g.name for g in o.vertex_groups]
        report["meshes"].append(
            {"name": o.name, "tris": tris, "groups": len(groups)})
        if not groups:
            report["warnings"].append(f"no vertex groups: {o.name}")
    elif o.type == "ARMATURE":
        report["armatures"][o.name] = [b.name for b in o.data.bones]

# pose test: flex left elbow 50 deg, left knee 40 deg, bend spine 10 deg
arm = next((o for o in bpy.data.objects if o.type == "ARMATURE"), None)
if arm is None:
    report["warnings"].append("no armature on re-import")
else:
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="POSE")
    for bname, deg in (("Forearm.L", -50), ("Leg.L", 40), ("Spine", -10)):
        pb = arm.pose.bones.get(bname)
        if pb is None:
            report["warnings"].append(f"pose bone missing: {bname}")
            continue
        pb.rotation_mode = "XYZ"
        pb.rotation_euler = (math.radians(deg), 0.0, 0.0)
    bpy.ops.object.mode_set(mode="OBJECT")

# render the posed body (skin + muscles only, like the app will show)
scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = 4
world = bpy.data.worlds.new("W")
world.use_nodes = True
scene.world = world
sun_data = bpy.data.lights.new("S", "SUN")
sun_data.energy = 3.0
sun = bpy.data.objects.new("S", sun_data)
scene.collection.objects.link(sun)
sun.rotation_euler = (0.6, 0.0, 0.3)
cam_data = bpy.data.cameras.new("C")
cam = bpy.data.objects.new("C", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam
cam.location = (0.6, -3.4, 1.0)
target = bpy.data.objects.new("T", None)
scene.collection.objects.link(target)
target.location = (0.0, 0.0, 0.9)
track = cam.constraints.new("TRACK_TO")
track.target = target
track.track_axis = "TRACK_NEGATIVE_Z"
track.up_axis = "UP_Y"
scene.render.resolution_x = 600
scene.render.resolution_y = 800
scene.render.image_settings.file_format = "PNG"
show = {m["name"] for m in report["meshes"]}
for o in bpy.data.objects:
    if o.type == "MESH":
        # hide skeleton layer for a muscle-readability check
        o.hide_render = o.name not in show or "Limb" in o.name \
            or o.name in ("Skull", "SpineCervical", "SpineThoracic",
                          "SpineLumbar", "RibCage", "Pelvis", "Skin")
scene.render.filepath = os.path.join(RAW, "pose-test.png")
bpy.ops.render.render(write_still=True)
print("rendered pose-test.png")

report["total_tris"] = sum(m["tris"] for m in report["meshes"])
print("VERIFY_JSON_START")
print(json.dumps(report, indent=1))
print("VERIFY_JSON_END")
print("VERIFY_DONE")
