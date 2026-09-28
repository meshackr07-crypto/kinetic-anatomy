# T-025: build the v1 working body from Z-Anatomy FBX parts.
# Joins + decimates curated mesh sets, saves assets-raw/body_work.blend,
# renders a preview PNG, prints a JSON report.
#
# Usage (project root, PowerShell):
#   & "tools\blender-5.2.2-windows-x64\blender.exe" -b -P scripts\blender\build_body.py
#
# Inputs (downloaded, CC BY-SA 4.0, see docs/3D_MODEL_PLAN.md):
#   assets-raw/MuscularSystem100.fbx
#   assets-raw/SkeletalSystem100.fbx
#   assets-raw/Regions100.fbx   (skin surface)
#
# NOTE: Blender object wrappers go stale after join/remove, so this script
# tracks everything by object NAME (plain strings) and re-resolves objects
# fresh from bpy.data.objects every time. Never hold object refs across ops.
import json
import os

import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
RAW = os.path.join(ROOT, "assets-raw")

# (stem, [name start-patterns, lowercase], tri budget)
MUSCLES = [
    ("GluteusMaximus", ["gluteus maximus muscle"], 2200),
    ("GluteusMedius", ["gluteus medius muscle"], 2200),
    ("QuadricepsFemoris", ["vastus lateralis muscle", "vastus medialis muscle",
                            "vastus intermedius muscle", "rectus femoris muscle"], 2600),
    ("Hamstrings", ["long head of biceps femoris", "short head of biceps femoris",
                    "semitendinosus muscle", "semimembranosus muscle"], 2600),
    ("AdductorGroup", ["adductor magnus", "adductor longus", "adductor brevis",
                       "(adductor minimus)", "gracilis"], 2200),
    ("Gastrocnemius", ["medial head of gastrocnemius",
                       "lateral head of gastrocnemius"], 2000),
    ("Soleus", ["soleus muscle"], 2000),
    ("TibialisAnterior", ["tibialis anterior muscle"], 1800),
    ("Iliopsoas", ["psoas major", "iliacus muscle"], 2000),
    ("RectusAbdominis", ["rectus abdominis muscle"], 2000),
    ("ExternalOblique", ["external abdominal oblique muscle"], 2000),
    ("InternalOblique", ["internal abdominal oblique muscle"], 2000),
    ("TransversusAbdominis", ["transversus abdominis muscle"], 1800),
    ("ErectorSpinae", ["iliocostalis", "longissimus", "spinalis"], 2400),
    ("Multifidus", ["multifidus"], 1800),
    ("LatissimusDorsi", ["latissimus dorsi muscle"], 2200),
    ("Trapezius", ["descending part of trapezius", "ascending part of trapezius",
                   "transverse part of trapezius"], 2200),
    ("Rhomboids", ["rhomboid major muscle", "rhomboid minor muscle"], 1600),
    ("Deltoid", ["acromial part of deltoid", "clavicular part of deltoid",
                 "scapular spinal part of deltoid"], 2000),
    ("PectoralisMajor", ["clavicular head of pectoralis major",
                         "sternocostal head of pectoralis major",
                         "(abdominal part of pectoralis major"], 2000),
    ("BicepsBrachii", ["long head of biceps brachii",
                       "short head of biceps brachii"], 1800),
    ("TricepsBrachii", ["long head of triceps brachii",
                        "lateral head of triceps brachii",
                        "medial head of triceps brachii"], 1800),
    ("ForearmFlexors", ["flexor", "pronator", "palmaris"], 2200),
    ("ForearmExtensors", ["extensor", "supinator", "anconeus",
                          "brachioradialis"], 2200),
    ("RotatorCuff", ["supraspinatus", "infraspinatus", "teres minor",
                     "subscapularis"], 2000),
]
# patterns that must NOT match for the forearm groups (leg/foot look-alikes
# and bone landmarks that happen to start with the same words)
FOREARM_EXCLUDE = ("brevis", "hallucis", "digitorum longus", "digiti minimi",
                   "tendon", "sheath", "bursa", "fascia", "retinaculum",
                   "crest", "tubercle", "groove", "fossa", "foramen",
                   "tuberosity", "trochanter", "condyle", "epicondyle",
                   "malleolus")

# (stem, [group empty names], tri budget, split_left_right)
BONES = [
    ("Skull", ["Cranium.g"], 3000, False),
    ("SpineCervical", ["Cervical vertebrae.g"], 1500, False),
    ("SpineThoracic", ["Thoracic vertebrae.g"], 2000, False),
    ("SpineLumbar", ["Lumbar vertebrae.g"], 1500, False),
    ("RibCage", ["Thoracic skeleton.g"], 3000, False),
    ("Pelvis", ["Bony pelvis.g", "Bones of pelvic girdle.g"], 3000, False),
    ("UpperLimb", ["Skeleton of upper limbs.g", "Bones of upper limb.g",
                   "Bones of hand.g", "Bones of pectoral girdle.g",
                   "Pectoral girdle.g"], 3500, True),
    ("LowerLimb", ["Skeleton of lower limbs.g", "Bones of lower limb.g",
                   "Bones of foot.g"], 3500, True),
]
TEETH_GROUPS = ["Teeth.g", "Anterior teeth.g", "Posterior teeth.g"]
SKIN_BUDGET = 12000
SKIN_EXCLUDE_STARTS = ("hairs", "hair", "nail", "pubic")


def get_mesh(name):
    o = bpy.data.objects.get(name)
    return o if o is not None and o.type == "MESH" else None


def deselect_all():
    bpy.ops.object.select_all(action="DESELECT")


def bake_transform(obj):
    if obj.data is not None and obj.data.users > 1:
        obj.data = obj.data.copy()  # FBX import shares datablocks L/R
    from mathutils import Matrix
    if obj.parent is None and obj.matrix_world == Matrix.Identity(4):
        return  # already in world frame; skip the slow operator
    mw = obj.matrix_world.copy()
    obj.parent = None
    obj.matrix_world = mw
    bpy.context.view_layer.objects.active = obj
    deselect_all()
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)


def mesh_tris(obj):
    return sum(len(p.vertices) - 2 for p in obj.data.polygons)


def join_names(names, new_name):
    """Join scene meshes (by name) into one; returns the new name."""
    objs = [o for n in names if (o := get_mesh(n)) is not None]
    deselect_all()
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    joined = bpy.context.view_layer.objects.active
    joined.name = new_name
    if joined.data:
        joined.data.name = new_name
    return new_name


def cleanup_mesh(obj):
    # Merge verts closer than 0.1 mm (FBX seams). bmesh: no mode switching.
    try:
        import bmesh
        me = obj.data
        bm = bmesh.new()
        bm.from_mesh(me)
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0001)
        bm.to_mesh(me)
        bm.free()
        me.update()
    except Exception as exc:  # never let cleanup break the build
        print(f"cleanup skipped for {obj.name}: {exc}")


def decimate_to(obj, budget):
    current = mesh_tris(obj)
    if current <= budget:
        return current, current
    ratio = max(0.02, budget / current)
    mod = obj.modifiers.new("Decimate", "DECIMATE")
    mod.ratio = ratio
    deselect_all()
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=mod.name)
    return current, mesh_tris(obj)


def finish_piece(new_name, part_count, budget):
    """cleanup + decimate a just-joined mesh; returns its report row."""
    obj = get_mesh(new_name)
    cleanup_mesh(obj)
    before, after = decimate_to(obj, budget)
    return {"name": new_name, "parts": part_count,
            "tris_before": before, "tris_after": after}


def group_mesh_names(empty_name):
    """Names of live MESH objects under an empty (recursive)."""
    root = bpy.data.objects.get(empty_name)
    found = []
    if root is None:
        return found

    def walk(o):
        for c in o.children:
            if c.type == "MESH":
                found.append(c.name)
            walk(c)

    walk(root)
    return [n for n in found if get_mesh(n) is not None]


def main():
    report = {"muscles": [], "bones": [], "skin": None, "warnings": []}
    kept = set()
    used = set()
    bpy.ops.wm.read_factory_settings(use_empty=True)

    def import_file(fname):
        before = set(bpy.data.objects.keys())
        bpy.ops.import_scene.fbx(filepath=os.path.join(RAW, fname))
        return set(bpy.data.objects.keys()) - before

    # ---- muscles (own snapshot, so patterns can't grab bones/skin) ----
    muscular_names = import_file("MuscularSystem100.fbx")

    def muscle_pool():
        return [n for n in muscular_names
                if n not in used and get_mesh(n) is not None]

    # Which world-X sign is the body's left? The muscle file names sides.
    left_sign = None
    probe = bpy.data.objects.get("Soleus muscle.l")
    if probe is not None and probe.type == "MESH":
        cx = sum((probe.matrix_world @ v.co).x for v in probe.data.vertices)
        cx /= max(1, len(probe.data.vertices))
        left_sign = 1 if cx > 0 else -1
    if left_sign is None:
        report["warnings"].append("could not determine left/right X sign")
        left_sign = 1

    for stem, patterns, budget in MUSCLES:
        matched = []
        for pat in patterns:
            for n in muscle_pool():
                if n in matched:
                    continue
                low = n.lower()
                if not low.startswith(pat):
                    continue
                if stem in ("ForearmFlexors", "ForearmExtensors"):
                    if any(x in low for x in FOREARM_EXCLUDE):
                        continue
                matched.append(n)
        if not matched:
            report["warnings"].append(f"no meshes matched for {stem}")
            continue
        for n in matched:
            bake_transform(get_mesh(n))
        new_name = join_names(matched, stem)
        used.update(matched)
        muscular_names.difference_update(matched)
        muscular_names.add(new_name)
        kept.add(new_name)
        report["muscles"].append(finish_piece(new_name, len(matched), budget))

    # ---- bones (own snapshot; groups can't resolve elsewhere) ----
    skeletal_names = import_file("SkeletalSystem100.fbx")

    def in_skeletal(names):
        return [n for n in names if n in skeletal_names
                and n not in used and get_mesh(n) is not None]

    teeth = set()
    for gname in TEETH_GROUPS:
        if gname in skeletal_names:
            teeth.update(group_mesh_names(gname))
    for stem, groups, budget, split in BONES:
        pool = []
        for gname in groups:
            if gname not in skeletal_names:
                report["warnings"].append(f"group not found: {gname}")
                continue
            pool.extend(group_mesh_names(gname))
        pool = [n for n in in_skeletal(pool) if n not in teeth]
        if not pool:
            report["warnings"].append(f"no meshes pooled for {stem}")
            continue
        for n in pool:
            bake_transform(get_mesh(n))
        if split:
            def side_cx(n):
                o = get_mesh(n)
                s = sum((o.matrix_world @ v.co).x for v in o.data.vertices)
                return s / max(1, len(o.data.vertices))

            left = [n for n in pool if side_cx(n) * left_sign > 0.005]
            right = [n for n in pool if n not in left]
            for side_name, side_pool in ((stem + "_L", left),
                                         (stem + "_R", right)):
                if not side_pool:
                    report["warnings"].append(f"empty side {side_name}")
                    continue
                new_name = join_names(side_pool, side_name)
                used.update(side_pool)
                skeletal_names.difference_update(side_pool)
                skeletal_names.add(new_name)
                kept.add(new_name)
                report["bones"].append(
                    finish_piece(new_name, len(side_pool), budget))
        else:
            new_name = join_names(pool, stem)
            used.update(pool)
            skeletal_names.difference_update(pool)
            skeletal_names.add(new_name)
            kept.add(new_name)
            report["bones"].append(finish_piece(new_name, len(pool), budget))

    # ---- skin: region meshes only, except hair/nails ----
    region_names = import_file("Regions100.fbx")
    skin_pool = [n for n in region_names
                 if n not in used and get_mesh(n) is not None
                 and not n.lower().startswith(SKIN_EXCLUDE_STARTS)]
    for n in skin_pool:
        bake_transform(get_mesh(n))
    new_name = join_names(skin_pool, "Skin")
    used.update(skin_pool)
    kept.add(new_name)
    skin_row = finish_piece(new_name, len(skin_pool), SKIN_BUDGET)
    report["skin"] = skin_row

    # delete everything we did not keep
    deselect_all()
    for o in list(bpy.data.objects):
        if o.name in kept:
            continue
        if o.type in ("MESH", "ARMATURE"):
            bpy.data.objects.remove(o, do_unlink=True)
    for _ in range(2):  # drop empties whose children are gone
        for o in list(bpy.data.objects):
            if o.type == "EMPTY" and not o.children:
                bpy.data.objects.remove(o, do_unlink=True)

    total = sum(m["tris_after"] for m in report["muscles"])
    total += sum(b["tris_after"] for b in report["bones"])
    total += report["skin"]["tris_after"]
    report["total_triangles"] = total

    bpy.ops.wm.save_as_mainfile(
        filepath=os.path.join(RAW, "body_work.blend"))

    print("BUILD_JSON_START")
    print(json.dumps(report, indent=1))
    print("BUILD_JSON_END")

    # preview render (front view). NOTE: printed AFTER the report so a
    # render crash can never hide the build results. Uses Cycles on CPU
    # because headless machines often lack the OpenGL Workbench needs.
    bpy.context.scene.render.engine = "CYCLES"
    bpy.context.scene.cycles.device = "CPU"
    bpy.context.scene.cycles.samples = 4
    world = bpy.data.worlds.new("PreviewWorld")
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg is not None:
        bg.inputs["Color"].default_value = (1.0, 1.0, 1.0, 1.0)
        bg.inputs["Strength"].default_value = 1.0
    bpy.context.scene.world = world
    sun_data = bpy.data.lights.new("PreviewSun", "SUN")
    sun_data.energy = 3.0
    sun = bpy.data.objects.new("PreviewSun", sun_data)
    bpy.context.scene.collection.objects.link(sun)
    sun.rotation_euler = (0.6, 0.0, 0.3)
    cam_data = bpy.data.cameras.new("PreviewCam")
    cam = bpy.data.objects.new("PreviewCam", cam_data)
    bpy.context.scene.collection.objects.link(cam)
    bpy.context.scene.camera = cam
    cam.location = (0.0, -3.4, 1.0)
    target = bpy.data.objects.new("PreviewTarget", None)
    bpy.context.scene.collection.objects.link(target)
    target.location = (0.0, 0.0, 0.9)
    track = cam.constraints.new("TRACK_TO")
    track.target = target
    track.track_axis = "TRACK_NEGATIVE_Z"
    track.up_axis = "UP_Y"
    bpy.context.scene.render.resolution_x = 600
    bpy.context.scene.render.resolution_y = 800
    bpy.context.scene.render.filepath = os.path.join(RAW, "preview.png")
    bpy.context.scene.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(write_still=True)
    print("BUILD_DONE")


main()
