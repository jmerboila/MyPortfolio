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
  assert.match(crumbs, /href="\/MyPortfolio\/work\/social\/"[^>]*>Social</);
  assert.match(crumbs, /aria-current="page"[^>]*>2026 Ford Mustang GTD</);
});
test('shelf labels read Launch campaign and Content series', () => {
  const social = read('dist/work/social/index.html');
  assert.match(social, /01 · Launch campaign/);
  assert.match(social, /02 · Content series/);
});
