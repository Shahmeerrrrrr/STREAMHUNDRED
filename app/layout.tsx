import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { PixelsBackground } from "@/components/PixelsBackground";
import { SpotifyButton } from "@/components/SpotifyButton";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StreamHundred • Top 100 most streamed songs",
  description:
    "Explore the world's top 100 most streamed songs of all time on Spotify with real-time ranking data and 30-second previews.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-teal-200">
        <div className="relative flex min-h-screen justify-center bg-slate-50">
          <PixelsBackground />

          {/* Blueprint Dotted Boundaries (XY Axis Zinc Lines) */}
          <div className="z-0 flex w-full max-w-5xl flex-col border-x border-dashed border-zinc-300 bg-slate-50/70 relative shadow-2xs">
            {/* Top Corner Crosshairs */}
            <span className="pointer-events-none absolute -top-2.5 -left-2 text-zinc-400 font-mono text-xs select-none z-20">+</span>
            <span className="pointer-events-none absolute -top-2.5 -right-2 text-zinc-400 font-mono text-xs select-none z-20">+</span>

            {/* Header bounded by bottom horizontal dotted line */}
            <header className="flex w-full items-center justify-between px-6 py-5 border-b border-dashed border-zinc-300 relative bg-white/40 backdrop-blur-xs">
              <h1 className="font-serif text-lg font-bold tracking-tight text-slate-900 md:text-xl">
                <Link href="/" tabIndex={-1}>
                  streamhundred
                </Link>
              </h1>
              <SpotifyButton />
            </header>

            {/* Main content */}
            <main className="flex w-full flex-col items-center">
              {children}
            </main>

            {/* Bottom Corner Crosshairs */}
            <span className="pointer-events-none absolute -bottom-2.5 -left-2 text-zinc-400 font-mono text-xs select-none z-20">+</span>
            <span className="pointer-events-none absolute -bottom-2.5 -right-2 text-zinc-400 font-mono text-xs select-none z-20">+</span>

            {/* Footer bounded by top horizontal dotted line */}
            <footer className="mt-auto flex flex-col items-center gap-1 text-center text-xs text-slate-500 py-8 px-6 border-t border-dashed border-zinc-300 relative bg-white/30">
              <p>
                Stream counts via{" "}
                <a
                  href="https://kworb.net/spotify/songs.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-slate-700 underline hover:text-slate-900"
                >
                  kworb
                </a>{" "}
                · Previews &amp; artwork via{" "}
                <a
                  href="https://www.apple.com/itunes/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-slate-700 underline hover:text-slate-900"
                >
                  iTunes
                </a>
              </p>
              {/* <p>
                Inspired by{" "}
                <a
                  href="https://githundred.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-slate-700 underline hover:text-slate-900"
                >
                  GitHundred
                </a>{" "}
                by Colin Lienard
              </p> */}
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
