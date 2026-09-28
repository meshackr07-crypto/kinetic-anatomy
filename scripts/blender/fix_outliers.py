# Remove outlier geometry (stray islands + spike triangles) from the kept
# meshes in body_work.blend, then re-render the preview + layer PNGs.
# Usage: blender -b assets-raw/body_work.blend -P scripts/blender/fix_outliers.py
import os

import bmesh
import bpy

RAW = os.path.abspath(os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "..", "..", "assets-raw"))

MIN_ISLAND_FACES = 25      # drop disconnected bits smaller than this
SPIKE_AREA_FACTOR = 400.0  # drop faces bigger than median * this

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


def clean_mesh(obj):
    me = obj.data
    bm = bmesh.new()
    bm.from_mesh(me)

    # 1. find face islands (faces sharing verts) and drop tiny ones
    vert_faces = {}
    for f in bm.faces:
        for v in f.verts:
            vert_faces.setdefault(v.index, []).append(f.index)
    face_by_index = {f.index: f for f in bm.faces}
    seen = set()
    removed = 0
    for f in bm.faces:
        if f.index in seen:
            continue
        # BFS over shared verts
        stack = [f.index]
        island = set()
        seen.add(f.index)
        while stack:
            fi = stack.pop()
            island.add(fi)
            face = face_by_index[fi]
            for v in face.verts:
                for ni in vert_faces[v.index]:
                    if ni not in seen:
                        seen.add(ni)
                        stack.append(ni)
        if len(island) < MIN_ISLAND_FACES:
            for fi in island:
                bm.faces.remove(face_by_index[fi])
                removed += 1
    bm.faces.ensure_lookup_table()

    # 2. drop spike triangles (huge area vs the mesh median)
    if len(bm.faces):
        areas = sorted(f.calc_area() for f in bm.faces)
        median = areas[len(areas) // 2]
        limit = max(1e-8, median * SPIKE_AREA_FACTOR)
        for f in list(bm.faces):
            if f.calc_area() > limit:
                bm.faces.remove(f)
                removed += 1

    # 3. drop verts left without faces, fix normals
    bm.verts.ensure_lookup_table()
    for v in list(bm.verts):
        if not v.link_faces:
            bm.verts.remove(v)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    me.update()
    return removed


report = {}
for o in bpy.data.objects:
    if o.type != "MESH":
        continue
    n = clean_mesh(o)
    report[o.name] = {"faces_removed": n,
                      "tris": sum(len(p.vertices) - 2
                                  for p in o.data.polygons)}

bpy.ops.wm.save_mainfile()

# re-render full preview + layers (this file has no camera/lights saved)
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
for fname, visible in {
    "preview": None,  # everything visible
    "layer-skin": ["Skin"],
    "layer-muscles": MUSCLE_NAMES,
    "layer-bones": BONE_NAMES,
}.items():
    for o in bpy.data.objects:
        if o.type == "MESH":
            o.hide_render = visible is not None and o.name not in visible
    scene.render.filepath = os.path.join(RAW, fname + ".png")
    bpy.ops.render.render(write_still=True)
    print(f"rendered {fname}.png")

total = sum(v["tris"] for v in report.values())
print("FIX_JSON_START")
print(f'{{"total_triangles": {total}, "meshes": {len(report)}}}')
for name, row in sorted(report.items()):
    if row["faces_removed"]:
        print(f'  {name}: removed {row["faces_removed"]} faces, '
              f'{row["tris"]} tris left')
print("FIX_JSON_END")
