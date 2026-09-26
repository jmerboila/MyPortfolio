import { test } from 'node:test';
import assert from 'node:assert/strict';
import { liveTypes, projectPath, typePath, workType } from '../../src/lib/work-path.ts';

/* Every project lives at /work/<type>/<project>/ (2026-09-26). */
const e = (id: string, ...cats: string[]) => ({ id, data: { cats } });

test('a project lives under its first type', () => {
  assert.equal(workType(e('x', 'social', 'web')), 'social');
  assert.equal(projectPath(e('2026-ford-mustang-gtd', 'social')), '/work/social/2026-ford-mustang-gtd/');
  assert.equal(typePath('logo'), '/work/logo/');
});

test('live types follow the canonical order and ignore secondary types', () => {
  const order = ['logo', 'graphic', 'web', 'mobile', 'social'] as const;
  const live = liveTypes(order, [e('a', 'social'), e('b', 'logo', 'mobile'), e('c', 'web')]);
  assert.deepEqual(live, ['logo', 'web', 'social']);
});
