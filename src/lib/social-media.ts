/* ============================================================================
   social-media.ts — turns a social post's video paths into URLs.
   ----------------------------------------------------------------------------
   A post is one folder (src/content/social/<post>/) holding its index.md and
   its media, so adding a post is dropping one folder in. Images already work
   that way through the schema's image(). Videos and caption files don't —
   Astro's content layer only processes images — so this resolves them:

     "./reel.mp4"          → a file in the post's own folder. Vite copies it
                             into the build with a hashed name, so a replaced
                             video never serves stale from a cache.
     "/projects/reel.mp4"  → a file under public/ (the older layout, and
                             media shared with a case study).

   A "./" path that matches no file fails the build, rather than shipping a
   player that 404s.
   ========================================================================= */
import type { CollectionEntry } from 'astro:content';
import { asset } from './url';

const FILES = import.meta.glob('/src/content/social/**/*.{mp4,webm,vtt}', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function resolve(src: string, entry: CollectionEntry<'social'>): string {
  if (src.startsWith('/')) return asset(src);

  const dir = (entry.filePath ?? '').replace(/\\/g, '/').replace(/\/[^/]*$/, '');
  const parts: string[] = [];
  for (const part of `${dir}/${src}`.split('/')) {
    if (part === '..') parts.pop();
    else if (part && part !== '.') parts.push(part);
  }
  const key = `/${parts.join('/')}`;
  const url = FILES[key];
  if (!url) {
    throw new Error(
      `Social post "${entry.id}": no file at ${src} (looked for ${key}). ` +
        'Videos must be .mp4 or .webm; captions .vtt.',
    );
  }
  return url;
}

/** The entry with every video / captions path swapped for a servable URL. */
export function withMediaUrls(entry: CollectionEntry<'social'>): CollectionEntry<'social'> {
  const d = entry.data;
  if ('video' in d) {
    return {
      ...entry,
      data: {
        ...d,
        video: {
          ...d.video,
          src: resolve(d.video.src, entry),
          captions: d.video.captions && resolve(d.video.captions, entry),
        },
      },
    };
  }
  return {
    ...entry,
    data: {
      ...d,
      slides: d.slides.map((s) => (s.video ? { ...s, video: resolve(s.video, entry) } : s)),
    },
  };
}
