/* ============================================================================
   chapters.ts — groups showcased work into v3's discipline chapters.
   ----------------------------------------------------------------------------
   PURE ON PURPOSE. No astro:content import, so `node --test` can exercise it
   directly; the page maps collection entries onto ShowcaseItem before calling.

   The rules the tests pin down:
   - Only entries with a `showcase` rank take part. Rank 1 is the featured
     project; ranks 2+ form the More row, capped at MORE_LIMIT.
   - A chapter with nothing showcased is dropped, so the counter total is
     always the number of chapters actually on the page.
   - An entry whose cats match two chapters is claimed by the FIRST, so
     nothing is shown twice.
   ========================================================================= */

export interface ChapterDef {
  key: string;
  label: string;
  cats: readonly string[];
  /** Heading of the More row, e.g. "More logo work". */
  more: string;
  /** `always` shows the link even without overflow (social → /social). */
  all: { href: string; label: string; always: boolean };
}

export interface ShowcaseItem {
  id: string;
  cats: readonly string[];
  showcase?: number | undefined;
  order: number;
  title: string;
}

export interface Chapter<T extends ShowcaseItem> {
  def: ChapterDef;
  featured: T;
  more: T[];
  /** True when there were more ranked entries than the More row shows. */
  overflow: boolean;
}

export const MORE_LIMIT = 3;

export function buildChapters<T extends ShowcaseItem>(
  defs: readonly ChapterDef[],
  items: readonly T[],
): Chapter<T>[] {
  const claimed = new Set<string>();
  const chapters: Chapter<T>[] = [];

  for (const def of defs) {
    const ranked = items
      .filter(
        (i) =>
          i.showcase !== undefined &&
          !claimed.has(i.id) &&
          i.cats.some((c) => def.cats.includes(c)),
      )
      .sort(
        (a, b) =>
          (a.showcase ?? 0) - (b.showcase ?? 0) ||
          a.order - b.order ||
          a.title.localeCompare(b.title),
      );

    const [featured, ...rest] = ranked;
    if (!featured) continue;

    for (const i of ranked) claimed.add(i.id);
    chapters.push({
      def,
      featured,
      more: rest.slice(0, MORE_LIMIT),
      overflow: rest.length > MORE_LIMIT,
    });
  }

  return chapters;
}

export function counter(index: number, total: number): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(index + 1)} / ${pad(total)}`;
}
