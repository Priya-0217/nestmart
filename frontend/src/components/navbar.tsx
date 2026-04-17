'use client';

import Link from 'next/link';
import { ShoppingCart, UserRound, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-trust">
          NestMart
        </Link>
        <div className="hidden items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 md:flex">
          <Search size={16} className="text-slate-400" />
          <input
            className="w-56 bg-transparent text-sm outline-none"
            placeholder="Search products..."
            aria-label="search"
          />
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
          <Link href="/products">Shop</Link>
          <Link href="/account">Account</Link>
          <motion.div whileHover={{ y: -2 }}>
            <Link href="/cart" className="inline-flex items-center gap-2 rounded-full bg-trust px-4 py-2 text-white shadow-glow">
              <ShoppingCart size={16} /> Cart
            </Link>
          </motion.div>
          <UserRound size={18} className="hidden md:inline" />
        </nav>
      </div>
    </header>
  );
}
