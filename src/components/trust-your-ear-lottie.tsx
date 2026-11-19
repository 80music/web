"use client";

import { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";

interface TrustYourEarLottieProps {
  className?: string;
}

export function TrustYourEarLottie({ className }: TrustYourEarLottieProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Load lottie-web on the client
    import("lottie-web").then((lottieModule) => {
      if (!isMounted || !containerRef.current) return;
      const lottie = lottieModule.default || lottieModule;

      if (animRef.current) {
        animRef.current.destroy();
      }

      const anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: "/animations/Trust_Your_Ear.json",
        rendererSettings: {
          preserveAspectRatio: "xMidYMid meet",
        },
      });

      // Respect prefers-reduced-motion
      if (typeof window !== "undefined") {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (mediaQuery.matches) {
          anim.goToAndStop(0, true);
        }
      }

      animRef.current = anim;
    });

    return () => {
      isMounted = false;
      animRef.current?.destroy();
      animRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={className}
    />
  );
}
