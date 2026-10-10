import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DocumentsTable } from '@/features/admin/components/documents-table';
import type { AdminDocument } from '@/lib/api/admin';
import es from '@/messages/es.json';

const messages = es.admin.documents;

function makeDocument(overrides: Partial<AdminDocument> = {}): AdminDocument {
  return {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    type: 'MANUAL',
    title: 'X1 manual',
    locale: 'en',
    productId: null,
    categoryId: null,
    sourceUrl: null,
    source: 'manual',
    status: 'READY',
    error: null,
    fileName: 'x1-manual.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 48213,
    chunkCount: 12,
    createdAt: '2026-10-08T12:00:00.000Z',
    updatedAt: '2026-10-08T12:00:00.000Z',
    ...overrides,
  };
}

function baseProps(extra: Partial<Parameters<typeof DocumentsTable>[0]> = {}) {
  return {
    documents: [] as AdminDocument[],
    messages,
    locale: 'es',
    pendingIds: new Set<string>(),
    stoppedIds: new Set<string>(),
    filtered: false,
    clearFiltersLabel: 'Limpiar filtros',
    onReingest: () => undefined,
    onDelete: () => undefined,
    onClearFilters: () => undefined,
    ...extra,
  };
}

describe('DocumentsTable', () => {
  it('renders an empty state without rows', () => {
    render(<DocumentsTable {...baseProps()} />);
    expect(screen.getByText(messages.empty)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  it('renders a filtered empty state with a clear-filters action', () => {
    const onClearFilters = vi.fn();
    render(<DocumentsTable {...baseProps({ filtered: true, onClearFilters })} />);
    expect(screen.getByText(messages.emptyFiltered)).toBeInTheDocument();
    expect(screen.queryByText(messages.empty)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(onClearFilters).toHaveBeenCalledOnce();
  });

  it('renders status, chunk count, localized type and row actions', () => {
    const onReingest = vi.fn();
    const onDelete = vi.fn();
    render(
      <DocumentsTable
        documents={[makeDocument()]}
        messages={messages}
        locale="es"
        pendingIds={new Set()}
        stoppedIds={new Set()}
        filtered={false}
        clearFiltersLabel="Limpiar filtros"
        onReingest={onReingest}
        onDelete={onDelete}
        onClearFilters={() => undefined}
      />,
    );
    expect(screen.getByText('X1 manual')).toBeInTheDocument();
    expect(screen.getByText(messages.status_READY)).toBeInTheDocument();
    expect(screen.getByText(messages.type_MANUAL)).toBeInTheDocument();
    expect(screen.getByText('12 fragmentos')).toBeInTheDocument();
    // Numeric columns align right with tabular figures for comparability.
    expect(screen.getByText('12 fragmentos').closest('td')).toHaveClass(
      'text-right',
      'tabular-nums',
    );
    expect(screen.getByText(messages.tableChunks).closest('th')).toHaveClass('text-sm');
    // Reference look: hairlines only, no zebra striping.
    expect(screen.getByText('X1 manual').closest('tr')).not.toHaveClass('odd:bg-background');

    fireEvent.click(screen.getByRole('button', { name: messages.reingest }));
    expect(onReingest).toHaveBeenCalledWith('3fa85f64-5717-4562-b3fc-2c963f66afa6');
    fireEvent.click(screen.getByRole('button', { name: messages.delete }));
    expect(onDelete).toHaveBeenCalledWith('3fa85f64-5717-4562-b3fc-2c963f66afa6');
  });

  it('numbers rows starting at 1 and continuing from the row offset', () => {
    const { rerender } = render(
      <DocumentsTable
        documents={[makeDocument(), makeDocument({ id: '7fa85f64-5717-4562-b3fc-2c963f66afa6' })]}
        messages={messages}
        locale="es"
        pendingIds={new Set()}
        stoppedIds={new Set()}
        filtered={false}
        clearFiltersLabel="Limpiar filtros"
        onReingest={() => undefined}
        onDelete={() => undefined}
        onClearFilters={() => undefined}
      />,
    );
    expect(screen.getByText(messages.tableNumber)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    rerender(
      <DocumentsTable
        documents={[makeDocument()]}
        messages={messages}
        locale="es"
        pendingIds={new Set()}
        stoppedIds={new Set()}
        rowOffset={20}
        filtered={false}
        clearFiltersLabel="Limpiar filtros"
        onReingest={() => undefined}
        onDelete={() => undefined}
        onClearFilters={() => undefined}
      />,
    );
    expect(screen.getByText('21')).toBeInTheDocument();
  });

  it('shows the failure detail and disables actions while busy', () => {
    render(
      <DocumentsTable
        documents={[makeDocument({ status: 'FAILED', error: 'boom', chunkCount: 0 })]}
        messages={messages}
        locale="es"
        pendingIds={new Set(['3fa85f64-5717-4562-b3fc-2c963f66afa6'])}
        stoppedIds={new Set()}
        filtered={false}
        clearFiltersLabel="Limpiar filtros"
        onReingest={() => undefined}
        onDelete={() => undefined}
        onClearFilters={() => undefined}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('boom');
    expect(screen.getByRole('button', { name: messages.reingest })).toBeDisabled();
    expect(screen.getByRole('button', { name: messages.delete })).toBeDisabled();
  });

  it('shows the processing note and the stopped note for transient rows', () => {
    const { rerender } = render(
      <DocumentsTable
        documents={[makeDocument({ status: 'PROCESSING', chunkCount: 0 })]}
        messages={messages}
        locale="es"
        pendingIds={new Set()}
        stoppedIds={new Set()}
        filtered={false}
        clearFiltersLabel="Limpiar filtros"
        onReingest={() => undefined}
        onDelete={() => undefined}
        onClearFilters={() => undefined}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent(messages.processingNote);

    rerender(
      <DocumentsTable
        documents={[makeDocument({ status: 'PROCESSING', chunkCount: 0 })]}
        messages={messages}
        locale="es"
        pendingIds={new Set()}
        stoppedIds={new Set(['3fa85f64-5717-4562-b3fc-2c963f66afa6'])}
        filtered={false}
        clearFiltersLabel="Limpiar filtros"
        onReingest={() => undefined}
        onDelete={() => undefined}
        onClearFilters={() => undefined}
      />,
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText(messages.pollingStopped)).toBeInTheDocument();
  });
});
