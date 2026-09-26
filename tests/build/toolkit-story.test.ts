import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

/* The Devsign8 Instagram Safe-Zone Toolkit project story (2026-09-26). */
const SLUG = 'devsign8-ig-safe-zone-toolkit';
const PAGE = `dist/work/${SLUG}/index.html`;
const read = (p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const html = read(PAGE);
const social = read('dist/social/index.html');

test('the toolkit story is built with its chapters, table and results source', () => {
  assert.ok(existsSync(PAGE), `${PAGE} missing`);
  assert.match(html, /<h1[^>]*>[\s\S]*Devsign8 Instagram Safe-Zone Toolkit[\s\S]*<\/h1>/);
  assert.equal((html.match(/data-st-chapter/g) ?? []).length, 7);
  assert.match(html, /<table class="st-table"/);
  assert.ok(html.includes('Instagram Insights via Buffer, as of 26 September 2026'));
});

test('the formats table carries the script\'s safe areas', () => {
  const table = html.slice(html.indexOf('<table class="st-table"'), html.indexOf('</table>') + 8);
  for (const cell of ['885 × 978', '950 × 1266', '840 × 1110', '720 × 720', '764 × 764']) {
    assert.ok(table.includes(cell), cell);
  }
});

test('the toolkit shelf links to its story, second after the Mustang', () => {
  assert.match(social, new RegExp(`class="sp-shelf__story" href="/MyPortfolio/work/${SLUG}/"`));
  const titles = [...social.matchAll(/class="sp-shelf__title"[^>]*>\s*([^<]+?)\s*</g)].map((m) => m[1]);
  assert.equal(titles[0], '2026 Ford Mustang GTD');
  assert.equal(titles[1], 'Devsign8 Instagram Safe-Zone Toolkit');
});

test('no em dashes in the toolkit content files', () => {
  for (const f of [`src/content/work/${SLUG}.md`, 'src/content/social/devsign8-ig-toolkit-reel/index.md']) {
    assert.doesNotMatch(read(f), /—/, f);
  }
});
