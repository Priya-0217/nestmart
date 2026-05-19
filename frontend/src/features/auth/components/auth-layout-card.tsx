import Image from 'next/image';
import { ReactNode } from 'react';

type AuthMode = 'login' | 'register';

const visualByMode = {
  login: {
    layout: 'stack-left',
    eyebrow: 'Welcome Back',
    headline: 'Styled spaces are waiting for you.',
    copy: 'Sign in to continue your wishlist, track orders, and pick up right where you left off.',
    imageSlots: [
      { src: '/promo/promo-1.jpg', alt: 'NestMart living room setup' },
      { src: '/promo/promo-2.jpg', alt: 'NestMart kitchen accents' },
      { src: '/promo/promo-3.jpg', alt: 'NestMart home decor pieces' }
    ]
  },
  register: {
    layout: 'stack-right',
    eyebrow: 'New At NestMart',
    headline: 'Create your account and make home better.',
    copy: 'Join NestMart to save your addresses, build collections, and enjoy a faster checkout experience.',
    imageSlots: [
      { src: '/promo/promo-3.jpg', alt: 'NestMart premium decor pieces' },
      { src: '/promo/promo-1.jpg', alt: 'NestMart living room setup' },
      { src: '/promo/promo-2.jpg', alt: 'NestMart kitchen accents' }
    ]
  }
} as const;

export function AuthLayoutCard({
  title,
  subtitle,
  children,
  mode = 'login'
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  mode?: AuthMode;
}) {
  const visual = visualByMode[mode];
  const formBorderTone = mode === 'login' ? 'border-[#1A56DB]/15' : 'border-[#F59E0B]/20';
  const [imgA, imgB, imgC] = visual.imageSlots;

  return (
    <section className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[28px] border border-border bg-[#F8FAFC] shadow-[0_16px_55px_rgba(26,86,219,0.12)]">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(62% 52% at 8% 86%, rgba(245,158,11,0.16), transparent 60%), radial-gradient(58% 42% at 95% 10%, rgba(26,86,219,0.1), transparent 64%)'
        }}
      />

      <div className="relative grid gap-5 p-4 sm:gap-6 sm:p-6 lg:grid-cols-[1.08fr,0.92fr] lg:p-8">
        <aside className="relative overflow-hidden rounded-3xl border border-border/70 bg-white/85 p-5 backdrop-blur-sm sm:p-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#F59E0B]">{visual.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1A56DB] sm:text-4xl">{visual.headline}</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-foreground/70">
            {visual.copy}
          </p>

          <div className="relative mt-6 rounded-3xl p-3">
            <div
              className="pointer-events-none absolute inset-0 rounded-3xl"
              style={{
                background:
                  'radial-gradient(66% 50% at 18% 82%, rgba(245,158,11,0.14), transparent 65%), radial-gradient(52% 40% at 86% 18%, rgba(26,86,219,0.12), transparent 65%)'
              }}
              aria-hidden
            />

            {visual.layout === 'stack-left' ? (
              <div className="relative grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="relative h-52 overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_16px_45px_rgba(17,24,39,0.16)] sm:h-56">
                    <Image src={imgA.src} alt={imgA.alt} fill sizes="(max-width: 1024px) 50vw, 28vw" className="object-cover" />
                  </div>
                  <div className="relative h-32 overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_16px_45px_rgba(17,24,39,0.16)] sm:h-36">
                    <Image src={imgB.src} alt={imgB.alt} fill sizes="(max-width: 1024px) 50vw, 28vw" className="object-cover" />
                  </div>
                </div>
                <div className="relative h-[352px] overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_16px_45px_rgba(17,24,39,0.16)] sm:h-[384px]">
                  <Image src={imgC.src} alt={imgC.alt} fill sizes="(max-width: 1024px) 50vw, 28vw" className="object-cover" />
                </div>
              </div>
            ) : (
              <div className="relative grid grid-cols-2 gap-4">
                <div className="relative h-[352px] overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_16px_45px_rgba(17,24,39,0.16)] sm:h-[384px]">
                  <Image src={imgA.src} alt={imgA.alt} fill sizes="(max-width: 1024px) 50vw, 28vw" className="object-cover" />
                </div>
                <div className="space-y-4">
                  <div className="relative h-52 overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_16px_45px_rgba(17,24,39,0.16)] sm:h-56">
                    <Image src={imgB.src} alt={imgB.alt} fill sizes="(max-width: 1024px) 50vw, 28vw" className="object-cover" />
                  </div>
                  <div className="relative h-32 overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_16px_45px_rgba(17,24,39,0.16)] sm:h-36">
                    <Image src={imgC.src} alt={imgC.alt} fill sizes="(max-width: 1024px) 50vw, 28vw" className="object-cover" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        <div className={`surface relative rounded-3xl border ${formBorderTone} bg-white p-6 sm:p-8`}>
          <h1 className="text-2xl font-semibold text-foreground sm:text-[2rem]">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-foreground/70">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </section>
  );
}
