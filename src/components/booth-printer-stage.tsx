"use client";

import { motion, useReducedMotion } from "motion/react";
import React, { useEffect, useState } from "react";
import { PhotoboothStrip } from "@/components/photobooth-strip";
import type {
  LayoutVariationId,
  PhotoFilterId,
  StickerItem,
} from "@/lib/booth-types";

interface BoothPrinterStageProps {
  photos: (string | null)[];
  layoutVariation: LayoutVariationId;
  filter: PhotoFilterId;
  stickers: StickerItem[];
  runKey: number;
  onPrintComplete?: () => void;
}

type PrinterPhase = "warming" | "printing" | "cutting" | "ready";

export function BoothPrinterStage({
  photos,
  layoutVariation,
  filter,
  stickers,
  runKey,
  onPrintComplete,
}: BoothPrinterStageProps) {
  const shouldReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<PrinterPhase>(
    shouldReduceMotion ? "ready" : "warming"
  );
  const [progress, setProgress] = useState(shouldReduceMotion ? 100 : 8);

  useEffect(() => {
    if (shouldReduceMotion) {
      const doneTimer = setTimeout(() => {
        setPhase("ready");
        setProgress(100);
        onPrintComplete?.();
      }, 60);
      return () => clearTimeout(doneTimer);
    }

    const timers: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => {
        setPhase("warming");
        setProgress(10);
      }, 0),
      setTimeout(() => {
        setPhase("printing");
        setProgress(24);
      }, 360),
      setTimeout(() => setProgress(44), 740),
      setTimeout(() => setProgress(66), 1140),
      setTimeout(() => setProgress(86), 1560),
      setTimeout(() => setProgress(100), 1980),
      setTimeout(() => setPhase("cutting"), 2140),
      setTimeout(() => {
        setPhase("ready");
        onPrintComplete?.();
      }, 2560),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [runKey, shouldReduceMotion, onPrintComplete]);

  const isWorking = phase === "warming" || phase === "printing" || phase === "cutting";

  const statusLabel =
    phase === "warming"
      ? "WARMING"
      : phase === "printing"
      ? "PRINTING"
      : phase === "cutting"
      ? "CUTTING"
      : "READY";

  return (
    <div className="w-full max-w-[460px] rounded-2xl bg-surface-secondary pt-7 pb-10 px-4 sm:px-6 flex flex-col items-center">
      {/* =========================================================================
          3D PHYSICAL CHORDISOL PHOTO BOOTH PRINTER HEAD
         ========================================================================= */}
      <motion.div
        key={`chassis-${runKey}`}
        animate={
          shouldReduceMotion || !isWorking
            ? { x: 0, y: 0 }
            : phase === "cutting"
            ? { y: [0, 2, -0.5, 0], x: 0 }
            : {
                y: [0, 0.7, 0, -0.5, 0.6, 0],
                x: [0, -0.4, 0.4, -0.3, 0.3, 0],
              }
        }
        transition={
          phase === "cutting"
            ? { duration: 0.22, ease: "easeOut" }
            : { duration: 0.32, repeat: isWorking ? Infinity : 0, ease: "linear" }
        }
        className="relative z-20 w-[336px] sm:w-[376px] select-none"
      >
        {/* 1. Top 3D Sloped Matte Graphite Deck */}
        <div
          style={{
            clipPath: "polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)",
          }}
          className="h-7 w-full bg-gradient-to-b from-[#3d414a] via-[#2e323a] to-[#23262d] border-t border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]"
        >
          {/* Paper cartridge seam */}
          <div className="mx-auto mt-2.5 h-1 w-32 rounded-full bg-[#17191e]/85 shadow-[0_1px_0_rgba(255,255,255,0.08)]" />
        </div>

        {/* 2. Sculpted Front Matte Charcoal Chassis Faceplate */}
        <div className="relative rounded-b-[18px] rounded-t-[4px] bg-gradient-to-b from-[#282b32] via-[#1f2228] to-[#17191e] px-4 pt-3.5 pb-3 shadow-[0_18px_32px_-10px_rgba(15,17,22,0.45),0_3px_0_#111317,inset_0_1px_0_rgba(255,255,255,0.12)]">
          {/* Top Hardware Control Row */}
          <div className="flex items-center justify-between gap-3 mb-3">
            {/* Left: Embossed Brand Nameplate */}
            <div className="flex flex-col">
              <span className="font-display text-[11px] font-bold tracking-tight text-white/95 leading-none">
                Chordisol
              </span>
              <span className="font-mono text-[8px] text-[#8e95a3] mt-0.5 leading-none">
                STUDIO PRINT
              </span>
            </div>

            {/* Center: Recessed Mini OLED Display */}
            <div className="flex-1 max-w-[152px] rounded-[7px] bg-[#101216] border border-white/10 px-2.5 py-1.5 shadow-[inset_0_2px_5px_rgba(0,0,0,0.85)]">
              <div className="flex items-center justify-between gap-1.5 mb-1">
                <span className="font-mono text-[8.5px] font-semibold tracking-wider text-[#7ec3ff] leading-none">
                  {statusLabel}
                </span>
                <span className="font-mono text-[8.5px] text-white/65 tabular-nums leading-none">
                  {progress}%
                </span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-[#2391ff]"
                  initial={{ width: "8%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                />
              </div>
            </div>

            {/* Right: LED Indicator + Cooling Louvers */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center">
                <span
                  className={`size-2.5 rounded-full transition-colors duration-200 ${
                    phase === "ready"
                      ? "bg-[#60a5fa] shadow-[0_0_8px_#60a5fa]"
                      : phase === "cutting"
                      ? "bg-white shadow-[0_0_10px_#ffffff]"
                      : "bg-[#2391ff] shadow-[0_0_8px_#2391ff] animate-pulse"
                  }`}
                />
              </div>
              <div className="flex items-center gap-[3px]" aria-hidden="true">
                {[0, 1, 2, 3].map((slot) => (
                  <span
                    key={slot}
                    className="h-3.5 w-[2px] rounded-full bg-[#0e1014] shadow-[0_1px_0_rgba(255,255,255,0.1)]"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 3. Lower Recessed Metallic Paper Mouth & Roller */}
          <div className="relative rounded-full bg-[#111318] p-[3px] shadow-[inset_0_3px_6px_rgba(0,0,0,0.9),0_1px_0_rgba(255,255,255,0.1)]">
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-[#0b0d10]">
              {/* Brushed steel internal feed roller sheen */}
              <div
                aria-hidden="true"
                className="absolute inset-x-4 top-[3px] h-[2px] rounded-full bg-gradient-to-r from-transparent via-white/22 to-transparent"
              />

              {/* Cutter blade shimmer across slot during cutting phase */}
              {phase === "cutting" && !shouldReduceMotion && (
                <motion.div
                  aria-hidden="true"
                  initial={{ x: "-100%", opacity: 0.9 }}
                  animate={{ x: "100%", opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.32, ease: "easeInOut" }}
                  className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-[#7ec3ff] to-transparent"
                />
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* =========================================================================
          MASKED 3D PAPER CHUTE & STEPPED THERMAL FEED + GUILLOTINE DROP
         ========================================================================= */}
      <div
        style={{ perspective: "900px" }}
        className="relative -mt-2.5 pt-2.5 pb-7 px-6 overflow-hidden flex justify-center w-full"
      >
        {/* Deep ambient shadow cast from overhanging printer lip onto emerging paper */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 z-10 h-6 w-[288px] sm:w-[306px] bg-gradient-to-b from-[#111317]/32 via-[#111317]/10 to-transparent"
        />

        <motion.div
          key={`paper-${runKey}`}
          style={{ transformOrigin: "top center" }}
          initial={
            shouldReduceMotion
              ? { opacity: 0, y: 0 }
              : { y: "-104%", rotateX: 8, rotateZ: 0 }
          }
          animate={
            shouldReduceMotion
              ? { opacity: 1, y: 0 }
              : {
                  y: [
                    "-104%",
                    "-104%",
                    "-84%",
                    "-64%",
                    "-44%",
                    "-24%",
                    "-2%",
                    "0%",
                    "4.2%",
                    "3.2%",
                  ],
                  rotateX: [8, 8, 6, 4.5, 3, 1.5, 0.5, 0, 0, 0],
                  rotateZ: [0, 0, 0, 0, 0, 0, 0, 0, -0.65, 0],
                }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0.25 }
              : {
                  duration: 2.6,
                  times: [0, 0.14, 0.27, 0.41, 0.55, 0.69, 0.8, 0.85, 0.94, 1],
                  ease: [0.22, 1, 0.36, 1],
                }
          }
        >
          <PhotoboothStrip
            photos={photos}
            layoutVariation={layoutVariation}
            filter={filter}
            stickers={stickers}
            stickersVisible={true}
          />
        </motion.div>
      </div>
    </div>
  );
}
