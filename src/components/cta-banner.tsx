import { AppleLogoIcon } from "@/components/bento-icons";

export function CtaBanner() {
  return (
    <section
      id="download"
      aria-label="Download Chordisol for iOS"
      className="relative w-full overflow-hidden border-t border-sky-300/40 bg-gradient-to-b from-[#2aa2ff] via-[#1a7cf7] to-[#0c5ed8] px-4 py-20 text-white sm:px-6 sm:py-28"
    >
      {/* Luminous top ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 size-[680px] rounded-full bg-white/20 blur-3xl"
      />
      {/* Decorative side orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-20 size-96 rounded-full bg-sky-200/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 -bottom-24 size-96 rounded-full bg-cyan-300/20 blur-3xl"
      />

      {/* Subtle concentric soundwave circles in background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10"
      >
        <svg viewBox="0 0 800 800" className="size-[800px] text-white" fill="none" stroke="currentColor">
          <circle cx="400" cy="400" r="180" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="400" cy="400" r="280" strokeWidth="1" />
          <circle cx="400" cy="400" r="380" strokeWidth="1" strokeDasharray="6 8" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        {/* Pill tag */}
        <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur-md shadow-xs">
          <span className="size-2 rounded-full bg-emerald-300 animate-pulse" />
          <span>Available Free on iOS &amp; iPadOS</span>
        </span>

        {/* Main title */}
        <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[56px] sm:leading-[1.12] text-balance">
          Lower your cortisol, with Chordisol.
        </h2>

        {/* Description */}
        <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-white/90 sm:text-lg text-pretty">
          No tangled MIDI cables. No high-stress theory drills. Just your real acoustic instrument,
          your device microphone, and effortless song playing.
        </p>

        {/* App Store CTA Button */}
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
          <a
            href="https://apps.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-13 items-center justify-center gap-3 rounded-full bg-white px-8 text-sm font-bold text-blue-900 shadow-xl shadow-blue-950/20 transition-all duration-200 hover:bg-slate-50 hover:scale-[1.02] active:scale-98"
          >
            <AppleLogoIcon className="size-4.5 shrink-0 text-blue-900" />
            <span>Download for iOS &amp; iPadOS</span>
          </a>

          <span className="text-xs font-semibold text-white/85">
            100% Free • Zero ads or in-app tracking
          </span>
        </div>

        {/* Feature badges row */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-2.5 text-xs font-medium text-white/90 sm:mt-11">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 backdrop-blur-xs">
            ✓ Real-Time Acoustic Engine
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 backdrop-blur-xs">
            ✓ Piano &amp; Guitar Friendly
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 backdrop-blur-xs">
            ✓ Zero Cables or Hardware
          </span>
        </div>
      </div>
    </section>
  );
}
