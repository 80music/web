"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  PHOTO_FILTERS,
  getFramePreset,
  getPhotoCountForVariation,
  isTopLogoVariation,
  type FrameColorId,
  type PhotoFilterId,
  type LayoutVariationId,
  type StickerItem,
} from "@/lib/booth-types";

const SPROCKET_SLOTS = Array.from({ length: 12 }, (_, idx) => idx);
const PIANO_WHITE_KEYS = Array.from({ length: 12 }, (_, idx) => idx);
const CONCERT_DOTS = ["#2391ff", "#f59e0b", "#e11d48", "#16a34a"] as const;

export function getStripSurfaceStyle(frameColor: FrameColorId): React.CSSProperties {
  return {
    backgroundColor: getFramePreset(frameColor).bg,
  };
}

export function getStripPaddingXClass(frameColor: FrameColorId): string {
  return frameColor === "midnight-navy" ? "px-[10%]" : "px-[6%]";
}

export function getStripVerticalPaddingClass(
  frameColor: FrameColorId,
  isTopLogo: boolean
): string {
  if (frameColor === "chordisol-blue") {
    return isTopLogo ? "pt-0 pb-[8.2%]" : "pt-[8.2%] pb-0";
  }
  return isTopLogo ? "pt-0 pb-[6%]" : "pt-[6%] pb-0";
}

export function getPhotoSlotRingClass(frameColor: FrameColorId): string {
  if (frameColor === "chordisol-blue" || frameColor === "concert-stub") {
    return "rounded-[3px] ring-2 ring-white";
  }
  if (frameColor === "midnight-navy") {
    return "rounded-[2px] ring-1 ring-white/15";
  }
  if (frameColor === "warm-cream") {
    return "rounded-[2px] ring-1 ring-[#14365f]/12";
  }
  return "rounded-[2px] ring-1 ring-inset ring-black/5";
}

export function StripPaperDecorations({
  frameColor,
  isTopLogo,
}: {
  frameColor: FrameColorId;
  isTopLogo: boolean;
}) {
  if (frameColor === "classic-white") return null;

  if (frameColor === "chordisol-blue") {
    const pianoAtTop = !isTopLogo;
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Tall, bold piano keyboard opposite the logo */}
        <div
          className={`absolute inset-x-0 flex h-[5.6%] gap-[1.5px] bg-[#0d4a92] px-[1.5px] ${
            pianoAtTop ? "top-0 pb-[2px]" : "bottom-0 pt-[2px]"
          }`}
        >
          {PIANO_WHITE_KEYS.map((k) => (
            <div
              key={k}
              className={`relative flex-1 bg-white ${
                pianoAtTop ? "rounded-b-[2.5px]" : "rounded-t-[2.5px]"
              }`}
            >
              {k % 7 !== 2 && k % 7 !== 6 && k < PIANO_WHITE_KEYS.length - 1 && (
                <span className="absolute top-0 -right-[36%] z-10 h-[58%] w-[64%] rounded-b-[2px] bg-[#0e2a4d]" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (frameColor === "warm-cream") {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* 5-line musical staff behind the brand band */}
        <div
          className={`absolute inset-x-[6%] flex h-[10%] flex-col justify-center gap-[3px] ${
            isTopLogo ? "top-0" : "bottom-0"
          }`}
        >
          {[0, 1, 2, 3, 4].map((line) => (
            <div key={line} className="h-px w-full bg-[#14365f]/12" />
          ))}
        </div>
      </div>
    );
  }

  if (frameColor === "midnight-navy") {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Left & right 35mm film sprocket holes */}
        <div className="absolute inset-y-[3.5%] left-[2.2%] flex w-[4.4%] flex-col justify-between">
          {SPROCKET_SLOTS.map((s) => (
            <div key={s} className="aspect-[1/1.25] w-full rounded-[2px] bg-white/90" />
          ))}
        </div>
        <div className="absolute inset-y-[3.5%] right-[2.2%] flex w-[4.4%] flex-col justify-between">
          {SPROCKET_SLOTS.map((s) => (
            <div key={s} className="aspect-[1/1.25] w-full rounded-[2px] bg-white/90" />
          ))}
        </div>
      </div>
    );
  }

  if (frameColor === "concert-stub") {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Perforated ticket divider line between photos & brand stub */}
        <div
          className={`absolute inset-x-[6%] border-t border-dashed border-[#14365f]/25 ${
            isTopLogo ? "top-[10%]" : "bottom-[10%]"
          }`}
        />
        {/* Semicircular ticket cutout notches on left & right */}
        <div
          className={`absolute -left-[2.6%] size-[5.2%] aspect-square rounded-full bg-surface-secondary ${
            isTopLogo ? "top-[10%] -translate-y-1/2" : "bottom-[10%] translate-y-1/2"
          }`}
        />
        <div
          className={`absolute -right-[2.6%] size-[5.2%] aspect-square rounded-full bg-surface-secondary ${
            isTopLogo ? "top-[10%] -translate-y-1/2" : "bottom-[10%] translate-y-1/2"
          }`}
        />
      </div>
    );
  }

  return null;
}

export function StripBrandBand({
  frameColor,
  compact = false,
}: {
  frameColor: FrameColorId;
  isTopLogo?: boolean;
  compact?: boolean;
}) {
  const preset = getFramePreset(frameColor);
  const logoSizeClass = compact ? "size-3 rounded-[3px]" : "size-4.5 rounded-[4px]";
  const textSizeClass = compact ? "text-[9.5px]" : "text-[13px]";

  return (
    <div className="relative z-10 h-[10%] shrink-0 flex items-center justify-center gap-1.5">
      {frameColor === "concert-stub" && (
        <div className="flex items-center gap-0.5 mr-0.5" aria-hidden="true">
          {CONCERT_DOTS.slice(0, 2).map((color) => (
            <span
              key={color}
              style={{ backgroundColor: color }}
              className={compact ? "size-1.5 rounded-full" : "size-2 rounded-full"}
            />
          ))}
        </div>
      )}

      <div
        className={`relative shrink-0 overflow-hidden ${logoSizeClass} ${
          frameColor === "chordisol-blue" || frameColor === "midnight-navy"
            ? "ring-1 ring-white/30"
            : ""
        }`}
      >
        <Image
          src="/images/chordisol-logo.png"
          alt="Chordisol"
          fill
          className="object-cover"
          draggable={false}
        />
      </div>

      <span
        style={{ color: preset.textColor }}
        className={`font-display font-bold tracking-tight ${textSizeClass}`}
      >
        Chordisol
      </span>

      {frameColor === "warm-cream" && (
        <span
          style={{ color: preset.subtextColor }}
          className={`ml-1 font-mono font-semibold ${
            compact ? "text-[7px]" : "text-[9.5px]"
          }`}
        >
          ♩=120
        </span>
      )}

      {frameColor === "midnight-navy" && (
        <span
          style={{ color: preset.subtextColor }}
          className={`ml-1 font-mono font-semibold ${
            compact ? "text-[7px]" : "text-[9.5px]"
          }`}
        >
          400
        </span>
      )}

      {frameColor === "concert-stub" && (
        <div className="flex items-center gap-0.5 ml-0.5" aria-hidden="true">
          {CONCERT_DOTS.slice(2).map((color) => (
            <span
              key={color}
              style={{ backgroundColor: color }}
              className={compact ? "size-1.5 rounded-full" : "size-2 rounded-full"}
            />
          ))}
        </div>
      )}
    </div>
  );
}

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
  frameColor = "classic-white",
  layoutVariation = "variation-1",
  filter = "normal",
  stickers = [],
  stickersVisible = true,
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
        const newX = Math.max(5, Math.min(95, initialX + deltaXPercent));
        const newY = Math.max(4, Math.min(96, initialY + deltaYPercent));
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
        const newWidth = Math.max(10, Math.min(54, initialWidth + deltaPercent));
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

  const photoCount = getPhotoCountForVariation(layoutVariation);
  const isTopLogo = isTopLogoVariation(layoutVariation);
  const slotIndices = Array.from({ length: photoCount }, (_, idx) => idx);
  const padXClass = getStripPaddingXClass(frameColor);
  const slotRingClass = getPhotoSlotRingClass(frameColor);

  return (
    <div
      ref={stripRef}
      id="photobooth-strip-dom"
      onClick={(e) => {
        e.stopPropagation();
        onSelectSticker?.(null);
      }}
      style={getStripSurfaceStyle(frameColor)}
      className={`relative mx-auto select-none aspect-[9/16] w-[262px] sm:w-[280px] transition-colors duration-300 shadow-[0_20px_48px_-14px_rgba(20,54,95,0.18),0_2px_8px_rgba(20,54,95,0.06)] ${className}`}
    >
      <StripPaperDecorations frameColor={frameColor} isTopLogo={isTopLogo} />

      {/* Absolute inset-0 locks 100% definite height so h-[10%] and photo slots match 1080x1920 export 1:1 */}
      <div
        className={`absolute inset-0 z-10 flex flex-col ${padXClass} ${getStripVerticalPaddingClass(
          frameColor,
          isTopLogo
        )}`}
      >
        {isTopLogo && <StripBrandBand frameColor={frameColor} isTopLogo={true} />}

        {/* Photo Cuts Grid (Exact 1:1 parity with 1080x1920 canvasExport) */}
        <div
          className={`flex-1 min-h-0 grid gap-2 ${
            photoCount === 1
              ? "grid-rows-1"
              : photoCount === 2
              ? "grid-rows-2"
              : "grid-rows-3"
          }`}
        >
          {slotIndices.map((index) => {
            const photoUrl = photos[index];

            return (
              <div
                key={index}
                className={`group relative size-full overflow-hidden bg-surface-secondary ${slotRingClass}`}
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

                    {frameColor === "midnight-navy" && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-1.5 left-2 font-mono text-[9px] font-bold tracking-wider text-amber-300/85 drop-shadow-xs"
                      >
                        0{index + 1}A
                      </span>
                    )}

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

        {!isTopLogo && <StripBrandBand frameColor={frameColor} isTopLogo={false} />}
      </div>

      {/* Interactive Sticker Layer (overflow-visible so edge handles never clip) */}
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
