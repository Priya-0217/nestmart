'use client';

import { FormEvent, useState } from 'react';
import { AuthFormShell } from '@/features/auth/components/auth-form-shell';
import { AuthLayoutCard } from '@/features/auth/components/auth-layout-card';
import { PasswordStrength } from '@/features/auth/components/password-strength';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';

export function RegisterForm() {
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!values.name.trim()) nextErrors.name = 'Name is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) nextErrors.email = 'Enter a valid email address.';
    if (values.password.length < 8) nextErrors.password = 'Password must be at least 8 characters.';
    if (values.confirmPassword !== values.password) nextErrors.confirmPassword = 'Passwords do not match.';
    setErrors(nextErrors);
  }

  return (
    <AuthLayoutCard title="Create account" subtitle="Join NestMart and save your orders, addresses, and wishlist.">
      <AuthFormShell submitLabel="Register" altText="Already have an account?" altLinkLabel="Login" altLinkHref="/auth/login" onSubmit={onSubmit}>
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
      </AuthFormShell>
    </AuthLayoutCard>
  );
}
