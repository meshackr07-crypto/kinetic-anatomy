import { poseFromBends } from "./applyPose";
import { PoseSchema, type Pose, type TestBend } from "./types";

/**
 * Stance library. Each stance is authored here in human-readable degrees
 * (bone-local axes, frozen names from scripts/blender/naming.json) and
 * stored as the quaternion Pose JSON from docs/3D_GUIDE.md — the same shape
 * that will later be saved in `stances.pose` (T-040/T-041).
 *
 * HORSE_STANCE is a generic medium horse stance (Kiba-dachi family):
 * wide feet slightly turned out, deep bent knees, upright torso, fists
 * chambered at the waist. Style-specific variants arrive with T-041.
 */
/**
 * Rig axis semantics, proven by single-bone screenshot isolation (T-032).
 * Bends compose ON TOP of each bone's rest orientation (see applyPose), so
 * small angles always mean small moves from the modeled body:
 * - X swings a limb forward (negative) / backward (positive). Elbows and
 *   knees flex about X too (Leg +75 = deep knee bend, Forearm -80 = fist
 *   cocked forward).
 * - Y spreads the legs outward/inward: LEFT leg negative = out, RIGHT leg
 *   positive = out. Same rule turns the feet (toes out = L negative).
 * - Z twists a limb about its own long axis (leg stays put, flesh turns).
 */
const HORSE_STANCE_BENDS: TestBend[] = [
  // Hips open wide (abduct) and flex forward; knees track over the feet.
  { bone: "UpLeg.L", axis: "y", degrees: -25 },
  { bone: "UpLeg.L", axis: "x", degrees: -40 },
  { bone: "UpLeg.R", axis: "y", degrees: 25 },
  { bone: "UpLeg.R", axis: "x", degrees: -40 },
  // Deep knee bend.
  { bone: "Leg.L", axis: "x", degrees: 75 },
  { bone: "Leg.R", axis: "x", degrees: 75 },
  // Ankles compensate so the feet stay flat; toes point slightly out.
  { bone: "Foot.L", axis: "x", degrees: -35 },
  { bone: "Foot.L", axis: "y", degrees: -12 },
  { bone: "Foot.R", axis: "x", degrees: -35 },
  { bone: "Foot.R", axis: "y", degrees: 12 },
  // Torso stays upright with a slight forward set.
  { bone: "Spine", axis: "x", degrees: -6 },
  { bone: "Chest", axis: "x", degrees: -6 },
  // Arms hang slightly back, elbows bent, fists chambered at the waist.
  { bone: "UpperArm.L", axis: "x", degrees: 12 },
  { bone: "UpperArm.R", axis: "x", degrees: 12 },
  { bone: "Forearm.L", axis: "x", degrees: -80 },
  { bone: "Forearm.R", axis: "x", degrees: -80 },
];

/** Bent knees mean nothing without a lowered body: hips drop 30 cm. */
const HORSE_STANCE_HIPS_DROP: [number, number, number] = [0, -0.3, 0];

/**
 * Author a pose in degrees (converted to the stored quaternion shape).
 * The pose tool (T-040) and stance seed data (T-041) will build on this.
 */
export function makePose(
  bends: readonly TestBend[],
  hipsOffset?: [number, number, number],
): Pose {
  const quats = poseFromBends(bends);
  const bones: Pose["bones"] = {};
  for (const [bone, q] of Object.entries(quats)) {
    bones[bone] = { q };
  }
  if (hipsOffset !== undefined) {
    const identity: Pose["bones"][string]["q"] = [0, 0, 0, 1];
    const hips = bones["Hips"] ?? { q: identity };
    bones["Hips"] = { ...hips, position: hipsOffset };
  }
  return PoseSchema.parse({ version: 1, bones });
}

export const HORSE_STANCE: Pose = makePose(
  HORSE_STANCE_BENDS,
  HORSE_STANCE_HIPS_DROP,
);

/**
 * Standing at rest: every offset is identity, so the engine renders the
 * model's untouched rest pose. The transition demo (T-033) blends between
 * this and HORSE_STANCE.
 */
export const STANDING: Pose = PoseSchema.parse({
  version: 1,
  bones: { Hips: { q: [0, 0, 0, 1], position: [0, 0, 0] } },
});
