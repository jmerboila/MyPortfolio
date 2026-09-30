import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

/* devsign8.com as the home page's Build stage draws it (his call, 2026-09-30):
   the desktop screenshot in a browser frame with the phone over its corner,
   both in the theme opposite the page (a dark site on a light page, a light
   site on a dark page). One component, SiteShowcase.astro, in four places. */
const read = (p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const PAGES = {
  home: 'dist/index.html',
  work: 'dist/work/index.html',
  web: 'dist/work/web/index.html',
  project: 'dist/work/web/devsign8-website/index.html',
};

/* The devsign8.com "Built" chapter mixes the two (his call, 2026-09-30): the
   phone is in the other theme to the desktop, so the chapter shows the site
   in both light and dark. Everywhere else the pair matches. */
const MIXED = new Set(['project']);
const file = (kind: string, theme: string) => new RegExp(`devsign8-site-${kind}${theme === 'light' ? '-light' : ''}\\.[^"]*webp`);

for (const [name, path] of Object.entries(PAGES)) {
  test(`${name}: devsign8.com shows as desktop + phone in both themes`, () => {
    const html = read(path);
    assert.ok(html, `${path} missing`);
    for (const theme of ['dark', 'light']) {
      const i = html.indexOf(`site-shot site-shot--${theme}`);
      assert.ok(i > -1, `${theme} version missing`);
      const block = html.slice(i, html.indexOf('</div>', html.indexOf('site-shot__mobile', i)) + 6);
      const phone = MIXED.has(name) ? (theme === 'dark' ? 'light' : 'dark') : theme;
      assert.match(block, /class="site-shot__bar"/, `${theme}: browser bar`);
      assert.match(block, file('desktop', theme), `${theme}: desktop`);
      assert.match(block, file('mobile', phone), `${theme}: phone should be ${phone}`);
    }
  });
}

test('content.config lists the same screenshot sets as config/site-shots.ts', () => {
  const ids = /SITE_SHOT_IDS = \[([^\]]*)\]/.exec(read('src/content.config.ts'))?.[1] ?? '';
  const sets = read('src/config/site-shots.ts');
  for (const id of ids.match(/'([^']+)'/g) ?? []) assert.match(sets, new RegExp(`\\n  ${id.slice(1, -1)}: \\{`), id);
  assert.ok(ids.length > 0);
});

test('the old single cover image is gone from the Work and Web Design cards', () => {
  for (const path of [PAGES.work, PAGES.web]) {
    const html = read(path);
    const card = html.slice(html.indexOf('href="/MyPortfolio/work/web/devsign8-website/"'));
    assert.match(card.slice(0, 4000), /site-shot/, path);
  }
});
