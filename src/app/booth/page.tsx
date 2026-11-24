import type { Metadata } from "next";
import { Suspense } from "react";
import { BoothStudio } from "./booth-studio";
import { AppFooter } from "@/components/app-footer";

export const metadata: Metadata = {
  title: "Acoustic Photobooth",
  description:
    "Capture 4-cut photobooth memory strips with Chordisol mascots, tactile chord blocks, and retro stamps. Export in 3.5x Ultra HD or scan with mobile QR.",
  keywords: [
    "photobooth",
    "acoustic photobooth",
    "4-cut strip",
    "music photobooth",
    "chord stickers",
    "music practice memories",
    "chordisol booth",
  ],
  alternates: {
    canonical: "/booth",
  },
  openGraph: {
    title: "Acoustic Photobooth • Chordisol",
    description:
      "Capture 4-cut photobooth strips with Chordisol note mascots, tactile chord blocks, and retro stamps.",
    url: "https://chordisol.com/booth",
    images: [
      {
        url: "/images/chordisol-og.png",
        width: 1200,
        height: 630,
        alt: "Chordisol Acoustic Photobooth",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Acoustic Photobooth • Chordisol",
    description:
      "Capture 4-cut photobooth memory strips with Chordisol note mascots and chord blocks.",
    images: ["/images/chordisol-og.png"],
  },
};

export default function BoothPage() {
  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <Suspense
        fallback={
          <div className="min-h-screen bg-slate-50 flex items-center justify-center text-fg-display font-sans text-sm">
            Loading Acoustic Photobooth...
          </div>
        }
      >
        <BoothStudio />
      </Suspense>
      <AppFooter />
    </main>
  );
}
