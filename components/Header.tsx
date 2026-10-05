"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollToTarget, useLenis } from "./SmoothScroll";

/* section index → active link (none during Formula and Press, World for Reach + Shop) */
const LINKS = [
  { href: "#editions", label: "Editions", match: [2] },
  { href: "#inside", label: "Inside", match: [3] },
  { href: "#story", label: "Story", match: [4] },
  { href: "#reach", label: "World", match: [6, 7] },
];

const SECTIONS: { sel: string; index: number; dark?: boolean }[] = [
  { sel: "#formula-zone", index: 1, dark: true },
  { sel: "#editions", index: 2 },
  { sel: "#inside", index: 3, dark: true },
  { sel: "#story", index: 4 },
  { sel: "#press", index: 5, dark: true },
  { sel: "#reach", index: 6 },
  { sel: "#shop", index: 7 },
];
const TOTAL = 6;

/* original mark: wordmark + a small sun on a horizon (not the trademark logo) */
function Mark() {
  return (
    <svg className="site-nav__mark" viewBox="0 0 40 18" aria-hidden>
      <text x="20" y="9.6" textAnchor="middle" className="site-nav__markText">
        Red Bull
      </text>
      <path d="M8 15.2h9.2M22.8 15.2H32" stroke="#d0103a" strokeWidth="1.3" />
      <circle cx="20" cy="15.2" r="2.6" fill="#f5c400" />
    </svg>
  );
}

export default function Header() {
  const lenis = useLenis();
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(1);
  const [dark, setDark] = useState(false);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const hero = document.querySelector("#top");
    if (!hero) return;
    const show = ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (s) => setVisible(s.progress > 0.72),
      onLeave: () => setVisible(true),
      onEnterBack: (s) => setVisible(s.progress > 0.72),
    });
    const page = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (s) => bar.current?.style.setProperty("transform", `scaleX(${s.progress.toFixed(4)})`),
    });
    const idx = SECTIONS.map((s) =>
      ScrollTrigger.create({
        trigger: s.sel,
        start: "top 50%",
        end: "bottom 50%",
        onToggle: (t) => t.isActive && setIndex(s.index),
      }),
    );
    const under = SECTIONS.map((s) =>
      ScrollTrigger.create({
        trigger: s.sel,
        start: "top 48px",
        end: "bottom 48px",
        onToggle: (t) => t.isActive && setDark(!!s.dark),
      }),
    );
    return () => {
      show.kill();
      page.kill();
      idx.forEach((t) => t.kill());
      under.forEach((t) => t.kill());
    };
  }, []);

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    scrollToTarget(lenis, href);
  };
  const shown = Math.min(index, TOTAL);

  return (
    <header className={`site-nav ${visible ? "is-visible" : ""}`} data-under={dark ? "dark" : "light"}>
      <a href="#top" className="site-nav__brand" onClick={(e) => go(e, "#top")} aria-label="Back to top">
        <Mark />
        <span className="site-nav__count tabular-nums">
          <b>{String(shown).padStart(2, "0")}</b>
          <i>/</i>
          {String(TOTAL).padStart(2, "0")}
        </span>
      </a>
      <nav className="site-nav__links" aria-label="Sections">
        {LINKS.map((l) => {
          const active = l.match.includes(index);
          return (
            <a
              key={l.href}
              href={l.href}
              data-label={l.label}
              onClick={(e) => go(e, l.href)}
              className={active ? "is-active" : ""}
              aria-current={active || undefined}
            >
              {l.label}
            </a>
          );
        })}
      </nav>
      <div className="site-nav__right">
        <a href="#shop" onClick={(e) => go(e, "#shop")} className="site-nav__shop">
          Shop
          <svg viewBox="0 0 10 7" width="10" height="7" aria-hidden>
            <path d="M0 3.5h8.6M6 .8l2.8 2.7L6 6.2" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        </a>
        <a href="#shop" onClick={(e) => go(e, "#shop")} className="site-nav__bag" aria-label="Shop">
          <svg viewBox="0 0 16 18" width="14" height="16" aria-hidden>
            <path d="M2 5.5h12l-.9 11H2.9L2 5.5Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M5.2 5.5V4.2a2.8 2.8 0 0 1 5.6 0v1.3" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </a>
      </div>
      <span ref={bar} className="site-nav__progress" />
    </header>
  );
}
