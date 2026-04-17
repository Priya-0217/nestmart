export type ProductVariant = {
  id: string;
  name: string;
  color: string;
  colorHex: string;
  size: 'S' | 'M' | 'L' | 'XL' | 'One Size';
  sku: string;
  stock: number;
  price: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  brand: string;
  tag: string;
  rating: number;
  reviewCount: number;
  price: number;
  compareAtPrice: number;
  stock: number;
  images: string[];
  description: string;
  longDescription: string;
  features: string[];
  specs: Record<string, string>;
  variants: ProductVariant[];
};

export type Category = {
  id: string;
  name: string;
  href: string;
  image: string;
  count: number;
};

export type HomeFeature = {
  id: string;
  title: string;
  description: string;
  icon: 'truck' | 'shield' | 'sparkles' | 'refresh';
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
};

export type OrderStatus = 'Delivered' | 'Shipped' | 'Processing' | 'Cancelled';

export type Order = {
  id: string;
  date: string;
  total: number;
  status: OrderStatus;
  itemCount: number;
};

export type Profile = {
  name: string;
  email: string;
  phone: string;
  membership: string;
  defaultAddress: string;
};

export type CartItem = {
  productId: string;
  variantId: string;
  quantity: number;
};

export type CheckoutContact = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export type CheckoutShipping = {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  shippingMethod: 'standard' | 'express';
};

export type CheckoutPayment = {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
};
