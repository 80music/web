import {
  FRAME_PRESETS,
  PHOTO_FILTERS,
  type StripConfig,
} from "@/lib/booth-types";

export const BASE_STRIP_WIDTH = 360;
export const BASE_STRIP_HEIGHT = 1180;

const imageCache = new Map<string, HTMLImageElement>();

export async function preloadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached && cached.complete && cached.naturalWidth > 0) {
    return cached;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = (err) => {
      console.warn(`Failed to load image for canvas export: ${src}`, err);
      reject(err);
    };
    img.src = src;
  });
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  const imgAspect = (img.naturalWidth || w) / (img.naturalHeight || h);
  const targetAspect = w / h;

  let sx = 0;
  let sy = 0;
  let sWidth = img.naturalWidth || w;
  let sHeight = img.naturalHeight || h;

  if (imgAspect > targetAspect) {
    sWidth = (img.naturalHeight || h) * targetAspect;
    sx = ((img.naturalWidth || w) - sWidth) / 2;
  } else {
    sHeight = (img.naturalWidth || w) / targetAspect;
    sy = ((img.naturalHeight || h) - sHeight) / 2;
  }

  ctx.save();
  roundRectPath(ctx, x, y, w, h, radius);
  ctx.clip();
  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
  ctx.restore();
}

/**
 * Renders the photobooth strip onto a high-performance offscreen canvas.
 * Exactly matches the DOM layout with 1:1 pixel precision at any scale factor.
 */
export async function renderStripCanvas(
  config: StripConfig,
  scale = 3.5
): Promise<HTMLCanvasElement> {
  const width = Math.round(BASE_STRIP_WIDTH * scale);
  const height = Math.round(BASE_STRIP_HEIGHT * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Unable to create 2D canvas context");
  }

  const frame =
    FRAME_PRESETS.find((f) => f.id === config.frameColor) || FRAME_PRESETS[0];
  const activeFilter =
    PHOTO_FILTERS.find((f) => f.id === config.filter) || PHOTO_FILTERS[0];

  // 1. Draw frame background & border
  ctx.fillStyle = frame.bg;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = frame.border;
  ctx.lineWidth = Math.max(2, Math.round(2 * scale));
  roundRectPath(
    ctx,
    ctx.lineWidth / 2,
    ctx.lineWidth / 2,
    width - ctx.lineWidth,
    height - ctx.lineWidth,
    20 * scale
  );
  ctx.stroke();

  // 2. Draw Top Header
  const headerY = 22 * scale;
  let logoImg: HTMLImageElement | null = null;
  try {
    logoImg = await preloadImage("/images/chordisol-logo.png");
  } catch {
    logoImg = null;
  }

  const logoSize = 28 * scale;
  const logoX = 22 * scale;
  if (logoImg) {
    ctx.save();
    roundRectPath(ctx, logoX, headerY, logoSize, logoSize, 7 * scale);
    ctx.clip();
    ctx.drawImage(logoImg, logoX, headerY, logoSize, logoSize);
    ctx.restore();
  }

  // Header Title
  ctx.fillStyle = frame.textColor;
  ctx.font = `bold ${Math.round(15 * scale)}px var(--font-momo-display), system-ui, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("CHORDISOL", logoX + logoSize + 10 * scale, headerY + 9 * scale);

  // Header Subtitle
  ctx.fillStyle = frame.subtextColor;
  ctx.font = `600 ${Math.round(9.5 * scale)}px var(--font-momo-sans), system-ui, sans-serif`;
  ctx.fillText(
    "ACOUSTIC PHOTOBOOTH",
    logoX + logoSize + 10 * scale,
    headerY + 22 * scale
  );

  // 3. Draw 4 Photo Slots
  const photoMarginX = 22 * scale;
  const photoW = width - photoMarginX * 2; // 316 * scale
  const photoH = Math.round(photoW * (3 / 4)); // 4:3 ratio ~ 237 * scale
  const photoGap = 12 * scale;
  const photoRadius = 12 * scale;
  const startPhotoY = 64 * scale;

  for (let i = 0; i < 4; i++) {
    const currentY = startPhotoY + i * (photoH + photoGap);
    const photoData = config.photos[i];

    if (photoData) {
      try {
        const photoImg = await preloadImage(photoData);

        ctx.save();
        if (activeFilter.canvasFilter && activeFilter.canvasFilter !== "none") {
          ctx.filter = activeFilter.canvasFilter;
        } else {
          ctx.filter = "none";
        }

        drawImageCover(
          ctx,
          photoImg,
          photoMarginX,
          currentY,
          photoW,
          photoH,
          photoRadius
        );
        ctx.restore();
      } catch (err) {
        console.warn(`Error drawing photo slot ${i}:`, err);
        // Fallback neutral placeholder
        ctx.fillStyle = "#e2e8f0";
        roundRectPath(ctx, photoMarginX, currentY, photoW, photoH, photoRadius);
        ctx.fill();
      }
    } else {
      // Empty slot placeholder
      ctx.fillStyle =
        frame.id === "charcoal-ink" || frame.id === "midnight-navy"
          ? "rgba(255, 255, 255, 0.08)"
          : "rgba(15, 23, 42, 0.06)";
      roundRectPath(ctx, photoMarginX, currentY, photoW, photoH, photoRadius);
      ctx.fill();

      ctx.fillStyle = frame.subtextColor;
      ctx.font = `600 ${Math.round(11 * scale)}px var(--font-momo-sans), system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        `Shot ${i + 1}`,
        photoMarginX + photoW / 2,
        currentY + photoH / 2
      );
    }

    // Photo border
    ctx.strokeStyle = frame.photoBorder;
    ctx.lineWidth = Math.max(1, Math.round(1.5 * scale));
    roundRectPath(ctx, photoMarginX, currentY, photoW, photoH, photoRadius);
    ctx.stroke();
  }

  // 4. Draw Footer
  const footerStartY = startPhotoY + 4 * photoH + 3 * photoGap + 16 * scale;

  // Caption text
  ctx.fillStyle = frame.textColor;
  ctx.font = `bold ${Math.round(13.5 * scale)}px var(--font-momo-display), system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    config.caption || "Acoustic Session • Chordisol Studio",
    width / 2,
    footerStartY + 4 * scale
  );

  // Date / timestamp
  if (config.showDate && config.dateText) {
    ctx.fillStyle = frame.subtextColor;
    ctx.font = `600 ${Math.round(10 * scale)}px var(--font-momo-sans), system-ui, sans-serif`;
    ctx.fillText(config.dateText, width / 2, footerStartY + 20 * scale);
  }

  // Decorative bottom barcode / retro registration dots
  const barcodeY = footerStartY + 33 * scale;
  const barcodeW = 120 * scale;
  const barcodeStartX = (width - barcodeW) / 2;
  ctx.fillStyle = frame.subtextColor;
  ctx.globalAlpha = 0.55;

  const barSegments = [3, 1.5, 4, 2, 6, 2, 3, 5, 2, 4, 3, 2, 5, 2, 3];
  let curBarX = barcodeStartX;
  for (const barWidth of barSegments) {
    ctx.fillRect(curBarX, barcodeY, barWidth * scale, 6 * scale);
    curBarX += (barWidth + 2.5) * scale;
  }
  ctx.globalAlpha = 1.0;

  // 5. Draw Placed Stickers (Normalized math: xPercent, yPercent, widthPercent, rotationDeg)
  if (config.stickersVisible && config.stickers && config.stickers.length > 0) {
    // Sort by zIndex so layering is strictly respected
    const sortedStickers = [...config.stickers].sort(
      (a, b) => a.zIndex - b.zIndex
    );

    for (const sticker of sortedStickers) {
      try {
        const stickerImg = await preloadImage(sticker.src);
        const naturalW = stickerImg.naturalWidth || 100;
        const naturalH = stickerImg.naturalHeight || 100;
        const aspect = naturalH / naturalW;

        const centerX = (sticker.xPercent / 100) * width;
        const centerY = (sticker.yPercent / 100) * height;
        const drawW = (sticker.widthPercent / 100) * width;
        const drawH = drawW * aspect;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((sticker.rotationDeg * Math.PI) / 180);

        // Draw drop shadow under sticker
        ctx.shadowColor = "rgba(15, 23, 42, 0.22)";
        ctx.shadowBlur = 4 * scale;
        ctx.shadowOffsetY = 2.5 * scale;

        ctx.drawImage(stickerImg, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      } catch (stickerErr) {
        console.warn(`Failed to render sticker "${sticker.name}":`, stickerErr);
      }
    }
  }

  return canvas;
}

/**
 * Dual-Resolution Export Pipeline:
 * Export at 3.5x Ultra HD as full-quality PNG for local computer saving.
 */
export async function downloadUltraHdStrip(
  config: StripConfig,
  filename?: string
): Promise<void> {
  const canvas = await renderStripCanvas(config, 3.5);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create PNG blob from canvas"));
          return;
        }

        const name =
          filename ||
          `chordisol-strip-${new Date().toISOString().slice(0, 10)}.png`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        resolve();
      },
      "image/png",
      1.0
    );
  });
}

/**
 * Dual-Resolution Export Pipeline:
 * Export at 1.5x scale as compressed JPEG (~200KB - 300KB) to prevent Vercel 413 Payload Errors.
 */
export async function exportCompressedStripForUpload(
  config: StripConfig
): Promise<string> {
  // 1.5x scale -> 540px x 1770px
  const canvas = await renderStripCanvas(config, 1.5);
  // JPEG format with 0.88 quality yields ~180-260KB compressed image
  return canvas.toDataURL("image/jpeg", 0.88);
}
