'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Section } from '@/components/ui/section';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { loginSchema } from '../schemas';
import { useSession } from '../session-context';
import { AuthForm, type AuthFormMessages, type FieldErrors } from '../components/auth-form';
import { GoogleSigninButton } from '../components/google-signin-button';

/**
 * Login container: validates locally with Zod, delegates to the session
 * context (BFF + httpOnly cookies), then follows `?next=` or lands on home.
 * Google sign-in (GIS ID token via `loginWithGoogle`) sits below the local
 * form and above the register CTA; it is hidden when unconfigured.
 */
export function LoginContainer({
  locale,
  next,
  title,
  subtitle,
  noAccountPrompt,
  registerCta,
  messages,
  google,
}: {
  locale: string;
  next: string;
  title: string;
  subtitle: string;
  noAccountPrompt: string;
  registerCta: string;
  messages: AuthFormMessages;
  google: {
    clientId: string;
    divider: string;
    buttonLabel: string;
    error: string;
  };
}) {
  const defaultHome = `/${locale}`;
  const registerHref =
    next && next !== defaultHome
      ? `/${locale}/registro?next=${encodeURIComponent(next)}`
      : `/${locale}/registro`;
  const router = useRouter();
  const { login, loginWithGoogle } = useSession();
  const [values, setValues] = useState({ email: '', password: '', name: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  async function handleSubmit() {
    const parsed = loginSchema.safeParse({ email: values.email, password: values.password });
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === 'email') fieldErrors.email = messages.invalidEmail ?? 'Invalid email';
        if (field === 'password') fieldErrors.password = messages.required ?? 'Required';
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setPending(true);
    try {
      const result = await login(parsed.data);
      if (!result.ok) {
        setErrors({ form: result.message });
        return;
      }
      router.push(next || `/${locale}`);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  const handleGoogleCredential = useCallback(
    async (accessToken: string) => {
      setGooglePending(true);
      try {
        const result = await loginWithGoogle({ accessToken });
        if (!result.ok) {
          setErrors({ form: google.error });
          return;
        }
        router.push(next || `/${locale}`);
        router.refresh();
      } finally {
        setGooglePending(false);
      }
    },
    [google.error, loginWithGoogle, locale, next, router],
  );

  const handleGoogleError = useCallback(() => {
    setErrors({ form: google.error });
  }, [google.error]);

  return (
    <Container>
      <Section>
        <Stack gap="md" className="mx-auto w-full max-w-md">
          <Card>
            <Stack gap="md">
              <Stack gap="sm">
                <Heading level={2}>{title}</Heading>
                <Text tone="muted">{subtitle}</Text>
              </Stack>
              <AuthForm
                values={values}
                errors={errors}
                pending={pending}
                showName={false}
                messages={messages}
                onChange={(field, value) => {
                  setValues((prev) => ({ ...prev, [field]: value }));
                }}
                onSubmit={() => void handleSubmit()}
              />
              {google.clientId ? (
                <Stack gap="sm" className="items-center">
                  <Text tone="muted" variant="small" className="w-full text-center">
                    {google.divider}
                  </Text>
                  <GoogleSigninButton
                    clientId={google.clientId}
                    label={google.buttonLabel}
                    disabled={pending || googlePending}
                    onCredential={(accessToken) => void handleGoogleCredential(accessToken)}
                    onError={handleGoogleError}
                  />
                </Stack>
              ) : null}
              <Stack gap="sm" className="items-center">
                <Text tone="muted" variant="small" className="w-full text-center">
                  {noAccountPrompt}
                </Text>
                <Button variant="dark" size="lg" href={registerHref} className="w-full">
                  {registerCta}
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </Section>
    </Container>
  );
}
