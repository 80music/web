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

type WizardStep = 1 | 2 | 3 | 4 | 5;

const WIZARD_STEPS = [
  { step: 1 as WizardStep, label: "1. Style", desc: "Frame & Tone" },
  { step: 2 as WizardStep, label: "2. Camera", desc: "4 Shots" },
  { step: 3 as WizardStep, label: "3. Review", desc: "Check & Retake" },
  { step: 4 as WizardStep, label: "4. Decorate", desc: "Stickers & Text" },
  { step: 5 as WizardStep, label: "5. Share", desc: "Ultra HD & QR" },
];

const QUICK_CAPTIONS = [
  "Acoustic Session • Chordisol Studio",
  "Ear Training Certified 🎹",
  "Chords & Coffee • Studio Day",
  "Trust Your Ear 🎶",
  "100% Acoustic • Pure Harmony",
];

export function BoothStudio() {
  // 5-Step Wizard State: 1 -> 2 -> 3 -> 4 -> 5
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  // Retake targeted slot for Step 3
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

  // When 4-shot sequence completes -> advance to Step 3 (Review)
  const handleSequenceComplete = useCallback(() => {
    setCurrentStep(3);
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

  const handleShuffleStyle = () => {
    const randomFrame = FRAME_PRESETS[Math.floor(Math.random() * FRAME_PRESETS.length)].id;
    const randomLayout = LAYOUT_VARIATIONS[Math.floor(Math.random() * LAYOUT_VARIATIONS.length)].id;
    const randomFilter = PHOTO_FILTERS[Math.floor(Math.random() * PHOTO_FILTERS.length)].id;

    setFrameColor(randomFrame);
    setLayoutVariation(randomLayout);
    setFilter(randomFilter);
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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl">
        {/* Top Navigation & Stepper Bar */}
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
                Step {currentStep} of 5 • {WIZARD_STEPS[currentStep - 1].desc}
              </p>
            </div>
          </div>

          {/* Stepper Navigation (5 Step Directions) */}
          <nav aria-label="Photobooth steps" className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 p-1 overflow-x-auto no-scrollbar max-w-full">
            {WIZARD_STEPS.map((item) => {
              const isActive = currentStep === item.step;
              const isPast =
                item.step === 1 ||
                (item.step === 2 && currentStep >= 2) ||
                (item.step === 3 && isAllPhotosTaken) ||
                (item.step === 4 && isAllPhotosTaken) ||
                (item.step === 5 && isAllPhotosTaken);

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
                  {item.step < currentStep && isAllPhotosTaken && (
                    <span className="flex size-3.5 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShuffleStyle}
              title="Shuffle Random Theme & Filter"
              className="flex h-9 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            >
              <span>🎲 Shuffle</span>
            </button>

            <button
              type="button"
              onClick={handleResetSession}
              title="Reset Photobooth Session"
              className="flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
            </button>
          </div>
        </header>

        {/* 2-Column Studio Main Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (7 cols): Active Step Card */}
          <section className="lg:col-span-7 flex flex-col gap-4">
            {/* STEP 1: CHOOSE STYLE & LAYOUT */}
            {currentStep === 1 && (
              <div className="flex flex-col gap-6 rounded-2xl border-2 border-slate-900/10 bg-white p-5 sm:p-7 shadow-[0_4px_0_rgba(15,23,42,0.06)]">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <span className="flex size-7 items-center justify-center rounded-full bg-brand-primary text-xs font-black text-white shadow-xs">
                    1
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-black text-slate-900 leading-tight">
                      Choose Photobooth Style &amp; Layout
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Pick your paper frame, header layout, and film tone before entering the booth.
                    </p>
                  </div>
                </div>

                {/* 1. Frame Paper Color Theme */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider">
                      1. Frame Paper &amp; Color Theme
                    </label>
                    <span className="text-xs font-semibold text-brand-primary">
                      {FRAME_PRESETS.find((f) => f.id === frameColor)?.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {FRAME_PRESETS.map((preset) => {
                      const isSelected = frameColor === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setFrameColor(preset.id)}
                          className={`flex items-center gap-2.5 rounded-xl border-2 p-2.5 text-left transition-all cursor-pointer ${
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
                            className="size-6 shrink-0 rounded-full border-2 shadow-xs"
                          />
                          <span className="font-sans text-xs font-bold text-slate-800 truncate">
                            {preset.name}
                          </span>
                          {isSelected && (
                            <span className="text-brand-primary text-xs font-bold ml-auto">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Logo Placement & Header Format */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider block">
                    2. Logo Placement &amp; Header Format
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {LAYOUT_VARIATIONS.map((variant) => {
                      const isSelected = layoutVariation === variant.id;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => setLayoutVariation(variant.id)}
                          className={`flex flex-col gap-1 rounded-xl border-2 p-3 text-left transition-all cursor-pointer ${
                            isSelected
                              ? "border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20 shadow-xs"
                              : "border-slate-900/10 bg-slate-50 hover:bg-slate-100 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-display text-xs font-bold text-slate-900">
                              {variant.name}
                            </span>
                            {isSelected && (
                              <span className="flex size-4 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-white">
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            {variant.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Photographic Film Filter */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider block">
                    3. Photographic Film Filter
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
                            <span className="text-[10px] font-semibold text-slate-500">
                              {f.badge}
                            </span>
                          </div>
                          <div
                            style={{ filter: f.css }}
                            className="h-8 w-full rounded-lg bg-linear-to-r from-amber-400 via-rose-400 to-sky-400 shadow-inner"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Next Action Button (User's tactile keycap button) */}
                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-brand-primary px-8 font-display text-sm font-bold text-white shadow-[0_4px_0_#0f5298] hover:bg-[#1a82f0] active:translate-y-0.5 active:shadow-[0_1px_0_#0f5298] transition-all cursor-pointer"
                  >
                    <span>Proceed to Live Camera (Step 2) →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: LIVE CAMERA (Strictly ordered 1 -> 2 -> 3 -> 4, no picking slots) */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-4">
                <CameraViewfinder
                  photos={photos}
                  onPhotoCaptured={handlePhotoCaptured}
                  onSequenceComplete={handleSequenceComplete}
                  mode="sequence"
                />

                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="font-bold text-xs text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                  >
                    ← Back to Style (Step 1)
                  </button>

                  {completedCount === 4 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="flex h-10 items-center gap-1.5 rounded-full bg-brand-primary px-5 font-display text-xs font-bold text-white shadow-[0_3px_0_#0f5298] hover:bg-[#1a82f0] active:translate-y-0.5 active:shadow-[0_1px_0_#0f5298] transition-all cursor-pointer"
                    >
                      <span>Review Shots (Step 3) →</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW CANDID SHOTS (Check & Retake targeted shot) */}
            {currentStep === 3 && (
              <div className="flex flex-col gap-5 rounded-2xl border-2 border-slate-900/10 bg-white p-5 sm:p-7 shadow-[0_4px_0_rgba(15,23,42,0.06)]">
                {retakeSlotIndex !== null ? (
                  /* Focused Retake Viewfinder for targeted slot */
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 font-semibold">
                      <span>Retaking Shot {retakeSlotIndex + 1} only. Pose and snap!</span>
                      <button
                        type="button"
                        onClick={() => setRetakeSlotIndex(null)}
                        className="underline hover:text-amber-950 cursor-pointer font-bold"
                      >
                        Cancel Retake
                      </button>
                    </div>

                    <CameraViewfinder
                      photos={photos}
                      onPhotoCaptured={handlePhotoCaptured}
                      mode="retake"
                      retakeSlot={retakeSlotIndex}
                      onRetakeDone={() => setRetakeSlotIndex(null)}
                      onCancelRetake={() => setRetakeSlotIndex(null)}
                    />
                  </div>
                ) : (
                  /* 4-Shot Review Gallery */
                  <>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white shadow-xs">
                          3
                        </span>
                        <div>
                          <h2 className="font-display text-lg font-black text-slate-900 leading-tight">
                            Review Your 4 Shots
                          </h2>
                          <p className="text-xs text-slate-500 font-medium">
                            Check your poses. Tap Retake on any individual shot you want to re-do!
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setPhotos([null, null, null, null]);
                          setCurrentStep(2);
                        }}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                      >
                        ↺ Retake All
                      </button>
                    </div>

                    {/* 4 Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[0, 1, 2, 3].map((idx) => {
                        const photo = photos[idx];
                        return (
                          <div
                            key={idx}
                            className="flex flex-col rounded-xl border-2 border-slate-900/10 bg-slate-50 p-2.5 shadow-2xs"
                          >
                            <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-slate-900 border border-slate-200">
                              {photo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={photo}
                                  alt={`Shot ${idx + 1}`}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <div className="flex size-full items-center justify-center text-xs text-white/50">
                                  Empty
                                </div>
                              )}
                              <span className="absolute top-1.5 left-1.5 rounded-full bg-slate-900/80 px-2 py-0.5 font-mono text-[9px] font-bold text-white">
                                Shot {idx + 1}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setRetakeSlotIndex(idx)}
                              className="mt-2.5 flex h-8 w-full items-center justify-center gap-1 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
                            >
                              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="size-3 text-slate-500">
                                <path d="M2.5 8a5.5 5.5 0 1 1 1.2 3.4M2.5 12V8h4" />
                              </svg>
                              <span>Retake Shot {idx + 1}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer Navigation */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
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
                        <span>Confirm &amp; Decorate (Step 4) →</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STEP 4: DECORATE (Stickers, Caption & Date) */}
            {currentStep === 4 && (
              <div className="flex flex-col gap-6 rounded-2xl border-2 border-slate-900/10 bg-white p-5 sm:p-7 shadow-[0_4px_0_rgba(15,23,42,0.06)]">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <span className="flex size-7 items-center justify-center rounded-full bg-brand-primary text-xs font-black text-white shadow-xs">
                    4
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-black text-slate-900 leading-tight">
                      Decorate Your Strip
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Add Chordisol mascots, chord blocks, stamps, and a custom caption.
                    </p>
                  </div>
                </div>

                {/* 1. Stickers Palette */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Stickers &amp; Chord Blocks
                    </label>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleShuffleStickers}
                        className="flex h-8 items-center gap-1 rounded-full bg-brand-primary/10 px-3 text-xs font-bold text-brand-primary hover:bg-brand-primary/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <span>🎲 Shuffle</span>
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

                  {/* Filter chips */}
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

                  {/* Sticker grid */}
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-[190px] overflow-y-auto p-2 border rounded-xl border-slate-100 bg-slate-50">
                    {filteredStickerPalette.map((asset) => (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => handleAddSticker(asset)}
                        title={`Add ${asset.name}`}
                        className="group flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-slate-900/10 bg-white p-2 shadow-2xs hover:border-brand-primary hover:bg-brand-primary/5 active:scale-95 transition-all cursor-pointer"
                      >
                        <div className="relative size-10">
                          <Image
                            src={asset.src}
                            alt={asset.name}
                            fill
                            className="object-contain transition-transform group-hover:scale-110"
                          />
                        </div>
                        <span className="font-sans text-[9.5px] font-bold text-slate-700 truncate max-w-full">
                          {asset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Custom Caption & Date */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <label className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider block">
                    Custom Session Caption
                  </label>

                  <input
                    type="text"
                    maxLength={42}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="e.g. Acoustic Session • Chordisol Studio"
                    className="w-full rounded-xl border-2 border-slate-900/10 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-brand-primary focus:bg-white transition-colors"
                  />

                  {/* Quick Suggestions */}
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

                  {/* Date Switch */}
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 mt-2">
                    <div>
                      <p className="font-sans text-xs font-bold text-slate-800">
                        Display Date &amp; Timestamp
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Prints today&apos;s session date next to the retro barcode.
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

                {/* Footer Navigation */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="font-bold text-xs text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                  >
                    ← Back to Review (Step 3)
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="flex h-12 items-center justify-center gap-2 rounded-full bg-brand-primary px-8 font-display text-sm font-bold text-white shadow-[0_4px_0_#0f5298] hover:bg-[#1a82f0] active:translate-y-0.5 active:shadow-[0_1px_0_#0f5298] transition-all cursor-pointer"
                  >
                    <span>Finish &amp; Save Strip (Step 5) →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: SHARE & DOWNLOAD */}
            {currentStep === 5 && (
              <div className="flex flex-col gap-5 rounded-2xl border-2 border-slate-900/10 bg-white p-5 sm:p-7 shadow-[0_4px_0_rgba(15,23,42,0.06)]">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <span className="flex size-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white shadow-xs">
                    5
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-black text-slate-900 leading-tight">
                      Your 4-Cut Photobooth Strip is Ready! 🎉
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Download in full print resolution or scan the QR code to save directly to your phone.
                    </p>
                  </div>
                </div>

                {/* 2 Export Action Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Ultra HD Card */}
                  <div className="flex flex-col justify-between rounded-xl border-2 border-brand-primary/30 bg-blue-50/50 p-4 sm:p-5">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-display text-xs font-bold text-brand-primary uppercase tracking-wide">
                          Physical Print
                        </span>
                        <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-brand-primary">
                          1200 × 3792 px
                        </span>
                      </div>
                      <h3 className="font-display text-base font-bold text-slate-900">
                        3.5x Ultra HD PNG
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Lossless full-resolution export styled with brand typography, ready for framing or scrapbooks.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isDownloading}
                      onClick={handleDownloadUltraHd}
                      className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-primary font-display text-sm font-bold text-white shadow-[0_4px_0_#0f5298] hover:bg-[#1a82f0] active:translate-y-0.5 active:shadow-[0_1px_0_#0f5298] transition-all cursor-pointer disabled:opacity-50"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} className="size-4.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span>{isDownloading ? "Generating..." : "Download Ultra HD PNG"}</span>
                    </button>
                  </div>

                  {/* Mobile QR Card */}
                  <div className="flex flex-col justify-between rounded-xl border-2 border-slate-900/10 bg-slate-50 p-4 sm:p-5">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-display text-xs font-bold text-slate-800 uppercase tracking-wide">
                          Camera Roll
                        </span>
                        <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600 border border-slate-200">
                          Instant Scan
                        </span>
                      </div>
                      <h3 className="font-display text-base font-bold text-slate-900">
                        Mobile QR Code
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Point your iPhone or Android camera at the screen to open the web viewer with 1-tap Save to Photos.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={handleOpenMobileQr}
                      className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-slate-200 bg-white font-display text-sm font-bold text-slate-800 shadow-2xs hover:bg-slate-100 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4.5 text-brand-primary">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                      <span>{isUploading ? "Uploading..." : "Generate Mobile QR Code"}</span>
                    </button>
                  </div>
                </div>

                {/* Footer Navigation */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="font-bold text-brand-primary hover:underline cursor-pointer"
                  >
                    ← Back to Edit Stickers &amp; Caption
                  </button>

                  <button
                    type="button"
                    onClick={handleResetSession}
                    className="font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    ↺ Start New Photobooth Session
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* RIGHT COLUMN (5 cols): Screen-Fitted Photobooth Strip Pedestal */}
          <aside className="lg:col-span-5 flex flex-col items-center justify-center gap-3 lg:sticky lg:top-20">
            <div className="w-full rounded-2xl border-2 border-slate-900/10 bg-white p-4 sm:p-5 shadow-[0_8px_30px_rgba(15,23,42,0.08)] flex flex-col items-center">
              {/* Header Label */}
              <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-display text-xs font-bold text-slate-800 uppercase tracking-wider">
                    4-Cut Strip Preview
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-slate-500">
                  {completedCount}/4 SHOTS
                </span>
              </div>

              {/* Physical Photobooth Strip */}
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
                    setCurrentStep(3);
                  }}
                />
              </div>

              {/* Bottom Quick Actions */}
              <div className="w-full flex items-center gap-2.5 pt-4 mt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isDownloading}
                  onClick={handleDownloadUltraHd}
                  className="flex-1 flex h-11 items-center justify-center gap-2 rounded-full bg-brand-primary text-white font-display text-xs font-bold shadow-[0_4px_0_#0f5298] hover:bg-[#1a82f0] active:translate-y-0.5 active:shadow-[0_1px_0_#0f5298] transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} className="size-4">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>{isDownloading ? "Generating..." : "3.5x Ultra HD"}</span>
                </button>

                <button
                  type="button"
                  disabled={isUploading}
                  onClick={handleOpenMobileQr}
                  className="flex-1 flex h-11 items-center justify-center gap-2 rounded-full border-2 border-slate-200 bg-white text-slate-800 font-display text-xs font-bold shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4 text-brand-primary">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  <span>{isUploading ? "Uploading..." : "Phone QR"}</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
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
