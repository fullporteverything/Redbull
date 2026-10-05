"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { INGREDIENTS } from "@/lib/data";
import { scrollToTarget, useLenis } from "./SmoothScroll";
import SpinCan, { type SpinCanHandle } from "./SpinCan";

const PILL_LABELS = ["Caffeine", "Taurine", "B-vitamins", "Alpine water"];
const METER = [0.08, 1, 0.4, 1];

/* simple original line icons */
function Icon({ k }: { k: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg className="in-ico" viewBox="0 0 24 24" aria-hidden>
      {k === 0 && <path {...common} d="M12 21v-9M12 12c0-4 3-6 7-6 0 4-3 6-7 6ZM12 14c0-3-2.5-5-6-5 0 3 2.5 5 6 5Z" />}
      {k === 1 && (
        <g {...common}>
          <path d="M12 13v6.5M12 13 6.9 8.4M12 13l5.1-4.6" />
          <circle cx="12" cy="13" r="1.5" />
          <circle cx="5.8" cy="7.4" r="1.5" />
          <circle cx="18.2" cy="7.4" r="1.5" />
          <circle cx="12" cy="21" r="1.5" />
        </g>
      )}
      {k === 2 && (
        <g {...common}>
          <path d="M12 2.8 20 7.4v9.2l-8 4.6-8-4.6V7.4Z" />
          <path d="M10 8.5h2.6a1.7 1.7 0 0 1 0 3.4H10Zm0 3.4h3a1.8 1.8 0 0 1 0 3.6h-3Z" />
        </g>
      )}
      {k === 3 && <path {...common} d="M3 19 9.5 9l3.5 5 2.5-3.5L21 19Z" />}
    </svg>
  );
}

export default function Inside() {
  const root = useRef<HTMLElement>(null);
  const can = useRef<SpinCanHandle>(null);
  const [i, setI] = useState(0);
  const [inView, setInView] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    const el = root.current!;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (s) => {
        const n = INGREDIENTS.length;
        setI(Math.min(n - 1, Math.floor(s.progress * n)));
        // scroll-scrubbed turn: the front swings left→right and back, one swing per ingredient
        can.current?.setAngle(Math.sin(s.progress * Math.PI * n) * 0.55);
      },
    });
    const reveal = ScrollTrigger.create({ trigger: el, start: "top 75%", onEnter: () => setInView(true) });
    return () => {
      st.kill();
      reveal.kill();
    };
  }, []);

  const jump = (k: number) => {
    const el = root.current!;
    const total = el.offsetHeight - window.innerHeight;
    scrollToTarget(lenis, el.offsetTop + total * ((k + 0.5) / INGREDIENTS.length));
  };

  const state = (k: number) => (k === i ? "is-active" : k < i ? "is-past" : "");

  return (
    <section ref={root} id="inside" className={`inside relative ${inView ? "is-in" : ""}`} style={{ height: "440vh" }}>
      <div className="inside__pin sticky top-0 h-[100svh] overflow-hidden">
        <header className="inside__head">
          <p className="eyebrow eyebrow--num text-white/70">
            <b>03</b>
            <span>Functional ingredients</span>
          </p>
          <h2 className="inside__title">
            Inside<i className="sq-dot" aria-hidden />
            <span className="sr-only">.</span>
          </h2>
          <div className="inside__tabs" role="tablist" aria-label="Ingredients">
            {PILL_LABELS.map((label, k) => (
              <button
                key={label}
                role="tab"
                aria-selected={k === i}
                className={`in-tab ${k === i ? "is-active" : ""}`}
                onClick={() => jump(k)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        <div className="in-names grid">
          {INGREDIENTS.map((g, k) => (
            <div key={g.name} className={`in-name ${state(k)}`} aria-hidden={k !== i}>
              <h3 className="in-mega">
                {g.mega[0]}
                <br />
                {g.mega[1]}
              </h3>
              <div className="in-name__meta">
                <Icon k={k} />
                <p className="in-sci">{g.sci}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="in-stage">
          <span className="in-halo" />
          <SpinCan ref={can} src="/img/cans/sugarfree.webp" alt="A silver and light-blue can" className="in-can" />
          <span className="in-can__shadow" />
        </div>

        <div className="in-details grid">
          {INGREDIENTS.map((g, k) => (
            <div key={g.name} className={`in-detail ${state(k)}`} aria-hidden={k !== i}>
              <p className="in-detail__idx tabular-nums">
                0{k + 1} / 0{INGREDIENTS.length}
              </p>
              <p className="in-detail__desc">{g.desc}</p>
              <dl className="in-spec">
                <div>
                  <dt>Source</dt>
                  <dd>{g.source}</dd>
                </div>
                <div>
                  <dt>Role</dt>
                  <dd>{g.role}</dd>
                </div>
                <div className="in-spec__dose">
                  <dt>Dose</dt>
                  <dd>
                    {g.dose}
                    <small>{g.unit}</small>
                  </dd>
                  <i className="in-meter" style={{ "--pct": METER[k] } as React.CSSProperties} aria-hidden />
                </div>
              </dl>
            </div>
          ))}
        </div>

        <p className="inside__foot">Four functional ingredients. Alpine water. Nothing hidden.</p>
      </div>
    </section>
  );
}
