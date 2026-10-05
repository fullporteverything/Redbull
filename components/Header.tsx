"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollToTarget, useLenis } from "./SmoothScroll";

const LINKS = [
  { href: "#editions", label: "Editions", index: 2 },
  { href: "#inside", label: "Inside", index: 3 },
  { href: "#story", label: "Story", index: 4 },
  { href: "#press", label: "World", index: 5 },
];

const SECTIONS = ["#formula-zone", "#editions", "#inside", "#story", "#press", "#reach", "#shop"];

export default function Header() {
  const lenis = useLenis();
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(1);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const hero = document.querySelector("#top");
    if (!hero) return;
    const show = ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (s) => setVisible(s.progress > 0.72 || s.progress === 1),
      onLeave: () => setVisible(true),
    });
    const page = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (s) => bar.current?.style.setProperty("transform", `scaleX(${s.progress.toFixed(4)})`),
    });
    const triggers = SECTIONS.map((sel, i) =>
      ScrollTrigger.create({
        trigger: sel,
        start: "top 50%",
        end: "bottom 50%",
        onToggle: (s) => s.isActive && setIndex(i + 1),
      }),
    );
    return () => {
      show.kill();
      page.kill();
      triggers.forEach((t) => t.kill());
    };
  }, []);

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    scrollToTarget(lenis, href);
  };

  return (
    <header className={`site-nav ${visible ? "is-visible" : ""}`}>
      <a href="#top" className="site-nav__brand" onClick={(e) => go(e, "#top")} aria-label="Back to top">
        <span className="site-nav__word">
          <span>Red</span>
          <span>Bull</span>
        </span>
        <span className="site-nav__count tabular-nums">
          <b>{String(index).padStart(2, "0")}</b> / 08
        </span>
      </a>
      <nav className="site-nav__links" aria-label="Sections">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)} className={index === l.index ? "is-active" : ""}>
            {l.label}
          </a>
        ))}
      </nav>
      <div className="site-nav__right">
        <a href="#shop" onClick={(e) => go(e, "#shop")} className="site-nav__shop">
          Shop <span aria-hidden>→</span>
        </a>
        <a href="#shop" onClick={(e) => go(e, "#shop")} className="site-nav__bag" aria-label="Shop">
          <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden>
            <path d="M6 8h12l-1 12H7L6 8Z" fill="none" stroke="currentColor" strokeWidth="1.3" />
            <path d="M9 8V6.5a3 3 0 0 1 6 0V8" fill="none" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </a>
      </div>
      <span ref={bar} className="site-nav__progress" />
    </header>
  );
}
