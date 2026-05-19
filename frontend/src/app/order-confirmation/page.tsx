import { Metadata } from 'next';
import { OrderConfirmationPageContent } from '@/features/checkout/components/order-confirmation-page-content';

export const metadata: Metadata = {
  title: 'Order Confirmation',
  description: 'Thank you for your order! Your purchase is being processed.'
};

export default function OrderConfirmationPage() {
  return <OrderConfirmationPageContent />;
}
