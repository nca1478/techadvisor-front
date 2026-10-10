import { Badge } from '@/components/ui/badge';
import { Link } from '@/components/ui/link';
import { Text } from '@/components/ui/text';
import type { CompareProduct, CompareTableRow } from '@/lib/api/compare';
import { formatPrice } from '@/lib/money/format';

export interface CompareTableMessages {
  feature: string;
  best: string;
  missing: string;
  priceRow: string;
}

/** Formatea una celda: `null` → "—", booleanos → Sí/No, resto → texto. */
export function formatCompareCell(value: unknown, missingLabel: string): string {
  if (value === null || value === undefined) return missingLabel;
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'number' || typeof value === 'string') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return missingLabel;
  }
}

function rowLabel(key: string, specLabels: Record<string, string>, priceLabel: string): string {
  if (key === 'price_amount') return priceLabel;
  return specLabels[key] ?? key;
}

/**
 * Tabla de comparación responsive (scroll horizontal en móvil). Los datos
 * vienen del backend (SQL); la columna destacada (`best`) la decide el
 * código del backend con criterio objetivo, nunca el LLM.
 */
export function CompareTable({
  products,
  table,
  locale,
  specLabels,
  messages,
}: {
  products: CompareProduct[];
  table: CompareTableRow[];
  locale: string;
  specLabels: Record<string, string>;
  messages: CompareTableMessages;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[560px] border-collapse bg-background text-sm">
        <caption className="sr-only">{messages.feature}</caption>
        <thead>
          <tr>
            <th scope="col" className="border-b border-border p-3 text-left font-medium">
              <Text variant="small" tone="muted" as="span">
                {messages.feature}
              </Text>
            </th>
            {products.map((product) => (
              <th
                key={product.productId}
                scope="col"
                className="border-b border-border p-3 text-left"
              >
                <Link href={`/${locale}/productos/${product.slug}`} ariaLabel={product.name}>
                  {product.name}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.map((row) => {
            const best = new Set(Array.isArray(row.best) ? row.best : []);
            const highlighted = best.size > 0;
            return (
              <tr key={row.key} data-row={row.key} data-highlighted={highlighted || undefined}>
                <th scope="row" className="border-b border-border p-3 text-left font-medium">
                  {rowLabel(row.key, specLabels, messages.priceRow)}
                </th>
                {products.map((product, index) => {
                  const value =
                    Array.isArray(row.values) && index < row.values.length
                      ? row.values[index]
                      : null;
                  const isBest = best.has(index);
                  const cell =
                    row.key === 'price_amount' && typeof value === 'number'
                      ? formatPrice(value, product.currency, locale)
                      : formatCompareCell(value, messages.missing);
                  return (
                    <td
                      key={`${row.key}-${product.productId}`}
                      data-best={isBest || undefined}
                      className={
                        isBest
                          ? 'border-b border-border bg-success-subtle p-3 font-semibold'
                          : 'border-b border-border p-3'
                      }
                    >
                      {cell}
                      {isBest ? (
                        <Badge tone="success" className="ml-2">
                          {messages.best}
                        </Badge>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
