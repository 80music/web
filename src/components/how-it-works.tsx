const STEPS = [
  {
    step: "01",
    tag: "Zero setup",
    title: "Prop by Your Instrument",
    desc: "Set your iPhone on your piano stand or beside your guitar — no cables, MIDI, or Bluetooth.",
    badgeBg: "bg-sky-50 text-sky-700",
    visual: (
      <div className="relative flex h-36 w-full flex-col items-center justify-end overflow-hidden rounded-xl bg-gradient-to-b from-sky-50/80 to-blue-50/50 px-4 pb-3 pt-3">
        <div className="relative flex flex-col items-center">
          {/* Subtle acoustic rings */}
          <div className="pointer-events-none absolute -top-2 size-24 rounded-full border border-sky-300/35" />
          <div className="pointer-events-none absolute -top-5 size-32 rounded-full border border-sky-200/25" />

          {/* Slim-bezel modern iPhone */}
          <div className="relative z-10 h-[92px] w-[52px] rounded-[12px] bg-[#162032] p-[2.5px] shadow-[0_8px_18px_-6px_rgba(20,54,95,0.35)] ring-1 ring-slate-900/15">
            <div className="flex h-full w-full flex-col items-center justify-between overflow-hidden rounded-[9.5px] bg-gradient-to-b from-[#2391ff] to-[#1472d8] px-1.5 pb-1.5 pt-1 text-white">
              {/* Dynamic Island */}
              <span className="h-[3px] w-4 rounded-full bg-[#0f172a]/85" />

              {/* Detected chord readout */}
              <div className="flex flex-col items-center">
                <span className="font-display text-[11px] font-bold leading-none tracking-tight">
                  Cmaj7
                </span>
                <span className="mt-0.5 text-[7px] font-medium text-white/75">
                  Listening
                </span>
              </div>

              {/* Mini piano keyboard */}
              <div className="relative flex h-4 w-full gap-[1.5px] rounded-[3px] bg-white/95 p-[2px]">
                <span className="flex-1 rounded-[1.5px] bg-sky-100" />
                <span className="flex-1 rounded-[1.5px] bg-[#2391ff]" />
                <span className="flex-1 rounded-[1.5px] bg-sky-100" />
                <span className="flex-1 rounded-[1.5px] bg-[#2391ff]" />
                <span className="flex-1 rounded-[1.5px] bg-sky-100" />
              </div>
            </div>
          </div>

          {/* Slim piano / music stand ledge */}
          <div className="relative z-10 mt-1 h-[5px] w-32 rounded-full bg-slate-300/90" />
          <div className="flex items-start justify-center gap-8">
            <div className="h-2.5 w-[3px] rounded-b-full bg-slate-300/80" />
            <div className="h-2.5 w-[3px] rounded-b-full bg-slate-300/80" />
          </div>
        </div>
      </div>
    ),
  },
  {
    step: "02",
    tag: "On-device DSP",
    title: "Instant Detection",
    desc: "Play naturally. On-device audio recognition identifies every chord the moment you strike.",
    badgeBg: "bg-emerald-50 text-emerald-700",
    visual: (
      <div className="relative flex h-36 w-full flex-col items-center justify-between overflow-hidden rounded-xl bg-gradient-to-b from-emerald-50/70 to-teal-50/45 px-4 py-3.5">
        {/* Green acoustic frequency chart */}
        <div className="flex h-[74px] items-end gap-1.5 pt-1">
          {[26, 46, 68, 36, 84, 54, 92, 42, 74, 50, 30].map((height, idx) => (
            <div
              key={idx}
              style={{ height: `${Math.round(height * 0.72)}px` }}
              className={`w-2 rounded-full transition-all duration-300 ${
                idx % 2 === 0
                  ? "bg-gradient-to-t from-emerald-600 to-teal-400"
                  : "bg-gradient-to-t from-teal-500 to-emerald-300"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800 shadow-2xs ring-1 ring-emerald-200/70">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
          <span>Real-time on-device DSP</span>
        </div>
      </div>
    ),
  },
  {
    step: "03",
    tag: "Intuitive ear",
    title: "Train with Song Puzzles",
    desc: "Build real ear instinct by matching chords inside interactive song puzzles.",
    badgeBg: "bg-purple-50 text-purple-700",
    visual: (
      <div className="relative flex h-36 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-purple-50/70 to-indigo-50/40 px-4 py-3.5">
        {/* Compact mini song-puzzle card */}
        <div className="flex flex-col items-center gap-2 rounded-xl bg-white/90 px-3 py-2.5 shadow-2xs ring-1 ring-purple-200/60">
          {/* Mini progress track */}
          <div className="flex w-full items-center justify-between gap-2">
            <span className="text-[10px] font-semibold text-slate-500">
              Chord sequence
            </span>
            <span className="text-[10px] font-semibold text-purple-600">
              3 / 4
            </span>
          </div>

          {/* Compact 4-tile progression — generous horizontal margin */}
          <div className="flex items-center gap-1.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#1674d6] font-display text-xs font-bold text-white shadow-2xs">
              C
            </div>
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#7c3aed] font-display text-xs font-bold text-white shadow-2xs">
              G
            </div>
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#e11d48] font-display text-xs font-bold text-white shadow-2xs">
              Am
            </div>
            <div className="flex size-8 items-center justify-center rounded-lg border-[1.5px] border-dashed border-purple-400 bg-purple-50 font-display text-sm font-bold text-purple-700">
              ?
            </div>
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
        <div className="mx-auto max-w-xl text-center">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Acoustic by design
          </span>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl sm:leading-tight">
            No Cables. No MIDI. Just Play.
          </h2>
          <p className="mt-2.5 text-sm font-medium leading-relaxed text-slate-600 sm:text-base text-pretty">
            Turn your iPhone into an acoustic listening partner for any real instrument.
          </p>
        </div>

        {/* 3-Step Grid */}
        <div className="mt-11 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((item) => (
            <div
              key={item.step}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-5"
            >
              {/* Step visual */}
              {item.visual}

              {/* Header row: step count & tag */}
              <div className="mt-4 flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-slate-400">
                  Step {item.step}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${item.badgeBg}`}
                >
                  {item.tag}
                </span>
              </div>

              {/* Title & concise description */}
              <h3 className="mt-2.5 font-display text-lg font-bold tracking-tight text-slate-900">
                {item.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed font-medium text-slate-600">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
