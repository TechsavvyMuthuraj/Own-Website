# NammaTech - Production Digital Resource & Technical Support Platform

> **"All you need. One place."**  
> A high-performance, legally authorized digital resource distribution platform with a dedicated sub-second realtime Technical Support Command Center.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase (PostgreSQL with RLS & Auth)**, **Cloudflare R2 (Private Presigned S3 Storage)**, and **Web Audio API Realtime Synthesized Support Engine**.

---

## 📑 Table of Contents
1. [Core Principles & Zero Mock Data Policy](#-core-principles--zero-mock-data-policy)
2. [Ultra-Low Latency & Realtime Sync Engine](#-ultra-low-latency--realtime-sync-engine)
3. [Live Technical Support Architecture (`/technicalsupport`)](#-live-technical-support-architecture)
4. [Complete Page Route Guide](#-complete-page-route-guide)
5. [Complete API Endpoints Directory](#-complete-api-endpoints-directory)
6. [Technology Stack](#-technology-stack)
7. [Database Schema & Row Level Security](#-database-schema--row-level-security)
8. [Storage & Secure Presigned Downloads (Cloudflare R2)](#-storage--secure-presigned-downloads)
9. [Payment Gateway & Idempotent Verification](#-payment-gateway--idempotent-verification)
10. [Environment Variables Reference](#-environment-variables-reference)
11. [Setup, Migration & Local Development](#-setup-migration--local-development)
12. [Production Build & Quality Verification](#-production-build--quality-verification)
13. [Support & Contact Information](#-support--contact-information)

---

## 🛡️ Core Principles & Zero Mock Data Policy

NammaTech is engineered with strict production integrity standards:
- **Zero Mock Fallbacks**: Hardcoded fallbacks such as `downloads || 12500` or fake user reviews are strictly prohibited. All metrics, download counts, and ratings are queried directly from Supabase PostgreSQL.
- **Real-Time Data Feeds**: Empty databases show clean, informative empty states rather than fictitious items.
- **Cryptographic Trust**: Payment signatures (HMAC SHA-256) and presigned download tokens are strictly verified server-side.
- **Auditable Operations**: All administrative mutations (resource edits, duty toggles, order verifications) append immutable records to the audit log.

---

## ⚡ Ultra-Low Latency & Realtime Sync Engine

To deliver near-instant response across the entire application without the overhead and connection instability of continuous WebSocket dropouts on serverless runtimes, NammaTech uses an **Optimized Tiered Polling Architecture** paired with in-memory singleton state caching:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            NAMMATECH SYNC ENGINE                            │
└─────────────────────────────────────────────────────────────────────────────┘
          │                                              │
          ▼                                              ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│     CLIENT / USER CHAT       │              │    SPECIALIST DASHBOARD      │
│  - Active Polling: 600ms     │              │  - Queue Refresh: 800ms      │
│  - Debounced Typing: 1800ms  │              │  - Active Chat Sync: 500ms   │
│  - Audio Chime Trigger       │              │  - Audio Incoming Chime      │
│  - Non-Jarring Smooth Scroll │              │  - Browser Tab Alert Flash   │
└──────────────┬───────────────┘              └──────────────┬───────────────┘
               │                                             │
               ▼                                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     NEXT.JS API ROUTE HANDLERS (/api/...)                   │
│          - GET/POST/PATCH/DELETE /api/support/chat                         │
│          - GET/PATCH /api/support/requests                                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│            GLOBAL IN-MEMORY SINGLETON STORE (support-chat-store.ts)         │
│  - Map<string, SupportSession> with cross-module persistence                │
│  - Microsecond memory reads & writes (< 0.1ms compute overhead)             │
│  - Auto-expiring typing status (3500ms safety horizon)                      │
│  - Message reaction maps and user rating aggregators                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Sync Frequency Specifications
| Channel | Interval | Latency Target | Description |
| :--- | :--- | :--- | :--- |
| **Active Chat Stream** | `500ms` | `< 10ms render` | Active specialist viewing the user's ongoing conversation |
| **User Support Widget** | `600ms` | `< 15ms render` | End-user waiting for specialist reply or diagnostic advice |
| **Specialist Queue** | `800ms` | `< 25ms render` | Specialist queue list & resource request notification badges |
| **In-Memory Store Lookup** | Instant | `< 0.1ms` | In-process singleton hash table lookup (`global.__nammatech_support_sessions__`) |

---

## 🎧 Live Technical Support Architecture

The Technical Support Center provides end-to-end communication between users experiencing installation, game error, or licensing issues, and on-duty specialists.

### 1. Specialist Authentication & Duty Gateway (`/technicalsupport`)
Specialists access the dashboard without cumbersome password resets:
- The system verifies the input email against the active roster stored in Supabase `site_settings.technical_support_team`.
- Configured administrators listed in `NEXT_PUBLIC_ADMIN_EMAILS` (default: `techsavvy.muthuraj.dev@gmail.com`) automatically possess full Lead Architect & Support Head permissions.
- Specialists toggle their duty status between **ON_DUTY** (green pulse), **BUSY** (amber ping with queue counter), and **OFF_DUTY** (purple offline indicator).

### 2. Three-Pane Specialist Command Center
- **Pane 1 (Left): Triage & Queue Switcher**
  - **Live Chat Queue**: Real-time incoming conversations sorted by newest activity, displaying unread counter badges, user category tags, and online status.
  - **Resource Requests Hub**: Triage user requests for missing repacks, games, software, and tools. Specialists update request statuses directly (`PENDING`, `IN_PROGRESS`, `FULFILLED`, `REJECTED`).
- **Pane 2 (Center): Active Realtime Conversation Console**
  - Instant message feed with sender distinction (User, Specialist, System).
  - Code and terminal crash log viewer with syntax styling and one-click copy.
  - **User Typing Indicator**: Shows animated pulsing bubble when user is actively composing a message.
  - **Quick Response Tray**: Canned macros for common resolutions (7-Zip passwords, Defender exclusions, DirectX runtimes, mirror links).
  - Quick action toolbar: Mark status (`ACTIVE`, `WAITING`, `RESOLVED`), Clear session history, and Export transcript.
- **Pane 3 (Right): Specialist Profile & Live Diagnostic Info**
  - Specialist badge, shift hours, contact direct line (`+91 99448 75726`), active ticket counters, and satisfaction rating metrics.
  - User ticket metadata: Email, session ID, category, queue duration, and user satisfaction score.

### 3. Synthesized Web Audio Alerts (`chat-audio.ts`)
No external `.mp3` or `.wav` files to download or fail over CDN:
- **Incoming Message Chime**: Dual-tone sine wave arpeggio (880Hz → 1174.66Hz, high C/D) generated purely in-browser via `AudioContext` oscillators.
- **Message Sent Chime**: Soft confirmation tone (523.25Hz → 659.25Hz).
- **Tab Title Flashing**: Flashes dynamic alerts in browser tabs when inactive so specialists never miss urgent tickets.
- **Mute Control**: Persisted audio preferences in `localStorage`.

---

## 🗺️ Complete Page Route Guide

### 🌐 Public Experience Routes
| Route | Component / Path | Description |
| :--- | :--- | :--- |
| `/` | `src/app/(public)/page.tsx` | Homepage featuring trending repacks, category carousels, announcement bar, live stats, and quick search. |
| `/explore` | `src/app/(public)/explore/page.tsx` | Catalog browser with multi-filter sorting (category, license type, size, date). |
| `/categories` | `src/app/(public)/categories/page.tsx` | Directory of all available software, game, and development categories. |
| `/category/[slug]` | `src/app/(public)/category/[slug]/page.tsx` | Filtered resource listings belonging to a specific taxonomy. |
| `/resource/[slug]` | `src/app/(public)/resource/[slug]/page.tsx` | Comprehensive resource detail page: file size, architecture, checksums, screenshots, and install notes. |
| `/resource/[slug]/download` | `src/app/(public)/resource/[slug]/download/page.tsx` | Secure download gateway generating presigned Cloudflare R2 links. |
| `/free` | `src/app/(public)/free/page.tsx` | Dedicated hub for freeware, open-source utilities, and developer tools. |
| `/premium` | `src/app/(public)/premium/page.tsx` | High-value templates, commercial assets, and VIP speed mirror packages. |
| `/new-and-updated` | `src/app/(public)/new-and-updated/page.tsx` | Real-time changelog of newly uploaded and patched resources. |
| `/articles` | `src/app/(public)/articles/page.tsx` | Installation guides, troubleshooting articles, and system optimization tips. |
| `/movies` | `src/app/(public)/movies/page.tsx` | Authorized media content, tutorials, and digital trailers. |
| `/request` | `src/app/(public)/request/page.tsx` | Resource request form allowing users to submit software/game requests. |
| `/search` | `src/app/(public)/search/page.tsx` | Full-text search with instant highlight and category filtering. |
| `/cart` | `src/app/(public)/cart/page.tsx` | Shopping cart with duplicate purchase detection and promo code engine. |
| `/checkout` | `src/app/(public)/checkout/page.tsx` | Razorpay and UPI checkout gateway with live order calculation. |
| `/contact` | `src/app/(public)/contact/page.tsx` | Direct contact form logged to database and support dispatch. |
| `/about` | `src/app/(public)/about/page.tsx` | Company transparency, open-source mission, and infrastructure overview. |
| `/disclaimer` | `src/app/(public)/disclaimer/page.tsx` | Safe distribution disclaimer and legal freeware provisions. |
| `/dmca` | `src/app/(public)/dmca/page.tsx` | Formal DMCA copyright compliance notice and takedown contact details. |
| `/privacy-policy` | `src/app/(public)/privacy-policy/page.tsx` | User data handling, cookie usage, and storage retention policy. |
| `/terms` | `src/app/(public)/terms/page.tsx` | Terms of service and software end-user licensing policies. |
| `/refund-policy` | `src/app/(public)/refund-policy/page.tsx` | Clear digital purchase and billing dispute guidelines. |
| `/cookie-policy` | `src/app/(public)/cookie-policy/page.tsx` | Transparent cookie usage disclosure and user consent details. |

### 👤 User Account Routes (`/account`)
| Route | Description |
| :--- | :--- |
| `/account` | User overview with quick access to owned items and security settings. |
| `/account/downloads` | Permanent access library of purchased and bookmarked download links. |
| `/account/orders` | Complete transaction history, invoices, and payment receipts. |
| `/account/favorites` | Bookmarked resources saved for quick access. |
| `/account/profile` | Profile customization (display name, avatar, email preferences). |

### 🛠️ Technical Support Center
| Route | Description |
| :--- | :--- |
| `/technicalsupport` | Dedicated full-screen technical support console with 3-pane specialist workflow, sub-second polling, live audio alerts, and triage tools. |

### 👑 Protected Administration Console (`/admin`)
| Route | Management Scope |
| :--- | :--- |
| `/admin` | Real-time analytics: revenue, downloads, active sessions, and system health. |
| `/admin/resources` | Full CRUD operations for digital resources, file versioning, and mirror links. |
| `/admin/categories` | Taxonomy management with custom slugs and Lucide icons. |
| `/admin/orders` | Order reconciliation, Razorpay status checks, and manual UPI approvals. |
| `/admin/coupons` | Promotional discounts, expiry dates, and usage caps. |
| `/admin/support-team` | Manage technical support specialist roster, duty assignments, and roles. |
| `/admin/requests` | Review, approve, or reject user-submitted software and game requests. |
| `/admin/announcements` | Dynamic top-banner announcement broadcast with expiration dates. |
| `/admin/ads` | Ad banner placement manager with click tracking and visibility toggles. |
| `/admin/messages` | Inbox for public contact submissions with resolution statuses. |
| `/admin/users` | User directory, permission management (`USER`, `VIP`, `ADMIN`). |
| `/admin/articles` | Knowledgebase and blog article CMS with rich markdown support. |
| `/admin/movies` | Media content manager for video tutorials and guides. |
| `/admin/wallpapers` | Wallpaper catalog manager with high-resolution image uploads. |
| `/admin/homepage` | Homepage curation (featured items, spotlight banners, and hero text). |
| `/admin/audit-logs` | Tamper-evident administrative audit log feed. |
| `/admin/settings` | System-wide parameters, maintenance mode toggle, and platform branding. |
| `/admin/login` | Secure administrator access portal. |

---

## 📡 Complete API Endpoints Directory

### 1. Live Support & Messaging (`/api/support`)
- **`GET /api/support/chat`**
  - Query Params: `sessionId` (string, optional), `all` ("true", optional)
  - `all=true`: Returns all active sessions and overall team duty status (Specialist view).
  - `sessionId=X`: Returns active session state, unread counts, and queue position (User view).
- **`POST /api/support/chat`**
  - Payload: `{ sessionId, userName, userEmail, category, sender: "user"|"admin", text, codeSnippet }`
  - Appends message to in-memory store and pushes unread badge increments.
- **`PATCH /api/support/chat`**
  - Actions supported:
    - `"typing"`: Updates user/admin typing status (`{ sessionId, action: "typing", sender, isTyping }`).
    - `"read"`: Marks all messages read for specified reader (`{ sessionId, action: "read", reader: "user"|"admin" }`).
    - `"status"`: Updates status to `ACTIVE`, `WAITING`, or `RESOLVED`.
    - `"reaction"`: Toggles emoji reactions on messages (`{ sessionId, action: "reaction", messageId, emoji }`).
    - `"rate"`: Submits star rating and feedback (`{ sessionId, action: "rate", rating, feedback }`).
    - `"clear"`: Clears message history and resets session.
- **`DELETE /api/support/chat?sessionId=X`**
  - Removes session permanently from the active memory store.
- **`GET /api/support/requests`**
  - Fetches list of all pending and processed resource requests.
- **`PATCH /api/support/requests`**
  - Updates status (`PENDING`, `IN_PROGRESS`, `FULFILLED`, `REJECTED`) of a resource request.

### 2. Admin Operations (`/api/admin`)
- **`GET /api/admin/support-team`**: Retrieves the list of authorized technical support specialists and on-duty metrics.
- **`POST /api/admin/support-team`**: Adds a new support specialist with designated shift hours, phone, and role.
- **`PATCH /api/admin/support-team`**: Updates duty status (`ON_DUTY`, `BUSY`, `OFF_DUTY`) or profile details.
- **`DELETE /api/admin/support-team?id=X`**: Removes a specialist from the active roster.

### 3. Checkout, Payments & Webhooks (`/api/checkout`, `/api/payments`)
- **`POST /api/checkout`**: Creates a verified Razorpay order with currency and receipt metadata.
- **`POST /api/payments/verify`**: Validates client-submitted HMAC SHA256 payment signature.
- **`POST /api/webhooks/razorpay`**: Idempotent webhook handler ensuring instant entitlement provisioning upon payment success.

### 4. Digital Downloads & Storage (`/api/downloads`)
- **`POST /api/downloads/generate`**: Validates user entitlement or free access, generates an expiring presigned Cloudflare R2 S3 download URL (valid for 15 minutes), and logs the download event.

### 5. Content & Feedback (`/api/contact`, `/api/coupons`, `/api/requests`)
- **`POST /api/contact`**: Validates and inserts contact messages into Supabase.
- **`POST /api/coupons/validate`**: Checks coupon code validity, discount percentage, and expiry caps.
- **`POST /api/requests`**: Allows users to submit game/software upload requests.

---

## 💻 Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Server Actions, Route Handlers) |
| **Language** | TypeScript (Strict Mode enabled) |
| **Database & Auth** | Supabase Cloud (PostgreSQL 15+, Row Level Security, SSR Cookies) |
| **Cloud Storage** | Cloudflare R2 Object Storage (`@aws-sdk/client-s3`) |
| **Audio Engine** | HTML5 Web Audio API (Synthesized Oscillators, zero media file dependencies) |
| **Styling** | Tailwind CSS v4 with unified CSS custom properties |
| **Icons & UI** | Lucide React, Framer Motion |
| **Payments** | Razorpay Node SDK with HMAC SHA256 verification |

---

## 🗄️ Database Schema & Row Level Security

The platform utilizes a normalized PostgreSQL schema managed under Supabase:

1. **`profiles`**: User metadata, roles (`USER`, `VIP`, `ADMIN`), and contact phone numbers.
2. **`categories`**: Taxonomy records with slugs and display ordering.
3. **`resources`**: Master digital assets table containing file sizes, versions, mirror URLs, and flags.
4. **`orders`**: Transaction records with status (`PENDING`, `COMPLETED`, `FAILED`), payment gateway IDs, and totals.
5. **`order_items`**: Individual entitlements linked to orders.
6. **`download_logs`**: Tamper-proof logs tracking IP, user ID, and download timestamp.
7. **`resource_requests`**: Software and game requests submitted by users.
8. **`site_settings`**: Key-value system configurations, including `technical_support_team`.
9. **`contact_messages`**: Public contact form submissions.
10. **`audit_logs`**: Complete audit trail of administrative actions.

All tables are protected by strict **Row Level Security (RLS)** policies ensuring users can only read and write their own data, while service role keys remain strictly server-side.

---

## ☁️ Storage & Secure Presigned Downloads

Digital downloads are secured using **Cloudflare R2**:
- The storage bucket is **private**; direct public reads are completely disabled.
- When an authorized user initiates a download:
  1. Server checks entitlement (free resource or completed order).
  2. Increments the resource download counter in Supabase.
  3. Uses `@aws-sdk/client-s3` to generate a presigned download URL expiring in **15 minutes**.
  4. Redirects the browser to Cloudflare's ultra-fast global CDN edge.

---

## 💳 Payment Gateway & Idempotent Verification

- **Razorpay Order Creation**: Amounts are strictly computed server-side to prevent price tampering.
- **HMAC Signature Check**: Client returns `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`. The server recalculates `HMAC_SHA256(order_id + "|" + payment_id, secret)` and validates before fulfilling.
- **Duplicate Prevention**: The system checks existing user entitlements before allowing duplicate purchases of the same digital product.

---

## ⚙️ Environment Variables Reference

Create a `.env.local` file in the project root:

```env
# ── Supabase Configuration ──
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# ── Cloudflare R2 Object Storage ──
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=your-r2-bucket-name
R2_PUBLIC_DOMAIN=https://your-custom-cdn-domain.com

# ── Razorpay Payment Gateway ──
PAYMENT_KEY_ID=rzp_live_your_key_id
PAYMENT_KEY_SECRET=your_razorpay_key_secret
PAYMENT_WEBHOOK_SECRET=your_webhook_secret

# ── Technical Support & Administration ──
NEXT_PUBLIC_ADMIN_EMAILS=techsavvy.muthuraj.dev@gmail.com
NEXT_PUBLIC_SUPPORT_PHONE=+91 99448 75726
```

---

## 🚀 Setup, Migration & Local Development

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/TechsavvyMuthuraj/Own-Website.git
cd "Website build"
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your real API credentials
```

### 3. Run Database Migrations
Open your Supabase SQL Editor and execute:
```text
supabase/migrations/001_initial_schema.sql
```

### 4. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Production Build & Quality Verification

Run these verification commands before deploying:

```bash
# 1. Strict TypeScript Compile Check (Ensures 0 compile errors)
npx tsc --noEmit

# 2. ESLint Code Analysis
npm run lint

# 3. Production App Router Build
npm run build

# 4. Start Production Server
npm run start
```

---

## 📞 Support & Contact Information

For technical inquiries, emergency server escalations, or licensing partnerships:

- **Lead Architect & Developer**: Muthuraj C
- **Primary Email**: [techsavvy.muthuraj.dev@gmail.com](mailto:techsavvy.muthuraj.dev@gmail.com)
- **Direct Phone / WhatsApp**: `+91 99448 75726`
- **Technical Support Hub**: [/technicalsupport](http://localhost:3000/technicalsupport)
- **Repository**: [TechsavvyMuthuraj/Own-Website](https://github.com/TechsavvyMuthuraj/Own-Website)

---

*© 2026 NammaTech. All rights reserved. Built with integrity, performance, and real-time reliability.*