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

const TRADITIONAL_CARDS = [
  {
    id: "cables",
    title: "Tangled MIDI & Audio Cables",
    subtitle: "15m setup time, audio latency, and driver friction before playing",
    zIndex: "z-10",
  },
  {
    id: "flashcards",
    title: "Dry Roman Numeral Flashcards",
    subtitle: "Abstract paper memorization disconnected from real instruments",
    zIndex: "z-9",
  },
  {
    id: "quizzes",
    title: "Anxiety-Inducing Ear Quizzes",
    subtitle: "Isolated synthetic bleeps that create fatigue instead of musical flow",
    zIndex: "z-8",
  },
];

export function CurriculumShowcase() {
  return (
    <section
      id="curriculum"
      aria-label="The Shift: From abstract drills to ear-first intuition"
      className="border-t border-slate-100 bg-white px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <div className="mx-auto w-full max-w-212.5">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Simplified, Spacious Headline & Story */}
          <div className="flex flex-col items-start lg:col-span-6">
            <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
              The Shift
            </span>

            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-[42px] lg:leading-[1.16] text-balance">
              Stop fighting music theory. Start playing by ear.
            </h2>

            <p className="mt-4 text-base font-normal leading-relaxed text-slate-600 sm:text-lg text-pretty">
              Traditional ear training treats harmony like a stressful math exam — tangled cables, dry Roman numerals, and abstract quizzes that disconnect you from your instrument.
            </p>

            <p className="mt-3 text-base font-normal leading-relaxed text-slate-600 sm:text-lg text-pretty">
              Chordisol flips the paradigm. Just prop your device by your piano or guitar: our real-time acoustic microphone turns chord recognition into effortless musical intuition.
            </p>
          </div>

          {/* Right Column: Physical Stacked Cards (Matching Image 2 Reference) */}
          <div className="relative mx-auto w-full max-w-120 lg:col-span-6 lg:ml-auto lg:mr-0">
            {/* Card 1: Chordisol (Top Card, elevated with slight rotation like reference) */}
            <div className="relative z-20 w-full -rotate-1 rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-5.5 shadow-[0_16px_36px_rgba(15,23,42,0.1)] transition-transform duration-300 hover:rotate-0 hover:-translate-y-0.5">
              <div className="flex items-center gap-4">
                <div className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-xl bg-[#1674d6] text-white shadow-xs">
                  <CheckmarkIcon className="size-5.5 sm:size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-base font-bold text-slate-900 sm:text-lg tracking-tight">
                    Chord Recognized
                  </h3>
                  <p className="mt-0.5 text-xs font-semibold text-[#1674d6] sm:text-sm">
                    Live acoustic microphone recognition on real piano &amp; guitar
                  </p>
                </div>
              </div>
            </div>

            {/* Cards 2, 3, 4: The Others (Stacked directly underneath, matching reference layout) */}
            {TRADITIONAL_CARDS.map((card) => (
              <div
                key={card.id}
                className={`relative ${card.zIndex} -mt-3 sm:-mt-3.5 w-full rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-5.5 shadow-xs transition-colors hover:border-slate-300`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500">
                    <CrossIcon className="size-5 sm:size-5.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-sm font-bold text-slate-900 sm:text-base">
                      {card.title}
                    </h3>
                    <p className="mt-0.5 text-xs font-normal text-slate-500 sm:text-sm leading-relaxed">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
