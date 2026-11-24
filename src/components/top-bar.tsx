"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
const EASE_DRAWER: [number, number, number, number] = [0.32, 0.72, 0, 1];
const DRAWER_ID = "chordisol-nav-drawer";

interface NavLinkItem {
  label: string;
  href: string;
}

const PRIMARY_NAV_LINKS: readonly NavLinkItem[] = [
  { label: "Home", href: "/" },
  { label: "Chord Recognition", href: "/#recognition" },
  { label: "Curriculum", href: "/#curriculum" },
  { label: "iOS App", href: "/#download" },
  { label: "Song Puzzles", href: "/#about" },
];

const SIDEBAR_FOOTER_LINKS = [
  { label: "Support", href: "mailto:support@chordisol.com" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
] as const;

const SOCIAL_LINKS = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/chordisol",
    ariaLabel: "Chordisol on Instagram",
    iconSrc: "/icon/instagram.svg",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/chordisol",
    ariaLabel: "Chordisol on LinkedIn",
    iconSrc: "/icon/linkedin.svg",
  },
] as const;

function MenuBarsIcon(props: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function CloseIcon(props: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

function ChevronRightIcon(props: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.1}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 3.5L10.5 8L6 12.5" />
    </svg>
  );
}

/**
 * Renders Chordisol's brand character logo icon in navigation headers.
 */
function ChordisolAppIcon() {
  return (
    <Image
      src="/images/chordisol-logo.png"
      alt="Chordisol"
      width={28}
      height={28}
      className="size-7 shrink-0 rounded-[7px] object-cover"
      priority
    />
  );
}

function StarFullIcon(props: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 16 16" fill="#f59e0b" aria-hidden="true" {...props}>
      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z" />
    </svg>
  );
}

function StarHalfIcon(props: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="star-half-split" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>
      <path
        fill="url(#star-half-split)"
        d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z"
      />
    </svg>
  );
}

function AppleIcon(props: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}


function AppStoreIcon(props: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <line x1="12" y1="3.5" x2="4.5" y2="19.5" />
      <line x1="12" y1="3.5" x2="19.5" y2="19.5" />
      <line x1="3.5" y1="15.5" x2="20.5" y2="15.5" />
    </svg>
  );
}

const SCALLOP_PATH =
  "M 0 0 L 0 10.00 C 0 12.20, 1.80 14, 4 14 C 8.20 14, 14.80 0, 19.00 0 C 24.32 0.00, 32.68 14.00, 38.00 14.00 C 43.32 14.00, 51.68 0.00, 57.00 0.00 C 62.32 0.00, 70.68 14.00, 76.00 14.00 C 81.32 14.00, 89.68 0.00, 95.00 0.00 C 100.32 0.00, 108.68 14.00, 114.00 14.00 C 119.32 14.00, 127.68 0.00, 133.00 0.00 C 138.32 0.00, 146.68 14.00, 152.00 14.00 C 157.32 14.00, 165.68 0.00, 171.00 0.00 C 176.32 0.00, 184.68 14.00, 190.00 14.00 C 195.32 14.00, 203.68 0.00, 209.00 0.00 C 214.32 0.00, 222.68 14.00, 228.00 14.00 C 233.32 14.00, 241.68 0.00, 247.00 0.00 C 252.32 0.00, 260.68 14.00, 266.00 14.00 C 271.32 14.00, 279.68 0.00, 285.00 0.00 C 289.20 0, 295.80 14, 300.00 14 C 302.20 14, 304 12.20, 304 10.00 L 304 0 Z";

interface DrawerLinksProps {
  activePath: string | null;
  onNavigate: () => void;
}

function DrawerLinksList({ activePath, onNavigate }: DrawerLinksProps) {
  return (
    <div className="flex flex-col gap-5">
      <ul>
        {PRIMARY_NAV_LINKS.map((item) => {
          const isCurrent = activePath !== null && item.href === activePath;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isCurrent ? "page" : undefined}
                onClick={onNavigate}
                className={
                  isCurrent
                    ? "flex w-full items-center gap-2.5 px-6 py-2.5 text-[20px] leading-tight font-bold tracking-tight text-fg-display transition-colors duration-150 hover:bg-brand-primary/10 active:bg-brand-primary/15 focus-visible:outline-offset-[-3px] sm:px-7"
                    : "flex w-full items-center px-6 py-2.5 text-[20px] leading-tight font-semibold tracking-tight text-fg-display/85 transition-colors duration-150 hover:bg-brand-primary/10 hover:text-fg-display active:bg-brand-primary/15 focus-visible:outline-offset-[-3px] sm:px-7"
                }
              >
                {isCurrent ? (
                  <span
                    aria-hidden="true"
                    className="size-2 shrink-0 rounded-full bg-brand-depth"
                  />
                ) : null}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <ul aria-label="Support and legal">
        {SIDEBAR_FOOTER_LINKS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className="flex w-full items-center px-6 py-2 text-[16px] leading-tight font-semibold tracking-tight text-fg-display/70 transition-colors duration-150 hover:bg-brand-primary/10 hover:text-fg-display active:bg-brand-primary/15 focus-visible:outline-offset-[-3px] sm:px-7"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActiveDrawerLinks({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  return <DrawerLinksList activePath={pathname} onNavigate={onNavigate} />;
}

interface TicketCardContentProps {
  className?: string;
  isMobilePopup?: boolean;
  onClose?: () => void;
}

function TicketCardContent({
  className = "",
  isMobilePopup = false,
  onClose,
}: TicketCardContentProps) {
  return (
    <div className={className}>
      {/* Ticket Card Body - flush against the very top edge of the window on desktop */}
      <div
        className={`${
          isMobilePopup ? "rounded-t-2xl" : "rounded-b-none"
        } bg-linear-to-b from-[#5ecaff] via-[#309dfb] to-[#1473e6] px-5 pt-5 pb-4 text-slate-900 sm:px-6 sm:pt-6 sm:pb-4.5`}
      >
        {/* Row 1 */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-[14px] font-bold leading-tight tracking-tight text-slate-950 sm:text-[14.5px]">
              Acoustic Ear Training
            </h3>
            <p className="mt-1 text-[11px] font-medium leading-tight text-slate-900/80 sm:text-[11.5px]">
              Instant on-device chord recognition
            </p>
          </div>
          <span className="font-display text-[16px] font-extrabold tracking-tight text-slate-950 sm:text-[17px]">
            Free
          </span>
        </div>

        {/* Dashed divider */}
        <div className="my-3.5 border-t border-dashed border-slate-950/20 sm:my-4" />

        {/* Row 2 */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-[14px] font-bold leading-tight tracking-tight text-slate-950 sm:text-[14.5px]">
              Full Song Curriculum
            </h3>
            <p className="mt-1 text-[11px] font-medium leading-tight text-slate-900/80 sm:text-[11.5px]">
              5 interactive goals &amp; song puzzles
            </p>
          </div>
          <span className="font-display text-[16px] font-extrabold tracking-tight text-slate-950 sm:text-[17px]">
            Free
          </span>
        </div>

        {/* Download CTA Button */}
        <a
          href="https://apps.apple.com"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="mt-4 flex h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[#080d19] px-4 font-bold text-white shadow-lg transition-all duration-150 hover:bg-slate-900 active:scale-[0.98] sm:mt-5 sm:h-[50px]"
        >
          <AppStoreIcon className="size-5 shrink-0 text-[#5eb0fa]" />
          <span className="font-display text-[15px] font-bold tracking-tight text-[#5eb0fa] sm:text-[15.5px]">
            Download
          </span>
        </a>

        {/* Footer Note */}
        <p className="mt-3 text-center text-[10.5px] font-medium leading-tight text-slate-900/85 sm:mt-3.5 sm:text-[11px]">
          Free on iPhone &amp; iPad • Zero ads or tracking
        </p>
      </div>

      {/* Refined gentle Scalloped bottom edge */}
      <svg
        className="block -mt-px h-3.5 w-full fill-current text-[#1473e6] sm:h-4"
        viewBox="0 0 304 14"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="scallop-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1473e6" />
            <stop offset="100%" stopColor="#0c5fca" />
          </linearGradient>
        </defs>
        <path d={SCALLOP_PATH} fill="url(#scallop-gradient)" />
      </svg>
    </div>
  );
}

export function TopBar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobileTicketOpen, setIsMobileTicketOpen] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const mobileTicketRef = useRef<HTMLDivElement>(null);

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  // Close mobile ticket dropdown when clicking outside
  useEffect(() => {
    if (!isMobileTicketOpen) return;
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        mobileTicketRef.current &&
        !mobileTicketRef.current.contains(event.target as Node)
      ) {
        setIsMobileTicketOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobileTicketOpen]);

  // Promote modal <dialog> cleanly when drawer state opens.
  useEffect(() => {
    if (!isDrawerOpen) return;
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
      closeButtonRef.current?.focus({ preventScroll: true });
    }
  }, [isDrawerOpen]);

  const handleDrawerExitComplete = useCallback(() => {
    const dialog = dialogRef.current;
    if (!isDrawerOpen && dialog?.open) {
      dialog.close();
      menuButtonRef.current?.focus({ preventScroll: true });
    }
  }, [isDrawerOpen]);

  return (
    <>
      {/* avoid-ai-design-ignore: K3 */}
      <header className="sticky top-0 z-40 w-full border-b border-border-subtle/75 bg-surface-elevated/95 backdrop-blur-md">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-[10px] focus:bg-fg-regular focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>

        <div className="relative mx-auto flex max-w-360 items-center justify-between gap-3 px-3 py-2.5 sm:px-6 sm:py-3">
          <nav
            aria-label="Primary"
            className="flex w-full items-center justify-between gap-3"
          >
            {/* Left cluster: menu trigger, brand tile pill, and quick highlights pill */}
            <div className="flex min-w-0 items-center gap-2">
              <motion.button
                ref={menuButtonRef}
                type="button"
                onClick={openDrawer}
                aria-label="Open navigation menu"
                aria-expanded={isDrawerOpen}
                aria-controls={DRAWER_ID}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.12, ease: EASE_OUT }}
                className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] bg-surface-secondary text-fg-display transition-colors duration-150 hover:bg-divider/75 active:bg-divider"
              >
                <MenuBarsIcon className="size-4.5" />
              </motion.button>

              <Link
                href="/"
                aria-label="Chordisol home"
                className="inline-flex h-10 shrink-0 items-center gap-2.5 rounded-[10px] bg-surface-secondary pl-1.5 pr-3.5 text-fg-display transition-colors duration-150 hover:bg-divider/75 active:bg-divider"
              >
                <ChordisolAppIcon />
                <span className="font-display text-[17px] leading-none font-semibold tracking-tight text-fg-display">
                  Chordisol
                </span>
              </Link>

              <Link
                href="/#download"
                aria-label="App Store rating: 4.7 stars out of 5"
                className="hidden h-10 shrink-0 cursor-pointer items-center gap-2 rounded-[10px] bg-surface-secondary px-2.5 text-fg-display transition-colors duration-150 hover:bg-divider/75 active:bg-divider md:inline-flex"
              >
                <div
                  aria-hidden="true"
                  className="flex items-center gap-0.5"
                >
                  <StarFullIcon className="size-3.5 shrink-0" />
                  <StarFullIcon className="size-3.5 shrink-0" />
                  <StarFullIcon className="size-3.5 shrink-0" />
                  <StarFullIcon className="size-3.5 shrink-0" />
                  <StarHalfIcon className="size-3.5 shrink-0" />
                </div>
                <span className="font-sans text-xs font-bold tabular-nums text-fg-display">
                  4.7
                </span>
              </Link>
            </div>

            {/* Right cluster on mobile (<sm): compact button that opens ticket on tap */}
            <div ref={mobileTicketRef} className="relative sm:hidden">
              <button
                type="button"
                onClick={() => setIsMobileTicketOpen((prev) => !prev)}
                aria-expanded={isMobileTicketOpen}
                aria-haspopup="dialog"
                aria-label="Download Chordisol for iOS options"
                className="inline-flex h-10 shrink-0 cursor-pointer items-stretch rounded-[10px] bg-fg-regular text-white shadow-xs transition-colors duration-150 hover:bg-fg-regular/90 active:bg-fg-regular/85 select-none"
              >
                <span className="inline-flex items-center justify-center border-r border-white/15 px-2.5">
                  <AppleIcon className="size-4" />
                </span>
                <span className="inline-flex items-center px-3 text-xs font-semibold tracking-tight whitespace-nowrap">
                  Get on iOS
                </span>
              </button>

              <AnimatePresence>
                {isMobileTicketOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: EASE_OUT }}
                    className="absolute right-0 top-full mt-2 z-50 w-[min(296px,calc(100vw-24px))] drop-shadow-[0_18px_32px_rgba(15,23,42,0.25)]"
                  >
                    <TicketCardContent
                      isMobilePopup={true}
                      onClose={() => setIsMobileTicketOpen(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Spacer placeholder on desktop to reserve layout space in nav flex row */}
            <div
              className="hidden sm:block sm:h-10 sm:w-[292px] sm:shrink-0 md:w-[304px]"
              aria-hidden="true"
            />
          </nav>

          {/* Desktop & tablet ticket: permanently sticking to top of window, anchored at top: 0 */}
          <aside
            id="ios-download-ticket"
            aria-label="Chordisol iOS Download Receipt"
            className="pointer-events-auto absolute top-0 right-3 z-50 hidden w-[292px] select-none drop-shadow-[0_20px_35px_rgba(15,23,42,0.25)] sm:block sm:right-6 md:w-[304px]"
          >
            <TicketCardContent isMobilePopup={false} />
          </aside>
        </div>
      </header>

      {/* Modal slide-out navigation drawer using native <dialog> for modality & inert background */}
      <dialog
        ref={dialogRef}
        id={DRAWER_ID}
        aria-label="Chordisol navigation"
        onCancel={(event) => {
          event.preventDefault();
          closeDrawer();
        }}
        onClose={() => setIsDrawerOpen(false)}
        className="fixed inset-0 m-0 h-dvh max-h-none w-dvw max-w-none border-0 bg-transparent p-0 backdrop:bg-transparent"
      >
        <AnimatePresence onExitComplete={handleDrawerExitComplete}>
          {isDrawerOpen ? (
            <div className="fixed inset-0 flex">
              <div
                aria-hidden="true"
                onClick={closeDrawer}
                className="fixed inset-0 bg-transparent"
              />

              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.28, ease: EASE_DRAWER }}
                className="relative z-10 flex h-svh w-full max-w-[min(20.5rem,84dvw)] flex-col justify-between border-r border-border-subtle bg-surface-elevated py-5 shadow-[8px_0_30px_rgba(20,54,95,0.08)] sm:py-6"
              >
                <div className="flex flex-col gap-5 overflow-y-auto">
                  <div className="flex items-center justify-between gap-2 px-6 sm:px-7">
                    <Link
                      href="/"
                      onClick={closeDrawer}
                      aria-label="Chordisol home"
                      className="inline-flex h-10 items-center gap-2.5 rounded-[10px] bg-surface-secondary pl-1.5 pr-3.5 text-fg-display transition-colors duration-150 hover:bg-divider/75"
                    >
                      <ChordisolAppIcon />
                      <span className="font-display text-[17px] leading-none font-semibold tracking-tight text-fg-display">
                        Chordisol
                      </span>
                    </Link>

                    <button
                      ref={closeButtonRef}
                      type="button"
                      onClick={closeDrawer}
                      aria-label="Close navigation menu"
                      className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] bg-surface-secondary text-fg-display transition-colors duration-150 hover:bg-divider/75 active:bg-divider"
                    >
                      <CloseIcon className="size-4.5" />
                    </button>
                  </div>

                  <nav aria-label="Site sections">
                    <Suspense
                      fallback={
                        <DrawerLinksList
                          activePath={null}
                          onNavigate={closeDrawer}
                        />
                      }
                    >
                      <ActiveDrawerLinks onNavigate={closeDrawer} />
                    </Suspense>
                  </nav>
                </div>

                <footer className="mt-6 space-y-5 px-6 pt-2 sm:px-7">
                  <Link
                    href="/#download"
                    onClick={closeDrawer}
                    className="inline-flex h-11 w-full items-center justify-between gap-3 rounded-[10px] bg-surface-secondary px-4 text-sm font-semibold text-fg-display transition-colors duration-150 hover:bg-divider/75 active:bg-divider"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <AppleIcon className="size-4 shrink-0" />
                      <span>Get Chordisol for iOS</span>
                    </span>
                    <ChevronRightIcon className="size-3.5 shrink-0 text-text-muted" />
                  </Link>

                  <div className="flex items-center justify-center gap-7">
                    {SOCIAL_LINKS.map((social) => (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${social.ariaLabel} (opens in new tab)`}
                        onClick={closeDrawer}
                        className="inline-flex size-10 items-center justify-center rounded-xl transition-transform duration-150 hover:scale-105 active:scale-95"
                      >
                        <Image
                          src={social.iconSrc}
                          alt=""
                          width={24}
                          height={24}
                          unoptimized
                          aria-hidden="true"
                          className="size-6 rounded-[5px]"
                        />
                      </a>
                    ))}
                  </div>
                </footer>
              </motion.aside>
            </div>
          ) : null}
        </AnimatePresence>
      </dialog>
    </>
  );
}
