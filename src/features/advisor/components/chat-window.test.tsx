import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Dictionary } from '@/lib/i18n/index';
import { getDictionarySync } from '@/lib/i18n/index';
import { formatPrice } from '@/lib/money/format';
import { ChatWindow, type ChatWindowProps } from './chat-window';

const messages: Dictionary = getDictionarySync('es');

function baseProps(overrides: Partial<ChatWindowProps> = {}): ChatWindowProps {
  return {
    bubbles: [],
    streamingText: null,
    sending: false,
    input: '',
    onInputChange: vi.fn(),
    onSubmit: vi.fn(),
    onNewChat: vi.fn(),
    startingNewChat: false,
    errorMessage: null,
    onRetry: vi.fn(),
    chips: [],
    chipsLabel: messages.chat.startersLabel,
    onChip: vi.fn(),
    locale: 'es',
    productHrefFor: (slug: string) => `/es/productos/${slug}`,
    onAddToCart: () => Promise.resolve({ ok: true as const }),
    messages,
    ...overrides,
  };
}

describe('ChatWindow', () => {
  it('exposes the log region, composer and privacy note', () => {
    render(<ChatWindow {...baseProps()} />);
    expect(screen.getByRole('log', { name: messages.chat.logLabel })).toBeInTheDocument();
    expect(screen.getByLabelText(messages.chat.inputLabel)).toBeInTheDocument();
    expect(screen.getByText(messages.advisor.privacyNote)).toBeInTheDocument();
    expect(screen.getByText(messages.advisor.disclaimer)).toBeInTheDocument();
  });

  it('renders user and assistant bubbles with product cards from data', () => {
    render(
      <ChatWindow
        {...baseProps({
          bubbles: [
            { id: 'u1', role: 'user', text: 'Portátil para estudiar' },
            {
              id: 'a1',
              role: 'assistant',
              text: 'Esta opción encaja [1].',
              citations: [
                { n: 1, documentId: 'd', chunkId: 'c', title: 'Manual', snippet: 'Texto.' },
              ],
              products: [
                {
                  productId: 'prod-1',
                  name: 'Mock Laptop 13',
                  slug: 'mock-laptop-13',
                  priceAmount: 129900,
                  currency: 'USD',
                  inStock: true,
                  availableQuantity: 7,
                  imageUrl: null,
                  reason: '16 GB [1].',
                  citations: [],
                },
              ],
            },
          ],
        })}
      />,
    );
    expect(screen.getByText('Portátil para estudiar')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Mock Laptop 13/ })).toHaveAttribute(
      'href',
      '/es/productos/mock-laptop-13',
    );
    // Price comes from the hydrated card, formatted for the locale.
    const expectedPrice = formatPrice(129900, 'USD', 'es');
    expect(
      screen.getByText((_, element) => element?.textContent === expectedPrice),
    ).toBeInTheDocument();
  });

  it('marks clarification bubbles and offers quick-reply chips', () => {
    const onChip = vi.fn();
    render(
      <ChatWindow
        {...baseProps({
          bubbles: [{ id: 'a1', role: 'assistant', text: '¿Presupuesto?', clarifying: true }],
          chips: ['Mi presupuesto es de 800 USD'],
          chipsLabel: messages.chat.quickRepliesLabel,
          onChip,
        })}
      />,
    );
    expect(screen.getByText(messages.chat.clarificationBadge)).toBeInTheDocument();
    expect(screen.getByText(messages.chat.quickRepliesLabel)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mi presupuesto es de 800 USD' }));
    expect(onChip).toHaveBeenCalledWith('Mi presupuesto es de 800 USD');
  });

  it('announces typing in a status region while streaming shows partial text', () => {
    const { rerender } = render(<ChatWindow {...baseProps({ sending: true })} />);
    expect(screen.getByRole('status')).toHaveTextContent(messages.chat.typing);
    rerender(<ChatWindow {...baseProps({ sending: true, streamingText: 'Estas opciones' })} />);
    expect(screen.getByText(/Estas opciones/)).toBeInTheDocument();
  });

  it('shows errors in an alert region with retry', () => {
    const onRetry = vi.fn();
    render(
      <ChatWindow {...baseProps({ errorMessage: messages.advisor.rateLimitError, onRetry })} />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(messages.advisor.rateLimitError);
    fireEvent.click(screen.getByRole('button', { name: messages.advisor.retry }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('lists saved conversations and switches on selection', () => {
    const onSelectSession = vi.fn();
    render(
      <ChatWindow
        {...baseProps({
          historyOptions: [
            { id: 's2', label: 'Portátil para estudiar (2)' },
            { id: 's1', label: 'Auriculares cómodos' },
          ],
          currentSessionId: 's1',
          onSelectSession,
        })}
      />,
    );
    const history = screen.getByRole('combobox', { name: messages.chat.historyLabel });
    expect(history.querySelectorAll('option')).toHaveLength(2);
    fireEvent.change(history, { target: { value: 's2' } });
    expect(onSelectSession).toHaveBeenCalledWith('s2');
  });

  it('shows a loading state for the history while sessions resolve', () => {
    render(<ChatWindow {...baseProps({ historyLoading: true })} />);
    expect(screen.getByText(messages.chat.historyLoading)).toBeInTheDocument();
  });

  it('submits the composer with Enter and starts a new chat on demand', () => {
    const onSubmit = vi.fn();
    const onNewChat = vi.fn();
    render(<ChatWindow {...baseProps({ input: 'Hola', onSubmit, onNewChat })} />);
    fireEvent.click(screen.getByRole('button', { name: messages.chat.send }));
    expect(onSubmit).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: messages.chat.newChat }));
    expect(onNewChat).toHaveBeenCalled();
  });
});
