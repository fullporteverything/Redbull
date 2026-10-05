"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EDITIONS } from "@/lib/data";

/** Pinned edition cycler: 01 Energy Drink → 02 Red → 03 Blue → 04 Yellow. */
export default function Editions() {
  const root = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  const cans = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const el = root.current!;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (s) => {
        const n = EDITIONS.length;
        const f = s.progress * n;
        const idx = Math.min(n - 1, Math.floor(f));
        setI(idx);
        // gentle vertical drift of the active can within its step (parallax)
        const local = Math.min(1, Math.max(0, f - idx));
        cans.current.forEach((c, k) => c?.style.setProperty("--drift", k === idx ? String((0.5 - local) * 2) : "0"));
      },
    });
    return () => st.kill();
  }, []);

  const e = EDITIONS[i];

  return (
    <section ref={root} id="editions" className="editions relative" style={{ height: "440vh" }}>
      <div className="editions__pin sticky top-0 h-[100svh] overflow-hidden">
        <header className="editions__head">
          <p className="eyebrow text-[var(--ink-2)]">
            <b className="text-[var(--ink)]">02</b>
            <i />
            Four editions
          </p>
          <h2 className="editions__title t-serif">
            Four editions<span className="text-[var(--red)]">.</span>
          </h2>
        </header>

        <p className="editions__index tabular-nums" aria-hidden>
          {i + 1} / {EDITIONS.length}
        </p>

        {/* left: copy panels stacked, active one visible */}
        <div className="editions__copy">
          <div className="ed-code" aria-hidden>
            <span>Red Bull</span>
            <span className="ed-code__roll">
              <span style={{ transform: `translateY(${-i}em)` }}>
                {EDITIONS.map((ed) => (
                  <span key={ed.key}>.{ed.code.split(".")[1]}</span>
                ))}
              </span>
            </span>
          </div>
          <div className="grid">
            {EDITIONS.map((ed, k) => (
              <article key={ed.key} className={`ed-panel ${k === i ? "is-active" : ""}`} aria-hidden={k !== i}>
                <h3 className="ed-panel__name t-serif">
                  {ed.name}
                  <span style={{ color: ed.dot }}>.</span>
                </h3>
                <p className="ed-panel__flavor">{ed.flavor}</p>
                <p className="ed-panel__desc">{ed.desc}</p>
                <dl className="ed-stats">
                  {ed.stats.map(([v, u, l]) => (
                    <div key={l}>
                      <dt>
                        {v}
                        <small>{u}</small>
                      </dt>
                      <dd>{l}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </div>

        {/* middle column labels */}
        <div className="ed-meta">
          <div className="ed-meta__top">
            <span className="ed-meta__label grid">
              {EDITIONS.map((ed, k) => (
                <span key={ed.key} className={k === i ? "is-active" : ""}>
                  {ed.colLabel}
                </span>
              ))}
            </span>
          </div>
          <div className="ed-meta__bottom">
            <span className="ed-meta__label">Size</span>
            <span className="ed-meta__size">
              250 <small>ml</small>
            </span>
          </div>
        </div>

        {/* right: product */}
        <div className="ed-stage">
          <span className="ed-glow" style={{ background: e.tint }} />
          {EDITIONS.map((ed, k) => (
            <div
              key={ed.key}
              ref={(n) => {
                cans.current[k] = n;
              }}
              className={`ed-can ${k === i ? "is-active" : k < i ? "is-prev" : "is-next"}`}
            >
              <img src={ed.img} alt={k === i ? `${ed.name} can` : ""} draggable={false} loading={k === 0 ? "eager" : "lazy"} />
              <span className="ed-can__shadow" />
            </div>
          ))}
        </div>

        <ol className="ed-ticks" aria-hidden>
          {EDITIONS.map((ed, k) => (
            <li key={ed.key} className={k === i ? "is-active" : ""}>
              0{k + 1}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
