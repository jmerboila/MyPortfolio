/* ============================================================================
   theme.ts — the single owner of the light/dark state.
   ----------------------------------------------------------------------------
   The header toggle calls into this module rather than poking at the DOM
   directly, so there is exactly one place that knows how a theme is applied,
   stored and announced.

   The initial paint is NOT handled here — an inline blocking script in
   BaseLayout sets data-theme before the first frame, because a module script
   is deferred by definition and would flash. This module takes over afterwards.
   ========================================================================= */

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'jm-theme';
const root = document.documentElement;

/* Storage can throw in private mode or when a browser is set to block site
   data. Every access is wrapped: a failed read or write degrades to "no stored
   preference", which is a working state, not an error. */
function readStored(): Theme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

function writeStored(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* Preference is lost on reload. Acceptable; the site still works. */
  }
}

/** What the OS asks for, when the visitor has expressed no preference. */
export function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/** The theme currently on screen, whether chosen or inherited from the OS. */
export function currentTheme(): Theme {
  const attr = root.getAttribute('data-theme');
  return attr === 'light' || attr === 'dark' ? attr : systemTheme();
}

/** True once the visitor has made an explicit choice at any point. */
export function hasChosen(): boolean {
  return readStored() !== null;
}

/* ---------------------------------------------------------------------------
   Applying a theme.

   Flipping the attribute is the whole job. The colour cross-fade lives in
   base.css on the elements that change, and the icon swap lives in
   SiteHeader — both keyed off the same attribute, so they cannot disagree.
   ------------------------------------------------------------------------ */
export function applyTheme(theme: Theme): void {
  root.setAttribute('data-theme', theme);
  writeStored(theme);

  /* Keep the browser chrome in step. Without this the address bar on mobile
     stays the colour of the theme the visitor just left. */
  const meta = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]:not([media])',
  );
  if (meta) meta.content = theme === 'dark' ? '#0a0b10' : '#f7f6f3';

  /* Anything that needs to react — the toggle's pressed state, the music
     button's icon — listens for this instead of being called directly. */
  window.dispatchEvent(
    new CustomEvent<Theme>('themechange', { detail: theme }),
  );
}

export function toggleTheme(): Theme {
  const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}

/* ---------------------------------------------------------------------------
   Follow the OS while the visitor has not chosen.
   Once they choose, their choice wins permanently and we stop listening.
   ------------------------------------------------------------------------ */
export function watchSystemTheme(): void {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', () => {
    if (!hasChosen()) {
      window.dispatchEvent(
        new CustomEvent<Theme>('themechange', { detail: systemTheme() }),
      );
    }
  });
}

/** True when the visitor has asked the OS to reduce motion. */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ---------------------------------------------------------------------------
   A word-labelled toggle, as used by the v2B and v3 shells.
   The visible word states the CURRENT theme; the accessible name states the
   ACTION. Deliberately different: a sighted user reads state, a screen-reader
   user needs to know what pressing it will do.
   ------------------------------------------------------------------------ */
export function bindThemeToggle(btn: HTMLElement, label: HTMLElement): void {
  const sync = () => {
    const now = currentTheme();
    label.textContent = now === 'dark' ? 'Dark' : 'Light';
    btn.setAttribute('aria-label', `Switch to ${now === 'dark' ? 'light' : 'dark'} theme`);
  };
  btn.addEventListener('click', () => {
    toggleTheme();
    sync();
  });
  window.addEventListener('themechange', sync);
  sync();
}
