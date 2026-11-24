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

  // Auto-Save on 4th Shot: Automatically trigger high-resolution download when all 4 are taken
  const handleSequenceComplete = useCallback(async () => {
    // Small timeout to allow state to settle
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
    // Spawn sticker in upper-middle or with slight random jitter so they don't overlap completely
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
    // Pick 4 to 6 random distinct assets
    const shuffledAssets = [...STICKER_PALETTE].sort(() => 0.5 - Math.random());
    const count = 4 + Math.floor(Math.random() * 2);
    const selectedAssets = shuffledAssets.slice(0, count);

    // Scatter zones: 4 quadrants vertically down the strip
    const newStickers: StickerItem[] = selectedAssets.map((asset, index) => {
      const yZone = 12 + index * 18 + Math.floor(Math.random() * 8);
      const xPos = index % 2 === 0 ? 18 + Math.floor(Math.random() * 12) : 80 - Math.floor(Math.random() * 12);
      const randomRot = Math.floor(Math.random() * 32) - 16; // -16° to +16°

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
      // Dual-resolution protection: Export 1.5x compressed image (~200KB)
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
      setStripId(Math.random().toString(36).substring(2, 9) + Date.now().toString(36).slice(-4));
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#f8fafc] via-[#f0f5fc] to-[#eaf2fc] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        {/* Page Header */}
        <header className="mb-8 text-center sm:mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3.5 py-1 text-xs font-bold text-brand-primary shadow-xs">
            <span className="size-2 rounded-full bg-brand-primary animate-pulse" />
            <span>Interactive 4-Cut Studio</span>
          </div>

          <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-fg-display">
            Acoustic Photobooth
          </h1>
          <p className="mt-2 text-sm sm:text-base font-medium text-text-muted max-w-xl mx-auto leading-relaxed">
            Capture 4 candid shots, decorate with Chordisol note mascots and tactile chord blocks, and download in 3.5x Ultra HD.
          </p>
        </header>

        {/* Studio Grid: Left (Camera & Controls) + Right (Photobooth Strip) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN (7 cols): Camera Viewfinder & Customizer Toolbar */}
          <section className="lg:col-span-7 flex flex-col gap-6">
            {/* Live Camera Viewfinder */}
            <CameraViewfinder
              photos={photos}
              onPhotoCaptured={handlePhotoCaptured}
              onSequenceComplete={handleSequenceComplete}
              activeSlot={activeSlot}
              setActiveSlot={setActiveSlot}
            />

            {/* Customizer Tabs Toolbar */}
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
          </section>

          {/* RIGHT COLUMN (5 cols): Live Strip Preview & Quick Actions */}
          <aside className="lg:col-span-5 flex flex-col items-center gap-4 lg:sticky lg:top-20">
            <div className="w-full flex items-center justify-between px-2">
              <span className="font-display text-sm font-bold text-fg-display">
                Photobooth Result Preview
              </span>
              <span className="font-sans text-xs text-text-muted">
                {stickers.length} stickers placed
              </span>
            </div>

            {/* Photobooth Strip DOM Component */}
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
              onRetakeSlot={(slot) => setActiveSlot(slot)}
            />

            {/* Quick Actions Bar under Strip */}
            <div className="flex w-full max-w-[350px] items-center justify-center gap-2 pt-2">
              <button
                type="button"
                disabled={isDownloading}
                onClick={handleDownloadUltraHd}
                className="flex-1 flex h-10 items-center justify-center gap-1.5 rounded-full bg-fg-display text-white font-sans text-xs font-bold shadow-xs transition-transform hover:bg-slate-900 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <span>💾 Ultra HD Save</span>
              </button>

              <button
                type="button"
                disabled={isUploading}
                onClick={handleOpenMobileQr}
                className="flex-1 flex h-10 items-center justify-center gap-1.5 rounded-full border border-border-subtle bg-white text-fg-display font-sans text-xs font-bold shadow-2xs transition-transform hover:bg-surface-secondary active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <span>📱 Phone QR</span>
              </button>
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
