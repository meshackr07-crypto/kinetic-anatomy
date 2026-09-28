# Determine what the .s / .t suffixes mean by comparing bounding-box X centers.
# Usage: blender -b -P scripts/blender/check_sides.py -- <file.fbx>
import sys

import bpy
from mathutils import Vector

bpy.ops.wm.read_factory_settings(use_empty=True)
argv = sys.argv
bpy.ops.import_scene.fbx(filepath=argv[argv.index("--") + 1])

wanted = ("Acetabulum", "Third trochanter", "Acromion", "Femoral head")
print("SIDES_JSON_START")
for obj in bpy.data.objects:
    if obj.type != "MESH":
        continue
    base = obj.name.rsplit(".", 1)[0]
    if base in wanted or any(base.startswith(w + " ") for w in wanted):
        # world-space bbox center
        ws = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
        cx = sum(v.x for v in ws) / 8
        print(f"{obj.name}  center_x={cx:.4f}")
print("SIDES_JSON_END")
