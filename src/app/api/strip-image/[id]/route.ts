import { NextRequest, NextResponse } from "next/server";
import { getStripImage, storeStripImage } from "@/lib/strip-storage";

const VALID_DRIVE_ID = /^[a-zA-Z0-9_-]{10,120}$/;

async function fetchFromGoogleDrive(
  driveId: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const candidates = [
    `https://drive.google.com/uc?export=download&id=${encodeURIComponent(driveId)}`,
    `https://lh3.googleusercontent.com/d/${encodeURIComponent(driveId)}=w1200`,
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) continue;

      const rawType = res.headers.get("content-type") || "";
      if (rawType.includes("text/html")) continue;

      const arrayBuf = await res.arrayBuffer();
      if (arrayBuf.byteLength < 100) continue;

      const contentType = rawType.startsWith("image/") ? rawType : "image/jpeg";
      return {
        buffer: Buffer.from(arrayBuf),
        contentType,
      };
    } catch {
      continue;
    }
  }

  return null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id) {
    return new NextResponse("Strip ID required", { status: 400 });
  }

  const driveId = request.nextUrl.searchParams.get("driveId")?.trim() || "";
  const hasValidDriveId = Boolean(driveId && VALID_DRIVE_ID.test(driveId));
  const cacheKey = hasValidDriveId ? `${id}:${driveId}` : id;

  // 1. Fast path: same-instance in-memory cache keyed by strip + driveId
  let item = getStripImage(cacheKey) || (!hasValidDriveId ? getStripImage(id) : undefined);

  // 2. Serverless-safe persistent path: fetch from Google Drive via ?driveId=
  if (!item && hasValidDriveId) {
    const fetched = await fetchFromGoogleDrive(driveId);
    if (fetched) {
      storeStripImage(cacheKey, fetched.buffer, fetched.contentType);
      item = {
        buffer: fetched.buffer,
        contentType: fetched.contentType,
        createdAt: Date.now(),
      };
    }
  }

  if (!item) {
    return new NextResponse("Strip image not found or expired", { status: 404 });
  }

  return new NextResponse(new Uint8Array(item.buffer), {
    headers: {
      "Content-Type": item.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
