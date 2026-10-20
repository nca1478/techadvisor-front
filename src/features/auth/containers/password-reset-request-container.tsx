'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Section } from '@/components/ui/section';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { passwordResetRequestSchema } from '../schemas';

/**
 * Step 1 — request container: collects the account email and fires the OTP.
 * On success it shows the "code sent" notice [Image 3] with a CTA to the
 * verify step; the email is passed via `?email=` so verify stays linkable.
 */
export function PasswordResetRequestContainer({
  locale,
  copy,
}: {
  locale: string;
  copy: {
    title: string;
    subtitle: string;
    emailLabel: string;
    submit: string;
    invalidEmail: string;
    required: string;
    sentTitle: string;
    sentBody: string;
    continueCta: string;
    emailNotFound: string;
    passwordNotAllowed: string;
    backToLogin: string;
    genericError: string;
    rateLimitError: string;
  };
}) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    const parsed = passwordResetRequestSchema.safeParse({ email });
    if (!parsed.success) {
      setError(copy.invalidEmail);
      return;
    }
    setError(undefined);
    setPending(true);
    try {
      const res = await fetch('/api/auth/password/request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email: parsed.data.email }),
      });
      if (res.status === 429) {
        setError(copy.rateLimitError);
        return;
      }
      if (res.status === 404) {
        setError(copy.emailNotFound);
        return;
      }
      if (res.status === 409) {
        setError(copy.passwordNotAllowed);
        return;
      }
      if (!res.ok) {
        setError(copy.genericError);
        return;
      }
      setSent(true);
    } catch {
      setError(copy.genericError);
    } finally {
      setPending(false);
    }
  }

  return (
    <Container>
      <Section>
        <Stack gap="md" className="mx-auto w-full max-w-md">
          <Card>
            <Stack gap="md">
              <Stack gap="sm">
                <Heading level={2}>{copy.title}</Heading>
                <Text tone="muted">{copy.subtitle}</Text>
              </Stack>
              {sent ? (
                <Stack gap="sm">
                  <div className="rounded-md border border-success/30 bg-success-subtle px-4 py-3 text-center">
                    <Text className="font-semibold text-success">{copy.sentTitle}</Text>
                    <Text tone="muted" variant="small">
                      {copy.sentBody}
                    </Text>
                  </div>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      router.push(
                        `/${locale}/recuperar/verificar?email=${encodeURIComponent(email.trim().toLowerCase())}`,
                      );
                    }}
                  >
                    {copy.continueCta}
                  </Button>
                </Stack>
              ) : (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleSubmit();
                  }}
                >
                  <Stack gap="md">
                    <Input
                      label={copy.emailLabel}
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      error={error}
                      onChange={(event) => {
                        setEmail(event.target.value);
                      }}
                    />
                    <Button type="submit" size="lg" loading={pending}>
                      {copy.submit}
                    </Button>
                  </Stack>
                </form>
              )}
              <Button variant="dark" size="lg" href={`/${locale}/ingresar`} className="w-full">
                {copy.backToLogin}
              </Button>
            </Stack>
          </Card>
        </Stack>
      </Section>
    </Container>
  );
}
