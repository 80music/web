import { type ComponentPropsWithoutRef } from "react";

interface GoalItem {
  number: string;
  title: string;
  category: string;
  description: string;
  song: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeBg: string;
}

const GOALS: GoalItem[] = [
  {
    number: "01",
    title: "Trust Your Ear",
    category: "Color & Mood",
    description:
      "Feel whether a chord creates harmonic tension or resolution before analyzing its name. Build confident musical intuition from day one.",
    song: "Twinkle Twinkle Little Star",
    color: "#1674d6",
    bgColor: "from-blue-500/10 to-sky-500/5",
    borderColor: "border-blue-200",
    badgeBg: "bg-blue-100/80 text-blue-800",
  },
  {
    number: "02",
    title: "Fill the Gap",
    category: "Progressions",
    description:
      "Listen to a chord sequence with a missing harmony. Train your ear to predict and spot the missing chord in famous songs by sound alone.",
    song: "Happy Birthday",
    color: "#7c3aed",
    bgColor: "from-purple-500/10 to-indigo-500/5",
    borderColor: "border-purple-200",
    badgeBg: "bg-purple-100/80 text-purple-800",
  },
  {
    number: "03",
    title: "This or That?",
    category: "Voicing Comparison",
    description:
      "Compare two close chord voicings or inversions side-by-side. Hear subtle acoustic overtones and discover which chord voicing fits best.",
    song: "Stand By Me",
    color: "#e11d48",
    bgColor: "from-rose-500/10 to-pink-500/5",
    borderColor: "border-rose-200",
    badgeBg: "bg-rose-100/80 text-rose-800",
  },
  {
    number: "04",
    title: "Stack Stack",
    category: "Note Building",
    description:
      "Deconstruct complex harmony. Build rich major 7ths, minor 9ths, and suspended chords note-by-note directly from their root intervals.",
    song: "Fly Me to the Moon",
    color: "#ea580c",
    bgColor: "from-orange-500/10 to-amber-500/5",
    borderColor: "border-orange-200",
    badgeBg: "bg-orange-100/80 text-orange-800",
  },
  {
    number: "05",
    title: "Swap Notes",
    category: "Voice Leading",
    description:
      "Master voice leading and smooth chord inversions. Guide your fingers across the fretboard or keys with the shortest physical transitions.",
    song: "Let It Be",
    color: "#0d9488",
    bgColor: "from-teal-500/10 to-emerald-500/5",
    borderColor: "border-teal-200",
    badgeBg: "bg-teal-100/80 text-teal-800",
  },
];

function DiscIcon(props: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeDasharray="2 3" />
    </svg>
  );
}

export function CurriculumShowcase() {
  return (
    <section
      id="curriculum"
      aria-label="Chordisol 5-goal ear training curriculum"
      className="border-t border-slate-100 bg-white px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto w-full max-w-212.5">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-[11px] font-bold tracking-wider text-purple-700 uppercase">
            The Ear-First Method
          </span>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl sm:leading-tight">
            5 Interactive Goals. Endless Musical Intuition.
          </h2>
          <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600 sm:text-base text-pretty">
            Instead of drilling dry roman numerals on a chalkboard, you learn how harmony actually feels
            through real song puzzles designed for lifelong retention.
          </p>
        </div>

        {/* Goals Grid */}
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GOALS.map((goal, idx) => (
            <div
              key={goal.title}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b ${goal.bgColor} p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6 ${
                idx === 4 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      style={{ backgroundColor: goal.color }}
                      className="flex size-7 items-center justify-center rounded-full font-mono text-xs font-bold text-white shadow-xs"
                    >
                      {goal.number}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${goal.badgeBg}`}
                    >
                      {goal.category}
                    </span>
                  </div>
                  <DiscIcon
                    style={{ color: goal.color }}
                    className="size-5 shrink-0 opacity-70 transition-transform duration-300 group-hover:rotate-45"
                  />
                </div>

                {/* Title & Description */}
                <h3 className="mt-4 font-display text-lg font-bold tracking-tight text-slate-900">
                  {goal.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed font-medium text-slate-600 sm:text-[13px]">
                  {goal.description}
                </p>
              </div>

              {/* Example Song badge */}
              <div className="mt-5 flex items-center justify-between border-t border-slate-200/60 pt-3">
                <span className="text-[11px] font-medium text-slate-500">Example Song:</span>
                <span className="font-display text-xs font-bold text-slate-800">
                  {goal.song}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Callout: Traditional vs Ear-First */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-10 sm:items-center">
            <div>
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                The Shift
              </span>
              <h3 className="mt-1.5 font-display text-xl font-bold tracking-tight text-slate-900">
                From Abstract Memorization to Real Sound
              </h3>
              <p className="mt-2 text-xs leading-relaxed font-medium text-slate-600 sm:text-sm">
                Traditional music education teaches chords as theoretical math equations before your ears
                even understand the emotional weight. Chordisol reverses this order: train your ear first,
                and the theory falls into place naturally.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-red-200/60 bg-red-50/50 p-3.5">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-red-200 text-xs font-bold text-red-700">
                  ✕
                </span>
                <div>
                  <div className="text-xs font-bold text-red-900">Traditional Drill Work</div>
                  <div className="text-[11.5px] font-medium text-red-800/80">
                    Flashcards, circle of fifths memorization, roman numerals disconnected from instruments.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-emerald-200/70 bg-emerald-50/60 p-3.5">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold text-emerald-700">
                  ✓
                </span>
                <div>
                  <div className="text-xs font-bold text-emerald-900">Chordisol Ear-First</div>
                  <div className="text-[11.5px] font-medium text-emerald-800/90">
                    Live microphone feedback on your real piano or guitar with intuitive song-based chord puzzles.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
