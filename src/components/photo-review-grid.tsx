"use client";

import React from "react";

interface PhotoReviewGridProps {
  photos: (string | null)[];
  onRetakeSpecificShot: (slotIndex: number) => void;
  onRetakeAll: () => void;
  onConfirmPhotos: () => void;
}

export function PhotoReviewGrid({
  photos,
  onRetakeSpecificShot,
  onRetakeAll,
  onConfirmPhotos,
}: PhotoReviewGridProps) {
  return (
    <div className="flex flex-col gap-6 rounded-[24px] border-2 border-slate-900/10 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-[0_4px_0_rgba(15,23,42,0.06)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow-xs">
              ✓
            </span>
            <h2 className="font-display text-lg sm:text-xl font-extrabold text-fg-display">
              Review Your 4 Candid Shots
            </h2>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Check your poses. Tap <strong>Retake</strong> on any specific shot you want to re-do!
          </p>
        </div>

        <button
          type="button"
          onClick={onRetakeAll}
          className="self-start sm:self-auto text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
        >
          ↺ Retake All 4 Shots
        </button>
      </div>

      {/* 4 Photo Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        {[0, 1, 2, 3].map((slotIndex) => {
          const photoUrl = photos[slotIndex];

          return (
            <div
              key={slotIndex}
              className="flex flex-col rounded-[16px] border-2 border-slate-900/10 bg-surface-secondary/50 p-2.5 sm:p-3 shadow-xs transition-transform duration-150 hover:-translate-y-0.5"
            >
              {/* Photo View */}
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-[12px] bg-slate-950 border border-slate-900/10 shadow-inner">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoUrl}
                    alt={`Review Shot ${slotIndex + 1}`}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-xs text-white/50">
                    No photo
                  </div>
                )}

                {/* Badge */}
                <div className="absolute top-2 left-2 rounded-full bg-slate-900/80 px-2 py-0.5 font-mono text-[10px] font-bold text-white backdrop-blur-md">
                  Shot {slotIndex + 1}
                </div>
              </div>

              {/* Retake specific shot button */}
              <button
                type="button"
                onClick={() => onRetakeSpecificShot(slotIndex)}
                className="mt-2.5 flex h-9 w-full items-center justify-center gap-1.5 rounded-full border border-border-subtle bg-white dark:bg-slate-800 text-xs font-bold text-fg-display shadow-2xs hover:bg-surface-secondary hover:border-slate-300 active:scale-95 transition-all cursor-pointer"
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="size-3 text-text-muted">
                  <path d="M2.5 8a5.5 5.5 0 1 1 1.2 3.4M2.5 12V8h4" />
                </svg>
                <span>Retake Shot {slotIndex + 1}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirmation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border-subtle/80">
        <p className="text-xs text-text-muted">
          Happy with all 4 photos? Continue to add stickers, chord blocks, and signatures.
        </p>

        <button
          type="button"
          onClick={onConfirmPhotos}
          className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-primary px-7 font-display text-sm font-bold text-white shadow-[0_3px_0_#1454a4] hover:bg-[#1a82f0] active:translate-y-0.5 active:shadow-[0_1px_0_#1454a4] transition-all cursor-pointer"
        >
          <span>✓ Confirm &amp; Decorate Strip</span>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.5} className="size-3.5">
            <path d="M6 3l5 5-5 5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
