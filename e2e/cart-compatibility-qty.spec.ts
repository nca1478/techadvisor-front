import { expect, test, type Page } from '@playwright/test';

/**
 * Quantity-aware compatibility in the cart (real bug regression).
 *
 * The cart used to send only distinct product ids, so the backend evaluated
 * one unit per product: 3x SATA on a 2-port board, 3x RAM on a 2-slot board
 * or 2x M.2 on a 1-slot board showed no warning. The frontend now sends
 * `items: [{ productId, qty }]` and the backend expands by qty.
 * Fixtures + qty-aware mock: `e2e/mock-backend.mjs` (`Mock Board Qty`:
 * 2 SATA, 1 M.2, 2 RAM slots, 32GB max).
 */

async function emptyCart(page: Page) {
  const res = await page.request.get('/api/cart');
  if (!res.ok()) return;
  const cart = (await res.json()) as { items?: { productId?: string }[] };
  for (const item of cart.items ?? []) {
    if (typeof item.productId === 'string') {
      await page.request.delete(`/api/cart/items/${encodeURIComponent(item.productId)}`);
    }
  }
}

async function addFromDetail(page: Page, slug: string, name: string) {
  await page.goto(`/en/productos/${slug}`);
  await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByRole('button', { name: 'Added to cart' })).toBeVisible();
}

async function increaseQty(page: Page, productName: string, times: number) {
  const line = page.locator('li', { hasText: productName });
  for (let i = 0; i < times; i += 1) {
    await line.getByRole('button', { name: 'Increase quantity' }).click();
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/en');
  await page.evaluate(() => {
    window.localStorage.removeItem('techadvisor:compare-selection');
  });
  await emptyCart(page);
});

test.afterEach(async ({ page }) => {
  await emptyCart(page);
});

test('3x SATA on a 2-port board warns in the cart', async ({ page }) => {
  await addFromDetail(page, 'mock-board-qty', 'Mock Board Qty');
  await addFromDetail(page, 'mock-sata-drive', 'Mock SATA Drive');

  await page.goto('/en/carrito');
  await expect(page.getByText('Mock Board Qty')).toBeVisible();
  // 1x SATA + 2-port board is compatible: no storage warning yet.
  await expect(page.getByText(/no free connectors/)).toHaveCount(0);

  // The customer raises the SATA line to 3 units through the cart stepper.
  await increaseQty(page, 'Mock SATA Drive', 2);
  await expect(page.locator('li', { hasText: 'Mock SATA Drive' }).getByRole('status')).toHaveText(
    '3',
  );

  await expect(page.getByText(/needs a SATA connection/)).toBeVisible();
  const checkoutButton = page.getByRole('button', { name: 'Go to checkout' });
  await expect(checkoutButton).toBeDisabled();
});

test('3x RAM on a 2-slot 32GB board warns in the cart', async ({ page }) => {
  await addFromDetail(page, 'mock-board-qty', 'Mock Board Qty');
  await addFromDetail(page, 'mock-ram-qty', 'Mock RAM Qty DDR5');

  await page.goto('/en/carrito');
  await expect(page.getByText(/only has 2 slots|exceeds the maximum/)).toHaveCount(0);

  await increaseQty(page, 'Mock RAM Qty DDR5', 2);
  await expect(page.locator('li', { hasText: 'Mock RAM Qty DDR5' }).getByRole('status')).toHaveText(
    '3',
  );

  await expect(page.getByText(/only has 2 slots|exceeds the maximum/).first()).toBeVisible();
});

test('2x M.2 on a 1-slot board warns in the cart', async ({ page }) => {
  await addFromDetail(page, 'mock-board-qty', 'Mock Board Qty');
  await addFromDetail(page, 'mock-m2-drive', 'Mock M2 Drive');

  await page.goto('/en/carrito');
  await increaseQty(page, 'Mock M2 Drive', 1);
  await expect(page.locator('li', { hasText: 'Mock M2 Drive' }).getByRole('status')).toHaveText(
    '2',
  );

  await expect(page.getByText(/needs a M.2 connection/)).toBeVisible();
});
