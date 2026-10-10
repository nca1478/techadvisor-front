import type { components } from './schema';

/**
 * Back-office reads/writes against the generated OpenAPI contract for
 * responses. Request bodies are declared here field-by-field to match the
 * backend Zod schemas (`admin.schemas.ts`): the published `docs-json` does
 * not describe query params or bodies, so the frontend cannot derive them
 * from `schema.d.ts`. Every shape below mirrors the backend 1:1 and is
 * re-validated server-side — the frontend only pre-validates for UX.
 */

export type AdminProduct = components['schemas']['AdminProductDto'];
export type AdminProductList = components['schemas']['AdminProductListDto'];
export type AdminProductStatus = AdminProduct['status'];
export type AdminPrice = components['schemas']['AdminPriceDto'];
export type AdminProductTranslation = components['schemas']['AdminProductTranslationDto'];
export type AdminProductImage = components['schemas']['AdminProductImageDto'];
export type AdminCategory = components['schemas']['AdminCategoryDto'];
export type AdminBrand = components['schemas']['AdminBrandDto'];
export type AdminInventory = components['schemas']['AdminInventoryDto'];
export type AdminInventoryMovement = components['schemas']['AdminInventoryMovementDto'];
export type AdminOrder = components['schemas']['AdminOrderDto'];
export type AdminOrderList = components['schemas']['AdminOrderListDto'];
export type AdminOrderItem = components['schemas']['AdminOrderItemDto'];
export type SpecField = components['schemas']['SpecFieldDto'];
export type AdminDocument = components['schemas']['AdminDocumentDto'];
export type AdminDocumentList = components['schemas']['AdminDocumentListDto'];
export type AdminDocumentStatus = AdminDocument['status'];
export type AdminDocumentType = AdminDocument['type'];

export type AdminOrderStatus = AdminOrder['status'];

export interface AdminProductImageInput {
  url: string;
  alt?: string;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  slug: string;
  description: string;
  brandId: string;
  categoryId: string;
  /** Integer in minor units, in `currency` (never float). */
  priceAmount: number;
  /** 3-letter ISO 4217 code; base price must use `BASE_CURRENCY`. */
  currency: string;
  status?: AdminProductStatus;
  specs?: Record<string, unknown>;
  prices?: Array<{ currency: string; amount: number }>;
  translations?: Array<{ locale: string; name: string; description: string }>;
  images?: AdminProductImageInput[];
  initialStock?: number;
}

export type UpdateProductRequest = Partial<
  Pick<
    CreateProductRequest,
    | 'sku'
    | 'name'
    | 'slug'
    | 'description'
    | 'brandId'
    | 'categoryId'
    | 'priceAmount'
    | 'currency'
    | 'specs'
    | 'prices'
    | 'translations'
  >
>;

export interface ReplaceProductImagesRequest {
  images: AdminProductImageInput[];
}

export interface AdjustInventoryRequest {
  /** Signed units (positive = restock, negative = correction). Never 0. */
  delta: number;
  /** Human-readable motive kept in the audit trail. */
  reason: string;
}

export interface AdminProductListQuery {
  status?: AdminProductStatus;
  category?: string;
  brand?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface AdminOrderListQuery {
  status?: string;
  userId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface AdminDocumentListQuery {
  status?: AdminDocumentStatus;
  type?: AdminDocumentType;
  page?: number;
  limit?: number;
}

/** Document types accepted by `POST /admin/documents/upload` and by URL. */
// mantener en sync con backend (`modules/admin/documents/admin-documents.schemas.ts`).
export const ADMIN_DOCUMENT_TYPES: readonly AdminDocumentType[] = [
  'SPEC_SHEET',
  'MANUAL',
  'FAQ',
  'WARRANTY',
  'REVIEW',
  'POLICY',
] as const;

export const ADMIN_DOCUMENT_STATUSES: readonly AdminDocumentStatus[] = [
  'PENDING',
  'PROCESSING',
  'READY',
  'FAILED',
] as const;

/** Transient ingestion states worth polling for (bounded, see the view). */
export function isDocumentProcessing(status: string): boolean {
  return status === 'PENDING' || status === 'PROCESSING';
}

export function toAdminQuery(
  query: AdminProductListQuery | AdminOrderListQuery | AdminDocumentListQuery,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const rendered = search.toString();
  return rendered === '' ? '' : `?${rendered}`;
}

/**
 * Order states an admin may move an order to, from each current state.
 * Mirror of the backend `ORDER_TRANSITIONS` table **minus `PAID` as a
 * target**: only the Stripe webhook marks orders as paid (restriction 7b).
 * // mantener en sync con backend (`modules/orders/order-status.ts`).
 */
export const ADMIN_ORDER_TRANSITIONS: Record<string, readonly string[]> = {
  PENDING_PAYMENT: ['CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
} as const;

export function adminNextStatuses(from: string): readonly string[] {
  return ADMIN_ORDER_TRANSITIONS[from] ?? [];
}

export const LOW_STOCK_THRESHOLD = 5;

export function availableUnits(product: Pick<AdminProduct, 'stock' | 'reserved'>): number {
  return product.stock - product.reserved;
}

export function isLowStock(product: Pick<AdminProduct, 'stock' | 'reserved'>): boolean {
  return availableUnits(product) <= LOW_STOCK_THRESHOLD;
}
