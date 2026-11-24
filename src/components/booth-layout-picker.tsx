"use client";

import React from "react";
import {
  FRAME_PRESETS,
  LAYOUT_VARIATIONS,
  PHOTO_FILTERS,
  type FrameColorId,
  type LayoutVariationId,
  type PhotoFilterId,
} from "@/lib/booth-types";

interface BoothLayoutPickerProps {
  layoutVariation: LayoutVariationId;
  onChangeLayoutVariation: (layout: LayoutVariationId) => void;
  frameColor: FrameColorId;
  onChangeFrameColor: (color: FrameColorId) => void;
  filter: PhotoFilterId;
  onChangeFilter: (filter: PhotoFilterId) => void;
  onProceedToCamera: () => void;
}

export function BoothLayoutPicker({
  layoutVariation,
  onChangeLayoutVariation,
  frameColor,
  onChangeFrameColor,
  filter,
  onChangeFilter,
  onProceedToCamera,
}: BoothLayoutPickerProps) {
  return (
    <div className="flex flex-col gap-6 rounded-[24px] border-2 border-slate-900/10 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-[0_4px_0_rgba(15,23,42,0.06)]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white shadow-xs">
            1
          </span>
          <h2 className="font-display text-lg sm:text-xl font-extrabold text-fg-display">
            Step 1: Choose Photobooth Style &amp; Layout
          </h2>
        </div>
        <p className="text-xs text-text-muted mt-1">
          Pick your brand logo placement, frame color, and photographic tone. Preview updates on your strip in real-time!
        </p>
      </div>

      {/* 1. Layout Variations (Different Logo Placements & Formats) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="font-display text-xs font-extrabold text-fg-display uppercase tracking-wider">
            1. Logo Placement &amp; Header Format
          </label>
          <span className="text-[11px] font-semibold text-brand-primary">
            4 Studio Presets
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LAYOUT_VARIATIONS.map((variant) => {
            const isSelected = layoutVariation === variant.id;

            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => onChangeLayoutVariation(variant.id)}
                className={`flex flex-col gap-1 rounded-[16px] border-2 p-3.5 text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20 shadow-xs"
                    : "border-slate-900/10 bg-surface-secondary/50 hover:border-slate-300 hover:bg-surface-secondary"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold text-fg-display">
                      {variant.name}
                    </span>
                    <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 font-mono text-[9px] font-bold text-brand-primary">
                      {variant.tagline}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="flex size-4 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-white">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {variant.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Frame Theme Presets */}
      <div className="space-y-2.5 pt-2 border-t border-border-subtle/80">
        <label className="block font-display text-xs font-extrabold text-fg-display uppercase tracking-wider">
          2. Frame Paper &amp; Color Theme
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {FRAME_PRESETS.map((preset) => {
            const isSelected = frameColor === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChangeFrameColor(preset.id)}
                className={`flex items-center gap-2.5 rounded-[12px] border-2 p-2.5 text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20 shadow-xs"
                    : "border-slate-900/10 bg-surface-secondary/50 hover:border-slate-300"
                }`}
              >
                <span
                  style={{
                    backgroundColor: preset.previewBg,
                    borderColor: preset.border,
                  }}
                  className="size-7 shrink-0 rounded-full border-2 shadow-xs"
                />
                <span className="font-sans text-xs font-bold text-fg-display truncate">
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

      {/* 3. Initial Film Filter Tone */}
      <div className="space-y-2.5 pt-2 border-t border-border-subtle/80">
        <label className="block font-display text-xs font-extrabold text-fg-display uppercase tracking-wider">
          3. Photographic Film Filter
        </label>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {PHOTO_FILTERS.map((f) => {
            const isSelected = filter === f.id;

            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onChangeFilter(f.id)}
                className={`flex flex-col items-center gap-1.5 rounded-[12px] border-2 p-2 text-center transition-all cursor-pointer ${
                  isSelected
                    ? "border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20 shadow-xs"
                    : "border-slate-900/10 bg-surface-secondary/50 hover:border-slate-300"
                }`}
              >
                <div
                  style={{ filter: f.css }}
                  className="h-8 w-full rounded-[6px] bg-linear-to-r from-amber-400 via-rose-400 to-sky-400 shadow-inner"
                />
                <span className="font-sans text-[11px] font-bold text-fg-display truncate w-full">
                  {f.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advance to Step 2 Button */}
      <div className="flex items-center justify-end pt-3 border-t border-border-subtle/80">
        <button
          type="button"
          onClick={onProceedToCamera}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-primary px-7 font-display text-sm font-bold text-white shadow-[0_3px_0_#1454a4] hover:bg-[#1a82f0] active:translate-y-0.5 active:shadow-[0_1px_0_#1454a4] transition-all cursor-pointer"
        >
          <span>Proceed to Live Camera (Step 2)</span>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.5} className="size-3.5">
            <path d="M6 3l5 5-5 5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
