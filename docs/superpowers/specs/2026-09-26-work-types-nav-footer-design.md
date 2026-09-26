# Work by type, Work in the nav, new footer

Date: 2026-09-26. Branch: `feat/toolkit-story` (continues from the toolkit story).
Status: design approved in chat; this file records it.

## Goal

Social becomes one type of work, next to Logo and Web. Every project lives at
`/work/<type>/<project>/`, and the site finally links to its work: a Work link
in the top nav, a Work menu in the footer, and a link on the Show up stage.

## Decisions

1. **Every project moves under its type**, not only the social ones. The type is
   the first entry in the project's `cats` list (already typed as a
   `WorkCategory`, so it is always a real type).
2. **Three types are live:** Logo, Web, Social. No Mobile page.
3. **DigiSkills app (`digiskills`) is hidden** with `draft: true`. The file stays
   so it can come back later. The DigiSkills App Logo stays under Logo.
4. **Orange Magazine is removed**: both `orange-magazine.md` and
   `orange-magazine-logo.md`, plus their four images in `src/assets/projects/`.
   Git history keeps them.
5. **Shelf labels:** the Mustang's `category` becomes "Launch campaign", the
   Toolkit's becomes "Content series".
6. **Show up stage link:** "See all my social media work →", under the Mustang
   card, to `/work/social/`.

## URLs

| Page | URL | Source |
|---|---|---|
| All work | `/work/` | `src/pages/work/index.astro` (unchanged grid) |
| Social | `/work/social/` | `src/pages/work/social/index.astro` (today's `/social/` page, moved) |
| Logo, Web | `/work/logo/`, `/work/web/` | `src/pages/work/[type]/index.astro`, the work grid showing only that type, no filter buttons |
| A project | `/work/<type>/<project>/` | `src/pages/work/[type]/[slug].astro` (today's `[slug].astro`, moved) |

The live projects end up at:

- `/work/social/2026-ford-mustang-gtd/`
- `/work/social/devsign8-ig-safe-zone-toolkit/`
- `/work/web/devsign8-website/`
- `/work/logo/devsign8/`, `/work/logo/jm-design/`, `/work/logo/digiskills-logo/`

`[type]/index.astro` builds a page only for types that have at least one
visible project, other than Social (which has its own page). Today that is Logo
and Web.

**One helper builds every project URL:** `projectPath(entry)` in
`src/lib/work-path.ts` returns `/work/<cats[0]>/<id>/`. Stage cards, the work grid,
the shelf "Read the story" link, prev/next links, JSON-LD `@id`s and the sitemap
all use it, so the pattern lives in one place.

## Old URLs keep working

Old URLs are a fixed, known set, so they are listed once in `astro.config.mjs`
`redirects` (a static meta refresh plus canonical, which is what GitHub Pages
allows). No new project will ever need an entry there.

- `/social/` → `/work/social/`
- `/work/<id>/` → the new URL, for each of the six live projects
- `/work/mustang-gtd/` and `/v3` → as today, pointing at the new targets directly
- `/work/digiskills/`, `/work/orange-magazine/`, `/work/orange-magazine-logo/` → `/work/`

The v1 stubs in `public/*.html` point straight at the final URL (one hop, not
two). `DigiSkills.html`, `OrangeMagazine.html` and `OrangeMagazine-Showcase.html`
point at `/work/`.

Redirect sources stay out of the sitemap.

## Breadcrumbs

- Project: Home / Work / Social / 2026 Ford Mustang GTD
- Type page: Home / Work / Social
- All work: Home / Work

## Top nav

A **Work** link to `/work/`, beside "Let's talk", in `SiteNav.astro`. It gets
`aria-current="page"` anywhere under `/work/`. The old `SiteHeader.astro` (used
only by the 404 page) drops its separate Social link, since Social now sits
under Work.

## Footer

Two rows in `V3Layout.astro`:

- **Top row:** the JM Design mark (`JMMark`), larger, on the left, linking
  home. On the right, a small nav labelled "Work": **Work** (to `/work/`),
  then Logo · Web · Social.
- **Bottom row:** the © line and the social icons, exactly as they are now.

The type links come from the same list that builds the type pages (types with
a visible project, in `WORK_CATEGORIES` order), so adding a type later needs no
footer edit. Labels come from `CATEGORY_LABELS`, where `social` changes from
"Social Media Creatives" to "Social" so the footer, the grid filter and the
breadcrumbs all say the same word. On phones the top row stacks, mark first.

## Testing

Build tests (`npm run test:build`) check:

- every new URL exists, and every old URL is a redirect to the right target
- Orange Magazine and the DigiSkills app are not built and not in the sitemap
- no `/work/mobile/` page
- the nav Work link, the footer links, and the Show up link point where they
  should
- breadcrumbs on a project page read Home / Work / Social / project
- the two shelf labels read "Launch campaign" and "Content series"

Existing tests move to the new paths. Then a headless Chrome check at phone and
laptop widths (nav, footer, Show up link, a project page), after clearing
`.astro/data-store.json`.

## Out of scope

Pushing to the live site (that waits for his OK), the Lexus and UNF projects,
"Jump to results", and restyling the `/work` grid.
