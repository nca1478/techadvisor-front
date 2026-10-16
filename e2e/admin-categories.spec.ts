import { expect, test, type Page } from '@playwright/test';

/**
 * Category management smoke against the mock backend (`e2e/mock-backend.mjs`,
 * started by `playwright.config.ts`): anonymous users bounce to login, an
 * `e2e-admin-*` registration yields an ADMIN session, then the full
 * create → edit → guarded-delete (409 while a child exists) → delete flow
 * runs through the real UI. Slugs carry a timestamp suffix so parallel
 * workers never collide on the shared mock state.
 */

async function registerAdmin(page: Page, email: string) {
  await page.goto('/en/registro');
  await page.getByLabel('Name (optional)').fill('E2E Admin');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('correct-horse-battery-42');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/en\/?$/);
}

/**
 * Fill + assert with a retry: the dev server's Fast Refresh can remount the
 * form mid-test, wiping controlled inputs filled just before the remount.
 * The final assertion still fails loudly on a real bug.
 */
async function fillField(page: Page, label: string, value: string) {
  const box = page.getByLabel(label);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await box.fill(value);
    try {
      await expect(box).toHaveValue(value, { timeout: 2000 });
      return;
    } catch {
      // Remount wiped the keystrokes: fill again.
    }
  }
  await expect(box).toHaveValue(value);
}

/**
 * Row locator by category: filters on the exact-name link because the
 * accessible row name (substring match) also hits children showing the
 * parent name in their parent column.
 */
function rowByName(page: Page, name: string) {
  return page.getByRole('row').filter({ has: page.getByRole('link', { name, exact: true }) });
}

/**
 * Creates a category through the UI and waits for the edit page. Fills are
 * verified as a set immediately before submitting: the dev server's Fast
 * Refresh can remount the form between interactions, wiping controlled
 * inputs that already passed their individual assertions. The submit itself
 * is retried when the dev server swallows it under parallel load (still on
 * `/nuevo` with no error shown); if the first POST actually landed, the
 * retry answers 409 and the test continues on the existing row instead of
 * failing on a duplicate it caused itself.
 */
async function createCategory(
  page: Page,
  opts: { name: string; slug: string; parentLabel?: string },
) {
  const editUrl = /\/en\/admin\/categorias\/[0-9a-f-]{36}/;
  for (let submit = 0; ; submit += 1) {
    // A previous attempt may have navigated late, after its assertion timed out.
    if (editUrl.test(page.url())) {
      return;
    }
    // Wizard: fill step 1, advance through the (optional) image step,
    // then submit from the translation step.
    for (let attempt = 0; ; attempt += 1) {
      await fillField(page, 'Name (default language)', opts.name);
      await fillField(page, 'Slug', opts.slug);
      if (opts.parentLabel !== undefined) {
        await page.getByLabel('Parent category').selectOption({ label: opts.parentLabel });
      }
      const nameValue = await page.getByLabel('Name (default language)').inputValue();
      const slugValue = await page.getByLabel('Slug').inputValue();
      const parentValue =
        opts.parentLabel === undefined
          ? 'root'
          : await page.getByLabel('Parent category').inputValue();
      if (nameValue === opts.name && slugValue === opts.slug && parentValue !== '') {
        break;
      }
      if (attempt >= 2) {
        throw new Error('category form values did not stick before submit');
      }
    }
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    // The button disables while a previous POST is still in flight: wait
    // it out instead of forcing a second submit on top of the first.
    const createButton = page.getByRole('button', { name: 'Create category' });
    try {
      await expect(createButton).toBeEnabled({ timeout: 15000 });
    } catch {
      if (editUrl.test(page.url())) {
        return;
      }
      throw new Error('create button never became enabled');
    }
    await createButton.click();
    // Generous timeout: edit-page SSR after the POST is slow when all
    // workers hammer the dev server in parallel (same as purchase-flow).
    try {
      await expect(page).toHaveURL(editUrl, { timeout: 15000 });
      return;
    } catch {
      if (submit >= 2) {
        throw new Error('category create submit was lost repeatedly with no row created');
      }
    }
    // No navigation: inspect main alerts to decide. Field errors mean the
    // values were wiped after verification (retry the fills); a duplicate
    // message means the POST landed and only the navigation was lost
    // (continue on the existing row); any other server text fails loudly.
    const alerts = await page.getByRole('main').getByRole('alert').allInnerTexts();
    const fieldError = alerts.some(
      (text) => text.includes('required') || text.includes('lowercase'),
    );
    const duplicate = alerts.some((text) => text.includes('already exists'));
    if (!fieldError && !duplicate) {
      const visible = alerts.find((text) => text.trim() !== '');
      if (visible !== undefined) {
        throw new Error(`category create rejected by the server: ${visible}`);
      }
    }
    if (duplicate) {
      const listRes = await page.request.get('/api/admin/categories');
      const list = (await listRes.json()) as { id: string; slug: string }[];
      const existing = list.find((category) => category.slug === opts.slug);
      if (!existing) {
        throw new Error('duplicate reported but no such category exists');
      }
      await page.goto(`/en/admin/categorias/${encodeURIComponent(existing.id)}`);
      await expect(page).toHaveURL(editUrl, { timeout: 15000 });
      return;
    }
    // Swallowed submit or wiped values: loop refills and retries.
  }
}

test('anonymous visitors are sent to login from the categories panel', async ({ page }) => {
  await page.goto('/en/admin/categorias');
  await expect(page).toHaveURL(/\/en\/ingresar/);
});

test('admin creates, edits, cannot delete a parent, then deletes', async ({ page }) => {
  const suffix = String(Date.now());
  const parentName = `E2E Gadgets ${suffix}`;
  const parentSlug = `e2e-gadgets-${suffix}`;
  const editedName = `E2E Gadgets Pro ${suffix}`;
  const childName = `E2E Child ${suffix}`;
  const childSlug = `e2e-child-${suffix}`;

  await registerAdmin(page, `e2e-admin-${suffix}@example.com`);

  // 1. List renders (seeded root from the mock).
  await page.goto('/en/admin/categorias');
  await expect(page.getByRole('heading', { level: 2, name: 'Categories' })).toBeVisible();
  await expect(rowByName(page, 'Mock Root')).toBeVisible();

  // 2. Create a root category → lands on its edit page.
  await page.getByRole('link', { name: 'New category' }).click();
  await expect(page).toHaveURL(/\/en\/admin\/categorias\/nuevo/);
  await createCategory(page, { name: parentName, slug: parentSlug });
  await expect(page.getByRole('heading', { level: 2, name: 'Edit category' })).toBeVisible();

  // 3. Edit: rename + add the Spanish translation → saved inline.
  // ("Language" needs exact + main scope: substring matching would also
  // hit "Name (default language)" and the header language switcher.)
  // Wizard: name lives on step 1, translation on step 3.
  const main = page.getByRole('main');
  await fillField(page, 'Name (default language)', editedName);
  await main.getByRole('button', { name: 'Next' }).click();
  await main.getByRole('button', { name: 'Next' }).click();
  const languageSelect = main.getByLabel('Language', { exact: true });
  const translatedNameBox = main.getByLabel('Translated name');
  for (let attempt = 0; ; attempt += 1) {
    // Back to step 1 (edit pills are unrestricted), then forward again.
    await main.getByRole('button', { name: '1. Basic info' }).click();
    await fillField(page, 'Name (default language)', editedName);
    await main.getByRole('button', { name: 'Next' }).click();
    await main.getByRole('button', { name: 'Next' }).click();
    await languageSelect.selectOption('es');
    await fillField(page, 'Translated name', 'Artilugios E2E');
    if (
      (await page.getByLabel('Name (default language)').inputValue()) === editedName &&
      (await languageSelect.inputValue()) === 'es' &&
      (await translatedNameBox.inputValue()) === 'Artilugios E2E'
    ) {
      break;
    }
    if (attempt >= 2) {
      throw new Error('category edit values did not stick before submit');
    }
  }
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Category updated.')).toBeVisible({ timeout: 15000 });

  // 4. Back on the list: renamed row at root level with its translation.
  await page.getByRole('link', { name: 'Back to categories' }).click();
  await expect(page).toHaveURL(/\/en\/admin\/categorias$/);
  const parentRow = rowByName(page, editedName);
  await expect(parentRow).toBeVisible();
  await expect(parentRow.getByText('Root')).toBeVisible();
  await expect(parentRow.getByText('es', { exact: true })).toBeVisible();

  // 5. Create a child under it.
  // Full load (not the "New category" link): client-side navigation would
  // restore the router-cached `/nuevo` payload from step 2, whose parent
  // options predate the category created above.
  await page.goto('/en/admin/categorias/nuevo');
  // Fresh-form guard: fails loudly if the page restores a stale payload
  // (missing parent option) or a previous form instance (non-empty name).
  await expect(page.getByLabel('Name (default language)')).toHaveValue('', { timeout: 15000 });
  await expect(page.getByLabel('Parent category').locator('option', { hasText: editedName }), {
    message: 'parent option missing: stale /nuevo payload',
  }).toBeAttached({ timeout: 15000 });
  await createCategory(page, { name: childName, slug: childSlug, parentLabel: editedName });
  await page.getByRole('link', { name: 'Back to categories' }).click();

  // 6. Deleting the parent is refused (409) while the child exists.
  // (Scoped to main: Next's route announcer also carries role=alert.)
  await parentRow.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  await expect(main.getByRole('alert')).toContainText('subcategories');
  await expect(rowByName(page, editedName)).toBeVisible();

  // 7. Delete the child, then the parent: both disappear.
  const childRow = rowByName(page, childName);
  await childRow.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Category deleted.')).toBeVisible({ timeout: 15000 });
  await expect(rowByName(page, childName)).toHaveCount(0);

  await rowByName(page, editedName).getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Category deleted.')).toBeVisible({ timeout: 15000 });
  await expect(rowByName(page, editedName)).toHaveCount(0);
});
