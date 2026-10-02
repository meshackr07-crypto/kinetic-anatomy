import type { Metadata } from "next";
import Link from "next/link";

import { ViewerClient } from "@/components/viewer/ViewerClient";

export const metadata: Metadata = {
  title: "Kinetic Anatomy | Learn anatomy through martial arts stances",
  description:
    "See a 3D body hold a martial arts stance and learn which muscles, joints, and body systems make it work.",
};

const STEPS = [
  {
    title: "1. Pick a stance",
    text: "Use the stance buttons above the body. The stance library is growing — more martial arts arrive next.",
  },
  {
    title: "2. Rotate the body",
    text: "Drag to turn the 3D body around. Scroll or pinch to zoom in on any muscle or joint.",
  },
  {
    title: "3. Learn what works",
    text: "See which muscles and joints carry the stance, and read the physiology behind it.",
  },
];

export default function Home() {
  return (
    <div className="dark flex min-h-full flex-1 flex-col bg-[#060606] font-body text-[#f3eee2]">
      <header className="w-full border-b border-white/10">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex flex-col">
            <span className="font-display text-[10.5px] tracking-[0.22em] text-[#ffd21f]">
              KINETIC ANATOMY
            </span>
            <span className="font-display text-lg font-semibold tracking-wide">
              ANATOMY YOU CAN MOVE
            </span>
          </div>
          <Link
            href="/licenses"
            className="rounded-full border border-white/15 px-5 py-2 text-sm font-medium text-[#f3eee2]"
          >
            Licenses
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-10">
        <section className="flex flex-col items-start gap-3">
          <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight tracking-wide">
            LEARN ANATOMY THROUGH MARTIAL ARTS STANCES
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[#a79f8c]">
            A real 3D body, right here. Pick a stance, turn the body around,
            and see which muscles and joints make it work.
          </p>
        </section>

        <section aria-label="3D body" className="flex flex-col gap-3">
          <ViewerClient />
        </section>

        <section id="how-it-works" className="flex flex-col gap-6">
          <h2 className="font-display text-2xl font-semibold tracking-wide">
            HOW IT WORKS
          </h2>
          <ol className="flex flex-col gap-4">
            {STEPS.map((step) => (
              <li
                key={step.title}
                className="rounded-lg border border-white/10 bg-[#15110e] p-5"
              >
                <h3 className="font-display font-semibold tracking-wide">
                  {step.title}
                </h3>
                <p className="mt-1 text-[#a79f8c]">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-lg border border-white/10 bg-[#15110e] p-5 text-sm text-[#a79f8c]">
          <h2 className="font-display font-semibold tracking-wide text-[#f3eee2]">
            PLEASE READ
          </h2>
          <p className="mt-1">
            This site is for education. It is not medical advice, diagnosis,
            or a training program. See a qualified professional before
            starting or changing physical training, and stop if you feel pain.
          </p>
        </section>
      </main>

      <footer className="w-full border-t border-white/10">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-6 py-6 text-sm text-[#756e5f]">
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
