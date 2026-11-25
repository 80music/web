"use client";

import Image from "next/image";
import React, { useCallback, useMemo, useState } from "react";
import { CameraViewfinder } from "@/components/camera-viewfinder";
import { PhotoboothStrip } from "@/components/photobooth-strip";
import { BoothQrModal } from "@/components/booth-qr-modal";
import {
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

interface StripOption {
  id: LayoutVariationId;
  title: string;
  subtitle: string;
}

const STRIP_OPTIONS: readonly StripOption[] = [
  { id: "variation-1", title: "Classic", subtitle: "3 cuts" },
  { id: "variation-2", title: "Duo", subtitle: "2 large cuts" },
  { id: "variation-3", title: "Top Header", subtitle: "3 cuts" },
];

const PREVIEW_SAMPLES = [
  { src: "/images/mascots/mascot-radio.png", alt: "Studio sample 1", bg: "bg-[#eef4fb]" },
  { src: "/images/mascots/mascot-duo.png", alt: "Studio sample 2", bg: "bg-[#f3f6fa]" },
  { src: "/images/mascots/mascot-hill.png", alt: "Studio sample 3", bg: "bg-[#ebf2fa]" },
] as const;

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

/**
 * Physical miniature white photo strip preview for Step 1.
 * Uses Chordisol's real mascot artwork on soft studio paper tones.
 */
function PhysicalStripPreview({
  variation,
  isSelected,
}: {
  variation: LayoutVariationId;
  isSelected: boolean;
}) {
  const isTwoSlot = variation === "variation-2";
  const isTopHeader = variation === "variation-3";
  const frames = isTwoSlot ? PREVIEW_SAMPLES.slice(0, 2) : PREVIEW_SAMPLES;

  return (
    <div
      className={`relative mx-auto flex select-none flex-col w-[176px] sm:w-[188px] h-[332px] sm:h-[352px] rounded-[6px] bg-white p-2.5 justify-between transition-all duration-200 ${
        isSelected
          ? "ring-2 ring-brand-primary ring-offset-4 ring-offset-white -translate-y-1.5 shadow-[0_24px_48px_-14px_rgba(20,54,95,0.22),0_4px_12px_rgba(20,54,95,0.08)]"
          : "border border-border-subtle shadow-[0_14px_32px_-12px_rgba(20,54,95,0.14),0_2px_6px_rgba(20,54,95,0.05)] group-hover:-translate-y-1 group-hover:shadow-[0_20px_40px_-14px_rgba(20,54,95,0.18)]"
      }`}
    >
      {/* Top Area */}
      {isTopHeader ? (
        <div className="border-b border-border-subtle/70 pb-1.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <div className="relative size-3.5 shrink-0 overflow-hidden rounded-[3px]">
              <Image
                src="/images/chordisol-logo.png"
                alt=""
                fill
                className="object-cover"
              />
            </div>
            <span className="font-display text-[9px] font-bold text-fg-display tracking-tight">
              Chordisol
            </span>
          </div>
          <p className="font-display text-[8.5px] font-semibold text-fg-display truncate">
            Acoustic Session
          </p>
          <p className="font-mono text-[7px] text-text-muted tabular-nums">2026.11.25</p>
        </div>
      ) : (
        <div className="flex items-center justify-between pb-1.5">
          <div className="flex items-center gap-1">
            <div className="relative size-3.5 shrink-0 overflow-hidden rounded-[3px]">
              <Image
                src="/images/chordisol-logo.png"
                alt=""
                fill
                className="object-cover"
              />
            </div>
            <span className="font-display text-[9px] font-bold text-fg-display leading-none tracking-tight">
              Chordisol
            </span>
          </div>
          <span className="font-mono text-[7.5px] text-text-muted">
            {isTwoSlot ? "2-cut" : "3-cut"}
          </span>
        </div>
      )}

      {/* Photo Cuts */}
      <div className="flex flex-col gap-1.5 my-1 flex-1 justify-center">
        {frames.map((frame, i) => (
          <div
            key={i}
            className={`relative w-full overflow-hidden rounded-[3px] ring-1 ring-inset ring-black/6 ${
              frame.bg
            } ${isTwoSlot ? "aspect-[4/3.2]" : "aspect-4/3"}`}
          >
            <div className="absolute inset-2">
              <Image
                src={frame.src}
                alt={frame.alt}
                fill
                sizes="160px"
                className="object-contain"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Area */}
      {isTopHeader ? (
        <div className="border-t border-border-subtle/70 pt-1.5 flex justify-center">
          <div
            aria-hidden="true"
            className="flex h-1.5 w-16 items-center justify-center gap-0.5 opacity-35 text-fg-display"
          >
            {[2.5, 1, 3.5, 1.5, 4, 1.5, 2.5, 3, 1.5, 4].map((w, i) => (
              <span key={i} style={{ width: `${w}px` }} className="h-full bg-current" />
            ))}
          </div>
        </div>
      ) : (
        <div className="border-t border-border-subtle/70 pt-1.5 text-center">
          <p className="font-display text-[8.5px] font-semibold text-fg-display truncate">
            Acoustic Session
          </p>
          <p className="font-mono text-[7px] text-text-muted tabular-nums">2026.11.25</p>
          <div
            aria-hidden="true"
            className="mx-auto mt-1 flex h-1.5 w-18 items-center justify-center gap-0.5 opacity-35 text-fg-display"
          >
            {[2.5, 1, 3.5, 1.5, 4, 1.5, 2.5, 3, 1.5, 4, 2, 1.5].map((w, i) => (
              <span key={i} style={{ width: `${w}px` }} className="h-full bg-current" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function createStripId() {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36).slice(-4);
}

function createStickerId() {
  return `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function buildStickerItem(asset: StickerAsset, id: string, zIndex: number): StickerItem {
  const jitterX = Math.floor(Math.random() * 20) - 10;
  const jitterY = Math.floor(Math.random() * 20) - 10;
  const jitterRot = Math.floor(Math.random() * 20) - 10;

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

function buildShuffledStickers(): StickerItem[] {
  const randomAssets = [...STICKER_PALETTE].sort(() => 0.5 - Math.random()).slice(0, 3);
  const ySpots = [24, 52, 78];

  return randomAssets.map((asset, i) => ({
    id: `sticker-${Date.now()}-${i}`,
    assetId: asset.id,
    src: asset.src,
    name: asset.name,
    xPercent: i % 2 === 0 ? 22 + Math.random() * 14 : 64 + Math.random() * 14,
    yPercent: ySpots[i] + (Math.random() * 6 - 3),
    widthPercent: asset.defaultWidthPercent,
    rotationDeg: Math.floor(Math.random() * 24) - 12,
    zIndex: i + 1,
  }));
}

function formatCurrentDate() {
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
}

export function BoothStudio() {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [layoutVariation, setLayoutVariation] = useState<LayoutVariationId>("variation-1");
  const slotCount = getPhotoCountForVariation(layoutVariation);

  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null]);
  const [retakeSlotIndex, setRetakeSlotIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<PhotoFilterId>("normal");

  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [selectedStickerCategory, setSelectedStickerCategory] = useState<
    "all" | "mascots" | "chords" | "badges"
  >("all");
  const [caption, setCaption] = useState("Acoustic Session • Chordisol Studio");
  const [showDate, setShowDate] = useState(true);

  const [dateText, setDateText] = useState(formatCurrentDate);
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

  // Photocard paper is permanently locked to pure white
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

  const filteredStickerPalette = useMemo(() => {
    if (selectedStickerCategory === "all") return STICKER_PALETTE;
    if (selectedStickerCategory === "badges") {
      return STICKER_PALETTE.filter(
        (s) => s.category === "badges" || s.category === "sparkles"
      );
    }
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
    setStickers(buildShuffledStickers());
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
    setDateText(formatCurrentDate());
  };

  const handleDownloadUltraHd = async () => {
    try {
      setIsDownloading(true);
      await downloadUltraHdStrip(currentStripConfig, `chordisol-strip-${stripId}.png`);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to export image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

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

  const completedCount = photos.slice(0, slotCount).filter(Boolean).length;
  const isAllPhotosTaken = completedCount === slotCount;
  const selectedSticker = stickers.find((s) => s.id === selectedStickerId);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-bg text-fg-regular px-4 py-8 sm:px-6 sm:py-12">
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
            STEP 1: PICK YOUR STRIP (3 physical prints directly on white canvas)
           ========================================================================= */}
        {currentStep === 1 && (
          <section className="flex flex-col items-center">
            <div className="text-center mb-10 sm:mb-12">
              <h1 className="font-display text-2xl sm:text-[30px] font-bold tracking-tight text-fg-display">
                Choose your strip
              </h1>
            </div>

            <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 items-start justify-items-center">
              {STRIP_OPTIONS.map((option) => {
                const isSelected = layoutVariation === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectVariation(option.id)}
                    className="group flex flex-col items-center focus-visible:outline-none cursor-pointer"
                  >
                    <PhysicalStripPreview variation={option.id} isSelected={isSelected} />

                    <div className="mt-5 flex flex-col items-center">
                      <span
                        className={`font-display text-sm font-semibold transition-colors ${
                          isSelected ? "text-brand-primary" : "text-fg-display"
                        }`}
                      >
                        {option.title}
                      </span>
                      <span className="text-xs text-text-muted mt-0.5">{option.subtitle}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-12 flex flex-col items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-full bg-brand-primary px-8 font-display text-sm font-semibold text-white shadow-[0_4px_0_var(--primary-depth)] transition-all hover:bg-[#1a84ee] active:translate-y-0.5 active:shadow-[0_1px_0_var(--primary-depth)] cursor-pointer"
              >
                Open Camera
              </button>
            </div>
          </section>
        )}

        {/* =========================================================================
            STEP 2: CAMERA VIEWFINDER + LIVE VERTICAL PHOTO STRIP
           ========================================================================= */}
        {currentStep === 2 && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
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

            {/* Right: Live Filling White Photo Strip on Soft Studio Mat */}
            <aside className="lg:col-span-4 flex flex-col items-center gap-5">
              <div className="w-full rounded-2xl bg-surface-secondary py-6 px-5 flex flex-col items-center">
                {/* Live Strip */}
                <div className="w-[186px] rounded-[6px] border border-border-subtle bg-white p-2.5 shadow-[0_14px_32px_-12px_rgba(20,54,95,0.16)] flex flex-col gap-2">
                  <div className="flex items-center justify-between pb-1">
                    <span className="font-display text-[10px] font-bold text-fg-display">
                      Chordisol
                    </span>
                    <span className="font-mono text-[9px] text-text-muted tabular-nums">
                      {completedCount}/{slotCount}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {new Array(slotCount).fill(0).map((_, slotIdx) => {
                      const photo = photos[slotIdx];
                      const isRetakingThis = retakeSlotIndex === slotIdx;
                      const isTwoSlot = layoutVariation === "variation-2";

                      return (
                        <div
                          key={slotIdx}
                          onClick={() => {
                            if (photo) {
                              setRetakeSlotIndex(slotIdx);
                            }
                          }}
                          className={`group relative w-full overflow-hidden rounded-[3px] transition-all ${
                            isTwoSlot ? "aspect-[4/3.2]" : "aspect-4/3"
                          } ${
                            isRetakingThis
                              ? "ring-2 ring-brand-primary ring-offset-1"
                              : photo
                              ? "ring-1 ring-inset ring-black/8 cursor-pointer"
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
                              <span className="font-mono text-[11px] font-medium text-text-muted/60">
                                0{slotIdx + 1}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="mt-4 text-center text-xs text-text-muted">
                  {completedCount > 0
                    ? "Click any captured photo to retake it"
                    : "Photos fill in order from top to bottom"}
                </p>
              </div>

              <button
                type="button"
                disabled={completedCount === 0}
                onClick={() => {
                  setRetakeSlotIndex(null);
                  setCurrentStep(3);
                }}
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand-primary font-display text-sm font-semibold text-white shadow-[0_4px_0_var(--primary-depth)] transition-all hover:bg-[#1a84ee] active:translate-y-0.5 active:shadow-[0_1px_0_var(--primary-depth)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
            {/* Left: Studio Mat with Interactive White Strip */}
            <div
              onClick={() => setSelectedStickerId(null)}
              className="lg:col-span-5 flex flex-col items-center rounded-2xl bg-surface-secondary py-8 px-6"
            >
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

              {/* Compact Floating Sticker Controls when a sticker is active */}
              <div className="mt-5 min-h-[40px] flex items-center justify-center">
                {selectedSticker ? (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 rounded-full bg-white border border-border-subtle px-2.5 py-1.5 shadow-sm"
                  >
                    <span className="px-2 text-xs font-semibold text-fg-display max-w-[100px] truncate">
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
                          widthPercent: Math.max(12, selectedSticker.widthPercent - 4),
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

            {/* Right: Clean, Flat Studio Workbench (No boxed card wrapper) */}
            <aside className="lg:col-span-7 flex flex-col gap-7">
              {/* 1. Film Tone (Normal, B&W, Grainy) */}
              <div>
                <div className="mb-2.5 flex items-baseline justify-between">
                  <h2 className="font-display text-sm font-semibold text-fg-display">
                    Film tone
                  </h2>
                </div>

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
                    { id: "chords", label: "Chords" },
                    { id: "badges", label: "Stamps" },
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

              {/* 3. Caption & Date */}
              <div className="pt-6 border-t border-border-subtle">
                <label
                  htmlFor="strip-caption-input"
                  className="font-display text-sm font-semibold text-fg-display block mb-2.5"
                >
                  Caption
                </label>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    id="strip-caption-input"
                    type="text"
                    maxLength={42}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Acoustic Session • Chordisol Studio"
                    className="h-11 flex-1 rounded-xl border border-border-subtle bg-white px-3.5 text-sm font-medium text-fg-display outline-none transition-colors focus:border-brand-primary"
                  />

                  <button
                    type="button"
                    role="switch"
                    aria-checked={showDate}
                    onClick={() => setShowDate((v) => !v)}
                    className="inline-flex h-11 shrink-0 items-center justify-between gap-2.5 rounded-xl border border-border-subtle bg-white px-3.5 text-xs font-semibold text-fg-display cursor-pointer hover:bg-surface-secondary/60 transition-colors"
                  >
                    <span>Date stamp</span>
                    <span
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        showDate ? "bg-brand-primary" : "bg-divider"
                      }`}
                    >
                      <span
                        className={`inline-block size-3.5 rounded-full bg-white shadow-xs transition-transform ${
                          showDate ? "translate-x-4.5" : "translate-x-1"
                        }`}
                      />
                    </span>
                  </button>
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStickerId(null);
                    setCurrentStep(4);
                  }}
                  className="inline-flex h-12 w-full sm:w-auto min-w-[180px] items-center justify-center rounded-full bg-brand-primary px-8 font-display text-sm font-semibold text-white shadow-[0_4px_0_var(--primary-depth)] transition-all hover:bg-[#1a84ee] active:translate-y-0.5 active:shadow-[0_1px_0_var(--primary-depth)] cursor-pointer"
                >
                  Finish Strip
                </button>
              </div>
            </aside>
          </section>
        )}

        {/* =========================================================================
            STEP 4: DOWNLOAD & SHARE (Editorial Print Reveal)
           ========================================================================= */}
        {currentStep === 4 && (
          <section className="flex flex-col items-center">
            <div className="w-full max-w-md rounded-2xl bg-surface-secondary py-9 px-6 flex justify-center">
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

            {/* Download & Mobile QR Actions */}
            <div className="mt-8 w-full max-w-md flex flex-col sm:flex-row items-center gap-3">
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

            <button
              type="button"
              onClick={handleStartOver}
              className="mt-6 text-xs font-semibold text-text-muted hover:text-fg-display cursor-pointer"
            >
              Start a new session
            </button>
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
