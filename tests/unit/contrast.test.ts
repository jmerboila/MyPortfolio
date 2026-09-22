import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

type RGB = [number, number, number];

const tokens = readFileSync('src/styles/tokens.css', 'utf8');
const v3 = readFileSync('src/styles/v3.css', 'utf8');
const dotgrid = readFileSync('src/components/DotGrid.astro', 'utf8');

const hexVar = (css: string, name: string): RGB => {
  const m = new RegExp(`${name}:\\s*#([0-9a-f]{6})`, 'i').exec(css);
  assert.ok(m?.[1], `${name} not found`);
  const h = m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
};
const tripletVar = (css: string, name: string): RGB => {
  const m = new RegExp(`${name}:\\s*(\\d+) (\\d+) (\\d+)`).exec(css);
  assert.ok(m, `${name} not found`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
};
const lum = (c: RGB) => {
  const [r, g, b] = c.map((x) => {
    const v = x / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  }) as RGB;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: RGB, b: RGB) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};
const over = (fg: RGB, bg: RGB, a: number): RGB =>
  fg.map((f, i) => a * f + (1 - a) * (bg[i] ?? 0)) as RGB;

const ground = {
  light: { bg: hexVar(tokens, '--raw-light-bg'), bg2: hexVar(tokens, '--raw-light-bg-2'), dim: hexVar(tokens, '--raw-light-text-dim') },
  dark: { bg: hexVar(tokens, '--raw-dark-bg'), bg2: hexVar(tokens, '--raw-dark-bg-2'), dim: hexVar(tokens, '--raw-dark-text-dim') },
};

for (const mode of ['light', 'dark'] as const) {
  const g = ground[mode];
  const accent = hexVar(v3, `--raw-${mode}-accent`);
  const strong = hexVar(v3, `--raw-${mode}-accent-strong`);
  const dim = hexVar(v3, `--raw-${mode}-accent-dim`);

  test(`${mode}: accent and accent-strong carry text (4.5:1) on bg and plate`, () => {
    for (const c of [accent, strong]) {
      assert.ok(ratio(c, g.bg) >= 4.5, `on bg ${ratio(c, g.bg).toFixed(2)}`);
      assert.ok(ratio(c, g.bg2) >= 4.5, `on bg-2 ${ratio(c, g.bg2).toFixed(2)}`);
    }
  });

  test(`${mode}: accent-dim clears the 3:1 UI floor on bg and plate`, () => {
    assert.ok(ratio(dim, g.bg) >= 3 && ratio(dim, g.bg2) >= 3);
  });

  test(`${mode}: text-dim stays AA on the plate (the covered-plate dim state)`, () => {
    assert.ok(ratio(g.dim, g.bg2) >= 4.5);
  });

  test(`${mode}: dot alphas stay under the solved ceiling for the purple tint`, () => {
    const tint = tripletVar(v3, `--dotgrid-rgb-${mode}`);
    const alphas = [...dotgrid.matchAll(new RegExp(`rgb\\(var\\(--dotgrid-rgb-${mode}[^)]*\\) \\/ (0\\.\\d+)\\)`, 'g'))].map((m) => Number(m[1]));
    assert.ok(alphas.length >= 2, 'DotGrid must read --dotgrid-rgb-' + mode);
    for (const a of alphas) {
      assert.ok(ratio(g.dim, over(tint, g.bg, a)) >= 4.5, `alpha ${a} breaks text-dim`);
    }
  });
}

test('on-accent text passes on both accents', () => {
  assert.ok(ratio([255, 255, 255], hexVar(v3, '--raw-light-accent')) >= 4.5);
  assert.ok(ratio(ground.dark.bg, hexVar(v3, '--raw-dark-accent')) >= 4.5);
});
