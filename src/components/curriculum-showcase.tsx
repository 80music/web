import Image from "next/image";
import { type ComponentPropsWithoutRef } from "react";

function CrossIcon(props: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

const TRADITIONAL_ITEMS = [
  {
    title: "Tangled MIDI Adapters",
    subtitle: "Cables, drivers & setup delay",
  },
  {
    title: "Dry Theory Flashcards",
    subtitle: "Abstract Roman numeral drills",
  },
  {
    title: "Stressful Ear Quizzes",
    subtitle: "Synthetic bleeps & quiz anxiety",
  },
  {
    title: "Isolated Finger Drills",
    subtitle: "Zero real song context",
  },
];

export function CurriculumShowcase() {
  return (
    <section
      id="curriculum"
      aria-label="The Shift: From abstract drills to ear-first intuition"
      className="border-t border-slate-100 bg-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="mx-auto w-full max-w-212.5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Left Column (55%): Simplified, Refined & Restrained */}
          <div className="w-full lg:w-[55%] flex flex-col items-start">
            <span className="text-xs sm:text-sm font-bold tracking-wider text-blue-600 uppercase">
              The Shift
            </span>

            <h2 className="mt-2.5 font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-[32px] lg:leading-[1.2] text-balance">
              Stop fighting music theory. <br className="hidden sm:inline" />Start playing by ear.
            </h2>

            <p className="mt-3.5 max-w-lg text-sm sm:text-base font-normal leading-relaxed text-slate-600 text-pretty">
              Traditional ear training treats harmony like a stressful exam with tangled cables and abstract drills. Chordisol listens directly to your real piano or guitar — turning recognition into effortless intuition.
            </p>
          </div>

          {/* Right Column (45%): Compact, Simpler Card Stack with Brand Logo */}
          <div className="w-full lg:w-[45%] relative pt-4 sm:pt-6 flex justify-center lg:justify-end overflow-visible">
            <div className="relative w-full max-w-[290px] xs:max-w-[310px] sm:max-w-[335px] pr-3 sm:pr-6">
              {/* Overlapping Floating Card: Chordisol (Top) - Exact reference shadow & snug overlap */}
              <div className="relative z-20 w-full ml-3 xs:ml-4 sm:ml-6 -mb-3 sm:-mb-4 rounded-[22px] sm:rounded-[26px] border border-slate-200/70 bg-white p-3 sm:p-3.5 shadow-[0_14px_30px_rgba(0,0,0,0.1),0_3px_8px_rgba(0,0,0,0.04)] transition-transform duration-300 hover:-translate-y-0.5">
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                    {/* Brand Logo */}
                    <Image
                      src="/images/chordisol-logo.png"
                      alt="Chordisol"
                      width={36}
                      height={36}
                      className="size-8 sm:size-9 shrink-0 rounded-[8px] sm:rounded-[10px] object-cover shadow-xs"
                    />

                    <div className="min-w-0">
                      <div className="truncate font-display text-xs sm:text-[13px] font-bold tracking-tight text-slate-900">
                        Chord Recognized
                      </div>
                      <div className="truncate text-[11px] sm:text-xs font-semibold text-[#0071e3]">
                        + Cmaj7 • Acoustic Guitar
                      </div>
                    </div>
                  </div>

                  <span className="shrink-0 text-[10px] sm:text-[11px] font-medium text-slate-400">
                    10:02 AM
                  </span>
                </div>
              </div>

              {/* Base Card: The Others (Traditional Methods) - Tilted -rotate-2, all items clearly visible */}
              <div className="w-full -rotate-2 rounded-[24px] sm:rounded-[28px] border border-slate-200/70 bg-white p-3.5 sm:p-4.5 pt-5 sm:pt-6 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06),0_2px_4px_-2px_rgba(15,23,42,0.03)]">
                <div className="flex flex-col gap-2.5 sm:gap-3">
                  {TRADITIONAL_ITEMS.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center gap-2.5 sm:gap-3"
                    >
                      {/* Red X Icon */}
                      <div className="flex size-8.5 sm:size-9 shrink-0 items-center justify-center rounded-xl bg-[#fef2f2] text-[#ef4444]">
                        <CrossIcon className="size-4 sm:size-4.5" />
                      </div>

                      {/* Title and Subtitle */}
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-display text-xs sm:text-[13px] font-bold tracking-tight text-slate-900">
                          {item.title}
                        </div>
                        <div className="truncate text-[11px] sm:text-xs font-medium text-slate-500 leading-snug">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
