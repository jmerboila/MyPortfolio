/* ============================================================================
   social.ts — behaviour for the /social frames.
   ----------------------------------------------------------------------------
   Four independent pieces, each keyed off data-sp-* attributes so the markup
   says what it is and nothing here knows which platform it is driving:

     videos     play muted while 60% on screen, pause off screen; a tap
                toggles; one video with sound at a time
     carousels  arrows, dots, counter and arrow keys over native scroll-snap
     reactions  like / save toggles, double-tap to like on image posts
     captions   "more" appears only when the caption actually overflows

   Likes and saves are a local flourish: they change nothing anywhere and
   reset on reload. They exist because a frame whose heart cannot be pressed
   reads as a screenshot, not as the product.
   ========================================================================= */
import { motionReduced, onMotionChange } from './motion';

/* -- Videos --------------------------------------------------------------- */

interface VideoState {
  root: HTMLElement;
  video: HTMLVideoElement;
  toggle: HTMLButtonElement;
  mute: HTMLButtonElement | null;
  bar: HTMLElement | null;
  visible: boolean;
  /** The visitor paused it; do not let scrolling restart it. */
  userPaused: boolean;
  /** The visitor pressed play; honour it even under reduced motion. */
  userStarted: boolean;
}

function initVideos(scope: ParentNode) {
  const states: VideoState[] = [];

  for (const root of scope.querySelectorAll<HTMLElement>('[data-sp-video]')) {
    const video = root.querySelector('video');
    const toggle = root.querySelector<HTMLButtonElement>('[data-sp-toggle]');
    if (!video || !toggle) continue;
    states.push({
      root,
      video,
      toggle,
      mute: root.querySelector('[data-sp-mute]'),
      bar: root.querySelector('[data-sp-progress]'),
      visible: false,
      userPaused: false,
      userStarted: false,
    });
  }
  if (!states.length) return;

  const byRoot = new Map(states.map((s) => [s.root, s]));

  const wantsToPlay = (s: VideoState) =>
    s.visible && !s.userPaused && (s.userStarted || !motionReduced());

  const play = (s: VideoState) => {
    /* play() rejects if the browser refuses autoplay (data saver, some
       in-app browsers). The poster stays up and the button still works. */
    s.video.play().catch(() => {});
  };

  const sync = (s: VideoState) => {
    const paused = s.video.paused;
    const label = s.root.dataset.label ?? 'video';
    s.root.dataset.state = paused ? 'paused' : 'playing';
    s.toggle.setAttribute('aria-label', `${paused ? 'Play' : 'Pause'} video: ${label}`);
  };

  const setSound = (s: VideoState, on: boolean) => {
    s.video.muted = !on;
    s.mute?.setAttribute('aria-pressed', String(on));
    s.root.dataset.sound = on ? 'on' : 'off';
  };

  for (const s of states) {
    s.video.addEventListener('play', () => sync(s));
    s.video.addEventListener('pause', () => sync(s));
    s.video.addEventListener('timeupdate', () => {
      if (s.bar && s.video.duration) {
        s.bar.style.transform = `scaleX(${s.video.currentTime / s.video.duration})`;
      }
    });

    s.toggle.addEventListener('click', () => {
      if (s.video.paused) {
        s.userPaused = false;
        s.userStarted = true;
        play(s);
      } else {
        s.userPaused = true;
        s.video.pause();
      }
    });

    s.mute?.addEventListener('click', () => {
      const on = s.video.muted;
      /* One voice at a time, as in any feed. */
      if (on) for (const other of states) if (other !== s) setSound(other, false);
      setSound(s, on);
      if (on && s.video.paused) {
        s.userPaused = false;
        s.userStarted = true;
        play(s);
      }
    });
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const s = byRoot.get(entry.target as HTMLElement);
        if (!s) continue;
        s.visible = entry.intersectionRatio >= 0.6;
        if (wantsToPlay(s)) play(s);
        else if (!s.visible && !s.video.paused) s.video.pause();
      }
    },
    { threshold: [0, 0.6] },
  );
  for (const s of states) io.observe(s.root);

  /* Turning reduced motion on mid-visit stops anything that started itself. */
  onMotionChange((reduced) => {
    for (const s of states) {
      if (reduced && !s.userStarted) s.video.pause();
      else if (wantsToPlay(s)) play(s);
    }
  });
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
  const flip = (b: HTMLElement, on?: boolean) => {
    const next = on ?? b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', String(next));
  };

  for (const b of scope.querySelectorAll<HTMLElement>('[data-sp-like], [data-sp-save]')) {
    b.addEventListener('click', () => flip(b));
  }

  /* Double-tap to like, on image media only. On video the tap already means
     play/pause, and splitting single from double taps would put a delay on
     every press. */
  for (const media of scope.querySelectorAll<HTMLElement>('[data-sp-media]')) {
    const post = media.closest('article');
    const like = post?.querySelector<HTMLElement>('[data-sp-like]');
    const burst = media.querySelector<HTMLElement>('[data-sp-burst]');
    if (!like) continue;

    media.addEventListener('dblclick', (e) => {
      if ((e.target as HTMLElement).closest('button, [data-sp-video]')) return;
      flip(like, true);
      if (burst) {
        burst.classList.remove('is-on');
        void burst.offsetWidth; // restart the animation
        burst.classList.add('is-on');
      }
    });
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

/* -- Filters -------------------------------------------------------------- */

function initFilters(feed: HTMLElement) {
  const bar = feed.querySelector<HTMLElement>('[data-sp-filters]');
  const status = feed.querySelector<HTMLElement>('[data-sp-status]');
  if (!bar || !status) return;

  const buttons = Array.from(bar.querySelectorAll<HTMLButtonElement>('[data-filter]'));
  const items = Array.from(feed.querySelectorAll<HTMLElement>('li[data-type]'));
  bar.hidden = false;

  for (const b of buttons) {
    b.addEventListener('click', () => {
      const filter = b.dataset.filter ?? 'all';
      let shown = 0;
      for (const item of items) {
        const match = filter === 'all' || item.dataset.type === filter;
        item.hidden = !match;
        if (match) shown++;
      }
      for (const other of buttons) {
        other.setAttribute('aria-pressed', String(other === b));
      }
      const label = b.firstChild?.textContent?.trim() ?? '';
      status.textContent =
        filter === 'all' ? `Showing all ${shown} posts` : `Showing ${shown} · ${label}`;
    });
  }
}

export function initSocial() {
  for (const feed of document.querySelectorAll<HTMLElement>('[data-sp-feed]')) {
    initFilters(feed);
    initVideos(feed);
    initCarousels(feed);
    initReactions(feed);
    initCaptions(feed);
  }
}
