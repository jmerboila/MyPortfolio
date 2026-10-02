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
   - Format (2026-10-02, so the tile matches the page it links to): the
     Ford launch's own results, Reel 104 reached vs carousel 4 = 26x
     (Instagram Insights via Buffer, one month after posting). It replaced
     an account-wide figure the Ford page never showed: Reels averaged 43
     reached per post (13 posts), image posts 3.5 (2 posts) = 12x (Buffer
     list_posts, 2026-09-28).
   - Hook test, same Toolkit series, both Reels: "Your 4:5
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
import jmMark from '../assets/projects/logos/jm-design/id-01-mark.webp';
import jmMarkDark from '../assets/projects/logos/jm-design/id-01-mark-dark.webp';
import d8Mark from '../assets/projects/logos/devsign8/id-01-mark.webp';
import d8MarkDark from '../assets/projects/logos/devsign8/id-01-mark-dark.webp';
import { SITE_SHOTS, type SiteShots } from './site-shots';
import toolkitReel from '../content/social/devsign8-ig-toolkit-reel/1-cover.jpg';
import lexusPoster from '../content/social/lexus-poster-post/poster.png';
import fordCarousel from '../assets/projects/social-mustang-gtd-1.webp';

export interface Link {
  label: string;
  path: string;
}

export interface Pic {
  src: ImageMetadata;
  alt: string;
}

export type Proof =
  /* Each logo's mark panel in light and dark (the design rule, 2026-10-02):
     ThemeImage shows the one opposite the page, as on the logo pages. */
  | { kind: 'logos'; items: { light: Pic; dark: Pic; title: string; line: string; path: string }[]; link: Link }
  | {
      kind: 'site';
      /* Shown against the page's theme: the DARK site on a light page, the
         LIGHT site on a dark page (his call), so the screenshots stand out.
         Drawn by SiteShowcase.astro, shared with the Work cards (2026-09-30). */
      shots: SiteShots;
      points: string[];
      /** The live site itself (external, UTM-tagged at render). */
      visit: { label: string; url: string };
      link: Link;
    }
  | { kind: 'found'; intro: string; pillars: { tag: string; name: string; line: string }[]; note: string; link: Link }
  | {
      kind: 'social';
      /** The one-line hook (2026-10-02: no posting schedule). */
      intro: string;
      tiles: Pic[];
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
        light: { src: jmMark, alt: 'The JM monogram in black on cream: a tall serif J threaded through an M.' },
        dark: { src: jmMarkDark, alt: 'The JM monogram in cream on black: a tall serif J threaded through an M.' },
        title: 'JM Design',
        line: 'Two letters, one mark: the J leads, and the M works with it.',
        path: '/work/logo/jm-design/',
      },
      {
        light: { src: d8Mark, alt: 'The Devsign8 wordmark in black on warm paper: Dev in a heavy sans serif, sign8 in a high-contrast serif.' },
        dark: { src: d8MarkDark, alt: 'The Devsign8 wordmark in warm white on ink: Dev in a heavy sans serif, sign8 in a high-contrast serif.' },
        title: 'Devsign8',
        line: 'Dev for code, sign for design, and an 8 that turns on its side into infinity.',
        path: '/work/logo/devsign8/',
      },
    ],
    link: { label: 'See all my logo work', path: '/work/logo/' },
  },

  build: {
    kind: 'site',
    shots: SITE_SHOTS.devsign8,
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
    intro: 'Made to stop the scroll. Measured to prove it did.',
    /* His order (2026-10-02): the Toolkit Reel, the Lexus poster, then the
       Ford Seamless Carousel, one from each social project. */
    tiles: [
      {
        src: toolkitReel,
        alt: 'A Devsign8 spec card for the Instagram Reel: 1080 by 1920, keep 270px clear at the top, 672px at the bottom and 65px at the sides.',
      },
      {
        src: lexusPoster,
        alt: 'Lexus NX 350h poster: a white NX in side profile across a deep red band, with 240 HP and 200 KM/H below.',
      },
      {
        src: fordCarousel,
        alt: "The 2026 Ford Mustang GTD Seamless Carousel's first panel: the Ford oval above Street Legal, But Just Barely, over drifting smoke.",
      },
    ],
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
        line: 'A hook that named a loss people could picture reached 14 times more people than the weakest.',
        source: 'Instagram Insights via Buffer',
        path: '/work/social/devsign8-ig-safe-zone-toolkit/#measure',
      },
      {
        value: '26×',
        label: 'The right format',
        line: 'My launch Reel reached 26 times more people than the carousel posted with it.',
        source: 'Instagram Insights via Buffer',
        path: '/work/social/2026-ford-mustang-gtd/#measure',
      },
    ],
    link: { label: 'See how I measure and improve', path: `${CASE}#measure` },
  },
};
