/* ============================================================================
   site-shots.ts: screenshot sets for SiteShowcase.astro (2026-09-30).
   ----------------------------------------------------------------------------
   One set per live site: a desktop and a phone screenshot, each in the site's
   dark and light mode. SiteShowcase shows the mode opposite the page (a dark
   site on a light page, a light site on a dark page), so the shots stand out.

   devsign8.com: captured 2026-09-30 from the live homepage in headless Chrome
   (desktop 1440 x 900 at 1x, phone 390 x 844 at 3x), the site's own theme
   forced through its `d8-theme` localStorage key, scroll bar hidden. Re-take
   them the same way after a homepage change.

   Keys are listed in content.config.ts (SITE_SHOT_IDS) so Work entries can
   point at a set by name; that file keeps no image imports of its own.
   ========================================================================= */
import type { ImageMetadata } from 'astro';
import desktopDark from '../assets/stages/devsign8-site-desktop.webp';
import mobileDark from '../assets/stages/devsign8-site-mobile.webp';
import desktopLight from '../assets/stages/devsign8-site-desktop-light.webp';
import mobileLight from '../assets/stages/devsign8-site-mobile-light.webp';

export interface Shot {
  src: ImageMetadata;
  alt: string;
}

export interface SiteShots {
  dark: { desktop: Shot; mobile: Shot };
  light: { desktop: Shot; mobile: Shot };
}

const HEADLINE = '"Branding, websites, and SEO that help your business get found online." with a "Get a free audit" button';

export const SITE_SHOTS = {
  devsign8: {
    dark: {
      desktop: { src: desktopDark, alt: `The devsign8.com homepage in dark mode on a desktop screen: ${HEADLINE}.` },
      mobile: { src: mobileDark, alt: 'The same devsign8.com homepage in dark mode on a phone.' },
    },
    light: {
      desktop: { src: desktopLight, alt: `The devsign8.com homepage in light mode on a desktop screen: ${HEADLINE}.` },
      mobile: { src: mobileLight, alt: 'The same devsign8.com homepage in light mode on a phone.' },
    },
  },
} satisfies Record<string, SiteShots>;

export type SiteShotId = keyof typeof SITE_SHOTS;
