// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/* `site` and `base` must match src/config/site.ts. They are duplicated here
   because astro.config runs before TypeScript path aliases resolve, and Astro
   needs both values to build canonical URLs and the sitemap. If you change one,
   change the other. */
const SITE_ORIGIN = 'https://jmerboila.github.io';
const BASE_PATH = '/MyPortfolio';

export default defineConfig({
  site: SITE_ORIGIN,
  base: BASE_PATH,

  /* v3 was previewed at /v3 before it became the homepage (2026-09-24). A
     static build emits this as a meta-refresh page, so an old /v3 link
     still lands. v1's root-level .html pages are redirected from public/.
     The destination must carry the base path: Astro prefixes the source but
     not the target, so '/' alone sent visitors to jmerboila.github.io/. */
  redirects: {
    '/v3': `${BASE_PATH}/`,
  },

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
         filter keeps utility routes out of the index. /v3 is only a redirect
         to the homepage now, so it has no place in the sitemap either. */
      filter: (page) => !page.includes('/404') && !page.includes('/v3'),
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
