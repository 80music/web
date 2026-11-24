import { type ComponentPropsWithoutRef } from "react";

function CheckmarkIcon(props: ComponentPropsWithoutRef<"svg">) {
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
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

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
    title: "Tangled MIDI & Audio Adapters",
    subtitle: "15m setup time • Audio latency & driver friction",
  },
  {
    title: "Dry Roman Numeral Flashcards",
    subtitle: "V7/V vs IV • Abstract memorization fatigue",
  },
  {
    title: "Anxiety-Inducing Ear Quizzes",
    subtitle: "Isolated synthetic bleeps • High cortisol test format",
  },
  {
    title: "Isolated Finger Drills",
    subtitle: "Zero song context • 80% abandon rate within 2 weeks",
  },
];

export function CurriculumShowcase() {
  return (
    <section
      id="curriculum"
      aria-label="The Shift: From abstract drills to ear-first intuition"
      className="border-t border-slate-100 bg-[#f8fafc]/50 px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <div className="mx-auto w-full max-w-212.5">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Editorial Headline & Narrative */}
          <div className="flex flex-col items-start lg:col-span-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold tracking-wider text-blue-700 uppercase">
              The Shift
            </span>

            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-[40px] lg:leading-[1.14] text-balance">
              Stop fighting music theory. Start playing by ear.
            </h2>

            <p className="mt-4 text-base font-normal leading-relaxed text-slate-600 sm:text-lg text-pretty">
              Traditional ear training treats harmony like a stressful math exam — force-feeding dry Roman
              numerals, tangled cables, and abstract flashcards that disconnect you from your instrument.
            </p>

            <p className="mt-3 text-base font-normal leading-relaxed text-slate-600 sm:text-lg text-pretty">
              Chordisol flips the paradigm. Our on-device microphone listens to your real piano or guitar
              in real time, transforming chord recognition into playful, intuitive musical puzzles.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3.5 py-1.5 shadow-2xs">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Zero Cables or Hardware
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3.5 py-1.5 shadow-2xs">
                <span className="size-1.5 rounded-full bg-blue-500" />
                Acoustic Ear First
              </span>
            </div>
          </div>

          {/* Right Column: Stacked Cards (Matching Reference Layout) */}
          <div className="relative pt-6 sm:pt-10 lg:col-span-7">
            <div className="relative mx-auto w-full max-w-115 pr-3 sm:pr-6 lg:ml-auto lg:mr-0">
              {/* Overlapping Floating Card: Chordisol (Top) - Exactly Same Width as Base Card */}
              <div className="relative z-20 -mb-8 sm:-mb-10 ml-3 sm:ml-6 w-full rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-4.5 sm:p-5.5 shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-0.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3.5">
                    {/* Clean Checkmark Icon */}
                    <div className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-xl bg-[#1674d6] text-white shadow-xs">
                      <CheckmarkIcon className="size-5.5 sm:size-6" />
                    </div>

                    <div className="min-w-0">
                      <div className="truncate font-display text-sm font-bold tracking-tight text-slate-900 sm:text-base">
                        Chord Recognized
                      </div>
                      <div className="truncate text-xs font-bold text-[#1674d6] sm:text-sm">
                        + Cmaj7 • Acoustic Guitar
                      </div>
                    </div>
                  </div>

                  <span className="shrink-0 text-xs font-medium text-slate-400">
                    Just now
                  </span>
                </div>
              </div>

              {/* Base Card: The Others (Traditional Methods) - Exactly Same Width as Top Card */}
              <div className="w-full rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-4.5 sm:p-5.5 shadow-xl shadow-slate-200/50">
                <div className="divide-y divide-slate-100">
                  {TRADITIONAL_ITEMS.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center gap-3.5 py-3.5 first:pt-1 last:pb-1"
                    >
                      {/* Clean X Icon */}
                      <div className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500">
                        <CrossIcon className="size-5 sm:size-5.5" />
                      </div>

                      {/* Title and Subtitle */}
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-display text-sm font-bold text-slate-900 sm:text-base">
                          {item.title}
                        </div>
                        <div className="truncate text-xs font-medium text-slate-500 sm:text-sm">
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
