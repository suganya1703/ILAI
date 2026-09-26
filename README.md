# ILAI E-Commerce Website (இலை)

A complete, production-ready e-commerce web application for **ILAI**, an eco-friendly biodegradable sanitary pad brand made from **banana fibre and water hyacinth** targeting customers across India.

---

## Tech Stack

- **Framework**: Next.js 14+ (App Router, Server Actions, API Routes) + TypeScript
- **Styling**: Tailwind CSS (Natural Forest Green `#4A7C59` / `#3A8F62`, Warm Ivory `#FAF6F0`, Pure White `#FFFFFF`, Soft Green Tint `#E3EFE6`, Soft Lavender `#C8B8E6`)
- **Database & Auth**: Supabase (PostgreSQL with RLS, Supabase Auth for Admin)
- **Payments**: Razorpay SDK (UPI, Debit/Credit Cards, Netbanking) + Direct UPI QR & Cash on Delivery (COD)
- **Emails**: Gmail SMTP (Server-side HTML order confirmation emails via Nodemailer)
- **Deployment**: Vercel

---

## Key Features

1. **Mobile & Desktop Responsive UX**: Designed for seamless browsing on smartphones, tablets, and desktop computers.
2. **Flagship Product ("ILAI Sanitary Pad")**: 6 pads per pack @ ₹45 (configurable in DB/admin), quantity selector, Add to Cart, Buy Now.
3. **Strict Patent & Content Compliance**:
   - Materials described strictly as *"banana fibre and water hyacinth based"*.
   - Pad size single source constant (`PAD_SIZE_TEXT`): *"To be updated after testing"*.
   - Absorbency single source constant (`ABSORBENCY_TEXT`): *"Target absorbency: 40-50 ml (lab testing in progress)"*.
   - Zero disclosure of fibre proportions, processing methods, or layer structures.
4. **Cart System**: Persisted in `localStorage` (`ilai_cart_v1`).
5. **Server-Authoritative Checkout**:
   - Price & total calculation performed strictly on the server (`/api/checkout`).
   - Strict form validation: 10-digit Indian mobile (`^[6-9]\d{9}$`), 6-digit Indian PIN code (`^\d{6}$`), valid email.
   - Double-click submission protection.
6. **Payment Gateway Integration**:
   - Server-side Razorpay order creation (`/api/razorpay/create-order`).
   - Server-side HMAC-SHA256 signature verification (`/api/razorpay/verify`).
   - Direct UPI QR verification flow and COD support.
7. **Order Confirmation & Email**: Generates unique Order ID format `ILAI-YYYY-XXXX` (e.g. `ILAI-2026-0001`) and sends automated HTML confirmation emails via Gmail SMTP.
8. **Order Tracking (`/track`)**: Public order lookup by Order ID + Mobile with 4-step progress stepper timeline (*Confirmed* -> *Packed* -> *Shipped* -> *Delivered*).
9. **Admin Portal (`/admin`)**:
   - Filter orders by status, search by Order ID / Mobile / Name.
   - Update order status, add courier tracking numbers.
   - Export orders to downloadable CSV file.
   - Edit product price, stock quantity, and delivery fee live from DB without code changes (`/admin/settings`).
10. **Legal & Compliance Pages**: Privacy Policy, Terms & Conditions, Shipping & Returns (required for Razorpay merchant onboarding).

---

## Local Development Quickstart

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/suganya1703/ILAI.git
cd ILAI
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase, Razorpay, and Gmail SMTP credentials in `.env.local`.

### 3. Database Schema & Seeding
Execute `supabase/schema.sql` and `supabase/seed.sql` in your Supabase SQL Editor.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Step-by-Step Account Setup Guide

### 1. Supabase (Database & Auth)
1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Click **New Project** and name it `ilai-ecommerce`. Select region `South Asia (Mumbai)`.
3. Under **Project Settings > API**, copy the following:
   - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` -> `SUPABASE_SERVICE_ROLE_KEY`
4. Open the **SQL Editor** tab in Supabase dashboard:
   - Paste and run the contents of `supabase/schema.sql`.
   - Paste and run the contents of `supabase/seed.sql`.

---

### 2. Razorpay (Payment Gateway)
1. Go to [razorpay.com](https://razorpay.com) and sign up for a merchant account.
2. Activate **Test Mode** from the top menu bar.
3. Go to **Account & Settings > API Keys > Generate Test Key**.
4. Copy the credentials:
   - `Key ID` (starts with `rzp_test_...`) -> `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - `Key Secret` -> `RAZORPAY_KEY_SECRET`
5. **Testing Razorpay in Test Mode**:
   - Select "Pay Online with Razorpay" at checkout.
   - Use any test UPI ID (e.g. `success@razorpay` or `8888888888@upi`).
   - For Card testing, use card `4111 1111 1111 1111`, any future expiry date, CVV `123`. Click **Success**.

---

### 3. Gmail SMTP (Order Confirmation Emails)
1. In your Google Account, enable 2-Step Verification.
2. Go to **Security** -> **2-Step Verification** -> **App passwords**.
3. Generate a 16-character App Password (e.g. `xxxx xxxx xxxx xxxx`).
4. Set `GMAIL_APP_PASSWORD` in `.env.local`.
5. Verify `GMAIL_SMTP_HOST=smtp.gmail.com`, `GMAIL_SMTP_PORT=587`, and `GMAIL_SMTP_USER=info.ilaiofficial@gmail.com`.

---

### 4. Vercel (Deployment)
1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **Import Project**.
3. Select your repository `suganya1703/ILAI`. Framework preset: **Next.js**.
4. In **Environment Variables**, add all keys from `.env.example`.
5. Click **Deploy**. Vercel will build and deploy your live e-commerce site.

---

## Admin Portal Access

- URL: `/admin/login`
- Authorized Admin Email: `info.ilaiofficial@gmail.com`
- Authentication: Secure PBKDF2 (SHA-512) password hashing via server-side verification.