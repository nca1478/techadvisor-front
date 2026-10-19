import { type ApiClient, createApiClient } from './client';
import type { components } from './schema';

export type AuthUser = components['schemas']['UserResponseDto'];
export type RegisterRequest = components['schemas']['RegisterRequestDto'];
export type LoginRequest = components['schemas']['LoginRequestDto'];
export type GoogleLoginRequest = components['schemas']['GoogleLoginRequestDto'];
export type RefreshRequest = components['schemas']['RefreshRequestDto'];

/**
 * Token pair returned by the backend auth endpoints in the JSON body
 * (`POST /auth/register`, `/auth/login`, `/auth/refresh`). The generated
 * OpenAPI contract does not name this inline shape, so it is declared here
 * field-by-field to match `TokenPairResponseDto` in the backend.
 */
export interface TokenPair {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
}

export interface AuthPayload {
  user: AuthUser;
  tokens: TokenPair;
}

/**
 * Auth reads/writes against the generated OpenAPI contract. The frontend
 * never stores these tokens in browser-readable storage: the Next.js BFF
 * route handlers (`src/app/api/auth/*`) move them into httpOnly cookies.
 */
export function createAuthApi(client: ApiClient = createApiClient()) {
  return {
    register: (body: RegisterRequest) => client.post<AuthPayload>('/auth/register', body),
    login: (body: LoginRequest) => client.post<AuthPayload>('/auth/login', body),
    googleLogin: (body: GoogleLoginRequest) => client.post<AuthPayload>('/auth/google', body),
    refresh: (body: RefreshRequest) => client.post<{ tokens: TokenPair }>('/auth/refresh', body),
    logout: (body: RefreshRequest) => client.post<{ ok: boolean }>('/auth/logout', body),
    me: (accessToken: string) =>
      client.get<AuthUser>('/users/me', {
        headers: { authorization: `Bearer ${accessToken}` },
      }),
  };
}

export type AuthApi = ReturnType<typeof createAuthApi>;
