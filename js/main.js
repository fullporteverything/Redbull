(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const easeIO = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const euro = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });

  /* ---------------------------------------------------------
     Cans (original illustrated artwork)
     --------------------------------------------------------- */
  const FACES = {
    classic: () => `
      <div class="face face--classic">
        <span class="f-panel"></span><span class="f-pin"></span>
        <span class="f-top">Energy Drink</span>
        <span class="f-sun"></span>
        <span class="f-band"></span>
        <span class="f-brand">Red Bull</span>
        <span class="f-sub">Energy Drink</span>
        <span class="f-vol">250 ml</span>
      </div>`,
    red: () => edition('red', 'Red', 'Watermelon'),
    blue: () => edition('blue', 'Blue', 'Blueberry'),
    yellow: () => edition('yellow', 'Yellow', 'Tropical')
  };
  function edition(key, word, flavor) {
    return `
      <div class="face face--ed face--${key}">
        <span class="f-sun"></span>
        <span class="f-the">The</span>
        <span class="f-word">${word}</span>
        <span class="f-edition">Edition</span>
        <span class="f-flavor">${flavor}</span>
        <span class="f-sub">Energy<br>Drink</span>
        <span class="f-vbrand">Red Bull</span>
      </div>`;
  }
  function buildCan(el) {
    const type = el.dataset.can;
    const face = (FACES[type] || FACES.classic)();
    el.classList.add('can', `can--${type}`);
    el.innerHTML = `
      <div class="can__rim"></div>
      <div class="can__shoulder"></div>
      <div class="can__body"><div class="can__label">${face}${face}</div><div class="can__shade"></div></div>
      <div class="can__base"></div>`;
  }
  $$('[data-can]').forEach(buildCan);

  /* simple eased spin per can (label slides = can turns) */
  const spinners = new Map();
  function spinner(el) {
    if (!spinners.has(el)) spinners.set(el, { el, cur: 0, target: 0 });
    return spinners.get(el);
  }
  function tickSpinners() {
    spinners.forEach(s => {
      const d = s.target - s.cur;
      if (Math.abs(d) < .0005) return;
      s.cur += d * (reduced ? 1 : .08);
      const v = ((s.cur % 1) + 1) % 1;
      s.el.style.setProperty('--spin', v.toFixed(4));
    });
  }

  /* ---------------------------------------------------------
     Smooth scroll
     --------------------------------------------------------- */
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new window.Lenis({ lerp: .085, smoothWheel: true, wheelMultiplier: .95 });
  }
  const scrollToY = y => (lenis ? lenis.scrollTo(y, { duration: 1.6 }) : window.scrollTo({ top: y, behavior: 'smooth' }));
  const lockScroll = on => {
    if (lenis) on ? lenis.stop() : lenis.start();
    document.documentElement.style.overflow = on ? 'hidden' : '';
  };

  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const t = id.length > 1 ? $(id) : null;
    if (!t) return;
    e.preventDefault();
    let y = t.getBoundingClientRect().top + window.scrollY;
    if (t.id === 'top') y = 0;
    scrollToY(y);
  }));

  /* ---------------------------------------------------------
     Loader
     --------------------------------------------------------- */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  if (lenis) lenis.stop();

  const loader = $('#loader');
  const counter = $('#loaderCount');
  const hero = $('.hero');
  const minTime = reduced ? 200 : 2100;
  const t0 = performance.now();
  let fontsReady = false;
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { fontsReady = true; });
  setTimeout(() => { fontsReady = true; }, 3500);

  (function count() {
    const t = clamp((performance.now() - t0) / minTime);
    const v = Math.round((1 - Math.pow(1 - t, 3)) * (fontsReady ? 100 : 92));
    counter.textContent = String(v).padStart(3, '0');
    if (t < 1 || !fontsReady) return requestAnimationFrame(count);
    counter.textContent = '100';
    setTimeout(finishLoading, 220);
  })();

  function finishLoading() {
    loader.classList.add('is-done');
    document.documentElement.classList.remove('is-loading');
    if (lenis) lenis.start();
    setTimeout(() => hero.classList.add('is-in'), 350);
    setTimeout(() => loader.remove(), 1600);
  }

  /* ---------------------------------------------------------
     Helpers
     --------------------------------------------------------- */
  let vw = innerWidth, vh = innerHeight;
  function progressOf(el) {
    const r = el.getBoundingClientRect();
    const total = el.offsetHeight - vh;
    return total <= 0 ? 0 : clamp(-r.top / total);
  }
  function setActive(list, i, cls = 'is-active') {
    list.forEach((el, j) => el.classList.toggle(cls, j === i));
  }

  /* ---------------------------------------------------------
     Hero — burn-through reveal
     --------------------------------------------------------- */
  const burn = {
    svg: $('#burn'), glow: $('#burnGlow'), edge: $('#burnEdge'), core: $('#burnCore'),
    cover: $('#burnCover'), grad: $('#burnFill'), blobs: [], last: -1
  };
  const BLOBS = [
    // x, y (viewport fractions), start, end (progress), R (of max side)
    [.62, .30, .02, .32, .05], [.17, .56, .04, .36, .06], [.86, .52, .06, .40, .045],
    [.32, .40, .08, .60, .48], [.72, .36, .14, .66, .44], [.22, .78, .20, .72, .40],
    [.80, .76, .18, .72, .40], [.50, .12, .30, .80, .36], [.50, .90, .32, .82, .36]
  ];
  function rand(seed) { let s = seed; return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) + 0x9e3779b9 | 0) >>> 0) / 4294967296; }

  function layoutBurn() {
    const W = vw, H = vh, base = Math.max(W, H);
    burn.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    burn.svg.setAttribute('preserveAspectRatio', 'none');
    burn.grad.setAttribute('cx', W * .55);
    burn.grad.setAttribute('cy', H * .5);
    burn.grad.setAttribute('r', Math.hypot(W * .55, H * .5));
    [burn.glow, burn.edge, burn.core].forEach(g => (g.innerHTML = ''));
    const rnd = rand(7);
    const ns = 'http://www.w3.org/2000/svg';
    burn.blobs = BLOBS.map(([x, y, s, e, R]) => {
      const parts = [{ dx: 0, dy: 0, k: 1 }];
      for (let i = 0; i < 3; i++) {
        const a = rnd() * Math.PI * 2;
        parts.push({ dx: Math.cos(a) * (.55 + rnd() * .35), dy: Math.sin(a) * (.55 + rnd() * .35), k: .35 + rnd() * .3 });
      }
      const els = parts.map(() => {
        const mk = g => { const c = document.createElementNS(ns, 'circle'); c.setAttribute('r', 0); g.appendChild(c); return c; };
        return { glow: mk(burn.glow), edge: mk(burn.edge), core: mk(burn.core) };
      });
      return { x: x * W, y: y * H, s, e, R: R * base, parts, els };
    });
    burn.last = -1;
  }

  function renderBurn(p) {
    if (Math.abs(p - burn.last) < .0004) return;
    burn.last = p;
    for (const b of burn.blobs) {
      const t = easeIO(clamp((p - b.s) / (b.e - b.s)));
      const r = t * b.R;
      b.parts.forEach((pt, i) => {
        const rr = r * pt.k;
        const cx = b.x + pt.dx * r, cy = b.y + pt.dy * r;
        const el = b.els[i];
        const on = rr > .5;
        for (const [node, extra] of [[el.core, 0], [el.edge, 5 + rr * .025], [el.glow, 16 + rr * .07]]) {
          node.setAttribute('cx', cx.toFixed(1));
          node.setAttribute('cy', cy.toFixed(1));
          node.setAttribute('r', on ? (rr + extra).toFixed(1) : 0);
        }
      });
    }
    burn.cover.setAttribute('opacity', smooth(.74, .9, p).toFixed(3));
  }

  const heroTitle = $('#heroTitle');
  const heroCan = $('#heroCan');
  const heroCanWrap = $('.hero__can');
  const heroUi = $$('.hero__tag, .hero__scroll, .hero__meta');
  const inkFrom = [21, 23, 31], inkTo = [255, 255, 255];
  function renderHero(p) {
    renderBurn(p);
    const c = smooth(.34, .62, p);
    const col = inkFrom.map((v, i) => Math.round(lerp(v, inkTo[i], c)));
    heroTitle.style.color = `rgb(${col.join(',')})`;
    heroTitle.style.transform = `scale(${1 + p * .14}) translateY(${-p * 4}vh)`;
    heroTitle.style.opacity = 1 - smooth(.8, .98, p);
    heroCanWrap.style.transform = `translate(-50%, -50%) translateY(${-p * 6}vh) rotate(${lerp(0, 9, p)}deg) scale(${1 + p * .12})`;
    heroCanWrap.style.opacity = 1 - smooth(.86, 1, p);
    heroUi.forEach(el => el.style.setProperty('--ui-o', (1 - smooth(.04, .22, p)).toFixed(3)));
    spinner(heroCan).target = p * .22;
  }

  /* ---------------------------------------------------------
     Formula — topographic lines (marching squares on noise)
     --------------------------------------------------------- */
  const formula = $('#formula');
  const topo = $('#topo');
  const formulaCanWrap = $('#formulaCan');
  const formulaCan = $('[data-can]', formulaCanWrap);

  function hash(x, y) {
    let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + 1013904223) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967295;
  }
  function vnoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return lerp(lerp(a, b, u), lerp(c, d, u), v);
  }
  function fbm(x, y) {
    let s = 0, amp = .55, f = 1;
    for (let o = 0; o < 4; o++) { s += amp * vnoise(x * f, y * f); f *= 2.03; amp *= .5; }
    return s;
  }
  const SEG = [[], [[3, 2]], [[2, 1]], [[3, 1]], [[0, 1]], [[3, 0], [2, 1]], [[0, 2]], [[3, 0]],
    [[3, 0]], [[0, 2]], [[3, 2], [0, 1]], [[0, 1]], [[3, 1]], [[2, 1]], [[3, 2]], []];

  function drawTopo() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = topo.clientWidth, H = topo.clientHeight;
    if (!W || !H) return;
    topo.width = W * dpr; topo.height = H * dpr;
    const ctx = topo.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const cell = W < 700 ? 9 : 11;
    const cols = Math.ceil(W / cell) + 1, rows = Math.ceil(H / cell) + 1;
    const sc = 1 / 300;
    const f = new Float32Array(cols * rows);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x = i * cell, y = j * cell;
      f[j * cols + i] = fbm(x * sc + 3.1, y * sc + 7.7);
    }
    const levels = [];
    for (let t = .2; t < .86; t += .042) levels.push(t);
    levels.forEach((t, li) => {
      ctx.beginPath();
      for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) {
        const tl = f[j * cols + i], tr = f[j * cols + i + 1], br = f[(j + 1) * cols + i + 1], bl = f[(j + 1) * cols + i];
        const idx = (tl > t) << 3 | (tr > t) << 2 | (br > t) << 1 | (bl > t);
        if (idx === 0 || idx === 15) continue;
        const x = i * cell, y = j * cell;
        const pt = e => {
          switch (e) {
            case 0: return [x + cell * (t - tl) / (tr - tl), y];
            case 1: return [x + cell, y + cell * (t - tr) / (br - tr)];
            case 2: return [x + cell * (t - bl) / (br - bl), y + cell];
            default: return [x, y + cell * (t - tl) / (bl - tl)];
          }
        };
        for (const [a, b] of SEG[idx]) {
          const p1 = pt(a), p2 = pt(b);
          ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]);
        }
      }
      ctx.strokeStyle = li % 4 === 0 ? 'rgba(170,186,255,.34)' : 'rgba(150,168,245,.17)';
      ctx.lineWidth = li % 4 === 0 ? 1.1 : .8;
      ctx.stroke();
    });
  }

  function renderFormula() {
    const r = formula.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const p = clamp((vh - r.top) / (vh + r.height)); // 0 entering → 1 leaving
    formulaCanWrap.style.transform = `translateY(${lerp(8, -8, p)}vh) rotate(${lerp(-10, 6, p)}deg)`;
    topo.style.transform = `translateY(${lerp(-3, 3, p)}%)`;
    spinner(formulaCan).target = (p - .5) * .3;
  }

  /* ---------------------------------------------------------
     Sticky steppers (Editions, Inside, Story)
     --------------------------------------------------------- */
  const TINTS = ['#c9d0f0', '#f6b4a6', '#b7c0f6', '#f7e39a'];
  const editions = $('#editions');
  const edPanels = $$('.ed-panel', editions);
  const edCans = $$('.ed-can', editions);
  const edTicks = $$('#edTicks li');
  const edMeta = $$('#edMetaEdition b');
  const edGlow = $('#edGlow');

  const inside = $('#inside');
  const inNames = $$('.in-name', inside);
  const inDetails = $$('.in-detail', inside);
  const inTabs = $$('.tab', inside);
  const inCanWrap = $('#insideCan');
  const inCan = $('[data-can]', inCanWrap);
  const IN_TILT = [-8, 6, -4, 9];

  const story = $('#story');
  const chapters = $$('.chapter', story);
  const frames = $$('.frame', story);
  const years = $$('#storyYears li');

  const steppers = [
    {
      el: editions, n: 4, idx: -1,
      change(i) {
        setActive(edPanels, i); setActive(edTicks, i); setActive(edMeta, i);
        edCans.forEach((c, j) => {
          c.classList.toggle('is-active', j === i);
          c.classList.toggle('is-prev', j < i);
          c.classList.toggle('is-next', j > i);
        });
        edGlow.style.backgroundColor = TINTS[i];
      },
      progress(p, local, i) {
        const can = $('[data-can]', edCans[i]);
        spinner(can).target = (local - .5) * .22;
      }
    },
    {
      el: inside, n: 4, idx: -1,
      change(i) {
        setActive(inNames, i); setActive(inDetails, i); setActive(inTabs, i);
        inCanWrap.style.transform = `rotate(${IN_TILT[i]}deg)`;
      },
      progress(p, local, i) { spinner(inCan).target = i + (local - .5) * .2; }
    },
    {
      el: story, n: 4, idx: -1,
      change(i) {
        setActive(chapters, i); setActive(years, i);
        frames.forEach((f, j) => { f.classList.toggle('is-active', j === i); f.classList.toggle('is-past', j < i); });
      }
    }
  ];

  inTabs.forEach(tab => tab.addEventListener('click', () => {
    const i = +tab.dataset.step;
    const total = inside.offsetHeight - vh;
    scrollToY(inside.offsetTop + total * ((i + .5) / 4));
  }));

  function renderSteppers() {
    for (const s of steppers) {
      const r = s.el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) continue;
      const p = progressOf(s.el);
      const f = p * s.n;
      const i = Math.min(s.n - 1, Math.floor(f));
      if (i !== s.idx) { s.idx = i; s.change(i); }
      if (s.progress) s.progress(p, clamp(f - i), i);
    }
  }

  /* ---------------------------------------------------------
     Nav: visibility, theme, section index
     --------------------------------------------------------- */
  const nav = $('#nav');
  const navIndex = $('#navIndex');
  const navLinks = $$('.nav__links a');
  const themed = $$('[data-theme]');
  const indexed = $$('[data-index]');
  let lastIndex = '';
  function renderNav(heroP) {
    nav.classList.toggle('is-visible', heroP > .9 || window.scrollY > hero.offsetHeight - vh);
    const probe = 30;
    let theme = 'light';
    for (const s of themed) {
      const r = s.getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) {
        theme = s === hero ? (heroP > .6 ? 'dark' : 'light') : s.dataset.theme;
        break;
      }
    }
    nav.classList.toggle('is-dark', theme === 'dark');

    let current = indexed[0];
    for (const s of indexed) if (s.getBoundingClientRect().top <= vh * .5) current = s;
    const idx = current.dataset.index.padStart(2, '0');
    if (idx !== lastIndex) {
      lastIndex = idx;
      navIndex.textContent = idx;
      navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${current.id}`));
    }
  }

  /* ---------------------------------------------------------
     Reveal + counters
     --------------------------------------------------------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold: .18, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  const cio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      countUp(e.target);
    });
  }, { threshold: .5 });
  $$('[data-count]').forEach(el => cio.observe(el));

  function countUp(el) {
    const to = +el.dataset.count;
    const plain = el.hasAttribute('data-plain');
    const suffix = el.dataset.suffix ? `<small>${el.dataset.suffix}</small>` : '';
    const from = plain ? Math.max(0, to - 60) : 0;
    const dur = reduced ? 1 : 1700;
    const start = performance.now();
    (function step(now) {
      const t = clamp((now - start) / dur);
      const v = Math.round(lerp(from, to, 1 - Math.pow(1 - t, 4)));
      el.innerHTML = (plain ? String(v) : v.toLocaleString('en-US')) + suffix;
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }

  /* ---------------------------------------------------------
     Shop + cart
     --------------------------------------------------------- */
  const cart = [];
  const cartCount = $('#cartCount');
  const cartItems = $('#cartItems');
  const cartEmpty = $('#cartEmpty');
  const cartTotal = $('#cartTotal');
  const drawer = $('#drawer');
  const toast = $('#toast');
  let toastTimer;

  $$('.product').forEach(card => {
    const packs = $$('.pack', card);
    const price = $('.product__price b', card);
    const per = $('.product__price span', card);
    packs.forEach(btn => btn.addEventListener('click', () => {
      setActive(packs, packs.indexOf(btn));
      packs.forEach(b => b.setAttribute('aria-checked', String(b === btn)));
      price.textContent = euro.format(+btn.dataset.price);
      per.textContent = `/ ${btn.dataset.pack} cans`;
    }));
    packs.forEach(b => { b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String(b.classList.contains('is-active'))); });

    $('[data-add]', card).addEventListener('click', () => {
      const pack = $('.pack.is-active', card);
      const key = `${card.dataset.id}-${pack.dataset.pack}`;
      const found = cart.find(i => i.key === key);
      if (found) found.qty++;
      else cart.push({
        key, id: card.dataset.id, name: card.dataset.name, pack: +pack.dataset.pack,
        price: +pack.dataset.price, qty: 1, tint: card.style.getPropertyValue('--tint')
      });
      renderCart();
      cartCount.classList.remove('bump'); void cartCount.offsetWidth; cartCount.classList.add('bump');
      showToast(`Added — ${card.dataset.name} · ${pack.dataset.pack}-pack`);
    });
  });

  function renderCart() {
    const n = cart.reduce((s, i) => s + i.qty, 0);
    cartCount.textContent = n;
    cartCount.classList.toggle('has-items', n > 0);
    cartEmpty.hidden = n > 0;
    cartTotal.textContent = euro.format(cart.reduce((s, i) => s + i.qty * i.price, 0));
    cartItems.innerHTML = cart.map((i, idx) => `
      <li class="cart-item">
        <div class="cart-item__thumb" style="--tint:${i.tint}"><div data-can="${i.id}"></div></div>
        <div>
          <p class="cart-item__name">${i.name}</p>
          <p class="cart-item__meta">${i.pack}-pack · ${euro.format(i.price)}</p>
          <div class="qty"><button type="button" data-dec="${idx}" aria-label="Remove one">−</button><span>${i.qty}</span><button type="button" data-inc="${idx}" aria-label="Add one">+</button></div>
        </div>
        <p class="cart-item__price">${euro.format(i.price * i.qty)}</p>
      </li>`).join('');
    $$('[data-can]', cartItems).forEach(buildCan);
  }
  cartItems.addEventListener('click', e => {
    const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]');
    if (inc) cart[+inc.dataset.inc].qty++;
    if (dec) { const i = +dec.dataset.dec; if (--cart[i].qty <= 0) cart.splice(i, 1); }
    if (inc || dec) renderCart();
  });

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2200);
  }
  function openDrawer(on) {
    drawer.classList.toggle('is-open', on);
    drawer.setAttribute('aria-hidden', String(!on));
    lockScroll(on);
    if (on) $('.drawer__close', drawer).focus();
  }
  $('#cartBtn').addEventListener('click', () => openDrawer(true));
  $$('[data-close]', drawer).forEach(el => el.addEventListener('click', () => openDrawer(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) openDrawer(false); });
  renderCart();

  $('#year').textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     Resize + main loop
     --------------------------------------------------------- */
  /* footer wordmark spans the full width */
  const footWord = $('.footer__word');
  function fitFooter() {
    footWord.style.fontSize = '100px';
    const avail = footWord.parentElement.clientWidth - parseFloat(getComputedStyle(footWord.parentElement).paddingLeft) * 2;
    footWord.style.fontSize = `${(100 * avail / footWord.scrollWidth).toFixed(2)}px`;
  }
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(fitFooter);

  let resizeTimer;
  function onResize() {
    vw = innerWidth; vh = innerHeight;
    layoutBurn();
    fitFooter();
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawTopo, 150);
  }
  addEventListener('resize', onResize);
  layoutBurn();
  drawTopo();

  function frame(t) {
    if (lenis) lenis.raf(t);
    const heroP = progressOf(hero);
    renderHero(heroP);
    renderFormula();
    renderSteppers();
    renderNav(heroP);
    tickSpinners();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
