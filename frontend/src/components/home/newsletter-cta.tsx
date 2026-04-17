'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function NewsletterCta() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      return;
    }

    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 2500);
  }

  return (
    <section className="rounded-3xl bg-mesh p-6 sm:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Stay Updated</p>
          <h2 className="mt-1 text-2xl font-semibold text-foreground sm:text-3xl">Sign up for weekly style drops and exclusive offers.</h2>
        </div>
        <form onSubmit={onSubmit} className="w-full max-w-xl space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" className="rounded-full bg-white/90" />
            <Button size="lg" className="sm:w-auto">
              Subscribe
            </Button>
          </div>
          <p className="text-xs text-foreground/65">{submitted ? 'Thanks! You are in.' : 'No spam, unsubscribe anytime.'}</p>
        </form>
      </div>
    </section>
  );
}
