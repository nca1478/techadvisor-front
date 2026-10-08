import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => {
    if (typeof src === 'string' && src.startsWith('https://unconfigured.example/')) {
      throw new Error(
        `Invalid src prop (${src}) on \`next/image\`, hostname "unconfigured.example" is not configured under images in your \`next.config.js\``,
      );
    }
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} />;
  },
}));

import { MediaFrame } from '../media-frame';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('MediaFrame with an unconfigured remote host', () => {
  it('shows the local placeholder instead of crashing the page', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    let crashed = false;
    try {
      render(
        <MediaFrame
          src="https://unconfigured.example/wp-content/uploads/2025/05/33385.1.png"
          alt="Unconfigured host product"
        />,
      );
    } catch {
      crashed = true;
    }
    expect(crashed).toBe(false);
    const image = screen.getByAltText('Unconfigured host product');
    expect(image).toHaveAttribute('src', expect.stringContaining('placeholder') as string);
  });

  it('keeps rendering configured sources normally', () => {
    render(<MediaFrame src="/placeholder.svg" alt="Local placeholder" />);
    const image = screen.getByAltText('Local placeholder');
    expect(image).toHaveAttribute('src', expect.stringContaining('placeholder') as string);
  });
});
