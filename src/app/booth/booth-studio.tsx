"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CameraViewfinder } from "@/components/camera-viewfinder";
import { PhotoboothStrip } from "@/components/photobooth-strip";
import { BoothCustomizerToolbar } from "@/components/booth-customizer-toolbar";
import { BoothQrModal } from "@/components/booth-qr-modal";
import {
  STICKER_PALETTE,
  STICKER_PRESETS,
  type FrameColorId,
  type PhotoFilterId,
  type StickerAsset,
  type StickerItem,
  type StripConfig,
} from "@/lib/booth-types";
import {
  downloadUltraHdStrip,
  exportCompressedStripForUpload,
} from "@/lib/canvasExport";

export function BoothStudio() {
  // Studio phase state: "shoot" -> "customize" -> "share"
  const [studioPhase, setStudioPhase] = useState<"shoot" | "customize" | "share">("shoot");

  // Photos state: 4 slots
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

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
      filter,
      stickers,
      stickersVisible,
      caption,
      showDate,
      dateText,
    }),
    [photos, frameColor, filter, stickers, stickersVisible, caption, showDate, dateText]
  );

  // 1. Photo capture handlers
  const handlePhotoCaptured = useCallback((slotIndex: number, dataUrl: string) => {
    setPhotos((prev) => {
      const next = [...prev];
      next[slotIndex] = dataUrl;
      return next;
    });
  }, []);

  // Auto-Save on 4th Shot & Transition to Customize
  const handleSequenceComplete = useCallback(async () => {
    // Automatically advance to Customize phase
    setStudioPhase("customize");

    setTimeout(async () => {
      try {
        await downloadUltraHdStrip(
          {
            ...currentStripConfig,
            photos,
          },
          `chordisol-strip-${stripId || "session"}.png`
        );
      } catch (err) {
        console.warn("Auto-download notice:", err);
      }
    }, 400);
  }, [currentStripConfig, photos, stripId]);

  // 2. Sticker Actions
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

  // 🎲 Shuffle Stickers: Randomly distribute 4-6 complementary stickers with playful angles
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

  // 3. Ultra HD Local Download
  const handleDownloadUltraHd = async () => {
    setIsDownloading(true);
    try {
      await downloadUltraHdStrip(
        currentStripConfig,
        `chordisol-strip-${stripId || "session"}.png`
      );
    } catch (err) {
      console.error("High-Res download error:", err);
      alert("Unable to generate image. Please make sure camera images are loaded.");
    } finally {
      setIsDownloading(false);
    }
  };

  // 4. Mobile QR Code Cloud Upload Pipeline
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

  // 5. Reset photobooth
  const handleResetBooth = () => {
    if (confirm("Reset photobooth and clear all 4 photos?")) {
      setPhotos([null, null, null, null]);
      setStickers([]);
      setSelectedStickerId(null);
      setStudioPhase("shoot");
      setStripId(Math.random().toString(36).substring(2, 9) + Date.now().toString(36).slice(-4));
    }
  };

  const completedCount = photos.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-linear-to-b from-[#f8fafc] via-[#f0f5fc] to-[#eaf2fc] px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-7xl">
        {/* Studio Cockpit Top Bar */}
        <header className="mb-6 flex flex-col md:flex-row items-center justify-between gap-3.5 rounded-[20px] border border-border-subtle bg-white/80 dark:bg-slate-900/80 p-3 sm:p-4 shadow-[0_4px_16px_rgba(20,54,95,0.06)] backdrop-blur-xl">
          {/* Left: Branding & Status */}
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
                  4-CUT STUDIO
                </span>
              </div>
              <p className="text-xs text-text-muted font-medium">
                {completedCount === 4
                  ? "All 4 shots ready • Decorated & printable"
                  : `${completedCount} of 4 photos taken • ${stickers.length} stickers`}
              </p>
            </div>
          </div>

          {/* Center: 3-Step Tactile Phase Switcher */}
          <nav aria-label="Studio steps" className="flex items-center gap-1 rounded-full border border-border-subtle/80 bg-surface-secondary p-1 shadow-inner">
            <button
              type="button"
              onClick={() => setStudioPhase("shoot")}
              className={`flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-all cursor-pointer ${
                studioPhase === "shoot"
                  ? "bg-white text-fg-display shadow-xs border border-border-subtle"
                  : "text-text-muted hover:text-fg-display"
              }`}
            >
              <span>📸 1. Shoot</span>
              {completedCount === 4 && (
                <span className="flex size-3.5 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white">
                  ✓
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStudioPhase("customize")}
              className={`flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-all cursor-pointer ${
                studioPhase === "customize"
                  ? "bg-white text-fg-display shadow-xs border border-border-subtle"
                  : "text-text-muted hover:text-fg-display"
              }`}
            >
              <span>🎨 2. Customize</span>
              {stickers.length > 0 && (
                <span className="rounded-full bg-brand-primary/10 px-1.5 text-[10px] text-brand-primary">
                  {stickers.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStudioPhase("share")}
              className={`flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-all cursor-pointer ${
                studioPhase === "share"
                  ? "bg-white text-fg-display shadow-xs border border-border-subtle"
                  : "text-text-muted hover:text-fg-display"
              }`}
            >
              <span>💾 3. Save &amp; Share</span>
            </button>
          </nav>

          {/* Right: Quick Actions */}
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
              disabled={isDownloading}
              onClick={handleDownloadUltraHd}
              title="Download 3.5x Ultra HD PNG"
              className="flex h-9 items-center gap-1.5 rounded-full bg-brand-primary px-3.5 text-xs font-bold text-white shadow-xs hover:bg-[#1a82f0] active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>💾 Save</span>
            </button>

            <button
              type="button"
              onClick={handleResetBooth}
              title="Reset Photobooth"
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

        {/* Studio Grid: Left (Active Console) + Right (Screen-fitted Photobooth Strip) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (7 cols): Active Studio Console */}
          <section className="lg:col-span-7 flex flex-col gap-4">
            {/* PHASE 1: SHOOT */}
            {studioPhase === "shoot" && (
              <div className="flex flex-col gap-4">
                <CameraViewfinder
                  photos={photos}
                  onPhotoCaptured={handlePhotoCaptured}
                  onSequenceComplete={handleSequenceComplete}
                  onProceedToCustomize={() => setStudioPhase("customize")}
                  activeSlot={activeSlot}
                  setActiveSlot={setActiveSlot}
                />

                {/* Studio Tip */}
                <div className="flex items-center gap-2.5 rounded-[14px] border border-border-subtle bg-surface-secondary/70 px-4 py-3 text-xs text-text-muted">
                  <span className="text-base">💡</span>
                  <span>
                    3-second countdown before each shot. Prop your phone by your guitar or piano and strike 4 poses!
                  </span>
                </div>
              </div>
            )}

            {/* PHASE 2: CUSTOMIZE */}
            {studioPhase === "customize" && (
              <div className="flex flex-col gap-4">
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
                  onResetBooth={handleResetBooth}
                  isDownloading={isDownloading}
                  isUploading={isUploading}
                />

                {/* Navigation Bar between phases */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setStudioPhase("shoot")}
                    className="flex h-10 items-center gap-1.5 rounded-full border border-border-subtle bg-surface-secondary px-4 text-xs font-bold text-fg-display hover:bg-divider transition-all active:scale-95 cursor-pointer"
                  >
                    <span>← Retake Shots</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudioPhase("share")}
                    className="flex h-10 items-center gap-1.5 rounded-full bg-brand-primary px-5 font-display text-xs font-bold text-white shadow-xs hover:bg-[#1a82f0] transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Continue to Share &amp; Print →</span>
                  </button>
                </div>
              </div>
            )}

            {/* PHASE 3: SHARE & PRINT */}
            {studioPhase === "share" && (
              <div className="flex flex-col gap-4 rounded-[20px] border border-border-subtle bg-surface-elevated p-5 sm:p-6 shadow-[0_4px_16px_rgba(20,54,95,0.06)]">
                <div>
                  <h3 className="font-display text-base font-extrabold text-fg-display">
                    Print &amp; Share Studio
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Your 4-cut acoustic memory is ready in full print resolution and instant mobile delivery.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {/* Ultra HD Card */}
                  <div className="flex flex-col justify-between rounded-[16px] border border-brand-primary/20 bg-brand-primary/5 p-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-display text-xs font-bold text-brand-primary uppercase tracking-wide">
                          3.5x Ultra HD
                        </span>
                        <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-brand-primary">
                          1200 × 3792 px
                        </span>
                      </div>
                      <h4 className="font-display text-sm font-bold text-fg-display">
                        High-Resolution PNG
                      </h4>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        Lossless full-quality file optimized for physical printing, framing, and keepsake photo albums.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isDownloading}
                      onClick={handleDownloadUltraHd}
                      className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-primary font-display text-xs font-bold text-white shadow-[0_3px_0_#1454a4] hover:bg-[#1a82f0] active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} className="size-4">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span>
                        {isDownloading ? "Generating 3.5x..." : "Download Ultra HD Strip"}
                      </span>
                    </button>
                  </div>

                  {/* Mobile QR Card */}
                  <div className="flex flex-col justify-between rounded-[16px] border border-border-subtle bg-surface-secondary/70 p-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-display text-xs font-bold text-fg-display uppercase tracking-wide">
                          Phone Sync
                        </span>
                        <span className="rounded-full bg-surface-secondary px-2 py-0.5 font-mono text-[10px] font-bold text-text-muted border border-border-subtle">
                          Instant Scan
                        </span>
                      </div>
                      <h4 className="font-display text-sm font-bold text-fg-display">
                        Mobile QR Code
                      </h4>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        Scan directly from your iPhone or Android to open the mobile viewer and save to Photos with 1 tap.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={handleOpenMobileQr}
                      className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border-subtle bg-white font-display text-xs font-bold text-fg-display shadow-2xs hover:bg-surface-secondary active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4 text-brand-primary">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                      <span>
                        {isUploading ? "Uploading..." : "Generate Mobile QR Code"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Session Details */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle/80 pt-4 text-xs text-text-muted">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Frame:</span>
                    <span className="font-medium text-fg-display">{frameColor}</span>
                    <span>•</span>
                    <span className="font-semibold">Filter:</span>
                    <span className="font-medium text-fg-display">{filter}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStudioPhase("customize")}
                    className="font-bold text-brand-primary hover:underline cursor-pointer"
                  >
                    ← Edit Customizations
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* RIGHT COLUMN (5 cols): Live Strip Preview in Studio Pedestal */}
          <aside className="lg:col-span-5 flex flex-col items-center justify-center gap-3 lg:sticky lg:top-16">
            <div className="w-full rounded-[24px] border-2 border-slate-900/10 bg-white/70 dark:bg-slate-900/70 p-4 sm:p-5 shadow-[0_8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl flex flex-col items-center justify-between">
              {/* Header Label on Pedestal */}
              <div className="w-full flex items-center justify-between pb-3 px-1 border-b border-border-subtle/70">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-display text-xs font-bold text-fg-display uppercase tracking-wider">
                    Photobooth Strip
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
                    setActiveSlot(slot);
                    setStudioPhase("shoot");
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
