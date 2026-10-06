import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from '../badge';
import { Card } from '../card';

describe('Badge', () => {
  it.each([
    ['neutral', 'bg-surface'],
    ['primary', 'bg-primary-subtle'],
    ['success', 'bg-success-subtle'],
    ['warning', 'bg-warning-subtle'],
    ['destructive', 'bg-destructive-subtle'],
  ] as const)('renders the %s tone on a subtle tint', (tone, expectedClass) => {
    render(<Badge tone={tone}>Status</Badge>);
    expect(screen.getByText('Status')).toHaveClass(expectedClass);
  });
});

describe('Card', () => {
  it('renders the default variant with padding', () => {
    render(
      <Card>
        <span>Content</span>
      </Card>,
    );
    const card = screen.getByText('Content').parentElement;
    expect(card).toHaveClass('rounded-lg', 'border-border', 'shadow-sm', 'p-4');
  });

  it('supports outline and ghost variants without padding', () => {
    const { rerender } = render(
      <Card variant="outline" padding="none">
        <span>Content</span>
      </Card>,
    );
    expect(screen.getByText('Content').parentElement).toHaveClass('p-0');
    expect(screen.getByText('Content').parentElement).not.toHaveClass('shadow-sm');

    rerender(
      <Card variant="ghost" padding="md">
        <span>Content</span>
      </Card>,
    );
    expect(screen.getByText('Content').parentElement).toHaveClass('bg-surface', 'p-6');
  });
});
