"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

interface StripMobileClientProps {
  stripId: string;
  imgUrl: string;
}

export function StripMobileClient({ stripId, imgUrl }: StripMobileClientProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveToPhotos = async () => {
    if (!imgUrl) return;
    setIsSaving(true);

    try {
      // 1. Fetch image blob
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const file = new File([blob], `chordisol-strip-${stripId}.jpg`, {
        type: "image/jpeg",
      });

      // 2. Try native mobile share sheet (iOS Safari & Android Chrome)
      if (
        typeof navigator !== "undefined" &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: "Chordisol Photobooth Strip",
          text: "My 4-cut acoustic memory from Chordisol Photobooth!",
        });
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        // 3. Fallback direct download
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `chordisol-strip-${stripId}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.warn("Save/share error or cancelled:", err);
      // Fallback: open image in new tab so user can long-press "Save Image"
      window.open(imgUrl, "_blank");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white flex flex-col items-center justify-between">
      {/* Brand Header */}
      <header className="flex items-center gap-2.5 mb-6">
        <Image
          src="/images/chordisol-logo.png"
          alt="Chordisol"
          width={32}
          height={32}
          className="size-8 rounded-[8px] object-cover shadow-sm"
          priority
        />
        <div>
          <h1 className="font-display text-base font-bold tracking-tight text-white leading-tight">
            Chordisol Photobooth
          </h1>
          <p className="font-sans text-[11px] font-medium text-white/70">
            Acoustic 4-Cut Studio Strip
          </p>
        </div>
      </header>

      {/* Main Decorated Strip Display */}
      <div className="relative w-full max-w-xs drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
        {imgUrl ? (
          <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-slate-900 shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgUrl}
              alt="Your decorated Chordisol photobooth strip"
              className="size-full object-contain"
            />
          </div>
        ) : (
          <div className="flex h-96 w-full flex-col items-center justify-center rounded-[20px] border border-white/10 bg-slate-900 p-6 text-center">
            <span className="text-3xl mb-2">📸</span>
            <p className="font-display text-sm font-bold text-white">
              No strip image found
            </p>
            <p className="mt-1 text-xs text-white/60">
              The strip link may be expired or missing image parameters.
            </p>
          </div>
        )}
      </div>

      {/* Mobile Action Controls */}
      <div className="w-full max-w-xs mt-6 space-y-3">
        {/* Save to Camera Roll */}
        <button
          type="button"
          disabled={!imgUrl || isSaving}
          onClick={handleSaveToPhotos}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-brand-primary px-6 font-display text-[15px] font-bold text-white shadow-[0_4px_0_#1454a4] transition-all hover:bg-[#1a82f0] active:translate-y-0.5 active:shadow-[0_1px_0_#1454a4] disabled:opacity-50 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} className="size-5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>
            {savedSuccess
              ? "✓ Saved to Photos!"
              : isSaving
              ? "Saving..."
              : "Save to Camera Roll / Photos"}
          </span>
        </button>

        {/* Tip for mobile guests */}
        <p className="text-center text-[11px] font-medium text-white/60">
          Tip: You can also tap and hold the strip to save directly to Photos.
        </p>

        {/* Go to Photobooth */}
        <div className="pt-2 text-center">
          <Link
            href="/booth"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline"
          >
            <span>Take another strip at Chordisol Booth →</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
