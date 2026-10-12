'use client';

import { Card } from '@/components/ui/card';
import { Link } from '@/components/ui/link';
import type { CategoryTreeRow } from '@/features/admin/lib/category-submit';
import { asOptionalId } from '@/lib/api/admin';
import type { Dictionary } from '@/lib/i18n/index';

/**
 * Presentational category table. Rows arrive pre-ordered (roots first,
 * children nested with `depth`) from `orderCategoriesForDisplay`;
 * deletion is delegated to the container via `onDelete`.
 */
export function CategoriesTable({
  rows,
  locale,
  messages,
  onDelete,
}: {
  rows: CategoryTreeRow[];
  locale: string;
  messages: Dictionary['admin']['categories'];
  onDelete: (categoryId: string, categoryName: string) => void;
}) {
  const parentNameOf = (parentId: string | null): string | null => {
    if (parentId === null) return null;
    return rows.find((entry) => entry.category.id === parentId)?.category.name ?? null;
  };

  return (
    <Card padding="none">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem] border-collapse bg-surface text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th
                scope="col"
                className="px-4 py-3 text-right text-sm font-bold text-muted-foreground"
              >
                {messages.tableNumber}
              </th>
              <th scope="col" className="px-4 py-3 text-sm font-bold text-muted-foreground">
                {messages.tableName}
              </th>
              <th scope="col" className="px-4 py-3 text-sm font-bold text-muted-foreground">
                {messages.tableSlug}
              </th>
              <th scope="col" className="px-4 py-3 text-sm font-bold text-muted-foreground">
                {messages.tableParent}
              </th>
              <th scope="col" className="px-4 py-3 text-sm font-bold text-muted-foreground">
                {messages.tableTranslations}
              </th>
              <th scope="col" className="px-4 py-3 text-sm font-bold text-muted-foreground">
                <span className="sr-only">{messages.tableActions}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((entry, index) => {
              const category = entry.category;
              const parentId = asOptionalId(category.parentId);
              const parentName = parentNameOf(parentId);
              return (
                <tr key={category.id} className="border-b border-border align-top last:border-0">
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {index + 1}
                  </td>
                  <th scope="row" className="px-4 py-3 font-normal">
                    <span
                      style={
                        entry.depth > 0
                          ? { paddingLeft: `${String(entry.depth * 1.25)}rem` }
                          : undefined
                      }
                    >
                      <Link href={`/${locale}/admin/categorias/${encodeURIComponent(category.id)}`}>
                        {category.name}
                      </Link>
                    </span>
                  </th>
                  <td className="px-4 py-3 font-mono text-xs">{category.slug}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {parentName ?? messages.rootParent}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {category.translations.length === 0
                      ? messages.noTranslations
                      : category.translations.map((translation) => translation.locale).join(', ')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-3">
                      <Link href={`/${locale}/admin/categorias/${encodeURIComponent(category.id)}`}>
                        {messages.edit}
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          onDelete(category.id, category.name);
                        }}
                        className="cursor-pointer text-sm text-destructive underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        {messages.delete}
                      </button>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
