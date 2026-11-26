import Image from "next/image";
import Link from "next/link";
import { AppleLogoIcon } from "@/components/bento-icons";

export function AppFooter() {
  return (
    <footer
      id="site-footer"
      aria-label="Chordisol page footer"
      className="bg-white px-4 pt-16 pb-14 sm:px-6 sm:pt-20 sm:pb-16"
    >
      <div className="mx-auto w-full max-w-265">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-12 sm:items-start">
          {/* Brand info (7 cols) */}
          <div className="sm:col-span-7">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-fg-display"
            >
              <Image
                src="/images/chordisol-logo.png"
                alt="Chordisol"
                width={28}
                height={28}
                className="size-7 shrink-0 rounded-[7px] object-cover"
              />
              <span>Chordisol</span>
            </Link>

            <p className="mt-2.5 max-w-sm text-xs leading-relaxed text-fg-display/70">
              Instant acoustic chord recognition, playful song puzzles, and ear training for iPhone &amp; iPad.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-medium text-fg-display/75">
              <span className="inline-flex items-center gap-1 rounded-md bg-surface-secondary/70 px-2 py-0.5">
                <AppleLogoIcon className="size-2.5 text-fg-display/70" />
                iOS 17+
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-surface-secondary/70 px-2 py-0.5">
                Core Audio &amp; CoreML
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-surface-secondary/70 px-2 py-0.5 text-[#1674d6]">
                <span className="size-1.5 rounded-full bg-[#2391ff]" />
                On-Device Audio
              </span>
            </div>
          </div>

          {/* Links (5 cols) */}
          <div className="grid grid-cols-2 gap-6 sm:col-span-5 text-xs">
            <div>
              <span className="text-xs font-bold text-fg-display">
                Product
              </span>
              <ul className="mt-2.5 space-y-2 text-fg-display/75">
                <li>
                  <a href="#curriculum" className="transition-colors hover:text-[#1674d6]">
                    Curriculum
                  </a>
                </li>
                <li>
                  <a href="#recognition" className="transition-colors hover:text-[#1674d6]">
                    Live Chords
                  </a>
                </li>
                <li>
                  <a href="#bento-song-puzzles" className="transition-colors hover:text-[#1674d6]">
                    Song Puzzles
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <span className="text-xs font-bold text-fg-display">
                Chordisol for iOS
              </span>
              <ul className="mt-2.5 space-y-2 text-fg-display/75">
                <li>
                  <a href="#download" className="transition-colors hover:text-[#1674d6]">
                    Download on App Store
                  </a>
                </li>
                <li>
                  <Link href="/privacy" className="transition-colors hover:text-[#1674d6]">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="transition-colors hover:text-[#1674d6]">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 text-xs text-fg-display/45 sm:flex-row">
          <p>&copy; 2026 Chordisol. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="transition-colors hover:text-[#1674d6]">
              Privacy Policy
            </Link>
            <span aria-hidden="true">&middot;</span>
            <Link href="/terms" className="transition-colors hover:text-[#1674d6]">
              Terms of Service
            </Link>
            <span aria-hidden="true">&middot;</span>
            <a href="mailto:support@chordisol.com" className="transition-colors hover:text-[#1674d6]">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

