/* ============================================================================
   v3-motion.ts — every GSAP call on /v3, in one place.
   ----------------------------------------------------------------------------
   CONTRACT
   - Decorates a page that is already complete. Every start state is set here,
     at runtime, so if this bundle never runs the page is simply static. The one
     exception, the Open h1, is hidden by html.v3-intro with a 2 s failsafe.
   - Exits under reduced motion (motion.ts is the single answer) and tears down
     or rebuilds live when that preference changes.
   - Animates transform, opacity, clip-path and two custom properties (--ink,
     --plate-dim) that CSS turns into colour. Nothing loops, so WCAG 2.2.2 does
     not apply. Scrolling is never altered: no smooth scroll, no pinning.
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
const headerPx = () =>
  parseFloat(getComputedStyle(root).getPropertyValue('--header-height')) || 72;

const isHeading = (el: Element) => el.matches('h1, h2, h3, h4, h5, h6');

/** Lines rise out of a mask. Used by the Open h1 (on load) and by headings. */
function riseLines(el: HTMLElement, onLoad: boolean): void {
  splits.push(
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      // F2: SplitText 3.15 defaults to aria: 'auto' — an aria-label on the
      // split element plus aria-hidden on every line. aria-label is valid on
      // a heading (the Open h1, a .v3-plate__title) but prohibited on the
      // paragraph role (the plate-brief p[data-split] also passes through
      // here), where NVDA/JAWS browse mode then reads nothing at all.
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

function intro(): void {
  const title = document.querySelector<HTMLElement>('[data-intro]');
  if (!title) return endIntro();
  riseLines(title, true);
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

function portrait(): void {
  const img = document.querySelector<HTMLElement>('[data-portrait]');
  if (!img) return;
  gsap.fromTo(
    img,
    { yPercent: -4 },
    {
      yPercent: 4,
      ease: 'none',
      scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true },
    },
  );
}

function plates(): void {
  const all = gsap.utils.toArray<HTMLElement>('[data-plate]');
  all.forEach((plate, i) => {
    const frame = plate.querySelector<HTMLElement>('[data-frame]');
    if (frame) {
      gsap.fromTo(
        frame,
        { clipPath: 'inset(12% 12% round 10px)' },
        {
          clipPath: 'inset(0% 0% round 10px)',
          ease: 'none',
          scrollTrigger: { trigger: plate, start: 'top bottom', end: 'top 30%', scrub: true },
        },
      );
    }

    for (const img of plate.querySelectorAll<HTMLElement>('[data-parallax]')) {
      gsap.fromTo(
        img,
        { yPercent: -5 },
        {
          yPercent: 5,
          ease: 'none',
          scrollTrigger: { trigger: plate, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    }

    const more = plate.querySelectorAll<HTMLElement>('[data-more] > li');
    if (more.length) {
      gsap.from(more, {
        y: 24,
        autoAlpha: 0,
        duration: 0.6,
        ease: EASE,
        stagger: 0.08,
        scrollTrigger: { trigger: more[0], start: 'top 90%', once: true },
      });
    }

    const next = all[i + 1];
    if (next) {
      gsap.to(plate, {
        scale: 0.94,
        '--plate-dim': 1,
        ease: 'none',
        scrollTrigger: {
          trigger: next,
          start: 'top bottom',
          end: () => `top ${headerPx()}px`,
          scrub: true,
        },
      });
    }
  });
}

function build(): void {
  if (ctx) return;
  ctx = gsap.context(() => {
    intro();
    inkIn();
    counts();
    portrait();
    plates();
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
