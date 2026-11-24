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
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const mobilePageUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/strip/${stripId}?img=${encodeURIComponent(publicUrl)}`
      : "";

  useEffect(() => {
    if (!isOpen || !mobilePageUrl) return;

    QRCode.toDataURL(mobilePageUrl, {
      width: 280,
      margin: 1.5,
      color: {
        dark: "#14365f",
        light: "#ffffff",
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error("Error generating QR code:", err));
  }, [isOpen, mobilePageUrl]);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm overflow-hidden rounded-[24px] border border-border-subtle bg-surface-elevated p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-surface-secondary text-fg-display hover:bg-divider transition-transform active:scale-95 cursor-pointer"
        >
          ✕
        </button>

        {/* Title & Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-3 py-1 font-sans text-xs font-bold text-brand-primary mb-3">
          <span>📱 Mobile Instant Share</span>
        </div>

        <h3
          id="qr-modal-title"
          className="font-display text-xl font-bold tracking-tight text-fg-display"
        >
          Scan to Save on Phone
        </h3>
        <p className="mt-1 text-xs text-text-muted leading-relaxed">
          Open your phone camera to view your 4-cut strip and save directly to your Camera Roll.
        </p>

        {/* QR Code Graphic Frame */}
        <div className="mx-auto my-5 flex size-56 items-center justify-center rounded-[18px] border-2 border-border-subtle bg-white p-3 shadow-md">
          {qrCodeDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrCodeDataUrl}
              alt="Scan to open photobooth strip on mobile"
              className="size-full object-contain rounded-[10px]"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-text-muted">
              <span className="size-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold">Generating QR...</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-surface-secondary px-4 text-xs font-bold text-fg-display transition-colors hover:bg-divider active:scale-98 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span>{copied ? "Link Copied!" : "Copy Mobile Strip Link"}</span>
          </button>

          <a
            href={mobilePageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-primary px-4 text-xs font-bold text-white shadow-[0_2px_0_#1454a4] transition-all hover:bg-[#1881ef] active:translate-y-0.5"
          >
            <span>Open Mobile View Preview</span>
          </a>
        </div>
      </div>
    </div>
  );
}
