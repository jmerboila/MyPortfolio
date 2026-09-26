/* ============================================================================
   icons.ts — the Lucide icons v3 uses, imported one by one as raw SVG.
   ----------------------------------------------------------------------------
   lucide-static (ISC) ships each icon as its own file, so importing by name
   bundles only these, inlined at build time — no icon font, no runtime JS.
   Add an icon by adding one import and one map entry; IconName follows.

   Round 4 dropped the seven discipline icons (search, target, pen-tool,
   layout-template, globe, megaphone, chart-column): STAGES no longer carries
   an `icon` field now that the stage rail shows only numbers and labels, and
   "no icons on links" is a binding rule for the new story section, so the
   arrows on work-card links are plain "→" text, not SVG. arrow-right and
   arrow-up-right stay registered for the next place an icon is actually
   warranted; sun/moon remain the theme toggle's.
   arrow-up (2026-09-26) is the Back to top link's, beside its visible label.
   ========================================================================= */
import arrowRight from 'lucide-static/icons/arrow-right.svg?raw';
import arrowUp from 'lucide-static/icons/arrow-up.svg?raw';
import arrowUpRight from 'lucide-static/icons/arrow-up-right.svg?raw';
import moon from 'lucide-static/icons/moon.svg?raw';
import sun from 'lucide-static/icons/sun.svg?raw';

export const ICONS = {
  'arrow-right': arrowRight,
  'arrow-up': arrowUp,
  'arrow-up-right': arrowUpRight,
  moon,
  sun,
} as const;

export type IconName = keyof typeof ICONS;
