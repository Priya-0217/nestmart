'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthFormShell } from '@/features/auth/components/auth-form-shell';
import { AuthLayoutCard } from '@/features/auth/components/auth-layout-card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') ?? '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Please enter a valid email address.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');

    setSubmitting(true);
    const res = await signIn('credentials', { email, password, redirect: false, callbackUrl });
    setSubmitting(false);
    if (res?.error || !res?.ok) {
      setError('Invalid credentials. Please try again.');
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <AuthLayoutCard title="Welcome back" subtitle="Sign in to track orders and manage your wishlist.">
      <AuthFormShell submitLabel={submitting ? 'Signing in…' : 'Login'} submitDisabled={submitting} altText="New to NestMart?" altLinkLabel="Create account" altLinkHref="/auth/register" onSubmit={onSubmit}>
        <FormField id="loginEmail" label="Email" required error={error.includes('email') ? error : undefined}>
          <Input id="loginEmail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </FormField>
        <FormField id="loginPassword" label="Password" required error={error.includes('Password') || error.includes('credentials') ? error : undefined}>
          <Input id="loginPassword" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </FormField>
        <div className="text-right">
          <Link href="/auth/forgot-password" className="text-xs font-semibold text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
      </AuthFormShell>
      <div className="my-4 flex items-center gap-3 text-xs text-foreground/50">
        <span className="h-px flex-1 bg-foreground/10" />
        or
        <span className="h-px flex-1 bg-foreground/10" />
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => signIn('google', { callbackUrl })}
      >
        Continue with Google
      </Button>
    </AuthLayoutCard>
  );
}
