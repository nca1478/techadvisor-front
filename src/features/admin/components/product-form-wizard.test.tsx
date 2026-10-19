import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProductForm } from '@/features/admin/components/product-form';
import type { ProductFormState } from '@/features/admin/lib/product-submit';
import en from '@/messages/en.json';

const formMessages = en.admin.productForm;
const statusLabels = en.admin.products;

const BASE: ProductFormState = {
  sku: 'SKU-1',
  name: 'Laptop',
  slug: 'laptop-1',
  description: 'A laptop',
  brandId: 'brand-1',
  categoryId: 'cat-1',
  priceMajor: '10',
  currency: 'USD',
  status: 'DRAFT',
  initialStock: '1',
  specsRaw: {},
  translationLocale: '',
  translationName: '',
  translationDescription: '',
};

function renderWizard(overrides: Partial<Parameters<typeof ProductForm>[0]> = {}) {
  const onValidateStep = vi.fn((): Record<string, string> => ({}));
  const onSubmit = vi.fn();
  const utils = render(
    <ProductForm
      mode="create"
      values={BASE}
      errors={{}}
      brands={[{ value: 'brand-1', label: 'Brand' }]}
      categories={[{ value: 'cat-1', label: 'Category' }]}
      specsFields={[]}
      currencies={['USD']}
      defaultLocale="en"
      locales={['en', 'es']}
      onChange={() => {}}
      onValidateStep={onValidateStep}
      onSubmit={onSubmit}
      pending={false}
      submitLabel={formMessages.create}
      submitPendingLabel={formMessages.creating}
      formMessages={formMessages}
      statusLabels={statusLabels}
      {...overrides}
    />,
  );
  return { onValidateStep, onSubmit, ...utils };
}

describe('ProductForm wizard', () => {
  it('shows only step 1 fields at first and advances on valid step', () => {
    const { onValidateStep } = renderWizard();
    expect(screen.getByLabelText(formMessages.sku)).toBeVisible();
    expect(screen.queryByLabelText(formMessages.brand)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: formMessages.next }));
    expect(onValidateStep).toHaveBeenCalledWith(0);
    expect(screen.getByLabelText(formMessages.brand)).toBeVisible();
  });

  it('blocks advancing when the step has errors', () => {
    const blocking = vi.fn((): Record<string, string> => ({ sku: 'required' }));
    renderWizard({ onValidateStep: blocking });
    fireEvent.click(screen.getByRole('button', { name: formMessages.next }));
    expect(blocking).toHaveReturnedWith({ sku: 'required' });
    // Still on step 1: submit button (last step only) is absent.
    expect(screen.getByLabelText(formMessages.sku)).toBeVisible();
  });

  it('reaches the translation step and submits from there', () => {
    const { onSubmit } = renderWizard();
    fireEvent.click(screen.getByRole('button', { name: formMessages.next }));
    fireEvent.click(screen.getByRole('button', { name: formMessages.next }));
    fireEvent.click(screen.getByRole('button', { name: formMessages.next }));
    expect(screen.getByLabelText(formMessages.translationName)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: formMessages.create }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('lets free navigation jump to any step without validation', () => {
    const blocking = vi.fn((): Record<string, string> => ({ sku: 'required' }));
    renderWizard({
      mode: 'edit',
      freeNavigation: true,
      onValidateStep: blocking,
      extraSteps: [
        { title: 'Images', content: <p>images panel</p> },
        { title: 'Inventory', content: <p>inventory panel</p> },
      ],
    });
    // Pill 6 clickable from step 1: no validation needed.
    fireEvent.click(screen.getByRole('button', { name: '6. Inventory' }));
    expect(blocking).not.toHaveBeenCalled();
    expect(screen.getByText('inventory panel')).toBeVisible();
    // Back to step 1 via pill, then Next advances despite step errors
    // (errors still surface through the validator call).
    fireEvent.click(screen.getByRole('button', { name: '1. Basic info' }));
    expect(screen.getByLabelText(formMessages.sku)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: formMessages.next }));
    expect(blocking).toHaveBeenCalled();
    expect(screen.getByLabelText(formMessages.brand)).toBeVisible();
  });
  it('navigates back to a visited step', () => {
    renderWizard();
    fireEvent.click(screen.getByRole('button', { name: formMessages.next }));
    expect(screen.getByLabelText(formMessages.brand)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: formMessages.back }));
    expect(screen.getByLabelText(formMessages.sku)).toBeVisible();
  });

  it('renders extra steps after translation with save on step 4 and last', () => {
    renderWizard({
      mode: 'edit',
      extraSteps: [
        { title: 'Images', content: <p>images panel</p> },
        { title: 'Inventory', content: <p>inventory panel</p> },
      ],
      submitLabel: 'Save changes',
      submitPendingLabel: 'Saving…',
    });
    expect(screen.getByRole('button', { name: '5. Images' })).toBeVisible();
    expect(screen.getByRole('button', { name: '6. Inventory' })).toBeVisible();

    // Advance to translation (step index 3): save + next are both visible.
    fireEvent.click(screen.getByRole('button', { name: formMessages.next }));
    fireEvent.click(screen.getByRole('button', { name: formMessages.next }));
    fireEvent.click(screen.getByRole('button', { name: formMessages.next }));
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: formMessages.next }));
    expect(screen.getByText('images panel')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: formMessages.next }));
    expect(screen.getByText('inventory panel')).toBeVisible();
    // Last step: next is gone, save stays.
    expect(screen.queryByRole('button', { name: formMessages.next })).toBeNull();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeVisible();
  });

  it('jumps to the error step when save reports validation errors', async () => {
    const onSubmit = vi.fn((): Promise<number | null> => Promise.resolve(0));
    renderWizard({
      mode: 'edit',
      freeNavigation: true,
      onSubmit,
      extraSteps: [
        { title: 'Images', content: <p>images panel</p> },
        { title: 'Inventory', content: <p>inventory panel</p> },
      ],
      submitLabel: 'Save changes',
      submitPendingLabel: 'Saving…',
    });
    // Jump straight to the last step, where the click used to look dead.
    fireEvent.click(screen.getByRole('button', { name: '6. Inventory' }));
    expect(screen.getByText('inventory panel')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(await screen.findByLabelText(formMessages.sku)).toBeVisible();
  });

  it('renders fused generate buttons that call the provided handlers', () => {
    const onGenerateSku = vi.fn();
    const onGenerateSlug = vi.fn();
    renderWizard({ onGenerateSku, onGenerateSlug });
    const skuButton = screen.getByRole('button', { name: formMessages.generateSku });
    const slugButton = screen.getByRole('button', { name: formMessages.generateSlug });
    expect(skuButton).toBeVisible();
    expect(slugButton).toBeVisible();
    fireEvent.click(skuButton);
    fireEvent.click(slugButton);
    expect(onGenerateSku).toHaveBeenCalledTimes(1);
    expect(onGenerateSlug).toHaveBeenCalledTimes(1);
  });

  it('announces busy state while generating', () => {
    renderWizard({ onGenerateSku: vi.fn(), onGenerateSlug: vi.fn(), generatingSku: true });
    expect(screen.getByRole('button', { name: formMessages.generateSku })).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });
});
