import { Metadata } from 'next';
import { OrderConfirmationPageContent } from '@/features/checkout/components/order-confirmation-page-content';

export const metadata: Metadata = {
  title: 'Order Confirmation',
  description: 'Review your completed order, delivery details, and next steps after checkout.'
};

export default function OrderConfirmationPage() {
  return <OrderConfirmationPageContent />;
}
