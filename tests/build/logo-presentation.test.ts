// tests/build/logo-presentation.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

/* Logo presentations (spec 2026-10-01-logo-presentations-design.md). */
const read = (p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const PAGES = ['devsign8', 'jm-design', 'digiskills-logo'];
const SECTIONS = ['The brief', 'The idea', 'Exploration', 'Construction', 'Typography', 'Colour', 'Versatility', 'In use', 'Usage rules'];

for (const slug of PAGES) {
  const html = read(`dist/work/logo/${slug}/index.html`);

  test(`${slug}: sections 02 to 10 in order, numbered`, () => {
    let at = 0;
    SECTIONS.forEach((name, i) => {
      const n = String(i + 2).padStart(2, '0');
      const re = new RegExp(`<span class="lp-num"[^>]*>${n}</span>\\s*${name}`);
      const m = html.slice(at).match(re);
      assert.ok(m, `${slug} missing "${n} ${name}" after position ${at}`);
      at += (m.index ?? 0) + 1;
    });
  });

  test(`${slug}: every figure has a caption, every In use figure says Mockup`, () => {
    const figs = html.match(/<figure class="lp-fig[\s\S]*?<\/figure>/g) ?? [];
    assert.ok(figs.length >= 10, `${slug} has ${figs.length} figures`);
    for (const f of figs) assert.match(f, /<figcaption/, f.slice(0, 80));
    const inUse = figs.filter((f) => f.includes('lp-fig--inuse'));
    assert.ok(inUse.length >= 4);
    for (const f of inUse) assert.match(f, /<figcaption[^>]*>Mockup:/);
  });

  test(`${slug}: only new images, no em dashes, studio not agency`, () => {
    assert.match(html, new RegExp(`/_astro/[^"]*\\.webp`));
    assert.doesNotMatch(html, /Devsign8-Logo-Full|JMDesign-Full|JMDesign-Preview|DigiSkills-Mark-Final|DigiSkills-Drafts|DigiSkills-Construction|DigiSkills-Colour|DigiSkills-Versatility|DigiSkills-Cover/);
    const main = html.match(/<main[\s\S]*<\/main>/)?.[0] ?? '';
    assert.doesNotMatch(main, /—/);
    assert.doesNotMatch(main, /agency/i);
    assert.doesNotMatch(main, /Elev8|\bDS8\b|\bD8\b/);
  });
}
