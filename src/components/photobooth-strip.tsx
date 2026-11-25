"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  PHOTO_FILTERS,
  type FrameColorId,
  type PhotoFilterId,
  type LayoutVariationId,
  type StickerItem,
} from "@/lib/booth-types";

const POSE_SUGGESTIONS = [
  "Pose 1 • Acoustic Smile",
  "Pose 2 • Fingers on Keys",
  "Pose 3 • Listening Ear",
  "Pose 4 • Free & Groove",
];

interface PhotoboothStripProps {
  photos: (string | null)[];
  frameColor?: FrameColorId;
  layoutVariation?: LayoutVariationId;
  filter?: PhotoFilterId;
  stickers?: StickerItem[];
  stickersVisible?: boolean;
  caption?: string;
  showDate?: boolean;
  dateText?: string;
  selectedStickerId?: string | null;
  onSelectSticker?: (id: string | null) => void;
  onUpdateSticker?: (
    id: string,
    updates: Partial<Pick<StickerItem, "xPercent" | "yPercent" | "widthPercent" | "rotationDeg" | "zIndex">>
  ) => void;
  onDeleteSticker?: (id: string) => void;
  onRetakeSlot?: (slotIndex: number) => void;
  className?: string;
}

export function PhotoboothStrip({
  photos,
  layoutVariation = "variation-1",
  filter = "normal",
  stickers = [],
  stickersVisible = true,
  caption = "Acoustic Session • Chordisol Studio",
  showDate = true,
  dateText = "",
  selectedStickerId = null,
  onSelectSticker,
  onUpdateSticker,
  onDeleteSticker,
  onRetakeSlot,
  className = "",
}: PhotoboothStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const activeFilter = PHOTO_FILTERS.find((f) => f.id === filter) || PHOTO_FILTERS[0];

  // Dragging state for stickers
  const [activeDrag, setActiveDrag] = useState<{
    id: string;
    mode: "move" | "rotate" | "scale";
    startPointerX: number;
    startPointerY: number;
    initialX: number;
    initialY: number;
    initialWidth: number;
  } | null>(null);

  const handleStickerPointerDown = useCallback(
    (e: React.PointerEvent, sticker: StickerItem) => {
      e.stopPropagation();
      if (onSelectSticker && onUpdateSticker) {
        const maxZ = stickers.reduce((max, s) => Math.max(max, s.zIndex), 1);
        onUpdateSticker(sticker.id, { zIndex: maxZ + 1 });
        onSelectSticker(sticker.id);
      }
      setActiveDrag({
        id: sticker.id,
        mode: "move",
        startPointerX: e.clientX,
        startPointerY: e.clientY,
        initialX: sticker.xPercent,
        initialY: sticker.yPercent,
        initialWidth: sticker.widthPercent,
      });
    },
    [stickers, onSelectSticker, onUpdateSticker]
  );

  useEffect(() => {
    if (!activeDrag || !onUpdateSticker) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!stripRef.current || !activeDrag) return;
      const rect = stripRef.current.getBoundingClientRect();
      const { mode, id, initialX, initialY, initialWidth, startPointerX, startPointerY } = activeDrag;

      if (mode === "move") {
        const deltaXPercent = ((e.clientX - startPointerX) / rect.width) * 100;
        const deltaYPercent = ((e.clientY - startPointerY) / rect.height) * 100;
        const newX = Math.max(2, Math.min(98, initialX + deltaXPercent));
        const newY = Math.max(2, Math.min(98, initialY + deltaYPercent));
        onUpdateSticker(id, {
          xPercent: Math.round(newX * 10) / 10,
          yPercent: Math.round(newY * 10) / 10,
        });
      } else if (mode === "rotate") {
        const stickerX = rect.left + (initialX / 100) * rect.width;
        const stickerY = rect.top + (initialY / 100) * rect.height;
        const rad = Math.atan2(e.clientY - stickerY, e.clientX - stickerX);
        const deg = Math.round((rad * 180) / Math.PI);
        onUpdateSticker(id, { rotationDeg: deg });
      } else if (mode === "scale") {
        const deltaPixels = e.clientX - startPointerX;
        const deltaPercent = (deltaPixels / rect.width) * 100;
        const newWidth = Math.max(10, Math.min(60, initialWidth + deltaPercent));
        onUpdateSticker(id, { widthPercent: Math.round(newWidth * 10) / 10 });
      }
    };

    const handlePointerUp = () => {
      setActiveDrag(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [activeDrag, onUpdateSticker]);

  // Determine slot indices based on variation (matching Sketch 1)
  const slotIndices =
    layoutVariation === "variation-2"
      ? [0, 1] // 2 photos for Variation 2
      : [0, 1, 2]; // 3 photos for Variation 1 & 3

  return (
    <div
      ref={stripRef}
      id="photobooth-strip-dom"
      onClick={() => onSelectSticker?.(null)}
      className={`relative mx-auto flex select-none flex-col w-[280px] sm:w-[300px] rounded-2xl border-2 border-slate-900/10 bg-white p-3 sm:p-3.5 shadow-[0_20px_50px_-10px_rgba(15,23,42,0.18),0_4px_16px_-4px_rgba(15,23,42,0.08)] transition-colors duration-200 justify-between ${className}`}
    >
      {/* 1. Header Row based on layoutVariation */}
      {layoutVariation === "variation-3" ? (
        /* Variation 3: Caption at the TOP (matching Sketch 1) */
        <div className="flex flex-col items-center justify-center text-center py-1 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="relative size-6 shrink-0 overflow-hidden rounded-md shadow-2xs">
              <Image
                src="/images/chordisol-logo.png"
                alt="Chordisol"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="font-display text-xs font-black tracking-tight text-slate-900">
              CHORDISOL
            </span>
          </div>
          <p className="font-display text-xs sm:text-[13px] font-bold tracking-tight text-slate-900 truncate px-1">
            {caption || "Acoustic Session • Chordisol Studio"}
          </p>
          {showDate && dateText && (
            <p className="mt-0.5 font-sans text-[9px] font-semibold tracking-wide text-slate-500">
              {dateText}
            </p>
          )}
        </div>
      ) : (
        /* Variation 1 & Variation 2: Clean top brand header (matching Sketch 1) */
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative size-7 shrink-0 overflow-hidden rounded-md shadow-xs">
              <Image
                src="/images/chordisol-logo.png"
                alt="Chordisol"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-sm leading-none font-black tracking-tight text-slate-900 truncate">
                CHORDISOL
              </h2>
              <p className="font-sans text-[9px] leading-tight font-bold tracking-wider uppercase text-slate-500 truncate mt-0.5">
                Acoustic Studio
              </p>
            </div>
          </div>

          <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[9px] font-bold tracking-tight text-slate-700 border border-slate-200 shrink-0">
            {layoutVariation === "variation-2" ? "2-SHOT" : "3-SHOT"}
          </span>
        </div>
      )}

      {/* 2. Photo Slots (Matching Sketch 1 & 2) */}
      <div className="flex flex-col gap-2 my-2 flex-1 justify-center">
        {slotIndices.map((index) => {
          const photoUrl = photos[index];
          const isTwoSlot = layoutVariation === "variation-2";

          return (
            <div
              key={index}
              className={`group relative w-full overflow-hidden rounded-xl border border-slate-900/10 bg-slate-100/60 ${
                isTwoSlot ? "aspect-[4/3.2]" : "aspect-4/3"
              }`}
            >
              {photoUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl}
                    alt={`Photobooth shot ${index + 1}`}
                    style={{ filter: activeFilter?.css || "none" }}
                    className="size-full object-cover"
                  />

                  {/* Retake Slot Button on Hover */}
                  {onRetakeSlot && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRetakeSlot(index);
                      }}
                      className="absolute right-1.5 top-1.5 z-20 hidden items-center gap-1 rounded-full bg-slate-900/85 px-2 py-0.5 text-[10px] font-bold text-white shadow-md backdrop-blur-md transition-transform duration-150 hover:bg-slate-900 active:scale-95 group-hover:flex cursor-pointer"
                    >
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="size-2.5"
                      >
                        <path d="M2.5 8a5.5 5.5 0 1 1 1.2 3.4M2.5 12V8h4" />
                      </svg>
                      <span>Retake</span>
                    </button>
                  )}
                </>
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-1 p-2 text-slate-400 bg-slate-50">
                  <div className="flex size-7 items-center justify-center rounded-full border border-dashed border-slate-300 bg-white shadow-2xs">
                    <span className="font-display text-xs font-black text-slate-700">
                      {index + 1}
                    </span>
                  </div>
                  <span className="font-sans text-[10px] font-bold tracking-tight text-slate-500 text-center">
                    {POSE_SUGGESTIONS[index]}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Footer Section based on layoutVariation */}
      {layoutVariation === "variation-3" ? (
        /* Variation 3: Minimal barcode footer on bottom (caption is at the top) */
        <div className="text-center pt-1 border-t border-slate-100">
          <div
            aria-hidden="true"
            className="mx-auto flex h-2 w-28 items-center justify-center gap-0.5 opacity-40 text-slate-700"
          >
            {[4, 2, 5, 2, 6, 3, 2, 5, 3, 4, 2, 6, 3, 5, 2].map((w, i) => (
              <span
                key={i}
                style={{ width: `${w}px` }}
                className="h-full bg-current rounded-[0.5px]"
              />
            ))}
          </div>
        </div>
      ) : (
        /* Variation 1 & 2: Caption at the BOTTOM (matching Sketch 1) */
        <div className="text-center pt-1 border-t border-slate-100">
          <p className="font-display text-xs sm:text-[13px] font-bold tracking-tight text-slate-900 truncate px-1">
            {caption || "Acoustic Session • Chordisol Studio"}
          </p>

          {showDate && dateText && (
            <p className="mt-0.5 font-sans text-[9.5px] font-semibold tracking-wide text-slate-500">
              {dateText}
            </p>
          )}

          {/* Retro Barcode Strip */}
          <div
            aria-hidden="true"
            className="mx-auto mt-2 flex h-2 w-32 items-center justify-center gap-0.5 opacity-40 text-slate-700"
          >
            {[4, 2, 5, 2, 6, 3, 2, 5, 3, 4, 2, 6, 3, 5, 2].map((w, i) => (
              <span
                key={i}
                style={{ width: `${w}px` }}
                className="h-full bg-current rounded-[0.5px]"
              />
            ))}
          </div>
        </div>
      )}

      {/* 4. Interactive Sticker Layer */}
      {stickersVisible && stickers.length > 0 && (
        <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-2xl">
          {stickers.map((sticker) => {
            const isSelected = selectedStickerId === sticker.id;

            return (
              <div
                key={sticker.id}
                onPointerDown={(e) => handleStickerPointerDown(e, sticker)}
                style={{
                  left: `${sticker.xPercent}%`,
                  top: `${sticker.yPercent}%`,
                  width: `${sticker.widthPercent}%`,
                  transform: `translate(-50%, -50%) rotate(${sticker.rotationDeg}deg)`,
                  zIndex: sticker.zIndex,
                  touchAction: "none",
                }}
                className={`pointer-events-auto absolute cursor-grab select-none active:cursor-grabbing touch-none transition-[shadow,transform] duration-75 ${
                  isSelected
                    ? "ring-2 ring-brand-primary ring-offset-2 ring-offset-white rounded-xl shadow-xl"
                    : "hover:scale-105"
                }`}
              >
                <div className="relative aspect-square w-full pointer-events-none select-none">
                  <Image
                    src={sticker.src}
                    alt={sticker.name}
                    fill
                    sizes="(max-width: 640px) 120px, 160px"
                    className="pointer-events-none object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.2)]"
                    draggable={false}
                  />
                </div>

                {/* Corner Controls (Visible when sticker is selected) */}
                {isSelected && (
                  <>
                    {/* Top-Left: Rotate Handle */}
                    <button
                      type="button"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setActiveDrag({
                          id: sticker.id,
                          mode: "rotate",
                          startPointerX: e.clientX,
                          startPointerY: e.clientY,
                          initialX: sticker.xPercent,
                          initialY: sticker.yPercent,
                          initialWidth: sticker.widthPercent,
                        });
                      }}
                      title="Drag to Rotate"
                      className="absolute -top-3.5 -left-3.5 size-7 rounded-full bg-slate-900 text-white shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing text-xs font-bold border border-white/40 hover:scale-110 active:scale-95 transition-transform"
                    >
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.2} className="size-3.5">
                        <path d="M2.5 8a5.5 5.5 0 0 1 9.4-3.9M13.5 8a5.5 5.5 0 0 1-9.4 3.9" strokeLinecap="round" />
                        <path d="M12 2v3h-3M4 14v-3h3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    {/* Top-Right: Delete Button */}
                    {onDeleteSticker && (
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSticker(sticker.id);
                        }}
                        title="Delete Sticker"
                        className="absolute -top-3.5 -right-3.5 size-7 rounded-full bg-rose-600 text-white shadow-lg flex items-center justify-center cursor-pointer text-xs font-bold border border-white/40 hover:bg-rose-700 hover:scale-110 active:scale-95 transition-transform"
                      >
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.5} className="size-3.5">
                          <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}

                    {/* Bottom-Right: Scale / Resize Handle */}
                    <button
                      type="button"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setActiveDrag({
                          id: sticker.id,
                          mode: "scale",
                          startPointerX: e.clientX,
                          startPointerY: e.clientY,
                          initialX: sticker.xPercent,
                          initialY: sticker.yPercent,
                          initialWidth: sticker.widthPercent,
                        });
                      }}
                      title="Drag to Resize"
                      className="absolute -bottom-3.5 -right-3.5 size-7 rounded-full bg-brand-primary text-white shadow-lg flex items-center justify-center cursor-nwse-resize active:scale-95 text-xs font-bold border border-white/40 hover:bg-[#1a82f0] hover:scale-110 transition-transform"
                    >
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.2} className="size-3.5">
                        <path d="M10 2h4v4M6 14H2v-4M14 2L9 7M2 14l5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
