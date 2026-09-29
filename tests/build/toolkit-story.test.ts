import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

/* The Devsign8 Instagram Safe-Zone Toolkit project story (2026-09-26). */
const SLUG = 'devsign8-ig-safe-zone-toolkit';
const PAGE = `dist/work/social/${SLUG}/index.html`;
const read = (p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const html = read(PAGE);
const social = read('dist/work/social/index.html');

test('the toolkit story is built with its chapters, table and results source', () => {
  assert.ok(existsSync(PAGE), `${PAGE} missing`);
  assert.match(html, /<h1[^>]*>[\s\S]*Devsign8 Instagram Safe-Zone Toolkit[\s\S]*<\/h1>/);
  assert.equal((html.match(/data-st-chapter/g) ?? []).length, 7);
  assert.match(html, /<table class="st-table"/);
  assert.ok(html.includes('Instagram Insights via Buffer'));
});

test('the formats table carries the script\'s safe areas', () => {
  const table = html.slice(html.indexOf('<table class="st-table"'), html.indexOf('</table>') + 8);
  for (const cell of ['885 × 978', '950 × 1266', '840 × 1110', '720 × 720', '764 × 764']) {
    assert.ok(table.includes(cell), cell);
  }
});

test('the toolkit shelf links to its story, second after the Mustang', () => {
  assert.match(social, new RegExp(`class="shelf__link" href="/MyPortfolio/work/social/${SLUG}/"`));
  const titles = [...social.matchAll(/class="shelf__title"[^>]*>\s*([^<]+?)\s*</g)].map((m) => m[1]);
  assert.equal(titles[0], '2026 Ford Mustang GTD');
  assert.equal(titles[1], 'Devsign8 Instagram Safe-Zone Toolkit');
});

test('no em dashes in the toolkit content files', () => {
  const reels = readdirSync('src/content/social/devsign8-ig-toolkit-reel').filter((f) => f.endsWith('.md'));
  assert.equal(reels.length, 10);
  for (const f of [`src/content/work/${SLUG}.md`, ...reels.map((r) => `src/content/social/devsign8-ig-toolkit-reel/${r}`)]) {
    assert.doesNotMatch(read(f), /—/, f);
  }
});

test('the toolkit shows as a row of nine uncropped Reels (the tenth is a draft)', () => {
  /* Its own shelf: the Mustang shelf above is a row too since 2026-09-26. */
  const shelf =
    social
      .split('<section class="shelf"')
      .find((s) => /class="shelf__title"[^>]*>\s*Devsign8 Instagram Safe-Zone Toolkit\s*</.test(s)) ?? '';
  const row = shelf.slice(shelf.indexOf('class="sp-reel-row"'), shelf.indexOf('</ul>', shelf.indexOf('class="sp-reel-row"')));
  assert.ok(row.length > 0, 'no Reel row on the toolkit shelf');
  assert.equal((row.match(/data-sp-video/g) ?? []).length, 9);
  assert.match(html, /class="sp-reel-row"/);
});

test('Reel rows have arrow buttons, and Reels show their name instead of "Reels"', () => {
  assert.match(social, /data-sp-row-prev/);
  assert.match(social, /data-sp-row-next/);
  assert.doesNotMatch(social, /class="sp-reel__title"[^>]*>\s*Reels\s*</);
  assert.match(social, /class="sp-reel__title"[^>]*>\s*Share button\s*</);
});
