/* ============================================================================
   work-types.ts: the words on each Work page (2026-09-26).
   ----------------------------------------------------------------------------
   Every page under Work opens the way /work/social/ does: a big heading with
   one serif accent word, then a short lede. `blurb` is the one line the type
   gets on its shelf on /work/. A type with no entry here falls back to its
   CATEGORY_LABELS name, so a new type still gets a working page.
   ========================================================================= */
import type { WorkCategory } from '../content.config';

export interface TypeCopy {
  /** The full name: the type's shelf title on /work/, its schema name and
      meta description (his call, 2026-10-28). The menu, footer, breadcrumbs
      and browser tab keep the short CATEGORY_LABELS name, so they fit on a
      phone and in a search result. */
  name?: string;
  /** Heading before the accent word, e.g. "Marks that". */
  title: string;
  /** The serif accent word, e.g. "last". */
  accent: string;
  lede: string;
  blurb: string;
}

export const TYPE_COPY: Partial<Record<WorkCategory, TypeCopy>> = {
  logo: {
    name: 'Logo Design & Logo Reveal Animation',
    title: 'Marks that',
    accent: 'last',
    lede: 'Each mark from construction to usage, and logo reveals animated in After Effects.',
    blurb: 'Brand marks built in Illustrator, from construction lines to usage rules, and logo reveals animated in After Effects.',
  },
  web: {
    title: 'Sites that',
    accent: 'work',
    lede: 'Website design, one project at a time. Open any one for the full artwork.',
    blurb: 'Websites for studios and small businesses.',
  },
  print: {
    title: 'Posters that',
    accent: 'stop',
    lede: 'Posters and animated posters, one project at a time. Open any one for the full artwork.',
    blurb: 'Posters for car launches and campus screens, each as a still and an animated version.',
  },
  social: {
    name: 'Social Media: Viral Trends, Campaigns, Series & Tutorials',
    title: 'Made for the',
    accent: 'feed',
    lede: 'Viral trends, campaigns, a content series and tutorials for Instagram, TikTok and Facebook, one project at a time. Tap any video to play it, and open a story to see how it was made.',
    blurb: 'Viral trend experiments, launch campaigns, a content series and how-to tutorials for Instagram, TikTok and Facebook, each showing how it was planned and made.',
  },
};
