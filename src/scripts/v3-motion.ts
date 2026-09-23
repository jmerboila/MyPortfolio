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
     that CSS turns into colour. Nothing loops, so WCAG 2.2.2 does not apply.
     Scrolling is never altered: no smooth scroll, no pinning.
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
              scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
            },
          );
        },
      }),
    );
  }
}

function counts(): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-count]')) {
    const m = /^(\D*)(\d+(?:\.\d+)?)(.*)$/.exec(el.textContent?.trim() ?? '');
    if (!m) continue;
    const [, pre = '', num = '0', post = ''] = m;
    const target = parseFloat(num);
    const decimals = num.split('.')[1]?.length ?? 0;

    const overlay = document.createElement('span');
    overlay.className = 'v3-count';
    overlay.setAttribute('aria-hidden', 'true');
    el.classList.add('v3-count-host');
    el.append(overlay);
    cleanups.push(() => {
      overlay.remove();
      el.classList.remove('v3-count-host');
    });

    const state = { v: 0 };
    const render = () => {
      overlay.textContent = `${pre}${state.v.toFixed(decimals)}${post}`;
    };
    render();
    gsap.to(state, {
      v: target,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: render,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
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
    counts();
    heroTilt();
    heroParallax();
    heroHeadReveal();
    stageNumerals();
    stageCards();
    rollChars();
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
