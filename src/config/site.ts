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
/* Replaces v1 in place (his call, 2026-09-24): the jmerboila/MyPortfolio repo,
   served by GitHub Pages. v1 is kept as the `v1-final` tag and `v1-archive`
   branch there. A custom domain later (Phase C) → site 'https://yourdomain.com',
   base '/'. astro.config.mjs duplicates both values — change them together. */
export const SITE_ORIGIN = 'https://jmerboila.github.io';
export const BASE_PATH = '/MyPortfolio';
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

/* -- The entity graph's extra facts (2026-10-01 SEO/AEO/GEO pass) ---------
   What the JSON-LD says about him beyond PERSON, kept apart so the visible
   lists that read PERSON.knowsAbout (Services) do not change with it.

   - alternateName: the short form his LinkedIn URL and resume use. Answer
     engines match "Jayson Erboila" to this page only if the graph says so.
   - DEVSIGN8 reuses the @id devsign8.com's own JSON-LD gives the agency
     (#org). Pointing at the same @id is what lets a knowledge graph merge
     the two sites' descriptions into one company, instead of guessing.
   - sameAs holds profiles OF HIM only. devsign8.com is the agency, so it is
     `worksFor`, not `sameAs`; its /about/ page (where devsign8.com describes
     its founder) is. The agency's Instagram goes on the agency.
   - knowsAbout adds the skills the case studies actually show (tools named
     in their `tools` lists, the search work on devsign8.com). Nothing here
     that a page does not back up. */
export const ENTITY = {
  alternateName: ['Jayson Erboila'],
  knowsAbout: [
    'Social Media Marketing',
    'Instagram Marketing',
    'Answer Engine Optimization',
    'Generative Engine Optimization',
    'Google Analytics 4',
    'Google Tag Manager',
    'Google Search Console',
    'Content Strategy',
    'Adobe Photoshop',
    'Adobe Illustrator',
    'Adobe InDesign',
    'Adobe After Effects',
    'Adobe Premiere Pro',
  ],
  sameAs: [
    'https://www.linkedin.com/in/jayson-erboila/',
    'https://www.behance.net/jaysonerboila',
    'https://www.devsign8.com/about/',
  ],
} as const;

export const DEVSIGN8 = {
  id: 'https://www.devsign8.com/#org',
  name: 'Devsign8',
  url: 'https://www.devsign8.com/',
  sameAs: ['https://www.instagram.com/hello.devsign8/'],
} as const;

/* -- SEO defaults -------------------------------------------------------- */
export const SEO = {
  /* A vertical bar, not an em dash: his rule for everything readers see
     (2026-09-25), and titles show in browser tabs and search results. */
  defaultTitle: `${PERSON.name} | ${PERSON.tagline}`,
  titleTemplate: (page: string) => `${page} | ${PERSON.name}`,
  /* 2026-09-29 launch: no em dash (his rule), and written for the two
     readers he wants, hiring managers and clients, in the words they search
     (about 150 characters, so Google shows it whole). */
  defaultDescription:
    'Jayson Mercado Erboila, digital marketing specialist and designer in ' +
    'Toronto: SEO, social media, web design and analytics, with measured results.',
  defaultOgImage: '/images/og-preview.jpg',
  defaultOgImageAlt:
    'Jayson Mercado Erboila, digital marketing specialist and designer, Toronto, Canada.',
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
