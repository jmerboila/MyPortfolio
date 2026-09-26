/* ============================================================================
   content.config.ts — the shape of the work.
   ----------------------------------------------------------------------------
   WHY A TYPED COLLECTION RATHER THAN v1's js/projects.js

   v1 kept its projects in a JavaScript array that was read twice: once by the
   browser to draw cards, and once by a hand-written build.js to generate the
   /work/ pages. That worked, but nothing checked it. A typo in a field name
   silently dropped a project from search results, and the only way to notice
   was to look.

   Here the schema is the contract. A missing cover or an empty summary fails
   `astro check` and fails the build — the error arrives before the deploy
   rather than after it.

   THE CASE-STUDY FIELDS ARE THE POINT, AND THEY ARE CURRENTLY EMPTY.
   Porting v1 revealed that `problem`, `approach` and `outcome` are populated
   in ZERO of the seven projects, and role/year/tools in exactly one. Those are
   the fields your own research called the part that gets you hired — a grid of
   thumbnails is a gallery, and a gallery is not a portfolio.

   So they are typed as optional, deliberately, rather than required: making
   them required today would fail the build on every entry and force seven
   pieces of fiction. Instead `caseStudyComplete()` below reports which ones
   are still missing, so the gap stays visible instead of quietly shipping.
   ========================================================================= */
import { defineCollection, reference } from 'astro:content';
import { SERIES_IDS } from './config/social-series';
import { glob } from 'astro/loaders';
/* `z` from 'astro:content' is deprecated in Astro 7 and emits a hint on every
   single use — 39 of them here. The zod re-export moved to 'astro/zod'. */
import { z } from 'astro/zod';

/* The filter keys the work grid offers, in the order they appear as buttons.
   Kept as a tuple so a typo in a project's frontmatter is a build error rather
   than a category that silently matches nothing.

   Keys stay short and stable because they are baked into published URLs and
   into every entry's frontmatter; the label is what changes when the wording
   changes. "social" reads as "Social Media Creatives" without seven files
   needing an edit.

   "marketing" has no projects yet. That is fine and deliberate: the grid
   derives its buttons from the categories actually present in the data, so
   Digital Marketing stays hidden until the first project claims it and then
   appears on its own. Same behaviour v1 had. */
export const WORK_CATEGORIES = [
  'logo',
  'graphic',
  'web',
  'mobile',
  'social',
  'marketing',
] as const;

export type WorkCategory = (typeof WORK_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<WorkCategory, string> = {
  logo: 'Logo Design',
  graphic: 'Graphic',
  web: 'Web Design',
  mobile: 'Mobile',
  social: 'Social Media',
  marketing: 'Digital Marketing',
};

const work = defineCollection({
  loader: glob({ base: './src/content/work', pattern: '**/*.md' }),
  schema: ({ image }) => {
    /* -- Launch story visuals (2026-09-25). One per chapter; `kind` picks the
       renderer in src/components/story/StoryVisual.astro. */
    const STAGE_IDS = ['discover', 'plan', 'brand', 'build', 'be-found', 'show-up', 'measure'] as const;
    const pic = z.object({ src: image(), alt: z.string(), note: z.string().optional() });
    const storyVisual = z.discriminatedUnion('kind', [
      pic.extend({ kind: z.literal('image') }),
      z.object({ kind: z.literal('gallery'), items: z.array(pic).min(1) }),
      z.object({
        kind: z.literal('chart'),
        groups: z
          .array(
            z.object({
              metric: z.string(),
              unit: z.string(),
              bars: z
                .array(z.object({ label: z.string(), value: z.number(), note: z.string().optional() }))
                .min(2),
            }),
          )
          .min(1),
        source: z.string(),
      }),
      z.object({
        kind: z.literal('plan'),
        steps: z
          .array(z.object({ time: z.string(), label: z.string(), src: image(), alt: z.string() }))
          .length(2),
        gap: z.string(),
      }),
      z.object({
        kind: z.literal('slicer'),
        artboard: image(),
        panels: z.number().int().min(2).max(10),
        alt: z.string(),
        drafts: z.array(z.object({ src: image(), alt: z.string() })).default([]),
      }),
      z.object({
        kind: z.literal('captions'),
        items: z.array(z.object({ label: z.string(), time: z.string(), text: z.string() })).min(1),
      }),
      z.object({
        kind: z.literal('clock'),
        day: z.string(),
        from: z.string(),
        to: z.string(),
        events: z.array(z.object({ time: z.string(), label: z.string() })).min(1),
      }),
      z.object({ kind: z.literal('results') }),
      /* A small data table (e.g. formats and their safe areas). */
      z.object({
        kind: z.literal('table'),
        caption: z.string(),
        columns: z.array(z.string()).min(2),
        rows: z.array(z.array(z.string())).min(1),
        source: z.string().optional(),
      }),
    ]);

    return z.object({
      /* -- Identity ------------------------------------------------------ */
      title: z.string(),
      /* Short form for breadcrumbs and prev/next, where the full title is too
         long to sit in a line of chrome. */
      shortTitle: z.string().optional(),
      /* One line, shown on the card. Capped because a card is not a paragraph
         and an over-long summary wraps into the image on narrow screens. */
      summary: z.string().max(120),
      /* The longer intro at the top of the project page. */
      intro: z.string().optional(),

      /* -- Taxonomy ------------------------------------------------------ */
      /* The human label on the card, e.g. "Logo & Identity". */
      category: z.string(),
      /* The machine keys the filter buttons match against. */
      cats: z.array(z.enum(WORK_CATEGORIES)).min(1),
      tags: z.array(z.string()).default([]),

      /* -- Artwork -------------------------------------------------------
         image() rather than a string path: Astro then knows the real
         dimensions and emits width/height, which is what keeps project cards
         from shifting the page as they load. Unreserved images are the most
         common cause of Cumulative Layout Shift, and CLS is a ranking signal.

         coverDark is optional but load-bearing for the site's one idea: the
         portfolio is designed twice, and artwork with a baked-in light
         background looks broken on the night ground. Where a piece works on
         both, one file is honest and cheaper. Where it does not, this is
         where the second one goes. */
      cover: image(),
      coverDark: image().optional(),
      coverAlt: z.string(),
      gallery: z
        .array(z.object({ src: image(), alt: z.string() }))
        .default([]),

      /* -- Motion --------------------------------------------------------
         Video stays in public/ rather than src/: Astro optimises images, not
         video, so routing it through the asset pipeline buys nothing. */
      video: z
        .object({
          src: z.string(),
          poster: z.string(),
          ratio: z.enum(['9x16', '1x1', '4x5', '16x9']).default('16x9'),
          caption: z.string().optional(),
          /* REQUIRED. Silent video is "video-only prerecorded content" under
             WCAG 1.2.1 and needs a description of what happens on screen.
             Typed as required so it cannot be forgotten. */
          alt: z.string(),
          durationISO: z.string().optional(),
          tools: z.array(z.string()).default([]),
        })
        .optional(),

      /* -- The case study ------------------------------------------------
         Optional today, and the whole job tomorrow. See the header note. */
      role: z.string().optional(),
      client: z.string().optional(),
      year: z.string().optional(),
      tools: z.array(z.string()).default([]),
      problem: z.string().optional(),
      constraints: z.array(z.string()).default([]),
      approach: z.string().optional(),
      outcome: z.string().optional(),

      /* -- v3 showcase ---------------------------------------------------
         All optional, so v2 and every entry without them are unaffected.
         `showcase` is the rank inside the entry's v3 discipline chapter
         (1 = featured). `brief` is the one-line problem shown as a chapter's
         peak when there is no result. `result` NEVER renders without a
         `source`, which is why source is required inside it: a number with
         no provenance is a claim, and this site does not make those. */
      brief: z.string().max(90).optional(),
      showcase: z.number().int().positive().optional(),
      result: z
        .object({
          value: z.string(),
          label: z.string(),
          source: z.string(),
        })
        .optional(),

      /* -- Placement ----------------------------------------------------- */
      /* Homepage shows only featured work; /work shows everything. */
      featured: z.boolean().default(false),
      /* Lower sorts first. Ties fall back to title, so ordering is stable
         rather than dependent on filesystem order. */
      order: z.number().default(100),
      /* A live site, Behance post or Instagram link. */
      /* z.url(), not z.string().url() — the chained form is deprecated in the
         zod version Astro 7 bundles. */
      externalUrl: z.url().optional(),
      draft: z.boolean().default(false),

      /* -- Launch story (2026-09-25) --------------------------------------
         An entry with `story` renders the scroll-driven story layout on
         /work/<id>/ instead of the classic body. Every number in `results`
         carries its `source`, like `result` above. */
      story: z
        .object({
          lede: z.string(),
          launched: z.coerce.date(),
          channel: z.string(),
          disclaimer: z.string(),
          /* The finished piece, shown before chapter 01. Loaded eagerly: it is
             the page's first image. */
          hero: pic.optional(),
          chapters: z
            .array(
              z.object({
                stage: z.enum(STAGE_IDS),
                heading: z.string(),
                body: z.array(z.string()).min(1),
                visual: storyVisual,
              }),
            )
            .min(1),
          results: z
            .object({
              source: z.string(),
              pieces: z
                .array(
                  z.object({
                    name: z.string(),
                    reach: z.number().int().nonnegative(),
                    stats: z.array(z.object({ label: z.string(), value: z.string() })),
                  }),
                )
                .min(1),
              insight: z.string(),
              next: z.array(z.string()).default([]),
            })
            .optional(),
          sources: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
        })
        .optional(),
    });
  },
});

/* ============================================================================
   social — posts shown on /social as the platform draws them.
   ----------------------------------------------------------------------------
   One FOLDER per post in src/content/social/: <post>/index.md plus the post's
   own images and video beside it (copy _new-post/ to start one; folders that
   start with "_" are never published). `type` picks the frame; each type
   is built from one of two media shapes, so a new platform is usually a single
   line in the union below (see src/config/social.ts for the full checklist).

   MEDIA IS SELF-HOSTED, NOT EMBEDDED. Instagram's and TikTok's embed scripts
   each pull several hundred KB of third-party JavaScript and tracking per
   post, render in an iframe that ignores the site theme, and break when the
   post is deleted or the account goes private. Images are optimised by
   Astro; videos are copied as-is (src/lib/social-media.ts resolves them).

   NO INVENTED NUMBERS. `stats` is optional and every count renders only when
   it is present. Leave it out rather than guess — a like count on a portfolio
   is a claim.
   ========================================================================= */
/* "./reel.mp4" (in the post's folder) or "/projects/reel.mp4" (in public/). */
const mediaPath = z.string().regex(/^(\.{1,2})?\//, 'Use "./file.mp4" (next to index.md) or "/path" under public/.');

const social = defineCollection({
  loader: glob({
    base: './src/content/social',
    pattern: ['**/*.md', '!**/_*/**', '!**/_*.md'],
  }),
  schema: ({ image }) => {
    const video = z.object({
      src: mediaPath,
      poster: image(),
      /* REQUIRED for the same reason as work.video.alt: WCAG 1.2.1. */
      alt: z.string(),
      /* WebVTT. Needed whenever the video has speech (1.2.2). */
      captions: mediaPath.optional(),
      durationISO: z.string().optional(),
    });

    /* A slide is an image, or a video with a poster. Exactly one. */
    const slide = z
      .object({
        image: image().optional(),
        video: mediaPath.optional(),
        poster: image().optional(),
        alt: z.string(),
      })
      .refine((s) => Boolean(s.image) !== Boolean(s.video), {
        message: 'A slide needs exactly one of `image` or `video`.',
      })
      .refine((s) => !s.video || s.poster, {
        message: 'A video slide needs a `poster`.',
      });

    const base = z.object({
      /* Internal name, and the accessible name of the card. Never shown as a
         headline, because the platforms do not show one. */
      title: z.string(),
      /* The piece's name inside its project, e.g. "Reel Reveal". Shown under
         the frame on /social and the project page. */
      piece: z.string().optional(),
      caption: z.string().default(''),
      /* Optional so nothing has to be invented. Posts without one sort by
         `order` alone and carry no uploadDate in the structured data. */
      date: z.coerce.date().optional(),
      /* The live post. Renders a "View on Instagram" link when present. */
      permalink: z.url().optional(),
      /* The sound line on Reels and TikTok, e.g. "Original audio". */
      audio: z.string().optional(),
      stats: z
        .object({
          likes: z.number().int().nonnegative(),
          comments: z.number().int().nonnegative(),
          shares: z.number().int().nonnegative(),
          saves: z.number().int().nonnegative(),
          views: z.number().int().nonnegative(),
        })
        .partial()
        .default({}),
      /* Reel, Post or Carousel on the page's filters. Optional: read from
         the post's shape when left out (see postCategory in config/social). */
      category: z.enum(['reel', 'post', 'carousel']).optional(),
      /* Kept as data, not shown since 2026-09-25 (his call: no badge,
         client or links under the cards). */
      work: reference('work').optional(),
      /* A shelf for posts with no project page yet (config/social-series.ts). */
      series: z.enum(SERIES_IDS).optional(),
      client: z.string().optional(),
      order: z.number().default(100),
      /* Drafts render in `astro dev` only, never in a build. */
      draft: z.boolean().default(false),

      /* The tools the piece was made with. Kept as data for a project's
         story; the per-post "How I made it" pages it once fed were replaced
         by project stories on /work (2026-09-25). A post's Markdown body is
         kept too, as notes, and is not rendered. */
      tools: z.array(z.string()).default([]),
    });

    const slidesPost = base.extend({
      slides: z.array(slide).min(1).max(20),
      /* Instagram's feed shapes. 4:5 is the tallest and the usual choice;
         16:9 is a landscape video, shown uncropped (it sits inside 1.91:1). */
      ratio: z.enum(['1x1', '4x5', '3x4', '16x9', '191x100']).default('4x5'),
    });

    const videoPost = base.extend({ video });

    return z.discriminatedUnion('type', [
      slidesPost.extend({ type: z.literal('instagram-post') }),
      videoPost.extend({ type: z.literal('instagram-reel') }),
      videoPost.extend({ type: z.literal('tiktok-video') }),
    ]);
  },
});

export const collections = { work, social };

/* ---------------------------------------------------------------------------
   Which case-study fields is an entry still missing?
   Used by the project page to decide whether to render the case-study section
   at all, and by `npm run audit:content` to print the gap.
   ------------------------------------------------------------------------ */
export const CASE_STUDY_FIELDS = [
  'role',
  'year',
  'problem',
  'approach',
  'outcome',
] as const;

export function missingCaseStudyFields(
  data: Record<string, unknown>,
): string[] {
  return CASE_STUDY_FIELDS.filter((f) => {
    const v = data[f];
    return v === undefined || v === null || String(v).trim() === '';
  });
}
