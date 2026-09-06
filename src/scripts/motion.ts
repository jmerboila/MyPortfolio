/* ============================================================================
   motion.ts — the single answer to "should this animate?".
   ----------------------------------------------------------------------------
   This used to own a full user-facing preference: a `data-motion` attribute, a
   storage key and a pause button in the header, because WCAG 2.2.2 Pause,
   Stop, Hide (Level A) demands a control for anything that moves on its own
   for more than five seconds.

   Nothing on the site does that any more. The drifting orbs are gone, the dot
   grid only reacts to a pointer, the parallax only reacts to a scroll, the
   typing effect finishes in under two seconds, and its caret now stops with
   it. Motion that a person causes is not motion that "starts automatically",
   so the criterion no longer applies and the button it required was answering
   a question nobody was asking.

   What remains is the part that was never optional: the OS preference. Every
   component asks THIS function rather than reading the media query directly,
   so there is still exactly one place that knows the answer — and if a genuine
   ambient animation is ever added, the control goes back here rather than
   being reinvented per component.
   ========================================================================= */

const query = window.matchMedia('(prefers-reduced-motion: reduce)');

/** True when the visitor has asked their OS to reduce motion. */
export function motionReduced(): boolean {
  return query.matches;
}

/**
 * Run `handler` whenever the OS preference changes.
 * Components use this to tear an effect down, or bring it back, live — rather
 * than reading the preference once at startup and going stale.
 */
export function onMotionChange(handler: (reduced: boolean) => void): void {
  query.addEventListener('change', () => handler(query.matches));
}
