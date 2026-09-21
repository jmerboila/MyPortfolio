/* ============================================================================
   robots.txt — generated, not hand-written.
   ----------------------------------------------------------------------------
   v1 shipped a static robots.txt with its sitemap URL typed out by hand. That
   URL is now wrong for v2 and nothing would have told anyone. Building it from
   the same config the canonical links come from means the sitemap it advertises
   cannot point somewhere the site does not serve.

   READ THIS BEFORE ASSUMING IT IS LIVE — IT IS NOT, YET.
   robots.txt is defined per ORIGIN and is only ever fetched from the root of
   one: crawlers read https://jmerboila.github.io/robots.txt and nothing else.
   While v2 sits at the /MyPortfolio2 base path, this file builds to
   /MyPortfolio2/robots.txt, which no crawler will ever request — v1's copy at
   the domain root is still the one in force.

   It is here anyway because it costs nothing and it becomes correct the moment
   the open deploy decision in site.ts resolves either way: replacing v1 at the
   root, or moving to a custom domain, both put this file exactly where it has
   to be. What it must NOT do is give anyone the impression that crawling is
   already configured for v2. It is not, and that is a deploy-time task.

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
