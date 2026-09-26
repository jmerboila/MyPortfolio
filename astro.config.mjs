// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/* `site` and `base` must match src/config/site.ts. They are duplicated here
   because astro.config runs before TypeScript path aliases resolve, and Astro
   needs both values to build canonical URLs and the sitemap. If you change one,
   change the other. */
const SITE_ORIGIN = 'https://jmerboila.github.io';
const BASE_PATH = '/MyPortfolio';

const REDIRECTS = {
  '/v3': `${BASE_PATH}/`,
  '/social': `${BASE_PATH}/work/social/`,
  '/work/mustang-gtd': `${BASE_PATH}/work/social/2026-ford-mustang-gtd/`,
  '/work/2026-ford-mustang-gtd': `${BASE_PATH}/work/social/2026-ford-mustang-gtd/`,
  '/work/devsign8-ig-safe-zone-toolkit': `${BASE_PATH}/work/social/devsign8-ig-safe-zone-toolkit/`,
  '/work/devsign8-website': `${BASE_PATH}/work/web/devsign8-website/`,
  '/work/devsign8': `${BASE_PATH}/work/logo/devsign8/`,
  '/work/jm-design': `${BASE_PATH}/work/logo/jm-design/`,
  '/work/digiskills-logo': `${BASE_PATH}/work/logo/digiskills-logo/`,
  '/work/digiskills': `${BASE_PATH}/work/`,
  '/work/orange-magazine': `${BASE_PATH}/work/`,
  '/work/orange-magazine-logo': `${BASE_PATH}/work/`,
};

/* The sitemap sees full URLs; a redirect source never belongs in it. */
const REDIRECT_URLS = new Set(Object.keys(REDIRECTS).map((from) => `${SITE_ORIGIN}${BASE_PATH}${from}/`));

export default defineConfig({
  site: SITE_ORIGIN,
  base: BASE_PATH,

  /* Old URLs, a fixed set, each emitted as a meta-refresh page (all GitHub
     Pages allows in place of a 301). v1's root-level .html pages are
     redirected from public/. A target must carry the base path: Astro
     prefixes the source but not the target.
     - /v3 was the v3 preview before it became the homepage (2026-09-24).
     - Since 2026-09-26 every project lives at /work/<type>/<project>/ and
       /social is /work/social/. New projects never need a line here.
     - DigiSkills (the app) is hidden and Orange Magazine was removed that
       day; their old pages land on /work/. */
  redirects: REDIRECTS,

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
         filter keeps utility routes and redirect pages out of the index. */
      filter: (page) => !page.includes('/404') && !REDIRECT_URLS.has(page),
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
