import type { components } from './schema';

export type UniformErrorBody = components['schemas']['ErrorResponseDto'];

export interface ApiErrorBody {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Error thrown by the API client for non-2xx responses. Carries the backend's
 * uniform error payload (`{ statusCode, code, message, details? }`) so UI code
 * can switch on `code` instead of parsing messages. A `UniformErrorBody` from
 * the generated contract is always assignable to `ApiErrorBody`.
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.statusCode = body.statusCode;
    this.code = body.code;
    this.details = body.details;
  }
}

/** Type guard for the uniform error payload (unknown JSON from the wire). */
export function isUniformErrorBody(value: unknown): value is UniformErrorBody {
  if (value === null || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record['statusCode'] === 'number' &&
    typeof record['code'] === 'string' &&
    typeof record['message'] === 'string'
  );
}
