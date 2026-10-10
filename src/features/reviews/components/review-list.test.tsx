import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Dictionary } from '@/lib/i18n/index';
import { getDictionarySync } from '@/lib/i18n/index';
import type { ProductReview } from '@/lib/api/reviews';
import { ReviewListView } from './review-list';

const messages: Dictionary['reviews'] = getDictionarySync('es').reviews;

function review(overrides: Partial<ProductReview> = {}): ProductReview {
  return {
    id: 'r1',
    productId: 'p1',
    rating: 5,
    title: 'Gran portátil',
    body: 'Rápido y liviano.',
    verifiedPurchase: true,
    createdAt: '2026-02-01T10:00:00.000Z',
    ...overrides,
  };
}

describe('ReviewListView', () => {
  it('renders the average headline and one card per review', () => {
    render(
      <ReviewListView
        reviews={[review(), review({ id: 'r2', rating: 4, title: 'Bueno', body: 'Cumple.' })]}
        total={2}
        averageRating={4.5}
        locale="es"
        messages={messages}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      messages.averageLabel.replace('{avg}', '4.5').replace('{count}', '2'),
    );
    expect(screen.getByText('Gran portátil')).toBeInTheDocument();
    expect(screen.getByText('Bueno')).toBeInTheDocument();
    expect(screen.getAllByText(messages.verifiedBadge)).toHaveLength(2);
  });

  it('exposes star ratings through accessible labels', () => {
    render(
      <ReviewListView
        reviews={[review({ rating: 4 })]}
        total={1}
        averageRating={4}
        locale="es"
        messages={messages}
      />,
    );

    expect(
      screen.getByRole('img', { name: messages.starsLabel.replace('{rating}', '4') }),
    ).toBeInTheDocument();
  });

  it('renders the empty state without an average', () => {
    render(
      <ReviewListView
        reviews={[]}
        total={0}
        averageRating={null}
        locale="es"
        messages={messages}
      />,
    );

    expect(screen.getByText(messages.empty)).toBeInTheDocument();
  });
});
