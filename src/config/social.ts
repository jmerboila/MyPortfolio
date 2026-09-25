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
  /** The name drawn in the frame, where the platform shows the handle. */
  name: string;
  /** Handle without the @. */
  handle: string;
  /** Profile URL. */
  url: string;
  /** Square-ish artwork shown in a circle. Leave out for a blank circle. */
  avatar?: ImageMetadata;
}

export type AccountKey = 'instagram' | 'tiktok';

export const SOCIAL_ACCOUNTS: Record<AccountKey, SocialAccount> = {
  /* 2026-09-25, his call: the frames show "JM Design" with a blank avatar. */
  instagram: {
    platform: 'Instagram',
    name: 'JM Design',
    handle: 'hello.devsign8',
    url: 'https://www.instagram.com/hello.devsign8/',
  },
  /* Confirmed by Jayson 2026-09-22: TikTok is @devsign8, not the Instagram
     handle it used to mirror. */
  tiktok: {
    platform: 'TikTok',
    name: 'devsign8',
    handle: 'devsign8',
    url: 'https://www.tiktok.com/@devsign8',
    avatar: devsign8Avatar,
  },
};

interface PostTypeInfo {
  account: AccountKey;
}

export const POST_TYPES = {
  'instagram-post': { account: 'instagram' },
  'instagram-reel': { account: 'instagram' },
  'tiktok-video': { account: 'tiktok' },
} as const satisfies Record<SocialType, PostTypeInfo>;

/* The page files posts as Reel, Post or Carousel (his call, 2026-09-25) —
   what the post IS, not which platform it's on. Order here is the order of
   the filter chips. */
export const CATEGORIES = { reel: 'Reels', post: 'Posts', carousel: 'Carousels' } as const;
export type Category = keyof typeof CATEGORIES;

/** A post's `category:` if it sets one, else read from its shape: one
 *  image or video is a Post, several a Carousel, a vertical video a Reel. */
export function postCategory(data: CollectionEntry<'social'>['data']): Category {
  if (data.category) return data.category;
  if (data.type === 'instagram-post') return data.slides.length > 1 ? 'carousel' : 'post';
  return 'reel';
}

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

/** The feed's order: `order` ascending, then newest first. Shared by /social
 *  and the "How I made it" pages' previous / next links. */
export function sortPosts<T extends CollectionEntry<'social'>>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    if (a.data.order !== b.data.order) return a.data.order - b.data.order;
    return (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0);
  });
}

/** A post has a "How I made it" page once there is something to put on it. */
export function hasMakingOf(entry: CollectionEntry<'social'>): boolean {
  return Boolean(entry.body?.trim()) || entry.data.tools.length > 0 || entry.data.screens.length > 0;
}
