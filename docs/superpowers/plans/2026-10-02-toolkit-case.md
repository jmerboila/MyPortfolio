# Safe-Zone Toolkit Product Case Study Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the toolkit's launch story with a seven-section product case study led by an interactive safe-zone viewer.

**Architecture:** One data module (`src/config/ig-safe-zones.ts`) feeds both the viewer and the spec table. `ToolkitCase.astro` renders sections 01 to 07 from a new `toolkit` content block; the slug page renders it instead of the story for this entry only. The viewer is server-rendered (all twelve formats in the markup, the Reel visible) and a small script switches formats.

**Tech Stack:** Astro 7, TypeScript, inline SVG, node:test.

**Spec:** `docs/superpowers/specs/2026-10-02-toolkit-case-design.md`

## Global Constraints

- Numbers come from `Devsign8-IG-Template.jsx` revision 3 only.
- No em dashes in content or UI copy; "studio", never "agency"; no visible dates.
- Light and dark: visuals with a ground show the version opposite the page theme (`:root[data-theme]`, else `prefers-color-scheme`).
- Keep `id="measure"` on section 07: the home page links to `#measure` and claims "14×" (84 vs 6 reached), so 07 must show both numbers.
- Reuse the ten Reel posts in `src/content/social/devsign8-ig-toolkit-reel/` unchanged, in `PostRow`.

---

### Task 1: Safe-zone data module

**Files:**
- Create: `src/config/ig-safe-zones.ts`
- Test: `tests/unit/ig-safe-zones.test.ts`

**Interfaces:**
- Produces: `SAFE_ZONES: SafeZoneFormat[]`, `safeArea(f): { w: number; h: number }`, `keepClear(f): string`, `DEFAULT_FORMAT = 'reel'`.

- [ ] **Step 1: Write the failing test** (`tests/unit/ig-safe-zones.test.ts`): twelve unique ids; safe areas equal the published table (story 950×1266, reel 885×978, ad 885×978, feed 3:4 840×1200, 4:5 840×1110, 1:1 750×840, landscape 380×446, carousel 840×1200, ad card 840×840, cover 885×978, highlight 720×720, profile 764×764); guides lie inside the canvas; each safe box fits its circle within 1 px; `keepClear` collapses equal margins to "120 each side".
- [ ] **Step 2:** `npm test` fails (module missing).
- [ ] **Step 3:** Write the module from the jsx PRESETS (notes reworded without em dashes).
- [ ] **Step 4:** `npm test` passes.
- [ ] **Step 5:** Commit.

### Task 2: SafeZoneViewer

**Files:**
- Create: `src/components/social/SafeZoneViewer.astro`, `src/scripts/safe-zone-viewer.ts`

**Interfaces:**
- Consumes: Task 1 exports.
- Produces: `<SafeZoneViewer />` (no props). Markup contract used by tests: `[data-szv]` root, twelve `button[role="radio"][data-szv-id]`, twelve `svg[data-szv-format]` (all but the default `hidden`), a `[data-szv-caption]` live region.

- [ ] **Step 1:** Component: radio group of twelve buttons (grouped 9:16, Feed, Carousel, Profile); one SVG per format at its viewBox: canvas rect, danger zones as an even-odd path (canvas minus safe rect) tinted violet, safe rect outlined, dashed guide lines, the visible circle where there is one, and the safe size in the centre. Caption: name, safe area, keep-clear margins, note. Theme: CSS custom properties, dark canvas on the light page and light canvas on the dark page.
- [ ] **Step 2:** Script: click or arrow keys select a format (roving tabindex), toggle `hidden` on the SVGs, update `aria-checked` and the caption.
- [ ] **Step 3:** Commit with Task 3 (it is only reachable through the page).

### Task 3: The toolkit page

**Files:**
- Create: `src/components/social/ToolkitCase.astro`, `public/media/toolkit/reel-hook-{light,dark}.mp4` + `.webp` posters, `tests/build/toolkit-case.test.ts`
- Modify: `src/content.config.ts` (a `toolkit` block), `src/content/work/devsign8-ig-safe-zone-toolkit.md` (`story` replaced by `toolkit`), `src/pages/work/[type]/[slug].astro` (render ToolkitCase; fetch posts for it), `tests/build/toolkit-story.test.ts` (retire the story assertions)

**Interfaces:**
- Consumes: `SafeZoneViewer`, `SAFE_ZONES`, `safeArea`, `keepClear`, `PostRow`, `ThemeImage`.
- Produces: `toolkit` schema; sections with `id="tk-h-0N"` headings and `<span class="tk-num">0N</span>`; section 07 `id="measure"`.

- [ ] **Step 1: Write the failing build test** (`tests/build/toolkit-case.test.ts`): sections 01 to 07 in order; viewer with twelve radios and the Reel SVG not hidden; ten `data-sp-video` in section 05; the hook video in light and dark; `id="measure"` with 326, 374, 84 and 6; the spec table cells; no em dash, no "agency".
- [ ] **Step 2:** Copy and strip audio from the two hook videos; make posters at 1.5 s.
- [ ] **Step 3:** Schema, content, component, slug wiring.
- [ ] **Step 4:** `npx astro check`, `npm run test:build`, `npm test` all pass.
- [ ] **Step 5:** Check the page in the browser in both themes and at 390 px; commit.
