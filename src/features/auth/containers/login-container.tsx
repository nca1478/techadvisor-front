'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Section } from '@/components/ui/section';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { loginSchema } from '../schemas';
import { useSession } from '../session-context';
import { AuthForm, type AuthFormMessages, type FieldErrors } from '../components/auth-form';

/**
 * Login container: validates locally with Zod, delegates to the session
 * context (BFF + httpOnly cookies), then follows `?next=` or lands on home.
 */
export function LoginContainer({
  locale,
  next,
  title,
  subtitle,
  messages,
}: {
  locale: string;
  next: string;
  title: string;
  subtitle: string;
  messages: AuthFormMessages;
}) {
  const router = useRouter();
  const { login } = useSession();
  const [values, setValues] = useState({ email: '', password: '', name: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

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
            </Stack>
          </Card>
        </Stack>
      </Section>
    </Container>
  );
}
