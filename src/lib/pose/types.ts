import { z } from "zod";

/** Rotation axis in a bone's own local space. */
export const BendAxisSchema = z.enum(["x", "y", "z"]);
export type BendAxis = z.infer<typeof BendAxisSchema>;

/**
 * One joint bend. Bone names must match the frozen rig in
 * scripts/blender/naming.json (Blender-style `.L` / `.R` suffixes).
 */
export const TestBendSchema = z.object({
  bone: z.string().min(1),
  axis: BendAxisSchema,
  degrees: z.number().min(-180).max(180),
});
export type TestBend = z.infer<typeof TestBendSchema>;

/** A test pose is a non-empty list of joint bends. */
export const TestPoseSchema = z.array(TestBendSchema).min(1);
export type TestPose = z.infer<typeof TestPoseSchema>;

/**
 * Quaternion [x, y, z, w]. Must be unit length so it is a pure rotation.
 * Matches the Pose JSON shape in docs/3D_GUIDE.md.
 */
export const PoseQuaternionSchema = z
  .tuple([z.number(), z.number(), z.number(), z.number()])
  .refine(
    (q) => {
      const len = Math.hypot(q[0], q[1], q[2], q[3]);
      return Number.isFinite(len) && Math.abs(len - 1) < 1e-3;
    },
    { message: "quaternion must be unit length" },
  );
export type PoseQuaternion = z.infer<typeof PoseQuaternionSchema>;

/**
 * One bone's entry in a pose. `position` is an OFFSET in meters added to the
 * bone's rest position (three.js Y-up world, so Hips y -0.3 drops the body
 * 30 cm). Stays small on purpose: poses rotate, they never teleport.
 */
export const PoseBoneSchema = z.object({
  q: PoseQuaternionSchema,
  position: z
    .tuple([z.number(), z.number(), z.number()])
    .refine((p) => p.every((v) => Number.isFinite(v) && Math.abs(v) <= 2), {
      message: "position offset must stay within 2 meters",
    })
    .optional(),
});
export type PoseBone = z.infer<typeof PoseBoneSchema>;

/** Full pose JSON shape from docs/3D_GUIDE.md (quaternions blend smoothly). */
export const PoseSchema = z.object({
  version: z.literal(1),
  bones: z
    .record(z.string().min(1), PoseBoneSchema)
    .refine((bones) => Object.keys(bones).length >= 1, {
      message: "pose must move at least one bone",
    }),
});
export type Pose = z.infer<typeof PoseSchema>;

/**
 * T-027 verification pose, copied from scripts/blender/verify_glb.py
 * (Blender pose mode: Forearm.L -50, Leg.L +40, Spine -10 about local X).
 * Bending about the bone's own X axis in the browser matches Blender's
 * local-X euler bend after glTF export.
 */
export const TEST_BENDS: TestPose = [
  { bone: "Forearm.L", axis: "x", degrees: -50 },
  { bone: "Leg.L", axis: "x", degrees: 40 },
  { bone: "Spine", axis: "x", degrees: -10 },
];
