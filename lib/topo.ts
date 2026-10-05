import { vnoise } from "./burn";

/**
 * Large, smooth topographic contours with terraced fills (few isolines,
 * 25–50% viewport-sized shapes), drawn once per resize onto a canvas.
 */
const SEG: number[][][] = [
  [], [[3, 2]], [[2, 1]], [[3, 1]], [[0, 1]], [[3, 0], [2, 1]], [[0, 2]], [[3, 0]],
  [[3, 0]], [[0, 2]], [[3, 2], [0, 1]], [[0, 1]], [[3, 1]], [[2, 1]], [[3, 2]], [],
];

function fbm(x: number, y: number) {
  let s = 0,
    a = 0.6,
    f = 1;
  for (let o = 0; o < 3; o++) {
    s += a * vnoise(x * f, y * f);
    f *= 2.02;
    a *= 0.45;
  }
  return s / 0.9;
}

export type TopoOpts = {
  seed?: number;
  scale?: number; // noise scale (smaller = bigger shapes)
  levels?: number[];
  line?: string;
  lineStrong?: string;
  fills?: [string, string];
};

export function drawTopo(canvas: HTMLCanvasElement, opts: TopoOpts = {}) {
  const {
    seed = 3.1,
    scale = 1 / 820,
    levels = [0.3, 0.38, 0.46, 0.54, 0.62, 0.7],
    line = "rgba(165,180,255,0.26)",
    lineStrong = "rgba(175,190,255,0.40)",
    fills = ["rgba(255,255,255,0.0)", "rgba(120,140,230,0.07)"],
  } = opts;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = canvas.clientWidth,
    H = canvas.clientHeight;
  if (!W || !H) return;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const cell = 6;
  const cols = Math.ceil(W / cell) + 1,
    rows = Math.ceil(H / cell) + 1;
  const f = new Float32Array(cols * rows);
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) f[j * cols + i] = fbm(i * cell * scale + seed, j * cell * scale + seed * 2.3);

  // terraced fill at quarter resolution
  const q = 4;
  const tw = Math.ceil(W / q),
    th = Math.ceil(H / q);
  const off = document.createElement("canvas");
  off.width = tw;
  off.height = th;
  const octx = off.getContext("2d")!;
  for (let y = 0; y < th; y++)
    for (let x = 0; x < tw; x++) {
      const v = fbm(x * q * scale + seed, y * q * scale + seed * 2.3);
      let band = 0;
      for (const l of levels) if (v > l) band++;
      octx.fillStyle = fills[band % 2];
      octx.fillRect(x, y, 1, 1);
    }
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(off, 0, 0, W, H);

  levels.forEach((t, li) => {
    ctx.beginPath();
    for (let j = 0; j < rows - 1; j++)
      for (let i = 0; i < cols - 1; i++) {
        const tl = f[j * cols + i],
          tr = f[j * cols + i + 1],
          br = f[(j + 1) * cols + i + 1],
          bl = f[(j + 1) * cols + i];
        const idx = (tl > t ? 8 : 0) | (tr > t ? 4 : 0) | (br > t ? 2 : 0) | (bl > t ? 1 : 0);
        if (idx === 0 || idx === 15) continue;
        const x = i * cell,
          y = j * cell;
        const pt = (e: number): [number, number] => {
          switch (e) {
            case 0:
              return [x + (cell * (t - tl)) / (tr - tl), y];
            case 1:
              return [x + cell, y + (cell * (t - tr)) / (br - tr)];
            case 2:
              return [x + (cell * (t - bl)) / (br - bl), y + cell];
            default:
              return [x, y + (cell * (t - tl)) / (bl - tl)];
          }
        };
        for (const [a, b] of SEG[idx]) {
          const p1 = pt(a),
            p2 = pt(b);
          ctx.moveTo(p1[0], p1[1]);
          ctx.lineTo(p2[0], p2[1]);
        }
      }
    ctx.strokeStyle = li % 2 ? lineStrong : line;
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}
