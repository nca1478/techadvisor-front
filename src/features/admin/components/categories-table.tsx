'use client';

import { Card } from '@/components/ui/card';
import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Link } from '@/components/ui/link';
import type { CategoryTreeRow } from '@/features/admin/lib/category-submit';
import { asOptionalId } from '@/lib/api/admin';
import { nullableString } from '@/lib/api/catalog';
import type { Dictionary } from '@/lib/i18n/index';

const VALUE_TONES: readonly BadgeTone[] = ['primary', 'success', 'warning'];

function toneForValue(value: string): BadgeTone {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return VALUE_TONES[hash % VALUE_TONES.length] ?? 'primary';
}

export function CategoriesTable({
  rows,
  locale,
  messages,
  homeOverrides,
  pendingHomeId,
  startIndex = 0,
  onDelete,
  onToggleHome,
}: {
  rows: CategoryTreeRow[];
  locale: string;
  messages: Dictionary['admin']['categories'];
  homeOverrides: Record<string, boolean>;
  pendingHomeId: string | null;
  /** Global offset of the first row (client-side paging keeps numbering continuous). */
  startIndex?: number;
  onDelete: (categoryId: string, categoryName: string) => void;
  onToggleHome: (categoryId: string, showInHome: boolean) => void;
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
                {messages.tableImage}
              </th>
              <th scope="col" className="px-4 py-3 text-sm font-bold text-muted-foreground">
                {messages.tableHome}
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
                <tr key={category.id} className="border-b border-border align-middle last:border-0">
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {startIndex + index + 1}
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
                  <td className="px-4 py-3">
                    {nullableString(
                      (category as unknown as Record<string, unknown>)['imageUrl'],
                    ) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={(category as unknown as Record<string, unknown>)['imageUrl'] as string}
                        alt=""
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="h-10 w-10 rounded-md border border-border object-cover"
                      />
                    ) : (
                      <span className="text-muted-foreground">{messages.noImage}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const raw = category as unknown as Record<string, unknown>;
                      const checked = homeOverrides[category.id] ?? raw['showInHome'] !== false;
                      const pending = pendingHomeId === category.id;
                      return (
                        <button
                          type="button"
                          role="switch"
                          aria-checked={checked}
                          aria-label={messages.switchLabel.replace('{name}', category.name)}
                          disabled={pending}
                          onClick={() => {
                            onToggleHome(category.id, !checked);
                          }}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-wait disabled:opacity-60 ${
                            checked
                              ? 'justify-end border-primary bg-primary'
                              : 'justify-start border-border-strong bg-surface'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`mx-0.5 inline-block h-3.5 w-3.5 rounded-full transition-colors ${
                              checked ? 'bg-primary-foreground' : 'bg-muted-foreground'
                            }`}
                          />
                        </button>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    {parentName === null ? (
                      <Badge tone="neutral">{messages.rootParent}</Badge>
                    ) : (
                      <Badge tone={toneForValue(parentName)}>{parentName}</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {category.translations.length === 0 ? (
                      <Badge tone="neutral">{messages.noTranslations}</Badge>
                    ) : (
                      <span className="inline-flex flex-wrap items-center gap-1.5">
                        {category.translations.map((translation) => (
                          <Badge key={translation.locale} tone={toneForValue(translation.locale)}>
                            {translation.locale}
                          </Badge>
                        ))}
                      </span>
                    )}
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
