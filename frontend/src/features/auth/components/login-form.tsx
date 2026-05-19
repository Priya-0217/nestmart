'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { AuthFormShell } from '@/features/auth/components/auth-form-shell';
import { AuthLayoutCard } from '@/features/auth/components/auth-layout-card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api';

export function LoginForm() {
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') ?? '/';
  const oauthError = params.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);

  useEffect(() => {
    if (!oauthError) return;
    if (oauthError === 'OAuthAccountNotLinked') {
      setError('This Google account is already linked to another sign-in method.');
      return;
    }
    if (oauthError === 'AccessDenied') {
      setError('Google sign-in was not completed. Please register or try again.');
      return;
    }
    
    // Check if the error is a specific message from our backend
    if (oauthError.length > 0 && oauthError !== 'Error') {
      setError(oauthError);
    } else {
      setError('Google sign-in failed. Please try again.');
    }
  }, [oauthError]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setOtpMessage('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Please enter a valid email address.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');

    setSubmitting(true);
    
    try {
      // 1. Call backend login directly to ensure cookies are set in the browser
      await authApi.login({ email, password });
      
      // 2. Call next-auth signIn to establish frontend session
      const res = await signIn('credentials', { email, password, redirect: false, callbackUrl });
      
      if (res?.error || !res?.ok) {
        setSubmitting(false);
        const nextError = res?.error === 'CredentialsSignin' ? 'Invalid credentials. Please try again.' : res?.error ?? 'Unable to sign in.';
        setError(nextError);
        return;
      }
      window.location.href = res.url ?? callbackUrl;
    } catch (err: any) {
      setSubmitting(false);
      setError(err?.message || 'Unable to sign in. Please check your credentials.');
    }
  }

  async function handleResendOtp() {
    if (!email) {
      setOtpMessage('Enter your email above to resend the verification code.');
      return;
    }
    setSendingOtp(true);
    setOtpMessage('');
    try {
      await authApi.resendOtp({ email });
      setOtpMessage('Verification code sent. Check your email inbox.');
    } catch (err: any) {
      setOtpMessage(err?.message || 'Unable to resend verification code.');
    } finally {
      setSendingOtp(false);
    }
  }

  return (
    <AuthLayoutCard mode="login" title="Welcome back" subtitle="Sign in to track orders and manage your wishlist.">
      <AuthFormShell submitLabel={submitting ? 'Signing in…' : 'Login'} submitDisabled={submitting} altText="New to NestMart?" altLinkLabel="Create account" altLinkHref="/auth/register" onSubmit={onSubmit}>
        <FormField id="loginEmail" label="Email" required error={error.includes('email') ? error : undefined}>
          <Input id="loginEmail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </FormField>
        <FormField id="loginPassword" label="Password" required error={error.includes('Password') || error.toLowerCase().includes('credential') ? error : undefined}>
          <Input id="loginPassword" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </FormField>
        {error && !error.includes('Password') && !error.includes('email') ? (
          <p className="text-sm font-medium text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100">{error}</p>
        ) : null}
        {error.toLowerCase().includes('verify your email') ? (
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <button type="button" className="font-semibold text-primary hover:underline" disabled={sendingOtp} onClick={handleResendOtp}>
              {sendingOtp ? 'Sending code...' : 'Resend verification code'}
            </button>
            {otpMessage ? <span className="text-foreground/60">{otpMessage}</span> : null}
          </div>
        ) : null}
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
        onClick={() => {
          console.log('Setting auth_intent=login and starting Google sign-in');
          document.cookie = 'auth_intent=login; path=/; max-age=300; SameSite=Lax';
          signIn('google', { callbackUrl });
        }}
      >
        Continue with Google
      </Button>
    </AuthLayoutCard>
  );
}
