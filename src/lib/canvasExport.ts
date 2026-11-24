import {
  FRAME_PRESETS,
  PHOTO_FILTERS,
  STRIP_RATIOS,
  type StripConfig,
} from "@/lib/booth-types";

// Base export width for Ultra HD 3.5x print: 1200px
export const EXPORT_ULTRA_HD_WIDTH = 1200;
// Compressed export width for QR upload: 540px (~200KB)
export const EXPORT_COMPRESSED_WIDTH = 540;

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

let fontsLoadedPromise: Promise<void> | null = null;

export async function ensureCanvasFonts(): Promise<void> {
  if (typeof window === "undefined") return;
  if (fontsLoadedPromise) return fontsLoadedPromise;

  fontsLoadedPromise = (async () => {
    try {
      if (typeof FontFace !== "undefined") {
        const displayFont = new FontFace(
          "ChordisolCanvasDisplay",
          "url(/font/MomoTrustDisplay.ttf)",
          { weight: "700 900" }
        );
        const sansFont = new FontFace(
          "ChordisolCanvasSans",
          "url(/font/MomoTrustSans.ttf)",
          { weight: "400 700" }
        );

        await Promise.allSettled([
          displayFont.load().then((f) => document.fonts.add(f)),
          sansFont.load().then((f) => document.fonts.add(f)),
        ]);
      }
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
    } catch (err) {
      console.warn("Canvas font loading fallback:", err);
    }
  })();

  return fontsLoadedPromise;
}

/**
 * 1:1 Pixel-Perfect Canvas Export Engine.
 * Dynamically computes all dimensions from STRIP_RATIOS to guarantee exact DOM parity.
 */
export async function renderStripCanvas(
  config: StripConfig,
  targetWidth = EXPORT_ULTRA_HD_WIDTH
): Promise<HTMLCanvasElement> {
  // Ensure fonts are loaded before canvas text measurements
  await ensureCanvasFonts();

  const width = targetWidth;
  const height = Math.round(targetWidth * STRIP_RATIOS.aspectRatio);

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

  // Concrete font strings using loaded FontFace with robust fallbacks
  const fontDisplay =
    "'ChordisolCanvasDisplay', 'Momo Trust Display', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  const fontSans =
    "'ChordisolCanvasSans', 'Momo Trust Sans', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  // 1. Draw frame background & border
  ctx.fillStyle = frame.bg;
  ctx.fillRect(0, 0, width, height);

  const frameBorderWidth = Math.max(3, Math.round(width * 0.01));
  ctx.strokeStyle = frame.border;
  ctx.lineWidth = frameBorderWidth;
  roundRectPath(
    ctx,
    frameBorderWidth / 2,
    frameBorderWidth / 2,
    width - frameBorderWidth,
    height - frameBorderWidth,
    Math.round(width * 0.065)
  );
  ctx.stroke();

  // 2. Draw Header
  const headerTopY = width * STRIP_RATIOS.paddingTop;
  const logoSize = Math.round(width * STRIP_RATIOS.logoSize);
  const headerLeftX = width * STRIP_RATIOS.paddingX;

  let logoImg: HTMLImageElement | null = null;
  try {
    logoImg = await preloadImage("/images/chordisol-logo.png");
  } catch {
    logoImg = null;
  }

  if (logoImg) {
    ctx.save();
    roundRectPath(
      ctx,
      headerLeftX,
      headerTopY,
      logoSize,
      logoSize,
      Math.round(logoSize * 0.24)
    );
    ctx.clip();
    ctx.drawImage(logoImg, headerLeftX, headerTopY, logoSize, logoSize);
    ctx.restore();
  }

  // Header Title
  const textLeftX = headerLeftX + logoSize + Math.round(width * 0.032);
  const titleFontSize = Math.round(width * STRIP_RATIOS.titleFontSize);
  ctx.fillStyle = frame.textColor;
  ctx.font = `bold ${titleFontSize}px ${fontDisplay}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("CHORDISOL", textLeftX, headerTopY + logoSize * 0.32);

  // Header Subtitle
  const subFontSize = Math.round(width * STRIP_RATIOS.subtitleFontSize);
  ctx.fillStyle = frame.subtextColor;
  ctx.font = `700 ${subFontSize}px ${fontSans}`;
  ctx.fillText("ACOUSTIC PHOTOBOOTH", textLeftX, headerTopY + logoSize * 0.76);

  // "4-CUT" Badge on right
  const badgeFontSize = Math.round(width * STRIP_RATIOS.badgeFontSize);
  const badgeW = Math.round(width * 0.15);
  const badgeH = Math.round(width * 0.065);
  const badgeX = width - width * STRIP_RATIOS.paddingX - badgeW;
  const badgeY = headerTopY + (logoSize - badgeH) / 2;

  ctx.fillStyle = frame.photoBorder;
  roundRectPath(ctx, badgeX, badgeY, badgeW, badgeH, Math.round(badgeH / 2));
  ctx.fill();

  ctx.fillStyle = frame.textColor;
  ctx.font = `bold ${badgeFontSize}px ${fontSans}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("4-CUT", badgeX + badgeW / 2, badgeY + badgeH / 2);

  // 3. Draw 4 Photo Slots
  const photoMarginX = width * STRIP_RATIOS.paddingX;
  const photoW = width * STRIP_RATIOS.photoWidth;
  const photoH = width * STRIP_RATIOS.photoHeight;
  const photoGap = width * STRIP_RATIOS.photoGap;
  const photoRadius = Math.round(width * STRIP_RATIOS.photoRadius);
  const startPhotoY =
    headerTopY + logoSize + width * STRIP_RATIOS.gapHeaderToPhotos;

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
        ctx.fillStyle = "#e2e8f0";
        roundRectPath(ctx, photoMarginX, currentY, photoW, photoH, photoRadius);
        ctx.fill();
      }
    } else {
      // Empty slot placeholder matching DOM strip
      ctx.fillStyle =
        frame.id === "charcoal-ink" || frame.id === "midnight-navy"
          ? "rgba(255, 255, 255, 0.08)"
          : "rgba(15, 23, 42, 0.05)";
      roundRectPath(ctx, photoMarginX, currentY, photoW, photoH, photoRadius);
      ctx.fill();

      // Dashed inner slot indicator
      ctx.strokeStyle = frame.subtextColor;
      ctx.lineWidth = Math.max(2, Math.round(width * 0.003));
      ctx.setLineDash([Math.round(width * 0.015), Math.round(width * 0.01)]);
      const indicatorSize = Math.round(width * 0.12);
      ctx.beginPath();
      ctx.arc(
        photoMarginX + photoW / 2,
        currentY + photoH / 2 - Math.round(width * 0.02),
        indicatorSize / 2,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = frame.textColor;
      ctx.font = `bold ${Math.round(width * 0.042)}px ${fontSans}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        `${i + 1}`,
        photoMarginX + photoW / 2,
        currentY + photoH / 2 - Math.round(width * 0.02)
      );

      ctx.fillStyle = frame.subtextColor;
      ctx.font = `600 ${Math.round(width * 0.03)}px ${fontSans}`;
      ctx.fillText(
        `Shot ${i + 1}`,
        photoMarginX + photoW / 2,
        currentY + photoH / 2 + Math.round(width * 0.065)
      );
    }

    // Photo outer border
    ctx.strokeStyle = frame.photoBorder;
    ctx.lineWidth = Math.max(1.5, Math.round(width * 0.004));
    roundRectPath(ctx, photoMarginX, currentY, photoW, photoH, photoRadius);
    ctx.stroke();
  }

  // 4. Draw Footer
  const footerStartY =
    startPhotoY + 4 * photoH + 3 * photoGap + width * STRIP_RATIOS.gapPhotosToFooter;

  // Caption text
  const captionFontSize = Math.round(width * STRIP_RATIOS.captionFontSize);
  ctx.fillStyle = frame.textColor;
  ctx.font = `bold ${captionFontSize}px ${fontDisplay}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    config.caption || "Acoustic Session • Chordisol Studio",
    width / 2,
    footerStartY + Math.round(width * 0.02)
  );

  // Date / timestamp
  let nextY = footerStartY + Math.round(width * 0.02);
  if (config.showDate && config.dateText) {
    nextY += Math.round(width * 0.045);
    const dateFontSize = Math.round(width * STRIP_RATIOS.dateFontSize);
    ctx.fillStyle = frame.subtextColor;
    ctx.font = `600 ${dateFontSize}px ${fontSans}`;
    ctx.fillText(config.dateText, width / 2, nextY);
  }

  // Decorative barcode bar
  const barcodeY = nextY + Math.round(width * 0.042);
  const barcodeW = width * STRIP_RATIOS.barcodeWidth;
  const barcodeH = width * STRIP_RATIOS.barcodeHeight;
  const barcodeStartX = (width - barcodeW) / 2;

  ctx.fillStyle = frame.subtextColor;
  ctx.globalAlpha = 0.55;

  const barSegments = [
    3.5, 1.5, 4.5, 2, 6, 2.5, 3.5, 5.5, 2, 4.5, 3, 2, 5.5, 2.5, 3.5, 2, 4.5, 2,
    6, 3, 4,
  ];
  const totalBarUnits = barSegments.reduce((a, b) => a + b, 0);
  const unitPx = barcodeW / totalBarUnits;

  let curBarX = barcodeStartX;
  for (let b = 0; b < barSegments.length; b++) {
    const seg = barSegments[b];
    if (b % 2 === 0) {
      ctx.fillRect(curBarX, barcodeY, seg * unitPx, barcodeH);
    }
    curBarX += seg * unitPx;
  }
  ctx.globalAlpha = 1.0;

  // 5. Draw Placed Stickers (Normalized math: xPercent, yPercent, widthPercent, rotationDeg)
  if (config.stickersVisible && config.stickers && config.stickers.length > 0) {
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

        // Soft drop shadow matching DOM
        ctx.shadowColor = "rgba(15, 23, 42, 0.28)";
        ctx.shadowBlur = Math.round(drawW * 0.12);
        ctx.shadowOffsetY = Math.round(drawW * 0.06);

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
 * Export at 3.5x Ultra HD (1200px wide, ~3790px tall) as full-quality PNG for local saving.
 */
export async function downloadUltraHdStrip(
  config: StripConfig,
  filename?: string
): Promise<void> {
  const canvas = await renderStripCanvas(config, EXPORT_ULTRA_HD_WIDTH);

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
 * Export at 1.5x scale (540px wide, ~1700px tall) as compressed JPEG (~200KB - 300KB) to prevent Vercel 413 Payload Errors.
 */
export async function exportCompressedStripForUpload(
  config: StripConfig
): Promise<string> {
  const canvas = await renderStripCanvas(config, EXPORT_COMPRESSED_WIDTH);
  return canvas.toDataURL("image/jpeg", 0.88);
}
