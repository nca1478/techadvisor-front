import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DocumentUploadWizard } from '@/features/admin/components/document-upload-wizard';
import type { DocumentWizardState } from '@/features/admin/lib/document-wizard';
import en from '@/messages/en.json';

const docs = en.admin.documents;

const BASE: DocumentWizardState = {
  file: null,
  title: '',
  type: 'MANUAL',
  locale: 'en',
  productId: '',
  categoryId: '',
  sourceUrl: '',
};

function renderWizard(overrides: Partial<Parameters<typeof DocumentUploadWizard>[0]> = {}) {
  const onValidateStep = vi.fn((): Record<string, string> => ({}));
  const onSubmit = vi.fn();
  const onChange = vi.fn();
  const utils = render(
    <DocumentUploadWizard
      values={BASE}
      errors={{}}
      fileResetKey={0}
      pending={false}
      docs={docs}
      productOptions={[
        { id: '11111111-1111-4111-8111-111111111111', label: 'Laptop 13', hint: 'LAP-13' },
      ]}
      categoryOptions={[{ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', label: 'Laptops' }]}
      onFileChange={() => {}}
      onChange={onChange}
      onValidateStep={onValidateStep}
      onSubmit={onSubmit}
      {...overrides}
    />,
  );
  return { onValidateStep, onSubmit, onChange, ...utils };
}

describe('DocumentUploadWizard', () => {
  it('shows only the upload step at first, without the submit button', () => {
    renderWizard();
    expect(screen.getByLabelText(docs.fileLabel)).toBeVisible();
    expect(screen.queryByLabelText(docs.urlLabel)).toBeNull();
    expect(screen.queryByRole('button', { name: docs.urlSubmit })).toBeNull();
  });

  it('advances to the register-URL step and submits from there', () => {
    const { onValidateStep, onSubmit } = renderWizard();
    fireEvent.click(screen.getByRole('button', { name: docs.next }));
    expect(onValidateStep).toHaveBeenCalledWith(0);
    expect(screen.getByLabelText(docs.urlLabel)).toBeVisible();
    expect(screen.getByRole('button', { name: docs.urlSubmit })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: docs.urlSubmit }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('blocks advancing when the step has errors', () => {
    const blocking = vi.fn((): Record<string, string> => ({ file: 'required' }));
    renderWizard({ onValidateStep: blocking });
    fireEvent.click(screen.getByRole('button', { name: docs.next }));
    expect(screen.getByLabelText(docs.fileLabel)).toBeVisible();
    expect(screen.queryByLabelText(docs.urlLabel)).toBeNull();
  });

  it('announces the attached file on the URL step', () => {
    const file = new File([new Uint8Array(10)], 'manual.pdf', { type: 'application/pdf' });
    renderWizard({ values: { ...BASE, file } });
    fireEvent.click(screen.getByRole('button', { name: docs.next }));
    expect(screen.getByRole('status')).toHaveTextContent('manual.pdf');
  });

  it('selects a product by friendly name but stores its id', () => {
    const { onChange } = renderWizard();
    fireEvent.click(screen.getByRole('button', { name: new RegExp(docs.productPlaceholder) }));
    fireEvent.change(screen.getByPlaceholderText(docs.productSearchPlaceholder), {
      target: { value: 'laptop' },
    });
    fireEvent.click(screen.getByRole('option', { name: /Laptop 13/ }));
    expect(onChange).toHaveBeenCalledWith({
      productId: '11111111-1111-4111-8111-111111111111',
    });
  });

  it('selects a category by friendly name but stores its id', () => {
    const { onChange } = renderWizard();
    fireEvent.click(screen.getByRole('button', { name: new RegExp(docs.categoryPlaceholder) }));
    fireEvent.click(screen.getByRole('option', { name: /Laptops/ }));
    expect(onChange).toHaveBeenCalledWith({
      categoryId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    });
  });
});
