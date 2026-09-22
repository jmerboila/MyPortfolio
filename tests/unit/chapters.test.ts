import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildChapters, counter, MORE_LIMIT, type ChapterDef } from '../../src/lib/chapters.ts';

const def = (key: string, cats: string[], always = false): ChapterDef => ({
  key,
  label: key,
  cats,
  more: `More ${key} work`,
  all: { href: `/work?cat=${key}`, label: `See all ${key} work`, always },
});

const WEB = def('web', ['web', 'mobile']);
const SOCIAL = def('social', ['social'], true);
const LOGO = def('logo', ['logo']);
const DEFS = [WEB, SOCIAL, LOGO];

const item = (id: string, cats: string[], showcase?: number, order = 100, title = id) => ({
  id,
  cats,
  showcase,
  order,
  title,
});

test('groups showcased entries by cats, in definition order', () => {
  const out = buildChapters(DEFS, [
    item('digiskills-logo', ['logo'], 1),
    item('site', ['web'], 1),
    item('mustang', ['social'], 1),
  ]);
  assert.deepEqual(out.map((c) => c.def.key), ['web', 'social', 'logo']);
  assert.deepEqual(out.map((c) => c.featured.id), ['site', 'mustang', 'digiskills-logo']);
});

test('ignores entries without a showcase rank', () => {
  const out = buildChapters(DEFS, [item('a', ['logo'], 1), item('b', ['logo'])]);
  assert.equal(out.length, 1);
  assert.deepEqual(out[0]?.more, []);
});

test('drops a chapter with nothing showcased, so the total shrinks', () => {
  const out = buildChapters(DEFS, [item('a', ['logo'], 1)]);
  assert.deepEqual(out.map((c) => c.def.key), ['logo']);
});

test('ranks by showcase, then order, then title', () => {
  const out = buildChapters([LOGO], [
    item('c', ['logo'], 2, 50, 'Charlie'),
    item('b', ['logo'], 2, 50, 'Bravo'),
    item('z', ['logo'], 2, 10, 'Zulu'),
    item('a', ['logo'], 1, 99, 'Alpha'),
  ]);
  assert.equal(out[0]?.featured.id, 'a');
  assert.deepEqual(out[0]?.more.map((i) => i.id), ['z', 'b', 'c']);
});

test('caps the More row and flags overflow', () => {
  const many = [1, 2, 3, 4, 5].map((n) => item(`l${n}`, ['logo'], n));
  const [logo] = buildChapters([LOGO], many);
  assert.equal(logo?.more.length, MORE_LIMIT);
  assert.equal(logo?.overflow, true);
  const [few] = buildChapters([LOGO], many.slice(0, 4));
  assert.equal(few?.overflow, false);
});

test('an entry spanning two chapters appears only in the first', () => {
  const out = buildChapters(DEFS, [item('both', ['web', 'logo'], 1), item('l', ['logo'], 1)]);
  assert.equal(out[0]?.featured.id, 'both');
  assert.equal(out[1]?.featured.id, 'l');
  assert.equal(out[1]?.more.length, 0);
});

test('counter pads both numbers', () => {
  assert.equal(counter(0, 3), '01 / 03');
  assert.equal(counter(9, 12), '10 / 12');
});
