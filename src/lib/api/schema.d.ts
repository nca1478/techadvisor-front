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
    /** API liveness plus db/redis/queue/AI availability (no live AI probe) */
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
    /** Update the authenticated user profile (name and password only) */
    patch: operations['UsersController_updateMe'];
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
  '/api/v1/admin/products/metrics': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Catalog counters: totals plus stock health for the products header */
    get: operations['AdminController_productMetrics'];
    put?: never;
    post?: never;
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
    /** Get a category by id (for the back-office edit screen) */
    get: operations['AdminController_getCategory'];
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
  '/api/v1/admin/metrics/overview': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Exact dashboard aggregation over an optional date range */
    get: operations['AdminController_getMetricsOverview'];
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
    /** List corpus documents (soft-deleted excluded) with status, type and title search filters */
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
  '/api/v1/admin/advisor/unanswered': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List abstentions under triage (NEW/IN_REVIEW/RESOLVED), newest first */
    get: operations['AdminAdvisorController_listUnanswered'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/admin/advisor/unanswered/groups': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Abstentions grouped by normalized question text, most frequent first */
    get: operations['AdminAdvisorController_unansweredGroups'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/admin/advisor/unanswered/{id}': {
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
    /** Move an abstention forward in triage (NEW → IN_REVIEW → RESOLVED; same-state is a no-op) */
    patch: operations['AdminAdvisorController_updateUnansweredStatus'];
    trace?: never;
  };
  '/api/v1/admin/advisor/feedback': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List thumbs up/down votes (minimized excerpts), newest first */
    get: operations['AdminAdvisorController_listFeedback'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/admin/advisor/feedback/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Full feedback vote (admin-only, e.g. to draft a corpus document) */
    get: operations['AdminAdvisorController_getFeedback'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/admin/advisor/sessions/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Minimized conversation view (excerpts only; purged sessions 404) */
    get: operations['AdminAdvisorController_getSession'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/admin/advisor/metrics': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Improvement-loop summary: open abstentions, satisfaction, frequent gaps */
    get: operations['AdminAdvisorController_getMetrics'];
    put?: never;
    post?: never;
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
  '/api/v1/admin/reindex': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Start a reindex toward the configured EMBEDDING_MODEL/EMBEDDING_DIM */
    post: operations['ReindexController_start'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/admin/reindex/active': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Show the embedding model currently serving retrieval */
    get: operations['ReindexController_active'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/admin/reindex/jobs/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Report reindex progress (snapshot counters + live off-target count) */
    get: operations['ReindexController_progress'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/admin/reindex/jobs/{id}/activate': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Flip retrieval to the reindexed model (only at 100% with zero failures) */
    post: operations['ReindexController_activate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/admin/reindex/jobs/{id}/resume': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Re-enqueue batches for chunks still off-target */
    post: operations['ReindexController_resume'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/search': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Natural-language product search over the RAG corpus */
    get: operations['SearchController_searchProducts'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/advisor/product-qa': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Ask the advisor a question about one product (RAG, cited) */
    post: operations['AdvisorController_answerProductQuestion'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/advisor/compare': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Compare 2-3 products: SQL table + cited LLM summary */
    post: operations['AdvisorController_compareProducts'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/advisor/support': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Ask the post-sale support advisor (policies, cited) */
    post: operations['AdvisorController_answerSupportQuestion'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/advisor/feedback': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Record a thumbs up/down vote on an advisor answer (stub) */
    post: operations['AdvisorController_recordFeedback'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/advisor/sessions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List the caller's own chat sessions (newest first) */
    get: operations['ChatSessionsController_listSessions'];
    put?: never;
    /** Create a chat session (authenticated user, or anonymous guest) */
    post: operations['ChatSessionsController_createSession'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/advisor/sessions/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Read one owned session with its message history */
    get: operations['ChatSessionsController_getSession'];
    put?: never;
    post?: never;
    /** Permanently delete one owned session with its messages */
    delete: operations['ChatSessionsController_deleteSession'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/advisor/sessions/{id}/messages': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Append one message (legacy role+content, 201) or run the buying advisor (content only: 200 JSON, or SSE with Accept: text/event-stream) */
    post: operations['ChatSessionsController_postSessionMessage'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/advisor/sessions/cleanup': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Purge anonymous sessions past the retention window (admin job trigger) */
    post: operations['ChatSessionsController_cleanupSessions'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/compatibility/check': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Check compatibility of a set of products (deterministic, no LLM) */
    post: operations['CompatibilityController_checkCompatibility'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/reviews': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Create a review (buyers of this product only, once per product) */
    post: operations['ReviewsController_createReview'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/reviews/product/{productId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List published reviews of a product (paginated, newest first) */
    get: operations['ReviewsController_listPublished'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/reviews/product/{productId}/summary': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Cached pros/cons summary (summary null while below the review minimum) */
    get: operations['ReviewsController_getSummary'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/admin/reviews': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List reviews with status/product filters (newest first) */
    get: operations['AdminReviewsController_listReviews'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/admin/reviews/{id}/status': {
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
    /** Publish or reject a review (refreshes corpus + summary) */
    patch: operations['AdminReviewsController_moderateReview'];
    trace?: never;
  };
  '/api/v1/metrics': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Prometheus metrics: AI latency/errors per provider+model, abstentions, queues, documents */
    get: operations['ObservabilityController_metrics'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/metrics/cleanup': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Purge ai_call_logs rows past AI_CALL_LOG_RETENTION_DAYS (admin job trigger) */
    post: operations['ObservabilityController_cleanupLogs'];
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
    HealthIngestionCountsDto: {
      /** @example 3 */
      waiting: number;
      /** @example 1 */
      active: number;
      /** @example 0 */
      delayed: number;
      /** @example 0 */
      failed: number;
    };
    HealthAiStateDto: {
      /** @example openai-compatible */
      provider: string;
      /** @example text-embedding-3-small */
      model: string;
      /**
       * @example OK
       * @enum {string}
       */
      status: 'OK' | 'ERROR';
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
      /**
       * @description Redis reachability probed with PING (short timeout).
       * @example up
       * @enum {string}
       */
      redis: 'up' | 'down';
      /**
       * @description Ingestion queue readability (down when Redis is unreachable).
       * @example up
       * @enum {string}
       */
      ingestion: 'up' | 'down' | 'unknown';
      /** @description BullMQ ingestion queue depths; absent when the queue is unreadable. */
      ingestionCounts?: components['schemas']['HealthIngestionCountsDto'];
      /**
       * @description AI availability from the last known instrumented call outcome (never a live provider probe).
       * @example up
       * @enum {string}
       */
      ai: 'up' | 'degraded' | 'unknown';
      /** @description Last known outcome per provider/model (metadata only, no content). */
      aiStates?: components['schemas']['HealthAiStateDto'][];
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
    UpdateProfileRequestDto: {
      /** @example Ada Lovelace */
      name?: string;
      /**
       * @description New password (min 10 chars). Never logged, never returned.
       * @example correct-horse-battery-staple-42
       */
      password?: string;
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
    AdminProductMetricsDto: {
      /**
       * @description Products in every status.
       * @example 248
       */
      total: number;
      /**
       * @description Products with status ACTIVE.
       * @example 211
       */
      active: number;
      /**
       * @description Available units at or below the threshold (includes out of stock).
       * @example 23
       */
      lowStock: number;
      /**
       * @description Zero available units.
       * @example 14
       */
      outOfStock: number;
      /**
       * @description More than zero available units.
       * @example 230
       */
      inStock: number;
      /**
       * @description Products with held units (reserved > 0).
       * @example 7
       */
      reserved: number;
      /**
       * @description Threshold applied to lowStock.
       * @example 5
       */
      lowStockThreshold: number;
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
      /**
       * @description Single cover image (home "shop by category" card background).
       * @example https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop
       */
      imageUrl: Record<string, never> | null;
      /**
       * @description Cover image alt when set; otherwise clients fall back to the category name.
       * @example Laptops
       */
      imageAlt: Record<string, never> | null;
      /**
       * @description Whether the category shows in the home section.
       * @example true
       */
      showInHome: boolean;
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
    AdminMetricsStatusCountDto: {
      /** @example PAID */
      status: string;
      /** @example 12 */
      count: number;
    };
    AdminMetricsRevenueDto: {
      /** @example USD */
      currency: string;
      /**
       * @description Sum in minor units (never float).
       * @example 259800
       */
      amount: number;
      /**
       * @description Collected orders counted in this currency.
       * @example 12
       */
      count: number;
    };
    AdminMetricsBucketDto: {
      /** @example 2026-10-07T00:00:00.000Z */
      key: string;
      /** @example 45000 */
      amount: number;
    };
    AdminMetricsAttentionDto: {
      /**
       * @description Products with zero available units.
       * @example 3
       */
      outOfStock: number;
      /**
       * @description Products at or below the low-stock threshold.
       * @example 5
       */
      lowStock: number;
      /**
       * @description Reviews awaiting moderation.
       * @example 2
       */
      pendingReviews: number;
      /**
       * @description Live (non-deleted) documents in FAILED.
       * @example 1
       */
      failedDocs: number;
      /**
       * @description Unanswered queries in NEW or IN_REVIEW.
       * @example 4
       */
      openUnanswered: number;
    };
    AdminMetricsOverviewDto: {
      /** @example 2026-10-07T00:00:00.000Z */
      from: Record<string, never> | null;
      /** @example 2026-10-13T15:30:00.000Z */
      to: Record<string, never> | null;
      /**
       * @example day
       * @enum {string}
       */
      granularity: 'hour' | 'day';
      /**
       * @description Orders created in range (exact).
       * @example 42
       */
      ordersTotal: number;
      byStatus: components['schemas']['AdminMetricsStatusCountDto'][];
      revenue: components['schemas']['AdminMetricsRevenueDto'][];
      /**
       * @description Mode currency of collected orders; null when none.
       * @example USD
       */
      bucketCurrency: Record<string, never> | null;
      buckets: components['schemas']['AdminMetricsBucketDto'][];
      attention: components['schemas']['AdminMetricsAttentionDto'];
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
    OrderStatusHistoryDto: {
      /**
       * @description Status before the change; null for the initial entry at creation.
       * @example PAID
       */
      from: string | null;
      /** @example PROCESSING */
      to: string;
      /**
       * Format: date-time
       * @description UTC date/time when the order entered `to`.
       * @example 2026-10-06T12:00:00.000Z
       */
      at: string;
    };
    AdminOrderDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      id: string;
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      userId: string;
      /** @example Ada Lovelace */
      userName: string | null;
      /** @example ada@example.com */
      userEmail: string;
      /** @example PAID */
      status: string;
      /** @example USD */
      currency: string;
      /** @example 259800 */
      totalAmount: number;
      items: components['schemas']['AdminOrderItemDto'][];
      shipping: components['schemas']['ShippingAddressDto'];
      /** @description Recorded status changes, oldest first. Empty for pre-history orders. */
      statusHistory: components['schemas']['OrderStatusHistoryDto'][];
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
    AdminUnansweredQueryDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      id: string;
      /**
       * @description Raw user question.
       * @example ¿Cuánto dura la batería?
       */
      query: string;
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      productId?: Record<string, never> | null;
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      sessionId?: Record<string, never> | null;
      /** @example no_evidence */
      reason: string;
      /**
       * @example NEW
       * @enum {string}
       */
      status: 'NEW' | 'IN_REVIEW' | 'RESOLVED';
      /**
       * Format: date-time
       * @example 2026-10-10T12:00:00.000Z
       */
      createdAt: string;
    };
    AdminUnansweredQueryListDto: {
      data: components['schemas']['AdminUnansweredQueryDto'][];
      /** @example 1 */
      page: number;
      /** @example 20 */
      limit: number;
      /** @example 42 */
      total: number;
      /** @example 3 */
      totalPages: number;
    };
    AdminUnansweredGroupDto: {
      /**
       * @description Normalized bucket key (lowercase, no diacritics/punctuation).
       * @example cuanto dura la bateria
       */
      key: string;
      /**
       * @description First-seen raw question, as the human-readable sample.
       * @example ¿Cuánto dura la batería?
       */
      sample: string;
      /**
       * @description Rows in this bucket within the scan window.
       * @example 7
       */
      count: number;
      /** @example 2026-10-10T12:00:00.000Z */
      latestAt: string;
      /**
       * @description Row ids in this bucket (newest first), for drill-down.
       * @example [
       *       "3fa85f64-5717-4562-b3fc-2c963f66afa6"
       *     ]
       */
      ids: string[];
    };
    AdminUnansweredGroupListDto: {
      data: components['schemas']['AdminUnansweredGroupDto'][];
      /** @example 1 */
      page: number;
      /** @example 20 */
      limit: number;
      /** @example 5 */
      total: number;
      /** @example 1 */
      totalPages: number;
    };
    AdminAdvisorFeedbackDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      id: string;
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      productId?: Record<string, never> | null;
      /**
       * @description Chat session of the voted answer; backs the minimized conversation link.
       * @example 3fa85f64-5717-4562-b3fc-2c963f66afa6
       */
      sessionId?: Record<string, never> | null;
      /**
       * @example up
       * @enum {string}
       */
      value: 'up' | 'down';
      /** @example false */
      abstained: boolean;
      /**
       * @description First 200 chars of the question.
       * @example ¿Cuánto dura la batería?
       */
      queryExcerpt: string;
      /**
       * @description First 300 chars of the voted answer.
       * @example La batería dura hasta 10 horas [1].
       */
      answerExcerpt: string;
      /**
       * @description Full question length (the excerpt may be cut).
       * @example 24
       */
      queryLength: number;
      /**
       * @description Full answer length (the excerpt may be cut).
       * @example 38
       */
      answerLength: number;
      /**
       * Format: date-time
       * @example 2026-10-10T12:00:00.000Z
       */
      createdAt: string;
    };
    AdminAdvisorFeedbackListDto: {
      data: components['schemas']['AdminAdvisorFeedbackDto'][];
      /** @example 1 */
      page: number;
      /** @example 20 */
      limit: number;
      /** @example 42 */
      total: number;
      /** @example 3 */
      totalPages: number;
    };
    AdminAdvisorFeedbackDetailDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      id: string;
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      productId?: Record<string, never> | null;
      /**
       * @description Chat session of the voted answer; backs the minimized conversation link.
       * @example 3fa85f64-5717-4562-b3fc-2c963f66afa6
       */
      sessionId?: Record<string, never> | null;
      /**
       * @example up
       * @enum {string}
       */
      value: 'up' | 'down';
      /** @example false */
      abstained: boolean;
      /**
       * @description First 200 chars of the question.
       * @example ¿Cuánto dura la batería?
       */
      queryExcerpt: string;
      /**
       * @description First 300 chars of the voted answer.
       * @example La batería dura hasta 10 horas [1].
       */
      answerExcerpt: string;
      /**
       * @description Full question length (the excerpt may be cut).
       * @example 24
       */
      queryLength: number;
      /**
       * @description Full answer length (the excerpt may be cut).
       * @example 38
       */
      answerLength: number;
      /**
       * Format: date-time
       * @example 2026-10-10T12:00:00.000Z
       */
      createdAt: string;
      /** @example ¿Cuánto dura la batería? */
      query: string;
      /** @example La batería dura hasta 10 horas [1]. */
      answer: string;
    };
    AdminAdvisorSessionMessageDto: {
      /**
       * @example USER
       * @enum {string}
       */
      role: 'USER' | 'ASSISTANT';
      /**
       * @description First 200 chars of the message.
       * @example Portátil para…
       */
      excerpt: string;
      /**
       * @description Full message length (the excerpt may be cut).
       * @example 42
       */
      length: number;
      /**
       * Format: date-time
       * @example 2026-10-10T12:00:00.000Z
       */
      createdAt: string;
    };
    AdminAdvisorSessionDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      sessionId: string;
      /**
       * @description Messages kept in this session.
       * @example 4
       */
      messageCount: number;
      messages: components['schemas']['AdminAdvisorSessionMessageDto'][];
      /**
       * Format: date-time
       * @example 2026-10-10T12:00:00.000Z
       */
      createdAt: string;
    };
    AdminAdvisorCountDto: {
      /** @example NEW */
      key: string;
      /** @example 12 */
      count: number;
    };
    AdminAdvisorTopQueryDto: {
      /** @example cuanto dura la bateria */
      key: string;
      /** @example ¿Cuánto dura la batería? */
      sample: string;
      /** @example 7 */
      count: number;
    };
    AdminAdvisorMetricsDto: {
      /**
       * @description Open (NEW + IN_REVIEW) abstentions.
       * @example 25
       */
      openUnanswered: number;
      /** @description Abstentions by triage status. */
      unansweredByStatus: components['schemas']['AdminAdvisorCountDto'][];
      /** @description Abstentions by advisor reason. */
      unansweredByReason: components['schemas']['AdminAdvisorCountDto'][];
      /**
       * @description Feedback votes recorded.
       * @example 40
       */
      feedbackTotal: number;
      /** @example 30 */
      feedbackUp: number;
      /** @example 10 */
      feedbackDown: number;
      /**
       * @description up / total, null while no votes exist.
       * @example 0.75
       */
      satisfactionRate: number | null;
      /** @description Top normalized open questions (max 10) by frequency. */
      topQueries: components['schemas']['AdminAdvisorTopQueryDto'][];
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
      /** @description Recorded status changes, oldest first. Empty for pre-history orders. */
      statusHistory: components['schemas']['OrderStatusHistoryDto'][];
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
      /**
       * @description Single cover image (home "shop by category" card background).
       * @example https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop
       */
      imageUrl: Record<string, never> | null;
      /**
       * @description Cover image alt when set; otherwise clients fall back to the category name.
       * @example Laptops
       */
      imageAlt: Record<string, never> | null;
      /**
       * @description Whether the category shows in the home section.
       * @example true
       */
      showInHome: boolean;
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
    ReindexStartDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      jobId: string;
      /**
       * @example started
       * @enum {string}
       */
      status: 'started' | 'already-running';
      /**
       * @description Model active when the job started.
       * @example openai/text-embedding-3-small
       */
      sourceModel: string;
      /** @example text-embedding-3-small */
      targetModel: string;
      /** @example 1536 */
      targetDim: number;
      /** @example embedding */
      targetColumn: string;
      /** @example 1200 */
      totalChunks: number;
      /** @example 12 */
      batches: number;
    };
    ActiveEmbeddingDto: {
      /** @example text-embedding-3-small */
      model: string;
      /** @example 1536 */
      dim: number;
      /** @example embedding */
      column: string;
      /**
       * @example vector
       * @enum {string}
       */
      cast: 'vector' | 'halfvec';
    };
    ReindexProgressDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      jobId: string;
      /**
       * @example RUNNING
       * @enum {string}
       */
      status: 'RUNNING' | 'COMPLETED';
      /** @example openai/text-embedding-3-small */
      sourceModel: string | null;
      /** @example text-embedding-3-small */
      targetModel: string;
      /** @example 1536 */
      targetDim: number;
      /** @example embedding */
      targetColumn: string;
      /** @example 1200 */
      totalChunks: number;
      /** @example 300 */
      processedChunks: number;
      /** @example 0 */
      failedChunks: number;
      /**
       * @description 0–100 over the snapshotted set.
       * @example 25
       */
      percent: number;
      /**
       * @description Live chunks still missing vectors in the target column (informational; the activation gate covers the snapshotted set).
       * @example 900
       */
      remainingChunks: number;
      /** @example false */
      activatable: boolean;
    };
    ReindexActivateDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      jobId: string;
      /** @example false */
      alreadyActive: boolean;
      /** @example text-embedding-3-small */
      model: string;
      /** @example 1536 */
      dim: number;
      /** @example embedding */
      column: string;
    };
    ReindexResumeDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      jobId: string;
      /** @example 3 */
      enqueuedBatches: number;
      /** @example 250 */
      remaining: number;
    };
    SearchResultDto: {
      /** @description Product hydrated from SQL. */
      product: components['schemas']['ProductListItemDto'];
      /**
       * @description Best fused retrieval score among the product chunks.
       * @example 0.032
       */
      score: number;
      /**
       * @description Evidence fragment from the best matching chunk (truncated).
       * @example Ligero y cómodo para sesiones largas…
       */
      snippet: string;
    };
    SearchResponseDto: {
      /** @example audífonos livianos para usar muchas horas */
      query: string;
      /**
       * @description True when embeddings failed and results are full-text only.
       * @example false
       */
      degraded: boolean;
      /**
       * @description Resolved locale of the returned texts.
       * @example es
       */
      locale: string;
      /**
       * @description Currency of every product price.
       * @example USD
       */
      currency: string;
      results: components['schemas']['SearchResultDto'][];
    };
    ProductQaCitationDto: {
      /**
       * @description 1-based number of the cited chunk ([n] in the answer).
       * @example 1
       */
      n: number;
      /**
       * @description Source document id.
       * @example doc-id
       */
      documentId: string;
      /**
       * @description Source chunk id.
       * @example chunk-id
       */
      chunkId: string;
      /**
       * @description Source document title.
       * @example X200 manual
       */
      title: string;
      /**
       * @description Evidence fragment from the cited chunk (truncated).
       * @example La batería dura hasta 10 horas…
       */
      snippet: string;
    };
    ProductQaResponseDto: {
      /**
       * @description Assistant answer in the request locale, with [n] citation markers.
       * @example La batería dura hasta 10 horas [1].
       */
      answer: string;
      citations: components['schemas']['ProductQaCitationDto'][];
      /**
       * @description True when no sufficient evidence existed: the LLM was not called and the query was recorded for review.
       * @example false
       */
      abstained: boolean;
    };
    CompareRequestDto: {
      /**
       * @description Ids of the 2..3 ACTIVE products to compare (unique UUIDs).
       * @example [
       *       "3fa85f64-5717-4562-b3fc-2c963f66afa6",
       *       "6ba7b811-9dad-11d1-80b4-00c04fd430c8"
       *     ]
       */
      productIds: string[];
      /**
       * @description Use case the summary focuses on (1..500 chars).
       * @example gaming en 1080p
       */
      useCase?: string;
      /**
       * @description BCP 47 summary locale; defaults server-side.
       * @example es
       */
      locale?: string;
    };
    CompareProductDto: {
      /** @example 3fa85f64-5717-4562-b3fc-2c963f66afa6 */
      productId: string;
      /** @example Auriculares X200 */
      name: string;
      /** @example auriculares-x200 */
      slug: string;
      /**
       * @description Base price in minor units.
       * @example 10000
       */
      priceAmount: number;
      /**
       * @description ISO 4217 currency of priceAmount.
       * @example USD
       */
      currency: string;
      /**
       * @description Structured specs from SQL.
       * @example {
       *       "ram_gb": 16
       *     }
       */
      specs: Record<string, never>;
    };
    CompareTableRowDto: {
      /**
       * @description Spec key, or 'price_amount' for the SQL price row.
       * @example ram_gb
       */
      key: string;
      /**
       * @description Raw values per product column (null when the product lacks the spec).
       * @example [
       *       16,
       *       32
       *     ]
       */
      values: string[];
      /**
       * @description Column indexes holding the best value (empty when not objective).
       * @example [
       *       1
       *     ]
       */
      best: string[];
      /**
       * @description Objective direction ('higher' | 'lower'), or null for text/enum rows.
       * @example higher
       */
      direction: Record<string, never> | null;
    };
    CompatibilityIssueDto: {
      /**
       * @description Rule that produced this finding.
       * @example cpu-socket
       */
      rule: string;
      /**
       * @description Errors prove incompatibility; warnings signal uncertainty.
       * @example error
       * @enum {string}
       */
      severity: 'error' | 'warning';
      /**
       * @description Ids of the products involved in this finding.
       * @example [
       *       "3fa85f64-5717-4562-b3fc-2c963f66afa6"
       *     ]
       */
      productIds: string[];
      /**
       * @description Stable i18n key of the message (es + en available).
       * @example cpu-socket.mismatch
       */
      messageKey: string;
      /**
       * @description Human-readable message in the requested locale.
       * @example El procesador "Ryzen 5" usa socket AM5, pero la placa "PRO B660M" usa socket LGA1700.
       */
      message: string;
    };
    CompareCompatibilityDto: {
      /** @example false */
      compatible: boolean;
      issues: components['schemas']['CompatibilityIssueDto'][];
    };
    CompareResponseDto: {
      products: components['schemas']['CompareProductDto'][];
      table: components['schemas']['CompareTableRowDto'][];
      compatibility: components['schemas']['CompareCompatibilityDto'];
      /**
       * @description LLM summary over the table and evidence, with [n] citation markers.
       * @example El modelo B ofrece más RAM [1] por un precio menor.
       */
      summary: string;
      citations: components['schemas']['ProductQaCitationDto'][];
    };
    SupportRequestDto: {
      /**
       * @description Question about warranty, shipping, returns, payments or privacy (1..1000 chars).
       * @example ¿Cuánto dura la garantía de un portátil?
       */
      question: string;
      /**
       * @description Owned order to ground the answer in (status/total from SQL). Requires authentication; other users’ orders 404.
       * @example order-id
       */
      orderId?: string;
      /**
       * @description BCP 47 answer locale; defaults server-side.
       * @example es
       */
      locale?: string;
    };
    SupportResponseDto: {
      /**
       * @description Assistant answer in the request locale, with [n] citation markers.
       * @example Los portátiles tienen 2 años de garantía [1].
       */
      answer: string;
      citations: components['schemas']['ProductQaCitationDto'][];
      /**
       * @description True when no sufficient evidence existed: the LLM was not called and the query was recorded for review.
       * @example false
       */
      abstained: boolean;
    };
    AdvisorFeedbackRequestDto: {
      /**
       * @description Asked-about product id, when the vote comes from a product page.
       * @example product-id
       */
      productId?: string;
      /**
       * @description Question (1..1000 chars).
       * @example ¿Cuánto dura la batería?
       */
      question: string;
      /**
       * @description Answer the vote refers to (1..20000 chars).
       * @example La batería dura hasta 10 horas [1].
       */
      answer: string;
      /**
       * @description Whether the voted answer was an abstention.
       * @example false
       */
      abstained: boolean;
      /**
       * @description Vote direction.
       * @example up
       * @enum {string}
       */
      value: 'up' | 'down';
      /**
       * @description Chat session the voted answer belongs to, when the voting surface is sessioned.
       * @example session-id
       */
      sessionId?: string;
    };
    AdvisorFeedbackResponseDto: {
      /**
       * @description True when the vote was recorded.
       * @example true
       */
      ok: boolean;
    };
    ChatSessionResponseDto: {
      /**
       * @description Chat session id (UUID).
       * @example session-id
       */
      id: string;
      /**
       * @description Messages stored in this session.
       * @example 3
       */
      messageCount: number;
      /**
       * Format: date-time
       * @description Session creation time (ISO 8601).
       * @example 2026-10-09T12:00:00.000Z
       */
      createdAt: string;
      /**
       * Format: date-time
       * @description Last session update time (ISO 8601).
       * @example 2026-10-09T12:00:00.000Z
       */
      updatedAt: string;
      /**
       * @description First user message truncated for list labels; absent when the session has no user message yet.
       * @example Busco un portátil para estudiar.
       */
      preview?: string;
    };
    ChatMessageResponseDto: {
      /**
       * @description Chat message id (UUID).
       * @example message-id
       */
      id: string;
      /**
       * @description Message author.
       * @example USER
       * @enum {string}
       */
      role: 'USER' | 'ASSISTANT';
      /**
       * @description Message text.
       * @example ¿Cuánto dura la batería?
       */
      content: string;
      /**
       * @description Validated citations shown with the answer.
       * @example []
       */
      citations: string[];
      /**
       * @description Product cards shown with the answer.
       * @example []
       */
      products: string[];
      /**
       * Format: date-time
       * @description Creation time (ISO 8601).
       * @example 2026-10-09T12:00:00.000Z
       */
      createdAt: string;
    };
    ChatSessionHistoryResponseDto: {
      /**
       * @description Chat session id (UUID).
       * @example session-id
       */
      id: string;
      /**
       * @description Messages stored in this session.
       * @example 3
       */
      messageCount: number;
      /**
       * Format: date-time
       * @description Session creation time (ISO 8601).
       * @example 2026-10-09T12:00:00.000Z
       */
      createdAt: string;
      /**
       * Format: date-time
       * @description Last session update time (ISO 8601).
       * @example 2026-10-09T12:00:00.000Z
       */
      updatedAt: string;
      /**
       * @description First user message truncated for list labels; absent when the session has no user message yet.
       * @example Busco un portátil para estudiar.
       */
      preview?: string;
      messages: components['schemas']['ChatMessageResponseDto'][];
    };
    RecommendRequestDto: {
      /**
       * @description User message starting (or continuing) the buying conversation.
       * @example Busco un portátil para estudiar ingeniería, máx. 800 USD.
       */
      content: string;
      /**
       * @description BCP 47 answer locale; defaults server-side.
       * @example es
       */
      locale?: string;
      /**
       * @description ISO 4217 session currency for budget and prices; defaults server-side.
       * @example USD
       */
      currency?: string;
    };
    ChatSessionsCleanupResponseDto: {
      /**
       * @description Anonymous sessions deleted by this run.
       * @example 12
       */
      deleted: number;
    };
    CompatibilityCheckRequestDto: {
      /**
       * @description Product ids to check together (1..20 unique UUIDs).
       * @example [
       *       "3fa85f64-5717-4562-b3fc-2c963f66afa6"
       *     ]
       */
      productIds: string[];
      /**
       * @description BCP 47 locale for issue messages; defaults server-side.
       * @example es
       */
      locale?: string;
    };
    CompatibilityCheckResponseDto: {
      /**
       * @description True only when every rule passed with complete data. Any warning (missing data) makes it false: without enough evidence compatibility is never claimed.
       * @example false
       */
      compatible: boolean;
      issues: components['schemas']['CompatibilityIssueDto'][];
    };
    ReviewDto: {
      /** @description Review id (UUID). */
      id: string;
      /** @description Reviewed product id (UUID). */
      productId: string;
      /** @description Star rating (1-5). */
      rating: number;
      /** @description Short headline (no author data). */
      title: string;
      /** @description Review text (public, moderated). */
      body: string;
      /** @description True when the author bought this product. */
      verifiedPurchase: boolean;
      /** @description Creation date (ISO 8601). */
      createdAt: string;
    };
    ReviewListDto: {
      data: components['schemas']['ReviewDto'][];
      total: number;
      page: number;
      limit: number;
      /** @description Mean rating over published reviews (null when none). */
      averageRating: Record<string, never> | null;
    };
    ReviewSummaryDto: {
      /** @description Reviewed product id (UUID). */
      productId: string;
      /** @description Short pro bullets (paraphrased, never long quotes). */
      pros: string[];
      /** @description Short con bullets (paraphrased, never long quotes). */
      cons: string[];
      /** @description Published reviews the summary was generated from. */
      basedOnCount: number;
      /** @description LLM model id that generated the summary. */
      model?: string;
      /** @description Last generation date (ISO 8601). */
      updatedAt: string;
    };
    ReviewSummaryResponseDto: {
      /** @description Cached summary, or null while published reviews are below the minimum. */
      summary: components['schemas']['ReviewSummaryDto'] | null;
    };
    AdminReviewDto: {
      /** @description Review id (UUID). */
      id: string;
      /** @description Reviewed product id (UUID). */
      productId: string;
      /** @description Star rating (1-5). */
      rating: number;
      /** @description Short headline (no author data). */
      title: string;
      /** @description Review text (public, moderated). */
      body: string;
      /** @description True when the author bought this product. */
      verifiedPurchase: boolean;
      /** @description Creation date (ISO 8601). */
      createdAt: string;
      /** @enum {string} */
      status: 'PENDING' | 'PUBLISHED' | 'REJECTED';
      /** @description Author user id (admin only, never public). */
      userId: string;
      /** @description Reviewed product name (default locale, for moderation display). */
      productName: string;
    };
    AdminReviewListDto: {
      data: components['schemas']['AdminReviewDto'][];
      total: number;
      page: number;
      limit: number;
    };
    AiCallLogCleanupResponseDto: {
      /**
       * @description Rows deleted by this run.
       * @example 12
       */
      deleted: number;
      /**
       * @description Configured retention window in days.
       * @example 90
       */
      retentionDays: number;
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
  UsersController_updateMe: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateProfileRequestDto'];
      };
    };
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
  AdminController_productMetrics: {
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
          'application/json': components['schemas']['AdminProductMetricsDto'];
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
  AdminController_getCategory: {
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
  AdminController_getMetricsOverview: {
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
          'application/json': components['schemas']['AdminMetricsOverviewDto'];
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
  AdminAdvisorController_listUnanswered: {
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
          'application/json': components['schemas']['AdminUnansweredQueryListDto'];
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
  AdminAdvisorController_unansweredGroups: {
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
          'application/json': components['schemas']['AdminUnansweredGroupListDto'];
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
  AdminAdvisorController_updateUnansweredStatus: {
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
          'application/json': components['schemas']['AdminUnansweredQueryDto'];
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
  AdminAdvisorController_listFeedback: {
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
          'application/json': components['schemas']['AdminAdvisorFeedbackListDto'];
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
  AdminAdvisorController_getFeedback: {
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
          'application/json': components['schemas']['AdminAdvisorFeedbackDetailDto'];
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
  AdminAdvisorController_getSession: {
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
          'application/json': components['schemas']['AdminAdvisorSessionDto'];
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
  AdminAdvisorController_getMetrics: {
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
          'application/json': components['schemas']['AdminAdvisorMetricsDto'];
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
  ReindexController_start: {
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
          'application/json': components['schemas']['ReindexStartDto'];
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
  ReindexController_active: {
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
          'application/json': components['schemas']['ActiveEmbeddingDto'];
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
  ReindexController_progress: {
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
          'application/json': components['schemas']['ReindexProgressDto'];
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
  ReindexController_activate: {
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
          'application/json': components['schemas']['ReindexActivateDto'];
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
  ReindexController_resume: {
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
          'application/json': components['schemas']['ReindexResumeDto'];
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
  SearchController_searchProducts: {
    parameters: {
      query: {
        /** @description Max products (1..24, default 12). */
        limit?: unknown;
        /** @description BCP 47 locale; falls back to default. */
        locale?: unknown;
        /** @description ISO 4217 code; defaults to base currency. */
        currency?: unknown;
        /** @description Max price in minor units, in `currency`. */
        maxPrice?: unknown;
        /** @description Category slug filter. */
        category?: unknown;
        /** @description Natural-language query (1..200 chars). */
        q: unknown;
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
          'application/json': components['schemas']['SearchResponseDto'];
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
  AdvisorController_answerProductQuestion: {
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
          'application/json': components['schemas']['ProductQaResponseDto'];
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
      /** @description Product not found or not active. */
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
  AdvisorController_compareProducts: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CompareRequestDto'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CompareResponseDto'];
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
      /** @description Product not found or not active. */
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
  AdvisorController_answerSupportQuestion: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['SupportRequestDto'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SupportResponseDto'];
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
      /** @description Order not found or not owned. */
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
  AdvisorController_recordFeedback: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['AdvisorFeedbackRequestDto'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdvisorFeedbackResponseDto'];
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
  ChatSessionsController_listSessions: {
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
          'application/json': components['schemas']['ChatSessionResponseDto'][];
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
  ChatSessionsController_createSession: {
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
          'application/json': components['schemas']['ChatSessionResponseDto'];
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
  ChatSessionsController_getSession: {
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
          'application/json': components['schemas']['ChatSessionHistoryResponseDto'];
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
      /** @description Unknown session (or owned by another user). */
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
  ChatSessionsController_deleteSession: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Bad request. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponseDto'];
        };
      };
      /** @description Unknown session (or owned by another user). */
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
  ChatSessionsController_postSessionMessage: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RecommendRequestDto'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ChatMessageResponseDto'];
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
      /** @description Unknown session (or owned by another user). */
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
  ChatSessionsController_cleanupSessions: {
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
          'application/json': components['schemas']['ChatSessionsCleanupResponseDto'];
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
  CompatibilityController_checkCompatibility: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CompatibilityCheckRequestDto'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CompatibilityCheckResponseDto'];
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
      /** @description Unknown product id. */
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
  ReviewsController_createReview: {
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
          'application/json': components['schemas']['ReviewDto'];
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
  ReviewsController_listPublished: {
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
          'application/json': components['schemas']['ReviewListDto'];
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
      /** @description Product not found or not active. */
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
  ReviewsController_getSummary: {
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
          'application/json': components['schemas']['ReviewSummaryResponseDto'];
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
      /** @description Product not found or not active. */
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
  AdminReviewsController_listReviews: {
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
          'application/json': components['schemas']['AdminReviewListDto'];
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
  AdminReviewsController_moderateReview: {
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
          'application/json': components['schemas']['AdminReviewDto'];
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
      /** @description Review not found. */
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
  ObservabilityController_metrics: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Prometheus text exposition format. */
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
  ObservabilityController_cleanupLogs: {
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
          'application/json': components['schemas']['AiCallLogCleanupResponseDto'];
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
}
