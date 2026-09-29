# Master to-do

The ONE list of everything pending: portfolio, devsign8.com, social. Every
new "later" task goes here (his rule, 2026-09-28). `docs/v3-todo.md` is the
history log of finished rounds; nothing open lives there any more.

`[ ]` open, `[x]` done (move done items to the bottom, with the date).

## LAUNCH BY 2026-09-30: finalize the portfolio to apply for part-time digital marketing roles

Today (2026-09-29):
- [ ] 1. Commit this session's work, run `npm test` + `npm run test:build`, merge `feat/toolkit-story` into `master`, push to `main` (with his OK). Live is ~25 commits behind: no Work link, old footer and stages, Orange Magazine still up
- [ ] 4. Em-dash sweep of page titles, meta descriptions and JSON-LD (they show in Google results), plus older visible copy
- [ ] 5. Final QA on the built site: phone + desktop, light + dark, every link, Lighthouse, 404 page
- [ ] 2. Draft a digital-marketing resume (NOT the part-time retail one; no phone number or study-permit line on anything published): devsign8.com founder (web, SEO, analytics), Buffer social work, MA Digital Media, QA/testing reframed; portfolio numbers (23% search CTR, 14x hook, 12x Reels, 96/100 speed). He reviews tonight

Tomorrow (2026-09-30):
- [ ] 3. Bring back one hiring line near Contact: "Hiring? See my resume" (PDF, no phone number), tracked in GTM
- [ ] Push the resume + hiring line; re-run the build tests and a live check
- [ ] 6. (His step, or Claude in his Chrome) Resubmit the portfolio sitemap in Search Console; add the `book_call_click` trigger in the portfolio GTM container (GTM-TSQXJVC5)
- [ ] 7. (His step) LinkedIn: headline, portfolio link in Featured, open to work (part-time)
- [ ] Start applying

## devsign8.com follow-ups (unparked 2026-09-29, after his Devsign8 update)

- [ ] Buffer calendar screenshot for stage 06 (Claude in Chrome works now; crop out dates)
- [ ] Clarity and Bing Webmaster Tools need his sign-in in Chrome before anything can be read from them. Clarity is also not installed on devsign8.com yet, so it stays off the portfolio until its GTM tag is live
- [ ] Launch date for devsign8.com (stored, never shown). Search Console's first data is 2026-06-22, earlier than the 2026-07-24 now stored: confirm and update `devsign8-website.md`
- [ ] Re-read Search Console after a month of the new site: if the 23% click rate holds on more impressions, keep it; if brand searches turn out to drive it, swap stage 07's search tile for a non-brand result

## Portfolio release

- [ ] Review this session's changes in the browser, then commit
- [ ] Merge `feat/toolkit-story` into `master` and push to `main` (only with his OK; about 25 commits behind the live site)
- [ ] After the push: resubmit the sitemap in Search Console (`/MyPortfolio/sitemap-index.xml`) and check Orange Magazine has dropped out of it
- [ ] GTM (his step, in the GTM UI): Custom Event triggers for `book_call_click` and `visit_site_click`, GA4 event tags with `cta_location`, mark as key events; install Cal.com's GTM app for confirmed bookings (`bookingSuccessfulV2`)
- [ ] devsign8.com GA4: portfolio visits arrive as source `portfolio`, medium `referral`, campaign `jm_portfolio` (UTM tags on the Visit links); nothing to set up, just read it
- [ ] Phase B: consent banner with Consent Mode v2 and a short privacy page (GA cookies load before any consent today)
- [ ] Phase C: custom domain with 301 redirects from github.io; Bing Webmaster + IndexNow for the portfolio; share image; Core Web Vitals budget (the hero waits for fonts: measure the LCP)
- [ ] /work pages: mid-page and per-project "Book a call" links (audit finding)
- [ ] "Jump to results" link on story pages

## Social

- [ ] Decide: move the scheduled LinkedIn post from Tue 10:00 to Wed 16:00, the top slot in Buffer's study (Tuesday is one of the weakest days)
- [ ] Optional: paste the rewritten captions into the live Instagram posts so the portfolio and Instagram match (Instagram allows caption edits)
- [ ] After the tenth Toolkit Reel posts: add its numbers to the Toolkit results (Buffer)
- [ ] Next project write-ups: Lexus NX 350h (poster + animated), UNF; tools for the Lexus and UNF posts are still empty rather than guessed
- [ ] Confirm UNF and the Toolkit have no speech (otherwise they need .vtt captions)
- [ ] Optional: re-encode the UNF (8.7 MB) and Lexus (6 MB) videos for the web

## Content and approvals

- [ ] A résumé written for digital marketing roles (the only one on file is a general part-time version with his phone number: never publish it). Then decide whether a "Hiring?" link comes back
- [ ] Approve or rewrite the copy deck (`docs/copy/v3-copy-deck.md`), including the seven stage lines in `src/config/lifecycle.ts`
- [ ] JM Design and Devsign8 logo pages still carry "CASE STUDY INCOMPLETE": write the short story behind each mark (the reels now play there)
- [ ] Em-dash sweep of older copy: site default description and page titles (they show in Google results), JM Design intro, older write-ups

## Done

- [x] 2026-09-29: devsign8.com footer headings fixed (h4 to h2); shipped inside the other chat's legal-and-headings upload, verified live; PageSpeed Accessibility 100. Stage 04 and the devsign8.com page now show 100 for accessibility
- [x] 2026-09-29: Cloudflare Fonts on; PageSpeed mobile back to 96 and 97 (LCP 2.0 s). Speed restored on stage 04 and the devsign8.com Measure chapter, told as the 90 to 96 fix
- [x] 2026-09-29: devsign8.com checked after his update. /web-design/ live, so "a page for every service" is on the portfolio; AI crawlers now allowed (Cloudflare item closed); PageSpeed re-run (90, fonts); Clarity claim removed (not installed); stage 07 search tile added from Search Console (23% click rate, page one); devsign8.com-side fixes moved to the Devsign8 master to-do, section 3b

- [x] 2026-09-28: marketing audit; hero role line; "Book a call"; booking-click tracking; stages 03 to 07 rebuilt as short teasers with links inside; devsign8.com shown as the live company site; shared link arrow; timeless pass (no visible dates); social captions rewritten
- [x] 2026-09-28: devsign8.com screenshots, light and dark, desktop and phone (replaced the wordmark stand-in)
