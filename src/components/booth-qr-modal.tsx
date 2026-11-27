"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

interface BoothQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicUrl: string;
  stripId: string;
}

export function BoothQrModal({
  isOpen,
  onClose,
  publicUrl,
  stripId,
}: BoothQrModalProps) {
  const [qrState, setQrState] = useState<{ forUrl: string; dataUrl: string }>({
    forUrl: "",
    dataUrl: "",
  });
  const [copied, setCopied] = useState(false);

  const mobilePageUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/strip/${stripId}?img=${encodeURIComponent(publicUrl)}`
      : "";

  const qrCodeDataUrl = qrState.forUrl === mobilePageUrl ? qrState.dataUrl : "";

  useEffect(() => {
    if (!isOpen || !mobilePageUrl) return;
    let cancelled = false;

    QRCode.toDataURL(mobilePageUrl, {
      width: 320,
      margin: 1,
      color: {
        dark: "#14365f",
        light: "#ffffff",
      },
    })
      .then((url) => {
        if (!cancelled) {
          setQrState({ forUrl: mobilePageUrl, dataUrl: url });
        }
      })
      .catch((err) => console.error("Error generating QR code:", err));

    return () => {
      cancelled = true;
    };
  }, [isOpen, mobilePageUrl]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (!mobilePageUrl) return;
    navigator.clipboard.writeText(mobilePageUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-fg-display/45"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[360px] rounded-2xl bg-white p-6 shadow-[0_24px_60px_-16px_rgba(20,54,95,0.3)]"
      >
        {/* Clean Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3
              id="qr-modal-title"
              className="font-display text-lg font-bold tracking-tight text-fg-display"
            >
              Save to phone
            </h3>
            <p className="mt-1 text-xs text-text-muted leading-relaxed">
              Scan with your phone camera to open and save your strip.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-fg-display transition-colors hover:bg-divider/80 cursor-pointer"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="size-3.5"
              aria-hidden="true"
            >
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* QR Code Stage */}
        <div className="my-5 flex items-center justify-center rounded-2xl bg-surface-secondary p-5">
          <div className="flex size-52 items-center justify-center rounded-xl bg-white p-3 shadow-[0_8px_24px_-8px_rgba(20,54,95,0.14)]">
            {qrCodeDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrCodeDataUrl}
                alt="Scan to open photobooth strip on mobile"
                className="size-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-text-muted">
                <span className="size-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium">Generating QR...</span>
              </div>
            )}
          </div>
        </div>

        {/* Clean Action Row */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-surface-secondary px-4 font-display text-xs font-semibold text-fg-display transition-colors hover:bg-divider/80 cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3.5"
              aria-hidden="true"
            >
              {copied ? (
                <polyline points="20 6 9 17 4 12" />
              ) : (
                <>
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </>
              )}
            </svg>
            <span>{copied ? "Copied" : "Copy link"}</span>
          </button>

          <a
            href={mobilePageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-primary px-4 font-display text-xs font-semibold text-white shadow-[0_3px_0_var(--primary-depth)] transition-all hover:bg-[#1a84ee] active:translate-y-0.5 active:shadow-[0_1px_0_var(--primary-depth)]"
          >
            <span>Open link</span>
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3.5"
              aria-hidden="true"
            >
              <path d="M6 3h7v7M13 3L6.5 9.5" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
