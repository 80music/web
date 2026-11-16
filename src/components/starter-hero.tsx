import { ChordisolStudio } from "@/components/chordisol-studio";

// Pixelated dither gradients (4px alternating checkerboards) transitioning across blue palette tiers
const BAR_PIXEL_GRADIENTS = {
  // Bar 1: 46px short bar (#4ea0f8 -> #58a9f9)
  bar1:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='46' height='28' preserveAspectRatio='none' shape-rendering='crispEdges'%3E%3Cdefs%3E%3Cpattern id='p1' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect x='0' y='0' width='4' height='4' fill='%234ea0f8'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%234ea0f8'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%2358a9f9'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%2358a9f9'/%3E%3C/pattern%3E%3C/defs%3E%3Crect x='0' y='0' width='18' height='28' fill='%234ea0f8'/%3E%3Crect x='18' y='0' width='12' height='28' fill='url(%23p1)'/%3E%3Crect x='30' y='0' width='16' height='28' fill='%2358a9f9'/%3E%3C/svg%3E\")",
  // Bar 2: flex-1 middle bar (#50a2f8 -> #63b0fa -> #7ec0fb -> #9bd3fc)
  bar2:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='28' preserveAspectRatio='none' shape-rendering='crispEdges'%3E%3Cdefs%3E%3Cpattern id='b2_d1' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect x='0' y='0' width='4' height='4' fill='%2350a2f8'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%2350a2f8'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%2363b0fa'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%2363b0fa'/%3E%3C/pattern%3E%3Cpattern id='b2_d2' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect x='0' y='0' width='4' height='4' fill='%2363b0fa'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%2363b0fa'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%237ec0fb'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%237ec0fb'/%3E%3C/pattern%3E%3Cpattern id='b2_d3' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect x='0' y='0' width='4' height='4' fill='%237ec0fb'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%237ec0fb'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%239bd3fc'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%239bd3fc'/%3E%3C/pattern%3E%3C/defs%3E%3Crect x='0' y='0' width='48' height='28' fill='%2350a2f8'/%3E%3Crect x='48' y='0' width='16' height='28' fill='url(%23b2_d1)'/%3E%3Crect x='64' y='0' width='48' height='28' fill='%2363b0fa'/%3E%3Crect x='112' y='0' width='16' height='28' fill='url(%23b2_d2)'/%3E%3Crect x='128' y='0' width='48' height='28' fill='%237ec0fb'/%3E%3Crect x='176' y='0' width='16' height='28' fill='url(%23b2_d3)'/%3E%3Crect x='192' y='0' width='48' height='28' fill='%239bd3fc'/%3E%3C/svg%3E\")",
  // Bar 3: 56px short bar (#7ec0fb -> #9cd4fd)
  bar3:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='28' preserveAspectRatio='none' shape-rendering='crispEdges'%3E%3Cdefs%3E%3Cpattern id='p3' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect x='0' y='0' width='4' height='4' fill='%237ec0fb'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%237ec0fb'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%239cd4fd'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%239cd4fd'/%3E%3C/pattern%3E%3C/defs%3E%3Crect x='0' y='0' width='22' height='28' fill='%237ec0fb'/%3E%3Crect x='22' y='0' width='14' height='28' fill='url(%23p3)'/%3E%3Crect x='36' y='0' width='20' height='28' fill='%239cd4fd'/%3E%3C/svg%3E\")",
  // Bar 4: 96px medium bar (#4ea0f8 -> #63b0fa)
  bar4:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='28' preserveAspectRatio='none' shape-rendering='crispEdges'%3E%3Cdefs%3E%3Cpattern id='p4' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect x='0' y='0' width='4' height='4' fill='%234ea0f8'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%234ea0f8'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%2363b0fa'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%2363b0fa'/%3E%3C/pattern%3E%3C/defs%3E%3Crect x='0' y='0' width='40' height='28' fill='%234ea0f8'/%3E%3Crect x='40' y='0' width='16' height='28' fill='url(%23p4)'/%3E%3Crect x='56' y='0' width='40' height='28' fill='%2363b0fa'/%3E%3C/svg%3E\")",
  // Bar 5: flex-1 long bar (#54a5f9 -> #6bb4fb -> #86c5fc -> #a1d5fd)
  bar5:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='28' preserveAspectRatio='none' shape-rendering='crispEdges'%3E%3Cdefs%3E%3Cpattern id='b5_d1' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect x='0' y='0' width='4' height='4' fill='%2354a5f9'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%2354a5f9'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%236bb4fb'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%236bb4fb'/%3E%3C/pattern%3E%3Cpattern id='b5_d2' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect x='0' y='0' width='4' height='4' fill='%236bb4fb'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%236bb4fb'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%2386c5fc'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%2386c5fc'/%3E%3C/pattern%3E%3Cpattern id='b5_d3' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect x='0' y='0' width='4' height='4' fill='%2386c5fc'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%2386c5fc'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%23a1d5fd'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%23a1d5fd'/%3E%3C/pattern%3E%3C/defs%3E%3Crect x='0' y='0' width='55' height='28' fill='%2354a5f9'/%3E%3Crect x='55' y='0' width='16' height='28' fill='url(%23b5_d1)'/%3E%3Crect x='71' y='0' width='55' height='28' fill='%236bb4fb'/%3E%3Crect x='126' y='0' width='16' height='28' fill='url(%23b5_d2)'/%3E%3Crect x='142' y='0' width='55' height='28' fill='%2386c5fc'/%3E%3Crect x='197' y='0' width='16' height='28' fill='url(%23b5_d3)'/%3E%3Crect x='213' y='0' width='47' height='28' fill='%23a1d5fd'/%3E%3C/svg%3E\")",
  // Bar 6: 104px medium bar (#4ea0f8 -> #6bb5fb)
  bar6:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='104' height='28' preserveAspectRatio='none' shape-rendering='crispEdges'%3E%3Cdefs%3E%3Cpattern id='p6' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect x='0' y='0' width='4' height='4' fill='%234ea0f8'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%234ea0f8'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%236bb5fb'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%236bb5fb'/%3E%3C/pattern%3E%3C/defs%3E%3Crect x='0' y='0' width='44' height='28' fill='%234ea0f8'/%3E%3Crect x='44' y='0' width='16' height='28' fill='url(%23p6)'/%3E%3Crect x='60' y='0' width='44' height='28' fill='%236bb5fb'/%3E%3C/svg%3E\")",
  // Bar 7: flex-1 long bar (#5eb0fa -> #76befb -> #91cefc -> #a9d9fd)
  bar7:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='28' preserveAspectRatio='none' shape-rendering='crispEdges'%3E%3Cdefs%3E%3Cpattern id='b7_d1' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect x='0' y='0' width='4' height='4' fill='%235eb0fa'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%235eb0fa'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%2376befb'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%2376befb'/%3E%3C/pattern%3E%3Cpattern id='b7_d2' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect x='0' y='0' width='4' height='4' fill='%2376befb'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%2376befb'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%2391cefc'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%2391cefc'/%3E%3C/pattern%3E%3Cpattern id='b7_d3' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect x='0' y='0' width='4' height='4' fill='%2391cefc'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%2391cefc'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%23a9d9fd'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%23a9d9fd'/%3E%3C/pattern%3E%3C/defs%3E%3Crect x='0' y='0' width='55' height='28' fill='%235eb0fa'/%3E%3Crect x='55' y='0' width='16' height='28' fill='url(%23b7_d1)'/%3E%3Crect x='71' y='0' width='55' height='28' fill='%2376befb'/%3E%3Crect x='126' y='0' width='16' height='28' fill='url(%23b7_d2)'/%3E%3Crect x='142' y='0' width='55' height='28' fill='%2391cefc'/%3E%3Crect x='197' y='0' width='16' height='28' fill='url(%23b7_d3)'/%3E%3Crect x='213' y='0' width='47' height='28' fill='%23a9d9fd'/%3E%3C/svg%3E\")",
} as const;

export function StarterHero() {
  return (
    <section
      id="hero"
      aria-label="Chordisol hero and interactive studio"
      className="bg-white px-4 pt-6 pb-8 sm:px-6 sm:pt-9 sm:pb-12"
    >
      <div className="mx-auto w-full max-w-212.5">
        {/* Typographic hero header with balanced 520px width */}
        <header className="mb-8 sm:mb-10">
          <h1 className="sr-only">Learn Chord Progression the Fun Way.</h1>

          {/* Graphic Poster Lockup: Diverse Asymmetrical Ends and Pixelated Dither Gradients */}
          {/* Line 1: [Bar 1 (short)] Learn [Bar 2 (long)] Chord [Bar 3 (short)] */}
          {/* Line 2: [Bar 4 (medium)] Progression [Bar 5 (long)] */}
          {/* Line 3: The [Bar 6 (medium)] Fun Way [Bar 7 (long)] */}
          <div
            aria-hidden="true"
            className="mx-auto flex w-full max-w-130 flex-col gap-3.5 sm:gap-4 select-none"
          >
            {/* Line 1: [Bar 1] Learn [Bar 2] Chord [Bar 3] */}
            <div className="flex items-center gap-2.5 sm:gap-3 w-full">
              {/* Bar 1 before Learn: short bar with single top-left step only */}
              <div
                style={{
                  backgroundImage: BAR_PIXEL_GRADIENTS.bar1,
                  backgroundSize: "100% 100%",
                }}
                className="w-10 sm:w-11.5 h-7 relative shrink-0 [clip-path:polygon(3.5px_0%,100%_0%,100%_100%,0%_100%,0%_3.5px)]"
              >
                <span className="absolute left-2 top-1.5 size-1.25 rounded-[0.5px] bg-white/90 pointer-events-none" />
              </div>

              <span className="font-display text-2xl sm:text-[26px] font-bold tracking-tight text-slate-900 shrink-0 leading-none">
                Learn
              </span>

              {/* Bar 2 between Learn and Chord: long bar with protruding left connector tab, flat right edge */}
              <div
                style={{
                  backgroundImage: BAR_PIXEL_GRADIENTS.bar2,
                  backgroundSize: "100% 100%",
                }}
                className="flex-1 h-7 relative [clip-path:polygon(5px_0%,100%_0%,100%_100%,5px_100%,5px_21px,0%_21px,0%_7px,5px_7px)]"
              >
                <span className="absolute left-3 top-1.5 size-1.25 rounded-[0.5px] bg-white/90 pointer-events-none" />
                <span className="absolute left-5.5 top-1.5 size-1.25 rounded-[0.5px] bg-[#e0f2fe]/80 pointer-events-none" />
              </div>

              <span className="font-display text-2xl sm:text-[26px] font-bold tracking-tight text-slate-900 shrink-0 leading-none">
                Chord
              </span>

              {/* Bar 3 after Chord: flat left edge against Chord, stepped dissolution on the right */}
              <div
                style={{
                  backgroundImage: BAR_PIXEL_GRADIENTS.bar3,
                  backgroundSize: "100% 100%",
                }}
                className="w-12 sm:w-14 h-7 relative shrink-0 [clip-path:polygon(0%_0%,calc(100%-10px)_0%,calc(100%-10px)_7px,calc(100%-4px)_7px,calc(100%-4px)_20px,calc(100%-8px)_20px,calc(100%-8px)_100%,0%_100%)]"
              >
                <span className="absolute right-0 top-2 w-1 h-2.5 bg-[#c7e6fd] rounded-r-[0.5px] pointer-events-none" />
                <span className="absolute left-2 bottom-1.5 size-1.25 rounded-[0.5px] bg-white/85 pointer-events-none" />
              </div>
            </div>

            {/* Line 2: [Bar 4] Progression [Bar 5] */}
            <div className="flex items-center gap-2.5 sm:gap-3 w-full">
              {/* Bar 4 before Progression: stepped dissolution pointing left, flat right edge */}
              <div
                style={{
                  backgroundImage: BAR_PIXEL_GRADIENTS.bar4,
                  backgroundSize: "100% 100%",
                }}
                className="w-20 sm:w-24 h-7 relative shrink-0 [clip-path:polygon(8px_0%,100%_0%,100%_100%,8px_100%,8px_22px,0%_22px,0%_6px,8px_6px)]"
              >
                <span className="absolute left-0 top-1.5 w-1 h-4 bg-[#badefd] pointer-events-none" />
                <span className="absolute left-4 sm:left-4.5 top-1.5 size-1.25 rounded-[0.5px] bg-white/90 pointer-events-none" />
              </div>

              <span className="font-display text-2xl sm:text-[26px] font-bold tracking-tight text-slate-900 shrink-0 leading-none">
                Progression
              </span>

              {/* Bar 5 after Progression: flat left edge, stepped arrow dissolution on far right */}
              <div
                style={{
                  backgroundImage: BAR_PIXEL_GRADIENTS.bar5,
                  backgroundSize: "100% 100%",
                }}
                className="flex-1 h-7 relative [clip-path:polygon(0%_0%,calc(100%-12px)_0%,calc(100%-12px)_6px,calc(100%-5px)_6px,calc(100%-5px)_21px,calc(100%-9px)_21px,calc(100%-9px)_100%,0%_100%)]"
              >
                <span className="absolute right-0 top-1.75 w-1.25 h-3 bg-[#bde1fd] pointer-events-none" />
                <span className="absolute left-3 top-1.5 size-1.25 rounded-[0.5px] bg-white/90 pointer-events-none" />
                <span className="absolute left-5.5 top-1.5 size-1.25 rounded-[0.5px] bg-[#e0f2fe]/80 pointer-events-none" />
              </div>
            </div>

            {/* Line 3: The [Bar 6] Fun Way [Bar 7] */}
            <div className="flex items-center gap-2.5 sm:gap-3 w-full">
              <span className="font-display text-2xl sm:text-[26px] font-bold tracking-tight text-slate-900 shrink-0 leading-none">
                The
              </span>

              {/* Bar 6 between The and Fun Way: flat left edge, protruding connector tab on right */}
              <div
                style={{
                  backgroundImage: BAR_PIXEL_GRADIENTS.bar6,
                  backgroundSize: "100% 100%",
                }}
                className="w-22 sm:w-26 h-7 relative shrink-0 [clip-path:polygon(0%_0%,calc(100%-6px)_0%,calc(100%-6px)_7px,100%_7px,100%_21px,calc(100%-6px)_21px,calc(100%-6px)_100%,0%_100%)]"
              >
                <span className="absolute right-4 top-1.5 size-1.25 rounded-[0.5px] bg-white/85 pointer-events-none" />
              </div>

              <span className="font-display text-2xl sm:text-[26px] font-bold tracking-tight text-slate-900 shrink-0 leading-none">
                Fun Way
              </span>

              {/* Bar 7 after Fun Way: single bottom step on left, stepped arrow dissolution on far right */}
              <div
                style={{
                  backgroundImage: BAR_PIXEL_GRADIENTS.bar7,
                  backgroundSize: "100% 100%",
                }}
                className="flex-1 h-7 relative [clip-path:polygon(0%_0%,calc(100%-14px)_0%,calc(100%-14px)_5px,calc(100%-6px)_5px,calc(100%-6px)_20px,calc(100%-10px)_20px,calc(100%-10px)_100%,6px_100%,6px_22px,0%_22px)]"
              >
                <span className="absolute right-0 top-1.5 w-1.5 h-3.5 bg-[#bfe1fd] pointer-events-none" />
                <span className="absolute left-3.5 top-1.75 size-1.25 rounded-[0.5px] bg-white/90 pointer-events-none" />
                <span className="absolute left-6 top-1.75 size-1.25 rounded-[0.5px] bg-[#e0f2fe]/80 pointer-events-none" />
              </div>
            </div>
          </div>
        </header>

        {/* The Interactive Bento Studio */}
        <ChordisolStudio />

        {/* Supporting note about using the app with real instruments */}
        <p className="mx-auto mt-6 sm:mt-8 max-w-md text-center text-xs font-medium text-slate-500 sm:text-sm text-pretty">
          Prop your iPhone by your piano or guitar and play naturally — no cables, audio interfaces, or MIDI setup required.
        </p>
      </div>
    </section>
  );
}
