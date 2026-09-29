/* ============================================================================
   stage-proof.ts: the short proof each lifecycle stage shows, and where it
   sends the visitor to see more.
   ----------------------------------------------------------------------------
   2026-09-28, his brief: each stage is a SHORT summary that makes people
   want to look inside. So every block is one visual idea plus one link into
   a deeper page (a project page, the devsign8.com case study, the social
   shelves). Keyed by the stage id in lifecycle.ts; StageProof.astro renders
   it. Kept out of lifecycle.ts because this file imports images, and
   lifecycle.ts is loaded by the Node unit tests, which cannot import them.

   TIMELESS (his call, 2026-09-28): nothing visible carries a date. The
   dates below are provenance for whoever re-measures, never page copy.
   Chosen for his two goals (hiring managers and clients): numbers that
   show judgement and outcomes, as ratios or scores, not small raw counts.

   Every number here is real, with its source:
   - PageSpeed Insights, live www.devsign8.com, mobile. 2026-09-28 7:42 pm:
     98 / 98 / 100 / 100, LCP 1.5 s. 2026-09-29 12:24 am, AFTER his site
     update: Performance 90, Accessibility 98, Best Practices 100, SEO 100,
     LCP 2.9 s, CLS 0.005, twice; 1.2 s of render-blocking Google Fonts CSS.
     He turned on Cloudflare Fonts (fonts served from devsign8.com, the
     Google Fonts link gone). Re-run 2026-09-29 12:43 and 12:44 am:
     Performance 96 and 97, LCP 2.0 s both, CLS 0.005. The page uses 96,
     the lower run. After the footer heading fix went live (h4 to h2,
     2026-09-29 1:49 am): Accessibility 100; Performance 99 on a fresh run (LCP 1.7 s).
     One run in between read 69 with 1.4 s blocking time that neither a
     local 4x-CPU trace nor the other runs reproduced: treated as noise.
     The page keeps 96 for speed (conservative) and shows 100 for
     accessibility.
   - Google Search Console, devsign8.com domain property, last 16 months as
     of 2026-09-29 (first data 2026-06-22): 13 clicks, 57 impressions,
     CTR 22.8%, average position 8.7. Queries mostly anonymised, so part of
     the CTR may be brand searches; small sample, shown as a rate only.
   - Buffer (org "My Organization"), list_posts pulled 2026-09-28: Instagram
     Reels averaged 43 accounts reached per post (13 posts), image posts 3.5
     (2 posts) = 12x. Hook test, same Toolkit series, both Reels: "Your 4:5
     post loses 34px per side on the grid" reached 84; "Only the centre
     circle of your highlight cover survives" reached 6 = 14x.
   - Posting slots: Buffer's 2026 studies (52M posts; 9.6M Instagram,
     4.8M LinkedIn), local time:
     buffer.com/resources/when-is-the-best-time-to-post-on-instagram/
     buffer.com/resources/best-time-to-post-on-linkedin/
     buffer.com/resources/best-time-to-post-social-media/
   - Search (05): only what is LIVE on devsign8.com as of 2026-09-28 (FAQPage
     with 4 answers, Organization + ProfessionalService schema, llms.txt,
     sitemap). The /web-design/ page from the audit is NOT live yet, so it is
     not claimed.
   ========================================================================= */
import type { ImageMetadata } from 'astro';
import jmIllustrator from '../assets/stages/jm-design-illustrator.webp';
import d8Illustrator from '../assets/stages/devsign8-illustrator.webp';
import siteDesktopDark from '../assets/stages/devsign8-site-desktop.webp';
import siteMobileDark from '../assets/stages/devsign8-site-mobile.webp';
import siteDesktopLight from '../assets/stages/devsign8-site-desktop-light.webp';
import siteMobileLight from '../assets/stages/devsign8-site-mobile-light.webp';
import toolkitFeed from '../content/social/devsign8-ig-toolkit-reel/5-cover.jpg';
import toolkitReel from '../content/social/devsign8-ig-toolkit-reel/1-cover.jpg';
import lexusPoster from '../content/social/lexus-poster-post/poster.png';

export interface Link {
  label: string;
  path: string;
}

export interface Pic {
  src: ImageMetadata;
  alt: string;
}

export type Proof =
  | { kind: 'logos'; items: (Pic & { title: string; line: string; path: string })[]; link: Link }
  | {
      kind: 'site';
      /* Shown against the page's theme: the DARK site on a light page, the
         LIGHT site on a dark page (his call), so the screenshots stand out. */
      dark: { desktop: Pic; mobile: Pic };
      light: { desktop: Pic; mobile: Pic };
      points: string[];
      /** The live site itself (external, UTM-tagged at render). */
      visit: { label: string; url: string };
      link: Link;
    }
  | { kind: 'found'; intro: string; pillars: { tag: string; name: string; line: string }[]; note: string; link: Link }
  | {
      kind: 'social';
      intro: string;
      tiles: Pic[];
      plan: { channel: string; slots: string }[];
      source: string;
      link: Link;
    }
  | {
      kind: 'results';
      tiles: { value: string; unit?: string; label: string; line: string; source: string; path: string }[];
      link: Link;
    };

const CASE = '/work/web/devsign8-website/';

export const STAGE_PROOF: Record<string, Proof> = {
  brand: {
    kind: 'logos',
    items: [
      {
        src: jmIllustrator,
        alt: 'The finished JM monogram in Adobe Illustrator: a tall serif J cut through a serif M, black on the white artboard.',
        title: 'JM Design',
        line: 'My monogram, finished in Illustrator. Watch it come together.',
        path: '/work/logo/jm-design/',
      },
      {
        src: d8Illustrator,
        alt: 'The finished Devsign8 wordmark selected in Adobe Illustrator: Dev in a heavy sans, sign in a light serif, then the 8.',
        title: 'Devsign8',
        line: 'The studio wordmark, set and kerned. Watch it come to life.',
        path: '/work/logo/devsign8/',
      },
    ],
    link: { label: 'See all my logo work', path: '/work/logo/' },
  },

  build: {
    kind: 'site',
    dark: {
      desktop: {
        src: siteDesktopDark,
        alt: 'The devsign8.com homepage in dark mode on a desktop screen: "Branding, websites, and SEO that help your business get found online." with a "Get a free audit" button.',
      },
      mobile: { src: siteMobileDark, alt: 'The same devsign8.com homepage in dark mode on a phone.' },
    },
    light: {
      desktop: {
        src: siteDesktopLight,
        alt: 'The devsign8.com homepage in light mode on a desktop screen: "Branding, websites, and SEO that help your business get found online." with a "Get a free audit" button.',
      },
      mobile: { src: siteMobileLight, alt: 'The same devsign8.com homepage in light mode on a phone.' },
    },
    points: [
      'Fits every screen, from phone to desktop, in light and dark.',
      'Fast and accessible on mobile: 96 for speed, 100 for accessibility (built for AODA, WCAG 2.0 AA).',
      'Tracking live from day one.',
    ],
    visit: { label: 'Visit devsign8.com', url: 'https://www.devsign8.com/' },
    link: { label: 'See how it was built', path: CASE },
  },

  'be-found': {
    kind: 'found',
    intro: 'People find a business three ways now. Here is what devsign8.com does for each:',
    pillars: [
      {
        tag: 'SEO',
        name: 'Rank on Google',
        line: 'A page for every service, titles written for real searches, and a sitemap Google can read.',
      },
      {
        tag: 'AEO',
        name: 'Be the answer',
        line: 'Short answers to real questions, marked up so Google can show them.',
      },
      {
        tag: 'GEO',
        name: 'Get cited by AI',
        line: 'Business details AI tools can read, plus Bing, which feeds Copilot.',
      },
    ],
    note: "devsign8.com scores 100/100 on Google's SEO check.",
    link: { label: 'See the full search setup', path: `${CASE}#be-found` },
  },

  'show-up': {
    kind: 'social',
    intro: 'Posts people stop for, planned in Buffer and timed by the data.',
    tiles: [
      {
        src: toolkitReel,
        alt: 'A Devsign8 spec card for the Instagram Reel: 1080 by 1920, keep 270px clear at the top, 672px at the bottom and 65px at the sides.',
      },
      {
        src: toolkitFeed,
        alt: 'A Devsign8 spec card for the 4:5 feed post: 1080 by 1350, 120px inset, and the profile grid crop marked.',
      },
      {
        src: lexusPoster,
        alt: 'Lexus NX 350h poster: a white NX in side profile across a deep red band, with 240 HP and 200 KM/H below.',
      },
    ],
    plan: [
      { channel: 'Instagram', slots: 'Wed 6 pm · Thu 9 am' },
      { channel: 'LinkedIn', slots: 'Wed 4 pm' },
      { channel: 'Facebook', slots: 'Thu 9 am' },
    ],
    source: "Slots from Buffer's study of 52 million posts. Then my own numbers decide what stays.",
    link: { label: 'See all my social media work', path: '/work/social/' },
  },

  measure: {
    kind: 'results',
    tiles: [
      {
        value: '23%',
        label: 'Found and clicked',
        line: 'Of people who see devsign8.com on Google, 23% click it. It ranks on page one on average.',
        source: 'Google Search Console',
        path: `${CASE}#measure`,
      },
      {
        value: '14×',
        label: 'A stronger hook',
        line: 'Opening with a real problem reached 14 times more people than a vague topic.',
        source: 'Buffer, Instagram Reels',
        path: '/work/social/devsign8-ig-safe-zone-toolkit/#measure',
      },
      {
        value: '12×',
        label: 'The right format',
        line: 'Reels reached 12 times more people per post than image posts.',
        source: 'Buffer, Instagram',
        path: '/work/social/2026-ford-mustang-gtd/#measure',
      },
    ],
    link: { label: 'See how I measure and improve', path: `${CASE}#measure` },
  },
};
