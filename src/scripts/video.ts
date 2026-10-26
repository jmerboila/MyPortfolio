/* ============================================================================
   video.ts: site-wide rules for every <video>.
   ----------------------------------------------------------------------------
   One at a time (2026-10-26, his call). Starting a video pauses every other
   one on the page, so two soundtracks never play over each other (/videos has
   a dozen). Nothing on the site autoplays, so this only ever pauses a video
   the viewer started; it stays paused where they left it. `play` does not
   bubble, so it listens in the capture phase, which also covers videos added
   later.

   No easy download (2026-10-26, his call). Hides the Download item in the
   player's menu (Chrome, Edge), turns off picture-in-picture and blocks the
   right-click "Save video as". This is a deterrent, not protection: a file a
   browser can play can still be saved.
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

for (const v of document.querySelectorAll('video')) {
  /* controlsList is Chromium-only, so TypeScript's DOM types leave it out. */
  (v as HTMLVideoElement & { controlsList?: DOMTokenList }).controlsList?.add('nodownload');
  v.disablePictureInPicture = true;
}

document.addEventListener('contextmenu', (e) => {
  if (e.target instanceof HTMLVideoElement) e.preventDefault();
});
