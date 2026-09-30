# 3D Model License

## The file this covers

`public/models/body.glb` — the rigged human body used by Kinetic Anatomy
(skin + 25 muscle meshes + 10 bone meshes on a 21-bone armature, built
2026-09-28/29).

## Source

Adapted from **Z-Anatomy**, an open-source human anatomy atlas in Blender:

- Project: https://github.com/LluisV/Z-Anatomy
- Site: https://www.z-anatomy.com/

We used Z-Anatomy FBX muscle/bone/skin meshes as the starting point, then:
selected and cleaned the meshes, decimated the triangle count, built our own
`BodyArmature` (21 bones), skinned the meshes to it, and exported `body.glb`.

## License: CC BY-SA 4.0

Z-Anatomy is licensed under the **Creative Commons Attribution-ShareAlike 4.0
International License (CC BY-SA 4.0)**:

- License deed: http://creativecommons.org/licenses/by-sa/4.0/

Because `body.glb` is a derivative (adapted) work, it is shared under **the
same license, CC BY-SA 4.0**. In plain words:

1. **Credit** — if you use our `body.glb`, name Z-Anatomy and Kinetic Anatomy
   and link this license.
2. **Share-alike** — if you remix or build on it, share your version under
   CC BY-SA 4.0 too.
3. Commercial web use is allowed under these terms.

## Full credit line to reuse

> 3D body adapted from Z-Anatomy (https://github.com/LluisV/Z-Anatomy) by
> Kinetic Anatomy, licensed under CC BY-SA 4.0
> (http://creativecommons.org/licenses/by-sa/4.0/).

## Asset record

Also recorded in `docs/CONTENT_GUIDE.md` as the project rules require.
