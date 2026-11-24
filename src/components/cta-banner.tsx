import { AppleLogoIcon } from "@/components/bento-icons";

export function CtaBanner() {
  return (
    <section
      id="download"
      aria-label="Download Chordisol for iOS"
      className="relative w-full overflow-hidden border-t border-blue-400/20 bg-linear-to-b from-[#1877e5] via-[#1470dc] to-[#0d5ec4] px-4 py-20 text-white sm:px-6 sm:py-24"
    >
      {/* Subtle decorative background circles / acoustic soundwaves */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 size-96 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 -bottom-20 size-96 rounded-full bg-sky-300/15 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
        {/* Pill tag */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold text-white/95 backdrop-blur-md">
          <span className="size-1.5 rounded-full bg-sky-300" />
          <span>Available Free on the App Store</span>
        </span>

        {/* Main title */}
        <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-white sm:text-4xl sm:leading-tight">
          Start Hearing Chords in the Songs You Love.
        </h2>

        {/* Description */}
        <p className="mt-3.5 text-sm font-medium leading-relaxed text-white/85 sm:text-base text-pretty">
          Prop your iPhone or iPad by your piano or guitar. Turn raw acoustic sounds into instant
          recognition, ear-training confidence, and effortless song playing.
        </p>

        {/* App Store CTA Button */}
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
          <a
            href="https://apps.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-white px-7 text-sm font-bold text-slate-950 shadow-lg transition-all duration-150 hover:bg-slate-100 hover:shadow-xl active:scale-95"
          >
            <AppleLogoIcon className="size-4 shrink-0 text-slate-950" />
            <span>Download for iOS &amp; iPadOS</span>
          </a>

          <span className="text-xs font-semibold text-white/80">
            Free • Zero ads or in-app tracking
          </span>
        </div>

        {/* Feature badges row */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-white/75 sm:mt-10">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1">
            ✓ iOS 17.0+ &amp; iPadOS 17.0+
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1">
            ✓ On-Device Audio Engine
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1">
            ✓ Acoustic Piano &amp; Guitar
          </span>
        </div>
      </div>
    </section>
  );
}
