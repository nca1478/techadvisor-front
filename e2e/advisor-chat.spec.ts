import { expect, test } from '@playwright/test';

/**
 * Conversational advisor (mock backend = fake adapters): chat page with a
 * persistent session, SSE-streamed recommendation, hydrated product cards
 * with per-card add-to-cart, clarification quick-replies, rate-limit retry
 * and history restore after reload.
 */
test('chat conversation streams a recommendation and adds a card to the cart', async ({ page }) => {
  await page.goto('/es/asesor');
  await expect(page.getByRole('heading', { level: 1, name: 'Asesor de compras' })).toBeVisible();
  // Starters, privacy note and floating-button-free page (the FAB hides here).
  await expect(page.getByText('Empieza con un ejemplo')).toBeVisible();
  await expect(page.getByText(/datos personales/)).toBeVisible();

  await page
    .getByLabel('Escribe tu mensaje')
    .fill('Portátil para estudiar ingeniería, máx. 800 USD');
  await page.getByRole('button', { name: 'Enviar' }).click();

  // User bubble plus the streamed assistant text inside the live log.
  const log = page.getByRole('log', { name: 'Conversación con el asesor' });
  await expect(log.getByText('Portátil para estudiar ingeniería, máx. 800 USD')).toBeVisible();
  await expect(log.getByText(/encajan con tu presupuesto/).first()).toBeVisible({ timeout: 15000 });

  // Hydrated cards: catalog links and per-card add-to-cart from API data.
  await expect(log.getByRole('link', { name: /Mock Laptop 13/ }).first()).toHaveAttribute(
    'href',
    '/es/productos/mock-laptop-13',
  );
  await log.getByRole('button', { name: 'Agregar al carrito' }).first().click();
  await expect(log.getByRole('button', { name: 'Agregado al carrito' }).first()).toBeVisible();

  // The header cart reflects the server-side cart.
  await page.goto('/es/carrito');
  await expect(page.getByText('Mock Laptop 13')).toBeVisible();
});

test('reloading the chat page restores the conversation from history', async ({ page }) => {
  await page.goto('/es/asesor');
  await page
    .getByLabel('Escribe tu mensaje')
    .fill('Portátil para estudiar ingeniería, máx. 800 USD');
  await page.getByRole('button', { name: 'Enviar' }).click();
  const log = page.getByRole('log', { name: 'Conversación con el asesor' });
  await expect(log.getByText(/encajan con tu presupuesto/).first()).toBeVisible({ timeout: 15000 });

  await page.reload();
  const restored = page.getByRole('log', { name: 'Conversación con el asesor' });
  await expect(restored.getByText('Portátil para estudiar ingeniería, máx. 800 USD')).toBeVisible();
  await expect(restored.getByText(/encajan con tu presupuesto/).first()).toBeVisible();
  await expect(restored.getByRole('link', { name: /Mock Laptop 13/ }).first()).toBeVisible();
});

test('starting a new chat preserves the previous conversation in the history', async ({ page }) => {
  // Unique wording so the history option is unambiguous even though the mock
  // backend shares sessions across tests in this file.
  const question = 'Portátil para teletrabajo con buena batería';
  await page.goto('/es/asesor');
  await page.getByLabel('Escribe tu mensaje').fill(question);
  await page.getByRole('button', { name: 'Enviar' }).click();
  const log = page.getByRole('log', { name: 'Conversación con el asesor' });
  await expect(log.getByText(question)).toBeVisible();
  await expect(log.getByText(/encajan con tu presupuesto/).first()).toBeVisible({ timeout: 15000 });

  await page.getByRole('button', { name: 'Nueva conversación' }).click();
  const history = page.getByRole('combobox', { name: 'Conversaciones guardadas' });
  const savedOption = history.locator('option', { hasText: question });
  await expect(savedOption).toBeAttached();
  await expect(log.getByText(question)).toBeHidden();

  const savedValue = await savedOption.first().getAttribute('value');
  await history.selectOption(savedValue ?? '');
  await expect(log.getByText(question)).toBeVisible();
  await expect(log.getByText(/encajan con tu presupuesto/).first()).toBeVisible();
});

test('clarification shows quick replies that fill the composer', async ({ page }) => {
  await page.goto('/es/asesor');
  await expect(page.getByText('Empieza con un ejemplo')).toBeVisible();
  await page.getByLabel('Escribe tu mensaje').fill('clarify-probe: hola');
  await page.getByRole('button', { name: 'Enviar' }).click();

  const log = page.getByRole('log', { name: 'Conversación con el asesor' });
  await expect(log.getByText('El asesor necesita un dato más')).toBeVisible({ timeout: 15000 });
  await expect(log.getByText(/presupuesto máximo/)).toBeVisible();
  await page.getByRole('button', { name: 'Mi presupuesto es de 800 USD' }).click();
  await expect(page.getByLabel('Escribe tu mensaje')).toHaveValue('Mi presupuesto es de 800 USD');
});

test('chat rate limit shows a friendly message with retry', async ({ page }) => {
  await page.goto('/es/asesor');
  // Wait for the session so the probe hits the rate-limited turn, not setup.
  await expect(page.getByText('Empieza con un ejemplo')).toBeVisible();
  await page.getByLabel('Escribe tu mensaje').fill('rate-limit-probe');
  await page.getByRole('button', { name: 'Enviar' }).click();

  await expect(page.locator('main').getByRole('alert')).toContainText(/muy rápido/);
  await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible();
});

test('chat works on a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/es/asesor');
  await expect(page.getByRole('heading', { level: 1, name: 'Asesor de compras' })).toBeVisible();
  await page
    .getByLabel('Escribe tu mensaje')
    .fill('Portátil para estudiar ingeniería, máx. 800 USD');
  await page.getByRole('button', { name: 'Enviar' }).click();
  const log = page.getByRole('log', { name: 'Conversación con el asesor' });
  await expect(log.getByText(/encajan con tu presupuesto/).first()).toBeVisible({ timeout: 15000 });
  await expect(log.getByRole('link', { name: /Mock Laptop 13/ }).first()).toBeVisible();
});
