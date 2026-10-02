// tests/build/logo-presentation.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const read = (p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : '');

/* The fonts in the marks are never named (Jayson, 2026-10-02), not even in
   this public repo: the test holds SHA-256 hashes of the lowercased names
   (the logo, specimen and UI faces) and checks every run of one to three
   words on the page against them. */
const FONT_HASHES = new Set([
  '9b68aef6bbcc7a584b9dc1cc9b18c283f72a0897cb35e8bf4959f5a919ecf1cc',
  'e4d052b7be77620a91cda8c2695c2a54f6e1a53a2d3122ff7f1c5723ada61b3d',
  'b0942022159de90c288e007306f4984b0882a32c55bcd98739acfe9de0e78099',
  '6f1cd51fcd075b933527726a4396adfa4841572b2b471a7f90cc26c648d77f06',
  'f96b5e39176afbed40153002b4404af9c4acfd089fa5bf9ce0a8a15debc801c0',
  '4bde11d8a4acc1e16e8bfa11f4797dcc66b0342c356a61c12f09c91e067aa978',
  'dfc67fb614aa32b63b026e5ba34ddeee632731e1c84e1aa6e81a193fdc9799e4',
  'df15882c4140b09f1eb39ae39aa80d10bc3136a7f8347354821a7a4c52b1454a',
]);
const sha = (s: string) => createHash('sha256').update(s).digest('hex');
function wordRuns(text: string): string[] {
  const w = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  const out = new Set<string>();
  for (let i = 0; i < w.length; i++)
    for (let n = 1; n <= 3 && i + n <= w.length; n++) out.add(w.slice(i, i + n).join(' '));
  return [...out];
}
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
    const leaked = wordRuns(html).filter((w) => FONT_HASHES.has(sha(w)));
    assert.deepEqual(leaked, [], 'a font name is on the page');
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
