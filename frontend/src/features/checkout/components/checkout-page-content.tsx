'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckoutSectionCard } from '@/features/checkout/components/checkout-section-card';
import { CheckoutStepper, checkoutSteps } from '@/features/checkout/components/checkout-stepper';
import { OrderReview } from '@/features/checkout/components/order-review';
import { EmptyState } from '@/components/ui/empty-state';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { RadioGroup } from '@/components/ui/radio-group';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cartApi, ordersApi, productsApi, usersApi, type Address, type CartItem, type CartTotals } from '@/lib/api';
import { CheckoutContact, CheckoutShipping, CompletedOrderLine } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { useCheckoutStore } from '@/store/checkout-store';

import { CreditCard, Banknote, ShieldCheck, Truck, AlertTriangle, Smartphone } from 'lucide-react';
import Script from 'next/script';

const initialContact: CheckoutContact = {
  email: '',
  firstName: '',
  lastName: '',
  phone: ''
};

const initialShipping: CheckoutShipping = {
  address: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
  shippingMethod: 'standard'
};

type ErrorMap = Record<string, string>;

const shippingRates: Record<CheckoutShipping['shippingMethod'], number> = {
  standard: 18,
  express: 35
};

export function CheckoutPageContent() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const setLastCompletedOrder = useCheckoutStore((state) => state.setLastCompletedOrder);
  const removeItem = useCartStore((state) => state.removeItem);
  const syncWithBackend = useCartStore((state) => state.syncWithBackend);
  const applyCouponStore = useCartStore((state) => state.applyCoupon);
  const removeCouponStore = useCartStore((state) => state.removeCoupon);
  const totals = useCartStore((state) => state.totals);

  const [step, setStep] = useState(0);
  const [contact, setContact] = useState<CheckoutContact>(initialContact);
  const [shipping, setShipping] = useState<CheckoutShipping>(initialShipping);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'razorpay'>('cod');
  const [errors, setErrors] = useState<ErrorMap>({});
  const [submitting, setSubmitting] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [primaryAddress1Id, setPrimaryAddress1Id] = useState<string | null>(null);
  const [primaryAddress2Id, setPrimaryAddress2Id] = useState<string | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [serverCart, setServerCart] = useState<{ items: CartItem[]; totals: CartTotals } | null>(null);
  const [fallbackProducts, setFallbackProducts] = useState<Record<string, { title: string; price: number }>>({});
  const [loadingCart, setLoadingCart] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    let active = true;
    const loadCart = async () => {
      setLoadingCart(true);
      try {
        const result = await cartApi.get();
        if (!active) return;
        setServerCart({ items: result.cart.items, totals: result.totals });
      } catch {
        if (active) setServerCart(null);
      } finally {
        if (active) setLoadingCart(false);
      }
    };
    void loadCart();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (serverCart) return;
    if (items.length === 0) return;

    let active = true;
    const loadFallbackProducts = async () => {
      try {
        const productIds = Array.from(new Set(items.map((item) => item.productId)));
        const results = await Promise.all(
          productIds.map(async (productId) => {
            const product = await productsApi.get(productId);
            return {
              productId,
              title: product.title ?? 'Product',
              price: product.price ?? 0
            };
          })
        );
        if (!active) return;
        setFallbackProducts((prev) => {
          const next = { ...prev };
          for (const result of results) {
            next[result.productId] = { title: result.title, price: result.price };
          }
          return next;
        });
      } catch {
        // Ignore fallback lookup failures
      }
    };
    void loadFallbackProducts();
    return () => {
      active = false;
    };
  }, [items, serverCart]);

  const lines: CompletedOrderLine[] = useMemo(() => {
    if (serverCart) {
      return serverCart.items.map((item) => ({
        productId: item.productId,
        variantId: 'default',
        title: item.title,
        variant: 'Standard',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.unitPrice * item.quantity
      }));
    }

    return items
      .map((item) => {
        const product = fallbackProducts[item.productId];
        if (!product) return null;
        return {
          productId: item.productId,
          variantId: 'default',
          title: product.title,
          variant: 'Standard',
          quantity: item.quantity,
          unitPrice: product.price,
          total: product.price * item.quantity
        };
      })
      .filter((line): line is CompletedOrderLine => Boolean(line));
  }, [fallbackProducts, items, serverCart]);

  const subtotal = totals?.subtotal ?? lines.reduce((sum, line) => sum + (line?.total ?? 0), 0);
  const shippingFee = totals?.shipping ?? (lines.length > 0 ? shippingRates[shipping.shippingMethod] : 0);
  const tax = totals?.tax ?? Math.round(subtotal * 0.08);
  const discount = totals?.discount ?? 0;
  const total = totals?.total ?? (subtotal + shippingFee + tax - discount);

  const reviewLines = useMemo(
    () =>
      lines.map((line) => ({
        label: `${line?.title} (${line?.variant}) x ${line?.quantity}`,
        value: formatPrice(line?.total ?? 0)
      })),
    [lines]
  );

  useEffect(() => {
    let active = true;
    const loadAddresses = async () => {
      setLoadingAddresses(true);
      try {
        const result = await usersApi.addresses();
        if (!active) return;
        setSavedAddresses(result.items);
        setPrimaryAddress1Id(result.primaryAddress1Id);
        setPrimaryAddress2Id(result.primaryAddress2Id);

        const defaultChoiceId =
          result.primaryAddress1Id ??
          result.primaryAddress2Id ??
          result.items.find((item) => item.isDefault)?.id ??
          result.items[0]?.id ??
          '';

        if (defaultChoiceId) {
          const selected = result.items.find((item) => item.id === defaultChoiceId);
          if (selected) {
            setSelectedAddressId(selected.id);
            setShipping((prev) => ({
              ...prev,
              address: selected.line1,
              city: selected.city,
              state: selected.state,
              postalCode: selected.postalCode,
              country: selected.country
            }));
          }
        }
      } catch (error) {
        console.error('Failed to load saved addresses', error);
      } finally {
        if (active) setLoadingAddresses(false);
      }
    };
    void loadAddresses();
    return () => {
      active = false;
    };
  }, []);

  function applySelectedAddress(id: string) {
    setSelectedAddressId(id);
    if (!id) return;
    const selected = savedAddresses.find((address) => address.id === id);
    if (!selected) return;
    setShipping((prev) => ({
      ...prev,
      address: selected.line1,
      city: selected.city,
      state: selected.state,
      postalCode: selected.postalCode,
      country: selected.country
    }));
  }

  function updateShippingField<K extends keyof CheckoutShipping>(key: K, value: CheckoutShipping[K]) {
    setShipping((prev) => ({ ...prev, [key]: value }));
    if (selectedAddressId && key !== 'shippingMethod') {
      setSelectedAddressId('');
    }
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    setCouponError('');
    try {
      await applyCouponStore(couponCode);
      setCouponCode('');
    } catch (error) {
      setCouponError(error instanceof Error ? error.message : 'Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  }

  async function handleRemoveCoupon() {
    try {
      await removeCouponStore();
      setCouponCode('');
      setCouponError('');
    } catch (error) {
      console.error('Failed to remove coupon', error);
    }
  }

  function nextStep() {
    const nextErrors = validateStep(step, contact, shipping, selectedAddressId);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setStep((current) => Math.min(current + 1, checkoutSteps.length - 1));
  }

  function prevStep() {
    setErrors({});
    setStep((current) => Math.max(current - 1, 0));
  }

  async function placeOrder() {
    const nextErrors = validateStep(step, contact, shipping, selectedAddressId);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      const order = await ordersApi.create(
        selectedAddressId
          ? {
              paymentMethod: paymentMethod as any,
              shippingAddressId: selectedAddressId
            }
          : {
              paymentMethod: paymentMethod as any,
              shippingAddress: {
                fullName: `${contact.firstName} ${contact.lastName}`,
                phone: contact.phone,
                line1: shipping.address,
                city: shipping.city,
                state: shipping.state,
                postalCode: shipping.postalCode,
                country: shipping.country
              }
            }
      );

      if (paymentMethod === 'razorpay' && order.razorpayOrderId) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: Math.round(order.total * 100),
          currency: order.currency,
          name: 'NestMart',
          description: `Order ${order.orderNumber}`,
          order_id: order.razorpayOrderId,
          handler: async function (response: any) {
            try {
              await ordersApi.verifyRazorpay(order._id, {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              });
              completeOrderSuccess(order);
            } catch (err: any) {
              setErrors({ submit: 'Payment verification failed. Contact support.' });
              setSubmitting(false);
            }
          },
          prefill: {
            name: `${contact.firstName} ${contact.lastName}`,
            email: contact.email,
            contact: contact.phone
          },
          theme: {
            color: '#0f172a'
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setErrors({ submit: 'Payment failed. Please try again.' });
          setSubmitting(false);
        });
        rzp.open();
        return; // Don't complete order yet
      }

      completeOrderSuccess(order);
    } catch (err: any) {
      console.error('Order placement failed:', err);
      let message = 'Failed to place order. Please try again.';
      if (err.message === 'Request validation failed' && err.details) {
        const details = err.details as Record<string, string[]>;
        const fieldErrors = Object.entries(details)
          .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
          .join('; ');
        message = `Validation Error - ${fieldErrors}`;
      } else if (err.message) {
        message = err.message;
      }
      setErrors({ submit: message });
    } finally {
      setSubmitting(false);
    }
  }

  function completeOrderSuccess(order: any) {
    setLastCompletedOrder({
      id: order.orderNumber,
      date: order.placedAt,
      status: 'Processing',
      itemCount: order.items.reduce((sum: number, line: any) => sum + line.quantity, 0),
      contact,
      shipping,
      lines,
      subtotal,
      shippingFee,
      tax,
      total: order.total,
      paymentLast4: paymentMethod === 'cod' ? 'COD' : paymentMethod === 'razorpay' ? 'RZPY' : '4242'
    });

    clearCart();
    router.push('/order-confirmation');
  }


  if (loadingCart) {
    return <EmptyState title="Loading checkout" description="Fetching your cart details." ctaLabel="Back to cart" ctaHref="/cart" />;
  }

  if (lines.length === 0) {
    return <EmptyState title="Checkout is empty" description="Add products to your cart to begin checkout." ctaLabel="Browse Products" ctaHref="/products" />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary/5 p-8 border border-primary/10">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-foreground">Complete Your Purchase</h1>
            <p className="mt-1 text-sm text-foreground/60">Finalize your order in a few simple steps.</p>
            <div className="mt-8">
              <CheckoutStepper currentStep={step} />
            </div>
          </div>
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="space-y-6">
          {step === 0 && (
            <CheckoutSectionCard 
              title="Contact Information" 
              description="We'll use these details to send your order updates."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField id="firstName" label="First Name" required error={errors.firstName}>
                  <Input id="firstName" placeholder="John" value={contact.firstName} onChange={(event) => setContact({ ...contact, firstName: event.target.value })} />
                </FormField>
                <FormField id="lastName" label="Last Name" required error={errors.lastName}>
                  <Input id="lastName" placeholder="Doe" value={contact.lastName} onChange={(event) => setContact({ ...contact, lastName: event.target.value })} />
                </FormField>
                <div className="sm:col-span-2">
                  <FormField id="email" label="Email Address" required error={errors.email}>
                    <Input id="email" type="email" placeholder="john@example.com" value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} />
                  </FormField>
                </div>
                <div className="sm:col-span-2">
                  <FormField id="phone" label="Phone Number" required error={errors.phone}>
                    <Input id="phone" placeholder="+1 (555) 000-0000" value={contact.phone} onChange={(event) => setContact({ ...contact, phone: event.target.value })} />
                  </FormField>
                </div>
              </div>
            </CheckoutSectionCard>
          )}

          {step === 1 && (
            <CheckoutSectionCard 
              title="Shipping Address" 
              description="Tell us where you want your items delivered."
            >
              <div className="grid gap-5">
                <FormField id="savedAddress" label="Saved Addresses">
                  {loadingAddresses ? (
                    <p className="text-sm text-foreground/60">Loading your saved addresses…</p>
                  ) : (
                    <Select id="savedAddress" value={selectedAddressId} onChange={(event) => applySelectedAddress(event.target.value)}>
                      <option value="">Use a new one-time address</option>
                      {savedAddresses.map((address) => {
                        const tags = [
                          address.id === primaryAddress1Id ? 'Primary 1' : null,
                          address.id === primaryAddress2Id ? 'Primary 2' : null,
                          address.isDefault ? 'Default' : null
                        ]
                          .filter(Boolean)
                          .join(' • ');
                        return (
                          <option key={address.id} value={address.id}>
                            {`${address.label ?? 'Address'} — ${address.line1}, ${address.city}${tags ? ` (${tags})` : ''}`}
                          </option>
                        );
                      })}
                    </Select>
                  )}
                </FormField>

                <FormField id="address" label="Street Address" required error={errors.address}>
                  <Input id="address" placeholder="123 Main St, Apt 4B" value={shipping.address} onChange={(event) => updateShippingField('address', event.target.value)} />
                </FormField>

                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField id="city" label="City" required error={errors.city}>
                    <Input id="city" placeholder="New York" value={shipping.city} onChange={(event) => updateShippingField('city', event.target.value)} />
                  </FormField>
                  <FormField id="state" label="State" required error={errors.state}>
                    <Input id="state" placeholder="NY" value={shipping.state} onChange={(event) => updateShippingField('state', event.target.value)} />
                  </FormField>
                  <FormField id="postalCode" label="Postal Code" required error={errors.postalCode}>
                    <Input id="postalCode" placeholder="10001" value={shipping.postalCode} onChange={(event) => updateShippingField('postalCode', event.target.value)} />
                  </FormField>
                  <FormField id="country" label="Country" required error={errors.country}>
                    <Select id="country" value={shipping.country} onChange={(event) => updateShippingField('country', event.target.value)}>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="IN">India</option>
                    </Select>
                  </FormField>
                </div>

                <div className="mt-4">
                  <FormField id="shippingMethod" label="Delivery Speed" required error={errors.shippingMethod}>
                    <RadioGroup
                      name="shippingMethod"
                      value={shipping.shippingMethod}
                      onChange={(value) => updateShippingField('shippingMethod', value as CheckoutShipping['shippingMethod'])}
                      options={[
                        { 
                          value: 'standard', 
                          label: 'Standard Delivery', 
                          description: `3-5 business days • ${formatPrice(shippingRates.standard)}`,
                          icon: <Truck className="h-5 w-5" />
                        },
                        { 
                          value: 'express', 
                          label: 'Express Delivery', 
                          description: `1-2 business days • ${formatPrice(shippingRates.express)}`,
                          icon: <ShieldCheck className="h-5 w-5" />
                        }
                      ]}
                    />
                  </FormField>
                </div>
              </div>
            </CheckoutSectionCard>
          )}

          {step === 2 && (
            <CheckoutSectionCard 
              title="Payment Method" 
              description="Choose how you'd like to pay."
            >
              <div className="grid gap-5">
                <RadioGroup
                  name="paymentMethod"
                  value={paymentMethod}
                  onChange={(value) => setPaymentMethod(value as 'cod' | 'card')}
                  options={[
                    {
                      value: 'cod',
                      label: 'Cash on Delivery (COD)',
                      description: 'Pay when your order arrives.',
                      icon: <Banknote className="h-5 w-5" />
                    },
                    {
                      value: 'card',
                      label: 'Credit / Debit Card',
                      description: 'Safe and secure digital payment.',
                      icon: <CreditCard className="h-5 w-5" />
                    },
                    {
                      value: 'razorpay',
                      label: 'Pay with Razorpay',
                      description: 'UPI, Wallets, NetBanking, and Cards.',
                      icon: <Smartphone className="h-5 w-5" />
                    }
                  ]}
                />
                {paymentMethod === 'card' && (
                  <div className="mt-4 rounded-2xl bg-primary/5 p-4 border border-primary/20 flex gap-3 items-center">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <p className="text-sm font-medium text-primary">
                      Test card enabled: Use 4242 for all fields.
                    </p>
                  </div>
                )}
              </div>
            </CheckoutSectionCard>
          )}

          {step === 3 && (
            <CheckoutSectionCard 
              title="Review & Confirm" 
              description="Double-check everything before placing your order."
            >
              {errors.submit && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl bg-destructive/10 p-4 border border-destructive/20">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
                  <div className="text-sm font-medium text-destructive leading-relaxed">
                    {errors.submit}
                  </div>
                </div>
              )}

              {totals?.coupon && (
                <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl bg-green-50 p-4 border border-green-200 dark:bg-green-950/20 dark:border-green-900/30">
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">Coupon Applied</p>
                    <p className="text-xs text-green-600 dark:text-green-400/70">Code: <span className="font-semibold">{totals.coupon.code}</span> • Saving {formatPrice(totals.discount)}</p>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 underline">Remove</button>
                </div>
              )}

              {!totals?.coupon && (
                <div className="mb-6 space-y-3">
                  <FormField label="Promo Code" required={false}>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError('');
                        }}
                        disabled={couponLoading}
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        size="lg"
                        className="rounded-2xl font-semibold"
                      >
                        {couponLoading ? 'Applying...' : 'Apply'}
                      </Button>
                    </div>
                    {couponError && <p className="text-xs text-destructive mt-1">{couponError}</p>}
                  </FormField>
                </div>
              )}

              <OrderReview
                lines={[
                  { label: 'Contact', value: `${contact.firstName} ${contact.lastName} • ${contact.email}` },
                  { label: 'Ship to', value: `${shipping.address}, ${shipping.city}, ${shipping.state} ${shipping.postalCode}` },
                  { label: 'Shipping', value: shipping.shippingMethod === 'standard' ? 'Standard (3-5 days)' : 'Express (1-2 days)' },
                  { label: 'Payment', value: paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : paymentMethod === 'razorpay' ? 'Razorpay' : 'Credit Card' },
                  ...reviewLines
                ]}
                subtotal={subtotal}
                shipping={shippingFee}
                tax={tax}
                discount={discount}
              />
            </CheckoutSectionCard>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={prevStep} 
            disabled={step === 0} 
            className="h-14 rounded-2xl px-8 font-semibold transition-all hover:bg-muted"
          >
            Back
          </Button>
          {step < checkoutSteps.length - 1 ? (
            <Button 
              size="lg" 
              onClick={nextStep} 
              className="h-14 rounded-2xl px-12 font-bold shadow-xl shadow-primary/20 transition-all hover:translate-y-[-2px] hover:shadow-2xl hover:shadow-primary/30 active:translate-y-[0px]"
            >
              Next: {checkoutSteps[step + 1].title}
            </Button>
          ) : (
            <Button 
              size="lg" 
              onClick={placeOrder} 
              disabled={submitting} 
              className="h-14 rounded-2xl px-12 font-bold shadow-xl shadow-primary/20 transition-all hover:translate-y-[-2px] hover:shadow-2xl hover:shadow-primary/30 active:translate-y-[0px]"
            >
              {submitting ? 'Processing...' : 'Place Order Now'}
            </Button>
          )}
        </div>
      </div>

      <aside className="space-y-6">
        <div className="sticky top-24 overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-muted/30 px-6 py-5">
            <h2 className="text-lg font-bold">Order Summary</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {lines.map((line) => (
                <div key={`${line.productId}-${line.variantId}`} className="flex justify-between gap-4 group">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{line.title}</p>
                    <p className="text-xs text-foreground/50">{line.variant} • Qty {line.quantity}</p>
                  </div>
                  <span className="text-sm font-bold">{formatPrice(line.total)}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 pt-6 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-foreground/60">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground/60">Shipping</span>
                <span className="font-medium">{formatPrice(shippingFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground/60">Estimated Tax</span>
                <span className="font-medium">{formatPrice(tax)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span className="font-medium">Discount</span>
                  <span className="font-semibold">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-4 mt-4">
                <span className="text-lg font-bold text-foreground">Total Due</span>
                <span className="text-2xl font-black text-primary tracking-tight">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-muted/50 p-4 flex gap-3 items-start border border-border/50">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Secure Checkout</p>
                <p className="text-[11px] text-foreground/60 leading-relaxed">
                  Your payment data is encrypted with bank-level security.
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function validateStep(step: number, contact: CheckoutContact, shipping: CheckoutShipping, selectedAddressId?: string) {
  if (step === 0) {
    return validateContact(contact);
  }
  if (step === 1) {
    return validateShipping(shipping, selectedAddressId);
  }
  return {};
}

function validateContact(values: CheckoutContact): ErrorMap {
  const next: ErrorMap = {};
  if (!values.firstName.trim()) next.firstName = 'First name is required.';
  if (!values.lastName.trim()) next.lastName = 'Last name is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'Enter a valid email address.';
  if (!/^[+()\-.\d\s]{8,}$/.test(values.phone)) next.phone = 'Enter a valid phone number.';
  return next;
}

function validateShipping(values: CheckoutShipping, selectedAddressId?: string): ErrorMap {
  const next: ErrorMap = {};
  if (!values.shippingMethod) next.shippingMethod = 'Select a shipping method.';
  if (selectedAddressId) return next;
  if (!values.address.trim()) next.address = 'Address is required.';
  if (!values.city.trim()) next.city = 'City is required.';
  if (!values.state.trim()) next.state = 'State is required.';
  if (!/^[A-Za-z0-9\-\s]{4,10}$/.test(values.postalCode)) next.postalCode = 'Enter a valid postal code.';
  if (!values.country.trim()) next.country = 'Country is required.';
  return next;
}
