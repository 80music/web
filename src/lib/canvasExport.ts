import {
  PHOTO_FILTERS,
  getPhotoCountForVariation,
  isTopLogoVariation,
  type StripConfig,
} from "@/lib/booth-types";

// Exact Instagram Story 9:16 resolution: 1080 x 1920
export const EXPORT_ULTRA_HD_WIDTH = 1080;
export const EXPORT_ULTRA_HD_HEIGHT = 1920;
// Compressed 9:16 export for QR upload: 540 x 960
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
  if (radius > 0) {
    roundRectPath(ctx, x, y, w, h, radius);
    ctx.clip();
  }
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
        await displayFont.load().then((f) => document.fonts.add(f));
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
 * 1:1 Pixel-Perfect 9:16 Instagram Story Export Engine (1080 x 1920).
 * Edge-to-edge pure white print paper — zero outer border, no caption/date/barcode.
 */
export async function renderStripCanvas(
  config: StripConfig,
  targetWidth = EXPORT_ULTRA_HD_WIDTH
): Promise<HTMLCanvasElement> {
  await ensureCanvasFonts();

  const variation = config.layoutVariation || "variation-1";
  const photoCount = getPhotoCountForVariation(variation);
  const isTopLogo = isTopLogoVariation(variation);

  const width = targetWidth;
  const height = Math.round((targetWidth * 16) / 9);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Unable to create 2D canvas context");
  }

  const activeFilter =
    PHOTO_FILTERS.find((f) => f.id === config.filter) || PHOTO_FILTERS[0];

  const fontDisplay =
    "'ChordisolCanvasDisplay', 'Momo Trust Display', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  // 1. Edge-to-edge pure white matte paper — NO border, NO rounded outer cutout
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Shared 9:16 layout metrics (exact 1:1 parity with PhotoboothStrip DOM)
  const padX = Math.round(width * 0.06);
  const padEdge = Math.round(width * 0.06);
  const brandBandH = Math.round(height * 0.1);
  const photoAreaW = width - padX * 2;
  const photoAreaH = height - padEdge - brandBandH;
  const photoStartY = isTopLogo ? brandBandH : padEdge;
  const gap = Math.round(width * 0.028);
  const photoRadius = Math.round(width * 0.01);

  const drawPhotoSlot = async (
    slotIdx: number,
    x: number,
    y: number,
    w: number,
    h: number
  ) => {
    const photoData = config.photos[slotIdx];
    if (photoData) {
      try {
        const photoImg = await preloadImage(photoData);
        ctx.save();
        ctx.filter =
          activeFilter.canvasFilter && activeFilter.canvasFilter !== "none"
            ? activeFilter.canvasFilter
            : "none";
        drawImageCover(ctx, photoImg, x, y, w, h, photoRadius);
        ctx.restore();
      } catch (err) {
        console.warn(`Error drawing photo slot ${slotIdx}:`, err);
        ctx.fillStyle = "#f4f6fa";
        roundRectPath(ctx, x, y, w, h, photoRadius);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = "#f4f6fa";
      roundRectPath(ctx, x, y, w, h, photoRadius);
      ctx.fill();
    }
  };

  // 2. Draw Photo Cuts (3 pics, 2 pics, or 1 pic)
  const cellW = photoAreaW;
  const cellH = Math.floor((photoAreaH - gap * (photoCount - 1)) / photoCount);
  for (let i = 0; i < photoCount; i++) {
    await drawPhotoSlot(i, padX, photoStartY + i * (cellH + gap), cellW, cellH);
  }

  // 3. Minimal Centered Brand Mark (Top or Bottom depending on variation)
  let logoImg: HTMLImageElement | null = null;
  try {
    logoImg = await preloadImage("/images/chordisol-logo.png");
  } catch {
    logoImg = null;
  }

  const brandCenterY = isTopLogo ? brandBandH / 2 : height - brandBandH / 2;
  const logoSize = Math.round(width * 0.06);
  const brandGap = Math.round(width * 0.022);
  const brandFontSize = Math.round(width * 0.045);

  ctx.font = `700 ${brandFontSize}px ${fontDisplay}`;
  const brandText = "Chordisol";
  const textW = ctx.measureText(brandText).width;
  const totalBrandW = (logoImg ? logoSize + brandGap : 0) + textW;
  const brandStartX = (width - totalBrandW) / 2;

  if (logoImg) {
    ctx.save();
    roundRectPath(
      ctx,
      brandStartX,
      brandCenterY - logoSize / 2,
      logoSize,
      logoSize,
      Math.round(logoSize * 0.22)
    );
    ctx.clip();
    ctx.drawImage(logoImg, brandStartX, brandCenterY - logoSize / 2, logoSize, logoSize);
    ctx.restore();
  }

  ctx.fillStyle = "#14365f";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(
    brandText,
    brandStartX + (logoImg ? logoSize + brandGap : 0),
    brandCenterY
  );

  // 4. Draw Placed Stickers (Normalized math: xPercent, yPercent, widthPercent, rotationDeg)
  if (config.stickersVisible && config.stickers && config.stickers.length > 0) {
    const sortedStickers = [...config.stickers].sort((a, b) => a.zIndex - b.zIndex);

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

        ctx.shadowColor = "rgba(20, 54, 95, 0.22)";
        ctx.shadowBlur = Math.round(drawW * 0.1);
        ctx.shadowOffsetY = Math.round(drawW * 0.05);

        ctx.drawImage(stickerImg, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      } catch (stickerErr) {
        console.warn(`Failed to render sticker "${sticker.name}":`, stickerErr);
      }
    }
  }

  return canvas;
}

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
          filename || `chordisol-story-${new Date().toISOString().slice(0, 10)}.png`;
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

export async function exportCompressedStripForUpload(
  config: StripConfig
): Promise<string> {
  const canvas = await renderStripCanvas(config, EXPORT_COMPRESSED_WIDTH);
  return canvas.toDataURL("image/jpeg", 0.88);
}
