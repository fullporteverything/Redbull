"use client";

import { useState } from "react";
import { EDITIONS, PACKS } from "@/lib/data";

const TAGLINES: Record<string, string> = {
  classic: "The one that started it.",
  red: "Summer, any month.",
  blue: "Dark fruit, clean finish.",
  yellow: "Loud fruit, cold can.",
};
const TINTS: Record<string, string> = {
  classic: "#d8d9df",
  red: "#f1d2d4",
  blue: "#d5d8e6",
  yellow: "#f1e6c2",
};

function Product({ k }: { k: number }) {
  const e = EDITIONS[k];
  const packs = PACKS.slice(0, 2);
  const [pack, setPack] = useState(0);
  const [added, setAdded] = useState(false);
  const p = packs[pack];
  return (
    <article className="product reveal" style={{ "--tint": TINTS[e.key], "--d": `${k * 120}ms` } as React.CSSProperties}>
      <div className="product__media">
        <img src={e.img} alt={`${e.name} can`} loading="lazy" draggable={false} />
        <span className="product__shadow" aria-hidden />
      </div>
      <p className="product__title">
        <span className="product__code">{e.code}</span>
        <span className="product__name">{e.name}</span>
      </p>
      <p className="product__flavor">{e.flavor}</p>
      <p className="product__line">{TAGLINES[e.key]}</p>
      <div className="packs" role="radiogroup" aria-label="Pack size">
        {packs.map((pk, n) => (
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
        <b className="tabular-nums">€{p.price.toFixed(2)}</b>
        <span>EUR</span>
      </p>
      <p className="product__save">Subscribe and save 15%</p>
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
      <a href="#shop" className="product__sub" onClick={(ev) => ev.preventDefault()}>
        Subscribe weekly <span aria-hidden>→</span>
      </a>
    </article>
  );
}

export default function Shop() {
  return (
    <section id="shop" className="shop">
      <header className="shop__head reveal">
        <h2 className="shop__title t-serif">
          Order direct<i className="sq-dot" aria-hidden />
          <span className="sr-only">.</span>
        </h2>
        <p className="shop__note">Free delivery over €40</p>
      </header>
      <div className="shop__grid">
        {EDITIONS.map((e, k) => (
          <Product key={e.key} k={k} />
        ))}
      </div>
    </section>
  );
}
