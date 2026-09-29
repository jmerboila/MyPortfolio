import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

/* Replaces chapters.test.ts (round 4 removed the discipline-chapter system).
   STAGES['work'] names content/work entry ids directly rather than ranking by
   a `showcase` field, so the one thing worth pinning down here is that every
   id it names actually resolves to a real content file — a typo would
   silently drop a project from the story with no build-time signal.

   PARSED, NOT IMPORTED. lifecycle.ts imports `./site` with no extension,
   which Astro/TypeScript resolve fine but Node's native type-stripping loader
   (this suite runs via plain `node --test`, no bundler) cannot — relative
   ESM imports need an explicit extension. Reading the ids out of the source
   text is the workaround the brief calls for rather than editing a working
   import just to satisfy this test. */
const src = readFileSync('src/config/lifecycle.ts', 'utf8');

/* Each STAGES entry's `id` and `work` on one object literal — matches the
   file's own formatting (one field per line) rather than a general parser. */
const STAGE_BLOCKS = [...src.matchAll(/id:\s*'([^']+)'[\s\S]*?work:\s*\[([^\]]*)\]/g)].map(
  ([, id, workList]) => ({
    id: id ?? '',
    work: [...(workList ?? '').matchAll(/'([^']+)'/g)].map((m) => m[1] ?? ''),
  }),
);

test('lifecycle.ts parsed at least one stage', () => {
  assert.ok(STAGE_BLOCKS.length > 0, 'the STAGES regex matched nothing — has the shape changed?');
});

test('every stage work id has a matching content/work file', () => {
  for (const stage of STAGE_BLOCKS) {
    for (const id of stage.work) {
      assert.ok(
        existsSync(`src/content/work/${id}.md`),
        `${stage.id}: missing src/content/work/${id}.md`,
      );
    }
  }
});

/* 2026-09-28: stages 03 to 07 show their proof in place (stage-proof.ts)
   instead of work cards, so an empty `work` everywhere is now valid. What
   must hold instead: every stage the proof file names is a real stage. */
test('every stage-proof key is a real stage id', () => {
  const proof = readFileSync('src/config/stage-proof.ts', 'utf8');
  const body = proof.slice(proof.indexOf('STAGE_PROOF'));
  const keys = [...body.matchAll(/^  '?([a-z-]+)'?: \{$/gm)].map((m) => m[1]);
  const ids = new Set(STAGE_BLOCKS.map((s) => s.id));
  assert.deepEqual(keys, ['brand', 'build', 'be-found', 'show-up', 'measure']);
  for (const k of keys) assert.ok(ids.has(k), k);
});
