import { Metadata } from 'next';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your NestMart account password.'
};

export default function ForgotPasswordPage() {
  return (
    <div className="py-6 sm:py-10">
      <ForgotPasswordForm />
    </div>
  );
}
