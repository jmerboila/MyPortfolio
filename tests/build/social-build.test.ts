import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

/* /social as project shelves (2026-09-25). */
const PAGE = 'dist/social/index.html';
const html = existsSync(PAGE) ? readFileSync(PAGE, 'utf8') : '';

test('/social is built on the v3 shell, with no stage rail', () => {
  assert.ok(existsSync(PAGE), `${PAGE} missing`);
  assert.match(html, /<html[^>]*class="v3"/);
  assert.match(html, /data-v3-header/);
  assert.doesNotMatch(html, /data-rail\b/);
});

test('/social shows project shelves, and the Mustang shelf links to its story', () => {
  const shelves = html.match(/class="sp-shelf"/g) ?? [];
  assert.ok(shelves.length >= 2, `found ${shelves.length} shelves`);
  assert.match(html, /2026 Ford Mustang GTD/);
  assert.match(html, /class="sp-shelf__story" href="\/MyPortfolio\/work\/2026-ford-mustang-gtd\/"/);
});

test('every "Read the story" link resolves', () => {
  const links = [...html.matchAll(/class="sp-shelf__story" href="\/MyPortfolio\/(work\/[^"]+)"/g)].map((m) => m[1]);
  assert.ok(links.length > 0);
  for (const l of links) assert.ok(existsSync(`dist/${l}index.html`), l);
});

test('no filters and no per-post pages remain', () => {
  assert.doesNotMatch(html, /data-sp-filters|sp-card__more/);
  assert.ok(!existsSync('dist/social/mustang-gtd-reel/index.html'));
});

test('the cards carry no badge, client line, case-study link or video description', () => {
  assert.doesNotMatch(html, /class="sp-badge"/);
  assert.doesNotMatch(html, /sp-card__client|sp-card__links|Describe this video/);
});

test('videos wait to be pressed: no autoplay, no mute, no mute button', () => {
  assert.doesNotMatch(html, /<video[^>]*\s(autoplay|muted)[\s>]/);
  assert.doesNotMatch(html, /data-sp-mute/);
});

test('the template folder never publishes', () => {
  assert.ok(!existsSync('dist/social/_new-post/index.html'));
  assert.doesNotMatch(html, /Spring launch carousel/);
});
