"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AppleLogoIcon } from "@/components/bento-icons";
import {
  DownloadSpotlightBackdrop,
  EarTrainingGroovesBackdrop,
  RecognitionArcsBackdrop,
  SingleVinylDisc,
  SongHillBackdrop,
  StudioStaffBackdrop,
  VinylDiscsBadge,
} from "@/components/bento-visuals";
import { LottieComponent } from "@/components/lottie-component";
import { PianoKeys, type PianoKeysHandle } from "@/components/piano-keys";
import { detectChord, SAMPLE_CHORDS } from "@/lib/chord-detector";

interface CurriculumGoal {
  id: string;
  title: string;
  badge: string;
  description: string;
  exampleSong: string;
  outer: string;
  ring: string;
  accent: string;
}

const CURRICULUM_GOALS: CurriculumGoal[] = [
  {
    id: "trust-your-ear",
    title: "Trust Your Ear",
    badge: "Color & Mood",
    description: "Feel whether a chord fits before you analyze it.",
    exampleSong: "Twinkle Twinkle Little Star",
    outer: "#1674d6",
    ring: "#73baff",
    accent: "#1674d6",
  },
  {
    id: "fill-the-gap",
    title: "Fill the Gap",
    badge: "Progressions",
    description: "Find the missing chords in real song progressions.",
    exampleSong: "Happy Birthday",
    outer: "#7c3aed",
    ring: "#b7a3ff",
    accent: "#7c3aed",
  },
  {
    id: "this-or-that",
    title: "This or That?",
    badge: "Comparison",
    description: "Compare two chord voicings to hear what feels right.",
    exampleSong: "Stand By Me",
    outer: "#e11d48",
    ring: "#ff9bc5",
    accent: "#e11d48",
  },
  {
    id: "stack-stack",
    title: "Stack Stack",
    badge: "Note Building",
    description: "Build chords note-by-note from roots up to 7ths.",
    exampleSong: "Fly Me to the Moon",
    outer: "#ea580c",
    ring: "#ffd0a3",
    accent: "#ea580c",
  },
  {
    id: "swap-notes",
    title: "Swap Notes",
    badge: "Voice Leading",
    description: "Master chord inversions & smooth voice transitions.",
    exampleSong: "Let It Be",
    outer: "#0d9488",
    ring: "#5eead4",
    accent: "#0d9488",
  },
];

function CurriculumAutoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);

  // Auto-swipe timer (3.5s interval, pauses on hover/touch)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % CURRICULUM_GOALS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isPaused, currentIndex]);

  const handleSelect = useCallback(
    (index: number) => {
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
    },
    [currentIndex],
  );

  const activeGoal = CURRICULUM_GOALS[currentIndex];

  return (
    <div
      className="relative z-10 flex flex-col justify-between h-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      role="region"
      aria-label="Curriculum Goals Carousel"
    >
      {/* Header: Clean, airy branding & title with spacious layout */}
      <div>
        <div className="flex items-center gap-2">
          <VinylDiscsBadge />
          <h2
            id="practice-heading"
            className="font-display text-base font-bold tracking-tight text-fg-display"
          >
            Curriculum
          </h2>
        </div>
        <p className="mt-1 text-xs font-medium text-fg-display/70">
          5 interactive goals to train your ear.
        </p>
      </div>

      {/* Auto-Swiping Slide Card */}
      <div className="my-2 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeGoal.id}
            initial={{ opacity: 0, x: direction * 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 14 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-xs border border-white/80"
          >
            <SingleVinylDisc
              outer={activeGoal.outer}
              ring={activeGoal.ring}
              className="size-11 shrink-0 drop-shadow-xs"
            />
            <div className="min-w-0 flex-1">
              <span
                className="inline-block rounded px-1.5 py-0.2 font-sans text-[10px] font-bold tracking-tight"
                style={{
                  backgroundColor: `${activeGoal.accent}14`,
                  color: activeGoal.accent,
                }}
              >
                {activeGoal.badge}
              </span>
              <h3 className="mt-0.5 font-display text-sm font-bold text-fg-display leading-tight truncate">
                {activeGoal.title}
              </h3>
              <p className="mt-0.5 text-[11px] font-medium text-fg-display/70 leading-snug line-clamp-1">
                {activeGoal.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer: Centered Auto-Paging Indicators */}
      <div className="flex items-center justify-center pt-0.5">
        <div className="flex items-center gap-1.5">
          {CURRICULUM_GOALS.map((g, i) => (
            <button
              key={g.id}
              type="button"
              onClick={() => handleSelect(i)}
              aria-label={`Go to ${g.title}`}
              aria-current={i === currentIndex ? "true" : undefined}
              className="group py-1 focus:outline-none"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "w-4.5 shadow-2xs"
                    : "w-1.5 bg-slate-300/80 group-hover:bg-slate-400"
                }`}
                style={i === currentIndex ? { backgroundColor: activeGoal.accent } : undefined}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChordisolStudio() {
  const pianoRef = useRef<PianoKeysHandle | null>(null);
  const [activeNotes, setActiveNotes] = useState<string[]>(() => [
    ...SAMPLE_CHORDS[1].notes,
  ]);

  const detectedChord = useMemo(() => detectChord(activeNotes), [activeNotes]);

  const handleSelectChord = useCallback((notes: readonly string[]) => {
    pianoRef.current?.auditionChord(notes, 1100);
  }, []);

  const handleActiveNotesChange = useCallback((notes: string[]) => {
    setActiveNotes(notes);
  }, []);

  return (
    <div className="mx-auto grid w-full max-w-212.5 grid-cols-1 gap-3 sm:gap-3.5 md:grid-cols-12">
      {/* Row 1, Left (8 cols): Deep navy interactive piano studio */}
      <section
        id="studio"
        aria-labelledby="play-heading"
        className="relative flex flex-col justify-between gap-3 overflow-hidden rounded-[18px] bg-fg-display p-3.5 text-white sm:p-4 md:col-span-8 shadow-[0_4px_0_#08172b]"
      >
        <StudioStaffBackdrop />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
          <h2
            id="play-heading"
            className="font-display text-base font-bold tracking-tight text-white sm:text-lg"
          >
            Instant Recognition
          </h2>

          <div
            role="group"
            aria-label="Sample chord voicings"
            className="flex flex-wrap items-center gap-1.5"
          >
            {SAMPLE_CHORDS.map((preset) => {
              const isSelected = detectedChord?.symbol === preset.symbol;
              return (
                <button
                  key={preset.symbol}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleSelectChord(preset.notes)}
                  className={
                    isSelected
                      ? "cursor-pointer rounded-full bg-white px-2.5 py-0.5 font-sans text-xs font-bold text-fg-display shadow-[0_2px_0_rgba(0,0,0,0.15)] transition-[background-color,color,transform] duration-150 active:scale-[0.97]"
                      : "cursor-pointer rounded-full bg-white/14 px-2.5 py-0.5 font-sans text-xs font-bold text-white transition-[background-color,color,transform] duration-150 hover:bg-white/24 active:scale-[0.97]"
                  }
                >
                  {preset.symbol}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative z-10">
          <PianoKeys
            ref={pianoRef}
            initialNotes={SAMPLE_CHORDS[1].notes}
            onActiveNotesChange={handleActiveNotesChange}
          />
        </div>
      </section>

      {/* Row 1, Right (4 cols): Airy sky "Trust Your Ear" Lottie animation card */}
      <section
        id="recognition"
        aria-labelledby="trust-ear-heading"
        className="relative flex min-h-44 sm:min-h-46 flex-col justify-between overflow-hidden rounded-[18px] bg-linear-to-b from-[#e8f3ff] via-[#edf6ff] to-[#f4f9ff] p-4 text-fg-display md:col-span-4 shadow-[0_4px_0_#a2caf3]"
      >
        <RecognitionArcsBackdrop />

        <div className="relative z-10 flex h-full flex-col items-center justify-between text-center py-1">
          <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#1674d6] shadow-xs">
            <span className="size-2 rounded-full bg-[#2391ff] animate-pulse" />
            <h2 id="trust-ear-heading" className="inline text-xs font-bold text-[#1674d6]">
              Trust Your Ear
            </h2>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none my-auto flex w-full items-center justify-center select-none"
          >
            <LottieComponent
              id="trust-your-ear"
              className="h-20 w-24 sm:h-22 sm:w-26"
            />
          </div>

          <p className="text-xs font-medium text-fg-display/70">
            Feel whether a chord fits before you analyze it.
          </p>
        </div>
      </section>

      {/* Row 2, Left (4 cols): Guided curriculum & vinyl drills with auto-swiping carousel */}
      <section
        id="curriculum"
        aria-labelledby="practice-heading"
        className="relative flex min-h-46 sm:min-h-48 flex-col justify-between overflow-hidden rounded-[18px] bg-[#eef1fb] p-3.5 text-fg-display sm:p-4 md:col-span-4 shadow-[0_4px_0_#b8c0df]"
      >
        <EarTrainingGroovesBackdrop />
        <CurriculumAutoCarousel />
      </section>

      {/* Row 2, Middle (4 cols): Song Puzzles (Reverted as requested) */}
      <section
        id="about"
        aria-labelledby="puzzles-heading"
        className="relative flex min-h-46 sm:min-h-48 flex-col justify-between overflow-hidden rounded-[18px] bg-linear-to-b from-[#dfeffe] via-[#edf6ff] to-[#f4f9ff] p-3.5 text-fg-display sm:p-4 md:col-span-4 shadow-[0_4px_0_#8ea722]"
      >
        <SongHillBackdrop />

        <div className="relative z-10 flex items-start justify-between gap-2">
          <div>
            <h2
              id="puzzles-heading"
              className="font-display text-sm font-bold tracking-tight text-fg-display sm:text-base"
            >
              Song Puzzles
            </h2>
            <p className="mt-0.5 text-xs font-medium text-fg-display/70">
              Match missing chords to real songs.
            </p>
          </div>
          <div aria-hidden="true" className="flex shrink-0 items-center gap-1">
            <span className="inline-flex size-5 items-center justify-center rounded-md bg-[#2391ff] font-sans text-[10px] font-bold text-white shadow-[0_2px_0_#1666c1]">
              C
            </span>
            <span className="inline-flex size-5 items-center justify-center rounded-md bg-[#2391ff] font-sans text-[10px] font-bold text-white shadow-[0_2px_0_#1666c1]">
              F
            </span>
            <span className="inline-flex size-5 items-center justify-center rounded-md border border-dashed border-[#9ab0c9] bg-white font-sans text-[10px] font-bold text-fg-display/55">
              ?
            </span>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none relative z-10 -mx-3.5 -mb-3.5 flex justify-center sm:-mx-4 sm:-mb-4 select-none"
        >
          <Image
            src="/images/mascots/mascot-hill.png"
            alt=""
            width={512}
            height={395}
            preload={true}
            className="h-32 w-auto object-contain object-bottom sm:h-34"
          />
        </div>
      </section>

      {/* Row 2, Right (4 cols): Chordisol for iOS card (Spacious & uncluttered) */}
      <section
        id="download"
        aria-labelledby="download-heading"
        className="relative flex min-h-46 sm:min-h-48 flex-col justify-between overflow-hidden rounded-[18px] bg-linear-to-br from-[#1b7ce3] to-[#1262bd] p-3.5 text-white sm:p-4 md:col-span-4 shadow-[0_4px_0_#08366b]"
      >
        <DownloadSpotlightBackdrop />

        {/* Left-aligned clean text content */}
        <div className="relative z-10 flex max-w-36 flex-col justify-between h-full py-0.5">
          <div>
            <div className="flex size-7 items-center justify-center rounded-lg bg-white/20 text-white shadow-xs">
              <AppleLogoIcon className="size-4 text-white" />
            </div>
            <h2
              id="download-heading"
              className="mt-2 font-display text-base leading-tight font-bold tracking-tight text-white"
            >
              Chordisol for iOS
            </h2>
            <p className="mt-0.5 text-[11px] font-medium text-white/80">
              Free on iPhone &amp; iPad
            </p>
          </div>

          <div className="pt-2.5">
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full bg-white px-3.5 text-xs font-bold text-[#1262bd] transition-[background-color,transform] duration-150 hover:bg-slate-50"
            >
              <span>App Store</span>
            </a>
          </div>
        </div>

        {/* Scalloped cloud backdrop placed behind mockup, most right & most bottom */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 -bottom-4 z-0 select-none"
        >
          <Image
            src="/images/mockup-cloud-backdrop.png"
            alt=""
            width={512}
            height={690}
            preload={true}
            className="w-38 sm:w-44 h-auto object-contain object-bottom-right"
          />
        </div>

        {/* Tilted iPhone mockup standing clearly on the right without overlapping the button */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-4 -bottom-24 z-10 w-26 sm:w-28 rotate-3 drop-shadow-[0_12px_24px_rgba(8,28,60,0.35)] select-none"
        >
          <Image
            src="/images/chordisol-iphone-mockup.png"
            alt=""
            width={250}
            height={512}
            preload={true}
            className="h-auto w-full object-contain"
          />
        </div>
      </section>
    </div>
  );
}

