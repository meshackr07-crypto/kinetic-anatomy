import * as THREE from "three";

import type { BendAxis, Pose, PoseQuaternion, TestBend } from "./types";

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

/**
 * One human-readable bend converted to a quaternion (rotation about the
 * bone's own local axis). This is how stance authors write angles in
 * degrees; the stored pose keeps only the resulting quaternion.
 */
export function bendToQuaternion(
  axis: BendAxis,
  degrees: number,
): THREE.Quaternion {
  const radians = degreesToRadians(degrees);
  return new THREE.Quaternion().setFromEuler(
    new THREE.Euler(
      axis === "x" ? radians : 0,
      axis === "y" ? radians : 0,
      axis === "z" ? radians : 0,
    ),
  );
}

/**
 * Compose a bend list into one quaternion per bone, in listed order.
 * Matches sequential applyBends exactly (each rotateX/Y/Z post-multiplies
 * in bone-local space), so authoring in degrees and storing quaternions
 * never disagree.
 */
export function poseFromBends(
  bends: readonly TestBend[],
): Record<string, PoseQuaternion> {
  const composed = new Map<string, THREE.Quaternion>();
  for (const bend of bends) {
    const current =
      composed.get(bend.bone) ?? new THREE.Quaternion();
    current.multiply(bendToQuaternion(bend.axis, bend.degrees));
    composed.set(bend.bone, current);
  }
  const out: Record<string, PoseQuaternion> = {};
  for (const [bone, q] of composed) {
    out[bone] = [q.x, q.y, q.z, q.w];
  }
  return out;
}

export interface PoseReport {
  /** Bones that were found and posed. */
  applied: string[];
  /** Names that had no matching bone in the model. */
  missing: string[];
}

/**
 * Rest orientations, remembered per bone the first time a pose is applied.
 * Lets the engine treat stored quaternions as offsets FROM rest (authored
 * in degrees, intuitive) while still SETTING the final rotation every time,
 * so re-applying a pose or blending between poses is exact and idempotent.
 */
const restPose = new WeakMap<
  THREE.Bone,
  { quaternion: THREE.Quaternion; position: THREE.Vector3 }
>();

function restOf(bone: THREE.Bone): {
  quaternion: THREE.Quaternion;
  position: THREE.Vector3;
} {
  let saved = restPose.get(bone);
  if (saved === undefined) {
    saved = {
      quaternion: bone.quaternion.clone(),
      position: bone.position.clone(),
    };
    restPose.set(bone, saved);
  }
  return saved;
}

/**
 * The pose engine: SET each bone's rotation from the pose every time
 * (final = rest orientation followed by the pose offset), so blending
 * between two poses later is well defined. A bone `position` entry is an
 * offset added to the rest position. Safe to call repeatedly: applying the
 * same pose twice changes nothing the second time.
 */
export function applyPose(
  root: THREE.Object3D,
  pose: Pose,
): PoseReport {
  const applied: string[] = [];
  const missing: string[] = [];
  const bySceneName = indexSceneNames(root);
  for (const [bone, data] of Object.entries(pose.bones)) {
    const node = bySceneName.get(toSceneName(bone));
    if (node instanceof THREE.Bone) {
      const rest = restOf(node);
      node.quaternion
        .copy(rest.quaternion)
        .multiply(
          new THREE.Quaternion(data.q[0], data.q[1], data.q[2], data.q[3]),
        );
      node.position.copy(rest.position);
      if (data.position !== undefined) {
        node.position.x += data.position[0];
        node.position.y += data.position[1];
        node.position.z += data.position[2];
      }
      applied.push(bone);
    } else {
      missing.push(bone);
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
