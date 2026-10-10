export { createAdvisorApi, type AdvisorApi, type AdvisorCitation } from './advisor';
export type {
  AdvisorErrorKind,
  AdvisorFeedbackRequest,
  AdvisorSseResult,
  ChatHistory,
  ChatHistoryMessage,
  ChatSession,
  FeedbackValue,
  ProductQaResponse,
  RecommendInput,
  RecommendProduct,
  RecommendResponse,
} from './advisor';
export {
  asAdvisorCitation,
  asRecommendProduct,
  chatSessionStorageKey,
  classifyAdvisorError,
  parseChatHistory,
  parseRecommendResponse,
  parseSseFrames,
  streamRecommendation,
} from './advisor';
export { createAuthApi, type AuthApi, type AuthPayload, type AuthUser } from './auth';
export {
  ADMIN_ORDER_TRANSITIONS,
  adminNextStatuses,
  availableUnits,
  isLowStock,
  LOW_STOCK_THRESHOLD,
  toAdminQuery,
} from './admin';
export type {
  AdjustInventoryRequest,
  AdminBrand,
  AdminCategory,
  AdminInventory,
  AdminInventoryMovement,
  AdminOrder,
  AdminOrderItem,
  AdminOrderList,
  AdminOrderListQuery,
  AdminOrderStatus,
  AdminPrice,
  AdminProduct,
  AdminProductImage,
  AdminProductImageInput,
  AdminProductList,
  AdminProductListQuery,
  AdminProductStatus,
  AdminProductTranslation,
  CreateProductRequest,
  ReplaceProductImagesRequest,
  SpecField,
  UpdateProductRequest,
} from './admin';
export type { LoginRequest, RefreshRequest, RegisterRequest, TokenPair } from './auth';
export { createCartApi, type AddCartItem, type Cart, type CartApi, type CartItem } from './cart';
export type { UpdateCartItem } from './cart';
export {
  COMPARE_MAX_PRODUCTS,
  COMPARE_MIN_PRODUCTS,
  createCompareApi,
  parseCompareIds,
  parseCompareResponse,
  type CompareApi,
  type CompareCitation,
  type CompareCompatibility,
  type CompareInput,
  type CompareProduct,
  type CompareResponse,
  type CompareTableRow,
} from './compare';
export {
  compatibilityHasErrors,
  createCompatibilityApi,
  parseCompatibilityResult,
  sortCompatibilityIssues,
  type CompatibilityApi,
  type CompatibilityCheckInput,
  type CompatibilityIssue,
  type CompatibilityResult,
  type CompatibilitySeverity,
} from './compatibility';
export { createCatalogApi, nullableString, primaryImage, productImageAlt } from './catalog';
export type {
  CatalogApi,
  CatalogBrand,
  CatalogCategory,
  ListProductsParams,
  PaginatedProducts,
  ProductDetail,
  ProductImage,
  ProductListItem,
  ProductSort,
} from './catalog';
export { createApiClient, type ApiClient, type ApiClientOptions } from './client';
export { ApiError, isUniformErrorBody, type UniformErrorBody } from './errors';
export {
  createOrdersApi,
  isOrderPending,
  PENDING_ORDER_STATUSES,
  TERMINAL_ORDER_STATUSES,
  type CreateOrder,
  type Order,
  type OrderItem,
  type OrderStatus,
  type OrdersApi,
  type ShippingAddress,
} from './orders';
export {
  createPaymentsApi,
  type Checkout,
  type CreateCheckout,
  type PaymentsApi,
} from './payments';
export { createSearchApi, type SearchApi, type SearchParams, type SearchProduct } from './search';
export type { SearchResponse, SearchResult } from './search';
export { getPublicConfig, type PublicConfig } from './public-config';
