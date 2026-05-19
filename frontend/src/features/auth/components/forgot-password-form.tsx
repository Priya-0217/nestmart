'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthFormShell } from '@/features/auth/components/auth-form-shell';
import { AuthLayoutCard } from '@/features/auth/components/auth-layout-card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      setMessage('');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const normalizedEmail = email.toLowerCase().trim();
      await authApi.forgotPassword({ email: normalizedEmail });
      setMessage('Success! We have sent a password reset link to your email. Please check your inbox (and spam folder).');
      setError('');
      setEmail('');
    } catch (err: any) {
      console.error('Forgot password error:', err);
      if (err.status === 404) {
        setError('No account found with this email. Please check the spelling or create a new account.');
      } else if (err.status === 503) {
        setError('Email service is currently unavailable. Please try again later or contact support.');
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
      setMessage('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayoutCard title="Forgot password" subtitle="Enter your email and we will send reset instructions.">
      <div className="space-y-4">
        {message && (
          <div className="flex items-start gap-3 rounded-xl bg-emerald-500/10 p-4 border border-emerald-500/20">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500 shrink-0" />
            <p className="text-sm font-medium text-emerald-600 leading-relaxed">
              {message}
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-xl bg-rose-500/10 p-4 border border-rose-500/20">
            <AlertCircle className="mt-0.5 h-5 w-5 text-rose-500 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-rose-600 leading-relaxed">
                {error}
              </p>
              {error.includes('No account found') && (
                <Link href="/auth/register" className="block text-xs font-bold text-rose-600 hover:underline">
                  Click here to create a new account
                </Link>
              )}
            </div>
          </div>
        )}

        <AuthFormShell
          submitLabel={submitting ? 'Sending…' : 'Send Reset Link'}
          submitDisabled={submitting}
          altText="Remembered your password?"
          altLinkLabel="Back to login"
          altLinkHref="/auth/login"
          onSubmit={onSubmit}
        >
          <FormField id="forgotEmail" label="Email Address" required>
            <Input 
              id="forgotEmail" 
              type="email" 
              placeholder="name@example.com"
              value={email} 
              onChange={(event) => setEmail(event.target.value)} 
            />
          </FormField>
        </AuthFormShell>
      </div>
    </AuthLayoutCard>
  );
}
