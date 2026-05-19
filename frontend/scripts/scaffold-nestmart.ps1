$ErrorActionPreference = "Stop"

function Ensure-Dir([string]$path) {
  if (-not (Test-Path -LiteralPath $path)) {
    New-Item -ItemType Directory -Path $path | Out-Null
  }
}

function Ensure-File([string]$path, [string]$content) {
  if (-not (Test-Path -LiteralPath $path)) {
    $dir = Split-Path -Parent $path
    Ensure-Dir $dir
    Set-Content -LiteralPath $path -Value $content -Encoding UTF8
  }
}

Ensure-Dir "prisma"
Ensure-Dir "src/lib/auth"
Ensure-Dir "src/lib/sanity"
Ensure-Dir "src/lib/constants"
Ensure-Dir "src/components/scaffold"

Ensure-File "src/components/scaffold/page-template.tsx" @'
interface PageTemplateProps {
  title: string;
  description: string;
}

export function PageTemplate({ title, description }: PageTemplateProps) {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col gap-4 px-4 py-12 md:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">NestMart Scaffold</p>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">{title}</h1>
      <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">{description}</p>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        Detailed implementation for this page is queued and will be built section-by-section.
      </div>
    </main>
  );
}
'@

Ensure-File "src/lib/constants/roles.ts" @'
export const USER_ROLES = {
  CUSTOMER: "CUSTOMER",
  ADMIN: "ADMIN"
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ADMIN_ROLES: UserRole[] = [USER_ROLES.ADMIN];
'@

Ensure-File "src/lib/prisma.ts" @'
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
'@

Ensure-File "src/lib/stripe.ts" @'
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? "";

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-03-31.basil",
  typescript: true
});
'@

Ensure-File "src/lib/sanity/client.ts" @'
import { createClient } from "next-sanity";

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01",
  useCdn: process.env.NODE_ENV === "production"
});
'@

Ensure-File "src/lib/sanity/queries.ts" @'
export const homePageSectionsQuery = `*[_type == "homePage"][0]{
  hero,
  featuredCategories[]->{_id, title, "slug": slug.current},
  promotions,
  newsletter
}`;

export const aboutPageQuery = `*[_type == "aboutPage"][0]{
  title,
  story,
  values,
  teamMembers[]{name, role, bio, image}
}`;
'@

Ensure-File "src/lib/cloudinary.ts" @'
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export { cloudinary };
'@

Ensure-File "src/lib/email.ts" @'
import nodemailer from "nodemailer";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface TransactionalEmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendTransactionalEmail(payload: TransactionalEmailInput) {
  if (resend) {
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "NestMart <noreply@nestmart.local>",
      to: payload.to,
      subject: payload.subject,
      html: payload.html
    });
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? "noreply@nestmart.local",
    to: payload.to,
    subject: payload.subject,
    html: payload.html
  });
}
'@

Ensure-File "src/lib/auth/options.ts" @'
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { USER_ROLES } from "@/lib/constants/roles";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/login"
  },
  providers: [
    CredentialsProvider({
      name: "NestMart Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user?.passwordHash) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role ?? USER_ROLES.CUSTOMER;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as string) ?? USER_ROLES.CUSTOMER;
      }
      return session;
    }
  }
};
'@

Ensure-File "prisma/schema.prisma" @'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  CUSTOMER
  ADMIN
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  RETURN_REQUESTED
  RETURNED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  phone         String?
  passwordHash  String?
  role          Role     @default(CUSTOMER)
  image         String?
  emailVerified DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  addresses     Address[]
  orders        Order[]
  reviews       Review[]
  wishlistItems Wishlist[]
  accounts      Account[]
  sessions      Session[]
}

model Category {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  description String?
  parentId    String?
  parent      Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryTree")
  products    Product[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Product {
  id             String           @id @default(cuid())
  name           String
  slug           String           @unique
  description    String
  sku            String           @unique
  price          Decimal          @db.Decimal(10, 2)
  compareAtPrice Decimal?         @db.Decimal(10, 2)
  stock          Int              @default(0)
  isActive       Boolean          @default(true)
  categoryId     String
  category       Category         @relation(fields: [categoryId], references: [id])
  images         ProductImage[]
  variants       ProductVariant[]
  reviews        Review[]
  orderItems     OrderItem[]
  wishlistItems  Wishlist[]
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
}

model ProductImage {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  alt       String?
  sortOrder Int     @default(0)
}

model ProductVariant {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  name      String
  value     String
  stock     Int     @default(0)
}

model Address {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  fullName   String
  line1      String
  line2      String?
  city       String
  state      String
  postalCode String
  country    String
  phone      String
  isDefault  Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  orders     Order[]
}

model Order {
  id                    String        @id @default(cuid())
  userId                String
  user                  User          @relation(fields: [userId], references: [id])
  addressId             String?
  address               Address?      @relation(fields: [addressId], references: [id])
  status                OrderStatus   @default(PENDING)
  paymentStatus         PaymentStatus @default(PENDING)
  subtotal              Decimal       @db.Decimal(10, 2)
  shippingAmount        Decimal       @db.Decimal(10, 2)
  taxAmount             Decimal       @db.Decimal(10, 2)
  discountAmount        Decimal       @db.Decimal(10, 2)
  totalAmount           Decimal       @db.Decimal(10, 2)
  stripePaymentIntentId String?
  couponCode            String?
  items                 OrderItem[]
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt
}

model OrderItem {
  id           String  @id @default(cuid())
  orderId      String
  order        Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId    String
  product      Product @relation(fields: [productId], references: [id])
  quantity     Int
  unitPrice    Decimal @db.Decimal(10, 2)
  variantLabel String?
}

model Review {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  productId  String
  product    Product  @relation(fields: [productId], references: [id])
  rating     Int
  comment    String?
  isApproved Boolean  @default(false)
  createdAt  DateTime @default(now())
}

model Coupon {
  id             String   @id @default(cuid())
  code           String   @unique
  description    String?
  discountType   String
  discountValue  Decimal  @db.Decimal(10, 2)
  minOrderAmount Decimal? @db.Decimal(10, 2)
  maxDiscount    Decimal? @db.Decimal(10, 2)
  startsAt       DateTime?
  endsAt         DateTime?
  usageLimit     Int?
  usageCount     Int      @default(0)
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Wishlist {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, productId])
}

model AppSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     Json
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
'@

$pages = @(
  @{ Path = "src/app/categories/[slug]/page.tsx"; Title = "Category Listing"; Description = "Filters sidebar, sort controls, product grid, and pagination will be implemented here." },
  @{ Path = "src/app/search/page.tsx"; Title = "Search Results"; Description = "Search input, filtering, sorting, and no-results state will be implemented here." },
  @{ Path = "src/app/checkout/address/page.tsx"; Title = "Checkout Step 1: Delivery Address"; Description = "Delivery form and saved address book selection will be implemented here." },
  @{ Path = "src/app/checkout/shipping/page.tsx"; Title = "Checkout Step 2: Shipping Method"; Description = "Shipping method options and ETA calculations will be implemented here." },
  @{ Path = "src/app/checkout/payment/page.tsx"; Title = "Checkout Step 3: Payment"; Description = "Stripe Elements card entry and payment method selection will be implemented here." },
  @{ Path = "src/app/checkout/review/page.tsx"; Title = "Checkout Step 4: Review Order"; Description = "Final order summary, terms acceptance, and place-order action will be implemented here." },
  @{ Path = "src/app/order-confirmation/[orderId]/page.tsx"; Title = "Order Confirmation"; Description = "Thank-you experience with order id, summary, and email confirmation status will be implemented here." },
  @{ Path = "src/app/account/orders/page.tsx"; Title = "My Orders"; Description = "Customer order list with status badges, filtering, and quick actions will be implemented here." },
  @{ Path = "src/app/account/orders/[orderId]/page.tsx"; Title = "Order Detail"; Description = "Order timeline, item list, and return or cancel controls will be implemented here." },
  @{ Path = "src/app/account/wishlist/page.tsx"; Title = "My Wishlist"; Description = "Saved products and move-to-cart actions will be implemented here." },
  @{ Path = "src/app/account/addresses/page.tsx"; Title = "Address Book"; Description = "Create, update, and delete customer addresses here." },
  @{ Path = "src/app/account/profile/page.tsx"; Title = "Edit Profile"; Description = "Profile edits, phone update, and password change form will be implemented here." },
  @{ Path = "src/app/about/page.tsx"; Title = "About Us"; Description = "Brand story, values, and team from Sanity CMS will be rendered here." },
  @{ Path = "src/app/contact/page.tsx"; Title = "Contact Us"; Description = "Contact form and store information modules will be implemented here." },
  @{ Path = "src/app/privacy-policy/page.tsx"; Title = "Privacy Policy"; Description = "Legal privacy content for NestMart will live here." },
  @{ Path = "src/app/terms-and-conditions/page.tsx"; Title = "Terms & Conditions"; Description = "Legal terms and conditions content for NestMart will live here." },
  @{ Path = "src/app/admin/login/page.tsx"; Title = "Admin Login"; Description = "Dedicated admin sign-in flow with strict role gating will be implemented here." },
  @{ Path = "src/app/admin/orders/[id]/page.tsx"; Title = "Admin Order Detail"; Description = "Admin order detail with status controls and invoice print support will be implemented here." },
  @{ Path = "src/app/admin/products/new/page.tsx"; Title = "Add Product"; Description = "Create-product form with image upload and variant inputs will be implemented here." },
  @{ Path = "src/app/admin/products/[id]/edit/page.tsx"; Title = "Edit Product"; Description = "Edit-product form and inventory updates will be implemented here." },
  @{ Path = "src/app/admin/inventory-alerts/page.tsx"; Title = "Inventory Alerts"; Description = "Low-stock and out-of-stock monitoring dashboard will be implemented here." },
  @{ Path = "src/app/admin/content/page.tsx"; Title = "Content Management"; Description = "Sanity-backed banner and homepage section management controls will be implemented here." }
)

foreach ($page in $pages) {
  if (-not (Test-Path -LiteralPath $page.Path)) {
    $dir = Split-Path -Parent $page.Path
    Ensure-Dir $dir
    $content = @"
import { PageTemplate } from "@/components/scaffold/page-template";

export default function Page() {
  return <PageTemplate title="$($page.Title)" description="$($page.Description)" />;
}
"@
    Set-Content -LiteralPath $page.Path -Value $content -Encoding UTF8
  }
}

$apiTemplate = @'
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Scaffold route ready." }, { status: 200 });
}

export async function POST() {
  return NextResponse.json({ message: "Scaffold route ready." }, { status: 200 });
}
'@

$apis = @(
  "src/app/api/auth/register/route.ts",
  "src/app/api/auth/forgot-password/route.ts",
  "src/app/api/auth/reset-password/route.ts",
  "src/app/api/checkout/create-payment-intent/route.ts",
  "src/app/api/checkout/place-order/route.ts",
  "src/app/api/stripe/webhook/route.ts",
  "src/app/api/admin/coupons/route.ts",
  "src/app/api/admin/categories/route.ts",
  "src/app/api/admin/reviews/route.ts",
  "src/app/api/admin/reports/route.ts",
  "src/app/api/admin/settings/route.ts"
)

foreach ($api in $apis) {
  Ensure-File $api $apiTemplate
}
