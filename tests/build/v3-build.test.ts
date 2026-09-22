import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

const PAGE = 'dist/v3/index.html';
const html = existsSync(PAGE) ? readFileSync(PAGE, 'utf8') : '';

// F3: read every compiled stylesheet rather than one hashed filename, so this
// survives Astro's per-build content hash.
const CSS_DIR = 'dist/_astro';
const css = existsSync(CSS_DIR)
  ? readdirSync(CSS_DIR)
      .filter((f) => f.endsWith('.css'))
      .map((f) => readFileSync(`${CSS_DIR}/${f}`, 'utf8'))
      .join('\n')
  : '';

test('the page is built', () => assert.ok(existsSync(PAGE), `${PAGE} missing`));
test('noindex, nofollow', () => assert.match(html, /<meta name="robots" content="noindex, nofollow"/));
test('no GTM and no JSON-LD on a variant', () => {
  assert.doesNotMatch(html, /googletagmanager/);
  assert.doesNotMatch(html, /application\/ld\+json/);
});
test('exactly one h1', () => assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1));
test('html carries the v3 class', () => assert.match(html, /<html[^>]*class="v3"/));
test('the dot field is mounted', () => assert.match(html, /data-dotgrid/));
test('stats are real text', () => {
  for (const v of ['40+', '5+', '20+']) assert.ok(html.includes(`>${v}<`), v);
});
test('contact is a mailto', () => assert.match(html, /href="mailto:[^"]+"/));
test('/v3 is not in the sitemap', () => {
  const map = existsSync('dist/sitemap-0.xml') ? readFileSync('dist/sitemap-0.xml', 'utf8') : '';
  assert.ok(map.length > 0, 'sitemap missing');
  assert.doesNotMatch(map, /\/v3\//);
});

test('three chapter plates with derived counters', () => {
  assert.equal((html.match(/<article[^>]*data-plate/g) ?? []).length, 3);
  for (const c of ['01 / 03', '02 / 03', '03 / 03']) assert.ok(html.includes(c), c);
});
test('chapters run web, social, logo', () => {
  const at = ['Web &amp; growth', 'Social media', 'Logo &amp; identity'].map((l) => html.indexOf(l));
  assert.ok(at.every((i) => i > -1), JSON.stringify(at));
  assert.deepEqual([...at].sort((a, b) => a - b), at);
});
test('each featured project links to its case page', () => {
  for (const slug of ['devsign8-website', 'mustang-gtd', 'digiskills-logo']) {
    assert.match(html, new RegExp(`href="/MyPortfolio2/work/${slug}/"`));
  }
});
test('the social chapter always links to /social', () => {
  assert.match(html, /href="\/MyPortfolio2\/social\/"/);
});
test('no More row while every chapter has one project', () => {
  assert.doesNotMatch(html, /<ul[^>]*data-more/);
});
test('peaks fall back to brief, then summary', () => {
  assert.ok(html.includes('Four Instagram panels that had to read as one unbroken frame.'));
  assert.ok(html.includes('The studio website for Devsign8'));
});

test('F3: a plate only goes sticky once #work is marked data-plates-ready', () => {
  // The gated rule exists and actually turns sticky on.
  assert.match(
    css,
    /#work\[data-plates-ready\][^{]*\.v3-plate\[[^\]]+\]\{[^}]*position:sticky/,
    'expected a #work[data-plates-ready] .v3-plate rule that sets position: sticky',
  );
  // Every unqualified ".v3-plate{...}" rule -- the ones a browser applies
  // before JS has measured anything -- must not be unconditionally sticky.
  const bareRules = [...css.matchAll(/(?:^|\})(\.v3-plate\[[a-z0-9-]+\]\{[^}]*\})/g)].map((m) => m[1]);
  assert.ok(bareRules.length > 0, 'expected to find the base, unqualified .v3-plate rule');
  for (const rule of bareRules) {
    assert.doesNotMatch(rule, /position:sticky/, `an unqualified .v3-plate rule went sticky: ${rule}`);
  }
});
