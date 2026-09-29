import type { Metadata } from "next";
import Link from "next/link";

import { ViewerClient } from "@/components/viewer/ViewerClient";

export const metadata: Metadata = {
  title: "3D test viewer | Kinetic Anatomy",
  description:
    "Test page: the rigged body model with a bent elbow, knee, and spine.",
};

export default function ViewerPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-10">
      <Link href="/" className="text-sm underline">
        ← Back home
      </Link>
      <h1 className="text-2xl font-semibold">3D test viewer (T-027)</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        This page loads the real body model built for this project and bends
        three joints, so you can see the muscles follow the bones. It is a
        technical test, not a lesson yet.
      </p>
      <ViewerClient />
    </main>
  );
}
