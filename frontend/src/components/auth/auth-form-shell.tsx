import { FormEvent, ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type AuthFormShellProps = {
  children: ReactNode;
  submitLabel: string;
  submitDisabled?: boolean;
  altText: string;
  altLinkLabel: string;
  altLinkHref: string;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
};

export function AuthFormShell({ children, submitLabel, submitDisabled, altText, altLinkLabel, altLinkHref, onSubmit }: AuthFormShellProps) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {children}
      <Button type="submit" size="lg" className="w-full" disabled={submitDisabled}>
        {submitLabel}
      </Button>
      <p className="text-center text-sm text-foreground/65">
        {altText}{' '}
        <Link href={altLinkHref} className="font-semibold text-primary hover:underline">
          {altLinkLabel}
        </Link>
      </p>
    </form>
  );
}
