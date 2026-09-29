import * as THREE from "three";
import { describe, expect, it } from "vitest";

import { applyBends, countModel, degreesToRadians } from "./applyPose";
import { TEST_BENDS, TestPoseSchema } from "./types";

describe("TestPoseSchema", () => {
  it("accepts the frozen T-027 verification bends", () => {
    expect(TestPoseSchema.parse(TEST_BENDS)).toEqual(TEST_BENDS);
  });

  it("rejects bends past 180 degrees", () => {
    expect(() =>
      TestPoseSchema.parse([{ bone: "Spine", axis: "x", degrees: 200 }]),
    ).toThrow();
  });

  it("rejects an empty pose", () => {
    expect(() => TestPoseSchema.parse([])).toThrow();
  });
});

describe("applyBends", () => {
  it("bends a named bone about its own axis without moving it", () => {
    const root = new THREE.Group();
    const bone = new THREE.Bone();
    bone.name = "Forearm.L";
    bone.position.set(0.2, 0, 1.1);
    root.add(bone);

    const report = applyBends(root, [
      { bone: "Forearm.L", axis: "x", degrees: -50 },
    ]);

    expect(report).toEqual({ applied: ["Forearm.L"], missing: [] });
    const expected = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(degreesToRadians(-50), 0, 0),
    );
    expect(bone.quaternion.angleTo(expected)).toBeCloseTo(0, 5);
    expect(bone.position.toArray()).toEqual([0.2, 0, 1.1]);
  });

  it("reports names that have no matching bone", () => {
    const root = new THREE.Group();
    const report = applyBends(root, [
      { bone: "NoSuchBone", axis: "x", degrees: 10 },
    ]);
    expect(report).toEqual({ applied: [], missing: ["NoSuchBone"] });
  });
});

describe("countModel", () => {
  it("counts meshes and bones", () => {
    const root = new THREE.Group();
    const bone = new THREE.Bone();
    root.add(bone);
    bone.add(new THREE.Mesh(new THREE.BufferGeometry()));
    expect(countModel(root)).toEqual({ meshes: 1, bones: 1 });
  });
});
