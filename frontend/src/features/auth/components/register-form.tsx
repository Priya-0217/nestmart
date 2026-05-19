'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { AuthFormShell } from '@/features/auth/components/auth-form-shell';
import { AuthLayoutCard } from '@/features/auth/components/auth-layout-card';
import { PasswordStrength } from '@/features/auth/components/password-strength';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { authApi, ApiFetchError } from '@/lib/api';

type Stage = 'form' | 'otp';

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stage, setStage] = useState<Stage>('form');
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [otp, setOtp] = useState('');

  const oauthError = searchParams?.get('error');

  useEffect(() => {
    if (!oauthError) return;
    if (oauthError === 'OAuthAccountNotLinked') {
      setErrors({ form: 'This Google account is already linked to another sign-in method.' });
      return;
    }
    if (oauthError === 'AccessDenied') {
      setErrors({ form: 'Google sign-in was not completed. Please try again.' });
      return;
    }
    setErrors({ form: oauthError.length > 0 && oauthError !== 'Error' ? oauthError : 'Google sign-in failed. Please try again.' });
  }, [oauthError]);

  async function onSubmitRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!values.name.trim()) next.name = 'Name is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'Enter a valid email address.';
    if (values.password.length < 8) next.password = 'Password must be at least 8 characters.';
    if (values.confirmPassword !== values.password) next.confirmPassword = 'Passwords do not match.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await authApi.register({ name: values.name, email: values.email, password: values.password });
      setStage('otp');
    } catch (err) {
      if (err instanceof ApiFetchError && err.status === 409) {
        setErrors({ email: 'This email is already registered.' });
      } else {
        setErrors({ form: err instanceof Error ? err.message : 'Registration failed.' });
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function onSubmitOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setErrors({ otp: 'Enter the 6-digit code.' });
      return;
    }
    setSubmitting(true);
    try {
      await authApi.verifyOtp({ email: values.email, otp });
      await signIn('credentials', {
        email: values.email,
        password: values.password,
        callbackUrl: '/'
      });
    } catch (err) {
      setErrors({ otp: err instanceof ApiFetchError ? err.message : 'Verification failed.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (stage === 'otp') {
    return (
      <AuthLayoutCard
        mode="register"
        title="Verify your email"
        subtitle={`We've sent a 6-digit code to ${values.email}. It expires in 10 minutes.`}
      >
        <form className="space-y-4" onSubmit={onSubmitOtp}>
          <FormField id="otpCode" label="Verification code" required error={errors.otp}>
            <Input
              id="otpCode"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
          </FormField>
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? 'Verifying…' : 'Verify and continue'}
          </Button>
        </form>
      </AuthLayoutCard>
    );
  }

  return (
    <AuthLayoutCard mode="register" title="Create account" subtitle="Join NestMart and save your orders, addresses, and wishlist.">
      <AuthFormShell
        submitLabel={submitting ? 'Creating…' : 'Register'}
        submitDisabled={submitting}
        altText="Already have an account?"
        altLinkLabel="Login"
        altLinkHref="/auth/login"
        onSubmit={onSubmitRegister}
      >
        <FormField id="registerName" label="Full Name" required error={errors.name}>
          <Input id="registerName" value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} />
        </FormField>
        <FormField id="registerEmail" label="Email" required error={errors.email}>
          <Input id="registerEmail" type="email" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} />
        </FormField>
        <FormField id="registerPassword" label="Password" required error={errors.password}>
          <Input id="registerPassword" type="password" value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} />
        </FormField>
        <PasswordStrength password={values.password} />
        <FormField id="registerConfirmPassword" label="Confirm Password" required error={errors.confirmPassword}>
          <Input
            id="registerConfirmPassword"
            type="password"
            value={values.confirmPassword}
            onChange={(event) => setValues({ ...values, confirmPassword: event.target.value })}
          />
        </FormField>
        {errors.form ? <p className="text-sm text-rose-600">{errors.form}</p> : null}
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
          console.log('Setting auth_intent=register and starting Google sign-in');
          document.cookie = 'auth_intent=register; path=/; max-age=300; SameSite=Lax';
          signIn('google', { callbackUrl: '/' });
        }}
      >
        Continue with Google
      </Button>
    </AuthLayoutCard>
  );
}
