"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EDITIONS } from "@/lib/data";

/* edition 04 arrives late and the section releases soon after */
const STEPS = [0, 0.3, 0.62, 0.9];
const stepOf = (p: number) => (p < STEPS[1] ? 0 : p < STEPS[2] ? 1 : p < STEPS[3] ? 2 : 3);

/** Rolling text: every change re-keys the item so old rolls up/out and new rises in. */
function Roll({ value, k, className }: { value: string; k: number; className?: string }) {
  const [items, setItems] = useState<{ v: string; key: number; out?: boolean }[]>([{ v: value, key: k }]);
  const last = useRef(k);
  useEffect(() => {
    if (k === last.current) return;
    last.current = k;
    setItems((cur) => [...cur.slice(-1).map((c) => ({ ...c, out: true })), { v: value, key: k }]);
    const t = setTimeout(() => setItems((cur) => cur.filter((c) => !c.out)), 420);
    return () => clearTimeout(t);
  }, [k, value]);
  return (
    <span className={`roll ${className ?? ""}`}>
      {items.map((it) => (
        <span key={it.key} className={`roll__item ${it.out ? "is-out" : "is-in"}`}>
          {it.v}
        </span>
      ))}
    </span>
  );
}

export default function Editions() {
  const root = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  const cans = useRef<(HTMLDivElement | null)[]>([]);
  const ticks = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const el = root.current!;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (s) => {
        const p = s.progress;
        const idx = stepOf(p);
        setI(idx);
        const a = STEPS[idx],
          b = idx < 3 ? STEPS[idx + 1] : 1;
        const local = Math.min(1, Math.max(0, (p - a) / (b - a)));
        cans.current.forEach((c, k) => c?.style.setProperty("--lift", k === idx ? `${(-12 * local).toFixed(1)}px` : "0px"));
        // ticks follow continuous progress
        const f = idx + local;
        ticks.current.forEach((t, j) => {
          if (t) t.style.opacity = String(0.25 + 0.75 * Math.max(0, Math.min(1, 1 - Math.abs(f - (j + 0.5)))));
        });
      },
    });
    return () => st.kill();
  }, []);

  const e = EDITIONS[i];

  return (
    <section ref={root} id="editions" className="editions relative" style={{ height: "340vh" }}>
      <div className="editions__pin sticky top-0 h-[100svh] overflow-hidden">
        <p className="ed-eyebrow">
          <b>02</b>
          <span className="ed-eyebrow__sep">/</span>
          Four editions
        </p>
        <p className="ed-count tabular-nums" aria-hidden>
          <Roll value={String(i + 1)} k={i} />
          <span className="ed-count__sep">/</span>4
        </p>
        <h2 className="ed-h2 t-serif">
          Four editions<i className="sq-dot" aria-hidden />
          <span className="sr-only">.</span>
        </h2>

        <div className="ed-codeRow">
          <span className="ed-code">
            Red Bull<Roll value={`.${e.code.split(".")[1]}`} k={i} />
          </span>
          <span className="ed-kind">
            <Roll value={e.colLabel} k={i} />
          </span>
        </div>

        <div className="ed-copy grid">
          {EDITIONS.map((ed, k) => (
            <article
              key={ed.key}
              className={`ed-panel ${k === i ? "is-active" : k < i ? "is-past" : ""}`}
              aria-hidden={k !== i}
              style={{ "--dot": ed.dot } as React.CSSProperties}
            >
              <h3 className="ed-panel__name t-serif">
                {ed.name}
                <i className="sq-dot sq-dot--ed" aria-hidden />
                <span className="sr-only">.</span>
              </h3>
              <p className="ed-panel__flavor">{ed.flavor}</p>
              <p className="ed-panel__desc">{ed.desc}</p>
              <dl className="ed-specs">
                {ed.stats.slice(0, 4).map(([v, u, l], r) => (
                  <div key={l} className={r === 0 ? "is-lead" : ""}>
                    <dt>
                      {v}
                      <small>{u}</small>
                    </dt>
                    <dd>{l}</dd>
                    {r === 0 ? <span className="ed-specs__tag">Lead</span> : <span />}
                  </div>
                ))}
              </dl>
              <div className="ed-specs__foot">
                <span>Can size</span>
                <b>
                  250<small>ml</small>
                </b>
              </div>
            </article>
          ))}
        </div>

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

        <ol className="ed-ticks tabular-nums" aria-hidden>
          {EDITIONS.map((ed, k) => (
            <li
              key={ed.key}
              ref={(n) => {
                ticks.current[k] = n;
              }}
            >
              0{k + 1}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
