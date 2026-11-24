import { AppleLogoIcon } from "@/components/bento-icons";

export function CtaBanner() {
  return (
    <section
      id="download"
      aria-label="Download Chordisol for iOS"
      className="relative w-full overflow-hidden border-t border-blue-400/30 bg-gradient-to-b from-[#1877f2] via-[#1366dc] to-[#0a4cb8] px-4 py-20 text-white sm:px-6 sm:py-28"
    >
      {/* Subtle top edge glow (no center washout) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-sky-400/20 blur-3xl"
      />
      {/* Subtle corner depth accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -bottom-20 size-80 rounded-full bg-blue-900/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 -top-20 size-80 rounded-full bg-sky-300/15 blur-3xl"
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
        {/* Pill tag - crisp high contrast */}
        <span className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/20 px-4 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur-md shadow-xs">
          <span className="size-2 rounded-full bg-emerald-300 animate-pulse" />
          <span>Available Free on iOS &amp; iPadOS</span>
        </span>

        {/* Main title - bold, sharp, pure white with subtle depth */}
        <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[56px] sm:leading-[1.12] drop-shadow-[0_2px_8px_rgba(0,30,80,0.25)] text-balance">
          Lower your cortisol, with Chordisol.
        </h2>

        {/* Description - crisp white with high legibility */}
        <p className="mt-4 max-w-lg text-base font-medium leading-relaxed text-white sm:text-lg drop-shadow-[0_1px_3px_rgba(0,30,80,0.25)] text-pretty">
          Pick up your instrument and start training your ear the natural way. Free to play, private by design, and ready whenever inspiration strikes.
        </p>

        {/* App Store CTA Button */}
        <div className="mt-8 flex flex-col items-center gap-3.5">
          <a
            href="https://apps.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-13 items-center justify-center gap-3 rounded-full bg-white px-8 text-sm font-bold text-blue-900 shadow-xl shadow-blue-950/25 transition-all duration-200 hover:bg-slate-50 hover:scale-[1.02] active:scale-98"
          >
            <AppleLogoIcon className="size-4.5 shrink-0 text-blue-900" />
            <span>Download for iOS &amp; iPadOS</span>
          </a>

          {/* Microcopy - just clean lighter white text, no glass */}
          <p className="text-xs sm:text-[13px] font-medium text-white/90">
            100% Free • Zero ads • No account required
          </p>
        </div>
      </div>
    </section>
  );
}
