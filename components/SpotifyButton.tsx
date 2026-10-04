'use client';

import React, { useState } from 'react';
import { type Colors, Liquid } from '@/components/ui/liquid-gradient';

const COLORS: Colors = {
  color1: '#FFFFFF',
  color2: '#1E10C5',
  color3: '#9089E2',
  color4: '#FCFCFE',
  color5: '#F9F9FD',
  color6: '#B2B8E7',
  color7: '#0E2DCB',
  color8: '#0017E9',
  color9: '#4743EF',
  color10: '#7D7BF4',
  color11: '#0B06FC',
  color12: '#C5C1EA',
  color13: '#1403DE',
  color14: '#B6BAF6',
  color15: '#C1BEEB',
  color16: '#290ECB',
  color17: '#3F4CC0',
};

interface SpotifyButtonProps {
  className?: string;
}

export const SpotifyButton: React.FC<SpotifyButtonProps> = ({ className }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex items-center justify-center">
      <a
        href="https://open.spotify.com"
        target="_blank"
        rel="noreferrer noopener"
        className={`relative inline-flex items-center justify-center w-28 h-9 group rounded-lg select-none cursor-pointer ${className || ''}`}
        aria-label="Open Spotify"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* --- DEFAULT BASE STATE (Original site UI/UX: clean, light .box style) --- */}
        <div className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50/90 px-3 shadow-2xs transition-all duration-200 group-hover:border-transparent">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4 shrink-0 text-slate-700 transition-colors"
            aria-hidden="true"
          >
            <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm5.515 17.323c-.214.334-.675.44-1.01.224-2.766-1.689-6.25-2.071-10.35-1.134-.395.09-.79-.154-.88-.549-.09-.395.154-.79.549-.88 4.485-1.026 8.335-.585 11.44 1.31.334.214.44.675.251 1.029zm1.47-3.27c-.269.434-.84.57-1.275.3-3.164-1.945-7.987-2.508-11.733-1.373-.458.139-.943-.118-1.082-.576-.138-.458.119-.944.577-1.082 4.28-1.3 9.598-.67 13.238 1.566.433.267.57.839.275 1.165zm.127-3.404c-3.796-2.254-10.062-2.462-13.685-1.362-.552.167-1.135-.144-1.303-.696-.167-.552.144-1.135.696-1.303 4.163-1.265 11.088-1.02 15.456 1.572.495.294.657.934.363 1.428-.293.493-.932.656-1.527.361z" />
          </svg>
          <span className="text-xs font-semibold text-slate-700">Spotify</span>
        </div>

        {/* --- HOVER ANIMATION STATE: Displays liquid gradient animation ONLY when hovered --- */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Outer Liquid Halo Glow */}
          <div className="absolute w-[115%] h-[135%] top-[8%] left-1/2 -translate-x-1/2 filter blur-[14px] opacity-75">
            <span className="absolute inset-0 rounded-lg bg-[#d9d9d9] filter blur-[6px]"></span>
            <div className="relative w-full h-full overflow-hidden rounded-lg">
              {isHovered && <Liquid isHovered={true} colors={COLORS} />}
            </div>
          </div>

          {/* Dark Ambient Backplate */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[92%] h-[112%] rounded-lg bg-[#010128] filter blur-[7px]"></div>

          {/* Inner Mask with Liquid Gradient */}
          <div className="relative w-full h-full overflow-hidden rounded-lg border border-slate-700/60 shadow-md">
            <span className="absolute inset-0 rounded-lg bg-[#d9d9d9]"></span>
            <span className="absolute inset-0 rounded-lg bg-black"></span>
            {isHovered && <Liquid isHovered={true} colors={COLORS} />}
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={`spark-${i}`}
                className={`absolute inset-0 rounded-lg border-solid border-[2px] border-gradient-to-b from-transparent to-white mix-blend-overlay filter ${
                  i <= 2 ? 'blur-[2px]' : i === 3 ? 'blur-[4px]' : 'blur-xs'
                }`}
              ></span>
            ))}
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[70%] h-[42%] rounded-lg filter blur-[15px] bg-[#006]"></span>

            {/* Glowing Spotify Icon + Text */}
            <span className="absolute inset-0 flex items-center justify-center px-2.5 gap-1.5 rounded-lg text-emerald-300 text-xs font-semibold tracking-wide whitespace-nowrap z-10 drop-shadow-xs">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="inline-block fill-emerald-300 w-3.5 h-3.5 shrink-0"
                aria-hidden="true"
              >
                <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm5.515 17.323c-.214.334-.675.44-1.01.224-2.766-1.689-6.25-2.071-10.35-1.134-.395.09-.79-.154-.88-.549-.09-.395.154-.79.549-.88 4.485-1.026 8.335-.585 11.44 1.31.334.214.44.675.251 1.029zm1.47-3.27c-.269.434-.84.57-1.275.3-3.164-1.945-7.987-2.508-11.733-1.373-.458.139-.943-.118-1.082-.576-.138-.458.119-.944.577-1.082 4.28-1.3 9.598-.67 13.238 1.566.433.267.57.839.275 1.165zm.127-3.404c-3.796-2.254-10.062-2.462-13.685-1.362-.552.167-1.135-.144-1.303-.696-.167-.552.144-1.135.696-1.303 4.163-1.265 11.088-1.02 15.456 1.572.495.294.657.934.363 1.428-.293.493-.932.656-1.527.361z" />
              </svg>
              Spotify
            </span>
          </div>
        </div>
      </a>
    </div>
  );
};

export default SpotifyButton;
