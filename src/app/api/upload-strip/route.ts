import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { storeStripImage } from "@/lib/strip-storage";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const image = body.image || body.dataUrl;
    const { stripId } = body;

    if (!image || !stripId) {
      return NextResponse.json(
        { error: "Missing image or stripId in payload" },
        { status: 400 }
      );
    }

    // Detect exact MIME type from data URL (defaults to image/jpeg)
    const mimeMatch = typeof image === "string" ? image.match(/^data:(image\/\w+);base64,/) : null;
    const contentType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";

    // Strip out data URL header if present
    const base64Clean = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Clean, "base64");

    // Dual-resolution protection: verify payload size is within bounds (e.g. max 3.5MB)
    if (buffer.length > 3.5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Payload exceeds 3.5MB compressed limit. Please upload the 1.5x compressed strip." },
        { status: 413 }
      );
    }

    // 1. Google Drive Webhook Auto-Sync (awaited so we capture fileId for serverless-safe mobile QR serving)
    const gdriveWebhook = process.env.GOOGLE_DRIVE_WEBHOOK_URL?.trim();
    let driveSynced = false;
    let driveFileId = "";
    if (gdriveWebhook) {
      try {
        const webhookRes = await fetch(gdriveWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          redirect: "follow",
          body: JSON.stringify({
            image: base64Clean,
            filename: `chordisol-strip-${stripId}.${ext}`,
            mimeType: contentType,
            folderId: process.env.TARGET_FOLDER_ID?.trim() || "",
          }),
        });
        if (webhookRes.ok) {
          driveSynced = true;
          try {
            const driveJson = await webhookRes.json();
            if (typeof driveJson?.fileId === "string" && driveJson.fileId.length > 0) {
              driveFileId = driveJson.fileId;
            }
          } catch {
            // Non-JSON response is still considered synced
          }
        }
      } catch (webhookErr) {
        console.warn("Google Drive sync error:", webhookErr);
      }
    }

    let publicUrl = "";

    // 2. Try Vercel Blob if token is configured
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`strips/strip-${stripId}.${ext}`, buffer, {
          access: "public",
          contentType,
        });
        publicUrl = blob.url;
      } catch (blobError) {
        console.warn("Vercel blob upload failed, falling back to Drive/local proxy:", blobError);
      }
    }

    // 3. Always warm local memory + serve via same-origin proxy (with ?driveId= for cross-instance Vercel persistence)
    if (!publicUrl) {
      const cacheKey = driveFileId ? `${stripId}:${driveFileId}` : stripId;
      storeStripImage(cacheKey, buffer, contentType);
      const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
      const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
      const driveQuery = driveFileId ? `?driveId=${encodeURIComponent(driveFileId)}` : "";
      publicUrl = `${proto}://${host}/api/strip-image/${stripId}${driveQuery}`;
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      stripId,
      driveSynced,
      driveFileId: driveFileId || undefined,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Upload strip error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
