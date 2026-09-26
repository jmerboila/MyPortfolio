# Work by type, Work in the nav, new footer: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every project lives at `/work/<type>/<project>/`, Social moves to `/work/social/`, and the site links to its work from the nav, the footer and the Show up stage.

**Architecture:** One pure helper (`src/lib/work-path.ts`) owns the URL pattern and the list of live types; every link producer calls it. Routes move into `src/pages/work/[type]/`. Old URLs are a fixed set, listed once in `astro.config.mjs` `redirects`. The footer becomes its own component.

**Tech Stack:** Astro 5 static build, content collections (zod), node:test on `dist/`.

**Spec:** `docs/superpowers/specs/2026-09-26-work-types-nav-footer-design.md`

## Global Constraints

- No em dashes in anything he reads (site copy, labels, chat).
- The project name is exactly "2026 Ford Mustang GTD".
- Every internal link goes through `href()` (base path `/MyPortfolio`).
- Redirect targets in `astro.config.mjs` carry `${BASE_PATH}` (Astro prefixes the source, not the target).
- Never push without his OK; never force-push.
- After any schema/content move: delete `.astro/data-store.json` before `astro dev --background`.

---

### Task 1: URL helper and content changes

**Files:**
- Create: `src/lib/work-path.ts`, `tests/unit/work-path.test.ts`
- Modify: `src/content.config.ts` (`CATEGORY_LABELS.social`), `src/content/work/digiskills.md` (`draft: true`), `src/content/work/2026-ford-mustang-gtd.md` and `devsign8-ig-safe-zone-toolkit.md` (`category`)
- Delete: `src/content/work/orange-magazine.md`, `src/content/work/orange-magazine-logo.md`, `src/assets/projects/OrangeMagazine-{Full,Preview,Logo-Full,Logo-Preview}.webp`

**Interfaces:**
- Produces:
  - `workType(e: WorkLike): string` returns `e.data.cats[0]`
  - `projectPath(e: WorkLike): string` returns `/work/<type>/<id>/`
  - `typePath(type: string): string` returns `/work/<type>/`
  - `liveTypes<T extends string>(order: readonly T[], entries: WorkLike[]): T[]`: types that are some entry's primary type, in `order`
  - `WorkLike = { id: string; data: { cats: readonly string[] } }`

- [ ] **Step 1: failing unit test** `tests/unit/work-path.test.ts`

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { liveTypes, projectPath, typePath, workType } from '../../src/lib/work-path.ts';

const e = (id: string, ...cats: string[]) => ({ id, data: { cats } });

test('a project lives under its first type', () => {
  assert.equal(workType(e('x', 'social', 'web')), 'social');
  assert.equal(projectPath(e('2026-ford-mustang-gtd', 'social')), '/work/social/2026-ford-mustang-gtd/');
  assert.equal(typePath('logo'), '/work/logo/');
});

test('live types follow the canonical order and ignore secondary types', () => {
  const order = ['logo', 'graphic', 'web', 'mobile', 'social'] as const;
  const live = liveTypes(order, [e('a', 'social'), e('b', 'logo', 'mobile'), e('c', 'web')]);
  assert.deepEqual(live, ['logo', 'web', 'social']);
});
```

- [ ] **Step 2:** `npm test` fails (module missing).
- [ ] **Step 3:** write `src/lib/work-path.ts` (no imports, so plain `node --test` can load it):

```ts
export interface WorkLike {
  id: string;
  data: { cats: readonly string[] };
}
export const workType = (e: WorkLike): string => e.data.cats[0] ?? '';
export const typePath = (type: string): string => `/work/${type}/`;
export const projectPath = (e: WorkLike): string => `${typePath(workType(e))}${e.id}/`;
export function liveTypes<T extends string>(order: readonly T[], entries: WorkLike[]): T[] {
  return order.filter((t) => entries.some((e) => workType(e) === t));
}
```

- [ ] **Step 4:** content edits: `digiskills.md` gets `draft: true`; Mustang `category: "Launch campaign"`; toolkit `category: "Content series"`; `CATEGORY_LABELS.social = 'Social'`; delete the two Orange Magazine files and four images. `npm test` passes.
- [ ] **Step 5:** commit "Add the work URL helper; hide DigiSkills app, remove Orange Magazine".

### Task 2: Routes, redirects and every link producer

**Files:**
- Move: `src/pages/work/[slug].astro` to `src/pages/work/[type]/[slug].astro`; `src/pages/social/index.astro` to `src/pages/work/social/index.astro`
- Create: `src/pages/work/[type]/index.astro`
- Modify: `src/components/v3/Stage.astro`, `src/components/WorkGrid.astro` (`type?` prop, link), `src/config/social.ts` (`storyPath`), `src/pages/work/index.astro` (JSON-LD urls), `astro.config.mjs` (redirects, sitemap filter), `public/*.html` (six stubs), `src/components/SiteHeader.astro` (drop Social link)
- Test: `tests/build/work-routes.test.ts` (new); update `v3-build`, `work-story`, `toolkit-story`, `social-build` paths

**Interfaces:**
- Consumes: `projectPath`, `typePath`, `liveTypes`, `workType` from Task 1.
- Produces: `WorkGrid` prop `type?: WorkCategory` (show only projects whose primary type is `type`, and no filter bar).

- [ ] **Step 1: failing build test** `tests/build/work-routes.test.ts`

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const LIVE: Record<string, string> = {
  '2026-ford-mustang-gtd': 'social',
  'devsign8-ig-safe-zone-toolkit': 'social',
  'devsign8-website': 'web',
  devsign8: 'logo',
  'jm-design': 'logo',
  'digiskills-logo': 'logo',
};
const redirectsTo = (from: string, to: string) =>
  assert.match(read(`dist/${from}index.html`), new RegExp(`url=/MyPortfolio/${to}"`), from);

test('every project is built under its type', () => {
  for (const [slug, type] of Object.entries(LIVE)) {
    assert.ok(existsSync(`dist/work/${type}/${slug}/index.html`), `${type}/${slug}`);
  }
});
test('type pages exist for Logo, Web and Social only', () => {
  for (const t of ['logo', 'web', 'social']) assert.ok(existsSync(`dist/work/${t}/index.html`), t);
  for (const t of ['mobile', 'graphic', 'marketing']) assert.ok(!existsSync(`dist/work/${t}/index.html`), t);
});
test('old project URLs redirect to the new ones', () => {
  for (const [slug, type] of Object.entries(LIVE)) redirectsTo(`work/${slug}/`, `work/${type}/${slug}/`);
  redirectsTo('social/', 'work/social/');
  redirectsTo('work/mustang-gtd/', 'work/social/2026-ford-mustang-gtd/');
  for (const gone of ['digiskills', 'orange-magazine', 'orange-magazine-logo']) redirectsTo(`work/${gone}/`, 'work/');
});
test('removed and hidden projects are not built or listed', () => {
  const map = read('dist/sitemap-0.xml');
  assert.ok(map.length > 0);
  assert.doesNotMatch(map, /orange-magazine|\/work\/digiskills\/|\/social\/<|\/work\/(?:mustang-gtd|2026-ford-mustang-gtd|devsign8|jm-design)\/</);
  assert.doesNotMatch(read('dist/work/index.html'), /Orange Magazine/);
});
test('a project page has the four-level breadcrumb', () => {
  const html = read('dist/work/social/2026-ford-mustang-gtd/index.html');
  const crumbs = /<nav class="v3-crumbs"[\s\S]*?<\/nav>/.exec(html)?.[0] ?? '';
  assert.match(crumbs, /href="\/MyPortfolio\/work\/"[^>]*>Work</);
  assert.match(crumbs, /href="\/MyPortfolio\/work\/social\/"[^>]*>Social</);
  assert.match(crumbs, /aria-current="page"[^>]*>2026 Ford Mustang GTD</);
});
test('shelf labels read Launch campaign and Content series', () => {
  const social = read('dist/work/social/index.html');
  assert.match(social, /01 · Launch campaign/);
  assert.match(social, /02 · Content series/);
});
```

- [ ] **Step 2:** `npm run test:build` fails on the new file.
- [ ] **Step 3:** `git mv` both pages; fix their relative imports (one level deeper: `../../../`).
  - In `[type]/[slug].astro`: `params: { type: workType(entry), slug: entry.id }`; `path={projectPath(entry)}`; JSON-LD `@id` from `projectPath`; prev/next hrefs via `projectPath`; breadcrumbs `Home / Work / <CATEGORY_LABELS[type]> (typePath) / title`.
  - In `work/social/index.astro`: `path="/work/social/"`, `@id` on `/work/social/`, breadcrumbs `Home / Work / Social`.
- [ ] **Step 4:** `[type]/index.astro`: `getStaticPaths` returns `liveTypes(WORK_CATEGORIES, entries).filter((t) => t !== 'social')`; renders heading `CATEGORY_LABELS[type]`, breadcrumbs `Home / Work / <label>`, `<WorkGrid type={type} />`, CollectionPage JSON-LD.
- [ ] **Step 5:** `WorkGrid`: new prop `type?: WorkCategory` filtering on `workType(e) === type`, and no filter bar when `type` is set; card link `href(projectPath(entry))`. `Stage.astro`, `work/index.astro`, `social.ts` `storyPath`: use `projectPath`.
- [ ] **Step 6:** `astro.config.mjs` redirects:

```js
redirects: {
  '/v3': `${BASE_PATH}/`,
  '/social': `${BASE_PATH}/work/social/`,
  '/work/mustang-gtd': `${BASE_PATH}/work/social/2026-ford-mustang-gtd/`,
  '/work/2026-ford-mustang-gtd': `${BASE_PATH}/work/social/2026-ford-mustang-gtd/`,
  '/work/devsign8-ig-safe-zone-toolkit': `${BASE_PATH}/work/social/devsign8-ig-safe-zone-toolkit/`,
  '/work/devsign8-website': `${BASE_PATH}/work/web/devsign8-website/`,
  '/work/devsign8': `${BASE_PATH}/work/logo/devsign8/`,
  '/work/jm-design': `${BASE_PATH}/work/logo/jm-design/`,
  '/work/digiskills-logo': `${BASE_PATH}/work/logo/digiskills-logo/`,
  '/work/digiskills': `${BASE_PATH}/work/`,
  '/work/orange-magazine': `${BASE_PATH}/work/`,
  '/work/orange-magazine-logo': `${BASE_PATH}/work/`,
},
```

  Sitemap filter: exclude any page whose path is one of those redirect sources (build the list from `Object.keys(redirects)`).
- [ ] **Step 7:** `public/` stubs point at final URLs: `Devsign8-Showcase.html` to `work/logo/devsign8/`, `DigiSkills-Showcase.html` to `work/logo/digiskills-logo/`, `JM-Showcase.html` to `work/logo/jm-design/`; `DigiSkills.html`, `OrangeMagazine.html`, `OrangeMagazine-Showcase.html` to `work/`. `SiteHeader.astro` drops `{ label: 'Social', ... }`.
- [ ] **Step 8:** update the old tests' paths (`dist/work/<type>/<slug>/`, `dist/work/social/index.html`, v1 stub map, stage links, story links). `npm test` and `npm run test:build` pass.
- [ ] **Step 9:** commit "Put every project under its type: /work/<type>/<project>/".

### Task 3: Work in the nav, and the Show up link

**Files:**
- Modify: `src/components/v3/SiteNav.astro`, `src/styles/v3.css`, `src/config/lifecycle.ts` (`more?` on Stage), `src/components/v3/Stage.astro`
- Test: `tests/build/work-routes.test.ts`

**Interfaces:**
- Produces: `Stage.more?: { label: string; path: string }`.

- [ ] **Step 1: failing tests** (append)

```ts
test('the header has a Work link on every page', () => {
  for (const p of ['dist/index.html', 'dist/work/social/index.html']) {
    const header = /<header class="v3-nav"[\s\S]*?<\/header>/.exec(read(p))?.[0] ?? '';
    assert.match(header, /<a class="v3-navlink"[^>]*href="\/MyPortfolio\/work\/"[^>]*>Work</, p);
  }
});
test('the Show up stage links to all the social work', () => {
  const home = read('dist/index.html');
  const stage = home.slice(home.indexOf('id="show-up"'), home.indexOf('id="measure"'));
  assert.match(stage, /href="\/MyPortfolio\/work\/social\/"[^>]*>\s*See all my social media work/);
});
```

- [ ] **Step 2:** fails.
- [ ] **Step 3:** SiteNav: `<a class="v3-navlink" href={href('/work/')} aria-current={...}>Work</a>` before "Let's talk". `aria-current` is `page` on `/work/` exactly, `true` under it. CSS `.v3-navlink`: 44px tap height, `padding-inline: 0.75rem`, dim text, full text on hover, focus, and `[aria-current]`.
- [ ] **Step 4:** lifecycle: `more?: { label: string; path: string }` on `Stage`; show-up gets `more: { label: 'See all my social media work', path: '/work/social/' }`. Stage.astro renders `<a class="v3-stage__more" href={href(more.path)}>{label} <span aria-hidden="true">→</span></a>` after the cards.
- [ ] **Step 5:** tests pass; commit "Add Work to the header and a social link on Show up".

### Task 4: The new footer

**Files:**
- Create: `src/components/v3/SiteFooter.astro`
- Modify: `src/layouts/V3Layout.astro` (use it), `src/styles/v3.css` (footer rules)
- Test: `tests/build/work-routes.test.ts`, existing footer tests in `v3-build.test.ts` keep passing

- [ ] **Step 1: failing test** (append)

```ts
test('the footer has the large mark and the Work menu', () => {
  const footer = /<footer[\s\S]*?<\/footer>/.exec(read('dist/index.html'))?.[0] ?? '';
  assert.match(footer, /class="v3-footer__brand"[^>]*href="\/MyPortfolio\/"/);
  const menu = /<nav class="v3-footer__nav"[\s\S]*?<\/nav>/.exec(footer)?.[0] ?? '';
  const links = [...menu.matchAll(/href="([^"]+)"[^>]*>([^<]+)</g)].map((m) => `${m[2].trim()} ${m[1]}`);
  assert.deepEqual(links, [
    'Work /MyPortfolio/work/',
    'Logo /MyPortfolio/work/logo/',
    'Web /MyPortfolio/work/web/',
    'Social /MyPortfolio/work/social/',
  ]);
});
```

- [ ] **Step 2:** fails.
- [ ] **Step 3:** `SiteFooter.astro`: reads the visible work, `liveTypes(WORK_CATEGORIES, entries)`, renders:

```astro
<footer class="v3-footer container">
  <div class="v3-footer__top">
    <a class="v3-footer__brand" href={href('/')}><JMMark class="v3-footer__jm" label={`${PERSON.name}, home`} /></a>
    <nav class="v3-footer__nav" aria-label="Work">
      <a class="v3-footer__head" href={href('/work/')}>Work</a>
      <ul role="list">{types.map((t) => <li><a href={href(typePath(t))}>{CATEGORY_LABELS[t]}</a></li>)}</ul>
    </nav>
  </div>
  <div class="v3-footer__bottom"><p>&copy; {year} {PERSON.name}</p><ul class="v3-footer__socials">...unchanged...</ul></div>
</footer>
```

  CSS: `.v3-footer` becomes a block; `__top` flex, space-between, align end, wraps (mark first on phones); mark `block-size: clamp(4rem, 3rem + 4vw, 6.5rem)`; `__bottom` keeps today's flex row, with a hairline above; the `.v3-footer > p` rule becomes `.v3-footer__bottom > p`. Nav links are 44px tall.
- [ ] **Step 4:** tests pass; commit "Footer: large JM mark and a Work menu".

### Task 5: Browser check, docs, memory

- [ ] Delete `.astro/data-store.json`, `astro dev --background`, headless Chrome at 375 and 1366 wide: home (nav, Show up link, footer), `/work/social/`, `/work/logo/`, a project page (breadcrumbs), `/social/` redirect.
- [ ] Update `docs/v3-todo.md` (resume note) and memory (`social-showcase-page.md`, `portfolio-deploy.md` URL notes).
- [ ] `npm test` and `npm run test:build` green; commit "Record the work-by-type restructure".
