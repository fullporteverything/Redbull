"use client";

import { useEffect, useRef } from "react";
import { PUBLICATIONS, QUOTES } from "@/lib/data";
import { useLenis } from "./SmoothScroll";

const ROW_B = ["The Altitude Review", "Longform", "Sunday Gazette", "Field & Sky", "Night Shift", "Paddock"];

function Row({ items, outline, trackRef }: { items: string[]; outline?: boolean; trackRef: (n: HTMLDivElement | null) => void }) {
  const seq = [...items, ...items, ...items];
  return (
    <div className={`marquee ${outline ? "marquee--outline" : ""}`} aria-hidden>
      <div ref={trackRef} className="marquee__track">
        {seq.map((t, k) => (
          <span key={k} className="marquee__item">
            {t}
            <i />
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Press() {
  const tracks = useRef<(HTMLDivElement | null)[]>([]);
  const band = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  /* rAF-driven marquee: ~120 px/s base, opposite directions, boosted by scroll velocity */
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const x = [0, 0];
    const dir = [-1, 1];
    let boost = 0;
    let visible = false;
    let raf = 0;
    let last = performance.now();
    const widths = [0, 0];
    const measure = () => tracks.current.forEach((t, k) => (widths[k] = t ? t.scrollWidth / 3 : 0));
    measure();
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "200px" });
    if (band.current) io.observe(band.current);
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible && !reduced) {
        const v = Math.abs(lenisRef.current?.velocity ?? 0);
        boost += (Math.min(600, v * 18) - boost) * 0.08;
        tracks.current.forEach((t, k) => {
          if (!t || !widths[k]) return;
          x[k] += dir[k] * (120 + boost) * dt;
          if (x[k] <= -widths[k]) x[k] += widths[k];
          if (x[k] > 0) x[k] -= widths[k];
          t.style.transform = `translate3d(${x[k].toFixed(2)}px,0,0)`;
        });
      }
      raf = requestAnimationFrame(loop);
    };
    x[1] = -(widths[1] || 0) * 0.5;
    raf = requestAnimationFrame(loop);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section id="press" className="press">
      <div className="press__inner">
        <p className="eyebrow reveal text-white/60">
          <b className="text-white">05</b>
          <i />
          Press
        </p>
        <h2 className="press__title reveal">
          Widely noticed<i className="sq-dot" aria-hidden />
          <span className="sr-only">.</span>
        </h2>
        <div className="press__quotes">
          {QUOTES.map((q, k) => (
            <blockquote key={q.source} className="quote reveal" style={{ transitionDelay: `${k * 90}ms` }}>
              <p>“{q.text}”</p>
              <cite>{q.source}</cite>
            </blockquote>
          ))}
        </div>
      </div>
      <div ref={band} className="press__marquees">
        <Row items={PUBLICATIONS} trackRef={(n) => (tracks.current[0] = n)} />
        <Row items={ROW_B} outline trackRef={(n) => (tracks.current[1] = n)} />
      </div>
      <ul className="sr-only">
        {PUBLICATIONS.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </section>
  );
}
