'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthFormShell } from '@/features/auth/components/auth-form-shell';
import { AuthLayoutCard } from '@/features/auth/components/auth-layout-card';
import { PasswordStrength } from '@/features/auth/components/password-strength';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { authApi, ApiFetchError } from '@/lib/api';

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setErrors({ form: 'Reset link is missing or invalid.' });
      return;
    }
    const next: Record<string, string> = {};
    if (password.length < 8) next.password = 'Password must be at least 8 characters.';
    if (password !== confirm) next.confirm = 'Passwords do not match.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await authApi.resetPassword({ token, password });
      setDone(true);
      setTimeout(() => router.push('/auth/login'), 1500);
    } catch (err) {
      setErrors({ form: err instanceof ApiFetchError ? err.message : 'Reset failed.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <AuthLayoutCard title="Password updated" subtitle="Redirecting you to login…">
        <p className="text-sm text-foreground/65">You can now sign in with your new password.</p>
      </AuthLayoutCard>
    );
  }

  return (
    <AuthLayoutCard title="Reset password" subtitle="Choose a new password for your account.">
      <AuthFormShell
        submitLabel={submitting ? 'Updating…' : 'Update password'}
        submitDisabled={submitting}
        altText="Remembered it?"
        altLinkLabel="Back to login"
        altLinkHref="/auth/login"
        onSubmit={onSubmit}
      >
        <FormField id="resetPassword" label="New password" required error={errors.password}>
          <Input id="resetPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormField>
        <PasswordStrength password={password} />
        <FormField id="resetConfirm" label="Confirm password" required error={errors.confirm}>
          <Input id="resetConfirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </FormField>
        {errors.form ? <p className="text-sm text-rose-600">{errors.form}</p> : null}
      </AuthFormShell>
    </AuthLayoutCard>
  );
}
