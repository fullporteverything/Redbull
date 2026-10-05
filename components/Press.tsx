"use client";

import { PUBLICATIONS, QUOTES } from "@/lib/data";

function Row({ items, reverse }: { items: string[]; reverse?: boolean }) {
  const seq = [...items, ...items];
  return (
    <div className={`marquee ${reverse ? "marquee--rev" : ""}`} aria-hidden>
      <div className="marquee__track">
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
  const rowB = [...PUBLICATIONS.slice(3), ...PUBLICATIONS.slice(0, 3)];
  return (
    <section id="press" className="press">
      <div className="press__inner">
        <p className="eyebrow reveal text-white/65">
          <b className="text-white/90">05</b>
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
      <Row items={PUBLICATIONS} />
      <Row items={rowB} reverse />
    </section>
  );
}
