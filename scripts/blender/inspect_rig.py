# Inspect body_rigged.blend: list all objects, modifiers, vertex groups.
# Usage: blender -b assets-raw/body_rigged.blend -P scripts/blender/inspect_rig.py
import bpy

print("RIGINSPECT_START")
for o in sorted(bpy.data.objects, key=lambda x: x.name):
    mods = [m.type for m in getattr(o, "modifiers", [])]
    ng = len(getattr(o, "vertex_groups", []))
    print(f"{o.type:8} {o.name} modifiers={mods} groups={ng}")
print("RIGINSPECT_END")
