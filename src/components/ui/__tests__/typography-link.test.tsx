import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Heading } from '../heading';
import { Link } from '../link';
import { Text } from '../text';

describe('Typography primitives', () => {
  it.each([1, 2, 3, 4] as const)('renders an h%s for level %s', (level) => {
    render(<Heading level={level}>Title</Heading>);
    expect(screen.getByRole('heading', { level, name: 'Title' })).toBeInTheDocument();
  });

  it('uses the relaxed body style by default and muted caption on request', () => {
    const { rerender } = render(<Text>Body copy</Text>);
    expect(screen.getByText('Body copy')).toHaveClass('text-base', 'text-foreground');

    rerender(
      <Text variant="caption" tone="muted">
        Caption copy
      </Text>,
    );
    expect(screen.getByText('Caption copy')).toHaveClass('text-xs', 'text-muted-foreground');
  });

  it('resolves header tones to a single color class', () => {
    const { rerender } = render(<Text tone="header">Header copy</Text>);
    expect(screen.getByText('Header copy')).toHaveClass('text-header-foreground');

    rerender(<Text tone="headerMuted">Header muted copy</Text>);
    expect(screen.getByText('Header muted copy')).toHaveClass('text-header-muted');
  });
});

describe('Link', () => {
  it('renders an internal link with the link style', () => {
    render(<Link href="/shop">Shop</Link>);
    const link = screen.getByRole('link', { name: 'Shop' });
    expect(link).toHaveAttribute('href', '/shop');
    expect(link).toHaveClass('text-link');
    expect(link).not.toHaveAttribute('target');
  });

  it('opens external links in a new tab with noopener', () => {
    render(<Link href="https://example.com">External</Link>);
    const link = screen.getByRole('link', { name: 'External' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
