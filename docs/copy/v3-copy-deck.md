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
| open.eyebrow | `src/components/v3/Open.astro` | Jayson Mercado Erboila · Digital Marketing Specialist & Designer · Toronto *(from site.ts)* | draft |
| open.h1 | `src/components/v3/Open.astro` | Marketing strategy / *and the design to carry it* | draft |
| brief.text | `src/components/v3/Brief.astro` | I'm Jayson Mercado Erboila, a Digital Marketing Specialist and designer in Toronto. From marketing strategy and SEO to pixel-perfect logos and digital interfaces, I work where strategy meets aesthetics. With 5+ years across industries, I bring ideas to life through thoughtful, intentional design. | draft (trimmed from v1 About; first sentence is answer-first) |
| brief.stats | `src/components/v3/Brief.astro` | 40+ Projects · 5+ Years · 20+ Clients *(from v1)* | draft (please confirm still accurate) |
| chapter.web.label | `src/config/v3.ts` | Web & growth | draft |
| chapter.social.label | `src/config/v3.ts` | Social media | draft |
| chapter.logo.label | `src/config/v3.ts` | Logo & identity | draft |
| chapter.link | `src/components/v3/Chapter.astro` | Read the case → | draft |
| chapter.social.all | `src/config/v3.ts` | See all posts → | draft |
| contact.h2 | `src/components/v3/Contact.astro` | Let's build the *next one.* | draft |
| contact.button | `src/components/v3/Contact.astro` | Email {address} | draft (address still pending: jmerboila@gmail.com vs hello.devsign8@gmail.com) |

## Chapter briefs (`brief` in each work entry's frontmatter)

| Entry | Brief | Status |
|---|---|---|
| devsign8-website | *(none yet: the chapter shows `summary` until the questionnaire is answered)* | waiting on questionnaire |
| mustang-gtd | Four Instagram panels that had to read as one unbroken frame. | draft |
| digiskills-logo | A digital-safety app for kids needed a mark that felt like play. | draft |
| devsign8 *(queued, not showcased)* | A studio name that had to say design and development in one word. | draft |
| jm-design *(queued, not showcased)* | A personal monogram that carries both letters in a single stroke. | draft |

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
