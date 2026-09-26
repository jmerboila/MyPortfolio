/* ============================================================================
   social.ts — behaviour for the /social frames.
   ----------------------------------------------------------------------------
   Four independent pieces, each keyed off data-sp-* attributes so the markup
   says what it is and nothing here knows which platform it is driving:

     videos     wait to be pressed, then play with sound; one at a time;
                pause when they leave the screen
     carousels  arrows, dots, counter and arrow keys over native scroll-snap
     reactions  like / save toggles: a click turns the heart red, a second
                click clears it — the same on every frame
     captions   "more" appears only when the caption actually overflows

   Likes and saves are a local flourish: they change nothing anywhere and
   reset on reload. They exist because a frame whose heart cannot be pressed
   reads as a screenshot, not as the product.
   ========================================================================= */
import { motionReduced } from './motion';

/* -- Videos ---------------------------------------------------------------
   Nothing plays on its own (his call, 2026-09-25). A press plays the video
   WITH sound — a click is the user gesture browsers require for audible
   playback, so play() is allowed. Starting one pauses every other, like a
   feed with one voice at a time; and a video that leaves the screen (scrolled
   away, or a carousel slide swiped off) pauses, so sound never comes from
   something unseen. */

interface VideoState {
  root: HTMLElement;
  video: HTMLVideoElement;
  toggle: HTMLButtonElement;
  bar: HTMLElement | null;
  /** The visitor asked for it to play. Set on the press, not on the 'play'
   *  event: with preload="none" the first play waits for the file, and a
   *  second press in that gap must cancel, not ask again. */
  wanted: boolean;
}

function initVideos(scope: ParentNode) {
  const states: VideoState[] = [];

  for (const root of scope.querySelectorAll<HTMLElement>('[data-sp-video]')) {
    const video = root.querySelector('video');
    const toggle = root.querySelector<HTMLButtonElement>('[data-sp-toggle]');
    if (!video || !toggle) continue;
    states.push({ root, video, toggle, bar: root.querySelector('[data-sp-progress]'), wanted: false });
  }
  if (!states.length) return;

  const byRoot = new Map(states.map((s) => [s.root, s]));

  const sync = (s: VideoState) => {
    const label = s.root.dataset.label ?? 'video';
    s.root.dataset.state = s.wanted ? 'playing' : 'paused';
    s.toggle.setAttribute('aria-label', `${s.wanted ? 'Pause' : 'Play'} video: ${label}`);
  };

  /* pause() also cancels a play() still waiting for data (its promise
     rejects), so a slow video can never start late over the newer one. */
  const stop = (s: VideoState) => {
    s.wanted = false;
    s.video.pause();
    sync(s);
  };

  const start = (s: VideoState) => {
    for (const other of states) if (other !== s && other.wanted) stop(other);
    s.wanted = true;
    s.video.muted = false;
    sync(s);
    /* Rejects if the browser refuses playback (some in-app browsers) or the
       visitor pressed again first; either way the state goes back to paused
       and the button still works. */
    s.video.play().catch(() => {
      if (s.wanted && s.video.paused) {
        s.wanted = false;
        sync(s);
      }
    });
  };

  for (const s of states) {
    /* Pauses the browser makes on its own (media keys, OS controls) and
       plays it resumes are reflected too. */
    s.video.addEventListener('play', () => {
      if (!s.wanted) start(s);
    });
    s.video.addEventListener('pause', () => {
      if (s.wanted && !s.video.seeking) {
        s.wanted = false;
        sync(s);
      }
    });
    s.video.addEventListener('timeupdate', () => {
      if (s.bar && s.video.duration) {
        s.bar.style.transform = `scaleX(${s.video.currentTime / s.video.duration})`;
      }
    });

    s.toggle.addEventListener('click', () => (s.wanted ? stop(s) : start(s)));
  }

  /* Pause once (almost) none of it shows. IntersectionObserver clips by
     scroll containers, so a carousel slide swiped out counts too — but a
     slide swiped exactly one width away sits edge-to-edge with the frame,
     which the spec reports as isIntersecting with ratio 0. Hence the ratio
     test, and a small second threshold so the callback fires on the way. */
  const GONE = 0.02;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const s = byRoot.get(entry.target as HTMLElement);
        if (s && s.wanted && entry.intersectionRatio < GONE) stop(s);
      }
    },
    { threshold: [0, GONE] },
  );
  for (const s of states) io.observe(s.root);
}

/* -- Carousels ------------------------------------------------------------ */

function initCarousels(scope: ParentNode) {
  for (const root of scope.querySelectorAll<HTMLElement>('[data-sp-carousel]')) {
    const track = root.querySelector<HTMLElement>('[data-sp-track]');
    if (!track) continue;
    const n = track.children.length;
    if (n < 2) continue;

    const prev = root.querySelector<HTMLButtonElement>('[data-sp-prev]');
    const next = root.querySelector<HTMLButtonElement>('[data-sp-next]');
    const count = root.querySelector<HTMLElement>('[data-sp-count]');
    const live = root.querySelector<HTMLElement>('[data-sp-live]');
    /* The dots live in the action row, outside the media box. */
    const post = root.closest('article') ?? root;
    const dots = Array.from(post.querySelectorAll<HTMLElement>('[data-sp-dot]'));

    let current = 0;
    /* Where a smooth scroll is heading. Without it, a second click landing
       mid-scroll reads the OLD slide and asks for the same one again, so a
       quick double-click on Next only moves one slide. */
    let target: number | null = null;

    const index = () =>
      Math.min(n - 1, Math.max(0, Math.round(track.scrollLeft / track.clientWidth)));

    const go = (i: number) => {
      target = Math.min(n - 1, Math.max(0, i));
      track.scrollTo({
        left: target * track.clientWidth,
        behavior: motionReduced() ? 'auto' : 'smooth',
      });
    };

    const step = (d: number) => go((target ?? current) + d);

    const update = () => {
      const i = index();
      if (i === target) target = null;
      if (i === current) return;
      current = i;

      /* An arrow that disappears while focused would drop focus to <body>.
         Hand it to the other arrow first. */
      const active = document.activeElement;
      if (prev && next) {
        if (i === 0 && active === prev) next.focus();
        if (i === n - 1 && active === next) prev.focus();
        prev.hidden = i === 0;
        next.hidden = i === n - 1;
      }

      dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
      if (count) count.textContent = `${i + 1}/${n}`;
    };

    let ticking = false;
    track.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
      },
      { passive: true },
    );

    /* Announce once the slide has settled, not on every scroll frame. */
    const announce = () => {
      target = null;
      if (live) live.textContent = `Slide ${index() + 1} of ${n}`;
    };
    const hasScrollEnd = 'onscrollend' in window;
    if (hasScrollEnd) track.addEventListener('scrollend', announce);

    prev?.addEventListener('click', () => {
      step(-1);
      if (!hasScrollEnd) setTimeout(announce, 400);
    });
    next?.addEventListener('click', () => {
      step(1);
      if (!hasScrollEnd) setTimeout(announce, 400);
    });

    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'Home') go(0);
      else if (e.key === 'End') go(n - 1);
      else return;
      e.preventDefault();
    });

    /* Resizing changes the slide width; keep the same slide in view. */
    new ResizeObserver(() => {
      track.scrollTo({ left: current * track.clientWidth, behavior: 'auto' });
    }).observe(track);
  }
}

/* -- Reactions ------------------------------------------------------------ */

function initReactions(scope: ParentNode) {
  /* Double-tap-to-like was removed 2026-09-25: it only worked on image
     posts and could like but never unlike, so hearts behaved differently
     from card to card. */
  const flip = (b: HTMLElement) => {
    b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
  };

  for (const b of scope.querySelectorAll<HTMLElement>('[data-sp-like], [data-sp-save]')) {
    b.addEventListener('click', () => flip(b));
  }
}

/* -- Captions ------------------------------------------------------------- */

function initCaptions(scope: ParentNode) {
  for (const cap of scope.querySelectorAll<HTMLElement>('[data-sp-caption]')) {
    const text = cap.querySelector<HTMLElement>('.sp-caption__text');
    const more = cap.querySelector<HTMLButtonElement>('[data-sp-more]');
    if (!text || !more) continue;

    const check = () => {
      if (cap.classList.contains('is-open')) return;
      more.hidden = text.scrollHeight <= text.clientHeight + 1;
    };
    check();
    new ResizeObserver(check).observe(text);

    more.addEventListener('click', () => {
      cap.classList.add('is-open');
      more.hidden = true;
      /* The button is gone, so focus would fall to <body>. Park it on the
         text it just revealed. */
      text.setAttribute('tabindex', '-1');
      text.focus({ preventScroll: true });
    });
  }
}

export function initSocial() {
  for (const feed of document.querySelectorAll<HTMLElement>('[data-sp-feed]')) {
    initVideos(feed);
    initCarousels(feed);
    initReactions(feed);
    initCaptions(feed);
  }
}
