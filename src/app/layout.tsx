import type { Metadata } from "next";
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
  title: "Chordisol: Acoustic Chord Recognition for iPhone & iPad",
  description:
    "Instant acoustic chord recognition, playful song puzzles, and ear training for musicians. Prop your iPhone by your piano or guitar.",
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
    title: "Chordisol: Acoustic Chord Recognition for iPhone & iPad",
    description:
      "Instant acoustic chord recognition, playful song puzzles, and ear training for musicians. Prop your iPhone by your piano or guitar.",
    url: "https://chordisol.com",
    siteName: "Chordisol",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/chordisol-logo.png",
        width: 1024,
        height: 1024,
        alt: "Chordisol Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Chordisol: Acoustic Chord Recognition for iPhone & iPad",
    description:
      "Instant acoustic chord recognition, playful song puzzles, and ear training for musicians.",
    images: ["/images/chordisol-logo.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Chordisol",
      "operatingSystem": "iOS",
      "applicationCategory": "MusicApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "description":
        "Instant acoustic chord recognition, playful song puzzles, and ear training for iPhone & iPad.",
      "image": "https://chordisol.com/images/chordisol-logo.png",
      "logo": "https://chordisol.com/images/chordisol-logo.png",
      "url": "https://chordisol.com",
    },
    {
      "@type": "Organization",
      "name": "Chordisol",
      "url": "https://chordisol.com",
      "logo": "https://chordisol.com/images/chordisol-logo.png",
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
          <TopBar />
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
