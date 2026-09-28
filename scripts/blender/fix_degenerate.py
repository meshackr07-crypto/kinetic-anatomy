# Delete degenerate (zero-area) faces from all kept meshes in body_work.blend.
# Usage: blender -b assets-raw/body_work.blend -P scripts/blender/fix_degenerate.py
import bmesh
import bpy

total = 0
for o in bpy.data.objects:
    if o.type != "MESH":
        continue
    me = o.data
    bm = bmesh.new()
    bm.from_mesh(me)
    bm.faces.ensure_lookup_table()
    dead = [f for f in bm.faces if f.calc_area() < 1e-10]
    for f in dead:
        bm.faces.remove(f)
    # drop verts left with no faces
    bm.verts.ensure_lookup_table()
    for v in list(bm.verts):
        if not v.link_faces:
            bm.verts.remove(v)
    bm.to_mesh(me)
    bm.free()
    me.update()
    if dead:
        print(f"{o.name}: removed {len(dead)} degenerate faces")
        total += len(dead)

bpy.ops.wm.save_mainfile()
print(f"DEGENERATE_DONE total={total}")
