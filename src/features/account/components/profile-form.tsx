import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';

export interface ProfileFormMessages {
  emailLabel: string;
  emailHint: string;
  nameLabel: string;
  newPasswordLabel: string;
  newPasswordHint: string;
  confirmPasswordLabel: string;
  submit: string;
  submitting?: string;
  required?: string;
  passwordMin?: string;
  passwordMismatch?: string;
  genericError?: string;
}

export interface ProfileFieldErrors {
  name?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}

/** Presentational profile form: email is shown but never editable. */
export function ProfileForm({
  email,
  values,
  errors,
  pending,
  success,
  messages,
  onChange,
  onSubmit,
}: {
  email: string;
  values: { name: string; password: string; confirmPassword: string };
  errors: ProfileFieldErrors;
  pending: boolean;
  success: string | null;
  messages: ProfileFormMessages;
  onChange: (field: 'name' | 'password' | 'confirmPassword', value: string) => void;
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
        <Input
          label={messages.emailLabel}
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          hint={messages.emailHint}
          disabled
          readOnly
        />
        <Input
          label={messages.nameLabel}
          name="name"
          type="text"
          autoComplete="name"
          value={values.name}
          error={errors.name}
          onChange={(event) => {
            onChange('name', event.target.value);
          }}
        />
        <Input
          label={messages.newPasswordLabel}
          name="new-password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          error={errors.password}
          hint={messages.newPasswordHint}
          onChange={(event) => {
            onChange('password', event.target.value);
          }}
        />
        <Input
          label={messages.confirmPasswordLabel}
          name="confirm-password"
          type="password"
          autoComplete="new-password"
          value={values.confirmPassword}
          error={errors.confirmPassword}
          onChange={(event) => {
            onChange('confirmPassword', event.target.value);
          }}
        />
        {errors.form ? (
          <Text className="text-destructive" role="alert">
            {errors.form}
          </Text>
        ) : null}
        {success && !errors.form ? <Text role="status">{success}</Text> : null}
        <Button type="submit" size="lg" loading={pending}>
          {messages.submit}
        </Button>
      </Stack>
    </form>
  );
}
