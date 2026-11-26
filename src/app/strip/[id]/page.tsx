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
    description: "Chordisol Photobooth Story Strip.",
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: `Chordisol Photobooth Strip • ${id}`,
      description: "Chordisol Photobooth Story Strip.",
      images: imgUrl ? [{ url: imgUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `Chordisol Photobooth Strip • ${id}`,
      description: "Chordisol Photobooth Story Strip.",
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
        <div className="min-h-[calc(100vh-64px)] bg-bg flex items-center justify-center text-text-muted font-sans text-sm">
          Loading strip...
        </div>
      }
    >
      <StripContent {...props} />
    </Suspense>
  );
}
