import { Metadata } from 'next';
import { CartPageContent } from '@/components/cart/cart-page-content';

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Review selected products, update quantity, and continue to checkout.'
};

export default function CartPage() {
  return <CartPageContent />;
}
