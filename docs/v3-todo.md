# v3 to-do

The running list for the `/v3` portfolio. Branch: `feat/v3-phase-a`.
`[x]` done (with commit), `[ ]` open.

## Round 3 — header, contact, footer, reveals (2026-09-22)

- [ ] Remove the `← v2` link from the header
- [ ] Header = JM monogram (48px; 40px on phones) + sun/moon toggle + **Let's talk** — no Work/Process/About/Contact links, no mobile Menu
- [ ] "Let's talk": smaller, no icon, border-beam effect (plays ~5 s then stops, replays on hover/focus — WCAG 2.2.2)
- [ ] Better discovery-call email: subject and a short prompt list in the body
- [ ] Footer as icon links: LinkedIn, Instagram, TikTok (`@devsign8`), Devsign8 wordmark from `Devsign8.ai`
- [ ] Contact: drop the social links and visible email; **Let's build the next one.** big, as the email link, with a split-letter roll on hover
- [ ] Every text block reveals on scroll
- [x] TikTok handle corrected to `@devsign8` everywhere (also `/social`)

## Next

- [ ] **Hero:** JAYSON MERCADO ERBOILA full width, mesh head layered into the name, subtle tilt from the cursor; scroll parallax on phones; still under reduced motion — *Jayson to choose the line under his name (keep "Marketing strategy and the design to carry it" or rewrite)*
- [ ] **Story sections after the hero:** the seven stages (Discover → Measure) unfold as you scroll, with sample work placed at each stage; desktop stage rail tracks progress — replaces the three discipline plates

## Waiting on Jayson

- [ ] devsign8.com screenshot, 1440 × 900 (light, plus dark if it differs) — the Web card uses the wordmark as a stand-in
- [ ] Approve or rewrite the copy deck (`docs/copy/v3-copy-deck.md`), incl. the seven stage one-liners in `src/config/lifecycle.ts`
- [ ] Answer the case-study questionnaire (in the copy deck)
- [ ] Analytics exports (GA4, Search Console, social) — kept outside the repo
- [ ] Contact email: `jmerboila@gmail.com` or `hello.devsign8@gmail.com`
- [ ] A booking page (Calendly / Cal.com) when ready — replaces the email link in one line
- [ ] Merge / PR / keep decision for `feat/v3-phase-a`

## Later phases

- [ ] **Phase B:** Consent Mode v2 banner (site-wide; v2 runs GTM with no consent today), GTM events, UTM convention
- [ ] **Phase C:** launch pack — custom domain, Bing Webmaster + IndexNow, JSON-LD, share image, Core Web Vitals budget (the hero headline waits for fonts before revealing — an LCP risk to measure). Check Cloudflare isn't blocking Bingbot/AI crawlers on devsign8.com.

## Done

- [x] Clipped descenders in revealed headings — `af7088c`
- [x] JM monogram as logo + light/dark favicon, manifest fixed — `2737594`
- [x] First navigation pass (superseded by round 3) — `ad4d6c9`
