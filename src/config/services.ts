/* ============================================================================
   services.ts — what is on offer, in one place.
   ----------------------------------------------------------------------------
   WHY THIS IS NOT JUST A CONST INSIDE Services.astro, where it started: two
   things need it. The component draws the cards, and the homepage emits the
   matching OfferCatalog JSON-LD. Keeping one copy in a component and hand-
   writing the other in the page is exactly the drift site.ts exists to prevent
   — the visible offer and the machine-readable offer would disagree the first
   time a description was reworded, and only the visible one would get noticed.

   WHAT THESE DESCRIPTIONS DELIBERATELY DO NOT SAY: no prices, no timelines, no
   deliverable counts, no client outcomes. None of that is established anywhere
   in this project, and a portfolio that invents an engagement model is worse
   than one that simply names the disciplines and lets the contact link do the
   rest. Add them when they are real.

   THE `skills` ARRAYS PARTITION PERSON.knowsAbout — every one of the eight
   entries there appears on exactly one card. That is a convention, not a
   compile-time guarantee: TypeScript cannot express "these three arrays
   partition that one", so adding a skill to site.ts will NOT fail the build.
   Add it to a card here at the same time.
   ========================================================================= */

export interface Service {
  /** Display numeral. Decorative ordering only — aria-hidden in the markup. */
  n: string;
  title: string;
  body: string;
  skills: readonly string[];
}

export const SERVICES: readonly Service[] = [
  {
    n: '01',
    title: 'Brand Identity',
    body:
      'Marks, wordmarks and the system around them — type, colour and the ' +
      'rules that keep a brand recognisable everywhere it turns up.',
    skills: ['Logo Design', 'Branding', 'Graphic Design'],
  },
  {
    n: '02',
    title: 'Digital Product',
    body:
      'Websites and app interfaces designed from the user in — research and ' +
      'structure first, then the screens people actually move through.',
    skills: ['Web Design', 'UI Design', 'UX Research'],
  },
  {
    n: '03',
    title: 'Growth Marketing',
    body:
      'The half that makes the design earn its keep: search visibility, ' +
      'campaign strategy, and measuring what the work does once it ships.',
    skills: ['Digital Marketing', 'SEO'],
  },
] as const;
