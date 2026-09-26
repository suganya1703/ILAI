# ILAI E-Commerce Website - Requirements Specification (`requirements.md`)

## 1. Project Overview
ILAI is a sustainable e-commerce brand selling eco-friendly, biodegradable sanitary pads made from **banana fibre and water hyacinth** to customers across India. This website is a full-fledged, production-ready online store with cart persistence, server-authoritative checkout, online payment integration (Razorpay) and Cash on Delivery (COD), automated confirmation emails (Gmail SMTP), order tracking, and an admin management portal.

---

## 2. Technical Stack
- **Framework**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security, Supabase Auth for single admin account)
- **Payment Gateway**: Razorpay (UPI, Debit/Credit Cards, Netbanking) + Cash on Delivery (COD)
- **Email Service**: Gmail SMTP (Server-side HTML order confirmation emails via Nodemailer)
- **Deployment Target**: Vercel (All secrets managed via environment variables)

---

## 3. Strict Content & Patent Constraints
- **Materials Description**: Must ALWAYS be described strictly as `"banana fibre and water hyacinth based"`.
- **Pad Size & Absorbency**: Must ALWAYS use explicit placeholders: `"To be updated after testing"`. No invented numbers, certifications, or medical claims.
- **Patent Safety Guardrail**: DO NOT describe fibre proportions, processing methods, or layer structures anywhere on the site.

---

## 4. Feature Requirements

### 4.1 Navigation & Global UI
- Mobile-first responsive header with logo ("ilai" + Tamil "இலை").
- Links: Home, Shop, About, Contact, Cart icon with live item count badge.
- Footer with quick links, contact info, social links (Instagram), and legal policies required for Razorpay merchant activation (Privacy Policy, Terms & Conditions, Shipping & Returns).

### 4.2 Home Page (`/`)
- Hero section with clear value proposition and "Shop Now" call to action.
- Short ILAI brand introduction.
- Product showcase image (replaceable placeholder).
- 4 Key Feature Highlights with icons:
  1. Plant-Fibre Based
  2. Biodegradable
  3. Comfortable & Absorbent
  4. Affordable

### 4.3 Shop Page (`/shop`)
- Single flagship product: **"ILAI Sanitary Pad"**.
- Pack size: 6 pads per pack.
- Price: ₹40 per pack (loaded dynamically from database).
- Quantity Selector: Range 1 to 10 pads, interactive `- 1 +` buttons.
- Actions: **Add to Cart** (adds item to cart drawer/context) and **Buy Now** (adds item and redirects directly to `/checkout`).
- Product Details Section:
  - Product Description
  - Materials Used (`banana fibre and water hyacinth based`)
  - Pad Size (`To be updated after testing`)
  - Quantity (`6 pads per pack`)
  - Absorbency Information (`To be updated after testing`)
  - How to Use instructions
  - Disposal Instructions
  - Why ILAI is Different

### 4.4 Brand Pages (`/why-ilai` and `/about`)
- **Why ILAI**: Plant-based approach, biodegradable design, affordable menstrual care, sustainability impact.
- **About**: Brand story, mission, vision, founder & team overview.

### 4.5 Cart System (`/cart`)
- State managed via React Context and persisted in `localStorage`.
- Display selected items, item quantities, unit price, item subtotal.
- Ability to modify quantity (1 to 10) or remove item.
- Order Summary: Subtotal + Delivery Charge = Total Amount.
- "Proceed to Checkout" button.

### 4.6 Checkout & Payment Flow (`/checkout`)
- Customer Details Form:
  - Full Name
  - Mobile Number (Strict 10-digit Indian regex validation: `^[6-9]\d{9}$`)
  - Email Address (Valid email format regex)
  - Full Address Line
  - City
  - State (Dropdown select containing all 28 Indian States and 8 Union Territories)
  - PIN Code (Strict 6-digit Indian PIN code regex: `^\d{6}$`)
- Order Summary displaying items, subtotal, server-calculated delivery charge, total.
- Payment Option Selector:
  - **Pay Online (Razorpay)**: UPI, Cards, Netbanking
  - **Cash on Delivery (COD)**: Payment status set to `pending`, order status `Confirmed`.
- Server-side Security:
  - Prices and totals are computed strictly on the server (`/api/checkout`). Client price parameters are ignored.
  - Double-click prevention (submit button disabled during pending request + idempotency check).
  - Razorpay order creation on server (`/api/razorpay/create-order`).
  - Razorpay HMAC-SHA256 signature verification on server (`/api/razorpay/verify`).

### 4.7 Order Confirmation (`/order-confirmation/[id]`)
- Display thank-you message.
- Order ID format: `ILAI-YYYY-XXXX` (e.g. `ILAI-2026-0001`).
- Summary of ordered items, total amount paid / to be collected on delivery, delivery address, order status, payment status.
- Trigger server-side confirmation email via Gmail SMTP to customer email.

### 4.8 Order Tracking (`/track`)
- Input fields: Order ID (`ILAI-YYYY-XXXX`) + Mobile Number.
- Visual stepper timeline:
  1. Order Confirmed
  2. Packed
  3. Shipped
  4. Delivered
- Display timestamp for each completed state, courier name, and tracking link if available.

### 4.9 Admin Panel (`/admin`)
- Protected route using Supabase Auth (single admin user credentials).
- Order Management Table:
  - Search by Order ID, Customer Name, or Mobile.
  - Filter by status (`All`, `Confirmed`, `Packed`, `Shipped`, `Delivered`, `Cancelled`).
  - Status updater modal/dropdown with history timeline logging.
  - Add courier name & tracking number.
  - Export orders to downloadable CSV file.
- Store Settings Editor (`/admin/settings`):
  - Edit product price, stock quantity, and flat delivery fee stored in Supabase DB.

### 4.10 Customer Support & Legal Pages
- Contact page (`/contact`) with WhatsApp click-to-chat button, support email, Instagram link.
- Mandatory legal pages (`/privacy-policy`, `/terms`, `/shipping-returns`).

---

## 5. Non-Functional Requirements
- **Performance**: Mobile-first responsive design, fast load times, optimized SVG graphic placeholders.
- **Security**: Server-authoritative price calculation, Razorpay webhook/verification signature checks, rate-limiting on order creation & tracking endpoints.
- **SEO & Social**: Meta tags, Open Graph card tags (`og:title`, `og:description`, `og:image`) for Instagram link previews.
