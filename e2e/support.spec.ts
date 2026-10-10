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

test('support page shows the full policies as tabs', async ({ page }) => {
  await page.goto('/es/soporte');
  await expect(page.getByRole('heading', { name: 'Políticas completas' })).toBeVisible();

  const tablist = page.getByRole('tablist', { name: 'Políticas completas' });
  await expect(tablist.getByRole('tab', { name: 'Garantía' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('tabpanel')).toContainText(/2 años de garantía/);

  await tablist.getByRole('tab', { name: 'Devoluciones' }).click();
  await expect(tablist.getByRole('tab', { name: 'Devoluciones' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('tabpanel')).toContainText(/30 días naturales/);
  await expect(page.getByRole('tabpanel')).not.toContainText(/2 años de garantía/);
  await expect(
    page.getByText('Contenido de ejemplo: plantilla a revisar por el negocio.'),
  ).toBeVisible();
});
