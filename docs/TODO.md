# Master to-do: My Portfolio

The ONE list of everything pending for the portfolio (his rule, 2026-09-28;
portfolio only since 2026-09-29). Social posting for Devsign Hacks (Buffer,
Instagram, Facebook, Reel re-cuts) lives in `C:\dev\Devsign8\00-MASTER TODO.md`,
section 7. devsign8.com fixes live in that file too; only the items that change
the portfolio are kept here. `docs/v3-todo.md` is the history log of finished
rounds; nothing open lives there.

The repo lives at `C:\dev\MyPortfolio` since 2026-09-30, outside OneDrive (see
Done). GitHub is its backup: push after every working session.

`[ ]` open, `[x]` done (move done items to the bottom, with the date).

## Recovery after the OneDrive rollback (2026-09-29)

- [x] 2026-09-30: OneDrive Restore could not help (the cloud had no history for the month before). Recovered instead from a to-do backup, the Windows Recycle Bin, Buffer and the Claude session logs into `C:\dev\recovered`; the Devsign8 folder now lives at `C:\dev\Devsign8` (see its section 0)
- [ ] Back up `C:\dev` somewhere that is not a live sync (an external drive); the portfolio code is also on GitHub
- [ ] (His call) Delete or archive the broken `OneDrive\Desktop\MyPortfolio\MyPortfolio2` copy (its `.git` is incomplete) so nobody edits it by mistake; `D:\!OneDrive2026\Desktop\MyPortfolio` is an older broken copy too

## Launch (target 2026-09-30): apply for part-time digital marketing roles

- [ ] (His step, or Claude in his Chrome) Resubmit the sitemap in Search Console (`/MyPortfolio/sitemap-index.xml`) and check Orange Magazine has dropped out of it
- [ ] (His step, in the GTM UI, container GTM-TSQXJVC5) Custom Event trigger for `book_call_click` with a GA4 event tag carrying `cta_location`, marked as a key event. Later: the same for `visit_site_click`, and Cal.com's GTM app for confirmed bookings (`bookingSuccessfulV2`)
- [ ] (His step) LinkedIn: headline, portfolio link in Featured, open to work (part-time)
- [ ] Start applying

## Portfolio release

- [ ] devsign8.com GA4: portfolio visits arrive as source `portfolio`, medium `referral`, campaign `jm_portfolio` (UTM tags on the Visit links); nothing to set up, just read it
- [ ] Phase B: consent banner with Consent Mode v2 and a short privacy page (GA cookies load before any consent today)
- [ ] Phase C: custom domain with 301 redirects from github.io; Bing Webmaster + IndexNow for the portfolio; share image; Core Web Vitals budget (the hero waits for fonts: measure the LCP)
- [ ] /work pages: mid-page and per-project "Book a call" links (audit finding)
- [ ] "Jump to results" link on story pages

## Social Media work on the portfolio

- [ ] Story vs Story ad safe zones (researched 2026-09-29): Meta's Ads Guide gives 14% top, 35% bottom, 6% sides for Story ads AND Reels ads (672px bottom); Meta publishes no organic Story number. Reel 04 applies 672px to an organic Story. Waiting on his OK for: (1) Reel 04's portfolio caption, "672px is the safe bottom for any Story: it's Meta's rule for Story ads, and it clears the reply bar and stickers in organic Stories too"; (2) the Toolkit story line "20% for an organic Story" to say it is Meta's older Story figure, kept as a Devsign8 margin. Cross-check with `Devsign8\01-Current\IG Tool Kit\ig_specs.html`
- [ ] 2026 Lexus NX story: add the Results chapter (stage `measure`, `results:` from Buffer, and what I'd test next) once all three posts have a week of numbers, from about Thu Oct 8
- [ ] Toolkit Reel #10 (live on the shelf since 2026-09-29): add its numbers to the Toolkit results (Buffer) about a week after posting, from about Tue Oct 6; then the results can say ten Reels instead of the first nine
- [ ] Next write-up: UNF; its tools are still empty rather than guessed
- [ ] Confirm UNF and the Toolkit have no speech (otherwise they need .vtt captions)
- [ ] Optional: re-encode the UNF video (8.7 MB) for the web

## devsign8.com items that change the portfolio

- [ ] Buffer calendar screenshot for stage 06 (Claude in Chrome works now; crop out dates)
- [ ] Clarity is not installed on devsign8.com yet (its install is in the Devsign8 to-do, 3b), so it stays off the portfolio until its GTM tag is live. Bing Webmaster Tools needs his sign-in in Chrome before anything can be read from it
- [ ] Launch date for devsign8.com (stored, never shown). Search Console's first data is 2026-06-22, earlier than the 2026-07-24 now stored: confirm and update `devsign8-website.md`
- [ ] Re-read Search Console after a month of the new site: if the 23% click rate holds on more impressions, keep it; if brand searches turn out to drive it, swap stage 07's search tile for a non-brand result

## Content and approvals

- [ ] Approve or rewrite the copy deck (`docs/copy/v3-copy-deck.md`), including the seven stage lines in `src/config/lifecycle.ts`
- [ ] JM Design, Devsign8 and DigiSkills App Logo pages still carry "CASE STUDY INCOMPLETE": write the short story behind each mark (the reels already play on the first two). The hidden notes on those pages still hold em dashes (page source only); they go when the stories are written

## Parked (his call 2026-09-29)

- [ ] Hiring line near Contact: "Hiring? See my resume" (PDF without the phone number, tracked in GTM). The resume is ready: `JaysonErboila_Resume_Web.pdf` in Dropbox\Job Hunt 2026
- [ ] Push the resume and hiring line; re-run the build tests and a live check

## Done

- [x] 2026-09-30: LIVE (94da338, deploy verified). Social page redesign, Lexus story, short captions, Toolkit Reel 10 and the devsign8.com showcase pushed to main at his request, a day before the tutorial posts on Instagram
- [x] 2026-09-30: devsign8.com screenshots re-taken from the live site (new "small businesses in Markham, across the GTA" copy), desktop and phone, light and dark. The home page's desktop-plus-phone layout is now one component (SiteShowcase.astro, shots in `src/config/site-shots.ts`) used on the home page, the Work and Web Design cards and the devsign8.com "Built" chapter, always in the theme opposite the page. Social row arrows are white discs with black arrows
- [x] 2026-09-30: after OneDrive deleted 64 project files (Sep 29, 7:57 PM) and then rolled the folder back to about Sep 26 (11:15 PM, with a broken `.git`), the repo was cloned fresh from GitHub (facfc2f) to `C:\dev\MyPortfolio` and this session's work was rebuilt on branch `social-redesign`. Lost for good: local commit 0637fbe (it only recorded the launch-day progress now listed under Done)
- [x] 2026-09-29: social page redesign. Two or three posts sit side by side when there is room (swipe row below that, no scroll bar anywhere); cleaner frames (no ⋯ menus, Follow pill or spinning record; JM monogram avatar); every caption shortened to the hook and one line with two hashtags (Lexus, Mustang, UNF, all ten Toolkit Reels); 2026 Lexus NX story page with six chapters; Toolkit Reel 10 live and the story says ten Reels in four weeks
- [x] 2026-09-29: Lexus NX shelf on /work/social/ is three posts: poster, NX 350h Reveal (9:16 with sound) and How I built it (the InDesign tutorial). Web copies trimmed before the "tomorrow" and "Next:" cards (0.5 MB and 2.3 MB)
- [x] 2026-09-29: launch prep. Work merged and pushed (facfc2f, deploy verified live); em dashes gone from page titles, meta descriptions, JSON-LD and visible copy; final QA (phone + desktop, light + dark, links, Lighthouse, 404); digital-marketing resume drafted (master in Dropbox\Job Hunt 2026, original in !BackUp)
- [x] 2026-09-29: devsign8.com footer headings fixed (h4 to h2); shipped inside the other chat's legal-and-headings upload, verified live; PageSpeed Accessibility 100. Stage 04 and the devsign8.com page now show 100 for accessibility
- [x] 2026-09-29: Cloudflare Fonts on; PageSpeed mobile back to 96 and 97 (LCP 2.0 s). Speed restored on stage 04 and the devsign8.com Measure chapter, told as the 90 to 96 fix
- [x] 2026-09-29: devsign8.com checked after his update. /web-design/ live, so "a page for every service" is on the portfolio; AI crawlers now allowed (Cloudflare item closed); PageSpeed re-run (90, fonts); Clarity claim removed (not installed); stage 07 search tile added from Search Console (23% click rate, page one); devsign8.com-side fixes moved to the Devsign8 master to-do, section 3b
- [x] 2026-09-28: marketing audit; hero role line; "Book a call"; booking-click tracking; stages 03 to 07 rebuilt as short teasers with links inside; devsign8.com shown as the live company site; shared link arrow; timeless pass (no visible dates); social captions rewritten
- [x] 2026-09-28: devsign8.com screenshots, light and dark, desktop and phone (replaced the wordmark stand-in)
