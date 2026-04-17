'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { CheckoutSectionCard } from '@/components/checkout/checkout-section-card';
import { CheckoutStepper, checkoutSteps } from '@/components/checkout/checkout-stepper';
import { OrderReview } from '@/components/checkout/order-review';
import { EmptyState } from '@/components/ui/empty-state';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { RadioGroup } from '@/components/ui/radio-group';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getProductById, shippingRates } from '@/data/catalog';
import { CheckoutContact, CheckoutPayment, CheckoutShipping } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';

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
  country: 'United States',
  shippingMethod: 'standard'
};

const initialPayment: CheckoutPayment = {
  cardName: '',
  cardNumber: '',
  expiry: '',
  cvv: ''
};

type ErrorMap = Record<string, string>;

export function CheckoutPageContent() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [step, setStep] = useState(0);
  const [contact, setContact] = useState<CheckoutContact>(initialContact);
  const [shipping, setShipping] = useState<CheckoutShipping>(initialShipping);
  const [payment, setPayment] = useState<CheckoutPayment>(initialPayment);
  const [errors, setErrors] = useState<ErrorMap>({});
  const [success, setSuccess] = useState(false);

  const lines = items
    .map((item) => {
      const product = getProductById(item.productId);
      const variant = product?.variants.find((option) => option.id === item.variantId);
      if (!product || !variant) {
        return null;
      }
      return {
        title: product.name,
        variant: variant.name,
        quantity: item.quantity,
        total: variant.price * item.quantity
      };
    })
    .filter(Boolean);

  const subtotal = lines.reduce((sum, line) => sum + (line?.total ?? 0), 0);
  const shippingFee = lines.length > 0 ? shippingRates[shipping.shippingMethod] : 0;
  const tax = Math.round(subtotal * 0.08);

  const reviewLines = useMemo(
    () =>
      lines.map((line) => ({
        label: `${line?.title} (${line?.variant}) x ${line?.quantity}`,
        value: formatPrice(line?.total ?? 0)
      })),
    [lines]
  );

  function nextStep() {
    const nextErrors = validateStep(step, contact, shipping, payment);
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

  function placeOrder() {
    const nextErrors = validateStep(2, contact, shipping, payment);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStep(2);
      return;
    }

    clearCart();
    setSuccess(true);
  }

  if (success) {
    return (
      <EmptyState
        title="Order placed successfully"
        description="A confirmation email is on the way. You can track this order from your account dashboard."
        ctaLabel="Go to Account"
        ctaHref="/account"
        icon={<CheckCircle2 className="h-8 w-8" />}
      />
    );
  }

  if (lines.length === 0) {
    return <EmptyState title="Checkout is empty" description="Add products to your cart to begin checkout." ctaLabel="Browse Products" ctaHref="/products" />;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr),350px]">
      <div className="space-y-4">
        <CheckoutSectionCard title="Checkout Flow" description="All steps include inline validation before moving forward.">
          <CheckoutStepper currentStep={step} />
        </CheckoutSectionCard>

        {step === 0 ? (
          <CheckoutSectionCard title="Contact Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="firstName" label="First Name" required error={errors.firstName}>
                <Input id="firstName" value={contact.firstName} onChange={(event) => setContact({ ...contact, firstName: event.target.value })} />
              </FormField>
              <FormField id="lastName" label="Last Name" required error={errors.lastName}>
                <Input id="lastName" value={contact.lastName} onChange={(event) => setContact({ ...contact, lastName: event.target.value })} />
              </FormField>
              <FormField id="email" label="Email" required error={errors.email}>
                <Input id="email" type="email" value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} />
              </FormField>
              <FormField id="phone" label="Phone" required error={errors.phone}>
                <Input id="phone" value={contact.phone} onChange={(event) => setContact({ ...contact, phone: event.target.value })} />
              </FormField>
            </div>
          </CheckoutSectionCard>
        ) : null}

        {step === 1 ? (
          <CheckoutSectionCard title="Shipping Address">
            <div className="grid gap-4">
              <FormField id="address" label="Street Address" required error={errors.address}>
                <Input id="address" value={shipping.address} onChange={(event) => setShipping({ ...shipping, address: event.target.value })} />
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="city" label="City" required error={errors.city}>
                  <Input id="city" value={shipping.city} onChange={(event) => setShipping({ ...shipping, city: event.target.value })} />
                </FormField>
                <FormField id="state" label="State" required error={errors.state}>
                  <Input id="state" value={shipping.state} onChange={(event) => setShipping({ ...shipping, state: event.target.value })} />
                </FormField>
                <FormField id="postalCode" label="Postal Code" required error={errors.postalCode}>
                  <Input id="postalCode" value={shipping.postalCode} onChange={(event) => setShipping({ ...shipping, postalCode: event.target.value })} />
                </FormField>
                <FormField id="country" label="Country" required error={errors.country}>
                  <Select id="country" value={shipping.country} onChange={(event) => setShipping({ ...shipping, country: event.target.value })}>
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                    <option>India</option>
                  </Select>
                </FormField>
              </div>

              <FormField id="shippingMethod" label="Shipping Method" required error={errors.shippingMethod}>
                <RadioGroup
                  name="shippingMethod"
                  value={shipping.shippingMethod}
                  onChange={(value) => setShipping({ ...shipping, shippingMethod: value as CheckoutShipping['shippingMethod'] })}
                  options={[
                    { value: 'standard', label: 'Standard (3-5 days)', description: formatPrice(shippingRates.standard) },
                    { value: 'express', label: 'Express (1-2 days)', description: formatPrice(shippingRates.express) }
                  ]}
                />
              </FormField>
            </div>
          </CheckoutSectionCard>
        ) : null}

        {step === 2 ? (
          <CheckoutSectionCard title="Payment">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="cardName" label="Cardholder Name" required error={errors.cardName}>
                <Input id="cardName" value={payment.cardName} onChange={(event) => setPayment({ ...payment, cardName: event.target.value })} />
              </FormField>
              <FormField id="cardNumber" label="Card Number" required error={errors.cardNumber}>
                <Input
                  id="cardNumber"
                  inputMode="numeric"
                  maxLength={19}
                  value={payment.cardNumber}
                  onChange={(event) => setPayment({ ...payment, cardNumber: event.target.value })}
                  placeholder="1234 5678 9012 3456"
                />
              </FormField>
              <FormField id="expiry" label="Expiry (MM/YY)" required error={errors.expiry}>
                <Input id="expiry" value={payment.expiry} onChange={(event) => setPayment({ ...payment, expiry: event.target.value })} placeholder="09/28" />
              </FormField>
              <FormField id="cvv" label="CVV" required error={errors.cvv}>
                <Input id="cvv" inputMode="numeric" maxLength={4} value={payment.cvv} onChange={(event) => setPayment({ ...payment, cvv: event.target.value })} />
              </FormField>
            </div>
          </CheckoutSectionCard>
        ) : null}

        {step === 3 ? (
          <CheckoutSectionCard title="Review & Place Order" description="Confirm details below before submitting your order.">
            <OrderReview
              lines={[
                { label: 'Contact', value: `${contact.firstName} ${contact.lastName} • ${contact.email}` },
                { label: 'Ship to', value: `${shipping.address}, ${shipping.city}, ${shipping.state} ${shipping.postalCode}` },
                { label: 'Shipping', value: shipping.shippingMethod === 'standard' ? 'Standard (3-5 days)' : 'Express (1-2 days)' },
                ...reviewLines
              ]}
              subtotal={subtotal}
              shipping={shippingFee}
              tax={tax}
            />
          </CheckoutSectionCard>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="outline" onClick={prevStep} disabled={step === 0}>
            Previous
          </Button>
          {step < checkoutSteps.length - 1 ? (
            <Button onClick={nextStep}>Next Step</Button>
          ) : (
            <Button onClick={placeOrder}>Place Order</Button>
          )}
        </div>
      </div>

      <aside className="surface h-fit space-y-3 p-5">
        <h2 className="text-lg font-semibold">Order Snapshot</h2>
        <div className="space-y-2 text-sm">
          {reviewLines.map((line) => (
            <p key={line.label} className="flex justify-between gap-2">
              <span className="line-clamp-1 text-foreground/75">{line.label}</span>
              <span>{line.value}</span>
            </p>
          ))}
          <p className="flex justify-between border-t border-border pt-2 font-semibold">
            <span>Total</span>
            <span>{formatPrice(subtotal + shippingFee + tax)}</span>
          </p>
        </div>
      </aside>
    </div>
  );
}

function validateStep(step: number, contact: CheckoutContact, shipping: CheckoutShipping, payment: CheckoutPayment) {
  if (step === 0) {
    return validateContact(contact);
  }
  if (step === 1) {
    return validateShipping(shipping);
  }
  if (step === 2) {
    return validatePayment(payment);
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

function validateShipping(values: CheckoutShipping): ErrorMap {
  const next: ErrorMap = {};
  if (!values.address.trim()) next.address = 'Address is required.';
  if (!values.city.trim()) next.city = 'City is required.';
  if (!values.state.trim()) next.state = 'State is required.';
  if (!/^[A-Za-z0-9\-\s]{4,10}$/.test(values.postalCode)) next.postalCode = 'Enter a valid postal code.';
  if (!values.country.trim()) next.country = 'Country is required.';
  if (!values.shippingMethod) next.shippingMethod = 'Select a shipping method.';
  return next;
}

function validatePayment(values: CheckoutPayment): ErrorMap {
  const next: ErrorMap = {};
  const cleanCard = values.cardNumber.replace(/\s/g, '');
  if (!values.cardName.trim()) next.cardName = 'Cardholder name is required.';
  if (!/^\d{15,16}$/.test(cleanCard)) next.cardNumber = 'Enter a valid card number.';
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(values.expiry)) next.expiry = 'Use MM/YY format.';
  if (!/^\d{3,4}$/.test(values.cvv)) next.cvv = 'Enter a valid CVV.';
  return next;
}
