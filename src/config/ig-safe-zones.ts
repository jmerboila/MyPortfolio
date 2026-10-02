/* ============================================================================
   ig-safe-zones.ts: the Safe-Zone Toolkit's twelve Instagram formats.
   ----------------------------------------------------------------------------
   Transcribed from Jayson's Photoshop script, Devsign8-IG-Template.jsx,
   revision 3 (2 September 2026), which takes the 9:16 margins from Meta's
   percentages: top 14% (270), bottom 35% (672) for Reels and every 9:16 ad,
   20% (384) for an organic Story, sides 6% (65), and 12% (130) on the right
   for the Reel's action rail. The feed insets are a Devsign8 design margin,
   not a platform rule. The SafeZoneViewer and the spec table both read this
   module; tests/unit/ig-safe-zones.test.ts checks every safe area.
   ========================================================================= */

export interface SafeZoneFormat {
  id: string;
  name: string;
  group: '9:16' | 'Feed' | 'Carousel' | 'Profile';
  w: number;
  h: number;
  /** Keep-clear margins in px from each edge. */
  m: { t: number; r: number; b: number; l: number };
  /** Dashed reference lines: grid crops and centre lines. */
  guidesH?: number[];
  guidesV?: number[];
  /** The circle Instagram shows (highlight cover, profile photo). */
  circle?: { cx: number; cy: number; r: number };
  note: string;
}

export const DEFAULT_FORMAT = 'reel';

export const SAFE_ZONES: SafeZoneFormat[] = [
  {
    id: 'story', name: 'Story, organic', group: '9:16', w: 1080, h: 1920,
    m: { t: 270, r: 65, b: 384, l: 65 },
    note: 'The bottom 384 px (20%) is the reply bar and link sticker. A Story has no action rail, so the sides stay at 65.',
  },
  {
    id: 'reel', name: 'Reel, organic', group: '9:16', w: 1080, h: 1920,
    m: { t: 270, r: 130, b: 672, l: 65 }, guidesV: [1015],
    note: 'The bottom 672 px (35%) holds the caption and audio. The like, comment, share and save rail needs 130 px on the right, not 65.',
  },
  {
    id: 'reel-ad', name: 'Story or Reel ad', group: '9:16', w: 1080, h: 1920,
    m: { t: 270, r: 130, b: 672, l: 65 }, guidesV: [1015],
    note: 'The same as the Reel by design: one master at these margins runs as a Story or a Reel, organic or paid, on Instagram and Facebook.',
  },
  {
    id: 'reel-cover', name: 'Reel cover', group: '9:16', w: 1080, h: 1920,
    m: { t: 270, r: 130, b: 672, l: 65 }, guidesH: [240, 1680], guidesV: [1015],
    note: 'The dashed lines are the 3:4 grid crop. The title has to read full-screen and in the grid, and a cover cannot be edited after upload.',
  },
  {
    id: 'feed-3x4', name: 'Feed 3:4', group: 'Feed', w: 1080, h: 1440,
    m: { t: 120, r: 120, b: 120, l: 120 },
    note: 'Instagram draws nothing over a feed image; the 120 px inset is a design margin. 3:4 matches the profile grid exactly, with no crop.',
  },
  {
    id: 'feed-4x5', name: 'Feed 4:5', group: 'Feed', w: 1080, h: 1350,
    m: { t: 120, r: 120, b: 120, l: 120 }, guidesV: [34, 1046],
    note: 'The dashed lines are the profile grid crop: a 4:5 post loses 34 px on each side.',
  },
  {
    id: 'feed-1x1', name: 'Feed 1:1', group: 'Feed', w: 1080, h: 1080,
    m: { t: 120, r: 165, b: 120, l: 165 }, guidesV: [135, 945],
    note: 'A square loses 135 px on each side in the grid, so the side inset is 165: type clears the crop by 30 px.',
  },
  {
    id: 'feed-landscape', name: 'Feed landscape', group: 'Feed', w: 1080, h: 566,
    m: { t: 60, r: 350, b: 60, l: 350 }, guidesV: [328, 752],
    note: 'The grid keeps only the centre 424 px, about 61% of the width lost. Use 3:4 instead.',
  },
  {
    id: 'carousel-slide', name: 'Carousel slide 3:4', group: 'Carousel', w: 1080, h: 1440,
    m: { t: 120, r: 120, b: 120, l: 120 },
    note: 'The first slide sets the ratio for every slide after it. The page dots sit below the image, not on it.',
  },
  {
    id: 'carousel-ad', name: 'Carousel ad card 1:1', group: 'Carousel', w: 1080, h: 1080,
    m: { t: 120, r: 120, b: 120, l: 120 }, guidesH: [830],
    note: 'Meta crops 4:5 ad cards to square, so build them at 1:1. Keep the headline above the dashed line at 830.',
  },
  {
    id: 'highlight', name: 'Highlight cover', group: 'Profile', w: 1080, h: 1920,
    m: { t: 600, r: 180, b: 600, l: 180 }, guidesH: [960], guidesV: [540],
    circle: { cx: 540, cy: 960, r: 540 },
    note: 'Only the centre circle shows. The safe box is the 720 px square inside it, and the icon sits on both centre lines.',
  },
  {
    id: 'profile', name: 'Profile photo', group: 'Profile', w: 1080, h: 1080,
    m: { t: 158, r: 158, b: 158, l: 158 }, guidesH: [540], guidesV: [540],
    circle: { cx: 540, cy: 540, r: 540 },
    note: 'It shows as small as 110 px, always in a circle. The safe box is the 764 px square that fits inside it; the corners are always clipped.',
  },
];

export const safeArea = (f: SafeZoneFormat) => ({ w: f.w - f.m.l - f.m.r, h: f.h - f.m.t - f.m.b });

/** The spec table's "keep clear" cell: top, right, bottom, left. */
export function keepClear(f: SafeZoneFormat): string {
  const { t, r, b, l } = f.m;
  return t === r && r === b && b === l ? `${t} each side` : `${t}, ${r}, ${b}, ${l}`;
}
