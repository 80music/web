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

    let publicUrl = "";

    // 1. Try Vercel Blob if token is configured
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`strips/strip-${stripId}.jpg`, buffer, {
          access: "public",
          contentType: "image/jpeg",
        });
        publicUrl = blob.url;
      } catch (blobError) {
        console.warn("Vercel blob upload failed, falling back to local storage:", blobError);
      }
    }

    // 2. Fallback to in-memory/route storage if Blob is not available or failed
    if (!publicUrl) {
      storeStripImage(stripId, buffer, "image/jpeg");
      const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
      const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
      publicUrl = `${proto}://${host}/api/strip-image/${stripId}`;
    }

    // 3. Google Drive Webhook Auto-Sync (awaited so serverless runtimes don't drop it)
    const gdriveWebhook = process.env.GOOGLE_DRIVE_WEBHOOK_URL?.trim();
    let driveSynced = false;
    if (gdriveWebhook) {
      try {
        const webhookRes = await fetch(gdriveWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          redirect: "follow",
          body: JSON.stringify({
            image: base64Clean,
            filename: `chordisol-strip-${stripId}.jpg`,
            mimeType: "image/jpeg",
            folderId: process.env.TARGET_FOLDER_ID?.trim() || "",
          }),
        });
        driveSynced = webhookRes.ok;
      } catch (webhookErr) {
        console.warn("Google Drive sync error:", webhookErr);
      }
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      stripId,
      driveSynced,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Upload strip error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
