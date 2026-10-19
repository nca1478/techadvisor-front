import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FormattedDate, formatLocalDate } from '../formatted-date';

describe('formatLocalDate', () => {
  it('formats datetime with medium date and short time', () => {
    const iso = '2026-10-19T18:16:00.000Z';
    const expected = new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
    expect(formatLocalDate(iso, 'en', 'datetime')).toBe(expected);
  });

  it('formats date-only without time', () => {
    const iso = '2026-10-19T18:16:00.000Z';
    const expected = new Intl.DateTimeFormat('es', { dateStyle: 'medium' }).format(new Date(iso));
    expect(formatLocalDate(iso, 'es', 'date')).toBe(expected);
  });

  it('returns the raw value for invalid ISO', () => {
    expect(formatLocalDate('not-a-date', 'en', 'datetime')).toBe('not-a-date');
  });
});

describe('FormattedDate', () => {
  it('renders a time element with the UTC ISO in dateTime', () => {
    const iso = '2026-10-19T18:16:00.000Z';
    render(<FormattedDate iso={iso} locale="en" />);
    const el = screen.getByText(formatLocalDate(iso, 'en', 'datetime'));
    expect(el.tagName.toLowerCase()).toBe('time');
    expect(el.getAttribute('datetime')).toBe(iso);
  });

  it('supports date-only format', () => {
    const iso = '2026-10-19T18:16:00.000Z';
    render(<FormattedDate iso={iso} locale="es" format="date" />);
    expect(screen.getByText(formatLocalDate(iso, 'es', 'date'))).toBeDefined();
  });

  it('server-renders the raw ISO so no server-timezone text leaks into SSR HTML', () => {
    const iso = '2026-10-19T18:16:00.000Z';
    const html = renderToString(<FormattedDate iso={iso} locale="en" />);
    expect(html).toContain(`dateTime="${iso}"`);
    expect(html).toContain(`>${iso}</time>`);
    expect(html).not.toContain(formatLocalDate(iso, 'en', 'datetime'));
  });
});
