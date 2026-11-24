import { type ComponentPropsWithoutRef } from "react";

function AcousticMicIcon(props: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

function SoundwaveIcon(props: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M2 10v4" />
      <path d="M6 7v10" />
      <path d="M10 4v16" />
      <path d="M14 8v8" />
      <path d="M18 5v14" />
      <path d="M22 10v4" />
    </svg>
  );
}

function PuzzleIcon(props: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M19.439 7.85c0-1.57.802-2.54 2.14-2.54 1.14 0 2.421.72 2.421 2.54 0 1.62-.801 2.53-2.14 2.53v2.87c1.339 0 2.14.91 2.14 2.53 0 1.82-1.281 2.54-2.421 2.54-1.338 0-2.14-.97-2.14-2.54" />
      <path d="M4 19h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
      <path d="M9 19v-4a2 2 0 0 1 4 0v4" />
      <path d="M9 5v4a2 2 0 0 0 4 0V5" />
    </svg>
  );
}

const STEPS = [
  {
    step: "01",
    tag: "Zero Setup",
    title: "Prop by Your Instrument",
    desc: "Place your iPhone or iPad right on your piano's music stand or beside your guitar. No MIDI cables, lightning adapters, audio interfaces, or Bluetooth pairing required.",
    icon: AcousticMicIcon,
    accent: "#1674d6",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200/80",
    visual: (
      <div className="relative flex h-36 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-sky-50/80 to-blue-50/50 p-4">
        {/* Stylized instrument stand with phone silhouette */}
        <div className="relative flex flex-col items-center">
          {/* Piano / Music stand rail */}
          <div className="h-1.5 w-44 rounded-full bg-slate-300 shadow-inner" />
          <div className="mt-1 flex items-end justify-center gap-6">
            <div className="h-4 w-1 rounded-sm bg-slate-400" />
            <div className="h-4 w-1 rounded-sm bg-slate-400" />
          </div>
          {/* Slanted iPhone graphic */}
          <div className="absolute -top-14 flex h-22 w-14 flex-col items-center justify-between rounded-xl border-2 border-slate-800 bg-slate-900 p-1 shadow-lg ring-1 ring-white/20">
            {/* Screen */}
            <div className="flex h-full w-full flex-col items-center justify-between rounded-[8px] bg-gradient-to-b from-[#2391ff] to-[#1674d6] p-1.5 text-[8px] font-bold text-white">
              <span className="size-1 rounded-full bg-white/60" />
              <span className="font-mono text-[9px] tracking-tight">Cmaj7</span>
              {/* Mini piano keys */}
              <div className="flex h-3 w-full gap-0.5 rounded-[2px] bg-white p-0.5">
                <span className="flex-1 rounded-[1px] bg-blue-100" />
                <span className="flex-1 rounded-[1px] bg-blue-400" />
                <span className="flex-1 rounded-[1px] bg-blue-100" />
                <span className="flex-1 rounded-[1px] bg-blue-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: "02",
    tag: "On-Device DSP",
    title: "Instant Acoustic Detection",
    desc: "Play naturally. Chordisol's proprietary on-device polyphonic audio engine isolates fundamental frequencies and harmonic overtones, recognizing chords the moment you strike.",
    icon: SoundwaveIcon,
    accent: "#10b981",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    visual: (
      <div className="relative flex h-36 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-emerald-50/60 to-teal-50/40 p-4">
        {/* Animated acoustic frequency spectrum */}
        <div className="flex items-end gap-1.5">
          {[28, 48, 72, 36, 88, 56, 96, 44, 76, 52, 32].map((height, idx) => (
            <div
              key={idx}
              style={{ height: `${height * 0.75}px` }}
              className={`w-2 rounded-full transition-all duration-300 ${
                idx % 2 === 0
                  ? "bg-gradient-to-t from-emerald-600 to-teal-400"
                  : "bg-gradient-to-t from-teal-500 to-emerald-300"
              }`}
            />
          ))}
        </div>
        <div className="absolute bottom-2 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 shadow-xs backdrop-blur-xs">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
          <span>&lt; 20ms Acoustic Latency</span>
        </div>
      </div>
    ),
  },
  {
    step: "03",
    tag: "Intuitive Ear",
    title: "Train by Sound & Song Puzzles",
    desc: "Develop intuitive pitch and harmonic instinct. Instead of memorizing abstract roman numeral charts, you connect chords directly to real songs through interactive puzzle games.",
    icon: PuzzleIcon,
    accent: "#7c3aed",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200/80",
    visual: (
      <div className="relative flex h-36 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-purple-50/70 to-indigo-50/40 p-4">
        {/* Interactive puzzle blocks */}
        <div className="flex items-center gap-2">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#1674d6] font-display text-base font-bold text-white shadow-md">
            C
          </div>
          <span className="text-sm font-bold text-slate-400">→</span>
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#7c3aed] font-display text-base font-bold text-white shadow-md">
            G
          </div>
          <span className="text-sm font-bold text-slate-400">→</span>
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#e11d48] font-display text-base font-bold text-white shadow-md">
            Am
          </div>
          <span className="text-sm font-bold text-slate-400">→</span>
          {/* Missing puzzle piece with dashed border */}
          <div className="flex size-11 items-center justify-center rounded-xl border-2 border-dashed border-purple-400 bg-purple-100/60 font-display text-lg font-bold text-purple-700 animate-pulse">
            ?
          </div>
        </div>
      </div>
    ),
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="recognition"
      aria-label="How Chordisol acoustic recognition works"
      className="border-t border-slate-100 bg-slate-50/50 px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto w-full max-w-212.5">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold tracking-wider text-blue-700 uppercase">
            Acoustic by Design
          </span>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl sm:leading-tight">
            No Cables. No MIDI Interface. Just Play.
          </h2>
          <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600 sm:text-base text-pretty">
            Most music learning apps demand expensive MIDI keyboards, USB adapters, or tangled audio cables.
            Chordisol turns your iPhone or iPad into an acoustic listening partner for any real instrument.
          </p>
        </div>

        {/* 3-Step Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-6"
              >
                <div>
                  {/* Step visual simulation */}
                  {item.visual}

                  {/* Header row: step count & tag */}
                  <div className="mt-5 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      Step {item.step}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${item.badgeBg}`}
                    >
                      {item.tag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-3 font-display text-lg font-bold tracking-tight text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed font-medium text-slate-600 sm:text-[13px]">
                    {item.desc}
                  </p>
                </div>

                {/* Bottom subtle accent bar */}
                <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <Icon className="size-4 shrink-0 text-slate-500" />
                  <span className="text-[11px] text-slate-500 font-medium">Built for live practice</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
