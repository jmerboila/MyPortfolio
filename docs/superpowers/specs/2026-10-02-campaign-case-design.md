# Ford and Lexus: campaign case studies (design)

Approved by Jayson, 2026-10-02: build both, Ford first; drop Ford's carousel
drafts (only the final work, as on the logo pages); describe the Lexus poster
type in general terms, never by font name. Follows the Safe-Zone Toolkit
redesign (`2026-10-02-toolkit-case-design.md`).

## Shared layout: CampaignCase

A `campaign` block on the work entry replaces `story` for the page:

- 01 hero section: its own heading, the idea line, a glance list (project,
  role, tools, deliverables), the not-affiliated line, and a hero: a story
  visual or the project's posts.
- 02 onward: numbered sections, each with a heading, body copy, and an
  optional story visual (chart, plan, gallery, captions, clock, table,
  results; rendered by the existing StoryVisual) and/or a list of the
  project's posts, playable in PostRow.
- An optional `anchor` per section (Ford keeps `measure` for the home page's
  link). Results use the story's results shape and the `results` visual.
- Light and dark: charts, captions and timelines are drawn in HTML on the
  site's tokens; real captures (screenshots, posts, artwork) stay single.

## 2026 Ford Mustang GTD

| # | Section | Content |
|---|---|---|
| 01 | The launch | CarouselSwiper: the four panels in a phone frame (swipe, buttons, arrow keys) and the full artboard below with a window on the current panel. |
| 02 | The plan | Two posts, two jobs; the Buffer chart (carousels 6.90% engagement, Reels 1.36x reach); teaser at 8:00, reveal at 9:00. |
| 03 | The Reel Reveal | The posted Reel, playable; the Photoshop and After Effects screenshots. |
| 04 | The Seamless Carousel | One 4320 x 1350 artboard sliced into four 1080 x 1350 panels (the slicer, no drafts); the posted carousel. |
| 05 | Captions and timing | Both captions; Tuesday 8:00 and 9:00 AM. |
| 06 | Results (`#measure`) | Reel 104 reached vs carousel 4 (26x), 128 views, average watch 5.0 s of 10; insight; next steps. |

## 2026 Lexus NX

| # | Section | Content |
|---|---|---|
| 01 | The poster | The three posts (still, Reveal, tutorial) as the hero. |
| 02 | The idea | One design, three posts; the Ford lesson chart (Reel 104 vs carousel 4). |
| 03 | The layout | The ten InDesign steps (type named in general terms). |
| 04 | The motion | The four After Effects frames in order; sound design. |
| 05 | Captions and timing | Three captions; two evenings and a morning. |

Results are added as 06 once Buffer has a week of data (about 8 October);
until then the page ends at 05, with no placeholder.

## Tests

Build: sections in order for both pages; Ford's swiper has four panels and
the artboard window, its `#measure` keeps 104 and 4, no drafts; Lexus shows
three posts and no font names; no em dashes; studio, not agency. The Social
shelves still link both pages.
