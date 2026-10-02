// tests/build/logo-presentation.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

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
      const re = new RegExp(`<span class="li-num"[^>]*>${n}</span>\\s*${name}`);
      const m = html.slice(at).match(re);
      assert.ok(m, `${slug} missing "${n} ${name}" after position ${at}`);
      at += (m.index ?? 0) + 1;
    });
  });

  test(`${slug}: no studies, no full-bleed hero, no font names`, () => {
    assert.doesNotMatch(main, /Exploration|lp-fig--hero|explore-/);
    assert.doesNotMatch(html, /Roboto|Orange Avenue|Canterbury|Perpetua|Bask Old Face|Birds of Paradise|Space Grotesk|Baloo/i);
    assert.match(main, /sans serif|serif/i);
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
