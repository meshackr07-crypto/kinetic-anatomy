# Inspect the calf meshes: bounding boxes + isolated render.
# Usage: blender -b assets-raw/body_work.blend -P scripts/blender/inspect_calves.py
import os

import bpy

RAW = os.path.abspath(os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "..", "..", "assets-raw"))

for name in ("Gastrocnemius", "Soleus", "TibialisAnterior",
             "QuadricepsFemoris", "Hamstrings"):
    o = bpy.data.objects.get(name)
    if o is None:
        print(f"{name}: MISSING")
        continue
    ws = [o.matrix_world @ v.co for v in o.data.vertices]
    xs = [v.x for v in ws]
    ys = [v.y for v in ws]
    zs = [v.z for v in ws]
    print(f"{name}: verts={len(ws)} "
          f"x=[{min(xs):.3f},{max(xs):.3f}] "
          f"y=[{min(ys):.3f},{max(ys):.3f}] "
          f"z=[{min(zs):.3f},{max(zs):.3f}]")

# isolated render of the calves
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
cam_data = bpy.data.cameras.new("C")
cam = bpy.data.objects.new("C", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam
cam.location = (0.0, -3.4, 1.0)
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
keep = {"Gastrocnemius", "Soleus", "TibialisAnterior"}
for o in bpy.data.objects:
    if o.type == "MESH":
        o.hide_render = o.name not in keep
scene.render.filepath = os.path.join(RAW, "layer-calves.png")
bpy.ops.render.render(write_still=True)
print("rendered layer-calves.png")
