// tests/build/logo-presentation.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { leakedFontNames } from './font-names.ts';

const read = (p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : '');

/* Logo identity (2026-10-02): mark first, no studies, type in general
   terms only, real Illustrator construction, real mockups, the reel. */
const IDENTITY = ['devsign8', 'jm-design', 'digiskills-logo'];
/* DigiSkills has no logo reel, so its page ends at 07. */
const REEL = new Set(['devsign8', 'jm-design']);
const SECTIONS = ['The mark', 'The brief', 'Construction', 'Typography', 'Colour', 'Usage', 'In use', 'The reel'];

for (const slug of IDENTITY) {
  const html = read(`dist/work/logo/${slug}/index.html`);
  const main = html.match(/<main[\s\S]*<\/main>/)?.[0] ?? '';

  test(`${slug}: sections in order, numbered`, () => {
    let at = 0;
    (REEL.has(slug) ? SECTIONS : SECTIONS.slice(0, -1)).forEach((name, i) => {
      const n = String(i + 1).padStart(2, '0');
      const re = new RegExp(`<span class="case-num"[^>]*>${n}</span>\\s*${name}`);
      const m = html.slice(at).match(re);
      assert.ok(m, `${slug} missing "${n} ${name}" after position ${at}`);
      at += (m.index ?? 0) + 1;
    });
  });

  test(`${slug}: no studies, no full-bleed hero, no font names`, () => {
    assert.doesNotMatch(main, /Exploration|lp-fig--hero|explore-/);
    assert.deepEqual(leakedFontNames(html), [], 'a font name is on the page');
    assert.match(main, /sans serif|serif/i);
  });

  /* The design rule (2026-10-02): every panel with a ground ships in light
     and dark, and ThemeImage shows the one opposite the page. The mark, each
     type card and the size ladder; DigiSkills has no type cards. */
  test(`${slug}: light and dark versions of every panel with a ground`, () => {
    const light = (main.match(/class="[^"]*theme-img--light/g) ?? []).length;
    const dark = (main.match(/class="[^"]*theme-img--dark/g) ?? []).length;
    const expected = { devsign8: 4, 'jm-design': 3, 'digiskills-logo': 2 }[slug];
    assert.equal(light, expected, `${slug} light versions`);
    assert.equal(dark, expected, `${slug} dark versions`);
    for (const img of main.match(/<img[^>]*theme-img--(?:light|dark)[^>]*>/g) ?? []) assert.match(img, /loading="lazy"/);
  });

  test(`${slug}: no fixed sizes on the outline (the mark is used at any size)`, () => {
    assert.doesNotMatch(main, /\d\s?pt\b/);
  });

  test(`${slug}: Illustrator frames, captions, labelled mockups, the reel`, () => {
    const figs = main.match(/<figure class="li-fig[\s\S]*?<\/figure>/g) ?? [];
    for (const f of figs) assert.match(f, /<figcaption/, f.slice(0, 80));
    assert.ok((main.match(/class="li-ai__bar"/g) ?? []).length >= 3, 'construction and clear space come from Illustrator');
    const inUse = figs.filter((f) => f.includes('li-fig--inuse'));
    assert.ok(inUse.length >= 4, `${slug} has ${inUse.length} mockups`);
    for (const f of inUse) assert.match(f, /<figcaption[^>]*>Mockup:/);
    if (REEL.has(slug)) assert.match(main, /<video[^>]*class="li-player/);
  });

  test(`${slug}: no em dashes, studio not agency, no retired marks`, () => {
    assert.doesNotMatch(main, /—/);
    assert.doesNotMatch(main, /agency/i);
    assert.doesNotMatch(main, /Elev8|\bDS8\b|\bD8\b/);
  });
}
