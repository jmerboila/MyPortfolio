import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

/* SEO/AEO/GEO pass (2026-10-01): the entity graph, breadcrumbs, per-project
   share images and search snippets, and llms.txt. */
const read = (p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const SITE = 'https://jmerboila.github.io/MyPortfolio';
const graph = (html: string): Record<string, any>[] => {
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(m, 'no JSON-LD');
  return JSON.parse(m[1])['@graph'];
};
const node = (g: Record<string, any>[], type: string): Record<string, any> => {
  const n = g.find((x) => x['@type'] === type);
  assert.ok(n, `no ${type} in the graph`);
  return n;
};
const meta = (html: string, prop: string) =>
  html.match(new RegExp(`<meta (?:property|name)="${prop}" content="([^"]*)"`))?.[1];

const PROJECTS = [
  'work/logo/devsign8',
  'work/logo/jm-design',
  'work/logo/digiskills-logo',
  'work/web/devsign8-website',
  'work/social/2026-ford-mustang-gtd',
  'work/social/devsign8-ig-safe-zone-toolkit',
  'work/social/2026-lexus-nx',
];

test('the homepage is the ProfilePage of the Person', () => {
  const g = graph(read('dist/index.html'));
  const page = node(g, 'ProfilePage');
  assert.equal(page.mainEntity['@id'], `${SITE}/#person`);
  assert.equal(meta(read('dist/index.html'), 'og:type'), 'profile');
});

test('the Person links to Devsign8 by the @id devsign8.com uses, and lists only profiles of him in sameAs', () => {
  const g = graph(read('dist/index.html'));
  const person = node(g, 'Person');
  assert.equal(person.worksFor['@id'], 'https://www.devsign8.com/#org');
  assert.ok(person.alternateName.includes('Jayson Erboila'));
  assert.match(person.image.url, /^https:\/\/jmerboila\.github\.io\/MyPortfolio\/_astro\/.+\.jpg$/);
  assert.ok(!person.sameAs.includes('https://www.devsign8.com'), 'the studio is worksFor, not sameAs');
  const org = node(g, 'Organization');
  assert.equal(org['@id'], 'https://www.devsign8.com/#org');
  assert.equal(org.founder['@id'], `${SITE}/#person`);
});

test('every project page has its own share image, a breadcrumb trail and a full CreativeWork', () => {
  for (const p of PROJECTS) {
    const html = read(`dist/${p}/index.html`);
    const img = meta(html, 'og:image') ?? '';
    assert.match(img, /\/_astro\/.+\.jpg$/, `${p} og:image`);
    assert.ok(meta(html, 'og:image:alt'), `${p} og:image:alt`);
    assert.equal(meta(html, 'og:type'), 'article', p);

    const g = graph(html);
    const crumbs = node(g, 'BreadcrumbList');
    assert.equal(crumbs.itemListElement.length, 4, p);
    assert.equal(crumbs.itemListElement.at(-1).item, `${SITE}/${p}/`, p);
    assert.equal(node(g, 'WebPage').breadcrumb['@id'], crumbs['@id'], p);

    const work = node(g, 'CreativeWork');
    assert.equal(work.url, `${SITE}/${p}/`, p);
    assert.equal(work.image.url, img, `${p} schema image matches og:image`);
    assert.equal(work.mainEntityOfPage['@id'], `${SITE}/${p}/#webpage`, p);
  }
});

test('search snippets: titles fit in a result, descriptions are 70 to 160 characters, no em dashes', () => {
  for (const p of [...PROJECTS, 'work', 'work/logo', 'work/web', 'work/social']) {
    const html = read(`dist/${p}/index.html`);
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
    const desc = meta(html, 'description') ?? '';
    assert.ok(title.length <= 65, `${p} title is ${title.length}: ${title}`);
    if (PROJECTS.includes(p)) assert.ok(desc.length >= 70 && desc.length <= 160, `${p} description is ${desc.length}`);
    assert.doesNotMatch(title + desc, /—/, p);
  }
});

test('listing pages carry their breadcrumb trail too', () => {
  for (const [p, n] of [['work', 2], ['work/logo', 3], ['work/social', 3]] as const) {
    const crumbs = node(graph(read(`dist/${p}/index.html`)), 'BreadcrumbList');
    assert.equal(crumbs.itemListElement.length, n, p);
  }
});

test('the 404 is noindex and has no canonical', () => {
  const html = read('dist/404.html');
  assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
  assert.doesNotMatch(html, /rel="canonical"/);
});

test('llms.txt describes him and lists every live project, and nothing hidden', () => {
  const txt = read('dist/llms.txt');
  assert.match(txt, /^# Jayson Mercado Erboila\n\n> /);
  assert.match(txt, /Toronto, Ontario, Canada/);
  assert.match(txt, /https:\/\/cal\.com\/jmerboila\/discovery-call/);
  for (const p of PROJECTS) assert.ok(txt.includes(`${SITE}/${p}/`), p);
  assert.doesNotMatch(txt, /orange-magazine|work\/mobile\/digiskills\//i);
  assert.doesNotMatch(txt, /—/);
  /* Jayson's call (2026-10-01): Devsign8 is a creative studio, never an agency.
     This overrides the Devsign8 style guide's older Voice rule. */
  assert.doesNotMatch(txt, /agency/i);
  assert.match(read('dist/index.html'), /<link rel="alternate" type="text\/markdown" title="llms.txt" href="\/MyPortfolio\/llms.txt">/);
});
