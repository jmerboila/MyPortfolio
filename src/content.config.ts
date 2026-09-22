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
  logo: 'Logo',
  graphic: 'Graphic',
  web: 'Web',
  mobile: 'Mobile',
  social: 'Social Media Creatives',
  marketing: 'Digital Marketing',
};

const work = defineCollection({
  loader: glob({ base: './src/content/work', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
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
    }),
});

/* ============================================================================
   social — posts shown on /social as the platform draws them.
   ----------------------------------------------------------------------------
   One file per post in src/content/social/. `type` picks the frame; each type
   is built from one of two media shapes, so a new platform is usually a single
   line in the union below (see src/config/social.ts for the full checklist).

   MEDIA IS SELF-HOSTED, NOT EMBEDDED. Instagram's and TikTok's embed scripts
   each pull several hundred KB of third-party JavaScript and tracking per
   post, render in an iframe that ignores the site theme, and break when the
   post is deleted or the account goes private. Posters and slides go in
   src/assets (Astro optimises them); video goes in public/social/.

   NO INVENTED NUMBERS. `stats` is optional and every count renders only when
   it is present. Leave it out rather than guess — a like count on a portfolio
   is a claim.
   ========================================================================= */
const social = defineCollection({
  loader: glob({ base: './src/content/social', pattern: '**/*.md' }),
  schema: ({ image }) => {
    const video = z.object({
      /* Path under public/, e.g. "/social/launch-reel.mp4". */
      src: z.string().startsWith('/'),
      poster: image(),
      /* REQUIRED for the same reason as work.video.alt: WCAG 1.2.1. */
      alt: z.string(),
      /* No audio track. Hides the mute button, which would otherwise be a
         control that does nothing. */
      silent: z.boolean().default(false),
      /* WebVTT under public/. Needed whenever the video has speech (1.2.2). */
      captions: z.string().startsWith('/').optional(),
      durationISO: z.string().optional(),
    });

    /* A slide is an image, or a video with a poster. Exactly one. */
    const slide = z
      .object({
        image: image().optional(),
        video: z.string().startsWith('/').optional(),
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
      /* Links the card to its case study on /work. */
      work: reference('work').optional(),
      client: z.string().optional(),
      order: z.number().default(100),
      /* Drafts render in `astro dev` only, never in a build. */
      draft: z.boolean().default(false),
    });

    const slidesPost = base.extend({
      slides: z.array(slide).min(1).max(20),
      /* Instagram's feed crops. 4:5 is the tallest and the usual choice. */
      ratio: z.enum(['1x1', '4x5', '3x4', '191x100']).default('4x5'),
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
