'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToastStore } from '@/store/toast-store';

export function NewsletterCta() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const pushToast = useToastStore((state) => state.push);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setSubmitting(true);
    window.setTimeout(() => {
      pushToast(`You're subscribed — we'll send style drops to ${trimmed}.`, 'success');
      setEmail('');
      setSubmitting(false);
    }, 300);
  }

  return (
    <section className="relative overflow-hidden rounded-3xl bg-primary p-8 sm:p-10">
      <div aria-hidden="true" className="pointer-events-none absolute -top-12 -right-12 h-56 w-56 rounded-full bg-primary/25 blur-3xl" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Stay Updated</p>
          <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Sign up for weekly style drops and exclusive offers.</h2>
        </div>
        <form onSubmit={onSubmit} className="w-full max-w-xl space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" className="rounded-full !bg-black/20 !border-black/30 text-white placeholder:text-white/60" />
            <Button type="submit" size="lg" className="sm:w-auto" disabled={submitting}>
              {submitting ? 'Subscribing…' : 'Subscribe'}
            </Button>
          </div>
          <p className="text-xs text-white/60">No spam, unsubscribe anytime.</p>
        </form>
      </div>
    </section>
  );
}
