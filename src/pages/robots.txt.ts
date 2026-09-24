/* ============================================================================
   robots.txt — generated, not hand-written.
   ----------------------------------------------------------------------------
   v1 shipped a static robots.txt with its sitemap URL typed out by hand. That
   URL is now wrong for v2 and nothing would have told anyone. Building it from
   the same config the canonical links come from means the sitemap it advertises
   cannot point somewhere the site does not serve.

   READ THIS BEFORE ASSUMING IT IS IN FORCE — IT IS NOT, YET.
   robots.txt is defined per ORIGIN and is only ever fetched from the root of
   one: crawlers read https://jmerboila.github.io/robots.txt and nothing else.
   The site now replaces v1 at the /MyPortfolio base path (2026-09-24), so this
   builds to /MyPortfolio/robots.txt, which no crawler requests. (v1's copy
   sat at the same path, so nothing is lost.) It takes effect with the custom
   domain in Phase C, which serves the site from the root. Until then,
   crawlers find pages through links and the sitemap submitted in Search
   Console.

   The sitemap path is @astrojs/sitemap's index, which is what it actually
   emits — sitemap-index.xml, not sitemap.xml. v1 advertised the latter.
   ========================================================================= */
import type { APIRoute } from 'astro';
import { absoluteUrl } from '../config/site';

/* No Disallow rules. There is nothing on this site that should not be crawled:
   the 404 carries its own noindex meta tag, and the sitemap already excludes
   it. Blocking paths here would only hide them from crawlers while leaving
   them perfectly public, which is the worst of both. */
const body = `# ${absoluteUrl('/')}
User-agent: *
Allow: /

Sitemap: ${absoluteUrl('/sitemap-index.xml')}
`;

export const GET: APIRoute = () =>
  new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
