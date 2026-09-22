# v3 Phase A — One-Page Scroll Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/v3`, a noindex one-page portfolio: Open → Brief → three discipline chapters (Web & growth, Social media, Logo & identity) that stack as sticky plates → Contact, in Devsign8 purple over the existing dot field, with GSAP scroll choreography that never hides content from no-JS or reduced-motion visitors.

**Architecture:** Astro static page with its own layout (V3Layout, the V2BLayout precedent). Chapter grouping is a pure TypeScript function (`buildChapters`) fed by a `showcase` rank in each work entry's frontmatter, so it is unit-testable with `node --test`. Stacking is plain CSS `position: sticky`; GSAP (ScrollTrigger + SplitText) only decorates it, from one module that exits under reduced motion.

**Tech Stack:** Astro 7, TypeScript (strict, `verbatimModuleSyntax`), GSAP 3.15 (ScrollTrigger, SplitText), Node 24 `node --test` with native type stripping, Pillow for image conversion, headless Chrome for the cover capture.

**Spec:** `docs/superpowers/specs/2026-09-22-v3-scroll-portfolio-design.md` (commit d1f51e4). Read §2–§6 before starting. Phase B (consent + measurement) and Phase C (launch pack) are **not** in this plan.

## Global Constraints

- Route `/v3`, `noindex, nofollow`, excluded from the sitemap, **no GTM, no JSON-LD** until promotion.
- Palette (html.v3 only). Light: accent `#5a3fe0`, strong `#4527c4`, dim `#8a78e6`. Dark: accent `#a98dff`, strong `#c4b1ff`, dim `#7a5ee6`. `dim` is UI-only (3:1 floor), never body text.
- Dot opacities stay at paper 0.12 / 0.15 and night 0.18 / 0.28, and must stay under the solved purple ceilings (0.175 paper / 0.315 night).
- Engine: `gsap` ^3.15.0 only. **No Lenis, no Motion, no smooth scroll.**
- **Nothing may be hidden by CSS before JS runs**, except the Open h1 under `html.v3-intro`, which carries a 2 s failsafe.
- Only transform, opacity, colour (via the `--ink` / `--plate-dim` custom properties) and clip-path animate. **No infinite animations** (WCAG 2.2.2).
- Motion is gated by `motionReduced()` / `onMotionChange()` from `src/scripts/motion.ts`. There is **no** `data-motion` toggle.
- Shared classes go in `src/styles/v3.css` (global). Component-scoped `<style>` covers only that component's own markup (Astro scoped styles never reach child components).
- Every internal link goes through `href()` from `src/lib/url.ts` (the site is served under `/MyPortfolio2`).
- No invented facts or numbers. `result` renders only with a `source`. Draft copy is tracked in the copy deck, and promotion (Phase C) requires every line approved.
- Commit style is the repo's own: a sentence-case summary, a body explaining why, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Stage only the files the task names; never stage the untracked `scripts/mesh-headshot-light.py`, `src/assets/devsign8-sign.webp` or `src/assets/jayson-mesh-headshot-light.webp`.

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `src/lib/chapters.ts` | create | Pure: group showcased entries into chapters, rank them, build the counter text |
| `src/config/v3.ts` | create | The discipline chapter definitions (order, labels, cats, "see all" links) |
| `src/content.config.ts` | modify | Add optional `brief`, `showcase`, `result` to the work schema |
| `src/content/work/devsign8-website.md` | create | The new web entry |
| `src/assets/projects/Devsign8-Website.webp` (+ `-Dark`) | create | Its cover capture(s) |
| `src/content/work/mustang-gtd.md`, `digiskills-logo.md` | modify | `showcase: 1` + draft `brief` |
| `src/styles/v3.css` | create | Palette override, dot tint, shell and shared v3 classes, motion hooks |
| `src/components/DotGrid.astro` | modify | Read its tint from `--dotgrid-rgb-light/-dark` with the cobalt fallback |
| `src/layouts/V3Layout.astro` | create | Head, noindex, theme + intro bootstrap, sticky header, DotGrid, footer, motion import |
| `src/pages/v3/index.astro` | create | Queries work, builds chapters, composes the sections |
| `src/components/v3/Open.astro`, `Brief.astro`, `Chapter.astro`, `Contact.astro` | create | The four sections |
| `src/scripts/v3-motion.ts` | create | Every GSAP call on the page |
| `src/components/WorkGrid.astro` | modify | `?cat=` deep links |
| `astro.config.mjs` | modify | Sitemap filter excludes `/v3` |
| `package.json` | modify | `gsap` dependency; `test` and `test:build` scripts |
| `tests/unit/chapters.test.ts`, `tests/unit/contrast.test.ts` | create | Unit tests |
| `tests/build/v3-build.test.ts` | create | Assertions on the built HTML |
| `docs/copy/v3-copy-deck.md` | create | Every visible v3 string + status + case-study questionnaire |

---

### Task 1: Test runner + chapter builder

**Files:**
- Create: `src/lib/chapters.ts`
- Create: `tests/unit/chapters.test.ts`
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces:
  - `interface ChapterDef { key: string; label: string; cats: readonly string[]; more: string; all: { href: string; label: string; always: boolean } }`
  - `interface ShowcaseItem { id: string; cats: readonly string[]; showcase?: number | undefined; order: number; title: string }`
  - `interface Chapter<T extends ShowcaseItem> { def: ChapterDef; featured: T; more: T[]; overflow: boolean }`
  - `const MORE_LIMIT = 3`
  - `function buildChapters<T extends ShowcaseItem>(defs: readonly ChapterDef[], items: readonly T[]): Chapter<T>[]`
  - `function counter(index: number, total: number): string` → `"01 / 03"`

- [ ] **Step 1: Add the test scripts to `package.json`**

In `"scripts"`, after `"astro": "astro"`, add:

```json
    "test": "node --test \"tests/unit/*.test.ts\"",
    "test:build": "astro build && node --test \"tests/build/*.test.ts\""
```

(Node 24 strips TypeScript types natively and expands the quoted glob itself, so this works under cmd.exe too. No test dependency is needed.)

- [ ] **Step 2: Write the failing test** at `tests/unit/chapters.test.ts`

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildChapters, counter, MORE_LIMIT, type ChapterDef } from '../../src/lib/chapters.ts';

const def = (key: string, cats: string[], always = false): ChapterDef => ({
  key,
  label: key,
  cats,
  more: `More ${key} work`,
  all: { href: `/work?cat=${key}`, label: `See all ${key} work`, always },
});

const WEB = def('web', ['web', 'mobile']);
const SOCIAL = def('social', ['social'], true);
const LOGO = def('logo', ['logo']);
const DEFS = [WEB, SOCIAL, LOGO];

const item = (id: string, cats: string[], showcase?: number, order = 100, title = id) => ({
  id,
  cats,
  showcase,
  order,
  title,
});

test('groups showcased entries by cats, in definition order', () => {
  const out = buildChapters(DEFS, [
    item('digiskills-logo', ['logo'], 1),
    item('site', ['web'], 1),
    item('mustang', ['social'], 1),
  ]);
  assert.deepEqual(out.map((c) => c.def.key), ['web', 'social', 'logo']);
  assert.deepEqual(out.map((c) => c.featured.id), ['site', 'mustang', 'digiskills-logo']);
});

test('ignores entries without a showcase rank', () => {
  const out = buildChapters(DEFS, [item('a', ['logo'], 1), item('b', ['logo'])]);
  assert.equal(out.length, 1);
  assert.deepEqual(out[0]?.more, []);
});

test('drops a chapter with nothing showcased, so the total shrinks', () => {
  const out = buildChapters(DEFS, [item('a', ['logo'], 1)]);
  assert.deepEqual(out.map((c) => c.def.key), ['logo']);
});

test('ranks by showcase, then order, then title', () => {
  const out = buildChapters([LOGO], [
    item('c', ['logo'], 2, 50, 'Charlie'),
    item('b', ['logo'], 2, 50, 'Bravo'),
    item('z', ['logo'], 2, 10, 'Zulu'),
    item('a', ['logo'], 1, 99, 'Alpha'),
  ]);
  assert.equal(out[0]?.featured.id, 'a');
  assert.deepEqual(out[0]?.more.map((i) => i.id), ['z', 'b', 'c']);
});

test('caps the More row and flags overflow', () => {
  const many = [1, 2, 3, 4, 5].map((n) => item(`l${n}`, ['logo'], n));
  const [logo] = buildChapters([LOGO], many);
  assert.equal(logo?.more.length, MORE_LIMIT);
  assert.equal(logo?.overflow, true);
  const [few] = buildChapters([LOGO], many.slice(0, 4));
  assert.equal(few?.overflow, false);
});

test('an entry spanning two chapters appears only in the first', () => {
  const out = buildChapters(DEFS, [item('both', ['web', 'logo'], 1), item('l', ['logo'], 1)]);
  assert.equal(out[0]?.featured.id, 'both');
  assert.equal(out[1]?.featured.id, 'l');
  assert.equal(out[1]?.more.length, 0);
});

test('counter pads both numbers', () => {
  assert.equal(counter(0, 3), '01 / 03');
  assert.equal(counter(9, 12), '10 / 12');
});
```

- [ ] **Step 3: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL, with `ERR_MODULE_NOT_FOUND` for `src/lib/chapters.ts`.

- [ ] **Step 4: Write `src/lib/chapters.ts`**

```ts
/* ============================================================================
   chapters.ts — groups showcased work into v3's discipline chapters.
   ----------------------------------------------------------------------------
   PURE ON PURPOSE. No astro:content import, so `node --test` can exercise it
   directly; the page maps collection entries onto ShowcaseItem before calling.

   The rules the tests pin down:
   - Only entries with a `showcase` rank take part. Rank 1 is the featured
     project; ranks 2+ form the More row, capped at MORE_LIMIT.
   - A chapter with nothing showcased is dropped, so the counter total is
     always the number of chapters actually on the page.
   - An entry whose cats match two chapters is claimed by the FIRST, so
     nothing is shown twice.
   ========================================================================= */

export interface ChapterDef {
  key: string;
  label: string;
  cats: readonly string[];
  /** Heading of the More row, e.g. "More logo work". */
  more: string;
  /** `always` shows the link even without overflow (social → /social). */
  all: { href: string; label: string; always: boolean };
}

export interface ShowcaseItem {
  id: string;
  cats: readonly string[];
  showcase?: number | undefined;
  order: number;
  title: string;
}

export interface Chapter<T extends ShowcaseItem> {
  def: ChapterDef;
  featured: T;
  more: T[];
  /** True when there were more ranked entries than the More row shows. */
  overflow: boolean;
}

export const MORE_LIMIT = 3;

export function buildChapters<T extends ShowcaseItem>(
  defs: readonly ChapterDef[],
  items: readonly T[],
): Chapter<T>[] {
  const claimed = new Set<string>();
  const chapters: Chapter<T>[] = [];

  for (const def of defs) {
    const ranked = items
      .filter(
        (i) =>
          i.showcase !== undefined &&
          !claimed.has(i.id) &&
          i.cats.some((c) => def.cats.includes(c)),
      )
      .sort(
        (a, b) =>
          (a.showcase ?? 0) - (b.showcase ?? 0) ||
          a.order - b.order ||
          a.title.localeCompare(b.title),
      );

    const [featured, ...rest] = ranked;
    if (!featured) continue;

    for (const i of ranked) claimed.add(i.id);
    chapters.push({
      def,
      featured,
      more: rest.slice(0, MORE_LIMIT),
      overflow: rest.length > MORE_LIMIT,
    });
  }

  return chapters;
}

export function counter(index: number, total: number): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(index + 1)} / ${pad(total)}`;
}
```

- [ ] **Step 5: Run the tests to confirm they pass**

Run: `npm test`
Expected: PASS, 7 tests, 0 failures.

- [ ] **Step 6: Type-check**

Run: `npx astro check`
Expected: `0 errors`. (`allowImportingTsExtensions` is on in Astro's base tsconfig, so the `.ts` import in the test is legal.)

- [ ] **Step 7: Commit**

```bash
git add package.json src/lib/chapters.ts tests/unit/chapters.test.ts
git commit -F - <<'EOF'
Add the v3 chapter builder, and a zero-dependency test runner

Groups showcased work into discipline chapters: rank 1 is featured, ranks
2+ form a capped More row, empty chapters drop out so the counter stays
honest. Pure TypeScript, so Node 24's built-in runner tests it directly.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 2: Schema fields, chapter config, and the two existing showcased entries

**Files:**
- Modify: `src/content.config.ts` (the work schema, after the `outcome` field)
- Create: `src/config/v3.ts`
- Modify: `src/content/work/mustang-gtd.md`, `src/content/work/digiskills-logo.md` (frontmatter)

**Interfaces:**
- Consumes: `ChapterDef` from Task 1.
- Produces: `V3_CHAPTERS: readonly ChapterDef[]`; work entries gain `data.brief?: string`, `data.showcase?: number`, `data.result?: { value: string; label: string; source: string }`.

- [ ] **Step 1: Add the schema fields.** In `src/content.config.ts`, directly after the line `outcome: z.string().optional(),`, insert:

```ts

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
```

- [ ] **Step 2: Create `src/config/v3.ts`**

```ts
/* ============================================================================
   v3.ts — the discipline chapters of the /v3 page, in page order.
   ----------------------------------------------------------------------------
   A chapter appears only once a work entry in its cats carries `showcase`.
   To feature more work, add `showcase: 2` (3, 4…) to that entry's
   frontmatter; nothing here needs to change. To add a discipline, add a row;
   it stays invisible until its first entry is showcased.

   Order is marketing-weighted: the web and social work lead, identity last.
   ========================================================================= */
import type { ChapterDef } from '../lib/chapters';
import type { WorkCategory } from '../content.config';

type V3Chapter = ChapterDef & { cats: readonly WorkCategory[] };

export const V3_CHAPTERS: readonly V3Chapter[] = [
  {
    key: 'web',
    label: 'Web & growth',
    cats: ['web', 'mobile'],
    more: 'More web work',
    all: { href: '/work?cat=web', label: 'See all web work', always: false },
  },
  {
    key: 'social',
    label: 'Social media',
    cats: ['social'],
    more: 'More social work',
    all: { href: '/social/', label: 'See all posts', always: true },
  },
  {
    key: 'logo',
    label: 'Logo & identity',
    cats: ['logo'],
    more: 'More logo work',
    all: { href: '/work?cat=logo', label: 'See all logo work', always: false },
  },
];
```

- [ ] **Step 3: Showcase the two existing entries.** In `src/content/work/mustang-gtd.md`, add these two lines directly above `featured: false`:

```yaml
brief: "Four Instagram panels that had to read as one unbroken frame."
showcase: 1
```

In `src/content/work/digiskills-logo.md`, add these directly above `featured: false`:

```yaml
brief: "A digital-safety app for kids needed a mark that felt like play."
showcase: 1
```

(Both briefs are drafts. Task 9 records them in the copy deck as `draft`.)

- [ ] **Step 4: Verify types and content**

Run: `npx astro check`
Expected: `0 errors`. Then run `npm test`. Expected: still 7 passing.

- [ ] **Step 5: Commit**

```bash
git add src/content.config.ts src/config/v3.ts src/content/work/mustang-gtd.md src/content/work/digiskills-logo.md
git commit -F - <<'EOF'
Add showcase, brief and result to the work schema, and the v3 chapters

Discipline chapters for /v3 are defined once in config; entries opt in
with a showcase rank. Mustang GTD and the DigiSkills logo are the first
two, each with a draft one-line brief pending Jayson's approval.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 3: The devsign8.com work entry and its cover

**Files:**
- Create: `src/assets/projects/Devsign8-Website.webp` (and `Devsign8-Website-Dark.webp` only if the dark capture differs)
- Create: `src/content/work/devsign8-website.md`

**Interfaces:**
- Consumes: the schema fields from Task 2.
- Produces: a work entry with id `devsign8-website`, `cats: ['web']`, `showcase: 1`.

- [ ] **Step 1: Capture the live site in both colour schemes** (headless Chrome; the scratchpad keeps the PNGs out of the repo)

```bash
SP="C:/Users/jmerb/AppData/Local/Temp/claude/C--Users-jmerb-OneDrive-Desktop-MyPortfolio-MyPortfolio2/5e8086e9-5ef7-4f16-a4dd-60760158e25b/scratchpad"
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --window-size=1440,900 --virtual-time-budget=6000 --screenshot="$SP/devsign8-light.png" https://www.devsign8.com
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --window-size=1440,900 --virtual-time-budget=6000 --force-dark-mode --screenshot="$SP/devsign8-dark.png" https://www.devsign8.com
```

Expected: two PNGs, 1440 × 900.

- [ ] **Step 2: Look at both captures** with the Read tool (it renders images). Check that there is no cookie banner covering the hero, no half-played entrance animation and no blank frame. If an animation was caught mid-play, re-run with `--virtual-time-budget=12000`. Note whether the two captures actually differ (devsign8.com may ignore the OS preference and use its own toggle).

- [ ] **Step 3: Convert to WebP**

```bash
python - <<'EOF'
from PIL import Image
import hashlib, pathlib
sp = pathlib.Path(r"C:/Users/jmerb/AppData/Local/Temp/claude/C--Users-jmerb-OneDrive-Desktop-MyPortfolio-MyPortfolio2/5e8086e9-5ef7-4f16-a4dd-60760158e25b/scratchpad")
out = pathlib.Path("src/assets/projects")
light, dark = sp / "devsign8-light.png", sp / "devsign8-dark.png"
Image.open(light).convert("RGB").save(out / "Devsign8-Website.webp", "WEBP", quality=82, method=6)
same = hashlib.sha256(Image.open(light).tobytes()).digest() == hashlib.sha256(Image.open(dark).tobytes()).digest()
if not same:
    Image.open(dark).convert("RGB").save(out / "Devsign8-Website-Dark.webp", "WEBP", quality=82, method=6)
print("dark variant written" if not same else "captures identical: no dark variant")
EOF
```

- [ ] **Step 4: Create `src/content/work/devsign8-website.md`.** Write `coverAlt` (and `coverDark` + a matching description only if Step 3 wrote a dark file) from what the capture **actually shows**: the layout, the visible headline text quoted exactly, the dominant colours. Follow the style of the existing entries' alt text. Template, with the alt left for you to fill from the image:

```markdown
---
title: "Devsign8 Website"
shortTitle: "devsign8.com"
summary: "The studio website for Devsign8, the digital agency behind this portfolio's brand system."
category: "Web Design"
cats:
  - "web"
tags:
  - "Web Design"
  - "Studio Site"
cover: "../../assets/projects/Devsign8-Website.webp"
coverAlt: "<describe the light capture: layout, exact visible headline, colours>"
client: "Self-initiated"
externalUrl: "https://www.devsign8.com"
showcase: 1
featured: false
order: 5
---
<!-- CASE STUDY INCOMPLETE — missing: role, year, problem, approach, outcome.
     Facts come from the questionnaire in docs/copy/v3-copy-deck.md. There is
     no `brief` yet on purpose: the chapter falls back to `summary` until the
     questionnaire answers arrive, and to `result` once analytics do. -->
```

If a dark file exists, add under `cover:`:

```yaml
coverDark: "../../assets/projects/Devsign8-Website-Dark.webp"
```

- [ ] **Step 5: Verify**

Run: `npx astro check`
Expected: `0 errors`. The `image()` schema fails the build if a cover path is wrong, so a clean check proves the files resolve.

- [ ] **Step 6: Commit**

```bash
git add src/content/work/devsign8-website.md src/assets/projects/Devsign8-Website*.webp
git commit -F - <<'EOF'
Add devsign8.com as a web work entry, showcased first in v3

Fills the portfolio's missing web discipline with the studio site itself.
The cover is captured from the live site; case-study facts wait on the
questionnaire rather than being assumed.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 4: Purple palette, dot tint, and a contrast test that guards both

**Files:**
- Create: `tests/unit/contrast.test.ts`
- Create: `src/styles/v3.css` (the palette block only in this task; the rest arrives in Task 5)
- Modify: `src/components/DotGrid.astro:115-133` (the four `--dot-base` / `--dot-active` pairs)

**Interfaces:**
- Produces: CSS custom properties `--dotgrid-rgb-light` / `--dotgrid-rgb-dark` (space-separated RGB triplets) read by DotGrid, which falls back to cobalt `18 58 143` / `110 155 255` so v2 is unchanged.

- [ ] **Step 1: Write the failing test** at `tests/unit/contrast.test.ts`

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

type RGB = [number, number, number];

const tokens = readFileSync('src/styles/tokens.css', 'utf8');
const v3 = readFileSync('src/styles/v3.css', 'utf8');
const dotgrid = readFileSync('src/components/DotGrid.astro', 'utf8');

const hexVar = (css: string, name: string): RGB => {
  const m = new RegExp(`${name}:\\s*#([0-9a-f]{6})`, 'i').exec(css);
  assert.ok(m?.[1], `${name} not found`);
  const h = m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
};
const tripletVar = (css: string, name: string): RGB => {
  const m = new RegExp(`${name}:\\s*(\\d+) (\\d+) (\\d+)`).exec(css);
  assert.ok(m, `${name} not found`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
};
const lum = (c: RGB) => {
  const [r, g, b] = c.map((x) => {
    const v = x / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  }) as RGB;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: RGB, b: RGB) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};
const over = (fg: RGB, bg: RGB, a: number): RGB =>
  fg.map((f, i) => a * f + (1 - a) * (bg[i] ?? 0)) as RGB;

const ground = {
  light: { bg: hexVar(tokens, '--raw-light-bg'), bg2: hexVar(tokens, '--raw-light-bg-2'), dim: hexVar(tokens, '--raw-light-text-dim') },
  dark: { bg: hexVar(tokens, '--raw-dark-bg'), bg2: hexVar(tokens, '--raw-dark-bg-2'), dim: hexVar(tokens, '--raw-dark-text-dim') },
};

for (const mode of ['light', 'dark'] as const) {
  const g = ground[mode];
  const accent = hexVar(v3, `--raw-${mode}-accent`);
  const strong = hexVar(v3, `--raw-${mode}-accent-strong`);
  const dim = hexVar(v3, `--raw-${mode}-accent-dim`);

  test(`${mode}: accent and accent-strong carry text (4.5:1) on bg and plate`, () => {
    for (const c of [accent, strong]) {
      assert.ok(ratio(c, g.bg) >= 4.5, `on bg ${ratio(c, g.bg).toFixed(2)}`);
      assert.ok(ratio(c, g.bg2) >= 4.5, `on bg-2 ${ratio(c, g.bg2).toFixed(2)}`);
    }
  });

  test(`${mode}: accent-dim clears the 3:1 UI floor on bg and plate`, () => {
    assert.ok(ratio(dim, g.bg) >= 3 && ratio(dim, g.bg2) >= 3);
  });

  test(`${mode}: text-dim stays AA on the plate (the covered-plate dim state)`, () => {
    assert.ok(ratio(g.dim, g.bg2) >= 4.5);
  });

  test(`${mode}: dot alphas stay under the solved ceiling for the purple tint`, () => {
    const tint = tripletVar(v3, `--dotgrid-rgb-${mode}`);
    const alphas = [...dotgrid.matchAll(new RegExp(`rgb\\(var\\(--dotgrid-rgb-${mode}[^)]*\\) \\/ (0\\.\\d+)\\)`, 'g'))].map((m) => Number(m[1]));
    assert.ok(alphas.length >= 2, 'DotGrid must read --dotgrid-rgb-' + mode);
    for (const a of alphas) {
      assert.ok(ratio(g.dim, over(tint, g.bg, a)) >= 4.5, `alpha ${a} breaks text-dim`);
    }
  });
}

test('on-accent text passes on both accents', () => {
  assert.ok(ratio([255, 255, 255], hexVar(v3, '--raw-light-accent')) >= 4.5);
  assert.ok(ratio(ground.dark.bg, hexVar(v3, '--raw-dark-accent')) >= 4.5);
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL, with `ENOENT … src/styles/v3.css`.

- [ ] **Step 3: Create `src/styles/v3.css` with the palette block**

```css
/* ============================================================================
   v3.css — the /v3 variant's global layer.
   ----------------------------------------------------------------------------
   GLOBAL ON PURPOSE. Astro scopes a component's <style> to its own markup, so
   anything shared between v3 components, or aimed at a child component such
   as DotGrid, has to live here.

   THE PALETTE IS AN OVERRIDE, NOT A FORK. tokens.css maps semantic tokens
   (--accent…) to raw ones (--raw-light-accent…) on :root. html IS :root, so
   redefining the raw tokens here, at higher specificity, changes what those
   same var() references resolve to, and every downstream rule turns purple
   without a single component knowing. Verified by tests/unit/contrast.test.ts.
   ========================================================================= */

html.v3 {
  /* Devsign8 purple. Light ground: #5a3fe0 6.03:1 on paper. */
  --raw-light-accent: #5a3fe0;
  --raw-light-accent-strong: #4527c4;
  --raw-light-accent-dim: #8a78e6;
  --raw-light-border: rgb(90 63 224 / 0.18);
  --raw-light-border-strong: rgb(90 63 224 / 0.38);

  /* Night ground: #a98dff 7.43:1 on night. */
  --raw-dark-accent: #a98dff;
  --raw-dark-accent-strong: #c4b1ff;
  --raw-dark-accent-dim: #7a5ee6;
  --raw-dark-border: rgb(169 141 255 / 0.18);
  --raw-dark-border-strong: rgb(169 141 255 / 0.38);

  /* Dot field tint, read by DotGrid.astro. Alphas stay in DotGrid. */
  --dotgrid-rgb-light: 90 63 224;
  --dotgrid-rgb-dark: 169 141 255;
}
```

- [ ] **Step 4: Point DotGrid at the tint variables.** In `src/components/DotGrid.astro`, replace every cobalt pair in the `<style>` block (lines 115–133) so that the light ones read:

```css
    --dot-base: rgb(var(--dotgrid-rgb-light, 18 58 143) / 0.12);
    --dot-active: rgb(var(--dotgrid-rgb-light, 18 58 143) / 0.15);
```

and the dark ones (both the `@media (prefers-color-scheme: dark)` block and `:root[data-theme='dark']`) read:

```css
      --dot-base: rgb(var(--dotgrid-rgb-dark, 110 155 255) / 0.18);
      --dot-active: rgb(var(--dotgrid-rgb-dark, 110 155 255) / 0.28);
```

Add one line to the comment above them: `The RGB comes from --dotgrid-rgb-light/-dark when a page sets them (v3's purple); the fallback is v2's cobalt, so v2 renders exactly as before.` The probe-element colour read in the script (`toRgba`) already normalises whatever these resolve to, so the script needs no change.

- [ ] **Step 5: Run the tests to confirm they pass**

Run: `npm test`
Expected: PASS, 7 chapter tests + 9 contrast tests.

- [ ] **Step 6: Commit**

```bash
git add tests/unit/contrast.test.ts src/styles/v3.css src/components/DotGrid.astro
git commit -F - <<'EOF'
Devsign8 purple for v3, and a dot field that can take any tint

The palette is a raw-token override on html.v3, so nothing forks. DotGrid
now reads its RGB from a variable with v2's cobalt as the fallback. A
contrast test reads the real CSS and fails if any pairing or dot alpha
drops below its floor.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 5: V3Layout, the route, and the static Open, Brief and Contact sections

**Files:**
- Create: `tests/build/v3-build.test.ts`
- Create: `src/layouts/V3Layout.astro`, `src/pages/v3/index.astro`
- Create: `src/components/v3/Open.astro`, `src/components/v3/Brief.astro`, `src/components/v3/Contact.astro`
- Modify: `src/styles/v3.css` (append the shell and shared classes)
- Modify: `astro.config.mjs` (sitemap filter)

**Interfaces:**
- Consumes: `PERSON`, `SOCIALS`, `SEO` from `src/config/site.ts`; `href`, `asset` from `src/lib/url.ts`; `currentTheme`, `toggleTheme` from `src/scripts/theme.ts`; `DotGrid.astro`.
- Produces: the DOM hooks that Task 8 animates: `[data-intro]` (Open h1), `[data-cue]`, `[data-ink]` (Brief paragraph), `[data-count]` (stats and results, whose text content is the final value), `[data-split]` (line-reveal headings), `[data-portrait]`; the `html.v3-intro` class; the CSS variable `--header-height` on `<html>`.

- [ ] **Step 1: Write the failing build test** at `tests/build/v3-build.test.ts`

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const PAGE = 'dist/v3/index.html';
const html = existsSync(PAGE) ? readFileSync(PAGE, 'utf8') : '';

test('the page is built', () => assert.ok(existsSync(PAGE), `${PAGE} missing`));
test('noindex, nofollow', () => assert.match(html, /<meta name="robots" content="noindex, nofollow"/));
test('no GTM and no JSON-LD on a variant', () => {
  assert.doesNotMatch(html, /googletagmanager/);
  assert.doesNotMatch(html, /application\/ld\+json/);
});
test('exactly one h1', () => assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1));
test('html carries the v3 class', () => assert.match(html, /<html[^>]*class="v3"/));
test('the dot field is mounted', () => assert.match(html, /data-dotgrid/));
test('stats are real text', () => {
  for (const v of ['40+', '5+', '20+']) assert.ok(html.includes(`>${v}<`), v);
});
test('contact is a mailto', () => assert.match(html, /href="mailto:[^"]+"/));
test('/v3 is not in the sitemap', () => {
  const map = existsSync('dist/sitemap-0.xml') ? readFileSync('dist/sitemap-0.xml', 'utf8') : '';
  assert.ok(map.length > 0, 'sitemap missing');
  assert.doesNotMatch(map, /\/v3\//);
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm run test:build`
Expected: the build succeeds, then FAIL on `the page is built` (`dist/v3/index.html missing`).

- [ ] **Step 3: Exclude `/v3` from the sitemap.** In `astro.config.mjs`, change the filter line to:

```js
      filter: (page) =>
        !page.includes('/404') && !page.includes('/v2b') && !page.includes('/v3'),
```

and extend the comment above it with: `/v3 is the one-page scroll variant (src/layouts/V3Layout.astro), excluded for the same reason until it is promoted to /.`

- [ ] **Step 4: Create `src/layouts/V3Layout.astro`**

```astro
---
/* ============================================================================
   V3Layout.astro — the shell for the /v3 one-page scroll variant.
   ----------------------------------------------------------------------------
   Separate from BaseLayout for the V2BLayout reason: an unindexed variant must
   not inject GTM or a second JSON-LD entity graph about the same person. Unlike
   v2B it DOES mount the dot field, which v3 keeps from v2.

   The header is sticky and publishes --header-height, because DotGrid insets
   its canvas by that variable so no dot ever paints behind the navigation.
   Phase C flips this shell to indexable in one place when /v3 is promoted.
   ========================================================================= */
import { PERSON, SOCIALS, SEO } from '../config/site';
import { href, asset } from '../lib/url';
import DotGrid from '../components/DotGrid.astro';

import '@fontsource-variable/inter-tight/wght.css';
import '@fontsource-variable/inter-tight/wght-italic.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/instrument-serif/400.css';
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/v3.css';

interface Props {
  title?: string;
  description?: string;
}

const {
  title = 'v3',
  description = 'A one-page portfolio: who Jayson is, then the work, one discipline at a time.',
} = Astro.props;

const year = new Date().getFullYear();
---

<!doctype html>
<html lang={SEO.lang} class="v3">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    {/* Before first paint, for two jobs that cannot wait for the bundle:
        1. the stored theme, shared with v2 and v2B through 'jm-theme';
        2. html.v3-intro, which hides ONLY the Open h1 so its line reveal does
           not flash. It is added only when motion is allowed, and removed after
           2 s no matter what, so a failed bundle can never strand the headline.
        This reads the media query itself because motion.ts is a module and has
        not loaded yet; everything after first paint asks motion.ts. */}
    <script is:inline>
      (function () {
        var d = document.documentElement;
        try {
          var stored = localStorage.getItem('jm-theme');
          if (stored === 'light' || stored === 'dark') d.setAttribute('data-theme', stored);
        } catch (e) {}
        try {
          if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            d.classList.add('v3-intro');
            setTimeout(function () { d.classList.remove('v3-intro'); }, 2000);
          }
        } catch (e) {}
      })();
    </script>

    <title>{`${title} — ${PERSON.name}`}</title>
    <meta name="description" content={description} />
    <meta name="robots" content="noindex, nofollow" />
    <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f7f6f3" />
    <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0a0b10" />
    <link rel="icon" type="image/svg+xml" href={asset('/favicon.svg')} />
  </head>

  <body>
    <a class="skip-link" href="#main">Skip to main content</a>

    <header class="v3-header" data-v3-header>
      <div class="v3-header__inner container">
        <a class="v3-mark" href={href('/v3/')}>{PERSON.firstName} Erboila</a>
        <nav class="v3-header__links" aria-label="Primary">
          <a href="#work">Work</a>
          <a href="#contact">Contact</a>
          <button type="button" class="v3-theme" id="v3-theme" aria-label="Switch to dark theme">
            <span data-theme-label>Theme</span>
          </button>
          <a class="v3-backlink" href={href('/')}>&larr; v2</a>
        </nav>
      </div>
    </header>

    <DotGrid />

    <main id="main" tabindex="-1">
      <slot />
    </main>

    <footer class="v3-footer container">
      <p>&copy; {year} {PERSON.name}</p>
      <ul class="v3-footer__socials" role="list">
        {SOCIALS.map((s) => (
          <li><a href={s.url} target="_blank" rel="noopener me">{s.label}</a></li>
        ))}
      </ul>
    </footer>

    <script>
      import { currentTheme, toggleTheme } from '../scripts/theme';

      /* Measured, not guessed: DotGrid and the sticky plates both read it. */
      const header = document.querySelector<HTMLElement>('[data-v3-header]');
      if (header) {
        const publish = () =>
          document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
        publish();
        new ResizeObserver(publish).observe(header);
      }

      /* Visible word = current state; accessible name = the action. Same split
         as v2B's toggle. */
      const btn = document.getElementById('v3-theme');
      const label = btn?.querySelector<HTMLElement>('[data-theme-label]');
      if (btn && label) {
        const sync = () => {
          const now = currentTheme();
          label.textContent = now === 'dark' ? 'Dark' : 'Light';
          btn.setAttribute('aria-label', `Switch to ${now === 'dark' ? 'light' : 'dark'} theme`);
        };
        btn.addEventListener('click', () => {
          toggleTheme();
          sync();
        });
        window.addEventListener('themechange', sync);
        sync();
      }
    </script>
  </body>
</html>
```

- [ ] **Step 5: Create `src/components/v3/Open.astro`** (copy is a draft, tracked in Task 9)

```astro
---
import { PERSON } from '../../config/site';
---

<section class="v3-open container" aria-labelledby="v3-open-title">
  <p class="v3-eyebrow">{PERSON.name} · {PERSON.tagline} · {PERSON.location.city}</p>
  <h1 id="v3-open-title" class="v3-open__title" data-intro>
    Marketing strategy<br /> <em>and the design to carry it</em>
  </h1>
  <p class="v3-open__cue" data-cue aria-hidden="true">Scroll</p>
</section>

<style>
  .v3-open {
    display: grid;
    align-content: center;
    gap: var(--space-m);
    min-block-size: calc(100svh - var(--header-height, 4.5rem));
    padding-block: var(--space-2xl);
  }

  .v3-open__title {
    font-size: var(--step-hero);
    max-inline-size: 16ch;
    margin: 0;
  }

  .v3-open__cue {
    font-size: var(--step--1);
    color: var(--text-dim);
    letter-spacing: var(--tracking-caps);
    text-transform: uppercase;
    margin: 0;
  }
</style>
```

- [ ] **Step 6: Create `src/components/v3/Brief.astro`** (copy trimmed from v1's About; a draft, tracked in Task 9)

```astro
---
import { Image } from 'astro:assets';
import meshPortrait from '../../assets/jayson-mesh-portrait.webp';

/* The same three counts as v1 and v2's About. The value is the real text;
   v3-motion.ts overlays an aria-hidden counter, so assistive tech only ever
   reads the final value. */
const STATS = [
  { value: '40+', label: 'Projects' },
  { value: '5+', label: 'Years' },
  { value: '20+', label: 'Clients' },
];
---

<section id="about" class="v3-brief container" aria-labelledby="v3-brief-title">
  <figure class="v3-brief__figure">
    <Image
      class="v3-brief__img"
      src={meshPortrait}
      alt="Jayson's head rendered as a grey 3D polygon mesh, a fine wireframe traced over his face beneath swept-back hair."
      widths={[400, 726]}
      sizes="(min-width: 64rem) 24rem, min(80vw, 22rem)"
      loading="lazy"
      decoding="async"
      data-portrait
    />
  </figure>

  <div class="v3-brief__body">
    <h2 id="v3-brief-title" class="v3-eyebrow">About</h2>
    <p class="v3-brief__text" data-ink>
      I'm Jayson Mercado Erboila, a Digital Marketing Specialist and designer in Toronto. From
      marketing strategy and SEO to pixel-perfect logos and digital interfaces, I work where
      strategy meets aesthetics. With 5+ years across industries, I bring ideas to life through
      thoughtful, intentional design.
    </p>
    <dl class="v3-stats">
      {STATS.map((s) => (
        <div class="v3-stats__item">
          <dt class="v3-stats__label">{s.label}</dt>
          <dd class="v3-stats__value" data-count>{s.value}</dd>
        </div>
      ))}
    </dl>
  </div>
</section>

<style>
  .v3-brief {
    display: grid;
    gap: var(--space-xl);
    align-items: center;
    padding-block: var(--space-section);
  }

  @media (min-width: 64rem) {
    .v3-brief {
      grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    }
  }

  .v3-brief__figure {
    position: relative;
    margin: 0 auto;
    inline-size: min(100%, 24rem);
    --mesh-halo: transparent;
  }

  /* Dark hair on night has no silhouette without a lift (v2B finding). */
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) .v3-brief__figure {
      --mesh-halo: rgb(169 141 255 / 0.07);
    }
  }
  :root[data-theme='dark'] .v3-brief__figure {
    --mesh-halo: rgb(169 141 255 / 0.07);
  }

  .v3-brief__figure::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(48% 40% at 50% 38%, var(--mesh-halo) 0%, transparent 70%);
  }

  .v3-brief__img {
    position: relative;
    inline-size: 100%;
    block-size: auto;
  }

  .v3-brief__text {
    font-size: var(--step-2);
    line-height: var(--leading-snug);
    max-inline-size: 34ch;
    margin-block: var(--space-s) var(--space-l);
  }

  .v3-stats {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-l);
    margin: 0;
  }

  .v3-stats__item {
    display: flex;
    flex-direction: column-reverse;
  }

  .v3-stats__value {
    margin: 0;
    font-size: var(--step-5);
    font-weight: var(--weight-h1);
    letter-spacing: var(--tracking-h1);
    font-variant-numeric: tabular-nums;
  }

  .v3-stats__label {
    color: var(--text-dim);
    font-size: var(--step--1);
  }
</style>
```

- [ ] **Step 7: Create `src/components/v3/Contact.astro`** (copy is a draft, tracked in Task 9)

```astro
---
import { PERSON, SOCIALS } from '../../config/site';
---

<section id="contact" class="v3-contact container" aria-labelledby="v3-contact-title">
  <h2 id="v3-contact-title" class="v3-contact__title" data-split>
    Let's build the <em>next one.</em>
  </h2>
  <a class="v3-button" href={`mailto:${PERSON.email}`}>
    Email <span class="v3-button__addr">{PERSON.email}</span>
  </a>
  <ul class="v3-contact__socials" role="list">
    {SOCIALS.map((s) => (
      <li><a href={s.url} target="_blank" rel="noopener me">{s.label}</a></li>
    ))}
  </ul>
</section>

<style>
  .v3-contact {
    display: grid;
    gap: var(--space-l);
    justify-items: start;
    padding-block: var(--space-section);
  }

  .v3-contact__title {
    font-size: var(--step-hero);
    margin: 0;
    max-inline-size: 14ch;
  }

  .v3-contact__socials {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-m);
    padding: 0;
    margin: 0;
    list-style: none;
  }
</style>
```

- [ ] **Step 8: Create `src/pages/v3/index.astro`** (chapters arrive in Task 6; the `#work` section is already in place)

```astro
---
/* ============================================================================
   /v3 — the one-page scroll portfolio (noindex until promoted).
   Spec: docs/superpowers/specs/2026-09-22-v3-scroll-portfolio-design.md
   ========================================================================= */
import V3Layout from '../../layouts/V3Layout.astro';
import Open from '../../components/v3/Open.astro';
import Brief from '../../components/v3/Brief.astro';
import Contact from '../../components/v3/Contact.astro';
---

<V3Layout>
  <Open />
  <Brief />
  <section id="work" class="v3-work" aria-label="Selected work"></section>
  <Contact />
</V3Layout>
```

- [ ] **Step 9: Append the shell and shared classes to `src/styles/v3.css`**

```css

/* ==========================================================================
   SHELL
   ========================================================================== */
.v3-header {
  position: sticky;
  inset-block-start: 0;
  z-index: 10;
  background: var(--surface-blur);
  backdrop-filter: blur(12px);
  border-block-end: 1px solid var(--border);
}

.v3-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-m);
  min-block-size: 4rem;
}

.v3-mark {
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
}

.v3-header__links {
  display: flex;
  align-items: center;
  gap: var(--space-m);
}

.v3-header__links a {
  text-decoration: none;
}

.v3-theme {
  min-block-size: var(--tap-min);
  padding-inline: var(--space-xs);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-full);
  background: transparent;
  color: inherit;
}

/* The dev backlink is the first thing to go when the header runs out of room. */
@media (max-width: 30rem) {
  .v3-backlink {
    display: none;
  }
}

.v3-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-m);
  padding-block: var(--space-xl);
  color: var(--text-dim);
}

.v3-footer__socials {
  display: flex;
  gap: var(--space-m);
  padding: 0;
  margin: 0;
  list-style: none;
}

/* ==========================================================================
   SHARED
   ========================================================================== */
.v3-eyebrow {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  color: var(--accent);
}

.v3-link {
  display: inline-flex;
  gap: 0.4em;
  align-items: center;
  min-block-size: var(--tap-min);
  font-weight: 500;
  color: var(--accent);
}

.v3-button {
  display: inline-flex;
  gap: 0.5em;
  align-items: center;
  min-block-size: var(--tap-min);
  padding: var(--space-xs) var(--space-m);
  border-radius: var(--radius-full);
  background: var(--accent);
  color: var(--on-accent);
  font-weight: 500;
  text-decoration: none;
}

.v3-button:hover,
.v3-button:focus-visible {
  background: var(--accent-strong);
}

/* ==========================================================================
   MOTION HOOKS — styles v3-motion.ts relies on. Every default is the fully
   visible, fully inked state, so no-JS and reduced motion need nothing.
   ========================================================================== */

/* The ONLY thing hidden before JS runs. See V3Layout's inline script. */
html.v3-intro [data-intro] {
  visibility: hidden;
}

/* Brief words ink from text-dim to text. A colour mix, never opacity: both
   ends pass AA, so every point in between does too. */
.v3-word {
  --ink: 1;
  color: color-mix(in srgb, var(--text) calc(var(--ink) * 100%), var(--text-dim));
}

/* Counting overlay: the real value keeps its layout box and stays in the
   accessibility tree; the aria-hidden overlay paints the digits. */
.v3-count-host {
  position: relative;
  -webkit-text-fill-color: transparent;
}

.v3-count {
  position: absolute;
  inset: 0;
  -webkit-text-fill-color: currentColor;
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 10: Run the build test to confirm it passes**

Run: `npm run test:build`
Expected: the build succeeds, then PASS, 9 tests. Also run `npm test`. Expected: all unit tests still pass.

- [ ] **Step 11: Commit**

```bash
git add tests/build/v3-build.test.ts src/layouts/V3Layout.astro src/pages/v3/index.astro src/components/v3/Open.astro src/components/v3/Brief.astro src/components/v3/Contact.astro src/styles/v3.css astro.config.mjs
git commit -F - <<'EOF'
Add /v3: its shell, and the Open, Brief and Contact sections

A noindex one-page variant with its own layout (no GTM, no JSON-LD), the
dot field, and a sticky header that publishes its height. The sections are
complete static HTML; motion arrives later and only decorates them. A build
test pins the variant's SEO isolation and the no-JS content.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 6: The discipline chapter plates

**Files:**
- Modify: `tests/build/v3-build.test.ts` (append chapter assertions)
- Create: `src/components/v3/Chapter.astro`
- Modify: `src/pages/v3/index.astro`

**Interfaces:**
- Consumes: `buildChapters`, `counter`, `type Chapter`, `type ShowcaseItem` (Task 1); `V3_CHAPTERS` (Task 2); `href` (url.ts).
- Produces: DOM hooks for Task 8: `[data-plate]` (each `<article>`), `[data-frame]` (cover frame), `[data-parallax]` (cover image), `[data-more]` (More list, when present); the CSS custom properties `--plate-h` (set by this task's script) and `--plate-dim` (0 → 1, animated in Task 8).

- [ ] **Step 1: Append the failing assertions** to `tests/build/v3-build.test.ts`

```ts
test('three chapter plates with derived counters', () => {
  assert.equal((html.match(/<article[^>]*data-plate/g) ?? []).length, 3);
  for (const c of ['01 / 03', '02 / 03', '03 / 03']) assert.ok(html.includes(c), c);
});
test('chapters run web, social, logo', () => {
  const at = ['Web &amp; growth', 'Social media', 'Logo &amp; identity'].map((l) => html.indexOf(l));
  assert.ok(at.every((i) => i > -1), JSON.stringify(at));
  assert.deepEqual([...at].sort((a, b) => a - b), at);
});
test('each featured project links to its case page', () => {
  for (const slug of ['devsign8-website', 'mustang-gtd', 'digiskills-logo']) {
    assert.match(html, new RegExp(`href="/MyPortfolio2/work/${slug}/"`));
  }
});
test('the social chapter always links to /social', () => {
  assert.match(html, /href="\/MyPortfolio2\/social\/"/);
});
test('no More row while every chapter has one project', () => {
  assert.doesNotMatch(html, /data-more/);
});
test('peaks fall back to brief, then summary', () => {
  assert.ok(html.includes('Four Instagram panels that had to read as one unbroken frame.'));
  assert.ok(html.includes('The studio website for Devsign8'));
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm run test:build`
Expected: the six new tests FAIL (there are no plates yet); the earlier nine pass.

- [ ] **Step 3: Create `src/components/v3/Chapter.astro`**

```astro
---
/* ============================================================================
   Chapter.astro — one discipline plate.
   ----------------------------------------------------------------------------
   Plates stack with plain CSS sticky: each sticks under the header and the next
   scrolls up over it. Scrolling stays 1:1 with the visitor's input; GSAP only
   decorates. Under reduced motion the plates simply flow.

   TALL-PLATE RULE. A sticky element taller than the viewport is covered by the
   next plate before its bottom is ever seen. The script below publishes each
   plate's height as --plate-h, and `top` takes the smaller of "under the
   header" and "bottom-aligned", so a tall plate scrolls fully past first.
   ========================================================================= */
import { Image } from 'astro:assets';
import type { CollectionEntry } from 'astro:content';
import { counter, type Chapter as ChapterData, type ShowcaseItem } from '../../lib/chapters';
import { href } from '../../lib/url';

type Item = ShowcaseItem & { entry: CollectionEntry<'work'> };

interface Props {
  chapter: ChapterData<Item>;
  index: number;
  total: number;
}

const { chapter, index, total } = Astro.props;
const { def, featured, more, overflow } = chapter;
const d = featured.entry.data;
const name = d.shortTitle ?? d.title;
const titleId = `v3-chapter-${def.key}`;
const showAll = def.all.always || overflow;
---

<article class="v3-plate" data-plate aria-labelledby={titleId}>
  <div class="v3-plate__inner container">
    <header class="v3-plate__head">
      <p class="v3-eyebrow">
        <span class="v3-plate__count">{counter(index, total)}</span>
        <span aria-hidden="true"> · </span>
        <span>{def.label}</span>
      </p>
      <h2 id={titleId} class="v3-plate__title" data-split>{name}</h2>
    </header>

    <div class="v3-plate__peak">
      {d.result ? (
        <p class="v3-result">
          <span class="v3-result__value" data-count>{d.result.value}</span>
          <span class="v3-result__label">{d.result.label}</span>
          <span class="v3-result__source">Source: {d.result.source}</span>
        </p>
      ) : (
        <p class="v3-plate__brief" data-split>{d.brief ?? d.summary}</p>
      )}
    </div>

    <figure class="v3-plate__frame" data-frame>
      <Image
        class:list={['v3-plate__img', d.coverDark && 'v3-plate__img--light']}
        src={d.cover}
        alt={d.coverAlt}
        widths={[640, 960, 1440]}
        sizes="(min-width: 64rem) 55vw, 90vw"
        loading={index === 0 ? 'eager' : 'lazy'}
        decoding="async"
        data-parallax
      />
      {d.coverDark && (
        <Image
          class="v3-plate__img v3-plate__img--dark"
          src={d.coverDark}
          alt={d.coverAlt}
          widths={[640, 960, 1440]}
          sizes="(min-width: 64rem) 55vw, 90vw"
          loading="lazy"
          decoding="async"
          data-parallax
        />
      )}
    </figure>

    <div class="v3-plate__links">
      <a class="v3-link" href={href(`/work/${featured.entry.id}/`)}>
        Read the case<span class="visually-hidden">: {name}</span>
        <span aria-hidden="true">→</span>
      </a>
      {showAll && (
        <a class="v3-link" href={href(def.all.href)}>
          {def.all.label} <span aria-hidden="true">→</span>
        </a>
      )}
    </div>

    {more.length > 0 && (
      <div class="v3-more">
        <h3 class="v3-more__title">{def.more}</h3>
        <ul class="v3-more__list" role="list" data-more>
          {more.map((m) => (
            <li>
              <a class="v3-more__item" href={href(`/work/${m.entry.id}/`)}>
                <Image src={m.entry.data.cover} alt="" widths={[320, 480]} sizes="12rem" loading="lazy" decoding="async" />
                <span>{m.entry.data.shortTitle ?? m.entry.data.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
</article>

<style>
  .v3-plate {
    --plate-dim: 0;
    position: sticky;
    inset-block-start: min(var(--header-height, 4.5rem), 100svh - var(--plate-h, 100svh));
    min-block-size: calc(100svh - var(--header-height, 4.5rem));
    margin-inline: var(--gutter);
    display: grid;
    align-items: center;
    background: var(--bg-2);
    border: 1px solid var(--border);
    border-block-end: 0;
    border-radius: var(--radius-l) var(--radius-l) 0 0;
    transform-origin: 50% 0;
    /* A covered plate dims to text-dim. Both ends pass AA on bg-2
       (tests/unit/contrast.test.ts), so every point between does. */
    color: color-mix(in srgb, var(--text-dim) calc(var(--plate-dim) * 100%), var(--text));
  }

  .v3-plate + :global(.v3-plate) {
    margin-block-start: var(--space-xl);
  }

  @media (prefers-reduced-motion: reduce) {
    .v3-plate {
      position: relative;
      inset-block-start: auto;
    }
  }

  .v3-plate__inner {
    display: grid;
    gap: var(--space-m);
    padding-block: var(--space-xl);
  }

  @media (min-width: 64rem) {
    .v3-plate__inner {
      grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
      grid-template-areas:
        'head  frame'
        'peak  frame'
        'links frame'
        'more  more';
      column-gap: var(--space-xl);
      align-items: center;
    }
    .v3-plate__head { grid-area: head; }
    .v3-plate__peak { grid-area: peak; }
    .v3-plate__links { grid-area: links; }
    .v3-plate__frame { grid-area: frame; }
    .v3-more { grid-area: more; }
  }

  .v3-plate__title {
    font-size: var(--step-section);
    margin: var(--space-2xs) 0 0;
  }

  .v3-plate__brief {
    font-family: var(--font-display);
    font-style: italic;
    font-size: var(--step-4);
    line-height: var(--leading-snug);
    margin: 0;
    max-inline-size: 22ch;
  }

  .v3-result {
    display: grid;
    gap: var(--space-3xs);
    margin: 0;
  }

  .v3-result__value {
    font-size: var(--step-7);
    font-weight: var(--weight-h1);
    letter-spacing: var(--tracking-h1);
    color: var(--accent);
    font-variant-numeric: tabular-nums;
  }

  .v3-result__source {
    font-size: var(--step--1);
    color: var(--text-dim);
  }

  /* The frame is its own surface, so covers with baked-in light grounds read
     as mounted artwork rather than as a broken edge. */
  .v3-plate__frame {
    margin: 0;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    border-radius: var(--radius-l);
    background: var(--bg-3);
  }

  .v3-plate__img {
    inline-size: 100%;
    block-size: 100%;
    object-fit: contain;
    scale: 1.1;
  }

  .v3-plate__img--dark {
    display: none;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) .v3-plate__img--light { display: none; }
    :root:not([data-theme='light']) .v3-plate__img--dark { display: block; }
  }
  :root[data-theme='dark'] .v3-plate__img--light { display: none; }
  :root[data-theme='dark'] .v3-plate__img--dark { display: block; }

  .v3-plate__links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-m);
  }

  .v3-more__title {
    font-size: var(--step-1);
    margin: var(--space-m) 0 var(--space-s);
  }

  .v3-more__list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
    gap: var(--space-m);
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .v3-more__item {
    display: grid;
    gap: var(--space-2xs);
    text-decoration: none;
  }

  .v3-more__item img {
    aspect-ratio: 4 / 3;
    object-fit: contain;
    background: var(--bg-3);
    border-radius: var(--radius-m);
  }
</style>

<script>
  /* Publish each plate's height for the tall-plate rule. offsetHeight ignores
     transforms, so GSAP's scale on a covered plate does not feed back here. */
  const ro = new ResizeObserver((entries) => {
    for (const e of entries) {
      const el = e.target as HTMLElement;
      el.style.setProperty('--plate-h', `${el.offsetHeight}px`);
    }
  });
  document.querySelectorAll<HTMLElement>('[data-plate]').forEach((p) => ro.observe(p));
</script>
```

- [ ] **Step 4: Render the chapters in `src/pages/v3/index.astro`.** Replace the whole file with:

```astro
---
/* ============================================================================
   /v3 — the one-page scroll portfolio (noindex until promoted).
   Spec: docs/superpowers/specs/2026-09-22-v3-scroll-portfolio-design.md
   ========================================================================= */
import { getCollection } from 'astro:content';
import V3Layout from '../../layouts/V3Layout.astro';
import Open from '../../components/v3/Open.astro';
import Brief from '../../components/v3/Brief.astro';
import Chapter from '../../components/v3/Chapter.astro';
import Contact from '../../components/v3/Contact.astro';
import { V3_CHAPTERS } from '../../config/v3';
import { buildChapters } from '../../lib/chapters';

const entries = await getCollection('work', ({ data }) => !data.draft);
const chapters = buildChapters(
  V3_CHAPTERS,
  entries.map((entry) => ({
    id: entry.id,
    cats: entry.data.cats,
    showcase: entry.data.showcase,
    order: entry.data.order,
    title: entry.data.title,
    entry,
  })),
);
---

<V3Layout>
  <Open />
  <Brief />
  <section id="work" class="v3-work" aria-label="Selected work">
    {chapters.map((chapter, index) => (
      <Chapter chapter={chapter} index={index} total={chapters.length} />
    ))}
  </section>
  <Contact />
</V3Layout>
```

- [ ] **Step 5: Run the tests to confirm they pass**

Run: `npm run test:build`
Expected: PASS, 15 tests. Then `npm test` passes and `npx astro check` shows `0 errors`.

- [ ] **Step 6: Commit**

```bash
git add tests/build/v3-build.test.ts src/components/v3/Chapter.astro src/pages/v3/index.astro
git commit -F - <<'EOF'
Stack v3's discipline chapters as sticky plates

Web, social, then logo, each a full-height plate the next one slides over,
using plain CSS sticky so scrolling stays the visitor's. A plate taller than
the viewport bottom-aligns instead of being covered unseen. The More row
and See all links appear only when there is more to show.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 7: `/work?cat=` deep links

**Files:**
- Modify: `src/components/WorkGrid.astro:405-407` (the click listener loop, inside the existing `<script>`)

**Interfaces:**
- Consumes: the existing `apply(filter: string)` and `buttons` in WorkGrid's script.
- Produces: `/work/?cat=<key>` opens pre-filtered; clicking a filter rewrites `?cat=` via `history.replaceState`.

- [ ] **Step 1: Replace the listener loop.** In `src/components/WorkGrid.astro`, replace

```ts
    for (const b of buttons) {
      b.addEventListener('click', () => apply(b.dataset.filter || 'all'));
    }
```

with

```ts
    /* Deep links: /work/?cat=logo opens filtered, and every choice is written
       back to the URL so a filtered view can be shared. replaceState, not
       pushState: a filter is a view of this page, not a new history entry.
       Unknown keys are ignored rather than showing an empty grid, since the
       buttons only exist for categories that actually have work. */
    const keys = new Set(buttons.map((b) => b.dataset.filter));
    const writeUrl = (filter: string) => {
      const url = new URL(window.location.href);
      if (filter === 'all') url.searchParams.delete('cat');
      else url.searchParams.set('cat', filter);
      history.replaceState(history.state, '', url);
    };

    for (const b of buttons) {
      b.addEventListener('click', () => {
        const filter = b.dataset.filter || 'all';
        apply(filter);
        writeUrl(filter);
      });
    }

    const initial = new URLSearchParams(window.location.search).get('cat');
    if (initial && keys.has(initial)) apply(initial);
```

- [ ] **Step 2: Type-check and build**

Run: `npx astro check && npm run test:build`
Expected: `0 errors`; all build tests pass.

- [ ] **Step 3: Verify in the browser.** Start the dev server through the Browser pane (`preview_start` with the project's dev configuration; create `.claude/launch.json` with `npm run dev` on port 4321 if none exists). Navigate to `http://localhost:4321/MyPortfolio2/work/?cat=logo`, then run in `javascript_tool`:

```js
[...document.querySelectorAll('[data-filter]')].map(b => [b.dataset.filter, b.getAttribute('aria-pressed')])
```

Expected: `logo` is `"true"` and every other filter is `"false"`. Click the `web` chip, then read `location.search`. Expected: `"?cat=web"`. Navigate to `?cat=nonsense`. Expected: `all` stays pressed.

- [ ] **Step 4: Commit**

```bash
git add src/components/WorkGrid.astro
git commit -F - <<'EOF'
Let /work open pre-filtered from a ?cat= link

v3's "See all logo work" links land on the right filter, and choosing a
filter updates the URL so a filtered view can be shared. Unknown keys
fall back to showing everything.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 8: Scroll choreography (GSAP)

**Files:**
- Modify: `package.json` / `package-lock.json` (add `gsap`)
- Create: `src/scripts/v3-motion.ts`
- Modify: `src/layouts/V3Layout.astro` (import the module in the existing `<script>`)

**Interfaces:**
- Consumes: `motionReduced(): boolean` and `onMotionChange(handler: (reduced: boolean) => void): void` from `src/scripts/motion.ts`; the DOM hooks from Tasks 5–6 (`[data-intro]`, `[data-cue]`, `[data-ink]`, `[data-count]`, `[data-split]`, `[data-portrait]`, `[data-plate]`, `[data-frame]`, `[data-parallax]`, `[data-more]`); the classes `.v3-word`, `.v3-count-host`, `.v3-count`; the custom properties `--ink`, `--plate-dim`, `--header-height`.
- Produces: nothing downstream. It is a leaf.

- [ ] **Step 1: Install GSAP**

Run: `npm install gsap@^3.15.0`
Expected: `package.json` gains `"gsap": "^3.15.0"` under `dependencies`.

- [ ] **Step 2: Create `src/scripts/v3-motion.ts`**

```ts
/* ============================================================================
   v3-motion.ts — every GSAP call on /v3, in one place.
   ----------------------------------------------------------------------------
   CONTRACT
   - Decorates a page that is already complete. Every start state is set here,
     at runtime, so if this bundle never runs the page is simply static. The one
     exception, the Open h1, is hidden by html.v3-intro with a 2 s failsafe.
   - Exits under reduced motion (motion.ts is the single answer) and tears down
     or rebuilds live when that preference changes.
   - Animates transform, opacity, clip-path and two custom properties (--ink,
     --plate-dim) that CSS turns into colour. Nothing loops, so WCAG 2.2.2 does
     not apply. Scrolling is never altered: no smooth scroll, no pinning.
   ========================================================================= */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { motionReduced, onMotionChange } from './motion';

gsap.registerPlugin(ScrollTrigger, SplitText);

const root = document.documentElement;
const EASE = 'expo.out';

let ctx: gsap.Context | null = null;
let splits: SplitText[] = [];
let cleanups: Array<() => void> = [];

const endIntro = () => root.classList.remove('v3-intro');
const headerPx = () =>
  parseFloat(getComputedStyle(root).getPropertyValue('--header-height')) || 72;

/** Lines rise out of a mask. Used by the Open h1 (on load) and by headings. */
function riseLines(el: HTMLElement, onLoad: boolean): void {
  splits.push(
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit(self) {
        if (onLoad) endIntro();
        return gsap.from(self.lines, {
          yPercent: 100,
          duration: 0.9,
          ease: EASE,
          stagger: 0.08,
          ...(onLoad ? {} : { scrollTrigger: { trigger: el, start: 'top 85%', once: true } }),
        });
      },
    }),
  );
}

function intro(): void {
  const title = document.querySelector<HTMLElement>('[data-intro]');
  if (!title) return endIntro();
  riseLines(title, true);
  const cue = document.querySelector<HTMLElement>('[data-cue]');
  if (cue) gsap.from(cue, { autoAlpha: 0, delay: 0.9, duration: 0.6 });
}

function inkIn(): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-ink]')) {
    splits.push(
      SplitText.create(el, {
        type: 'words',
        wordsClass: 'v3-word',
        autoSplit: true,
        onSplit(self) {
          return gsap.fromTo(
            self.words,
            { '--ink': 0 },
            {
              '--ink': 1,
              ease: 'none',
              stagger: 0.1,
              scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
            },
          );
        },
      }),
    );
  }
}

function counts(): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-count]')) {
    const m = /^(\D*)(\d+(?:\.\d+)?)(.*)$/.exec(el.textContent?.trim() ?? '');
    if (!m) continue;
    const [, pre = '', num = '0', post = ''] = m;
    const target = parseFloat(num);
    const decimals = num.split('.')[1]?.length ?? 0;

    const overlay = document.createElement('span');
    overlay.className = 'v3-count';
    overlay.setAttribute('aria-hidden', 'true');
    el.classList.add('v3-count-host');
    el.append(overlay);
    cleanups.push(() => {
      overlay.remove();
      el.classList.remove('v3-count-host');
    });

    const state = { v: 0 };
    const render = () => {
      overlay.textContent = `${pre}${state.v.toFixed(decimals)}${post}`;
    };
    render();
    gsap.to(state, {
      v: target,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: render,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  }
}

function portrait(): void {
  const img = document.querySelector<HTMLElement>('[data-portrait]');
  if (!img) return;
  gsap.fromTo(
    img,
    { yPercent: -4 },
    {
      yPercent: 4,
      ease: 'none',
      scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true },
    },
  );
}

function plates(): void {
  const all = gsap.utils.toArray<HTMLElement>('[data-plate]');
  all.forEach((plate, i) => {
    const frame = plate.querySelector<HTMLElement>('[data-frame]');
    if (frame) {
      gsap.fromTo(
        frame,
        { clipPath: 'inset(12% 12% round 10px)' },
        {
          clipPath: 'inset(0% 0% round 10px)',
          ease: 'none',
          scrollTrigger: { trigger: plate, start: 'top bottom', end: 'top 30%', scrub: true },
        },
      );
    }

    for (const img of plate.querySelectorAll<HTMLElement>('[data-parallax]')) {
      gsap.fromTo(
        img,
        { yPercent: -5 },
        {
          yPercent: 5,
          ease: 'none',
          scrollTrigger: { trigger: plate, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    }

    const more = plate.querySelectorAll<HTMLElement>('[data-more] > li');
    if (more.length) {
      gsap.from(more, {
        y: 24,
        autoAlpha: 0,
        duration: 0.6,
        ease: EASE,
        stagger: 0.08,
        scrollTrigger: { trigger: more[0], start: 'top 90%', once: true },
      });
    }

    const next = all[i + 1];
    if (next) {
      gsap.to(plate, {
        scale: 0.94,
        '--plate-dim': 1,
        ease: 'none',
        scrollTrigger: {
          trigger: next,
          start: 'top bottom',
          end: () => `top ${headerPx()}px`,
          scrub: true,
        },
      });
    }
  });
}

function build(): void {
  if (ctx) return;
  ctx = gsap.context(() => {
    intro();
    inkIn();
    counts();
    portrait();
    plates();
    for (const el of document.querySelectorAll<HTMLElement>('[data-split]')) riseLines(el, false);
  });
}

function teardown(): void {
  for (const s of splits) s.revert();
  splits = [];
  for (const c of cleanups) c();
  cleanups = [];
  ctx?.revert();
  ctx = null;
  endIntro();
}

function start(): void {
  if (motionReduced()) return endIntro();
  build();
}

/* Split after the brand fonts load, so line breaks match the rendered face.
   The 2 s failsafe in V3Layout covers a font that never arrives. */
document.fonts.ready.then(start);

onMotionChange((reduced) => {
  if (reduced) teardown();
  else build();
  ScrollTrigger.refresh();
});

/* Print is a static medium: never print mid-reveal. */
window.addEventListener('beforeprint', teardown);
window.addEventListener('afterprint', () => {
  if (!motionReduced()) build();
});
```

- [ ] **Step 3: Load it from the layout.** In `src/layouts/V3Layout.astro`'s bottom `<script>`, add as the first line after the `theme` import:

```ts
      import '../scripts/v3-motion';
```

- [ ] **Step 4: Type-check, test and build**

Run: `npx astro check && npm test && npm run test:build`
Expected: `0 errors`, all unit tests pass, all 15 build tests pass. (Nothing in the build HTML changes: motion is runtime-only, which is the point.)

- [ ] **Step 5: Verify in the Browser pane** (it must be *visible*: a hidden pane starves requestAnimationFrame and scroll events. Check `document.visibilityState === 'visible'` before trusting anything.) Open `http://localhost:4321/MyPortfolio2/v3/`.
  1. Confirm the h1 lines rise once on load and `document.documentElement.classList.contains('v3-intro')` is `false` afterwards.
  2. Run the SplitText ARIA check in `javascript_tool`:
     `const h = document.querySelector('[data-intro]'); [h.getAttribute('aria-label'), h.querySelector('[aria-hidden="true"]') !== null]`
     Expected: the full headline text, then `true`. If `aria-label` is null, add `aria: 'auto'` explicitly to each `SplitText.create` call and re-check.
  3. Scroll through the page with `computer` scroll actions and screenshot the Brief (words inking in), a plate mid-cover (the covered plate scaled and dimmed), and a cover mid-un-crop.
  4. `read_console_messages` with `onlyErrors: true`. Expected: none.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/scripts/v3-motion.ts src/layouts/V3Layout.astro
git commit -F - <<'EOF'
Choreograph /v3 with GSAP ScrollTrigger and SplitText

Masked line reveals, Brief words that ink in with scroll, counters that
keep the real value in the accessibility tree, covers that un-crop, and
plates that recede as the next one arrives. It decorates a complete page,
exits under reduced motion, and tears itself down for print.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 9: The copy deck and case-study questionnaire

**Files:**
- Create: `docs/copy/v3-copy-deck.md`

**Interfaces:**
- Consumes: the strings written in Tasks 2, 3, 5, 6 and 8.
- Produces: the approval record that Phase C's promotion gate checks (every row `approved`).

- [ ] **Step 1: Create `docs/copy/v3-copy-deck.md`**

```markdown
# v3 copy deck

Every visible string on `/v3`, where it lives, and whether Jayson has approved
it. **Promotion to `/` (Phase C) requires every row to be `approved`.** To
change a line, edit it here, then in the file listed, and flip its status.

Voice: the Devsign8 register. Confident, plain, no hype adjectives. Every line
does one job: headlines state a position, briefs state a problem, and CTAs name
what happens next.

## Page copy

| ID | Where | Copy | Status |
|---|---|---|---|
| open.eyebrow | `src/components/v3/Open.astro` | Jayson Mercado Erboila · Digital Marketing Specialist & Designer · Toronto *(from site.ts)* | draft |
| open.h1 | `src/components/v3/Open.astro` | Marketing strategy / *and the design to carry it* | draft |
| brief.text | `src/components/v3/Brief.astro` | I'm Jayson Mercado Erboila, a Digital Marketing Specialist and designer in Toronto. From marketing strategy and SEO to pixel-perfect logos and digital interfaces, I work where strategy meets aesthetics. With 5+ years across industries, I bring ideas to life through thoughtful, intentional design. | draft (trimmed from v1 About; first sentence is answer-first) |
| brief.stats | `src/components/v3/Brief.astro` | 40+ Projects · 5+ Years · 20+ Clients *(from v1)* | draft (please confirm still accurate) |
| chapter.web.label | `src/config/v3.ts` | Web & growth | draft |
| chapter.social.label | `src/config/v3.ts` | Social media | draft |
| chapter.logo.label | `src/config/v3.ts` | Logo & identity | draft |
| chapter.link | `src/components/v3/Chapter.astro` | Read the case → | draft |
| chapter.social.all | `src/config/v3.ts` | See all posts → | draft |
| contact.h2 | `src/components/v3/Contact.astro` | Let's build the *next one.* | draft |
| contact.button | `src/components/v3/Contact.astro` | Email {address} | draft (address still pending: jmerboila@gmail.com vs hello.devsign8@gmail.com) |

## Chapter briefs (`brief` in each work entry's frontmatter)

| Entry | Brief | Status |
|---|---|---|
| devsign8-website | *(none yet: the chapter shows `summary` until the questionnaire is answered)* | waiting on questionnaire |
| mustang-gtd | Four Instagram panels that had to read as one unbroken frame. | draft |
| digiskills-logo | A digital-safety app for kids needed a mark that felt like play. | draft |
| devsign8 *(queued, not showcased)* | A studio name that had to say design and development in one word. | draft |
| jm-design *(queued, not showcased)* | A personal monogram that carries both letters in a single stroke. | draft |

## Case-study questionnaire

Answer in plain sentences; the case-study copy is written from your answers
and comes back here for approval. Nothing is filled in without them.

### devsign8.com
1. Did you design and build the site yourself? Which parts, if not all?
2. What is it built with (platform or framework, hosting)?
3. When did it launch, and has it been redesigned since?
4. What was the site for: leads, credibility, showcasing templates, something else?
5. What did you do to get it found: SEO, content, social, ads?
6. What changed after launch? (This is where the analytics exports come in: GA4 users, engagement, key events, Search Console clicks.)

### Mustang GTD
1. Was this ever posted? If so, on which account and when?
2. Why this car, and what was the goal of the concept?
3. Any post insights (reach, saves, shares, views)?

### DigiSkills Logo
1. Who was the client, and may they be named?
2. What year, and what was your role (sole designer, part of a team)?
3. What was the brief, in the client's words if you have them?
4. Was the logo adopted, and where is it used?
```

- [ ] **Step 2: Commit**

```bash
git add docs/copy/v3-copy-deck.md
git commit -F - <<'EOF'
Add the v3 copy deck and case-study questionnaire

Every visible line on /v3 with its file and approval status, so the
writing can be reviewed as a work sample and promotion can require it
all approved. The questionnaire collects the facts the case studies need
instead of inventing them.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 10: Verification pass (spec §6)

**Files:** none created. Fix anything found in the file it belongs to, then commit that fix with its own message.

- [ ] **Step 1: The automated gates**

Run: `npx astro check && npm test && npm run test:build`
Expected: `0 errors`; every unit and build test passes.

- [ ] **Step 2: Layout at three widths, both themes.** In the Browser pane at `/MyPortfolio2/v3/`, use `resize_window` at 375 × 667, 768 × 1024 and 1440 × 900, each with `colorScheme: 'light'` then `'dark'`. At each size, screenshot the Open, the Brief and one plate. Check that nothing overflows horizontally (`document.documentElement.scrollWidth <= innerWidth`), the header does not wrap, and the portrait's silhouette is visible in dark. Reset with `preset: 'desktop'` when done.

- [ ] **Step 3: Tall-plate rule at 375 × 667.** For each plate, run:
  `[...document.querySelectorAll('[data-plate]')].map(p => [p.offsetHeight, getComputedStyle(p).top])`
  Expected: any plate taller than `innerHeight` has a negative `top` (bottom-anchored).

- [ ] **Step 4: Reduced motion.** Emulate it through the chrome-devtools MCP (`emulate` with `prefers-reduced-motion: reduce`), or with the OS setting. Reload. Expected: the plates are `position: relative`, all words are at full ink, the stats show their values with no `.v3-count` overlay, and `html` has no `v3-intro` class.

- [ ] **Step 5: JavaScript disabled.** Serve the built site (`npx astro preview`) and fetch `http://localhost:4321/MyPortfolio2/v3/` with `curl -s`. Confirm the headline, Brief text, all three chapter titles and briefs, and the contact email are present in the HTML. Separately confirm there is no CSS rule hiding content outside `html.v3-intro`: `grep -n "visibility: hidden\|opacity: 0" src/styles/v3.css src/components/v3/*.astro` should show only the `html.v3-intro [data-intro]` rule.

- [ ] **Step 6: Keyboard and 2.4.11.** From the top of the page, Tab through every link. At each focus, run
  `const r = document.activeElement.getBoundingClientRect(); document.elementFromPoint(r.left + 2, r.top + 2) === document.activeElement || document.activeElement.contains(document.elementFromPoint(r.left + 2, r.top + 2))`
  Expected: `true` for every focused element (it is not covered by a later plate or the sticky header). If any is false, add to `src/styles/v3.css`:
  `html.v3 { scroll-padding-block-start: calc(var(--header-height, 4.5rem) + 1rem); }` and, if a later plate still covers it, a `focusin` listener in Chapter.astro's script that scrolls the focused element's plate to its start. Then re-run.

- [ ] **Step 7: JS weight.** After `astro build`, list the page's scripts and sizes:
  `grep -o 'src="[^"]*\.js"' dist/v3/index.html` then `gzip -c dist/<each> | wc -c`.
  Report the total gzipped JS for `/v3` in the final summary (the research puts GSAP core alone at ~27 kB gzip; the number is reported, not assumed).

- [ ] **Step 8: Record the outcome in memory.** Update `portfolio-v3-scroll-direction.md` in the memory directory: Phase A done (with the commit range), the measured JS weight, any trap hit during verification, and what is still open (copy approvals, questionnaire, Phases B and C).
