import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AdvisorAnswer } from './advisor-answer';

const citations = [
  { n: 1, documentId: 'd1', chunkId: 'c1', title: 'Manual X', snippet: 'Batería hasta 10 horas.' },
  { n: 2, documentId: 'd2', chunkId: 'c2', title: 'Ficha X', snippet: 'RAM 16 GB.' },
];

const labels = {
  locale: 'es',
  sourceLabel: 'Fuentes',
  showSnippetLabel: 'Ver fragmento',
  hideSnippetLabel: 'Ocultar',
};

describe('AdvisorAnswer', () => {
  it('renders answer text with clickable citation markers', () => {
    render(
      <AdvisorAnswer
        answer="La batería dura 10 h [1] y la RAM es 16 GB [2]."
        citations={citations}
        {...labels}
      />,
    );
    expect(screen.getByRole('button', { name: 'Fuentes 1: Manual X' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fuentes 2: Ficha X' })).toBeInTheDocument();
    expect(screen.getByText('Manual X')).toBeInTheDocument();
  });

  it('never renders raw HTML from the model answer', () => {
    const { container } = render(
      <AdvisorAnswer
        answer="<script>alert(1)</script> Texto [1]."
        citations={citations}
        {...labels}
      />,
    );
    expect(container.querySelector('script')).toBeNull();
    // Visible text + sr-only full-text copy for screen readers.
    expect(screen.getAllByText(/Texto/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders unknown markers as inert text', () => {
    render(<AdvisorAnswer answer="Inventado [9]." citations={citations} {...labels} />);
    expect(screen.queryByRole('button', { name: /9/ })).toBeNull();
    expect(screen.getAllByText(/Inventado/).length).toBeGreaterThanOrEqual(1);
  });

  it('dedupes repeated citations so keys stay unique', () => {
    const duplicated = [...citations, { ...citations[0] }];
    const { container } = render(
      <AdvisorAnswer answer="Dura 10 h [1] y RAM 16 GB [2]." citations={duplicated} {...labels} />,
    );
    // One row per citation number, even when the backend repeats the chunk.
    expect(container.querySelectorAll('ol > li')).toHaveLength(2);
    expect(screen.getByText('Manual X')).toBeInTheDocument();
  });

  it('expands a citation to show title and snippet on click', () => {
    render(<AdvisorAnswer answer="Dura 10 h [1]." citations={citations} {...labels} />);
    expect(screen.queryByText('Batería hasta 10 horas.')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Fuentes 1: Manual X' }));
    expect(screen.getByText('Batería hasta 10 horas.')).toBeInTheDocument();
  });
});
