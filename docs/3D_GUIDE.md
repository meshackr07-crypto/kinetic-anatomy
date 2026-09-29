# 3D Guide

## How it works
1. A rigged human model (`public/models/body.glb`) has a skeleton (bones) and separate meshes for skin, muscles, and bones.
2. A **pose** is a list of bone rotations saved as JSON.
3. The viewer sets each bone's rotation from the pose. To move between stances it blends from pose A to pose B.
4. A **muscle role** (primary, stabilizer, stretched) picks the highlight color of that muscle's mesh.

## Model requirements (decide D-1 first)
- Format: GLB. Humanoid skeleton with named bones. Muscles as separate named meshes.
- Target: under 5 MB after compression, under 100,000 triangles.
- Bone and mesh names must match `joints.bone_name` and `muscles.mesh_name` exactly.
- Record the license and source in `docs/CONTENT_GUIDE.md`. Do not use a model without a license that allows web and commercial use.

## Pose JSON shape
```json
{
  "version": 1,
  "bones": {
    "UpLeg.L":  { "q": [0.0, 0.0, 0.0, 1.0] },
    "Leg.L":    { "q": [0.0, 0.0, 0.0, 1.0] },
    "Hips":     { "q": [0.0, 0.0, 0.0, 1.0], "position": [0, 0, 0] }
  }
}
```
Bone names use the frozen convention in `scripts/blender/naming.json`
(Blender-style `.L` / `.R` side suffixes, e.g. `UpLeg.L`).
`q` is a quaternion `[x, y, z, w]`. Quaternions blend smoothly (slerp). Angles in degrees are converted to quaternions in `src/lib/pose/`.

## Muscle colors (suggested)
- primary: red-orange
- stabilizer: yellow
- stretched: blue
Never rely on color alone. Also show a legend and text labels for colorblind users.

## Performance rules
- Load the viewer with `dynamic(() => import(...), { ssr: false })`.
- `dpr={[1, 2]}` on the Canvas. Render on demand when nothing moves (`frameloop="demand"`).
- Compress with gltf-transform. Load with drei's `useGLTF`.
- Dispose of geometries and materials on unmount.
- Test on a real mid-range phone, not only a laptop.

## Files
```
src/components/viewer/StanceViewer.tsx   Canvas, lights, controls
src/components/viewer/BodyModel.tsx      loads GLB, applies pose, colors muscles
src/lib/pose/types.ts                    Pose type and Zod schema
src/lib/pose/blend.ts                    slerp between poses
src/lib/pose/store.ts                    Zustand store
```
