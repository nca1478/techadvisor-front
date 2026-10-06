import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

function Placeholder({ label }: { label: string }) {
  return <p>{label}</p>;
}

describe('Placeholder', () => {
  it('renders the label', () => {
    render(<Placeholder label="TechAdvisor" />);
    expect(screen.getByText('TechAdvisor')).toBeInTheDocument();
  });
});
