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
}
