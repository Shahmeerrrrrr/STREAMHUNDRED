"use client";

import { useEffect, useState } from "react";

type Pixel = {
  id: string;
  x: number;
  y: number;
  color: string;
};

const COLORS = ["#cbd5e1", "#cbd5e1", "#99f6e4", "#2dd4bf"];

function createRandomPixel(windowWidth: number, windowHeight: number): Pixel {
  const x = Math.floor((Math.random() * windowWidth) / 8) * 8;
  const y = Math.floor((Math.random() * (windowHeight / 3)) / 8) * 8;
  const color = COLORS[Math.floor(Math.random() * COLORS.length)] ?? COLORS[0];
  return {
    id: Math.random().toString(36).substring(2, 9),
    x,
    y,
    color,
  };
}

export function PixelsBackground() {
  const [pixels, setPixels] = useState<Pixel[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const length = Math.round(window.innerWidth / 40);
    const initial = Array.from({ length }, () =>
      createRandomPixel(window.innerWidth, window.innerHeight)
    );
    setPixels(initial);

    const intervalId = setInterval(() => {
      setPixels((prev) => {
        const next = [...prev.slice(1)];
        next.push(createRandomPixel(window.innerWidth, window.innerHeight));
        return next;
      });
    }, 120);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[50vh] overflow-hidden select-none">
      <div className="tileset absolute inset-0 opacity-50" />
      {pixels.map(({ id, x, y, color }) => (
        <div
          key={id}
          className="absolute h-1 w-1 transition-opacity duration-1000"
          style={{ top: `${y}px`, left: `${x}px`, backgroundColor: color }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50" />
    </div>
  );
}
