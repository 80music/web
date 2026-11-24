"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { playCountdownPip, playShutterSound } from "@/lib/audio-beeps";

interface CameraViewfinderProps {
  onPhotoCaptured: (slotIndex: number, dataUrl: string) => void;
  onSequenceComplete?: () => void;
  photos: (string | null)[];
  activeSlot: number | null; // which slot is currently being targeted
  setActiveSlot: (slot: number | null) => void;
}

export function CameraViewfinder({
  onPhotoCaptured,
  onSequenceComplete,
  photos,
  activeSlot,
  setActiveSlot,
}: CameraViewfinderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Countdown & capture sequence state
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState<number | null>(null);
  const [isShutterFlashing, setIsShutterFlashing] = useState(false);
  const [isAutoSequenceRunning, setIsAutoSequenceRunning] = useState(false);

  // Fallback file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Retry trigger for re-requesting camera permission
  const [retryTrigger, setRetryTrigger] = useState(0);

  // 1. Enumerate and select preferred camera
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

        // Request stream once to trigger browser permission prompt
        const initialStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1920 }, height: { ideal: 1440 }, frameRate: { ideal: 30 } },
          audio: false,
        });

        // Stop initial stream so we can bind to preferred device cleanly
        initialStream.getTracks().forEach((t) => t.stop());
        if (cancelled) return;
        setHasPermission(true);

        const allDevices = await navigator.mediaDevices.enumerateDevices();
        if (cancelled) return;
        const videoInputs = allDevices.filter((d) => d.kind === "videoinput");
        setDevices(videoInputs);

        // Check localStorage for saved camera
        const savedCamera = localStorage.getItem("chordisol_booth_camera");
        let preferred = videoInputs.find((d) => d.deviceId === savedCamera);

        if (!preferred) {
          // Auto-select Studio Display, HD Pro Webcam, or external webcam
          preferred = videoInputs.find((d) => {
            const label = d.label.toLowerCase();
            return (
              label.includes("studio display") ||
              label.includes("hd pro") ||
              label.includes("external") ||
              label.includes("logitech") ||
              label.includes("webcam")
            );
          });
        }

        const chosenId = preferred?.deviceId || videoInputs[0]?.deviceId || "";
        setSelectedDeviceId(chosenId);
      } catch (err: unknown) {
        if (cancelled) return;
        console.warn("Camera enumeration / permission error:", err);
        setHasPermission(false);
        setErrorMessage(
          "Camera permission was denied or camera is unavailable. Please allow camera access in your browser settings."
        );
      }
    }

    void setupCameras();

    return () => {
      cancelled = true;
    };
  }, [retryTrigger]);

  // 2. Start Video Stream whenever selectedDeviceId changes
  useEffect(() => {
    if (!hasPermission || !selectedDeviceId) return;

    let isCancelled = false;

    async function startStream() {
      // Stop old stream tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      try {
        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: { exact: selectedDeviceId },
            width: { ideal: 1920 },
            height: { ideal: 1440 },
            frameRate: { ideal: 30 },
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch (streamErr) {
        console.warn("Failed with exact deviceId, retrying with ideal constraints:", streamErr);
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
            audio: false,
          });
          if (isCancelled) {
            fallbackStream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = fallbackStream;
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            await videoRef.current.play().catch(() => {});
          }
        } catch (fallbackErr) {
          console.error("Camera stream failed entirely:", fallbackErr);
        }
      }
    }

    startStream();

    return () => {
      isCancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [hasPermission, selectedDeviceId]);

  // Save camera choice in localStorage
  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    try {
      localStorage.setItem("chordisol_booth_camera", deviceId);
    } catch {
      // Ignore
    }
  };

  // Grab high-resolution frame from live video
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

    // Mirror horizontally to match mirrored live preview
    ctx.translate(vw, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, vw, vh);

    return canvas.toDataURL("image/jpeg", 0.95);
  }, []);

  // Single shot with 3s countdown
  const captureSingleShot = useCallback(
    (slotIndex: number): Promise<void> => {
      return new Promise((resolve) => {
        setIsCountingDown(true);
        setActiveSlot(slotIndex);

        let count = 3;
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

            // Shutter Flash & Sound
            setIsShutterFlashing(true);
            playShutterSound();

            const photoData = grabCurrentFrame();
            if (photoData) {
              onPhotoCaptured(slotIndex, photoData);
            }

            setTimeout(() => {
              setIsShutterFlashing(false);
              resolve();
            }, 300);
          }
        }, 1000);
      });
    },
    [grabCurrentFrame, onPhotoCaptured, setActiveSlot]
  );

  // Full 4-shot sequence
  const startFullSequence = useCallback(async () => {
    if (isAutoSequenceRunning || isCountingDown) return;
    setIsAutoSequenceRunning(true);

    for (let slot = 0; slot < 4; slot++) {
      await captureSingleShot(slot);
      // Brief pause between shots for pose change
      if (slot < 3) {
        await new Promise((r) => setTimeout(r, 1200));
      }
    }

    setIsAutoSequenceRunning(false);
    setActiveSlot(null);
    if (onSequenceComplete) {
      onSequenceComplete();
    }
  }, [captureSingleShot, isAutoSequenceRunning, isCountingDown, onSequenceComplete, setActiveSlot]);

  // Retake individual slot
  const handleRetakeSingle = useCallback(
    async (slotIndex: number) => {
      if (isAutoSequenceRunning || isCountingDown) return;
      await captureSingleShot(slotIndex);
      setActiveSlot(null);
    },
    [captureSingleShot, isAutoSequenceRunning, isCountingDown, setActiveSlot]
  );

  // Fallback file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files).slice(0, 4);
    fileList.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onPhotoCaptured(idx, reader.result);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const completedCount = photos.filter(Boolean).length;

  return (
    <div className="relative flex flex-col gap-3 rounded-[20px] border border-border-subtle bg-surface-elevated p-4 sm:p-5 shadow-[0_4px_16px_rgba(20,54,95,0.06)]">
      {/* Top Bar: Camera Selector & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex size-3">
            <span
              className={`absolute inline-flex size-full animate-ping rounded-full opacity-75 ${
                hasPermission ? "bg-emerald-400" : "bg-rose-400"
              }`}
            />
            <span
              className={`relative inline-flex size-3 rounded-full ${
                hasPermission ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
          </span>
          <span className="font-display text-sm font-bold text-fg-display">
            Live Studio Cam
          </span>
          <span className="rounded-full bg-surface-secondary px-2 py-0.5 font-mono text-[11px] font-bold text-fg-display/80">
            {completedCount}/4 Captured
          </span>
        </div>

        {/* Camera device picker dropdown */}
        {devices.length > 1 && (
          <div className="flex items-center gap-1.5">
            <label htmlFor="camera-select" className="sr-only">
              Choose Camera
            </label>
            <select
              id="camera-select"
              value={selectedDeviceId}
              onChange={(e) => handleDeviceChange(e.target.value)}
              className="h-8 max-w-[170px] sm:max-w-[210px] truncate rounded-[10px] border border-border-subtle bg-surface-secondary px-2.5 text-xs font-semibold text-fg-display outline-none transition-colors hover:border-slate-400 focus:border-brand-primary"
            >
              {devices.map((device, idx) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Viewfinder Box */}
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-[16px] bg-slate-950 shadow-inner">
        {/* Video feed */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{ transform: "scaleX(-1)" }}
          className="size-full object-cover"
        />

        {/* Camera Permission / Error Fallback */}
        {hasPermission === false && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center text-white bg-slate-950/90 backdrop-blur-sm">
            <div className="size-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-6">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </div>
            <h3 className="font-display text-base font-bold text-white mb-1">Camera Access Needed</h3>
            <p className="text-xs text-white/70 max-w-xs mb-4">{errorMessage}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRetryTrigger((c) => c + 1)}
                className="h-9 px-4 rounded-full bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary/90 transition-transform active:scale-95"
              >
                Retry Camera
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-9 px-4 rounded-full bg-white/20 text-white text-xs font-bold hover:bg-white/30 transition-transform active:scale-95"
              >
                Upload Photos
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
          </div>
        )}

        {/* Shutter flash animation (solid white burst) */}
        {isShutterFlashing && (
          <div className="pointer-events-none absolute inset-0 z-50 bg-white transition-opacity duration-300 animate-in fade-in fill-mode-forwards" />
        )}

        {/* Countdown overlay */}
        {isCountingDown && countdownNumber !== null && (
          <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-black/25 backdrop-blur-[2px]">
            <div className="flex size-24 sm:size-28 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-2xl animate-in zoom-in-75 duration-200">
              <span className="font-display text-5xl sm:text-6xl font-black text-brand-primary">
                {countdownNumber}
              </span>
            </div>
          </div>
        )}

        {/* Active slot indicator badge */}
        {activeSlot !== null && (
          <div className="absolute top-3 left-3 z-20 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
            Shot {activeSlot + 1} of 4
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Slot selector / retake bar */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-text-muted mr-1 hidden sm:inline">
            Slots:
          </span>
          {[0, 1, 2, 3].map((slot) => {
            const isFilled = Boolean(photos[slot]);
            const isSelected = activeSlot === slot;
            return (
              <button
                key={slot}
                type="button"
                disabled={isCountingDown || isAutoSequenceRunning}
                onClick={() => handleRetakeSingle(slot)}
                title={`Retake shot ${slot + 1}`}
                className={`flex size-8 cursor-pointer items-center justify-center rounded-[8px] font-mono text-xs font-bold transition-all duration-150 active:scale-95 ${
                  isSelected
                    ? "bg-brand-primary text-white shadow-sm ring-2 ring-brand-primary ring-offset-2"
                    : isFilled
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                    : "bg-surface-secondary text-fg-display/70 border border-border-subtle hover:bg-divider"
                }`}
              >
                {isFilled ? "✓" : slot + 1}
              </button>
            );
          })}
        </div>

        {/* Primary Capture Action Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isCountingDown || isAutoSequenceRunning || !hasPermission}
            onClick={startFullSequence}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-brand-primary px-5 font-display text-sm font-bold text-white shadow-[0_3px_0_#1454a4] transition-all duration-150 hover:bg-[#1a82f0] active:translate-y-0.5 active:shadow-[0_1px_0_#1454a4] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} className="size-4.5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span>
              {isAutoSequenceRunning
                ? "Capturing 4 Shots..."
                : completedCount === 4
                ? "Retake All 4 Shots"
                : "Start 4-Shot Sequence"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
