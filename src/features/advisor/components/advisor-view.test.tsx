import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Dictionary } from '@/lib/i18n/index';
import { getDictionarySync } from '@/lib/i18n/index';
import { AdvisorView } from './advisor-view';

const messages: Dictionary['advisor'] = getDictionarySync('es').advisor;

function baseProps() {
  return {
    title: messages.title,
    question: '',
    onQuestionChange: vi.fn(),
    onSubmit: vi.fn(() => {}),
    status: 'idle' as const,
    result: null,
    errorMessage: null,
    onRetry: vi.fn(),
    suggestedKeys: ['suggested-default-specs'],
    resolveSuggestion: (key: string) =>
      (messages.suggested as unknown as Record<string, string>)[key] ?? key,
    onPickSuggestion: vi.fn(),
    feedback: null,
    feedbackSent: false,
    onFeedback: vi.fn(),
    locale: 'es',
    supportHref: '/es/cuenta',
    messages,
  };
}

describe('AdvisorView', () => {
  it('renders the question box, suggestions and disclaimer', () => {
    render(<AdvisorView {...baseProps()} />);
    expect(screen.getByLabelText(messages.questionLabel)).toBeInTheDocument();
    expect(screen.getByText(messages.suggestedLabel)).toBeInTheDocument();
    expect(screen.getByText(messages.disclaimer)).toBeInTheDocument();
    expect(screen.getByText(messages.privacyNote)).toBeInTheDocument();
  });

  it('announces loading via a status region', () => {
    render(<AdvisorView {...baseProps()} status="loading" />);
    expect(screen.getByRole('status')).toHaveTextContent(messages.loading);
  });

  it('shows abstention distinctly with a support link', () => {
    render(
      <AdvisorView
        {...baseProps()}
        status="abstained"
        result={{ answer: 'No tengo esa información.', citations: [], abstained: true }}
      />,
    );
    expect(screen.getByText(messages.abstentionBadge)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: messages.supportLink })).toHaveAttribute(
      'href',
      '/es/cuenta',
    );
  });

  it('shows answers without visible citations but keeps feedback buttons', () => {
    const onFeedback = vi.fn();
    const { container } = render(
      <AdvisorView
        {...baseProps()}
        status="answered"
        onFeedback={onFeedback}
        result={{
          answer: 'Dura 10 h [1].',
          citations: [
            { n: 1, documentId: 'd', chunkId: 'c', title: 'Manual', snippet: 'Diez horas.' },
          ],
          abstained: false,
        }}
      />,
    );
    expect(screen.getByText(messages.feedbackLabel)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: messages.feedbackUp }));
    expect(onFeedback).toHaveBeenCalledWith('up');
    // Citas y fragmentos ocultos visualmente (se conservan en el DOM).
    expect(screen.queryByRole('button', { name: /Manual/ })).toBeNull();
    expect(container.querySelector('ol')?.hasAttribute('hidden')).toBe(true);
  });

  it('announces errors in an alert region with retry', () => {
    const onRetry = vi.fn();
    render(
      <AdvisorView
        {...baseProps()}
        status="error"
        errorMessage={messages.rateLimitError}
        onRetry={onRetry}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(messages.rateLimitError);
    fireEvent.click(screen.getByRole('button', { name: messages.retry }));
    expect(onRetry).toHaveBeenCalled();
  });
});
