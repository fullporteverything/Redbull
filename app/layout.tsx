import type { Metadata, Viewport } from "next";
import { archivo, inter, newsreader } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Red Bull — Gives you wings. (Concept)",
  description:
    "An independent concept site for an energy drink: the formula, four editions, what's inside, the story and a small shop.",
};

export const viewport: Viewport = {
  themeColor: "#eceae4",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${newsreader.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
