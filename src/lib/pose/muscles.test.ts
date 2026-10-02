import * as THREE from "three";
import { describe, expect, it } from "vitest";

import {
  applyMuscleRoles,
  HORSE_STANCE_MUSCLES,
  MUSCLE_MESHES,
  MUSCLE_ROLE_COLORS,
  resetMuscleColors,
  STANDING_MUSCLES,
  type MuscleMapping,
  type MuscleRole,
} from "./muscles";

function muscleScene(names: string[]): THREE.Group {
  const root = new THREE.Group();
  for (const name of names) {
    const mesh = new THREE.Mesh(
      new THREE.BufferGeometry(),
      new THREE.MeshStandardMaterial({ color: "#888888" }),
    );
    mesh.name = name;
    root.add(mesh);
  }
  return root;
}

describe("stance mappings", () => {
  it("only names meshes from the frozen rig list", () => {
    for (const mapping of [HORSE_STANCE_MUSCLES, STANDING_MUSCLES]) {
      for (const name of Object.keys(mapping)) {
        expect(MUSCLE_MESHES).toContain(name);
      }
    }
  });

  it("covers drivers, steadier muscles, and lengthened muscles", () => {
    const roles = new Set(Object.values(HORSE_STANCE_MUSCLES));
    expect(roles).toEqual(
      new Set<MuscleRole>(["primary", "stabilizer", "stretched"]),
    );
  });

  it("defines one distinct hex color per role", () => {
    const colors = Object.values(MUSCLE_ROLE_COLORS);
    expect(new Set(colors).size).toBe(3);
    for (const color of colors) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe("applyMuscleRoles", () => {
  it("glows mapped meshes and leaves the rest untouched", () => {
    const root = muscleScene(["QuadricepsFemoris", "BicepsBrachii"]);
    const mapping: MuscleMapping = { QuadricepsFemoris: "primary" };
    const report = applyMuscleRoles(root, mapping);
    expect(report).toEqual({ colored: ["QuadricepsFemoris"], unknown: [] });

    const quad = root.getObjectByName("QuadricepsFemoris") as THREE.Mesh;
    const quadMat = quad.material as THREE.MeshStandardMaterial;
    expect("#" + quadMat.emissive.getHexString()).toBe(
      MUSCLE_ROLE_COLORS.primary,
    );

    const biceps = root.getObjectByName("BicepsBrachii") as THREE.Mesh;
    const bicepsMat = biceps.material as THREE.MeshStandardMaterial;
    expect(bicepsMat.emissive.getHex()).toBe(0x000000);
  });

  it("reports mapping names missing from the model", () => {
    const root = muscleScene(["QuadricepsFemoris"]);
    const report = applyMuscleRoles(root, {
      QuadricepsFemoris: "primary",
      NoSuchMuscle: "stretched",
    });
    expect(report).toEqual({
      colored: ["QuadricepsFemoris"],
      unknown: ["NoSuchMuscle"],
    });
  });

  it("reset restores the exact original materials", () => {
    const root = muscleScene(["QuadricepsFemoris"]);
    const mesh = root.getObjectByName("QuadricepsFemoris") as THREE.Mesh;
    const original = mesh.material;
    applyMuscleRoles(root, { QuadricepsFemoris: "stabilizer" });
    expect(mesh.material).not.toBe(original);
    resetMuscleColors(root);
    expect(mesh.material).toBe(original);
  });

  it("tints meshes nested inside a named group (multi-primitive GLB case)", () => {
    const root = new THREE.Group();
    const group = new THREE.Group();
    group.name = "QuadricepsFemoris";
    const part = new THREE.Mesh(
      new THREE.BufferGeometry(),
      new THREE.MeshStandardMaterial({ color: "#888888" }),
    );
    group.add(part);
    root.add(group);

    const report = applyMuscleRoles(root, { QuadricepsFemoris: "primary" });
    expect(report).toEqual({ colored: ["QuadricepsFemoris"], unknown: [] });
    expect(
      "#" + (part.material as THREE.MeshStandardMaterial).emissive.getHexString(),
    ).toBe(MUSCLE_ROLE_COLORS.primary);

    resetMuscleColors(root);
    expect(
      (part.material as THREE.MeshStandardMaterial).emissive.getHex(),
    ).toBe(0x000000);
  });

  it("re-applying never stacks tints", () => {
    const root = muscleScene(["QuadricepsFemoris"]);
    applyMuscleRoles(root, { QuadricepsFemoris: "primary" });
    const first = (root.getObjectByName("QuadricepsFemoris") as THREE.Mesh)
      .material;
    applyMuscleRoles(root, { QuadricepsFemoris: "stretched" });
    const mesh = root.getObjectByName("QuadricepsFemoris") as THREE.Mesh;
    expect(mesh.material).not.toBe(first);
    expect(
      "#" +
        (mesh.material as THREE.MeshStandardMaterial).emissive.getHexString(),
    ).toBe(MUSCLE_ROLE_COLORS.stretched);
  });
});
