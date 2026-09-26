import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

/* The 2026 Ford Mustang GTD project page and its launch story (2026-09-25). */
const SLUG = '2026-ford-mustang-gtd';
const PAGE = `dist/work/${SLUG}/index.html`;
const read = (p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const html = read(PAGE);

test('the project page is built at its new address, under its full name', () => {
  assert.ok(existsSync(PAGE), `${PAGE} missing`);
  assert.match(html, /<h1[^>]*>[\s\S]*2026 Ford Mustang GTD[\s\S]*<\/h1>/);
});

test('the old address redirects to the new one', () => {
  assert.match(read('dist/work/mustang-gtd/index.html'), new RegExp(`url=/MyPortfolio/work/${SLUG}/"`));
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
