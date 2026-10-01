import type { Metadata } from "next";
import Link from "next/link";

import { ViewerClient } from "@/components/viewer/ViewerClient";

export const metadata: Metadata = {
  title: "Horse stance viewer | Kinetic Anatomy",
  description:
    "Test page: the rigged body model holding a horse stance pose.",
};

export default function ViewerPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-10">
      <Link href="/" className="text-sm underline">
        ← Back home
      </Link>
      <h1 className="text-2xl font-semibold">Horse stance (pose engine test)</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        This page loads the real body model built for this project and sets
        the full skeleton from a pose file: wide feet, bent knees, lowered
        hips, fists at the waist. It is a technical test, not a lesson yet.
      </p>
      <ViewerClient />
    </main>
  );
}
