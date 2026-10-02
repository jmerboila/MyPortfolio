import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_FORMAT, SAFE_ZONES, keepClear, safeArea } from '../../src/config/ig-safe-zones.ts';

/* The Safe-Zone Toolkit's twelve formats (Devsign8-IG-Template.jsx,
   revision 3). The viewer and the spec table both read this module, so the
   published numbers are checked once, here. */
const PUBLISHED: Record<string, [number, number]> = {
  story: [950, 1266],
  reel: [885, 978],
  'reel-ad': [885, 978],
  'feed-3x4': [840, 1200],
  'feed-4x5': [840, 1110],
  'feed-1x1': [750, 840],
  'feed-landscape': [380, 446],
  'carousel-slide': [840, 1200],
  'carousel-ad': [840, 840],
  'reel-cover': [885, 978],
  highlight: [720, 720],
  profile: [764, 764],
};

test('twelve formats, unique ids, the Reel first shown', () => {
  assert.equal(SAFE_ZONES.length, 12);
  assert.equal(new Set(SAFE_ZONES.map((f) => f.id)).size, 12);
  assert.ok(SAFE_ZONES.some((f) => f.id === DEFAULT_FORMAT));
});

test('every safe area is the canvas minus its margins, as published', () => {
  for (const f of SAFE_ZONES) {
    const { w, h } = safeArea(f);
    assert.deepEqual([w, h], PUBLISHED[f.id], f.id);
  }
});

test('guides sit inside the canvas, and each safe box fits its circle', () => {
  for (const f of SAFE_ZONES) {
    for (const y of f.guidesH ?? []) assert.ok(y > 0 && y < f.h, `${f.id} guide y ${y}`);
    for (const x of f.guidesV ?? []) assert.ok(x > 0 && x < f.w, `${f.id} guide x ${x}`);
    if (!f.circle) continue;
    const { cx, cy, r } = f.circle;
    const corners = [
      [f.m.l, f.m.t],
      [f.w - f.m.r, f.m.t],
      [f.m.l, f.h - f.m.b],
      [f.w - f.m.r, f.h - f.m.b],
    ];
    for (const [x, y] of corners) assert.ok(Math.hypot(x - cx, y - cy) <= r + 1, `${f.id} corner ${x},${y}`);
  }
});

test('keep-clear reads as the spec table writes it', () => {
  const by = (id: string) => SAFE_ZONES.find((f) => f.id === id)!;
  assert.equal(keepClear(by('feed-3x4')), '120 each side');
  assert.equal(keepClear(by('reel')), '270, 130, 672, 65');
  assert.equal(keepClear(by('profile')), '158 each side');
});

test('no em dashes in the notes', () => {
  for (const f of SAFE_ZONES) assert.doesNotMatch(f.note + f.name, /—/, f.id);
});
