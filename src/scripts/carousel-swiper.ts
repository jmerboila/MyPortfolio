/* carousel-swiper.ts: keep the CarouselSwiper's buttons, dots, counter and
   artboard window in step with the panel on screen. The track is a native
   scroll-snap row, so touch and trackpad swipes need nothing from here. */
import { motionReduced } from './motion';

export function initCarouselSwipers(): void {
  for (const root of document.querySelectorAll<HTMLElement>('[data-cs]')) {
    if (root.dataset.csReady) continue;
    root.dataset.csReady = '1';
    const track = root.querySelector<HTMLElement>('[data-cs-track]');
    if (!track) continue;
    const panels = track.children.length;
    const prev = root.querySelector<HTMLButtonElement>('[data-cs-prev]');
    const next = root.querySelector<HTMLButtonElement>('[data-cs-next]');
    const count = root.querySelector<HTMLElement>('[data-cs-count]');
    const win = root.querySelector<HTMLElement>('[data-cs-window]');
    const dots = [...root.querySelectorAll<HTMLElement>('[data-cs-dot]')];
    let current = 0;

    const go = (i: number) => {
      const target = Math.max(0, Math.min(panels - 1, i));
      track.scrollTo({ left: target * track.clientWidth, behavior: motionReduced() ? 'auto' : 'smooth' });
    };

    const update = () => {
      const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      if (i === current && root.dataset.csDrawn) return;
      current = i;
      root.dataset.csDrawn = '1';
      win?.style.setProperty('--i', String(i));
      dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
      if (count) count.textContent = `${i + 1} / ${panels}`;
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i === panels - 1;
    };

    track.addEventListener('scroll', update, { passive: true });
    prev?.addEventListener('click', () => go(current - 1));
    next?.addEventListener('click', () => go(current + 1));
    for (const seg of root.querySelectorAll<HTMLButtonElement>('[data-cs-go]')) {
      seg.addEventListener('click', () => go(Number(seg.dataset.csGo)));
    }
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
    });
    update();
  }
}
