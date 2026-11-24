"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FRAME_PRESETS,
  PHOTO_FILTERS,
  type FrameColorId,
  type PhotoFilterId,
  type StickerItem,
} from "@/lib/booth-types";

interface PhotoboothStripProps {
  photos: (string | null)[];
  frameColor: FrameColorId;
  filter: PhotoFilterId;
  stickers: StickerItem[];
  stickersVisible: boolean;
  caption: string;
  showDate: boolean;
  dateText: string;
  selectedStickerId: string | null;
  onSelectSticker: (id: string | null) => void;
  onUpdateSticker: (
    id: string,
    updates: Partial<Pick<StickerItem, "xPercent" | "yPercent" | "widthPercent" | "rotationDeg" | "zIndex">>
  ) => void;
  onDeleteSticker: (id: string) => void;
  onRetakeSlot?: (slotIndex: number) => void;
}

export function PhotoboothStrip({
  photos,
  frameColor,
  filter,
  stickers,
  stickersVisible,
  caption,
  showDate,
  dateText,
  selectedStickerId,
  onSelectSticker,
  onUpdateSticker,
  onDeleteSticker,
  onRetakeSlot,
}: PhotoboothStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const frame = FRAME_PRESETS.find((f) => f.id === frameColor) || FRAME_PRESETS[0];
  const activeFilter = PHOTO_FILTERS.find((f) => f.id === filter) || PHOTO_FILTERS[0];

  // Dragging state
  const [activeDrag, setActiveDrag] = useState<{
    id: string;
    mode: "move" | "rotate" | "scale";
    startPointerX: number;
    startPointerY: number;
    initialX: number;
    initialY: number;
    initialRot: number;
    initialWidth: number;
    stickerCenterX: number;
    stickerCenterY: number;
  } | null>(null);

  // Bring to front helper
  const handleStickerTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent, id: string) => {
      e.stopPropagation();
      const maxZ = stickers.reduce((max, s) => Math.max(max, s.zIndex), 1);
      onUpdateSticker(id, { zIndex: maxZ + 1 });
      onSelectSticker(id);
    },
    [stickers, onUpdateSticker, onSelectSticker]
  );

  // Global Pointer Events for smooth sticker drag/rotate/scale
  useEffect(() => {
    if (!activeDrag) return;

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
        const newWidth = Math.max(12, Math.min(50, initialWidth + deltaPercent));
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
      onClick={() => onSelectSticker(null)}
      style={{
        backgroundColor: frame.bg,
        borderColor: frame.border,
      }}
      className="relative mx-auto flex w-[320px] sm:w-[350px] shrink-0 flex-col select-none rounded-[22px] border-2 p-4 sm:p-5 shadow-[0_12px_36px_rgba(15,23,42,0.14)] transition-colors duration-200"
    >
      {/* 1. Header Logotype */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          <Image
            src="/images/chordisol-logo.png"
            alt="Chordisol"
            width={28}
            height={28}
            className="size-7 rounded-[7px] object-cover shadow-xs"
            priority
          />
          <div>
            <h2
              style={{ color: frame.textColor }}
              className="font-display text-[15px] leading-tight font-bold tracking-tight"
            >
              CHORDISOL
            </h2>
            <p
              style={{ color: frame.subtextColor }}
              className="font-sans text-[9.5px] leading-none font-semibold tracking-wide uppercase"
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
          className="rounded-full px-2 py-0.5 font-mono text-[9px] font-bold tracking-tight opacity-80"
        >
          4-CUT
        </span>
      </div>

      {/* 2. Four Photo Slots */}
      <div className="flex flex-col gap-2.5">
        {[0, 1, 2, 3].map((index) => {
          const photoUrl = photos[index];
          return (
            <div
              key={index}
              style={{ borderColor: frame.photoBorder }}
              className="group relative aspect-4/3 w-full overflow-hidden rounded-[12px] border bg-black/5"
            >
              {photoUrl ? (
                <>
                  {/* Avoid AI template tells: crisp, authentic photo rendered with live filter */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl}
                    alt={`Photobooth shot ${index + 1}`}
                    style={{ filter: activeFilter.css }}
                    className="size-full object-cover"
                  />

                  {/* Retake button overlay on hover/focus */}
                  {onRetakeSlot && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRetakeSlot(index);
                      }}
                      className="absolute right-2 top-2 z-20 hidden items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-white shadow-md backdrop-blur-md transition-transform duration-150 hover:bg-slate-900 active:scale-95 group-hover:flex"
                    >
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="size-3"
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
                  className="flex size-full flex-col items-center justify-center gap-1"
                >
                  <div className="flex size-8 items-center justify-center rounded-full border border-dashed border-current opacity-60">
                    <span className="font-mono text-xs font-bold">{index + 1}</span>
                  </div>
                  <span className="font-sans text-[11px] font-semibold opacity-70">
                    Shot {index + 1}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Footer Section */}
      <div className="pt-3.5 pb-1 text-center">
        <p
          style={{ color: frame.textColor }}
          className="font-display text-[13px] font-bold tracking-tight truncate px-1"
        >
          {caption || "Acoustic Session • Chordisol Studio"}
        </p>

        {showDate && dateText && (
          <p
            style={{ color: frame.subtextColor }}
            className="mt-0.5 font-sans text-[10px] font-semibold tracking-wide"
          >
            {dateText}
          </p>
        )}

        {/* Decorative barcode bar */}
        <div
          aria-hidden="true"
          style={{ color: frame.subtextColor }}
          className="mx-auto mt-2.5 flex h-1.5 w-28 items-center justify-center gap-0.5 opacity-50"
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

      {/* 4. Interactive Sticker Layer */}
      {stickersVisible && (
        <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
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
                  isSelected ? "ring-2 ring-[#2391ff] ring-offset-2 ring-offset-transparent rounded-lg" : ""
                }`}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onSelectSticker(sticker.id);
                  setActiveDrag({
                    id: sticker.id,
                    mode: "move",
                    startPointerX: e.clientX,
                    startPointerY: e.clientY,
                    initialX: sticker.xPercent,
                    initialY: sticker.yPercent,
                    initialRot: sticker.rotationDeg,
                    initialWidth: sticker.widthPercent,
                    stickerCenterX: 0,
                    stickerCenterY: 0,
                  });
                }}
              >
                {/* Sticker Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sticker.src}
                  alt={sticker.name}
                  draggable={false}
                  className="size-full object-contain pointer-events-none drop-shadow-[0_4px_8px_rgba(15,23,42,0.2)]"
                />

                {/* Transform Handles when selected */}
                {isSelected && (
                  <>
                    {/* Delete handle (top-left) */}
                    <button
                      type="button"
                      aria-label="Delete sticker"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSticker(sticker.id);
                      }}
                      className="absolute -top-3 -left-3 size-5.5 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold shadow-md hover:bg-rose-600 active:scale-95 z-50 cursor-pointer"
                    >
                      ✕
                    </button>

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
                          initialRot: sticker.rotationDeg,
                          initialWidth: sticker.widthPercent,
                          stickerCenterX: 0,
                          stickerCenterY: 0,
                        });
                      }}
                      className="absolute -top-3 -right-3 size-5.5 rounded-full bg-[#2391ff] text-white flex items-center justify-center text-[10px] font-bold shadow-md hover:bg-[#1674d6] active:scale-95 z-50 cursor-grab"
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
                          initialRot: sticker.rotationDeg,
                          initialWidth: sticker.widthPercent,
                          stickerCenterX: 0,
                          stickerCenterY: 0,
                        });
                      }}
                      className="absolute -bottom-3 -right-3 size-5.5 rounded-full bg-[#10b981] text-white flex items-center justify-center text-[10px] font-bold shadow-md hover:bg-[#059669] active:scale-95 z-50 cursor-se-resize"
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
