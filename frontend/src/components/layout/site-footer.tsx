import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import { Container } from '@/components/layout/container';

const socialLinks = [
  { label: 'Facebook', href: 'https://facebook.com', icon: Facebook },
  { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
  { label: 'Twitter', href: 'https://x.com', icon: Twitter },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
  { label: 'YouTube', href: 'https://youtube.com', icon: Youtube }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <Container className="py-14 sm:py-16 md:py-20">

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-14">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" aria-label="NestMart Home" className="inline-block transition-opacity hover:opacity-80">
              <span className="font-display text-2xl font-bold tracking-tight text-foreground">NestMart</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-foreground/55">
              Curated furniture, decor, and home essentials — crafted for modern living with lasting quality.
            </p>
            <div className="mt-6 flex items-center gap-2.5">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground/45 transition-all duration-200 hover:border-foreground/25 hover:bg-foreground hover:text-background"
                >
                  <Icon className="h-[15px] w-[15px] transition-transform duration-200 group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <FooterColumn
            title="Shop"
            links={[
              { href: '/products', label: 'All Products' },
              { href: '/products?category=Living%20Room', label: 'Living Room' },
              { href: '/products?category=Kitchen', label: 'Kitchen' },
              { href: '/products?category=Bedroom', label: 'Bedroom' },
              { href: '/products?category=Decor', label: 'Decor' }
            ]}
          />

          {/* Account */}
          <FooterColumn
            title="Account"
            links={[
              { href: '/account', label: 'Dashboard' },
              { href: '/auth/login', label: 'Login' },
              { href: '/auth/register', label: 'Create Account' },
              { href: '/cart', label: 'Cart' }
            ]}
          />

          {/* Newsletter card */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="rounded-2xl border border-border bg-muted/50 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground/40">Newsletter</p>
              <h4 className="mt-1 text-base font-semibold text-foreground">Stay in the loop.</h4>
              <p className="mt-1.5 text-sm leading-snug text-foreground/55">
                Product launches, style guides, and seasonal savings — straight to your inbox.
              </p>
              <form
                className="mt-5 space-y-2.5"
                action="https://formsubmit.co/nestmartdemo@mailinator.com"
                method="POST"
                target="_blank"
              >
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-foreground/35 outline-none ring-offset-background transition focus:ring-2 focus:ring-secondary/60"
                />
                <input type="hidden" name="source" value="nestmart-footer-newsletter" />
                <input type="hidden" name="_subject" value="New NestMart newsletter signup" />
                <input type="hidden" name="_captcha" value="false" />
                <button
                  type="submit"
                  className="h-11 w-full rounded-xl bg-foreground text-sm font-semibold text-background transition-all duration-150 hover:opacity-85 active:scale-[0.985]"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-xs text-foreground/40">
          <p>© {new Date().getFullYear()} NestMart. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/products" className="transition-colors duration-150 hover:text-foreground/70">Terms</Link>
            <Link href="/products" className="transition-colors duration-150 hover:text-foreground/70">Privacy</Link>
            <Link href="/products" className="transition-colors duration-150 hover:text-foreground/70">Shipping</Link>
          </div>
        </div>

      </Container>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: Array<{ href: string; label: string }> }) {
  return (
    <div>
      <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-widest text-foreground/40">{title}</h4>
      <ul className="space-y-3.5">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="group inline-block text-sm text-foreground/60 transition-colors duration-150 hover:text-foreground"
            >
              <span className="relative after:absolute after:-bottom-px after:left-0 after:h-px after:w-0 after:bg-current after:transition-all after:duration-200 group-hover:after:w-full">
                {link.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
