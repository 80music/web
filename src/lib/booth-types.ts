export type FrameColorId =
  | "classic-white"
  | "chordisol-blue"
  | "warm-cream"
  | "midnight-navy"
  | "concert-stub";

export const STRIP_RATIOS = {
  aspectRatio: 3.16, // Total height / width
  paddingX: 0.055, // Horizontal margin (5.5% of strip width)
  paddingTop: 0.045, // Top padding
  paddingBottom: 0.045, // Bottom padding
  headerHeight: 0.11, // Header row height
  logoSize: 0.095, // Logo square dimension
  titleFontSize: 0.054, // "CHORDISOL" title font size
  subtitleFontSize: 0.030, // "ACOUSTIC STUDIO" font size
  badgeFontSize: 0.026, // "4-CUT" badge font size
  gapHeaderToPhotos: 0.030,
  photoWidth: 0.89, // Width of each photo (100% - 2 * paddingX)
  photoHeight: 0.6675, // 4:3 aspect ratio (photoWidth * 0.75)
  photoRadius: 0.040, // Corner radius of photos
  photoGap: 0.030, // Gap between photos
  gapPhotosToFooter: 0.038,
  captionFontSize: 0.048, // Bottom caption font size
  dateFontSize: 0.032, // Timestamp font size
  barcodeWidth: 0.44, // Bottom barcode width
  barcodeHeight: 0.022, // Bottom barcode height
} as const;

export interface FramePreset {
  id: FrameColorId;
  name: string;
  bg: string;
  border: string;
  textColor: string;
  subtextColor: string;
  photoBorder: string;
  previewBg: string;
}

export type PhotoFilterId = "normal" | "bnw" | "grainy" | "original";

export interface PhotoFilterPreset {
  id: PhotoFilterId;
  name: string;
  css: string;
  canvasFilter: string;
}

export interface StickerItem {
  id: string;
  assetId: string;
  src: string;
  name: string;
  xPercent: number; // 0 to 100 (% of strip width)
  yPercent: number; // 0 to 100 (% of strip height)
  widthPercent: number; // percentage of strip width (e.g., 22)
  rotationDeg: number; // -180 to +180
  zIndex: number;
}

export interface StickerAsset {
  id: string;
  name: string;
  src: string;
  category: "mascots" | "chords" | "badges" | "sparkles";
  defaultWidthPercent: number;
}

export type LayoutVariationId =
  | "variation-1"
  | "variation-2"
  | "variation-3"
  | "variation-4"
  | "variation-5"
  | "variation-6"
  | "classic-top";

export interface LayoutVariation {
  id: LayoutVariationId;
  name: string;
  tagline: string;
  description: string;
  photoCount: number;
  logoPosition: "bottom" | "top";
}

export const LAYOUT_VARIATIONS: LayoutVariation[] = [
  {
    id: "variation-1",
    name: "3 Pics",
    tagline: "Logo bottom",
    description: "3 stacked cuts with Chordisol mark on bottom",
    photoCount: 3,
    logoPosition: "bottom",
  },
  {
    id: "variation-2",
    name: "2 Pics",
    tagline: "Logo bottom",
    description: "2 large cuts with Chordisol mark on bottom",
    photoCount: 2,
    logoPosition: "bottom",
  },
  {
    id: "variation-3",
    name: "1 Pic",
    tagline: "Logo bottom",
    description: "1 full portrait with Chordisol mark on bottom",
    photoCount: 1,
    logoPosition: "bottom",
  },
  {
    id: "variation-4",
    name: "3 Pics",
    tagline: "Logo top",
    description: "3 stacked cuts with Chordisol mark on top",
    photoCount: 3,
    logoPosition: "top",
  },
  {
    id: "variation-5",
    name: "2 Pics",
    tagline: "Logo top",
    description: "2 large cuts with Chordisol mark on top",
    photoCount: 2,
    logoPosition: "top",
  },
  {
    id: "variation-6",
    name: "1 Pic",
    tagline: "Logo top",
    description: "1 full portrait with Chordisol mark on top",
    photoCount: 1,
    logoPosition: "top",
  },
];

export function getPhotoCountForVariation(variation: LayoutVariationId): number {
  if (variation === "variation-2" || variation === "variation-5") return 2;
  if (variation === "variation-3" || variation === "variation-6") return 1;
  return 3;
}

export function isTopLogoVariation(variation: LayoutVariationId): boolean {
  return (
    variation === "variation-4" ||
    variation === "variation-5" ||
    variation === "variation-6"
  );
}

export interface StripConfig {
  photos: (string | null)[]; // 4 photos
  frameColor: FrameColorId;
  layoutVariation: LayoutVariationId;
  filter: PhotoFilterId;
  stickers: StickerItem[];
  stickersVisible: boolean;
  caption: string;
  showDate: boolean;
  dateText: string;
}

export const FRAME_PRESETS: FramePreset[] = [
  {
    id: "classic-white",
    name: "Classic",
    bg: "#ffffff",
    border: "#e2e8f0",
    textColor: "#14365f",
    subtextColor: "#64748b",
    photoBorder: "rgba(0,0,0,0.05)",
    previewBg: "#ffffff",
  },
  {
    id: "chordisol-blue",
    name: "Chordisol Pop",
    bg: "#1674d6",
    border: "#60a5fa",
    textColor: "#ffffff",
    subtextColor: "#dbeafe",
    photoBorder: "#ffffff",
    previewBg: "#1674d6",
  },
  {
    id: "warm-cream",
    name: "Sheet Music",
    bg: "#fbf6eb",
    border: "#e6dbc7",
    textColor: "#14365f",
    subtextColor: "#7c6f5b",
    photoBorder: "rgba(20,54,95,0.12)",
    previewBg: "#fbf6eb",
  },
  {
    id: "midnight-navy",
    name: "35mm Film",
    bg: "#10233d",
    border: "#25456d",
    textColor: "#ffffff",
    subtextColor: "#93c5fd",
    photoBorder: "rgba(255,255,255,0.14)",
    previewBg: "#10233d",
  },
  {
    id: "concert-stub",
    name: "Concert Stub",
    bg: "#e9f4ff",
    border: "#93c5fd",
    textColor: "#14365f",
    subtextColor: "#4b6075",
    photoBorder: "#ffffff",
    previewBg: "#e9f4ff",
  },
];

export function getFramePreset(id?: FrameColorId): FramePreset {
  return FRAME_PRESETS.find((preset) => preset.id === id) || FRAME_PRESETS[0];
}

export const PHOTO_FILTERS: PhotoFilterPreset[] = [
  {
    id: "normal",
    name: "Normal",
    css: "none",
    canvasFilter: "none",
  },
  {
    id: "bnw",
    name: "B&W",
    css: "grayscale(100%) contrast(115%) brightness(102%)",
    canvasFilter: "grayscale(100%) contrast(115%) brightness(102%)",
  },
  {
    id: "grainy",
    name: "Grainy",
    css: "contrast(112%) brightness(104%) saturate(88%) sepia(20%)",
    canvasFilter: "contrast(112%) brightness(104%) saturate(88%) sepia(20%)",
  },
];

export const STICKER_PALETTE: StickerAsset[] = [
  // Mascots
  {
    id: "mascot-radio",
    name: "Radio Note",
    src: "/images/mascots/mascot-radio.png",
    category: "mascots",
    defaultWidthPercent: 22,
  },
  {
    id: "mascot-hill",
    name: "Puzzle Hill",
    src: "/images/mascots/mascot-hill.png",
    category: "mascots",
    defaultWidthPercent: 24,
  },
  {
    id: "mascot-compare",
    name: "Compare Notes",
    src: "/images/mascots/mascot-compare.png",
    category: "mascots",
    defaultWidthPercent: 22,
  },
  {
    id: "mascot-duo-1",
    name: "Chord Duo",
    src: "/images/mascots/mascot-duo-1.png",
    category: "mascots",
    defaultWidthPercent: 24,
  },
  {
    id: "mascot-duo-2",
    name: "Chord Toss",
    src: "/images/mascots/mascot-duo-2.png",
    category: "mascots",
    defaultWidthPercent: 24,
  },

  // Chords / Keys
  {
    id: "block-c",
    name: "C Major",
    src: "/stickers/block-c.svg",
    category: "chords",
    defaultWidthPercent: 18,
  },
  {
    id: "block-d",
    name: "D Major",
    src: "/stickers/block-d.svg",
    category: "chords",
    defaultWidthPercent: 18,
  },
  {
    id: "block-f",
    name: "F Major",
    src: "/stickers/block-f.svg",
    category: "chords",
    defaultWidthPercent: 18,
  },
  {
    id: "block-g",
    name: "G Major",
    src: "/stickers/block-g.svg",
    category: "chords",
    defaultWidthPercent: 18,
  },
  {
    id: "block-am",
    name: "Am Minor",
    src: "/stickers/block-am.svg",
    category: "chords",
    defaultWidthPercent: 18,
  },
  {
    id: "block-em",
    name: "Em Minor",
    src: "/stickers/block-em.svg",
    category: "chords",
    defaultWidthPercent: 18,
  },
  {
    id: "block-dm",
    name: "Dm Minor",
    src: "/stickers/block-dm.svg",
    category: "chords",
    defaultWidthPercent: 18,
  },
  {
    id: "block-cmaj7",
    name: "Cmaj7",
    src: "/stickers/block-cmaj7.svg",
    category: "chords",
    defaultWidthPercent: 18,
  },
];

export interface StickerPresetTemplate {
  id: string;
  name: string;
  description: string;
  stickers: Omit<StickerItem, "id">[];
}

export const STICKER_PRESETS: StickerPresetTemplate[] = [
  {
    id: "full-scatter",
    name: "Full Scatter",
    description: "Playful scatter of mascots, stars, and chord blocks",
    stickers: [
      {
        assetId: "mascot-radio",
        src: "/images/mascots/mascot-radio.png",
        name: "Radio Note",
        xPercent: 16,
        yPercent: 12,
        widthPercent: 22,
        rotationDeg: -10,
        zIndex: 1,
      },
      {
        assetId: "star-sparkle",
        src: "/stickers/star-sparkle.svg",
        name: "Golden Star",
        xPercent: 82,
        yPercent: 28,
        widthPercent: 18,
        rotationDeg: 14,
        zIndex: 2,
      },
      {
        assetId: "block-c",
        src: "/stickers/block-c.svg",
        name: "C Major",
        xPercent: 18,
        yPercent: 48,
        widthPercent: 20,
        rotationDeg: 8,
        zIndex: 3,
      },
      {
        assetId: "stamp-acoustic",
        src: "/stickers/stamp-acoustic.svg",
        name: "100% Acoustic",
        xPercent: 80,
        yPercent: 68,
        widthPercent: 24,
        rotationDeg: -12,
        zIndex: 4,
      },
      {
        assetId: "mascot-hill",
        src: "/images/mascots/mascot-hill.png",
        name: "Puzzle Hill",
        xPercent: 24,
        yPercent: 88,
        widthPercent: 26,
        rotationDeg: -5,
        zIndex: 5,
      },
    ],
  },
  {
    id: "stamp-focus",
    name: "Stamp Focus",
    description: "Authentic retro stamps & vinyl collector marks",
    stickers: [
      {
        assetId: "stamp-acoustic",
        src: "/stickers/stamp-acoustic.svg",
        name: "100% Acoustic",
        xPercent: 82,
        yPercent: 16,
        widthPercent: 24,
        rotationDeg: 12,
        zIndex: 1,
      },
      {
        assetId: "badge-vinyl",
        src: "/stickers/badge-vinyl.svg",
        name: "Vinyl Disc",
        xPercent: 18,
        yPercent: 42,
        widthPercent: 22,
        rotationDeg: -8,
        zIndex: 2,
      },
      {
        assetId: "stamp-certified",
        src: "/stickers/stamp-certified.svg",
        name: "Ear Certified",
        xPercent: 78,
        yPercent: 64,
        widthPercent: 24,
        rotationDeg: -6,
        zIndex: 3,
      },
      {
        assetId: "tag-smile",
        src: "/stickers/tag-smile.svg",
        name: "Studio Ticket",
        xPercent: 50,
        yPercent: 92,
        widthPercent: 30,
        rotationDeg: 4,
        zIndex: 4,
      },
    ],
  },
  {
    id: "mascot-party",
    name: "Mascot Party",
    description: "Every member of the Chordisol note family",
    stickers: [
      {
        assetId: "mascot-radio",
        src: "/images/mascots/mascot-radio.png",
        name: "Radio Note",
        xPercent: 18,
        yPercent: 10,
        widthPercent: 24,
        rotationDeg: -12,
        zIndex: 1,
      },
      {
        assetId: "mascot-compare",
        src: "/images/mascots/mascot-compare.png",
        name: "Compare Notes",
        xPercent: 80,
        yPercent: 34,
        widthPercent: 24,
        rotationDeg: 8,
        zIndex: 2,
      },
      {
        assetId: "mascot-duo-1",
        src: "/images/mascots/mascot-duo-1.png",
        name: "Chord Duo",
        xPercent: 20,
        yPercent: 58,
        widthPercent: 26,
        rotationDeg: -6,
        zIndex: 3,
      },
      {
        assetId: "mascot-sleeping",
        src: "/images/mascots/mascot-sleeping.png",
        name: "Cozy Note",
        xPercent: 82,
        yPercent: 82,
        widthPercent: 20,
        rotationDeg: 10,
        zIndex: 4,
      },
    ],
  },
  {
    id: "minimal",
    name: "Minimalist",
    description: "Delicate corner accents and a single musical touch",
    stickers: [
      {
        assetId: "star-sparkle",
        src: "/stickers/star-sparkle.svg",
        name: "Golden Star",
        xPercent: 86,
        yPercent: 8,
        widthPercent: 16,
        rotationDeg: 15,
        zIndex: 1,
      },
      {
        assetId: "note-double",
        src: "/stickers/note-double.svg",
        name: "Eighth Notes",
        xPercent: 14,
        yPercent: 90,
        widthPercent: 18,
        rotationDeg: -12,
        zIndex: 2,
      },
    ],
  },
];
