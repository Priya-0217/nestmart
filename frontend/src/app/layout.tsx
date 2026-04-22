import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/app-shell';

const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800']
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  metadataBase: new URL('https://nestmart.example.com'),
  title: {
    default: 'NestMart | Curated Home Essentials',
    template: '%s | NestMart'
  },
  description: 'NestMart storefront built with Next.js 14, featuring curated products, responsive commerce flows, and a complete account/checkout experience.',
  icons: {
    icon: '/favicon.svg'
  },
  openGraph: {
    title: 'NestMart | Curated Home Essentials',
    description: 'Discover design-led furniture and decor with a smooth ecommerce flow.',
    type: 'website',
    url: 'https://nestmart.example.com',
    siteName: 'NestMart'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NestMart | Curated Home Essentials',
    description: 'Discover design-led furniture and decor with a smooth ecommerce flow.'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-flash: apply saved theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem('nestmart-theme'),d=window.matchMedia('(prefers-color-scheme:dark)').matches;if(t==='dark'||(t===null&&d))document.documentElement.classList.add('dark')}catch(e){}`
          }}
        />
      </head>
      <body className={`${display.variable} ${body.variable}`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
