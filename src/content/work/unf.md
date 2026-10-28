---
# UNF concept work as a campaign case study (2026-10-27, his call): it
# replaces the unlisted /UNF/ page (live 2026-10-23, 3a37d04), which now
# redirects here. Spec pieces for the UNF Student Social Media Marketing
# Intern application (LinkedIn job 4459430862); never posted, so no results
# section and no post frames (they would show the Devsign8 handle).
# Sources for every claim, all in C:\dev\UNF:
#   - brand, palette, social audit: UNF-Brand-Guide.md (unfc.ca, 2026-10-09)
#   - type scale, margins, seams, scrims: reports/Social carousel typography layout.md
#   - contrast ratios: computed with the WCAG 2.2 formula (2026-10-27)
#   - photos: carousel frames from his iPhone and DJI Osmo Pocket footage
#     (assets/carousel/frames); poster photo is UNF's VR Lab, About page image 14
#   - build steps: scripts/ and scripts/jsx/ headers
title: "UNF: Innovation flows here"
shortTitle: "UNF concepts"
summary: "A seamless carousel and a campus screen poster in UNF's new brand, each as a still and in motion."
seoTitle: "UNF Concept Carousel and Poster"
description: "Concept work in the University of Niagara Falls Canada brand: a seamless Instagram carousel and a graduate poster, each animated. Not official UNF content."
intro: "Spec work in UNF's new brand: a five-slide seamless carousel and a graduate poster for campus screens, each built as a still and in motion."
category: "Concept campaign"
cats:
  - "social"
  - "print"
tags:
  - "Instagram"
  - "Carousel"
  - "Digital signage"
  - "Motion design"
cover: "../../assets/projects/social-unf-cover.webp"
typeCovers:
  print:
    src: "../../assets/projects/unf-grad-poster.webp"
    alt: "UNF graduate poster: a student in a VR headset under the headline Step inside your master's."
coverAlt: "Carousel slide one: a child in silhouette inside the Niagara Power Station light show, white Flow Lines sweeping past, under the headline This building changed the world."
role: "Research, design and animation"
client: "Concept / spec work, not official UNF content."
year: "2026"
tools:
  - "Illustrator"
  - "Photoshop"
  - "After Effects"
featured: false
order: 68
campaign:
  heading: "The brief"
  idea: "UNF had just launched a new brand, Innovation flows here. I made two pieces in it, each as a still and in motion, to show I can work inside their system from day one."
  type: "Concept / spec work"
  deliverables: ["Seamless carousel", "Carousel in motion", "Campus screen poster", "Animated poster", "Captions and timing"]
  disclaimer: "Concept / spec work, not official UNF content."
  hero:
    kind: carousel
    artboard: "../../assets/projects/unf-carousel-artboard.webp"
    panels: 5
    caption: "One 5400 × 1350 artboard, cut into 5 panels of 1080 × 1350: swipe it as it would run on Instagram."
    alt: "Five UNF carousel slides on one artboard, joined by white flowing lines: This building changed the world; built in 1905 on alternating current; 101 years of turning the Falls into power; today the water flows in light; and the UNF campus with Innovation flows here, it always has, and an Explore programs button."
  sections:
    - heading: "Reading the brand"
      body:
        - "Before designing anything I took the new brand apart: the logo SVG, the website's CSS and the launch assets. The idea is flow. In 1895 Tesla's patents powered the station at the Falls, and the tagline says it plainly: Innovation flows here. It always has."
        - "The signature device is the Flow Lines: parallel ribbons of equal weight that sweep through the frame and weave behind people, so the subject sits inside the flow."
        - "Then I audited the live Instagram grid. The designed posts use only UNF Blue, Falls Cyan, white and black, and none of the latest twelve posts showed Niagara itself. The brand's story is the Falls, so that became my brief."
        - "Colour came next. Cyan on UNF Blue barely passes contrast, so cyan only ever marks one large, bold payoff word per slide."
      visual:
        kind: table
        caption: "The colour pairings I tested"
        columns: ["Pairing", "Contrast", "How I used it"]
        rows:
          - ["White on UNF Blue", "7.83:1", "Any text"]
          - ["Falls Cyan on UNF Blue", "3.12:1", "Large bold words only"]
          - ["Falls Cyan on white", "2.51:1", "Never for text"]
          - ["Falls Cyan on deep navy", "5.61:1", "Why the photo scrims are navy"]
          - ["White on Graduate Magenta", "5.10:1", "The graduate accent"]
        source: "WCAG 2.2 contrast formula (SC 1.4.3), my calculations"
    - heading: "A type system from research"
      body:
        - "I researched carousel typography from the classics (Bringhurst, Butterick) to current practice, then turned it into rules: few sizes, a big jump from headline to body, and nothing under 28 px, which renders near 10 pt on a phone."
        - "Poppins' default leading is loose, so headlines are set tight by hand, with UNF's two-weight move: the setup in Regular, the payoff in Bold."
        - "Instagram's 3:4 profile grid trims about 34 px from each side of a cover, so every slide keeps a 96 px margin. On a seamless carousel that also leaves a text-free band around each seam: lines and photos cross the cut, words, faces and logos never do."
      visual:
        kind: table
        caption: "The scale, on a 1080 × 1350 slide"
        columns: ["Tier", "Size", "Weight"]
        rows:
          - ["Stat numeral", "260 to 360 px", "Bold"]
          - ["Hero headline", "110 to 150 px", "Regular and Bold"]
          - ["Content headline", "72 to 96 px", "Regular and Bold"]
          - ["Body", "34 to 40 px", "Regular"]
          - ["Label", "24 to 28 px, caps", "SemiBold"]
        source: "Practitioner guides checked against Bringhurst, Butterick and NN/g"
    - heading: "Follow the Flow: the carousel"
      body:
        - "The story runs through one building: the Niagara power station, built in 1905 on alternating current, which turned the Falls into power for 101 years and now hosts a light show. Slide five lands on the UNF campus: Innovation flows here."
        - "Every photo is a frame from my own iPhone and DJI Osmo Pocket footage. In Photoshop I cut out the child and the building, so the Flow Lines pass behind them, and cleaned the station's roof edge with a script."
        - "The lines are drawn from one editable spine path, which a script turns into five smooth parallel lines across the 5400 px artboard. Navy scrims are baked into the photos so the cyan stays readable."
      visual:
        kind: slicer
        panels: 5
        artboard: "../../assets/projects/unf-carousel-artboard.webp"
        alt: "The full carousel artboard, cut into five panels, with white Flow Lines running unbroken across every seam from the light show to the UNF campus."
    - heading: "The carousel in motion"
      body:
        - "For the animated version I exported the Illustrator layout as data and rebuilt it natively in After Effects: live type, shape-layer lines and a slow push-in on each photo."
        - "Every element rises in from top to bottom, then the Flow Lines draw on last. Each slide's lines start at the exact point where the previous slide's ended, so the line keeps flowing as you swipe."
        - "This cut swipes itself on the music: each swipe lasts one beat and lands on a bar's downbeat, and the incoming slide waits to animate until it lands."
      visual:
        kind: video
        src: "/media/works/unf-follow-the-flow.mp4"
        title: "Follow the Flow: carousel in motion"
        ratio: "4 / 5"
    - heading: "Step inside your master's: the poster"
      body:
        - "The second piece is a 9:16 poster for campus screens. I tried three directions first, all with the same type block: the neon U in the lobby, the campus tower and the light show hall."
        - "Then I made it specific: the MA in Digital Media and Global Communications, built around UNF's VR Lab. Magenta is UNF's colour for the graduate journey, so the Flow Lines turn magenta."
        - "I upscaled the VR Lab photo in Photoshop and cut her out, so the lines run behind her. The layout has five levels: headline, program, the facts, a button and fine print, on 90 px margins."
      visual:
        kind: image
        src: "../../assets/projects/unf-grad-poster.webp"
        alt: "UNF graduate poster: a student in a VR headset over a navy to blue glow with magenta flowing lines. Headline: Step inside your master's. MA in Digital Media and Global Communications, 18 months, intakes January, April, July and September, unfc.ca."
        note: "Photo: University of Niagara Falls Canada."
    - heading: "The poster in motion"
      body:
        - "The animated poster speaks the carousel's motion language: the type rises top to bottom, then the magenta lines draw on, while the photo breathes in and out by 2%."
        - "It is a 15-second seamless loop. In the last 0.8 seconds the type and lines fade out, so the first frame follows the last without a jump."
        - "There are two cuts: a silent one for campus screens and this one, with music, for social. A script found the musical lift so the 15 seconds start on it."
      visual:
        kind: video
        src: "/media/works/unf-grad-poster-motion.mp4"
        title: "Step inside your master's: animated poster"
        ratio: "9 / 16"
        loop: true
        note: "Photo: University of Niagara Falls Canada."
    - heading: "Captions and timing"
      body:
        - "These are planned captions; the pieces never ran. They follow UNF's caption pattern: a short hook, a line or two of story, a call to action, then a few hashtags, in Canadian spelling."
        - "The carousel leads in the feed and its motion cut follows as a Reel to reach people who don't follow UNF yet. The poster loops on campus screens, and its music cut runs as a Reel ahead of each intake."
      visual:
        kind: table
        caption: "Planned captions"
        columns: ["Piece", "Caption"]
        rows:
          - ["Carousel", "This building changed the world. Swipe to see how the Falls became power, then light, then a campus. Explore programs: link in bio. #UNF #NiagaraFalls #InnovationFlowsHere"]
          - ["Animated poster", "Step inside your master's. The MA in Digital Media and Global Communications, 18 months, four intakes a year. Explore the program: link in bio. #UNF #GradSchool #InnovationFlowsHere"]
  sources:
    - { label: "University of Niagara Falls Canada", url: "https://unfc.ca/" }
    - { label: "W3C: Contrast (Minimum), WCAG 2.2", url: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html" }
    - { label: "Practical Typography: Headings", url: "https://practicaltypography.com/headings.html" }
    - { label: "NN/g: Text over images", url: "https://www.nngroup.com/articles/text-over-images/" }
    - { label: "Kapwing: Instagram's new grid size", url: "https://www.kapwing.com/resources/instagrams-new-grid-layout-size-and-dimensions-2025/" }
---
