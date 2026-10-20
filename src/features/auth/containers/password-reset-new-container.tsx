'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Section } from '@/components/ui/section';
import { PasswordInput } from '../components/password-input';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { passwordResetNewSchema } from '../schemas';

/**
 * Step 3 — new-password container: reads the single-use resetToken from
 * sessionStorage (set by the verify step) and confirms the change. Missing
 * token (deep link / refresh) redirects back to the request step.
 */
export function PasswordResetNewContainer({
  locale,
  email,
  copy,
}: {
  locale: string;
  email: string;
  copy: {
    title: string;
    subtitleTemplate: string;
    newPassword: string;
    confirmPassword: string;
    showPassword: string;
    hidePassword: string;
    submit: string;
    passwordMin: string;
    mismatch: string;
    required: string;
    backToLogin: string;
    successTitle: string;
    successBody: string;
    loginCta: string;
    invalidToken: string;
    genericError: string;
  };
}) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  function readSessionToken(): string | null {
    try {
      const raw = sessionStorage.getItem('password-reset');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { email?: unknown; resetToken?: unknown };
      if (parsed.email !== email || typeof parsed.resetToken !== 'string') return null;
      return parsed.resetToken;
    } catch {
      return null;
    }
  }

  const hasSession = readSessionToken() !== null;

  useEffect(() => {
    if (!done && !hasSession) {
      router.replace(`/${locale}/recuperar`);
    }
  }, [done, hasSession, router, locale]);

  async function handleSubmit() {
    const parsed = passwordResetNewSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const firstPath = first.path[0];
      const firstMessage = first.message;
      setFieldError(
        firstPath === 'confirmPassword' && firstMessage === 'mismatch'
          ? copy.mismatch
          : firstMessage === 'min10'
            ? copy.passwordMin
            : copy.required,
      );
      return;
    }
    setFieldError(undefined);
    setFormError(undefined);
    const resetToken = readSessionToken();
    if (!resetToken) {
      router.replace(`/${locale}/recuperar`);
      return;
    }
    setPending(true);
    try {
      const res = await fetch('/api/auth/password/reset', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          email,
          resetToken,
          password: parsed.data.password,
          confirmPassword: parsed.data.confirmPassword,
        }),
      });
      if (!res.ok) {
        setFormError(res.status === 400 ? copy.invalidToken : copy.genericError);
        return;
      }
      sessionStorage.removeItem('password-reset');
      setDone(true);
    } catch {
      setFormError(copy.genericError);
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
                <Text tone="muted">{copy.subtitleTemplate.replace('{email}', email)}</Text>
              </Stack>
              {done ? (
                <Stack gap="sm">
                  <div className="rounded-md border border-success/30 bg-success-subtle px-4 py-3 text-center">
                    <Text className="font-semibold text-success">{copy.successTitle}</Text>
                    <Text tone="muted" variant="small">
                      {copy.successBody}
                    </Text>
                  </div>
                  <Button size="lg" href={`/${locale}/ingresar`} className="w-full">
                    {copy.loginCta}
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
                    <PasswordInput
                      label={copy.newPassword}
                      name="new-password"
                      value={password}
                      error={fieldError}
                      showLabel={copy.showPassword}
                      hideLabel={copy.hidePassword}
                      onChange={setPassword}
                    />
                    <PasswordInput
                      label={copy.confirmPassword}
                      name="confirm-password"
                      value={confirmPassword}
                      showLabel={copy.showPassword}
                      hideLabel={copy.hidePassword}
                      onChange={setConfirmPassword}
                    />
                    {formError ? (
                      <Text className="text-destructive" role="alert">
                        {formError}
                      </Text>
                    ) : null}
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
