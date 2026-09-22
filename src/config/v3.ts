/* ============================================================================
   v3.ts — the discipline chapters of the /v3 page, in page order.
   ----------------------------------------------------------------------------
   A chapter appears only once a work entry in its cats carries `showcase`.
   To feature more work, add `showcase: 2` (3, 4…) to that entry's
   frontmatter; nothing here needs to change. To add a discipline, add a row;
   it stays invisible until its first entry is showcased.

   Order is marketing-weighted: the web and social work lead, identity last.
   ========================================================================= */
import type { ChapterDef } from '../lib/chapters';
import type { WorkCategory } from '../content.config';

type V3Chapter = ChapterDef & { cats: readonly WorkCategory[] };

export const V3_CHAPTERS: readonly V3Chapter[] = [
  {
    key: 'web',
    label: 'Web & growth',
    cats: ['web', 'mobile'],
    more: 'More web work',
    all: { href: '/work?cat=web', label: 'See all web work', always: false },
  },
  {
    key: 'social',
    label: 'Social media',
    cats: ['social'],
    more: 'More social work',
    all: { href: '/social/', label: 'See all posts', always: true },
  },
  {
    key: 'logo',
    label: 'Logo & identity',
    cats: ['logo'],
    more: 'More logo work',
    all: { href: '/work?cat=logo', label: 'See all logo work', always: false },
  },
];
