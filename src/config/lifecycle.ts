/* ============================================================================
   lifecycle.ts — the story v3 tells: how Jayson takes a client from first
   call to measured growth, and the discovery-call email that starts one.
   ----------------------------------------------------------------------------
   STAGES drives the stage rail and (next) the page's stage sections, so they
   cannot drift apart. Order follows the researched agency lifecycle: research
   and strategy come BEFORE the logo, and measurement is installed with the
   site, not after it. The one-line descriptions are drafts; they belong in
   the copy deck.

   CONTACT_HREF is the one mailto on the page (header CTA + the contact
   heading). The body's line breaks are \r\n before encodeURIComponent, since
   RFC 6068 mailto bodies expect CRLF and some mail clients collapse bare \n.
   ========================================================================= */
import type { IconName } from '../lib/icons';
import { PERSON } from './site';

export interface Stage {
  /** Section id on the page, and the rail/menu anchor. */
  id: string;
  n: string;
  label: string;
  icon: IconName;
  line: string;
}

export const STAGES: readonly Stage[] = [
  { id: 'discover', n: '01', label: 'Discover', icon: 'search', line: 'Listen first: the business, the audience, the problem.' },
  { id: 'define', n: '02', label: 'Define', icon: 'target', line: 'Research becomes positioning, goals and KPIs.' },
  { id: 'brand', n: '03', label: 'Brand', icon: 'pen-tool', line: 'The strategy made visible: mark, colour, type, voice.' },
  { id: 'build', n: '04', label: 'Build', icon: 'layout-template', line: 'A fast, accessible site, measured from day one.' },
  { id: 'be-found', n: '05', label: 'Be found', icon: 'globe', line: 'Search, answer engines and Google Business Profile.' },
  { id: 'show-up', n: '06', label: 'Show up', icon: 'megaphone', line: 'Social channels and content people keep.' },
  { id: 'measure', n: '07', label: 'Measure', icon: 'chart-column', line: 'Dashboards, reporting, and the next iteration.' },
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
