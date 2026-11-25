"use client";

import Image from "next/image";
import React, { useCallback, useMemo, useState } from "react";
import { CameraViewfinder } from "@/components/camera-viewfinder";
import { PhotoboothStrip } from "@/components/photobooth-strip";
import { BoothQrModal } from "@/components/booth-qr-modal";
import {
  LAYOUT_VARIATIONS,
  PHOTO_FILTERS,
  STICKER_PALETTE,
  getPhotoCountForVariation,
  type LayoutVariationId,
  type PhotoFilterId,
  type StickerAsset,
  type StickerItem,
  type StripConfig,
} from "@/lib/booth-types";
import { downloadUltraHdStrip, exportCompressedStripForUpload } from "@/lib/canvasExport";

type WizardStep = 1 | 2 | 3 | 4;

export function BoothStudio() {
  // 4 Steps: 1 (Variation) -> 2 (Camera) -> 3 (Decorate & Filter) -> 4 (Download & Share)
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  // Layout variation: variation-1 (3 shots), variation-2 (2 shots), variation-3 (3 shots, top header)
  const [layoutVariation, setLayoutVariation] = useState<LayoutVariationId>("variation-1");
  const slotCount = getPhotoCountForVariation(layoutVariation);

  // Photos state: dynamically sized to slotCount (2 or 3)
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null]);

  // Retake targeted slot for Step 2
  const [retakeSlotIndex, setRetakeSlotIndex] = useState<number | null>(null);

  // Filter tone (ONLY adjustable after taking pictures in Step 3: normal, bnw, grainy)
  const [filter, setFilter] = useState<PhotoFilterId>("normal");

  // Stickers & Caption
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [caption, setCaption] = useState("Acoustic Session • Chordisol Studio");
  const [showDate, setShowDate] = useState(true);

  const [dateText, setDateText] = useState(() => {
    const now = new Date();
    const dateFormatted = now
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, ".");
    const timeFormatted = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateFormatted} • ${timeFormatted}`;
  });

  const [stripId, setStripId] = useState(() => {
    return Math.random().toString(36).substring(2, 9) + Date.now().toString(36).slice(-4);
  });

  // Export & QR Modal State
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [qrModalData, setQrModalData] = useState<{
    isOpen: boolean;
    publicUrl: string;
    stripId: string;
  }>({
    isOpen: false,
    publicUrl: "",
    stripId: "",
  });

  // Current strip config (Frame color is fixed to pure white)
  const currentStripConfig: StripConfig = useMemo(
    () => ({
      photos,
      frameColor: "classic-white",
      layoutVariation,
      filter,
      stickers,
      stickersVisible: true,
      caption,
      showDate,
      dateText,
    }),
    [photos, layoutVariation, filter, stickers, caption, showDate, dateText]
  );

  // When changing layout variation in Step 1, reset photo array if needed
  const handleSelectVariation = (varId: LayoutVariationId) => {
    setLayoutVariation(varId);
    const count = getPhotoCountForVariation(varId);
    setPhotos(new Array(count).fill(null));
    setRetakeSlotIndex(null);
  };

  // Photo capture callback
  const handlePhotoCaptured = useCallback((slotIndex: number, dataUrl: string) => {
    setPhotos((prev) => {
      const next = [...prev];
      next[slotIndex] = dataUrl;
      return next;
    });
  }, []);

  const handleSequenceComplete = useCallback(() => {
    setRetakeSlotIndex(null);
  }, []);

  // Sticker actions
  const handleAddSticker = useCallback((asset: StickerAsset) => {
    const jitterX = Math.floor(Math.random() * 20) - 10;
    const jitterY = Math.floor(Math.random() * 20) - 10;
    const jitterRot = Math.floor(Math.random() * 24) - 12;

    const newId = `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setStickers((prev) => {
      const maxZ = prev.reduce((max, s) => Math.max(max, s.zIndex), 1);
      const newSticker: StickerItem = {
        id: newId,
        assetId: asset.id,
        src: asset.src,
        name: asset.name,
        xPercent: 50 + jitterX,
        yPercent: 40 + jitterY,
        widthPercent: asset.defaultWidthPercent,
        rotationDeg: jitterRot,
        zIndex: maxZ + 1,
      };
      return [...prev, newSticker];
    });
    setSelectedStickerId(newId);
  }, []);

  const handleUpdateSticker = useCallback(
    (
      id: string,
      updates: Partial<Pick<StickerItem, "xPercent" | "yPercent" | "widthPercent" | "rotationDeg" | "zIndex">>
    ) => {
      setStickers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
    },
    []
  );

  const handleDeleteSticker = useCallback((id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
    setSelectedStickerId((curr) => (curr === id ? null : curr));
  }, []);

  const handleClearStickers = () => {
    setStickers([]);
    setSelectedStickerId(null);
  };

  const handleShuffleStickers = () => {
    const randomAssets = [...STICKER_PALETTE].sort(() => 0.5 - Math.random()).slice(0, 3);
    const ySpots = [25, 52, 76];

    const newItems: StickerItem[] = randomAssets.map((asset, i) => ({
      id: `sticker-${Date.now()}-${i}`,
      assetId: asset.id,
      src: asset.src,
      name: asset.name,
      xPercent: 22 + Math.random() * 56,
      yPercent: ySpots[i] + (Math.random() * 8 - 4),
      widthPercent: asset.defaultWidthPercent,
      rotationDeg: Math.floor(Math.random() * 30) - 15,
      zIndex: i + 1,
    }));

    setStickers(newItems);
  };

  const handleResetSession = () => {
    if (confirm("Start over? This will reset your photos and stickers.")) {
      setPhotos(new Array(slotCount).fill(null));
      setStickers([]);
      setSelectedStickerId(null);
      setFilter("normal");
      setCurrentStep(1);
      setRetakeSlotIndex(null);
      setStripId(Math.random().toString(36).substring(2, 9) + Date.now().toString(36).slice(-4));
      const now = new Date();
      const dateFormatted = now
        .toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\//g, ".");
      const timeFormatted = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setDateText(`${dateFormatted} • ${timeFormatted}`);
    }
  };

  // Download Ultra HD PNG
  const handleDownloadUltraHd = async () => {
    try {
      setIsDownloading(true);
      await downloadUltraHdStrip(currentStripConfig, `chordisol-strip-${stripId}.png`);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to export Ultra HD image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Upload for QR Code
  const handleOpenMobileQr = async () => {
    try {
      setIsUploading(true);
      const dataUrl = await exportCompressedStripForUpload(currentStripConfig);

      const res = await fetch("/api/upload-strip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stripId,
          dataUrl,
        }),
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status ${res.status}`);
      }

      const data = await res.json();
      setQrModalData({
        isOpen: true,
        publicUrl: data.url,
        stripId,
      });
    } catch (err) {
      console.error("QR Cloud Upload error:", err);
      alert("Failed to create mobile share link. Please try downloading directly.");
    } finally {
      setIsUploading(false);
    }
  };

  const completedCount = photos.filter(Boolean).length;
  const isAllPhotosTaken = completedCount === slotCount;
  const selectedSticker = stickers.find((s) => s.id === selectedStickerId);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-5xl">
        {/* Simple Header matching user sketch */}
        <header className="mb-6 flex items-center justify-between rounded-2xl border-2 border-slate-900/10 bg-white px-5 py-3.5 shadow-[0_4px_0_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#5eb0fa] text-white shadow-xs">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="size-5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <span className="font-display text-lg font-black text-slate-900 tracking-tight">
              Chordisol
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetSession}
              title="Reset Photobooth Session"
              className="flex h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5">
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              <span>Reset</span>
            </button>
          </div>
        </header>

        {/* =========================================================================
            STEP 1: VARIATION PICKER (Matching Sketch 1)
            Clean, 3 variations side-by-side, NO color picker, NO extra cards
           ========================================================================= */}
        {currentStep === 1 && (
          <section className="flex flex-col items-center gap-6 rounded-2xl border-2 border-slate-900/10 bg-white p-6 sm:p-10 shadow-[0_4px_0_rgba(15,23,42,0.06)]">
            {/* 3 Variations Side by Side (Matching Sketch 1) */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
              {LAYOUT_VARIATIONS.map((variant) => {
                const isSelected = layoutVariation === variant.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => handleSelectVariation(variant.id)}
                    className={`group flex flex-col items-center justify-between rounded-2xl border-2 p-5 text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-brand-primary ring-2 ring-brand-primary/25 bg-blue-50/20 shadow-md"
                        : "border-slate-900/10 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {/* Visual Photocard Illustration matching Sketch 1 */}
                    <div className="w-[140px] h-[250px] rounded-xl border-2 border-slate-900/20 bg-white p-3 shadow-xs flex flex-col justify-between transition-transform group-hover:scale-105">
                      {variant.id === "variation-3" ? (
                        <>
                          {/* Caption on Top */}
                          <div className="w-full border-b border-slate-200 pb-1.5 text-center">
                            <span className="font-display text-[10px] font-bold text-slate-800">
                              Blabla
                            </span>
                          </div>

                          {/* 3 Photo Boxes */}
                          <div className="flex flex-col gap-2 my-auto">
                            {[1, 2, 3].map((num) => (
                              <div
                                key={num}
                                className="h-[44px] w-full rounded-md border-2 border-slate-900/15 bg-[#bbf7d0]/60 flex items-center justify-center font-mono text-[9px] font-bold text-slate-700"
                              >
                                {num}
                              </div>
                            ))}
                          </div>
                        </>
                      ) : variant.id === "variation-2" ? (
                        <>
                          {/* 2 Larger Photo Boxes */}
                          <div className="flex flex-col gap-2.5 my-auto">
                            {[1, 2].map((num) => (
                              <div
                                key={num}
                                className="h-[74px] w-full rounded-md border-2 border-slate-900/15 bg-[#bbf7d0]/60 flex items-center justify-center font-mono text-xs font-bold text-slate-700"
                              >
                                {num}
                              </div>
                            ))}
                          </div>

                          {/* Caption on Bottom */}
                          <div className="w-full border-t border-slate-200 pt-1.5 text-center">
                            <span className="font-display text-[10px] font-bold text-slate-800">
                              Blabla
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Variation 1: 3 Photo Boxes */}
                          <div className="flex flex-col gap-2 my-auto">
                            {[1, 2, 3].map((num) => (
                              <div
                                key={num}
                                className="h-[44px] w-full rounded-md border-2 border-slate-900/15 bg-[#bbf7d0]/60 flex items-center justify-center font-mono text-[9px] font-bold text-slate-700"
                              >
                                {num}
                              </div>
                            ))}
                          </div>

                          {/* Caption on Bottom */}
                          <div className="w-full border-t border-slate-200 pt-1.5 text-center">
                            <span className="font-display text-[10px] font-bold text-slate-800">
                              Blabla
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Label matching Sketch 1 */}
                    <div className="mt-4 flex items-center justify-center gap-1.5">
                      <span className="font-display text-sm font-bold text-slate-900">
                        {variant.name.toLowerCase()}
                      </span>
                      {isSelected && (
                        <span className="flex size-4 items-center justify-center rounded-full bg-brand-primary text-[9px] font-black text-white">
                          ✓
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action Button */}
            <div className="w-full max-w-3xl pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-brand-primary px-10 font-display text-sm font-bold text-white shadow-[0_4px_0_#0f5298] hover:bg-[#1a82f0] active:translate-y-0.5 active:shadow-[0_1px_0_#0f5298] transition-all cursor-pointer"
              >
                <span>Enter Camera Booth →</span>
              </button>
            </div>
          </section>
        )}

        {/* =========================================================================
            STEP 2: CAMERA BOOTH & STACKED SLOTS (Matching Sketch 2)
            Left: Camera Viewfinder
            Right: 1..N Slots Stacked vertically with "click 1...N to retake pics"
           ========================================================================= */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Camera Viewfinder */}
            <section className="lg:col-span-7 flex flex-col gap-3">
              {retakeSlotIndex !== null && (
                <div className="flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 font-semibold shadow-2xs">
                  <span>Retaking Shot {retakeSlotIndex + 1}. Pose and snap!</span>
                  <button
                    type="button"
                    onClick={() => setRetakeSlotIndex(null)}
                    className="font-bold underline hover:text-amber-950 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <CameraViewfinder
                photos={photos}
                onPhotoCaptured={handlePhotoCaptured}
                onSequenceComplete={handleSequenceComplete}
                mode={retakeSlotIndex !== null ? "retake" : "sequence"}
                retakeSlot={retakeSlotIndex}
                onRetakeDone={() => setRetakeSlotIndex(null)}
                onCancelRetake={() => setRetakeSlotIndex(null)}
                hideInlineSlots={true}
                slotCount={slotCount}
              />
            </section>

            {/* RIGHT COLUMN: Stacked Slots (Matching Sketch 2) */}
            <aside className="lg:col-span-5 flex flex-col gap-3 rounded-2xl border-2 border-slate-900/10 bg-white p-5 shadow-[0_4px_0_rgba(15,23,42,0.06)]">
              {/* Stacked Vertical Slots */}
              <div className="flex flex-col gap-3">
                {new Array(slotCount).fill(0).map((_, slotIdx) => {
                  const photo = photos[slotIdx];
                  const isRetakingThis = retakeSlotIndex === slotIdx;

                  return (
                    <div
                      key={slotIdx}
                      onClick={() => {
                        if (photo) {
                          setRetakeSlotIndex(slotIdx);
                        }
                      }}
                      className={`group relative flex items-center gap-3 rounded-xl border-2 p-3 transition-all cursor-pointer ${
                        isRetakingThis
                          ? "border-amber-400 bg-amber-50/60 ring-2 ring-amber-300/50 shadow-xs"
                          : photo
                          ? "border-slate-900/10 bg-white hover:border-slate-300 hover:bg-slate-50"
                          : "border-dashed border-slate-200 bg-slate-50/60"
                      }`}
                    >
                      {/* Thumbnail or Slot Number */}
                      <div className="relative aspect-4/3 w-22 shrink-0 overflow-hidden rounded-lg bg-slate-900 border border-slate-200">
                        {photo ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photo}
                              alt={`Captured shot ${slotIdx + 1}`}
                              className="size-full object-cover"
                            />
                            <span className="absolute top-1 left-1 flex size-3.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-white shadow-xs">
                              ✓
                            </span>
                          </>
                        ) : (
                          <div className="flex size-full items-center justify-center text-slate-400">
                            <span className="font-display text-base font-bold text-slate-700">
                              {slotIdx + 1}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Slot Label */}
                      <div className="flex-1 min-w-0">
                        <span className="font-display text-sm font-bold text-slate-900 block">
                          Slot {slotIdx + 1}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          {photo ? "Tap to retake" : "Ready for pose"}
                        </span>
                      </div>

                      {photo && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRetakeSlotIndex(slotIdx);
                          }}
                          className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100"
                        >
                          Retake
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Exact Phrase from Sketch 2 */}
              <p className="text-center text-xs font-bold text-slate-500 pt-1">
                click 1...{slotCount} to retake pics
              </p>

              {/* Bottom Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={completedCount === 0}
                  onClick={() => setCurrentStep(3)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-primary font-display text-sm font-bold text-white shadow-[0_4px_0_#0f5298] hover:bg-[#1a82f0] active:translate-y-0.5 active:shadow-[0_1px_0_#0f5298] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>
                    {isAllPhotosTaken
                      ? "Decorate Strip →"
                      : `Proceed with ${completedCount}/${slotCount} Shots →`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-center font-bold text-xs text-slate-500 hover:text-slate-800 hover:underline py-1 cursor-pointer"
                >
                  ← Back to Variations
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* =========================================================================
            STEP 3: DECORATE STRIP, STICKERS & FILTER TONE (Matching Sketch 3)
            Left: White Photocard Strip
            Right: Filter (normal, bnw, grainy), Sticker Picks & Caption
           ========================================================================= */}
        {currentStep === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: The White Photocard Strip */}
            <section className="lg:col-span-5 flex flex-col items-center justify-center gap-3">
              <div className="w-full rounded-2xl border-2 border-slate-900/10 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.08)] flex flex-col items-center">
                {/* Photocard Strip (Fixed Pure White) */}
                <div className="w-full flex justify-center py-1">
                  <PhotoboothStrip
                    photos={photos}
                    layoutVariation={layoutVariation}
                    filter={filter}
                    stickers={stickers}
                    stickersVisible={true}
                    caption={caption}
                    showDate={showDate}
                    dateText={dateText}
                    selectedStickerId={selectedStickerId}
                    onSelectSticker={setSelectedStickerId}
                    onUpdateSticker={handleUpdateSticker}
                    onDeleteSticker={handleDeleteSticker}
                    onRetakeSlot={(slot) => {
                      setRetakeSlotIndex(slot);
                      setCurrentStep(2);
                    }}
                  />
                </div>

                {/* Selected Sticker Floating Tooltip Bar */}
                {selectedSticker && (
                  <div className="w-full mt-3 flex items-center justify-between rounded-xl bg-slate-900 p-2 text-white shadow-md">
                    <span className="text-xs font-bold px-2 truncate">
                      {selectedSticker.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateSticker(selectedSticker.id, {
                            rotationDeg: (selectedSticker.rotationDeg - 15) % 360,
                          })
                        }
                        title="Rotate Left"
                        className="flex size-7 items-center justify-center rounded-lg bg-white/20 text-xs font-bold hover:bg-white/30 cursor-pointer"
                      >
                        ↺
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateSticker(selectedSticker.id, {
                            rotationDeg: (selectedSticker.rotationDeg + 15) % 360,
                          })
                        }
                        title="Rotate Right"
                        className="flex size-7 items-center justify-center rounded-lg bg-white/20 text-xs font-bold hover:bg-white/30 cursor-pointer"
                      >
                        ↻
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateSticker(selectedSticker.id, {
                            widthPercent: Math.max(14, selectedSticker.widthPercent - 4),
                          })
                        }
                        title="Smaller"
                        className="flex size-7 items-center justify-center rounded-lg bg-white/20 text-xs font-bold hover:bg-white/30 cursor-pointer"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateSticker(selectedSticker.id, {
                            widthPercent: Math.min(48, selectedSticker.widthPercent + 4),
                          })
                        }
                        title="Bigger"
                        className="flex size-7 items-center justify-center rounded-lg bg-white/20 text-xs font-bold hover:bg-white/30 cursor-pointer"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSticker(selectedSticker.id)}
                        title="Delete Sticker"
                        className="flex size-7 items-center justify-center rounded-lg bg-rose-500 text-xs font-bold hover:bg-rose-600 cursor-pointer ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* RIGHT COLUMN: Filter Tone (normal, bnw, grainy), Sticker Picks & Caption */}
            <aside className="lg:col-span-7 flex flex-col gap-5 rounded-2xl border-2 border-slate-900/10 bg-white p-5 sm:p-6 shadow-[0_4px_0_rgba(15,23,42,0.06)]">
              {/* 1. Photographic Film Filter Tone: normal, bnw, grainy (Only after taking pictures!) */}
              <div className="space-y-2">
                <label className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Photographic Film Filter Tone
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {PHOTO_FILTERS.map((f) => {
                    const isSelected = filter === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFilter(f.id)}
                        className={`flex h-11 items-center justify-center gap-2 rounded-xl border-2 font-display text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "border-brand-primary bg-brand-primary text-white shadow-xs"
                            : "border-slate-900/10 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span>{f.name}</span>
                        {isSelected && <span className="text-[10px]">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Sticker Picks (Matching Sketch 3) */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider">
                    sticker picks
                  </label>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleShuffleStickers}
                      className="flex h-7 items-center gap-1 rounded-full bg-brand-primary/10 px-2.5 text-[11px] font-bold text-brand-primary hover:bg-brand-primary/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <span>🎲 Auto-Decorate</span>
                    </button>

                    {stickers.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearStickers}
                        className="flex h-7 items-center gap-1 rounded-full bg-rose-50 px-2.5 text-[11px] font-bold text-rose-600 hover:bg-rose-100 active:scale-95 transition-all cursor-pointer"
                      >
                        <span>Clear</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Sticker Picks Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[190px] overflow-y-auto p-2 border rounded-xl border-slate-100 bg-slate-50">
                  {STICKER_PALETTE.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => handleAddSticker(asset)}
                      title={`Add ${asset.name}`}
                      className="group flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-2xs hover:border-brand-primary hover:bg-brand-primary/5 active:scale-95 transition-all cursor-pointer"
                    >
                      <div className="relative size-10">
                        <Image
                          src={asset.src}
                          alt={asset.name}
                          fill
                          className="object-contain transition-transform group-hover:scale-110"
                        />
                      </div>
                      <span className="font-sans text-[9px] font-bold text-slate-700 truncate max-w-full">
                        {asset.name}
                      </span>
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-slate-400 font-medium">
                  add, move, rotate, resize, delete stickers
                </p>
              </div>

              {/* 3. Session Caption */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <label className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Caption
                </label>
                <input
                  type="text"
                  maxLength={42}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. Acoustic Session • Chordisol Studio"
                  className="w-full rounded-xl border-2 border-slate-900/10 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-brand-primary focus:bg-white transition-colors"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-medium text-slate-500">
                    Display Date &amp; Timestamp
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showDate}
                    onClick={() => setShowDate((v) => !v)}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                      showDate ? "bg-brand-primary" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block size-3.5 rounded-full bg-white shadow-xs transition-transform ${
                        showDate ? "translate-x-4.5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="font-bold text-xs text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                >
                  ← Back to Camera
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="flex h-12 items-center justify-center gap-2 rounded-full bg-brand-primary px-8 font-display text-sm font-bold text-white shadow-[0_4px_0_#0f5298] hover:bg-[#1a82f0] active:translate-y-0.5 active:shadow-[0_1px_0_#0f5298] transition-all cursor-pointer"
                >
                  <span>Finish &amp; Download →</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* =========================================================================
            STEP 4: SHARE AND DOWNLOAD (Matching Sketch 4)
            Centered Photocard Strip with Share & Download Buttons Below
           ========================================================================= */}
        {currentStep === 4 && (
          <section className="flex flex-col items-center gap-6 rounded-2xl border-2 border-slate-900/10 bg-white p-6 sm:p-10 shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
            {/* Centered Photocard Strip (Matching Sketch 4) */}
            <div className="relative my-1 flex justify-center py-4 px-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 shadow-inner">
              {/* Subtle Celebration Sparks matching sketch */}
              <div className="pointer-events-none absolute -top-3 -left-3 text-lg select-none">
                ✨
              </div>
              <div className="pointer-events-none absolute -top-3 -right-3 text-lg select-none">
                ✨
              </div>

              <PhotoboothStrip
                photos={photos}
                layoutVariation={layoutVariation}
                filter={filter}
                stickers={stickers}
                stickersVisible={true}
                caption={caption}
                showDate={showDate}
                dateText={dateText}
              />
            </div>

            {/* Share and Download Buttons (Matching Sketch 4) */}
            <div className="w-full max-w-md flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                disabled={isDownloading}
                onClick={handleDownloadUltraHd}
                className="flex-1 w-full flex h-13 items-center justify-center gap-2 rounded-full bg-brand-primary font-display text-sm font-bold text-white shadow-[0_4px_0_#0f5298] hover:bg-[#1a82f0] active:translate-y-0.5 active:shadow-[0_1px_0_#0f5298] transition-all cursor-pointer disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} className="size-4.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>{isDownloading ? "Generating..." : "💾 Download Ultra HD"}</span>
              </button>

              <button
                type="button"
                disabled={isUploading}
                onClick={handleOpenMobileQr}
                className="flex-1 w-full flex h-13 items-center justify-center gap-2 rounded-full border-2 border-slate-900/10 bg-white font-display text-sm font-bold text-slate-800 shadow-[0_4px_0_rgba(15,23,42,0.08)] hover:bg-slate-50 active:translate-y-0.5 active:shadow-[0_1px_0_rgba(15,23,42,0.08)] transition-all cursor-pointer disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4.5 text-brand-primary">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <span>{isUploading ? "Uploading..." : "📱 Save to Phone (QR)"}</span>
              </button>
            </div>

            {/* Auxiliary Links */}
            <div className="flex items-center gap-6 text-xs font-bold text-slate-500">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="hover:text-brand-primary hover:underline cursor-pointer"
              >
                ← Edit Stickers &amp; Filter
              </button>

              <span className="text-slate-300">•</span>

              <button
                type="button"
                onClick={handleResetSession}
                className="hover:text-rose-600 hover:underline cursor-pointer"
              >
                ↺ Start New Session
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Mobile QR Code Modal */}
      <BoothQrModal
        isOpen={qrModalData.isOpen}
        onClose={() =>
          setQrModalData((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
        publicUrl={qrModalData.publicUrl}
        stripId={stripId}
      />
    </div>
  );
}
