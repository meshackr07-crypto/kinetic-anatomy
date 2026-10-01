import type { Metadata } from "next";
import Link from "next/link";

import { ViewerClient } from "@/components/viewer/ViewerClient";

export const metadata: Metadata = {
  title: "Stance viewer | Kinetic Anatomy",
  description:
    "Test page: switch between standing and a horse stance with a smooth transition.",
};

export default function ViewerPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-10">
      <Link href="/" className="text-sm underline">
        ← Back home
      </Link>
      <h1 className="text-2xl font-semibold">Stance transitions (test)</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        This page loads the real body model built for this project. Pick a
        stance below and the body animates to it in about half a second. It
        is a technical test, not a lesson yet.
      </p>
      <ViewerClient />
    </main>
  );
}
