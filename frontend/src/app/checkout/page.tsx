import { Metadata } from 'next';
import { CheckoutPageContent } from '@/components/checkout/checkout-page-content';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete contact, shipping, payment, and review steps with inline validation.'
};

export default function CheckoutPage() {
  return <CheckoutPageContent />;
}
