"use client";

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
      const response = await fetch(imgUrl);
      if (!response.ok) {
        throw new Error(`Image fetch failed with status ${response.status}`);
      }
      const blob = await response.blob();
      const mimeType = blob.type.startsWith("image/") ? blob.type : "image/jpeg";
      const ext = mimeType === "image/png" ? "png" : "jpg";
      const file = new File([blob], `chordisol-story-${stripId}.${ext}`, {
        type: mimeType,
      });

      if (
        typeof navigator !== "undefined" &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: "Chordisol Photobooth",
        });
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `chordisol-story-${stripId}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.warn("Save/share error or cancelled:", err);
      window.open(imgUrl, "_blank");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-bg px-4 py-8 sm:py-10 text-fg-regular flex flex-col items-center justify-center">
      <div className="w-full max-w-[380px] flex flex-col items-center">
        {/* Clean Studio Mat displaying the exact 9:16 borderless print */}
        <div className="w-full rounded-3xl bg-surface-secondary py-8 px-6 flex justify-center">
          {imgUrl ? (
            <div className="w-[260px] sm:w-[276px] aspect-[9/16] bg-white shadow-[0_20px_48px_-14px_rgba(20,54,95,0.2),0_2px_8px_rgba(20,54,95,0.06)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgUrl}
                alt="Your Chordisol photobooth strip"
                className="size-full object-cover block"
              />
            </div>
          ) : (
            <div className="flex aspect-[9/16] w-[260px] flex-col items-center justify-center bg-white p-6 text-center shadow-sm">
              <p className="font-display text-sm font-semibold text-fg-display">
                Strip not found
              </p>
              <p className="mt-1.5 text-xs text-text-muted leading-relaxed">
                This share link may have expired or is missing its image.
              </p>
            </div>
          )}
        </div>

        {/* Save Action & Quiet Helper */}
        <div className="mt-6 w-full flex flex-col items-center gap-3">
          <button
            type="button"
            disabled={!imgUrl || isSaving}
            onClick={handleSaveToPhotos}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-primary px-6 font-display text-sm font-semibold text-white shadow-[0_4px_0_var(--primary-depth)] transition-all hover:bg-[#1a84ee] active:translate-y-0.5 active:shadow-[0_1px_0_var(--primary-depth)] disabled:opacity-45 cursor-pointer"
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
              {savedSuccess ? (
                <polyline points="20 6 9 17 4 12" />
              ) : (
                <>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </>
              )}
            </svg>
            <span>
              {savedSuccess
                ? "Saved to Photos"
                : isSaving
                ? "Saving..."
                : "Save to Photos"}
            </span>
          </button>

          <p className="text-center text-xs text-text-muted">
            Or press and hold the strip above to save
          </p>

          <Link
            href="/booth"
            className="mt-2 text-xs font-semibold text-fg-display hover:text-brand-primary transition-colors"
          >
            Open Chordisol Booth
          </Link>
        </div>
      </div>
    </main>
  );
}
