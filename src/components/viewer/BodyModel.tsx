"use client";

import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

import { applyPose } from "../../lib/pose/applyPose";
import { HORSE_STANCE } from "../../lib/pose/poses";
import type { Pose } from "../../lib/pose/types";

export const BODY_GLB_URL = "/models/body.glb";

export interface ModelReport {
  meshes: number;
  bones: number;
  posedBones: string[];
  missingBones: string[];
}

interface BodyModelProps {
  onReady: (report: ModelReport) => void;
  /** Defaults to the horse stance (T-032). */
  pose?: Pose;
}

/**
 * Loads the rigged body and sets the skeleton from a pose
 * (absolute rotations, so stance-to-stance blending stays exact).
 */
export function BodyModel({ onReady, pose = HORSE_STANCE }: BodyModelProps) {
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
    // Remember rest orientations and positions so StrictMode/remount
    // can never double-pose.
    const rest = new Map<
      THREE.Bone,
      { quaternion: THREE.Quaternion; position: THREE.Vector3 }
    >(
      bones.map(
        (bone): [THREE.Bone, { quaternion: THREE.Quaternion; position: THREE.Vector3 }] => [
          bone,
          {
            quaternion: bone.quaternion.clone(),
            position: bone.position.clone(),
          },
        ],
      ),
    );
    const result = applyPose(gltf.scene, pose);
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
      rest.forEach((saved, bone) => {
        bone.quaternion.copy(saved.quaternion);
        bone.position.copy(saved.position);
      });
    };
  }, [gltf, onReady, pose]);

  return (
    <group>
      <primitive object={gltf.scene} />
      <primitive object={helper} />
    </group>
  );
}

useGLTF.preload(BODY_GLB_URL);
