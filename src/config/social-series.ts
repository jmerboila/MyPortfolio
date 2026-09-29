/* ============================================================================
   social-series.ts: shelves for posts that belong together but have no
   project page yet (2026-09-26).
   ----------------------------------------------------------------------------
   A post joins a shelf one of two ways: `work:` (a Work project, with its own
   page and story) or `series:` (one of these). A series is the lighter one:
   a titled shelf on /work/social/ and nothing else. When a series gets its
   story written, it becomes a Work project and its posts switch to `work:`.

   No imports on purpose: content.config.ts reads SERIES_IDS for the schema.
   ========================================================================= */

export interface SeriesCopy {
  title: string;
  /** The small accent label before the title, e.g. "03 · Poster series". */
  label: string;
  idea: string;
  /** Small print under the idea, e.g. a trademark disclaimer. */
  note?: string;
}

export const SOCIAL_SERIES = {
  /* His words (2026-09-26): made for himself, to show he can design from
     scratch in InDesign and animate it in After Effects; more NX variants
     will follow, so the series is the model line, not one car. */
  '2026-lexus-nx': {
    title: '2026 Lexus NX',
    label: 'Poster series',
    idea: 'Designed in Adobe InDesign, then animated in After Effects: one poster, two formats for the feed. The first of the NX line.',
    note: 'Self-initiated concept. Not affiliated with or endorsed by Lexus or Toyota.',
  },
  /* His call (2026-09-26): where he tries viral and trending formats. */
  trends: {
    title: 'Exploring viral trends',
    label: 'Experiments',
    idea: 'Where I try the formats and trends taking off on Instagram, to learn what makes people stop scrolling.',
  },
} satisfies Record<string, SeriesCopy>;

export type SeriesId = keyof typeof SOCIAL_SERIES;
export const SERIES_IDS = Object.keys(SOCIAL_SERIES) as [SeriesId, ...SeriesId[]];
