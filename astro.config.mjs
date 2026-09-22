// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/* `site` and `base` must match src/config/site.ts. They are duplicated here
   because astro.config runs before TypeScript path aliases resolve, and Astro
   needs both values to build canonical URLs and the sitemap. If you change one,
   change the other. */
const SITE_ORIGIN = 'https://jmerboila.github.io';
const BASE_PATH = '/MyPortfolio2';

export default defineConfig({
  site: SITE_ORIGIN,
  base: BASE_PATH,

  /* Static output. Keeps the site deployable to GitHub Pages with no server,
     and keeps every page a real HTML document that crawlers and answer engines
     can read without executing JavaScript. */
  output: 'static',

  /* Emit /about/index.html rather than /about.html, so URLs have no extension
     and canonical links stay stable. */
  build: { format: 'directory' },

  integrations: [
    sitemap({
      /* Case studies and the homepage are the pages worth surfacing. The
         filter keeps utility routes out of the index.

         /v2b is the alternate art direction (see src/layouts/V2BLayout.astro).
         It is a real URL on a real deployed site, so it is excluded here AND
         carries its own noindex,nofollow — belt and braces, because a sitemap
         omission alone does not stop a crawler that finds the link.
         /v3 is the one-page scroll variant (src/layouts/V3Layout.astro),
         excluded for the same reason until it is promoted to /. */
      filter: (page) =>
        !page.includes('/404') && !page.includes('/v2b') && !page.includes('/v3'),
    }),
  ],

  /* Astro 7 defaults compressHTML to 'jsx', which collapses whitespace between
     adjacent inline elements. The scroll and type reveals split headings into
     spans that must keep the spaces between them, so we opt back into the
     conservative behaviour rather than debug missing spaces later.

     TROUBLESHOOTING, if a fresh `npm install` ever fails with "Cannot find
     native binding" or "An Application Control policy has blocked this file":
     this machine runs Windows Smart App Control in enforcement mode, and it
     cold-blocks native .node binaries it has not yet seen a reputation for.
     It cleared on its own here after the packages were reinstalled. If it
     recurs, `npm i @astrojs/compiler-binding-wasm32-wasi --cpu=wasm32` gives
     the compiler a working WASM fallback. Note that satteri's WASM build is
     broken upstream, so if the markdown processor is the thing blocked, set
     `markdown: { processor: unified({}) }` from @astrojs/markdown-remark
     instead. Do NOT downgrade to Astro 6 to escape this — Astro <= 7.0.9
     carries three high-severity XSS advisories. */
  compressHTML: true,

  /* Same-document View Transitions are Baseline (Oct 2025) and cost zero bytes.
     Astro wires them up natively; no animation library required. */
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
