import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/* Site-wide layout rules (Jayson's calls, 2026-10-01). */
const pages = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return pages(p);
    return f === 'index.html' ? [p] : [];
  });

/* Redirect stubs are tiny meta-refresh pages with no layout at all. */
const real = existsSync('dist') ? pages('dist').filter((p) => !readFileSync(p, 'utf8').includes('http-equiv="refresh"')) : [];

test('the contact section is on the homepage only', () => {
  assert.ok(real.length > 5, 'no built pages');
  for (const p of real) {
    const has = readFileSync(p, 'utf8').includes('id="v3-contact-title"');
    assert.equal(has, p === join('dist', 'index.html'), p);
  }
});

test('every page ends on the same footer, with Explore and Connect heads', () => {
  for (const p of real) {
    const html = readFileSync(p, 'utf8');
    assert.match(html, /<footer class="v3-footer container"/, p);
    assert.match(html, /class="v3-footer__head">Explore</, p);
    assert.match(html, /class="v3-footer__head">Connect</, p);
  }
});
