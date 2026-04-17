import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your NestMart account.'
};

export default function LoginPage() {
  return (
    <div className="py-6 sm:py-10">
      <LoginForm />
    </div>
  );
}
