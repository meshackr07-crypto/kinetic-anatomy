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
