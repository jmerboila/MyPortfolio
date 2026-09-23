/* ============================================================================
   icons.ts — the Lucide icons v3 uses, imported one by one as raw SVG.
   ----------------------------------------------------------------------------
   lucide-static (ISC) ships each icon as its own file, so importing by name
   bundles only these, inlined at build time — no icon font, no runtime JS.
   Add an icon by adding one import and one map entry; IconName follows.
   ========================================================================= */
import arrowRight from 'lucide-static/icons/arrow-right.svg?raw';
import arrowUpRight from 'lucide-static/icons/arrow-up-right.svg?raw';
import briefcaseBusiness from 'lucide-static/icons/briefcase-business.svg?raw';
import calendarCheck from 'lucide-static/icons/calendar-check.svg?raw';
import chartColumn from 'lucide-static/icons/chart-column.svg?raw';
import globe from 'lucide-static/icons/globe.svg?raw';
import layoutTemplate from 'lucide-static/icons/layout-template.svg?raw';
import mail from 'lucide-static/icons/mail.svg?raw';
import megaphone from 'lucide-static/icons/megaphone.svg?raw';
import menu from 'lucide-static/icons/menu.svg?raw';
import moon from 'lucide-static/icons/moon.svg?raw';
import penTool from 'lucide-static/icons/pen-tool.svg?raw';
import route from 'lucide-static/icons/route.svg?raw';
import search from 'lucide-static/icons/search.svg?raw';
import sun from 'lucide-static/icons/sun.svg?raw';
import target from 'lucide-static/icons/target.svg?raw';
import user from 'lucide-static/icons/user.svg?raw';
import x from 'lucide-static/icons/x.svg?raw';

export const ICONS = {
  'arrow-right': arrowRight,
  'arrow-up-right': arrowUpRight,
  'briefcase-business': briefcaseBusiness,
  'calendar-check': calendarCheck,
  'chart-column': chartColumn,
  globe,
  'layout-template': layoutTemplate,
  mail,
  megaphone,
  menu,
  moon,
  'pen-tool': penTool,
  route,
  search,
  sun,
  target,
  user,
  x,
} as const;

export type IconName = keyof typeof ICONS;
