import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

/* The 2026 Ford Mustang GTD project page: a campaign case study since
   2026-10-02 (spec 2026-10-02-campaign-case-design.md). */
const SLUG = '2026-ford-mustang-gtd';
const PAGE = `dist/work/social/${SLUG}/index.html`;
const read = (p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const html = read(PAGE);

test('the project page is built at its new address, under its full name', () => {
  assert.ok(existsSync(PAGE), `${PAGE} missing`);
  assert.match(html, /<h1[^>]*>[\s\S]*2026 Ford Mustang GTD[\s\S]*<\/h1>/);
});

test('the old addresses redirect to the new one', () => {
  for (const old of ['mustang-gtd', SLUG]) {
    assert.match(read(`dist/work/${old}/index.html`), new RegExp(`url=/MyPortfolio/work/social/${SLUG}/"`), old);
  }
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
  for (const p of ['dist/work/index.html', PAGE, 'dist/work/logo/index.html', 'dist/work/logo/digiskills-logo/index.html']) {
    const h = read(p);
    assert.match(h, /<html[^>]*class="v3"/, p);
    assert.match(h, /data-v3-header/, p);
    assert.match(h, /class="v3-crumbs"/, p);
  }
});

const main = html.match(/<main[\s\S]*<\/main>/)?.[0] ?? '';
const SECTIONS = ['The launch', 'The plan', 'The Reel Reveal', 'The Seamless Carousel', 'Captions and timing', 'Results and what I learned'];

test('the campaign case study: sections 01 to 06 in order, no story chapters', () => {
  assert.doesNotMatch(main, /data-st-chapter/);
  let at = 0;
  SECTIONS.forEach((name, i) => {
    const n = String(i + 1).padStart(2, '0');
    const m = main.slice(at).match(new RegExp(`<span class="case-num"[^>]*>${n}</span>\\s*${name}`));
    assert.ok(m, `missing "${n} ${name}"`);
    at += (m.index ?? 0) + 1;
  });
});

test('the disclaimer and the results source are on the page', () => {
  assert.ok(html.includes('Self-initiated concept. Not affiliated with or endorsed by Ford Motor Company.'));
  assert.ok(html.includes('Instagram Insights via Buffer, one month after posting'));
});

test('the hero is the swipeable carousel: four panels and the artboard window', () => {
  const hero = main.slice(main.indexOf('id="case-h-01"'), main.indexOf('id="case-h-02"'));
  assert.match(hero, /data-cs-track/);
  assert.equal((hero.match(/class="cs__panel"/g) ?? []).length, 4);
  assert.match(hero, /data-cs-window/);
  assert.match(hero, /<img[^>]*loading="eager"/);
});

test('the slicer without drafts, both posts in their sections, results at #measure', () => {
  assert.match(main, /data-st-slicer/);
  assert.doesNotMatch(main, /st-slicer__drafts|gtd-draft/);
  const reel = main.slice(main.indexOf('id="case-h-03"'), main.indexOf('id="case-h-04"'));
  const carousel = main.slice(main.indexOf('id="case-h-04"'), main.indexOf('id="case-h-05"'));
  assert.match(reel, /data-sp-video/);
  assert.match(carousel, /Seamless Carousel/);
  const measure = main.slice(main.indexOf('id="measure"'));
  assert.ok(measure.length > 0, 'no #measure');
  assert.match(measure, /104/);
  assert.match(measure, /\b4\b/);
  assert.doesNotMatch(main, /—/);
  assert.doesNotMatch(main, /agency/i);
});
