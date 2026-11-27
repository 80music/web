"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import React, { useCallback, useMemo, useState } from "react";
import { CameraViewfinder } from "@/components/camera-viewfinder";
import {
  PhotoboothStrip,
  StripBrandBand,
  StripPaperDecorations,
  getPhotoSlotRingClass,
  getStripPaddingXClass,
  getStripSurfaceStyle,
  getStripVerticalPaddingClass,
} from "@/components/photobooth-strip";
import { BoothPrinterStage } from "@/components/booth-printer-stage";
import { BoothStripSlider, type StripSliderOption } from "@/components/booth-strip-slider";
import { BoothQrModal } from "@/components/booth-qr-modal";
import {
  FRAME_PRESETS,
  STICKER_PALETTE,
  getPhotoCountForVariation,
  isTopLogoVariation,
  type FrameColorId,
  type LayoutVariationId,
  type PhotoFilterId,
  type StickerAsset,
  type StickerItem,
  type StripConfig,
} from "@/lib/booth-types";
import { downloadUltraHdStrip, exportCompressedStripForUpload } from "@/lib/canvasExport";

type WizardStep = 1 | 2 | 3 | 4;

const STRIP_SLIDER_OPTIONS: readonly StripSliderOption[] = [
  { id: "variation-1", title: "3 Pics", countLabel: "Logo bottom" },
  { id: "variation-2", title: "2 Pics", countLabel: "Logo bottom" },
  { id: "variation-3", title: "1 Pic", countLabel: "Logo bottom" },
  { id: "variation-4", title: "3 Pics", countLabel: "Logo top" },
  { id: "variation-5", title: "2 Pics", countLabel: "Logo top" },
  { id: "variation-6", title: "1 Pic", countLabel: "Logo top" },
];

function ChevronLeftIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 3.5L5.5 8 10 12.5" />
    </svg>
  );
}

function createStripId() {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36).slice(-4);
}

function createStickerId() {
  return `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function buildStickerItem(asset: StickerAsset, id: string, zIndex: number): StickerItem {
  const jitterX = Math.floor(Math.random() * 16) - 8;
  const jitterY = Math.floor(Math.random() * 16) - 8;
  const jitterRot = Math.floor(Math.random() * 18) - 9;

  return {
    id,
    assetId: asset.id,
    src: asset.src,
    name: asset.name,
    xPercent: 50 + jitterX,
    yPercent: 42 + jitterY,
    widthPercent: asset.defaultWidthPercent,
    rotationDeg: jitterRot,
    zIndex,
  };
}

/**
 * Perimeter-aware shuffle for 9:16 Instagram Story strips:
 * Places 6 curated stickers (3 mascots + 3 chord keys) strictly along corners & outer margins.
 */
function buildShuffledStickers(variation: LayoutVariationId): StickerItem[] {
  const mascots = STICKER_PALETTE.filter((s) => s.category === "mascots").sort(
    () => 0.5 - Math.random()
  );
  const chords = STICKER_PALETTE.filter((s) => s.category === "chords").sort(
    () => 0.5 - Math.random()
  );

  const chosen: StickerAsset[] = [
    mascots[0],
    chords[0],
    mascots[1],
    chords[1],
    chords[2],
    mascots[2],
  ].filter(Boolean);

  const isTopLogo = isTopLogoVariation(variation);
  const photoCount = getPhotoCountForVariation(variation);

  // Keep stickers clear of both photo centers AND the top/bottom logo band
  const topY = isTopLogo ? 14 : 8;
  const bottomY = isTopLogo ? 91 : 86;

  const anchors =
    photoCount === 1
      ? [
          { x: 11, y: topY, rot: -12, scale: 0.88 },
          { x: 89, y: topY + 2, rot: 11, scale: 0.88 },
          { x: 10, y: 48, rot: -9, scale: 0.84 },
          { x: 90, y: 50, rot: 12, scale: 0.84 },
          { x: 12, y: bottomY, rot: -8, scale: 0.9 },
          { x: 88, y: bottomY + 1, rot: 10, scale: 0.9 },
        ]
      : photoCount === 2
      ? [
          { x: 11, y: topY, rot: -12, scale: 0.88 },
          { x: 89, y: topY + 2, rot: 11, scale: 0.88 },
          { x: 10, y: 49, rot: -9, scale: 0.86 },
          { x: 90, y: 51, rot: 12, scale: 0.86 },
          { x: 12, y: bottomY, rot: -8, scale: 0.9 },
          { x: 88, y: bottomY + 1, rot: 10, scale: 0.9 },
        ]
      : [
          { x: 11, y: topY, rot: -12, scale: 0.88 },
          { x: 89, y: topY + 3, rot: 11, scale: 0.88 },
          { x: 9, y: 36, rot: -9, scale: 0.84 },
          { x: 91, y: 63, rot: 12, scale: 0.84 },
          { x: 11, y: bottomY, rot: -10, scale: 0.88 },
          { x: 88, y: bottomY + 2, rot: 9, scale: 0.9 },
        ];

  const shuffledAnchors = [...anchors].sort(() => 0.5 - Math.random());

  return chosen.map((asset, i) => {
    const anchor = shuffledAnchors[i % shuffledAnchors.length];
    const jitterX = (Math.random() - 0.5) * 3.5;
    const jitterY = (Math.random() - 0.5) * 3.5;
    const jitterRot = Math.round((Math.random() - 0.5) * 8);

    return {
      id: `sticker-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`,
      assetId: asset.id,
      src: asset.src,
      name: asset.name,
      xPercent: Math.max(7, Math.min(93, Math.round((anchor.x + jitterX) * 10) / 10)),
      yPercent: Math.max(6, Math.min(94, Math.round((anchor.y + jitterY) * 10) / 10)),
      widthPercent: Math.round(asset.defaultWidthPercent * anchor.scale),
      rotationDeg: anchor.rot + jitterRot,
      zIndex: i + 1,
    };
  });
}

export function BoothStudio() {
  const shouldReduceMotion = useReducedMotion();

  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [layoutVariation, setLayoutVariation] = useState<LayoutVariationId>("variation-1");
  const [frameColor, setFrameColor] = useState<FrameColorId>("chordisol-blue");
  const slotCount = getPhotoCountForVariation(layoutVariation);
  const isTopLogo = isTopLogoVariation(layoutVariation);

  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null]);
  const [retakeSlotIndex, setRetakeSlotIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<PhotoFilterId>("normal");

  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [selectedStickerCategory, setSelectedStickerCategory] = useState<
    "all" | "mascots" | "chords" | "badges"
  >("all");
  const [printRunKey, setPrintRunKey] = useState(0);
  const [stripId, setStripId] = useState(createStripId);

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

  // 9:16 Story ratio strip config with selectable paper style
  const currentStripConfig: StripConfig = useMemo(
    () => ({
      photos,
      frameColor,
      layoutVariation,
      filter,
      stickers,
      stickersVisible: true,
      caption: "",
      showDate: false,
      dateText: "",
    }),
    [photos, frameColor, layoutVariation, filter, stickers]
  );

  const filteredStickerPalette = useMemo(() => {
    if (selectedStickerCategory === "all") return STICKER_PALETTE;
    return STICKER_PALETTE.filter((s) => s.category === selectedStickerCategory);
  }, [selectedStickerCategory]);

  const handleSelectVariation = (varId: LayoutVariationId) => {
    setLayoutVariation(varId);
    const count = getPhotoCountForVariation(varId);
    setPhotos(new Array(count).fill(null));
    setRetakeSlotIndex(null);
  };

  const handlePhotoCaptured = useCallback((slotIndex: number, dataUrl: string) => {
    setPhotos((prev) => {
      const next = [...prev];
      next[slotIndex] = dataUrl;
      return next;
    });
  }, []);

  const handleSequenceComplete = () => {
    setRetakeSlotIndex(null);
  };

  const handleAddSticker = (asset: StickerAsset) => {
    const newId = createStickerId();
    setStickers((prev) => {
      const maxZ = prev.reduce((max, s) => Math.max(max, s.zIndex), 1);
      return [...prev, buildStickerItem(asset, newId, maxZ + 1)];
    });
    setSelectedStickerId(newId);
  };

  const handleUpdateSticker = (
    id: string,
    updates: Partial<
      Pick<StickerItem, "xPercent" | "yPercent" | "widthPercent" | "rotationDeg" | "zIndex">
    >
  ) => {
    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleDeleteSticker = (id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
    setSelectedStickerId((curr) => (curr === id ? null : curr));
  };

  const handleClearStickers = () => {
    setStickers([]);
    setSelectedStickerId(null);
  };

  const handleShuffleStickers = () => {
    setStickers(buildShuffledStickers(layoutVariation));
    setSelectedStickerId(null);
  };

  const handleStartOver = () => {
    setPhotos(new Array(slotCount).fill(null));
    setStickers([]);
    setSelectedStickerId(null);
    setFilter("normal");
    setCurrentStep(1);
    setRetakeSlotIndex(null);
    setStripId(createStripId());
  };

  const handleDownloadUltraHd = async () => {
    try {
      setIsDownloading(true);
      await downloadUltraHdStrip(currentStripConfig, `chordisol-story-${stripId}.png`);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to export image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const [uploadedPublicUrl, setUploadedPublicUrl] = useState<string | null>(null);

  const uploadStripToCloud = async (): Promise<string | null> => {
    try {
      const dataUrl = await exportCompressedStripForUpload(currentStripConfig);
      const res = await fetch("/api/upload-strip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stripId,
          image: dataUrl,
        }),
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status ${res.status}`);
      }

      const data = await res.json();
      setUploadedPublicUrl(data.url);
      return data.url as string;
    } catch (err) {
      console.error("Strip upload error:", err);
      return null;
    }
  };

  const handlePrintStrip = () => {
    setSelectedStickerId(null);
    setUploadedPublicUrl(null);
    setPrintRunKey((k) => k + 1);
    setCurrentStep(4);
    // Automatically save to Drive / cloud in the background while printing
    void uploadStripToCloud();
  };

  const handleOpenMobileQr = async () => {
    try {
      setIsUploading(true);
      const publicUrl = uploadedPublicUrl || (await uploadStripToCloud());

      if (!publicUrl) {
        alert("Failed to create mobile share link. Please try downloading directly.");
        return;
      }

      setQrModalData({
        isOpen: true,
        publicUrl,
        stripId,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const completedCount = photos.slice(0, slotCount).filter(Boolean).length;
  const isAllPhotosTaken = completedCount === slotCount;
  const selectedSticker = stickers.find((s) => s.id === selectedStickerId);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-bg text-fg-regular px-4 py-7 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        {/* Quiet navigation row for Steps 2, 3, 4 */}
        {currentStep > 1 && (
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep((currentStep - 1) as WizardStep)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-muted transition-colors hover:text-fg-display cursor-pointer"
            >
              <ChevronLeftIcon className="size-4" />
              <span>
                {currentStep === 2 && "Choose strip"}
                {currentStep === 3 && "Camera"}
                {currentStep === 4 && "Edit strip"}
              </span>
            </button>

            <span className="font-mono text-xs text-text-muted tabular-nums">
              Step {currentStep} of 4
            </span>
          </div>
        )}

        {/* =========================================================================
            STEP 1: SMOOTH 6-STRIP HORIZONTAL SLIDER
           ========================================================================= */}
        {currentStep === 1 && (
          <section className="mx-auto w-full max-w-4xl flex flex-col gap-6">
            {/* Left-Aligned Header */}
            <div className="text-left">
              <h1 className="font-display text-2xl sm:text-[30px] font-bold tracking-tight text-fg-display">
                Choose your strip
              </h1>
              <p className="mt-1 text-xs font-medium text-text-muted">
                Instagram Story format (1080 × 1920)
              </p>
            </div>

            <BoothStripSlider
              options={STRIP_SLIDER_OPTIONS}
              selectedId={layoutVariation}
              frameColor={frameColor}
              onSelect={handleSelectVariation}
            />

            {/* 1-Click Strip Paper Style Variations (Classic = instant revert) */}
            <div className="flex flex-col items-center gap-2">
              <div
                role="radiogroup"
                aria-label="Strip style"
                className="flex flex-wrap items-center justify-center gap-2"
              >
                {FRAME_PRESETS.map((preset) => {
                  const isActive = frameColor === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => setFrameColor(preset.id)}
                      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-fg-display text-white shadow-xs"
                          : "bg-surface-secondary text-fg-display/75 hover:bg-divider/70 hover:text-fg-display"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        style={{ backgroundColor: preset.previewBg }}
                        className="size-3.5 rounded-full ring-1 ring-black/15 shrink-0"
                      />
                      <span>{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Single Bottom CTA */}
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="inline-flex h-12 min-w-55 items-center justify-center rounded-full bg-brand-primary px-8 font-display text-sm font-semibold text-white shadow-[0_4px_0_var(--primary-depth)] transition-all hover:bg-[#1a84ee] active:translate-y-0.5 active:shadow-[0_1px_0_var(--primary-depth)] cursor-pointer"
              >
                Open Camera
              </button>
            </div>
          </section>
        )}

        {/* =========================================================================
            STEP 2: CAMERA VIEWFINDER + FULL-HEIGHT LIVE 9:16 STORY STRIP
           ========================================================================= */}
        {currentStep === 2 && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Left: Camera Viewfinder */}
            <div className="lg:col-span-8">
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
            </div>

            {/* Right: Full-Height Live 9:16 Print on Soft Studio Mat */}
            <aside className="lg:col-span-4 flex flex-col gap-4">
              <div className="w-full flex-1 rounded-2xl bg-surface-secondary py-6 px-5 flex flex-col items-center justify-center">
                <div
                  style={getStripSurfaceStyle(frameColor)}
                  className="relative w-56 sm:w-59.5 aspect-9/16 transition-colors duration-300 shadow-[0_16px_36px_-12px_rgba(20,54,95,0.18)]"
                >
                  <StripPaperDecorations frameColor={frameColor} isTopLogo={isTopLogo} />

                  <div
                    className={`absolute inset-0 z-10 flex flex-col ${getStripPaddingXClass(
                      frameColor
                    )} ${getStripVerticalPaddingClass(frameColor, isTopLogo)}`}
                  >
                    {isTopLogo && (
                      <StripBrandBand frameColor={frameColor} isTopLogo={true} compact />
                    )}

                    <div
                      className={`flex-1 min-h-0 grid gap-2 ${
                        slotCount === 1
                          ? "grid-rows-1"
                          : slotCount === 2
                          ? "grid-rows-2"
                          : "grid-rows-3"
                      }`}
                    >
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
                            className={`group relative size-full overflow-hidden transition-all ${getPhotoSlotRingClass(
                              frameColor
                            )} ${
                              isRetakingThis
                                ? "ring-2 ring-brand-primary ring-offset-1"
                                : photo
                                ? "cursor-pointer"
                                : "bg-surface-secondary"
                            }`}
                          >
                            {photo ? (
                              <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={photo}
                                  alt={`Shot ${slotIdx + 1}`}
                                  className="size-full object-cover"
                                />
                                <div className="absolute inset-0 bg-fg-display/0 group-hover:bg-fg-display/40 transition-colors flex items-center justify-center">
                                  <span className="opacity-0 group-hover:opacity-100 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-fg-display shadow-xs transition-opacity">
                                    Retake
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="flex size-full items-center justify-center">
                                <span className="font-mono text-xs font-medium text-text-muted/60">
                                  0{slotIdx + 1}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {!isTopLogo && (
                      <StripBrandBand frameColor={frameColor} isTopLogo={false} compact />
                    )}
                  </div>
                </div>

                {completedCount > 0 && (
                  <p className="mt-3 text-center text-xs text-text-muted">
                    Click any photo to retake
                  </p>
                )}
              </div>

              <button
                type="button"
                disabled={completedCount === 0}
                onClick={() => {
                  setRetakeSlotIndex(null);
                  setCurrentStep(3);
                }}
                className="inline-flex h-12 w-full shrink-0 items-center justify-center rounded-full bg-brand-primary font-display text-sm font-semibold text-white shadow-[0_4px_0_var(--primary-depth)] transition-all hover:bg-[#1a84ee] active:translate-y-0.5 active:shadow-[0_1px_0_var(--primary-depth)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isAllPhotosTaken
                  ? "Decorate Strip"
                  : `Continue (${completedCount}/${slotCount})`}
              </button>
            </aside>
          </section>
        )}

        {/* =========================================================================
            STEP 3: DECORATE STRIP (Studio Mat + Clean Flat Workbench)
           ========================================================================= */}
        {currentStep === 3 && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left: Studio Mat with Interactive 9:16 White Strip */}
            <div
              onClick={() => setSelectedStickerId(null)}
              className="lg:col-span-5 flex flex-col items-center rounded-2xl bg-surface-secondary py-8 px-6"
            >
              <PhotoboothStrip
                photos={photos}
                frameColor={frameColor}
                layoutVariation={layoutVariation}
                filter={filter}
                stickers={stickers}
                stickersVisible={true}
                selectedStickerId={selectedStickerId}
                onSelectSticker={setSelectedStickerId}
                onUpdateSticker={handleUpdateSticker}
                onDeleteSticker={handleDeleteSticker}
                onRetakeSlot={(slot) => {
                  setRetakeSlotIndex(slot);
                  setCurrentStep(2);
                }}
              />

              {/* Compact Floating Sticker Controls when a sticker is active */}
              <div className="mt-5 min-h-10 flex items-center justify-center">
                {selectedSticker ? (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 rounded-full bg-white border border-border-subtle px-2.5 py-1.5 shadow-sm"
                  >
                    <span className="px-2 text-xs font-semibold text-fg-display max-w-25 truncate">
                      {selectedSticker.name}
                    </span>
                    <span className="h-3.5 w-px bg-border-subtle" aria-hidden="true" />
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateSticker(selectedSticker.id, {
                          rotationDeg: (selectedSticker.rotationDeg - 15) % 360,
                        })
                      }
                      aria-label="Rotate left"
                      title="Rotate left"
                      className="flex size-7 items-center justify-center rounded-full text-fg-display hover:bg-surface-secondary cursor-pointer"
                    >
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        className="size-3.5"
                      >
                        <path d="M3 8a5 5 0 1 0 1.4-3.5L3 6" strokeLinecap="round" />
                        <path d="M3 3v3h3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateSticker(selectedSticker.id, {
                          rotationDeg: (selectedSticker.rotationDeg + 15) % 360,
                        })
                      }
                      aria-label="Rotate right"
                      title="Rotate right"
                      className="flex size-7 items-center justify-center rounded-full text-fg-display hover:bg-surface-secondary cursor-pointer"
                    >
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        className="size-3.5"
                      >
                        <path d="M13 8a5 5 0 1 1-1.4-3.5L13 6" strokeLinecap="round" />
                        <path d="M13 3v3h-3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateSticker(selectedSticker.id, {
                          widthPercent: Math.max(10, selectedSticker.widthPercent - 4),
                        })
                      }
                      aria-label="Make smaller"
                      title="Smaller"
                      className="flex size-7 items-center justify-center rounded-full text-sm font-semibold text-fg-display hover:bg-surface-secondary cursor-pointer"
                    >
                      &minus;
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateSticker(selectedSticker.id, {
                          widthPercent: Math.min(54, selectedSticker.widthPercent + 4),
                        })
                      }
                      aria-label="Make larger"
                      title="Larger"
                      className="flex size-7 items-center justify-center rounded-full text-sm font-semibold text-fg-display hover:bg-surface-secondary cursor-pointer"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSticker(selectedSticker.id)}
                      aria-label="Remove sticker"
                      title="Remove"
                      className="flex size-7 items-center justify-center rounded-full text-text-muted hover:text-fg-display hover:bg-surface-secondary cursor-pointer"
                    >
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="size-3.5"
                      >
                        <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-text-muted">
                    Drag stickers directly on the strip to place them
                  </p>
                )}
              </div>
            </div>

            {/* Right: Clean, Flat Studio Workbench (Strip style + Film tone + Stickers) */}
            <aside className="lg:col-span-7 flex flex-col gap-7">
              {/* 1. Strip Style (Classic = instant 1-click revert) */}
              <div>
                <h2 className="font-display text-sm font-semibold text-fg-display mb-2.5">
                  Strip style
                </h2>
                <div
                  role="radiogroup"
                  aria-label="Strip style"
                  className="flex flex-wrap items-center gap-2"
                >
                  {FRAME_PRESETS.map((preset) => {
                    const isActive = frameColor === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        onClick={() => setFrameColor(preset.id)}
                        className={`inline-flex h-10 items-center gap-2 rounded-xl px-3.5 text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? "bg-fg-display text-white shadow-xs"
                            : "bg-surface-secondary text-fg-display/80 hover:bg-divider/70 hover:text-fg-display"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          style={{ backgroundColor: preset.previewBg }}
                          className="size-3.5 rounded-full ring-1 ring-black/15 shrink-0"
                        />
                        <span>{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Film Tone (Normal, B&W, Grainy) */}
              <div className="pt-6 border-t border-border-subtle">
                <h2 className="font-display text-sm font-semibold text-fg-display mb-2.5">
                  Film tone
                </h2>

                <div
                  role="radiogroup"
                  aria-label="Film tone"
                  className="grid grid-cols-3 gap-1.5 rounded-xl bg-surface-secondary p-1"
                >
                  {[
                    { id: "normal", name: "Normal" },
                    { id: "bnw", name: "B&W" },
                    { id: "grainy", name: "Grainy" },
                  ].map((tone) => {
                    const isSelected = filter === tone.id;
                    return (
                      <button
                        key={tone.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setFilter(tone.id as PhotoFilterId)}
                        className={`h-10 rounded-[9px] font-display text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-white text-fg-display shadow-xs"
                            : "text-text-muted hover:text-fg-display"
                        }`}
                      >
                        {tone.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Stickers */}
              <div className="pt-6 border-t border-border-subtle">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                  <h2 className="font-display text-sm font-semibold text-fg-display">
                    Stickers
                  </h2>

                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={handleShuffleStickers}
                      className="text-brand-primary hover:underline cursor-pointer"
                    >
                      Shuffle
                    </button>
                    {stickers.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearStickers}
                        className="text-text-muted hover:text-fg-display cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Tabs */}
                <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-0.5">
                  {[
                    { id: "all", label: "All" },
                    { id: "mascots", label: "Mascots" },
                    { id: "chords", label: "Keys" },
                  ].map((tab) => {
                    const isTabActive = selectedStickerCategory === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() =>
                          setSelectedStickerCategory(
                            tab.id as typeof selectedStickerCategory
                          )
                        }
                        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          isTabActive
                            ? "bg-fg-display text-white"
                            : "bg-surface-secondary text-text-muted hover:text-fg-display"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Spacious, Unclipped Sticker Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                  {filteredStickerPalette.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => handleAddSticker(asset)}
                      title={`Add ${asset.name}`}
                      className="group flex flex-col items-center justify-center gap-1.5 rounded-xl bg-surface-secondary/75 p-2.5 transition-all hover:bg-surface-secondary active:scale-95 cursor-pointer"
                    >
                      <div className="relative size-11">
                        <Image
                          src={asset.src}
                          alt={asset.name}
                          fill
                          sizes="56px"
                          className="object-contain transition-transform duration-150 group-hover:scale-110"
                        />
                      </div>
                      <span className="text-[10px] font-medium text-text-muted truncate max-w-full">
                        {asset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handlePrintStrip}
                  className="inline-flex h-12 w-full sm:w-auto min-w-45 items-center justify-center rounded-full bg-brand-primary px-8 font-display text-sm font-semibold text-white shadow-[0_4px_0_var(--primary-depth)] transition-all hover:bg-[#1a84ee] active:translate-y-0.5 active:shadow-[0_1px_0_var(--primary-depth)] cursor-pointer"
                >
                  Print Strip
                </button>
              </div>
            </aside>
          </section>
        )}

        {/* =========================================================================
            STEP 4: 3D PHOTOBOOTH PRINTER & REALISTIC STEPPED PRINT-OUT
           ========================================================================= */}
        {currentStep === 4 && (
          <section className="flex flex-col items-center">
            <BoothPrinterStage
              photos={photos}
              frameColor={frameColor}
              layoutVariation={layoutVariation}
              filter={filter}
              stickers={stickers}
              runKey={printRunKey}
            />

            {/* Download & Mobile QR Actions */}
            <motion.div
              key={`actions-${printRunKey}`}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: shouldReduceMotion ? 0 : 2.15,
                duration: 0.35,
                ease: [0.23, 1, 0.32, 1],
              }}
              className="mt-8 w-full max-w-115 flex flex-col items-center"
            >
              <div className="w-full flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  disabled={isDownloading}
                  onClick={handleDownloadUltraHd}
                  className="flex-1 w-full inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-primary px-6 font-display text-sm font-semibold text-white shadow-[0_4px_0_var(--primary-depth)] transition-all hover:bg-[#1a84ee] active:translate-y-0.5 active:shadow-[0_1px_0_var(--primary-depth)] disabled:opacity-50 cursor-pointer"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4"
                    aria-hidden="true"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>{isDownloading ? "Exporting..." : "Download PNG"}</span>
                </button>

                <button
                  type="button"
                  disabled={isUploading}
                  onClick={handleOpenMobileQr}
                  className="flex-1 w-full inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border-subtle bg-white px-6 font-display text-sm font-semibold text-fg-display transition-colors hover:bg-surface-secondary active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4 text-brand-primary"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  <span>{isUploading ? "Preparing QR..." : "Save to Phone"}</span>
                </button>
              </div>

              <div className="mt-6 flex items-center gap-5 text-xs font-semibold text-text-muted">
                <button
                  type="button"
                  onClick={() => setPrintRunKey((k) => k + 1)}
                  className="hover:text-fg-display cursor-pointer"
                >
                  Replay print
                </button>
                <span className="h-3 w-px bg-divider" aria-hidden="true" />
                <button
                  type="button"
                  onClick={handleStartOver}
                  className="hover:text-fg-display cursor-pointer"
                >
                  Start a new session
                </button>
              </div>
            </motion.div>
          </section>
        )}
      </div>

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
