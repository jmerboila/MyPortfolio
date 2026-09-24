/* ============================================================================
   v3-motion.ts — every GSAP call on /v3, in one place.
   ----------------------------------------------------------------------------
   CONTRACT
   - Decorates a page that is already complete. Every start state is set here,
     at runtime, so if this bundle never runs the page is simply static. The
     one exception, [data-intro] (the hero's filled and outline name), is
     hidden by html.v3-intro with a 2 s failsafe.
   - Exits under reduced motion (motion.ts is the single answer) and tears down
     or rebuilds live when that preference changes.
   - Animates transform, opacity, clip-path and one custom property (--ink)
     that CSS turns into colour. Scrolling is never altered: no smooth scroll,
     no pinning.
   - TWO loops, both Jayson's call: the hero typewriter (round 5) and the
     stage diagram's purple 05 → 06 → 07 cycle (round 9). Each runs only
     while its section is on screen and neither is built under reduced
     motion. Neither has a pause control, so WCAG 2.2.2 is a known gap — the
     same trade-off as the looping "Let's talk" beam in v3.css.
   ========================================================================= */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { motionReduced, onMotionChange } from './motion';

gsap.registerPlugin(ScrollTrigger, SplitText);

const root = document.documentElement;
const EASE = 'expo.out';

let ctx: gsap.Context | null = null;
let splits: SplitText[] = [];
let cleanups: Array<() => void> = [];

const endIntro = () => root.classList.remove('v3-intro');

const isHeading = (el: Element) => el.matches('h1, h2, h3, h4, h5, h6');

/** Lines rise out of a mask. Used by the hero name (on load) and by headings. */
function riseLines(el: HTMLElement, onLoad: boolean): void {
  splits.push(
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      // F2: SplitText 3.15 defaults to aria: 'auto' — an aria-label on the
      // split element plus aria-hidden on every line. aria-label is valid on
      // a heading (the hero h1, a .v3-stage__title) but prohibited on the
      // paragraph role (most p[data-split] elements also pass through here),
      // where NVDA/JAWS browse mode then reads nothing at all.
      aria: isHeading(el) ? 'auto' : 'none',
      onSplit(self) {
        if (onLoad) endIntro();
        return gsap.from(self.lines, {
          // 115, not 100: each mask reaches 0.12em below its line (v3.css),
          // so a line parked at 100% would show its top edge in that strip.
          yPercent: 115,
          duration: 0.9,
          ease: EASE,
          stagger: 0.08,
          ...(onLoad ? {} : { scrollTrigger: { trigger: el, start: 'top 85%', once: true } }),
        });
      },
    }),
  );
}

/* The hero carries TWO [data-intro] elements — the real h1 and its aria-hidden
   outline copy, stacked over the mesh head — and both must rise in lockstep,
   so this splits and animates each independently rather than grabbing only
   the first. Identical markup and CSS (Hero.astro's shared .v3-hero__title)
   keep their line breaks matched, so the two SplitText instances produce the
   same number of lines at the same width. */
function intro(): void {
  const titles = document.querySelectorAll<HTMLElement>('[data-intro]');
  if (!titles.length) return endIntro();
  for (const title of titles) riseLines(title, true);
  const cue = document.querySelector<HTMLElement>('[data-cue]');
  if (cue) gsap.from(cue, { autoAlpha: 0, delay: 0.9, duration: 0.6 });
}

function inkIn(): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-ink]')) {
    splits.push(
      SplitText.create(el, {
        type: 'words',
        wordsClass: 'v3-word',
        autoSplit: true,
        // F2: [data-ink] is always a paragraph (Brief.astro's p.v3-brief__text),
        // where aria-label is prohibited — see riseLines() above.
        aria: 'none',
        onSplit(self) {
          return gsap.fromTo(
            self.words,
            { '--ink': 0 },
            {
              '--ink': 1,
              ease: 'none',
              stagger: 0.1,
              // Ends when the paragraph's SECTION reaches 20% from the top. At
              // rest the one-screen section sits right under the header (≈8%),
              // so every word is fully inked by then at any text size — round
              // 8's bigger type broke the old paragraph-relative end (the last
              // line was still ghosted at rest). The ghost start is below AA
              // contrast by design; see v3.css .v3-word.
              scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                endTrigger: el.closest('section') ?? el,
                end: 'top 20%',
                scrub: true,
              },
            },
          );
        },
      }),
    );
  }
}

/** The hero typewriter: "I help businesses" stays, the ending types, holds,
 *  erases and the next one types — look good → get found → grow online, on
 *  a loop. Hero.astro renders the full sentence for screen readers and an
 *  aria-hidden animated copy; .is-typing swaps which one is seen. Timers, not
 *  GSAP: a character-by-character text swap has nothing to tween. Pauses
 *  whenever the hero leaves the viewport and resumes where it stopped. */
const TYPE_MS = 70;
const ERASE_MS = 35;
const HOLD_MS = 1800;
const GAP_MS = 350;
const START_MS = 1200;

function typewriter(): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-typewriter]')) {
    const out = el.querySelector<HTMLElement>('[data-type-text]');
    let endings: string[] = [];
    try {
      endings = JSON.parse(el.dataset.endings ?? '[]');
    } catch {
      /* Malformed attribute: stay static rather than half-animate. */
    }
    if (!out || !endings.length) continue;

    const initial = out.textContent ?? '';
    let n = 0;
    let len = 0;
    let erasing = false;
    let started = false;
    let timer = 0;
    let onScreen = false;

    const schedule = (ms: number) => {
      timer = window.setTimeout(tick, ms);
    };
    function tick(): void {
      timer = 0;
      if (!onScreen) return;
      const word = endings[n] ?? '';
      len += erasing ? -1 : 1;
      out!.textContent = word.slice(0, len);
      if (!erasing && len >= word.length) {
        erasing = true;
        return schedule(HOLD_MS);
      }
      if (erasing && len <= 0) {
        erasing = false;
        n = (n + 1) % endings.length;
        return schedule(GAP_MS);
      }
      schedule(erasing ? ERASE_MS : TYPE_MS);
    }

    out.textContent = '';
    el.classList.add('is-typing');

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? false;
      if (onScreen && !timer) {
        schedule(started ? TYPE_MS : START_MS);
        started = true;
      }
    });
    io.observe(el);

    cleanups.push(() => {
      io.disconnect();
      window.clearTimeout(timer);
      el.classList.remove('is-typing');
      out.textContent = initial;
    });
  }
}

/** The contact heading's characters rise in on scroll. Targets
 *  .v3-roll__char (the clipped outer window), never .v3-roll__inner (the
 *  hover-roll's own translate target in v3.css) — animating the same
 *  property on both would fight the moment a visitor hovers mid-reveal. */
function rollChars(): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-reveal-chars]')) {
    const chars = el.querySelectorAll<HTMLElement>('.v3-roll__char');
    if (!chars.length) continue;
    gsap.from(chars, {
      yPercent: 60,
      autoAlpha: 0,
      duration: 0.8,
      ease: EASE,
      stagger: 0.02,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  }
}

/** The hand-drawn stage diagram (StoryLoop.astro), in two acts:
 *  1. First pass, once, when the visitor is ON the section (its top has
 *     risen to 35% of the viewport — round 9: it used to start while the
 *     section was still mostly below the fold): each node's circle draws and
 *     its labels pop in, then the arrow to the next stage, 01 → 07.
 *  2. The purple cycle, repeating (the monthly retainer — the part of the
 *     process that really repeats). A cycle is 05 → 06 → 07 → back to 05,
 *     drawn in purple as ONE continuous pen stroke; when it closes, the whole
 *     loop (arrows, circles, numbers) clears and the next cycle starts fresh
 *     from 05. It plays only while the section is on screen. Like the typewriter it has no pause control
 *     (WCAG 2.2.2 gap, his call); reduced motion never builds it and shows
 *     the cycle already drawn.
 *  Strokes use pathLength="1", so a dash offset of 1 → 0 draws any path
 *  regardless of its real length. Both drawings (wide and tall) run off the
 *  same triggers; whichever one the screen shows is the one you see. */
function sketch(): void {
  const wrap = document.querySelector<HTMLElement>('[data-sketch-wrap]');
  if (!wrap) return;
  const section = wrap.closest<HTMLElement>('header, section') ?? wrap;

  /* Dash set-up for every stroke (round 16). Strokes use pathLength="100"
     (StoryLoop.astro), so 0 = fully drawn and ±HIDE = hidden.
     - Hidden must sit PAST the path's ends, never on them: an offset of
       exactly ±100 leaves a zero-length dash on the first/last point, and
       with round caps that paints a small dot (most visible on phones). A
       "100 on, 200 off" pattern with hidden at ±102 keeps it fully off.
     - Why 100 and not 1: GSAP rounds px values to whole numbers in several
       places even with autoRound: false (a fromTo's immediate render, and
       again when a repeating timeline rewinds). On a 0–1 scale that rounded
       1.02 to 1 — a dot after every loop — and snapped draw-ons to all or
       nothing. On a 0–100 scale a rounded value is still whole and safe. */
  const DASH = '100 200';
  const HIDE = 102;

  let onScreen = false;
  const firstPass = gsap.timeline({ paused: true });
  /* Act 2 is two timelines: the first lap (rubs out the INK arrows into 06
     and 07) plays once, then the loop (rubs out the PURPLE ones it drew last
     time) repeats. Every tween is an explicit fromTo with immediateRender
     off, so each lap sets its own start state and repeats never flash. */
  const CYCLE_GAP = 0.6;
  const loop = gsap.timeline({ paused: true, repeat: -1, repeatDelay: CYCLE_GAP });
  const firstLap = gsap.timeline({
    paused: true,
    onComplete: () => {
      if (onScreen) loop.play();
    },
  });

  for (const svg of wrap.querySelectorAll<SVGSVGElement>('[data-sketch]')) {
    type Paths = SVGPathElement[];
    const q = (sel: string): Paths => [...svg.querySelectorAll<SVGPathElement>(sel)];

    /* First pass. Round 13: an arrow's head now draws AFTER its line lands
       (it used to draw alongside, appearing before the line got there). */
    const drawing = gsap.timeline();
    /* autoRound: false is ESSENTIAL here (round 13). GSAP rounds px values to
       whole numbers by default, and with pathLength="1" the dash offset only
       used to run between -1 and 1 — so every stroke snapped from hidden to
       fully drawn halfway through its tween instead of drawing on. That was
       the "delay" before each arrow appeared. (Round 16 also moved to a
       0–100 scale; see DASH/HIDE.) */
    const pen = { ease: 'power1.inOut', autoRound: false, immediateRender: false };
    /* Park every stroke hidden BEFORE the first pass, with rounding off. A
       fromTo's own immediate render of its start values still rounds 1.02 to
       exactly 1 — the dot-making value — so undrawn strokes waited with a dot
       at their start. The tweens below therefore skip that immediate render. */
    gsap.set(svg.querySelectorAll('[data-sk] path'), { strokeDasharray: DASH, strokeDashoffset: HIDE, autoRound: false });
    for (const group of svg.querySelectorAll<SVGGElement>('[data-sk]')) {
      /* The loop's alternate notes stay out of the first pass. */
      const texts = group.querySelectorAll('text:not([data-note-loop])');
      if (group.dataset.sk === 'seg') {
        const line = group.querySelectorAll('[data-part="line"]');
        const head = group.querySelectorAll('[data-part="head"]');
        drawing.fromTo(line, { strokeDasharray: DASH, strokeDashoffset: HIDE }, { strokeDashoffset: 0, duration: 0.28, ...pen }, '>-0.04');
        drawing.fromTo(head, { strokeDasharray: DASH, strokeDashoffset: HIDE }, { strokeDashoffset: 0, duration: 0.1, ease: 'none', autoRound: false, immediateRender: false }, '>');
      } else {
        const strokes = group.querySelectorAll('path');
        drawing.fromTo(strokes, { strokeDasharray: DASH, strokeDashoffset: HIDE }, { strokeDashoffset: 0, duration: 0.26, ...pen }, '>-0.04');
      }
      if (texts.length) {
        drawing.from(texts, { autoAlpha: 0, y: 10, duration: 0.3, ease: 'back.out(2)', stagger: 0.06 }, '<0.08');
      }
    }
    firstPass.add(drawing, 0);

    const part = (key: string, which: 'line' | 'head') => q(`${key} [data-part="${which}"]`);
    const ret = { line: part('[data-cycle="return"]', 'line'), head: part('[data-cycle="return"]', 'head') };
    const purple1 = { line: part('[data-cycle="c1"]', 'line'), head: part('[data-cycle="c1"]', 'head') };
    const purple2 = { line: part('[data-cycle="c2"]', 'line'), head: part('[data-cycle="c2"]', 'head') };
    const ink1 = { line: part('[data-repeat="c1"]', 'line'), head: part('[data-repeat="c1"]', 'head') };
    const ink2 = { line: part('[data-repeat="c2"]', 'line'), head: part('[data-repeat="c2"]', 'head') };
    const node05 = q('[data-repeat="n0"] path');
    const node06 = q('[data-repeat="n1"] path');
    const node07 = q('[data-repeat="n2"] path');
    const noteSwap = (repeatKey: string) => ({
      from: svg.querySelector(`[data-repeat="${repeatKey}"] [data-note-first]`),
      to: svg.querySelector(`[data-repeat="${repeatKey}"] [data-note-loop]`),
    });
    const swap05 = noteSwap('n0');
    const swap06 = noteSwap('n1');
    const purpleAll = [...ret.line, ...ret.head, ...purple1.line, ...purple1.head, ...purple2.line, ...purple2.head];
    /* autoRound off here too: a plain set rounded 1.02 back to exactly 1 —
       the dot-making value — so the purple strokes sat hidden with a dot at
       their start until the loop first drew them (round 16 follow-up). */
    gsap.set(purpleAll, { strokeDasharray: DASH, strokeDashoffset: HIDE, autoRound: false });

    /* THE CYCLE, rounds 14–15 (his description): a cycle is 05 → 06 → 07 →
       back to 05. When it completes, the loop clears — the arrows, and the
       circles and numbers of 06 and 07 — while 05 STAYS, since every cycle
       starts from it. The return arrow is the LAST stroke of a cycle.
         firstLap (once, right after the first pass drew 01 → 07 in ink):
           the return arrow draws thin and in ink like the first pass,
           closing the first cycle → hold → clear (05 thickens in place).
         loop lap (repeats): → 06 → → 07 → return (thick purple, one
           continuous pen stroke at an even speed) → hold → clear.
       "Clear all" is a quick rewind, last-drawn first; each number fades with
       its circle. Labels and notes stay; the first clear cross-fades the
       05/06 notes to their loop wording, which then stays.
       Everything sits on an explicit clock (`at`), every tween is fromTo with
       immediateRender off (each lap sets its own start state, so repeats
       never flash), and autoRound is off (see `pen` above). */
    const HEAD = 0.12;
    const HOLD = 1.4;
    /* Matches .sk-loop in StoryLoop.astro: the circles take the loop's bold
       weight while they are cleared, so they come back matching. */
    const LOOP_STROKE = 3;
    const num = (key: string) => svg.querySelector(`[data-repeat="${key}"] .sk-n`);
    const num06 = num('n1');
    const num07 = num('n2');
    const flat = { ease: 'none', immediateRender: false, autoRound: false };

    const cycle = (tl: gsap.core.Timeline) => {
      const draw = (el: Paths, duration: number, at: number) =>
        tl.fromTo(el, { strokeDashoffset: HIDE }, { strokeDashoffset: 0, duration, ...flat }, at);
      const erase = (el: Paths, at: number) =>
        tl.fromTo(el, { strokeDashoffset: 0 }, { strokeDashoffset: -HIDE, duration: 0.16, ...flat }, at);
      const fade = (el: Element | null, to: 0 | 1, at: number, duration = 0.16) => {
        if (el) tl.fromTo(el, { autoAlpha: 1 - to }, { autoAlpha: to, duration, ...flat }, at);
      };
      return { draw, erase, fade };
    };

    /** Clear the loop, last-drawn first — everything EXCEPT 05 (round 15:
     *  05 is where each cycle starts, so it stays put). Returns the clock. */
    const clearAll = (tl: gsap.core.Timeline, at: number, a1: typeof ink1, a2: typeof ink1, firstClear: boolean) => {
      const { erase, fade } = cycle(tl);
      const steps: Array<[Paths, (Element | null)?]> = [
        [ret.head],
        [ret.line],
        [node07, num07],
        [a2.head],
        [a2.line],
        [node06, num06],
        [a1.head],
        [a1.line],
      ];
      steps.forEach(([el, n], k) => {
        erase(el, at + k * 0.06);
        fade(n ?? null, 0, at + k * 0.06);
      });
      if (firstClear) {
        for (const { from, to } of [swap05, swap06]) {
          fade(from, 0, at, 0.3);
          fade(to, 1, at, 0.3);
        }
        /* 05 isn't redrawn, so it thickens in place to the loop's weight. */
        tl.fromTo(node05, { strokeWidth: 1 }, { strokeWidth: LOOP_STROKE, duration: 0.3, ...flat }, at);
      }
      at += 0.16 + (steps.length - 1) * 0.06;
      tl.set([...node06, ...node07], { strokeWidth: LOOP_STROKE }, at);
      return at;
    };

    /* Once: close the first cycle with the return arrow, then clear. Round
       15: this first return arrow is drawn like the first pass — thin and in
       ink, matching 01 → 05 — and only turns thick purple in the loop. */
    const first = gsap.timeline();
    {
      const { draw } = cycle(first);
      let at = 0;
      first.set([...ret.line, ...ret.head], { strokeWidth: 1, stroke: 'var(--text)' }, at);
      draw(ret.line, 0.48, at);
      draw(ret.head, HEAD, at + 0.48);
      at += 0.48 + HEAD + HOLD * 0.5;
      const cleared = clearAll(first, at, ink1, ink2, true);
      /* The same empty beat the loop takes between cycles (its repeatDelay),
         so the first purple cycle doesn't start the instant the clear ends. */
      first.set({}, {}, cleared + CYCLE_GAP);
    }
    firstLap.add(first, 0);

    /* Repeats: one continuous purple pen stroke round the cycle, then clear. */
    const again = gsap.timeline();
    {
      const { draw, fade } = cycle(again);
      /* The loop's own weight and colour for the return arrow (the first
         close drew it thin and in ink). */
      again.set([...ret.line, ...ret.head], { strokeWidth: LOOP_STROKE, stroke: 'var(--accent)' }, 0);
      /* 05 stays drawn; each cycle starts from it. */
      const pieces: Array<[Paths, number, (Element | null)?]> = [
        [purple1.line, 0.34],
        [purple1.head, HEAD],
        [node06, 0.28, num06],
        [purple2.line, 0.34],
        [purple2.head, HEAD],
        [node07, 0.28, num07],
        [ret.line, 0.48],
        [ret.head, HEAD],
      ];
      let at = 0;
      for (const [el, duration, n] of pieces) {
        draw(el, duration, at);
        fade(n ?? null, 1, at, duration);
        at += duration;
      }
      clearAll(again, at + HOLD, purple1, purple2, false);
    }
    loop.add(again, 0);
  }

  firstPass.eventCallback('onComplete', () => {
    if (onScreen) firstLap.play();
  });

  ScrollTrigger.create({
    trigger: section,
    start: 'top 35%',
    end: 'bottom 35%',
    onToggle(self) {
      onScreen = self.isActive;
      if (!onScreen) {
        firstLap.pause();
        loop.pause();
        return;
      }
      if (firstPass.progress() === 0) firstPass.play();
      else if (firstPass.progress() < 1) return;
      else if (firstLap.progress() < 1) firstLap.play();
      else loop.play();
    },
  });
}

/** Contact heading, round 7: each word, as the pointer enters it, gets a new
 *  random font and colour for the copy that rolls in (v3.css reads the four
 *  --roll-* properties). Never the same pick twice in a row for a word.
 *  Fonts are variations of the two brand families plus the system monospace
 *  — all already on the page, so a hover never waits on a download. Colours
 *  are the AA-checked --roll-c1…c5 set in v3.css, theme-aware. */
const ROLL_FONTS = [
  { font: 'var(--font-display)', style: 'italic', weight: '400' },
  { font: 'var(--font-display)', style: 'normal', weight: '400' },
  { font: 'var(--font-ui)', style: 'normal', weight: '200' },
  { font: 'var(--font-ui)', style: 'normal', weight: '900' },
  { font: 'var(--font-ui)', style: 'italic', weight: '300' },
  { font: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', style: 'normal', weight: '500' },
];
const ROLL_COLORS = 5;

function rollRandom(): void {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  for (const word of document.querySelectorAll<HTMLElement>('[data-roll-word]')) {
    let lastFont = -1;
    let lastColor = -1;
    /* Uniform over every option except the last pick: draw from n - 1 and
       step over `last`. First hover (no last yet) draws from all n. */
    const pick = (n: number, last: number) => {
      if (last < 0) return Math.floor(Math.random() * n);
      const i = Math.floor(Math.random() * (n - 1));
      return i >= last ? i + 1 : i;
    };
    const onEnter = () => {
      lastFont = pick(ROLL_FONTS.length, lastFont);
      lastColor = pick(ROLL_COLORS, lastColor);
      const f = ROLL_FONTS[lastFont]!;
      word.style.setProperty('--roll-font', f.font);
      word.style.setProperty('--roll-style', f.style);
      word.style.setProperty('--roll-weight', f.weight);
      word.style.setProperty('--roll-color', `var(--roll-c${lastColor + 1})`);
    };
    word.addEventListener('pointerenter', onEnter);
    cleanups.push(() => {
      word.removeEventListener('pointerenter', onEnter);
      for (const p of ['--roll-font', '--roll-style', '--roll-weight', '--roll-color']) {
        word.style.removeProperty(p);
      }
    });
  }
}

/** Cursor tilt over the hero (fine pointers only): the head tilts away from
 *  the cursor for depth, both name layers drift a few px the other way. Reset
 *  to 0 on pointerleave. Listeners are added here and removed in teardown()
 *  via `cleanups`, per the file contract. */
function heroTilt(): void {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const head = document.querySelector<HTMLElement>('[data-hero-head-target]');
  const nameEls = [...document.querySelectorAll<HTMLElement>('[data-hero-tilt]')];
  if (!hero || !head || !nameEls.length) return;

  const quick = (target: HTMLElement, prop: string) =>
    gsap.quickTo(target, prop, { duration: 0.8, ease: 'power3.out' });

  const headX = quick(head, 'x');
  const headY = quick(head, 'y');
  const headRotY = quick(head, 'rotationY');
  const headRotX = quick(head, 'rotationX');
  const nameXs = nameEls.map((el) => quick(el, 'x'));

  const onMove = (e: PointerEvent) => {
    const rect = hero.getBoundingClientRect();
    const ox = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const oy = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    headX(-ox * 12);
    headY(-oy * 8);
    headRotY(ox * 3);
    headRotX(-oy * 3);
    for (const setX of nameXs) setX(ox * 6);
  };
  const onLeave = () => {
    headX(0);
    headY(0);
    headRotY(0);
    headRotX(0);
    for (const setX of nameXs) setX(0);
  };

  hero.addEventListener('pointermove', onMove);
  hero.addEventListener('pointerleave', onLeave);
  cleanups.push(() => {
    hero.removeEventListener('pointermove', onMove);
    hero.removeEventListener('pointerleave', onLeave);
  });
}

/** Coarse pointers (touch) get a gentle scroll parallax on the head instead
 *  of the cursor tilt above — the two are mutually exclusive by pointer type. */
function heroParallax(): void {
  if (window.matchMedia('(pointer: fine)').matches) return;
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const head = document.querySelector<HTMLElement>('[data-hero-head-target]');
  if (!hero || !head) return;
  gsap.fromTo(
    head,
    { yPercent: 0 },
    {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    },
  );
}

/** The head fades up after the name's own load-time rise (intro() above). */
function heroHeadReveal(): void {
  const head = document.querySelector<HTMLElement>('[data-hero-head]');
  if (!head) return;
  gsap.from(head, { autoAlpha: 0, y: 24, duration: 1, delay: 0.6, ease: EASE });
}

/** Each stage's big numeral rises once as it enters — same feel as a heading,
 *  but SplitText never touches it (it is aria-hidden, not real text flow). */
function stageNumerals(): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-stage-n]')) {
    gsap.fromTo(
      el,
      { autoAlpha: 0, yPercent: 30 },
      {
        autoAlpha: 1,
        yPercent: 0,
        duration: 0.8,
        ease: EASE,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      },
    );
  }
}

/** Work-card frames un-crop as they enter (same clip-path move the old plate
 *  frames used), and each stage's card list staggers in once together. */
function stageCards(): void {
  for (const frame of document.querySelectorAll<HTMLElement>('[data-stage-frame]')) {
    gsap.fromTo(
      frame,
      { clipPath: 'inset(12% round 10px)' },
      {
        clipPath: 'inset(0% round 10px)',
        ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top bottom', end: 'top 60%', scrub: true },
      },
    );
  }

  const lists = gsap.utils.toArray<HTMLElement>('.v3-stage__work');
  for (const list of lists) {
    const cards = list.querySelectorAll<HTMLElement>('[data-stage-card]');
    if (!cards.length) continue;
    gsap.from(cards, {
      y: 24,
      autoAlpha: 0,
      duration: 0.6,
      ease: EASE,
      stagger: 0.08,
      scrollTrigger: { trigger: list, start: 'top 90%', once: true },
    });
  }
}

function build(): void {
  if (ctx) return;
  ctx = gsap.context(() => {
    intro();
    inkIn();
    typewriter();
    heroTilt();
    heroParallax();
    heroHeadReveal();
    stageNumerals();
    stageCards();
    rollChars();
    sketch();
    rollRandom();
    for (const el of document.querySelectorAll<HTMLElement>('[data-split]')) riseLines(el, false);
  });
}

function teardown(): void {
  for (const s of splits) s.revert();
  splits = [];
  for (const c of cleanups) c();
  cleanups = [];
  ctx?.revert();
  ctx = null;
  endIntro();
}

function start(): void {
  if (motionReduced()) return endIntro();
  build();
}

/* Split after the brand fonts load, so line breaks match the rendered face.
   The 2 s failsafe in V3Layout covers a font that never arrives. */
document.fonts.ready.then(start);

onMotionChange((reduced) => {
  if (reduced) teardown();
  else build();
  ScrollTrigger.refresh();
});

/* Print is a static medium: never print mid-reveal. */
window.addEventListener('beforeprint', teardown);
window.addEventListener('afterprint', () => {
  if (!motionReduced()) build();
});
