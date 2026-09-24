/* ============================================================================
   lifecycle.ts — the story v3 tells: how Jayson takes a client from first
   call to measured growth, and the discovery-call booking link that starts one.
   ----------------------------------------------------------------------------
   STAGES drives the stage rail AND the page's seven story sections
   (Story.astro + Stage.astro), so they cannot drift apart. Order follows the
   researched agency lifecycle: research and strategy come BEFORE the logo,
   and measurement is installed with the site, not after it.

   `work` names the content/work entry ids to feature at that stage (`[]` when
   nothing is showcased there yet) — tests/unit/lifecycle.test.ts checks every
   id resolves to a real src/content/work/<id>.md file. Round 4 replaced the
   old three discipline plates with this: sample work now sits at the moment
   in the process it was actually produced, rather than grouped by medium.

   CONTACT_HREF is the one contact link on the page (header CTA + the contact
   heading): the Cal.com discovery-call page since 2026-09-24 (was a mailto).
   ========================================================================= */

export interface Stage {
  /** Section id on the page, and the rail/menu anchor. */
  id: string;
  n: string;
  label: string;
  /** The big statement half of the compound heading, e.g. "First, I listen." */
  headline: string;
  /** The one-paragraph explanation, plain language, no jargon. */
  body: string;
  /** The one-line deliverable, shown after "You get". */
  gets: string;
  /** content/work entry ids shown as sample work at this stage. */
  work: readonly string[];
}

export const STAGES: readonly Stage[] = [
  {
    id: 'discover',
    n: '01',
    label: 'Discover',
    headline: 'First, I listen.',
    body: "Before any design, we talk. I learn what you sell, who buys it, and what's getting in the way.",
    gets: 'A clear picture of where you are today',
    work: [],
  },
  {
    id: 'plan',
    n: '02',
    label: 'Plan',
    headline: 'Then we make a plan.',
    body: "We decide who you're for, what makes you different, and what a win looks like, in numbers you can check.",
    gets: 'A simple plan with clear goals',
    work: [],
  },
  {
    id: 'brand',
    n: '03',
    label: 'Brand',
    headline: 'Your brand gets a face.',
    body: 'Logo, colours, fonts and tone of voice, all built from the plan. Then a short guide, so everyone uses them the same way.',
    gets: 'Logo and brand guide',
    work: ['digiskills-logo', 'jm-design', 'devsign8'],
  },
  {
    id: 'build',
    n: '04',
    label: 'Build',
    headline: 'A website that works.',
    body: 'A fast site that looks good on every phone and turns visitors into messages and sales. Tracking goes in on day one, so we can see what works.',
    gets: 'Website with tracking',
    work: ['devsign8-website'],
  },
  {
    id: 'be-found',
    n: '05',
    label: 'Be found',
    headline: 'People can find you.',
    body: 'I help you show up when people search on Google, on Maps, and in AI tools like ChatGPT, then keep improving it every month (SEO, AEO and GEO).',
    gets: 'Search-ready pages and a Google Business Profile',
    work: [],
  },
  {
    id: 'show-up',
    n: '06',
    label: 'Show up',
    headline: 'Show up where your customers are.',
    body: 'Social media set up and filled with posts people stop for, planned ahead and on brand.',
    gets: 'Social channels and a posting plan',
    work: ['mustang-gtd'],
  },
  {
    id: 'measure',
    n: '07',
    label: 'Measure',
    headline: 'Check the numbers, then do it again.',
    body: "Every month, a simple report: what worked, what didn't, and what we'll try next. Then the loop starts over.",
    gets: 'A monthly report and next steps',
    work: [],
  },
];

/* The Cal.com discovery-call page (30 min, Cal Video, America/Toronto). A
   plain link, no Cal.com embed script: that would put third-party JS and
   cookies on the page before the Phase B consent banner exists. The
   questions the old mailto body asked now live in the event's booking form. */
export const CONTACT_HREF = 'https://cal.com/jmerboila/discovery-call';
