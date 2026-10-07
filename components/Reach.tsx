"use client";

const STATS = [
  { num: "177", unit: "", label: "Countries" },
  { num: "12", unit: "bn", label: "Cans a year" },
  { num: "1987", unit: "", label: "First can sold" },
  { num: "250", unit: "ml", label: "Can size" },
];

export default function Reach() {
  return (
    <section id="reach" className="reach">
      <div className="reach__head reveal reveal--fade">
        <p className="eyebrow text-[var(--ink-2)]">
          <b className="text-[var(--ink)]">06</b>
          <i />
          Wherever the day goes
        </p>
        <h2 className="reach__title">
          <span className="line">In 177 countries, or</span>{" "}
          <span className="line">direct to your</span>{" "}
          <span className="line">
            door<i className="sq-dot" aria-hidden />
            <span className="sr-only">.</span>
          </span>
        </h2>
      </div>
      <div className="reach__stats">
        {STATS.map((s, k) => (
          <div key={s.label} className="stat reveal" style={{ "--d": `${k * 110}ms` } as React.CSSProperties}>
            <p className="stat__num">
              {s.num}
              {s.unit && <small>{s.unit}</small>}
            </p>
            <p className="stat__label">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="reach__note reveal" style={{ "--d": "160ms" } as React.CSSProperties}>
        Stocked from mountain huts to all-night service stations, and now sent straight from the warehouse in packs of four or twelve.
        Seasonal editions rotate through the year; the original never leaves.
      </p>
    </section>
  );
}
