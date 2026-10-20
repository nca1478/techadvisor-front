import { z } from 'zod';
import type { components } from './schema';
import { type ApiClient, createApiClient } from './client';

export type PublicConfig = components['schemas']['PublicConfigResponseDto'];

const publicConfigSchema = z.object({
  baseCurrency: z.string().regex(/^[A-Z]{3}$/),
  supportedCurrencies: z.array(z.string().regex(/^[A-Z]{3}$/)).min(1),
  defaultLocale: z.string().min(2).max(10),
  supportedLocales: z.array(z.string().min(2).max(10)).min(1),
  // Storefront AI kill-switch (backend AI_ENABLED, default true so older
  // backends without the field keep the advisor visible).
  aiEnabled: z.boolean().default(true),
});

/**
 * Reads the public runtime configuration from the backend
 * (`GET /config/public`) so currency/locale lists are never duplicated in
 * the frontend (`// mantener en sync con backend` is avoided by design).
 * The response is validated with Zod before being returned.
 */
export async function getPublicConfig(
  client: ApiClient = createApiClient(),
): Promise<PublicConfig> {
  const raw = await client.get<unknown>('/config/public');
  return publicConfigSchema.parse(raw);
}
