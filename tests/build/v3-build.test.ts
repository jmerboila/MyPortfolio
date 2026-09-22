import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const PAGE = 'dist/v3/index.html';
const html = existsSync(PAGE) ? readFileSync(PAGE, 'utf8') : '';

test('the page is built', () => assert.ok(existsSync(PAGE), `${PAGE} missing`));
test('noindex, nofollow', () => assert.match(html, /<meta name="robots" content="noindex, nofollow"/));
test('no GTM and no JSON-LD on a variant', () => {
  assert.doesNotMatch(html, /googletagmanager/);
  assert.doesNotMatch(html, /application\/ld\+json/);
});
test('exactly one h1', () => assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1));
test('html carries the v3 class', () => assert.match(html, /<html[^>]*class="v3"/));
test('the dot field is mounted', () => assert.match(html, /data-dotgrid/));
test('stats are real text', () => {
  for (const v of ['40+', '5+', '20+']) assert.ok(html.includes(`>${v}<`), v);
});
test('contact is a mailto', () => assert.match(html, /href="mailto:[^"]+"/));
test('/v3 is not in the sitemap', () => {
  const map = existsSync('dist/sitemap-0.xml') ? readFileSync('dist/sitemap-0.xml', 'utf8') : '';
  assert.ok(map.length > 0, 'sitemap missing');
  assert.doesNotMatch(map, /\/v3\//);
});
