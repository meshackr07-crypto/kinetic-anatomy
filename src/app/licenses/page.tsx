import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Licenses | Kinetic Anatomy",
  description:
    "Credit for the 3D body model adapted from Z-Anatomy, shared under CC BY-SA 4.0.",
};

export default function LicensesPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
        <Link href="/" className="text-sm underline">
          ← Back home
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Licenses</h1>

        <section className="rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
          <h2 className="font-semibold">3D body model</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            The 3D body used on this site (`body.glb`: skin, muscle, and bone
            meshes on our own 21-bone armature) is adapted from{" "}
            <a
              href="https://github.com/LluisV/Z-Anatomy"
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              Z-Anatomy
            </a>{" "}
            (see also{" "}
            <a
              href="https://www.z-anatomy.com/"
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              z-anatomy.com
            </a>
            ).
          </p>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            It is shared under the{" "}
            <a
              href="http://creativecommons.org/licenses/by-sa/4.0/"
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              Creative Commons Attribution-ShareAlike 4.0 International License
              (CC BY-SA 4.0)
            </a>
            . In plain words: you may use it (including on commercial sites) if
            you give credit and share anything you build on it under the same
            license.
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Credit line to reuse: 3D body adapted from Z-Anatomy
            (https://github.com/LluisV/Z-Anatomy) by Kinetic Anatomy, licensed
            under CC BY-SA 4.0
            (http://creativecommons.org/licenses/by-sa/4.0/).
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <a
              href="/models/body.glb"
              download
              className="flex h-10 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background"
            >
              Download body.glb (CC BY-SA 4.0)
            </a>
            <a
              href="https://github.com/LluisV/Z-Anatomy"
              target="_blank"
              rel="noreferrer"
              className="flex h-10 items-center justify-center rounded-full border border-solid border-black/[.08] px-6 text-sm font-medium dark:border-white/[.145]"
            >
              Z-Anatomy source
            </a>
          </div>
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-5 text-sm text-zinc-600 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-400">
          <h2 className="font-semibold text-zinc-950 dark:text-zinc-50">
            Full license text
          </h2>
          <p className="mt-1">
            The full 3D license is kept in `LICENSE-3D.md` in the project repo
            alongside the model. The CC BY-SA 4.0 deed linked above is the
            binding license text.
          </p>
        </section>
      </main>
    </div>
  );
}
