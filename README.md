# StreamHundred 🎵

> Real-time, editorial tracking for the **Top 100 Most Streamed Songs of All Time on Spotify**.

🌐 **Live Website**: [https://streamhundred.vercel.app](https://streamhundred.vercel.app)

![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)
![React 19](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)
![TailwindCSS 4](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat&logo=tailwindcss)
![Motion](https://img.shields.io/badge/Motion-14-EA4C89?style=flat)

---

## Features

- **Live Kworb Scraper & Auto Fallbacks**: Scrapes live Spotify streaming milestones on-demand, with automatic failover to Wikipedia and pre-committed backup caches.
- **100% Free Enrichment**: High-resolution 600×600 album artwork, 30-second audio previews, genres, and release years powered entirely by Apple's public iTunes Search API (no API keys or subscriptions needed).
- **Interactive 3D Highlights**: Mouse-tracking 3D physics cards with dynamic specular glare and theme-matched modals.
- **NumberTicker Counters**: Smooth digit rolling on cards and popups via `@number-flow/react`.
- **Integrated Audio Player**: Instant 30-second audio previews with animated soundwave equalizer bars.
- **Vintage Coordinate Frame & Custom Cursor**: Custom brand styling, XY axis coordinate frame, and interactive liquid gradient buttons.

---

## Master Architecture Guide

For an in-depth breakdown of the system architecture, component tree, scraper pipeline, and gotchas, see:
📖 **[AI.md — System Architecture & AI Context Guide](./AI.md)**

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Update offline data cache
node scripts/update-data.mjs

# Build for production
npm run build
```

---

## Deployment

Deploy directly to Vercel:

```bash
npx vercel --prod
```
