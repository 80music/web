import type { Metadata } from "next";
import { Suspense } from "react";
import localFont from "next/font/local";
import { MotionProvider } from "@/components/motion-provider";
import { TopBar } from "@/components/top-bar";
import "./globals.css";

const momoTrustDisplay = localFont({
  src: "../../public/font/MomoTrustDisplay.ttf",
  variable: "--font-momo-display",
  display: "swap",
});

const momoTrustSans = localFont({
  src: "../../public/font/MomoTrustSans.ttf",
  variable: "--font-momo-sans",
  display: "swap",
});

const notoSansMono = localFont({
  src: "../../public/font/NotoSansMono.ttf",
  variable: "--font-noto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://chordisol.com"),
  title: {
    default: "Chordisol: Acoustic Chord Recognition & Music Practice for iPhone",
    template: "%s | Chordisol",
  },
  description:
    "Instant acoustic chord recognition, ear training, and music practice for musicians. Prop your iPhone by your piano or guitar to identify triads, 7ths, and practice chords in real-time.",
  keywords: [
    "chords",
    "chord",
    "chord recognition",
    "chord progression",
    "acoustic chord recognition",
    "music",
    "music practice",
    "ear training",
    "piano chords",
    "guitar chords",
    "ukulele chords",
    "music theory",
    "song puzzles",
    "musician practice",
    "real-time chord detection",
    "audio chord recognition",
    "iOS music app",
  ],
  authors: [{ name: "Chordisol", url: "https://chordisol.com" }],
  creator: "Chordisol",
  publisher: "Chordisol",
  applicationName: "Chordisol",
  category: "Music",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/images/chordisol-logo.png", sizes: "any", type: "image/png" },
    ],
    apple: [
      { url: "/images/chordisol-logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/images/chordisol-logo.png",
  },
  openGraph: {
    title: "Chordisol: Acoustic Chord Recognition & Music Practice",
    description:
      "Instant acoustic chord recognition, ear training, and music practice for musicians. Prop your iPhone by your piano or guitar to identify chords in real time.",
    url: "https://chordisol.com",
    siteName: "Chordisol",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/chordisol-og.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Chordisol - Acoustic Chord Recognition & Practice for iPhone & iPad",
      },
      {
        url: "/images/chordisol-logo.png",
        width: 1024,
        height: 1024,
        type: "image/png",
        alt: "Chordisol App Icon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chordisol: Acoustic Chord Recognition & Music Practice",
    description:
      "Instant acoustic chord recognition, playful song puzzles, and music practice for musicians.",
    images: ["/images/chordisol-og.png"],
    creator: "@chordisol",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Chordisol",
      "operatingSystem": "iOS 17.0 or later",
      "applicationCategory": "MusicApplication",
      "applicationSubCategory": "Music Practice & Ear Training",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "description":
        "Instant acoustic chord recognition, playful song puzzles, and music practice for iPhone & iPad. Prop phone by your piano, guitar, or ukulele.",
      "image": "https://chordisol.com/images/chordisol-og.png",
      "logo": "https://chordisol.com/images/chordisol-logo.png",
      "screenshot": "https://chordisol.com/images/chordisol-iphone-mockup.png",
      "url": "https://chordisol.com",
      "featureList": [
        "Real-time acoustic chord recognition",
        "Triad, seventh, and inversion detection",
        "Acoustic piano, guitar, ukulele, and vocal detection",
        "Gamified ear training curriculum and song puzzles",
        "Acoustic photobooth memory studio",
      ],
      "keywords":
        "chords, chord recognition, chord progression, music, music practice, ear training, piano chords, guitar chords",
    },
    {
      "@type": "Organization",
      "name": "Chordisol",
      "url": "https://chordisol.com",
      "logo": "https://chordisol.com/images/chordisol-logo.png",
      "sameAs": [
        "https://www.instagram.com/chordisol",
        "https://www.linkedin.com/company/chordisol"
      ],
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${momoTrustDisplay.variable} ${momoTrustSans.variable} ${notoSansMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-fg-regular font-sans">
        <MotionProvider>
          <Suspense fallback={<header className="sticky top-0 z-40 w-full h-14 border-b border-border-subtle/75 bg-surface-elevated/95" />}>
            <TopBar />
          </Suspense>
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
