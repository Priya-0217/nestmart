'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Menu,
  Search,
  ShoppingCart,
  Star,
  User,
  X,
  Home,
  Package,
  Truck,
  ShieldCheck,
  RotateCcw,
  Facebook,
  Instagram,
  Twitter,
  Linkedin
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { formatPrice } from '@/lib/utils';

type Slide = {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
};

type ItemCard = {
  id: number;
  title: string;
  image: string;
  href: string;
};

type Product = {
  id: number;
  title: string;
  price: number;
  rating: number;
  image: string;
};

const slides: Slide[] = [
  { id: 1, title: 'Build your dream home', subtitle: 'Up to 40% off', cta: 'Shop Now', image: 'https://picsum.photos/1200/500?random=11' },
  { id: 2, title: 'Kitchen Essentials', subtitle: 'Free shipping', cta: 'Explore', image: 'https://picsum.photos/1200/500?random=12' },
  { id: 3, title: 'Bedroom Comfort', subtitle: 'Limited time', cta: 'View Deals', image: 'https://picsum.photos/1200/500?random=13' }
];

const categories: ItemCard[] = [
  { id: 1, title: 'Living Room', image: 'https://picsum.photos/300/200?random=1', href: '/category/living-room' },
  { id: 2, title: 'Kitchen', image: 'https://picsum.photos/300/200?random=2', href: '/category/kitchen' },
  { id: 3, title: 'Bedroom', image: 'https://picsum.photos/300/200?random=3', href: '/category/bedroom' },
  { id: 4, title: 'Decor', image: 'https://picsum.photos/300/200?random=4', href: '/category/decor' }
];

const bestSellers: Product[] = [
  { id: 1, title: 'Minimal Sofa Set', price: 499.99, rating: 5, image: 'https://picsum.photos/300/200?random=21' },
  { id: 2, title: 'Smart Blender Pro', price: 129.0, rating: 4, image: 'https://picsum.photos/300/200?random=22' },
  { id: 3, title: 'Cloud Comfort Mattress', price: 359.5, rating: 5, image: 'https://picsum.photos/300/200?random=23' },
  { id: 4, title: 'Nordic Lamp', price: 89.99, rating: 4, image: 'https://picsum.photos/300/200?random=24' }
];

const newArrivals: Product[] = [
  { id: 5, title: 'Oak Wall Shelf', price: 69.99, rating: 4, image: 'https://picsum.photos/300/200?random=31' },
  { id: 6, title: 'Ceramic Dinner Set', price: 119.99, rating: 5, image: 'https://picsum.photos/300/200?random=32' },
  { id: 7, title: 'Plush Throw Blanket', price: 49.99, rating: 4, image: 'https://picsum.photos/300/200?random=33' },
  { id: 8, title: 'Aroma Diffuser', price: 39.99, rating: 4, image: 'https://picsum.photos/300/200?random=34' }
];

const menuLinks = ['Home', 'Shop', 'Categories', 'Deals', 'Contact'];

export function Homepage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [cartCount, setCartCount] = useState(2);
  const [cartBounce, setCartBounce] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [footerEmail, setFooterEmail] = useState('');
  const [targetDate] = useState(() => Date.now() + 7 * 24 * 60 * 60 * 1000);
  const [timeLeft, setTimeLeft] = useState(targetDate - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(Math.max(targetDate - Date.now(), 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const countdown = useMemo(() => {
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
    const seconds = Math.floor((timeLeft / 1000) % 60);

    return { days, hours, minutes, seconds };
  }, [timeLeft]);

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const handleAddToCart = (name: string) => {
    setCartCount((prev) => prev + 1);
    setCartBounce(true);
    console.log('Added to cart:', name);
    setTimeout(() => setCartBounce(false), 450);
  };

  const handleNewsletterSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Newsletter subscribed:', newsletterEmail);
    setNewsletterEmail('');
  };

  const handleFooterNewsletter = (e: FormEvent) => {
    e.preventDefault();
    console.log('Footer newsletter subscribed:', footerEmail);
    setFooterEmail('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-bgSoft text-slate-800"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-2" onClick={() => console.log('Go to home')}>
            <div className="rounded-lg bg-accent p-2 text-white">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-none text-trust" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
                Nest<span className="text-accent">Mart</span>
              </h1>
              <p className="text-[10px] font-medium text-slate-500">Your Home. Your Style. Your Mart.</p>
            </div>
          </Link>

          <div className="relative mx-auto hidden w-full max-w-xl md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-trust focus:ring-2 focus:ring-trust/20"
              onChange={(e) => console.log('Search:', e.target.value)}
            />
          </div>

          <div className="ml-auto hidden items-center gap-3 md:flex">
            <button className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-trust" onClick={() => console.log('Wishlist opened')}>
              <Heart className="h-5 w-5" />
            </button>
            <motion.button
              animate={cartBounce ? { y: [0, -8, 0], scale: [1, 1.08, 1] } : { y: 0, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-trust"
              onClick={() => console.log('Cart opened')}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 rounded-full bg-accent px-1.5 text-[10px] font-bold text-white">{cartCount}</span>
            </motion.button>
            <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium transition hover:border-trust hover:text-trust" onClick={() => console.log('Account opened')}>
              <User className="h-4 w-4" />
              Account
            </button>
          </div>

          <button className="ml-auto rounded-md p-2 text-slate-600 md:hidden" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="fixed right-0 top-0 z-50 h-full w-80 max-w-[88vw] bg-white p-5 shadow-2xl md:hidden"
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-trust" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
                  Menu
                </h3>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5 text-slate-600" />
                </button>
              </div>

              <div className="relative mb-6">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products"
                  className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm"
                  onChange={(e) => console.log('Mobile search:', e.target.value)}
                />
              </div>

              <nav className="space-y-3">
                {menuLinks.map((link) => (
                  <button
                    key={link}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-left font-medium hover:border-trust hover:text-trust"
                    onClick={() => {
                      console.log('Nav clicked:', link);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {link}
                  </button>
                ))}
              </nav>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button className="rounded-lg bg-slate-100 p-2 text-sm font-medium" onClick={() => console.log('Wishlist opened')}>
                  Wishlist
                </button>
                <button className="rounded-lg bg-slate-100 p-2 text-sm font-medium" onClick={() => console.log('Account opened')}>
                  Account
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-7xl space-y-12 px-4 py-6 md:px-6 md:py-8">
        <section className="relative overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="relative h-64 md:h-80 lg:h-[420px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={slides[activeSlide].id}
                initial={{ opacity: 0.25, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.2, scale: 0.98 }}
                transition={{ duration: 0.55 }}
                className="absolute inset-0"
              >
                <Image src={slides[activeSlide].image} alt={slides[activeSlide].title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-trust/80 via-trust/60 to-black/30" />
                <div className="relative flex h-full max-w-xl flex-col justify-center gap-3 p-6 text-white md:p-10">
                  <p className="text-sm font-semibold uppercase tracking-widest text-accent">NestMart Collection</p>
                  <h2 className="text-3xl font-extrabold leading-tight md:text-5xl" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
                    {slides[activeSlide].title}
                  </h2>
                  <p className="text-lg md:text-2xl">{slides[activeSlide].subtitle}</p>
                  <button
                    className="w-fit rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:scale-105 hover:bg-amber-500"
                    onClick={() => console.log('Hero CTA:', slides[activeSlide].cta)}
                  >
                    {slides[activeSlide].cta}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

            <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-700 shadow">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-700 shadow">
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setActiveSlide(index)}
                  className={`h-2.5 rounded-full transition ${index === activeSlide ? 'w-8 bg-accent' : 'w-2.5 bg-white/80'}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
              Featured Categories
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {categories.map((category) => (
              <motion.div key={category.id} whileHover={{ scale: 1.03, y: -4 }} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <Link href={category.href} onClick={() => console.log('Category clicked:', category.title)}>
                  <div className="relative h-44 overflow-hidden">
                    <Image src={category.image} alt={category.title} fill className="object-cover transition duration-300 hover:scale-110" />
                  </div>
                  <div className="p-4">
                    <h4 className="text-lg font-semibold text-trust">{category.title}</h4>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <ProductSection title="Best Sellers" products={bestSellers} onAddToCart={handleAddToCart} />

        <section className="rounded-3xl bg-trust px-6 py-8 text-white md:px-10">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-wider text-blue-100">Limited Time</p>
              <h3 className="mt-1 text-3xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
                Flash Sale – 25% off everything
              </h3>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'Days', value: countdown.days },
                { label: 'Hours', value: countdown.hours },
                { label: 'Mins', value: countdown.minutes },
                { label: 'Secs', value: countdown.seconds }
              ].map((item) => (
                <div key={item.label} className="min-w-[64px] rounded-xl bg-white/15 px-3 py-2">
                  <p className="text-xl font-bold">{String(item.value).padStart(2, '0')}</p>
                  <p className="text-xs uppercase tracking-wide">{item.label}</p>
                </div>
              ))}
            </div>
            <button className="rounded-full bg-accent px-6 py-3 font-semibold transition hover:scale-105 hover:bg-amber-500" onClick={() => console.log('Shop Sale clicked')}>
              Shop Sale
            </button>
          </div>
        </section>

        <ProductSection title="New Arrivals" products={newArrivals} onAddToCart={handleAddToCart} />

        <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-10">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h3 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
                Join the NestMart Newsletter
              </h3>
              <p className="mt-1 text-slate-500">Get weekly deals, style tips, and early access to exclusive offers.</p>
            </div>
            <form className="flex w-full max-w-lg flex-col gap-3 sm:flex-row" onSubmit={handleNewsletterSubmit}>
              <input
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                type="email"
                required
                placeholder="Enter your email"
                className="w-full rounded-full border border-slate-200 px-4 py-3 outline-none focus:border-trust focus:ring-2 focus:ring-trust/20"
              />
              <button type="submit" className="rounded-full bg-trust px-6 py-3 font-semibold text-white transition hover:bg-blue-700">
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
            <FooterColumn title="About" links={['Our Story', 'Careers', 'Press', 'Investors']} />
            <FooterColumn title="Support" links={['Help Center', 'Shipping', 'Returns', 'Track Order']} />
            <FooterColumn title="Account" links={['Login', 'Register', 'Wishlist', 'Order History']} />
            <div>
              <h4 className="mb-3 font-semibold text-slate-900">Follow Us</h4>
              <div className="flex items-center gap-2">
                {[Facebook, Instagram, Twitter, Linkedin].map((Icon, idx) => (
                  <button key={idx} className="rounded-full border border-slate-200 p-2 text-slate-600 hover:text-trust" onClick={() => console.log('Social clicked')}>
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-slate-900">Quick Newsletter</h4>
              <form className="flex gap-2" onSubmit={handleFooterNewsletter}>
                <input
                  type="email"
                  required
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <button type="submit" className="rounded-lg bg-trust px-3 py-2 text-sm font-semibold text-white">
                  Join
                </button>
              </form>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="font-semibold text-slate-700">Payments:</span>
            {['Visa', 'Mastercard', 'PayPal', 'Razorpay'].map((item) => (
              <span key={item} className="rounded border border-slate-200 px-2 py-1">{item}</span>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <TrustBadge icon={Truck} title="Free Shipping" />
            <TrustBadge icon={ShieldCheck} title="Secure Payments" />
            <TrustBadge icon={RotateCcw} title="30-Day Returns" />
          </div>

          <p className="border-t border-slate-200 pt-5 text-sm text-slate-500">© {new Date().getFullYear()} NestMart. All rights reserved.</p>
        </div>
      </footer>
    </motion.div>
  );
}

function ProductSection({ title, products, onAddToCart }: { title: string; products: Product[]; onAddToCart: (name: string) => void }) {
  return (
    <section>
      <h3 className="mb-5 text-2xl font-bold text-slate-900" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <motion.article
            key={product.id}
            whileHover={{ scale: 1.02, y: -4 }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
          >
            <div className="relative h-44">
              <Image src={product.image} alt={product.title} fill className="object-cover" />
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-slate-900">{product.title}</h4>
              <p className="mt-1 text-lg font-bold text-trust">{formatPrice(product.price)}</p>
              <div className="mt-2 flex items-center gap-1 text-accent">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className={`h-4 w-4 ${index < product.rating ? 'fill-current' : 'text-slate-300'}`} />
                ))}
              </div>
              <button
                className="mt-4 w-full rounded-full bg-accent px-4 py-2.5 font-semibold text-white transition hover:bg-amber-500"
                onClick={() => onAddToCart(product.title)}
              >
                Add to Cart
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="mb-3 font-semibold text-slate-900">{title}</h4>
      <ul className="space-y-2">
        {links.map((item) => (
          <li key={item}>
            <button className="text-sm text-slate-500 transition hover:text-trust" onClick={() => console.log('Footer link clicked:', item)}>
              {item}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TrustBadge({ icon: Icon, title }: { icon: typeof Package; title: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <Icon className="h-5 w-5 text-trust" />
      <p className="text-sm font-semibold text-slate-700">{title}</p>
    </div>
  );
}
