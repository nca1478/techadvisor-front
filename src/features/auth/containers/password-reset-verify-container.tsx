'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Section } from '@/components/ui/section';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { OtpInput } from '../components/otp-input';
import { passwordResetVerifySchema } from '../schemas';

const RESEND_COOLDOWN_SEC = 60;

/**
 * Step 2 — verify container: 6-digit OTP from the email. Wrong codes show
 * an inline error; "resend" respects a 60s client cooldown on top of the
 * server cooldown. Success routes to the new-password step with the
 * single-use resetToken carried in memory via sessionStorage.
 */
export function PasswordResetVerifyContainer({
  locale,
  email,
  copy,
}: {
  locale: string;
  email: string;
  copy: {
    title: string;
    subtitleTemplate: string;
    verify: string;
    resend: string;
    resendCooldownTemplate: string;
    changeEmail: string;
    invalidCode: string;
    expiredCode: string;
    genericError: string;
    rateLimitError: string;
  };
}) {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => {
      setCooldown((value) => value - 1);
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [cooldown]);

  async function handleVerify() {
    const parsed = passwordResetVerifySchema.safeParse({ email, code: digits.join('') });
    if (!parsed.success) {
      setError(copy.invalidCode);
      return;
    }
    setError(undefined);
    setPending(true);
    try {
      const res = await fetch('/api/auth/password/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(parsed.data),
      });
      const body = (await res.json().catch(() => null)) as {
        resetToken?: unknown;
      } | null;
      if (res.status === 429) {
        setError(copy.rateLimitError);
        return;
      }
      if (!res.ok || typeof body?.resetToken !== 'string') {
        setError(res.status === 400 ? copy.expiredCode : copy.genericError);
        return;
      }
      sessionStorage.setItem(
        'password-reset',
        JSON.stringify({ email: parsed.data.email, resetToken: body.resetToken }),
      );
      router.push(`/${locale}/recuperar/nueva?email=${encodeURIComponent(parsed.data.email)}`);
    } catch {
      setError(copy.genericError);
    } finally {
      setPending(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setResending(true);
    try {
      const res = await fetch('/api/auth/password/request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email }),
      });
      if (res.status === 429) {
        setError(copy.rateLimitError);
        return;
      }
      if (!res.ok) {
        setError(copy.genericError);
        return;
      }
      setCooldown(RESEND_COOLDOWN_SEC);
      setError(undefined);
    } catch {
      setError(copy.genericError);
    } finally {
      setResending(false);
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
                <Text tone="muted">{copy.subtitleTemplate.replace('{email}', email)}</Text>
              </Stack>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleVerify();
                }}
              >
                <Stack gap="md">
                  <OtpInput
                    digits={digits}
                    label={copy.verify}
                    error={error}
                    onChange={setDigits}
                    onPasteCode={(code) => {
                      const next = code.padEnd(6, '').slice(0, 6).split('');
                      while (next.length < 6) next.push('');
                      setDigits(next);
                    }}
                  />
                  <Button type="submit" size="lg" loading={pending}>
                    {copy.verify}
                  </Button>
                </Stack>
              </form>
              <Stack gap="sm" className="items-center">
                <Button
                  variant="dark"
                  size="lg"
                  className="w-full"
                  loading={resending}
                  disabled={cooldown > 0 || resending}
                  onClick={() => {
                    void handleResend();
                  }}
                >
                  {cooldown > 0
                    ? copy.resendCooldownTemplate.replace('{sec}', String(cooldown))
                    : copy.resend}
                </Button>
                <Button variant="dark" size="lg" href={`/${locale}/recuperar`} className="w-full">
                  {copy.changeEmail}
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </Section>
    </Container>
  );
}
