import localFont from "next/font/local";

export const archivo = localFont({
  src: [{ path: "../app/fonts/archivo.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-archivo",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

export const newsreader = localFont({
  src: [
    { path: "../app/fonts/newsreader.woff2", weight: "200 800", style: "normal" },
    { path: "../app/fonts/newsreader-italic.woff2", weight: "200 800", style: "italic" },
  ],
  variable: "--font-newsreader",
  display: "swap",
});

export const inter = localFont({
  src: [{ path: "../app/fonts/inter.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-inter",
  display: "swap",
});
