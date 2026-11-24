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
}

const POSE_HINTS = [
  "Pose 1 • The Acoustic Smile 🎸",
  "Pose 2 • Fingers on the Keys 🎹",
  "Pose 3 • The Listening Ear 🎧",
  "Pose 4 • Celebrate the Groove ✨",
];

export function CameraViewfinder({
  photos,
  onPhotoCaptured,
  onSequenceComplete,
  mode = "sequence",
  retakeSlot = null,
  onRetakeDone,
  onCancelRetake,
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

  // Compute strictly ordered target slot (1 -> 2 -> 3 -> 4)
  const firstEmptySlot = photos.findIndex((p) => p === null);
  const currentSequentialSlot = firstEmptySlot === -1 ? 3 : firstEmptySlot;

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
        setErrorMessage("Please allow camera access in your browser to take live photobooth shots.");
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
          video: { deviceId: { exact: selectedDeviceId }, width: { ideal: 1920 }, height: { ideal: 1440 } },
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

    startStream();

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
            }, 300);
          }
        }, 1000);
      });
    },
    [countdownDuration, grabCurrentFrame, onPhotoCaptured]
  );

  // Strictly Sequential 4-Shot Auto Sequence
  const startFullSequence = useCallback(async () => {
    if (isAutoSequenceRunning || isCountingDown) return;
    setIsAutoSequenceRunning(true);

    for (let slot = 0; slot < 4; slot++) {
      await captureSlot(slot);
      if (slot < 3) {
        await new Promise((r) => setTimeout(r, 1600));
      }
    }

    setIsAutoSequenceRunning(false);
    setActiveSlotInternal(null);
    if (onSequenceComplete) {
      onSequenceComplete();
    }
  }, [captureSlot, isAutoSequenceRunning, isCountingDown, onSequenceComplete]);

  // Snap Next Single Shot in Sequence
  const handleSnapNextSequential = async () => {
    if (isCountingDown || isAutoSequenceRunning) return;
    const slotToTake = currentSequentialSlot;
    await captureSlot(slotToTake);
    setActiveSlotInternal(null);

    if (slotToTake === 3 && onSequenceComplete) {
      setTimeout(() => {
        onSequenceComplete();
      }, 400);
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
      }, 400);
    }
  };

  // Fallback Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const list = Array.from(files).slice(0, 4);
    list.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onPhotoCaptured(idx, reader.result);
        }
      };
      reader.readAsDataURL(file);
    });

    if (list.length === 4 && onSequenceComplete) {
      setTimeout(() => onSequenceComplete(), 300);
    }
  };

  const completedCount = photos.filter(Boolean).length;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-slate-900/10 bg-white p-4 sm:p-5 shadow-[0_4px_0_rgba(15,23,42,0.06)]">
      {/* Top Bar: Camera & Timer Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span
              className={`absolute inline-flex size-full animate-ping rounded-full opacity-75 ${
                hasPermission ? "bg-emerald-400" : "bg-rose-400"
              }`}
            />
            <span
              className={`relative inline-flex size-2.5 rounded-full ${
                hasPermission ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
          </span>
          <span className="font-display text-sm font-bold text-slate-900">
            {mode === "retake" ? "Studio Retake Viewfinder" : "Live Studio Viewfinder"}
          </span>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-brand-primary border border-blue-200">
            {mode === "retake"
              ? `Retaking Shot ${(retakeSlot ?? 0) + 1}`
              : `Shot ${Math.min(4, completedCount + 1)} of 4`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Timer Toggle */}
          <div className="flex items-center rounded-lg bg-slate-100 p-0.5 text-xs font-bold text-slate-700">
            <button
              type="button"
              onClick={() => setCountdownDuration(3)}
              className={`rounded-md px-2 py-0.5 transition-colors cursor-pointer ${
                countdownDuration === 3 ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
              }`}
            >
              3s
            </button>
            <button
              type="button"
              onClick={() => setCountdownDuration(5)}
              className={`rounded-md px-2 py-0.5 transition-colors cursor-pointer ${
                countdownDuration === 5 ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
              }`}
            >
              5s
            </button>
          </div>

          {/* Camera Picker */}
          {devices.length > 1 && (
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="h-7 max-w-[150px] truncate rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-800 outline-none"
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
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-slate-950 shadow-inner">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{ transform: "scaleX(-1)" }}
          className="size-full object-cover"
        />

        {/* Framing Guides */}
        <div className="pointer-events-none absolute inset-3 border border-white/20 rounded-lg">
          <div className="absolute -top-[1px] -left-[1px] size-3 border-t-2 border-l-2 border-white rounded-tl-[3px]" />
          <div className="absolute -top-[1px] -right-[1px] size-3 border-t-2 border-r-2 border-white rounded-tr-[3px]" />
          <div className="absolute -bottom-[1px] -left-[1px] size-3 border-b-2 border-l-2 border-white rounded-bl-[3px]" />
          <div className="absolute -bottom-[1px] -right-[1px] size-3 border-b-2 border-r-2 border-white rounded-br-[3px]" />
        </div>

        {/* Shutter Flash */}
        {isFlashing && (
          <div className="pointer-events-none absolute inset-0 z-50 bg-white transition-opacity duration-300" />
        )}

        {/* Animated Countdown */}
        {isCountingDown && countdownNumber !== null && (
          <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
            <div className="flex size-24 items-center justify-center rounded-full bg-white text-slate-950 shadow-2xl animate-in zoom-in-75 duration-150">
              <span className="font-display text-5xl font-black text-brand-primary">
                {countdownNumber}
              </span>
            </div>
          </div>
        )}

        {/* Active Pose Overlay Banner */}
        <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between rounded-lg bg-slate-900/85 px-3 py-1.5 text-xs text-white backdrop-blur-md">
          <span className="font-bold">{POSE_HINTS[targetSlot]}</span>
          <span className="font-mono text-[10px] text-white/70">Shot {targetSlot + 1} of 4</span>
        </div>

        {/* Permission Denied Fallback */}
        {hasPermission === false && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center text-white bg-slate-950/95">
            <h4 className="font-display text-sm font-bold text-white mb-1">Camera Access Required</h4>
            <p className="text-xs text-white/70 max-w-xs mb-3">{errorMessage}</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 px-4 rounded-full bg-white/20 text-white text-xs font-bold hover:bg-white/30 cursor-pointer"
            >
              Upload Photos Instead
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Strictly Ordered Progress Slots (DIVS, NOT CLICKABLE - User cannot pick slots) */}
      <div className="flex flex-col gap-1.5 pt-1">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold text-slate-700">Strict 4-Cut Sequence:</span>
          <span>
            {mode === "retake"
              ? `Retaking Shot ${(retakeSlot ?? 0) + 1}`
              : `Captured ${completedCount} of 4 (Ordered 1 → 2 → 3 → 4)`}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((slot) => {
            const photo = photos[slot];
            const isTarget = targetSlot === slot;

            return (
              <div
                key={slot}
                className={`relative aspect-4/3 overflow-hidden rounded-xl border-2 transition-all ${
                  isTarget
                    ? "border-brand-primary ring-2 ring-brand-primary/30 bg-brand-primary/5"
                    : photo
                    ? "border-emerald-500/80 bg-emerald-50/50 shadow-2xs"
                    : "border-dashed border-slate-200 bg-slate-50"
                }`}
              >
                {photo ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo}
                      alt={`Captured shot ${slot + 1}`}
                      className="size-full object-cover"
                    />
                    <span className="absolute top-1 left-1 flex size-3.5 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white shadow-xs">
                      ✓
                    </span>
                    <span className="absolute bottom-1 right-1 rounded-full bg-slate-900/80 px-1.5 py-0.2 text-[9px] font-bold text-white">
                      #{slot + 1}
                    </span>
                  </>
                ) : (
                  <div className="flex size-full flex-col items-center justify-center text-slate-400">
                    <span className="font-display text-xs font-bold text-slate-700">
                      {slot + 1}
                    </span>
                    <span className="text-[9px] font-semibold opacity-70">
                      {isTarget ? "Current" : "Pending"}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        {mode === "retake" ? (
          /* RETAKE MODE */
          <div className="flex w-full items-center justify-between gap-3">
            {onCancelRetake && (
              <button
                type="button"
                onClick={onCancelRetake}
                className="flex h-11 items-center gap-1.5 rounded-full border-2 border-slate-900/10 bg-slate-100 px-5 font-sans text-xs font-bold text-slate-700 hover:bg-slate-200 transition-all active:scale-95 cursor-pointer"
              >
                <span>← Cancel Retake</span>
              </button>
            )}

            <button
              type="button"
              disabled={isCountingDown || !hasPermission}
              onClick={handleExecuteRetake}
              className="ml-auto inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-primary px-6 font-display text-sm font-bold text-white shadow-[0_4px_0_#0f5298] transition-all hover:bg-[#1a82f0] active:translate-y-0.5 active:shadow-[0_1px_0_#0f5298] disabled:opacity-50 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} className="size-4.5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span>Snap Shot {(retakeSlot ?? 0) + 1} Retake ({countdownDuration}s)</span>
            </button>
          </div>
        ) : (
          /* SEQUENTIAL MODE */
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            {/* Fallback upload */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 text-xs font-bold text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5 text-slate-500">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Upload Photos</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Sequence & Single Triggers */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Single shot trigger */}
              <button
                type="button"
                disabled={isCountingDown || isAutoSequenceRunning || !hasPermission || completedCount >= 4}
                onClick={handleSnapNextSequential}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border-2 border-slate-900/10 bg-slate-100 px-4 font-display text-xs font-bold text-slate-800 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
              >
                <span>Take Shot {currentSequentialSlot + 1}</span>
              </button>

              {/* Full 4-shot sequence trigger */}
              <button
                type="button"
                disabled={isCountingDown || isAutoSequenceRunning || !hasPermission}
                onClick={startFullSequence}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-primary px-5 font-display text-sm font-bold text-white shadow-[0_4px_0_#0f5298] transition-all hover:bg-[#1a82f0] active:translate-y-0.5 active:shadow-[0_1px_0_#0f5298] disabled:opacity-50 cursor-pointer"
              >
                <span className="size-2 rounded-full bg-rose-400 animate-pulse" />
                <span>
                  {isAutoSequenceRunning
                    ? "Capturing Sequence..."
                    : completedCount === 4
                    ? "↺ Retake All 4 Shots"
                    : "⚡ Start 4-Shot Sequence"}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
