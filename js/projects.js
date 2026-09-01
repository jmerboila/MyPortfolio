/* ============================================================================
   PROJECT DATA — the single source of truth for this site
   ----------------------------------------------------------------------------
   This file is read TWICE:
     1. By the browser, to build the gallery cards on the homepage.
     2. By build.js (Node), to generate a real HTML page for every project
        at  /work/<slug>/index.html  — which is what Google and link
        previews actually read. Cards alone are not enough.

   ★ AFTER EDITING THIS FILE, RUN:   node build.js
     That regenerates the /work/ pages and the sitemap. If you skip it, the
     homepage updates but search engines never see the new project.

   ----------------------------------------------------------------------------
   FIELDS
   ----------------------------------------------------------------------------
   REQUIRED
     slug        URL-safe id. Becomes /work/<slug>/. Never change it once
                   published — old links break. e.g. "orange-magazine"
     cat         One category ("logo") or several (["logo","web"]).
                   Options: "logo" | "graphic" | "web" | "mobile" | "social"
     category    Label shown on the card, e.g. "Logo & Identity"
     title       Project name
     desc        One-liner shown on the card
     longDesc    Longer intro shown in the modal and atop the project page

   IMAGES  (use .webp — see README-IMAGES.md for how to convert)
     image       Card thumbnail, e.g. "projects/Devsign8-Logo.webp"
                   Leave "" to show a placeholder icon instead
     imageFull   (optional) Larger image for the modal + project page
     gallery     (optional) Array of extra images shown on the project page
     icon        Placeholder icon when there is no image:
                   "logo" | "mobile" | "graphic" | "web" | "brand" | "social"
     placeholderLabel  Small label under the placeholder icon

   LAYOUT
     tags        Array of tags, e.g. ["Branding", "Print"]
     size        "" (normal) | "wide" (2 cols) | "tall" (2 rows)
     ratio       (optional) Card aspect ratio, mainly for social work:
                   "1x1" | "4x5" | "9x16" | "16x9". Omit for the default.
     modalSize   (optional) "large" for a wider modal on flagship work

   CARDS  (optional)
     cards       Render MORE THAN ONE gallery card for this project, all
                   linking to its single page. Each entry takes its own
                   title, desc, and either image or video/videoPoster, plus
                   ratio. Use it when one project has two formats worth
                   showing side by side — a carousel and a Reel, say.
     shortTitle  Short name for breadcrumbs and prev/next links

   MOTION  (Reels, animated posts) — MP4 only, H.264 + AAC, +faststart
     video         Path to the .mp4, e.g. "projects/social-x-reel.mp4"
     videoPoster   Poster frame (.webp). Strongly recommended — without it the
                     player is a black rectangle until the video loads, and
                     link previews have nothing to show.
     videoRatio    "9x16" for a Reel/Story, "1x1", "4x5", "16x9"
     videoCaption  One line shown above the player
     videoAlt      REQUIRED for accessibility (WCAG 1.2.1): plain-language
                     description of what happens on screen. Silent video is
                     "video-only prerecorded content" and needs one.
     videoTools    Tools used for the motion piece, e.g. ["After Effects"] —
                     shown under the player in the same style as project meta
     videoDuration ISO 8601, e.g. "PT10S" — used in the VideoObject schema
     videoLoop     Defaults to true. Set false for a video with a real ending.

   LINKS
     showcase    (optional) A deeper page you already built, relative to the
                   site root, e.g. "Devsign8-Showcase.html"
     link        (optional) An EXTERNAL url (live site, Behance, Instagram)

   CASE STUDY  — all optional, but this is the part that gets you hired.
                 Anything left empty is omitted from the page, so it is safe
                 to fill these in one project at a time.
     role        Your role, e.g. "Brand designer & developer"
     year        e.g. "2026"
     client      e.g. "Self-initiated" or a client name
     tools       Array, e.g. ["Figma", "Illustrator"]
     problem     What was broken or missing, and for whom
     constraints Array of hard limits you designed within — the most
                   persuasive thing in any case study
     approach    Your process. What you tried, and what you REJECTED and why
     outcome     Results, findings, feedback, or an honest reflection
   ========================================================================= */

const PROJECTS = [
  {
    slug: "devsign8",
    cat: "logo",
    category: "Logo & Identity",
    title: "Devsign8",
    desc: "Infinite Creativity. Limitless Digital Solutions.",
    longDesc: "Devsign8 was built on one idea: limitless creativity. From websites and branding to digital marketing, we help businesses transform ideas into impactful digital experiences that inspire, connect, and grow.",
    tags: ["Logo Design", "Branding", "Wordmark"],
    image: "projects/Devsign8-Logo.webp",
    imageFull: "projects/Devsign8-Logo-Full.webp",
    icon: "logo",
    placeholderLabel: "Logo Design",
    showcase: "Devsign8-Showcase.html",
    modalSize: "",
    size: "",
    role: "", year: "", client: "Self-initiated", tools: [],
    problem: "", constraints: [], approach: "", outcome: ""
  },
  {
    slug: "orange-magazine",
    cat: ["web", "mobile"],
    category: "Web & Mobile Design",
    title: "Orange Magazine",
    desc: "A responsive editorial platform for pop culture.",
    longDesc: "A responsive editorial platform for pop culture — K-pop, music, film & TV, and the people shaping it. Desktop & mobile, light & dark, built on one bold orange system.",
    tags: ["Web Design", "UI", "Mobile"],
    image: "projects/OrangeMagazine-Preview.webp",
    imageFull: "projects/OrangeMagazine-Full.webp",
    icon: "web",
    placeholderLabel: "Web Design",
    showcase: "OrangeMagazine.html",
    modalSize: "large",
    size: "wide",
    role: "", year: "", client: "", tools: [],
    problem: "", constraints: [], approach: "", outcome: ""
  },
  {
    slug: "digiskills",
    cat: ["mobile", "graphic"],
    category: "UI / UX Design",
    title: "DigiSkills",
    desc: "A free, offline digital-safety app that teaches kids 7–11 how to stay safe online — through play, not lectures.",
    longDesc: "DigiSkills — Be Safe Online is a free, offline-first mobile app that teaches children aged 7–11 how to stay safe on the internet through playful, audio-guided lessons. No ads, no data collection, no typing required.",
    tags: ["Mobile", "UI Design", "UX Research"],
    image: "projects/DigiSkills-Preview.webp",
    imageFull: "projects/DigiSkills-Full.webp",
    icon: "mobile",
    placeholderLabel: "Mobile UI",
    showcase: "DigiSkills.html",
    modalSize: "large",
    size: "tall",
    role: "", year: "", client: "", tools: [],
    problem: "",
    constraints: [
      "Works fully offline — no connection required",
      "No ads and no data collection",
      "No typing: the interface is audio-guided",
      "Readable and usable by children aged 7–11"
    ],
    approach: "", outcome: ""
  },
  {
    slug: "orange-magazine-logo",
    cat: "logo",
    category: "Logo Design",
    title: "Orange Magazine Logo",
    desc: "A bold, geometric wordmark paired with a simple circular icon.",
    longDesc: "The Orange Magazine logo is a combination mark that pairs a bold, geometric wordmark with a simple, circular icon. The orange color reflects the brand's energy and creativity, while the clean lines convey modernity and clarity.",
    tags: ["Logo Design", "Hybrid", "Combination Mark"],
    image: "projects/OrangeMagazine-Logo-Preview.webp",
    imageFull: "projects/OrangeMagazine-Logo-Full.webp",
    icon: "brand",
    placeholderLabel: "Brand Identity",
    showcase: "OrangeMagazine-Showcase.html",
    size: "",
    role: "", year: "", client: "", tools: [],
    problem: "", constraints: [], approach: "", outcome: ""
  },
  {
    slug: "jm-design",
    cat: "logo",
    category: "Logo & Branding",
    title: "JM Design",
    desc: "The interlocking JM monogram is the heart of the identity.",
    longDesc: "JM Design is the personal brand of Jayson Mercado Erboila — designer, developer and founder of the digital agency Devsign8.",
    tags: ["Logo Design", "Branding", "Monogram"],
    image: "projects/JMDesign-Preview.webp",
    imageFull: "projects/JMDesign-Full.webp",
    icon: "brand",
    placeholderLabel: "Brand Identity",
    showcase: "JM-Showcase.html",
    modalSize: "large",
    size: "",
    role: "", year: "", client: "Self-initiated", tools: [],
    problem: "", constraints: [], approach: "", outcome: ""
  },
  {
    slug: "digiskills-logo",
    cat: "logo",
    category: "Logo & Branding",
    title: "DigiSkills App Logo",
    desc: "A playful, friendly logo for a digital-safety app for kids.",
    longDesc: "The DigiSkills logo is a playful, friendly design that appeals to children while conveying the app's focus on digital safety. The bright colors and simple shapes make it approachable and memorable.",
    tags: ["Logo Design", "Mobile App", "Symbol"],
    image: "projects/DigiSkills-Logo-Preview.webp",
    imageFull: "projects/DigiSkills-Logo-Full.webp",
    icon: "brand",
    placeholderLabel: "Brand Identity",
    showcase: "DigiSkills-Showcase.html",
    modalSize: "large",
    size: "",
    role: "", year: "", client: "", tools: [],
    problem: "", constraints: [], approach: "", outcome: ""
  }

  ,{
    slug: "mustang-gtd",
    cat: "social",
    category: "Social",
    title: "Mustang GTD — Street Legal, But Just Barely",
    // Used in breadcrumbs and prev/next, where the full title is too long.
    // Falls back to `title` on any project that doesn't set it.
    shortTitle: "Mustang GTD",
    desc: "A four-panel seamless carousel built as one continuous frame.",
    longDesc: "A concept campaign for the Ford Mustang GTD, built as a single continuous artboard and sliced into four 4:5 panels — so the car, the smoke and the horizon line carry across the swipe instead of resetting at every frame. The spec reveal is paced: hook, lap time, horsepower, then the mark alone in the smoke.",
    tags: ["Instagram", "Carousel", "Automotive", "Art Direction"],
    image: "projects/social-mustang-gtd-cover.webp",
    imageFull: "projects/social-mustang-gtd-mockup.webp",
    // Show the four panels edge-to-edge instead of in a grid — the seam is
    // the whole idea, and a 2x2 grid hides it.
    galleryLayout: "seamless",
    gallery: [
      "projects/social-mustang-gtd-1.webp",
      "projects/social-mustang-gtd-2.webp",
      "projects/social-mustang-gtd-3.webp",
      "projects/social-mustang-gtd-4.webp"
    ],
    icon: "social",
    placeholderLabel: "Instagram Carousel",
    ratio: "4x5",

    // ── Two cards, one page ──────────────────────────────────────────
    // `cards` lets a project appear in the gallery more than once — here
    // the carousel and the Reel each get their own card, at their own
    // aspect ratio, and BOTH link to /work/mustang-gtd/. Omit `cards` on a
    // project and it renders a single card from the fields above, as normal.
    cards: [
      {
        title: "Mustang GTD — Carousel",
        desc: "A four-panel seamless carousel built as one continuous frame.",
        image: "projects/social-mustang-gtd-cover.webp",
        ratio: "4x5"
      },
      {
        title: "Mustang GTD — Reel",
        desc: "The 10-second vertical cut of the same campaign.",
        video: "projects/social-mustang-gtd-reel.mp4",
        videoPoster: "projects/social-mustang-gtd-reel-poster.webp",
        ratio: "9x16"
      }
    ],
    size: "",

    // Labelled as a concept piece on purpose. This is unsolicited spec work
    // using Ford and Mustang trademarks — presenting it as a client
    // engagement would misrepresent it, and reviewers spot that instantly.
    // Framed honestly it still reads as strong art direction.
    client: "Self-initiated concept — not affiliated with Ford Motor Company",
    role: "Concept, art direction & design",
    year: "2026",
    tools: ["Photoshop", "Illustrator"],

    // ── Motion: the companion Reel ───────────────────────────────────
    // Same campaign, second format. Kept as its own asset rather than a
    // separate project so the page tells one story across static + motion.
    video: "projects/social-mustang-gtd-reel.mp4",
    videoPoster: "projects/social-mustang-gtd-reel-poster.webp",
    videoRatio: "9x16",
    videoDuration: "PT10S",
    videoCaption: "The 10-second Reel cut — the same smoke, mark and black-to-white transition, paced for a vertical feed.",
    videoTools: ["Photoshop", "After Effects"],
    // WCAG 1.2.1 — this is prerecorded video-only content (it has no audio
    // track), so it needs a text alternative describing what happens.
    videoAlt: "Over ten seconds, a Mustang GTD emerges from a white haze — first as a pale silhouette, then sharpening into a dark, low-slung car under a rear wing. The frame inverts to black, the car dissolves back into smoke, and the outline of the running Mustang horse resolves alone above a white floor. Silent throughout.",

    // ── DRAFT COPY — rewrite these in your own voice ──────────────────
    problem: "",
    constraints: [
      "Four panels at 1080 × 1350 (4:5), Instagram's tallest feed crop",
      "Artwork must read as one continuous image across the swipe",
      "Every panel also has to work alone, since the feed may show only the first",
      "One spec per panel — the pacing is the message"
    ],
    approach: "",
    outcome: ""
  }
];


/* ============================================================================
   ★ ADDING ANOTHER SOCIAL PIECE
   ----------------------------------------------------------------------------
   Copy the mustang-gtd-carousel block above and change the values.

     ratio    "1x1"  1080×1080  IG / FB square
              "4x5"  1080×1350  IG portrait — most feed real estate
              "9x16" 1080×1920  Story, Reel cover, TikTok
              "16x9" 1200×675   FB / LinkedIn landscape

     image      card thumbnail (max 900px)
     imageFull  hero on the project page — a mockup works well here
     gallery    the individual panels, in swipe order

   Convert to WebP first (see README-IMAGES.md), then run:  node build.js
   ========================================================================= */

/* Placeholder icons (inner SVG). Used only when a project has no image. */
const ICONS = {
  logo:     '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke-linecap="round"/>',
  mobile:   '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6M9 11h4M12 19h.01" stroke-linecap="round"/>',
  graphic:  '<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M9 21V9" stroke-linecap="round"/>',
  web:      '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8h20M6 12h4M6 15h6" stroke-linecap="round"/>',
  brand:    '<path d="M12 2C8 2 4 6 4 10c0 5.5 8 12 8 12s8-6.5 8-12c0-4-4-8-8-8z"/><circle cx="12" cy="10" r="2.5"/>',
  social:   '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/>',
  campaign: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'
};

/* Available to both the browser and to build.js (Node). */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PROJECTS, ICONS };
}
