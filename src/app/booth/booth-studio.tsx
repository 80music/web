"use client";

import Image from "next/image";
import React, { useCallback, useMemo, useState } from "react";
import { CameraViewfinder } from "@/components/camera-viewfinder";
import { PhotoboothStrip } from "@/components/photobooth-strip";
import { BoothQrModal } from "@/components/booth-qr-modal";
import {
  LAYOUT_VARIATIONS,
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

function MiniStripPreview({ variation }: { variation: LayoutVariationId }) {
  const isTwoSlot = variation === "variation-2";
  const isTopHeader = variation === "variation-3";

  return (
    <div className="relative mx-auto flex select-none flex-col w-[156px] h-[286px] rounded-2xl border-2 border-slate-900/10 bg-white p-2.5 shadow-[0_4px_16px_rgba(15,23,42,0.06)] justify-between transition-transform duration-200 group-hover:scale-[1.03]">
      {/* Top Header */}
      {isTopHeader ? (
        <div className="border-b border-slate-100 pb-1 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <div className="relative size-3.5 shrink-0 overflow-hidden rounded-[3px]">
              <Image src="/images/chordisol-logo.png" alt="Chordisol Logo" fill className="object-cover" />
            </div>
            <span className="font-display text-[9px] font-black text-slate-900 tracking-tight">CHORDISOL</span>
          </div>
          <p className="font-display text-[8px] font-bold text-slate-800 truncate leading-tight">Acoustic Session</p>
          <p className="font-sans text-[7px] text-slate-400">Studio Take • 2026</p>
        </div>
      ) : (
        <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
          <div className="flex items-center gap-1">
            <div className="relative size-3.5 shrink-0 overflow-hidden rounded-[3px]">
              <Image src="/images/chordisol-logo.png" alt="Chordisol Logo" fill className="object-cover" />
            </div>
            <span className="font-display text-[9px] font-black text-slate-900 leading-none tracking-tight">CHORDISOL</span>
          </div>
          <span className="rounded bg-slate-100 px-1 py-0.2 font-mono text-[7px] font-bold text-slate-600 border border-slate-200">
            {isTwoSlot ? "2-SHOT" : "3-SHOT"}
          </span>
        </div>
      )}

      {/* Photo Frames with authentic studio take sample photos */}
      <div className="flex flex-col gap-1.5 my-1.5 justify-center flex-1">
        {isTwoSlot ? (
          <>
            <div className="relative aspect-[4/3.2] w-full overflow-hidden rounded-lg border border-slate-900/10 bg-slate-100 shadow-2xs">
              <Image src="/images/booth-samples/sample-1.svg" alt="Take 01" fill className="object-cover" />
            </div>
            <div className="relative aspect-[4/3.2] w-full overflow-hidden rounded-lg border border-slate-900/10 bg-slate-100 shadow-2xs">
              <Image src="/images/booth-samples/sample-2.svg" alt="Take 02" fill className="object-cover" />
            </div>
          </>
        ) : (
          <>
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg border border-slate-900/10 bg-slate-100 shadow-2xs">
              <Image src="/images/booth-samples/sample-1.svg" alt="Take 01" fill className="object-cover" />
            </div>
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg border border-slate-900/10 bg-slate-100 shadow-2xs">
              <Image src="/images/booth-samples/sample-2.svg" alt="Take 02" fill className="object-cover" />
            </div>
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg border border-slate-900/10 bg-slate-100 shadow-2xs">
              <Image src="/images/booth-samples/sample-3.svg" alt="Take 03" fill className="object-cover" />
            </div>
          </>
        )}
      </div>

      {/* Bottom Footer */}
      {isTopHeader ? (
        <div className="border-t border-slate-100 pt-1 flex justify-center opacity-40">
          <div className="flex h-1.5 w-16 items-center justify-center gap-0.5 text-slate-700">
            {[3, 2, 4, 2, 5, 2, 3, 4, 2, 5].map((w, i) => (
              <span key={i} style={{ width: `${w}px` }} className="h-full bg-current rounded-[0.5px]" />
            ))}
          </div>
        </div>
      ) : (
        <div className="border-t border-slate-100 pt-1 text-center">
          <p className="font-display text-[8px] font-bold text-slate-800 truncate leading-tight">Acoustic Session</p>
          <p className="font-sans text-[7px] text-slate-400">Studio Take • 2026</p>
          <div className="mx-auto mt-1 flex h-1.5 w-20 items-center justify-center gap-0.5 opacity-40 text-slate-700">
            {[3, 2, 4, 2, 5, 2, 3, 4, 2, 5, 3, 2].map((w, i) => (
              <span key={i} style={{ width: `${w}px` }} className="h-full bg-current rounded-[0.5px]" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function BoothStudio() {
  // 4 Steps: 1 (Format) -> 2 (Camera) -> 3 (Decorate & Filter) -> 4 (Export & Share)
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  // Layout variation: variation-1 (3 cuts), variation-2 (2 cuts), variation-3 (3 cuts, top caption)
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
  const [selectedStickerCategory, setSelectedStickerCategory] = useState<"all" | "mascots" | "chords" | "badges">("all");
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

  // Current strip config (Frame color is permanently fixed to classic white)
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

  // Filtered sticker list based on category tab
  const filteredStickerPalette = useMemo(() => {
    if (selectedStickerCategory === "all") return STICKER_PALETTE;
    if (selectedStickerCategory === "badges") {
      return STICKER_PALETTE.filter(
        (s) => s.category === "badges" || s.category === "sparkles"
      );
    }
    return STICKER_PALETTE.filter((s) => s.category === selectedStickerCategory);
  }, [selectedStickerCategory]);

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
    if (confirm("Start a new session? This will reset your photos and stickers.")) {
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
    <div className="min-h-[calc(100vh-64px)] bg-white text-slate-900 px-3 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        {/* Modern Stepper Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-5">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              {currentStep === 1 && "Choose Photobooth Layout"}
              {currentStep === 2 && "Take Studio Shots"}
              {currentStep === 3 && "Decorate Your Strip"}
              {currentStep === 4 && "Download & Share"}
            </h1>
            <p className="font-sans text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
              {currentStep === 1 && "Select your favorite photobooth arrangement to begin."}
              {currentStep === 2 && `Capture ${slotCount} poses with the live camera or countdown timer.`}
              {currentStep === 3 && "Apply photographic film tone and customize with stickers & mascots."}
              {currentStep === 4 && "Your authentic acoustic photobooth memory strip is ready."}
            </p>
          </div>

          {/* Step Badges */}
          <div className="flex items-center gap-1.5 self-start sm:self-center">
            {[
              { step: 1, label: "Format" },
              { step: 2, label: "Snap" },
              { step: 3, label: "Decorate" },
              { step: 4, label: "Export" },
            ].map((item) => {
              const isActive = currentStep === item.step;
              const isPast = currentStep > item.step;
              return (
                <div key={item.step} className="flex items-center gap-1.5">
                  <div
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all ${
                      isActive
                        ? "bg-brand-primary text-white shadow-xs"
                        : isPast
                        ? "bg-slate-100 text-slate-700"
                        : "bg-transparent text-slate-400"
                    }`}
                  >
                    <span className="flex size-4 items-center justify-center rounded-full text-[10px] font-black">
                      {isPast ? "✓" : item.step}
                    </span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </div>
                  {item.step < 4 && <span className="text-slate-200 text-xs">/</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            STEP 1: VARIATION PICKER WITH AUTHENTIC MINIATURE STRIP PREVIEWS
           ========================================================================= */}
        {currentStep === 1 && (
          <section className="flex flex-col items-center gap-8 py-2">
            {/* 3 Variations Side by Side with authentic strip previews */}
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
                        ? "border-brand-primary ring-2 ring-brand-primary/20 bg-blue-50/20 shadow-md"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-xs"
                    }`}
                  >
                    {/* Real Miniature Strip Preview */}
                    <MiniStripPreview variation={variant.id} />

                    {/* Metadata */}
                    <div className="mt-4 flex flex-col items-center gap-1 w-full">
                      <div className="flex items-center gap-1.5">
                        <span className="font-display text-sm font-bold text-slate-900">
                          {variant.name}
                        </span>
                        {isSelected && (
                          <span className="flex size-4 items-center justify-center rounded-full bg-brand-primary text-[10px] font-black text-white">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className="font-sans text-xs text-slate-500 font-medium">
                        {variant.tagline}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action Button */}
            <div className="w-full max-w-md pt-2 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-primary px-10 font-display text-sm font-bold text-white shadow-[0_4px_0_#0f5298] hover:bg-[#1a82f0] active:translate-y-0.5 active:shadow-[0_1px_0_#0f5298] transition-all cursor-pointer"
              >
                <span>Enter Camera Booth →</span>
              </button>
              <p className="font-sans text-xs text-slate-400">
                Printed on classic white photocard paper
              </p>
            </div>
          </section>
        )}

        {/* =========================================================================
            STEP 2: STUDIO CAMERA BOOTH & CAPTURED FILM RAIL
           ========================================================================= */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Camera Viewfinder */}
            <section className="lg:col-span-7 flex flex-col gap-3">
              {retakeSlotIndex !== null && (
                <div className="flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 font-semibold shadow-2xs">
                  <span>Retaking Shot {retakeSlotIndex + 1}. Smile and strike your pose!</span>
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

            {/* RIGHT COLUMN: Studio Film Strip Rail */}
            <aside className="lg:col-span-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="font-display text-sm font-bold text-slate-900">
                    Captured Takes
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Click any shot to retake individually
                  </p>
                </div>
                <span className="rounded-full bg-brand-primary/10 px-2.5 py-1 text-xs font-bold text-brand-primary">
                  {completedCount} / {slotCount} Shots
                </span>
              </div>

              {/* Slot Cards */}
              <div className="flex flex-col gap-3">
                {new Array(slotCount).fill(0).map((_, slotIdx) => {
                  const photo = photos[slotIdx];
                  const isRetakingThis = retakeSlotIndex === slotIdx;
                  const poseSuggestions = [
                    "Acoustic Smile & Pose",
                    "Fingers on Keys or Strings",
                    "Listening Ear & Groove",
                  ];

                  return (
                    <div
                      key={slotIdx}
                      onClick={() => {
                        if (photo) {
                          setRetakeSlotIndex(slotIdx);
                        }
                      }}
                      className={`group relative flex items-center gap-3.5 rounded-xl border p-3 transition-all cursor-pointer ${
                        isRetakingThis
                          ? "border-amber-400 bg-amber-50/50 ring-2 ring-amber-300/60 shadow-xs"
                          : photo
                          ? "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs"
                          : "border-dashed border-slate-200 bg-slate-50/50"
                      }`}
                    >
                      {/* Photo Thumbnail */}
                      <div className="relative aspect-4/3 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-900 border border-slate-200 shadow-2xs">
                        {photo ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photo}
                              alt={`Take ${slotIdx + 1}`}
                              className="size-full object-cover"
                            />
                            <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.2 font-mono text-[8px] font-bold text-white backdrop-blur-xs">
                              0{slotIdx + 1}
                            </span>
                          </>
                        ) : (
                          <div className="flex size-full flex-col items-center justify-center text-slate-400 bg-slate-100">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-5 text-slate-400 mb-0.5">
                              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                              <circle cx="12" cy="13" r="4" />
                            </svg>
                            <span className="font-mono text-[9px] font-bold text-slate-500">
                              SLOT {slotIdx + 1}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-display text-xs font-bold text-slate-900">
                            Take {slotIdx + 1}
                          </span>
                          {photo && (
                            <span className="flex size-3.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-black text-white">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                          {photo
                            ? "Captured • Tap to retake"
                            : poseSuggestions[slotIdx] || "Ready for pose"}
                        </p>
                      </div>

                      {photo && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRetakeSlotIndex(slotIdx);
                          }}
                          className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer"
                        >
                          Retake
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div className="mt-2 pt-3 border-t border-slate-100 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={completedCount === 0}
                  onClick={() => setCurrentStep(3)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-primary font-display text-sm font-bold text-white shadow-[0_4px_0_#0f5298] hover:bg-[#1a82f0] active:translate-y-0.5 active:shadow-[0_1px_0_#0f5298] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>
                    {isAllPhotosTaken
                      ? "Decorate Strip →"
                      : `Continue with ${completedCount}/${slotCount} Shots →`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-center font-bold text-xs text-slate-500 hover:text-slate-800 hover:underline py-1 cursor-pointer"
                >
                  ← Change Layout Format
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* =========================================================================
            STEP 3: DECORATE STRIP, STICKERS & FILTER TONE (Normal, B&W, Grainy)
           ========================================================================= */}
        {currentStep === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Photocard Strip Preview */}
            <section className="lg:col-span-5 flex flex-col items-center justify-center gap-3">
              <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)] flex flex-col items-center">
                <div className="w-full flex justify-center py-2">
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

                {/* Selected Sticker Floating Toolbar */}
                {selectedSticker && (
                  <div className="w-full mt-3 flex items-center justify-between rounded-xl bg-slate-900 px-3 py-2 text-white shadow-md">
                    <span className="text-xs font-bold truncate max-w-[120px]">
                      {selectedSticker.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateSticker(selectedSticker.id, {
                            rotationDeg: (selectedSticker.rotationDeg - 15) % 360,
                          })
                        }
                        title="Rotate -15°"
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
                        title="Rotate +15°"
                        className="flex size-7 items-center justify-center rounded-lg bg-white/20 text-xs font-bold hover:bg-white/30 cursor-pointer"
                      >
                        ↻
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateSticker(selectedSticker.id, {
                            widthPercent: Math.max(12, selectedSticker.widthPercent - 4),
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
                            widthPercent: Math.min(52, selectedSticker.widthPercent + 4),
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
                        className="flex size-7 items-center justify-center rounded-lg bg-rose-600 text-xs font-bold hover:bg-rose-700 cursor-pointer ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
                {!selectedSticker && (
                  <p className="mt-2 text-center text-[11px] font-medium text-slate-400">
                    Touch or drag stickers on the strip to reposition
                  </p>
                )}
              </div>
            </section>

            {/* RIGHT COLUMN: Filter Tone, Stickers, Caption */}
            <aside className="lg:col-span-7 flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              {/* 1. Filter Tone: Only Normal, B&W, Grainy */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Photographic Film Filter Tone
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Adjusts photo mood
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "normal", name: "Normal", desc: "Natural Studio" },
                    { id: "bnw", name: "B&W", desc: "Monochrome" },
                    { id: "grainy", name: "Grainy", desc: "35mm Analog" },
                  ].map((f) => {
                    const isSelected = filter === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFilter(f.id as PhotoFilterId)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 font-display transition-all cursor-pointer ${
                          isSelected
                            ? "border-brand-primary bg-brand-primary text-white shadow-xs"
                            : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-xs font-bold">{f.name}</span>
                        <span className={`text-[10px] font-sans ${isSelected ? "text-white/80" : "text-slate-500"}`}>
                          {f.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Sticker Palette */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Sticker Picks
                  </label>

                  <div className="flex items-center gap-2">
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
                        <span>Clear All</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {[
                    { id: "all", label: "All Stickers" },
                    { id: "mascots", label: "Mascots" },
                    { id: "chords", label: "Chords" },
                    { id: "badges", label: "Stamps & Stars" },
                  ].map((tab) => {
                    const isTabActive = selectedStickerCategory === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSelectedStickerCategory(tab.id as typeof selectedStickerCategory)}
                        className={`rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          isTabActive
                            ? "bg-slate-900 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Roomy Sticker Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 max-h-[220px] overflow-y-auto p-3 border border-slate-200 rounded-xl bg-slate-50/60">
                  {filteredStickerPalette.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => handleAddSticker(asset)}
                      title={`Add ${asset.name}`}
                      className="group flex flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-2xs hover:border-brand-primary hover:bg-blue-50/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <div className="relative size-10">
                        <Image
                          src={asset.src}
                          alt={asset.name}
                          fill
                          className="object-contain transition-transform group-hover:scale-110"
                        />
                      </div>
                      <span className="font-sans text-[9px] font-bold text-slate-700 truncate max-w-full text-center">
                        {asset.name}
                      </span>
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-slate-400 font-medium">
                  Tap any sticker above to place on strip. Drag directly on the strip to position.
                </p>
              </div>

              {/* 3. Caption & Timestamp */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100">
                <label className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Strip Caption
                </label>
                <input
                  type="text"
                  maxLength={42}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. Acoustic Session • Chordisol Studio"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-brand-primary focus:bg-white transition-colors"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-medium text-slate-600">
                    Include Date &amp; Timestamp
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
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
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
                  <span>Finish &amp; Export →</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* =========================================================================
            STEP 4: SHARE AND DOWNLOAD (Ultra HD PNG & Mobile QR Code)
           ========================================================================= */}
        {currentStep === 4 && (
          <section className="flex flex-col items-center gap-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
            {/* Centered Photocard Strip */}
            <div className="relative my-2 flex justify-center py-5 px-6 sm:px-8 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-inner">
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

            {/* Share and Download Buttons */}
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
                ← Edit Stickers &amp; Tone
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
