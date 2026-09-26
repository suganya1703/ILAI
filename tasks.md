# ILAI E-Commerce Website - Implementation Tasks (`tasks.md`)

- [x] **Task 1: Spec-First Documentation**
  - Create `requirements.md`, `design.md`, and `tasks.md`.

- [x] **Task 2: Next.js Project Setup & Dependencies**
  - Initialize Next.js 14 App Router project with TypeScript and Tailwind CSS.
  - Install dependencies: `@supabase/supabase-js`, `razorpay`, `nodemailer`, `lucide-react`, `zod`, `clsx`, `tailwind-merge`.

- [x] **Task 3: Branding, Config & Content Single Sources of Truth**
  - Create `src/config/site.ts` (theme colors, logo "ilai" + Tamil "இலை", contact links).
  - Create `src/config/content.ts` (product text, materials "banana fibre and water hyacinth based", size & absorbency placeholders "To be updated after testing", no proportions or layer structure).

- [x] **Task 4: Database Schema & Seed Scripts**
  - Create `supabase/schema.sql` (tables: `store_settings`, `products`, `orders`, `order_items`, `order_status_history`).
  - Create `supabase/seed.sql` (seed product & initial settings).

- [x] **Task 5: Cart Provider & UI Layout Components**
  - Build `CartProvider` using React Context + `localStorage` persistence.
  - Build `Navbar` (logo, nav links, cart count badge, mobile menu).
  - Build `Footer` (brand story, quick links, support, legal policy links).

- [x] **Task 6: Core Public Pages**
  - Build `Home Page` (`/`) with Hero, 4 Highlights, Product card, Brand introduction.
  - Build `Shop Page` (`/shop`) with quantity selector, Add to Cart, Buy Now, product details tabs.
  - Build `Why ILAI Page` (`/why-ilai`).
  - Build `About Page` (`/about`).
  - Build `Contact Page` (`/contact`) with WhatsApp click-to-chat, email, Instagram links.
  - Build Legal pages (`/privacy-policy`, `/terms`, `/shipping-returns`).

- [x] **Task 7: Cart & Checkout Engine**
  - Build `Cart Page` (`/cart`) with quantity updates and subtotal calculation.
  - Build `Checkout Page` (`/checkout`) with Indian states dropdown, regex validation (10-digit mobile, 6-digit PIN, email), payment option selector (Razorpay vs COD), double-click prevention.

- [x] **Task 8: Backend API Routes & Integrations**
  - `POST /api/checkout`: Server price calculation and order record creation.
  - `POST /api/razorpay/create-order`: Server Razorpay order initialization.
  - `POST /api/razorpay/verify`: Server HMAC-SHA256 signature verification & status transition to Confirmed.
  - `POST /api/orders/track`: Public rate-limited order tracking lookup.
  - Server Gmail SMTP integration for HTML confirmation emails.

- [x] **Task 9: Order Confirmation & Order Tracking**
  - Build `Order Confirmation Page` (`/order-confirmation/[id]`) with Order ID (`ILAI-2026-0001`).
  - Build `Order Tracking Page` (`/track`) with visual progress timeline (Confirmed -> Packed -> Shipped -> Delivered) and courier tracking link.

- [x] **Task 10: Admin Management Portal (`/admin`)**
  - Build `Admin Login Page` (`/admin/login`) with Supabase Auth.
  - Build `Admin Dashboard` (`/admin`) with order search, status filter, status update dropdown, status history log, tracking number assignment, and CSV export.
  - Build `Admin Settings Page` (`/admin/settings`) to dynamically edit price, stock, and delivery charge in the database.

- [x] **Task 11: Validation, Rate-Limiting & Security**
  - Add API rate limiting to `/api/checkout` and `/api/orders/track`.
  - Add SEO metadata and Open Graph tags for Instagram link previews.

- [x] **Task 12: Deployment Guide & Environment Setup**
  - Create `.env.example` with all secret variable placeholders.
  - Create `README.md` with step-by-step setup instructions and a list of all required third-party accounts (Supabase, Razorpay, Gmail SMTP, Vercel).
