"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const STATS = [
  { to: 177, unit: "", label: "Countries", body: "From a lakeside office in Austria to almost everywhere with a fridge." },
  { to: 12, unit: "bn", label: "Cans a year", body: "Give or take, every year, in every kind of weather." },
  { to: 1987, unit: "", label: "First can", plain: true, body: "The recipe has barely moved since." },
  { to: 250, unit: "ml", label: "The original", body: "Seasonal editions come and go. The original stays." },
];

export default function Reach() {
  const nums = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: "#reach .reach__stats",
      start: "top 80%",
      once: true,
      onEnter: () => {
        STATS.forEach((s, k) => {
          const el = nums.current[k];
          if (!el) return;
          const from = s.plain ? s.to - 60 : 0;
          const t0 = performance.now();
          const dur = 1700;
          const step = (now: number) => {
            const t = Math.min(1, (now - t0) / dur);
            const v = Math.round(from + (s.to - from) * (1 - Math.pow(1 - t, 4)));
            el.textContent = s.plain ? String(v) : v.toLocaleString("en-US");
            if (t < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      },
    });
    return () => st.kill();
  }, []);

  return (
    <section id="reach" className="reach">
      <p className="eyebrow reveal text-[var(--ink-2)]">
        <b className="text-[var(--ink)]">06</b>
        <i />
        Wherever the day goes
      </p>
      <h2 className="reach__title reveal">
        In 177 countries, or direct to your door<i className="sq-dot" aria-hidden />
        <span className="sr-only">.</span>
      </h2>
      <div className="reach__stats">
        {STATS.map((s, k) => (
          <div key={s.label} className="stat reveal" style={{ transitionDelay: `${k * 80}ms` }}>
            <p className="stat__num">
              <span
                ref={(n) => {
                  nums.current[k] = n;
                }}
                className="tabular-nums"
              >
                {s.plain ? s.to : 0}
              </span>
              {s.unit && <small>{s.unit}</small>}
            </p>
            <p className="stat__label">{s.label}</p>
            <p className="stat__body">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
