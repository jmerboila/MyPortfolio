/* ============================================================================
   one-video.ts: one video plays at a time.
   ----------------------------------------------------------------------------
   Added 2026-10-26 (his call). Starting a video pauses every other one on the
   page, so two soundtracks never play over each other (/videos has a dozen).
   Nothing on the site autoplays, so this only ever pauses a video the viewer
   started; it stays paused where they left it.

   One listener on the document. `play` does not bubble, so it listens in the
   capture phase, which also covers videos added later.
   ========================================================================= */

document.addEventListener(
  'play',
  (e) => {
    for (const v of document.querySelectorAll('video')) {
      if (v !== e.target && !v.paused) v.pause();
    }
  },
  true,
);
