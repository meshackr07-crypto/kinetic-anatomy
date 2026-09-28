# Inspect a Z-Anatomy FBX file headlessly and report its contents.
# Usage (from the project root, PowerShell):
#   & "tools\blender-5.2.2-windows-x64\blender.exe" -b -P scripts\blender\inspect_fbx.py -- <file.fbx>
# Everything after "--" is passed to this script (not to Blender itself).
import json
import sys

import bpy


def main() -> None:
    argv = sys.argv
    fbx_path = argv[argv.index("--") + 1]

    # Start from an empty scene so the report covers only this file.
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=fbx_path)

    meshes = []
    armatures = {}
    others = []
    total_tris = 0
    for obj in bpy.data.objects:
        if obj.type == "MESH":
            mesh = obj.data
            poly_count = len(mesh.polygons)
            tri_count = sum(len(p.vertices) - 2 for p in mesh.polygons)
            total_tris += tri_count
            meshes.append(
                {
                    "name": obj.name,
                    "polygons": poly_count,
                    "triangles": tri_count,
                    "materials": [m.name if m else None for m in mesh.materials],
                }
            )
        elif obj.type == "ARMATURE":
            arm = obj.data
            armatures[obj.name] = [b.name for b in arm.bones]
        else:
            others.append({"name": obj.name, "type": obj.type})

    report = {
        "file": fbx_path,
        "mesh_count": len(meshes),
        "total_triangles": total_tris,
        "armatures": armatures,
        "other_objects": others,
        "meshes": sorted(meshes, key=lambda m: m["triangles"], reverse=True),
    }
    print("INSPECT_JSON_START")
    print(json.dumps(report, indent=1))
    print("INSPECT_JSON_END")


main()
