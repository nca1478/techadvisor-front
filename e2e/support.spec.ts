import { expect, test } from '@playwright/test';

/**
 * Post-sale support page (mock backend = fake adapters).
 * Covers: cited policy answer, distinct abstention, policy links.
 */
test('support answers with a citation to the policy', async ({ page }) => {
  await page.goto('/es/soporte');
  await expect(page.getByRole('heading', { name: 'Soporte posventa' })).toBeVisible();

  const widget = page.locator('section[aria-labelledby="support-heading"]');
  await widget.getByLabel('Tu pregunta').fill('¿Cuánto dura la garantía de un portátil?');
  await widget.getByRole('button', { name: 'Preguntar' }).click();

  await expect(widget.getByText(/2 años de garantía/i).first()).toBeVisible();
  await expect(widget.getByRole('button', { name: /garantía/i }).first()).toBeVisible();

  // Expand the citation to see the fragment.
  await widget
    .getByRole('button', { name: /garantía/i })
    .first()
    .click();
  await expect(widget.getByText(/desde la entrega/)).toBeVisible();
});

test('support abstention looks different from an answer', async ({ page }) => {
  await page.goto('/es/soporte');
  const widget = page.locator('section[aria-labelledby="support-heading"]');
  await widget.getByLabel('Tu pregunta').fill('no-evidence-probe: ¿cubrís daños por meteoritos?');
  await widget.getByRole('button', { name: 'Preguntar' }).click();

  await expect(widget.getByText('Derivado a soporte humano')).toBeVisible();
});

test('support page links to the full policies', async ({ page }) => {
  await page.goto('/es/soporte');
  await expect(page.getByRole('heading', { name: 'Políticas completas' })).toBeVisible();

  await page.getByRole('link', { name: 'Devoluciones' }).click();
  await expect(page).toHaveURL(/\/es\/soporte#politica-devoluciones/);
  await expect(page.locator('#politica-devoluciones')).toContainText(/30 días naturales/);
  await expect(
    page.getByText('Contenido de ejemplo: plantilla a revisar por el negocio.').first(),
  ).toBeVisible();
});
