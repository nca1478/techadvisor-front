import { expect, test } from '@playwright/test';

/**
 * Advisor widget on the product page (mock backend = fake adapters).
 * Covers: cited answer + feedback, distinct abstention, rate-limit error.
 */
test('advisor answers with citations and accepts feedback', async ({ page }) => {
  await page.goto('/es/productos/mock-laptop-13');
  const widget = page.locator('section[aria-labelledby="advisor-heading"]');
  await expect(widget.getByRole('heading', { name: 'Pregúntale al asesor' })).toBeVisible();

  await widget.getByLabel('Tu pregunta').fill('¿Cuánto dura la batería?');
  await widget.getByRole('button', { name: 'Preguntar' }).click();

  await expect(widget.getByText(/batería/i).first()).toBeVisible();
  await expect(widget.getByRole('button', { name: /manual/i }).first()).toBeVisible();
  // Disclaimer is always visible.
  await expect(widget.getByText(/Solo orientativo/)).toBeVisible();

  // Expand the citation to see the fragment.
  await widget
    .getByRole('button', { name: /manual/i })
    .first()
    .click();
  await expect(widget.getByText(/10 horas en uso mixto/)).toBeVisible();

  // Feedback thanks the user and locks the buttons.
  await widget.getByRole('button', { name: 'Útil', exact: true }).click();
  await expect(widget.getByText('Gracias por tu opinión.')).toBeVisible();
});

test('advisor abstention looks different from an answer and links support', async ({ page }) => {
  await page.goto('/es/productos/mock-laptop-13');
  const widget = page.locator('section[aria-labelledby="advisor-heading"]');
  await expect(widget.getByRole('heading', { name: 'Pregúntale al asesor' })).toBeVisible();

  await widget.getByLabel('Tu pregunta').fill('no-evidence-probe: ¿cuánto pesa en Marte?');
  await widget.getByRole('button', { name: 'Preguntar' }).click();

  await expect(widget.getByText('Sin respuesta fiable')).toBeVisible();
  await expect(widget.getByRole('link', { name: 'Contactar con soporte' })).toBeVisible();
});

test('advisor rate limit shows a friendly message with retry', async ({ page }) => {
  await page.goto('/es/productos/mock-laptop-13');
  const widget = page.locator('section[aria-labelledby="advisor-heading"]');
  await expect(widget.getByRole('heading', { name: 'Pregúntale al asesor' })).toBeVisible();

  await widget.getByLabel('Tu pregunta').fill('rate-limit-probe');
  await widget.getByRole('button', { name: 'Preguntar' }).click();

  await expect(widget.getByRole('alert')).toContainText(/muy rápido/);
  await expect(widget.getByRole('button', { name: 'Reintentar' })).toBeVisible();
});
