"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LenisCtx = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisCtx);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const tick = useRef<((t: number) => void) | null>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const l = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95 });
    l.on("scroll", ScrollTrigger.update);
    tick.current = (t: number) => l.raf(t * 1000);
    gsap.ticker.add(tick.current);
    gsap.ticker.lagSmoothing(0);
    setLenis(l);
    return () => {
      if (tick.current) gsap.ticker.remove(tick.current);
      l.destroy();
    };
  }, []);

  return <LenisCtx.Provider value={lenis}>{children}</LenisCtx.Provider>;
}

export function scrollToTarget(lenis: Lenis | null, target: string | number) {
  const y =
    typeof target === "number"
      ? target
      : (() => {
          const el = document.querySelector(target) as HTMLElement | null;
          return el ? el.getBoundingClientRect().top + window.scrollY : 0;
        })();
  if (lenis) lenis.scrollTo(y, { duration: 1.6 });
  else window.scrollTo({ top: y, behavior: "smooth" });
}
