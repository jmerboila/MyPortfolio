/* ============================================================================
   site.ts — single source of truth for identity, URLs and SEO defaults.
   ----------------------------------------------------------------------------
   Everything that appears in more than one place lives here: the canonical
   origin, the person behind the site, the social profiles that feed the
   `sameAs` entity graph, and the analytics IDs. Change it once, and the head
   tags, JSON-LD, sitemap and footer all follow.

   WHY A SINGLE FILE: v1 repeated the same name, URL and social links across
   nine hand-written HTML files. One rename meant nine edits and one of them
   was always missed. Consistent entity naming is also the thing AI answer
   engines key on when they build a knowledge graph for you, so drift here is
   an SEO cost, not just a maintenance one.
   ========================================================================= */

/* -- Where the site lives ------------------------------------------------ */
/* TODO(jayson): confirm before first deploy. Options are:
   1. Replace v1 in place  → site 'https://jmerboila.github.io', base '/MyPortfolio'
   2. Ship alongside v1    → site 'https://jmerboila.github.io', base '/MyPortfolio2'
   3. Custom domain        → site 'https://yourdomain.com',      base '/'
   Set to (2) for now so v1 keeps serving traffic while v2 is built. */
export const SITE_ORIGIN = 'https://jmerboila.github.io';
export const BASE_PATH = '/MyPortfolio2';
export const SITE_URL = `${SITE_ORIGIN}${BASE_PATH}`;

/* -- Who ----------------------------------------------------------------- */
export const PERSON = {
  name: 'Jayson Mercado Erboila',
  firstName: 'Jayson',
  jobTitle: 'Digital Marketing Specialist',
  /* The positioning line. Your research is emphatic that a named service beats
     a job title — Grellier sells "pixel-perfect precision", not "developer". */
  tagline: 'Digital Marketing Specialist & Designer',
  /* The published contact address — confirmed by Jayson 2026-09-24 over
     hello.devsign8@gmail.com (his account email, never published). */
  email: 'jmerboila@gmail.com',
  location: {
    city: 'Toronto',
    region: 'Ontario',
    regionCode: 'ON',
    country: 'Canada',
    countryCode: 'CA',
  },
  knowsAbout: [
    'Logo Design',
    'Graphic Design',
    'Web Design',
    'UI Design',
    'UX Research',
    'Digital Marketing',
    'Branding',
    'SEO',
  ],
} as const;

/* -- Social profiles ------------------------------------------------------
   These become schema.org `sameAs`. Answer engines use them to resolve
   "Jayson Mercado Erboila" to one entity rather than several, so the list
   should stay complete and the display names should match the profiles. */
export const SOCIALS = [
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/jayson-erboila/' },
  { label: 'Behance', url: 'https://www.behance.net/jaysonerboila' },
  { label: 'Instagram', url: 'https://www.instagram.com/hello.devsign8/' },
  { label: 'Devsign8', url: 'https://www.devsign8.com' },
] as const;

/* -- SEO defaults -------------------------------------------------------- */
export const SEO = {
  defaultTitle: `${PERSON.name} — ${PERSON.tagline}`,
  titleTemplate: (page: string) => `${page} — ${PERSON.name}`,
  defaultDescription:
    'Portfolio of Jayson Mercado Erboila — Digital Marketing Specialist in ' +
    'Toronto, Ontario. Marketing strategy paired with logo, brand identity, ' +
    'graphic, web and UI/UX design.',
  defaultOgImage: '/images/og-preview.jpg',
  locale: 'en_CA',
  lang: 'en-CA',
} as const;

/* -- Analytics and verification ------------------------------------------ */
export const ANALYTICS = {
  gtmId: 'GTM-TSQXJVC5',
  googleSiteVerification: 'hRq-Wg-nMmqIsL_JF_maiaXqtnDpdAjUFxG-zU3VLaw',
} as const;

/* -- Rights ---------------------------------------------------------------
   One sentence, and increasingly expected on a creative portfolio. */
export const RIGHTS_NOTICE =
  'Work on this site may not be used for AI or machine-learning training.';

/* -- Helper: absolute URL from a site-relative path ------------------------
   Every canonical, OG image and JSON-LD @id needs an absolute URL. Doing it
   by hand is how trailing-slash and double-slash bugs get shipped. */
export function absoluteUrl(path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${clean}`.replace(/([^:]\/)\/+/g, '$1');
}
