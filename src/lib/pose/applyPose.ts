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
 * Convert a frozen Blender name (scripts/blender/naming.json) to the name
 * three.js actually uses in the scene. GLTFLoader runs every node name
 * through PropertyBinding.sanitizeNodeName: spaces become underscores and
 * the characters [ ] . : / are removed. So "Forearm.L" is "ForearmL" on
 * screen, while "Spine" is unchanged. Always look bones and meshes up with
 * this function, never with the raw frozen name.
 */
export function toSceneName(frozenName: string): string {
  return frozenName.replace(/\s/g, "_").replace(/[\[\].:\/]/g, "");
}

/**
 * Index a loaded scene by node name, first match wins (same as
 * Object3D.getObjectByName traversal order).
 */
function indexSceneNames(root: THREE.Object3D): Map<string, THREE.Object3D> {
  const byName = new Map<string, THREE.Object3D>();
  root.traverse((child) => {
    if (child.name !== "" && !byName.has(child.name)) {
      byName.set(child.name, child);
    }
  });
  return byName;
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
  const bySceneName = indexSceneNames(root);
  for (const bend of bends) {
    const node = bySceneName.get(toSceneName(bend.bone));
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
