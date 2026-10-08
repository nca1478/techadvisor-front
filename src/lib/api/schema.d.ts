/**
 * Generated from the backend OpenAPI contract (http://localhost:3001/api/v1/docs-json).
 * Do not edit by hand - run `npm run api:types` instead.
 */
export interface paths {
  '/api/v1/health': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** API liveness and database reachability */
    get: operations['HealthController_check'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/config/public': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Public runtime configuration for clients */
    get: operations['PublicConfigController_getPublicConfig'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/auth/register': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Register a new customer account */
    post: operations['AuthController_register'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/auth/login': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Log in with email and password */
    post: operations['AuthController_login'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/auth/refresh': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Rotate the refresh token and get a new access token */
    post: operations['AuthController_refresh'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/auth/logout': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Revoke the presented refresh token */
    post: operations['AuthController_logout'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/users/me': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Current authenticated user profile */
    get: operations['UsersController_me'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/admin/ping': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Admin-only probe (role check) */
    get: operations['AdminController_ping'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/admin/products': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List products (every status) with filters and pagination */
    get: operations['AdminController_listProducts'];
    put?: never;
    /** Create a product (specs validated against the category schema) */
    post: operations['AdminController_createProduct'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/admin/products/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a product by id (any status) */
    get: operations['AdminController_getProduct'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** Edit a product (prices/translations replace the whole set) */
    patch: operations['AdminController_updateProduct'];
    trace?: never;
  };
  '/api/v1/admin/products/{id}/status': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** Change product status (archival is logical, never a delete) */
    patch: operations['AdminController_updateProductStatus'];
    trace?: never;
  };
  '/api/v1/admin/products/{id}/images': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** Replace the complete ordered image set (add, remove, reorder in one call) */
    put: operations['AdminController_replaceProductImages'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/admin/categories': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List categories with translations */
    get: operations['AdminController_listCategories'];
    put?: never;
    /** Create a category */
    post: operations['AdminController_createCategory'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/admin/categories/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Delete a category (409 while subcategories or products exist) */
    delete: operations['AdminController_deleteCategory'];
    options?: never;
    head?: never;
    /** Edit a category (translations replace the whole set) */
    patch: operations['AdminController_updateCategory'];
    trace?: never;
  };
  '/api/v1/admin/brands': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List brands */
    get: operations['AdminController_listBrands'];
    put?: never;
    /** Create a brand */
    post: operations['AdminController_createBrand'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/admin/brands/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Delete a brand (409 while products reference it) */
    delete: operations['AdminController_deleteBrand'];
    options?: never;
    head?: never;
    /** Edit a brand */
    patch: operations['AdminController_updateBrand'];
    trace?: never;
  };
  '/api/v1/admin/inventory/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get exact stock levels for a product */
    get: operations['AdminController_getInventory'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** Adjust physical stock by a signed delta (appends an InventoryMovement row) */
    patch: operations['AdminController_adjustInventory'];
    trace?: never;
  };
  '/api/v1/admin/inventory/{id}/movements': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List stock movements for a product (newest first) */
    get: operations['AdminController_listMovements'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/admin/orders': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List orders (any user) with status/date filters */
    get: operations['AdminController_listOrders'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/admin/orders/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get an order by id (frozen prices survive product archival) */
    get: operations['AdminController_getOrder'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/admin/orders/{id}/status': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** Change order status (state machine enforced; PAID only via webhook) */
    patch: operations['AdminController_updateOrderStatus'];
    trace?: never;
  };
  '/api/v1/admin/documents': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List corpus documents (soft-deleted excluded) with status filter */
    get: operations['AdminDocumentsController_listDocuments'];
    put?: never;
    /** Register a document by URL (fetched + ingested server-side) */
    post: operations['AdminDocumentsController_createFromUrl'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/admin/documents/upload': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Upload a document file (PDF, HTML, Markdown or plain text) */
    post: operations['AdminDocumentsController_uploadDocument'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/admin/documents/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a document with chunk count and error detail */
    get: operations['AdminDocumentsController_getDocument'];
    put?: never;
    post?: never;
    /** Soft-delete a document and remove its chunks from search */
    delete: operations['AdminDocumentsController_remove'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/admin/documents/{id}/reingest': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Re-run ingestion from the stored source bytes */
    post: operations['AdminDocumentsController_reingest'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/orders': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List the caller's own orders (newest first) */
    get: operations['OrdersController_listOrders'];
    put?: never;
    /** Create an order from the user cart (reserves stock) */
    post: operations['OrdersController_createOrder'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/orders/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get one of the caller's own orders */
    get: operations['OrdersController_getOrder'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/orders/{id}/cancel': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Cancel a PENDING_PAYMENT order (releases the stock reservation) */
    post: operations['OrdersController_cancelOrder'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/catalog/products': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List active products with filters, sorting and pagination */
    get: operations['CatalogController_listProducts'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/catalog/products/{slug}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Product detail by slug (active products only) */
    get: operations['CatalogController_productDetail'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/catalog/categories': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List categories with their specs schemas */
    get: operations['CatalogController_listCategories'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/catalog/categories/{slug}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Category detail with its specs schema for dynamic forms */
    get: operations['CatalogController_categoryDetail'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/catalog/brands': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List brands */
    get: operations['CatalogController_listBrands'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/cart': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get the current cart (guest via sid cookie, or user cart) */
    get: operations['CartController_getCart'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/cart/items': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Add a product to the cart (quantity is added to any existing line) */
    post: operations['CartController_addItem'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/cart/items/{productId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Remove a line from the cart (idempotent) */
    delete: operations['CartController_removeItem'];
    options?: never;
    head?: never;
    /** Set the quantity of a cart line */
    patch: operations['CartController_updateItem'];
    trace?: never;
  };
  '/api/v1/cart/merge': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Merge the guest cart into the authenticated user cart */
    post: operations['CartController_merge'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/payments/checkout': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Start a Stripe Checkout Session for one of your PENDING_PAYMENT orders */
    post: operations['PaymentsController_createCheckout'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/payments/webhook': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Stripe webhook (signature-verified). The only source of truth for PAID. */
    post: operations['PaymentsController_handleWebhook'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    ErrorResponseDto: {
      /**
       * @description HTTP status code of the error.
       * @example 404
       */
      statusCode: number;
      /**
       * @description Stable machine-readable error code.
       * @example NOT_FOUND
       * @enum {string}
       */
      code:
        | 'BAD_REQUEST'
        | 'UNAUTHORIZED'
        | 'FORBIDDEN'
        | 'NOT_FOUND'
        | 'CONFLICT'
        | 'UNPROCESSABLE_ENTITY'
        | 'TOO_MANY_REQUESTS'
        | 'INTERNAL_ERROR'
        | 'SERVICE_UNAVAILABLE';
      /**
       * @description Human-readable error message (English, technical).
       * @example Resource not found
       */
      message: string;
      /**
       * @description Optional extra details (validation errors, resource names).
       * @example {
       *       "resource": "Product"
       *     }
       */
      details?: Record<string, never>;
    };
    HealthResponseDto: {
      /**
       * @description Overall API status.
       * @example ok
       */
      status: string;
      /**
       * @description Database reachability probed with a trivial query.
       * @example up
       * @enum {string}
       */
      db: 'up' | 'down';
    };
    PublicConfigResponseDto: {
      /**
       * @description Base currency (ISO 4217).
       * @example USD
       */
      baseCurrency: string;
      /**
       * @description Currencies supported by the API (ISO 4217 codes).
       * @example [
       *       "USD",
       *       "EUR"
       *     ]
       */
      supportedCurrencies: string[];
      /**
       * @description Default locale (BCP 47).
       * @example en
       */
      defaultLocale: string;
      /**
       * @description Locales supported by the API (BCP 47).
       * @example [
       *       "en",
       *       "es"
       *     ]
       */
      supportedLocales: string[];
    };
    RegisterRequestDto: {
      /**
       * @description Unique email address.
       * @example ada@example.com
       */
      email: string;
      /**
       * @description Password (min 10 chars). Never logged, never returned.
       * @example correct-horse-battery-staple-42
       */
      password: string;
      /** @example Ada Lovelace */
      name?: string;
    };
    LoginRequestDto: {
      /** @example ada@example.com */
      email: string;
      /** @example correct-horse-battery-staple-42 */
      password: string;
    };
    RefreshRequestDto: {
      /** @description Opaque refresh token issued by login/refresh. */
      refreshToken: string;
    };
    LogoutResponseDto: {
      /** @example true */
      ok: boolean;
    };
    UserResponseDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      id: string;
      /** @example ada@example.com */
      email: string;
      /** @example Ada Lovelace */
      name: Record<string, never> | null;
      /**
       * @example CUSTOMER
       * @enum {string}
       */
      role: 'CUSTOMER' | 'ADMIN';
      /**
       * Format: date-time
       * @example 2026-10-06T12:00:00.000Z
       */
      createdAt: string;
      /**
       * Format: date-time
       * @example 2026-10-06T12:00:00.000Z
       */
      updatedAt: string;
    };
    AdminPriceDto: {
      /** @example EUR */
      currency: string;
      /** @example 119900 */
      amount: number;
    };
    AdminProductTranslationDto: {
      /** @example es */
      locale: string;
      /** @example Portátil 13 */
      name: string;
      /** @example Un portátil ligero… */
      description: string;
    };
    AdminProductImageDto: {
      /** @example https://cdn.example.com/p/laptop-13-front.jpg */
      url: string;
      /** @example Front view */
      alt: Record<string, never> | null;
      /** @example 0 */
      position: number;
    };
    AdminProductDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      id: string;
      /** @example FW13-ULT7-16-512 */
      sku: string;
      /** @example Laptop 13 (Ultra 7, 16 GB, 512 GB) */
      name: string;
      /** @example laptop-13-ultra-7-16-512 */
      slug: string;
      /** @example A portable workstation… */
      description: string;
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      brandId: string;
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      categoryId: string;
      /** @example 129900 */
      priceAmount: number;
      /** @example USD */
      currency: string;
      /**
       * @example ACTIVE
       * @enum {string}
       */
      status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
      /**
       * @example {
       *       "ram_gb": 16
       *     }
       */
      specs: Record<string, never>;
      prices: components['schemas']['AdminPriceDto'][];
      translations: components['schemas']['AdminProductTranslationDto'][];
      images: components['schemas']['AdminProductImageDto'][];
      /**
       * @description Physical stock on hand (exact, admin-only).
       * @example 10
       */
      stock: number;
      /**
       * @description Units held by open orders/carts.
       * @example 2
       */
      reserved: number;
      /**
       * Format: date-time
       * @example 2026-10-06T12:00:00.000Z
       */
      createdAt: string;
      /**
       * Format: date-time
       * @example 2026-10-06T12:00:00.000Z
       */
      updatedAt: string;
    };
    AdminProductListDto: {
      data: components['schemas']['AdminProductDto'][];
      /** @example 1 */
      page: number;
      /** @example 20 */
      limit: number;
      /** @example 42 */
      total: number;
      /** @example 3 */
      totalPages: number;
    };
    AdminCategoryTranslationDto: {
      /** @example es */
      locale: string;
      /** @example Portátiles */
      name: string;
    };
    AdminCategoryDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      id: string;
      /** @example Laptops */
      name: string;
      /** @example laptops */
      slug: string;
      /** @example null */
      parentId: Record<string, never> | null;
      translations: components['schemas']['AdminCategoryTranslationDto'][];
    };
    AdminBrandDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      id: string;
      /** @example Framework */
      name: string;
      /** @example framework */
      slug: string;
    };
    AdminInventoryDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      productId: string;
      /** @example 12 */
      stock: number;
      /** @example 2 */
      reserved: number;
      /** @example 10 */
      available: number;
      /**
       * @description Id of the appended InventoryMovement row.
       * @example 3fa85f64-5717-4562-b3fc-2c963f66afa6
       */
      movementId: string;
    };
    AdminInventoryMovementDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      id: string;
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      productId: string;
      /**
       * @description Signed units applied to stock.
       * @example 5
       */
      delta: number;
      /** @example Restock from supplier #42 */
      reason: string;
      /**
       * @description Physical stock after applying delta.
       * @example 15
       */
      stockAfter: number;
      /**
       * Format: date-time
       * @example 2026-10-06T12:00:00.000Z
       */
      createdAt: string;
    };
    AdminOrderItemDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      productId: string;
      /** @example Laptop 13 */
      name: string;
      /** @example laptop-13 */
      slug: string;
      /** @example 2 */
      qty: number;
      /** @example 129900 */
      unitPriceAmount: number;
      /** @example 259800 */
      lineTotalAmount: number;
    };
    AdminOrderDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      id: string;
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      userId: string;
      /** @example PAID */
      status: string;
      /** @example USD */
      currency: string;
      /** @example 259800 */
      totalAmount: number;
      items: components['schemas']['AdminOrderItemDto'][];
      /**
       * Format: date-time
       * @example 2026-10-06T12:00:00.000Z
       */
      createdAt: string;
      /**
       * Format: date-time
       * @example 2026-10-06T12:00:00.000Z
       */
      updatedAt: string;
    };
    AdminOrderListDto: {
      data: components['schemas']['AdminOrderDto'][];
      /** @example 1 */
      page: number;
      /** @example 20 */
      limit: number;
      /** @example 42 */
      total: number;
      /** @example 3 */
      totalPages: number;
    };
    AdminDocumentDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      id: string;
      /**
       * @example MANUAL
       * @enum {string}
       */
      type: 'SPEC_SHEET' | 'MANUAL' | 'FAQ' | 'WARRANTY' | 'REVIEW' | 'POLICY';
      /** @example Laptop X1 setup manual */
      title: string;
      /** @example en */
      locale: string;
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      productId: string | null;
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      categoryId: string | null;
      /** @example https://example.com/manual.pdf */
      sourceUrl: string | null;
      /** @example manual */
      source: string;
      /**
       * @example PENDING
       * @enum {string}
       */
      status: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED';
      /** @example null */
      error: string | null;
      /** @example manual.pdf */
      fileName: string | null;
      /** @example application/pdf */
      mimeType: string | null;
      /** @example 48213 */
      sizeBytes: number | null;
      /**
       * @description Chunks stored for this document.
       * @example 12
       */
      chunkCount: number;
      /**
       * Format: date-time
       * @example 2026-10-08T12:00:00.000Z
       */
      createdAt: string;
      /**
       * Format: date-time
       * @example 2026-10-08T12:00:00.000Z
       */
      updatedAt: string;
    };
    AdminDocumentListDto: {
      data: components['schemas']['AdminDocumentDto'][];
      /** @example 1 */
      page: number;
      /** @example 20 */
      limit: number;
      /** @example 7 */
      total: number;
      /** @example 1 */
      totalPages: number;
    };
    ShippingAddressDto: {
      /** @example Ada Lovelace */
      fullName: string;
      /** @example Calle Mayor 1, 2º B */
      line1: string;
      /** @example Edificio Norte */
      line2?: string;
      /** @example Madrid */
      city: string;
      /** @example Madrid */
      region?: string;
      /** @example 28001 */
      postalCode?: string;
      /**
       * @description ISO 3166-1 alpha-2 country code.
       * @example ES
       */
      country: string;
      /** @example +34 600 123 456 */
      phone?: string;
    };
    CreateOrderDto: {
      shipping: components['schemas']['ShippingAddressDto'];
    };
    OrderItemDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      productId: string;
      /** @example Laptop 13 (Ultra 7, 16 GB, 512 GB) */
      name: string;
      /** @example laptop-13-ultra-7-16-512 */
      slug: string;
      /** @example 2 */
      qty: number;
      /**
       * @description Frozen unit price in minor units, in the order currency.
       * @example 129900
       */
      unitPriceAmount: number;
      /**
       * @description unitPriceAmount * qty, in minor units.
       * @example 259800
       */
      lineTotalAmount: number;
    };
    OrderResponseDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      id: string;
      /**
       * @example PENDING_PAYMENT
       * @enum {string}
       */
      status: 'PENDING_PAYMENT' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
      /**
       * @description ISO 4217 code of all money fields.
       * @example USD
       */
      currency: string;
      /**
       * @description Frozen total in minor units.
       * @example 259800
       */
      totalAmount: number;
      /**
       * @description Sum of item quantities.
       * @example 3
       */
      itemCount: number;
      shipping: components['schemas']['ShippingAddressDto'];
      items: components['schemas']['OrderItemDto'][];
      /**
       * Format: date-time
       * @example 2026-10-06T12:00:00.000Z
       */
      createdAt: string;
      /**
       * Format: date-time
       * @example 2026-10-06T12:00:00.000Z
       */
      updatedAt: string;
    };
    CatalogBrandDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      id: string;
      /** @example Framework */
      name: string;
      /** @example framework */
      slug: string;
    };
    SpecFieldDto: {
      /** @example ram_gb */
      key: string;
      /** @example RAM */
      label: string;
      /** @enum {string} */
      type: 'string' | 'integer' | 'number' | 'boolean' | 'enum';
      /** @example GB */
      unit?: string;
      /**
       * @example [
       *       "DDR4",
       *       "DDR5"
       *     ]
       */
      options?: string[];
    };
    CatalogCategoryDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      id: string;
      /** @example Laptops */
      name: string;
      /** @example laptops */
      slug: string;
      /** @example null */
      parentSlug: Record<string, never> | null;
      /** @description Specs field definitions for this category. */
      specsSchema: components['schemas']['SpecFieldDto'][];
      /**
       * @description Resolved locale of the returned texts.
       * @example en
       */
      locale: string;
    };
    ProductListItemDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      id: string;
      /** @example FW13-ULT7-16-512 */
      sku: string;
      /** @example Laptop 13 (Ultra 7, 16 GB, 512 GB) */
      name: string;
      /** @example laptop-13-ultra-7-16-512 */
      slug: string;
      /**
       * @description Localized description.
       * @example A portable workstation…
       */
      description: string;
      brand: components['schemas']['CatalogBrandDto'];
      category: components['schemas']['CatalogCategoryDto'];
      /**
       * @description Price in minor units, in `currency`.
       * @example 129900
       */
      priceAmount: number;
      /**
       * @description Actual currency of `priceAmount` (may be the base currency fallback).
       * @example USD
       */
      currency: string;
      /**
       * @example {
       *       "ram_gb": 16,
       *       "cpu": "Intel Core Ultra 7 155H"
       *     }
       */
      specs: Record<string, never>;
      /**
       * @description Whether at least one unit is available.
       * @example true
       */
      inStock: boolean;
      /**
       * @description Available units, capped at 10 so the API never leaks exact stock.
       * @example 7
       */
      availableQuantity: number;
      /** @example https://cdn.example.com/p/laptop-13-front.jpg */
      imageUrl: Record<string, never> | null;
      /**
       * @description Image alt when set; otherwise clients fall back to the product name.
       * @example Laptop 13 front view
       */
      imageAlt: Record<string, never> | null;
      /** @example en */
      locale: string;
      /**
       * Format: date-time
       * @example 2026-10-06T12:00:00.000Z
       */
      createdAt: string;
    };
    PaginationMetaDto: {
      /** @example 1 */
      page: number;
      /** @example 20 */
      limit: number;
      /** @example 42 */
      total: number;
      /** @example 3 */
      totalPages: number;
      /** @example true */
      hasNext: boolean;
      /** @example false */
      hasPrev: boolean;
    };
    PaginatedProductsDto: {
      data: components['schemas']['ProductListItemDto'][];
      meta: components['schemas']['PaginationMetaDto'];
    };
    ProductImageDto: {
      /** @example https://cdn.example.com/p/laptop-13-front.jpg */
      url: string;
      /** @example Laptop 13 front view */
      alt: Record<string, never> | null;
      /** @example 0 */
      position: number;
    };
    ProductDetailDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      id: string;
      /** @example FW13-ULT7-16-512 */
      sku: string;
      /** @example Laptop 13 (Ultra 7, 16 GB, 512 GB) */
      name: string;
      /** @example laptop-13-ultra-7-16-512 */
      slug: string;
      /** @example A portable workstation… */
      description: string;
      brand: components['schemas']['CatalogBrandDto'];
      category: components['schemas']['CatalogCategoryDto'];
      /**
       * @description Price in minor units, in `currency`.
       * @example 129900
       */
      priceAmount: number;
      /**
       * @description Actual currency of `priceAmount` (may be the base currency fallback).
       * @example USD
       */
      currency: string;
      /**
       * @example {
       *       "ram_gb": 16,
       *       "cpu": "Intel Core Ultra 7 155H"
       *     }
       */
      specs: Record<string, never>;
      /**
       * @description Whether at least one unit is available.
       * @example true
       */
      inStock: boolean;
      /**
       * @description Available units, capped at 10 so the API never leaks exact stock.
       * @example 7
       */
      availableQuantity: number;
      /** @description All images ordered by position ascending. */
      images: components['schemas']['ProductImageDto'][];
      /** @example en */
      locale: string;
      /**
       * Format: date-time
       * @example 2026-10-06T12:00:00.000Z
       */
      createdAt: string;
    };
    CartItemDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      productId: string;
      /** @example Laptop 13 (Ultra 7, 16 GB, 512 GB) */
      name: string;
      /** @example laptop-13-ultra-7-16-512 */
      slug: string;
      /**
       * @description Primary product image (lowest position), if any.
       * @example https://cdn.example.com/p/laptop-13-front.jpg
       */
      imageUrl: Record<string, never> | null;
      /**
       * @description Unit price in minor units, in `currency`.
       * @example 129900
       */
      unitPriceAmount: number;
      /** @example 2 */
      qty: number;
      /**
       * @description unitPriceAmount * qty, in minor units.
       * @example 259800
       */
      lineTotalAmount: number;
      /**
       * @description Whether at least one unit is available.
       * @example true
       */
      inStock: boolean;
      /**
       * @description Whether the line quantity fits the available stock.
       * @example true
       */
      sufficientStock: boolean;
      /**
       * @description Available units, capped at 10 so the API never leaks exact stock.
       * @example 7
       */
      availableQuantity: number;
    };
    CartResponseDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      id: string;
      /**
       * @description Currency of all money fields in this response.
       * @example USD
       */
      currency: string;
      /**
       * @description Resolved locale of the returned product names.
       * @example en
       */
      locale: string;
      items: components['schemas']['CartItemDto'][];
      /**
       * @description Sum of line totals, in minor units.
       * @example 259800
       */
      totalAmount: number;
      /**
       * @description Sum of line quantities.
       * @example 3
       */
      itemCount: number;
    };
    AddCartItemDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      productId: string;
      /** @example 1 */
      qty: number;
    };
    UpdateCartItemDto: {
      /** @example 2 */
      qty: number;
    };
    CreateCheckoutDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      orderId: string;
    };
    CheckoutResponseDto: {
      /**
       * @description Provider key (payments.provider).
       * @example stripe
       */
      provider: string;
      /**
       * @description Provider-side session id.
       * @example cs_test_a1b2c3
       */
      sessionId: string;
      /**
       * @description Hosted checkout URL for the frontend redirect.
       * @example https://checkout.stripe.com/pay/cs_test_a1b2c3
       */
      checkoutUrl: Record<string, never> | null;
    };
    WebhookAckDto: {
      /** @example true */
      received: boolean;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  HealthController_check: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['HealthResponseDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  PublicConfigController_getPublicConfig: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PublicConfigResponseDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AuthController_register: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RegisterRequestDto'];
      };
    };
    responses: {
      /** @description Account created (role is always CUSTOMER). */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Rate limit exceeded. */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AuthController_login: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['LoginRequestDto'];
      };
    };
    responses: {
      /** @description Authenticated. Failures return 401 without revealing if the email exists. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Rate limit exceeded. */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AuthController_refresh: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RefreshRequestDto'];
      };
    };
    responses: {
      /** @description New token pair; the presented refresh token is revoked. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Rate limit exceeded. */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AuthController_logout: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RefreshRequestDto'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['LogoutResponseDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Rate limit exceeded. */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  UsersController_me: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['UserResponseDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminController_ping: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Reachable only with role ADMIN. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminController_listProducts: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdminProductListDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminController_createProduct: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdminProductDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminController_getProduct: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdminProductDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminController_updateProduct: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdminProductDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminController_updateProductStatus: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdminProductDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminController_replaceProductImages: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdminProductDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminController_listCategories: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdminCategoryDto'][];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminController_createCategory: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdminCategoryDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminController_deleteCategory: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Category deleted. */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminController_updateCategory: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdminCategoryDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminController_listBrands: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdminBrandDto'][];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminController_createBrand: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdminBrandDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminController_deleteBrand: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Brand deleted. */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminController_updateBrand: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdminBrandDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminController_getInventory: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdminInventoryDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminController_adjustInventory: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdminInventoryDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminController_listMovements: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdminInventoryMovementDto'][];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminController_listOrders: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdminOrderListDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminController_getOrder: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdminOrderDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminController_updateOrderStatus: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdminOrderDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminDocumentsController_listDocuments: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdminDocumentListDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminDocumentsController_createFromUrl: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdminDocumentDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminDocumentsController_uploadDocument: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'multipart/form-data': {
          /** Format: binary */
          file: string;
          title?: string;
          /** @enum {string} */
          type: 'SPEC_SHEET' | 'MANUAL' | 'FAQ' | 'WARRANTY' | 'REVIEW' | 'POLICY';
          /** @example en */
          locale: string;
          /** Format: uuid */
          productId?: string;
          /** Format: uuid */
          categoryId?: string;
        };
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdminDocumentDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminDocumentsController_getDocument: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdminDocumentDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminDocumentsController_remove: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Document soft-deleted; chunks removed. */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  AdminDocumentsController_reingest: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdminDocumentDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  OrdersController_listOrders: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['OrderResponseDto'][];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Authentication required. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  OrdersController_createOrder: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateOrderDto'];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['OrderResponseDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Authentication required. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Quantity exceeds available stock. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Empty cart, inactive product or invalid status transition. */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  OrdersController_getOrder: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['OrderResponseDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Authentication required. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Unknown order (or owned by another user). */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  OrdersController_cancelOrder: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['OrderResponseDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Authentication required. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Unknown order (or owned by another user). */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Only PENDING_PAYMENT orders can be cancelled by the customer. */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  CatalogController_listProducts: {
    parameters: {
      query?: {
        /** @description ISO 4217 code; defaults to base currency. */
        currency?: unknown;
        /** @description BCP 47 locale; falls back to default. */
        locale?: unknown;
        /** @description Items per page (1..100). */
        limit?: unknown;
        /** @description Page number (1-based). */
        page?: unknown;
        sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest';
        /** @description Max price in minor units, in `currency`. */
        maxPrice?: unknown;
        /** @description Min price in minor units, in `currency`. */
        minPrice?: unknown;
        /** @description Free text matched against the product name. */
        q?: unknown;
        /** @description Brand slug. */
        brand?: unknown;
        /** @description Category slug. */
        category?: unknown;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PaginatedProductsDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  CatalogController_productDetail: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Product slug. */
        slug: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ProductDetailDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Unknown slug, or not ACTIVE. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  CatalogController_listCategories: {
    parameters: {
      query?: {
        locale?: unknown;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CatalogCategoryDto'][];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  CatalogController_categoryDetail: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Category slug. */
        slug: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CatalogCategoryDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  CatalogController_listBrands: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CatalogBrandDto'][];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  CartController_getCart: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CartResponseDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  CartController_addItem: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['AddCartItemDto'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CartResponseDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Unknown or non-active product. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Quantity exceeds available stock. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  CartController_removeItem: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CartResponseDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  CartController_updateItem: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateCartItemDto'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CartResponseDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Unknown line or product. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Quantity exceeds available stock. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  CartController_merge: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Merged user cart; sid cookie cleared. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CartResponseDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Authentication required. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  PaymentsController_createCheckout: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateCheckoutDto'];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CheckoutResponseDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Authentication required. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Payments are not configured (no Stripe test keys). */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
  PaymentsController_handleWebhook: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['WebhookAckDto'];
        };
      };
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Not found. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Internal server error (uniform format). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
    };
  };
}
