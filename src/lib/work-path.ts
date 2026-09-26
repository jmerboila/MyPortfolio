/* ============================================================================
   work-path.ts: where a project lives. Every project sits under its type,
   /work/<type>/<project>/ (2026-09-26, his call: Social is one type of work,
   next to Logo and Web). The type is the first entry in the project's `cats`.

   Every link to a project goes through projectPath(), so the pattern lives
   here and nowhere else. No imports on purpose: tests/unit loads this file
   with plain `node --test`, which cannot resolve Astro's module aliases.
   ========================================================================= */

export interface WorkLike {
  id: string;
  data: { cats: readonly string[] };
}

/** A project's type: the first of its `cats`. */
export const workType = (e: WorkLike): string => e.data.cats[0] ?? '';

/** Site-relative path of a type's page, e.g. /work/logo/. */
export const typePath = (type: string): string => `/work/${type}/`;

/** Site-relative path of a project, e.g. /work/social/2026-ford-mustang-gtd/. */
export const projectPath = (e: WorkLike): string => `${typePath(workType(e))}${e.id}/`;

/** The types that have at least one project, in `order` (WORK_CATEGORIES).
 *  Drives the type pages and the footer menu, so a type appears on its own
 *  once its first project lands. */
export function liveTypes<T extends string>(order: readonly T[], entries: WorkLike[]): T[] {
  return order.filter((t) => entries.some((e) => workType(e) === t));
}
