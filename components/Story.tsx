"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CHAPTERS } from "@/lib/data";

export default function Story() {
  const root = useRef<HTMLElement>(null);
  const frames = useRef<(HTMLElement | null)[]>([]);
  const [i, setI] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const el = root.current!;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onToggle: (s) => setPinned(s.isActive),
      onUpdate: (s) => {
        const n = CHAPTERS.length;
        const f = s.progress * n;
        const idx = Math.min(n - 1, Math.floor(f));
        setI(idx);
        const local = Math.min(1, Math.max(0, f - idx));
        frames.current.forEach((fr, k) => fr?.style.setProperty("--local", k === idx ? local.toFixed(3) : k < idx ? "1" : "0"));
      },
    });
    return () => st.kill();
  }, []);

  const state = (k: number) => (k === i ? "is-active" : k < i ? "is-past" : "");

  return (
    <section ref={root} id="story" className="story relative" style={{ height: `${CHAPTERS.length * 80}vh` }}>
      <div className="story__pin sticky top-0 h-[100svh] overflow-hidden">
        <div className="story__copy grid">
          {CHAPTERS.map((c, k) => (
            <article key={c.year} className={`chapter ${state(k)}`} aria-hidden={k !== i}>
              <p className="chapter__label">
                <span>Chapter 0{k + 1}</span>
                <b className="tabular-nums">{c.year}</b>
              </p>
              <h3 className="chapter__title t-serif">
                <span className="mask-line">
                  <span>{c.title}</span>
                </span>
              </h3>
              <p className="chapter__body">{c.body}</p>
            </article>
          ))}
        </div>

        <div className="story__media">
          {CHAPTERS.map((c, k) => (
            <figure
              key={c.year}
              ref={(n) => {
                frames.current[k] = n;
              }}
              className={`frame ${state(k)}`}
            >
              <div className="frame__img">
                <img src={c.img} alt={c.alt} loading="lazy" draggable={false} />
              </div>
              <figcaption>
                <i />
                <span className="frame__cap">
                  Fig. 0{k + 1} — {c.place}, <em>{c.year}</em>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <ol className={`story__index ${pinned ? "is-on" : ""}`} aria-label="Chapters">
          {CHAPTERS.map((c, k) => (
            <li key={c.year} className={k === i ? "is-active" : ""} style={{ transitionDelay: `${k * 40}ms` }}>
              {c.year}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
