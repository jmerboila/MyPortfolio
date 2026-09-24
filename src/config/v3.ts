/* ============================================================================
   v3.ts — the footer socials for the /v3 page.
   ----------------------------------------------------------------------------
   Round 4 removed the discipline-chapter system that used to live here
   (V3_CHAPTERS + src/lib/chapters.ts + Chapter.astro): sample work now
   appears inline within the seven-stage story, matched to the process stage
   it was produced at (src/config/lifecycle.ts's `Stage.work`), so grouping by
   medium is no longer needed. This file keeps only what's left: the footer's
   icon links.
   ========================================================================= */
import type { BrandIconName } from '../lib/brand-icons';

/* Footer icon links, in brand order: the two most-used social profiles, then
   the studio wordmark last. TikTok is off the footer for now (round 5, his
   call); to bring it back, re-add
     { label: 'TikTok', url: 'https://www.tiktok.com/@devsign8', icon: 'tiktok' }
   before Devsign8. 'devsign8' renders through
   Devsign8Mark.astro instead of BrandIcon.astro — see V3Layout's footer. */
export interface V3Social {
  label: string;
  url: string;
  icon: BrandIconName | 'devsign8';
}

export const V3_SOCIALS: readonly V3Social[] = [
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/jayson-erboila/', icon: 'linkedin' },
  { label: 'Instagram', url: 'https://www.instagram.com/hello.devsign8/', icon: 'instagram' },
  { label: 'Devsign8', url: 'https://www.devsign8.com', icon: 'devsign8' },
];
