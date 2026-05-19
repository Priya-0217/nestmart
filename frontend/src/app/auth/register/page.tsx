import { Metadata } from 'next';
import { RegisterForm } from '@/features/auth/components/register-form';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create your NestMart account.'
};

export default function RegisterPage() {
  return (
    <div className="py-6 sm:py-10">
      <RegisterForm />
    </div>
  );
}
