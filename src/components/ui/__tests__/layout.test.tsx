import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Container } from '../container';
import { Grid } from '../grid';
import { Section } from '../section';
import { Stack } from '../stack';

describe('Layout primitives', () => {
  it('centers content with the xl container and gutters by default', () => {
    render(
      <Container>
        <span>Content</span>
      </Container>,
    );
    const container = screen.getByText('Content').parentElement;
    expect(container).toHaveClass('mx-auto', 'max-w-7xl', 'px-4', 'sm:px-6', 'lg:px-8');
  });

  it('supports smaller container sizes', () => {
    render(
      <Container size="md">
        <span>Content</span>
      </Container>,
    );
    expect(screen.getByText('Content').parentElement).toHaveClass('max-w-3xl');
  });

  it('applies the section rhythm', () => {
    render(
      <Section>
        <span>Content</span>
      </Section>,
    );
    expect(screen.getByText('Content').parentElement?.tagName).toBe('SECTION');
    expect(screen.getByText('Content').parentElement).toHaveClass('py-12', 'md:py-20');
  });

  it('lays out a vertical stack with gaps by default', () => {
    render(
      <Stack>
        <span>Content</span>
      </Stack>,
    );
    expect(screen.getByText('Content').parentElement).toHaveClass('flex', 'flex-col', 'gap-4');
  });

  it('renders the responsive product grid (2-3-4 columns)', () => {
    render(
      <Grid>
        <span>Content</span>
      </Grid>,
    );
    expect(screen.getByText('Content').parentElement).toHaveClass(
      'grid',
      'grid-cols-2',
      'md:grid-cols-3',
      'lg:grid-cols-4',
    );
  });

  it('renders the featured grid (1-2-4 columns)', () => {
    render(
      <Grid columns="featured">
        <span>Content</span>
      </Grid>,
    );
    expect(screen.getByText('Content').parentElement).toHaveClass(
      'grid',
      'grid-cols-1',
      'sm:grid-cols-2',
      'lg:grid-cols-4',
    );
  });
});
