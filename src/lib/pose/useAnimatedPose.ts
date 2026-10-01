import { useEffect, useRef, useState } from "react";

import { blendPoses, easeInOut } from "./blend";
import type { Pose } from "./types";

/** How long a stance-to-stance transition plays (T-033: about 0.6 s). */
export const TRANSITION_MS = 600;

/**
 * Animate toward `target`: every frame blends from the pose on screen to
 * the new target with an eased 0-to-1 sweep. Interrupting mid-flight is
 * safe — the next sweep starts from the frame in progress, never jumping.
 * StrictMode-safe: the cleanup cancels the pending frame.
 */
export function useAnimatedPose(target: Pose, durationMs = TRANSITION_MS): Pose {
  const [current, setCurrent] = useState<Pose>(target);
  const currentRef = useRef<Pose>(target);

  useEffect(() => {
    if (currentRef.current === target) {
      return;
    }
    const from = currentRef.current;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number): void => {
      const t = Math.min(1, (now - start) / durationMs);
      const next = blendPoses(from, target, easeInOut(t));
      currentRef.current = next;
      setCurrent(next);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [target, durationMs]);

  return current;
}
