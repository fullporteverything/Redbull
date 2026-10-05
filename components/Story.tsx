"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CHAPTERS } from "@/lib/data";

export default function Story() {
  const root = useRef<HTMLElement>(null);
  const frames = useRef<(HTMLElement | null)[]>([]);
  const [i, setI] = useState(0);

  useEffect(() => {
    const el = root.current!;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (s) => {
        const n = CHAPTERS.length;
        const f = s.progress * n;
        const idx = Math.min(n - 1, Math.floor(f));
        setI(idx);
        const local = Math.min(1, Math.max(0, f - idx));
        // slow photo drift inside its frame
        frames.current.forEach((fr, k) => fr?.style.setProperty("--pan", k === idx ? String(local) : k < idx ? "1" : "0"));
      },
    });
    return () => st.kill();
  }, []);

  const state = (k: number) => (k === i ? "is-active" : k < i ? "is-past" : "");

  return (
    <section ref={root} id="story" className="story relative" style={{ height: "440vh" }}>
      <div className="story__pin sticky top-0 h-[100svh] overflow-hidden">
        <p className="eyebrow story__eyebrow text-[var(--ink-2)]">
          <b className="text-[var(--ink)]">04</b>
          <i />
          The story
        </p>

        <div className="story__copy grid">
          {CHAPTERS.map((c, k) => (
            <article key={c.year} className={`chapter ${state(k)}`} aria-hidden={k !== i}>
              <p className="chapter__year tabular-nums">
                <span>Chapter 0{k + 1}</span>
                <i />
                <span>{c.year}</span>
              </p>
              <h3 className="chapter__title t-serif">
                <span className="mask-line">
                  <span>
                    {c.title}
                    <span className="text-[var(--red)]">.</span>
                  </span>
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
                <span>{c.caption}</span>
                <span>{c.year}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <ol className="story__years" aria-hidden>
          {CHAPTERS.map((c, k) => (
            <li key={c.year} className={k === i ? "is-active" : ""}>
              {c.year}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
