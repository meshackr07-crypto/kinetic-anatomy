import * as THREE from "three";
import { describe, expect, it } from "vitest";

import { applyBends, countModel, degreesToRadians, toSceneName } from "./applyPose";
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

describe("toSceneName", () => {
  it("strips dots the way GLTFLoader does", () => {
    expect(toSceneName("Forearm.L")).toBe("ForearmL");
    expect(toSceneName("Leg.L")).toBe("LegL");
  });

  it("leaves dot-free names unchanged", () => {
    expect(toSceneName("Spine")).toBe("Spine");
    expect(toSceneName("QuadricepsFemoris")).toBe("QuadricepsFemoris");
  });
});

describe("applyBends", () => {
  it("finds bones by frozen name even though the scene has no dots", () => {
    const root = new THREE.Group();
    const bone = new THREE.Bone();
    // GLTFLoader stores "Forearm.L" as "ForearmL"; bends use frozen names.
    bone.name = "ForearmL";
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
