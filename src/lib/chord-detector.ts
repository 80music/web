export interface DetectedChord {
  symbol: string;
  label: string;
  notes: string[];
}

export interface SampleChordPreset {
  numeral: string;
  symbol: string;
  label: string;
  notes: readonly string[];
}

export interface KeymapEntry {
  key: string;
  note: string;
  /** White-key slot index (0..10) for white keys, or seam boundary (0..9) for black keys. */
  slot: number;
}

export const WHITE_KEYMAP: readonly KeymapEntry[] = [
  { key: "A", note: "C4", slot: 0 },
  { key: "S", note: "D4", slot: 1 },
  { key: "D", note: "E4", slot: 2 },
  { key: "F", note: "F4", slot: 3 },
  { key: "G", note: "G4", slot: 4 },
  { key: "H", note: "A4", slot: 5 },
  { key: "J", note: "B4", slot: 6 },
  { key: "K", note: "C5", slot: 7 },
  { key: "L", note: "D5", slot: 8 },
  { key: ";", note: "E5", slot: 9 },
  { key: "'", note: "F5", slot: 10 },
];

export const BLACK_KEYMAP: readonly KeymapEntry[] = [
  { key: "W", note: "C#4", slot: 0 },
  { key: "E", note: "D#4", slot: 1 },
  { key: "T", note: "F#4", slot: 3 },
  { key: "Y", note: "G#4", slot: 4 },
  { key: "U", note: "A#4", slot: 5 },
  { key: "O", note: "C#5", slot: 7 },
  { key: "P", note: "D#5", slot: 8 },
];

export const PIANO_KEYBOARD_SHORTCUTS: Readonly<Record<string, string>> =
  Object.fromEntries(
    [...WHITE_KEYMAP, ...BLACK_KEYMAP].map(({ key, note }) => [
      key.toLowerCase(),
      note,
    ]),
  );

export const SAMPLE_CHORDS: readonly SampleChordPreset[] = [
  {
    numeral: "IV",
    symbol: "F",
    label: "Major triad",
    notes: ["F4", "A4", "C5"],
  },
  {
    numeral: "I",
    symbol: "Cmaj7",
    label: "Major 7th",
    notes: ["C4", "E4", "G4", "B4"],
  },
  {
    numeral: "vi",
    symbol: "Am",
    label: "Minor triad",
    notes: ["A4", "C5", "E5"],
  },
  {
    numeral: "V",
    symbol: "G7",
    label: "Dominant 7th",
    notes: ["G4", "B4", "D5", "F5"],
  },
];

const NOTE_SEMITONE_OFFSETS: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

export const CHROMATIC_PITCH_CLASSES = [
  "C",
  "C#",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const;

const PITCH_CLASS_DISPLAY = CHROMATIC_PITCH_CLASSES;

const INTERVAL_NAMES: Record<number, { short: string; label: string }> = {
  1: { short: "m2", label: "Minor 2nd" },
  2: { short: "M2", label: "Major 2nd" },
  3: { short: "m3", label: "Minor 3rd" },
  4: { short: "M3", label: "Major 3rd" },
  5: { short: "P4", label: "Perfect 4th" },
  6: { short: "TT", label: "Tritone" },
  7: { short: "5", label: "Perfect 5th" },
  8: { short: "m6", label: "Minor 6th" },
  9: { short: "M6", label: "Major 6th" },
  10: { short: "m7", label: "Minor 7th" },
  11: { short: "M7", label: "Major 7th" },
  12: { short: "8ve", label: "Octave" },
};

interface ChordTemplate {
  intervals: readonly number[];
  suffix: string;
  label: string;
}

const CHORD_TEMPLATES: readonly ChordTemplate[] = [
  { intervals: [0, 2, 4, 7, 11], suffix: "maj9", label: "Major 9th" },
  { intervals: [0, 2, 4, 7, 10], suffix: "9", label: "Dominant 9th" },
  { intervals: [0, 2, 3, 7, 10], suffix: "m9", label: "Minor 9th" },
  { intervals: [0, 2, 4, 7, 9], suffix: "6/9", label: "Major 6/9" },
  { intervals: [0, 4, 7, 11], suffix: "maj7", label: "Major 7th" },
  { intervals: [0, 4, 7, 10], suffix: "7", label: "Dominant 7th" },
  { intervals: [0, 3, 7, 10], suffix: "m7", label: "Minor 7th" },
  { intervals: [0, 3, 7, 11], suffix: "m(maj7)", label: "Minor-major 7th" },
  { intervals: [0, 3, 6, 10], suffix: "m7b5", label: "Half-diminished" },
  { intervals: [0, 3, 6, 9], suffix: "dim7", label: "Diminished 7th" },
  { intervals: [0, 4, 7, 9], suffix: "6", label: "Major 6th" },
  { intervals: [0, 3, 7, 9], suffix: "m6", label: "Minor 6th" },
  { intervals: [0, 5, 7, 10], suffix: "7sus4", label: "Dominant 7sus4" },
  { intervals: [0, 2, 4, 7], suffix: "add9", label: "Major add9" },
  { intervals: [0, 2, 3, 7], suffix: "m(add9)", label: "Minor add9" },
  { intervals: [0, 4, 7], suffix: "", label: "Major triad" },
  { intervals: [0, 3, 7], suffix: "m", label: "Minor triad" },
  { intervals: [0, 3, 6], suffix: "dim", label: "Diminished triad" },
  { intervals: [0, 4, 8], suffix: "aug", label: "Augmented triad" },
  { intervals: [0, 5, 7], suffix: "sus4", label: "Suspended 4th" },
  { intervals: [0, 2, 7], suffix: "sus2", label: "Suspended 2nd" },
  { intervals: [0, 4, 11], suffix: "maj7", label: "Major 7th" },
  { intervals: [0, 4, 10], suffix: "7", label: "Dominant 7th" },
  { intervals: [0, 3, 10], suffix: "m7", label: "Minor 7th" },
];

export function parseNoteToMidi(note: string): number | null {
  const match = /^([A-G](?:#|b)?)(-?\d+)$/.exec(note.trim());
  if (!match) return null;
  const [, pitchName, octaveText] = match;
  const semitone = NOTE_SEMITONE_OFFSETS[pitchName];
  if (semitone === undefined) return null;
  const octave = Number.parseInt(octaveText, 10);
  return (octave + 1) * 12 + semitone;
}

export function sortNotesAscending(notes: readonly string[]): string[] {
  return [...notes].sort((a, b) => {
    const midiA = parseNoteToMidi(a) ?? 0;
    const midiB = parseNoteToMidi(b) ?? 0;
    return midiA - midiB;
  });
}

function setsEqual(a: ReadonlySet<number>, b: readonly number[]): boolean {
  if (a.size !== b.length) return false;
  return b.every((value) => a.has(value));
}

export function detectChord(activeNotes: readonly string[]): DetectedChord | null {
  const parsed = activeNotes
    .map((note) => ({ note, midi: parseNoteToMidi(note) }))
    .filter((entry): entry is { note: string; midi: number } => entry.midi !== null)
    .sort((a, b) => a.midi - b.midi);

  if (parsed.length === 0) return null;

  const sortedNotes = parsed.map((entry) => entry.note);
  const bassMidi = parsed[0].midi;
  const bassPc = bassMidi % 12;
  const bassName = PITCH_CLASS_DISPLAY[bassPc];
  const uniquePcs = Array.from(new Set(parsed.map((entry) => entry.midi % 12)));

  if (parsed.length === 1) {
    return {
      symbol: sortedNotes[0],
      label: "Single note",
      notes: sortedNotes,
    };
  }

  if (uniquePcs.length === 1) {
    return {
      symbol: bassName,
      label: "Octave",
      notes: sortedNotes,
    };
  }

  if (uniquePcs.length === 2) {
    const semitones = Math.min(12, parsed[parsed.length - 1].midi - bassMidi);
    const interval = INTERVAL_NAMES[semitones] ?? INTERVAL_NAMES[semitones % 12];
    const topName = PITCH_CLASS_DISPLAY[parsed[parsed.length - 1].midi % 12];
    return {
      symbol: semitones === 7 ? `${bassName}5` : `${bassName} + ${topName}`,
      label: interval ? interval.label : "Interval",
      notes: sortedNotes,
    };
  }

  let bestMatch: { symbol: string; label: string; score: number } | null = null;

  for (const candidateRoot of uniquePcs) {
    const relativeSet = new Set(
      uniquePcs.map((pc) => (pc - candidateRoot + 12) % 12),
    );

    for (let index = 0; index < CHORD_TEMPLATES.length; index++) {
      const template = CHORD_TEMPLATES[index];
      if (!setsEqual(relativeSet, template.intervals)) continue;

      const rootName = PITCH_CLASS_DISPLAY[candidateRoot];
      const isRootPosition = candidateRoot === bassPc;
      const symbol = isRootPosition
        ? `${rootName}${template.suffix}`
        : `${rootName}${template.suffix}/${bassName}`;
      const label = isRootPosition
        ? template.label
        : `${template.label}, ${bassName} bass`;
      const score = (isRootPosition ? 100 : 0) - index;

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { symbol, label, score };
      }
      break;
    }
  }

  if (bestMatch) {
    return {
      symbol: bestMatch.symbol,
      label: bestMatch.label,
      notes: sortedNotes,
    };
  }

  return {
    symbol: uniquePcs.map((pc) => PITCH_CLASS_DISPLAY[pc]).join(" "),
    label: `${uniquePcs.length} notes`,
    notes: sortedNotes,
  };
}
