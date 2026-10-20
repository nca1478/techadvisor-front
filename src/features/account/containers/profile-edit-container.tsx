'use client';

import { useState } from 'react';
import type { UpdateProfileRequest } from '@/lib/api/account';
import { useSession } from '@/features/auth/session-context';
import type { Dictionary } from '@/lib/i18n/index';
import { ProfileForm, type ProfileFieldErrors } from '../components/profile-form';
import { profileUpdateSchema } from '../schemas';

/**
 * Profile edit container: validates locally with Zod (including the
 * UI-only password confirmation), PATCHes the BFF
 * (`/api/account/profile` → backend `PATCH /users/me`), then refreshes the
 * session so the new name is visible everywhere. Email is
 * display-only and never leaves the browser. Layout-free (no
 * Container/Section/Heading) so it embeds in the account tab panel.
 */
export function ProfileEditContainer({
  email,
  initialName,
  isGoogleUser = false,
  messages,
}: {
  email: string;
  initialName: string;
  isGoogleUser?: boolean;
  messages: Dictionary['account'];
}) {
  const { refresh } = useSession();
  const [values, setValues] = useState({ name: initialName, password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<ProfileFieldErrors>({});
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit() {
    const parsed = profileUpdateSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: ProfileFieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        const code = issue.message;
        if (field === 'name') {
          fieldErrors.name = code === 'tooLong' ? messages.nameTooLong : messages.required;
        }
        if (field === 'password') {
          fieldErrors.password = messages.passwordMin;
        }
        if (field === 'confirmPassword') {
          fieldErrors.confirmPassword = messages.passwordMismatch;
        }
      }
      setErrors(fieldErrors);
      setSuccess(null);
      return;
    }
    setErrors({});
    setSuccess(null);
    setPending(true);
    try {
      const payload: UpdateProfileRequest = {
        name: parsed.data.name,
        // Google users have no local password: never send one even if a
        // crafted state carried it (their inputs are disabled upstream).
        ...(!isGoogleUser && parsed.data.password.length > 0
          ? { password: parsed.data.password }
          : {}),
      };
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setErrors({ form: messages.updateError });
        return;
      }
      await res.json().catch(() => null);
      setValues((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      setSuccess(messages.updated);
      await refresh();
    } catch {
      setErrors({ form: messages.updateError });
    } finally {
      setPending(false);
    }
  }

  return (
    <ProfileForm
      email={email}
      values={values}
      errors={errors}
      pending={pending}
      success={success}
      passwordDisabled={isGoogleUser}
      messages={{
        emailLabel: messages.emailLabel,
        emailHint: messages.emailHint,
        nameLabel: messages.nameLabel,
        newPasswordLabel: messages.newPasswordLabel,
        newPasswordHint: messages.newPasswordHint,
        googlePasswordHint: messages.googlePasswordHint,
        confirmPasswordLabel: messages.confirmPasswordLabel,
        showPassword: messages.showPassword,
        hidePassword: messages.hidePassword,
        submit: messages.saveAction,
        required: messages.required,
        passwordMin: messages.passwordMin,
        passwordMismatch: messages.passwordMismatch,
        genericError: messages.updateError,
      }}
      onChange={(field, value) => {
        setValues((prev) => ({ ...prev, [field]: value }));
      }}
      onSubmit={() => void handleSubmit()}
    />
  );
}
