import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

/* Work by type (2026-09-26): /work/<type>/<project>/, Social under Work,
   Work in the nav, footer and Show up stage. */
const read = (p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const LIVE: Record<string, string> = {
  '2026-ford-mustang-gtd': 'social',
  'devsign8-ig-safe-zone-toolkit': 'social',
  'devsign8-website': 'web',
  devsign8: 'logo',
  'jm-design': 'logo',
  'digiskills-logo': 'logo',
};
const redirectsTo = (from: string, to: string) =>
  assert.match(read(`dist/${from}index.html`), new RegExp(`url=/MyPortfolio/${to}"`), from);

test('every project is built under its type', () => {
  for (const [slug, type] of Object.entries(LIVE)) {
    assert.ok(existsSync(`dist/work/${type}/${slug}/index.html`), `${type}/${slug}`);
  }
});
test('type pages exist for Logo, Web and Social only', () => {
  for (const t of ['logo', 'web', 'social']) assert.ok(existsSync(`dist/work/${t}/index.html`), t);
  for (const t of ['mobile', 'graphic', 'marketing']) assert.ok(!existsSync(`dist/work/${t}/index.html`), t);
});
test('old project URLs redirect to the new ones', () => {
  for (const [slug, type] of Object.entries(LIVE)) redirectsTo(`work/${slug}/`, `work/${type}/${slug}/`);
  redirectsTo('social/', 'work/social/');
  redirectsTo('work/mustang-gtd/', 'work/social/2026-ford-mustang-gtd/');
  for (const gone of ['digiskills', 'orange-magazine', 'orange-magazine-logo']) redirectsTo(`work/${gone}/`, 'work/');
});
test('removed and hidden projects are not built or listed', () => {
  const map = read('dist/sitemap-0.xml');
  assert.ok(map.length > 0);
  assert.doesNotMatch(map, /orange-magazine|\/work\/digiskills\/|MyPortfolio\/social\/<|\/work\/(?:mustang-gtd|2026-ford-mustang-gtd|devsign8|jm-design)\/</);
  assert.doesNotMatch(read('dist/work/index.html'), /Orange Magazine/);
});
test('a project page has the four-level breadcrumb', () => {
  const html = read('dist/work/social/2026-ford-mustang-gtd/index.html');
  const crumbs = /<nav class="v3-crumbs"[\s\S]*?<\/nav>/.exec(html)?.[0] ?? '';
  assert.match(crumbs, /href="\/MyPortfolio\/work\/"[^>]*>Work</);
  assert.match(crumbs, /href="\/MyPortfolio\/work\/social\/"[^>]*>Social Media</);
  assert.match(crumbs, /aria-current="page"[^>]*>2026 Ford Mustang GTD</);
});
test('shelf labels read Launch campaign and Content series', () => {
  const social = read('dist/work/social/index.html');
  assert.match(social, /01 · Launch campaign/);
  assert.match(social, /02 · Content series/);
});
test('the header has a Work link on every page', () => {
  for (const p of ['dist/index.html', 'dist/work/social/index.html']) {
    const header = /<header class="v3-nav"[\s\S]*?<\/header>/.exec(read(p))?.[0] ?? '';
    assert.match(header, /<a class="v3-navlink"[^>]*href="\/MyPortfolio\/work\/"[^>]*>Work</, p);
  }
});
test('the Show up stage links to all the social work', () => {
  const home = read('dist/index.html');
  const stage = home.slice(home.indexOf('id="show-up"'), home.indexOf('id="measure"'));
  assert.match(stage, /href="\/MyPortfolio\/work\/social\/"[^>]*>\s*See all my social media work/);
});
test('the footer: mark and tagline left, Explore and Connect right, credit line last', () => {
  const footer = /<footer[\s\S]*?<\/footer>/.exec(read('dist/index.html'))?.[0] ?? '';
  assert.match(footer, /class="v3-footer__brand"[^>]*href="\/MyPortfolio\/"/);
  assert.match(footer, /class="v3-footer__tagline"[^>]*>\s*Planned, made and measured\s*</);
  const explore = /<nav class="v3-footer__nav"[\s\S]*?<\/nav>/.exec(footer)?.[0] ?? '';
  assert.match(explore, /Explore/);
  const links = [...explore.matchAll(/href="([^"]+)"[^>]*>([^<]+)</g)].map((m) => `${m[2].trim()} ${m[1]}`);
  assert.deepEqual(links, [
    'Logo Design /MyPortfolio/work/logo/',
    'Web Design /MyPortfolio/work/web/',
    'Social Media /MyPortfolio/work/social/',
  ]);
  assert.match(footer, /Connect/);
  assert.doesNotMatch(footer, /All rights reserved/);
  assert.match(footer, /(?:©|&copy;) \d{4} JM Design\. Designed and built by Jayson Mercado Erboila\./);
});

/* One layout under Work (2026-09-26): the Social page's heading and shelves. */
const shelfLinks = (html: string) => [...html.matchAll(/class="shelf__link" href="([^"]+)"/g)].map((m) => m[1]);

test('/work/ is a hub: one shelf per type, linking to its type page and its projects', () => {
  const html = read('dist/work/index.html');
  assert.doesNotMatch(html, /data-filters|work__grid/);
  assert.deepEqual(shelfLinks(html), ['/MyPortfolio/work/logo/', '/MyPortfolio/work/web/', '/MyPortfolio/work/social/']);
  for (const [slug, type] of Object.entries(LIVE)) {
    assert.match(html, new RegExp(`href="/MyPortfolio/work/${type}/${slug}/"`), slug);
  }
});
test('type pages list one shelf per project under the big heading', () => {
  const logo = read('dist/work/logo/index.html');
  assert.match(logo, /class="v3-pagehead__title"[^>]*>[\s\S]*?Marks that[\s\S]*?<em>last<\/em>/);
  assert.deepEqual(shelfLinks(logo).sort(), [
    '/MyPortfolio/work/logo/devsign8/',
    '/MyPortfolio/work/logo/digiskills-logo/',
    '/MyPortfolio/work/logo/jm-design/',
  ]);
  for (const p of ['dist/work/index.html', 'dist/work/web/index.html', 'dist/work/social/index.html']) {
    assert.match(read(p), /class="v3-pagehead__title"/, p);
  }
});
test('every page has exactly one Back to top link, and it works without script', () => {
  for (const p of ['dist/index.html', 'dist/work/social/2026-ford-mustang-gtd/index.html']) {
    const links = read(p).match(/<a class="v3-totop"[^>]*>[\s\S]*?<\/a>/g) ?? [];
    assert.equal(links.length, 1, p);
    assert.match(links[0], /href="#top"/);
    assert.match(links[0], /Back to top/);
  }
});
