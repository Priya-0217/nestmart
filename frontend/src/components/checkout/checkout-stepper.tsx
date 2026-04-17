import { ProgressSteps } from '@/components/ui/progress-steps';

export const checkoutSteps = [
  { id: 'contact', title: 'Contact' },
  { id: 'shipping', title: 'Shipping' },
  { id: 'payment', title: 'Payment' },
  { id: 'review', title: 'Review' }
];

export function CheckoutStepper({ currentStep }: { currentStep: number }) {
  return <ProgressSteps steps={checkoutSteps} currentStep={currentStep} />;
}
