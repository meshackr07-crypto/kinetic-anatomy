import * as THREE from "three";
import { describe, expect, it } from "vitest";

import { blendPoses, easeInOut } from "./blend";
import { HORSE_STANCE } from "./poses";
import { PoseSchema, type Pose } from "./types";

const REST_HIPS: Pose = PoseSchema.parse({
  version: 1,
  bones: { Hips: { q: [0, 0, 0, 1], position: [0, 0, 0] } },
});

describe("blendPoses", () => {
  it("returns the exact endpoints at t=0 and rest everywhere at t=1", () => {
    expect(blendPoses(HORSE_STANCE, REST_HIPS, 0)).toEqual(HORSE_STANCE);
    // Bones blended fully to rest stay listed but hold identity (a no-op
    // for the engine), so the end state is exactly "standing at rest".
    const end = blendPoses(HORSE_STANCE, REST_HIPS, 1);
    const identity = new THREE.Quaternion();
    for (const bone of Object.values(end.bones)) {
      const q = new THREE.Quaternion(...bone.q);
      expect(q.angleTo(identity)).toBeCloseTo(0, 5);
    }
    expect(end.bones["Hips"].position).toEqual([0, 0, 0]);
  });

  it("lands halfway (angle and position) at t=0.5", () => {
    const mid = blendPoses(HORSE_STANCE, REST_HIPS, 0.5);
    const startQ = new THREE.Quaternion(...HORSE_STANCE.bones["Leg.L"].q);
    const midQ = new THREE.Quaternion(...mid.bones["Leg.L"].q);
    const identity = new THREE.Quaternion();
    // Half the rotation: angle from start to mid equals mid to identity.
    expect(midQ.angleTo(startQ)).toBeCloseTo(midQ.angleTo(identity), 5);
    expect(mid.bones["Hips"].position?.[1]).toBeCloseTo(-0.15, 5);
  });

  it("treats a bone missing on one side as rest (no jump)", () => {
    const onlySpine = PoseSchema.parse({
      version: 1,
      bones: { Spine: { q: [0, 0, 0, 1] } },
    });
    const start = blendPoses(HORSE_STANCE, onlySpine, 0);
    expect(start.bones["Leg.L"].q).toEqual(HORSE_STANCE.bones["Leg.L"].q);
    // Spine blends from its horse bend (-6 deg) toward rest: halfway the
    // remaining angle is half the original.
    const mid = blendPoses(HORSE_STANCE, onlySpine, 0.5);
    const horseQ = new THREE.Quaternion(...HORSE_STANCE.bones["Spine"].q);
    const midQ = new THREE.Quaternion(...mid.bones["Spine"].q);
    expect(midQ.angleTo(new THREE.Quaternion())).toBeCloseTo(
      horseQ.angleTo(new THREE.Quaternion()) / 2,
      5,
    );
  });

  it("rejects t outside [0, 1]", () => {
    expect(() => blendPoses(HORSE_STANCE, REST_HIPS, -0.1)).toThrow(RangeError);
    expect(() => blendPoses(HORSE_STANCE, REST_HIPS, 1.1)).toThrow(RangeError);
    expect(() => blendPoses(HORSE_STANCE, REST_HIPS, NaN)).toThrow(RangeError);
  });
});

describe("easeInOut", () => {
  it("pins the endpoints and rises monotonically", () => {
    expect(easeInOut(0)).toBe(0);
    expect(easeInOut(1)).toBe(1);
    expect(easeInOut(0.5)).toBeCloseTo(0.5, 10);
    const samples = [0.1, 0.3, 0.5, 0.7, 0.9].map(easeInOut);
    const sorted = [...samples].sort((x, y) => x - y);
    expect(samples).toEqual(sorted);
  });
});
