"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";

const SESSION_KEY = "chordisol_splash_seen";
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function SplashScreen() {
  const shouldReduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        const instantHide = setTimeout(() => setVisible(false), 0);
        return () => clearTimeout(instantHide);
      }
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // Ignore storage access errors in private contexts
    }

    const duration = shouldReduceMotion ? 220 : 950;
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [shouldReduceMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="chordisol-splash"
          aria-hidden="true"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: shouldReduceMotion ? 0.15 : 0.4,
              ease: EASE_OUT,
            },
          }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white pointer-events-none select-none"
        >
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.42, ease: EASE_OUT }}
            className="flex flex-col items-center gap-3.5"
          >
            <div className="relative size-16 overflow-hidden rounded-[18px] shadow-[0_14px_34px_-10px_rgba(20,54,95,0.22)]">
              <Image
                src="/images/chordisol-logo.png"
                alt="Chordisol"
                fill
                sizes="64px"
                className="object-cover"
                priority
              />
            </div>

            <motion.span
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.36, ease: EASE_OUT }}
              className="font-display text-2xl font-bold tracking-tight text-fg-display"
            >
              Chordisol
            </motion.span>

            {/* Subtle minimal progress hairline */}
            <div className="mt-1 h-[3px] w-14 overflow-hidden rounded-full bg-surface-secondary">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{
                  duration: shouldReduceMotion ? 0.15 : 0.75,
                  ease: EASE_OUT,
                }}
                className="h-full w-full rounded-full bg-brand-primary"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
