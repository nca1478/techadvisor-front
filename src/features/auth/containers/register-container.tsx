'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Section } from '@/components/ui/section';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { registerSchema } from '../schemas';
import { useSession } from '../session-context';
import { AuthForm, type AuthFormMessages, type FieldErrors } from '../components/auth-form';

/** Register container: same flow as login, with the optional name field. */
export function RegisterContainer({
  locale,
  next,
  title,
  subtitle,
  hasAccountPrompt,
  signInCta,
  messages,
}: {
  locale: string;
  next: string;
  title: string;
  subtitle: string;
  hasAccountPrompt: string;
  signInCta: string;
  messages: AuthFormMessages;
}) {
  const defaultHome = `/${locale}`;
  const loginHref =
    next && next !== defaultHome
      ? `/${locale}/ingresar?next=${encodeURIComponent(next)}`
      : `/${locale}/ingresar`;
  const router = useRouter();
  const { register } = useSession();
  const [values, setValues] = useState({ email: '', password: '', name: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit() {
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === 'email') fieldErrors.email = messages.invalidEmail ?? 'Invalid email';
        if (field === 'password') fieldErrors.password = messages.passwordMin ?? 'Min 10 chars';
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setPending(true);
    try {
      const result = await register({
        email: parsed.data.email,
        password: parsed.data.password,
        name: parsed.data.name,
      });
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
                showName
                messages={messages}
                onChange={(field, value) => {
                  setValues((prev) => ({ ...prev, [field]: value }));
                }}
                onSubmit={() => void handleSubmit()}
              />
              <Stack gap="sm" className="items-center">
                <Text tone="muted">{hasAccountPrompt}</Text>
                <Button variant="dark" size="lg" href={loginHref} className="w-full">
                  {signInCta}
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </Section>
    </Container>
  );
}
