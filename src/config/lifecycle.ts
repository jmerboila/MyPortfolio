/* ============================================================================
   lifecycle.ts — the story v3 tells: how Jayson takes a client from first
   call to measured growth, and the discovery-call email that starts one.
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

   CONTACT_HREF is the one mailto on the page (header CTA + the contact
   heading). The body's line breaks are \r\n before encodeURIComponent, since
   RFC 6068 mailto bodies expect CRLF and some mail clients collapse bare \n.
   ========================================================================= */
import { PERSON } from './site';

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
    body: 'I help you show up when people search on Google, on Maps, and in AI tools like ChatGPT.',
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

const CONTACT_SUBJECT = "Discovery call — [your business name]";

const CONTACT_BODY = [
  'Hi Jayson,',
  '',
  "I'd like to book a discovery call.",
  '',
  'About me / my business:',
  'Website or social links:',
  'What I need help with (brand, website, search, social, or the whole journey):',
  'What a win looks like in six months:',
  'Timeline:',
  'Budget range:',
  'Two or three times that suit me (with my time zone):',
  '',
  'Thanks,',
  '',
  "P.S. Hiring? Share the role and the team instead, and I'll reply with my availability.",
].join('\r\n');

/* Email until Jayson has a booking page; swap this one value then. */
export const CONTACT_HREF =
  `mailto:${PERSON.email}?subject=${encodeURIComponent(CONTACT_SUBJECT)}` +
  `&body=${encodeURIComponent(CONTACT_BODY)}`;
