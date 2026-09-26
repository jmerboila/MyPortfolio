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
  /** Heading before the accent word, e.g. "Marks that". */
  title: string;
  /** The serif accent word, e.g. "last". */
  accent: string;
  lede: string;
  blurb: string;
}

export const TYPE_COPY: Partial<Record<WorkCategory, TypeCopy>> = {
  logo: {
    title: 'Marks that',
    accent: 'last',
    lede: 'Logos and brand marks, one project at a time. Open any one for the full artwork.',
    blurb: 'Logos and brand marks for studios, apps and people.',
  },
  web: {
    title: 'Sites that',
    accent: 'work',
    lede: 'Website design, one project at a time. Open any one for the full artwork.',
    blurb: 'Websites for studios and small businesses.',
  },
  social: {
    title: 'Made for the',
    accent: 'feed',
    lede: 'Social campaigns, one project at a time. Tap any video to play it, and open a story to see how it was made.',
    blurb: 'Instagram campaigns, each with the story of how it was made.',
  },
};
