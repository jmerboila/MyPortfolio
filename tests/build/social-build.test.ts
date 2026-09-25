import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

/* /social and its "How I made it" pages (2026-09-25). */
const PAGE = 'dist/social/index.html';
const html = existsSync(PAGE) ? readFileSync(PAGE, 'utf8') : '';

test('/social is built on the v3 shell, with no stage rail', () => {
  assert.ok(existsSync(PAGE), `${PAGE} missing`);
  assert.match(html, /<html[^>]*class="v3"/);
  assert.match(html, /data-v3-header/);
  assert.doesNotMatch(html, /data-rail\b/);
});

test('every "How I made it" link on /social has a built page', () => {
  const links = [...html.matchAll(/class="sp-card__more"[^>]*href="\/MyPortfolio\/social\/([^/"]+)\/"/g)]
    .concat([...html.matchAll(/href="\/MyPortfolio\/social\/([^/"]+)\/"[^>]*class="sp-card__more"/g)])
    .map((m) => m[1]);
  assert.ok(links.length > 0, 'no "How I made it" links found');
  for (const slug of links) {
    assert.ok(existsSync(`dist/social/${slug}/index.html`), `page for ${slug}`);
  }
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
