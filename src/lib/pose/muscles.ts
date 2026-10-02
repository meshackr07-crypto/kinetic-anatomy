import * as THREE from "three";

import naming from "../../../scripts/blender/naming.json";
import { toSceneName } from "./applyPose";

/** Frozen muscle mesh names (single source of truth: naming.json). */
export const MUSCLE_MESHES: readonly string[] = naming.muscle_meshes;

/** Muscle job in a stance. Mirrors the `muscle_role` database enum. */
export type MuscleRole = "primary" | "stabilizer" | "stretched";

/** Glow colors per role (see docs/3D_GUIDE.md muscle colors). */
export const MUSCLE_ROLE_COLORS: Record<MuscleRole, string> = {
  primary: "#e0532f",
  stabilizer: "#ffd21f",
  stretched: "#35c9ff",
};

/** Frozen mesh name -> role in one stance. */
export type MuscleMapping = Record<string, MuscleRole>;

/**
 * DRAFT — not yet reviewed by an anatomy expert (D-2). General weaknesses
 * of a wide bent-knee stance: quads, glutes, and inner thighs drive;
 * calves, gluteus medius, and trunk hold steady; hamstrings, hip flexors,
 * and shin muscles lengthen under load.
 */
export const HORSE_STANCE_MUSCLES: MuscleMapping = {
  QuadricepsFemoris: "primary",
  GluteusMaximus: "primary",
  AdductorGroup: "primary",
  GluteusMedius: "stabilizer",
  Gastrocnemius: "stabilizer",
  Soleus: "stabilizer",
  ErectorSpinae: "stabilizer",
  RectusAbdominis: "stabilizer",
  Hamstrings: "stretched",
  Iliopsoas: "stretched",
  TibialisAnterior: "stretched",
};

/** DRAFT — quiet standing still works calves and postural muscles. */
export const STANDING_MUSCLES: MuscleMapping = {
  Soleus: "stabilizer",
  Gastrocnemius: "stabilizer",
  ErectorSpinae: "stabilizer",
};

export const MUSCLE_DRAFT_NOTE =
  "Muscle mapping is a draft — pending expert review.";

/** Original materials, remembered per mesh so highlights never destroy them. */
const originals = new WeakMap<THREE.Mesh, THREE.Material | THREE.Material[]>();
/** Our tinted clones, disposed whenever highlights are cleared or re-applied. */
const clones = new WeakMap<THREE.Mesh, THREE.Material[]>();

/** Restore every mesh to its original material and free our clones. */
export function resetMuscleColors(root: THREE.Object3D): void {
  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const original = originals.get(child);
      if (original !== undefined) {
        const current = clones.get(child);
        if (current !== undefined) {
          for (const material of current) {
            material.dispose();
          }
          clones.delete(child);
        }
        child.material = original;
      }
    }
  });
}

export interface MuscleReport {
  /** Mapping names that matched a mesh and were colored. */
  colored: string[];
  /** Mapping names with no matching mesh in the model. */
  unknown: string[];
}

/**
 * Color muscle meshes by role (emissive glow, base look untouched).
 * Clears previous highlights first, so switching stances never stacks tints.
 */
export function applyMuscleRoles(
  root: THREE.Object3D,
  mapping: MuscleMapping,
): MuscleReport {
  resetMuscleColors(root);
  const bySceneName = new Map<string, THREE.Object3D>();
  root.traverse((child) => {
    if (child.name !== "" && !bySceneName.has(child.name)) {
      bySceneName.set(child.name, child);
    }
  });
  const colored: string[] = [];
  const unknown: string[] = [];
  for (const [meshName, role] of Object.entries(mapping)) {
    const node = bySceneName.get(toSceneName(meshName));
    // A named entry can be a Mesh itself or a Group of per-primitive
    // meshes (multi-material meshes arrive as several Mesh objects).
    const meshes: THREE.Mesh[] = [];
    node?.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshes.push(child);
      }
    });
    if (meshes.length === 0) {
      unknown.push(meshName);
      continue;
    }
    for (const mesh of meshes) {
      if (!originals.has(mesh)) {
        originals.set(mesh, mesh.material);
      }
      const sources = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      const tinted = sources.map((material) => {
        const copy = material.clone();
        if (copy instanceof THREE.MeshStandardMaterial) {
          copy.emissive.set(MUSCLE_ROLE_COLORS[role]);
          copy.emissiveIntensity = 0.55;
        }
        return copy;
      });
      clones.set(mesh, tinted);
      mesh.material = Array.isArray(mesh.material) ? tinted : tinted[0];
    }
    colored.push(meshName);
  }
  return { colored, unknown };
}
