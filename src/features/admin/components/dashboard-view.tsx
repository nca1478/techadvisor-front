import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from '@/components/ui/link';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { OrderStatusBadge } from '@/features/account/components/order-status-badge';
import type { AdminOrder } from '@/lib/api/admin';
import type { DashboardRange, SalesBucket } from '@/features/admin/lib/dashboard-stats';
import { DASHBOARD_RANGES } from '@/features/admin/lib/dashboard-stats';
import type { Dictionary } from '@/lib/i18n/index';
import { formatPrice } from '@/lib/money/format';

function formatDay(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

export interface DashboardSummary {
  recentOrders: AdminOrder[];
  ordersError: boolean;
  ordersTotal: number | null;
  revenueAmount: number;
  revenueCurrency: string | null;
  revenueCount: number;
  avgTicket: number | null;
  lowStockCount: number | null;
  outOfStockCount: number | null;
  pendingReviews: number | null;
  failedDocs: number | null;
  openUnanswered: number | null;
  overviewError: boolean;
  attentionTotal: number;
  attentionPartial: boolean;
  range: DashboardRange;
  salesBuckets: SalesBucket[];
  salesCurrency: string | null;
  locale: string;
  messages: Dictionary;
}

/**
 * Server presenter: 4 KPI cards (exact, from the overview endpoint) +
 * range selector + sales chart + recent orders + operational queue.
 * Only design-system tokens.
 */
export function DashboardView(props: DashboardSummary) {
  const {
    recentOrders,
    ordersError,
    ordersTotal,
    revenueAmount,
    revenueCurrency,
    revenueCount,
    avgTicket,
    lowStockCount,
    outOfStockCount,
    pendingReviews,
    failedDocs,
    openUnanswered,
    overviewError,
    attentionTotal: attention,
    attentionPartial,
    range,
    salesBuckets,
    salesCurrency,
    locale,
    messages,
  } = props;
  const admin = messages.admin;
  const dashboard = admin.dashboard;
  const rangeLabels: Record<DashboardRange, string> = {
    today: dashboard.rangeToday,
    '7d': dashboard.range7d,
    '30d': dashboard.range30d,
  };
  const salesMax = salesBuckets.reduce((top, bucket) => Math.max(top, bucket.amount), 0);
  // Eje X legible en rangos largos (ver ADR 0038): hasta 8 buckets se rotula
  // todo, hasta 24 cada 4, y en 30d máx. 5 etiquetas equidistantes
  // (primera y última siempre visibles) en una sola línea.
  const labelStep =
    salesBuckets.length <= 8
      ? 1
      : salesBuckets.length <= 24
        ? 4
        : Math.ceil((salesBuckets.length - 1) / 4);

  const revenueText =
    revenueCurrency === null
      ? dashboard.kpiRevenueEmpty
      : formatPrice(revenueAmount, revenueCurrency, locale);
  const ticketText =
    avgTicket === null || revenueCurrency === null
      ? dashboard.kpiTicketEmpty
      : formatPrice(avgTicket, revenueCurrency, locale);

  const queue: Array<{ label: string; count: number | null; href: string }> = [
    {
      label: dashboard.attentionOutOfStock,
      count: outOfStockCount,
      href: `/${locale}/admin/inventario?stock=out_of_stock`,
    },
    {
      label: dashboard.attentionLowStock,
      count: lowStockCount,
      href: `/${locale}/admin/inventario?stock=low_stock`,
    },
    {
      label: dashboard.attentionReviews,
      count: pendingReviews,
      href: `/${locale}/admin/resenas?status=PENDING`,
    },
    {
      label: dashboard.attentionDocs,
      count: failedDocs,
      href: `/${locale}/admin/documentos?status=FAILED`,
    },
    {
      label: dashboard.attentionAdvisor,
      count: openUnanswered,
      href: `/${locale}/admin/asesor`,
    },
  ];
  const queueEmpty = queue.every((item) => item.count === 0);

  return (
    <Stack gap="md">
      <nav aria-label={dashboard.rangeLabel}>
        <Stack direction="horizontal" gap="sm" wrap>
          {DASHBOARD_RANGES.map((item) => (
            <Button
              key={item}
              href={`/${locale}/admin?range=${item}`}
              variant={item === range ? 'primary' : 'secondary'}
              size="sm"
            >
              {rangeLabels[item]}
            </Button>
          ))}
        </Stack>
      </nav>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <Stack gap="sm">
            <Text variant="caption" tone="muted" as="div">
              {dashboard.kpiRevenue}
            </Text>
            <Text variant="price" as="div">
              {revenueText}
            </Text>
            <Text variant="caption" tone="muted" as="div">
              {revenueCurrency === null
                ? dashboard.kpiRevenueEmpty
                : `${rangeLabels[range]} · ${revenueCurrency} · ${String(revenueCount)}`}
            </Text>
            <Link href={`/${locale}/admin/ordenes`}>{dashboard.viewAll}</Link>
          </Stack>
        </Card>
        <Card tone="primary">
          <Stack gap="sm">
            <Text variant="small" tone="muted" as="div" className="font-bold">
              {dashboard.kpiOrders}
            </Text>
            <Text variant="price" as="div">
              {ordersTotal === null ? dashboard.attentionUnknown : String(ordersTotal)}
            </Text>
            <Text variant="caption" tone="muted" as="div">
              {dashboard.kpiOrdersHint}
            </Text>
            <Link href={`/${locale}/admin/ordenes`}>{dashboard.viewAll}</Link>
          </Stack>
        </Card>
        <Card tone="neutral">
          <Stack gap="sm">
            <Text variant="small" tone="muted" as="div" className="font-bold">
              {dashboard.kpiTicket}
            </Text>
            <Text variant="price" as="div">
              {ticketText}
            </Text>
            <Text variant="caption" tone="muted" as="div">
              {dashboard.kpiTicketHint}
            </Text>
            <Link href={`/${locale}/admin/ordenes`}>{dashboard.viewAll}</Link>
          </Stack>
        </Card>
        <Card tone={attention > 0 ? 'warning' : 'success'}>
          <Stack gap="sm">
            <Text variant="small" tone="muted" as="div" className="font-bold">
              {dashboard.kpiAttention}
            </Text>
            <Text variant="price" as="div">
              {String(attention)}
            </Text>
            <Text variant="caption" tone="muted" as="div">
              {attentionPartial ? dashboard.kpiAttentionPartial : dashboard.kpiAttentionHint}
            </Text>
            <Link href={`/${locale}/admin/inventario`}>{dashboard.viewAll}</Link>
          </Stack>
        </Card>
      </div>

      <Card>
        <Stack gap="sm">
          <Stack direction="horizontal" gap="md" align="center" justify="between">
            <Text variant="lead" as="div">
              {dashboard.salesTitle}
            </Text>
            <Text variant="caption" tone="muted" as="div">
              {rangeLabels[range]}
            </Text>
          </Stack>
          {salesCurrency === null || salesMax === 0 ? (
            <Text tone="muted">{dashboard.salesEmpty}</Text>
          ) : (
            <ul
              aria-label={dashboard.salesTitle}
              className="flex h-32 items-stretch gap-1 overflow-x-auto"
            >
              {salesBuckets.map((bucket, index) => {
                const pct = Math.round((bucket.amount / salesMax) * 100);
                const showLabel = index % labelStep === 0 || index === salesBuckets.length - 1;
                const barLabel = `${bucket.label} · ${formatPrice(bucket.amount, salesCurrency, locale)}`;
                return (
                  <li
                    key={bucket.key}
                    title={barLabel}
                    className="flex min-w-6 flex-1 flex-col items-center justify-end gap-1"
                  >
                    <div className="flex h-24 w-full items-end">
                      <div
                        role="img"
                        aria-label={barLabel}
                        style={{
                          height: bucket.amount === 0 ? '2px' : `${String(Math.max(6, pct))}%`,
                        }}
                        className="w-full rounded-sm bg-primary"
                      />
                    </div>
                    <span
                      // Todas las columnas reservan la misma altura de etiqueta
                      // para que la base de las barras quede alineada (ver ADR
                      // 0038): las ocultas usan `invisible` (conserva el espacio)
                      // en vez de `sr-only` (absoluto, descuadra la base).
                      // La barra ya expone `aria-label "fecha · importe"`, así
                      // que la etiqueta oculta se excluye de AT.
                      aria-hidden={showLabel ? undefined : true}
                      className={
                        showLabel
                          ? 'whitespace-nowrap text-xs leading-normal text-muted-foreground'
                          : 'invisible whitespace-nowrap text-xs leading-normal'
                      }
                    >
                      {bucket.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Stack>
      </Card>

      <Card>
        <Stack gap="sm">
          <Stack direction="horizontal" gap="md" align="center" justify="between">
            <Text variant="lead" as="div">
              {dashboard.recentOrders}
            </Text>
            <Link href={`/${locale}/admin/ordenes`}>{dashboard.viewAll}</Link>
          </Stack>
          {ordersError ? (
            <Text role="alert" className="text-destructive">
              {admin.loadError}
            </Text>
          ) : recentOrders.length === 0 ? (
            <Text tone="muted">{dashboard.noOrders}</Text>
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full min-w-[44rem] border-collapse bg-surface text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="px-4 py-3 text-sm font-bold text-muted-foreground">
                      {dashboard.tableOrder}
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-bold text-muted-foreground">
                      {dashboard.tableDate}
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-bold text-muted-foreground">
                      {dashboard.tableCustomer}
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-bold text-muted-foreground">
                      {dashboard.tableStatus}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-sm font-bold text-muted-foreground"
                    >
                      {dashboard.tableTotal}
                    </th>
                    <th scope="col" className="px-4 py-3 text-sm font-bold text-muted-foreground">
                      <span className="sr-only">{dashboard.tableActions}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0">
                      <th scope="row" className="px-4 py-3 font-normal">
                        <Link href={`/${locale}/admin/ordenes/${encodeURIComponent(order.id)}`}>
                          {order.id.slice(0, 8)}…
                        </Link>
                      </th>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDay(order.createdAt, locale)}
                      </td>
                      <td className="max-w-44 truncate px-4 py-3">
                        {order.userName ?? order.userEmail}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} messages={messages.account} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="price font-semibold">
                          {formatPrice(order.totalAmount, order.currency, locale)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/${locale}/admin/ordenes/${encodeURIComponent(order.id)}`}>
                          {dashboard.viewLabel}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Stack>
      </Card>

      <Card>
        <Stack gap="sm">
          <Stack direction="horizontal" gap="md" align="center" justify="between">
            <Text variant="lead" as="div">
              {dashboard.attentionTitle}
            </Text>
            <Link href={`/${locale}/admin/inventario`}>{dashboard.viewAll}</Link>
          </Stack>
          {overviewError ? (
            <Text role="alert" className="text-destructive">
              {admin.loadError}
            </Text>
          ) : null}
          {queueEmpty ? (
            <Text tone="muted">{dashboard.attentionEmpty}</Text>
          ) : (
            <ul className="divide-y divide-border rounded-md border border-border">
              {queue.map((item) => (
                <li key={item.label}>
                  <Stack
                    direction="horizontal"
                    gap="md"
                    align="center"
                    justify="between"
                    className="px-4 py-3"
                  >
                    <Text variant="small" as="span">
                      {item.label}
                    </Text>
                    <Stack direction="horizontal" gap="sm" align="center">
                      <Badge tone={item.count === null || item.count > 0 ? 'warning' : 'success'}>
                        {item.count === null ? dashboard.attentionUnknown : String(item.count)}
                      </Badge>
                      <Link href={item.href}>{dashboard.viewAll}</Link>
                    </Stack>
                  </Stack>
                </li>
              ))}
            </ul>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
