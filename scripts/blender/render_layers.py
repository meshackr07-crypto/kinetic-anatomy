# Render one preview PNG per layer (skin / muscles / bones) from body_work.blend.
# Usage: blender -b assets-raw/body_work.blend -P scripts/blender/render_layers.py
import os

import bpy

RAW = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "..", "..", "assets-raw")
RAW = os.path.abspath(RAW)

MUSCLE_NAMES = [
    "GluteusMaximus", "GluteusMedius", "QuadricepsFemoris", "Hamstrings",
    "AdductorGroup", "Gastrocnemius", "Soleus", "TibialisAnterior",
    "Iliopsoas", "RectusAbdominis", "ExternalOblique", "InternalOblique",
    "TransversusAbdominis", "ErectorSpinae", "Multifidus", "LatissimusDorsi",
    "Trapezius", "Rhomboids", "Deltoid", "PectoralisMajor", "BicepsBrachii",
    "TricepsBrachii", "ForearmFlexors", "ForearmExtensors", "RotatorCuff",
]
BONE_NAMES = [
    "Skull", "SpineCervical", "SpineThoracic", "SpineLumbar", "RibCage",
    "Pelvis", "UpperLimb_L", "UpperLimb_R", "LowerLimb_L", "LowerLimb_R",
]

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
cam.location = (0.0, -3.4, 1.0)
target = bpy.data.objects.new("PreviewTarget", None)
scene.collection.objects.link(target)
target.location = (0.0, 0.0, 0.9)
track = cam.constraints.new("TRACK_TO")
track.target = target
track.track_axis = "TRACK_NEGATIVE_Z"
track.up_axis = "UP_Y"
scene.render.resolution_x = 600
scene.render.resolution_y = 800
scene.render.image_settings.file_format = "PNG"

layers = {
    "layer-skin": ["Skin"],
    "layer-muscles": MUSCLE_NAMES,
    "layer-bones": BONE_NAMES,
}
for fname, visible in layers.items():
    for o in bpy.data.objects:
        if o.type == "MESH":
            o.hide_render = o.name not in visible
    scene.render.filepath = os.path.join(RAW, fname + ".png")
    bpy.ops.render.render(write_still=True)
    print(f"rendered {fname}.png")
