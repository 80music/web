import type { Metadata } from "next";
import { Suspense } from "react";
import { StripMobileClient } from "./strip-mobile-client";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const rawImg = resolvedSearchParams.img;
  const imgUrl =
    typeof rawImg === "string" ? rawImg : Array.isArray(rawImg) ? rawImg[0] : "";

  return {
    title: `Photobooth Strip • ${id}`,
    description: "4-cut acoustic memory strip from Chordisol Photobooth.",
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: `Chordisol Photobooth Strip • ${id}`,
      description: "4-cut acoustic memory strip from Chordisol Photobooth.",
      images: imgUrl ? [{ url: imgUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `Chordisol Photobooth Strip • ${id}`,
      description: "4-cut acoustic memory strip from Chordisol Photobooth.",
      images: imgUrl ? [imgUrl] : [],
    },
  };
}

async function StripContent({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const rawImg = resolvedSearchParams.img;
  const imgUrl =
    typeof rawImg === "string" ? rawImg : Array.isArray(rawImg) ? rawImg[0] : "";

  return <StripMobileClient stripId={id} imgUrl={imgUrl} />;
}

export default function StripPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-sans text-sm">
          Loading photobooth strip...
        </div>
      }
    >
      <StripContent {...props} />
    </Suspense>
  );
}
