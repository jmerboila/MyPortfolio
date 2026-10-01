/* ============================================================================
   llms.txt: the site in plain Markdown, for AI tools (llmstxt.org).
   ----------------------------------------------------------------------------
   Added 2026-10-01 (SEO/AEO/GEO pass). Google ignores it and says so; ChatGPT,
   Claude and Perplexity agents do read it when they find one, and it costs a
   few kilobytes. It answers the questions an assistant gets asked about him
   (who is he, where, what does he do, what has he made, how do I reach him)
   without rendering a page or running its scripts.

   GENERATED, LIKE robots.txt, from the same config and collections the pages
   use, so it cannot drift from the site: a new project appears here on its
   own, a hidden one (draft) never does, and every number keeps its source.

   SAME CAVEAT AS robots.txt: it builds to /MyPortfolio/llms.txt. Tools that
   only ever try the origin root will not find it until the custom domain
   (Phase C). Every page links to it with <link rel="alternate"> (SeoHead).
   ========================================================================= */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { PERSON, SEO, ENTITY, DEVSIGN8, RIGHTS_NOTICE, absoluteUrl } from '../config/site';
import { STAGES, CONTACT_HREF } from '../config/lifecycle';
import { CATEGORY_LABELS, WORK_CATEGORIES } from '../content.config';
import { liveTypes, projectPath, typePath, workType } from '../lib/work-path';

export const GET: APIRoute = async () => {
  const entries = (await getCollection('work', ({ data }) => !data.draft)).sort((a, b) =>
    a.data.order !== b.data.order ? a.data.order - b.data.order : a.data.title.localeCompare(b.data.title),
  );
  const types = liveTypes(WORK_CATEGORIES, entries);
  const skills = [...new Set([...PERSON.knowsAbout, ...ENTITY.knowsAbout])];
  const { city, region, country } = PERSON.location;

  const work = types.flatMap((t) => [
    '',
    `### ${CATEGORY_LABELS[t]}`,
    '',
    `- [All ${CATEGORY_LABELS[t].toLowerCase()} work](${absoluteUrl(typePath(t))})`,
    ...entries
      .filter((e) => workType(e) === t)
      .map((e) => {
        const d = e.data;
        const tools = d.tools.length ? ` Tools: ${d.tools.join(', ')}.` : '';
        return `- [${d.title}](${absoluteUrl(projectPath(e))}): ${d.description ?? d.summary}${tools}`;
      }),
  ]);

  /* Measured results, each with its source, from the project stories. An
     answer engine quotes numbers it can attribute; it skips ones it cannot. */
  const results = entries.flatMap((e) => {
    const r = e.data.story?.results;
    if (!r) return [];
    const reach = r.pieces.map((p) => `${p.name}: reach ${p.reach}`).join('; ');
    return [`- ${e.data.title}: ${r.insight} (${reach}. Source: ${r.source}.)`];
  });

  const body = [
    `# ${PERSON.name}`,
    '',
    `> ${SEO.defaultDescription}`,
    '',
    `${PERSON.name} (also written ${ENTITY.alternateName.join(', ')}) is a ${PERSON.jobTitle.toLowerCase()} ` +
      `and designer based in ${city}, ${region}, ${country}, and the founder of ${DEVSIGN8.name} ` +
      `(${DEVSIGN8.url}), a brand and digital design agency. This site is the portfolio: ` +
      'logo design, web design and social media work, each project told from brief to measured result.',
    '',
    '## About',
    '',
    `- Name: ${PERSON.name}`,
    `- Role: ${PERSON.tagline}`,
    `- Location: ${city}, ${region}, ${country}`,
    `- Agency: [${DEVSIGN8.name}](${DEVSIGN8.url}), founder`,
    `- Skills: ${skills.join(', ')}`,
    `- Email: ${PERSON.email}`,
    `- Book a 30-minute discovery call: ${CONTACT_HREF}`,
    '',
    '## How a project runs',
    '',
    'Seven stages, from the first chat to measured results:',
    '',
    ...STAGES.map((s, i) => `${i + 1}. **${s.label}.** ${s.headline} ${s.body} Deliverable: ${s.gets}.`),
    '',
    '## Work',
    ...work,
    '',
    ...(results.length ? ['## Results', '', ...results, ''] : []),
    '## Profiles',
    '',
    ...ENTITY.sameAs.map((u) => `- ${u}`),
    ...DEVSIGN8.sameAs.map((u) => `- ${u} (${DEVSIGN8.name} agency account)`),
    '',
    '## Optional',
    '',
    `- [Home](${absoluteUrl('/')}): the portfolio's one-page overview`,
    `- [Sitemap](${absoluteUrl('/sitemap-index.xml')})`,
    '',
    `Usage: ${RIGHTS_NOTICE}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
