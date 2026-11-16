"use client";

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type Ref,
} from "react";
import {
  PIANO_KEYBOARD_SHORTCUTS,
  sortNotesAscending,
} from "@/lib/chord-detector";

interface PianoKeyData {
  midi: number;
  note: string;
  freq: number;
  type: "white" | "black";
  /** 0-based index of the white key itself (white) or left adjacent white key (black). */
  whiteIndex: number;
}

const NOTE_SEMITONES = [
  { name: "C", type: "white" },
  { name: "C#", type: "black" },
  { name: "D", type: "white" },
  { name: "D#", type: "black" },
  { name: "E", type: "white" },
  { name: "F", type: "white" },
  { name: "F#", type: "black" },
  { name: "G", type: "white" },
  { name: "G#", type: "black" },
  { name: "A", type: "white" },
  { name: "A#", type: "black" },
  { name: "B", type: "white" },
] as const;

const KEYBOARD_SHORTCUTS: Record<string, string> = {
  ...PIANO_KEYBOARD_SHORTCUTS,
  ":": "E5",
  '"': "F5",
  "’": "F5",
};

function buildPianoOctave(): {
  whiteKeys: PianoKeyData[];
  blackKeys: PianoKeyData[];
  noteMap: Map<string, PianoKeyData>;
} {
  const whiteKeys: PianoKeyData[] = [];
  const blackKeys: PianoKeyData[] = [];
  const noteMap = new Map<string, PianoKeyData>();
  let currentWhiteIndex = -1;

  // Build C4 (MIDI 60) through F5 (MIDI 77): 11 white keys, 7 black keys (1:1 with ASDFGHJKL;' + WETYUOP).
  for (let midi = 60; midi <= 77; midi += 1) {
    const semitone = NOTE_SEMITONES[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    const note = `${semitone.name}${octave}`;
    const freq = 440 * 2 ** ((midi - 69) / 12);

    if (semitone.type === "white") {
      currentWhiteIndex += 1;
    }

    const item: PianoKeyData = {
      midi,
      note,
      freq,
      type: semitone.type,
      whiteIndex: currentWhiteIndex,
    };

    noteMap.set(note, item);
    if (semitone.type === "white") {
      whiteKeys.push(item);
    } else {
      blackKeys.push(item);
    }
  }

  return { whiteKeys, blackKeys, noteMap };
}

const { whiteKeys: WHITE_KEYS, blackKeys: BLACK_KEYS, noteMap: PIANO_NOTE_MAP } =
  buildPianoOctave();

const WHITE_KEY_COUNT = 11;

interface ActiveVoice {
  oscPrimary: OscillatorNode;
  oscHarmonic: OscillatorNode;
  gain: GainNode;
}

function getOrCreateAudioContext(holder: {
  ctx: AudioContext | null;
}): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return null;

  if (!holder.ctx) {
    holder.ctx = new AudioCtx();
  }
  if (holder.ctx.state === "suspended") {
    void holder.ctx.resume();
  }
  return holder.ctx;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

export interface PianoKeysHandle {
  auditionChord: (notes: readonly string[], durationMs?: number) => void;
  stopAudition: () => void;
}

export interface PianoKeysProps {
  ref?: Ref<PianoKeysHandle>;
  initialNotes?: readonly string[];
  onActiveNotesChange?: (notes: string[]) => void;
  onManualPlay?: () => void;
}

export function PianoKeys({
  ref,
  initialNotes,
  onActiveNotesChange,
  onManualPlay,
}: PianoKeysProps) {
  const [pressedNotes, setPressedNotes] = useState<Set<string>>(() => new Set());
  const [auditionedNotes, setAuditionedNotes] = useState<Set<string>>(
    () => new Set(initialNotes ?? []),
  );
  const isPointerDraggingRef = useRef(false);
  const activeNotesRef = useRef<Set<string>>(new Set());
  const auditionedNotesRef = useRef<Set<string>>(new Set());
  const auditionTimeoutRef = useRef<number | null>(null);
  const synthRef = useRef<{ ctx: AudioContext | null }>({ ctx: null });
  const voicesRef = useRef<Map<string, ActiveVoice>>(new Map());
  const tapTimeoutsRef = useRef<Map<string, number>>(new Map());

  const stopVoice = useCallback((note: string) => {
    const voice = voicesRef.current.get(note);
    const ctx = synthRef.current.ctx;
    if (!voice || !ctx) return;

    const now = ctx.currentTime;
    try {
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setValueAtTime(
        Math.max(voice.gain.gain.value, 0.0001),
        now,
      );
      voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      voice.oscPrimary.stop(now + 0.24);
      voice.oscHarmonic.stop(now + 0.24);
    } catch {
      // Ignore already-stopped oscillator nodes.
    }
    voicesRef.current.delete(note);
  }, []);

  const startVoice = useCallback(
    (note: string) => {
      const item = PIANO_NOTE_MAP.get(note);
      if (!item) return;

      const ctx = getOrCreateAudioContext(synthRef.current);
      if (!ctx) return;

      stopVoice(note);

      const now = ctx.currentTime;
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const oscPrimary = ctx.createOscillator();
      const oscHarmonic = ctx.createOscillator();
      const harmonicGain = ctx.createGain();

      oscPrimary.type = "triangle";
      oscPrimary.frequency.setValueAtTime(item.freq, now);

      oscHarmonic.type = "sine";
      oscHarmonic.frequency.setValueAtTime(item.freq * 2, now);
      harmonicGain.gain.setValueAtTime(0.18, now);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2200, now);
      filter.frequency.exponentialRampToValueAtTime(900, now + 0.65);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.075, now + 0.28);

      oscPrimary.connect(filter);
      oscHarmonic.connect(harmonicGain);
      harmonicGain.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      oscPrimary.start(now);
      oscHarmonic.start(now);

      voicesRef.current.set(note, { oscPrimary, oscHarmonic, gain });
    },
    [stopVoice],
  );

  const stopAudition = useCallback(() => {
    if (auditionTimeoutRef.current !== null) {
      window.clearTimeout(auditionTimeoutRef.current);
      auditionTimeoutRef.current = null;
    }
    if (auditionedNotesRef.current.size === 0) return;

    for (const note of auditionedNotesRef.current) {
      if (!activeNotesRef.current.has(note)) {
        stopVoice(note);
      }
    }
    auditionedNotesRef.current.clear();
    setAuditionedNotes(new Set());
  }, [stopVoice]);

  const auditionChord = useCallback(
    (notes: readonly string[], durationMs = 1100) => {
      stopAudition();
      const validNotes = notes.filter((note) => PIANO_NOTE_MAP.has(note));
      if (validNotes.length === 0) return;

      auditionedNotesRef.current = new Set(validNotes);
      setAuditionedNotes(new Set(validNotes));

      for (const note of validNotes) {
        if (!activeNotesRef.current.has(note)) {
          startVoice(note);
        }
      }

      auditionTimeoutRef.current = window.setTimeout(() => {
        auditionTimeoutRef.current = null;
        for (const note of validNotes) {
          if (!activeNotesRef.current.has(note)) {
            stopVoice(note);
          }
        }
      }, durationMs);
    },
    [startVoice, stopAudition, stopVoice],
  );

  useImperativeHandle(
    ref,
    () => ({
      auditionChord,
      stopAudition,
    }),
    [auditionChord, stopAudition],
  );

  const pressNote = useCallback(
    (note: string) => {
      onManualPlay?.();
      stopAudition();
      if (activeNotesRef.current.has(note)) return;
      activeNotesRef.current.add(note);
      startVoice(note);
      setPressedNotes(new Set(activeNotesRef.current));
    },
    [onManualPlay, startVoice, stopAudition],
  );

  const releaseNote = useCallback(
    (note: string) => {
      if (!activeNotesRef.current.has(note)) return;
      activeNotesRef.current.delete(note);
      stopVoice(note);
      setPressedNotes(new Set(activeNotesRef.current));
    },
    [stopVoice],
  );

  const releaseAllNotes = useCallback(() => {
    isPointerDraggingRef.current = false;
    stopAudition();
    if (activeNotesRef.current.size === 0) return;

    for (const note of activeNotesRef.current) {
      stopVoice(note);
    }
    activeNotesRef.current.clear();
    setPressedNotes(new Set());
  }, [stopAudition, stopVoice]);

  useEffect(() => {
    if (!onActiveNotesChange) return;
    const merged = new Set([...pressedNotes, ...auditionedNotes]);
    onActiveNotesChange(sortNotesAscending(Array.from(merged)));
  }, [pressedNotes, auditionedNotes, onActiveNotesChange]);

  useEffect(() => {
    const timeouts = tapTimeoutsRef.current;
    const synth = synthRef.current;

    function handleWindowKeyDown(event: KeyboardEvent) {
      if (
        event.repeat ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isEditableTarget(event.target)
      ) {
        return;
      }
      const mappedNote = KEYBOARD_SHORTCUTS[event.key.toLowerCase()];
      if (!mappedNote) return;
      event.preventDefault();
      pressNote(mappedNote);
    }

    function handleWindowKeyUp(event: KeyboardEvent) {
      const mappedNote = KEYBOARD_SHORTCUTS[event.key.toLowerCase()];
      if (!mappedNote) return;
      releaseNote(mappedNote);
    }

    window.addEventListener("keydown", handleWindowKeyDown);
    window.addEventListener("keyup", handleWindowKeyUp);
    window.addEventListener("pointerup", releaseAllNotes);
    window.addEventListener("pointercancel", releaseAllNotes);
    window.addEventListener("blur", releaseAllNotes);

    return () => {
      window.removeEventListener("keydown", handleWindowKeyDown);
      window.removeEventListener("keyup", handleWindowKeyUp);
      window.removeEventListener("pointerup", releaseAllNotes);
      window.removeEventListener("pointercancel", releaseAllNotes);
      window.removeEventListener("blur", releaseAllNotes);

      for (const timeoutId of timeouts.values()) {
        window.clearTimeout(timeoutId);
      }
      timeouts.clear();
      releaseAllNotes();

      if (synth.ctx && synth.ctx.state !== "closed") {
        void synth.ctx.close();
        synth.ctx = null;
      }
    };
  }, [pressNote, releaseNote, releaseAllNotes]);

  const getKeyButtonProps = useCallback(
    (note: string) => ({
      type: "button" as const,
      "aria-label": `Play ${note}`,
      // Prevent pointer clicks from leaving sticky DOM focus that keyboard typing would light up.
      onMouseDown: (event: ReactMouseEvent<HTMLButtonElement>) => {
        if (event.button === 0) event.preventDefault();
      },
      onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => {
        if (event.button !== 0 && event.pointerType === "mouse") return;
        isPointerDraggingRef.current = true;
        pressNote(note);
      },
      onPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => {
        if (event.pointerType) {
          event.currentTarget.blur();
        }
      },
      onPointerEnter: () => {
        if (!isPointerDraggingRef.current) return;
        pressNote(note);
      },
      onPointerLeave: () => {
        if (!isPointerDraggingRef.current) return;
        releaseNote(note);
      },
      onKeyDown: (event: ReactKeyboardEvent<HTMLButtonElement>) => {
        if (event.repeat) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          pressNote(note);
        }
      },
      onKeyUp: (event: ReactKeyboardEvent<HTMLButtonElement>) => {
        if (event.key === "Enter" || event.key === " ") {
          releaseNote(note);
        }
      },
      onBlur: () => releaseNote(note),
      onClick: (event: ReactMouseEvent<HTMLButtonElement>) => {
        if (event.detail > 0) {
          event.currentTarget.blur();
          return;
        }
        // Support synthesized assistive-tech clicks that bypass pointerdown/keydown.
        if (activeNotesRef.current.has(note)) return;
        pressNote(note);
        const existing = tapTimeoutsRef.current.get(note);
        if (existing) window.clearTimeout(existing);
        const timeoutId = window.setTimeout(() => {
          tapTimeoutsRef.current.delete(note);
          releaseNote(note);
        }, 220);
        tapTimeoutsRef.current.set(note, timeoutId);
      },
    }),
    [pressNote, releaseNote],
  );

  return (
    <div
      role="group"
      aria-label="Interactive piano keyboard"
      className="relative w-full touch-pan-y select-none [--key-gap:2px] sm:[--key-gap:3px]"
    >
      {/* White keys base grid */}
      <div className="grid grid-cols-11 gap-(--key-gap)">
        {WHITE_KEYS.map((item) => {
          const isPressed =
            pressedNotes.has(item.note) || auditionedNotes.has(item.note);
          return (
            <div key={item.note} className="relative h-32 sm:h-40 md:h-44">
              {/* Stationary 3D extruded front edge & soft ground shadow */}
              <div
                aria-hidden="true"
                data-pressed={isPressed || undefined}
                className="piano-white-skirt pointer-events-none absolute inset-x-0 top-[10px] bottom-0 rounded-t-[7px] rounded-b-[9px] sm:rounded-t-[8px] sm:rounded-b-[11px]"
              />

              <button
                {...getKeyButtonProps(item.note)}
                aria-pressed={isPressed}
                data-pressed={isPressed || undefined}
                className="piano-white-cap relative z-0 block h-[calc(100%-10px)] w-full cursor-pointer rounded-t-[7px] rounded-b-[9px] sm:rounded-t-[8px] sm:rounded-b-[11px]"
              />
            </div>
          );
        })}
      </div>

      {/* Raised black keys centered over white-key seam boundaries */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[62%]">
        {BLACK_KEYS.map((item) => {
          const isPressed =
            pressedNotes.has(item.note) || auditionedNotes.has(item.note);
          const seamBoundary = item.whiteIndex + 1;
          return (
            <div
              key={item.note}
              style={{
                left: `calc(((100% + var(--key-gap)) / ${WHITE_KEY_COUNT}) * ${seamBoundary} - (var(--key-gap) / 2))`,
                width: `calc(((100% + var(--key-gap)) / ${WHITE_KEY_COUNT} - var(--key-gap)) * 0.64)`,
              }}
              className="pointer-events-auto absolute top-0 h-full -translate-x-1/2"
            >
              {/* Stationary 3D extruded front edge + soft shadow onto white keys */}
              <div
                aria-hidden="true"
                data-pressed={isPressed || undefined}
                className="piano-black-skirt pointer-events-none absolute inset-x-0 top-[8px] bottom-0 rounded-t-[5px] rounded-b-[8px] sm:rounded-b-[9px]"
              />

              <button
                {...getKeyButtonProps(item.note)}
                aria-pressed={isPressed}
                data-pressed={isPressed || undefined}
                className="piano-black-cap relative z-0 block h-[calc(100%-9px)] w-full cursor-pointer rounded-t-[5px] rounded-b-[8px] focus-visible:z-30 sm:rounded-b-[9px]"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
