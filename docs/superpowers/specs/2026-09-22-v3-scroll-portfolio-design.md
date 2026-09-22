# v3 — one-page scroll portfolio · design spec

**Date:** 2026-09-22 · **Status:** awaiting Jayson's review · **Route:** `/v3`

## 1. Goal

A single page that says who Jayson is in one short beat, then spends the rest
of the scroll on the work, one project at a time. It must feel choreographed
(text reveals, projects arriving in sequence, restrained parallax) without
taking scrolling away from the visitor.

**Success looks like:**
- A hiring manager gets name, position and every featured project in under three
  minutes of normal scrolling.
- Every word and image is in the server-rendered HTML and fully readable with
  JavaScript off, with reduced motion on, and in both themes.
- WCAG 2.2 AA holds everywhere, including text over the dot field.
- The layout shares nothing with v1 (hero / about / works grid / contact) or
  v2 (card grid + `/work` index).

## 2. Decisions already made

| Decision | Choice | Source |
|---|---|---|
| Keep from v2 | Mesh headshot, dot field, Devsign8 type (Inter Tight + Instrument Serif) | Jayson, 2026-09-22 |
| Palette | **Devsign8 purple**: `#5A3FE0` on paper (6.03:1), `#A98DFF` on night (7.43:1) | Jayson picked it over cobalt |
| Structure | Open → Brief → stacked project chapters → Contact | approved ("Let's proceed!") |
| Chapter peak | Real metric where one exists, otherwise a one-line brief | Jayson: "what you recommend" |
| Projects | **One chapter per discipline, one project each for now:** Web & growth (devsign8.com, new), Social media (Mustang GTD), Logo & identity (DigiSkills Logo). Counter "01 / 03" | Jayson: "1 each for now, then set it up where I can add more later". DigiSkills and Orange Magazine removed (*assumption: Orange Magazine Logo too*) |
| Extensibility | `showcase: <rank>` in frontmatter adds a project to its discipline's chapter; ranks 2+ form a "More" row of up to 3 | The page stays three chapters long, however much work is added |
| Order | Web → Social → Logo | The marketing-weighted work first. An earlier grouping idea was rejected only while it meant 3 logos vs 1 vs 1 |
| Engine | GSAP 3.15 + ScrollTrigger + SplitText (free standard licence) | CSS scroll-driven animations are not Baseline (MDN: "Limited availability"). Matches *Style and Motion — A 2026 Decision Guide*, case 4: "GSAP with ScrollTrigger, and nothing else" for pinned and scrubbed sections |
| Smooth scroll | **None.** Native scrolling. | NN/g scrolljacking study; the Decision Guide, case 5: add Lenis only when the scroll feel is itself the deliverable |
| Horizontal gallery | Rejected | Direction change is NN/g's worst case, and poor on touch |

*Note:* the two research reports in `docs/research/` disagree on Firefox's
scroll-driven animation support (one says 158+, the other says unsupported as
of September 2026). GSAP makes the question moot, so nothing here depends on
who is right.

## 3. Page, top to bottom

### 3.0 Open (one viewport, no scroll required)
- Eyebrow: `Jayson Mercado Erboila · Digital Marketing Specialist & Designer · Toronto`
- Headline (h1, `--step-hero`), with the serif accent on line two:
  **Marketing strategy / *and the design to carry it*** (reused from v2B; copy open to change).
- Typographic only: no portrait here. The dot field is the only image.
- **Motion:** a one-shot, load-time line reveal. SplitText splits the h1 into
  lines, and each line rises out of a mask (`yPercent: 100 → 0`, 900 ms,
  `--ease-out-expo`, 80 ms stagger). It is not tied to scroll, per NN/g's
  "nothing above the fold" rule. A small "Scroll" cue fades in last.

### 3.1 Brief (who he is, in about 15 seconds)
- Two-column on ≥ 64rem, stacked below. The mesh portrait
  (`jayson-mesh-portrait.webp`, one file for both themes) sits in one column,
  2–3 sentences in the other, then the stats `40+ Projects · 5+ Years · 20+ Clients`.
- Copy is taken verbatim from v1's About (see memory *v1-as-content-source*),
  trimmed to 2–3 sentences. **The trim needs Jayson's sign-off.**
- **Motion:**
  - *Words ink in.* Each word's colour is scrubbed from `--text-dim` to
    `--text` as the paragraph crosses the viewport. It animates **colour, not
    opacity**, so the starting state already passes AA (text-dim: 5.89:1 on
    paper, 7.77:1 on night). The text is never unreadable at any scroll position.
  - *Portrait parallax:* `yPercent` drifts about 8% inside its own frame (scrubbed).
  - *Stats* count up once on entry. The final values are the real text in the
    `<dl>`. The counting digits are an `aria-hidden` overlay, so assistive
    technology only ever reads "40+".
  - Portrait halo (`--mesh-halo`) is re-tinted to the purple.

### 3.2 Work: discipline chapters (the page's job)
**One chapter per discipline, not per project.** Today there are three, with
one project each; more projects can be added later without making the page
longer. Chapter order: **Web & growth → Social media → Logo & identity**, so
the marketing work comes first.

| # | Chapter | `cats` it draws from | Featured now (`showcase: 1`) | Queued, not yet showcased |
|---|---|---|---|---|
| 01 | Web & growth | `web`, `mobile` | **devsign8-website** (new entry) | none |
| 02 | Social media | `social` | **mustang-gtd** | none; the chapter also links to `/social` ("See all posts →") |
| 03 | Logo & identity | `logo` | **digiskills-logo** (the only client piece; Jayson's pick) | devsign8, jm-design: one line each to add |

Chapters are defined in `src/config/v3.ts` as
`[{ key, label, cats, allHref }]`. A chapter renders only when at least one
entry in its `cats` has `showcase` set, and the `01 / 03` counter is derived
from the chapters that render. So a future **Digital marketing** chapter
(`cats: ['marketing']`) appears by itself the moment its first project is
tagged, and the counter becomes `01 / 04`.

**Adding a project later** is one line in its Markdown frontmatter:
`showcase: 2` (its rank inside its discipline; 1 = featured). Ties sort by
`order`, then title. An entry whose `cats` span two chapters appears only in
the first matching chapter, so nothing shows twice.

**Plates.** Each chapter is a **plate**: an opaque `--bg-2` card inset by
`--gutter` with `--radius-l` top corners. The plates stack with **plain CSS
`position: sticky`**: chapter 1 sticks under the header and chapter 2 scrolls
up over it. The browser does the stacking, and scrolling stays 1:1 with the
visitor's input. The inset keeps the dot field visible in the margins (an
opaque full-bleed section would hide it; see *portfolio-v2-direction*).

**Tall-plate rule.** A sticky element taller than the viewport is covered by
the next plate before its bottom is ever seen. A chapter with a "More" row can
exceed a phone's height. Each plate therefore publishes its own height as
`--plate-h` (ResizeObserver) and sticks at
`top: min(var(--header-height), 100svh - var(--plate-h))`: top-anchored when
it fits, bottom-anchored when it does not. All of its content scrolls past
before the next plate arrives. It is verified at 375 × 667.

Chapter anatomy, in DOM order:
1. `01 / 03` counter + chapter label (eyebrow style; v2's `category` field is untouched)
2. Featured project title (h2, `--step-section`)
3. **Peak:** `result.value` large, with `result.label` and `result.source`
   under it. If there is no result, `brief` as a large serif-italic line. If
   there is no brief, `summary`. It never renders empty.
4. Cover in a frame. The frame is its own surface, so covers with baked-in
   light grounds read as intentional mounts, not errors.
5. `Read the case →` link to `/work/<slug>/`.
6. **More row** (only when rank ≥ 2 entries exist): heading "More logo work"
   (h3), up to **3** compact covers, each titled and linked to its case page.
   With more than 3, a `See all logo work →` link to `allHref`
   (`/work?cat=logo`). Hidden entirely today, since every chapter has one project.

**Motion per chapter** (scrubbed to the chapter's own scroll range):
- The cover un-crops: `clip-path: inset(12% 12% round var(--radius-l)) → inset(0)`.
- Parallax inside the cover: the image moves ~10% within its frame.
- The title's lines rise (the same treatment as the Open h1, triggered on entry, not scrubbed).
- Peak: the metric counts up (same `aria-hidden` overlay pattern as the stats),
  or the brief line reveals by line.
- The More row's covers rise in with an 80 ms stagger on entry (not scrubbed).
- The chapter being covered scales to 0.94 and its content dims to `--text-dim`
  as the next plate arrives. This is transform and colour only; its text stays AA.

**Content now.** The `brief` lines below are *drafts for Jayson to approve*:

| Chapter | Entry | Draft brief (≤ 90 chars) | Result |
|---|---|---|---|
| Web & growth | devsign8-website **(new)** | *Written from the questionnaire* | The strongest GA4 / Search Console / social number from Jayson's exports |
| Social media | mustang-gtd | Four Instagram panels that had to read as one unbroken frame. | From post insights, if it ran on Devsign8's accounts |
| Logo & identity | digiskills-logo | A digital-safety app for kids needed a mark that felt like play. | None (client work) |

Drafts for when they are showcased: devsign8, *"A studio name that had to
say design and development in one word."*; jm-design, *"A personal monogram
that carries both letters in a single stroke."* Both go in the copy deck now.

**New entry `src/content/work/devsign8-website.md`** (`cats: ['web']`, so the
v2 `/work` filters pick it up too):
- *Cover:* captured from the live devsign8.com at 1440 × 900 in its light
  and dark themes (`cover` + `coverDark`), converted to WebP. The alt text
  describes the actual capture.
- *Facts* (what he built, stack, launch date, his role) come from the
  questionnaire in the copy deck. Nothing is assumed, including that Jayson
  built it; his choice of this option implies it, and the questionnaire confirms it.
- `externalUrl: https://www.devsign8.com`.

**`/work?cat=<key>` deep links (small v2 change).** `WorkGrid` reads `cat`
from the URL on load and applies that filter. Unknown keys are ignored, and
choosing a filter updates the URL with `history.replaceState`, so a filtered
view can be shared. The "See all" links depend on this.

### 3.3 Contact
- One oversized line (`--step-hero`): **Let's build the next one.** (copy open)
- `mailto:` button with `PERSON.email` (still `jmerboila@gmail.com`; the open
  question in site.ts is unchanged), then the `SOCIALS` list.
- **Motion:** the line reveals on entry; nothing loops.

### 3.4 Header and footer
- Sticky header: wordmark, `Work`, `Contact`, theme toggle (reusing
  `theme.ts`), a small `← v2` dev link. It publishes `--header-height` from a
  ResizeObserver, because `DotGrid` insets itself by that variable.
- Footer: © line + socials, as in v2B.

## 4. Architecture

```
src/pages/v3/index.astro          page: queries the 4 entries and composes sections
src/layouts/V3Layout.astro        shell: head, noindex, theme bootstrap, header, DotGrid, footer
src/components/v3/Open.astro
src/components/v3/Brief.astro
src/components/v3/Chapter.astro   one plate; props = chapter config + its ranked entries + index + total
src/components/v3/Contact.astro
src/styles/v3.css                 GLOBAL (unscoped): palette override, dot colours, plates, stacking
src/scripts/v3-motion.ts          every GSAP call on the page, in one module
src/config/v3.ts                  discipline chapters: [{ key, label, cats, allHref }], e.g. { key: 'logo', label: 'Logo & identity', cats: ['logo'], allHref: '/work?cat=logo' }
```

**Changed files:** `src/content.config.ts` (two optional fields),
`astro.config.mjs` (sitemap filter adds `/v3`), two existing work `.md` files
(`brief` + `showcase: 1` on mustang-gtd and digiskills-logo), one **new** work entry
(`devsign8-website.md` + its two cover images), `src/components/WorkGrid.astro`
(`?cat=` deep links), `package.json` (`gsap`).

**Why a separate layout.** This follows the V2BLayout precedent: an unindexed
variant must not carry GTM or JSON-LD about the same person. Unlike v2B it
**does** mount `<DotGrid />`.

**Palette override.** `html.v3` redefines only the `--raw-*-accent*` and
`--raw-*-border*` tokens. The semantic tokens resolve on the same element, so
everything downstream turns purple and nothing is forked. `accent-strong` and
`accent-dim` are derived from the two brand tints and must pass the contrast
script before use. Dot colours are overridden in `v3.css`, because scoped
styles never reach child components (*astro-scoped-styles-gotcha*). Dot
opacities stay as they are (paper 0.12 / 0.15, night 0.18 / 0.28), under the
solved purple ceilings of **0.175 paper / 0.315 night**.

**Schema additions** (both optional, so v2 and every other entry are unaffected):
```ts
brief: z.string().max(90).optional(),
showcase: z.number().int().positive().optional(), // rank inside its v3 discipline chapter; 1 = featured
result: z.object({
  value: z.string(),   // "+212%" (a string, so "+", "%" and "k" stay as written)
  label: z.string(),   // "engagement rate, organic"
  source: z.string(),  // "Meta Business Suite, Jan–Jun 2026" (required: no source, no number)
}).optional(),
```
The showcased projects are chosen by `showcase`, not `featured`, because
v2's homepage already relies on that flag. The chapters themselves live in
`src/config/v3.ts`.

**Motion module contract (`v3-motion.ts`):**
- Exits immediately when `motionReduced()` is true (from `src/scripts/motion.ts`,
  the site's single answer). `onMotionChange` reverts or rebuilds a
  `gsap.context()` live.
- **Nothing is hidden by CSS.** Every start state is set by GSAP at runtime, so
  if the script fails, the page is simply static. This avoids the
  `.reveal{opacity:0}` stranding trap (*hero-overlay-and-reveal-traps*) and the
  Decision Guide's warning that a scrubbed narrative with motion disabled
  becomes "an empty page".
- **One exception: the Open h1.** It is visible on first paint, so a
  GSAP-set start state would flash it (shown, hidden, then revealed). An inline
  head script adds `html.v3-intro` only when reduced motion is *off*, and
  `v3.css` hides the h1 only under that class. `v3-motion.ts` removes the class
  once the reveal starts, and the inline script also removes it after
  **2 s** regardless, so a failed bundle can never strand the headline.
- SplitText runs after `document.fonts.ready` and re-splits on resize
  (`autoSplit`), so line breaks match the rendered font. Its built-in ARIA
  handling (the parent gets `aria-label`, the fragments get `aria-hidden`) must
  be confirmed in the build, not assumed.
- It animates only transform, opacity, colour and clip-path. There are no
  infinite animations, so WCAG 2.2.2 is never reopened.
- With reduced motion, the plates drop `position: sticky` and flow normally.

## 5. Accessibility and risks

| Risk | Handling |
|---|---|
| **2.4.11 Focus Not Obscured**: a later sticky plate could cover a focused link in an earlier one (the More row makes this likelier) | Test by tabbing through all chapters; add `scroll-margin` / focus-driven scroll to the chapter start if any link is obscured |
| Text over the dot field | Opacities under the solved ceilings (above) |
| Reading order | DOM order = visual order; the counter is text, not decoration |
| Headings | One h1 (Open), an h2 per section and per chapter |
| JS off / GSAP fails | The page is complete and static |
| Hidden Browser pane starves rAF and scroll events | Verify motion only with the pane visible; check `document.visibilityState` before debugging |

## 6. Verification before calling it done
1. `astro check` and `astro build` are clean.
2. Contrast script: the purple accent tokens and derived variants on both
   grounds; dot opacities vs. ceilings.
3. Browser pane at 375 / 768 / 1440 px, both themes, side by side (dark was
   the weaker theme last time).
4. Reduced-motion emulation: a static page with plates in normal flow.
5. JavaScript disabled: all content present.
6. Keyboard pass for 2.4.11.
7. The built page's JS size is reported (GSAP core + ScrollTrigger + SplitText
   measured, not assumed; the research puts core alone at ~27 kB gzip).

## 7. Marketing layer (added 2026-09-22; Jayson approved all four)

The page is a work sample for a **digital marketing** role, so the writing,
the measurement and the discoverability are part of the portfolio, not
extras. The work is split into three phases, each with its own implementation
plan, so nothing half-built ships:

| Phase | Scope | Ships to |
|---|---|---|
| **A** | The v3 page (§3–6) + the copy deck | `/v3` (noindex) |
| **B** | Consent Mode v2 + the measurement plan | **Site-wide**: v2 runs GTM with no consent today |
| **C** | Launch SEO/AEO/GEO pack | When `/v3` is promoted to `/` |

### 7.1 Copy deck + case studies (Phase A)
- `docs/copy/v3-copy-deck.md` holds **every visible string** on the page,
  grouped by section: eyebrow, h1, Brief, the chapter briefs (the three showcased, plus drafts for devsign8 and jm-design), CTA labels,
  Contact line, and alt text. Each line carries a status of *draft* or
  *approved*. Components read the approved copy; nothing ships as draft.
- Voice: the Devsign8 register (confident, plain, no hype adjectives). Every
  line does one job: the headline states a position, each brief states a
  problem, and every CTA names what happens next.
- **The Brief's first sentence is answer-first**: who, what, where, in one line.
  It is the sentence answer engines quote (also serves §7.4).
- **Case studies:** the three showcased `/work/<slug>/` pages (more as they are showcased) get `role`, `year`,
  `problem`, `approach` and `outcome` written as marketing case studies. **The
  facts come from Jayson** through a short questionnaire in the copy deck
  (dates, roles, what he actually did). The writing is drafted from his
  answers and he approves it. No fact is invented.

### 7.2 Consent Mode v2 (Phase B, site-wide)
- An inline script in **both** layouts, placed *before* GTM, sets Consent Mode
  v2 defaults to **denied** for `analytics_storage`, `ad_storage`,
  `ad_user_data` and `ad_personalization`.
- **Basic mode:** GA4 tags do not fire at all until consent. It is stricter
  than Advanced mode's cookieless pings, and matches Law 25 §8.1's
  default-off reading.
- `src/components/ConsentBanner.astro` is shared by BaseLayout and V3Layout.
  It is non-modal and non-blocking, with choices of equal weight: *Allow
  analytics* and *No thanks* (analytics is the only purpose used; ads stay
  denied). The choice is stored in `localStorage` (`jm-consent`), guarded by
  try/catch, and a footer link, *Privacy choices*, reopens it, so withdrawing
  consent is as easy as giving it.
- It must not obscure focus (WCAG 2.4.11) and sits at the bottom, clear of
  the sticky plates.
- `/privacy`: a short plain-language notice covering what GA4 collects, why,
  retention, and how to withdraw. Law 25 expects a published policy.
- *This is not legal advice; Jayson should confirm with a professional if the
  site ever collects more than analytics.*

### 7.3 Measurement plan (Phase B)
- `src/scripts/track.ts` exposes `track(event, params)` and pushes to
  `window.dataLayer`. It is harmless when GTM is absent (as on `/v3` in
  development) and does nothing without consent.
- **Custom events only where GA4's enhanced measurement cannot see:**

| Event | Params | Fires when | GA4 |
|---|---|---|---|
| `chapter_view` | `chapter_index`, `project_slug` | a chapter is ≥ 50% visible, once per page view | event |
| `case_click` | `project_slug` | "Read the case" is clicked | event |
| `contact_click` | `method` (`email` / `social`), `destination` | a contact link is clicked | **key event** |

  Outbound social clicks and scroll depth come from enhanced measurement and
  are not duplicated.
- **GTM container setup is done by Jayson in the GTM UI.** There is no access
  from here. `docs/marketing/gtm-setup.md` lists the exact variables,
  triggers and tags, plus how to verify each in Tag Assistant preview.
- **UTM convention** (`docs/marketing/utm-convention.md`): lowercase and
  hyphenated. `utm_source` = platform (`linkedin`, `indeed`, `email`),
  `utm_medium` = `application` | `outreach`, `utm_campaign` =
  `<company>-<yyyymm>`. Example:
  `?utm_source=linkedin&utm_medium=application&utm_campaign=acme-202610`.
  GA4's traffic acquisition report then shows which applications were opened
  and how far each got (via `chapter_view`).

### 7.4 Launch SEO/AEO/GEO pack (Phase C, at promotion)
- **Custom domain:** Jayson's decision and purchase. This also resolves the
  `SITE_ORIGIN` / `BASE_PATH` TODO in `site.ts`.
- **Bing Webmaster Tools:** a verification meta tag in `ANALYTICS`, sitemap
  submitted, and IndexNow pinged on deploy. ChatGPT Search and Copilot ground
  their answers in the Bing index, and Bing's AI performance report shows
  citation share.
- **JSON-LD:** `ProfilePage` with `mainEntity` → the existing `Person` `@id`,
  plus an `ItemList` of `CreativeWork` (name, url, image, creator) for every
  showcased project. The existing entity graph is reused, not duplicated.
- **Share image:** a new 1200 × 630 purple OG image for the page.
- **Core Web Vitals budget** (Google's "good" thresholds): LCP < 2.5 s,
  INP < 200 ms, CLS < 0.1, measured with Lighthouse on a throttled mobile
  profile. A failure blocks promotion.
- The `noindex` flag, sitemap exclusion and GTM gating in V3Layout flip in
  **one** place (an `indexable` prop) at promotion.

**Deliberately not added:** A/B testing (traffic too low to reach
significance), heatmaps and session recording (consent cost outweighs insight
at this volume), `llms.txt` (BaseLayout already records that Google ignores
it), chat widgets, newsletter pop-ups.

## 8. Out of scope
Promoting `/v3` to `/` (Phase C runs at that moment, not before); the v2B
lime-vs-cobalt fork; Lenis; Motion (the library); video inside chapters
(Mustang's 10 s Reel stays on its case page, since a looping video would
reopen 2.2.2); deleting `PolyMesh.astro`.

## 9. Needed from Jayson
1. Confirm Orange Magazine Logo is out.
2. Approve or rewrite the copy deck: the chapter briefs, the Brief paragraph,
   headline and CTAs.
3. Answer the case-study questionnaire (roles, years, what you did) for the
   three showcased projects, including what you built on devsign8.com and when it launched.
4. Optional: analytics exports (outside the repo) for the devsign8.com and Mustang GTD results.
5. Phase B: set up the GTM container from `gtm-setup.md`.
6. Phase C: the custom-domain decision.
