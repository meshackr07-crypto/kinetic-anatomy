"use client";

import { Component, Suspense, type ErrorInfo, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useProgress } from "@react-three/drei";

import type { MuscleMapping } from "../../lib/pose/muscles";
import type { Pose } from "../../lib/pose/types";
import { BodyModel, type ModelReport } from "./BodyModel";

function LoadingOverlay() {
  const { active, progress } = useProgress();
  if (!active) {
    return null;
  }
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 text-zinc-100">
      <p>Loading 3D body… {Math.round(progress)}%</p>
    </div>
  );
}

interface BoundaryProps {
  children: ReactNode;
  onError: (message: string) => void;
}

interface BoundaryState {
  failed: boolean;
}

class ViewerErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const stack = errorInfo.componentStack ?? "";
    this.props.onError(`${error.message} ${stack}`.trim());
  }

  render() {
    if (this.state.failed) {
      return null;
    }
    return this.props.children;
  }
}

interface BodyViewerProps {
  onReady: (report: ModelReport) => void;
  onError: (message: string) => void;
  pose?: Pose;
  roles?: MuscleMapping;
}

/** The whole 3D canvas: lights, orbit controls, and the posed body. */
export function BodyViewer({ onReady, onError, pose, roles }: BodyViewerProps) {
  return (
    <div className="relative h-[70vh] w-full overflow-hidden rounded-lg bg-zinc-950">
      <ViewerErrorBoundary onError={onError}>
        <Canvas
          dpr={[1, 2]}
          frameloop="demand"
          camera={{ position: [0.5, 0.85, 3.4], fov: 40 }}
        >
          <color attach="background" args={["#09090b"]} />
          <hemisphereLight args={["#ffffff", "#3f3f46", 0.9]} />
          <directionalLight position={[2, 4, 3]} intensity={1.6} />
          <Suspense fallback={null}>
            <BodyModel onReady={onReady} pose={pose} roles={roles} />
          </Suspense>
          <OrbitControls
            makeDefault
            target={[0, 0.7, 0]}
            minDistance={1}
            maxDistance={8}
          />
        </Canvas>
      </ViewerErrorBoundary>
      <LoadingOverlay />
    </div>
  );
}
