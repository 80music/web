"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BoothLayoutPicker } from "@/components/booth-layout-picker";
import { CameraViewfinder } from "@/components/camera-viewfinder";
import { PhotoReviewGrid } from "@/components/photo-review-grid";
import { PhotoboothStrip } from "@/components/photobooth-strip";
import { BoothCustomizerToolbar } from "@/components/booth-customizer-toolbar";
import { BoothQrModal } from "@/components/booth-qr-modal";
import {
  STICKER_PALETTE,
  STICKER_PRESETS,
  type FrameColorId,
  type LayoutVariationId,
  type PhotoFilterId,
  type StickerAsset,
  type StickerItem,
  type StripConfig,
} from "@/lib/booth-types";
import {
  downloadUltraHdStrip,
  exportCompressedStripForUpload,
} from "@/lib/canvasExport";

type WizardStep = 1 | 2 | 3 | 4 | 5;

const WIZARD_STEPS = [
  { step: 1 as WizardStep, title: "1. Style", desc: "Logo & Frame" },
  { step: 2 as WizardStep, title: "2. Camera", desc: "4 Shots" },
  { step: 3 as WizardStep, title: "3. Review", desc: "Check & Retake" },
  { step: 4 as WizardStep, title: "4. Decorate", desc: "Stickers & Text" },
  { step: 5 as WizardStep, title: "5. Share", desc: "Ultra HD & QR" },
];

export function BoothStudio() {
  // Wizard current step: 1 (Style) -> 2 (Camera) -> 3 (Review) -> 4 (Decorate) -> 5 (Share)
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  // Retake targeted slot for Step 3 (null when in standard review)
  const [retakeSlotIndex, setRetakeSlotIndex] = useState<number | null>(null);

  // Layout variation: "classic-top" | "centered-minimal" | "bottom-signature" | "retro-studio"
  const [layoutVariation, setLayoutVariation] = useState<LayoutVariationId>("classic-top");

  // Photos state: 4 slots strictly ordered
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null]);

  // Customization state
  const [frameColor, setFrameColor] = useState<FrameColorId>("classic-white");
  const [filter, setFilter] = useState<PhotoFilterId>("original");
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [stickersVisible, setStickersVisible] = useState(true);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  const [caption, setCaption] = useState("Acoustic Session • Chordisol Studio");
  const [showDate, setShowDate] = useState(true);
  const [dateText, setDateText] = useState("");
  const [stripId, setStripId] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
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
      setStripId(
        Math.random().toString(36).substring(2, 9) + Date.now().toString(36).slice(-4)
      );
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Export / QR states
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

  // Assemble full strip configuration memoized
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

  // Photo capture handler
  const handlePhotoCaptured = useCallback((slotIndex: number, dataUrl: string) => {
    setPhotos((prev) => {
      const next = [...prev];
      next[slotIndex] = dataUrl;
      return next;
    });
  }, []);

  // Sequential capture complete -> advance automatically to Step 3 (Review)
  const handleSequenceComplete = useCallback(() => {
    setCurrentStep(3);
  }, []);

  // Sticker Actions
  const handleAddSticker = (asset: StickerAsset) => {
    const jitterX = Math.floor(Math.random() * 20) - 10;
    const jitterY = Math.floor(Math.random() * 20) - 10;
    const jitterRot = Math.floor(Math.random() * 24) - 12;

    const maxZ = stickers.reduce((max, s) => Math.max(max, s.zIndex), 1);
    const newSticker: StickerItem = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      assetId: asset.id,
      src: asset.src,
      name: asset.name,
      xPercent: 50 + jitterX,
      yPercent: 40 + jitterY,
      widthPercent: asset.defaultWidthPercent,
      rotationDeg: jitterRot,
      zIndex: maxZ + 1,
    };

    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

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
    setSelectedStickerId(null);
  }, []);

  const handleApplyStickerPreset = (presetId: string) => {
    const template = STICKER_PRESETS.find((p) => p.id === presetId);
    if (!template) return;

    const instantiated: StickerItem[] = template.stickers.map((s, index) => ({
      ...s,
      id: `preset-${presetId}-${index}-${Date.now()}`,
    }));

    setStickers(instantiated);
    setSelectedStickerId(null);
  };

  // 🎲 Scatter / Shuffle Stickers
  const handleShuffleStickers = () => {
    const shuffledAssets = [...STICKER_PALETTE].sort(() => 0.5 - Math.random());
    const count = 4 + Math.floor(Math.random() * 2);
    const selectedAssets = shuffledAssets.slice(0, count);

    const newStickers: StickerItem[] = selectedAssets.map((asset, index) => {
      const yZone = 12 + index * 18 + Math.floor(Math.random() * 8);
      const xPos = index % 2 === 0 ? 18 + Math.floor(Math.random() * 12) : 80 - Math.floor(Math.random() * 12);
      const randomRot = Math.floor(Math.random() * 32) - 16;

      return {
        id: `shuffle-${index}-${Date.now()}`,
        assetId: asset.id,
        src: asset.src,
        name: asset.name,
        xPercent: xPos,
        yPercent: yZone,
        widthPercent: asset.defaultWidthPercent,
        rotationDeg: randomRot,
        zIndex: index + 1,
      };
    });

    setStickers(newStickers);
    setSelectedStickerId(null);
  };

  const handleClearStickers = () => {
    setStickers([]);
    setSelectedStickerId(null);
  };

  // Ultra HD Download
  const handleDownloadUltraHd = async () => {
    setIsDownloading(true);
    try {
      await downloadUltraHdStrip(
        currentStripConfig,
        `chordisol-strip-${stripId || "session"}.png`
      );
    } catch (err) {
      console.error("High-Res download error:", err);
      alert("Unable to generate image. Please ensure photos and assets are loaded.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Mobile QR Code Pipeline
  const handleOpenMobileQr = async () => {
    setIsUploading(true);
    try {
      const compressedDataUrl = await exportCompressedStripForUpload(currentStripConfig);

      const res = await fetch("/api/upload-strip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: compressedDataUrl,
          stripId,
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

  // Reset entire session
  const handleResetSession = () => {
    if (confirm("Reset photobooth session? This will clear all photos and stickers.")) {
      setPhotos([null, null, null, null]);
      setStickers([]);
      setSelectedStickerId(null);
      setCurrentStep(1);
      setRetakeSlotIndex(null);
      setStripId(Math.random().toString(36).substring(2, 9) + Date.now().toString(36).slice(-4));
    }
  };

  const completedCount = photos.filter(Boolean).length;
  const isAllPhotosTaken = completedCount === 4;

  return (
    <div className="min-h-screen bg-linear-to-b from-[#f8fafc] via-[#f0f5fc] to-[#eaf2fc] px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-7xl">
        {/* Top Stepper Navigation Bar */}
        <header className="mb-6 flex flex-col md:flex-row items-center justify-between gap-3.5 rounded-[22px] border-2 border-slate-900/10 bg-white/90 dark:bg-slate-900/90 p-3 sm:p-4 shadow-[0_4px_0_rgba(15,23,42,0.06)] backdrop-blur-xl">
          {/* Branding */}
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-[12px] bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-2xs">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="size-5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-base sm:text-lg font-black text-fg-display leading-tight">
                  Acoustic Photobooth
                </h1>
                <span className="hidden sm:inline-block rounded-full bg-surface-secondary px-2 py-0.5 font-mono text-[10px] font-bold text-text-muted border border-border-subtle">
                  4-CUT WIZARD
                </span>
              </div>
              <p className="text-xs text-text-muted font-medium">
                Step {currentStep} of 5 • {WIZARD_STEPS[currentStep - 1].desc}
              </p>
            </div>
          </div>

          {/* Stepper Wizard Controls */}
          <nav aria-label="Photobooth steps" className="flex items-center gap-1 rounded-full border border-slate-900/10 bg-surface-secondary/70 p-1 shadow-inner overflow-x-auto no-scrollbar max-w-full">
            {WIZARD_STEPS.map((stepItem) => {
              const isActive = currentStep === stepItem.step;
              const isPast =
                (stepItem.step === 1) ||
                (stepItem.step === 2 && currentStep >= 2) ||
                (stepItem.step === 3 && isAllPhotosTaken) ||
                (stepItem.step === 4 && isAllPhotosTaken) ||
                (stepItem.step === 5 && isAllPhotosTaken);

              return (
                <button
                  key={stepItem.step}
                  type="button"
                  disabled={!isPast}
                  onClick={() => {
                    setCurrentStep(stepItem.step);
                    setRetakeSlotIndex(null);
                  }}
                  className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 sm:px-3.5 text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    isActive
                      ? "bg-brand-primary text-white shadow-xs"
                      : "text-text-muted hover:text-fg-display hover:bg-white/60"
                  }`}
                >
                  <span>{stepItem.title}</span>
                  {stepItem.step < currentStep && isAllPhotosTaken && (
                    <span className="flex size-3.5 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Actions (Reset & Session) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShuffleStickers}
              title="Shuffle Stickers"
              className="flex h-9 items-center gap-1 rounded-full border border-border-subtle bg-white px-3 text-xs font-bold text-fg-display shadow-2xs hover:bg-surface-secondary active:scale-95 transition-all cursor-pointer"
            >
              <span>🎲 Shuffle</span>
            </button>

            <button
              type="button"
              onClick={handleResetSession}
              title="Start New Session"
              className="flex size-9 items-center justify-center rounded-full border border-border-subtle bg-white text-text-muted hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all cursor-pointer"
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

        {/* Wizard Main Grid: Left (Step Console) + Right (Live Screen-Fitted Strip) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (7 cols): Step Dynamic Panel */}
          <section className="lg:col-span-7 flex flex-col gap-4">
            {/* STEP 1: PICK VARIATION & STYLE */}
            {currentStep === 1 && (
              <BoothLayoutPicker
                layoutVariation={layoutVariation}
                onChangeLayoutVariation={setLayoutVariation}
                frameColor={frameColor}
                onChangeFrameColor={setFrameColor}
                filter={filter}
                onChangeFilter={setFilter}
                onProceedToCamera={() => setCurrentStep(2)}
              />
            )}

            {/* STEP 2: SEQUENTIAL LIVE CAMERA (Strictly ordered 1 by 1) */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-3">
                <CameraViewfinder
                  photos={photos}
                  onPhotoCaptured={handlePhotoCaptured}
                  onSequenceComplete={handleSequenceComplete}
                  mode="sequence"
                />

                <div className="flex items-center justify-between rounded-[14px] border border-border-subtle bg-surface-secondary/70 px-4 py-3 text-xs text-text-muted">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💡</span>
                    <span>
                      Sequential mode: 3s countdown per shot. Strike 4 musical poses!
                    </span>
                  </div>

                  {completedCount === 4 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="font-bold text-brand-primary hover:underline cursor-pointer"
                    >
                      Review Shots →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW PICTURES & TARGETED RETAKE */}
            {currentStep === 3 && (
              <>
                {retakeSlotIndex !== null ? (
                  /* Focused Retake Camera specifically for chosen slot */
                  <div className="flex flex-col gap-3">
                    <div className="rounded-[16px] border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900">
                      <strong>Targeted Retake:</strong> Snapping a fresh photo for <strong>Shot {retakeSlotIndex + 1}</strong>. When finished, you will immediately return to the 4-shot review gallery.
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
                  /* Standard 4-Shot Review Gallery */
                  <PhotoReviewGrid
                    photos={photos}
                    onRetakeSpecificShot={(slot) => setRetakeSlotIndex(slot)}
                    onRetakeAll={() => {
                      setPhotos([null, null, null, null]);
                      setCurrentStep(2);
                    }}
                    onConfirmPhotos={() => setCurrentStep(4)}
                  />
                )}
              </>
            )}

            {/* STEP 4: DECORATE & EDIT STICKERS */}
            {currentStep === 4 && (
              <div className="flex flex-col gap-4">
                <div className="rounded-[16px] border border-brand-primary/20 bg-brand-primary/5 p-3.5 text-xs text-brand-primary flex items-center justify-between">
                  <div>
                    <strong>Step 4: Sticker Studio!</strong> Tap stickers to place, drag anywhere, rotate with ↻, resize with ⤡, or tap 🎲 Shuffle.
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="font-bold underline cursor-pointer ml-2 shrink-0"
                  >
                    ← Review Photos
                  </button>
                </div>

                <BoothCustomizerToolbar
                  frameColor={frameColor}
                  onChangeFrameColor={setFrameColor}
                  filter={filter}
                  onChangeFilter={setFilter}
                  stickers={stickers}
                  stickersVisible={stickersVisible}
                  onToggleStickersVisible={() => setStickersVisible((v) => !v)}
                  onAddSticker={handleAddSticker}
                  onApplyStickerPreset={handleApplyStickerPreset}
                  onShuffleStickers={handleShuffleStickers}
                  onClearStickers={handleClearStickers}
                  caption={caption}
                  onChangeCaption={setCaption}
                  showDate={showDate}
                  onToggleShowDate={() => setShowDate((v) => !v)}
                  onDownloadUltraHd={handleDownloadUltraHd}
                  onOpenMobileQr={handleOpenMobileQr}
                  onResetBooth={handleResetSession}
                  isDownloading={isDownloading}
                  isUploading={isUploading}
                  onProceedToShare={() => setCurrentStep(5)}
                />
              </div>
            )}

            {/* STEP 5: EXPORT & MOBILE QR SHARE */}
            {currentStep === 5 && (
              <div className="flex flex-col gap-4 rounded-[24px] border-2 border-slate-900/10 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-[0_4px_0_rgba(15,23,42,0.06)]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow-xs">
                      5
                    </span>
                    <h2 className="font-display text-lg sm:text-xl font-extrabold text-fg-display">
                      Step 5: Your 4-Cut Photobooth Strip is Ready!
                    </h2>
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    Download in ultra-high print resolution (3.5x Ultra HD) or scan the QR code to save directly to your phone&apos;s camera roll.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Ultra HD Card */}
                  <div className="flex flex-col justify-between rounded-[18px] border-2 border-brand-primary/30 bg-brand-primary/5 p-4 sm:p-5">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-display text-xs font-bold text-brand-primary uppercase tracking-wide">
                          Physical Print Ready
                        </span>
                        <span className="rounded-full bg-brand-primary/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-brand-primary">
                          1200 × 3792 px
                        </span>
                      </div>
                      <h3 className="font-display text-base font-bold text-fg-display">
                        3.5x Ultra HD PNG
                      </h3>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        Lossless full-resolution export styled with Chordisol brand fonts, ready for framing or scrapbooks.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isDownloading}
                      onClick={handleDownloadUltraHd}
                      className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-primary font-display text-sm font-bold text-white shadow-[0_3px_0_#1454a4] hover:bg-[#1a82f0] active:translate-y-0.5 active:shadow-[0_1px_0_#1454a4] transition-all cursor-pointer disabled:opacity-50"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} className="size-4.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span>
                        {isDownloading ? "Generating 3.5x..." : "Download Ultra HD PNG"}
                      </span>
                    </button>
                  </div>

                  {/* Mobile QR Card */}
                  <div className="flex flex-col justify-between rounded-[18px] border-2 border-slate-900/10 bg-surface-secondary/70 p-4 sm:p-5">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-display text-xs font-bold text-fg-display uppercase tracking-wide">
                          Phone Camera Roll
                        </span>
                        <span className="rounded-full bg-white px-2.5 py-0.5 font-mono text-[10px] font-bold text-text-muted border border-border-subtle shadow-2xs">
                          Instant Scan
                        </span>
                      </div>
                      <h3 className="font-display text-base font-bold text-fg-display">
                        Mobile QR Code
                      </h3>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        Point your iPhone or Android camera at the screen to open the web viewer with a 1-tap Save to Photos button.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={handleOpenMobileQr}
                      className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-border-subtle bg-white font-display text-sm font-bold text-fg-display shadow-2xs hover:bg-surface-secondary active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4.5 text-brand-primary">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                      <span>
                        {isUploading ? "Uploading for QR..." : "Generate Mobile QR Code"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Footer Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle/80 pt-4 text-xs">
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
          <aside className="lg:col-span-5 flex flex-col items-center justify-center gap-3 lg:sticky lg:top-16">
            <div className="w-full rounded-[24px] border-2 border-slate-900/10 bg-white/80 dark:bg-slate-900/80 p-4 sm:p-5 shadow-[0_8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl flex flex-col items-center justify-between">
              {/* Header Label on Pedestal */}
              <div className="w-full flex items-center justify-between pb-3 px-1 border-b border-border-subtle/70">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-display text-xs font-bold text-fg-display uppercase tracking-wider">
                    Strip Live Preview
                  </span>
                </div>
                <span className="font-mono text-[11px] font-bold text-text-muted">
                  {completedCount}/4 SHOTS
                </span>
              </div>

              {/* Strip Container - Constrained to screen height on desktop so NEVER overflows */}
              <div className="py-2 flex items-center justify-center w-full">
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
                  className="h-[min(74vh,680px)] w-auto max-w-full aspect-[1/3.16]"
                />
              </div>

              {/* Bottom Quick Action Bar */}
              <div className="w-full flex items-center gap-2 pt-2 border-t border-border-subtle/70">
                <button
                  type="button"
                  disabled={isDownloading}
                  onClick={handleDownloadUltraHd}
                  className="flex-1 flex h-10 items-center justify-center gap-1.5 rounded-full bg-fg-display text-white font-sans text-xs font-bold shadow-xs hover:bg-slate-900 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>💾 3.5x Ultra HD</span>
                </button>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={handleOpenMobileQr}
                  className="flex-1 flex h-10 items-center justify-center gap-1.5 rounded-full border border-border-subtle bg-white text-fg-display font-sans text-xs font-bold shadow-2xs hover:bg-surface-secondary active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>📱 Phone QR</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile QR Code Modal */}
      <BoothQrModal
        isOpen={qrModalData.isOpen}
        onClose={() => setQrModalData((prev) => ({ ...prev, isOpen: false }))}
        publicUrl={qrModalData.publicUrl}
        stripId={qrModalData.stripId}
      />
    </div>
  );
}
