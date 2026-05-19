import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/app-shell';
import { Providers } from './providers';

const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap'
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
  display: 'swap'
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://nestmart.example.com');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
    url: siteUrl,
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
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
