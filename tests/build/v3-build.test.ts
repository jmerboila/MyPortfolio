import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

/* v3 is the homepage since 2026-09-24 (it was a noindex preview at /v3). */
const PAGE = 'dist/index.html';
const html = existsSync(PAGE) ? readFileSync(PAGE, 'utf8') : '';

test('the page is built', () => assert.ok(existsSync(PAGE), `${PAGE} missing`));
test('the homepage is indexable, with a canonical at the site root', () => {
  assert.doesNotMatch(html, /<meta name="robots"[^>]*noindex/);
  assert.match(html, /<link rel="canonical" href="https:\/\/jmerboila\.github\.io\/MyPortfolio\/"/);
});
test('the homepage carries GTM, the JSON-LD graph and share tags', () => {
  assert.match(html, /googletagmanager\.com\/gtm\.js/);
  assert.match(html, /<script type="application\/ld\+json">[^<]*"@type":"Person"/);
  assert.match(html, /<meta property="og:image" content="https:\/\/jmerboila\.github\.io\/MyPortfolio\//);
});
test('/v3 redirects to the homepage', () => {
  const v3 = existsSync('dist/v3/index.html') ? readFileSync('dist/v3/index.html', 'utf8') : '';
  assert.match(v3, /http-equiv="refresh" content="0;url=\/MyPortfolio\/"/);
});
test('the v2b preview is gone', () => assert.ok(!existsSync('dist/v2b/index.html')));
test("v1's old root pages redirect straight to their final pages", () => {
  /* 2026-09-26: projects moved under their type; DigiSkills (the app) and
     Orange Magazine are gone from the site, so theirs land on /work/. */
  const moved: Record<string, string> = {
    'DigiSkills.html': 'work/',
    'OrangeMagazine.html': 'work/',
    'Devsign8-Showcase.html': 'work/logo/devsign8/',
    'DigiSkills-Showcase.html': 'work/logo/digiskills-logo/',
    'JM-Showcase.html': 'work/logo/jm-design/',
    'OrangeMagazine-Showcase.html': 'work/',
  };
  for (const [file, to] of Object.entries(moved)) {
    const stub = existsSync(`dist/${file}`) ? readFileSync(`dist/${file}`, 'utf8') : '';
    assert.match(stub, new RegExp(`url=/MyPortfolio/${to}"`), file);
    assert.ok(existsSync(`dist/${to}index.html`), `target of ${file}`);
  }
});
test('exactly one h1, and it is the full name', () => {
  const h1s = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/g) ?? [];
  assert.equal(h1s.length, 1);
  assert.match(h1s[0] ?? '', /Jayson[\s\S]*Mercado[\s\S]*Erboila/);
});
test('an aria-hidden outline copy of the hero name exists', () => {
  const m = /<[a-z0-9]+\b[^>]*class="[^"]*v3-hero__title--outline[^"]*"[^>]*>/i.exec(html);
  assert.ok(m, 'expected the outline element');
  assert.match(m[0], /aria-hidden="true"/);
});
test('html carries the v3 class', () => assert.match(html, /<html[^>]*class="v3"/));
test('the dot field is mounted', () => assert.match(html, /data-dotgrid/));
test('no stats counters (removed in round 5)', () => {
  assert.doesNotMatch(html, /v3-stats|data-count\b/);
});
test('the hero typewriter carries the full sentence and all three endings', () => {
  assert.ok(html.includes('I help businesses look good, get found and grow online.'));
  const m = /data-endings="([^"]*)"/.exec(html);
  assert.ok(m, 'expected data-endings on the typewriter');
  const endings = JSON.parse((m[1] ?? '').replaceAll('&quot;', '"').replaceAll('&#34;', '"'));
  assert.deepEqual(endings, ['look good.', 'get found.', 'grow online.']);
});
test('the animated typewriter copy is hidden from screen readers', () => {
  assert.match(html, /<span[^>]*class="v3-type__anim"[^>]*aria-hidden="true"|<span[^>]*aria-hidden="true"[^>]*class="v3-type__anim"/);
});
test('the hero sub-line is gone', () => {
  assert.doesNotMatch(html, /Digital marketing &amp; design|Digital marketing & design/);
});
test('the intro is the round 6 copy', () => {
  assert.ok(html.includes('I design with depth, crafting work that moves beyond surface aesthetics.'), 'intro paragraph');
});
test('the discovery-call email has no hiring P.S.', () => {
  assert.doesNotMatch(html, /P\.S\.|Hiring%3F/);
});
test('the contact link carries the arrow and no magnetic drift', () => {
  assert.match(html, /class="v3-arrow"/);
  assert.doesNotMatch(html, /data-magnetic/);
});
test('the diagram marks what the purple cycle erases and redraws', () => {
  for (const part of ['n0', 'n1', 'n2', 'c1', 'c2']) {
    assert.equal((html.match(new RegExp(`data-repeat="${part}"`, 'g')) ?? []).length, 2, `${part} in both drawings`);
  }
});
test('a mobile progress strip exists and is hidden from screen readers', () => {
  const m = /<div[^>]*class="v3-progress"[^>]*>/.exec(html);
  assert.ok(m, 'expected the progress strip');
  assert.match(m[0], /aria-hidden="true"/);
  // Count the elements, not the attribute name: the inlined script mentions it too.
  assert.equal((html.match(/class="v3-progress__seg"/g) ?? []).length, 7);
});
test('the hand-drawn stage loop: two drawings, each an accessible image', () => {
  const svgs = html.match(/<svg[^>]*data-sketch[^>]*>/g) ?? [];
  assert.equal(svgs.length, 2, 'wide + tall');
  for (const s of svgs) assert.match(s, /role="img"/);
  const desc = /<desc[^>]*>([^<]*)<\/desc>/.exec(html)?.[1] ?? '';
  for (const label of ['Discover', 'Plan', 'Brand', 'Build', 'Be found', 'Show up', 'Measure']) {
    assert.ok(desc.includes(label), `desc names ${label}`);
  }
});
test('the diagram repeats 05 → 07 only, and says so', () => {
  const desc = /<desc[^>]*>([^<]*)<\/desc>/.exec(html)?.[1] ?? '';
  assert.match(desc, /loops back to 05 Be found/);
  assert.doesNotMatch(html, /then again!/, 'the scribble was removed in round 13');
  for (const part of ['return', 'c1', 'c2']) {
    assert.equal((html.match(new RegExp(`data-cycle="${part}"`, 'g')) ?? []).length, 2, `${part} in both drawings`);
  }
});
test('05 and 06 carry loop-only notes beside their first-play notes', () => {
  assert.equal((html.match(/data-note-loop/g) ?? []).filter(() => true).length >= 4, true);
  assert.ok(html.includes('rank on Google + AI') && html.includes('keep posting'));
  assert.ok(html.includes('Google, Maps, AI') && html.includes('social posts'));
});
test('each rough stroke is its own path (one M), so double strokes draw together', () => {
  const loop = /<div[^>]*data-sketch-wrap[\s\S]*?<\/svg>\s*<svg[\s\S]*?<\/svg>/.exec(html)?.[0] ?? '';
  const ds = [...loop.matchAll(/<path\b[^>]*\bd="([^"]*)"/g)].map((m) => m[1] ?? '');
  assert.ok(ds.length > 20);
  for (const d of ds) assert.equal((d.match(/M/g) ?? []).length, 1, d.slice(0, 40));
});
test('arrows split line and head', () => {
  assert.ok((html.match(/data-part="head"/g) ?? []).length >= 16);
  assert.ok((html.match(/data-part="line"/g) ?? []).length >= 16);
});
test('every loop stroke is drawable (pathLength="100")', () => {
  const loop = /<div[^>]*data-sketch-wrap[\s\S]*?<\/svg>\s*<svg[\s\S]*?<\/svg>/.exec(html)?.[0] ?? '';
  const pathsTotal = (loop.match(/<path\b/g) ?? []).length;
  const drawable = (loop.match(/<path\b[^>]*pathLength="100"/g) ?? []).length;
  assert.ok(pathsTotal > 20, `found ${pathsTotal} paths`);
  assert.equal(drawable, pathsTotal);
});
test('light sections fill one screen', () => {
  for (const id of ['about', 'contact']) {
    assert.match(html, new RegExp(`<section[^>]*id="${id}"[^>]*class="[^"]*v3-screen|<section[^>]*class="[^"]*v3-screen[^"]*"[^>]*id="${id}"`), id);
  }
});
const BOOKING = 'href="https://cal.com/jmerboila/discovery-call"';
test('the header CTA opens the Cal.com booking page', () => {
  assert.match(html, new RegExp(`<a class="v3-talk" ${BOOKING}`));
});
test('no mailto left on the page', () => assert.doesNotMatch(html, /href="mailto:/));
test('no mobile menu and no v2 backlink', () => {
  assert.doesNotMatch(html, /data-menu-open/);
  assert.doesNotMatch(html, /&larr; v2|← v2/);
});
test('the header CTA reads Let’s talk', () => {
  assert.match(html, /Let(?:&#39;|&#x27;|')s talk/);
});
const footer = /<footer[\s\S]*?<\/footer>/.exec(html)?.[0] ?? '';
test('footer links to LinkedIn, Instagram and Devsign8 — no TikTok for now', () => {
  assert.match(footer, /href="https:\/\/www\.linkedin\.com\/in\/jayson-erboila\/"/);
  assert.match(footer, /href="https:\/\/www\.instagram\.com\/hello\.devsign8\/"/);
  assert.match(footer, /href="https:\/\/www\.devsign8\.com"/);
  assert.doesNotMatch(footer, /tiktok\.com/);
});
test('footer ends on the © credit line, after the Connect links (2026-09-26)', () => {
  const copy = footer.indexOf('©') > -1 ? footer.indexOf('©') : footer.indexOf('&copy;');
  assert.ok(copy > -1, 'no © line');
  assert.ok(copy > footer.indexOf('v3-footer__socials'), '© should come last');
});
test('the contact heading opens the Cal.com booking page', () => {
  assert.match(html, new RegExp(`<a class="v3-roll" ${BOOKING}`));
});
test('the contact heading reads the round 5 line', () => {
  assert.ok(html.includes("Got something epic in mind? Let's build it.") ||
    html.includes('Got something epic in mind? Let&#39;s build it.'), 'contact heading');
});
test('the sitemap lists the homepage, not the /v3 redirect', () => {
  const map = existsSync('dist/sitemap-0.xml') ? readFileSync('dist/sitemap-0.xml', 'utf8') : '';
  assert.ok(map.length > 0, 'sitemap missing');
  assert.match(map, /<loc>https:\/\/jmerboila\.github\.io\/MyPortfolio\/<\/loc>/);
  assert.doesNotMatch(map, /\/v3\//);
});

test('seven story stages, in lifecycle order', () => {
  const ids = ['discover', 'plan', 'brand', 'build', 'be-found', 'show-up', 'measure'];
  const at = ids.map((id) => html.indexOf(`id="${id}"`));
  assert.ok(at.every((i) => i > -1), JSON.stringify(at));
  assert.deepEqual([...at].sort((a, b) => a - b), at);
});
test('every stage headline is present', () => {
  const headlines = [
    'First, I listen.',
    'Then we make a plan.',
    'Your brand gets a face.',
    'A website that works.',
    'People can find you.',
    'Show up where your customers are.',
    'Check the numbers, then do it again.',
  ];
  for (const h of headlines) assert.ok(html.includes(h), h);
});
test('sample work at the matching stage links to its case page', () => {
  for (const path of ['logo/digiskills-logo', 'logo/jm-design', 'logo/devsign8', 'web/devsign8-website', 'social/2026-ford-mustang-gtd']) {
    assert.match(html, new RegExp(`href="/MyPortfolio/work/${path}/"`));
  }
});
test('no discipline-plate markup remains', () => {
  assert.doesNotMatch(html, /data-plate\b/);
});
test('the stage rail markup is present and lists every stage', () => {
  assert.match(html, /data-rail\b/);
  for (const id of ['discover', 'plan', 'brand', 'build', 'be-found', 'show-up', 'measure']) {
    assert.match(html, new RegExp(`data-rail-link="${id}"`));
  }
});
