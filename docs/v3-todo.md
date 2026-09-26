# v3 to-do

The running list for the v3 portfolio — the homepage since 2026-09-24 (it was previewed at `/v3`). Branch: `master`, pushed to `main` on `jmerboila/MyPortfolio`.
`[x]` done (with commit), `[ ]` open.

## Round 3 — header, contact, footer, reveals (2026-09-22)

- [x] Remove the `← v2` link from the header — `475f138`
- [x] Header = JM monogram (48px; 40px on phones) + sun/moon toggle + **Let's talk** — no Work/Process/About/Contact links, no mobile Menu — `475f138`
- [x] "Let's talk": smaller, no icon, border-beam effect (plays ~5 s then stops, replays on hover/focus — WCAG 2.2.2) — `475f138`
- [x] Better discovery-call email: subject and a short prompt list in the body — `475f138`
- [x] Footer as icon links: LinkedIn, Instagram, TikTok (`@devsign8`), Devsign8 wordmark from `Devsign8.ai` — `dca6885`
- [x] Contact: drop the social links and visible email; **Let's build the next one.** big, as the email link, with a split-letter roll on hover — `0f50058`
- [x] Every text block reveals on scroll — `05fba75`
- [x] TikTok handle corrected to `@devsign8` everywhere (also `/social`) — `ad4d6c9`

## Round 4 — hero name-sandwich, seven-stage story (2026-09-23)

- [x] **Hero:** JAYSON MERCADO ERBOILA full width behind/in front of the mesh head, aria-hidden outline crossing the face, subtle tilt from the cursor (touch gets scroll parallax instead); still under reduced motion — `7fbc3c9`
- [x] Intro reworked to a single readable column, portrait moved into the hero, "About" eyebrow dropped — `f88ad71`
- [x] **Story sections after the hero:** the seven stages (Discover → Measure) unfold as you scroll, with sample work placed at each stage; desktop stage rail tracks progress — replaces the three discipline plates — `e02c207`
- [x] Copy deck updated for the hero, intro and seven stages — `6f33e08`
- [x] Build + unit tests updated for the new markup — `c97363f`

## Round 5 — hero layout, typewriter, intro, footer (2026-09-23)

Built and verified in the browser (light + dark, 1440 and 500 wide); `npm test` 12/12, `npm run test:build` 25/25. Not committed yet.

- [x] **1. Lines inside the outlined letters** — the cause was Inter Tight's overlapping glyph pieces (A crossbar, R leg, D stem), which `-webkit-text-stroke` traces one by one. The static Google cut has the same overlaps, so a font swap did not help (tried, reverted). Fixed with an SVG filter: the copy is painted solid and `#v3-hero-outline` keeps only a 1.25px ring inside each letter's edge
- [x] **2. New hero layout** from his sketch — wide screens: JAYSON / MERCADO / ERBOILA right-aligned, MERCADO filling 62% of the width (13.4cqi), head in the right column starting at 48%, so each line's last letter crosses the head as an outline; cursor tilt kept. Phones keep the centred stack with the head behind the name
- [x] **3. Stage rail on the right edge** — labels now open leftward
- [x] **4. "Let's talk" beam loops forever** — his call; stops under reduced motion. Known WCAG 2.2.2 gap (no pause control), recorded in `v3.css`
- [x] **5. "Digital marketing & design · Toronto" removed.** Naming rule recorded in the copy deck: **Design & Digital Marketing**
- [x] **6. Typewriter** — *I help businesses* + look good → get found → grow online, looping (his call), pauses off-screen; screen readers get the full sentence once; reduced motion / no JS show the full sentence. Size: column ÷ 13.2 so "…grow online" fits one line, capped 2.25rem (36px wide screens, ≈26px phones), floored 1.125rem for zoom
- [x] **7. Theme toggle shows the destination** — moon in light mode, sun in dark
- [x] **8. Intro rewritten** (version A): "I care about smart design: work that does more than look good…" — 28px at a 40ch measure (5 lines on desktop); the "Hi, I'm Jayson." heading raised to `--step-4` so it reads as a heading, not a caption
- [x] **9. Stats counters removed** (markup, count-up code, CSS, tests)
- [x] **10. Contact:** "Got something epic in mind? *Let's build it.*" — two lines, serif accent on the answer. Footer JS animation: **still on hold, his pick**
- [x] **11. Footer:** © left, icons right, TikTok off the footer (one line in `src/config/v3.ts` to bring back)

## Round 6 — spacing, one screen per section, contact pull, progress strip (2026-09-23)

Verified at 1440, 768 and 390 wide; `npm test` 12/12, build tests 29/29. Not committed yet.

- [x] **Hero, desktop:** head moved right so only the hair/ear edge meets the name (columns 54.5 / 7.5 / 38 — the portrait file has ≈5% transparent margin on its left). **Tablet** unchanged. **Phones:** head above the name, neck overlapping the top of JAYSON
- [x] **Phones were laid out 426px wide on a 390px screen** — the head's halo overflowed and the browser widened the page. Fixed with `overflow-x: clip` on the hero
- [x] **Typewriter:** centred under the name on desktop; the typed ending is purple Instrument Serif italic with a purple caret (his pick)
- [x] **Intro:** his new copy, set bigger (24px phones → 40px wide, 30ch), heading at `--step-5`
- [x] **One screen per light section:** intro, story heading, every stage and contact fill at least one viewport (`.v3-screen`); stages with work run longer
- [x] **Contact:** bigger (≈138px at 1440), arrow after "Let's build it." that flies out and back in on hover, plus a magnetic pull toward the cursor (his pick); nothing loops
- [x] **Email:** the hiring P.S. removed from the discovery-call email. Email-only kept for now (his call) — see the note on visitors without a mail app
- [x] **Below 80rem the rail becomes a progress strip** under the header: "02 Plan" + seven filling segments, only while the story is on screen, aria-hidden. Also fixed the rail keeping the last stage lit after scrolling back to the hero

## Round 7 — intro size + reveal, per-word contact roll, small print (2026-09-23)

`npm test` 12/12, build tests 29/29. Not committed yet.

- [x] **Intro sized as display type:** 52px wide / ≈38px tablet / ≈29px phone at 24ch — about 7 lines, fills one screen. "Hi, I'm Jayson." becomes the purple serif-italic greeting above it
- [x] **Ink reveal starts from a faint ghost** (14% text on background) instead of the already-readable dim grey, and finishes by the time the paragraph is centred. Trade-off noted in `v3.css`: un-inked words are below AA while you scroll; the resting state is full contrast
- [x] **Contact roll is per word:** only the word under the cursor rolls, landing in a random font (brand serif upright/italic, Inter Tight 200/900/italic, system mono — no extra downloads) and a random colour from five AA-checked hues per theme. Keyboard focus still rolls every word
- [x] **© line** down to 13px

## Round 8 — intro type, hand-drawn stage loop (2026-09-23)

`npm test` 12/12, build tests 31/31. Not committed yet.

- [x] **Intro:** greeting back in the sans and now the headline (≈114px wide / ≈47px phones); paragraph ≈56px at 24ch; words ink in from a near-invisible 6% ghost and are always fully inked at rest (reveal now ends on the section reaching the top, not the paragraph position)
- [x] **"How a project runs" gets a hand-drawn loop** (`StoryLoop.astro`): the seven stages round a sketchy loop, heading inside it, Measure → Discover arrow in purple with a scribbled "then again!"; phones get a wiggly vertical line with a return arrow up the side. Drawn at build time with rough.js (nothing shipped to the browser), labels in Caveat (≈30KB font), draws itself on once when it scrolls into view. Each drawing is one accessible image with a description of all seven stages
- [x] New doodle notes per stage (copy to approve): we talk · set the goals · logo + look · your website · Google, Maps, AI · social posts · monthly report

## Round 9 — periods, greeting size, the real repeat (2026-09-23)

`npm test` 12/12, build tests 32/32. Not committed yet.

- [x] **Typewriter endings end with a period** — look good. / get found. / grow online. (each is a full sentence)
- [x] **"Hi, I'm Jayson." a notch smaller** — ≈41px phones → 96px wide
- [x] **Diagram starts when you're on the section** (its top at 35% of the viewport), hidden until then
- [x] **Phones: the diagram section fits one screen** (tighter line, drawing capped to what the heading leaves)
- [x] **The diagram now tells the real process:** 01 → 07 drawn once in ink; then a purple cycle repeats — 07 curves back to 05 ("then again!"), 05 → 06 → 07 redraw in purple, fade, again. Runs only while the section is on screen; static (reduced motion) shows the purple cycle drawn. Screen-reader description says the work loops back to 05

## Round 10 — erase-and-redraw loop, contact settles (2026-09-23)

`npm test` 12/12, build tests 33/33. Not committed yet.

- [x] **Diagram loop:** after the return arrow reaches 05, the arrows and circles of 06 and 07 are rubbed out (last-drawn first) and redrawn in purple; the return arrow is rubbed out and redrawn each lap
- [x] **Contact:** magnetic drift removed; the per-word roll into a random font + colour stays — this IS the contact/footer animation (his pick), so that open item is closed

## Round 11 — the monthly loop, tightened (2026-09-23)

`npm test` 12/12, build tests 33/33. Not committed yet.

- [x] **"then again!" arrow and note come and go together** each lap (the note used to stay while its arrow erased and redrew)
- [x] **05 joins the erase:** each lap rubs out 05, 06, 07 and the arrows between them, then redraws them in purple in reading order
- [x] **Doodle notes:** 05 "rank on Google + AI", 06 "keep posting", 07 "monthly report" (unchanged). SEO/AEO/GEO added to stage 05's body text instead: "…then keep improving it every month (SEO, AEO and GEO)."

## Round 12 — one loop weight, even timing, loop-only notes (2026-09-23)

`npm test` 12/12, build tests 34/34. Not committed yet.

- [x] **One bold weight (3px) for everything in the loop:** the "then again!" arrow, the purple arrows, and the 05–07 circles once the loop redraws them (the rest of the diagram stays at its fine 1px line)
- [x] **"then again!" arrow + note arrive and leave in the same 0.6 s**
- [x] **Loop-only notes:** first play shows "Google, Maps, AI" and "social posts"; the first lap cross-fades 05 → "rank on Google + AI" and 06 → "keep posting", which stay while it loops. Static (reduced motion) shows the first-play notes

## Round 13 — the loop, debugged (2026-09-23)

`npm test` 12/12, build tests 36/36. Not committed yet.

- [x] **Root cause of the "delay": GSAP rounds px values by default.** With pathLength="1" the dash offset only runs 1 → 0, so every stroke snapped from hidden to fully drawn halfway through its tween — nothing ever drew on. `autoRound: false` on every stroke tween fixes the first pass and the loop
- [x] rough.js double strokes split into separate paths (they drew one after the other, reading as a pause mid-line)
- [x] Arrowheads draw after their line lands, not alongside it
- [x] Loop redraw is one continuous pen stroke at an even speed on an explicit clock (measured: gaps ≤ 0.01 s between pieces); the erase is a quick rewind
- [x] "then again!" scribble removed

## Round 14 — the cycle ends at 05 (2026-09-23)

`npm test` 12/12, build tests 36/36. Not committed yet.

- [x] **A cycle is 05 → 06 → 07 → back to 05**, drawn as one continuous purple stroke; the return arrow is the LAST stroke, not the first. When it closes, everything in the loop (arrows, circles, the 05/06/07 numbers) clears and the next cycle starts fresh from 05 after a 0.6 s beat
- [x] After the first pass, the return arrow draws once to close the first cycle, then the loop clears and the notes switch to their loop wording

## Round 15 — 05 stays, first return arrow thin (2026-09-24)

- [x] The first-pass 07 → 05 arrow draws thin and in ink like 01 → 05; it turns thick purple only in the loop
- [x] 05 stays through the loop (each cycle starts from it); it thickens in place to the loop weight at the first clear. Only the arrows, 06 and 07 clear and redraw

## Round 16 — no dots after a clear (2026-09-24)

- [x] Small dots were left where erased strokes started/ended (most visible on phones): a dash edge sat exactly on the path's end, and a zero-length dash with round caps paints as a dot. Dash pattern is now "1 on, 2 off" with hidden states just past ±1 (±1.02), so a hidden dash never touches the path. Verified side by side on a cloned drawing: old settings dotted, new clean
- [x] Follow-up: dots still came back after the loop repeated. GSAP rounds values in places `autoRound: false` doesn't reach (a fromTo's immediate render, and a repeating timeline's rewind), turning 1.02 back into the dot value 1. Strokes now use pathLength="100" (hidden at ±102), where a rounded value is still safe. Scanned 40 s / 7 clears on a phone viewport: no stroke ever rests on a dot value

## Next

- [x] **Booking: Cal.com (his pick, 2026-09-24).** "Let's talk" and the contact heading now open https://cal.com/jmerboila/discovery-call (30 min, Cal Video, Toronto time) — `CONTACT_HREF` in `src/config/lifecycle.ts`. A plain link, no Cal.com embed script (keeps third-party JS and cookies off the page until the Phase B consent banner exists). The mailto and its prompt list are gone; the questions belong in the Cal.com event's booking form
- [x] Cal.com event set up (2026-09-24): Google Meet + attendee-phone locations, email confirmation, six booking questions (identifiers `business`, `links`, `services`, `goal`, `timeline`, `budget` — usable as URL prefills, e.g. `?services=Website`), description, minimum notice. Checked on the public page as a visitor, stopping before Confirm
- [x] ~~"Or email me" line under the contact heading~~ — declined (his call, 2026-09-24): booking is the only contact action on v3. The build test "no mailto left on the page" holds it

## Launch — v3 replaces v1 (2026-09-24)

His call: this project replaces v1 in `jmerboila/MyPortfolio`, v3 as the homepage.

- [x] v1 backed up: `v1-final` tag + `v1-archive` branch on GitHub, and `Desktop\MyPortfolio\MyPortfolio-v1-backup-2026-09-24.bundle` (full history, verified)
- [x] Base path `/MyPortfolio2` → `/MyPortfolio` (`astro.config.mjs` + `src/config/site.ts`)
- [x] v3 is `/`: indexable, with the shared `SeoHead` (canonical, share tags, JSON-LD) and `GoogleTagManager` it lacked as a preview. v2's homepage and the v2b preview removed (in git history); `/v3` redirects to `/`
- [x] v1's six root pages (`DigiSkills.html`, `JM-Showcase.html`, …) redirect to their `/work/` case studies; v1's `/work/<slug>/` URLs already match
- [x] Case-study header: Services → **Process** (`/#story`); breadcrumb "Work" → `/work/`
- [x] `.github/workflows/deploy.yml` (withastro/action@v6 → deploy-pages@v5, on push to `main`)
- [x] **His step:** repo Settings → Pages → Source → **GitHub Actions**
- [x] **LIVE 2026-09-24** at https://jmerboila.github.io/MyPortfolio/ — pushed `master` → `main` (`1ade51b..8f9a71f`, a fast-forward on top of v1's history, no force). Actions run 35965678417: build + deploy green. Checked live: home, /work, a case study, /social, sitemap, robots all 200; /v3 and the old .html pages redirect; homepage indexable with canonical, JSON-LD, GTM, Cal.com link; hero renders in headless Chrome at 1440
- [ ] After it's live: resubmit the sitemap in Search Console (`/MyPortfolio/sitemap-index.xml`; v1's was `sitemap.xml`)
- [x] ~~`audio/ambient.mp3` 404 on the case-study pages~~ — the music toggle is removed (his call, 2026-09-25)

## Social page (2026-09-25)

- [x] /social moved onto the v3 shell: monogram header + "Let's talk", purple palette, v3 footer, heading reveals, and the homepage's contact section at the end. `V3Layout` takes `rail` (homepage only) so the stage rail stays off sub-pages
- [x] Breadcrumbs fixed: "Home" sat ~10px above "/ Social" (the link was a 44px block with its text pinned to the top). Now `src/components/v3/Breadcrumbs.astro`, items centred on one line
- [x] **One folder per post:** `src/content/social/<post>/index.md` with its images and video beside it. Copy `_new-post/` to start (folders starting with `_` never publish). Videos in the folder are resolved by `src/lib/social-media.ts`; verified in dev and in a build
- [x] Sample TikTok removed (the template replaces it)
- [x] His first four posts in (2026-09-25): Lexus NX 350h poster, Lexus animated poster (4:5 feed video, silent), UNF (16:9 feed video — new `16x9` ratio), Devsign8 safe-zone toolkit (10 Reels as one 3:4 carousel). Covers pulled from the videos, alt text written, files with spaces renamed. Video slides can now be `silent: true`
- [x] **Video playback (his call, 2026-09-25):** nothing autoplays; a press plays WITH sound (mute buttons and the `silent` field removed); starting one pauses any other; a video pauses when under 2% of it shows (scrolled away or swiped off in a carousel). Verified with real clicks
- [x] **Cards cleaned up (his call, 2026-09-25):** platform badge, client line and case-study / "View on" links removed; filters are now Reels / Posts / Carousels (optional `category:` per post, else read from the shape — his three `-reel` folders are set to reel); carousel arrows are the play button's see-through dark disc; Instagram frames show "JM Design" with a blank grey avatar (TikTok unchanged)
- [x] Card clean-up round 2 (2026-09-25): "Describe this video" removed; double-tap-to-like removed so every heart behaves the same (click = red, click again = clear); the "Showing…" filter status is screen-reader only
- [x] **"How I made it" pages** (`src/pages/social/[slug].astro`, 2026-09-25): playable frame, caption, "What I used" (`tools`), the Markdown body as the write-up, "Behind the scenes" (`screens`), prev/next, contact. A card links to its page once the post has any of those. Six Hook / Story / Offer write-ups drafted (Russell Brunson's framework, his pick) — each marked DRAFT in an HTML comment. Build tests in `tests/build/social-build.test.ts`
- [ ] **His step:** check the six write-ups; tools for the Lexus poster, Lexus animated poster and UNF (left empty rather than guessed); confirm After Effects + Premiere Pro for the toolkit; drop Premiere / After Effects screenshots into each post's folder
- [ ] **His step:** real captions for all six posts (every caption is a draft, marked TODO); `client:` for UNF / Lexus if they were client work; confirm UNF and the toolkit have no speech (else they need .vtt captions)
- [ ] Optional: re-encode UNF (8.7 MB, 8.5 Mbps) and the Lexus video (6 MB) for the web — videos autoplay when scrolled to, so they download on view
- [ ] /work and the case studies still use the v2 header and palette — same move as /social when he wants it

## Projects on /social (2026-09-25)

Spec `docs/superpowers/specs/2026-09-25-social-projects-mustang-story-design.md`, plan `docs/superpowers/plans/2026-09-25-social-projects-mustang-story.md`. Built on branch `feat/social-projects`.

- [x] /social is project shelves: one band per project (a Work entry; posts join through `work:`), pieces playable in place, "Read the story" when the project has one. Filters and the per-post "How I made it" pages are gone
- [x] The Mustang is **2026 Ford Mustang GTD** everywhere; its page moved to `/work/2026-ford-mustang-gtd/` (old URL redirects). Real captions from Buffer; pieces named Reel Reveal and Seamless Carousel
- [x] All Work pages on the v3 shell
- [x] The launch story: 7 chapters over 6 homepage stages (research chart, plan, Photoshop and After Effects screens, the artboard slicer with 3 earlier versions, captions, launch-day clock, results), sources, then the two posts. Scroll motion verified in headless Chrome; reduced motion shows the finished state; keyboard focus never hidden
- [x] Page titles use " | " instead of an em dash (his no-em-dash rule)
- [x] **Devsign8 Instagram Safe-Zone Toolkit** story (2026-09-26) at `/work/devsign8-ig-safe-zone-toolkit/`: 7 chapters, a formats table from his `Devsign8-IG-Template.jsx` (revision 3), Photoshop templates built by that script, the hook-then-card formula, a real caption, the 3 to 29 September timeline, and results from Buffer (326 reach, best 84, 0 comments). Shelf moved to second
- [ ] After 29 September: add the tenth Reel's numbers to the toolkit results (Buffer)
- [x] Toolkit shown as ten real Reels in one swipeable row (uncropped 9:16, real captions, tenth is a draft until 29 Sep); every post at real phone size (390px, shrinking only to fit short laptop screens); ‹ › row arrows for mouse users; Reel top bar shows the piece name, no camera icon
- [x] **Work by type (2026-09-26)**, spec `docs/superpowers/specs/2026-09-26-work-types-nav-footer-design.md`: every project at `/work/<type>/<project>/` (type = first of its `cats`, one helper `src/lib/work-path.ts`); `/social` moved to `/work/social/`; `/work/logo/` and `/work/web/` pages; every old URL and v1 stub lands on the final page in one hop. **Work** in the header; the Show up stage links "See all my social media work"; new footer (large JM mark, Work menu: Logo, Web, Social; © and icons kept). Shelf labels "Launch campaign" and "Content series". DigiSkills app hidden (`draft: true`, logo stays); Orange Magazine removed
- [x] **One layout under Work (2026-09-26, his call):** every Work page opens like /work/social/ (PageHead: breadcrumbs, big heading with a serif accent word, lede) and lists shelves (Shelf.astro + shelves.css, shared with Social). /work/ is a hub (one shelf per type with its covers); Logo Design and Web Design list one shelf per project with a large cover. The old filterable card grid (WorkGrid) is gone. Types renamed Logo Design, Web Design, Social Media; footer Work menu stacks vertically. **Back to top** link on every page (NN/g guidelines: lower right, labelled, appears after 3 screens, arrow always points up)
- [ ] **Next:** merge `feat/toolkit-story` into `master`, then push (only with his OK; far behind live)
- [ ] "Jump to results" link on story pages
- [ ] Next projects: Lexus NX 350h (poster + animated), UNF. Their draft notes are in their post folders
- [ ] Em-dash sweep of older copy (site default description, JM Design intro, other case studies)
- [ ] Toolkit: swap the draft captions for the real ones in Buffer

## Waiting on Jayson

- [ ] Approve the new hero line, intro and 7-stage copy (copy deck)
- [ ] devsign8.com screenshot, 1440 × 900 (light, plus dark if it differs) — the Build stage's work card uses the wordmark as a stand-in
- [ ] Approve or rewrite the copy deck (`docs/copy/v3-copy-deck.md`), incl. the seven stage one-liners in `src/config/lifecycle.ts`
- [ ] Answer the case-study questionnaire (in the copy deck)
- [ ] Analytics exports (GA4, Search Console, social) — kept outside the repo
- [x] Contact email: `jmerboila@gmail.com` (his pick, 2026-09-24 — already the value in `src/config/site.ts`)
- [x] Merge `feat/v3-phase-a` into `master` (his pick, 2026-09-24 — `7b02014`)

## Later phases

Parked (his call, 2026-09-25): Phase B and C come back together later as one GA4 + GTM setup and the whole SEO/AEO/GEO pass.

- [ ] **Phase B:** Consent Mode v2 banner (site-wide; v2 runs GTM with no consent today), GTM events, UTM convention
- [ ] **Phase C:** launch pack — custom domain, Bing Webmaster + IndexNow, JSON-LD, share image, Core Web Vitals budget (the hero headline waits for fonts before revealing — an LCP risk to measure). Check Cloudflare isn't blocking Bingbot/AI crawlers on devsign8.com.

## Done

- [x] Clipped descenders in revealed headings — `af7088c`
- [x] JM monogram as logo + light/dark favicon, manifest fixed — `2737594`
- [x] First navigation pass (superseded by round 3) — `ad4d6c9`
