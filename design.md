# ILAI E-Commerce Website - Design System & UI Architecture (`design.md`)

## 1. Design Philosophy
The ILAI web interface is built **mobile-first** to serve visitors arriving primarily from Instagram and social channels on mobile devices. The visual direction is **natural, clean, calm, and trustworthy**, emphasizing plant-based sustainability with high white space, smooth interactions, and clear call-to-actions.

---

## 2. Branding & Theme Configuration

All visual parameters, brand colors, typography tokens, logo definitions, and contact channels are consolidated into a single configuration file (`src/config/site.ts`).

### 2.1 Color Palette
- **Primary (Deep Leaf Green)**: `#1E4D3B` (Tailwind class custom or `emerald-900`/`teal-900`) - Represents natural banana fibre and eco-sustainability.
- **Secondary / Accent (Soft Lavender)**: `#8B5CF6` / `#E8DFF5` (Soft lavender background tone `#F3E8FF` / `#F5F0FF`) - Calming, gentle accent for highlight badges and subtle backgrounds.
- **Background**: `#FDFDFD` / `#FAFAFA` - Clean, soft off-white background with high contrast readability.
- **Text**: Primary `#1F2937` (Slate 800), Secondary `#4B5563` (Slate 600), Light `#9CA3AF` (Slate 400).
- **Status Colors**:
  - Confirmed: `#3B82F6` (Blue)
  - Packed: `#8B5CF6` (Purple)
  - Shipped: `#F59E0B` (Amber)
  - Delivered: `#10B981` (Emerald)
  - Cancelled: `#EF4444` (Red)

### 2.2 Logo Specification
- Brand Name: `ilai`
- Tamil Translation: `இலை`
- Header rendering: `<span className="font-bold text-2xl tracking-tight text-emerald-950">ilai</span> <span className="text-sm font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full ml-1">இலை</span>`

---

## 3. UI Components Architecture

### 3.1 Global Navigation Bar
- Top bar with announcement ticker ("🌿 Eco-Friendly Biodegradable Sanitary Pads made from Banana Fibre & Water Hyacinth").
- Mobile menu drawer + Desktop header with links: Home, Shop, About, Contact.
- Floating/Sticky Cart button with dynamic badge count.

### 3.2 Feature Highlight Cards
Grid of 4 cards on the Home page:
1. 🌱 **Plant-Fibre Based**: Banana fibre & water hyacinth.
2. ♻️ **Biodegradable**: Eco-friendly disposal & breakdown.
3. ☁️ **Comfortable & Absorbent**: Gentle care designed for everyday confidence.
4. 🏷️ **Affordable**: Premium natural protection at just ₹40 per pack.

### 3.3 Product Detail Components
- Interactive Image Carousel / High-Res Placeholder.
- Pack counter: `6 Pads / Pack`.
- Price display: `₹40` with taxes included badge.
- Quantity selector: `[ - ]  quantity  [ + ]` with min 1, max 10.
- Dual Action buttons:
  - `Add to Cart` (Outlined Leaf Green button)
  - `Buy Now` (Solid Leaf Green button with instant checkout redirect)
- Accordion / Tabs for:
  - Description & Materials
  - Size & Absorbency (`To be updated after testing`)
  - How to Use & Disposal Guide
  - Why ILAI

### 3.4 Order Progress Stepper Component
Visual progress stepper on `/track`:
```
[ Confirmed ] ----> [ Packed ] ----> [ Shipped ] ----> [ Delivered ]
```
Each node displays:
- Active / Completed icon checkmark
- Step title
- Timestamp if completed

### 3.5 Admin Dashboard UI
- Metrics Cards (Total Orders, Total Revenue, Pending Deliveries, Low Stock Alert).
- Filter bar (Status tabs, Search input, CSV export button).
- Data Table with expandable rows for item details and tracking number updates.
