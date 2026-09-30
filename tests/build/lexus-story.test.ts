import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

/* The 2026 Lexus NX project story (2026-09-29): the series became a Work
   project, so its three posts moved from `series:` to `work:`. */
const SLUG = '2026-lexus-nx';
const PAGE = `dist/work/social/${SLUG}/index.html`;
const read = (p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const html = read(PAGE);
const social = read('dist/work/social/index.html');
const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');

test('the Lexus story is built under its full name, with its chapters', () => {
  assert.ok(existsSync(PAGE), `${PAGE} missing`);
  assert.match(html, /<h1[^>]*>[\s\S]*2026 Lexus NX[\s\S]*<\/h1>/);
  assert.equal((html.match(/data-st-chapter/g) ?? []).length, 6);
  assert.ok(html.includes('Self-initiated concept. Not affiliated with or endorsed by Lexus or Toyota.'));
});

test('the reach chart shows whole people, not decimals', () => {
  assert.match(html, /class="st-chart__value">104</);
  assert.doesNotMatch(html, /104\.00/);
});

test('the InDesign steps carry the real settings', () => {
  const table = html.slice(html.indexOf('<table class="st-table"'), html.indexOf('</table>') + 8);
  for (const cell of ['1080 × 1350', '20%', 'Multiply 55%', 'tracking 520', '12.5 / 21']) {
    assert.ok(table.includes(cell), cell);
  }
});

test('the story plays its three posts: poster, Reveal, How I built it', () => {
  assert.match(html, /NX 350h Poster/);
  assert.match(html, /NX 350h Reveal/);
  assert.match(html, /How I built it/);
  assert.equal((html.match(/data-sp-video/g) ?? []).length, 2);
});

test('the Lexus shelf links to its story', () => {
  assert.match(social, new RegExp(`class="shelf__link" href="/MyPortfolio/work/social/${SLUG}/"`));
});

test('the story is timeless: no posting days, times or "tomorrow"', () => {
  assert.doesNotMatch(text, /tomorrow|Part \d of \d|\b\d{1,2}(:\d\d)? ?[AP]M\b/i);
  assert.doesNotMatch(text, /\b(Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day\b/);
  assert.doesNotMatch(text, /\bSept?(ember)? \d|\b2026-\d\d-\d\d\b/);
});

test('no em dashes in the Lexus content files', () => {
  for (const f of [
    `src/content/work/${SLUG}.md`,
    'src/content/social/lexus-poster-post/index.md',
    'src/content/social/lexus-reveal-reel/index.md',
    'src/content/social/lexus-tutorial-reel/index.md',
  ]) {
    assert.doesNotMatch(read(f), /—/, f);
  }
});
