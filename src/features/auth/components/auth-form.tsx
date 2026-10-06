import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';

export interface AuthFormMessages {
  email: string;
  password: string;
  name?: string;
  submit: string;
  submitting?: string;
  invalidEmail?: string;
  passwordMin?: string;
  required?: string;
  genericError?: string;
}

export interface FieldErrors {
  email?: string;
  password?: string;
  name?: string;
  form?: string;
}

/** Shared presentational auth form (login + register): props in, markup out. */
export function AuthForm({
  values,
  errors,
  pending,
  showName,
  messages,
  onChange,
  onSubmit,
}: {
  values: { email: string; password: string; name: string };
  errors: FieldErrors;
  pending: boolean;
  showName: boolean;
  messages: AuthFormMessages;
  onChange: (field: 'email' | 'password' | 'name', value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Stack gap="md">
        {showName && (
          <Input
            label={messages.name ?? 'Name'}
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            error={errors.name}
            onChange={(event) => {
              onChange('name', event.target.value);
            }}
          />
        )}
        <Input
          label={messages.email}
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          error={errors.email}
          onChange={(event) => {
            onChange('email', event.target.value);
          }}
        />
        <Input
          label={messages.password}
          name="password"
          type="password"
          autoComplete={showName ? 'new-password' : 'current-password'}
          value={values.password}
          error={errors.password}
          onChange={(event) => {
            onChange('password', event.target.value);
          }}
        />
        {errors.form ? (
          <Text className="text-destructive" role="alert">
            {errors.form}
          </Text>
        ) : null}
        <Button type="submit" size="lg" loading={pending}>
          {messages.submit}
        </Button>
      </Stack>
    </form>
  );
}
