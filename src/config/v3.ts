/* ============================================================================
   v3.ts — the discipline chapters of the /v3 page, in page order.
   ----------------------------------------------------------------------------
   A chapter appears only once a work entry in its cats carries `showcase`.
   To feature more work, add `showcase: 2` (3, 4…) to that entry's
   frontmatter; nothing here needs to change. To add a discipline, add a row;
   it stays invisible until its first entry is showcased.

   Order is marketing-weighted: the web and social work lead, identity last.
   ========================================================================= */
import type { BrandIconName } from '../lib/brand-icons';
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

/* Footer icon links, in brand order: the two most-used social profiles,
   TikTok, then the studio wordmark last. 'devsign8' renders through
   Devsign8Mark.astro instead of BrandIcon.astro — see V3Layout's footer. */
export interface V3Social {
  label: string;
  url: string;
  icon: BrandIconName | 'devsign8';
}

export const V3_SOCIALS: readonly V3Social[] = [
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/jayson-erboila/', icon: 'linkedin' },
  { label: 'Instagram', url: 'https://www.instagram.com/hello.devsign8/', icon: 'instagram' },
  { label: 'TikTok', url: 'https://www.tiktok.com/@devsign8', icon: 'tiktok' },
  { label: 'Devsign8', url: 'https://www.devsign8.com', icon: 'devsign8' },
];
