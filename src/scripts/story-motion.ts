/* ============================================================================
   story-motion.ts: the launch story's two scroll-scrubbed extras.
   ----------------------------------------------------------------------------
   The slicer opens its cuts (0 to 10px) and the launch-day clock fills
   (0 to 1) as each passes through the viewport. Nothing loops. Under reduced
   motion nothing is built, and the CSS resting state (cuts open, clock full)
   shows, which is also what visitors without JavaScript see.

   autoRound: false because GSAP rounds numeric tweens by default, which
   would snap --p from 0 straight to 1 (the trap found on the homepage loop).
   ========================================================================= */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motionReduced, onMotionChange } from './motion';

gsap.registerPlugin(ScrollTrigger);

let ctx: gsap.Context | null = null;

function build(): void {
  if (ctx || motionReduced()) return;
  ctx = gsap.context(() => {
    for (const el of document.querySelectorAll<HTMLElement>('[data-st-slicer]')) {
      gsap.fromTo(
        el,
        { '--gap': '0px' },
        {
          '--gap': '10px',
          ease: 'none',
          autoRound: false,
          scrollTrigger: { trigger: el, start: 'top 75%', end: 'top 35%', scrub: true },
        },
      );
    }
    for (const el of document.querySelectorAll<HTMLElement>('[data-st-clock]')) {
      gsap.fromTo(
        el,
        { '--p': 0 },
        {
          '--p': 1,
          ease: 'none',
          autoRound: false,
          scrollTrigger: { trigger: el, start: 'top 75%', end: 'top 30%', scrub: true },
        },
      );
    }
  });
}

function teardown(): void {
  ctx?.revert();
  ctx = null;
}

build();

onMotionChange((reduced) => {
  if (reduced) teardown();
  else build();
  ScrollTrigger.refresh();
});
