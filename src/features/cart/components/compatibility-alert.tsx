import { Badge } from '@/components/ui/badge';
import { Link } from '@/components/ui/link';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type { CompatibilityIssue } from '@/lib/api/compatibility';

export interface CompatibilityProductRef {
  id: string;
  slug: string;
  name: string;
}

/**
 * Avisos del motor determinista de compatibilidad (reglas sobre `specs`,
 * sin LLM). Cada aviso enlaza al producto afectado. Presentacional: el
 * fetch vive en el contenedor del carrito.
 */
export function CompatibilityAlert({
  compatible,
  issues,
  products,
  locale,
  title,
  okLabel,
  errorBadge,
  warningBadge,
  viewProductLabel,
}: {
  compatible: boolean;
  issues: CompatibilityIssue[];
  products: CompatibilityProductRef[];
  locale: string;
  title: string;
  okLabel: string;
  errorBadge: string;
  warningBadge: string;
  viewProductLabel: string;
}) {
  const byId = new Map(products.map((product) => [product.id, product] as const));

  if (compatible && issues.length === 0) {
    return (
      <div role="status" className="rounded-md border border-border bg-success-subtle p-4">
        <Stack gap="sm">
          <Text variant="lead" as="span">
            {title}
          </Text>
          <Text variant="small">
            <Badge tone="success">{okLabel}</Badge>
          </Text>
        </Stack>
      </div>
    );
  }

  return (
    <div role="alert" className="rounded-md border border-warning bg-warning-subtle p-4">
      <Stack gap="sm">
        <Text variant="lead" as="span">
          {title}
        </Text>
        <ul className="flex flex-col gap-2">
          {issues.map((issue, index) => (
            <li key={`${issue.rule}-${String(index)}`} className="flex flex-col gap-1">
              <Text as="span" variant="small">
                <Badge tone={issue.severity === 'error' ? 'destructive' : 'warning'}>
                  {issue.severity === 'error' ? errorBadge : warningBadge}
                </Badge>{' '}
                {issue.message}
              </Text>
              {issue.productIds.length > 0 ? (
                <Text as="span" variant="small" tone="muted">
                  {issue.productIds.map((productId, position) => {
                    const ref = byId.get(productId);
                    if (!ref) return null;
                    return (
                      <span key={productId}>
                        {position > 0 ? ' · ' : null}
                        <Link
                          href={`/${locale}/productos/${ref.slug}`}
                          ariaLabel={`${viewProductLabel}: ${ref.name}`}
                        >
                          {ref.name}
                        </Link>
                      </span>
                    );
                  })}
                </Text>
              ) : null}
            </li>
          ))}
        </ul>
      </Stack>
    </div>
  );
}
