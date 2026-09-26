import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

/* The 2026 Ford Mustang GTD project page and its launch story (2026-09-25). */
const SLUG = '2026-ford-mustang-gtd';
const PAGE = `dist/work/${SLUG}/index.html`;
const read = (p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const html = read(PAGE);

test('the project page is built at its new address, under its full name', () => {
  assert.ok(existsSync(PAGE), `${PAGE} missing`);
  assert.match(html, /<h1[^>]*>[\s\S]*2026 Ford Mustang GTD[\s\S]*<\/h1>/);
});

test('the old address redirects to the new one', () => {
  assert.match(read('dist/work/mustang-gtd/index.html'), new RegExp(`url=/MyPortfolio/work/${SLUG}/"`));
});

test('no em dashes in the project content files', () => {
  for (const f of [
    `src/content/work/${SLUG}.md`,
    'src/content/social/mustang-gtd-carousel/index.md',
    'src/content/social/mustang-gtd-reel/index.md',
  ]) {
    assert.doesNotMatch(read(f), /—/, f);
  }
});

test('Work pages use the v3 shell', () => {
  for (const p of ['dist/work/index.html', `dist/work/${SLUG}/index.html`, 'dist/work/digiskills/index.html']) {
    const h = read(p);
    assert.match(h, /<html[^>]*class="v3"/, p);
    assert.match(h, /data-v3-header/, p);
    assert.match(h, /class="v3-crumbs"/, p);
  }
});

test('the story renders seven chapter blocks across six homepage stages', () => {
  assert.equal((html.match(/data-st-chapter/g) ?? []).length, 7);
  const stages = new Set(
    [...html.matchAll(/class="st-ch__stage"[^>]*>([\s\S]*?)<\/p>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').trim()),
  );
  assert.equal(stages.size, 6, [...stages].join(' | '));
});

test('the disclaimer and the results source are on the page', () => {
  assert.ok(html.includes('Self-initiated concept. Not affiliated with or endorsed by Ford Motor Company.'));
  assert.ok(html.includes('Instagram Insights via Buffer, as of 25 September 2026'));
});

test('the slicer, the clock and the two real posts render', () => {
  assert.match(html, /data-st-slicer/);
  assert.match(html, /data-st-clock/);
  assert.match(html, /Reel Reveal/);
  assert.match(html, /Seamless Carousel/);
  assert.match(html, /data-sp-video/);
});

test('the story opens on the phone mockup, loaded eagerly as the first image', () => {
  assert.match(html, /class="project__hero[^"]*"/);
  const hero = html.slice(html.indexOf('project__hero'));
  assert.match(hero, /<img[^>]*loading="eager"/);
});
