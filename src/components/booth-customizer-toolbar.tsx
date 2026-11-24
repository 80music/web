"use client";

import Image from "next/image";
import React, { useState } from "react";
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
} from "@/lib/booth-types";

interface BoothCustomizerToolbarProps {
  photos: (string | null)[];
  onRetakeSlot: (slotIndex: number) => void;
  onRetakeAll: () => void;
  frameColor: FrameColorId;
  onChangeFrameColor: (id: FrameColorId) => void;
  layoutVariation: LayoutVariationId;
  onChangeLayoutVariation: (id: LayoutVariationId) => void;
  filter: PhotoFilterId;
  onChangeFilter: (id: PhotoFilterId) => void;
  stickers: StickerItem[];
  stickersVisible: boolean;
  onToggleStickersVisible: () => void;
  onAddSticker: (asset: StickerAsset) => void;
  onShuffleStickers: () => void;
  onClearStickers: () => void;
  caption: string;
  onChangeCaption: (caption: string) => void;
  showDate: boolean;
  onToggleShowDate: () => void;
}

type TabKey = "photos" | "style" | "stickers" | "caption";

export function BoothCustomizerToolbar({
  photos,
  onRetakeSlot,
  onRetakeAll,
  frameColor,
  onChangeFrameColor,
  layoutVariation,
  onChangeLayoutVariation,
  filter,
  onChangeFilter,
  stickers,
  stickersVisible,
  onToggleStickersVisible,
  onAddSticker,
  onShuffleStickers,
  onClearStickers,
  caption,
  onChangeCaption,
  showDate,
  onToggleShowDate,
}: BoothCustomizerToolbarProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("style");
  const [stickerCategory, setStickerCategory] = useState<string>("all");

  const filteredStickerPalette =
    stickerCategory === "all"
      ? STICKER_PALETTE
      : STICKER_PALETTE.filter((s) => s.category === stickerCategory);

  const QUICK_CAPTIONS = [
    "Acoustic Session • Chordisol Studio",
    "Ear Training Certified 🎹",
    "Chords & Coffee • Studio Day",
    "Trust Your Ear 🎶",
    "100% Acoustic • Pure Harmony",
  ];

  const completedCount = photos.filter(Boolean).length;

  return (
    <div className="flex flex-col rounded-[22px] border-2 border-slate-900/10 bg-white shadow-[0_4px_0_rgba(15,23,42,0.06)] overflow-hidden">
      {/* 1. Segmented Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-900/10 bg-[#f8fafc] p-2.5 overflow-x-auto no-scrollbar">
        {[
          { key: "style" as TabKey, label: "Frame & Tone", icon: "🎨" },
          { key: "photos" as TabKey, label: "Shots & Retake", icon: "📸", count: `${completedCount}/4` },
          { key: "stickers" as TabKey, label: "Stickers & Chords", icon: "🏷️", count: stickers.length || undefined },
          { key: "caption" as TabKey, label: "Caption & Date", icon: "✍️" },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex h-9.5 shrink-0 items-center gap-1.5 rounded-full px-3.5 font-sans text-xs font-bold transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-brand-primary text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    isActive ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Tab Content Panels */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* TAB: FRAME & STYLE (Layout, Frame Paper, Film Tone) */}
        {activeTab === "style" && (
          <div className="space-y-6">
            {/* A. Frame Paper Theme */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider">
                  1. Photobooth Paper Frame
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
                      onClick={() => onChangeFrameColor(preset.id)}
                      className={`flex items-center gap-2.5 rounded-[14px] border-2 p-2.5 text-left transition-all cursor-pointer ${
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

            {/* B. Header Layout Variation */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider block">
                2. Header Style &amp; Logo Format
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LAYOUT_VARIATIONS.map((variant) => {
                  const isSelected = layoutVariation === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => onChangeLayoutVariation(variant.id)}
                      className={`flex flex-col gap-1 rounded-[14px] border-2 p-3 text-left transition-all cursor-pointer ${
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

            {/* C. Film Filters */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
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
                      onClick={() => onChangeFilter(f.id)}
                      className={`flex flex-col gap-1.5 rounded-[14px] border-2 p-2.5 text-left transition-all cursor-pointer ${
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
                        className="h-8 w-full rounded-[8px] bg-linear-to-r from-amber-400 via-rose-400 to-sky-400 shadow-inner"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB: PHOTOS & RETAKE */}
        {activeTab === "photos" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">
                  Your 4 Candid Shots
                </h3>
                <p className="text-xs text-slate-500">
                  Tap Retake on any individual shot you&apos;d like to re-do!
                </p>
              </div>

              {completedCount > 0 && (
                <button
                  type="button"
                  onClick={onRetakeAll}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                >
                  ↺ Retake All
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((idx) => {
                const photo = photos[idx];
                return (
                  <div
                    key={idx}
                    className="flex flex-col rounded-[14px] border-2 border-slate-900/10 bg-slate-50 p-2 shadow-2xs"
                  >
                    <div className="relative aspect-4/3 w-full overflow-hidden rounded-[10px] bg-slate-900 border border-slate-200">
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
                      onClick={() => onRetakeSlot(idx)}
                      className="mt-2 flex h-8 w-full items-center justify-center gap-1 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
                    >
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="size-3 text-slate-500">
                        <path d="M2.5 8a5.5 5.5 0 1 1 1.2 3.4M2.5 12V8h4" />
                      </svg>
                      <span>Retake</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: STICKERS & CHORDS */}
        {activeTab === "stickers" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">
                  Acoustic Mascot &amp; Chord Stickers
                </h3>
                <p className="text-xs text-slate-500">
                  Tap to place. Drag, rotate, or delete stickers directly on the strip!
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onShuffleStickers}
                  title="Randomly distribute stickers"
                  className="flex h-8 items-center gap-1 rounded-full bg-brand-primary/10 px-3 text-xs font-bold text-brand-primary hover:bg-brand-primary/20 active:scale-95 transition-all cursor-pointer"
                >
                  <span>🎲 Shuffle</span>
                </button>

                <button
                  type="button"
                  onClick={onToggleStickersVisible}
                  className={`flex h-8 items-center gap-1 rounded-full px-3 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                    stickersVisible
                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}
                >
                  <span>{stickersVisible ? "Hide" : "Show"}</span>
                </button>

                {stickers.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearStickers}
                    className="flex h-8 items-center gap-1 rounded-full bg-rose-50 px-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {[
                { id: "all", label: "All Items" },
                { id: "mascots", label: "🎵 Mascots" },
                { id: "chords", label: "🎹 Chords" },
                { id: "badges", label: "⭐ Stamps & Seals" },
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

            {/* Sticker Palette Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-[220px] overflow-y-auto p-1 border rounded-[16px] border-slate-100 bg-slate-50/50">
              {filteredStickerPalette.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => onAddSticker(asset)}
                  title={`Add ${asset.name}`}
                  className="group flex flex-col items-center justify-center gap-1 rounded-[12px] border-2 border-slate-900/10 bg-white p-2.5 shadow-2xs hover:border-brand-primary hover:bg-brand-primary/5 active:scale-95 transition-all cursor-pointer"
                >
                  <div className="relative size-11">
                    <Image
                      src={asset.src}
                      alt={asset.name}
                      fill
                      className="object-contain transition-transform group-hover:scale-110"
                    />
                  </div>
                  <span className="font-sans text-[10px] font-bold text-slate-700 truncate max-w-full">
                    {asset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB: CAPTION & DATE */}
        {activeTab === "caption" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-sm font-bold text-slate-900">
                Custom Session Caption &amp; Date
              </h3>
              <p className="text-xs text-slate-500">
                Printed at the bottom of your photobooth strip with retro barcode.
              </p>
            </div>

            {/* Caption Input */}
            <div className="space-y-1.5">
              <label htmlFor="caption-input" className="block text-xs font-bold text-slate-700">
                Strip Title
              </label>
              <input
                id="caption-input"
                type="text"
                maxLength={42}
                value={caption}
                onChange={(e) => onChangeCaption(e.target.value)}
                placeholder="e.g. Acoustic Session • Chordisol Studio"
                className="w-full rounded-[12px] border-2 border-slate-900/10 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-brand-primary focus:bg-white transition-colors"
              />
            </div>

            {/* Quick Caption Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Quick Suggestions:</span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_CAPTIONS.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onChangeCaption(preset)}
                    className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-brand-primary/10 hover:text-brand-primary hover:border-brand-primary/30 active:scale-95 transition-all cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Switch */}
            <div className="flex items-center justify-between rounded-[14px] border border-slate-200 bg-slate-50 p-3 pt-3">
              <div>
                <p className="font-sans text-xs font-bold text-slate-800">
                  Display Date &amp; Time Stamp
                </p>
                <p className="text-[11px] text-slate-500">
                  Adds today&apos;s session timestamp next to the retro barcode.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={showDate}
                onClick={onToggleShowDate}
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
        )}
      </div>
    </div>
  );
}
