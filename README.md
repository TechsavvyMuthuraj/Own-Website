# NammaTech - Production Digital Resource Platform

A modern, fast, and trustworthy digital resource platform designed to distribute legally authorized, open-source, and freeware software, developer tools, authorized APKs, templates, and digital files. All you need. One place.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase (PostgreSQL with RLS & Auth)**, **Cloudflare R2 (Private S3 Presigned Downloads)**, and **Razorpay/UPI Payment Integration**.

---

## 🛡️ Core Principle: ZERO MOCK DATA

This platform is engineered as a real production system:
- **No fake products or mock fallback records.**
- **No fake download counts (`downloads || 12500` is strictly banned; real counts are queried).**
- **No fake user accounts, fake reviews, or fabricated rating stars.**
- **No fake countdown clocks or simulated payment approvals.**
- Every item, announcement, coupon, order, and download is validated and stored in **Supabase PostgreSQL** or **Cloudflare R2**.
- When the database is initially empty, the application renders clean, trustworthy empty states.

---

## 🚀 Architecture Overview

```text
                                 +-----------------------+
                                 |   Next.js App Router  |
                                 |  (SSR / RSC / Actions)|
                                 +-----------+-----------+
                                             |
                     +-----------------------+-----------------------+
                     |                                               |
                     v                                               v
        +-------------------------+                     +-------------------------+
        |     Supabase Cloud      |                     |      Cloudflare R2      |
        |  - PostgreSQL with RLS  |                     |  - Private S3 Bucket    |
        |  - Supabase Auth (SSR)  |                     |  - Presigned Secure     |
        |  - Realtime Subscriptions|                    |    Download URLs        |
        +-------------------------+                     +-------------------------+
                     |
                     v
        +-------------------------+
        |   Razorpay / UPI Gateway|
        |  - Webhook Idempotency  |
        |  - HMAC Signature Check |
        |  - Order Entitlements   |
        +-------------------------+
```

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Language**: TypeScript with strict typing
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)
- **Storage**: [Cloudflare R2](https://www.cloudflare.com/products/r2/) via `@aws-sdk/client-s3`
- **Styling**: Tailwind CSS v4 with custom design tokens for Dark & Light modes
- **State & Theme**: `next-themes`, React Context (Cart with duplicate prevention)
- **Icons & Animation**: Lucide React, Framer Motion

---

## 📦 Setup & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in the environment credentials:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase secret service role key
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`: Cloudflare R2 credentials
- `PAYMENT_KEY_ID`, `PAYMENT_KEY_SECRET`, `PAYMENT_WEBHOOK_SECRET`: Razorpay / UPI gateway keys

### 3. Apply Database Migrations
Execute the SQL migration in your Supabase SQL Editor:
```text
supabase/migrations/001_initial_schema.sql
```
This script creates all normalized tables, triggers, indexes, and Row Level Security (RLS) policies.

*(Optional for Local Development Only)*:
To populate base categories and initial settings during local development, run:
```text
supabase/seed.dev.sql
```

### 4. Create First Admin User
1. Register an account via `/auth/register` on your site.
2. In your Supabase Dashboard -> Table Editor -> `profiles`, change your user record's `role` column to `'ADMIN'`.
3. You now have full access to `/admin`.

---

## 🚦 Development & Production Commands

```bash
# Run local development server
npm run dev

# Run TypeScript compiler check
npx tsc --noEmit

# Run ESLint validation
npm run lint

# Build production bundle
npm run build

# Start production server
npm run start
```

---

## 📂 Project Structure

```text
src/
├── app/
│   ├── (public)/              # Public website route group
│   │   ├── about/             # About & transparency commitments
│   │   ├── cart/              # Shopping cart with coupon verification
│   │   ├── categories/        # Category directory
│   │   ├── category/[slug]/   # Category items with filters
│   │   ├── checkout/          # Checkout with Razorpay/UPI
│   │   ├── contact/           # Contact form (logged to DB)
│   │   ├── disclaimer/        # Safe distribution disclaimer
│   │   ├── dmca/              # DMCA copyright dispute page
│   │   ├── explore/           # Catalog with multi-criteria filters
│   │   ├── free/              # Free open-source resources
│   │   ├── new-and-updated/   # Dynamic recent additions/updates
│   │   ├── premium/           # Commercial digital products
│   │   ├── privacy-policy/    # Privacy terms
│   │   ├── refund-policy/     # Refund terms for digital goods
│   │   ├── resource/[slug]/   # Resource details & specs
│   │   │   └── download/      # Secure unlock & presigned download
│   │   ├── search/            # Full-text search results
│   │   ├── terms/             # Terms of service
│   │   └── page.tsx           # Homepage
│   ├── account/               # Protected user dashboard
│   │   ├── downloads/         # User entitlements & files
│   │   ├── favorites/         # Saved bookmarks
│   │   ├── orders/            # Order history & receipts
│   │   ├── profile/           # Profile settings
│   │   └── page.tsx           # Account overview
│   ├── admin/                 # Protected admin console
│   │   ├── ads/               # Ad placement manager
│   │   ├── announcements/     # Top-bar announcement manager
│   │   ├── audit-logs/        # System audit log feed
│   │   ├── categories/        # Category CRUD
│   │   ├── coupons/           # Promotional code management
│   │   ├── login/             # Dedicated admin login
│   │   ├── messages/          # Contact submission inbox
│   │   ├── orders/            # Transaction & manual UPI verification
│   │   ├── resources/         # Resource CRUD & duplicate
│   │   ├── settings/          # System parameters & maintenance toggle
│   │   └── page.tsx           # Real-time metrics dashboard
│   ├── api/                   # Server endpoints
│   │   ├── admin/             # Admin protected actions
│   │   ├── checkout/          # Order creation and verification
│   │   ├── contact/           # Contact submission handler
│   │   ├── coupons/           # Coupon validator
│   │   ├── downloads/         # Event logger and signed URLs
│   │   └── webhooks/          # Razorpay webhook listener
│   ├── auth/                  # Authentication pages
│   ├── globals.css            # Design tokens & theme variables
│   ├── layout.tsx             # Root layout with providers
│   ├── not-found.tsx          # 404 handler
│   ├── robots.ts              # Robots.txt generator
│   └── sitemap.ts             # Dynamic XML sitemap generator
├── components/
│   ├── admin/                 # Resource form, tables, controls
│   ├── announcements/         # Dynamic top announcement bar
│   ├── navigation/            # Header, Footer
│   ├── providers/             # RootProviders, ThemeProvider
│   ├── resources/             # ResourceCard, ResourceGrid
│   ├── search/                # SearchModal (Cmd+K)
│   └── ui/                    # EmptyState, ThemeToggle
├── lib/
│   ├── auth/                  # AuthContext
│   ├── cart/                  # CartStore (localStorage synced)
│   ├── payments/              # Razorpay HMAC verification
│   ├── r2/                    # Cloudflare S3 client & presigned URLs
│   ├── supabase/              # Browser, server, admin clients
│   └── utils.ts               # Date, bytes, currency, and badge helpers
└── types/
    └── database.ts            # Complete TypeScript database schema
```

---

## 🔒 Security Principles

- **Environment Isolation**: Service role keys, payment secrets, and R2 private credentials are strictly server-side.
- **Row Level Security**: Enforced on every PostgreSQL table via Supabase.
- **Presigned URLs**: Download URLs for private R2 assets expire after 15 minutes.
- **Payment Verification**: Paid access is granted only after server-side cryptographic signature verification or administrative reconciliation.
- **Duplicate Prevention**: Users cannot accidentally buy the same digital resource multiple times.
#   O w n - W e b s i t e  
 