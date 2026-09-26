# /social by project, and the 2026 Ford Mustang GTD launch story

Date: 2026-09-25. Status: design approved in chat, section by section; this file is for final review.

## Goal

Show social work the way a digital marketing hiring manager judges it: as campaigns, with the thinking and the results, not as a flat feed of posts. Start with one project, the **2026 Ford Mustang GTD**, and build it well enough to repeat for the others.

## Decisions (all approved)

1. **One page per project, at `/work/<project>/`.** A project is a Work entry. Social posts join it through their existing `work:` line.
2. **The Mustang is renamed and moved.** The name is "2026 Ford Mustang GTD" everywhere. The page moves from `/work/mustang-gtd/` to `/work/2026-ford-mustang-gtd/`, and the old address redirects.
3. **/social shows project shelves** (mockup option A). One band per project: a small label, the project name, a one-line idea, the real pieces side by side (still playable and swipeable), and "Read the story →" when the project has a story. Posts with no project yet get a shelf of their own without the link. The Reels / Posts / Carousels filter goes away.
4. **The per-post "How I made it" pages are removed** (`src/pages/social/[slug].astro` and the card link). The Mustang write-ups feed its story. The Lexus, UNF and toolkit drafts stay in their files, not rendered, for later.
5. **All Work pages move to the v3 shell** (header, palette, breadcrumbs, footer). Only the Mustang gets the new story layout now; the other case studies keep their current body.
6. **The story is scroll-driven** (mockup option A): six chapters numbered with the homepage's steps, each with a visual that stays pinned while its text is read.
7. **Process first, then an honest results section.** Real numbers with context and a "what I'd test next".
8. **Copy rules:** no em dashes; "2026 Ford Mustang GTD" in full; the disclaimer is visible on the page.

Out of scope: story pages for Lexus, UNF and the toolkit; replacing the toolkit's draft captions with the real ones from Buffer.

## The story page

Top: breadcrumbs (Home / Work / 2026 Ford Mustang GTD), the title, one line ("A two-post Instagram launch: a smoke Reel Reveal, then a Seamless Carousel one hour later."), a facts row (Role: Concept, design and launch. Tools: Photoshop, After Effects. Channel: Instagram. Launched: Tue 25 Aug 2026), and the disclaimer: "Self-initiated concept. Not affiliated with or endorsed by Ford Motor Company."

Chapters (stage 03 Brand is skipped on purpose; the brand is Ford's):

| Stage | Chapter | Pinned visual |
|---|---|---|
| 01 Discover | It started at Multimatic, then the research | Carousel panel 2 (the car), then a small reach vs depth chart with sources |
| 02 Plan | Teaser first, reveal one hour later | Two phones, Reel then carousel, "+1 hour" between |
| 04 Build | Photoshop silhouette, After Effects smoke; one artboard sliced into four | Photoshop and After Effects screenshots, then the artboard splitting into four panels on scroll |
| 05 Be found | Two captions, two jobs | Both real captions in Instagram style with notes |
| 06 Show up | Tuesday 25 Aug, 8:00 and 9:00 AM | A clock or timeline moving 8:00 to 9:00 |
| 07 Measure | Results and what I learned | The numbers, then the next tests |

End: "The posts" (both real posts, playable), previous / next project, the contact section.

Behaviour:
- Wide screens: each chapter is two columns; its visual is `position: sticky` inside that chapter, so it holds while the chapter's text scrolls and leaves with it. Works without JavaScript.
- GSAP adds the artboard slice and the clock tick as scroll-scrubbed motion. Nothing loops. Both are skipped under reduced motion, which shows the finished state.
- Phones: each visual sits above its chapter text, plain article order.
- Accessibility: real headings per chapter; every visual has a text alternative; nothing sticky may cover keyboard focus (the homepage trap in memory: sticky plates hid focus).

## The story's content (his voice, no em dashes)

- **01 Discover.** He worked at Multimatic, where the 2026 Ford Mustang GTD is built, and chose the car for that reason. Research: carousels earn the highest engagement per person reached (Buffer: 6.90% vs 3.31% for Reels; Socialinsider: 0.55% vs 0.52% by followers), Reels earn the most reach (Buffer: 30.81% reach rate, about 1.36x carousels), and Instagram ranks on watch time, sends and likes (Mosseri). So: use both, each for its job.
- **02 Plan.** Reel Reveal first to create curiosity, Seamless Carousel an hour later to pay it off, one shared hashtag (#StreetLegalButJustBarely) tying them into one campaign.
- **04 Build.** Reel: silhouette and Ford logo in Photoshop, smoke in After Effects. Carousel: one continuous 4320 x 1350 artboard in Photoshop, sliced into four 1080 x 1350 panels so smoke and horizon carry across every swipe; specs revealed one per panel (lap time, top speed, 815 hp). Why seamless: a plain carousel asks for a swipe; a seamless one makes stopping feel unfinished.
- **05 Be found.** "Coming Soon! #StreetLegalButJustBarely": short, suspense, one campaign tag. "Ford 2026 Mustang GTD" with #Ford #2026 #Mustang #GTD #StreetLegalButJustBarely: the payoff, with brand and model tags for search.
- **06 Show up.** Posted Tuesday 25 Aug 2026 at 8:00 AM (Reel) and 9:00 AM (carousel), Toronto time. Tuesday is a strong day in both large 2026 studies (Wednesday first, Tuesday and Thursday runners-up); Buffer's best single slot is a morning, Sprout finds Tuesday strongest from 1 to 7 PM. The hour between gives the teaser time to travel before the payoff.
- **07 Measure.** Instagram Insights via Buffer, as of 25 Sep 2026. Reel: reach 104, views 128, likes 7, saves 1, average watch 4.97 s of 10 s. Carousel: reach 4, views 25, likes 5. Reading: the Reel did the reaching (26x the carousel's reach); the carousel converted almost everyone who saw it; that is the reach vs depth split the research predicted, at the scale of a two-month-old account. Next tests: Tuesday afternoon; a Story share to push the carousel; a clearer call to action on the Reel; "Unofficial concept. Not affiliated with Ford." in both captions.

Sources to cite on the page: Buffer, State of Social Media Engagement 2026; Socialinsider, 2026 Instagram benchmarks; Dataslayer summary of Mosseri's ranking signals; Buffer, best time to post on Instagram (Sep 2026); Sprout Social, best times to post on Instagram 2026.

## Data model

Work entry (`src/content/work/2026-ford-mustang-gtd.md`, renamed from `mustang-gtd.md`), new optional fields:

```yaml
story:
  lede: "A two-post Instagram launch: ..."
  facts: { role: "...", tools: ["Photoshop", "After Effects"], channel: "Instagram", launched: 2026-08-25 }
  disclaimer: "Self-initiated concept. Not affiliated with or endorsed by Ford Motor Company."
  chapters:
    - stage: discover            # one of the homepage lifecycle stage ids
      heading: "It started at Multimatic"
      body: "Markdown text"
      visual: { kind: image | plan | slicer | captions | clock | results | chart, ... }
  results:
    source: "Instagram Insights via Buffer, as of 25 Sep 2026"
    items: [{ label, value, note }]
  sources: [{ label, url }]
```

Screenshots live in `src/assets/projects/` (as the other case-study images do) with alt text and a note. A Work entry with `story` renders the story layout; without it, the current case-study body in the v3 shell.

Social posts: `work: 2026-ford-mustang-gtd` on both Mustang posts; titles become "2026 Ford Mustang GTD Seamless Carousel" and "2026 Ford Mustang GTD Reel Reveal"; captions replaced with the real ones from Buffer; tools corrected (carousel: Photoshop; Reel: Photoshop, After Effects).

Other references to update: `src/config/lifecycle.ts` (`work: ['mustang-gtd']`), homepage build test slugs, the redirect in `astro.config.mjs`.

## Assets

- Photoshop workspace (Reel file, silhouette): captured 2026-09-25.
- After Effects workspace (smoke comp): captured 2026-09-25, title bar cropped (it showed the Windows user path).
- Carousel artboard in Photoshop ("Devsign8 Feed 4-5.psd"): to capture when he opens that tab. Until then chapter 04 uses the existing strip mockup (`social-mustang-gtd-mockup.webp`).

## Testing

Build tests: the story page exists with six chapters, the disclaimer and a results source line; `/work/mustang-gtd/` redirects; every shelf story link resolves; no em dashes in the Mustang's content files; existing checks still pass (no autoplay or mute, template never publishes, homepage stage links). Browser: laptop and phone widths, light and dark, reduced motion, keyboard only (focus never hidden under a sticky visual).
