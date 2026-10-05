"use client";

import { useEffect, useRef, useState } from "react";

/** Info pills: centre position (% of viewport), dark/light variant, entry order. */
const PILLS: { label: string; x: number; y: number; dark: boolean; o: number }[] = [
  { label: "80 mg caffeine", x: 18.5, y: 23, dark: true, o: 0 },
  { label: "Fuschl am See, Austria", x: 82.3, y: 19.7, dark: false, o: 1 },
  { label: "Taurine 1,000 mg", x: 83.7, y: 45.5, dark: true, o: 2 },
  { label: "Since 1987", x: 12.7, y: 47.2, dark: false, o: 3 },
  { label: "Alpine water", x: 74.1, y: 77.3, dark: true, o: 4 },
  { label: "250 ml", x: 14.8, y: 73.3, dark: false, o: 5 },
  { label: "Gives you wings", x: 44.6, y: 13.5, dark: true, o: 6 },
];

/** Non-linear "real loading" progress: stalls and jumps. */
const STEPS: [number, number][] = [
  [0, 0],
  [260, 31],
  [520, 58],
  [900, 59],
  [1250, 98],
  [1500, 100],
];

export default function Loader({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<"in" | "out" | "gone">("in");
  const done = useRef(false);

  useEffect(() => {
    document.documentElement.classList.add("is-loading");
    window.scrollTo(0, 0);
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    let fontsReady = false;
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => (fontsReady = true));
    const fallback = setTimeout(() => (fontsReady = true), 3500);
    let raf = 0;
    const loop = () => {
      const t = (performance.now() - t0) * (reduced ? 6 : 1);
      let v = 0;
      for (const [ms, val] of STEPS) if (t >= ms) v = val;
      if (!fontsReady && v > 98) v = 98;
      setCount(v);
      if (v >= 100 && !done.current) {
        done.current = true;
        setTimeout(() => {
          setPhase("out");
          document.documentElement.classList.remove("is-loading");
          onDone();
          setTimeout(() => setPhase("gone"), 700);
        }, reduced ? 50 : 380);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, [onDone]);

  if (phase === "gone") return null;
  const out = phase === "out";

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[100] bg-[var(--paper)]"
      style={{ opacity: out ? 0 : 1, transition: "opacity .35s ease .12s", pointerEvents: out ? "none" : "auto" }}
    >
      {/* centre lockup: typographic wordmark + original sun/horizon mark (not the trademark logo) */}
      <div
        className="absolute left-1/2 top-[50%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
        style={{ opacity: out ? 0 : 1, filter: out ? "blur(4px)" : "none", transition: "opacity .3s ease, filter .3s ease" }}
      >
        <span
          className="loader-rise"
          style={{
            font: "800 46px/1 var(--font-display)",
            fontStretch: "78%",
            letterSpacing: "-0.005em",
            color: "#c8102e",
          }}
        >
          Red Bull<sup className="ml-[2px] align-super text-[9px] font-semibold">®</sup>
        </span>
        <svg className="loader-rise mt-[7px]" style={{ animationDelay: ".15s" }} width="76" height="24" viewBox="0 0 76 24" aria-hidden>
          <defs>
            <radialGradient id="ldsun" cx="42%" cy="38%" r="65%">
              <stop offset="0" stopColor="#ffd83d" />
              <stop offset="1" stopColor="#e9b100" />
            </radialGradient>
          </defs>
          <circle cx="38" cy="12" r="11" fill="url(#ldsun)" />
          <path d="M0 15.5H76" stroke="#c8102e" strokeWidth="1.2" />
          <path d="M8 19.5H68" stroke="#c8102e" strokeWidth=".8" opacity=".55" />
        </svg>
        <span
          className="loader-rise mt-[9px]"
          style={{ animationDelay: ".25s", font: "400 11px/1 var(--font-display)", letterSpacing: ".1em", color: "#8a6d74" }}
        >
          ENERGY DRINK
        </span>
      </div>

      {PILLS.map((p) => (
        <span
          key={p.label}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          <span
            className="pill"
            data-dark={p.dark || undefined}
            style={
              {
                "--d": `${p.o * 130}ms`,
                "--o": p.o,
                opacity: out ? 0 : undefined,
                filter: out ? "blur(3px)" : undefined,
                transition: out ? `opacity .28s ease ${p.o * 45}ms, filter .28s ease ${p.o * 45}ms` : undefined,
              } as React.CSSProperties
            }
          >
            {p.label}
          </span>
        </span>
      ))}

      <span
        className="absolute bottom-[34px] left-[var(--gx)] tabular-nums"
        style={{ font: "500 9.5px/1 var(--font-sans)", letterSpacing: ".2em", color: "#9a9ca3" }}
      >
        {String(count).padStart(3, "0")}
      </span>
    </div>
  );
}
