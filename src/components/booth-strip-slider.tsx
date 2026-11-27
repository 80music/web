"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  getPhotoCountForVariation,
  isTopLogoVariation,
  type FrameColorId,
  type LayoutVariationId,
} from "@/lib/booth-types";
import {
  StripBrandBand,
  StripPaperDecorations,
  getPhotoSlotRingClass,
  getStripPaddingXClass,
  getStripSurfaceStyle,
  getStripVerticalPaddingClass,
} from "@/components/photobooth-strip";

export interface StripSliderOption {
  id: LayoutVariationId;
  title: string;
  countLabel: string;
}

const PREVIEW_SAMPLES = [
  { src: "/images/mascots/mascot-radio.png", alt: "Studio sample 1", bg: "bg-[#eef4fb]" },
  { src: "/images/mascots/mascot-duo-1.png", alt: "Studio sample 2", bg: "bg-[#f3f6fa]" },
  { src: "/images/mascots/mascot-hill.png", alt: "Studio sample 3", bg: "bg-[#ebf2fa]" },
] as const;

const SPRING_SLIDE = {
  type: "spring" as const,
  stiffness: 260,
  damping: 32,
  mass: 0.9,
};

interface BoothStripSliderProps {
  options: readonly StripSliderOption[];
  selectedId: LayoutVariationId;
  frameColor?: FrameColorId;
  onSelect: (id: LayoutVariationId) => void;
}

export function BoothStripSlider({
  options,
  selectedId,
  frameColor = "classic-white",
  onSelect,
}: BoothStripSliderProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(true);
  const surfaceStyle = getStripSurfaceStyle(frameColor);
  const padXClass = getStripPaddingXClass(frameColor);
  const slotRingClass = getPhotoSlotRingClass(frameColor);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.id === selectedId)
  );

  const itemWidth = isDesktop ? 196 : 168;
  const itemGap = isDesktop ? 36 : 24;
  const stepSize = itemWidth + itemGap;

  const selectIndex = (nextIdx: number) => {
    const bounded = Math.max(0, Math.min(options.length - 1, nextIdx));
    if (bounded !== selectedIndex) {
      onSelect(options[bounded].id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      selectIndex(selectedIndex + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      selectIndex(selectedIndex - 1);
    }
  };

  const transition = shouldReduceMotion
    ? { duration: 0.16, ease: "easeOut" as const }
    : SPRING_SLIDE;

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Photobooth strip layouts"
      className="relative overflow-hidden rounded-3xl bg-[#f9fafc] border border-[#edf1f7] py-7 sm:py-9 outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 select-none"
    >
      {/* Soft Edge Fades */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 sm:w-20 bg-linear-to-r from-[#f9fafc] via-[#f9fafc]/70 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 sm:w-20 bg-linear-to-l from-[#f9fafc] via-[#f9fafc]/70 to-transparent"
      />

      {/* Previous Button */}
      <button
        type="button"
        aria-label="Previous strip"
        disabled={selectedIndex === 0}
        onClick={() => selectIndex(selectedIndex - 1)}
        className="flex absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 size-9 sm:size-10 items-center justify-center rounded-full bg-white text-fg-display shadow-[0_6px_18px_-4px_rgba(20,54,95,0.12)] border border-border-subtle/80 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
          aria-hidden="true"
        >
          <path d="M10 3.5L5.5 8 10 12.5" />
        </svg>
      </button>

      {/* Next Button */}
      <button
        type="button"
        aria-label="Next strip"
        disabled={selectedIndex === options.length - 1}
        onClick={() => selectIndex(selectedIndex + 1)}
        className="flex absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 size-9 sm:size-10 items-center justify-center rounded-full bg-white text-fg-display shadow-[0_6px_18px_-4px_rgba(20,54,95,0.12)] border border-border-subtle/80 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
          aria-hidden="true"
        >
          <path d="M6 3.5L10.5 8 6 12.5" />
        </svg>
      </button>

      {/* Spring-Physics Carousel Stage (Click / Arrow / Dot navigation — not swipeable) */}
      <div className="relative flex justify-center py-4">
        <motion.div
          animate={{
            x: ((options.length - 1) / 2 - selectedIndex) * stepSize,
          }}
          transition={transition}
          style={{ gap: `${itemGap}px` }}
          className="flex items-center"
        >
          {options.map((option, idx) => {
            const isSelected = option.id === selectedId;
            const distance = Math.abs(idx - selectedIndex);
            const photoCount = getPhotoCountForVariation(option.id);
            const isTopLogo = isTopLogoVariation(option.id);
            const frames = PREVIEW_SAMPLES.slice(0, photoCount);

            return (
              <motion.button
                key={option.id}
                type="button"
                onClick={() => selectIndex(idx)}
                style={{ width: `${itemWidth}px` }}
                animate={{
                  scale: isSelected ? 1 : distance === 1 ? 0.9 : 0.84,
                  opacity: isSelected ? 1 : distance === 1 ? 0.62 : 0.36,
                  y: isSelected ? -4 : 2,
                }}
                whileHover={isSelected ? undefined : { opacity: 0.88, scale: 0.93 }}
                transition={transition}
                className="relative shrink-0 flex flex-col items-center focus-visible:outline-none cursor-pointer"
              >
                {/* Clean 9:16 Physical Print Card (Themed with active strip style) */}
                <div
                  style={surfaceStyle}
                  className={`relative w-full aspect-9/16 transition-[box-shadow,background-color] duration-300 ${
                    isSelected
                      ? "shadow-[0_0_0_1px_rgba(20,54,95,0.045),0_4px_10px_-4px_rgba(20,54,95,0.05),0_18px_34px_-18px_rgba(20,54,95,0.11)]"
                      : "shadow-[0_0_0_1px_rgba(20,54,95,0.035),0_6px_16px_-10px_rgba(20,54,95,0.06)]"
                  }`}
                >
                  <StripPaperDecorations frameColor={frameColor} isTopLogo={isTopLogo} />

                  <div
                    className={`absolute inset-0 z-10 flex flex-col ${padXClass} ${getStripVerticalPaddingClass(
                      frameColor,
                      isTopLogo
                    )}`}
                  >
                    {isTopLogo && (
                      <StripBrandBand frameColor={frameColor} isTopLogo={true} compact />
                    )}

                    <div
                      className={`flex-1 min-h-0 grid gap-1.5 ${
                        photoCount === 1
                          ? "grid-rows-1"
                          : photoCount === 2
                          ? "grid-rows-2"
                          : "grid-rows-3"
                      }`}
                    >
                      {frames.map((frame, i) => (
                        <div
                          key={i}
                          className={`relative size-full overflow-hidden ${slotRingClass} ${frame.bg}`}
                        >
                          <div className="absolute inset-[22%]">
                            <Image
                              src={frame.src}
                              alt={frame.alt}
                              fill
                              sizes="110px"
                              className="object-contain pointer-events-none"
                              draggable={false}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {!isTopLogo && (
                      <StripBrandBand frameColor={frameColor} isTopLogo={false} compact />
                    )}
                  </div>
                </div>

                {/* Clean Label Below Strip */}
                <span
                  className={`mt-4 font-display text-sm font-semibold transition-colors duration-200 ${
                    isSelected ? "text-fg-display" : "text-fg-display/50"
                  }`}
                >
                  {option.title}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Minimal Pill Pagination Dots */}
      <div className="mt-3 flex items-center justify-center gap-1.5" aria-hidden="true">
        {options.map((option, idx) => {
          const isSelected = option.id === selectedId;
          return (
            <button
              key={option.id}
              type="button"
              tabIndex={-1}
              onClick={() => selectIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer ${
                isSelected ? "w-5 bg-fg-display" : "w-1.5 bg-divider hover:bg-text-muted/50"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
