/* ============================================================================
   url.ts — base-path-safe link helpers.
   ----------------------------------------------------------------------------
   The site is served from a subpath on GitHub Pages ("/MyPortfolio"), so a
   hand-written href="/about" would 404 in production while working perfectly
   in dev. Astro exposes the configured base as import.meta.env.BASE_URL, but
   whether it carries a trailing slash varies, so every link goes through here
   instead of concatenating by hand.
   ========================================================================= */

/** Astro's configured base, normalised to have no trailing slash. */
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

/**
 * Site-relative href, base-path aware.
 *   href('/')        → '/MyPortfolio/'
 *   href('/work')    → '/MyPortfolio/work/'
 *   href('#contact') → '#contact'   (fragments are left alone)
 */
export function href(path: string): string {
  if (!path || path.startsWith('#')) return path;
  if (/^[a-z]+:/i.test(path) || path.startsWith('//')) return path;

  // Split the fragment and query off before normalising. Without this,
  // href('/#work') produced '/MyPortfolio/#work/' — a trailing slash AFTER
  // the fragment, which does not match the element id and silently breaks
  // every in-page anchor in the nav.
  const hashAt = path.search(/[#?]/);
  const pathname = hashAt === -1 ? path : path.slice(0, hashAt);
  const suffix = hashAt === -1 ? '' : path.slice(hashAt);

  const clean = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const joined = `${BASE}${clean}`;

  // Directory-style URLs: keep one trailing slash, except on files.
  const isFile = /\.[a-z0-9]+$/i.test(joined);
  const normalised = isFile || joined.endsWith('/') ? joined : `${joined}/`;

  return `${normalised}${suffix}`;
}

/** Same as href(), but for assets in /public where a trailing slash is wrong. */
export function asset(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${clean}`;
}
