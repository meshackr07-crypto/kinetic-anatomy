# Print world-space bounding boxes for every mesh in body_work.blend.
# Usage: blender -b assets-raw/body_work.blend -P scripts/blender/measure.py
import bpy

print("MEASURE_START")
for o in sorted(bpy.data.objects, key=lambda x: x.name):
    if o.type != "MESH":
        continue
    ws = [o.matrix_world @ v.co for v in o.data.vertices]
    xs = [v.x for v in ws]
    ys = [v.y for v in ws]
    zs = [v.z for v in ws]
    cx, cy, cz = sum(xs) / len(xs), sum(ys) / len(ys), sum(zs) / len(zs)
    print(f"{o.name}: n={len(ws)} "
          f"x=[{min(xs):.3f},{max(xs):.3f}] "
          f"y=[{min(ys):.3f},{max(ys):.3f}] "
          f"z=[{min(zs):.3f},{max(zs):.3f}] "
          f"c=({cx:.3f},{cy:.3f},{cz:.3f})")
print("MEASURE_END")
