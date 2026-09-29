# T-027 v2: skin every mesh to BodyArmature.
# - Try automatic (heat) weights per mesh.
# - Meshes where heat leaves verts unweighted fall back to nearest-bone
#   rigid assignment + smoothing (deterministic, always succeeds).
# - Export public/models/body.glb (meshes + armature only).
# Usage: blender -b assets-raw/body_rigged.blend -P scripts/blender/skin_export.py
import json
import os

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
RAW = os.path.join(ROOT, "assets-raw")
OUT_DIR = os.path.join(ROOT, "public", "models")
os.makedirs(OUT_DIR, exist_ok=True)

COVERAGE_NEEDED = 0.99  # fraction of verts that must carry weight


def deselect_all():
    bpy.ops.object.select_all(action="DESELECT")


def weighted_fraction(obj):
    total = len(obj.data.vertices)
    if not total:
        return 1.0
    seen = set()
    for g in obj.vertex_groups:
        try:
            for v in obj.data.vertices:
                try:
                    if g.weight(v.index) > 0.0:
                        seen.add(v.index)
                except RuntimeError:
                    pass
        except ReferenceError:
            pass
    return len(seen) / total


def strip_skinning(obj):
    for mod in [m for m in obj.modifiers if m.type == "ARMATURE"]:
        obj.modifiers.remove(mod)
    for g in list(obj.vertex_groups):
        obj.vertex_groups.remove(g)
    obj.parent = None
    obj.matrix_world.identity()


def nearest_bone_weights(obj, arm):
    mesh = obj.data
    bones = [(b.name, Vector(b.head_local), Vector(b.tail_local))
             for b in arm.data.bones]
    arm_mat = arm.matrix_world
    seg = [((arm_mat @ h), (arm_mat @ t)) for _, h, t in bones]
    groups = {}
    for bname, _, _ in bones:
        groups[bname] = obj.vertex_groups.new(name=bname)
    for v in mesh.vertices:
        co = obj.matrix_world @ v.co
        best, best_d2 = None, None
        for i, (a, b) in enumerate(seg):
            ab = b - a
            denom = ab.dot(ab)
            t = 0.0 if denom == 0.0 else max(0.0, min(1.0, (co - a).dot(ab) / denom))
            d2 = ((a + ab * t) - co).length_squared
            if best_d2 is None or d2 < best_d2:
                best, best_d2 = bones[i][0], d2
        groups[best].add([v.index], 1.0, "REPLACE")
    mod = obj.modifiers.new("Armature", "ARMATURE")
    mod.object = arm
    # smooth the rigid assignment so joints bend instead of crease
    deselect_all()
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="WEIGHT_PAINT")
    bpy.ops.object.vertex_group_smooth(group_select_mode="ALL",
                                       factor=0.5, repeat=3, expand=0.0)
    bpy.ops.object.mode_set(mode="OBJECT")


def main():
    report = {"auto": [], "fallback": [], "warnings": []}
    arm = bpy.data.objects.get("BodyArmature")
    meshes = [o for o in bpy.data.objects if o.type == "MESH"]

    for o in meshes:
        deselect_all()
        o.select_set(True)
        bpy.context.view_layer.objects.active = arm
        bpy.ops.object.parent_set(type="ARMATURE_AUTO")
        frac = weighted_fraction(o)
        row = {"name": o.name, "verts": len(o.data.vertices),
               "coverage": round(frac, 4)}
        if frac >= COVERAGE_NEEDED:
            report["auto"].append(row)
            continue
        # fallback: rigid nearest-bone + smooth
        strip_skinning(o)
        nearest_bone_weights(o, arm)
        frac2 = weighted_fraction(o)
        row["coverage_after_fallback"] = round(frac2, 4)
        report["fallback"].append(row)
        if frac2 < COVERAGE_NEEDED:
            report["warnings"].append(
                f"low coverage after fallback: {o.name} {frac2}")

    bpy.ops.object.select_all(action="DESELECT")
    for o in meshes:
        if o.name in bpy.data.objects:
            bpy.data.objects[o.name].select_set(True)
    arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    glb_path = os.path.join(OUT_DIR, "body.glb")
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format="GLB",
        use_selection=True,
        export_apply=False,
        export_yup=True,
    )
    report["glb_path"] = glb_path
    report["glb_bytes"] = os.path.getsize(glb_path)
    report["glb_mb"] = round(report["glb_bytes"] / 1048576, 2)

    print("SKIN_JSON_START")
    print(json.dumps(report, indent=1))
    print("SKIN_JSON_END")
    print("SKIN_DONE")


main()
