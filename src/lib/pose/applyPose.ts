import * as THREE from "three";

import type { TestBend } from "./types";

export interface ApplyReport {
  /** Bones that were found and bent. */
  applied: string[];
  /** Names that had no matching bone in the model. */
  missing: string[];
}

export interface ModelCounts {
  meshes: number;
  bones: number;
}

export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Bend bones in place, on top of their rest orientation.
 * Rotates about the bone's own local axis (the same idea as Blender's
 * pose-mode euler rotation), so rest position and scale are never touched.
 */
export function applyBends(
  root: THREE.Object3D,
  bends: readonly TestBend[],
): ApplyReport {
  const applied: string[] = [];
  const missing: string[] = [];
  for (const bend of bends) {
    const node = root.getObjectByName(bend.bone);
    if (node instanceof THREE.Bone) {
      const radians = degreesToRadians(bend.degrees);
      if (bend.axis === "x") {
        node.rotateX(radians);
      } else if (bend.axis === "y") {
        node.rotateY(radians);
      } else {
        node.rotateZ(radians);
      }
      applied.push(bend.bone);
    } else {
      missing.push(bend.bone);
    }
  }
  return { applied, missing };
}

/** Count the meshes and bones inside a loaded model. */
export function countModel(root: THREE.Object3D): ModelCounts {
  let meshes = 0;
  let bones = 0;
  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      meshes += 1;
    }
    if (child instanceof THREE.Bone) {
      bones += 1;
    }
  });
  return { meshes, bones };
}
