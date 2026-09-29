"use client";

import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

import { applyBends } from "../../lib/pose/applyPose";
import { TEST_BENDS } from "../../lib/pose/types";

export const BODY_GLB_URL = "/models/body.glb";

export interface ModelReport {
  meshes: number;
  bones: number;
  posedBones: string[];
  missingBones: string[];
}

interface BodyModelProps {
  onReady: (report: ModelReport) => void;
}

/**
 * Loads the rigged body and applies the T-027 test pose
 * (bent left elbow, left knee, and spine) to prove the skinning works.
 */
export function BodyModel({ onReady }: BodyModelProps) {
  const gltf = useGLTF(BODY_GLB_URL);

  const helper = useMemo(
    () => new THREE.SkeletonHelper(gltf.scene),
    [gltf.scene],
  );

  useLayoutEffect(() => {
    const bones: THREE.Bone[] = [];
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Bone) {
        bones.push(child);
      }
    });
    // Remember rest orientations so StrictMode/remount can never double-bend.
    const rest = new Map<THREE.Bone, THREE.Quaternion>(
      bones.map(
        (bone): [THREE.Bone, THREE.Quaternion] => [
          bone,
          bone.quaternion.clone(),
        ],
      ),
    );
    const result = applyBends(gltf.scene, TEST_BENDS);
    let meshes = 0;
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshes += 1;
      }
    });
    onReady({
      meshes,
      bones: bones.length,
      posedBones: result.applied,
      missingBones: result.missing,
    });
    return () => {
      rest.forEach((quaternion, bone) => {
        bone.quaternion.copy(quaternion);
      });
    };
  }, [gltf, onReady]);

  return (
    <group>
      <primitive object={gltf.scene} />
      <primitive object={helper} />
    </group>
  );
}

useGLTF.preload(BODY_GLB_URL);
