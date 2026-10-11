import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Dictionary } from '@/lib/i18n/index';
import { getDictionarySync } from '@/lib/i18n/index';
import { ReviewForm } from './review-form';

const messages: Dictionary['reviews'] = getDictionarySync('es').reviews;

function fillValidForm() {
  fireEvent.change(screen.getByLabelText(messages.ratingLabel), { target: { value: '5' } });
  fireEvent.change(screen.getByLabelText(messages.titleLabel), {
    target: { value: 'Gran portátil' },
  });
  fireEvent.change(screen.getByLabelText(messages.bodyLabel), {
    target: { value: 'Rápido y liviano.' },
  });
}

describe('ReviewForm', () => {
  it('submits rating, title and body, then announces moderation', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ ok: true });
    render(<ReviewForm productId="p1" messages={messages} onSubmit={onSubmit} />);
    fillValidForm();

    fireEvent.click(screen.getByRole('button', { name: messages.submit }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        productId: 'p1',
        rating: 5,
        title: 'Gran portátil',
        body: 'Rápido y liviano.',
      });
    });
    expect(await screen.findByRole('status')).toHaveTextContent(messages.pendingSuccess);
  });

  it('validates locally without calling the network', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ ok: true });
    render(<ReviewForm productId="p1" messages={messages} onSubmit={onSubmit} />);

    // No rating chosen.
    fireEvent.change(screen.getByLabelText(messages.titleLabel), { target: { value: 'Título' } });
    fireEvent.change(screen.getByLabelText(messages.bodyLabel), { target: { value: 'Cuerpo.' } });
    fireEvent.click(screen.getByRole('button', { name: messages.submit }));

    expect(await screen.findByRole('alert')).toHaveTextContent(messages.ratingInvalid);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('maps backend codes to legible messages (purchase required, duplicate)', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ ok: false, code: 'FORBIDDEN' });
    render(<ReviewForm productId="p1" messages={messages} onSubmit={onSubmit} />);
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: messages.submit }));

    expect(await screen.findByRole('alert')).toHaveTextContent(messages.forbiddenError);

    const onConflict = vi.fn().mockResolvedValue({ ok: false, code: 'CONFLICT' });
    const second = render(<ReviewForm productId="p1" messages={messages} onSubmit={onConflict} />);
    const scope = second.container;
    fireEvent.change(scope.querySelector('[name="rating"]') as HTMLSelectElement, {
      target: { value: '4' },
    });
    fireEvent.change(scope.querySelector('[name="title"]') as HTMLInputElement, {
      target: { value: 'Bueno' },
    });
    fireEvent.change(scope.querySelector('[name="body"]') as HTMLTextAreaElement, {
      target: { value: 'Cumple.' },
    });
    fireEvent.click(scope.querySelector('button[type="submit"]') as HTMLButtonElement);

    expect(await within(scope).findByRole('alert')).toHaveTextContent(messages.conflictError);
  });

  it('skips its own title and hint in bare mode (the embedding card provides them)', () => {
    const onSubmit = vi.fn().mockResolvedValue({ ok: true });
    render(<ReviewForm productId="p1" messages={messages} onSubmit={onSubmit} bare />);

    expect(screen.queryByText(messages.formTitle)).not.toBeInTheDocument();
    expect(screen.queryByText(messages.formHint)).not.toBeInTheDocument();
    // The fields still render.
    expect(screen.getByLabelText(messages.ratingLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(messages.titleLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(messages.bodyLabel)).toBeInTheDocument();
  });
});
