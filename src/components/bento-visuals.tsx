import { parseNoteToMidi } from "@/lib/chord-detector";

const WHITE_SEMITONES = [
  { pitchClass: 0, slot: 0, label: "C" },
  { pitchClass: 2, slot: 1, label: "D" },
  { pitchClass: 4, slot: 2, label: "E" },
  { pitchClass: 5, slot: 3, label: "F" },
  { pitchClass: 7, slot: 4, label: "G" },
  { pitchClass: 9, slot: 5, label: "A" },
  { pitchClass: 11, slot: 6, label: "B" },
] as const;

const BLACK_SEMITONES = [
  { pitchClass: 1, seam: 0 },
  { pitchClass: 3, seam: 1 },
  { pitchClass: 6, seam: 3 },
  { pitchClass: 8, seam: 4 },
  { pitchClass: 10, seam: 5 },
] as const;

function getActivePitchClasses(notes: readonly string[]): Set<number> {
  const activePitchClasses = new Set<number>();
  for (const note of notes) {
    const midi = parseNoteToMidi(note);
    if (midi !== null) {
      activePitchClasses.add(((midi % 12) + 12) % 12);
    }
  }
  return activePitchClasses;
}

/** Subtle radial studio glow + delicate stave lines across the top of Try Recognition. */
export function StudioStaffBackdrop() {
  const staveY = [26, 36, 46, 56, 66];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 65% at 50% 0%, rgba(56, 155, 255, 0.22), transparent 72%)",
        }}
      />
      <svg
        viewBox="0 0 800 360"
        preserveAspectRatio="none"
        className="block h-full w-full"
      >
        {staveY.map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="800"
            y2={y}
            stroke="rgba(255,255,255,0.055)"
            strokeWidth="1"
          />
        ))}
      </svg>
    </div>
  );
}

/** Concentric acoustic radar rings radiating from the top-right corner of Live Chords. */
export function RecognitionArcsBackdrop() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 360 360"
      preserveAspectRatio="xMaxYMin slice"
      className="pointer-events-none absolute inset-0 block h-full w-full"
    >
      <circle
        cx="310"
        cy="42"
        r="74"
        fill="none"
        stroke="rgba(35,145,255,0.16)"
        strokeWidth="1.5"
      />
      <circle
        cx="310"
        cy="42"
        r="122"
        fill="none"
        stroke="rgba(35,145,255,0.11)"
        strokeWidth="1.5"
      />
      <circle
        cx="310"
        cy="42"
        r="174"
        fill="none"
        stroke="rgba(35,145,255,0.07)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/** Fine vinyl record grooves tucked subtly behind bottom-right of Ear Training. */
export function EarTrainingGroovesBackdrop() {
  const radii = [88, 118, 148, 178, 208];

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 380 280"
      preserveAspectRatio="xMaxYMax slice"
      className="pointer-events-none absolute inset-0 block h-full w-full"
    >
      {radii.map((r) => (
        <circle
          key={r}
          cx="340"
          cy="255"
          r={r}
          fill="none"
          stroke="rgba(20,54,95,0.06)"
          strokeWidth="1.25"
        />
      ))}
    </svg>
  );
}

/** Full-width continuous curved lime-green hill (#c4e55d) matching mascot-hill.png grass. */
export function SongHillBackdrop() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 120"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 bottom-0 block h-24 w-full"
    >
      <path d="M 0 32 Q 200 -8 400 28 L 400 120 L 0 120 Z" fill="#c4e55d" />
    </svg>
  );
}

/** Subtle radial halo + fine corner dot field behind the tilted Chordisol iPhone mockup. */
export function DownloadSpotlightBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle 210px at 78% 72%, rgba(128, 204, 255, 0.34), transparent 72%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.85) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          maskImage:
            "radial-gradient(circle 160px at 20% 80%, black 20%, transparent 90%)",
        }}
      />
    </div>
  );
}

export function VinylDiscsBadge() {
  const discs = [
    { outer: "#2391ff", ring: "#73baff" },
    { outer: "#ff5a9f", ring: "#ff9bc5" },
    { outer: "#8b6bff", ring: "#b7a3ff" },
  ] as const;

  return (
    <div aria-hidden="true" className="flex items-center -space-x-2.5">
      {discs.map((disc, idx) => (
        <svg
          key={disc.outer}
          viewBox="0 0 36 36"
          className="size-7 drop-shadow-[0_2px_4px_rgba(20,54,95,0.14)]"
          style={{ zIndex: discs.length - idx }}
        >
          <circle cx="18" cy="18" r="17" fill={disc.outer} />
          <circle
            cx="18"
            cy="18"
            r="12"
            fill="none"
            stroke={disc.ring}
            strokeWidth="1.2"
            opacity="0.65"
          />
          <circle cx="18" cy="18" r="6" fill="#ffa83a" />
          <circle cx="18" cy="18" r="2" fill="#ffffff" />
        </svg>
      ))}
    </div>
  );
}

export function SingleVinylDisc({
  outer,
  ring,
  className = "size-7",
}: {
  outer: string;
  ring: string;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 36 36"
      className={`${className} drop-shadow-[0_2px_4px_rgba(20,54,95,0.14)]`}
    >
      <circle cx="18" cy="18" r="17" fill={outer} />
      <circle
        cx="18"
        cy="18"
        r="12"
        fill="none"
        stroke={ring}
        strokeWidth="1.2"
        opacity="0.65"
      />
      <circle cx="18" cy="18" r="6" fill="#ffa83a" />
      <circle cx="18" cy="18" r="2" fill="#ffffff" />
    </svg>
  );
}


interface MiniOctaveKeyboardProps {
  notes: readonly string[];
  surface?: "light" | "navy" | "active-blue";
  className?: string;
}

export function MiniOctaveKeyboard({
  notes,
  surface = "light",
  className = "h-10 w-full",
}: MiniOctaveKeyboardProps) {
  const activePitchClasses = getActivePitchClasses(notes);

  const whiteFill =
    surface === "navy"
      ? "#193e6b"
      : surface === "active-blue"
        ? "rgba(255,255,255,0.28)"
        : "#eef3fa";
  const whiteStroke =
    surface === "navy"
      ? "#28558c"
      : surface === "active-blue"
        ? "rgba(255,255,255,0.22)"
        : "#d6e2f0";
  const whiteActiveFill = surface === "active-blue" ? "#ffffff" : "#2391ff";

  const blackFill =
    surface === "navy"
      ? "#0d223d"
      : surface === "active-blue"
        ? "#0e4d94"
        : "#14365f";
  const blackActiveFill = surface === "active-blue" ? "#bfe0ff" : "#4ea8ff";

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 140 52"
      className={`block ${className}`}
    >
      {WHITE_SEMITONES.map(({ pitchClass, slot }) => {
        const isLit = activePitchClasses.has(pitchClass);
        const x = slot * 20 + 1;
        return (
          <g key={pitchClass}>
            <rect
              x={x}
              y={1}
              width={18}
              height={50}
              rx={4}
              fill={isLit ? whiteActiveFill : whiteFill}
              stroke={isLit ? whiteActiveFill : whiteStroke}
              strokeWidth={1}
            />
            {isLit ? (
              <circle
                cx={x + 9}
                cy={41}
                r={2.4}
                fill={surface === "active-blue" ? "#1674d6" : "#ffffff"}
              />
            ) : null}
          </g>
        );
      })}

      {BLACK_SEMITONES.map(({ pitchClass, seam }) => {
        const isLit = activePitchClasses.has(pitchClass);
        const x = (seam + 1) * 20 - 6;
        return (
          <g key={pitchClass}>
            <rect
              x={x}
              y={1}
              width={12}
              height={31}
              rx={3}
              fill={isLit ? blackActiveFill : blackFill}
            />
            {isLit ? (
              <circle cx={x + 6} cy={24} r={2} fill="#14365f" />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
