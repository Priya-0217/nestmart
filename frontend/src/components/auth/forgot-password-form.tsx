'use client';

import { FormEvent, useState } from 'react';
import { AuthFormShell } from '@/components/auth/auth-form-shell';
import { AuthLayoutCard } from '@/components/auth/auth-layout-card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      setMessage('');
      return;
    }
    setError('');
    setMessage('Reset instructions have been sent if an account exists for this email.');
    setEmail('');
  }

  return (
    <AuthLayoutCard title="Forgot password" subtitle="Enter your email and we will send reset instructions.">
      <AuthFormShell submitLabel="Send Reset Link" altText="Remembered your password?" altLinkLabel="Back to login" altLinkHref="/auth/login" onSubmit={onSubmit}>
        <FormField id="forgotEmail" label="Email" required error={error} hint={message || 'Use the email associated with your account.'}>
          <Input id="forgotEmail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </FormField>
      </AuthFormShell>
    </AuthLayoutCard>
  );
}
