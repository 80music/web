import Image from "next/image";

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

          {/* Right Column (45%): Image Asset Created by User */}
          <div className="w-full lg:w-[45%] flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[320px] xs:max-w-[350px] sm:max-w-[390px] rotate-1">
              <Image
                src="/images/the-shift-comparison.png"
                alt="Chord Matched vs MIDI clutter, dry theory drills, and stressful tone tests"
                width={512}
                height={386}
                className="w-full h-auto object-contain select-none"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
