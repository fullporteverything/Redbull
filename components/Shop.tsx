"use client";

import { useState } from "react";
import { EDITIONS, PACKS } from "@/lib/data";

const euro = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });

const LINES: Record<string, string> = {
  classic: "Vitalizes body and mind",
  red: "Summer, all year",
  blue: "Deep fruit, clean finish",
  yellow: "Bright fruit, loud can",
};

function Product({ k }: { k: number }) {
  const e = EDITIONS[k];
  const [pack, setPack] = useState(0);
  const [added, setAdded] = useState(false);
  const p = PACKS[pack];
  return (
    <article className="product reveal" style={{ "--tint": e.tint, transitionDelay: `${k * 80}ms` } as React.CSSProperties}>
      <div className="product__media">
        <img src={e.img} alt={`${e.name} can`} loading="lazy" draggable={false} />
      </div>
      <p className="product__title">
        <span className="t-code">{e.code}</span>
        <span className="product__name">{e.name}</span>
      </p>
      <p className="product__line">{LINES[e.key]}</p>
      <div className="packs" role="radiogroup" aria-label="Pack size">
        {PACKS.map((pk, n) => (
          <button
            key={pk.size}
            type="button"
            role="radio"
            aria-checked={n === pack}
            className={`pack ${n === pack ? "is-active" : ""}`}
            onClick={() => setPack(n)}
          >
            {pk.size}-pack
          </button>
        ))}
      </div>
      <p className="product__price">
        <b>{euro.format(p.price)}</b>
        <span>/ {p.size} cans</span>
      </p>
      <button
        type="button"
        className={`product__add ${added ? "is-added" : ""}`}
        onClick={() => {
          setAdded(true);
          setTimeout(() => setAdded(false), 1600);
        }}
      >
        <span>{added ? "Added" : "Add to cart"}</span>
      </button>
    </article>
  );
}

export default function Shop() {
  return (
    <section id="shop" className="shop">
      <header className="shop__head">
        <div>
          <p className="eyebrow reveal text-[var(--ink-2)]">
            <b className="text-[var(--ink)]">07</b>
            <i />
            Shop
          </p>
          <h2 className="shop__title t-serif reveal">
            Order direct<span className="text-[var(--red)]">.</span>
          </h2>
        </div>
        <p className="shop__note reveal">Free delivery over €40 · Ships in 48 h</p>
      </header>
      <div className="shop__grid">
        {EDITIONS.map((e, k) => (
          <Product key={e.key} k={k} />
        ))}
      </div>
    </section>
  );
}
