"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export type SpinCanHandle = { setAngle: (rad: number) => void };

type Props = {
  src: string; // straight-on cutout (silhouette, rim and base come from here)
  wrap?: string; // 360° unwrapped label texture built from the same licensed photo(s)
  alt: string;
  band?: [number, number]; // body rows (fraction of height) that rotate
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Canvas cylinder renderer. With `wrap`, the label turns a full 360°: each
 * output column x samples the texture at θ = asin(x) + φ. The silhouette, rim
 * and base are taken from the straight-on photo so the outline never wobbles,
 * and lighting is a fixed overlay so the metal reads as turning under a light.
 * Without `wrap`, it falls back to a ±~35° turn of the photo itself.
 */
const SpinCan = forwardRef<SpinCanHandle, Props>(function SpinCan({ src, wrap, alt, band = [0.055, 0.965], className, style }, ref) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const photo = useRef<HTMLImageElement | null>(null);
  const tex = useRef<HTMLImageElement | null>(null);
  const angle = useRef(0);
  const drawn = useRef(NaN);

  const ready = (im: HTMLImageElement | null) => !!im && im.complete && im.naturalWidth > 0;

  const draw = () => {
    const c = canvas.current,
      im = photo.current;
    if (!c || !ready(im)) return;
    const w = c.width,
      h = c.height;
    if (!w || !h) return;
    const ctx = c.getContext("2d")!;
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, w, h);
    const sw = im!.naturalWidth,
      sh = im!.naturalHeight;
    const phi = angle.current;

    if (wrap && ready(tex.current)) {
      const t = tex.current!;
      const tw = t.naturalWidth,
        th = t.naturalHeight;
      const [b0, b1] = band;
      const sy = b0 * th,
        sH = (b1 - b0) * th;
      const dy = Math.floor(b0 * h),
        dH = Math.ceil((b1 - b0) * h);
      for (let dx = 0; dx < w; dx++) {
        const xn = ((dx + 0.5) / w) * 2 - 1;
        const a = Math.asin(Math.max(-1, Math.min(1, xn))) + phi;
        let u = ((a + Math.PI) / (2 * Math.PI)) % 1;
        if (u < 0) u += 1;
        const sx = Math.min(tw - 2, u * tw);
        ctx.drawImage(t, sx, sy, 1.5, sH, dx, dy, 1, dH);
      }
      // keep the photographed silhouette
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(im!, 0, 0, w, h);
      // rim + base from the photo (rotationally symmetric, drawn still)
      ctx.globalCompositeOperation = "source-over";
      const capT = (b0 + 0.006) * sh,
        capB = (1 - b1 + 0.006) * sh;
      ctx.drawImage(im!, 0, 0, sw, capT, 0, 0, w, (capT / sh) * h);
      ctx.drawImage(im!, 0, sh - capB, sw, capB, 0, h - (capB / sh) * h, w, (capB / sh) * h);
    } else {
      // fallback: partial turn of the straight-on photo
      const colW = Math.max(1, sw / w);
      for (let dx = 0; dx < w; dx++) {
        const xn = ((dx + 0.5) / w) * 2 - 1;
        let a = Math.asin(Math.max(-1, Math.min(1, xn))) - Math.max(-0.6, Math.min(0.6, phi));
        a = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, a));
        const sx = Math.min(sw - colW, Math.max(0, ((Math.sin(a) + 1) / 2) * sw - colW / 2));
        ctx.drawImage(im!, sx, 0, colW, sh, dx, 0, 1, h);
      }
    }
    drawn.current = phi;
  };

  useImperativeHandle(ref, () => ({
    setAngle: (rad: number) => {
      angle.current = rad;
      if (Number.isNaN(drawn.current) || Math.abs(rad - drawn.current) > 0.0015) draw();
    },
  }));

  useEffect(() => {
    const load = (s: string) => {
      const im = new Image();
      im.decoding = "async";
      im.src = s;
      return im;
    };
    photo.current = load(src);
    tex.current = wrap ? load(wrap) : null;
    const size = () => {
      const c = canvas.current,
        el = box.current;
      if (!c || !el) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      c.width = Math.round(el.clientWidth * dpr);
      c.height = Math.round(el.clientHeight * dpr);
      drawn.current = NaN;
      draw();
    };
    photo.current.onload = size;
    if (tex.current) tex.current.onload = size;
    const ro = new ResizeObserver(size);
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, wrap]);

  const mask = { WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` } as React.CSSProperties;
  return (
    <div ref={box} className={`spin-can ${wrap ? "spin-can--360" : ""} ${className ?? ""}`} style={style} role="img" aria-label={alt}>
      <canvas ref={canvas} className="spin-can__canvas" />
      <span className="spin-can__shade" style={mask} />
      <span className="spin-can__light" style={mask} />
    </div>
  );
});

export default SpinCan;
