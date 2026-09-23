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
test('exactly one h1, and it is the full name', () => {
  const h1s = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/g) ?? [];
  assert.equal(h1s.length, 1);
  assert.match(h1s[0] ?? '', /Jayson[\s\S]*Mercado[\s\S]*Erboila/);
});
test('an aria-hidden outline copy of the hero name exists', () => {
  const m = /<[a-z0-9]+\b[^>]*class="[^"]*v3-hero__title--outline[^"]*"[^>]*>/i.exec(html);
  assert.ok(m, 'expected the outline element');
  assert.match(m[0], /aria-hidden="true"/);
});
test('html carries the v3 class', () => assert.match(html, /<html[^>]*class="v3"/));
test('the dot field is mounted', () => assert.match(html, /data-dotgrid/));
test('stats are real text', () => {
  for (const v of ['40+', '5+', '20+']) assert.ok(html.includes(`>${v}<`), v);
});
test('contact is a mailto', () => assert.match(html, /href="mailto:[^"]+"/));
test('no mobile menu and no v2 backlink', () => {
  assert.doesNotMatch(html, /data-menu-open/);
  assert.doesNotMatch(html, /&larr; v2|← v2/);
});
test('the header CTA reads Let’s talk', () => {
  assert.match(html, /Let(?:&#39;|&#x27;|')s talk/);
});
test('footer links to LinkedIn, Instagram, TikTok and Devsign8', () => {
  assert.match(html, /href="https:\/\/www\.linkedin\.com\/in\/jayson-erboila\/"/);
  assert.match(html, /href="https:\/\/www\.instagram\.com\/hello\.devsign8\/"/);
  assert.match(html, /href="https:\/\/www\.tiktok\.com\/@devsign8"/);
  assert.match(html, /href="https:\/\/www\.devsign8\.com"/);
});
test('the contact heading is a discovery-call mailto', () => {
  assert.match(html, /<a class="v3-roll" href="mailto:[^"]*Discovery%20call[^"]*"/);
});
test('/v3 is not in the sitemap', () => {
  const map = existsSync('dist/sitemap-0.xml') ? readFileSync('dist/sitemap-0.xml', 'utf8') : '';
  assert.ok(map.length > 0, 'sitemap missing');
  assert.doesNotMatch(map, /\/v3\//);
});

test('seven story stages, in lifecycle order', () => {
  const ids = ['discover', 'plan', 'brand', 'build', 'be-found', 'show-up', 'measure'];
  const at = ids.map((id) => html.indexOf(`id="${id}"`));
  assert.ok(at.every((i) => i > -1), JSON.stringify(at));
  assert.deepEqual([...at].sort((a, b) => a - b), at);
});
test('every stage headline is present', () => {
  const headlines = [
    'First, I listen.',
    'Then we make a plan.',
    'Your brand gets a face.',
    'A website that works.',
    'People can find you.',
    'Show up where your customers are.',
    'Check the numbers, then do it again.',
  ];
  for (const h of headlines) assert.ok(html.includes(h), h);
});
test('sample work at the matching stage links to its case page', () => {
  for (const slug of ['digiskills-logo', 'jm-design', 'devsign8', 'devsign8-website', 'mustang-gtd']) {
    assert.match(html, new RegExp(`href="/MyPortfolio2/work/${slug}/"`));
  }
});
test('no discipline-plate markup remains', () => {
  assert.doesNotMatch(html, /data-plate\b/);
});
test('the stage rail markup is present and lists every stage', () => {
  assert.match(html, /data-rail\b/);
  for (const id of ['discover', 'plan', 'brand', 'build', 'be-found', 'show-up', 'measure']) {
    assert.match(html, new RegExp(`data-rail-link="${id}"`));
  }
});
