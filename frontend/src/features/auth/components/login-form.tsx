'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { AuthFormShell } from '@/features/auth/components/auth-form-shell';
import { AuthLayoutCard } from '@/features/auth/components/auth-layout-card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError('');
  }

  return (
    <AuthLayoutCard title="Welcome back" subtitle="Sign in to track orders and manage your wishlist.">
      <AuthFormShell submitLabel="Login" altText="New to NestMart?" altLinkLabel="Create account" altLinkHref="/auth/register" onSubmit={onSubmit}>
        <FormField id="loginEmail" label="Email" required error={error.includes('email') ? error : undefined}>
          <Input id="loginEmail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </FormField>
        <FormField id="loginPassword" label="Password" required error={error.includes('Password') ? error : undefined}>
          <Input id="loginPassword" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </FormField>
        <div className="text-right">
          <Link href="/auth/forgot-password" className="text-xs font-semibold text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
      </AuthFormShell>
    </AuthLayoutCard>
  );
}
