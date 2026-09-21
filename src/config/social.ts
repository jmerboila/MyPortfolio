/* ============================================================================
   social.ts — the accounts and post types the /social page knows how to draw.
   ----------------------------------------------------------------------------
   ADDING A PLATFORM OR POST TYPE LATER is three steps, and the type checker
   walks you through them:

     1. content.config.ts — add one line to the `social` union, e.g.
          videoPost.extend({ type: z.literal('youtube-short') })
        (or `slidesPost` for image posts). The media shapes already exist.
     2. Here — add the account (if new) and the POST_TYPES entry. Leaving the
        entry out is a type error, because POST_TYPES is checked against the
        union with `satisfies`.
     3. src/components/social/ — add the frame component and one branch in
        SocialPost.astro. Copy the closest existing frame: a vertical video
        platform starts from TikTokVideo.astro, an image feed from
        InstagramPost.astro.

   The filter chips on the page derive themselves from the types that actually
   have posts, so a new type appears in the bar on its own once it has one.
   ========================================================================= */
import type { CollectionEntry } from 'astro:content';
import devsign8Avatar from '../assets/projects/Devsign8-Logo.webp';

export type SocialType = CollectionEntry<'social'>['data']['type'];

export interface SocialAccount {
  /** Platform name, used in accessible labels and the "View on" link. */
  platform: string;
  /** Handle without the @. */
  handle: string;
  /** Profile URL. */
  url: string;
  /** Square-ish artwork shown in a circle. Contained, not cropped. */
  avatar: ImageMetadata;
}

export const SOCIAL_ACCOUNTS = {
  instagram: {
    platform: 'Instagram',
    handle: 'hello.devsign8',
    url: 'https://www.instagram.com/hello.devsign8/',
    avatar: devsign8Avatar,
  },
  /* TODO(jayson): confirm the TikTok handle. It mirrors the Instagram one
     until you say otherwise. */
  tiktok: {
    platform: 'TikTok',
    handle: 'hello.devsign8',
    url: 'https://www.tiktok.com/@hello.devsign8',
    avatar: devsign8Avatar,
  },
} as const satisfies Record<string, SocialAccount>;

export type AccountKey = keyof typeof SOCIAL_ACCOUNTS;

interface PostTypeInfo {
  account: AccountKey;
  /** What the platform calls it, shown as the small badge on the card. */
  label: string;
  /** The filter chip text. */
  filterLabel: string;
}

/* Order here is the order of the filter chips. */
export const POST_TYPES = {
  'instagram-post': { account: 'instagram', label: 'Post', filterLabel: 'Instagram posts' },
  'instagram-reel': { account: 'instagram', label: 'Reel', filterLabel: 'Reels' },
  'tiktok-video': { account: 'tiktok', label: 'Video', filterLabel: 'TikTok' },
} as const satisfies Record<SocialType, PostTypeInfo>;

/** Splits a caption so #hashtags and @mentions can be tinted the way the
 *  platforms tint them. They stay plain text, not links: a link to a hashtag
 *  page would send visitors off the portfolio mid-read. */
export function captionParts(text: string): { text: string; tag: boolean }[] {
  return text
    .split(/([#@][\p{L}\p{N}_.]*[\p{L}\p{N}_])/u)
    .filter(Boolean)
    .map((t) => ({ text: t, tag: /^[#@]/.test(t) }));
}

/** "Jan 5, 2026". Absolute rather than "5d": a static page cannot keep a
 *  relative date true. */
export function postDate(d: Date): string {
  return d.toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** 12400 → "12.4K", the way both platforms abbreviate counts. */
export function compactCount(n: number): string {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n);
}
