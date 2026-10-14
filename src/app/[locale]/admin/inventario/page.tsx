import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { InventoryPanelContainer } from '@/features/admin/containers/inventory-panel-container';
import { InventoryView } from '@/features/admin/containers/inventory-view';
import { backendFetch } from '@/lib/api/backend';
import type {
  AdminInventory,
  AdminInventoryMovement,
  AdminProduct,
  AdminProductList,
  AdminStockFilter,
} from '@/lib/api/admin';
import { isAdminStockFilter, LOW_STOCK_THRESHOLD, toAdminQuery } from '@/lib/api/admin';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/index';

export const dynamic = 'force-dynamic';

interface InventoryPageProps {
  params: Promise<unknown>;
  searchParams: Promise<unknown>;
}

export async function generateMetadata({ params }: InventoryPageProps): Promise<Metadata> {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) return {};
  const messages = await getDictionary(resolved.locale);
  return { title: `${messages.admin.inventory.title} — ${messages.common.techAdvisor}` };
}

function firstParam(query: Record<string, unknown>, key: string): string {
  const value = query[key];
  return typeof value === 'string' ? value : '';
}

function isProductList(value: unknown): value is AdminProductList {
  return (
    value !== null && typeof value === 'object' && Array.isArray((value as { data?: unknown }).data)
  );
}

function isInventory(value: unknown): value is AdminInventory {
  return value !== null && typeof value === 'object' && 'stock' in value && 'available' in value;
}

function isMovementList(value: unknown): value is AdminInventoryMovement[] {
  return Array.isArray(value);
}

/** Inventory: exact levels per product + adjust form and history for the selected product. */
export default async function AdminInventoryPage({ params, searchParams }: InventoryPageProps) {
  const resolved = (await params) as { locale?: unknown };
  if (!isLocale(resolved.locale)) {
    notFound();
  }
  const locale = resolved.locale;
  const messages = await getDictionary(locale);
  const queryParams = ((await searchParams) ?? {}) as Record<string, unknown>;
  const page = Math.max(1, Number.parseInt(firstParam(queryParams, 'page'), 10) || 1);
  const rawStock = firstParam(queryParams, 'stock');
  const stock: AdminStockFilter | null = isAdminStockFilter(rawStock) ? rawStock : null;
  const q = firstParam(queryParams, 'q').trim().slice(0, 100);
  const rawProductId = firstParam(queryParams, 'productId');
  const selectedProductId = /^[0-9a-f-]{36}$/i.test(rawProductId) ? rawProductId : null;

  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  const listResult = await backendFetch(
    `/admin/products${toAdminQuery({
      ...(stock === null ? {} : { stock }),
      ...(q === '' ? {} : { q }),
      lowStockThreshold: LOW_STOCK_THRESHOLD,
      page,
      limit: 10,
    })}`,
    {
      method: 'GET',
      cookieHeader,
    },
  );
  const data = listResult.status === 200 && isProductList(listResult.body) ? listResult.body : null;

  const selected: AdminProduct | null =
    selectedProductId && data
      ? (data.data.find((product) => product.id === selectedProductId) ?? null)
      : null;

  const [inventoryResult, movementsResult] = selectedProductId
    ? await Promise.all([
        backendFetch(`/admin/inventory/${encodeURIComponent(selectedProductId)}`, {
          method: 'GET',
          cookieHeader,
        }),
        backendFetch(`/admin/inventory/${encodeURIComponent(selectedProductId)}/movements`, {
          method: 'GET',
          cookieHeader,
        }),
      ])
    : [
        { status: 0, body: null, setCookies: [] },
        { status: 0, body: null, setCookies: [] },
      ];

  const inventory =
    inventoryResult.status === 200 && isInventory(inventoryResult.body)
      ? inventoryResult.body
      : null;
  const movements =
    movementsResult.status === 200 && isMovementList(movementsResult.body)
      ? movementsResult.body
      : [];

  return (
    <InventoryView
      data={data}
      loadError={data === null}
      page={page}
      stock={stock}
      q={q}
      selectedProductId={selectedProductId}
      locale={locale}
      messages={messages}
      panel={
        selectedProductId ? (
          <Card>
            <InventoryPanelContainer
              productId={selectedProductId}
              productName={selected?.name ?? selectedProductId}
              initialInventory={inventory}
              initialMovements={movements}
              locale={locale}
              messages={messages}
            />
          </Card>
        ) : null
      }
    />
  );
}
