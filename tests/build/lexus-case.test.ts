import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { leakedFontNames } from './font-names.ts';

/* The 2026 Lexus NX project (2026-09-29; a campaign case study since
   2026-10-02, spec 2026-10-02-campaign-case-design.md): its three posts
   moved from `series:` to `work:`. */
const SLUG = '2026-lexus-nx';
const PAGE = `dist/work/social/${SLUG}/index.html`;
const read = (p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const html = read(PAGE);
const social = read('dist/work/social/index.html');
const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');

test('the Lexus case study: sections 01 to 05 in order, no story chapters, no results yet', () => {
  assert.ok(existsSync(PAGE), `${PAGE} missing`);
  assert.match(html, /<h1[^>]*>[\s\S]*2026 Lexus NX[\s\S]*<\/h1>/);
  assert.doesNotMatch(html, /data-st-chapter/);
  let at = 0;
  ['The poster', 'The idea', 'The layout', 'The motion', 'Captions and timing'].forEach((name, i) => {
    const n = String(i + 1).padStart(2, '0');
    const m = html.slice(at).match(new RegExp(`<span class="cc-num"[^>]*>${n}</span>\\s*${name}`));
    assert.ok(m, `missing "${n} ${name}"`);
    at += (m.index ?? 0) + 1;
  });
  assert.doesNotMatch(html, /class="cc-num"[^>]*>06</);
  assert.ok(html.includes('Self-initiated concept. Not affiliated with or endorsed by Lexus or Toyota.'));
});

test('the poster type is described in general terms, never by font name', () => {
  assert.deepEqual(leakedFontNames(html), []);
  for (const f of [`src/content/work/${SLUG}.md`, 'src/content/social/lexus-tutorial-reel/index.md']) {
    assert.deepEqual(leakedFontNames(read(f)), [], f);
  }
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

test('the hero plays its three posts: poster, Reveal, How I built it', () => {
  assert.match(html, /NX 350h Poster/);
  assert.match(html, /NX 350h Reveal/);
  assert.match(html, /How I built it/);
  assert.equal((html.match(/data-sp-video/g) ?? []).length, 2);
});

test('the Lexus shelf links to its page', () => {
  assert.match(social, new RegExp(`class="shelf__link" href="/MyPortfolio/work/social/${SLUG}/"`));
});

test('the page is timeless: no posting days, times or "tomorrow"', () => {
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
