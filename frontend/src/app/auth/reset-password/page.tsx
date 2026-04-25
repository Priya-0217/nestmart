import { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Choose a new password for your NestMart account.'
};

export default function ResetPasswordPage() {
  return (
    <div className="py-6 sm:py-10">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
