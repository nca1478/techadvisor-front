import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Dictionary } from '@/lib/i18n/index';
import { getDictionarySync } from '@/lib/i18n/index';
import type { ReviewSummary } from '@/lib/api/reviews';
import { ReviewSummaryView } from './review-summary';

const messages: Dictionary['reviews'] = getDictionarySync('es').reviews;

function summary(overrides: Partial<ReviewSummary> = {}): ReviewSummary {
  return {
    productId: 'p1',
    pros: ['Batería duradera'],
    cons: ['Algo pesado'],
    basedOnCount: 3,
    updatedAt: '2026-03-01T10:00:00.000Z',
    ...overrides,
  };
}

describe('ReviewSummaryView', () => {
  it('renders pros, cons and the automatic-origin notice with the count', () => {
    render(<ReviewSummaryView summary={summary()} messages={messages} />);

    expect(screen.getByText(messages.summaryTitle)).toBeInTheDocument();
    expect(screen.getByText('Batería duradera')).toBeInTheDocument();
    expect(screen.getByText('Algo pesado')).toBeInTheDocument();
    // Required notice: generated automatically from X reviews.
    expect(screen.getByRole('status')).toHaveTextContent(
      messages.summaryNotice.replace('{count}', '3'),
    );
  });

  it('renders nothing when both lists are empty', () => {
    const { container } = render(
      <ReviewSummaryView summary={summary({ pros: [], cons: [] })} messages={messages} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('never renders author data (paraphrases only)', () => {
    render(
      <ReviewSummaryView
        summary={summary({ pros: ['Cómodo para trabajar'] })}
        messages={messages}
      />,
    );

    expect(screen.queryByText(/@/)).not.toBeInTheDocument();
  });
});
