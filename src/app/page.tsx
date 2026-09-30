import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kinetic Anatomy | Learn anatomy through martial arts stances",
  description:
    "See a 3D body hold a martial arts stance and learn which muscles, joints, and body systems make it work.",
};

const STEPS = [
  {
    title: "1. Pick a stance",
    text: "Choose a stance from a martial art. The stance library is being built next.",
  },
  {
    title: "2. Rotate the body",
    text: "Turn the 3D body around and zoom in to study it from every angle.",
  },
  {
    title: "3. Learn what works",
    text: "See which muscles and joints carry the stance, and read the physiology behind it.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <header className="w-full border-b border-black/10 dark:border-white/10">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold">Kinetic Anatomy</span>
          <Link
            href="/viewer"
            className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background"
          >
            3D viewer
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-12 px-6 py-16">
        <section className="flex flex-col items-start gap-6">
          <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight">
            Learn anatomy through martial arts stances.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            See a 3D body hold a martial arts stance and learn which muscles,
            joints, and body systems make it work.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/viewer"
              className="flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-base font-medium text-background"
            >
              See the 3D body
            </Link>
            <a
              href="#how-it-works"
              className="flex h-12 items-center justify-center rounded-full border border-solid border-black/[.08] px-8 text-base font-medium dark:border-white/[.145]"
            >
              How it works
            </a>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            Live now: a test view of the project&apos;s own 3D body model.
            The stance lessons arrive next.
          </p>
        </section>

        <section id="how-it-works" className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold">How it works</h2>
          <ol className="flex flex-col gap-4">
            {STEPS.map((step) => (
              <li
                key={step.title}
                className="rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950"
              >
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-5 text-sm text-zinc-600 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-400">
          <h2 className="font-semibold text-zinc-950 dark:text-zinc-50">
            Please read
          </h2>
          <p className="mt-1">
            This site is for education. It is not medical advice, diagnosis,
            or a training program. See a qualified professional before
            starting or changing physical training, and stop if you feel pain.
          </p>
        </section>
      </main>

      <footer className="w-full border-t border-black/10 dark:border-white/10">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-1 px-6 py-6 text-sm text-zinc-500">
          <span>Kinetic Anatomy — anatomy you can move.</span>
          <span>
            3D body adapted from Z-Anatomy (CC BY-SA 4.0).{" "}
            <Link href="/licenses" className="underline">
              Licenses
            </Link>
            .
          </span>
        </div>
      </footer>
    </div>
  );
}
