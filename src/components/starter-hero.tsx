import { ChordisolStudio } from "@/components/chordisol-studio";

// 3-Stage Bayer pixel dither gradients (25% -> 50% -> 75% alternating checkerboards) for ultra-smooth pixel transitions
const BAR_PIXEL_GRADIENTS = {
  // Bar 1: 48px short bar (#4ea0f8 -> #58a9f9)
  bar1:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='28' preserveAspectRatio='none' shape-rendering='crispEdges'%3E%3Cdefs%3E%3Cpattern id='b1_25' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect width='8' height='8' fill='%234ea0f8'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%2358a9f9'/%3E%3C/pattern%3E%3Cpattern id='b1_50' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect x='0' y='0' width='4' height='4' fill='%234ea0f8'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%234ea0f8'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%2358a9f9'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%2358a9f9'/%3E%3C/pattern%3E%3Cpattern id='b1_75' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect width='8' height='8' fill='%2358a9f9'/%3E%3Crect x='0' y='0' width='4' height='4' fill='%234ea0f8'/%3E%3C/pattern%3E%3C/defs%3E%3Crect x='0' y='0' width='14' height='28' fill='%234ea0f8'/%3E%3Crect x='14' y='0' width='6' height='28' fill='url(%23b1_25)'/%3E%3Crect x='20' y='0' width='8' height='28' fill='url(%23b1_50)'/%3E%3Crect x='28' y='0' width='6' height='28' fill='url(%23b1_75)'/%3E%3Crect x='34' y='0' width='14' height='28' fill='%2358a9f9'/%3E%3C/svg%3E\")",
  // Bar 2: flex-1 middle bar (#50a2f8 -> #63b0fa -> #7ec0fb -> #9bd3fc)
  bar2:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='28' preserveAspectRatio='none' shape-rendering='crispEdges'%3E%3Cdefs%3E%3Cpattern id='b2_1_25' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect width='8' height='8' fill='%2350a2f8'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%2363b0fa'/%3E%3C/pattern%3E%3Cpattern id='b2_1_50' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect x='0' y='0' width='4' height='4' fill='%2350a2f8'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%2350a2f8'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%2363b0fa'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%2363b0fa'/%3E%3C/pattern%3E%3Cpattern id='b2_1_75' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect width='8' height='8' fill='%2363b0fa'/%3E%3Crect x='0' y='0' width='4' height='4' fill='%2350a2f8'/%3E%3C/pattern%3E%3Cpattern id='b2_2_25' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect width='8' height='8' fill='%2363b0fa'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%237ec0fb'/%3E%3C/pattern%3E%3Cpattern id='b2_2_50' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect x='0' y='0' width='4' height='4' fill='%2363b0fa'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%2363b0fa'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%237ec0fb'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%237ec0fb'/%3E%3C/pattern%3E%3Cpattern id='b2_2_75' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect width='8' height='8' fill='%237ec0fb'/%3E%3Crect x='0' y='0' width='4' height='4' fill='%2363b0fa'/%3E%3C/pattern%3E%3Cpattern id='b2_3_25' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect width='8' height='8' fill='%237ec0fb'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%239bd3fc'/%3E%3C/pattern%3E%3Cpattern id='b2_3_50' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect x='0' y='0' width='4' height='4' fill='%237ec0fb'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%237ec0fb'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%239bd3fc'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%239bd3fc'/%3E%3C/pattern%3E%3Cpattern id='b2_3_75' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect width='8' height='8' fill='%239bd3fc'/%3E%3Crect x='0' y='0' width='4' height='4' fill='%237ec0fb'/%3E%3C/pattern%3E%3C/defs%3E%3Crect x='0' y='0' width='36' height='28' fill='%2350a2f8'/%3E%3Crect x='36' y='0' width='8' height='28' fill='url(%23b2_1_25)'/%3E%3Crect x='44' y='0' width='10' height='28' fill='url(%23b2_1_50)'/%3E%3Crect x='54' y='0' width='8' height='28' fill='url(%23b2_1_75)'/%3E%3Crect x='62' y='0' width='36' height='28' fill='%2363b0fa'/%3E%3Crect x='98' y='0' width='8' height='28' fill='url(%23b2_2_25)'/%3E%3Crect x='106' y='0' width='10' height='28' fill='url(%23b2_2_50)'/%3E%3Crect x='116' y='0' width='8' height='28' fill='url(%23b2_2_75)'/%3E%3Crect x='124' y='0' width='36' height='28' fill='%237ec0fb'/%3E%3Crect x='160' y='0' width='8' height='28' fill='url(%23b2_3_25)'/%3E%3Crect x='168' y='0' width='10' height='28' fill='url(%23b2_3_50)'/%3E%3Crect x='178' y='0' width='8' height='28' fill='url(%23b2_3_75)'/%3E%3Crect x='186' y='0' width='74' height='28' fill='%239bd3fc'/%3E%3C/svg%3E\")",
  // Bar 3: 56px short bar (#7ec0fb -> #9cd4fd)
  bar3:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='28' preserveAspectRatio='none' shape-rendering='crispEdges'%3E%3Cdefs%3E%3Cpattern id='b3_25' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect width='8' height='8' fill='%237ec0fb'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%239cd4fd'/%3E%3C/pattern%3E%3Cpattern id='b3_50' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect x='0' y='0' width='4' height='4' fill='%237ec0fb'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%237ec0fb'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%239cd4fd'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%239cd4fd'/%3E%3C/pattern%3E%3Cpattern id='b3_75' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect width='8' height='8' fill='%239cd4fd'/%3E%3Crect x='0' y='0' width='4' height='4' fill='%237ec0fb'/%3E%3C/pattern%3E%3C/defs%3E%3Crect x='0' y='0' width='16' height='28' fill='%237ec0fb'/%3E%3Crect x='16' y='0' width='8' height='28' fill='url(%23b3_25)'/%3E%3Crect x='24' y='0' width='8' height='28' fill='url(%23b3_50)'/%3E%3Crect x='32' y='0' width='8' height='28' fill='url(%23b3_75)'/%3E%3Crect x='40' y='0' width='16' height='28' fill='%239cd4fd'/%3E%3C/svg%3E\")",
  // Bar 4: 96px medium bar (#4ea0f8 -> #63b0fa)
  bar4:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='28' preserveAspectRatio='none' shape-rendering='crispEdges'%3E%3Cdefs%3E%3Cpattern id='b4_25' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect width='8' height='8' fill='%234ea0f8'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%2363b0fa'/%3E%3C/pattern%3E%3Cpattern id='b4_50' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect x='0' y='0' width='4' height='4' fill='%234ea0f8'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%234ea0f8'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%2363b0fa'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%2363b0fa'/%3E%3C/pattern%3E%3Cpattern id='b4_75' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect width='8' height='8' fill='%2363b0fa'/%3E%3Crect x='0' y='0' width='4' height='4' fill='%234ea0f8'/%3E%3C/pattern%3E%3C/defs%3E%3Crect x='0' y='0' width='32' height='28' fill='%234ea0f8'/%3E%3Crect x='32' y='0' width='8' height='28' fill='url(%23b4_25)'/%3E%3Crect x='40' y='0' width='12' height='28' fill='url(%23b4_50)'/%3E%3Crect x='52' y='0' width='8' height='28' fill='url(%23b4_75)'/%3E%3Crect x='60' y='0' width='36' height='28' fill='%2363b0fa'/%3E%3C/svg%3E\")",
  // Bar 5: flex-1 long bar (#54a5f9 -> #6bb4fb -> #86c5fc -> #a1d5fd)
  bar5:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='28' preserveAspectRatio='none' shape-rendering='crispEdges'%3E%3Cdefs%3E%3Cpattern id='b5_1_25' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect width='8' height='8' fill='%2354a5f9'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%236bb4fb'/%3E%3C/pattern%3E%3Cpattern id='b5_1_50' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect x='0' y='0' width='4' height='4' fill='%2354a5f9'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%2354a5f9'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%236bb4fb'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%236bb4fb'/%3E%3C/pattern%3E%3Cpattern id='b5_1_75' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect width='8' height='8' fill='%236bb4fb'/%3E%3Crect x='0' y='0' width='4' height='4' fill='%2354a5f9'/%3E%3C/pattern%3E%3Cpattern id='b5_2_25' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect width='8' height='8' fill='%236bb4fb'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%2386c5fc'/%3E%3C/pattern%3E%3Cpattern id='b5_2_50' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect x='0' y='0' width='4' height='4' fill='%236bb4fb'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%236bb4fb'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%2386c5fc'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%2386c5fc'/%3E%3C/pattern%3E%3Cpattern id='b5_2_75' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect width='8' height='8' fill='%2386c5fc'/%3E%3Crect x='0' y='0' width='4' height='4' fill='%236bb4fb'/%3E%3C/pattern%3E%3Cpattern id='b5_3_25' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect width='8' height='8' fill='%2386c5fc'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%23a1d5fd'/%3E%3C/pattern%3E%3Cpattern id='b5_3_50' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect x='0' y='0' width='4' height='4' fill='%2386c5fc'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%2386c5fc'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%23a1d5fd'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%23a1d5fd'/%3E%3C/pattern%3E%3Cpattern id='b5_3_75' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect width='8' height='8' fill='%23a1d5fd'/%3E%3Crect x='0' y='0' width='4' height='4' fill='%2386c5fc'/%3E%3C/pattern%3E%3C/defs%3E%3Crect x='0' y='0' width='36' height='28' fill='%2354a5f9'/%3E%3Crect x='36' y='0' width='8' height='28' fill='url(%23b5_1_25)'/%3E%3Crect x='44' y='0' width='10' height='28' fill='url(%23b5_1_50)'/%3E%3Crect x='54' y='0' width='8' height='28' fill='url(%23b5_1_75)'/%3E%3Crect x='62' y='0' width='36' height='28' fill='%236bb4fb'/%3E%3Crect x='98' y='0' width='8' height='28' fill='url(%23b5_2_25)'/%3E%3Crect x='106' y='0' width='10' height='28' fill='url(%23b5_2_50)'/%3E%3Crect x='116' y='0' width='8' height='28' fill='url(%23b5_2_75)'/%3E%3Crect x='124' y='0' width='36' height='28' fill='%2386c5fc'/%3E%3Crect x='160' y='0' width='8' height='28' fill='url(%23b5_3_25)'/%3E%3Crect x='168' y='0' width='10' height='28' fill='url(%23b5_3_50)'/%3E%3Crect x='178' y='0' width='8' height='28' fill='url(%23b5_3_75)'/%3E%3Crect x='186' y='0' width='74' height='28' fill='%23a1d5fd'/%3E%3C/svg%3E\")",
  // Bar 6: 104px medium bar (#4ea0f8 -> #6bb5fb)
  bar6:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='104' height='28' preserveAspectRatio='none' shape-rendering='crispEdges'%3E%3Cdefs%3E%3Cpattern id='b6_25' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect width='8' height='8' fill='%234ea0f8'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%236bb5fb'/%3E%3C/pattern%3E%3Cpattern id='b6_50' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect x='0' y='0' width='4' height='4' fill='%234ea0f8'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%234ea0f8'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%236bb5fb'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%236bb5fb'/%3E%3C/pattern%3E%3Cpattern id='b6_75' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect width='8' height='8' fill='%236bb5fb'/%3E%3Crect x='0' y='0' width='4' height='4' fill='%234ea0f8'/%3E%3C/pattern%3E%3C/defs%3E%3Crect x='0' y='0' width='36' height='28' fill='%234ea0f8'/%3E%3Crect x='36' y='0' width='8' height='28' fill='url(%23b6_25)'/%3E%3Crect x='44' y='0' width='12' height='28' fill='url(%23b6_50)'/%3E%3Crect x='56' y='0' width='8' height='28' fill='url(%23b6_75)'/%3E%3Crect x='64' y='0' width='40' height='28' fill='%236bb5fb'/%3E%3C/svg%3E\")",
  // Bar 7: flex-1 long bar (#5eb0fa -> #76befb -> #91cefc -> #a9d9fd)
  bar7:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='28' preserveAspectRatio='none' shape-rendering='crispEdges'%3E%3Cdefs%3E%3Cpattern id='b7_1_25' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect width='8' height='8' fill='%235eb0fa'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%2376befb'/%3E%3C/pattern%3E%3Cpattern id='b7_1_50' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect x='0' y='0' width='4' height='4' fill='%235eb0fa'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%235eb0fa'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%2376befb'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%2376befb'/%3E%3C/pattern%3E%3Cpattern id='b7_1_75' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect width='8' height='8' fill='%2376befb'/%3E%3Crect x='0' y='0' width='4' height='4' fill='%235eb0fa'/%3E%3C/pattern%3E%3Cpattern id='b7_2_25' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect width='8' height='8' fill='%2376befb'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%2391cefc'/%3E%3C/pattern%3E%3Cpattern id='b7_2_50' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect x='0' y='0' width='4' height='4' fill='%2376befb'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%2376befb'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%2391cefc'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%2391cefc'/%3E%3C/pattern%3E%3Cpattern id='b7_2_75' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect width='8' height='8' fill='%2391cefc'/%3E%3Crect x='0' y='0' width='4' height='4' fill='%2376befb'/%3E%3C/pattern%3E%3Cpattern id='b7_3_25' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect width='8' height='8' fill='%2391cefc'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%23a9d9fd'/%3E%3C/pattern%3E%3Cpattern id='b7_3_50' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect x='0' y='0' width='4' height='4' fill='%2391cefc'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%2391cefc'/%3E%3Crect x='4' y='0' width='4' height='4' fill='%23a9d9fd'/%3E%3Crect x='0' y='4' width='4' height='4' fill='%23a9d9fd'/%3E%3C/pattern%3E%3Cpattern id='b7_3_75' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Crect width='8' height='8' fill='%23a9d9fd'/%3E%3Crect x='0' y='0' width='4' height='4' fill='%2391cefc'/%3E%3C/pattern%3E%3C/defs%3E%3Crect x='0' y='0' width='36' height='28' fill='%235eb0fa'/%3E%3Crect x='36' y='0' width='8' height='28' fill='url(%23b7_1_25)'/%3E%3Crect x='44' y='0' width='10' height='28' fill='url(%23b7_1_50)'/%3E%3Crect x='54' y='0' width='8' height='28' fill='url(%23b7_1_75)'/%3E%3Crect x='62' y='0' width='36' height='28' fill='%2376befb'/%3E%3Crect x='98' y='0' width='8' height='28' fill='url(%23b7_2_25)'/%3E%3Crect x='106' y='0' width='10' height='28' fill='url(%23b7_2_50)'/%3E%3Crect x='116' y='0' width='8' height='28' fill='url(%23b7_2_75)'/%3E%3Crect x='124' y='0' width='36' height='28' fill='%2391cefc'/%3E%3Crect x='160' y='0' width='8' height='28' fill='url(%23b7_3_25)'/%3E%3Crect x='168' y='0' width='10' height='28' fill='url(%23b7_3_50)'/%3E%3Crect x='178' y='0' width='8' height='28' fill='url(%23b7_3_75)'/%3E%3Crect x='186' y='0' width='74' height='28' fill='%23a9d9fd'/%3E%3C/svg%3E\")",
} as const;

export function StarterHero() {
  return (
    <section
      id="hero"
      aria-label="Chordisol hero and interactive studio"
      className="bg-white px-4 pt-7 pb-8 sm:px-6 sm:pt-10 sm:pb-12"
    >
      <div className="mx-auto w-full max-w-212.5">
        {/* Typographic hero header with balanced 520px width and clean vertical rhythm */}
        <header className="mt-1 sm:mt-2 mb-10 sm:mb-12">
          <h1 className="sr-only">Learn Chord Progression the Fun Way.</h1>

          {/* Graphic Poster Lockup: Diverse Asymmetrical Ends and Pixelated Dither Gradients */}
          {/* Line 1: [Bar 1 (short)] Learn [Bar 2 (long)] Chord [Bar 3 (short)] */}
          {/* Line 2: [Bar 4 (medium)] Progression [Bar 5 (long)] */}
          {/* Line 3: The [Bar 6 (medium)] Fun Way [Bar 7 (long)] */}
          <div
            aria-hidden="true"
            className="mx-auto flex w-full max-w-130 origin-center scale-[0.72] xs:scale-[0.84] sm:scale-100 -my-3 sm:my-0 flex-col gap-3.5 sm:gap-4 select-none"
          >
            {/* Line 1: [Bar 1] Learn [Bar 2] Chord [Bar 3] */}
            <div className="flex items-center gap-2.5 sm:gap-3 w-full">
              {/* Bar 1 before Learn: short bar with stepped pixel dissolution pointing left, flat right edge */}
              <div
                style={{
                  backgroundImage: BAR_PIXEL_GRADIENTS.bar1,
                  backgroundSize: "100% 100%",
                }}
                className="w-11 sm:w-12 h-7 relative shrink-0 [clip-path:polygon(6px_0%,100%_0%,100%_100%,6px_100%,6px_21px,0%_21px,0%_7px,6px_7px)]"
              >
                <span className="absolute left-0 top-1.75 w-0.75 h-3.5 bg-[#e0f2fe] pointer-events-none" />
                <span className="absolute left-0.75 top-1.75 w-0.75 h-3.5 bg-[#badefd] pointer-events-none" />
                <span className="absolute left-3 top-1.5 size-1.25 rounded-[0.5px] bg-white/95 pointer-events-none" />
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
                <span className="absolute left-3 top-1.5 size-1.25 rounded-[0.5px] bg-white/95 pointer-events-none" />
                <span className="absolute left-5.5 top-1.5 size-1.25 rounded-[0.5px] bg-[#e0f2fe]/85 pointer-events-none" />
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
                <span className="absolute left-2 bottom-1.5 size-1.25 rounded-[0.5px] bg-white/90 pointer-events-none" />
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
                <span className="absolute left-0 top-1.5 w-1 h-4 bg-[#e0f2fe] pointer-events-none" />
                <span className="absolute left-1 top-1.5 w-1 h-4 bg-[#badefd] pointer-events-none" />
                <span className="absolute left-4 sm:left-4.5 top-1.5 size-1.25 rounded-[0.5px] bg-white/95 pointer-events-none" />
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
                <span className="absolute left-3 top-1.5 size-1.25 rounded-[0.5px] bg-white/95 pointer-events-none" />
                <span className="absolute left-5.5 top-1.5 size-1.25 rounded-[0.5px] bg-[#e0f2fe]/85 pointer-events-none" />
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
                <span className="absolute right-4 top-1.5 size-1.25 rounded-[0.5px] bg-white/90 pointer-events-none" />
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
                <span className="absolute left-3.5 top-1.75 size-1.25 rounded-[0.5px] bg-white/95 pointer-events-none" />
                <span className="absolute left-6 top-1.75 size-1.25 rounded-[0.5px] bg-[#e0f2fe]/85 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Subtitle / Academy attribution */}
          <p className="mx-auto mt-4 sm:mt-5 text-center text-sm sm:text-[15.5px] font-medium text-slate-500">
            An app made at <span className="font-semibold text-slate-800">Apple Developer Academy @ BINUS Bali</span>
          </p>

          {/* Quick Capability Highlights */}
          <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-slate-50/80 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs backdrop-blur-xs">
              <span className="flex size-2 rounded-full bg-[#1674d6]" />
              <span>Acoustic Mic Detection</span>
              <span className="text-slate-400 font-normal">• No cables needed</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-slate-50/80 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs backdrop-blur-xs">
              <span className="flex size-2 rounded-full bg-[#10b981]" />
              <span>Zero-Latency Audio DSP</span>
              <span className="text-slate-400 font-normal">• 100% on-device</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-slate-50/80 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs backdrop-blur-xs">
              <span className="flex size-2 rounded-full bg-[#7c3aed]" />
              <span>5-Goal Song Curriculum</span>
              <span className="text-slate-400 font-normal">• Ear-first method</span>
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
