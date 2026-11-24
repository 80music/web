import { NextRequest, NextResponse } from "next/server";
import { getStripImage } from "@/lib/strip-storage";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id) {
    return new NextResponse("Strip ID required", { status: 400 });
  }

  const item = getStripImage(id);
  if (!item) {
    return new NextResponse("Strip image not found or expired", { status: 404 });
  }

  return new NextResponse(new Uint8Array(item.buffer), {
    headers: {
      "Content-Type": item.contentType,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
