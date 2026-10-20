import { Button } from '@/components/ui/button';
import { Grid } from '@/components/ui/grid';
import { Input } from '@/components/ui/input';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { PasswordInput } from '@/features/auth/components/password-input';

export interface ProfileFormMessages {
  emailLabel: string;
  emailHint: string;
  nameLabel: string;
  newPasswordLabel: string;
  newPasswordHint: string;
  googlePasswordHint?: string;
  confirmPasswordLabel: string;
  showPassword: string;
  hidePassword: string;
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

/**
 * Presentational profile form: name first + email side-by-side, then new
 * password + confirmation side-by-side. Email is shown but never editable.
 * Google users (`passwordDisabled`) see both password inputs disabled with
 * an explanatory hint: their password lives in their Google account.
 * Single column on mobile, two columns from `sm` up. Full parent width.
 */
export function ProfileForm({
  email,
  values,
  errors,
  pending,
  success,
  messages,
  passwordDisabled = false,
  onChange,
  onSubmit,
}: {
  email: string;
  values: { name: string; password: string; confirmPassword: string };
  errors: ProfileFieldErrors;
  pending: boolean;
  success: string | null;
  messages: ProfileFormMessages;
  passwordDisabled?: boolean;
  onChange: (field: 'name' | 'password' | 'confirmPassword', value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="w-full"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Stack gap="md" className="w-full">
        <Grid columns="two" gap="md" className="w-full">
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
            label={messages.emailLabel}
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            hint={messages.emailHint}
            disabled
            readOnly
          />
        </Grid>
        <Grid columns="two" gap="md" className="w-full">
          <PasswordInput
            label={messages.newPasswordLabel}
            name="new-password"
            value={values.password}
            error={errors.password}
            hint={
              passwordDisabled
                ? (messages.googlePasswordHint ?? messages.newPasswordHint)
                : messages.newPasswordHint
            }
            showLabel={messages.showPassword}
            hideLabel={messages.hidePassword}
            disabled={passwordDisabled}
            onChange={(value) => {
              onChange('password', value);
            }}
          />
          <PasswordInput
            label={messages.confirmPasswordLabel}
            name="confirm-password"
            value={values.confirmPassword}
            error={errors.confirmPassword}
            showLabel={messages.showPassword}
            hideLabel={messages.hidePassword}
            disabled={passwordDisabled}
            onChange={(value) => {
              onChange('confirmPassword', value);
            }}
          />
        </Grid>
        {errors.form ? (
          <Text className="text-destructive" role="alert">
            {errors.form}
          </Text>
        ) : null}
        {success && !errors.form ? <Text role="status">{success}</Text> : null}
        <Button type="submit" loading={pending} className="self-start">
          {messages.submit}
        </Button>
      </Stack>
    </form>
  );
}
