import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

/* The Devsign8 Instagram Safe-Zone Toolkit: a product case study since
   2026-10-02 (spec 2026-10-02-toolkit-case-design.md), and its shelf. */
const SLUG = 'devsign8-ig-safe-zone-toolkit';
const PAGE = `dist/work/social/${SLUG}/index.html`;
const read = (p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const html = read(PAGE);
const social = read('dist/work/social/index.html');

const main = html.match(/<main[\s\S]*<\/main>/)?.[0] ?? '';
const SECTIONS = ['The toolkit', 'The problem', 'The research', 'The tool', 'The series', 'Publishing', 'What I learned'];

test('the toolkit is a product case study: sections 01 to 07 in order', () => {
  assert.ok(existsSync(PAGE), `${PAGE} missing`);
  assert.match(html, /<h1[^>]*>[\s\S]*Devsign8 Instagram Safe-Zone Toolkit[\s\S]*<\/h1>/);
  assert.doesNotMatch(html, /data-st-chapter/);
  let at = 0;
  SECTIONS.forEach((name, i) => {
    const n = String(i + 1).padStart(2, '0');
    const m = html.slice(at).match(new RegExp(`<span class="tk-num"[^>]*>${n}</span>\\s*${name}`));
    assert.ok(m, `missing "${n} ${name}"`);
    at += (m.index ?? 0) + 1;
  });
});

test('the viewer offers twelve formats and shows the Reel without JavaScript', () => {
  assert.equal((main.match(/role="radio"[^>]*data-szv-id=/g) ?? []).length, 12);
  const svgs = main.match(/<svg[^>]*data-szv-format="[^"]+"[^>]*>/g) ?? [];
  assert.equal(svgs.length, 12);
  const shown = svgs.filter((s) => !/data-szv-hidden/.test(s));
  assert.equal(shown.length, 1);
  assert.match(shown[0], /data-szv-format="reel"/);
  assert.match(main, /data-szv-caption[^>]*aria-live="polite"/);
});

test('the formats table carries the script\'s safe areas', () => {
  const table = main.slice(main.indexOf('<table class="tk-table"'), main.indexOf('</table>') + 8);
  for (const cell of ['885 × 978', '950 × 1266', '840 × 1110', '720 × 720', '764 × 764']) {
    assert.ok(table.includes(cell), cell);
  }
});

test('the hook in light and dark, the ten Reels, and the measured results', () => {
  assert.match(main, /tk-hook__video--light[^>]*reel-hook-light\.mp4|reel-hook-light\.mp4[^>]*tk-hook__video--light/);
  assert.match(main, /reel-hook-dark\.mp4/);
  const series = main.slice(main.indexOf('id="tk-h-05"'), main.indexOf('id="tk-h-06"'));
  assert.equal((series.match(/data-sp-video/g) ?? []).length, 10);
  const measure = main.slice(main.indexOf('id="measure"'));
  for (const v of ['326', '374', '84', '6']) assert.match(measure, new RegExp(`<strong[^>]*>${v}</strong>`), v);
  assert.ok(measure.includes('Instagram Insights via Buffer'));
});

test('no em dashes, studio not agency, on the page', () => {
  assert.doesNotMatch(main, /—/);
  assert.doesNotMatch(main, /agency/i);
});

test('the toolkit shelf links to its page, second after the Mustang', () => {
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

test('the toolkit shows as a row of ten uncropped Reels (the tenth posted 2026-09-29)', () => {
  /* Its own shelf: the Mustang shelf above is a row too since 2026-09-26. */
  const shelf =
    social
      .split('<section class="shelf"')
      .find((s) => /class="shelf__title"[^>]*>\s*Devsign8 Instagram Safe-Zone Toolkit\s*</.test(s)) ?? '';
  const row = shelf.slice(shelf.indexOf('class="sp-reel-row"'), shelf.indexOf('</ul>', shelf.indexOf('class="sp-reel-row"')));
  assert.ok(row.length > 0, 'no Reel row on the toolkit shelf');
  assert.equal((row.match(/data-sp-video/g) ?? []).length, 10);
  assert.match(html, /class="sp-reel-row"/);
});

test('Reel rows have arrow buttons, and Reels show their name instead of "Reels"', () => {
  assert.match(social, /data-sp-row-prev/);
  assert.match(social, /data-sp-row-next/);
  assert.doesNotMatch(social, /class="sp-reel__title"[^>]*>\s*Reels\s*</);
  assert.match(social, /class="sp-reel__title"[^>]*>\s*Share button\s*</);
});
