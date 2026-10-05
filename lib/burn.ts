/**
 * Burn-through field: metaball blobs (spawned along the cursor path, or an
 * autoplay path before the first pointer move) plus a scroll-driven "iris".
 * The field is thresholded with marching squares and returned as a smooth SVG
 * path string, used both as the dark scene's clip-path and for the singed rim.
 */

export type Blob = {
  x: number;
  y: number;
  R: number; // target radius
  born: number; // ms
  grow: number; // ms
  hold: number; // ms
  heal: number; // ms
  vx: number;
  vy: number;
  stamped?: boolean;
};

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* cheap value noise */
function hash(x: number, y: number) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + 1013904223) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}
export function vnoise(x: number, y: number) {
  const xi = Math.floor(x),
    yi = Math.floor(y),
    xf = x - xi,
    yf = y - yi;
  const u = xf * xf * (3 - 2 * xf),
    v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi),
    b = hash(xi + 1, yi),
    c = hash(xi, yi + 1),
    d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function blobRadius(b: Blob, now: number) {
  const age = now - b.born;
  if (age < 0) return 0;
  if (age < b.grow) return b.R * easeOut(age / b.grow);
  if (age < b.grow + b.hold) return b.R;
  const h = (age - b.grow - b.hold) / b.heal;
  if (h >= 1) return 0;
  return b.R * (1 - easeInOut(h));
}

export class BurnField {
  W = 0;
  H = 0;
  cell = 10;
  cols = 0;
  rows = 0;
  f: Float32Array = new Float32Array(0);
  blobs: Blob[] = [];
  iris = { x: 0, y: 0, r: 0 };

  resize(W: number, H: number) {
    this.W = W;
    this.H = H;
    this.cell = W < 800 ? 8 : 10;
    // one padding cell on every side so all contours close
    this.cols = Math.ceil(W / this.cell) + 3;
    this.rows = Math.ceil(H / this.cell) + 3;
    this.f = new Float32Array(this.cols * this.rows);
  }

  spawn(b: Omit<Blob, "vx" | "vy"> & Partial<Pick<Blob, "vx" | "vy">>) {
    this.blobs.push({ vx: 0, vy: 0, ...b });
    if (this.blobs.length > 90) this.blobs.splice(0, this.blobs.length - 90);
  }

  /** prune dead blobs; returns blobs that just finished healing (for scorch stamps) */
  prune(now: number) {
    const dead: Blob[] = [];
    this.blobs = this.blobs.filter((b) => {
      const alive = now - b.born < b.grow + b.hold + b.heal;
      if (!alive) dead.push(b);
      return alive;
    });
    return dead;
  }

  active(now: number) {
    if (this.iris.r > 0.5) return true;
    return this.blobs.some((b) => blobRadius(b, now) > 0.5);
  }

  /** compute field + contour path. Returns "" when nothing is open. */
  path(now: number, t: number): string {
    const { cols, rows, cell, f } = this;
    const live: { x: number; y: number; r2: number }[] = [];
    for (const b of this.blobs) {
      const age = (now - b.born) / 1000;
      const r = blobRadius(b, now);
      if (r > 0.5) live.push({ x: b.x + b.vx * age, y: b.y + b.vy * age, r2: r * r });
    }
    if (this.iris.r > 0.5) live.push({ x: this.iris.x, y: this.iris.y, r2: this.iris.r * this.iris.r });
    if (!live.length) return "";

    const ox = -cell,
      oy = -cell;
    const ns = 0.0055,
      nt = t * 0.00012;
    for (let j = 0; j < rows; j++) {
      const y = oy + j * cell;
      for (let i = 0; i < cols; i++) {
        const idx = j * cols + i;
        if (i === 0 || j === 0 || i === cols - 1 || j === rows - 1) {
          f[idx] = 0;
          continue;
        }
        const x = ox + i * cell;
        let s = 0;
        for (let k = 0; k < live.length; k++) {
          const dx = x - live[k].x,
            dy = y - live[k].y;
          s += live[k].r2 / (dx * dx + dy * dy + 1);
        }
        if (s > 0.25 && s < 4) {
          // organic edge: perturb only near the threshold
          const n = vnoise(x * ns + nt, y * ns - nt) * 0.65 + vnoise(x * ns * 2.3 - nt, y * ns * 2.3) * 0.35;
          s *= 0.72 + n * 0.56;
        }
        f[idx] = s;
      }
    }
    return contour(f, cols, rows, cell, ox, oy, 1);
  }
}

/* marching squares -> closed loops -> smoothed path */
const SEG: number[][][] = [
  [], [[3, 2]], [[2, 1]], [[3, 1]], [[0, 1]], [[3, 0], [2, 1]], [[0, 2]], [[3, 0]],
  [[3, 0]], [[0, 2]], [[3, 2], [0, 1]], [[0, 1]], [[3, 1]], [[2, 1]], [[3, 2]], [],
];

function contour(f: Float32Array, cols: number, rows: number, cell: number, ox: number, oy: number, th: number) {
  // edge ids: horizontal (i,j)->(i+1,j) = (j*cols+i)*2 ; vertical (i,j)->(i,j+1) = (j*cols+i)*2+1
  const link = new Map<number, number[]>();
  const pos = new Map<number, [number, number]>();
  const addPt = (id: number, i: number, j: number, horiz: boolean) => {
    if (pos.has(id)) return;
    const a = f[j * cols + i];
    const b = horiz ? f[j * cols + i + 1] : f[(j + 1) * cols + i];
    const t = Math.min(1, Math.max(0, (th - a) / (b - a)));
    pos.set(id, horiz ? [ox + (i + t) * cell, oy + j * cell] : [ox + i * cell, oy + (j + t) * cell]);
  };
  const connect = (a: number, b: number) => {
    (link.get(a) ?? link.set(a, []).get(a)!).push(b);
    (link.get(b) ?? link.set(b, []).get(b)!).push(a);
  };
  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < cols - 1; i++) {
      const tl = f[j * cols + i],
        tr = f[j * cols + i + 1],
        br = f[(j + 1) * cols + i + 1],
        bl = f[(j + 1) * cols + i];
      let idx = (tl > th ? 8 : 0) | (tr > th ? 4 : 0) | (br > th ? 2 : 0) | (bl > th ? 1 : 0);
      if (idx === 0 || idx === 15) continue;
      const e = [
        (j * cols + i) * 2, // top
        (j * cols + i + 1) * 2 + 1, // right
        ((j + 1) * cols + i) * 2, // bottom
        (j * cols + i) * 2 + 1, // left
      ];
      if (idx === 5 || idx === 10) {
        const c = (tl + tr + br + bl) / 4;
        if (c > th) idx = idx === 5 ? 10 : 5; // resolve saddle by centre
      }
      addPt(e[0], i, j, true);
      addPt(e[1], i + 1, j, false);
      addPt(e[2], i, j + 1, true);
      addPt(e[3], i, j, false);
      for (const [a, b] of SEG[idx]) connect(e[a], e[b]);
    }
  }
  const seen = new Set<number>();
  let d = "";
  for (const start of link.keys()) {
    if (seen.has(start)) continue;
    const loop: [number, number][] = [];
    let prev = -1,
      cur = start;
    while (cur !== undefined && !seen.has(cur)) {
      seen.add(cur);
      loop.push(pos.get(cur)!);
      const nb = link.get(cur)!;
      const next = nb[0] !== prev ? nb[0] : nb[1];
      prev = cur;
      cur = next;
    }
    if (loop.length < 4) continue;
    d += smoothLoop(loop);
  }
  return d;
}

function smoothLoop(pts: [number, number][]) {
  // decimate then quadratic midpoint smoothing
  const step = pts.length > 80 ? 2 : 1;
  const p: [number, number][] = [];
  for (let k = 0; k < pts.length; k += step) p.push(pts[k]);
  const n = p.length;
  const mid = (a: [number, number], b: [number, number]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const m0 = mid(p[n - 1], p[0]);
  let s = `M${m0[0].toFixed(1)},${m0[1].toFixed(1)}`;
  for (let k = 0; k < n; k++) {
    const c = p[k],
      m = mid(p[k], p[(k + 1) % n]);
    s += `Q${c[0].toFixed(1)},${c[1].toFixed(1)} ${m[0].toFixed(1)},${m[1].toFixed(1)}`;
  }
  return s + "Z";
}

export { clamp, easeOut, easeInOut };
