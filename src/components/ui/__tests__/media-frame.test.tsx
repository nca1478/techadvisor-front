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
});
