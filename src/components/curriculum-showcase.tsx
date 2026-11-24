import { type ComponentPropsWithoutRef } from "react";

function CableIcon(props: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path d="M12 2v6m-4-6v6m0 0a4 4 0 0 0 8 0" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FlashcardIcon(props: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h8M8 11h8M8 15h5" strokeLinecap="round" />
    </svg>
  );
}

function TimerQuizIcon(props: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5M10 2h4M12 2v3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DisconnectIcon(props: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M6 6h10M6 10h10M6 14h6" strokeLinecap="round" />
    </svg>
  );
}

function AcousticWaveIcon(props: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} {...props}>
      <path d="M3 10v4M7 7v10M11 4v16M15 6v12M19 8v8M22 11v2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const TRADITIONAL_PAINS = [
  {
    icon: CableIcon,
    bgGradient: "from-slate-100 to-slate-200/80",
    badgeBg: "bg-red-500",
    title: "Tangled MIDI & Audio Adapters",
    subtitle: "15m setup time • Audio latency & driver friction",
  },
  {
    icon: FlashcardIcon,
    bgGradient: "from-amber-50 to-amber-100/70",
    badgeBg: "bg-amber-500",
    title: "Dry Roman Numeral Flashcards",
    subtitle: "V7/V vs IV • Abstract memorization fatigue",
  },
  {
    icon: TimerQuizIcon,
    bgGradient: "from-rose-50 to-rose-100/70",
    badgeBg: "bg-rose-500",
    title: "Anxiety-Inducing Ear Quizzes",
    subtitle: "Isolated synthetic bleeps • High cortisol test format",
  },
  {
    icon: DisconnectIcon,
    bgGradient: "from-purple-50 to-purple-100/70",
    badgeBg: "bg-purple-500",
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

          {/* Right Column: Stacked Cards (Reference Image Layout) */}
          <div className="relative pt-6 sm:pt-10 lg:col-span-7">
            <div className="relative mx-auto max-w-lg lg:ml-auto lg:mr-0">
              {/* Overlapping Floating Card: Chordisol (Top) */}
              <div className="relative z-20 -mb-7 sm:-mb-8 mx-auto sm:ml-8 w-full sm:w-[92%] rounded-2xl border border-white/95 bg-white/95 p-3.5 shadow-[0_20px_50px_rgba(22,116,214,0.16)] backdrop-blur-xl ring-1 ring-slate-900/5 sm:rounded-3xl sm:p-4.5 transition-transform duration-300 hover:-translate-y-0.5">
                <div className="flex items-center justify-between gap-2.5 sm:gap-3">
                  <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                    {/* Glossy Chordisol App Icon */}
                    <div className="relative flex size-11 sm:size-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#38bdf8] via-[#2086f6] to-[#0a66de] shadow-md shadow-blue-500/30">
                      <AcousticWaveIcon className="size-5 sm:size-6 text-white" />
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/30"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="truncate font-display text-xs sm:text-base font-bold tracking-tight text-slate-900">
                        Chord Recognized
                      </div>
                      <div className="truncate text-[11px] sm:text-sm font-bold text-[#1674d6]">
                        + Cmaj7 • Acoustic Guitar
                      </div>
                    </div>
                  </div>

                  {/* Live Status Badge */}
                  <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-semibold text-emerald-700">
                    <span className="size-1.5 sm:size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live • 12ms</span>
                  </div>
                </div>
              </div>

              {/* Base Card: The Others (Traditional Methods) */}
              <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.06)] ring-1 ring-slate-900/5 sm:p-7">
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                    Traditional Methods
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 uppercase">
                    The Old Way
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {TRADITIONAL_PAINS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.title}
                        className="flex items-center gap-3.5 py-4 first:pt-1 last:pb-1"
                      >
                        {/* Thumbnail with mini corner badge */}
                        <div className="relative">
                          <div
                            className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.bgGradient} border border-slate-200/60 shadow-2xs sm:size-12`}
                          >
                            <Icon className="size-5 text-slate-600" />
                          </div>
                          {/* Corner badge matching reference */}
                          <div
                            className={`absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full ${item.badgeBg} text-white shadow-2xs`}
                          >
                            <svg
                              viewBox="0 0 12 12"
                              className="size-2.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2.2}
                              strokeLinecap="round"
                            >
                              <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
                            </svg>
                          </div>
                        </div>

                        {/* Title and Subtitle */}
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-display text-sm font-bold text-slate-900 sm:text-[15px]">
                            {item.title}
                          </div>
                          <div className="truncate text-xs font-medium text-slate-500">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
