"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BurnField, clamp, easeInOut } from "@/lib/burn";
import { drawTopo } from "@/lib/topo";

gsap.registerPlugin(ScrollTrigger);

const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/* scroll phase map (fractions of the pinned hero+formula sequence) */
const P = {
  irisStart: 0.2,
  irisEnd: 0.42,
  splitStart: 0.42,
  splitEnd: 0.6,
  glideStart: 0.48,
  glideEnd: 0.74,
  copyIn: 0.7,
  navIn: 0.72,
};

function Title({ dark }: { dark?: boolean }) {
  const words = ["RED", "BULL"];
  let i = 0;
  return (
    <h1
      aria-label={dark ? undefined : "Red Bull."}
      aria-hidden={dark || undefined}
      className={`hero-title ${dark ? "hero-title--dark" : ""}`}
    >
      {words.map((w, wi) => (
        <span key={w} className="hero-word" data-word={wi}>
          <span className="hero-line">
            {w.split("").map((ch) => (
              <span key={i} className="hero-ch" style={{ "--i": i++ } as React.CSSProperties}>
                {ch}
              </span>
            ))}
            {wi === 1 && <span className="hero-dot" style={{ "--i": i } as React.CSSProperties} />}
          </span>
        </span>
      ))}
    </h1>
  );
}

export default function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null);
  const dark = useRef<HTMLDivElement>(null);
  const rim = useRef<SVGSVGElement>(null);
  const char = useRef<SVGPathElement>(null);
  const topo = useRef<HTMLCanvasElement>(null);
  const scorch = useRef<HTMLCanvasElement>(null);
  const darkCan = useRef<HTMLDivElement>(null);
  const spot = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  /* ---------------- burn + scroll choreography ---------------- */
  useEffect(() => {
    if (!ready || started.current) return;
    started.current = true;
    const section = root.current!;
    const darkEl = dark.current!;
    const rimEl = rim.current!;
    const rimPaths = Array.from(rimEl.querySelectorAll("path"));
    const charEl = char.current!;
    const scorchEl = scorch.current!;
    const sctx = scorchEl.getContext("2d")!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const field = new BurnField();
    let W = 0,
      H = 0;

    const resize = () => {
      W = section.clientWidth;
      H = window.innerHeight;
      field.resize(W, H);
      const dpr = Math.min(devicePixelRatio || 1, 2);
      scorchEl.width = W * dpr;
      scorchEl.height = H * dpr;
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rimEl.setAttribute("viewBox", `0 0 ${W} ${H}`);
      charEl.ownerSVGElement?.setAttribute("viewBox", `0 0 ${W} ${H}`);
      if (topo.current) drawTopo(topo.current);
    };
    resize();
    let rT: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(rT);
      rT = setTimeout(resize, 120);
    };
    window.addEventListener("resize", onResize);

    /* ---- brush: real pointer, or an autoplay path until the first move ---- */
    const k = () => clamp(W / 1440, 0.6, 1.35);
    const brush = { x: W * 0.44, y: H * 0.42, tx: W * 0.44, ty: H * 0.42, lastX: 0, lastY: 0, travel: 0, live: false };
    let pointerUsed = false;
    let progress = 0;
    const t0 = performance.now();

    const spawnAt = (x: number, y: number, speed: number, now: number) => {
      const s = k();
      const R = (46 + Math.min(speed, 70) * 1.5) * s;
      const a = Math.random() * Math.PI * 2;
      field.spawn({
        x: x + Math.cos(a) * 8,
        y: y + Math.sin(a) * 8,
        R,
        born: now,
        grow: 360,
        hold: 650 + Math.random() * 400,
        heal: 2400 + Math.random() * 900,
        vx: (brush.tx - brush.x) * 0.25,
        vy: (brush.ty - brush.y) * 0.25,
      });
    };

    const onMove = (e: PointerEvent) => {
      if (reduced || progress > P.irisStart) return;
      const r = section.getBoundingClientRect();
      if (r.top > 1 || r.bottom < H) return;
      if (!pointerUsed) {
        pointerUsed = true;
        brush.x = e.clientX;
        brush.y = e.clientY;
      }
      brush.tx = e.clientX;
      brush.ty = e.clientY;
      brush.live = true;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // autoplay intro choreography (fractions of viewport, ms after start)
    const AUTO: [number, number, number][] = [
      [0, 0.44, 0.42],
      [380, 0.4, 0.56],
      [700, 0.35, 0.68],
      [1150, 0.5, 0.5],
      [1550, 0.62, 0.37],
      [1950, 0.74, 0.31],
      [2450, 0.86, 0.44],
      [2900, 0.9, 0.5],
    ];
    const autoAt = (t: number) => {
      for (let n = 0; n < AUTO.length - 1; n++) {
        const [ta, xa, ya] = AUTO[n],
          [tb, xb, yb] = AUTO[n + 1];
        if (t >= ta && t <= tb) {
          const u = easeInOut((t - ta) / (tb - ta));
          return [xa + (xb - xa) * u, ya + (yb - ya) * u];
        }
      }
      return null;
    };
    // the small "bean" that is already open when the hero appears, then heals
    if (!reduced) {
      const now = performance.now() + 250;
      field.spawn({ x: W * 0.665, y: H * 0.26, R: 58 * k(), born: now, grow: 260, hold: 1100, heal: 1300 });
      field.spawn({ x: W * 0.695, y: H * 0.255, R: 50 * k(), born: now, grow: 260, hold: 1000, heal: 1300 });
    }

    /* ---- scroll ---- */
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => (progress = self.progress),
    });

    /* title split + can glide + spotlight, scrubbed */
    const q = gsap.utils.selector(darkEl);
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 0.6 },
    });
    tl.set({}, {}, 1); // normalise timeline length to 1
    tl.fromTo(
      q('.hero-word[data-word="0"]'),
      { xPercent: 0, yPercent: 0, rotationY: 0, opacity: 1 },
      { xPercent: -150, yPercent: 40, rotationY: 28, opacity: 0, ease: "power2.in", duration: P.splitEnd - P.splitStart },
      P.splitStart,
    );
    tl.fromTo(
      q('.hero-word[data-word="1"]'),
      { xPercent: 0, yPercent: 0, rotationY: 0, opacity: 1 },
      { xPercent: 120, yPercent: -40, rotationY: -28, opacity: 0, ease: "power2.in", duration: P.splitEnd - P.splitStart },
      P.splitStart,
    );
    tl.fromTo(
      darkCan.current,
      { x: 0, y: 0, scale: 1 },
      { x: () => W * 0.11, y: () => -H * 0.045, scale: 1.09, ease: "power2.inOut", duration: P.glideEnd - P.glideStart },
      P.glideStart,
    );
    tl.fromTo(
      spot.current,
      { x: 0, y: 0 },
      { x: () => W * 0.11, y: () => -H * 0.045, ease: "power2.inOut", duration: P.glideEnd - P.glideStart },
      P.glideStart,
    );

    /* ---- frame loop ---- */
    let lastD = "";
    let fullyOpen = false;
    const tick = () => {
      const now = performance.now();
      const p = progress;

      // brush update
      if (!reduced && p <= P.irisStart) {
        if (!pointerUsed) {
          const a = autoAt(now - t0 - 650);
          if (a) {
            brush.tx = a[0] * W;
            brush.ty = a[1] * H;
            brush.live = true;
          } else brush.live = false;
        }
        const px = brush.x,
          py = brush.y;
        brush.x += (brush.tx - brush.x) * 0.28;
        brush.y += (brush.ty - brush.y) * 0.28;
        const step = Math.hypot(brush.x - px, brush.y - py);
        if (brush.live && step > 0.3) {
          brush.travel += step;
          if (brush.travel > 20 * k()) {
            brush.travel = 0;
            spawnAt(brush.x, brush.y, step, now);
          }
        }
      }

      // iris (scroll takeover) centred on the can
      const ir = easeInOut(smooth(P.irisStart, P.irisEnd, p));
      field.iris = { x: W * 0.51, y: H * 0.5, r: ir * Math.hypot(W, H) * 0.78 };

      // scorch stamps from healed holes
      for (const b of field.prune(now)) {
        const g = sctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.R * 0.7);
        g.addColorStop(0, "rgba(190,150,70,0.20)");
        g.addColorStop(1, "rgba(190,150,70,0)");
        sctx.fillStyle = g;
        sctx.fillRect(b.x - b.R, b.y - b.R, b.R * 2, b.R * 2);
      }
      sctx.save();
      sctx.globalCompositeOperation = "destination-out";
      sctx.fillStyle = "rgba(0,0,0,0.006)";
      sctx.fillRect(0, 0, W, H);
      sctx.restore();

      const open = p >= P.irisEnd - 0.005;
      if (open) {
        if (!fullyOpen) {
          fullyOpen = true;
          darkEl.style.clipPath = "none";
          darkEl.style.visibility = "visible";
          rimEl.style.opacity = "0";
          charEl.setAttribute("d", "");
        }
      } else {
        fullyOpen = false;
        const d = field.active(now) ? field.path(now, now) : "";
        if (d !== lastD) {
          lastD = d;
          if (d) {
            darkEl.style.visibility = "visible";
            darkEl.style.clipPath = `path(evenodd, "${d}")`;
          } else {
            darkEl.style.visibility = "hidden";
          }
          rimPaths.forEach((el) => el.setAttribute("d", d));
          charEl.setAttribute("d", d);
        }
        rimEl.style.opacity = String(1 - smooth(P.irisStart, P.irisStart + 0.12, p));
      }

      // formula copy + bottom UI
      copy.current?.classList.toggle("is-in", p > P.copyIn);
      section.style.setProperty("--ui-o", String(1 - smooth(0.02, 0.1, p)));
      section.style.setProperty("--light-o", String(1 - smooth(P.irisEnd - 0.04, P.irisEnd, p)));
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      st.kill();
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [ready]);

  return (
    <section ref={root} id="top" className={`hero relative ${ready ? "is-in" : ""}`} style={{ height: "430vh" }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* ---------- light scene ---------- */}
        <div className="scene-light absolute inset-0 bg-[var(--paper)]" style={{ opacity: "var(--light-o, 1)" }}>
          <canvas ref={scorch} className="pointer-events-none absolute inset-0 h-full w-full mix-blend-multiply" />
          <div className="hero-can">
            <div className="hero-can__fade">
              <img src="/img/cans/classic.webp" alt="A 250 ml can of Red Bull Energy Drink" draggable={false} fetchPriority="high" />
              <span className="hero-can__shadow" />
            </div>
          </div>
          <Title />
          <div className="hero-ui">
            <p className="hero-tag t-serif">
              Gives you
              <br />
              wings.
            </p>
            <div className="hero-scroll">
              <span>Scroll</span>
              <i className="mouse">
                <i />
              </i>
            </div>
            <p className="hero-meta">
              Caffeine · Taurine · B-vitamins
              <br />
              Fuschl am See, Austria
            </p>
          </div>
        </div>

        {/* ---------- singed rim (outer half shows around the holes) ---------- */}
        <svg ref={rim} className="pointer-events-none absolute inset-0 z-[1] h-full w-full" aria-hidden>
          <defs>
            <filter id="rimHalo" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
            <filter id="rimBand" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="2.2" />
            </filter>
          </defs>
          <path fill="none" stroke="#dcc58e" strokeWidth="28" opacity=".5" filter="url(#rimHalo)" />
          <path fill="none" stroke="#c49434" strokeWidth="9" opacity=".8" filter="url(#rimBand)" />
          <path fill="none" stroke="#f2d27a" strokeWidth="2.6" />
        </svg>

        {/* ---------- dark (blueprint) scene, clipped to the holes ---------- */}
        <div ref={dark} className="scene-dark absolute inset-0" style={{ visibility: "hidden" }}>
          <canvas ref={topo} className="absolute inset-0 h-full w-full" />
          <div ref={spot} className="scene-dark__spot" />
          <div className="hero-can hero-can--dark">
            <div ref={darkCan} className="hero-can__glide">
              <img src="/img/cans/classic-wire.webp" alt="" draggable={false} />
            </div>
          </div>
          <Title dark />
          <div ref={copy} className="formula-copy">
            <p className="eyebrow text-white/70">
              <b className="text-white/90">01</b>
              <i />
              The formula
            </p>
            <h2 className="formula-h t-serif">
              <span className="mask-line">
                <span>Vitalizes body</span>
              </span>
              <span className="mask-line">
                <span>and mind.</span>
              </span>
            </h2>
            <span className="formula-rule" />
            <p className="formula-p">
              Caffeine and taurine, a measure of B-group vitamins, sugars and water drawn from the Alps. Made in Austria since 1987 for
              long drives, late shifts and early starts.
            </p>
            <div className="formula-stats">
              <span>
                <b>80</b> mg caffeine
              </span>
              <span>
                <b>1,000</b> mg taurine
              </span>
            </div>
          </div>
          <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
            <defs>
              <filter id="charBlur" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>
            <path ref={char} fill="none" stroke="rgba(70,66,84,.7)" strokeWidth="22" filter="url(#charBlur)" />
          </svg>
        </div>
      </div>
      {/* anchor so nav links can jump to the formula state */}
      <span id="formula" className="absolute left-0" style={{ top: "300vh" }} />
    </section>
  );
}
