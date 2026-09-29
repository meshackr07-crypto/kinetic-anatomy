# Measure arm/leg shaft centers at joint heights to verify rig coordinates.
# Usage: blender -b assets-raw/body_rigged.blend -P scripts/blender/check_joints.py
import bpy

targets = {
    "UpperLimb_L": [1.36, 1.08, 0.90],
    "UpperLimb_R": [1.36, 1.08, 0.90],
    "LowerLimb_L": [0.885, 0.48, 0.10],
    "LowerLimb_R": [0.885, 0.48, 0.10],
}
print("JOINTCHECK_START")
for name, heights in targets.items():
    o = bpy.data.objects.get(name)
    if o is None:
        print(f"{name}: MISSING")
        continue
    for z in heights:
        xs = [v.co.x for v in o.data.vertices if abs(v.co.z - z) < 0.02]
        ys = [v.co.y for v in o.data.vertices if abs(v.co.z - z) < 0.02]
        if xs:
            print(f"{name} z={z}: n={len(xs)} "
                  f"xmean={sum(xs)/len(xs):.3f} xrange=[{min(xs):.3f},{max(xs):.3f}] "
                  f"ymean={sum(ys)/len(ys):.3f}")
        else:
            print(f"{name} z={z}: no verts")
print("JOINTCHECK_END")
