"use client";

import { useEffect, useRef, useState } from "react";

interface StickerProps {
  url: string;
  rotate?: string;
  className?: string;
}

export const SPRING_CONFIG = {
  type: "spring" as const,
  stiffness: 260,
  damping: 26,
};

// Global pointer store so all stickers share mouse / orientation updates
let pointer = {
  x: 0,
  y: 0,
  type: "mousemove" as "mousemove" | "deviceorientation",
  hasMoved: false,
};

let listenersAttached = false;
let baseX = 0;
let baseY = 0;

function setupPointerListeners() {
  if (typeof window === "undefined" || listenersAttached) return;
  listenersAttached = true;

  window.addEventListener("mousemove", (event: MouseEvent) => {
    pointer.type = "mousemove";
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.hasMoved = true;
  });

  window.addEventListener("deviceorientation", (event: DeviceOrientationEvent) => {
    const gamma = event.gamma ?? 0;
    const beta = event.beta ?? 0;
    if (baseX === 0 && baseY === 0) {
      baseX = gamma;
      baseY = beta;
    }
    pointer.type = "deviceorientation";
    pointer.x = (gamma - baseX) / 2;
    pointer.y = (beta - baseY) / 2;
    pointer.hasMoved = true;
  });
}

function cap(value: number, min = -15, max = 15) {
  return Math.min(Math.max(value, min), max);
}

function ease(target: number, prev: number, easing = 0.05) {
  const capped = cap(target);
  return prev + (capped - prev) * easing;
}

export function Sticker({ url, rotate, className = "" }: StickerProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setupPointerListeners();

    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(isReduced);
    if (isReduced) return;

    const el = elementRef.current;
    if (!el) return;

    let x = 0;
    let y = 0;
    let center: { x: number; y: number } | null = null;
    let animationFrameId: number;

    const updateCenter = () => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    };

    updateCenter();
    window.addEventListener("resize", updateCenter);
    window.addEventListener("scroll", updateCenter, { passive: true });

    function loop() {
      if (!el) return;

      if (pointer.type === "deviceorientation") {
        x = cap(pointer.x);
        y = cap(pointer.y);
      } else if (!pointer.hasMoved || !center) {
        x = -4;
        y = -12;
      } else {
        x = ease(-(center.x - pointer.x), x, 0.05);
        y = ease(center.y - pointer.y, y, 0.05);
      }

      let fromCenter = 0.5;
      if (center && pointer.hasMoved) {
        const distance = Math.hypot(center.x - pointer.x, center.y - pointer.y);
        fromCenter = Math.min(Math.max(distance / 400, 0.5), 0.8);
      }

      // Update CSS variables directly on DOM node for 60/120fps performance
      el.style.setProperty("--x", String(y));
      el.style.setProperty("--y", String(x));
      el.style.setProperty("--from-center", String(fromCenter));
      if (rotate) {
        el.style.setProperty("--rotate", rotate);
      }

      animationFrameId = requestAnimationFrame(loop);
    }

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", updateCenter);
      window.removeEventListener("scroll", updateCenter);
    };
  }, [rotate]);

  return (
    <div className={`pointer-events-none select-none ${className}`}>
      <div
        ref={elementRef}
        className="sticker relative"
        style={
          {
            "--x": "0",
            "--y": "0",
            "--from-center": "0.5",
            "--rotate": rotate || "0deg",
            "--mask-url": `url(${url})`,
          } as React.CSSProperties
        }
      >
        <img
          className="drop-shadow-lg"
          src={url}
          alt=""
          style={{ transform: rotate ? `rotate(${rotate})` : undefined }}
        />
        {!reducedMotion && (
          <div
            className="shine absolute inset-0"
            style={{ transform: rotate ? `rotate(${rotate})` : undefined }}
          />
        )}
      </div>
    </div>
  );
}
