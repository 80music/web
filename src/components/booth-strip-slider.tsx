"use client";

import Image from "next/image";
import React, { useEffect, useRef } from "react";
import {
  getPhotoCountForVariation,
  isTopLogoVariation,
  type LayoutVariationId,
} from "@/lib/booth-types";

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

interface BoothStripSliderProps {
  options: readonly StripSliderOption[];
  selectedId: LayoutVariationId;
  onSelect: (id: LayoutVariationId) => void;
}

export function BoothStripSlider({
  options,
  selectedId,
  onSelect,
}: BoothStripSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const programmaticUntilRef = useRef<number>(0);

  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.id === selectedId)
  );

  const scrollToIndex = (index: number, behavior: ScrollBehavior = "smooth") => {
    const track = trackRef.current;
    const item = itemRefs.current[index];
    if (!track || !item) return;

    programmaticUntilRef.current = Date.now() + 450;
    const targetLeft =
      item.offsetLeft - (track.clientWidth - item.clientWidth) / 2;
    track.scrollTo({ left: targetLeft, behavior });
  };

  // Center the initial selected strip on mount without jarring jump
  useEffect(() => {
    scrollToIndex(selectedIndex, "instant");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectIndex = (index: number) => {
    const bounded = Math.max(0, Math.min(options.length - 1, index));
    onSelect(options[bounded].id);
    scrollToIndex(bounded, "smooth");
  };

  const handleScroll = () => {
    if (Date.now() < programmaticUntilRef.current) return;

    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }

    scrollTimerRef.current = setTimeout(() => {
      const track = trackRef.current;
      if (!track) return;

      const trackCenter = track.scrollLeft + track.clientWidth / 2;
      let closestIdx = 0;
      let minDistance = Number.POSITIVE_INFINITY;

      itemRefs.current.forEach((el, idx) => {
        if (!el) return;
        const elCenter = el.offsetLeft + el.clientWidth / 2;
        const dist = Math.abs(trackCenter - elCenter);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = idx;
        }
      });

      const closestOption = options[closestIdx];
      if (closestOption && closestOption.id !== selectedId) {
        onSelect(closestOption.id);
      }
    }, 90);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      handleSelectIndex(selectedIndex + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      handleSelectIndex(selectedIndex - 1);
    }
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Photobooth strip layouts"
      className="relative rounded-3xl bg-surface-secondary py-7 sm:py-9 outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
    >
      {/* Subtle Edge Fades */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 sm:w-16 rounded-l-3xl bg-gradient-to-r from-surface-secondary to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 sm:w-16 rounded-r-3xl bg-gradient-to-l from-surface-secondary to-transparent"
      />

      {/* Previous Button */}
      <button
        type="button"
        aria-label="Previous strip"
        disabled={selectedIndex === 0}
        onClick={() => handleSelectIndex(selectedIndex - 1)}
        className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 size-10 items-center justify-center rounded-full bg-white text-fg-display shadow-[0_6px_18px_-4px_rgba(20,54,95,0.16)] border border-border-subtle transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
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
        onClick={() => handleSelectIndex(selectedIndex + 1)}
        className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 size-10 items-center justify-center rounded-full bg-white text-fg-display shadow-[0_6px_18px_-4px_rgba(20,54,95,0.16)] border border-border-subtle transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
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

      {/* Smooth Native Scroll-Snap Carousel Track */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex items-center gap-6 sm:gap-8 overflow-x-auto snap-x snap-mandatory scroll-smooth py-4 px-[calc(50%-86px)] sm:px-[calc(50%-98px)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {options.map((option, idx) => {
          const isSelected = option.id === selectedId;
          const photoCount = getPhotoCountForVariation(option.id);
          const isTopLogo = isTopLogoVariation(option.id);
          const frames = PREVIEW_SAMPLES.slice(0, photoCount);

          const brandBand = (
            <div className="h-[10%] shrink-0 flex items-center justify-center gap-1">
              <div className="relative size-3 shrink-0 overflow-hidden rounded-[3px]">
                <Image
                  src="/images/chordisol-logo.png"
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-display text-[9.5px] font-bold text-fg-display tracking-tight">
                Chordisol
              </span>
            </div>
          );

          return (
            <button
              key={option.id}
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              type="button"
              onClick={() => handleSelectIndex(idx)}
              className="group snap-center shrink-0 flex flex-col items-center focus-visible:outline-none cursor-pointer"
            >
              {/* 9:16 Physical Print Preview */}
              <div
                className={`relative select-none aspect-[9/16] w-[172px] sm:w-[196px] bg-white transition-[transform,opacity,box-shadow] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                  isSelected
                    ? "scale-100 opacity-100 ring-2 ring-brand-primary ring-offset-4 ring-offset-surface-secondary shadow-[0_24px_48px_-14px_rgba(20,54,95,0.24),0_4px_12px_rgba(20,54,95,0.08)]"
                    : "scale-[0.9] opacity-65 hover:opacity-95 shadow-[0_12px_26px_-12px_rgba(20,54,95,0.14)]"
                }`}
              >
                <div
                  className={`absolute inset-0 flex flex-col px-[6%] ${
                    isTopLogo ? "pt-0 pb-[6%]" : "pt-[6%] pb-0"
                  }`}
                >
                  {isTopLogo && brandBand}

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
                        className={`relative size-full overflow-hidden rounded-[2px] ring-1 ring-inset ring-black/5 ${frame.bg}`}
                      >
                        <div className="absolute inset-[22%]">
                          <Image
                            src={frame.src}
                            alt={frame.alt}
                            fill
                            sizes="110px"
                            className="object-contain"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {!isTopLogo && brandBand}
                </div>
              </div>

              {/* Clean Label Below Strip */}
              <span
                className={`mt-4 font-display text-sm font-semibold transition-colors duration-200 ${
                  isSelected ? "text-brand-primary" : "text-fg-display/70"
                }`}
              >
                {option.title}
              </span>
            </button>
          );
        })}
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
              onClick={() => handleSelectIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer ${
                isSelected ? "w-5 bg-brand-primary" : "w-1.5 bg-divider hover:bg-text-muted/50"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
