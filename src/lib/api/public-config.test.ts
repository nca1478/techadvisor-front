import { createApiClient } from './client';
import { getPublicConfig } from './public-config';

const backendConfig = {
  baseCurrency: 'USD',
  supportedCurrencies: ['USD', 'EUR'],
  defaultLocale: 'en',
  supportedLocales: ['en', 'es'],
};

describe('getPublicConfig', () => {
  it('fetches and validates /config/public', async () => {
    const fetchFn = vi.fn((): Promise<Response> =>
      Promise.resolve(new Response(JSON.stringify(backendConfig), { status: 200 })),
    );
    const client = createApiClient({ baseUrl: 'http://api.test/api/v1', fetchFn });

    await expect(getPublicConfig(client)).resolves.toEqual(backendConfig);
    expect(fetchFn).toHaveBeenCalledWith(
      'http://api.test/api/v1/config/public',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('rejects when the backend returns an invalid shape', async () => {
    const fetchFn = vi.fn((): Promise<Response> =>
      Promise.resolve(new Response(JSON.stringify({ baseCurrency: 'US DOLLAR' }), { status: 200 })),
    );
    const client = createApiClient({ baseUrl: 'http://api.test/api/v1', fetchFn });

    await expect(getPublicConfig(client)).rejects.toThrow();
  });
});
