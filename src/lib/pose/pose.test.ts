import * as THREE from "three";
import { describe, expect, it } from "vitest";

import {
  applyBends,
  applyPose,
  bendToQuaternion,
  countModel,
  degreesToRadians,
  poseFromBends,
  toSceneName,
} from "./applyPose";
import { HORSE_STANCE } from "./poses";
import { PoseSchema, TEST_BENDS, TestPoseSchema } from "./types";

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

describe("PoseSchema", () => {
  it("accepts the horse stance", () => {
    expect(PoseSchema.parse(HORSE_STANCE)).toEqual(HORSE_STANCE);
  });

  it("moves the hips, thighs, knees, ankles, spine, and both arms", () => {
    const bones = Object.keys(HORSE_STANCE.bones);
    for (const name of [
      "Hips",
      "UpLeg.L",
      "UpLeg.R",
      "Leg.L",
      "Leg.R",
      "Foot.L",
      "Foot.R",
      "Spine",
      "Chest",
      "UpperArm.L",
      "UpperArm.R",
      "Forearm.L",
      "Forearm.R",
    ]) {
      expect(bones).toContain(name);
    }
    expect(HORSE_STANCE.bones["Hips"].position).toEqual([0, -0.3, 0]);
  });

  it("rejects a wrong version, a non-unit quaternion, and empty bones", () => {
    expect(() =>
      PoseSchema.parse({ version: 2, bones: HORSE_STANCE.bones }),
    ).toThrow();
    expect(() =>
      PoseSchema.parse({
        version: 1,
        bones: { Spine: { q: [0, 0, 0, 2] } },
      }),
    ).toThrow();
    expect(() => PoseSchema.parse({ version: 1, bones: {} })).toThrow();
  });
});

describe("bendToQuaternion and poseFromBends", () => {
  it("converts a bend to the matching local-axis rotation", () => {
    const q = bendToQuaternion("x", -50);
    const expected = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(degreesToRadians(-50), 0, 0),
    );
    expect(q.angleTo(expected)).toBeCloseTo(0, 5);
  });

  it("composes bends exactly like sequential applyBends", () => {
    const bends = [
      { bone: "Leg.L", axis: "x", degrees: 40 },
      { bone: "Leg.L", axis: "y", degrees: 10 },
    ] as const;
    const quats = poseFromBends([...bends]);

    const sequential = new THREE.Bone();
    // GLTFLoader stores "Leg.L" as "LegL"; bends use frozen names.
    sequential.name = "LegL";
    applyBends(new THREE.Group().add(sequential), [...bends]);
    const composed = new THREE.Quaternion(
      quats["Leg.L"][0],
      quats["Leg.L"][1],
      quats["Leg.L"][2],
      quats["Leg.L"][3],
    );
    expect(composed.angleTo(sequential.quaternion)).toBeCloseTo(0, 5);
  });
});

describe("applyPose", () => {
  it("poses relative to rest and adds the position offset once", () => {
    const root = new THREE.Group();
    const hips = new THREE.Bone();
    hips.name = "Hips";
    hips.position.set(0, 0.9, 0);
    const rest = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0.5, 0, 0),
    );
    hips.quaternion.copy(rest);
    root.add(hips);

    // The test scene holds only Hips; every other stance bone is missing.
    const report = applyPose(root, HORSE_STANCE);
    expect(report.applied).toEqual(["Hips"]);
    expect(report.missing).toContain("Spine");
    expect(report.missing).toHaveLength(
      Object.keys(HORSE_STANCE.bones).length - 1,
    );

    // Pose quaternions ride on top of rest; the offset lands once.
    const hipsPose = HORSE_STANCE.bones["Hips"].q;
    const expected = rest
      .clone()
      .multiply(
        new THREE.Quaternion(hipsPose[0], hipsPose[1], hipsPose[2], hipsPose[3]),
      );
    expect(hips.quaternion.angleTo(expected)).toBeCloseTo(0, 5);
    expect(hips.position.y).toBeCloseTo(0.9 - 0.3, 5);

    // Idempotent: applying again changes nothing (StrictMode/blending safe).
    applyPose(root, HORSE_STANCE);
    expect(hips.quaternion.angleTo(expected)).toBeCloseTo(0, 5);
    expect(hips.position.y).toBeCloseTo(0.9 - 0.3, 5);
  });

  it("matches sequential applyBends even with non-identity rest", () => {
    const bends = [
      { bone: "UpperArm.L", axis: "x", degrees: 30 },
      { bone: "UpperArm.L", axis: "z", degrees: 10 },
    ] as const;
    const quats = poseFromBends([...bends]);
    const rest = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0.2, 0.4, 1.1),
    );

    const sequential = new THREE.Bone();
    sequential.name = "UpperArmL";
    sequential.quaternion.copy(rest);
    applyPose(new THREE.Group().add(sequential), {
      version: 1,
      bones: {
        "UpperArm.L": {
          q: [quats["UpperArm.L"][0], quats["UpperArm.L"][1], quats["UpperArm.L"][2], quats["UpperArm.L"][3]],
        },
      },
    });

    const relative = new THREE.Bone();
    relative.name = "UpperArmL";
    relative.quaternion.copy(rest);
    applyBends(new THREE.Group().add(relative), [...bends]);

    expect(sequential.quaternion.angleTo(relative.quaternion)).toBeCloseTo(
      0,
      5,
    );
  });

  it("reports bones the model does not have", () => {
    const report = applyPose(new THREE.Group(), {
      version: 1,
      bones: { NoSuchBone: { q: [0, 0, 0, 1] } },
    });
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
