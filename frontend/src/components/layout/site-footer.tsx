import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SiteFooter() {
  return (
    <footer className="mt-14 border-t border-border bg-card">
      <Container className="space-y-8 py-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h3 className="font-display text-2xl font-semibold">Design-led essentials for modern homes.</h3>
            <p className="mt-2 text-sm text-foreground/65">
              NestMart curates furniture, decor, and everyday pieces that balance utility, warmth, and long-term quality.
            </p>
            <div className="mt-4 flex gap-2">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, idx) => (
                <button key={idx} className="icon-button focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground/70 hover:bg-muted">
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
          <FooterColumn
            title="Shop"
            links={[
              { href: '/products', label: 'All Products' },
              { href: '/products?category=Living%20Room', label: 'Living Room' },
              { href: '/products?category=Kitchen', label: 'Kitchen' },
              { href: '/products?category=Decor', label: 'Decor' }
            ]}
          />
          <FooterColumn
            title="Account"
            links={[
              { href: '/account', label: 'Dashboard' },
              { href: '/auth/login', label: 'Login' },
              { href: '/auth/register', label: 'Create Account' },
              { href: '/cart', label: 'Cart' }
            ]}
          />
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/75">Newsletter</h4>
            <p className="mb-3 text-sm text-foreground/65">Get product launches and seasonal savings.</p>
            <form className="space-y-2">
              <Input type="email" placeholder="you@example.com" />
              <Button className="w-full">Subscribe</Button>
            </form>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-xs text-foreground/55">
          <p>© {new Date().getFullYear()} NestMart. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <Link href="/products" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/products" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/products" className="hover:text-foreground">
              Shipping
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: Array<{ href: string; label: string }> }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/75">{title}</h4>
      <ul className="space-y-2 text-sm">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link href={link.href} className="text-foreground/65 hover:text-foreground">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
