// @ts-nocheck  (ported as is from the White Room preview: C:\dev\White Room Scene\portfolio.html)
/* v4 home: the White Room. The page scrolls vertically; that scroll slides the panels sideways, each with a
   soft floor shadow baked into a flat 2D canvas (no 3D layers: they crashed iPhone Safari). */
import gsap from 'gsap';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Typewriter for the hero line. shortcut: timings eyeballed from the live site, not read from its source. */
function typewriter(onChange = () => {}) {
  const lines = document.querySelectorAll('.v3-type[data-endings]');
  if (!lines.length || reduce) return;
  const endings = JSON.parse(lines[0].dataset.endings);
  lines.forEach((l) => l.classList.add('is-typing'));
  const set = (t) => { document.querySelectorAll('[data-type-text]').forEach((n) => { n.textContent = t; }); onChange(); };
  let i = 0, n = 0, dir = 1;
  set('');
  const step = () => {
    const word = endings[i];
    n += dir;
    set(word.slice(0, n));
    let wait = dir > 0 ? 75 : 38;
    if (dir > 0 && n === word.length) { dir = -1; wait = 1900; }
    else if (dir < 0 && n === 0) { dir = 1; i = (i + 1) % endings.length; wait = 380; }
    setTimeout(step, wait);
  };
  setTimeout(step, 600);
}

// fonts + the portrait ready, so measurements are final (other pictures are lazy and carry their size)
async function ready(el) {
  try {
    await Promise.all(['400', '500', '600'].map((w) => document.fonts.load(`${w} 40px "Inter Tight Variable"`))
      .concat(document.fonts.load('italic 400 40px "Instrument Serif"')));
    await document.fonts.ready;
  } catch (e) { /* system fonts */ }
  await Promise.all([...el.querySelectorAll('img')].map((i) => i.decode().catch(() => {})));
}

  const root = document.documentElement;
  const track = document.getElementById('track');

  /* ---- content: hero, brief, story, the seven stages and contact are all rendered by Astro (v4/index.astro) ---- */
  const hero = track.querySelector('.panel');
  const panels = [...track.querySelectorAll('.panel')];
  // rail menu: one stop per stage, rendered by Astro (placed in layout(), the current one marked in render())
  const railStops = [...document.querySelectorAll('.rail__stop')]
    .map((a) => ({ a, i: panels.indexOf(document.getElementById(a.hash.slice(1))) }));
  const floor3d = document.querySelector('.floor-3d');
  const TEST = new URLSearchParams(location.search).get('test');
  if (TEST === 'noshadows' || TEST === 'nofx') root.classList.add('t-' + TEST);
  const noShadows = root.classList.contains('t-' + TEST);
  const shadows = panels.map(() => floor3d.appendChild(Object.assign(document.createElement('div'), { className: 'shadow-plane' })));

  /* ---- shadows, baked per layout into a small canvas (moving them costs nothing); parts that change on their own
     (the pen drawing and erasing the loop) are redrawn live, so their shadows come and go with them. The typed line
     casts the shadow of its longest phrase, baked once: redrawing it per letter kept phones busy forever (PageSpeed):
     1. mass: everything in the section that blocks light (cards, images, pen lines, lines of text) drawn as solid
        shapes, then grown a little so a paragraph or a drawing casts one shadow, like one real object;
     2. soft shadow: under a big softbox a part that floats higher casts a wider, fainter shadow. The mass is blurred
        at 12 heights and neighbouring heights fade into each other, so there are no steps;
     3. same darkness as the hero: matched through opacity only (never by brightening pixels, which shows contour rings).
     Only shapes are drawn, never image pixels, so the canvas stays readable when the page is opened as a file. ---- */
  const S = 0.25;                                                     // a soft shadow needs few pixels
  const SHADE = 0.62;                                                 // shadow strength at the floor, before matching
  const DARK = 63;                                                    // every section's shadow is matched to this darkness (the hero's on a 1440px screen)
  const canFilter = 'filter' in CanvasRenderingContext2D.prototype;
  const canvas = (cw, ch) => Object.assign(document.createElement('canvas'), { width: cw, height: ch });
  function blurred(src, r, t = canvas(src.width, src.height)) {   // into t (reused by the live shadows)
    const c = t.getContext('2d');
    c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, t.width, t.height);
    c.filter = `blur(${r}px)`; c.drawImage(src, 0, 0); c.filter = 'none';
    return t;
  }
  // one box-blur pass over a w x h grid of alpha values (three passes each way approximate a Gaussian)
  function boxPass(from, to, w, h, half, horiz) {
    const n = horiz ? w : h, lines = horiz ? h : w, st = horiz ? 1 : w, div = 2 * half + 1;
    for (let l = 0; l < lines; l++) {
      const o0 = horiz ? l * w : l;
      let sum = 0;
      for (let k = -half; k <= half; k++) sum += from[o0 + Math.min(n - 1, Math.max(0, k)) * st];
      for (let k = 0; k < n; k++) {
        to[o0 + k * st] = sum / div;
        sum += from[o0 + Math.min(n - 1, k + half + 1) * st] - from[o0 + Math.max(0, k - half) * st];
      }
    }
  }
  // how dark a shadow reads: the 95th-percentile alpha of its shaded pixels (a single hot spot can't skew it)
  function darkness(cv) {
    try {
      const px = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data, hist = new Uint32Array(256);
      let n = 0;
      for (let j = 3; j < px.length; j += 4) if (px[j] > 6) { hist[px[j]]++; n++; }
      for (let a = 255, seen = 0; a > 0; a--) if ((seen += hist[a]) >= n * 0.05) return a;
      return 0;
    } catch { return -1; }
  }
  // returns { dark: darkness before matching, live: redraws the shadow as the moving parts are now (null if none) }
  function bake(el, plane, w, h, f, gap, ref, geo) {
    const u = 1 / f;                                                    // rects are scaled by --fit; work unscaled
    const lift = (y) => gap + h - y;                                    // height of row y above the floor
    // big softbox: penumbra about a fifth of the height; darkness halves by ~400px up
    const rOf = (y) => 0.2 * lift(y), aOf = (y) => SHADE * 400 / (400 + lift(y));
    const pad = Math.ceil(2.5 * rOf(0)), G = 10;                       // G: how far the mass grows, panel px
    const W = Math.ceil((w + 2 * pad) * S), H = Math.ceil((h + 2 * pad) * S);
    const place = (c) => c.setTransform(S, 0, 0, S, pad * S, pad * S);
    let R = el.getBoundingClientRect();                                 // re-read on every live redraw (the panel travels)
    const at = (r) => [(r.left - R.left) * u, (r.top - R.top) * u, r.width * u, r.height * u];
    const box = (c, r, rad) => { const b = at(r); c.beginPath(); c.roundRect(...b, rad ?? b[3] * 0.3); c.fill(); };
    const MOVING = 'svg[data-sketch], .v3-type__live';                 // drawn and erased by the pen / typed and deleted

    // 1a. mass, still parts (once per layout)
    const still = canvas(W, H), c = still.getContext('2d');
    place(c);
    for (const n of el.querySelectorAll('*:not(svg *)')) {             // cards and frames
      const bg = getComputedStyle(n).backgroundColor, r = n.getBoundingClientRect();
      if (!r.width || bg === 'transparent' || /,\s*0\)$/.test(bg) || n.matches('.v3-type__caret')) continue;
      box(c, r, parseFloat(getComputedStyle(n).borderTopLeftRadius) || 0);
    }
    for (const img of el.querySelectorAll('img')) {                    // pictures: their frames; the portrait: head and neck
      const r = img.getBoundingClientRect();
      if (!r.width) continue;
      const [x, y, iw, ih] = at(r);
      if (img.matches('.v3-hero__head-img')) {
        c.beginPath(); c.ellipse(x + iw * 0.5, y + ih * 0.38, iw * 0.37, ih * 0.32, 0, 0, 7); c.fill();
        c.beginPath(); c.roundRect(x + iw * 0.33, y + ih * 0.55, iw * 0.34, ih * 0.27, iw * 0.15); c.fill();
      } else c.fillRect(x, y, iw, ih);
    }
    const range = document.createRange();
    const textBoxes = (cx, root, hidden = false) => {                   // each line of text as its box
      const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let t; (t = walk.nextNode());) {
        const pe = t.parentElement;   // skip: the outline twin, the 1px screen-reader copy, moving parts (unless asked for)
        if (!t.data.trim() || pe.closest('.v3-hero__title--outline') || pe.getBoundingClientRect().width <= 1) continue;
        if (!hidden && getComputedStyle(pe).visibility === 'hidden') continue;   // invisible layout copies (the typing sizer) cast nothing
        if (root === el && pe.closest(MOVING)) continue;
        range.selectNodeContents(t);
        for (const r of range.getClientRects()) if (r.width > 2) box(cx, r);
      }
    };
    textBoxes(c, el);

    // 1b. mass, moving parts, as they are right now (whole = fully drawn, used once to set the darkness)
    const svgs = [...el.querySelectorAll('svg[data-sketch]')].filter((s) => s.getBoundingClientRect().width);   // wide or tall drawing
    const typed = [...el.querySelectorAll('.v3-type__live')];
    const paths = svgs.flatMap((svg) => [...svg.querySelectorAll('path')].filter((p) => p.getAttribute('d'))
      .map((p) => ({ p, d: new Path2D(p.getAttribute('d')), k: p.getTotalLength() / (+p.getAttribute('pathLength') || p.getTotalLength() || 1) })));
    const notes = svgs.flatMap((svg) => [...svg.querySelectorAll('text')].map((t) => ({ t, svg })));
    const shown = (n, top) => {                                         // opacity of n inside its drawing (the pen fades notes in and out)
      let o = 1;
      for (; n && n !== top; n = n.parentElement) { const s = getComputedStyle(n); if (s.visibility === 'hidden' || s.display === 'none') return 0; o *= +s.opacity; }
      return o;
    };
    const sil = canvas(W, H), sc = sil.getContext('2d');
    function drawMoving(whole) {
      R = el.getBoundingClientRect();
      sc.setTransform(1, 0, 0, 1, 0, 0); sc.globalAlpha = 1; sc.clearRect(0, 0, W, H); sc.drawImage(still, 0, 0);
      sc.lineCap = sc.lineJoin = 'round';
      for (const { p, d, k } of paths) {                                // pen lines, only the part the pen has drawn
        const m = p.getScreenCTM();
        if (!m) continue;
        const cs = getComputedStyle(p), dash = whole ? 'none' : cs.strokeDasharray;
        sc.setTransform(S * u * m.a, S * u * m.b, S * u * m.c, S * u * m.d, S * (u * (m.e - R.left) + pad), S * (u * (m.f - R.top) + pad));
        sc.lineWidth = 9 / (u * Math.hypot(m.a, m.b));                 // 9 panel px wide
        sc.setLineDash(dash && dash !== 'none' ? dash.split(/[\s,]+/).map((v) => parseFloat(v) * k) : []);
        sc.lineDashOffset = dash && dash !== 'none' ? parseFloat(cs.strokeDashoffset) * k : 0;
        sc.stroke(d);
      }
      sc.setLineDash([]); place(sc);
      for (const { t, svg } of notes) {                                // hand-written notes and numbers
        const o = whole ? (t.matches('[data-note-loop]') ? 0 : 1) : shown(t, svg);
        if (o < 0.02) continue;
        sc.globalAlpha = Math.min(1, o); box(sc, t.getBoundingClientRect());
      }
      sc.globalAlpha = 1;
      // the typed words: always the longest phrase (its invisible sizer copy), so typing never needs a redraw
      for (const t of typed) { const z = t.parentElement.querySelector('.v3-type__sizer'); textBoxes(sc, z || t, !!z); }
    }

    // 2. grow by G (a disc dilation, so lines of a paragraph join into one mass), then the soft shadow by height
    const mass = canvas(W, H), m = mass.getContext('2d', { willReadFrequently: !canFilter }), tmp = canvas(W, H), tc = tmp.getContext('2d');
    const out = canvas(W, H), o = out.getContext('2d'), N = 12, step = H / (N - 1);
    const bands = Array.from({ length: N }, (_, b) => {
      const cy = b * step, y = Math.min(h, Math.max(0, cy / S - pad));
      // tent weight: 1 at this height's centre, 0 at its neighbours' (the tents add up to 1 everywhere)
      const g = tc.createLinearGradient(0, cy - step, 0, cy + step), clear = 'rgba(0,0,0,0)';
      g.addColorStop(0, b ? clear : '#000'); g.addColorStop(0.5, '#000'); g.addColorStop(1, b < N - 1 ? clear : '#000');
      return { r: rOf(y) * S, a: aOf(y), g };
    });
    function render(k) {
      m.globalCompositeOperation = 'source-over'; m.clearRect(0, 0, W, H); m.drawImage(sil, 0, 0);
      for (const g of [G * S, G * S / 2]) for (let j = 0; j < 16; j++) m.drawImage(sil, Math.cos(j * Math.PI / 8) * g, Math.sin(j * Math.PI / 8) * g);
      if (!canFilter) return renderJS(k);
      m.globalCompositeOperation = 'source-in'; m.fillStyle = '#262a36'; m.fillRect(0, 0, W, H);   // one cool grey
      o.globalCompositeOperation = 'source-over'; o.globalAlpha = 1; o.clearRect(0, 0, W, H);
      o.globalCompositeOperation = 'lighter';                          // same grey everywhere, so adding = blending
      for (const { r, a, g } of bands) {
        blurred(mass, r, tmp);
        tc.globalCompositeOperation = 'destination-in'; tc.fillStyle = g; tc.fillRect(0, 0, W, H);
        o.globalAlpha = Math.min(0.95, a * k); o.drawImage(tmp, 0, 0);
      }
      o.globalAlpha = 1; o.globalCompositeOperation = 'source-over';
    }
    // no canvas filter (Safari, iPhone): the same bands in plain JS. A wide soft blur needs few samples, so each band is
    // blurred on a grid shrunk to about half its radius, then read back smoothly. One pixel read per redraw and buffers
    // kept between redraws: fast, and no garbage for a phone to collect (heavy garbage got the page killed on iOS).
    let A = null, O = null, img = null;
    const grids = new Map();
    function renderJS(k) {
      A ||= new Float32Array(W * H); O ||= new Float32Array(W * H); img ||= o.createImageData(W, H);
      const src = m.getImageData(0, 0, W, H).data;
      for (let i = 0; i < W * H; i++) A[i] = src[i * 4 + 3];
      O.fill(0);
      for (const g of grids.values()) g.ready = false;
      for (let b = 0; b < N; b++) {
        const { r, a } = bands[b], cy = b * step, wa = Math.min(0.95, a * k);
        const d = 2 ** Math.floor(Math.log2(Math.max(1, r / 2)));     // grid step (powers of two, so bands share grids)
        let g = grids.get(d);
        if (!g) {
          const ws = Math.ceil(W / d), hs = Math.ceil(H / d), x0 = new Int32Array(W), x1 = new Int32Array(W), tx = new Float32Array(W);
          for (let x = 0; x < W; x++) { const f = Math.min(ws - 1, Math.max(0, (x + 0.5) / d - 0.5)); x0[x] = f | 0; x1[x] = Math.min(ws - 1, x0[x] + 1); tx[x] = f - x0[x]; }
          g = { ws, hs, base: new Float32Array(ws * hs), blur: new Float32Array(ws * hs), t: new Float32Array(ws * hs), x0, x1, tx, ready: false };
          grids.set(d, g);
        }
        const { ws, hs, base, blur, t } = g;
        if (!g.ready) {                                                  // shrink: average each d x d block
          for (let ys = 0; ys < hs; ys++) for (let xs = 0; xs < ws; xs++) {
            let sum = 0, n = 0;
            for (let y = ys * d; y < Math.min(H, ys * d + d); y++) for (let x = xs * d; x < Math.min(W, xs * d + d); x++) { sum += A[y * W + x]; n++; }
            base[ys * ws + xs] = sum / n;
          }
          g.ready = true;
        }
        const rs = r / d, half = Math.max(1, Math.round((Math.sqrt(4 * rs * rs + 1) - 1) / 2));   // 3 boxes of this width = blur(r)
        boxPass(base, t, ws, hs, half, true); boxPass(t, blur, ws, hs, half, true); boxPass(blur, t, ws, hs, half, true);
        boxPass(t, blur, ws, hs, half, false); boxPass(blur, t, ws, hs, half, false); boxPass(t, blur, ws, hs, half, false);
        // add this band where its tent weight is above 0
        const y0 = b ? Math.max(0, Math.floor(cy - step)) : 0, y1 = b < N - 1 ? Math.min(H - 1, Math.ceil(cy + step)) : H - 1;
        for (let y = y0; y <= y1; y++) {
          const wt = (b === 0 && y <= cy) || (b === N - 1 && y >= cy) ? 1 : Math.max(0, 1 - Math.abs(y - cy) / step);
          if (!wt) continue;
          const fy = Math.min(hs - 1, Math.max(0, (y + 0.5) / d - 0.5)), iy = fy | 0, iy1 = Math.min(hs - 1, iy + 1), ty = fy - iy, s0 = iy * ws, s1 = iy1 * ws, mul = wa * wt;
          for (let x = 0; x < W; x++) {
            const a0 = blur[s0 + g.x0[x]], a1 = blur[s0 + g.x1[x]], b0 = blur[s1 + g.x0[x]], b1 = blur[s1 + g.x1[x]], tx = g.tx[x];
            O[y * W + x] += mul * ((a0 + (a1 - a0) * tx) * (1 - ty) + (b0 + (b1 - b0) * tx) * ty);
          }
        }
      }
      const px = img.data;
      for (let i = 0; i < W * H; i++) { px[i * 4] = 0x26; px[i * 4 + 1] = 0x2a; px[i * 4 + 2] = 0x36; px[i * 4 + 3] = O[i]; }
      o.putImageData(img, 0, 0);
    }

    // 3. same darkness everywhere: measured with the moving parts whole, so a half-drawn loop casts a lighter shadow
    drawMoving(true); render(1);
    const dark = darkness(out), k = ref > 0 && dark > 0 ? Math.min(3, Math.max(0.5, ref / dark)) : 1;
    // 4. lay it on the floor: the shadow is a plane tilted back by geo.t about its near edge, seen with perspective
    // geo.P from the horizon line. A row v px behind the near edge shows m = P / (P + v sin t) as wide, and m turns out
    // linear in screen height (m = 1 + y / D), so each screen row maps straight back to one row of `out`.
    const sn = Math.sin(geo.t * Math.PI / 180), D = geo.A + geo.P * Math.cos(geo.t * Math.PI / 180) / sn;
    const mOf = (v) => geo.P / Math.max(geo.P / 3, geo.P + v * sn);   // capped: the strip in front of the edge leans toward us
    const q = Math.min(0.5, S / f), wc = (w + 2 * pad) * f;            // q: canvas px per screen px (a soft shadow needs few)
    const yt = (mOf((h + pad) * f) - 1) * D, yb = (mOf(-pad * f) - 1) * D, wmax = wc * mOf(-pad * f);
    const scr = canvas(Math.ceil(wmax * q), Math.ceil((yb - yt) * q)), pc = scr.getContext('2d');
    function project() {
      pc.clearRect(0, 0, scr.width, scr.height);
      for (let j = 0; j < scr.height; j++) {
        const y = yt + (j + 0.5) / q, m = 1 + y / D, v = geo.P / sn * (1 / m - 1), sy = (h + pad - v / f) * S;
        // a floor shadow never climbs the wall: it fades out as the floor curves up into the cove
        const fade = Math.min(1, (geo.sb + y - geo.oy - 0.005 * innerHeight) / (0.065 * innerHeight));
        if (sy < 0 || sy > H - 1 || fade <= 0) continue;
        const dw = wc * m * q;
        pc.globalAlpha = fade; pc.drawImage(out, 0, sy, W, 1, (scr.width - dw) / 2, j, dw, 1);
      }
      pc.globalAlpha = 1;
    }
    const moves = svgs.length || typed.length, live = () => { drawMoving(false); render(k); project(); };
    if (moves) live(); else { if (k !== 1) render(k); project(); }   // a still section only needs its darkness matched once
    scr.style.cssText = `left:${-scr.width / q / 2}px;top:${yt}px;width:${scr.width / q}px;height:${scr.height / q}px`;
    for (const old of plane.querySelectorAll('canvas')) old.width = old.height = 0;   // free the last shadow now
    plane.replaceChildren(scr);
    plane.style.setProperty('--D', D.toFixed(1) + 'px');
    if (!moves) { for (const cv of [still, sil, mass, tmp, out]) cv.width = cv.height = 0; A = O = img = null; grids.clear(); }
    return { dark, live: moves ? live : null };
  }

  // live shadows: redraw at most once a frame, and only for shadows near the screen
  const live = [], liveDue = new Set();
  let liveRaf = 0;
  function refresh(i) {
    if (!live[i]) return;
    liveDue.add(i);
    liveRaf ||= requestAnimationFrame(() => {
      liveRaf = 0;
      for (const j of liveDue) if (live[j] && !shadows[j].classList.contains('off')) live[j]();
      liveDue.clear();
    });
  }

  /* ---- layout: fit each panel above the floor, lay them out in a row, size the scroll ---- */
  const pct = (n) => innerHeight * parseFloat(getComputedStyle(root).getPropertyValue(n)) / 100;
  let xs = [], maxX = 0, railX0 = 0, railSpan = 1;
  const rail = document.querySelector('.rail'), home = rail.querySelector('.rail__home') || document.createElement('a');   // gallery pages have no portrait head
  rail.style.setProperty('--rs', 0);   // the grey track starts undrawn (first-pass reveal, see render())
  // each vertical stage name runs exactly as tall as its number: letter-spacing stretches it, or the font shrinks if too long
  function fitLabels() {
    for (const lb of document.querySelectorAll('.stage__label')) {
      lb.style.letterSpacing = '0'; lb.style.fontSize = ''; lb.style.inlineSize = '';   // (keeps the reveal's --i)
      const H = lb.previousElementSibling.offsetHeight, L = lb.offsetHeight, n = lb.textContent.length;
      if (L > H) lb.style.fontSize = (parseFloat(getComputedStyle(lb).fontSize) * H / L).toFixed(2) + 'px';
      else lb.style.letterSpacing = ((H - L) / Math.max(1, n - 1)).toFixed(2) + 'px';
      lb.style.inlineSize = H + 'px';   // box = number height; the spacing after the last letter overflows unseen at the top
    }
  }
  // shadows far off screen bake later, one per idle moment: baking all eleven at load blocked a phone for ~0.4 s
  // (PageSpeed TBT). render() bakes any still waiting the moment its panel nears the screen.
  const unbaked = new Map(), idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 50));
  let idleId = 0;
  function bakeNow(i) { const job = unbaked.get(i); if (job) { unbaked.delete(i); live[i] = job(); } }
  function bakeIdle() {
    const [i] = unbaked.keys();
    bakeNow(i);
    idleId = unbaked.size ? idle(bakeIdle, { timeout: 3000 }) : 0;
  }
  let lastSig = '';
  function layout() {
    fitLabels();
    // load fires layout up to four times (first run, resize observer, fonts, portrait); re-baking every shadow
    // costs about a quarter second on a phone, so skip it when no size and no font has changed since the last one
    const sig = [innerWidth, innerHeight, document.fonts.status, ...panels.map((p) => p.firstElementChild.offsetWidth + 'x' + p.firstElementChild.offsetHeight)].join();
    if (sig === lastSig) return;
    lastSig = sig;
    const base = pct('--base'), d = pct('--sb') - pct('--hz'), P = innerHeight * 1.2;
    const navH = document.querySelector('.v3-nav').offsetHeight;
    root.style.setProperty('--foot-h', document.querySelector('.v3-footer').offsetHeight + 'px');
    const gap = Math.max(innerWidth * 0.22, 96), zone = base - navH - 8;   // panels sit between the menu and the floor
    const gapPx = pct('--sb') - base;   // empty space under a section, down to its shadow's near edge
    root.style.setProperty('--persp', P.toFixed(0) + 'px');
    let x = 0, prevHalf = 0;
    xs = panels.map((p, i) => {
      const el = p.firstElementChild, w = el.offsetWidth, h = el.offsetHeight;
      const f = Math.max(0.05, Math.min(1, zone / h, (innerWidth - 16) / w));   // floor: a 0-wide window mid-resize must not go negative
      // shadow tilt: far edge lands just in front of the wall (same solve as css.html)
      const hh = h * f; let lo = 20, hi = 89.5;
      for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2, r = m * Math.PI / 180;
        if ((d - hh * Math.cos(r)) * P / (P + hh * Math.sin(r)) < d * 0.12) lo = m; else hi = m; }
      if (i) x += prevHalf + gap + (w * f) / 2;
      prevHalf = (w * f) / 2;
      for (const t of [p, shadows[i]]) { t.style.setProperty('--x', x + 'px'); t.style.setProperty('--fit', f.toFixed(4)); }
      const lifted = (zone - h * f) / 2;
      p.style.setProperty('--lift', lifted.toFixed(1) + 'px');   // short panels float mid-wall, not on the floor
      // every shadow, the hero's too, is matched to the same darkness (DARK), lighter or darker
      const geo = { t: lo, P, A: d, sb: pct('--sb'), oy: pct('--hz') };
      live[i] = null;
      if (!noShadows) unbaked.set(i, () => bake(el, shadows[i], w, h, f, (gapPx + lifted) / f, DARK, geo).live);
      return x;
    });
    maxX = xs[xs.length - 1];
    // the rail runs from stage 01 to stage 07, so its line starts at 01
    railX0 = xs[railStops[0].i]; railSpan = xs[railStops[railStops.length - 1].i] - railX0 || 1;
    railStops.forEach((s) => s.a.style.setProperty('--at', ((xs[s.i] - railX0) / railSpan).toFixed(4)));
    const lastSeen = railStops.filter((s) => s.seen).pop();
    if (lastSeen) rail.style.setProperty('--rs', lastSeen.a.style.getPropertyValue('--at'));   // keep the drawn track on its stop after a resize
    rail.style.setProperty('--gap1', ((xs[(railStops[1] || railStops[0]).i] - railX0) / railSpan).toFixed(4));   // one stop: no gap   // the head sits one stage-gap before 01
    // 1px of vertical scroll = 1px sideways; dvh keeps the end reachable while a phone's address bar comes and goes
    document.body.style.height = `calc(100vh + ${maxX}px)`; document.body.style.height = `calc(100dvh + ${maxX}px)`;
    document.getElementById('snaps').innerHTML = xs.map((v) => `<i class="snap" style="top:${v}px"></i>`).join('');
    target = scrollY; render();   // bakes the shadows on screen now
    idleId ||= unbaked.size ? idle(bakeIdle, { timeout: 3000 }) : 0;
    root.classList.remove('room-wait');   // panels are placed: show the rest (see V4Layout)
  }

  /* ---- reveal: tag each section's lines in reading order (--i sets the stagger) ---- */
  if (!reduce) {
    root.classList.add('js-reveal');
    const RV = 'h1.v3-hero__title .v3-hero__word, .v3-hero__head, .v3-hero__role, .v3-hero__line, .brief > *, .v3-story__title > *, .v3-loop, '
      + '.stage__n, .stage__label, .stage__title, .stage__body, .stage__rule, .stage__gets, '
      + '[data-stage-card], .v3-proof__intro, .v3-points, .v3-proof__note, .v3-proof__visit, .v3-proof__link, '
      + '.covers > li, .stage__link';   // v4 Work gallery
    panels.forEach((p, k) => {
      // the first panel shows at once: hiding it until this script runs made it the page's slowest paint (PageSpeed LCP)
      const lines = k === 0 ? [] : p.querySelectorAll(RV);
      lines.forEach((n, i) => { n.classList.add('rv'); n.style.setProperty('--i', i); });
      // the shadow sweeps in over the same time the lines take to appear (90ms stagger + about 1s to settle)
      shadows[k].style.setProperty('--rv-dur', Math.min(2600, lines.length * 90 + 1100) + 'ms');
    });
    // (the hero's outline title stays put with its solid twin: neither rises in)
  }

  /* ---- the hand-drawn loop: sketch() from MyPortfolio src/scripts/v3-motion.ts, ported to plain JS.
     First pass draws 01 → 07 once, then the purple 05 → 06 → 07 → 05 cycle repeats while the panel
     is on screen. No GSAP or reduced motion: the static drawing (cycle already drawn) stays. ---- */
  const storyPanel = document.getElementById('story');
  let loopOnScreen = () => {};
  if (!reduce && storyPanel) loopOnScreen = sketch(storyPanel.querySelector('[data-sketch-wrap]'));   // home only
  function sketch(wrap) {
    const DASH = '100 200', HIDE = 102, CYCLE_GAP = 0.6, HEAD = 0.12, HOLD = 1.4, LOOP_STROKE = 3;
    let onScreen = false;
    const firstPass = gsap.timeline({ paused: true });
    const loop = gsap.timeline({ paused: true, repeat: -1, repeatDelay: CYCLE_GAP });
    const firstLap = gsap.timeline({ paused: true, onComplete: () => { if (onScreen) loop.play(); } });

    for (const svg of wrap.querySelectorAll('[data-sketch]')) {
      const q = (sel) => [...svg.querySelectorAll(sel)];
      const drawing = gsap.timeline();
      const pen = { ease: 'power1.inOut', autoRound: false, immediateRender: false };
      gsap.set(svg.querySelectorAll('[data-sk] path'), { strokeDasharray: DASH, strokeDashoffset: HIDE, autoRound: false });
      for (const group of svg.querySelectorAll('[data-sk]')) {
        const texts = group.querySelectorAll('text:not([data-note-loop])');
        if (group.dataset.sk === 'seg') {
          drawing.fromTo(group.querySelectorAll('[data-part="line"]'), { strokeDasharray: DASH, strokeDashoffset: HIDE }, { strokeDashoffset: 0, duration: 0.28, ...pen }, '>-0.04');
          drawing.fromTo(group.querySelectorAll('[data-part="head"]'), { strokeDasharray: DASH, strokeDashoffset: HIDE }, { strokeDashoffset: 0, duration: 0.1, ease: 'none', autoRound: false, immediateRender: false }, '>');
        } else {
          drawing.fromTo(group.querySelectorAll('path'), { strokeDasharray: DASH, strokeDashoffset: HIDE }, { strokeDashoffset: 0, duration: 0.26, ...pen }, '>-0.04');
        }
        if (texts.length) drawing.from(texts, { autoAlpha: 0, y: 10, duration: 0.3, ease: 'back.out(2)', stagger: 0.06 }, '<0.08');
      }
      firstPass.add(drawing, 0);

      const part = (key, which) => q(`${key} [data-part="${which}"]`);
      const pair = (key) => ({ line: part(key, 'line'), head: part(key, 'head') });
      const ret = pair('[data-cycle="return"]'), purple1 = pair('[data-cycle="c1"]'), purple2 = pair('[data-cycle="c2"]');
      const ink1 = pair('[data-repeat="c1"]'), ink2 = pair('[data-repeat="c2"]');
      const node05 = q('[data-repeat="n0"] path'), node06 = q('[data-repeat="n1"] path'), node07 = q('[data-repeat="n2"] path');
      const noteSwap = (k) => ({ from: svg.querySelector(`[data-repeat="${k}"] [data-note-first]`), to: svg.querySelector(`[data-repeat="${k}"] [data-note-loop]`) });
      const swap05 = noteSwap('n0'), swap06 = noteSwap('n1');
      gsap.set([...ret.line, ...ret.head, ...purple1.line, ...purple1.head, ...purple2.line, ...purple2.head], { strokeDasharray: DASH, strokeDashoffset: HIDE, autoRound: false });
      const num = (k) => svg.querySelector(`[data-repeat="${k}"] .sk-n`);
      const num05 = num('n0'), num06 = num('n1'), num07 = num('n2');
      const flat = { ease: 'none', immediateRender: false, autoRound: false };
      const cycle = (tl) => ({
        draw: (el, duration, at) => tl.fromTo(el, { strokeDashoffset: HIDE }, { strokeDashoffset: 0, duration, ...flat }, at),
        erase: (el, at) => tl.fromTo(el, { strokeDashoffset: 0 }, { strokeDashoffset: -HIDE, duration: 0.16, ...flat }, at),
        fade: (el, to, at, duration = 0.16) => { if (el) tl.fromTo(el, { autoAlpha: 1 - to }, { autoAlpha: to, duration, ...flat }, at); },
      });
      const clearAll = (tl, at, a1, a2, firstClear) => {
        const { erase, fade } = cycle(tl);
        const steps = [[ret.head], [ret.line], [node07, num07], [a2.head], [a2.line], [node06, num06], [a1.head], [a1.line]];
        steps.forEach(([el, n], k) => { erase(el, at + k * 0.06); fade(n ?? null, 0, at + k * 0.06); });
        if (firstClear) {
          for (const { from, to } of [swap05, swap06]) { fade(from, 0, at, 0.3); fade(to, 1, at, 0.3); }
          tl.fromTo(node05, { strokeWidth: 1 }, { strokeWidth: LOOP_STROKE, duration: 0.3, ...flat }, at);
          tl.set(node05, { stroke: '#2340FF' }, at);                    // 05 turns cobalt as the loop begins
          if (num05) tl.set(num05, { fill: '#2340FF' }, at);
        }
        at += 0.16 + (steps.length - 1) * 0.06;
        // 06 and 07 come back in cobalt: each circle + number is redrawn with its arrow in the loop
        tl.set([...node06, ...node07], { strokeWidth: LOOP_STROKE, stroke: '#2340FF' }, at);
        if (firstClear) tl.set([num06, num07].filter(Boolean), { fill: '#2340FF' }, at);
        return at;
      };

      const first = gsap.timeline();
      { const { draw } = cycle(first); let at = 0;
        first.set([...ret.line, ...ret.head], { strokeWidth: 1, stroke: 'var(--text)' }, at);
        draw(ret.line, 0.48, at); draw(ret.head, HEAD, at + 0.48);
        at += 0.48 + HEAD + HOLD * 0.5;
        first.set({}, {}, clearAll(first, at, ink1, ink2, true) + CYCLE_GAP); }
      firstLap.add(first, 0);

      const again = gsap.timeline();
      { const { draw, fade } = cycle(again);
        again.set([...ret.line, ...ret.head], { strokeWidth: LOOP_STROKE, stroke: '#2340FF' }, 0);   // the repeating 05→07 loop is the only cobalt
        let at = 0;
        for (const [el, duration, n] of [[purple1.line, 0.34], [purple1.head, HEAD], [node06, 0.28, num06], [purple2.line, 0.34],
          [purple2.head, HEAD], [node07, 0.28, num07], [ret.line, 0.48], [ret.head, HEAD]]) {
          draw(el, duration, at); fade(n ?? null, 1, at, duration); at += duration;
        }
        clearAll(again, at + HOLD, purple1, purple2, false); }
      loop.add(again, 0);
    }
    firstPass.eventCallback('onComplete', () => {
      if (onScreen) firstLap.play();
    });

    // the drawing's shadow follows the pen: redrawn about 20 times a second while any part of it is moving
    let lastShade = 0;
    gsap.ticker.add((time) => {
      if (time - lastShade < (canFilter ? 0.05 : 0.1) || !(firstPass.isActive() || firstLap.isActive() || loop.isActive())) return;
      lastShade = time; refresh(panels.indexOf(storyPanel));
    });
    // replaces the live site's ScrollTrigger: called from render() with "is the panel near the centre"
    return (on) => {
      if (on === onScreen) return;
      onScreen = on;
      if (!on) { firstLap.pause(); loop.pause(); return; }
      if (firstPass.progress() === 0) firstPass.play();
      else if (firstPass.progress() < 1) return;
      else if (firstLap.progress() < 1) firstLap.play();
      else loop.play();
    };
  }

  /* ---- contact letter roll: each word gets a random font and colour as the pointer enters it
     (rollRandom() from v3-motion.ts; live.css does the roll itself) ---- */
  if (matchMedia('(pointer: fine)').matches && !reduce) {
    const FONTS = [['var(--font-display)', 'italic', '400'], ['var(--font-display)', 'normal', '400'], ['var(--font-ui)', 'normal', '200'],
      ['var(--font-ui)', 'normal', '900'], ['var(--font-ui)', 'italic', '300'], ['ui-monospace, "SF Mono", Menlo, Consolas, monospace', 'normal', '500']];
    const pick = (n, last) => { if (last < 0) return Math.floor(Math.random() * n); const i = Math.floor(Math.random() * (n - 1)); return i >= last ? i + 1 : i; };
    for (const word of document.querySelectorAll('[data-roll-word]')) {
      let lf = -1, lc = -1;
      word.addEventListener('pointerenter', () => {
        lf = pick(FONTS.length, lf); lc = pick(5, lc);
        const [font, style, weight] = FONTS[lf];
        word.style.setProperty('--roll-font', font); word.style.setProperty('--roll-style', style);
        word.style.setProperty('--roll-weight', weight); word.style.setProperty('--roll-color', `var(--roll-c${lc + 1})`);
      });
    }
  }

  /* ---- motion: scroll → sideways (eased), pointer → parallax. Draws only while something moves. ---- */
  let target = 0, sx = 0, tx = 0, ty = 0, mx = 0, my = 0, raf = 0;
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
  function render() {
    root.style.setProperty('--sx', sx.toFixed(1) + 'px');
    root.style.setProperty('--mx', mx.toFixed(4)); root.style.setProperty('--my', my.toFixed(4));
    root.style.setProperty('--p', maxX ? (sx / maxX).toFixed(4) : 0);
    const far = innerWidth * 1.3;
    shadows.forEach((s, i) => { const off = Math.abs(xs[i] - sx) > far; s.classList.toggle('off', off); if (!off) bakeNow(i); });
    // reveal as a section's centre comes within 45% of a screen; hide it again once it is 60% away
    // (the gap between the two stops a section flickering when the scroll stops near the edge)
    if (xs.length) panels.forEach((p, i) => {
      const d = Math.abs(xs[i] - sx), on = p.classList.contains('in');
      if (!on && d < innerWidth * 0.45) { p.classList.replace('out', 'in') || p.classList.add('in'); shadows[i].classList.add('in'); }
      else if (on && d > innerWidth * 0.6) { p.classList.replace('in', 'out'); shadows[i].classList.remove('in'); }
    });
    // the loop drawing starts only once its panel sits in the middle, and pauses once it is half a screen away
    const si = panels.indexOf(storyPanel), ds = xs.length && si >= 0 ? Math.abs(xs[si] - sx) : Infinity;
    if (ds < innerWidth * 0.08) loopOnScreen(true); else if (ds > innerWidth * 0.5) loopOnScreen(false);
    // rail: the stage within half a screen of the centre is current; stages already reached are filled
    rail.style.setProperty('--rp', Math.min(1, Math.max(0, (sx - railX0) / railSpan)).toFixed(4));
    if (sx < (xs[1] || 0) / 2) home.setAttribute('aria-current', 'page'); else home.removeAttribute('aria-current');   // on the hero
    // first pass: the head appears once you leave the hero, a stop once its stage comes in (same 45% as the sections);
    // several at once (a reload part-way, a long jump) ripple in left to right. Nothing hides again.
    if (xs.length > 1) {
      let k = 0;
      if (!home.classList.contains('seen') && sx > xs[1] / 2) { home.style.setProperty('--rd', '0ms'); home.classList.add('seen'); k++; }
      for (const s of railStops) if (!s.seen && xs[s.i] - sx < innerWidth * 0.45) {
        s.seen = true; s.a.style.setProperty('--rd', (k++ * 90) + 'ms'); s.a.classList.add('seen');
        rail.style.setProperty('--rs', s.a.style.getPropertyValue('--at') || 0);
      }
    }
    let cur = null, best = innerWidth * 0.5;
    for (const s of railStops) { const d = Math.abs(xs[s.i] - sx); if (d < best) { best = d; cur = s; } }
    for (const s of railStops) {
      if (s === cur) s.a.setAttribute('aria-current', 'step'); else s.a.removeAttribute('aria-current');
      s.a.classList.toggle('passed', xs[s.i] <= sx + 1);
    }
  }
  function tick() {
    raf = 0;
    const e = reduce ? 1 : 0.12;
    sx += (target - sx) * e; mx += (tx - mx) * 0.08; my += (ty - my) * 0.08;
    if (Math.abs(target - sx) < 0.3) sx = target;
    render();
    if (sx !== target || Math.abs(tx - mx) > 0.0005 || Math.abs(ty - my) > 0.0005) kick();
  }
  addEventListener('scroll', () => {
    target = scrollY; kick();
    if (scrollY > 20) document.querySelector('.hint').style.opacity = 0;
  }, { passive: true });
  if (!reduce) addEventListener('pointermove', (e) => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; kick(); }, { passive: true });

  // sideways gestures (trackpad swipe, shift+wheel) and left/right keys also travel
  addEventListener('wheel', (e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) scrollBy(0, e.deltaX); }, { passive: true });
  addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!dir) return;
    // one key press = one panel (next panel start past the current position, or the previous one before it)
    const next = dir > 0 ? xs.find((v) => v > scrollY + 2) : [...xs].reverse().find((v) => v < scrollY - 2);
    if (next !== undefined) scrollTo({ top: next, behavior: reduce ? 'auto' : 'smooth' });
    e.preventDefault();
  });
  // phones: a sideways swipe travels too (vertical swipes already do, via native scroll)
  let t0 = null;
  addEventListener('touchstart', (e) => { t0 = [e.touches[0].clientX, e.touches[0].clientY]; }, { passive: true });
  addEventListener('touchmove', (e) => {
    if (!t0) return;
    const dx = e.touches[0].clientX - t0[0], dy = e.touches[0].clientY - t0[1];
    if (Math.abs(dx) > Math.abs(dy)) scrollBy(0, -dx);
    t0 = [e.touches[0].clientX, e.touches[0].clientY];
  }, { passive: true });
  // rail stops travel to their stage (the href is the no-script fallback)
  rail.addEventListener('click', (e) => {
    const a = e.target.closest('.rail__stop, .rail__home');
    if (!a) return;
    e.preventDefault();
    const top = a.matches('.rail__home') ? 0 : xs[panels.indexOf(document.getElementById(a.hash.slice(1)))];
    scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  });
  // keyboard users: tabbing to a link brings its section to the centre
  track.addEventListener('focusin', (e) => {
    const i = panels.indexOf(e.target.closest('.panel'));
    if (i >= 0) scrollTo({ top: xs[i], behavior: reduce ? 'auto' : 'smooth' });
  });

  // phones: the address bar sliding in and out changes the height a little on almost every scroll. The CSS follows
  // that by itself; a full re-layout (re-baking every shadow) runs only when the width or the height really changes.
  let lastW = innerWidth, lastH = innerHeight;
  addEventListener('resize', () => {
    if (innerWidth === lastW && Math.abs(innerHeight - lastH) < 160) return;
    lastW = innerWidth; lastH = innerHeight; layout();
  });
  new ResizeObserver(layout).observe(panels[0].firstElementChild);
  ready(hero).then(() => { layout(); typewriter(); });   // no shadow redraw per letter (see the shadows note)
  document.fonts.ready.then(layout);   // label fitting needs the real font metrics
  layout();
