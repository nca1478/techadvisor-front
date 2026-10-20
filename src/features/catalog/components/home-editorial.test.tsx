import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomeAdvisorBand } from './home-editorial';

const advisorMessages = {
  badge: 'Advisor · sample',
  title: 'Ask the way you shop',
  question: 'Laptop for engineering up to 800 USD?',
  answerIntro: 'Sample with real products:',
  citationLabel: 'Source',
  disclaimer: 'Preview with citations.',
  cta: 'Try this search',
};

describe('HomeAdvisorBand', () => {
  it('renders the sample question with citation markers and CTA', () => {
    render(<HomeAdvisorBand locale="en" advisorHref="/en/asesor" messages={advisorMessages} />);
    expect(screen.getByRole('heading', { name: advisorMessages.title })).toBeInTheDocument();
    expect(screen.getByText(advisorMessages.question)).toBeInTheDocument();
    expect(screen.getByText('Source [1]')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: advisorMessages.cta })).toHaveAttribute(
      'href',
      '/en/asesor',
    );
  });
});
