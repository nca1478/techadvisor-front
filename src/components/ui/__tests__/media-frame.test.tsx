import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MediaFrame } from '../media-frame';

describe('MediaFrame', () => {
  it('renders the image with its mandatory alt text', () => {
    render(<MediaFrame src="/design-system-placeholder.svg" alt="Neutral placeholder" />);
    const image = screen.getByAltText('Neutral placeholder');
    expect(image).toHaveAttribute(
      'src',
      expect.stringContaining('design-system-placeholder') as string,
    );
  });

  it.each([
    ['square', 'aspect-square'],
    ['standard', 'aspect-4/3'],
    ['video', 'aspect-video'],
    ['portrait', 'aspect-3/4'],
  ] as const)('keeps the %s aspect ratio to avoid layout shift', (ratio, expectedClass) => {
    render(
      <MediaFrame src="/design-system-placeholder.svg" alt="Neutral placeholder" ratio={ratio} />,
    );
    expect(screen.getByAltText('Neutral placeholder').parentElement).toHaveClass(expectedClass);
  });

  it('does not crash on a remote product image URL (speedlogic.com.co regression)', () => {
    render(
      <MediaFrame
        src="https://speedlogic.com.co/wp-content/uploads/2025/05/33385.1.png"
        alt="Speedlogic product"
      />,
    );
    expect(screen.getByAltText('Speedlogic product')).toBeInTheDocument();
  });

  it('defaults to cover fit on the dark lab ground', () => {
    render(<MediaFrame src="/design-system-placeholder.svg" alt="Neutral placeholder" />);
    const image = screen.getByAltText('Neutral placeholder');
    expect(image).toHaveClass('object-cover');
    expect(image.parentElement).toHaveClass('bg-surface-raise');
  });

  it('unifies catalog photos with contain fit on a white matte', () => {
    render(
      <MediaFrame
        src="/design-system-placeholder.svg"
        alt="Neutral placeholder"
        fit="contain"
        tone="light"
        className="p-2"
      />,
    );
    const image = screen.getByAltText('Neutral placeholder');
    expect(image).toHaveClass('object-contain');
    expect(image.parentElement).toHaveClass('bg-white');
  });
});
