# v3 copy deck

Every visible string on `/v3`, where it lives, and whether Jayson has approved
it. **Promotion to `/` (Phase C) requires every row to be `approved`.** To
change a line, edit it here, then in the file listed, and flip its status.

Voice: the Devsign8 register. Confident, plain, no hype adjectives. Every line
does one job: headlines state a position, briefs state a problem, and CTAs name
what happens next.

## Page copy

| ID | Where | Copy | Status |
|---|---|---|---|
| hero.h1 | `src/components/v3/Hero.astro` | Jayson Mercado Erboila *(from site.ts)* | draft |
| hero.line | `src/components/v3/Hero.astro` | I help businesses look good, get found and grow online. | draft |
| hero.subline | `src/components/v3/Hero.astro` | Digital marketing & design · Toronto | draft |
| brief.h2 | `src/components/v3/Brief.astro` | Hi, I'm Jayson. | draft |
| brief.text | `src/components/v3/Brief.astro` | I'm a digital marketer and designer in Toronto. For more than five years I've helped brands in different industries, from the first chat to the monthly report, so nothing gets lost between the logo and the likes. | draft |
| brief.stats | `src/components/v3/Brief.astro` | 40+ Projects · 5+ Years · 20+ Clients *(from v1)* | draft (please confirm still accurate) |
| story.h2 | `src/components/v3/Story.astro` | How a project runs | draft |
| story.line | `src/components/v3/Story.astro` | Seven steps, from the first chat to real results. | draft |
| contact.h2 | `src/components/v3/Contact.astro` | Let's build the *next one.* | draft |
| contact.button | `src/components/v3/Contact.astro` | Email {address} | draft (address still pending: jmerboila@gmail.com vs hello.devsign8@gmail.com) |

## The seven stages (`STAGES` in `src/config/lifecycle.ts`)

Sample work is placed at the stage it was actually produced at, not grouped
by medium — round 4 replaced the three discipline plates (Web & growth /
Social media / Logo & identity) with this.

| # | Label | Headline | Body | You get | Sample work |
|---|---|---|---|---|---|
| 01 | Discover | First, I listen. | Before any design, we talk. I learn what you sell, who buys it, and what's getting in the way. | A clear picture of where you are today | — |
| 02 | Plan | Then we make a plan. | We decide who you're for, what makes you different, and what a win looks like, in numbers you can check. | A simple plan with clear goals | — |
| 03 | Brand | Your brand gets a face. | Logo, colours, fonts and tone of voice, all built from the plan. Then a short guide, so everyone uses them the same way. | Logo and brand guide | DigiSkills App Logo, JM Design, Devsign8 |
| 04 | Build | A website that works. | A fast site that looks good on every phone and turns visitors into messages and sales. Tracking goes in on day one, so we can see what works. | Website with tracking | devsign8.com |
| 05 | Be found | People can find you. | I help you show up when people search on Google, on Maps, and in AI tools like ChatGPT. | Search-ready pages and a Google Business Profile | — |
| 06 | Show up | Show up where your customers are. | Social media set up and filled with posts people stop for, planned ahead and on brand. | Social channels and a posting plan | Mustang GTD |
| 07 | Measure | Check the numbers, then do it again. | Every month, a simple report: what worked, what didn't, and what we'll try next. Then the loop starts over. | A monthly report and next steps | — |

Status: **draft** for all seven rows (label/headline/body/gets) — see
"Waiting on Jayson" in `docs/v3-todo.md`.

## Work-entry briefs (`brief` in each work entry's frontmatter)

Cards on the story stages show `shortTitle ?? title` and `brief ?? summary` —
unchanged by round 4, kept here for reference.

| Entry | Brief | Status |
|---|---|---|
| devsign8-website | *(none yet: the card shows `summary` until the questionnaire is answered)* | waiting on questionnaire |
| mustang-gtd | Four Instagram panels that had to read as one unbroken frame. | draft |
| digiskills-logo | A digital-safety app for kids needed a mark that felt like play. | draft |
| devsign8 | *(none yet: the card shows `summary`)* | draft |
| jm-design | *(none yet: the card shows `summary`)* | draft |

## Assets still needed

| Item | Where | Status |
|---|---|---|
| devsign8.com screenshot (1440 × 900; light, plus dark if the site differs) | `src/content/work/devsign8-website.md` `cover` / `coverAlt` (and `coverDark`) | needed — the cover is a stand-in (the Devsign8 wordmark); the live site serves a bot check to automated capture, so Jayson supplies the screenshot |

## Case-study questionnaire

Answer in plain sentences; the case-study copy is written from your answers
and comes back here for approval. Nothing is filled in without them.

### devsign8.com
1. Did you design and build the site yourself? Which parts, if not all?
2. What is it built with (platform or framework, hosting)?
3. When did it launch, and has it been redesigned since?
4. What was the site for: leads, credibility, showcasing templates, something else?
5. What did you do to get it found: SEO, content, social, ads?
6. What changed after launch? (This is where the analytics exports come in: GA4 users, engagement, key events, Search Console clicks.)
7. Can you send a screenshot of the homepage (1440 × 900), in light and dark if they differ? It replaces the stand-in cover.

### Mustang GTD
1. Was this ever posted? If so, on which account and when?
2. Why this car, and what was the goal of the concept?
3. Any post insights (reach, saves, shares, views)?

### DigiSkills Logo
1. Who was the client, and may they be named?
2. What year, and what was your role (sole designer, part of a team)?
3. What was the brief, in the client's words if you have them?
4. Was the logo adopted, and where is it used?
