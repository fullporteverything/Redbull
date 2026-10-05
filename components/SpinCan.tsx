"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export type SpinCanHandle = { setAngle: (rad: number) => void };

/**
 * Renders a front-facing can cutout onto a canvas as a cylinder so it can be
 * turned a little around its vertical axis (±~35°). Each output column samples
 * the source column at sin(asin(x) − φ). A fixed specular/rim overlay (masked
 * to the can silhouette) keeps the lighting still while the label turns.
 */
const SpinCan = forwardRef<SpinCanHandle, { src: string; alt: string; className?: string; style?: React.CSSProperties }>(
  function SpinCan({ src, alt, className, style }, ref) {
    const wrap = useRef<HTMLDivElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const img = useRef<HTMLImageElement | null>(null);
    const angle = useRef(0);
    const drawn = useRef(NaN);

    const draw = () => {
      const c = canvas.current,
        im = img.current;
      if (!c || !im || !im.complete || !im.naturalWidth) return;
      const w = c.width,
        h = c.height;
      const ctx = c.getContext("2d")!;
      ctx.clearRect(0, 0, w, h);
      const sw = im.naturalWidth,
        sh = im.naturalHeight;
      const phi = angle.current;
      const colW = Math.max(1, sw / w);
      for (let dx = 0; dx < w; dx++) {
        const xn = ((dx + 0.5) / w) * 2 - 1;
        let th = Math.asin(Math.max(-1, Math.min(1, xn))) - phi;
        th = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, th));
        const sx = Math.min(sw - colW, Math.max(0, ((Math.sin(th) + 1) / 2) * sw - colW / 2));
        ctx.drawImage(im, sx, 0, colW, sh, dx, 0, 1, h);
      }
      drawn.current = phi;
    };

    useImperativeHandle(ref, () => ({
      setAngle: (rad: number) => {
        angle.current = rad;
        if (Math.abs(rad - drawn.current) > 0.002 || Number.isNaN(drawn.current)) draw();
      },
    }));

    useEffect(() => {
      const im = new Image();
      im.decoding = "async";
      im.src = src;
      img.current = im;
      const size = () => {
        const c = canvas.current,
          el = wrap.current;
        if (!c || !el) return;
        const dpr = Math.min(devicePixelRatio || 1, 2);
        c.width = Math.round(el.clientWidth * dpr);
        c.height = Math.round(el.clientHeight * dpr);
        drawn.current = NaN;
        draw();
      };
      im.onload = size;
      const ro = new ResizeObserver(size);
      if (wrap.current) ro.observe(wrap.current);
      return () => ro.disconnect();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src]);

    return (
      <div ref={wrap} className={`spin-can ${className ?? ""}`} style={style} role="img" aria-label={alt}>
        <canvas ref={canvas} className="spin-can__canvas" />
        <span className="spin-can__light" style={{ WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` }} />
      </div>
    );
  },
);

export default SpinCan;
