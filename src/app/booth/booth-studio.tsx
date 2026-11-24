"use client";

import Image from "next/image";
import React, { useCallback, useMemo, useState } from "react";
import { CameraViewfinder } from "@/components/camera-viewfinder";
import { PhotoboothStrip } from "@/components/photobooth-strip";
import { BoothQrModal } from "@/components/booth-qr-modal";
import {
  FRAME_PRESETS,
  LAYOUT_VARIATIONS,
  PHOTO_FILTERS,
  STICKER_PALETTE,
  type FrameColorId,
  type LayoutVariationId,
  type PhotoFilterId,
  type StickerAsset,
  type StickerItem,
  type StripConfig,
} from "@/lib/booth-types";
import { downloadUltraHdStrip, exportCompressedStripForUpload } from "@/lib/canvasExport";

type WizardStep = 1 | 2 | 3 | 4;

const WIZARD_STEPS = [
  { step: 1 as WizardStep, label: "1. Layout & Style", desc: "Strip Variation & Frame" },
  { step: 2 as WizardStep, label: "2. Camera Booth", desc: "Sequential 4-Shot Capture" },
  { step: 3 as WizardStep, label: "3. Decorate", desc: "Stickers & Custom Caption" },
  { step: 4 as WizardStep, label: "4. Share & Print", desc: "Ultra HD & Phone QR" },
];

const POSE_HINTS = [
  "Pose 1 • The Acoustic Smile 🎸",
  "Pose 2 • Fingers on the Keys 🎹",
  "Pose 3 • The Listening Ear 🎧",
  "Pose 4 • Celebrate the Groove ✨",
];

const QUICK_CAPTIONS = [
  "Acoustic Session • Chordisol Studio",
  "Ear Training Certified 🎹",
  "Chords & Coffee • Studio Day",
  "Trust Your Ear 🎶",
  "100% Acoustic • Pure Harmony",
];

export function BoothStudio() {
  // 4-Step Wizard State: 1 (Layout) -> 2 (Camera) -> 3 (Decorate) -> 4 (Share)
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  // Retake targeted slot for Step 2
  const [retakeSlotIndex, setRetakeSlotIndex] = useState<number | null>(null);

  // Photos state: 4 slots strictly ordered
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null]);

  // Style & Customization
  const [frameColor, setFrameColor] = useState<FrameColorId>("classic-white");
  const [layoutVariation, setLayoutVariation] = useState<LayoutVariationId>("classic-top");
  const [filter, setFilter] = useState<PhotoFilterId>("original");
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [stickersVisible, setStickersVisible] = useState(true);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [stickerCategory, setStickerCategory] = useState<string>("all");

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

  // Strip config memo
  const currentStripConfig: StripConfig = useMemo(
    () => ({
      photos,
      frameColor,
      layoutVariation,
      filter,
      stickers,
      stickersVisible,
      caption,
      showDate,
      dateText,
    }),
    [photos, frameColor, layoutVariation, filter, stickers, stickersVisible, caption, showDate, dateText]
  );

  // Capture callback
  const handlePhotoCaptured = useCallback((slotIndex: number, dataUrl: string) => {
    setPhotos((prev) => {
      const next = [...prev];
      next[slotIndex] = dataUrl;
      return next;
    });
  }, []);

  // When 4-shot sequence completes -> offer move to Step 3
  const handleSequenceComplete = useCallback(() => {
    // Keep user in Step 2 so they can review their slots or retake, or automatically advance
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
    const ySpots = [22, 50, 78];

    const newItems: StickerItem[] = randomAssets.map((asset, i) => ({
      id: `sticker-${Date.now()}-${i}`,
      assetId: asset.id,
      src: asset.src,
      name: asset.name,
      xPercent: 20 + Math.random() * 60,
      yPercent: ySpots[i] + (Math.random() * 8 - 4),
      widthPercent: asset.defaultWidthPercent,
      rotationDeg: Math.floor(Math.random() * 30) - 15,
      zIndex: i + 1,
    }));

    setStickers(newItems);
  };

  const handleResetSession = () => {
    if (confirm("Reset photobooth session? This will clear all photos and stickers.")) {
      setPhotos([null, null, null, null]);
      setStickers([]);
      setSelectedStickerId(null);
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
      await downloadUltraHdStrip(currentStripConfig, `chordisol-4cut-${stripId}.png`);
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
  const isAllPhotosTaken = completedCount === 4;

  const filteredStickerPalette =
    stickerCategory === "all"
      ? STICKER_PALETTE
      : STICKER_PALETTE.filter((s) => s.category === stickerCategory);

  const selectedSticker = stickers.find((s) => s.id === selectedStickerId);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl">
        {/* Top Header & Step Progress Bar */}
        <header className="mb-6 flex flex-col md:flex-row items-center justify-between gap-3.5 rounded-2xl border-2 border-slate-900/10 bg-white p-3.5 sm:p-4 shadow-[0_4px_0_rgba(15,23,42,0.06)]">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-2xs">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="size-5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Acoustic Photobooth
                </h1>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold text-brand-primary border border-blue-200">
                  4-CUT STUDIO
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Step {currentStep} of 4 • {WIZARD_STEPS[currentStep - 1].desc}
              </p>
            </div>
          </div>

          {/* Stepper Navigation (4 Step Flow Matching Sketches) */}
          <nav aria-label="Photobooth steps" className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 p-1 overflow-x-auto no-scrollbar max-w-full">
            {WIZARD_STEPS.map((item) => {
              const isActive = currentStep === item.step;
              const isPast =
                item.step === 1 ||
                (item.step === 2 && currentStep >= 2) ||
                (item.step === 3 && completedCount > 0) ||
                (item.step === 4 && completedCount > 0);

              return (
                <button
                  key={item.step}
                  type="button"
                  disabled={!isPast}
                  onClick={() => {
                    setCurrentStep(item.step);
                    setRetakeSlotIndex(null);
                  }}
                  className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    isActive
                      ? "bg-brand-primary text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.step === 2 && isAllPhotosTaken && (
                    <span className="flex size-3.5 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Session Reset Action */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetSession}
              title="Reset Photobooth Session"
              className="flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all cursor-pointer"
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
            STEP 1: STRIP VARIATION PICKER (Matching Sketch 1)
            Side-by-side variations, frame color palette, and Enter Booth button
           ========================================================================= */}
        {currentStep === 1 && (
          <section className="flex flex-col gap-6 rounded-2xl border-2 border-slate-900/10 bg-white p-5 sm:p-8 shadow-[0_4px_0_rgba(15,23,42,0.06)]">
            {/* Step Heading */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex size-6 items-center justify-center rounded-full bg-brand-primary text-xs font-black text-white shadow-xs">
                    1
                  </span>
                  <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                    Choose Strip Variation &amp; Frame Tone
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Select your preferred photo layout and paper frame tone before stepping into the camera booth.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 font-mono text-xs font-bold text-brand-primary border border-blue-200">
                  {LAYOUT_VARIATIONS.find((v) => v.id === layoutVariation)?.name}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-bold text-slate-700 border border-slate-200">
                  {FRAME_PRESETS.find((f) => f.id === frameColor)?.name}
                </span>
              </div>
            </div>

            {/* 1. Side-by-Side Variations Gallery (Matching Sketch 1) */}
            <div className="space-y-3">
              <label className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider block">
                1. Select Strip Layout Variation
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {LAYOUT_VARIATIONS.map((variant) => {
                  const isSelected = layoutVariation === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setLayoutVariation(variant.id)}
                      className={`group flex flex-col justify-between rounded-2xl border-2 p-4 text-left transition-all cursor-pointer relative ${
                        isSelected
                          ? "border-brand-primary bg-brand-primary/[0.03] ring-2 ring-brand-primary/25 shadow-md"
                          : "border-slate-900/10 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-300"
                      }`}
                    >
                      {/* Top Header of Card */}
                      <div className="w-full flex items-center justify-between mb-3">
                        <span className="font-display text-sm font-bold text-slate-900">
                          {variant.name}
                        </span>
                        {isSelected ? (
                          <span className="flex size-5 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white shadow-xs">
                            ✓
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                            {variant.badge}
                          </span>
                        )}
                      </div>

                      {/* Miniature Strip Mockup */}
                      <div className="w-full py-2 flex justify-center">
                        <div className="w-[110px] h-[210px] rounded-xl border border-slate-300 bg-white p-2 shadow-xs flex flex-col justify-between transition-transform group-hover:scale-105">
                          {/* Mini Header based on variant */}
                          {variant.id === "centered-minimal" ? (
                            <div className="flex flex-col items-center">
                              <div className="size-2.5 rounded-xs bg-brand-primary mb-0.5" />
                              <div className="h-1 w-8 rounded-full bg-slate-300" />
                            </div>
                          ) : variant.id === "bottom-signature" ? (
                            <div className="h-0.5" />
                          ) : variant.id === "retro-studio" ? (
                            <div className="h-3 w-full rounded-xs bg-slate-800 flex items-center justify-center text-[6px] font-mono font-bold text-amber-300 tracking-wider">
                              CHORDISOL
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="size-2.5 rounded-xs bg-brand-primary" />
                              <div className="h-1 w-6 rounded-full bg-slate-300" />
                            </div>
                          )}

                          {/* 4 Photo Frames */}
                          <div className="flex flex-col gap-1.5 my-1.5">
                            {[0, 1, 2, 3].map((idx) => (
                              <div
                                key={idx}
                                className="h-[30px] w-full rounded-md bg-linear-to-br from-slate-200 to-slate-300 border border-slate-300/80 flex items-center justify-center text-[7px] font-mono text-slate-500 font-bold"
                              >
                                {idx + 1}
                              </div>
                            ))}
                          </div>

                          {/* Mini Footer */}
                          {variant.id === "bottom-signature" ? (
                            <div className="flex items-center justify-between pt-0.5 border-t border-slate-200">
                              <div className="size-2 rounded-xs bg-brand-primary" />
                              <div className="h-1 w-8 rounded-full bg-slate-400" />
                            </div>
                          ) : (
                            <div className="flex items-center justify-between pt-0.5 border-t border-slate-200">
                              <div className="h-1 w-10 rounded-full bg-slate-300" />
                              <div className="h-1 w-4 rounded-full bg-slate-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="mt-3 text-[11px] text-slate-500 leading-relaxed font-medium">
                        {variant.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Paper Frame Color Palette */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider">
                  2. Frame Paper &amp; Color Tone
                </label>
                <span className="text-xs font-bold text-brand-primary">
                  {FRAME_PRESETS.find((f) => f.id === frameColor)?.name}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {FRAME_PRESETS.map((preset) => {
                  const isSelected = frameColor === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setFrameColor(preset.id)}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-center transition-all cursor-pointer ${
                        isSelected
                          ? "border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20 shadow-xs"
                          : "border-slate-900/10 bg-slate-50 hover:bg-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <span
                        style={{
                          backgroundColor: preset.previewBg,
                          borderColor: preset.border,
                        }}
                        className="size-8 rounded-full border-2 shadow-xs transition-transform hover:scale-110 flex items-center justify-center"
                      >
                        {isSelected && (
                          <span
                            className={`text-xs font-black ${
                              preset.id === "midnight-navy" || preset.id === "charcoal-ink"
                                ? "text-white"
                                : "text-brand-primary"
                            }`}
                          >
                            ✓
                          </span>
                        )}
                      </span>
                      <span className="font-sans text-[11px] font-bold text-slate-800 truncate max-w-full">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Photographic Film Filter Tone */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider">
                  3. Photographic Film Filter Tone
                </label>
                <span className="text-xs font-semibold text-slate-500">
                  Can be changed anytime in decoration step
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {PHOTO_FILTERS.map((f) => {
                  const isSelected = filter === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFilter(f.id)}
                      className={`flex flex-col gap-1.5 rounded-xl border-2 p-2.5 text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20 shadow-xs"
                          : "border-slate-900/10 bg-slate-50 hover:bg-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-xs font-bold text-slate-800">
                          {f.name}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-black text-brand-primary">✓</span>
                        )}
                      </div>
                      <div
                        style={{ filter: f.css }}
                        className="h-7 w-full rounded-lg bg-linear-to-r from-amber-400 via-rose-400 to-sky-400 shadow-inner"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Proceed CTA Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-brand-primary px-8 font-display text-sm font-bold text-white shadow-[0_4px_0_#0f5298] hover:bg-[#1a82f0] active:translate-y-0.5 active:shadow-[0_1px_0_#0f5298] transition-all cursor-pointer"
              >
                <span>Enter Camera Booth (Step 2) →</span>
              </button>
            </div>
          </section>
        )}

        {/* =========================================================================
            STEP 2: CAMERA BOOTH & STACKED SLOTS (Matching Sketch 2)
            Left: Large Camera Viewfinder
            Right: Stacked Slots (1..N) with "click to retake pics"
           ========================================================================= */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Camera Viewfinder (lg:col-span-7) */}
            <section className="lg:col-span-7 flex flex-col gap-4">
              {retakeSlotIndex !== null && (
                <div className="flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 font-semibold shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Retaking Shot {retakeSlotIndex + 1} only. Pose and snap!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRetakeSlotIndex(null)}
                    className="font-bold underline hover:text-amber-950 cursor-pointer"
                  >
                    Cancel Retake
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
              />
            </section>

            {/* RIGHT COLUMN: Stacked Photo Slots (lg:col-span-5) (Matching Sketch 2) */}
            <aside className="lg:col-span-5 flex flex-col gap-3 rounded-2xl border-2 border-slate-900/10 bg-white p-4 sm:p-5 shadow-[0_4px_0_rgba(15,23,42,0.06)]">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    Photo Slots (1 → 4)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tap any captured shot to retake that pose.
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-brand-primary rounded-full bg-blue-50 px-2.5 py-0.5 border border-blue-200">
                  {completedCount}/4 Captured
                </span>
              </div>

              {/* Stacked Vertical Slots (Matching Sketch 2) */}
              <div className="flex flex-col gap-2.5">
                {[0, 1, 2, 3].map((slotIdx) => {
                  const photo = photos[slotIdx];
                  const isRetakingThis = retakeSlotIndex === slotIdx;
                  const isNextSequential =
                    retakeSlotIndex === null &&
                    photos.findIndex((p) => p === null) === slotIdx;

                  return (
                    <div
                      key={slotIdx}
                      onClick={() => {
                        if (photo) {
                          setRetakeSlotIndex(slotIdx);
                        }
                      }}
                      className={`group relative flex items-center gap-3 rounded-xl border-2 p-2.5 transition-all cursor-pointer ${
                        isRetakingThis
                          ? "border-amber-400 bg-amber-50/60 ring-2 ring-amber-300/50 shadow-xs"
                          : isNextSequential
                          ? "border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary/20"
                          : photo
                          ? "border-slate-900/10 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
                          : "border-dashed border-slate-200 bg-slate-50/50"
                      }`}
                    >
                      {/* Thumbnail or Placeholder */}
                      <div className="relative aspect-4/3 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-900 border border-slate-200">
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
                          <div className="flex size-full flex-col items-center justify-center text-slate-400">
                            <span className="font-mono text-xs font-bold">#{slotIdx + 1}</span>
                          </div>
                        )}
                      </div>

                      {/* Slot Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-xs font-bold text-slate-900">
                            Shot {slotIdx + 1}
                          </span>
                          {photo && (
                            <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 font-mono text-[9px] font-bold text-emerald-700">
                              Captured
                            </span>
                          )}
                          {isRetakingThis && (
                            <span className="rounded-full bg-amber-100 px-1.5 py-0.2 font-mono text-[9px] font-bold text-amber-800">
                              Retaking
                            </span>
                          )}
                          {isNextSequential && (
                            <span className="rounded-full bg-blue-100 px-1.5 py-0.2 font-mono text-[9px] font-bold text-brand-primary">
                              Up Next
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {POSE_HINTS[slotIdx]}
                        </p>
                      </div>

                      {/* Click to Retake Action */}
                      {photo ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRetakeSlotIndex(slotIdx);
                          }}
                          className="shrink-0 flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs hover:bg-slate-100 group-hover:border-slate-300"
                        >
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="size-3 text-slate-500">
                            <path d="M2.5 8a5.5 5.5 0 1 1 1.2 3.4M2.5 12V8h4" />
                          </svg>
                          <span>Retake</span>
                        </button>
                      ) : (
                        <span className="shrink-0 text-[10px] font-semibold text-slate-400 px-2">
                          Empty
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 mt-1 border-t border-slate-100 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={completedCount === 0}
                  onClick={() => setCurrentStep(3)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-primary font-display text-sm font-bold text-white shadow-[0_4px_0_#0f5298] hover:bg-[#1a82f0] active:translate-y-0.5 active:shadow-[0_1px_0_#0f5298] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>
                    {isAllPhotosTaken
                      ? "Decorate Strip (Step 3) →"
                      : `Proceed with ${completedCount}/4 Shots (Step 3) →`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-center font-bold text-xs text-slate-500 hover:text-slate-800 hover:underline py-1 cursor-pointer"
                >
                  ← Back to Layout Style
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* =========================================================================
            STEP 3: DECORATE STRIP & STICKER STUDIO (Matching Sketch 3)
            Left: Interactive Photobooth Strip Preview
            Right: "Sticker Picks", Caption, and Customization Panel
           ========================================================================= */}
        {currentStep === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Strip Canvas (lg:col-span-5) (Matching Sketch 3) */}
            <section className="lg:col-span-5 flex flex-col items-center justify-center gap-3">
              <div className="w-full rounded-2xl border-2 border-slate-900/10 bg-white p-4 sm:p-5 shadow-[0_8px_30px_rgba(15,23,42,0.08)] flex flex-col items-center">
                <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span className="font-display text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Interactive Strip Canvas
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Drag / tap stickers to position
                  </span>
                </div>

                {/* The Strip */}
                <div className="w-full flex justify-center py-1">
                  <PhotoboothStrip
                    photos={photos}
                    frameColor={frameColor}
                    layoutVariation={layoutVariation}
                    filter={filter}
                    stickers={stickers}
                    stickersVisible={stickersVisible}
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

            {/* RIGHT COLUMN: Sticker Picks & Text Customization (lg:col-span-7) (Matching Sketch 3) */}
            <aside className="lg:col-span-7 flex flex-col gap-5 rounded-2xl border-2 border-slate-900/10 bg-white p-5 sm:p-7 shadow-[0_4px_0_rgba(15,23,42,0.06)]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-display text-lg font-black text-slate-900 leading-tight">
                    Sticker Picks &amp; Session Caption
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Tap stickers to add them to your strip. Drag, rotate, and style freely!
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleShuffleStickers}
                    className="flex h-8 items-center gap-1 rounded-full bg-brand-primary/10 px-3 text-xs font-bold text-brand-primary hover:bg-brand-primary/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>🎲 Auto-Decorate</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStickersVisible((v) => !v)}
                    className="flex h-8 items-center gap-1 rounded-full bg-slate-100 px-3 text-xs font-bold text-slate-700 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>{stickersVisible ? "Hide" : "Show"}</span>
                  </button>

                  {stickers.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearStickers}
                      className="flex h-8 items-center gap-1 rounded-full bg-rose-50 px-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 active:scale-95 transition-all cursor-pointer"
                    >
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 1. Sticker Picks Categories */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider">
                    1. Sticker Picks Palette
                  </label>
                  <span className="text-xs text-slate-500 font-semibold">
                    {stickers.length} on strip
                  </span>
                </div>

                {/* Category Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {[
                    { id: "all", label: "All Items" },
                    { id: "mascots", label: "🎵 Mascots" },
                    { id: "chords", label: "🎹 Chords" },
                    { id: "badges", label: "⭐ Stamps" },
                    { id: "sparkles", label: "✨ Accents" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setStickerCategory(cat.id)}
                      className={`h-7 rounded-full px-3 text-xs font-semibold transition-all cursor-pointer ${
                        stickerCategory === cat.id
                          ? "bg-slate-900 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Sticker Picks Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-[220px] overflow-y-auto p-2.5 border rounded-xl border-slate-100 bg-slate-50">
                  {filteredStickerPalette.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => handleAddSticker(asset)}
                      title={`Add ${asset.name}`}
                      className="group flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-slate-900/10 bg-white p-2 shadow-2xs hover:border-brand-primary hover:bg-brand-primary/5 active:scale-95 transition-all cursor-pointer"
                    >
                      <div className="relative size-11">
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
              </div>

              {/* 2. Custom Session Caption & Date */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <label className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  2. Custom Session Caption
                </label>

                <input
                  type="text"
                  maxLength={42}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. Acoustic Session • Chordisol Studio"
                  className="w-full rounded-xl border-2 border-slate-900/10 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-brand-primary focus:bg-white transition-colors"
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {QUICK_CAPTIONS.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCaption(preset)}
                      className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-brand-primary/10 hover:text-brand-primary hover:border-brand-primary/30 active:scale-95 transition-all cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Date & Timestamp Switch */}
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 mt-2">
                  <div>
                    <p className="font-sans text-xs font-bold text-slate-800">
                      Display Date &amp; Timestamp
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Prints today&apos;s session timestamp next to the retro barcode.
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={showDate}
                    onClick={() => setShowDate((v) => !v)}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                      showDate ? "bg-brand-primary" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block size-4.5 rounded-full bg-white shadow-xs transition-transform ${
                        showDate ? "translate-x-5.5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* 3. Film Filter Quick Adjust */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <label className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  3. Photographic Film Filter
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PHOTO_FILTERS.map((f) => {
                    const isSelected = filter === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFilter(f.id)}
                        className={`rounded-lg border p-1.5 text-center text-[10px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "border-brand-primary bg-brand-primary text-white shadow-xs"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {f.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer Navigation */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="font-bold text-xs text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                >
                  ← Back to Camera (Step 2)
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="flex h-12 items-center justify-center gap-2 rounded-full bg-brand-primary px-8 font-display text-sm font-bold text-white shadow-[0_4px_0_#0f5298] hover:bg-[#1a82f0] active:translate-y-0.5 active:shadow-[0_1px_0_#0f5298] transition-all cursor-pointer"
                >
                  <span>Finish &amp; Share (Step 4) →</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* =========================================================================
            STEP 4: SHARE & DOWNLOAD (Matching Sketch 4)
            Centered Finished Strip, 3.5x Ultra HD Download & Phone QR
           ========================================================================= */}
        {currentStep === 4 && (
          <section className="flex flex-col items-center gap-6 rounded-2xl border-2 border-slate-900/10 bg-white p-5 sm:p-8 shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
            {/* Header */}
            <div className="text-center max-w-lg">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-mono text-xs font-bold text-emerald-700 border border-emerald-200 mb-2">
                <span>✓</span>
                <span>4-CUT STRIP COMPLETE</span>
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                Your Photobooth Strip is Ready! 🎉
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-medium">
                Lossless Ultra HD export for physical photo prints, and instant QR scan to save directly to your phone.
              </p>
            </div>

            {/* Centered Strip Display (Matching Sketch 4) */}
            <div className="relative my-2 flex justify-center py-4 px-6 rounded-3xl bg-linear-to-b from-slate-50 to-slate-100/60 border border-slate-200/80 shadow-inner">
              <PhotoboothStrip
                photos={photos}
                frameColor={frameColor}
                layoutVariation={layoutVariation}
                filter={filter}
                stickers={stickers}
                stickersVisible={stickersVisible}
                caption={caption}
                showDate={showDate}
                dateText={dateText}
              />
            </div>

            {/* Primary Action Buttons (Matching Sketch 4) */}
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

            {/* Auxiliary Navigation */}
            <div className="pt-2 flex items-center gap-6 text-xs font-bold text-slate-500">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="hover:text-brand-primary hover:underline cursor-pointer"
              >
                ← Back to Edit Stickers &amp; Caption
              </button>

              <span className="text-slate-300">•</span>

              <button
                type="button"
                onClick={handleResetSession}
                className="hover:text-rose-600 hover:underline cursor-pointer"
              >
                ↺ Start New Photobooth Session
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
