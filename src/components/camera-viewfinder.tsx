"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { playCountdownPip, playShutterSound } from "@/lib/audio-beeps";

interface CameraViewfinderProps {
  photos: (string | null)[];
  onPhotoCaptured: (slotIndex: number, dataUrl: string) => void;
  onSequenceComplete?: () => void;
  mode?: "sequence" | "retake";
  retakeSlot?: number | null;
  onRetakeDone?: () => void;
  onCancelRetake?: () => void;
  hideInlineSlots?: boolean;
  slotCount?: number;
}

export function CameraViewfinder({
  photos,
  onPhotoCaptured,
  onSequenceComplete,
  mode = "sequence",
  retakeSlot = null,
  onRetakeDone,
  onCancelRetake,
  slotCount = 3,
}: CameraViewfinderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isAutoSequenceRunning, setIsAutoSequenceRunning] = useState(false);
  const [activeSlotInternal, setActiveSlotInternal] = useState<number | null>(null);
  const [countdownDuration, setCountdownDuration] = useState<3 | 5>(3);

  // Compute strictly ordered target slot (0 -> 1 -> ... -> slotCount - 1)
  const firstEmptySlot = photos.slice(0, slotCount).findIndex((p) => p === null);
  const currentSequentialSlot = firstEmptySlot === -1 ? slotCount - 1 : firstEmptySlot;

  const targetSlot =
    mode === "retake" && retakeSlot !== null
      ? retakeSlot
      : activeSlotInternal !== null
      ? activeSlotInternal
      : currentSequentialSlot;

  // Setup Camera Devices
  useEffect(() => {
    let cancelled = false;

    async function setupCameras() {
      try {
        if (!navigator.mediaDevices?.enumerateDevices) {
          if (!cancelled) {
            setErrorMessage("Camera access is not supported in this browser.");
            setHasPermission(false);
          }
          return;
        }

        const initialStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1920 }, height: { ideal: 1440 } },
          audio: false,
        });

        initialStream.getTracks().forEach((t) => t.stop());
        if (cancelled) return;
        setHasPermission(true);

        const allDevices = await navigator.mediaDevices.enumerateDevices();
        if (cancelled) return;
        const videoInputs = allDevices.filter((d) => d.kind === "videoinput");
        setDevices(videoInputs);

        const chosenId = videoInputs[0]?.deviceId || "";
        setSelectedDeviceId(chosenId);
      } catch (err) {
        if (cancelled) return;
        console.warn("Camera permission error:", err);
        setHasPermission(false);
        setErrorMessage("Allow camera access to shoot live, or upload photos from your device.");
      }
    }

    void setupCameras();

    return () => {
      cancelled = true;
    };
  }, []);

  // Bind Stream to Video
  useEffect(() => {
    if (!hasPermission || !selectedDeviceId) return;

    let cancelled = false;

    async function startStream() {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: selectedDeviceId },
            width: { ideal: 1920 },
            height: { ideal: 1440 },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch (err) {
        console.warn("Retrying with flexible constraints...", err);
        try {
          const fallback = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          if (cancelled) {
            fallback.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = fallback;
          if (videoRef.current) {
            videoRef.current.srcObject = fallback;
            await videoRef.current.play().catch(() => {});
          }
        } catch (fallbackErr) {
          console.error("Camera failed entirely:", fallbackErr);
        }
      }
    }

    void startStream();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [hasPermission, selectedDeviceId]);

  // Grab High-Res Frame
  const grabCurrentFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;

    const canvas = document.createElement("canvas");
    const vw = video.videoWidth || 1920;
    const vh = video.videoHeight || 1440;
    canvas.width = vw;
    canvas.height = vh;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Mirror horizontally to match mirrored viewfinder
    ctx.translate(vw, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, vw, vh);

    return canvas.toDataURL("image/jpeg", 0.95);
  }, []);

  // Single Slot Capture with Countdown
  const captureSlot = useCallback(
    (slotIndex: number): Promise<void> => {
      return new Promise((resolve) => {
        setIsCountingDown(true);
        setActiveSlotInternal(slotIndex);

        let count = countdownDuration;
        setCountdownNumber(count);
        playCountdownPip(count);

        const timer = setInterval(() => {
          count--;
          if (count > 0) {
            setCountdownNumber(count);
            playCountdownPip(count);
          } else {
            clearInterval(timer);
            setCountdownNumber(null);
            setIsCountingDown(false);

            // Flash & Shutter
            setIsFlashing(true);
            playShutterSound();

            const photoData = grabCurrentFrame();
            if (photoData) {
              onPhotoCaptured(slotIndex, photoData);
            }

            setTimeout(() => {
              setIsFlashing(false);
              resolve();
            }, 260);
          }
        }, 1000);
      });
    },
    [countdownDuration, grabCurrentFrame, onPhotoCaptured]
  );

  // Strictly Sequential Auto Sequence
  const startFullSequence = useCallback(async () => {
    if (isAutoSequenceRunning || isCountingDown) return;
    setIsAutoSequenceRunning(true);

    for (let slot = 0; slot < slotCount; slot++) {
      await captureSlot(slot);
      if (slot < slotCount - 1) {
        await new Promise((r) => setTimeout(r, 1400));
      }
    }

    setIsAutoSequenceRunning(false);
    setActiveSlotInternal(null);
    if (onSequenceComplete) {
      onSequenceComplete();
    }
  }, [captureSlot, isAutoSequenceRunning, isCountingDown, onSequenceComplete, slotCount]);

  // Snap Next Single Shot in Sequence
  const handleSnapNextSequential = async () => {
    if (isCountingDown || isAutoSequenceRunning) return;
    const slotToTake = currentSequentialSlot;
    await captureSlot(slotToTake);
    setActiveSlotInternal(null);

    if (slotToTake === slotCount - 1 && onSequenceComplete) {
      setTimeout(() => {
        onSequenceComplete();
      }, 350);
    }
  };

  // Execute Retake for targeted slot
  const handleExecuteRetake = async () => {
    if (retakeSlot === null || isCountingDown) return;
    await captureSlot(retakeSlot);
    setActiveSlotInternal(null);
    if (onRetakeDone) {
      setTimeout(() => {
        onRetakeDone();
      }, 350);
    }
  };

  // Fallback Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const list = Array.from(files).slice(0, slotCount);
    list.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onPhotoCaptured(idx, reader.result);
        }
      };
      reader.readAsDataURL(file);
    });

    if (list.length >= slotCount && onSequenceComplete) {
      setTimeout(() => onSequenceComplete(), 300);
    }
    e.target.value = "";
  };

  const completedCount = photos.slice(0, slotCount).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-3.5">
      {/* Minimal Camera Utility Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="font-display text-sm font-semibold text-fg-display">
            {mode === "retake"
              ? `Retaking shot ${(retakeSlot ?? 0) + 1}`
              : isCountingDown || isAutoSequenceRunning
              ? `Capturing shot ${targetSlot + 1} of ${slotCount}`
              : completedCount >= slotCount
              ? `All ${slotCount} shots captured`
              : `Ready for shot ${Math.min(slotCount, completedCount + 1)} of ${slotCount}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Timer Toggle */}
          <div
            role="group"
            aria-label="Countdown timer"
            className="inline-flex items-center rounded-[10px] bg-surface-secondary p-0.5 text-xs font-semibold"
          >
            <button
              type="button"
              onClick={() => setCountdownDuration(3)}
              className={`rounded-[8px] px-2.5 py-1 transition-colors cursor-pointer ${
                countdownDuration === 3
                  ? "bg-white text-fg-display shadow-2xs"
                  : "text-text-muted hover:text-fg-display"
              }`}
            >
              3s
            </button>
            <button
              type="button"
              onClick={() => setCountdownDuration(5)}
              className={`rounded-[8px] px-2.5 py-1 transition-colors cursor-pointer ${
                countdownDuration === 5
                  ? "bg-white text-fg-display shadow-2xs"
                  : "text-text-muted hover:text-fg-display"
              }`}
            >
              5s
            </button>
          </div>

          {/* Camera Picker */}
          {devices.length > 1 && (
            <select
              aria-label="Select camera"
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="h-8 max-w-[155px] truncate rounded-[10px] border border-border-subtle bg-white px-2.5 text-xs font-medium text-fg-display outline-none focus:border-brand-primary"
            >
              {devices.map((d, i) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Camera ${i + 1}`}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Video Viewfinder */}
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-[#0e1724] shadow-[0_14px_34px_-12px_rgba(20,54,95,0.22)]">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{ transform: "scaleX(-1)" }}
          className="size-full object-cover"
        />

        {/* Subtle Corner Crop Guides */}
        <div className="pointer-events-none absolute inset-4">
          <div className="absolute top-0 left-0 size-4 border-t-2 border-l-2 border-white/45 rounded-tl-[2px]" />
          <div className="absolute top-0 right-0 size-4 border-t-2 border-r-2 border-white/45 rounded-tr-[2px]" />
          <div className="absolute bottom-0 left-0 size-4 border-b-2 border-l-2 border-white/45 rounded-bl-[2px]" />
          <div className="absolute bottom-0 right-0 size-4 border-b-2 border-r-2 border-white/45 rounded-br-[2px]" />
        </div>

        {/* Shutter Flash */}
        {isFlashing && (
          <div className="pointer-events-none absolute inset-0 z-50 bg-white transition-opacity duration-200" />
        )}

        {/* Crisp Centered Countdown */}
        {isCountingDown && countdownNumber !== null && (
          <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-black/25">
            <span className="font-display text-7xl sm:text-8xl font-bold text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.45)] tabular-nums">
              {countdownNumber}
            </span>
          </div>
        )}

        {/* Permission Denied Fallback */}
        {hasPermission === false && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center text-white bg-[#0e1724]">
            <p className="font-display text-base font-semibold text-white">Camera access needed</p>
            <p className="mt-1.5 text-xs text-white/70 max-w-xs leading-relaxed">{errorMessage}</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-[10px] bg-white px-4 text-xs font-semibold text-fg-display transition-colors hover:bg-surface-secondary cursor-pointer"
            >
              Upload photos instead
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Clean Camera Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {mode === "retake" ? (
          <div className="flex w-full items-center justify-between gap-3">
            {onCancelRetake && (
              <button
                type="button"
                onClick={onCancelRetake}
                className="inline-flex h-11 items-center rounded-xl bg-surface-secondary px-4 text-xs font-semibold text-fg-display transition-colors hover:bg-divider/70 cursor-pointer"
              >
                Cancel retake
              </button>
            )}

            <button
              type="button"
              disabled={isCountingDown || !hasPermission}
              onClick={handleExecuteRetake}
              className="ml-auto inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-primary px-6 font-display text-sm font-semibold text-white shadow-[0_4px_0_var(--primary-depth)] transition-all hover:bg-[#1a84ee] active:translate-y-0.5 active:shadow-[0_1px_0_var(--primary-depth)] disabled:opacity-45 cursor-pointer"
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
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span>Retake shot {(retakeSlot ?? 0) + 1}</span>
            </button>
          </div>
        ) : (
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-surface-secondary px-3.5 text-xs font-semibold text-fg-display transition-colors hover:bg-divider/70 cursor-pointer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5 text-text-muted"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Upload</span>
            </button>

            <div className="flex items-center gap-2.5 ml-auto">
              {slotCount > 1 && (
                <button
                  type="button"
                  disabled={
                    isCountingDown ||
                    isAutoSequenceRunning ||
                    !hasPermission ||
                    completedCount >= slotCount
                  }
                  onClick={handleSnapNextSequential}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-border-subtle bg-white px-4 font-display text-xs font-semibold text-fg-display transition-colors hover:bg-surface-secondary active:scale-[0.98] disabled:opacity-40 cursor-pointer"
                >
                  Take shot {currentSequentialSlot + 1}
                </button>
              )}

              <button
                type="button"
                disabled={isCountingDown || isAutoSequenceRunning || !hasPermission}
                onClick={startFullSequence}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-primary px-6 font-display text-sm font-semibold text-white shadow-[0_4px_0_var(--primary-depth)] transition-all hover:bg-[#1a84ee] active:translate-y-0.5 active:shadow-[0_1px_0_var(--primary-depth)] disabled:opacity-45 cursor-pointer"
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
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>
                  {isAutoSequenceRunning
                    ? "Capturing..."
                    : slotCount === 1
                    ? completedCount >= 1
                      ? "Retake photo"
                      : "Take photo"
                    : completedCount >= slotCount
                    ? `Retake all ${slotCount}`
                    : `Start ${slotCount}-shot timer`}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
