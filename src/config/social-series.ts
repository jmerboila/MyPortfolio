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
  /* 2026-lexus-nx was a series here until 2026-09-29, when its story was
     written; it is now the Work project src/content/work/2026-lexus-nx.md. */
  /* His call (2026-09-26): where he tries viral and trending formats. */
  trends: {
    title: 'Exploring viral trends',
    label: 'Experiments',
    idea: 'Where I try the formats and trends taking off on Instagram, to learn what makes people stop scrolling.',
  },
} satisfies Record<string, SeriesCopy>;

export type SeriesId = keyof typeof SOCIAL_SERIES;
export const SERIES_IDS = Object.keys(SOCIAL_SERIES) as [SeriesId, ...SeriesId[]];
