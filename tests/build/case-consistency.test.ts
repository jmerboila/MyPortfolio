import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

/* One presentation for every case page (Jayson, 2026-10-02: information,
   data, page layout, font size and spacing consistent). The logo pages,
   the Safe-Zone Toolkit and the Ford and Lexus campaigns share one shell
   (styles/case.css), laid out as the Work pages' shelves since 2026-10-02:
   the same PageHead, a hairline and the number and title on the left of
   every section, the content on the right. Section 01 is the text (idea,
   glance) beside the hero,
   sections are numbered 01, 02, ... without gaps, the shared sections carry
   the same names, and no page keeps its own copy of the shell. */
const read = (p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const PAGES = {
  'logo/devsign8': 'logo',
  'logo/jm-design': 'logo',
  'logo/digiskills-logo': 'logo',
  'social/devsign8-ig-safe-zone-toolkit': 'social',
  'social/2026-ford-mustang-gtd': 'social',
  'social/2026-lexus-nx': 'social',
} as const;

for (const [path, kind] of Object.entries(PAGES)) {
  const html = read(`dist/work/${path}/index.html`);
  const main = html.match(/<main[\s\S]*<\/main>/)?.[0] ?? '';

  test(`${path}: the shared shell, section 01 text beside the hero`, () => {
    /* One container around the sections, as .work-page wraps the shelves,
       so every section's hairline spans exactly the text column. */
    assert.match(main, /<div class="case container"/);
    assert.doesNotMatch(main, /class="case-sec container/);
    const open = main.slice(main.indexOf('class="case-sec case-open"'), main.indexOf('id="case-h-02"'));
    assert.ok(open.length > 0, 'no section 01');
    assert.match(open, /class="case-open__text"/);
    assert.match(open, /class="[^"]*case-open__hero/);
    assert.match(open, /class="case-idea"/);
    for (const dt of ['Project', 'Role', 'Deliverables', 'Tools']) assert.match(open, new RegExp(`<dt[^>]*>${dt}</dt>`), dt);
  });

  test(`${path}: opens with the Work pages' PageHead`, () => {
    assert.match(html, /<header class="v3-pagehead"/);
    assert.match(html, /<h1 class="v3-pagehead__title"/);
    assert.match(html, /<p class="v3-pagehead__lede"/);
  });

  test(`${path}: sections numbered 01, 02, ... with no gaps`, () => {
    const nums = [...main.matchAll(/<span class="case-num"[^>]*>(\d\d)<\/span>/g)].map((m) => Number(m[1]));
    assert.ok(nums.length >= 5, `${nums.length} sections`);
    nums.forEach((v, i) => assert.equal(v, i + 1));
  });

  test(`${path}: no page-specific copy of the shell`, () => {
    assert.doesNotMatch(main, /class="(?:li|tk|cc)-(?:h|num|sec|idea|glance|lede)"/);
  });

  if (kind === 'social') {
    test(`${path}: the shared social sections carry the same names`, () => {
      assert.match(main, /<span class="case-num"[^>]*>\d\d<\/span>\s*Captions and timing/);
      const results = main.match(/<span class="case-num"[^>]*>\d\d<\/span>\s*(Results[^<]*)/);
      if (results) {
        assert.equal(results[1].trim(), 'Results and what I learned');
        assert.match(main, /id="measure"/);
      }
    });
  }
}
