# Logo presentations: design spec

Date: 2026-10-01. Branch: `case-studies/logos`. Status: approved by Jayson 2026-10-01; gates 1 to 3 cleared.

## Goal

Turn the three logo project pages (Devsign8 wordmark, JM Design monogram,
DigiSkills app logo) into client-facing brand presentations, the way an
identity studio hands over a mark: clean, numbered, and clear about intent
and thinking. Every image is new and generated from Jayson's own `.ai`
files. None of the old images is reused.

## Decisions already made (Jayson, 2026-10-01)

| Question | Decision |
|---|---|
| Where | The portfolio's `/work/logo/<slug>/` pages, not a separate deck |
| Process shown | A curated path: 3 to 4 explorations per logo, one line each on why it was kept or dropped |
| Applications | Clean flat mockups built from the real vectors, each labelled "Mockup" |
| Typefaces | Named, like a studio would. The Orange Avenue desktop licence is bought before this goes live |
| Layout | Option A: one dedicated presentation layout for logo projects |
| Studio | Devsign8 is a creative studio, never an agency |

## Page anatomy (same order on all three)

| # | Section | Content | Form |
|---|---|---|---|
| 01 | Opening | The mark large on its brand ground; the one-line idea; an At a glance box: type of project, role, deliverables, tools | Hero image + HTML |
| 02 | The brief | Who it is for and what the mark had to do, under 80 words | HTML |
| 03 | The idea | The concept in one sentence, plus one diagram that shows it | HTML + 1 image |
| 04 | Exploration | 3 to 4 directions from the real artboards, each with a one-line kept/dropped note | 1 image per direction, HTML notes |
| 05 | Construction | The mark as it looks in Illustrator: grey pasteboard, white artboard, paths in outline mode with real anchor points and handles, cyan guides, magenta measurement callouts in points | 1 or 2 images + caption |
| 06 | Typography | Each typeface named, with what it carries and a specimen drawn from the file | HTML + specimen image |
| 07 | Colour | Swatches with name, hex and where each is used | HTML swatches, no image |
| 08 | Versatility | Full colour, one colour, reversed; real pixel sizes down to favicon | 1 image |
| 08b | Motion | Devsign8 and JM only: the existing logo reel, with its audio track removed (the music is not cleared) and a corrected caption | Video |
| 09 | In use | 4 or 5 flat applications, each labelled "Mockup" | 1 image each |
| 10 | Usage rules | Clear space, minimum size, 3 or 4 don'ts | 1 image + HTML list |
| | Next project | Existing prev/next nav | Existing |

Text lives in HTML so it reads on phones, is indexable and is accessible.
Images carry pictures and short labels only; every fact in an image is
repeated in its caption or the HTML around it. Each image has alt text.

## Visual language

- Each presentation sits on its own brand: Devsign8 in Ink `#0E0E0F`,
  Paper `#F7F5F1` and Violet `#5A3FE0` (Lavender `#A98DFF` on dark);
  JM Design in black, cream and a gold sampled from its current cover
  image (recorded as a hex in the script); DigiSkills
  in Indigo `#1C1E5E`, Amber `#F7A50A` and the study's Surface `#F6F6FB`.
- Panels are 1600 x 1200 (4:3), labels at 32 px or more so they survive a
  phone screen.
- The construction view copies Illustrator's own look so it reads as the
  real tool: pasteboard grey, artboard white, guides cyan, anchor points in
  the layer colour stored in the files (`#4F80FF`, "Layer 1"), and smart
  guide magenta for measurements. Values come from the vector, in points,
  rounded to one decimal.
- Mockups are flat and graphic (no photos), in the same language as the
  panels, each with a small "Mockup" tag in the image and in its caption.

## Per logo (sources and content)

### Devsign8 (own studio)
- Sources: `Devsign8.ai` (artboard 1: four steps to the wordmark, steps 1
  to 3 live type, step 4 outlined; artboard 2: rejected directions), the
  Brand Style Guide (rules, palette), the Logo Animations README (138
  files). `LogoDesign1.ai` is NOT used: Elev8 is a different name, and the
  DS8 / D8 / `<D>` marks are favicon ideas Jayson does not like (his call,
  2026-10-01). No D8 anywhere in the presentation.
- Exploration (curated, 4), with Jayson's reasons (2026-10-01):
  1. Dev + blackletter sign (Canterbury): dropped; it looked like a
     different brand, not formal, not elegant.
  2. Dev + Orange Avenue sign: kept; simple, clean and elegant, with
     extravagant curves and decorative tails as the accent.
  3. Adding the 8: infinity was always the idea: never stop learning and
     discovering, on a loop.
  4. The final, with the spacing set.
- Construction: the outlined final with cap height, x-height, baseline and
  descender measured from the glyph paths; letter gaps measured between
  glyph bounds; the 8 marked as the infinity turn.
- Typography: Roboto (Dev, code), Orange Avenue (sign8, design).
- In use (mockups): business card (wordmark, front and back), website
  header, social avatar, studio sign plate.
- Rules: from the style guide (clear space = D cap height; 120 px / 32 mm
  minimum; black on light, white on dark). The style guide's "use the D8
  monogram below minimum" rule is left out.

### JM Design (personal mark)
- Sources: `JM Design.ai` (artboard 1: the five build steps; artboard 2:
  the four rejects), the JM reel brief (the reasons, in Jayson's words).
  Jayson confirmed (2026-10-01) the brief's reading of the build: it is how
  the reel was made and how the mark was made.
- Exploration (4): Bask Old Face JM ("close, but something missing"),
  fused ligature ("the J got lost"), script Jme ("felt separated"; the
  Birds of Paradise font is not embedded and is personal-use only, so it
  is left out of the image and described in the note only), heavy JME
  ("too bold").
- Construction: Perpetua Titling MT Light at its set size, the J raised
  and dropped below the baseline, the 5 pt offset, the Shape Builder cut,
  with measurements from the paths.
- In use (mockups): favicon in a browser tab, site header, social avatar,
  letterhead or business card.

### DigiSkills (pro bono)
- Sources: `DigiSkills.ai` (the final: flat, no opacity, no overlap; the
  mark and the app icon), the three June 6 drafts, the colour study.
- Exploration (4): the three drafts plus the final (existing facts).
- Construction: spine axis, pixels at 1 : 2/3 : 1/2, page stack, mirror,
  tile 430.55 pt with 12 pt corners, book at 84%.
- In use (mockups): phone home screen, splash screen, app store style
  tile (labelled Mockup, no claim the app is live), sticker or badge.

## Build

- **Data:** a new optional `presentation` block on work entries in
  `src/content.config.ts` (idea, brief, glance, exploration[], construction[],
  typography[], colours[], versatility, inUse[], rules). On the three logo
  entries it replaces problem / constraints / approach / outcome and the
  gallery, which are removed so the two cannot drift. `role`, `client`,
  `tools`, `year`, `description` stay.
- **Render:** `src/components/logo/LogoPresentation.astro` (sections 01 to
  10), chosen in `src/pages/work/[type]/[slug].astro` when
  `d.presentation` exists, like `story` today.
- **Images:** `scripts/logo-presentation/` with one shared module
  (PDFium render of artboards, cairo drawing, the Illustrator view, guide
  and measurement helpers, mockup scenes) and one script per logo, writing
  to `src/assets/projects/logos/<slug>/NN-name.webp`. Deterministic, reads
  the `.ai` files in `C:\dev\Devsign8` read-only, and asserts its measured
  facts (for example DigiSkills' 1 : 2/3 : 1/2) so a changed file fails
  loudly. Replaces `scripts/digiskills-panels.py`.
- **SEO:** keep the existing CreativeWork, BreadcrumbList and share image
  (the opening image becomes the share image); add `hasPart` ImageObjects
  for the panels with captions.

## Testing

Build tests per logo page: sections 01 to 10 present in order with one
h2 each; every figure has a caption; every In use figure says "Mockup";
no old image names; no em dashes; "studio", never "agency"; images exist
at 1600 x 1200. Visual check in the browser at 1280 and 375 px, light and
dark.

## Launch gates (before merging to main and pushing)

1. ~~Orange Avenue desktop licence~~: bought (Jayson, 2026-10-01).
2. ~~Devsign8 kept/dropped reasons; Elev8 and D8~~: answered above.
3. ~~JM build reading~~: confirmed.
4. Jayson approves the finished pages from screenshots.

## Out of scope

The Work listing-page redesign (next), non-logo projects, a PDF deck,
photoreal mockups, audio on the logo reels.
