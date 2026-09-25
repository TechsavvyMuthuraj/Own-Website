# NammaTech (Antigravity Hub) — Project Context & Architecture

**Last Updated:** September 2026  
**Platform URL:** [https://www.techsavvymuthuraj.dev](https://www.techsavvymuthuraj.dev)  
**Founder & Lead:** Muthuraj C (`techsavvy.muthuraj.dev@gmail.com`)

---

## 1. Current Project Architecture

### Core Stack
- **Framework:** Next.js 16.3.5 (App Router, React 19.2.8, TypeScript 5).
  - *Next.js 16 Breaking Convention:* Uses `src/proxy.ts` (instead of legacy `middleware.ts`) for Edge proxying, maintenance mode intercepts, and route-level auth protection.
- **Styling:** Vanilla CSS & Tailwind CSS v4 (`@tailwindcss/postcss`) with CSS variables design system (`src/app/globals.css`).
- **Aesthetic Themes:** Dual curated theme system:
  - `midnight`: True OLED Obsidian Dark base with subtle ambient glow.
  - `nordic-light`: Clean minimalist high-contrast light mode.
- **Visual Effects & Animation:** Framer Motion (`framer-motion` & `motion` v13), Three.js (`three`), OGL (`ogl`), Lucide React icons (`lucide-react`).
- **State Management & Data Fetching:**
  - TanStack React Query v5 (`@tanstack/react-query`) with 1m stale-time and 5m gc-time.
  - React Contexts: `AuthProvider`, `CartProvider`, `StyleProvider`, `ToastProvider`, `ClickSoundProvider`.
- **Database & Auth:** Supabase SSR (`@supabase/ssr`) and Supabase JS Client (`@supabase/supabase-js`) on PostgreSQL with Row Level Security (RLS).
- **Deployment & Edge Infrastructure:** Vercel serverless deployment configured for Mumbai region (`bom1`), using Next.js `unstable_cache` with ISR (`revalidate = 300`) for high-speed page loads.

### Workspace Directory Structure
```
Website build/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/           # Public storefront & browsing routes
│   │   ├── account/            # User account & library portal
│   │   ├── admin/              # Comprehensive administrative dashboard
│   │   ├── api/                # Route handlers (checkout, support, downloads, admin)
│   │   ├── auth/               # Login & Register views
│   │   ├── maintenance/        # Maintenance mode fallback page
│   │   ├── technicalsupport/   # Technical support specialist portal
│   │   ├── layout.tsx          # Root layout with SEO JSON-LD & global providers
│   │   ├── proxy.ts            # Next.js 16 edge proxy & route protection
│   │   ├── robots.ts           # Dynamic robots.txt
│   │   └── sitemap.ts          # Dynamic XML sitemap with image metadata
│   ├── components/             # Reusable UI components by domain
│   │   ├── admin/              # Admin dashboard widgets and tables
│   │   ├── ads/                # AdSense & banner slot components
│   │   ├── home/               # Spotlight cards, bento grids, tickers
│   │   ├── navigation/         # Header, footer, breadcrumbs, top loader
│   │   ├── payments/           # UPI QR code and payment verification modal
│   │   ├── support/            # ContactSupportPopup & LiveSupportChat
│   │   ├── theme/              # StyleProvider & Theme toggles
│   │   └── ui/                 # Buttons, modals, toasts, audio providers
│   ├── lib/
│   │   ├── auth/               # AuthContext & session liveness logic
│   │   ├── cart/               # Cart store & localStorage persistence
│   │   ├── payments/           # Payment helpers
│   │   ├── r2/                 # Cloudflare R2 client & presigned URL helpers
│   │   ├── sound.ts            # Sound effects synthesizer & audio data
│   │   ├── supabase/           # Server, Client, and Admin Supabase instances
│   │   └── support/            # SupportChatStore singleton & chat audio
│   └── types/
│       └── database.ts         # TypeScript schema definitions for Supabase
├── supabase/
│   └── migrations/             # SQL migrations for database schema
└── scratch/                    # Test and diagnostic utility scripts
```

---

## 2. Features Already Implemented

### Public Storefront & Discovery
1. **Homepage Suite:** Spotlight cards, Bento grid showcases, dynamic count-up statistics, infinite marquee ticker, live system diagnostics, verified downloads showcase, and YouTube developer spotlight.
2. **Search & Exploration:**
   - Instant search (`/search`) across titles, descriptions, categories, and tags.
   - Resource Explorer (`/explore`) with category tabs, sorting by views/downloads/date.
   - 100% Free Tools portal (`/free`) for zero-cost utilities and open-source applications.
   - New & Updated listing (`/new-and-updated`).
3. **Resource Detail Pages (`/resource/[slug]`):**
   - Metadata, platform specs, version history, changelog, screenshots gallery.
   - Virus scan badges, official website links, primary & mirror download sources.
4. **Dedicated Cinema Hub (`/movies`, `/movies/[slug]`):**
   - 4K UHD listings, IMDb ratings, YouTube trailer embeds, audio format flags, and mirror download links.
5. **Community Software Request (`/request`):**
   - Resource request form with WhatsApp follow-up mechanism.
   - Post-submission discovery strip to retain visitors and decrease bounce rates.
6. **Articles & Tech Blog (`/articles`, `/articles/[slug]`):**
   - Software setup tutorials, troubleshooting guides, and news.
7. **Founder & Brand Identity (`/about`):**
   - Profile for Muthuraj C, certifications, YouTube channel links, contact info.
8. **Interactive UI Elements:**
   - Global mascot assistant (`GlobalSiteMascot`).
   - Web Audio API click sound effects (`ClickSoundProvider`) with toggle.
   - Floating `ContactSupportPopup` with pre-filled WhatsApp templates, direct call, and embedded real-time chat.
   - Legal documents: `/privacy-policy`, `/terms`, `/disclaimer`, `/dmca`, `/cookie-policy`, `/refund-policy`.

### User Account Portal (`/account`)
- Profile settings, display name, and avatar customization.
- **My Downloads:** Instant access to purchased/licensed digital resources.
- **My Orders:** Order history, payment status, UTR reference details, invoice viewing.
- **Favorites:** Bookmarked software and movies.
- **My Requests:** Real-time tracking of submitted software requests.

### Operations & Admin Portal (`/admin`)
- **System Dashboard:** Metrics on revenue, orders, active users, downloads, and pending triage.
- **Resource Management (`/admin/resources`):** Full CRUD for software, APKs, tools, prices, download mirrors.
- **Cinema Hub Management (`/admin/movies`):** Dedicated movies catalog manager.
- **Order & Payment Verification (`/admin/orders`, `/admin/payments`):** Audit pending UPI UTR transactions, approve/reject orders, grant entitlements.
- **Request Triage (`/admin/requests`):** Review community software requests, add admin notes, click-to-WhatsApp.
- **Technical Support Operations (`/admin/support-team`, `/technicalsupport`):** Live chat terminal, specialist duty scheduling, chat logs.
- **User Directory (`/admin/users`):** Real-time online presence tracking, role assignment, verification status.
- **Monetization & Ads (`/admin/ads`):** Manage header/footer/feed ad slots and Google AdSense integration.
- **Announcements & Coupons (`/admin/announcements`, `/admin/coupons`):** Global notification banners, discount codes (percent/flat).
- **Articles & Wallpapers CMS.**
- **Site Settings & Maintenance Mode:** Instant maintenance switch with admin bypass cookie.
- **Audit Logging (`/admin/audit-logs`):** Full audit trail for administrative changes.

---

## 3. Database Tables & Migrations

All migrations reside in `supabase/migrations/`:
- `001_initial_schema.sql` — Foundational schema, profiles, resources, orders, RLS policies.
- `002_upi_utr_payment_flow.sql` — UTR constraint, `software_requests`, pending orders view, order stats function.
- `003_performance_indexes.sql` — Performance optimization indexes.
- `004_cinema_hub_and_premium_features.sql` — Cinema fields (trailer, rating, quality) and category seeding.
- `20260920_wallpapers_schema.sql` — 4K/8K wallpapers catalog.
- `20260922_guest_first_access_schema.sql` — Guest checkout (`customer_name`, `whatsapp_number`, `access_token` on entitlements).
- `20260922_resource_requests_schema.sql` — Community requests with WhatsApp contact tracking.
- `20260922_support_chat_sessions_schema.sql` — Real-time support chat sessions and JSONB message store.
- `20260922_technical_support_team_schema.sql` — Technical specialists roster and duty status.

### Core Tables Summary
| Table Name | Description | Key Columns |
|------------|-------------|-------------|
| `profiles` | User profiles synced from Auth | `id`, `email`, `full_name`, `avatar_url`, `role` (`USER`, `ADMIN`, `SUPER_ADMIN`, `SUPPORT`, `TECHNICAL_SUPPORT`) |
| `categories` | Resource categories | `id`, `name`, `slug`, `icon`, `sort_order`, `is_active` |
| `resources` | Software, tools, APKs, cinema | `id`, `title`, `slug`, `access_type` (`FREE`/`PAID`), `price`, `sale_price`, `status`, `views_count`, `downloads_count`, `trailer_url`, `quality`, `rating` |
| `resource_images` | Gallery screenshots | `id`, `resource_id`, `image_url`, `sort_order` |
| `download_links` | Direct & mirror download URLs | `id`, `resource_id`, `title`, `link_type`, `url`, `r2_key`, `size_bytes`, `is_active` |
| `orders` | Transaction records | `id`, `order_number`, `user_id` (nullable for guests), `customer_name`, `whatsapp_number`, `subtotal`, `discount`, `total`, `status` (`PENDING`, `PAID`, `FAILED`, `REFUNDED`), `payment_id` (UTR), `payment_provider` |
| `order_items` | Items linked to orders | `id`, `order_id`, `resource_id`, `price` |
| `entitlements` | Active licenses granting download access | `id`, `user_id` (nullable), `access_token` (for guests), `resource_id`, `order_id`, `status` (`ACTIVE`, `REVOKED`), `expires_at` |
| `coupons` | Promo discount codes | `id`, `code`, `discount_type`, `discount_value`, `min_order`, `usage_limit`, `times_used`, `is_active` |
| `downloads` | Download event audit logs | `id`, `resource_id`, `user_id`, `ip_hash`, `downloaded_at` |
| `favorites` | User bookmarks | `id`, `user_id`, `resource_id` |
| `resource_requests` | Community software requests | `id`, `user_id`, `name`, `whatsapp_number`, `resource_name`, `category`, `description`, `status` (`pending`, `reviewing`, `completed`), `admin_note` |
| `support_chat_sessions` | Support chat sessions | `id`, `user_name`, `user_email`, `assigned_specialist_name`, `status` (`ACTIVE`, `WAITING`, `RESOLVED`, `DELETED`), `messages` (JSONB) |
| `technical_support_specialists` | Support team roster | `id`, `name`, `email`, `role`, `duty_status` (`ON_DUTY`, `BUSY`, `OFF_DUTY`), `phone`, `specializations`, `rating` |
| `announcements` | Banner alerts | `id`, `title`, `content`, `cta_text`, `cta_url`, `location`, `is_active` |
| `ad_placements` | Ad slots & code snippets | `id`, `title`, `location`, `ad_code`, `impressions`, `clicks`, `is_active` |
| `articles` | Blog posts & tutorials | `id`, `title`, `slug`, `content`, `status`, `views_count`, `featured` |
| `wallpapers` | HD/4K wallpapers | `id`, `name`, `preview_url`, `download_url`, `resolution`, `downloads_count` |
| `contact_messages` | Inbound contact submissions | `id`, `name`, `email`, `subject`, `message`, `status` (`UNREAD`, `READ`, `ARCHIVED`) |
| `site_settings` | Dynamic runtime settings | `key` (`maintenance_mode`, `active_support_sessions`, `deleted_support_sessions`, `homepage_settings`), `value` (JSONB/Text) |
| `audit_logs` | Admin activity logs | `id`, `admin_id`, `action`, `entity_type`, `entity_id`, `old_data`, `new_data` |

---

## 4. Authentication Flow

1. **Authentication Engine:** Supabase Auth handles email/password registration, password recovery, and OAuth.
2. **Client State (`src/lib/auth/auth-context.tsx`):**
   - `AuthProvider` monitors session state via `supabase.auth.onAuthStateChange` and `supabase.auth.getUser()`.
   - Fetches the user's role from `public.profiles`.
3. **Session Security & Auto-Logout:**
   - **Tab/Browser Close:** Tracks session liveness via `sessionStorage` key `nammatech_session_alive`. If a session exists in Supabase storage without the session token, it auto-terminates to protect public computers.
   - **Window Minimize / Tab Blur:** Listens to `visibilitychange`. If the browser tab is hidden or window minimized for > 1.5 seconds, the user is logged out automatically.
4. **Presence Tracking:**
   - Active sessions send a heartbeat to `/api/user/heartbeat` every 60 seconds to update online status in `profiles`.
5. **Route Protection (`src/proxy.ts`):**
   - Intercepts requests on Next.js Edge proxy.
   - `/admin/*` routes require authenticated sessions where user email is listed in `ADMIN_EMAILS` or `profile.role IN ('ADMIN', 'SUPER_ADMIN')`. Non-admins are redirected to `/admin/login` or `/`.
   - `/account/*` routes redirect unauthenticated users to `/auth/login`.

---

## 5. Payment Flow (Direct UPI / Zero Fees)

1. **Cart & Checkout Initiation (`/checkout`):**
   - Cart stored in `localStorage` via `CartProvider`.
   - Supports both authenticated users and **Guest Checkout** (requires name & 10-digit Indian WhatsApp number).
   - Client calls `/api/checkout/create-order` with resource IDs and optional coupon code.
   - Server validates prices from the database (never trusts client price) and checks for prior ownership.
2. **Free Order Bypass:**
   - If total is ₹0 (100% discount or free items), order is marked `PAID` immediately, and entitlements are granted without payment steps.
3. **Paid Orders & UPI QR Display:**
   - Order created with `PENDING` status.
   - Client renders an interactive UPI QR code encoded with VPA: `muthurajc@slc` and exact order total.
   - Buyer scans with any UPI app (GPay, PhonePe, Paytm, BHIM) and completes the payment.
4. **UTR Submission:**
   - Buyer enters the 12-digit UPI Transaction Reference (UTR) number.
   - Sent to `/api/payments/submit-utr` or `/api/checkout/verify` with `pendingOnly: true`.
   - Order records the UTR under `payment_id` and remains `PENDING`.
5. **Admin Verification & Entitlement Granting:**
   - Admin views pending transactions in `/admin/orders` or `/admin/payments`.
   - Once bank receipt is verified, admin clicks "Verify & Grant Access" (`/api/admin/payments`).
   - Order status is updated to `PAID`.
   - Active entitlement records are inserted into `public.entitlements`.
   - For guest orders, a unique 32-character `access_token` is generated, allowing access via `/access` without an account.

---

## 6. Storage & R2 Flow

1. **Primary Architecture — Direct Database Links:**
   - Download URLs (Google Drive, Mega, Mediafire, official mirrors) are stored directly in `public.download_links`.
   - Zero storage or egress costs.
2. **Cloudflare R2 Secondary / Fallback (`src/lib/r2/`):**
   - S3-compatible client (`@aws-sdk/client-s3`) configured with `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET_NAME`.
   - Generates presigned download URLs with 15-minute expiration (`generateDownloadPresignedUrl`) and upload presigned URLs (`generateUploadPresignedUrl`).
3. **Protected Download Endpoint (`/api/downloads/signed-url`):**
   - Accepts `resourceId`, optional `linkId`, `r2Key`, or guest `accessToken`.
   - Verifies resource status is `PUBLISHED`.
   - For paid resources, checks either authenticated user's `entitlements` or guest `accessToken` (checking expiration).
   - If user is entitled, returns the direct URL or generates an R2 presigned URL.
   - Logs the download event to `public.downloads` for analytics.

---

## 7. Important Environment Variables

| Variable | Environment | Purpose |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public / Server | Supabase project URL (`https://rixdlxqktshrwjbaxxcz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public / Client | Supabase anonymous public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Supabase administrative service role key (bypasses RLS) |
| `NEXT_PUBLIC_SITE_URL` | Public / Server | Production base URL (`https://www.techsavvymuthuraj.dev`) |
| `NEXT_PUBLIC_SITE_NAME` | Public | Site title ("NammaTech") |
| `DEFAULT_CURRENCY` | Server / Client | Default currency code (`INR`) |
| `ADMIN_EMAILS` | Server only | Comma-separated admin emails (`techsavvy.muthuraj.dev@gmail.com`) |
| `NEXT_PUBLIC_ADMIN_EMAILS` | Client only | Admin email list for client UI privileges |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID`| Public | Google AdSense publisher ID (`ca-pub-1960459798233871`) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`| Public | Google Analytics 4 tracking ID (`G-0PV54Y30XS`) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`| Public | Cloudflare Turnstile anti-bot widget site key |
| `TURNSTILE_SECRET_KEY` | Server only | Cloudflare Turnstile server verification secret |
| `WEB3FORMS_ACCESS_KEY` | Server only | Web3Forms email submission key for contact messages |
| `R2_ACCOUNT_ID` *(optional)* | Server only | Cloudflare R2 Account ID |
| `R2_ACCESS_KEY_ID` *(optional)*| Server only | Cloudflare R2 Access Key ID |
| `R2_SECRET_ACCESS_KEY` *(opt)*| Server only | Cloudflare R2 Secret Access Key |
| `R2_BUCKET_NAME` *(optional)* | Server only | Cloudflare R2 Bucket Name |

---

## 8. Current Known Issues

1. **React 19 / Compiler Ref Rules in Linting:**
   - `src/app/technicalsupport/technical-support-client.tsx` (line 1666): `deletedSessionIdsRef.current` is accessed during render (`react-hooks/refs`).
   - `src/components/support/live-support-chat.tsx` (line 1219): Ref accessed during render.
2. **Conditional Hook Calls in `youtube-showcase.tsx`:**
   - Lines 101, 102, 105: `useState` and `useEffect` are invoked after an early return statement (`react-hooks/rules-of-hooks`).
3. **JSX Text Escaping in `theme-customizer.tsx`:**
   - Line 256: Unescaped quote characters (`"`) in JSX text.
4. **Lint Type & Const Declarations:**
   - `Galaxy.tsx` and `Hyperspeed.tsx` have `prefer-const` and TypeScript `Function` type lint warnings.
5. **Client Navigation Warnings:**
   - Direct `window.location.href` assignments in `src/lib/auth/auth-context.tsx` trigger Next.js navigation warnings (`@next/next/no-location-assign-relative-destination`).
6. **Support Chat Cross-Region Sync:**
   - `SupportChatStore` synchronizes sessions via Supabase `site_settings` polling (~1.2s interval); under high multi-region concurrency, Supabase Realtime WebSocket broadcast could provide lower latency than polling.

---

## 9. Current Task & Git Status

### Uncommitted Git Changes
- **`src/components/navigation/header.tsx`**: Re-architected navbar into an Awwwards / Apple-tier "Fluid Island" with a double-bezel concentric capsule shell, top specular glass highlight, dynamic scroll compaction, pill link capsules with glowing badges, button-in-button nested CTA with arrow token, and morphing mobile hamburger animation.
- **`src/app/(public)/page.tsx`**: Removed "Browse by Category" preview section as well as the platform metrics & filter strip, and cleaned up redundant category and count queries.
- **`src/app/(public)/request/page.tsx`**: Added discovery internal linking strip after successful request submission and at page footer (links to `/movies`, `/explore`, `/free`, `/contact`) to minimize bounce rates.
- **`src/app/sitemap.ts`**: Enriched XML sitemap with image metadata (`images: [res.thumbnail_url]`, `images: [art.cover_image]`) and dedicated cinema routes for search engine indexing.

### Database Migration Status
- The `resource_requests` table was created and verified live in the Supabase production database.

### Next Steps & Instructions
- Landing page navbar redesigned into premium fluid island.
- "Browse by Category" removed from the homepage.
- Ready for next instruction.
