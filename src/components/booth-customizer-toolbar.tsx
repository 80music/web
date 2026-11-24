"use client";

import Image from "next/image";
import React, { useState } from "react";
import {
  FRAME_PRESETS,
  PHOTO_FILTERS,
  STICKER_PALETTE,
  STICKER_PRESETS,
  type FrameColorId,
  type PhotoFilterId,
  type StickerAsset,
  type StickerItem,
} from "@/lib/booth-types";

interface BoothCustomizerToolbarProps {
  frameColor: FrameColorId;
  onChangeFrameColor: (id: FrameColorId) => void;
  filter: PhotoFilterId;
  onChangeFilter: (id: PhotoFilterId) => void;
  stickers: StickerItem[];
  stickersVisible: boolean;
  onToggleStickersVisible: () => void;
  onAddSticker: (asset: StickerAsset) => void;
  onApplyStickerPreset: (presetId: string) => void;
  onShuffleStickers: () => void;
  onClearStickers: () => void;
  caption: string;
  onChangeCaption: (caption: string) => void;
  showDate: boolean;
  onToggleShowDate: () => void;
  onDownloadUltraHd: () => void;
  onOpenMobileQr: () => void;
  onResetBooth: () => void;
  isDownloading: boolean;
  isUploading: boolean;
  onProceedToShare?: () => void;
}

type TabKey = "frame" | "filters" | "stickers" | "text" | "save";

export function BoothCustomizerToolbar({
  frameColor,
  onChangeFrameColor,
  filter,
  onChangeFilter,
  stickers,
  stickersVisible,
  onToggleStickersVisible,
  onAddSticker,
  onApplyStickerPreset,
  onShuffleStickers,
  onClearStickers,
  caption,
  onChangeCaption,
  showDate,
  onToggleShowDate,
  onDownloadUltraHd,
  onOpenMobileQr,
  onResetBooth,
  isDownloading,
  isUploading,
  onProceedToShare,
}: BoothCustomizerToolbarProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("stickers");
  const [stickerCategory, setStickerCategory] = useState<string>("all");

  const filteredStickerPalette =
    stickerCategory === "all"
      ? STICKER_PALETTE
      : STICKER_PALETTE.filter((s) => s.category === stickerCategory);

  const QUICK_CAPTIONS = [
    "Acoustic Session • Chordisol Studio",
    "Ear Training Certified 🎹",
    "100% Acoustic • Pure Harmony",
    "Chords & Coffee • Studio Day",
    "Trust Your Ear 🎶",
  ];

  return (
    <div className="flex flex-col rounded-[20px] border border-border-subtle bg-surface-elevated shadow-[0_4px_16px_rgba(20,54,95,0.06)] overflow-hidden">
      {/* 1. Segmented Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-border-subtle/80 bg-surface-secondary/70 p-2 overflow-x-auto no-scrollbar">
        {[
          { key: "frame" as TabKey, label: "Frame", icon: "🎨" },
          { key: "filters" as TabKey, label: "Filters", icon: "✨" },
          { key: "stickers" as TabKey, label: "Stickers", icon: "🏷️" },
          { key: "text" as TabKey, label: "Text", icon: "✍️" },
          { key: "save" as TabKey, label: "Save & Share", icon: "💾" },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex h-9 shrink-0 items-center gap-1.5 rounded-[10px] px-3 font-sans text-xs font-bold transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-white text-fg-display shadow-xs border border-border-subtle"
                  : "text-text-muted hover:bg-white/50 hover:text-fg-display"
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.key === "stickers" && stickers.length > 0 && (
                <span className="rounded-full bg-brand-primary/10 text-brand-primary px-1.5 py-0.2 text-[10px]">
                  {stickers.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Tab Panels */}
      <div className="p-4 sm:p-5">
        {/* TAB 1: FRAME COLOR */}
        {activeTab === "frame" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-sm font-bold text-fg-display">
                Company Frame Themes
              </h3>
              <p className="text-xs text-text-muted">
                Select from Chordisol&apos;s brand frame presets for your 4-cut photobooth strip.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {FRAME_PRESETS.map((preset) => {
                const isSelected = frameColor === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onChangeFrameColor(preset.id)}
                    className={`flex items-center gap-2.5 rounded-[12px] border p-2 text-left transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20 shadow-xs"
                        : "border-border-subtle bg-surface-secondary hover:border-slate-300"
                    }`}
                  >
                    <span
                      style={{
                        backgroundColor: preset.previewBg,
                        borderColor: preset.border,
                      }}
                      className="size-7 shrink-0 rounded-full border-2 shadow-xs"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-sans text-xs font-bold text-fg-display truncate">
                        {preset.name}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="text-brand-primary text-xs font-bold">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: FILTERS */}
        {activeTab === "filters" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-sm font-bold text-fg-display">
                Photo Tones &amp; Film Filters
              </h3>
              <p className="text-xs text-text-muted">
                Apply real-time photographic color grading to all 4 shots.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PHOTO_FILTERS.map((f) => {
                const isSelected = filter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onChangeFilter(f.id)}
                    className={`flex flex-col gap-1.5 rounded-[12px] border p-3 text-left transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20 shadow-xs"
                        : "border-border-subtle bg-surface-secondary hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-xs font-bold text-fg-display">
                        {f.name}
                      </span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-text-muted shadow-xs">
                        {f.badge}
                      </span>
                    </div>
                    <div
                      style={{ filter: f.css }}
                      className="h-10 w-full rounded-[8px] bg-linear-to-r from-amber-400 via-rose-400 to-sky-400 shadow-inner"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: STICKERS */}
        {activeTab === "stickers" && (
          <div className="space-y-4">
            {/* Header with Quick Actions: Shuffle & Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div>
                <h3 className="font-display text-sm font-bold text-fg-display">
                  Chordisol Sticker Palette
                </h3>
                <p className="text-xs text-text-muted">
                  Tap any sticker to place. Drag, rotate, or resize directly on the strip!
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onShuffleStickers}
                  title="Randomly distribute stickers across the strip"
                  className="flex h-8 items-center gap-1.5 rounded-full bg-brand-primary/10 px-3 text-xs font-bold text-brand-primary transition-colors hover:bg-brand-primary/20 active:scale-95 cursor-pointer"
                >
                  <span>🎲 Shuffle</span>
                </button>

                <button
                  type="button"
                  onClick={onToggleStickersVisible}
                  className={`flex h-8 items-center gap-1 rounded-full px-3 text-xs font-bold transition-colors active:scale-95 cursor-pointer ${
                    stickersVisible
                      ? "bg-surface-secondary text-fg-display hover:bg-divider"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}
                >
                  <span>{stickersVisible ? "Hide All" : "Show All"}</span>
                </button>

                {stickers.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearStickers}
                    className="flex h-8 items-center rounded-full bg-rose-50 px-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 active:scale-95 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Presets Row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-[11px] font-bold text-text-muted shrink-0">
                Templates:
              </span>
              {STICKER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onApplyStickerPreset(preset.id)}
                  className="shrink-0 rounded-full border border-border-subtle bg-white px-2.5 py-1 text-xs font-semibold text-fg-display transition-colors hover:border-brand-primary active:scale-95 cursor-pointer shadow-2xs"
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 border-b border-border-subtle/70 pb-2">
              {[
                { id: "all", label: "All" },
                { id: "mascots", label: "Mascots" },
                { id: "chords", label: "Chords" },
                { id: "badges", label: "Badges" },
                { id: "sparkles", label: "Sparkles" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setStickerCategory(cat.id)}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors cursor-pointer ${
                    stickerCategory === cat.id
                      ? "bg-brand-primary text-white"
                      : "bg-surface-secondary text-text-muted hover:text-fg-display"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Sticker Grid Tray */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-1 rounded-[12px] bg-surface-secondary/40 border border-border-subtle/60">
              {filteredStickerPalette.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => onAddSticker(asset)}
                  title={`Add ${asset.name}`}
                  className="flex flex-col items-center justify-center gap-1 rounded-[10px] border border-transparent bg-white p-2 shadow-2xs transition-all duration-150 hover:border-brand-primary hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <div className="size-11 sm:size-12 flex items-center justify-center">
                    <Image
                      src={asset.src}
                      alt={asset.name}
                      width={48}
                      height={48}
                      className="size-full object-contain pointer-events-none drop-shadow-xs"
                      unoptimized={asset.src.endsWith(".svg")}
                    />
                  </div>
                  <span className="font-sans text-[10px] font-semibold text-fg-display truncate w-full text-center">
                    {asset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: TEXT & CAPTION */}
        {activeTab === "text" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-sm font-bold text-fg-display">
                Strip Caption &amp; Timestamp
              </h3>
              <p className="text-xs text-text-muted">
                Personalize the bottom title and stamp displayed on your strip.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="caption-input"
                  className="block text-xs font-bold text-fg-display mb-1"
                >
                  Custom Caption
                </label>
                <input
                  id="caption-input"
                  type="text"
                  maxLength={50}
                  value={caption}
                  onChange={(e) => onChangeCaption(e.target.value)}
                  placeholder="Acoustic Session • Chordisol Studio"
                  className="h-10 w-full rounded-[10px] border border-border-subtle bg-surface-secondary px-3 text-sm font-semibold text-fg-display outline-none transition-colors focus:border-brand-primary focus:bg-white"
                />
              </div>

              {/* Quick Preset Caption Pills */}
              <div>
                <span className="block text-[11px] font-bold text-text-muted mb-1.5">
                  Quick Suggestions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_CAPTIONS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => onChangeCaption(preset)}
                      className="rounded-full border border-border-subtle bg-surface-secondary px-2.5 py-1 text-xs font-medium text-fg-display transition-colors hover:border-brand-primary active:scale-95 cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date/Time Toggle */}
              <div className="flex items-center justify-between rounded-[12px] border border-border-subtle bg-surface-secondary/70 p-3">
                <div>
                  <p className="text-xs font-bold text-fg-display">
                    Include Date &amp; Time Stamp
                  </p>
                  <p className="text-[11px] text-text-muted">
                    Shows live timestamp at bottom of strip
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onToggleShowDate}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    showDate ? "bg-brand-primary" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block size-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      showDate ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SAVE & SHARE */}
        {activeTab === "save" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-sm font-bold text-fg-display">
                Download &amp; Mobile Sharing
              </h3>
              <p className="text-xs text-text-muted">
                Save your 4-cut photobooth memory in ultra-crisp print quality or scan with your phone.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {/* Ultra HD Download Button */}
              <button
                type="button"
                disabled={isDownloading}
                onClick={onDownloadUltraHd}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-primary px-5 font-display text-sm font-bold text-white shadow-[0_3px_0_#1454a4] transition-all hover:bg-[#1a82f0] active:translate-y-0.5 active:shadow-[0_1px_0_#1454a4] disabled:opacity-60 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} className="size-5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>
                  {isDownloading
                    ? "Generating 3.5x Ultra HD..."
                    : "Download 3.5x Ultra HD Strip (PNG)"}
                </span>
              </button>

              {/* Mobile QR Code Button */}
              <button
                type="button"
                disabled={isUploading}
                onClick={onOpenMobileQr}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-border-subtle bg-surface-secondary px-5 font-display text-sm font-bold text-fg-display transition-all hover:bg-divider active:scale-98 disabled:opacity-60 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-5 text-brand-primary">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <span>
                  {isUploading ? "Uploading for QR..." : "📱 Mobile QR Code"}
                </span>
              </button>

              {/* Reset Strip */}
              <button
                type="button"
                onClick={onResetBooth}
                className="mt-2 text-center text-xs font-semibold text-rose-600 hover:text-rose-700 active:underline cursor-pointer"
              >
                Reset Photobooth &amp; Clear Photos
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Advance to Step 5 Button */}
      {onProceedToShare && (
        <div className="flex items-center justify-between border-t border-border-subtle/80 bg-surface-secondary/50 p-3 sm:px-5">
          <p className="text-xs text-text-muted hidden sm:block">
            Finished styling? Proceed to save or generate QR code.
          </p>
          <button
            type="button"
            onClick={onProceedToShare}
            className="ml-auto inline-flex h-10 items-center justify-center gap-2 rounded-full bg-brand-primary px-5 font-display text-xs font-bold text-white shadow-xs hover:bg-[#1a82f0] active:scale-95 transition-all cursor-pointer"
          >
            <span>Finish &amp; Export (Step 5)</span>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.5} className="size-3">
              <path d="M6 3l5 5-5 5" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
