# /social by Project and the 2026 Ford Mustang GTD Story: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Regroup /social into project shelves and give the 2026 Ford Mustang GTD a scroll-driven launch story at `/work/2026-ford-mustang-gtd/`.

**Architecture:** A project is a `work` collection entry; social posts join it through `work:`. A work entry with a `story` block renders the new launch-story layout (chapters with sticky visuals, GSAP extras); entries without one keep the classic case-study body. All Work pages move to `V3Layout`. /social renders shelves grouped by `work`.

**Tech Stack:** Astro 5 content collections (zod), GSAP + ScrollTrigger, node:test build tests against `dist/`, Python + Pillow for asset conversion.

**Spec:** `docs/superpowers/specs/2026-09-25-social-projects-mustang-story-design.md`

## Global Constraints

- The project name is exactly **2026 Ford Mustang GTD**. Its pieces are the **Seamless Carousel** and the **Reel Reveal**.
- No em dashes (U+2014) in any reader-facing copy: content files, page text, alt text, captions.
- Disclaimer, visible on the story page: "Self-initiated concept. Not affiliated with or endorsed by Ford Motor Company."
- Base path is `/MyPortfolio`; build links with `href()` from `src/lib/url.ts`.
- Nothing autoplays; no mute buttons (existing /social contract).
- Motion never loops and is skipped under reduced motion (`motionReduced()` from `src/scripts/motion.ts`).
- Styles for nested components go in global sheets with a prefix (`st-` story, `sp-` social); Astro scoped styles do not reach child components.
- Run `npm test` and `npm run test:build` before every commit. After content-schema changes, delete `.astro/data-store.json` and restart `astro dev` before checking in the browser.

## File Map

| File | Responsibility |
|---|---|
| `scripts/assets/gtd-assets.py` (new) | One-off: his Ford GTD PNGs and the two workspace captures to WebP in `src/assets/projects/` |
| `src/content/work/2026-ford-mustang-gtd.md` (renamed from `mustang-gtd.md`) | Project data + `story` block |
| `src/content.config.ts` | `story` schema on `work`; `piece` on social; drop social `screens` |
| `src/components/story/LaunchStory.astro` (new) | Chapters, stage labels, sources |
| `src/components/story/StoryVisual.astro` (new) | One visual per chapter, switch on `kind` |
| `src/styles/story.css` (new) | `st-` styles |
| `src/scripts/story-motion.ts` (new) | Slicer gap + clock progress, scroll-scrubbed |
| `src/pages/work/[slug].astro` | V3 shell; story layout when `story` exists |
| `src/pages/work/index.astro` | V3 shell |
| `src/components/social/SocialShelves.astro` (new) | Shelves grouped by project |
| `src/pages/social/index.astro` | Uses shelves |
| `src/pages/social/[slug].astro`, `src/components/social/SocialFeed.astro` | Deleted |
| `src/components/social/SocialPost.astro` | Drop "How I made it" link; show `piece` |
| `src/config/social.ts` | Drop `CATEGORIES`, `hasMakingOf`; add `KIND_LABELS`, `groupShelves` |
| `src/scripts/social.ts` | Drop `initFilters` |
| `src/config/lifecycle.ts`, `astro.config.mjs` | New slug, redirect, sitemap filter |
| `tests/build/work-story.test.ts` (new), `tests/build/social-build.test.ts`, `tests/build/v3-build.test.ts` | Build tests |

---

### Task 1: Story assets

**Files:** Create `scripts/assets/gtd-assets.py`; generated `src/assets/projects/gtd-artboard.webp`, `gtd-draft-1.webp`, `gtd-draft-2.webp`, `gtd-draft-3.webp`, `gtd-ws-photoshop.webp`, `gtd-ws-aftereffects.webp`.

**Interfaces:** Produces the six WebP files, referenced by Task 4's frontmatter.

- [ ] **Step 1: Write the converter**

```python
# scripts/assets/gtd-assets.py
"""One-off: the 2026 Ford Mustang GTD story assets, PNG to WebP.
Sources are his project folder and two workspace captures (title bar cropped).
Re-run only if the originals change."""
import sys
from pathlib import Path
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
SRC = Path(r"C:\Users\jmerb\OneDrive\Desktop\Devsign8\01-Current\!Social Media Creatives\Canva Portfolio\Projects\Ford GTD")
CAPTURES = Path(sys.argv[1])  # folder holding ws-photoshop.png and ws-aftereffects-cropped.png
OUT = Path("src/assets/projects")

JOBS = [
    (SRC / "Ford Mustang GTD 2026.png", "gtd-artboard.webp", 4320),
    (SRC / "Ford Mustang GTD" / "1.png", "gtd-draft-1.webp", 2160),
    (SRC / "Ford Mustang GTD" / "2.png", "gtd-draft-2.webp", 2160),
    (SRC / "Ford Mustang GTD" / "3.png", "gtd-draft-3.webp", 2160),
    (CAPTURES / "ws-photoshop.png", "gtd-ws-photoshop.webp", 2000),
    (CAPTURES / "ws-aftereffects-cropped.png", "gtd-ws-aftereffects.webp", 2000),
]

for src, name, width in JOBS:
    im = Image.open(src).convert("RGB")
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(OUT / name, "WEBP", quality=86, method=6)
    print(f"{name}: {im.size}, {(OUT / name).stat().st_size // 1024} KB")
```

- [ ] **Step 2: Run** `python scripts/assets/gtd-assets.py "<scratchpad dir>"`. Expected: six lines; `gtd-artboard.webp: (4320, 1350)`; each under about 1.5 MB.
- [ ] **Step 3: Look** at `gtd-artboard.webp` and `gtd-ws-aftereffects.webp` (Read tool): four-panel strip; no Windows path visible.
- [ ] **Step 4: Commit** `git add scripts/assets/gtd-assets.py src/assets/projects/gtd-*.webp && git commit -m "Add the 2026 Ford Mustang GTD story assets"`

---

### Task 2: Rename the project, redirect the old URL, clean the copy

**Files:** Rename `src/content/work/mustang-gtd.md` to `src/content/work/2026-ford-mustang-gtd.md`. Modify `src/config/lifecycle.ts`, `astro.config.mjs`, `src/content.config.ts` (add `piece`), both Mustang social posts, `tests/build/v3-build.test.ts:190`. Create `tests/build/work-story.test.ts`.

**Interfaces:** Produces work id `2026-ford-mustang-gtd`, route `/work/2026-ford-mustang-gtd/`, social field `piece?: string`.

- [ ] **Step 1: Failing tests**

```ts
// tests/build/work-story.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const SLUG = '2026-ford-mustang-gtd';
const PAGE = `dist/work/${SLUG}/index.html`;
const read = (p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const html = read(PAGE);

test('the project page is built at its new address, under its full name', () => {
  assert.ok(existsSync(PAGE), `${PAGE} missing`);
  assert.match(html, /<h1[^>]*>[\s\S]*2026 Ford Mustang GTD[\s\S]*<\/h1>/);
});

test('the old address redirects to the new one', () => {
  assert.match(read('dist/work/mustang-gtd/index.html'), new RegExp(`url=/MyPortfolio/work/${SLUG}/"`));
});

test('no em dashes in the project content files', () => {
  for (const f of [
    `src/content/work/${SLUG}.md`,
    'src/content/social/mustang-gtd-carousel/index.md',
    'src/content/social/mustang-gtd-reel/index.md',
  ]) {
    assert.doesNotMatch(read(f), /\u2014/, f);
  }
});
```

In `tests/build/v3-build.test.ts` line 190 replace `'mustang-gtd'` with `'2026-ford-mustang-gtd'`.

- [ ] **Step 2: Run** `npm run test:build`. Expected: FAIL (three new tests, homepage slug test).

- [ ] **Step 3: Rename and edit the work entry**

`git mv src/content/work/mustang-gtd.md src/content/work/2026-ford-mustang-gtd.md`, then set in its frontmatter (other fields unchanged):

```yaml
title: "2026 Ford Mustang GTD"
shortTitle: "2026 Ford Mustang GTD"
summary: "A two-post Instagram launch: a smoke Reel Reveal, then a Seamless Carousel."
intro: "A self-initiated launch campaign for the 2026 Ford Mustang GTD: a smoke Reel Reveal as the teaser, then a Seamless Carousel one hour later as the payoff."
role: "Concept, design and launch"
client: "Self-initiated concept. Not affiliated with or endorsed by Ford Motor Company."
tools:
  - "Photoshop"
  - "After Effects"
```

Replace every remaining U+2014 in the file with a colon or period. Delete the `<!-- CASE STUDY INCOMPLETE ... -->` body comment.

- [ ] **Step 4: New id everywhere**

`src/config/lifecycle.ts`: `work: ['2026-ford-mustang-gtd'],`

`astro.config.mjs`:

```js
  redirects: {
    '/v3': `${BASE_PATH}/`,
    /* Renamed 2026-09-25 to the project's full name. */
    '/work/mustang-gtd': `${BASE_PATH}/work/2026-ford-mustang-gtd/`,
  },
```

```js
      filter: (page) =>
        !page.includes('/404') && !page.includes('/v3') && !page.includes('/work/mustang-gtd/'),
```

`src/content.config.ts`, social `base` object, after `title`:

```ts
      /* The piece's name inside its project, e.g. "Reel Reveal". Shown under
         the frame on /social and the project page. */
      piece: z.string().optional(),
```

- [ ] **Step 5: The two social posts**

`mustang-gtd-reel/index.md` frontmatter (keep its `video:` block, with the U+2014 in `alt` replaced):

```yaml
type: instagram-reel
title: "2026 Ford Mustang GTD Reel Reveal"
piece: "Reel Reveal"
caption: "Coming Soon! #StreetLegalButJustBarely"
audio: "Original audio"
work: 2026-ford-mustang-gtd
order: 10
tools: ["Photoshop", "After Effects"]
```

`mustang-gtd-carousel/index.md` frontmatter (keep `slides:`, U+2014 in every `alt` replaced with a colon):

```yaml
type: instagram-post
title: "2026 Ford Mustang GTD Seamless Carousel"
piece: "Seamless Carousel"
ratio: "4x5"
caption: "Ford 2026 Mustang GTD\n#Ford #2026 #Mustang #GTD #StreetLegalButJustBarely"
work: 2026-ford-mustang-gtd
order: 20
tools: ["Photoshop"]
```

Delete both files' Markdown bodies (old drafts; the story replaces them).

- [ ] **Step 6: Run** `npx astro check && npm test && npm run test:build`. Expected: PASS.
- [ ] **Step 7: Commit** `git add -A src astro.config.mjs tests && git commit -m "Rename the Mustang project to 2026 Ford Mustang GTD and redirect the old URL"`

---

### Task 3: Work pages on the v3 shell

**Files:** Modify `src/pages/work/index.astro`, `src/pages/work/[slug].astro`; test `tests/build/work-story.test.ts`.

- [ ] **Step 1: Failing test** (append)

```ts
test('Work pages use the v3 shell', () => {
  for (const p of ['dist/work/index.html', `dist/work/${SLUG}/index.html`, 'dist/work/digiskills/index.html']) {
    const h = read(p);
    assert.match(h, /<html[^>]*class="v3"/, p);
    assert.match(h, /data-v3-header/, p);
    assert.match(h, /class="v3-crumbs"/, p);
  }
});
```

- [ ] **Step 2: Run** `npm run test:build`. Expected: FAIL.
- [ ] **Step 3: Swap the shell.** In both pages replace the `BaseLayout`, `SiteHeader`, `SiteFooter` imports with:

```astro
import V3Layout from '../../layouts/V3Layout.astro';
import Breadcrumbs from '../../components/v3/Breadcrumbs.astro';
```

`index.astro`: `<V3Layout title="Work" description={description} path="/work/" schema={schema}>` (no slot components); replace the `<nav class="crumbs">` block with `<Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Work' }]} />`; close `</V3Layout>`; delete the `.crumbs` rules; set `.work-page { padding-block: var(--space-m) var(--space-section); }` (the v3 header is sticky, not fixed).

`[slug].astro`: `<V3Layout title={d.title} description={d.summary} path={`/work/${entry.id}/`} schema={schema}>`; breadcrumbs `[{ label: 'Home', path: '/' }, { label: 'Work', path: '/work/' }, { label: d.shortTitle ?? d.title }]`; delete the `.crumbs` rules.

- [ ] **Step 4: Run** `npm test && npm run test:build`. Expected: PASS.
- [ ] **Step 5: Commit** `git commit -am "Move the Work pages onto the v3 shell"`

---

### Task 4: The story schema and the Mustang's story

**Files:** Modify `src/content.config.ts`, `src/content/work/2026-ford-mustang-gtd.md`.

**Interfaces (produced, via `CollectionEntry<'work'>['data']['story']`):**
- `lede: string`, `launched: Date`, `channel: string`, `disclaimer: string`
- `chapters: { stage: 'discover'|'plan'|'brand'|'build'|'be-found'|'show-up'|'measure'; heading: string; body: string[]; visual: StoryVisual }[]`
- `StoryVisual` kinds: `image {src, alt, note?}`, `gallery {items[{src, alt, note?}]}`, `chart {groups[{metric, unit, bars[{label, value, note?}]}], source}`, `plan {steps[2]{time, label, src, alt}, gap}`, `slicer {artboard, panels, alt, drafts[{src, alt}]}`, `captions {items[{label, time, text}]}`, `clock {day, from, to, events[{time, label}]}`, `results {}`
- `results?: { source; pieces[{name, reach: number, stats[{label, value: string}]}]; insight; next: string[] }`
- `sources: {label, url}[]`

- [ ] **Step 1: Schema.** In the `work` collection's `schema: ({ image }) => ...`, change the arrow body to a block that defines these before returning the object:

```ts
    const STAGE_IDS = ['discover', 'plan', 'brand', 'build', 'be-found', 'show-up', 'measure'] as const;
    const pic = z.object({ src: image(), alt: z.string(), note: z.string().optional() });
    const storyVisual = z.discriminatedUnion('kind', [
      pic.extend({ kind: z.literal('image') }),
      z.object({ kind: z.literal('gallery'), items: z.array(pic).min(1) }),
      z.object({
        kind: z.literal('chart'),
        groups: z.array(z.object({
          metric: z.string(),
          unit: z.string(),
          bars: z.array(z.object({ label: z.string(), value: z.number(), note: z.string().optional() })).min(2),
        })).min(1),
        source: z.string(),
      }),
      z.object({
        kind: z.literal('plan'),
        steps: z.array(z.object({ time: z.string(), label: z.string(), src: image(), alt: z.string() })).length(2),
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
    ]);
```

and add to the object after `externalUrl`:

```ts
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
          chapters: z
            .array(z.object({
              stage: z.enum(STAGE_IDS),
              heading: z.string(),
              body: z.array(z.string()).min(1),
              visual: storyVisual,
            }))
            .min(1),
          results: z
            .object({
              source: z.string(),
              pieces: z.array(z.object({
                name: z.string(),
                reach: z.number().int().nonnegative(),
                stats: z.array(z.object({ label: z.string(), value: z.string() })),
              })).min(1),
              insight: z.string(),
              next: z.array(z.string()).default([]),
            })
            .optional(),
          sources: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
        })
        .optional(),
```

In the social schema, delete the `screens` field (nothing uses it after Task 7).

- [ ] **Step 2: Verify the numbers.** WebFetch `https://buffer.com/resources/state-of-social-media-engagement-2026/` and confirm: carousel engagement rate by reach 6.90%, Reels 3.31%, Reels reach rate 30.81%, "1.36 times higher than carousels". If a figure differs, use the page's and recompute the carousel reach bar (Reels reach rate divided by the multiple).

- [ ] **Step 3: The story block** in `2026-ford-mustang-gtd.md` frontmatter:

```yaml
story:
  lede: "A two-post Instagram launch: a smoke Reel Reveal, then a Seamless Carousel one hour later."
  launched: 2026-08-25
  channel: "Instagram"
  disclaimer: "Self-initiated concept. Not affiliated with or endorsed by Ford Motor Company."
  chapters:
    - stage: discover
      heading: "It started at Multimatic"
      body:
        - "I worked at Multimatic, where the 2026 Ford Mustang GTD is built. When a car you helped build is about to hit the street, you want its reveal to feel as fast as the car."
        - "Before designing anything I looked at what each Instagram format is actually good at. Carousels earn the most engagement from the people who see them. Reels reach the most people. Instagram ranks posts on watch time, sends and likes."
        - "So the plan was not one post but two: a Reel to reach people, a carousel to hold them."
      visual:
        kind: chart
        source: "Buffer, State of Social Media Engagement 2026 (52M+ posts)"
        groups:
          - metric: "Engagement per person reached"
            unit: "%"
            bars:
              - { label: "Carousels", value: 6.90 }
              - { label: "Reels", value: 3.31 }
          - metric: "Reach rate"
            unit: "%"
            bars:
              - { label: "Reels", value: 30.81 }
              - { label: "Carousels", value: 22.65, note: "Reels reach about 1.36x more" }
    - stage: plan
      heading: "Teaser first, reveal an hour later"
      body:
        - "The Reel Reveal goes out first and only says Coming Soon. Its job is curiosity."
        - "One hour later the Seamless Carousel pays it off with the full car and the numbers."
        - "One hashtag, #StreetLegalButJustBarely, ties the two posts into one campaign."
      visual:
        kind: plan
        gap: "+1 hour"
        steps:
          - { time: "8:00 AM", label: "Reel Reveal", src: "../../assets/projects/social-mustang-gtd-reel-poster.webp", alt: "The Reel Reveal cover: a pale car silhouette in white smoke." }
          - { time: "9:00 AM", label: "Seamless Carousel", src: "../../assets/projects/social-mustang-gtd-1.webp", alt: "The carousel's first panel: the Ford oval above Street Legal, But Just Barely." }
    - stage: build
      heading: "The Reel Reveal: a silhouette and smoke"
      body:
        - "I built the car's silhouette and the Ford logo in Photoshop, then brought them into After Effects and let smoke carry the reveal."
        - "Ten seconds, no sound needed: the car sharpens out of the haze, the frame flips to black, and it dissolves back into smoke."
      visual:
        kind: gallery
        items:
          - { src: "../../assets/projects/gtd-ws-photoshop.webp", alt: "Photoshop with the Reel file open: the car's dark silhouette on a 1080 by 1920 canvas, with the layer stack on the right.", note: "Photoshop: the silhouette, built from layered smart objects." }
          - { src: "../../assets/projects/gtd-ws-aftereffects.webp", alt: "After Effects with the Reel composition open: smoke footage over the car, and a timeline of four layers across ten seconds.", note: "After Effects: smoke over the silhouette, timed across ten seconds." }
    - stage: build
      heading: "The Seamless Carousel: one artboard, four swipes"
      body:
        - "The carousel started as one continuous 4320 by 1350 artboard in Photoshop, then was sliced into four 1080 by 1350 panels."
        - "Because it is one image, the smoke and the horizon carry across every swipe. The numbers arrive one per panel: the lap time, the top speed, then 815 horsepower."
        - "A plain carousel asks for a swipe. A seamless one makes stopping feel unfinished. It took three versions to get there."
      visual:
        kind: slicer
        panels: 4
        artboard: "../../assets/projects/gtd-artboard.webp"
        alt: "The full carousel artboard: the Ford oval and Street Legal, But Just Barely; the car head-on with its lap time and top speed; its nose with 815 HP; and the running horse alone in the smoke. Four panels cut from one image."
        drafts:
          - { src: "../../assets/projects/gtd-draft-1.webp", alt: "First version of the artboard." }
          - { src: "../../assets/projects/gtd-draft-2.webp", alt: "Second version, with body copy and legal lines." }
          - { src: "../../assets/projects/gtd-draft-3.webp", alt: "Third version, with a silhouette panel." }
    - stage: be-found
      heading: "Two captions, two jobs"
      body:
        - "The teaser caption is two words and one tag. It creates suspense and starts the campaign hashtag."
        - "The reveal caption names the car and adds brand and model tags, so people searching for the car can find it."
      visual:
        kind: captions
        items:
          - { label: "Reel Reveal", time: "8:00 AM", text: "Coming Soon! #StreetLegalButJustBarely" }
          - { label: "Seamless Carousel", time: "9:00 AM", text: "Ford 2026 Mustang GTD\n#Ford #2026 #Mustang #GTD #StreetLegalButJustBarely" }
    - stage: show-up
      heading: "Tuesday, 8:00 and 9:00 AM"
      body:
        - "I posted on Tuesday, 25 August 2026. Tuesday is one of the strongest days in both of the large 2026 posting studies, behind Wednesday."
        - "The hour between the posts gives the teaser time to travel before the payoff lands."
        - "One honest note: those studies find Tuesday afternoons stronger than mornings, which is my next test."
      visual:
        kind: clock
        day: "Tuesday, 25 August 2026 (Toronto)"
        from: "8:00 AM"
        to: "9:00 AM"
        events:
          - { time: "8:00 AM", label: "Reel Reveal goes live" }
          - { time: "9:00 AM", label: "Seamless Carousel goes live" }
    - stage: measure
      heading: "Results and what I learned"
      body:
        - "The account was two months old, so these are small numbers. What matters is what they say."
      visual:
        kind: results
  results:
    source: "Instagram Insights via Buffer, as of 25 September 2026"
    pieces:
      - name: "Reel Reveal"
        reach: 104
        stats:
          - { label: "Views", value: "128" }
          - { label: "Likes", value: "7" }
          - { label: "Saves", value: "1" }
          - { label: "Average watch", value: "5.0 s of 10 s" }
      - name: "Seamless Carousel"
        reach: 4
        stats:
          - { label: "Views", value: "25" }
          - { label: "Likes", value: "5" }
    insight: "The Reel did the reaching: 26 times the carousel's reach. The carousel reached almost no one new but got a like from nearly everyone who saw it. That is the reach and depth split the research predicted."
    next:
      - "Post the reveal on a Tuesday afternoon."
      - "Share the carousel to Stories to push its reach."
      - "Give the Reel a clear call to action."
      - "Add \"Unofficial concept. Not affiliated with Ford.\" to both captions."
  sources:
    - { label: "Buffer: State of Social Media Engagement 2026", url: "https://buffer.com/resources/state-of-social-media-engagement-2026/" }
    - { label: "Socialinsider: 2026 Instagram benchmarks", url: "https://www.socialinsider.io/social-media-benchmarks/instagram" }
    - { label: "Dataslayer: the ranking signals Adam Mosseri confirmed", url: "https://www.dataslayer.ai/blog/instagram-algorithm-2025-complete-guide-for-marketers" }
    - { label: "Buffer: Best time to post on Instagram (September 2026)", url: "https://buffer.com/resources/when-is-the-best-time-to-post-on-instagram/" }
    - { label: "Sprout Social: Best times to post on Instagram 2026", url: "https://sproutsocial.com/insights/best-times-to-post-on-instagram/" }
```

- [ ] **Step 4: Run** `npx astro check && npm run test:build`. Expected: 0 errors, PASS.
- [ ] **Step 5: Commit** `git commit -am "Add the launch-story schema and the 2026 Ford Mustang GTD story"`

---

### Task 5: The story layout

**Files:** Create `src/components/story/LaunchStory.astro`, `src/components/story/StoryVisual.astro`, `src/styles/story.css`, `src/scripts/story-motion.ts` (stub). Modify `src/pages/work/[slug].astro`. Test `tests/build/work-story.test.ts`.

**Interfaces:** Consumes Task 4 types; `STAGES` (`{ id, n, label }`) from `src/config/lifecycle.ts`; `captionParts`, `SOCIAL_ACCOUNTS` from `src/config/social.ts`; `sortPosts` from the same; `withMediaUrls` from `src/lib/social-media.ts`. Produces `<LaunchStory story={...} />` and hooks `data-st-chapter`, `data-st-slicer`, `data-st-clock`.

**Before writing the chart, load the `dataviz` skill** and follow its bar rules.

- [ ] **Step 1: Failing tests** (append)

```ts
test('the story renders seven chapter blocks across six homepage stages', () => {
  assert.equal((html.match(/data-st-chapter/g) ?? []).length, 7);
  const stages = new Set(
    [...html.matchAll(/class="st-ch__stage"[^>]*>([\s\S]*?)<\/p>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').trim()),
  );
  assert.equal(stages.size, 6, [...stages].join(' | '));
});

test('the disclaimer and the results source are on the page', () => {
  assert.ok(html.includes('Self-initiated concept. Not affiliated with or endorsed by Ford Motor Company.'));
  assert.ok(html.includes('Instagram Insights via Buffer, as of 25 September 2026'));
});

test('the slicer, the clock and the two real posts render', () => {
  assert.match(html, /data-st-slicer/);
  assert.match(html, /data-st-clock/);
  assert.match(html, /Reel Reveal/);
  assert.match(html, /Seamless Carousel/);
  assert.match(html, /data-sp-video/);
});
```

- [ ] **Step 2: Run** `npm run test:build`. Expected: FAIL.

- [ ] **Step 3: `src/components/story/StoryVisual.astro`**

```astro
---
/* StoryVisual: the one visual a launch-story chapter shows beside its text.
   Every kind carries its own text alternative (alt, printed values or a
   list), so a screen reader gets what the picture shows. */
import { Image, getImage } from 'astro:assets';
import type { CollectionEntry } from 'astro:content';
import { SOCIAL_ACCOUNTS, captionParts } from '../../config/social';

type Story = NonNullable<CollectionEntry<'work'>['data']['story']>;
interface Props {
  visual: Story['chapters'][number]['visual'];
  results?: Story['results'];
}
const { visual: v, results } = Astro.props;
const who = SOCIAL_ACCOUNTS.instagram.name;
const artboard = v.kind === 'slicer' ? await getImage({ src: v.artboard, width: 2160, format: 'webp' }) : undefined;
const maxReach = results ? Math.max(...results.pieces.map((p) => p.reach), 1) : 1;
---

{v.kind === 'image' && (
  <figure class="st-v st-v--image">
    <Image src={v.src} alt={v.alt} widths={[640, 1080]} sizes="(min-width: 60rem) 34rem, 92vw" />
    {v.note && <figcaption>{v.note}</figcaption>}
  </figure>
)}

{v.kind === 'gallery' && (
  <div class="st-v st-v--gallery">
    {v.items.map((it) => (
      <figure>
        <Image src={it.src} alt={it.alt} widths={[800, 1400]} sizes="(min-width: 60rem) 34rem, 92vw" loading="lazy" />
        {it.note && <figcaption>{it.note}</figcaption>}
      </figure>
    ))}
  </div>
)}

{v.kind === 'chart' && (
  <figure class="st-v st-chart">
    {v.groups.map((g) => {
      const max = Math.max(...g.bars.map((b) => b.value));
      return (
        <div class="st-chart__group">
          <p class="st-chart__metric">{g.metric}</p>
          <ul role="list">
            {g.bars.map((b) => (
              <li class="st-chart__row">
                <span class="st-chart__label">{b.label}</span>
                <span class="st-chart__track" aria-hidden="true"><span class="st-chart__bar" style={`--w:${(b.value / max) * 100}%`} /></span>
                <span class="st-chart__value">{b.value.toFixed(2)}{g.unit}</span>
                {b.note && <span class="st-chart__note">{b.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      );
    })}
    <figcaption>{v.source}</figcaption>
  </figure>
)}

{v.kind === 'plan' && (
  <figure class="st-v st-plan">
    <ol role="list">
      <li class="st-plan__step">
        <Image src={v.steps[0].src} alt={v.steps[0].alt} widths={[480]} sizes="12rem" />
        <p><strong>{v.steps[0].time}</strong> {v.steps[0].label}</p>
      </li>
      <li class="st-plan__gap" aria-hidden="true">{v.gap}</li>
      <li class="st-plan__step">
        <Image src={v.steps[1].src} alt={v.steps[1].alt} widths={[480]} sizes="12rem" />
        <p><strong>{v.steps[1].time}</strong> {v.steps[1].label}</p>
      </li>
    </ol>
  </figure>
)}

{v.kind === 'slicer' && artboard && (
  <figure class="st-v st-slicer" data-st-slicer style={`--panels:${v.panels}`}>
    <div class="st-slicer__board">
      {Array.from({ length: v.panels }, (_, i) => (
        <img
          src={artboard.src}
          alt={i === 0 ? v.alt : ''}
          aria-hidden={i === 0 ? undefined : 'true'}
          style={`object-position:${(i / (v.panels - 1)) * 100}% 50%`}
          loading="lazy"
          decoding="async"
        />
      ))}
    </div>
    <figcaption>One artboard, sliced into {v.panels} panels.</figcaption>
    {v.drafts.length > 0 && (
      <div class="st-slicer__drafts">
        <p>Earlier versions</p>
        <ul role="list">
          {v.drafts.map((d) => (
            <li><Image src={d.src} alt={d.alt} widths={[480]} sizes="10rem" loading="lazy" /></li>
          ))}
        </ul>
      </div>
    )}
  </figure>
)}

{v.kind === 'captions' && (
  <div class="st-v st-captions">
    {v.items.map((c) => (
      <figure class="st-cap">
        <p class="st-cap__head"><span class="st-cap__avatar" aria-hidden="true" /> <strong>{who}</strong> <span>{c.time} · {c.label}</span></p>
        <p class="st-cap__text">
          {captionParts(c.text).map((p) => (p.tag ? <span class="st-cap__tag">{p.text}</span> : p.text))}
        </p>
      </figure>
    ))}
  </div>
)}

{v.kind === 'clock' && (
  <figure class="st-v st-clock" data-st-clock>
    <p class="st-clock__day">{v.day}</p>
    <div class="st-clock__track" aria-hidden="true"><span class="st-clock__fill" /></div>
    <ol role="list" class="st-clock__events">
      {v.events.map((e) => (
        <li><strong>{e.time}</strong> {e.label}</li>
      ))}
    </ol>
  </figure>
)}

{v.kind === 'results' && results && (
  <figure class="st-v st-results">
    <ul role="list">
      {results.pieces.map((p) => (
        <li class="st-results__piece">
          <p class="st-results__name">{p.name}</p>
          <p class="st-results__reach"><strong>{p.reach}</strong> reached</p>
          <span class="st-results__track" aria-hidden="true"><span class="st-results__bar" style={`--w:${(p.reach / maxReach) * 100}%`} /></span>
          <dl>
            {p.stats.map((s) => (
              <div><dt>{s.label}</dt><dd>{s.value}</dd></div>
            ))}
          </dl>
        </li>
      ))}
    </ul>
    <figcaption>{results.source}</figcaption>
  </figure>
)}
```

(The slicer's object-position trick needs `object-fit: cover` on a tile whose aspect matches one panel; with 4 panels the tile shows exactly one quarter. Verify visually in Task 8 and switch to a clipping wrapper if the crop is off.)

- [ ] **Step 4: `src/components/story/LaunchStory.astro`**

```astro
---
/* LaunchStory: a project told as chapters, numbered with the homepage's
   lifecycle stages so the process the homepage promises shows on real work.
   Wide screens: text left, the chapter's visual sticky on the right (plain
   CSS). Phones: the visual sits above its text. */
import type { CollectionEntry } from 'astro:content';
import { STAGES } from '../../config/lifecycle';
import StoryVisual from './StoryVisual.astro';
import '../../styles/story.css';

type Story = NonNullable<CollectionEntry<'work'>['data']['story']>;
interface Props {
  story: Story;
}
const { story } = Astro.props;
const stage = (id: string) => STAGES.find((s) => s.id === id)!;
---

<div class="st-story">
  {story.chapters.map((c, i) => {
    const s = stage(c.stage);
    return (
      <section class="st-ch" aria-labelledby={`st-h-${i}`} data-st-chapter>
        <div class="st-ch__visual">
          <StoryVisual visual={c.visual} results={story.results} />
        </div>
        <div class="st-ch__text">
          <p class="st-ch__stage"><span>{s.n}</span> {s.label}</p>
          <h2 id={`st-h-${i}`} class="st-ch__h" data-split>{c.heading}</h2>
          {c.body.map((p) => <p>{p}</p>)}
          {c.visual.kind === 'results' && story.results && (
            <>
              <p class="st-ch__insight">{story.results.insight}</p>
              {story.results.next.length > 0 && (
                <>
                  <h3 class="st-ch__h3">What I'd test next</h3>
                  <ul class="st-ch__next">{story.results.next.map((n) => <li>{n}</li>)}</ul>
                </>
              )}
            </>
          )}
        </div>
      </section>
    );
  })}

  {story.sources.length > 0 && (
    <aside class="st-sources" aria-labelledby="st-sources-h">
      <h2 id="st-sources-h" class="st-ch__h3">Sources</h2>
      <ol>
        {story.sources.map((s) => (
          <li><a href={s.url} rel="noopener" target="_blank">{s.label}<span class="visually-hidden"> (opens in a new tab)</span></a></li>
        ))}
      </ol>
    </aside>
  )}
</div>

<script>
  import '../../scripts/story-motion';
</script>
```

Create `src/scripts/story-motion.ts` containing `export {};` (Task 6 fills it).

- [ ] **Step 5: `src/styles/story.css`**

```css
/* story.css: the launch-story layout (LaunchStory, StoryVisual). Global with
   an st- prefix because the visuals are child components. */
.st-story { display: grid; gap: var(--space-2xl); }

.st-ch { display: grid; gap: var(--space-l); }
.st-ch__stage { margin: 0 0 var(--space-2xs); font-size: 0.875rem; font-weight: 500; color: var(--accent); }
.st-ch__stage span { font-variant-numeric: tabular-nums; margin-inline-end: 0.35em; }
.st-ch__h { margin: 0 0 var(--space-s); font-size: clamp(1.75rem, 1rem + 2.4vw, 3rem); font-weight: 600; letter-spacing: -0.03em; line-height: 1.08; }
.st-ch__h3 { margin: var(--space-l) 0 var(--space-2xs); font-size: var(--step-0); font-weight: 600; }
.st-ch__text > p { margin: 0 0 var(--space-s); max-inline-size: 40ch; font-size: var(--step-1); line-height: 1.55; color: var(--text-dim); }
.st-ch__text > p.st-ch__insight { color: var(--text); }
.st-ch__next { margin: 0; padding-inline-start: 1.2rem; color: var(--text-dim); }
.st-ch__next li + li { margin-block-start: 0.35rem; }

@media (min-width: 60rem) {
  .st-ch {
    grid-template-columns: minmax(0, 1fr) minmax(0, 34rem);
    grid-template-areas: 'text visual';
    align-items: start;
    gap: var(--space-2xl);
    min-block-size: 100svh;
  }
  .st-ch__text { grid-area: text; padding-block: 20svh; }
  .st-ch__visual {
    grid-area: visual;
    position: sticky;
    inset-block-start: calc(var(--header-height, 4.5rem) + var(--space-l));
  }
}

.st-v { margin: 0; }
.st-v figcaption, .st-cap__head span { font-size: 0.8125rem; color: var(--text-dim); }
.st-v img { display: block; inline-size: 100%; block-size: auto; border-radius: 10px; }
.st-v--gallery { display: grid; gap: var(--space-s); }
.st-v--gallery img { border: 1px solid var(--border); }
.st-v--gallery figcaption { margin-block-start: 0.35rem; }

/* Chart: zero-based horizontal bars, values printed beside them. */
.st-chart { display: grid; gap: var(--space-l); }
.st-chart__metric { margin: 0 0 var(--space-2xs); font-weight: 600; }
.st-chart ul { margin: 0; padding: 0; display: grid; gap: 0.6rem; }
.st-chart__row { display: grid; grid-template-columns: 6.5rem 1fr 4.5rem; align-items: center; gap: 0.6rem; }
.st-chart__track { block-size: 0.75rem; border-radius: 999px; background: var(--border); overflow: hidden; }
.st-chart__bar { display: block; block-size: 100%; inline-size: var(--w); background: var(--accent); border-radius: inherit; }
.st-chart__value { font-variant-numeric: tabular-nums; font-weight: 600; text-align: end; }
.st-chart__note { grid-column: 2 / -1; font-size: 0.8125rem; color: var(--text-dim); }

/* Plan: two phones and the hour between them. */
.st-plan ol { margin: 0; padding: 0; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: var(--space-s); list-style: none; }
.st-plan__step img { aspect-ratio: 9 / 16; object-fit: cover; border-radius: 16px; border: 1px solid var(--border-strong); }
.st-plan__step p { margin: 0.5rem 0 0; font-size: 0.875rem; }
.st-plan__gap { font-weight: 600; color: var(--accent); white-space: nowrap; }

/* Slicer: N copies of one artboard, each showing its slice; --gap opens the
   cuts. Resting state (no JS, reduced motion) is open. */
.st-slicer { --gap: 10px; }
.st-slicer__board { display: grid; grid-template-columns: repeat(var(--panels), 1fr); gap: var(--gap); }
.st-slicer__board img { aspect-ratio: 1080 / 1350; object-fit: cover; border-radius: 4px; }
.st-slicer figcaption { margin-block-start: 0.5rem; }
.st-slicer__drafts { margin-block-start: var(--space-m); }
.st-slicer__drafts p { margin: 0 0 0.4rem; font-size: 0.8125rem; color: var(--text-dim); }
.st-slicer__drafts ul { margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; list-style: none; }
.st-slicer__drafts img { border: 1px solid var(--border); border-radius: 4px; }

/* Captions: Instagram-style blocks under his display name. */
.st-captions { display: grid; gap: var(--space-s); }
.st-cap { margin: 0; padding: var(--space-s); border: 1px solid var(--border); border-radius: 12px; background: var(--bg); }
.st-cap__head { display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin: 0 0 0.5rem; }
.st-cap__avatar { inline-size: 28px; block-size: 28px; border-radius: 50%; background: #dbdbdb; }
.st-cap__text { margin: 0; white-space: pre-line; }
.st-cap__tag { color: var(--accent); }

/* Clock: a track that fills from the first event to the last. */
.st-clock { --p: 1; display: grid; gap: var(--space-s); }
.st-clock__day { margin: 0; font-weight: 600; }
.st-clock__track { block-size: 6px; border-radius: 999px; background: var(--border); overflow: hidden; }
.st-clock__fill { display: block; block-size: 100%; inline-size: calc(var(--p) * 100%); background: var(--accent); }
.st-clock__events { margin: 0; padding: 0; display: flex; justify-content: space-between; gap: var(--space-s); list-style: none; }

/* Results: reach bars on one scale, the rest as small stats. */
.st-results ul { margin: 0; padding: 0; display: grid; gap: var(--space-l); list-style: none; }
.st-results__name { margin: 0; font-weight: 600; }
.st-results__reach { margin: 0.2rem 0 0.4rem; }
.st-results__reach strong { font-size: 2rem; font-variant-numeric: tabular-nums; }
.st-results__track { display: block; block-size: 0.75rem; border-radius: 999px; background: var(--border); overflow: hidden; }
.st-results__bar { display: block; block-size: 100%; inline-size: max(var(--w), 3px); background: var(--accent); }
.st-results dl { display: flex; flex-wrap: wrap; gap: var(--space-s); margin: 0.6rem 0 0; }
.st-results dt { font-size: 0.75rem; color: var(--text-dim); }
.st-results dd { margin: 0; font-weight: 600; }
.st-results figcaption { margin-block-start: var(--space-s); }

.st-sources { font-size: 0.875rem; color: var(--text-dim); }
.st-sources ol { padding-inline-start: 1.2rem; }
.st-sources a { color: inherit; }
```

- [ ] **Step 6: Render it from `[slug].astro`.** Add imports:

```astro
import LaunchStory from '../../components/story/LaunchStory.astro';
import SocialPost from '../../components/social/SocialPost.astro';
import { withMediaUrls } from '../../lib/social-media';
import { sortPosts } from '../../config/social';
import '../../styles/social.css';
```

After `const d = entry.data;`:

```ts
const story = d.story;
const posts = story
  ? sortPosts(await getCollection('social', (p) => !p.data.draft && p.data.work?.id === entry.id)).map(withMediaUrls)
  : [];
const launched = story?.launched.toLocaleDateString('en-CA', {
  weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
});
```

In the classic header keep breadcrumbs, category and h1 for both modes; guard `intro` and `meta` with `!story &&`. Wrap cover, case study, video, gallery and `<Content />` in `{!story && (<>...</>)}`. After the classic header add:

```astro
{story && (
  <>
    <div class="project__story-head container">
      <p class="project__intro prose">{story.lede}</p>
      <dl class="project__meta">
        <div><dt>Role</dt><dd>{d.role}</dd></div>
        <div><dt>Tools</dt><dd>{d.tools.join(', ')}</dd></div>
        <div><dt>Channel</dt><dd>{story.channel}</dd></div>
        <div><dt>Launched</dt><dd>{launched}</dd></div>
      </dl>
      <p class="project__disclaimer">{story.disclaimer}</p>
    </div>
    <div class="container"><LaunchStory story={story} /></div>
    {posts.length > 0 && (
      <section class="project__posts container" aria-labelledby="posts-heading" data-sp-feed>
        <h2 id="posts-heading" class="project__sub">The posts</h2>
        <ul role="list" class="project__posts-list">
          {posts.map((p) => <li><SocialPost entry={p} /></li>)}
        </ul>
      </section>
    )}
  </>
)}
```

Add:

```astro
<script>
  import { initSocial } from '../../scripts/social';
  initSocial();
</script>
```

and styles:

```css
  .project__disclaimer { margin: var(--space-s) 0 0; font-size: 0.875rem; color: var(--text-dim); }
  .project__posts-list { display: flex; flex-wrap: wrap; gap: var(--space-xl); margin: 0; padding: 0; list-style: none; }
  .project__posts-list > li { inline-size: min(100%, 24rem); }
```

- [ ] **Step 7: Run** `npx astro check && npm test && npm run test:build`. Expected: PASS.
- [ ] **Step 8: Commit** `git add -A src tests && git commit -m "Render the 2026 Ford Mustang GTD launch story"`

---

### Task 6: Story motion

**Files:** Modify `src/scripts/story-motion.ts`. Consumes `[data-st-slicer]` (`--gap`, resting 10px) and `[data-st-clock]` (`--p`, resting 1).

- [ ] **Step 1: Implement**

```ts
/* story-motion.ts: the launch story's two scroll-scrubbed extras. The slicer
   opens its cuts (0 to 10px) and the clock track fills (0 to 1) as each
   passes through the viewport. Nothing loops. Under reduced motion nothing
   is built and the CSS resting state (open, full) shows. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motionReduced, onMotionChange } from './motion';

gsap.registerPlugin(ScrollTrigger);
let ctx: gsap.Context | null = null;

function build(): void {
  if (ctx || motionReduced()) return;
  ctx = gsap.context(() => {
    for (const el of document.querySelectorAll<HTMLElement>('[data-st-slicer]')) {
      gsap.fromTo(el, { '--gap': '0px' }, {
        '--gap': '10px', ease: 'none', autoRound: false,
        scrollTrigger: { trigger: el, start: 'top 75%', end: 'top 35%', scrub: true },
      });
    }
    for (const el of document.querySelectorAll<HTMLElement>('[data-st-clock]')) {
      gsap.fromTo(el, { '--p': 0 }, {
        '--p': 1, ease: 'none', autoRound: false,
        scrollTrigger: { trigger: el, start: 'top 75%', end: 'top 30%', scrub: true },
      });
    }
  });
}

function teardown(): void {
  ctx?.revert();
  ctx = null;
}

build();
onMotionChange((reduced) => {
  if (reduced) teardown();
  else build();
  ScrollTrigger.refresh();
});
```

- [ ] **Step 2: Verify in headless Chrome** (the Browser pane freezes GSAP when hidden): on `/MyPortfolio/work/2026-ford-mustang-gtd/`, `getComputedStyle(slicer).getPropertyValue('--gap')` reads about `0px` before scrolling to it and `10px` after; with reduced motion emulated it reads `10px` on load.
- [ ] **Step 3: Commit** `git commit -am "Scrub the story's slicer and clock with scroll"`

---

### Task 7: /social as project shelves

**Files:** Create `src/components/social/SocialShelves.astro`. Modify `src/pages/social/index.astro`, `src/components/social/SocialPost.astro`, `src/config/social.ts`, `src/scripts/social.ts`, `src/styles/social.css`, `src/content/social/_new-post/index.md`. Delete `src/pages/social/[slug].astro`, `src/components/social/SocialFeed.astro`. Test `tests/build/social-build.test.ts`.

**Interfaces:** Produces `groupShelves(entries: CollectionEntry<'social'>[], projects: CollectionEntry<'work'>[]): Shelf[]` with `Shelf = { key; title; label; idea?; storyPath?; posts }`.

- [ ] **Step 1: Tests.** In `tests/build/social-build.test.ts` delete the "How I made it" test and add:

```ts
test('/social shows project shelves, and the Mustang shelf links to its story', () => {
  const shelves = html.match(/class="sp-shelf"/g) ?? [];
  assert.ok(shelves.length >= 2, `found ${shelves.length} shelves`);
  assert.match(html, /2026 Ford Mustang GTD/);
  assert.match(html, /class="sp-shelf__story" href="\/MyPortfolio\/work\/2026-ford-mustang-gtd\/"/);
});

test('every "Read the story" link resolves', () => {
  const links = [...html.matchAll(/class="sp-shelf__story" href="\/MyPortfolio\/(work\/[^"]+)"/g)].map((m) => m[1]);
  assert.ok(links.length > 0);
  for (const l of links) assert.ok(existsSync(`dist/${l}index.html`), l);
});

test('no filters and no per-post pages remain', () => {
  assert.doesNotMatch(html, /data-sp-filters|sp-card__more/);
  assert.ok(!existsSync('dist/social/mustang-gtd-reel/index.html'));
});
```

- [ ] **Step 2: Run** `npm run test:build`. Expected: FAIL.

- [ ] **Step 3: `src/config/social.ts`.** Delete `CATEGORIES` and `hasMakingOf`; keep `postCategory` (it returns `'reel' | 'post' | 'carousel'`); add:

```ts
export const KIND_LABELS = { reel: 'Reel', post: 'Post', carousel: 'Carousel' } as const;

export interface Shelf {
  key: string;
  title: string;
  label: string;
  idea?: string;
  storyPath?: string;
  posts: CollectionEntry<'social'>[];
}

/** One shelf per project (the posts' `work`), then one per loose post, in
 *  the order of each shelf's first post. Posts keep feed order inside. */
export function groupShelves(
  entries: CollectionEntry<'social'>[],
  projects: CollectionEntry<'work'>[],
): Shelf[] {
  const byId = new Map(projects.map((p) => [p.id, p]));
  const shelves = new Map<string, Shelf>();
  for (const e of sortPosts(entries)) {
    const project = e.data.work ? byId.get(e.data.work.id) : undefined;
    const key = project ? `work:${project.id}` : `post:${e.id}`;
    let shelf = shelves.get(key);
    if (!shelf) {
      shelf = project
        ? {
            key,
            title: project.data.title,
            label: project.data.category,
            idea: project.data.story?.lede ?? project.data.summary,
            storyPath: project.data.story ? `/work/${project.id}/` : undefined,
            posts: [],
          }
        : { key, title: e.data.title, label: KIND_LABELS[postCategory(e.data)], posts: [] };
      shelves.set(key, shelf);
    }
    shelf.posts.push(e);
  }
  return [...shelves.values()];
}
```

`postCategory`'s type param currently references `Category`; define `type Category = keyof typeof KIND_LABELS` above it.

- [ ] **Step 4: `SocialShelves.astro`**

```astro
---
/* SocialShelves: /social as one band per project (his pick, 2026-09-25).
   The pieces stay playable in place; "Read the story" appears when the
   project has a launch story. */
import type { CollectionEntry } from 'astro:content';
import SocialPost from './SocialPost.astro';
import { groupShelves } from '../../config/social';
import { href } from '../../lib/url';
import '../../styles/social.css';

interface Props {
  entries: CollectionEntry<'social'>[];
  projects: CollectionEntry<'work'>[];
}
const { entries, projects } = Astro.props;
const shelves = groupShelves(entries, projects);
---

<div class="sp-shelves" data-sp-feed>
  {shelves.map((s, i) => (
    <section class="sp-shelf" aria-labelledby={`sp-shelf-${i}`}>
      <div class="sp-shelf__info">
        <p class="sp-shelf__label">{String(i + 1).padStart(2, '0')} · {s.label}</p>
        <h2 id={`sp-shelf-${i}`} class="sp-shelf__title">{s.title}</h2>
        {s.idea && <p class="sp-shelf__idea">{s.idea}</p>}
        {s.storyPath && (
          <a class="sp-shelf__story" href={href(s.storyPath)}>
            Read the story<span class="visually-hidden">: {s.title}</span>
            <span aria-hidden="true"> →</span>
          </a>
        )}
      </div>
      <ul class="sp-shelf__pieces" role="list">
        {s.posts.map((p) => <li><SocialPost entry={p} /></li>)}
      </ul>
    </section>
  ))}
</div>

<script>
  import { initSocial } from '../../scripts/social';
  initSocial();
</script>
```

- [ ] **Step 5: The page.** In `src/pages/social/index.astro` replace the `SocialFeed` import and usage with `SocialShelves`, passing `projects={await getCollection('work', ({ data }) => !data.draft)}`; lede: "Social campaigns, one project at a time. Tap any video to play it, and open a story to see how it was made." `git rm src/pages/social/[slug].astro src/components/social/SocialFeed.astro`.

- [ ] **Step 6: `SocialPost.astro`.** Remove the `link` prop, the `hasMakingOf` and `href` imports and the "How I made it" anchor. Replace the meta block with:

```astro
  {(data.piece || data.draft) && (
    <div class="sp-card__meta">
      {data.piece && <p class="sp-card__piece">{data.piece}</p>}
      {data.draft && <p class="sp-card__line"><span class="sp-badge sp-badge--draft">Draft · dev only</span></p>}
    </div>
  )}
```

- [ ] **Step 7: `src/scripts/social.ts`.** Delete `initFilters` and its call in `initSocial`; update the header comment's list of pieces.

- [ ] **Step 8: `src/styles/social.css`.** Delete the `[data-sp-filters]`, `.sp-feed__status`, `.sp-chip*`, `.sp-card__more*` and `.sp-feed__grid` rules; add:

```css
/* -- Shelves: one band per project ---------------------------------------- */
.sp-shelves { display: grid; gap: var(--space-2xl); }
.sp-shelf { display: grid; gap: var(--space-l); padding-block-start: var(--space-l); border-block-start: 1px solid var(--border); }
@media (min-width: 64rem) {
  .sp-shelf { grid-template-columns: minmax(0, 18rem) minmax(0, 1fr); align-items: start; gap: var(--space-xl); }
  .sp-shelf__info { position: sticky; inset-block-start: calc(var(--header-height, 4.5rem) + var(--space-m)); }
}
.sp-shelf__label { margin: 0 0 var(--space-2xs); font-size: 0.875rem; font-weight: 500; color: var(--accent); }
.sp-shelf__title { margin: 0 0 var(--space-2xs); font-size: clamp(1.5rem, 1rem + 1.6vw, 2.25rem); font-weight: 600; letter-spacing: -0.02em; line-height: 1.1; }
.sp-shelf__idea { margin: 0 0 var(--space-s); color: var(--text-dim); }
.sp-shelf__story { display: inline-flex; align-items: center; min-block-size: var(--tap-min); font-weight: 600; color: var(--text); text-decoration: underline; text-decoration-color: var(--border-strong); text-underline-offset: 0.3em; }
.sp-shelf__story:hover { color: var(--accent); text-decoration-color: currentColor; }
.sp-shelf__pieces { display: flex; flex-wrap: wrap; align-items: flex-start; gap: var(--space-l); margin: 0; padding: 0; list-style: none; }
.sp-shelf__pieces > li { inline-size: min(100%, 22rem); }
.sp-card__piece { margin: 0; font-weight: 600; }
```

- [ ] **Step 9: Template.** In `_new-post/index.md` add under `title`:

```yaml
# work: 2026-ford-mustang-gtd   # the project this post belongs to (its /work page)
# piece: "Reel Reveal"          # its name inside the project, shown under the frame
```

and delete the "HOW I MADE IT" block.

- [ ] **Step 10: Run** `npx astro check && npm test && npm run test:build`. Expected: PASS.
- [ ] **Step 11: Commit** `git add -A src tests && git commit -m "Show /social as project shelves and drop the per-post pages"`

---

### Task 8: Verify, record, commit

- [ ] **Step 1:** Delete `.astro/data-store.json`, restart `astro dev`, and in the Browser pane check `/MyPortfolio/social/` and `/MyPortfolio/work/2026-ford-mustang-gtd/` at 1440 and 390 wide, light and dark: shelves in order; "Read the story" works; chapters show text left and a sticky visual right on wide screens, stacked on phones; the slicer tiles each show one quarter of the artboard; `document.documentElement.scrollWidth === innerWidth`.
- [ ] **Step 2:** Keyboard: Tab through the story page; no focused element sits under the sticky header or a sticky visual.
- [ ] **Step 3:** Reduced motion emulated: slicer open, clock full, no console errors.
- [ ] **Step 4:** Search the new components and the three content files for U+2014: none in reader-facing strings.
- [ ] **Step 5:** Update `docs/v3-todo.md` (a "Projects on /social" section) and the `social-showcase-page` memory (shelves, story layout, slug rename).
- [ ] **Step 6:** `npm test && npm run test:build`, then commit. Do not push.
