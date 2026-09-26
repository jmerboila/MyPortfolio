import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

/* /work/social as project shelves (2026-09-25; moved from /social 2026-09-26). */
const PAGE = 'dist/work/social/index.html';
const html = existsSync(PAGE) ? readFileSync(PAGE, 'utf8') : '';

test('/social is built on the v3 shell, with no stage rail', () => {
  assert.ok(existsSync(PAGE), `${PAGE} missing`);
  assert.match(html, /<html[^>]*class="v3"/);
  assert.match(html, /data-v3-header/);
  assert.doesNotMatch(html, /data-rail\b/);
});

test('/social shows project shelves, and the Mustang shelf links to its story', () => {
  const shelves = html.match(/class="shelf"/g) ?? [];
  assert.ok(shelves.length >= 2, `found ${shelves.length} shelves`);
  assert.match(html, /2026 Ford Mustang GTD/);
  assert.match(html, /class="shelf__link" href="\/MyPortfolio\/work\/social\/2026-ford-mustang-gtd\/"/);
});

test('every "Read the story" link resolves', () => {
  const links = [...html.matchAll(/class="shelf__link" href="\/MyPortfolio\/(work\/[^"]+)"/g)].map((m) => m[1]);
  assert.ok(links.length > 0);
  for (const l of links) assert.ok(existsSync(`dist/${l}index.html`), l);
});

test('no filters and no per-post pages remain', () => {
  assert.doesNotMatch(html, /data-sp-filters|sp-card__more/);
  assert.ok(!existsSync('dist/work/social/mustang-gtd-reel/index.html'));
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
  assert.ok(!existsSync('dist/work/social/_new-post/index.html'));
  assert.doesNotMatch(html, /Spring launch carousel/);
});

/* 2026-09-26: shelves as rows, series, piece names in the card header. */
const shelves = html.split('<section class="shelf"').slice(1);
const shelfTitled = (t: string) =>
  shelves.find((s) => new RegExp(`class="shelf__title"[^>]*>\\s*${t}\\s*<`).test(s)) ?? '';
const cards = (s: string) => (s.match(/class="sp-card"/g) ?? []).length;

test('four shelves: Mustang, Toolkit, 2026 Lexus NX, Exploring viral trends', () => {
  const titles = shelves.map((s) => /class="shelf__title"[^>]*>\s*([^<]+?)\s*</.exec(s)?.[1]);
  assert.deepEqual(titles, [
    '2026 Ford Mustang GTD',
    'Devsign8 Instagram Safe-Zone Toolkit',
    '2026 Lexus NX',
    'Exploring viral trends',
  ]);
});
test('the Mustang shows its two pieces side by side in a row', () => {
  const mustang = shelfTitled('2026 Ford Mustang GTD');
  assert.match(mustang, /class="sp-reel-row"/);
  assert.equal(cards(mustang), 2);
});
test('the Lexus poster and animated poster share one shelf, with the disclaimer', () => {
  const lexus = shelfTitled('2026 Lexus NX');
  assert.match(lexus, /03 · Poster series/);
  assert.equal(cards(lexus), 2);
  assert.match(lexus, /InDesign/);
  assert.ok(lexus.includes('Self-initiated concept. Not affiliated with or endorsed by Lexus or Toyota.'));
});
test('the UNF Reel sits under Experiments', () => {
  const trends = shelfTitled('Exploring viral trends');
  assert.match(trends, /04 · Experiments/);
  assert.equal(cards(trends), 1);
});
test('Instagram post headers name the piece, not the account', () => {
  assert.match(html, /class="[^"]*\bsp-ig__name\b[^"]*"[^>]*>\s*Seamless Carousel\s*</);
  assert.doesNotMatch(html, /class="[^"]*\bsp-ig__name\b[^"]*"[^>]*>\s*JM Design\s*</);
  assert.doesNotMatch(html, /class="sp-card__piece"/);
});
