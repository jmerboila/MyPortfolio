# Safe-Zone Toolkit: product case study (design)

Approved by Jayson, 2026-10-02 (direction A, results "short and honest").
First of three social redesigns: the Safe-Zone Toolkit, then 2026 Ford
Mustang GTD, then 2026 Lexus NX, one at a time, each approved before the next.

## Goal

Replace the toolkit's seven-chapter launch story with a product case study
that leads with what Jayson made: an interactive safe-zone viewer built from
his spec, the ten Reels, the Photoshop script, and an honest takeaway. Same
standard as the logo pages: numbered sections, real work first, no filler,
light and dark versions (the design rule: visuals with a ground show the
version opposite the page).

## Source of truth

`C:\dev\Devsign8\01-Current\IG Tool Kit\Devsign8-IG-Template.jsx`, revision 3
(2 September 2026): 9:16 margins from Meta's percentages (top 14% = 270,
bottom 35% = 672 for Reels and ads, 20% = 384 for an organic Story, sides 6% =
65, the action rail 12% = 130 on the right). The `Devsign8-IG-SafeZones`
README and cards (15 August) predate that correction and are not used.

## Page structure (`/work/social/devsign8-ig-safe-zone-toolkit/`)

| # | Section | Content |
|---|---|---|
| 01 | The toolkit | The SafeZoneViewer beside the idea line and a glance list (project, role, tools, deliverables). |
| 02 | The problem | The Reel's hook as real video, light and dark (`devsign8-ig-02-reel-{light,dark}-hook.mp4`), phone-sized, with two short paragraphs. |
| 03 | The research | The spec table (12 formats), a callout on the action rail (130 px, not 65), the source note and Meta's disclaimer. |
| 04 | The tool | The real Photoshop screenshots (Reel and highlight cover templates built by the script), with captions. |
| 05 | The series | All ten posted Reels, playable, in the existing PostRow, in posting order. |
| 06 | Publishing | One caption example and the four-week schedule, compact. |
| 07 | What I learned | One line of real numbers, the takeaway, and what he would change. |

Numbers in 07 (Instagram Insights via Buffer, first nine Reels): 326 people
reached, 374 views; best, the 4:5 grid crop, 84 reached. No likes or comment
counts as headline figures; the takeaway names them honestly ("nobody
commented TOOLKIT").

## SafeZoneViewer

- One data file, `src/data/ig-safe-zones.ts`: the 12 formats with name,
  canvas (w, h), margins (t, r, b, l), shape (`rect` or `circle` for the
  highlight cover and profile photo) and a one-line note. The spec table in 03
  renders from the same file.
- Markup: a radio group of the 12 formats and an SVG of the chosen canvas at
  its true aspect ratio. Danger zones are tinted violet, the safe area is
  outlined, and the margins are labelled in px. A live region announces the
  format and its safe area.
- Server-rendered for the Reel, so it works without JavaScript; a small script
  swaps the format on click or arrow keys.
- Light and dark: the canvas draws dark on the light site and light on the
  dark site (CSS custom properties flipped by the page theme).
- Mobile: the SVG scales to the column; the format list wraps.

## Components and data

- `src/components/social/ToolkitCase.astro`: sections 01 to 07.
- `src/components/social/SafeZoneViewer.astro` + `src/scripts/safe-zone-viewer.ts`.
- `src/data/ig-safe-zones.ts`: the formats.
- Content: a `toolkit` block on the work entry (idea, glance, problem copy,
  callout, tool images, caption example, schedule, results line, insight,
  next steps) replaces `story` for this entry only. Ford and Lexus keep their
  stories until their own redesigns.
- Hook videos copied to `public/media/toolkit/` (about 1 MB each, audio-free).

## Tests

- Unit: every format's safe area equals its canvas minus its margins; circles
  are centred and fit inside the canvas.
- Build: sections 01 to 07 in order; the viewer offers 12 formats and renders
  the Reel without JavaScript; ten Reels in section 05; the hook video in light
  and dark; 07 states the real numbers; no em dashes; studio, not agency.

## Out of scope

The Ford and Lexus redesigns; any change to the Reels themselves; new
measurements beyond revision 3.
