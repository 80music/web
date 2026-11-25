import { PHOTO_FILTERS, type StripConfig } from "@/lib/booth-types";

// Base export width for Ultra HD print: 1200px
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
  if (radius > 0) {
    roundRectPath(ctx, x, y, w, h, radius);
    ctx.clip();
  }
  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
  ctx.restore();
}

function drawBarcode(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  y: number,
  barcodeW: number,
  barcodeH: number
) {
  const barcodeStartX = centerX - barcodeW / 2;
  ctx.save();
  ctx.fillStyle = "#14365f";
  ctx.globalAlpha = 0.38;
  const barSegments = [
    3.5, 1.5, 4.5, 2, 6, 2.5, 3.5, 5.5, 2, 4.5, 3, 2, 5.5, 2.5, 3.5, 2, 4.5, 2, 6, 3, 4,
  ];
  const totalBarUnits = barSegments.reduce((a, b) => a + b, 0);
  const unitPx = barcodeW / totalBarUnits;

  let curBarX = barcodeStartX;
  for (let b = 0; b < barSegments.length; b++) {
    const seg = barSegments[b];
    if (b % 2 === 0) {
      ctx.fillRect(curBarX, y, seg * unitPx, barcodeH);
    }
    curBarX += seg * unitPx;
  }
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
 * 1:1 Pixel-Perfect Print Export Engine.
 * Pure edge-to-edge white print paper — zero outer border, zero corner cutout background.
 */
export async function renderStripCanvas(
  config: StripConfig,
  targetWidth = EXPORT_ULTRA_HD_WIDTH
): Promise<HTMLCanvasElement> {
  await ensureCanvasFonts();

  const variation = config.layoutVariation || "variation-1";
  const isDuo = variation === "variation-2";
  const isGrid = variation === "variation-3";

  const width = targetWidth;
  const height = isGrid
    ? Math.round(targetWidth * 1.18)
    : isDuo
    ? Math.round(targetWidth * 1.96)
    : Math.round(targetWidth * 2.52);

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
  const fontSans =
    "'ChordisolCanvasSans', 'Momo Trust Sans', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  // 1. Edge-to-edge pure white matte paper — NO outer border, NO rounded outer clip
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  let logoImg: HTMLImageElement | null = null;
  try {
    logoImg = await preloadImage("/images/chordisol-logo.png");
  } catch {
    logoImg = null;
  }

  const marginX = Math.round(width * (isGrid ? 0.045 : 0.055));
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

  if (isGrid) {
    // =========================================================================
    // VARIATION 3: 2x2 POSTCARD GRID (4 cuts)
    // =========================================================================
    const headerTopY = Math.round(width * 0.036);
    const logoSize = Math.round(width * 0.056);

    if (logoImg) {
      ctx.save();
      roundRectPath(ctx, marginX, headerTopY, logoSize, logoSize, Math.round(logoSize * 0.22));
      ctx.clip();
      ctx.drawImage(logoImg, marginX, headerTopY, logoSize, logoSize);
      ctx.restore();
    }

    ctx.fillStyle = "#14365f";
    ctx.font = `700 ${Math.round(width * 0.034)}px ${fontDisplay}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("Chordisol", marginX + logoSize + Math.round(width * 0.02), headerTopY + logoSize / 2);

    ctx.fillStyle = "#4b6075";
    ctx.font = `600 ${Math.round(width * 0.024)}px ${fontSans}`;
    ctx.textAlign = "right";
    ctx.fillText("4-cut", width - marginX, headerTopY + logoSize / 2);

    const startY = headerTopY + logoSize + Math.round(width * 0.03);
    const gap = Math.round(width * 0.022);
    const cellW = Math.floor((width - marginX * 2 - gap) / 2);
    const cellH = Math.round(cellW * 0.8);

    for (let i = 0; i < 4; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = marginX + col * (cellW + gap);
      const y = startY + row * (cellH + gap);
      await drawPhotoSlot(i, x, y, cellW, cellH);
    }

    // Editorial bottom bar
    const footerY = startY + cellH * 2 + gap + Math.round(width * 0.055);
    ctx.fillStyle = "#14365f";
    ctx.font = `700 ${Math.round(width * 0.033)}px ${fontDisplay}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(config.caption || "Acoustic Session • Chordisol Studio", width / 2, footerY);

    let nextY = footerY;
    if (config.showDate && config.dateText) {
      nextY += Math.round(width * 0.035);
      ctx.fillStyle = "#4b6075";
      ctx.font = `600 ${Math.round(width * 0.021)}px ${fontSans}`;
      ctx.fillText(config.dateText, width / 2, nextY);
    }

    drawBarcode(ctx, width / 2, nextY + Math.round(width * 0.028), width * 0.28, width * 0.015);
  } else if (isDuo) {
    // =========================================================================
    // VARIATION 2: POLAROID DUO (2 large cuts, wide editorial Polaroid chin)
    // =========================================================================
    const topPad = Math.round(width * 0.055);
    const photoW = width - marginX * 2;
    const photoH = Math.round(photoW * 0.8);
    const gap = Math.round(width * 0.03);

    await drawPhotoSlot(0, marginX, topPad, photoW, photoH);
    await drawPhotoSlot(1, marginX, topPad + photoH + gap, photoW, photoH);

    // Generous Polaroid-style bottom chin
    const chinStartY = topPad + photoH * 2 + gap;
    const chinCenterY = chinStartY + Math.round((height - chinStartY) * 0.34);

    const logoSize = Math.round(width * 0.068);
    const brandText = "Chordisol";
    ctx.font = `700 ${Math.round(width * 0.048)}px ${fontDisplay}`;
    const brandW = ctx.measureText(brandText).width;
    const totalBrandW = logoSize + Math.round(width * 0.024) + brandW;
    const brandStartX = (width - totalBrandW) / 2;

    if (logoImg) {
      ctx.save();
      roundRectPath(
        ctx,
        brandStartX,
        chinCenterY - logoSize / 2,
        logoSize,
        logoSize,
        Math.round(logoSize * 0.22)
      );
      ctx.clip();
      ctx.drawImage(logoImg, brandStartX, chinCenterY - logoSize / 2, logoSize, logoSize);
      ctx.restore();
    }

    ctx.fillStyle = "#14365f";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(brandText, brandStartX + logoSize + Math.round(width * 0.024), chinCenterY);

    const capY = chinCenterY + Math.round(width * 0.072);
    ctx.font = `700 ${Math.round(width * 0.036)}px ${fontDisplay}`;
    ctx.textAlign = "center";
    ctx.fillText(config.caption || "Acoustic Session • Chordisol Studio", width / 2, capY);

    let nextY = capY;
    if (config.showDate && config.dateText) {
      nextY += Math.round(width * 0.045);
      ctx.fillStyle = "#4b6075";
      ctx.font = `600 ${Math.round(width * 0.025)}px ${fontSans}`;
      ctx.fillText(config.dateText, width / 2, nextY);
    }

    drawBarcode(ctx, width / 2, nextY + Math.round(width * 0.04), width * 0.34, width * 0.018);
  } else {
    // =========================================================================
    // VARIATION 1: CLASSIC 3-CUT VERTICAL STRIP
    // =========================================================================
    const headerTopY = Math.round(width * 0.045);
    const logoSize = Math.round(width * 0.072);

    if (logoImg) {
      ctx.save();
      roundRectPath(ctx, marginX, headerTopY, logoSize, logoSize, Math.round(logoSize * 0.22));
      ctx.clip();
      ctx.drawImage(logoImg, marginX, headerTopY, logoSize, logoSize);
      ctx.restore();
    }

    ctx.fillStyle = "#14365f";
    ctx.font = `700 ${Math.round(width * 0.045)}px ${fontDisplay}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "Chordisol",
      marginX + logoSize + Math.round(width * 0.026),
      headerTopY + logoSize / 2
    );

    ctx.fillStyle = "#4b6075";
    ctx.font = `600 ${Math.round(width * 0.028)}px ${fontSans}`;
    ctx.textAlign = "right";
    ctx.fillText("3-cut", width - marginX, headerTopY + logoSize / 2);

    const startY = headerTopY + logoSize + Math.round(width * 0.035);
    const photoW = width - marginX * 2;
    const photoH = Math.round(photoW * 0.72);
    const gap = Math.round(width * 0.028);

    for (let i = 0; i < 3; i++) {
      await drawPhotoSlot(i, marginX, startY + i * (photoH + gap), photoW, photoH);
    }

    const footerY = startY + 3 * photoH + 2 * gap + Math.round(width * 0.068);
    ctx.fillStyle = "#14365f";
    ctx.font = `700 ${Math.round(width * 0.04)}px ${fontDisplay}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(config.caption || "Acoustic Session • Chordisol Studio", width / 2, footerY);

    let nextY = footerY;
    if (config.showDate && config.dateText) {
      nextY += Math.round(width * 0.046);
      ctx.fillStyle = "#4b6075";
      ctx.font = `600 ${Math.round(width * 0.026)}px ${fontSans}`;
      ctx.fillText(config.dateText, width / 2, nextY);
    }

    drawBarcode(ctx, width / 2, nextY + Math.round(width * 0.04), width * 0.36, width * 0.018);
  }

  // Draw Placed Stickers (Normalized math: xPercent, yPercent, widthPercent, rotationDeg)
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
          filename || `chordisol-strip-${new Date().toISOString().slice(0, 10)}.png`;
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
