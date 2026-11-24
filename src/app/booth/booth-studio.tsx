"use client";

import React, { useCallback, useMemo, useState } from "react";
import { CameraViewfinder } from "@/components/camera-viewfinder";
import { PhotoboothStrip } from "@/components/photobooth-strip";
import { BoothCustomizerToolbar } from "@/components/booth-customizer-toolbar";
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

export function BoothStudio() {
  // Mode: "camera" | "customize"
  const [activeTab, setActiveTab] = useState<"camera" | "customize">("camera");

  // Photos state: 4 slots
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null]);
  const [activeSlot, setActiveSlot] = useState<number>(0);

  // Styling & Customization
  const [frameColor, setFrameColor] = useState<FrameColorId>("classic-white");
  const [layoutVariation, setLayoutVariation] = useState<LayoutVariationId>("classic-top");
  const [filter, setFilter] = useState<PhotoFilterId>("original");
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [stickersVisible, setStickersVisible] = useState(true);
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

  // When 4-shot sequence completes -> switch to customize
  const handleSequenceComplete = useCallback(() => {
    setActiveTab("customize");
  }, []);

  // Sticker actions
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
      setActiveTab("camera");
      setActiveSlot(0);
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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl">
        {/* Top Header Bar */}
        <header className="mb-6 flex flex-col md:flex-row items-center justify-between gap-3.5 rounded-2xl border-2 border-slate-900/10 bg-white p-3.5 sm:p-4 shadow-[0_4px_0_rgba(15,23,42,0.06)]">
          {/* Logo & Title */}
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
                Snap 4 candid poses with your instrument, decorate, and export in 3.5x Ultra HD
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <nav aria-label="Photobooth modes" className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("camera")}
              className={`flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "camera"
                  ? "bg-brand-primary text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>📸 Camera Booth</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("customize")}
              className={`flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "customize"
                  ? "bg-brand-primary text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>🎨 Customize &amp; Print</span>
              {completedCount > 0 && (
                <span className="rounded-full bg-white/25 px-1.5 py-0.2 text-[10px]">
                  {completedCount}/4
                </span>
              )}
            </button>
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

        {/* 2-Column Main Studio: Left (Controls/Camera) + Right (Photobooth Strip) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Camera or Customizer */}
          <section className="lg:col-span-7 flex flex-col gap-4">
            {activeTab === "camera" ? (
              <div className="flex flex-col gap-4">
                <CameraViewfinder
                  photos={photos}
                  onPhotoCaptured={handlePhotoCaptured}
                  onSequenceComplete={handleSequenceComplete}
                  activeSlot={activeSlot}
                  onSelectSlot={setActiveSlot}
                />

                {completedCount === 4 && (
                  <div className="flex items-center justify-between rounded-2xl border-2 border-emerald-500/20 bg-emerald-50/80 p-4 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">🎉</span>
                      <div>
                        <p className="font-display text-sm font-bold text-emerald-950">
                          All 4 shots are in the strip!
                        </p>
                        <p className="text-xs text-emerald-700">
                          Personalize your frame color, stickers, and caption next.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab("customize")}
                      className="flex h-10 items-center gap-1.5 rounded-full bg-brand-primary px-4 font-display text-xs font-bold text-white shadow-[0_3px_0_#0f5298] hover:bg-[#1a82f0] active:translate-y-0.5 active:shadow-[0_1px_0_#0f5298] cursor-pointer transition-all"
                    >
                      <span>Customize Strip →</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <BoothCustomizerToolbar
                photos={photos}
                onRetakeSlot={(slot) => {
                  setActiveSlot(slot);
                  setActiveTab("camera");
                }}
                onRetakeAll={() => {
                  setPhotos([null, null, null, null]);
                  setActiveSlot(0);
                  setActiveTab("camera");
                }}
                frameColor={frameColor}
                onChangeFrameColor={setFrameColor}
                layoutVariation={layoutVariation}
                onChangeLayoutVariation={setLayoutVariation}
                filter={filter}
                onChangeFilter={setFilter}
                stickers={stickers}
                stickersVisible={stickersVisible}
                onToggleStickersVisible={() => setStickersVisible((v) => !v)}
                onAddSticker={handleAddSticker}
                onShuffleStickers={handleShuffleStickers}
                onClearStickers={handleClearStickers}
                caption={caption}
                onChangeCaption={setCaption}
                showDate={showDate}
                onToggleShowDate={() => setShowDate((v) => !v)}
              />
            )}
          </section>

          {/* Right Column (5 cols): Screen-Fitted Photobooth Strip Pedestal */}
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
                    setActiveSlot(slot);
                    setActiveTab("camera");
                  }}
                />
              </div>

              {/* Export Buttons */}
              <div className="w-full flex items-center gap-2.5 pt-4 mt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isDownloading}
                  onClick={handleDownloadUltraHd}
                  className="flex-1 flex h-11 items-center justify-center gap-2 rounded-full bg-brand-primary text-white font-display text-xs font-bold shadow-[0_3px_0_#0f5298] hover:bg-[#1a82f0] active:translate-y-0.5 active:shadow-[0_1px_0_#0f5298] transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} className="size-4">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>{isDownloading ? "Generating..." : "Download 3.5x Ultra HD"}</span>
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
        stripId={qrModalData.stripId}
      />
    </div>
  );
}
