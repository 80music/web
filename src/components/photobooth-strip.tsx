"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FRAME_PRESETS,
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
  frameColor: FrameColorId;
  layoutVariation?: LayoutVariationId;
  filter: PhotoFilterId;
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
  frameColor,
  layoutVariation = "classic-top",
  filter,
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
  const frame = FRAME_PRESETS.find((f) => f.id === frameColor) || FRAME_PRESETS[0];
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

  const handleStickerTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent, id: string) => {
      e.stopPropagation();
      if (!onSelectSticker || !onUpdateSticker) return;
      const maxZ = stickers.reduce((max, s) => Math.max(max, s.zIndex), 1);
      onUpdateSticker(id, { zIndex: maxZ + 1 });
      onSelectSticker(id);
    },
    [stickers, onUpdateSticker, onSelectSticker]
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
        const newX = Math.max(4, Math.min(96, initialX + deltaXPercent));
        const newY = Math.max(4, Math.min(96, initialY + deltaYPercent));
        onUpdateSticker(id, { xPercent: newX, yPercent: newY });
      } else if (mode === "rotate") {
        const stickerX = rect.left + (initialX / 100) * rect.width;
        const stickerY = rect.top + (initialY / 100) * rect.height;
        const rad = Math.atan2(e.clientY - stickerY, e.clientX - stickerX);
        const deg = Math.round((rad * 180) / Math.PI);
        onUpdateSticker(id, { rotationDeg: deg });
      } else if (mode === "scale") {
        const deltaPixels = e.clientX - startPointerX;
        const deltaPercent = (deltaPixels / rect.width) * 100;
        const newWidth = Math.max(12, Math.min(52, initialWidth + deltaPercent));
        onUpdateSticker(id, { widthPercent: newWidth });
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

  return (
    <div
      ref={stripRef}
      id="photobooth-strip-dom"
      onClick={() => onSelectSticker?.(null)}
      style={{
        backgroundColor: frame.bg,
        borderColor: frame.border,
      }}
      className={`relative mx-auto flex select-none flex-col w-[280px] sm:w-[300px] rounded-2xl border-2 p-3 sm:p-3.5 shadow-[0_20px_50px_-10px_rgba(15,23,42,0.18),0_4px_16px_-4px_rgba(15,23,42,0.08)] transition-colors duration-200 justify-between ${className}`}
    >
      {/* 1. Header Row based on layoutVariation */}
      {layoutVariation === "centered-minimal" ? (
        <div className="flex flex-col items-center justify-center text-center py-1">
          <div className="relative size-7 shrink-0 overflow-hidden rounded-md shadow-xs mb-1">
            <Image
              src="/images/chordisol-logo.png"
              alt="Chordisol"
              fill
              className="object-cover"
              priority
            />
          </div>
          <h2
            style={{ color: frame.textColor }}
            className="font-display text-sm leading-none font-black tracking-tight"
          >
            CHORDISOL
          </h2>
          <p
            style={{ color: frame.subtextColor }}
            className="font-sans text-[9px] leading-tight font-bold tracking-widest uppercase mt-0.5 opacity-80"
          >
            Acoustic Studio
          </p>
        </div>
      ) : layoutVariation === "bottom-signature" ? (
        <div className="flex items-center justify-between py-1">
          <span
            style={{
              backgroundColor: frame.photoBorder,
              color: frame.textColor,
            }}
            className="rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold tracking-tight opacity-90"
          >
            CHORDISOL ACOUSTIC • NO. 04
          </span>
          <span
            style={{ color: frame.subtextColor }}
            className="font-mono text-[9px] font-bold opacity-80"
          >
            4-CUT
          </span>
        </div>
      ) : layoutVariation === "retro-studio" ? (
        <div className="flex flex-col items-center justify-center text-center border-b border-dashed border-current/20 pb-1.5 pt-0.5">
          <div className="flex items-center gap-1.5">
            <span style={{ color: frame.subtextColor }} className="text-xs">★</span>
            <h2
              style={{ color: frame.textColor }}
              className="font-display text-sm leading-none font-black tracking-widest uppercase"
            >
              CHORDISOL
            </h2>
            <span style={{ color: frame.subtextColor }} className="text-xs">★</span>
          </div>
          <p
            style={{ color: frame.subtextColor }}
            className="font-sans text-[8.5px] leading-tight font-bold tracking-widest uppercase mt-0.5 opacity-75"
          >
            Session Archive • 35mm
          </p>
        </div>
      ) : (
        /* classic-top */
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
              <h2
                style={{ color: frame.textColor }}
                className="font-display text-sm leading-none font-black tracking-tight truncate"
              >
                CHORDISOL
              </h2>
              <p
                style={{ color: frame.subtextColor }}
                className="font-sans text-[9px] leading-tight font-bold tracking-wider uppercase truncate mt-0.5 opacity-80"
              >
                Acoustic Photobooth
              </p>
            </div>
          </div>

          <span
            style={{
              backgroundColor: frame.photoBorder,
              color: frame.textColor,
            }}
            className="rounded-full px-2 py-0.5 font-mono text-[9px] font-bold tracking-tight opacity-90 shrink-0"
          >
            4-CUT
          </span>
        </div>
      )}

      {/* 2. Four Photo Slots (4:3 aspect ratio each) */}
      <div className="flex flex-col gap-2 my-2 flex-1 justify-center">
        {[0, 1, 2, 3].map((index) => {
          const photoUrl = photos[index];
          return (
            <div
              key={index}
              style={{ borderColor: frame.photoBorder }}
              className="group relative aspect-4/3 w-full overflow-hidden rounded-xl border border-black/10 bg-black/[0.03]"
            >
              {photoUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl}
                    alt={`Photobooth shot ${index + 1}`}
                    style={{ filter: activeFilter.css }}
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
                <div
                  style={{ color: frame.subtextColor }}
                  className="flex size-full flex-col items-center justify-center gap-1 p-2 bg-black/[0.02]"
                >
                  <div className="flex size-7 items-center justify-center rounded-full border border-dashed border-current/60 bg-white/50 shadow-2xs">
                    <span className="font-display text-xs font-black text-current">
                      {index + 1}
                    </span>
                  </div>
                  <span className="font-sans text-[10px] font-bold tracking-tight opacity-75 text-center">
                    {POSE_SUGGESTIONS[index]}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Footer Section based on layoutVariation */}
      {layoutVariation === "bottom-signature" ? (
        <div className="flex items-center justify-between pt-1 border-t border-current/10">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative size-6 shrink-0 overflow-hidden rounded-md shadow-2xs">
              <Image
                src="/images/chordisol-logo.png"
                alt="Chordisol"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="min-w-0">
              <p style={{ color: frame.textColor }} className="font-display text-xs font-bold leading-tight truncate">
                CHORDISOL
              </p>
              <p style={{ color: frame.subtextColor }} className="font-sans text-[9px] font-semibold truncate opacity-80">
                {caption || "Acoustic Session"}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            {showDate && dateText && (
              <p style={{ color: frame.subtextColor }} className="font-sans text-[8.5px] font-medium opacity-80">
                {dateText}
              </p>
            )}
            <span
              style={{
                backgroundColor: frame.photoBorder,
                color: frame.textColor,
              }}
              className="inline-block mt-0.5 rounded-full px-1.5 py-0.2 font-mono text-[8px] font-bold"
            >
              4-CUT
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center pt-1">
          <p
            style={{ color: frame.textColor }}
            className="font-display text-xs sm:text-[13px] font-bold tracking-tight truncate px-1"
          >
            {caption || "Acoustic Session • Chordisol Studio"}
          </p>

          {showDate && dateText && (
            <p
              style={{ color: frame.subtextColor }}
              className="mt-0.5 font-sans text-[9.5px] font-semibold tracking-wide opacity-80"
            >
              {dateText}
            </p>
          )}

          {/* Retro Barcode Strip */}
          <div
            aria-hidden="true"
            style={{ color: frame.subtextColor }}
            className="mx-auto mt-2 flex h-2 w-32 items-center justify-center gap-0.5 opacity-60"
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
      {stickersVisible && (
        <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-2xl">
          {stickers.map((sticker) => {
            const isSelected = selectedStickerId === sticker.id;

            return (
              <div
                key={sticker.id}
                onClick={(e) => handleStickerTap(e, sticker.id)}
                style={{
                  left: `${sticker.xPercent}%`,
                  top: `${sticker.yPercent}%`,
                  width: `${sticker.widthPercent}%`,
                  transform: `translate(-50%, -50%) rotate(${sticker.rotationDeg}deg)`,
                  zIndex: sticker.zIndex,
                }}
                className={`pointer-events-auto absolute cursor-move select-none transition-shadow ${
                  isSelected
                    ? "ring-2 ring-brand-primary ring-offset-2 ring-offset-transparent rounded-lg"
                    : ""
                }`}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onSelectSticker?.(sticker.id);
                  setActiveDrag({
                    id: sticker.id,
                    mode: "move",
                    startPointerX: e.clientX,
                    startPointerY: e.clientY,
                    initialX: sticker.xPercent,
                    initialY: sticker.yPercent,
                    initialWidth: sticker.widthPercent,
                  });
                }}
              >
                {/* Sticker Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sticker.src}
                  alt={sticker.name}
                  draggable={false}
                  className="size-full object-contain pointer-events-none drop-shadow-[0_4px_10px_rgba(15,23,42,0.25)]"
                />

                {/* Transform Handles when selected */}
                {isSelected && (
                  <>
                    {/* Delete handle (top-left) */}
                    {onDeleteSticker && (
                      <button
                        type="button"
                        aria-label="Delete sticker"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSticker(sticker.id);
                        }}
                        className="absolute -top-2.5 -left-2.5 size-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md hover:bg-rose-600 active:scale-95 z-50 cursor-pointer"
                      >
                        ✕
                      </button>
                    )}

                    {/* Rotate handle (top-right) */}
                    <button
                      type="button"
                      aria-label="Rotate sticker"
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
                      className="absolute -top-2.5 -right-2.5 size-5 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px] font-bold shadow-md hover:bg-[#1674d6] active:scale-95 z-50 cursor-grab"
                    >
                      ↻
                    </button>

                    {/* Scale handle (bottom-right) */}
                    <button
                      type="button"
                      aria-label="Resize sticker"
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
                      className="absolute -bottom-2.5 -right-2.5 size-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold shadow-md hover:bg-emerald-600 active:scale-95 z-50 cursor-se-resize"
                    >
                      ⤡
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
