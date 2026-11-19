import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AppFooter } from "@/components/app-footer";

export const metadata: Metadata = {
  title: "404 — Page Not Found | Chordisol",
  description:
    "The page you were looking for doesn't exist or has moved. Head back home to practice acoustic chord progression with Chordisol.",
};

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex flex-1 flex-col justify-between bg-white"
    >
      <div className="mx-auto flex w-full max-w-225 flex-1 items-center px-4 py-12 sm:px-6 sm:py-20">
        <div className="grid w-full grid-cols-1 items-center gap-8 sm:grid-cols-12 sm:gap-12">
          {/* Campfire Jam Visual (sm: 7 cols) */}
          <div className="flex items-center justify-center sm:order-2 sm:col-span-6">
            <div className="relative flex w-full max-w-96 items-center justify-center rounded-3xl bg-linear-to-b from-sky-50/70 via-blue-50/30 to-emerald-50/50 p-6 sm:max-w-none sm:p-8">
              <Image
                src="/images/chordisol-404.png"
                alt="Chordisol musical notes jamming by the campfire"
                width={512}
                height={560}
                priority
                className="h-auto w-full max-w-72 select-none sm:max-w-84"
              />
            </div>
          </div>

          {/* Text & Actions (sm: 6 cols) */}
          <div className="sm:order-1 sm:col-span-6">
            <p className="font-mono text-xs font-semibold text-slate-400">
              404 &middot; Page Not Found
            </p>

            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Lost in the campfire jam.
            </h1>

            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Looks like this note drifted off into the night sky. Don&apos;t
              worry — the acoustic chord session is still playing back home.
            </p>

            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-slate-800 active:bg-slate-950"
              >
                Back to Chordisol
              </Link>
              <Link
                href="/#studio"
                className="inline-flex h-11 items-center justify-center text-sm font-semibold text-[#1674d6] transition-colors hover:text-[#0f5bb5] hover:underline"
              >
                Open Chord Studio &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      <AppFooter />
    </main>
  );
}
