/* ============================================================================
   motion.ts — the single owner of the motion preference.
   ----------------------------------------------------------------------------
   WHY THIS EXISTS AS A REAL PREFERENCE AND NOT A GRADIENT PAUSE BUTTON

   WCAG 2.2.2 Pause, Stop, Hide (Level A) requires that moving content lasting
   more than five seconds, presented in parallel with other content, can be
   paused. The hero backdrop drifts indefinitely, so it needs that mechanism.

   A button that paused only the gradient would satisfy the letter of it today
   and silently fail the moment a second ambient animation ships — the classic
   way this criterion breaks is per-component pause logic where one layer keeps
   moving. So this owns motion for the whole site: one attribute on <html>,
   which tokens.css reads to collapse every duration AND to pause every
   ambient loop at once.

   THE THREE STATES mirror the theme exactly, on purpose:
     1. no attribute            → follow the OS
     2. prefers-reduced-motion  → reduced, unless explicitly set to full
     3. [data-motion="..."]     → an explicit choice wins in both directions

   On that last point: allowing someone to opt back INTO motion against their
   OS setting is deliberate. The OS preference is a sensible default, not a
   verdict — a visitor who wants the full thing on this one site should be able
   to say so, and it is the same contract the theme toggle already offers.

   The initial paint is NOT handled here — an inline blocking script in
   BaseLayout sets data-motion before the first frame. This module takes over
   afterwards.
   ========================================================================= */

export type MotionPref = 'full' | 'reduced';

const STORAGE_KEY = 'jm-motion';
const root = document.documentElement;

/* Storage throws in private mode and when a browser blocks site data. Every
   access is wrapped: a failed read degrades to "no stored preference", which
   is a working state rather than an error. */
function readStored(): MotionPref | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'full' || v === 'reduced' ? v : null;
  } catch {
    return null;
  }
}

function writeStored(pref: MotionPref): void {
  try {
    localStorage.setItem(STORAGE_KEY, pref);
  } catch {
    /* Preference is lost on reload. Acceptable; the site still works. */
  }
}

/** What the OS asks for, when the visitor has expressed no preference. */
export function systemMotion(): MotionPref {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'reduced'
    : 'full';
}

/** The preference in force right now, whether chosen or inherited from the OS. */
export function currentMotion(): MotionPref {
  const attr = root.getAttribute('data-motion');
  return attr === 'full' || attr === 'reduced' ? attr : systemMotion();
}

/** True once the visitor has made an explicit choice at any point. */
export function hasChosenMotion(): boolean {
  return readStored() !== null;
}

/**
 * The one question every animation should ask.
 *
 * Components must call this rather than reading the media query directly —
 * otherwise the toggle silently fails to reach them, which is precisely the
 * per-component drift this module exists to prevent.
 */
export function motionReduced(): boolean {
  return currentMotion() === 'reduced';
}

export function applyMotion(pref: MotionPref): void {
  root.setAttribute('data-motion', pref);
  writeStored(pref);

  /* Anything that needs to react — the toggle's own pressed state and label —
     listens for this instead of being called directly. */
  window.dispatchEvent(
    new CustomEvent<MotionPref>('motionchange', { detail: pref }),
  );
}

export function toggleMotion(): MotionPref {
  const next: MotionPref = currentMotion() === 'reduced' ? 'full' : 'reduced';
  applyMotion(next);
  return next;
}

/* ---------------------------------------------------------------------------
   Follow the OS while the visitor has not chosen.
   Once they choose, their choice wins and we only re-broadcast for listeners.
   ------------------------------------------------------------------------ */
export function watchSystemMotion(): void {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', () => {
    if (!hasChosenMotion()) {
      window.dispatchEvent(
        new CustomEvent<MotionPref>('motionchange', { detail: systemMotion() }),
      );
    }
  });
}
