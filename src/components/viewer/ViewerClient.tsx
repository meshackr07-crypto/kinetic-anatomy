"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

import type { Pose } from "../../lib/pose/types";
import type { ModelReport } from "./BodyModel";

const BodyViewer = dynamic(
  () => import("./BodyViewer").then((mod) => mod.BodyViewer),
  {
    ssr: false,
    loading: () => <p>Starting 3D viewer…</p>,
  },
);

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    return gl !== null;
  } catch {
    return false;
  }
}

type ViewerStatus = "checking" | "ready" | "unsupported" | "failed";

/**
 * One component the page imports. Handles every non-3D state
 * (checking, no WebGL, load failure) around the 3D canvas.
 */
export function ViewerClient({ pose }: { pose?: Pose }) {
  const [status, setStatus] = useState<ViewerStatus>("checking");
  const [report, setReport] = useState<ModelReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStatus(isWebGLAvailable() ? "ready" : "unsupported");
  }, []);

  const handleReady = useCallback((next: ModelReport) => {
    setReport(next);
  }, []);

  const handleError = useCallback((message: string) => {
    setError(message);
    setStatus("failed");
  }, []);

  if (status === "checking") {
    return <p>Checking 3D support…</p>;
  }

  if (status === "unsupported") {
    return (
      <p>
        This device or browser has WebGL switched off, so the 3D body cannot
        be shown here. Try Chrome or Edge on a laptop or phone.
      </p>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex flex-col gap-3">
        <p>The 3D model failed to load.</p>
        {error ? (
          <p className="text-sm text-zinc-500">{error}</p>
        ) : null}
        <button
          type="button"
          className="w-fit rounded border px-4 py-2"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <BodyViewer onReady={handleReady} onError={handleError} pose={pose} />
      {report ? (
        <ul className="text-sm text-zinc-600 dark:text-zinc-400">
          <li>
            Model parts drawn: {report.meshes} (skin, muscle, and bone meshes
            in one file; meshes with several materials draw as several parts).
          </li>
          <li>Bones found: {report.bones}.</li>
          <li>Pose applied to: {report.posedBones.join(", ")}.</li>
          {report.missingBones.length > 0 ? (
            <li>Missing bones: {report.missingBones.join(", ")}.</li>
          ) : null}
        </ul>
      ) : (
        <p>Posing the skeleton…</p>
      )}
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Drag to rotate. Scroll or pinch to zoom. The body holds a horse
        stance: wide feet, deep bent knees, fists chambered at the waist.
      </p>
    </div>
  );
}
