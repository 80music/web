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
    updates: Partial<
      Pick<StickerItem, "xPercent" | "yPercent" | "widthPercent" | "rotationDeg" | "zIndex">
    >
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
      const { mode, id, initialX, initialY, initialWidth, startPointerX, startPointerY } =
        activeDrag;

      if (mode === "move") {
        const deltaXPercent = ((e.clientX - startPointerX) / rect.width) * 100;
        const deltaYPercent = ((e.clientY - startPointerY) / rect.height) * 100;
        const newX = Math.max(6, Math.min(94, initialX + deltaXPercent));
        const newY = Math.max(5, Math.min(95, initialY + deltaYPercent));
        onUpdateSticker(id, {
          xPercent: Math.round(newX * 10) / 10,
          yPercent: Math.round(newY * 10) / 10,
        });
      } else if (mode === "rotate") {
        const stickerX = rect.left + (initialX / 100) * rect.width;
        const stickerY = rect.top + (initialY / 100) * rect.height;
        const rad = Math.atan2(e.clientY - stickerY, e.clientX - stickerX);
        const deg = Math.round((rad * 180) / Math.PI) + 135;
        onUpdateSticker(id, { rotationDeg: deg });
      } else if (mode === "scale") {
        const deltaPixels = e.clientX - startPointerX;
        const deltaPercent = (deltaPixels / rect.width) * 100;
        const newWidth = Math.max(12, Math.min(58, initialWidth + deltaPercent));
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

  const slotIndices = layoutVariation === "variation-2" ? [0, 1] : [0, 1, 2];
  const isTwoSlot = layoutVariation === "variation-2";
  const isTopHeader = layoutVariation === "variation-3";

  return (
    <div
      ref={stripRef}
      id="photobooth-strip-dom"
      onClick={(e) => {
        e.stopPropagation();
        onSelectSticker?.(null);
      }}
      className={`relative mx-auto flex select-none flex-col w-[276px] sm:w-[292px] rounded-[6px] border border-border-subtle bg-white p-3.5 shadow-[0_20px_48px_-14px_rgba(20,54,95,0.18),0_2px_8px_rgba(20,54,95,0.06)] justify-between ${className}`}
    >
      {/* 1. Header Row */}
      {isTopHeader ? (
        <div className="flex flex-col items-center justify-center text-center pb-2.5 border-b border-border-subtle/70">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="relative size-4.5 shrink-0 overflow-hidden rounded-[4px]">
              <Image
                src="/images/chordisol-logo.png"
                alt="Chordisol"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="font-display text-[11px] font-bold tracking-tight text-fg-display">
              Chordisol
            </span>
          </div>
          <p className="font-display text-xs font-semibold tracking-tight text-fg-display truncate max-w-full px-1">
            {caption || "Acoustic Session • Chordisol Studio"}
          </p>
          {showDate && dateText && (
            <p className="mt-0.5 font-mono text-[9px] text-text-muted tabular-nums">
              {dateText}
            </p>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative size-5.5 shrink-0 overflow-hidden rounded-[5px]">
              <Image
                src="/images/chordisol-logo.png"
                alt="Chordisol"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="font-display text-xs leading-none font-bold tracking-tight text-fg-display truncate">
              Chordisol
            </span>
          </div>

          <span className="font-mono text-[9px] font-medium text-text-muted shrink-0">
            {isTwoSlot ? "2-cut" : "3-cut"}
          </span>
        </div>
      )}

      {/* 2. Photo Slots */}
      <div className="flex flex-col gap-2 my-1.5 flex-1 justify-center">
        {slotIndices.map((index) => {
          const photoUrl = photos[index];

          return (
            <div
              key={index}
              className={`group relative w-full overflow-hidden rounded-[3px] bg-surface-secondary ring-1 ring-inset ring-black/6 ${
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

                  {/* Retake Button on Hover */}
                  {onRetakeSlot && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRetakeSlot(index);
                      }}
                      className="absolute right-2 top-2 z-20 hidden items-center gap-1 rounded-full bg-fg-display/90 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm transition-transform duration-150 hover:bg-fg-display active:scale-95 group-hover:flex cursor-pointer"
                    >
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="size-2.5"
                        aria-hidden="true"
                      >
                        <path d="M2.5 8a5.5 5.5 0 1 1 1.2 3.4M2.5 12V8h4" />
                      </svg>
                      <span>Retake</span>
                    </button>
                  )}
                </>
              ) : (
                <div className="flex size-full items-center justify-center bg-surface-secondary">
                  <span className="font-mono text-xs font-medium text-text-muted/60">
                    0{index + 1}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Footer Section */}
      {isTopHeader ? (
        <div className="pt-2 border-t border-border-subtle/70 flex justify-center">
          <div
            aria-hidden="true"
            className="flex h-2.5 w-24 items-center justify-center gap-0.5 opacity-35 text-fg-display"
          >
            {[3, 1.5, 4, 1.5, 5, 2, 1.5, 4, 2, 3, 1.5, 5, 2, 4, 1.5].map((w, i) => (
              <span key={i} style={{ width: `${w}px` }} className="h-full bg-current" />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center pt-2 border-t border-border-subtle/70">
          <p className="font-display text-xs font-semibold tracking-tight text-fg-display truncate px-1">
            {caption || "Acoustic Session • Chordisol Studio"}
          </p>

          {showDate && dateText && (
            <p className="mt-0.5 font-mono text-[9px] text-text-muted tabular-nums">
              {dateText}
            </p>
          )}

          <div
            aria-hidden="true"
            className="mx-auto mt-2 flex h-2 w-28 items-center justify-center gap-0.5 opacity-35 text-fg-display"
          >
            {[3, 1.5, 4, 1.5, 5, 2, 1.5, 4, 2, 3, 1.5, 5, 2, 4, 1.5].map((w, i) => (
              <span key={i} style={{ width: `${w}px` }} className="h-full bg-current" />
            ))}
          </div>
        </div>
      )}

      {/* 4. Interactive Sticker Layer (overflow-visible so edge handles never clip) */}
      {stickersVisible && stickers.length > 0 && (
        <div className="pointer-events-none absolute inset-0 z-30 overflow-visible">
          {stickers.map((sticker) => {
            const isSelected = selectedStickerId === sticker.id;

            return (
              <div
                key={sticker.id}
                onPointerDown={(e) => handleStickerPointerDown(e, sticker)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  left: `${sticker.xPercent}%`,
                  top: `${sticker.yPercent}%`,
                  width: `${sticker.widthPercent}%`,
                  transform: `translate(-50%, -50%) rotate(${sticker.rotationDeg}deg)`,
                  zIndex: sticker.zIndex,
                  touchAction: "none",
                }}
                className={`pointer-events-auto absolute cursor-grab select-none active:cursor-grabbing touch-none ${
                  isSelected
                    ? "outline-2 outline-dashed outline-brand-primary outline-offset-3 rounded-lg"
                    : "hover:outline-1 hover:outline-brand-primary/50 hover:outline-offset-2 rounded-lg"
                }`}
              >
                <div className="relative aspect-square w-full pointer-events-none select-none">
                  <Image
                    src={sticker.src}
                    alt={sticker.name}
                    fill
                    sizes="(max-width: 640px) 120px, 160px"
                    className="pointer-events-none object-contain drop-shadow-[0_3px_6px_rgba(20,54,95,0.16)]"
                    draggable={false}
                  />
                </div>

                {/* Corner Controls when selected */}
                {isSelected && (
                  <>
                    {/* Top-Left: Rotate */}
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
                      aria-label="Rotate sticker"
                      title="Drag to rotate"
                      className="absolute -top-3.5 -left-3.5 size-7 rounded-full bg-fg-display text-white shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing border-2 border-white hover:scale-105 transition-transform"
                    >
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="size-3.5"
                        aria-hidden="true"
                      >
                        <path
                          d="M2.5 8a5.5 5.5 0 0 1 9.4-3.9M13.5 8a5.5 5.5 0 0 1-9.4 3.9"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12 2v3h-3M4 14v-3h3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    {/* Top-Right: Delete */}
                    {onDeleteSticker && (
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSticker(sticker.id);
                        }}
                        aria-label="Delete sticker"
                        title="Remove sticker"
                        className="absolute -top-3.5 -right-3.5 size-7 rounded-full bg-white text-fg-display shadow-md flex items-center justify-center cursor-pointer border border-border-subtle hover:bg-surface-secondary hover:scale-105 transition-transform"
                      >
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.2}
                          className="size-3.5"
                          aria-hidden="true"
                        >
                          <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}

                    {/* Bottom-Right: Resize */}
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
                      aria-label="Resize sticker"
                      title="Drag to resize"
                      className="absolute -bottom-3.5 -right-3.5 size-7 rounded-full bg-brand-primary text-white shadow-md flex items-center justify-center cursor-nwse-resize border-2 border-white hover:scale-105 transition-transform"
                    >
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="size-3.5"
                        aria-hidden="true"
                      >
                        <path
                          d="M10 2.5h3.5V6M6 13.5H2.5V10M13.5 2.5L9 7M2.5 13.5L7 9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
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
