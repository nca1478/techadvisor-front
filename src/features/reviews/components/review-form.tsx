'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import type { Dictionary } from '@/lib/i18n/index';

export type ReviewSubmitStatus = 'idle' | 'submitting' | 'sent' | 'error';

export interface ReviewSubmitResult {
  ok: boolean;
  /** Backend error code when known (`FORBIDDEN`, `CONFLICT`, `UNAUTHORIZED`). */
  code?: string;
}

export interface ReviewFormProps {
  productId: string;
  messages: Dictionary['reviews'];
  /** Defaults to the same-origin BFF (`/api/reviews`, cookie auth). */
  onSubmit?: (input: {
    productId: string;
    rating: number;
    title: string;
    body: string;
  }) => Promise<ReviewSubmitResult>;
}

const TITLE_MAX = 120;
const BODY_MAX = 2000;

/** Default submitter: posts to the same-origin BFF with cookie auth. */
async function postToBff(input: {
  productId: string;
  rating: number;
  title: string;
  body: string;
}): Promise<ReviewSubmitResult> {
  let res: Response;
  try {
    res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(input),
    });
  } catch {
    return { ok: false };
  }
  if (res.ok) return { ok: true };
  let code: string | undefined;
  try {
    const body: unknown = await res.json();
    if (body !== null && typeof body === 'object') {
      const raw = (body as Record<string, unknown>)['code'];
      if (typeof raw === 'string') code = raw;
    }
  } catch {
    code = undefined;
  }
  if (code === undefined) {
    if (res.status === 401) code = 'UNAUTHORIZED';
    else if (res.status === 403) code = 'FORBIDDEN';
    else if (res.status === 409) code = 'CONFLICT';
  }
  return { ok: false, code };
}

function errorFor(code: string | undefined, messages: Dictionary['reviews']): string {
  if (code === 'UNAUTHORIZED') return messages.loginRequired;
  if (code === 'FORBIDDEN') return messages.forbiddenError;
  if (code === 'CONFLICT') return messages.conflictError;
  return messages.genericError;
}

/**
 * Client review form (Container/Presenter: field state lives here, the
 * network call is injected via `onSubmit`). New reviews are PENDING, so a
 * success only announces the moderation notice — the public list is
 * untouched until an admin publishes.
 */
export function ReviewForm({ productId, messages, onSubmit }: ReviewFormProps) {
  const submit = onSubmit ?? postToBff;
  const [rating, setRating] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [status, setStatus] = useState<ReviewSubmitStatus>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit() {
    if (status === 'submitting' || status === 'sent') return;
    const ratingNumber = Number(rating);
    if (!Number.isInteger(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
      setFieldError(messages.ratingInvalid);
      return;
    }
    if (title.trim().length === 0 || body.trim().length === 0) {
      setFieldError(messages.required);
      return;
    }
    if (title.trim().length > TITLE_MAX) {
      setFieldError(messages.titleTooLong);
      return;
    }
    if (body.trim().length > BODY_MAX) {
      setFieldError(messages.bodyTooLong);
      return;
    }
    setFieldError(null);
    setSubmitError(null);
    setStatus('submitting');
    const result = await submit({
      productId,
      rating: ratingNumber,
      title: title.trim(),
      body: body.trim(),
    });
    if (result.ok) {
      setStatus('sent');
    } else {
      setStatus('error');
      setSubmitError(errorFor(result.code, messages));
    }
  }

  if (status === 'sent') {
    return <Text role="status">{messages.pendingSuccess}</Text>;
  }

  return (
    <Stack gap="md">
      <Heading level={3}>{messages.formTitle}</Heading>
      <Text variant="small" tone="muted">
        {messages.formHint}
      </Text>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
        noValidate
      >
        <Stack gap="sm">
          <Select
            label={messages.ratingLabel}
            name="rating"
            value={rating}
            onChange={(event) => {
              setRating(event.target.value);
            }}
            options={[1, 2, 3, 4, 5].map((value) => ({
              value: String(value),
              label: String(value),
            }))}
            placeholder="–"
          />
          <Input
            label={messages.titleLabel}
            name="title"
            value={title}
            maxLength={TITLE_MAX + 10}
            placeholder={messages.titlePlaceholder}
            onChange={(event) => {
              setTitle(event.target.value);
            }}
          />
          <div className="flex w-full flex-col gap-1.5">
            <label htmlFor="review-body" className="text-sm font-medium text-foreground">
              {messages.bodyLabel}
            </label>
            <textarea
              id="review-body"
              name="body"
              value={body}
              rows={4}
              maxLength={BODY_MAX + 10}
              placeholder={messages.bodyPlaceholder}
              onChange={(event) => {
                setBody(event.target.value);
              }}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
          </div>
          {fieldError !== null ? (
            <Text variant="small" className="text-destructive" role="alert">
              {fieldError}
            </Text>
          ) : null}
          {submitError !== null ? (
            <Text variant="small" className="text-destructive" role="alert">
              {submitError}
            </Text>
          ) : null}
          <div>
            <Button type="submit" loading={status === 'submitting'}>
              {status === 'submitting' ? messages.submitting : messages.submit}
            </Button>
          </div>
        </Stack>
      </form>
    </Stack>
  );
}
