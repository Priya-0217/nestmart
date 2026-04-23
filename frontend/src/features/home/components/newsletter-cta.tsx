'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function NewsletterCta() {
  const [email, setEmail] = useState('');

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      return;
    }

    const subject = encodeURIComponent('Newsletter Subscription Request');
    const body = encodeURIComponent(`Please add this email to the newsletter list: ${email.trim()}`);
    window.location.href = `mailto:nestmartdemo@mailinator.com?subject=${subject}&body=${body}`;
    setEmail('');
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
            <Button size="lg" className="sm:w-auto">
              Subscribe
            </Button>
          </div>
          <p className="text-xs text-white/60">No spam, unsubscribe anytime.</p>
        </form>
      </div>
    </section>
  );
}
