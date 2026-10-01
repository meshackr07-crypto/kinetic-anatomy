import * as THREE from "three";

import { PoseSchema, type Pose } from "./types";

const IDENTITY_Q: [number, number, number, number] = [0, 0, 0, 1];
const ZERO_P: [number, number, number] = [0, 0, 0];

/**
 * Blend two poses (spherical interpolation per bone). A bone missing from
 * one side counts as "rest" (identity offset, zero position shift), so
 * blending poses with different bone sets never jumps: at t=0 the result
 * equals `a`, at t=1 it equals `b`.
 */
export function blendPoses(a: Pose, b: Pose, t: number): Pose {
  if (!Number.isFinite(t) || t < 0 || t > 1) {
    throw new RangeError(`blend factor t must be within [0, 1], got ${t}`);
  }
  const names = new Set([...Object.keys(a.bones), ...Object.keys(b.bones)]);
  const bones: Pose["bones"] = {};
  for (const name of names) {
    const boneA = a.bones[name];
    const boneB = b.bones[name];
    const qa = new THREE.Quaternion(...(boneA?.q ?? IDENTITY_Q));
    const qb = new THREE.Quaternion(...(boneB?.q ?? IDENTITY_Q));
    const q = qa.clone().slerp(qb, t);
    const pa = boneA?.position ?? ZERO_P;
    const pb = boneB?.position ?? ZERO_P;
    const entry: Pose["bones"][string] = {
      q: [q.x, q.y, q.z, q.w],
    };
    if (boneA?.position !== undefined || boneB?.position !== undefined) {
      entry.position = [
        pa[0] + (pb[0] - pa[0]) * t,
        pa[1] + (pb[1] - pa[1]) * t,
        pa[2] + (pb[2] - pa[2]) * t,
      ];
    }
    bones[name] = entry;
  }
  return PoseSchema.parse({ version: 1, bones });
}

/** Smooth ease in/out so transitions start and land gently, never robotic. */
export function easeInOut(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
