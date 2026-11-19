"use client";

import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from "react";
import type { AnimationItem } from "lottie-web";

const ANIMATION_MAP: Record<string, string> = {
  "trust-your-ear": "/animations/Trust_Your_Ear.json",
  "trust_your_ear": "/animations/Trust_Your_Ear.json",
  "Trust_Your_Ear": "/animations/Trust_Your_Ear.json",
};

export interface LottieComponentProps extends HTMLAttributes<HTMLDivElement> {
  id?: string;
  src?: string;
  width?: number | string;
  height?: number | string;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

export function LottieComponent({
  id,
  src,
  width,
  height,
  loop = true,
  autoplay = true,
  speed = 1,
  className,
  style,
  "aria-label": ariaLabel,
  ...rest
}: LottieComponentProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<AnimationItem | null>(null);

  const animationPath =
    src ??
    (id
      ? ANIMATION_MAP[id] ??
        (id.startsWith("/") || id.endsWith(".json")
          ? id
          : `/animations/${id}.json`)
      : undefined);

  useEffect(() => {
    let isMounted = true;
    if (!animationPath) return;

    import("lottie-web").then((lottieModule) => {
      if (!isMounted || !containerRef.current) return;
      const lottie = lottieModule.default || lottieModule;

      if (animRef.current) {
        animRef.current.destroy();
      }

      const anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop,
        autoplay,
        path: animationPath,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid meet",
        },
      });

      if (speed !== 1) {
        anim.setSpeed(speed);
      }

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
  }, [animationPath, loop, autoplay, speed]);

  const combinedStyle: CSSProperties = {
    ...(width !== undefined ? { width: typeof width === "number" ? `${width}px` : width } : {}),
    ...(height !== undefined ? { height: typeof height === "number" ? `${height}px` : height } : {}),
    ...style,
  };

  return (
    <div
      ref={containerRef}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel ? true : undefined}
      className={className}
      style={combinedStyle}
      {...rest}
    />
  );
}
