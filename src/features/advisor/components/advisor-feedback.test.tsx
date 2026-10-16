import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getDictionarySync } from '@/lib/i18n/index';
import { AdvisorFeedback } from './advisor-feedback';

const messages = getDictionarySync('es').advisor;

describe('AdvisorFeedback', () => {
  it('emits the voted value and thanks after sending', () => {
    const onFeedback = vi.fn();
    const { rerender } = render(
      <AdvisorFeedback
        feedback={null}
        feedbackSent={false}
        onFeedback={onFeedback}
        messages={messages}
      />,
    );
    expect(screen.getByText(messages.feedbackLabel)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: messages.feedbackUp }));
    expect(onFeedback).toHaveBeenCalledWith('up');

    rerender(
      <AdvisorFeedback feedback="up" feedbackSent onFeedback={onFeedback} messages={messages} />,
    );
    expect(screen.getByText(messages.feedbackThanks)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.feedbackUp })).toBeDisabled();
  });
});
