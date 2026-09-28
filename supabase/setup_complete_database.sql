-- ==============================================================================
-- ILAI E-COMMERCE: COMPLETE SUPABASE SETUP SCRIPT (FOR NEW OR EXISTING PROJECTS)
-- ==============================================================================
-- Paste this entire file into your Supabase SQL Editor and click "Run" (green button).
-- It will create all tables, indexes, security policies, and initial store settings.
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Store Settings Table (Single-row configuration)
CREATE TABLE IF NOT EXISTS store_settings (
  id INT PRIMARY KEY DEFAULT 1,
  delivery_charge NUMERIC(10,2) NOT NULL DEFAULT 40.00,
  free_delivery_threshold NUMERIC(10,2) DEFAULT 0.00,
  min_packs_per_order INT NOT NULL DEFAULT 1,
  cod_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  cod_min_order_value NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  estimated_delivery_time TEXT NOT NULL DEFAULT '2-5 working days',
  allowed_pincodes TEXT DEFAULT '',
  store_contact_email TEXT NOT NULL DEFAULT 'info.ilaiofficial@gmail.com',
  store_whatsapp TEXT NOT NULL DEFAULT '+918300815220',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row_check CHECK (id = 1)
);

-- Seed initial settings row if not present
INSERT INTO store_settings (id, delivery_charge, min_packs_per_order, cod_enabled, estimated_delivery_time, store_contact_email, store_whatsapp)
VALUES (1, 40.00, 1, TRUE, '2-5 working days', 'info.ilaiofficial@gmail.com', '+918300815220')
ON CONFLICT (id) DO NOTHING;

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 45.00,
  pack_quantity INT NOT NULL DEFAULT 6,
  stock_quantity INT NOT NULL DEFAULT 100,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default product
INSERT INTO products (id, slug, name, subtitle, price, pack_quantity, stock_quantity, is_available)
VALUES (
  'e2b4f74d-9051-419b-a3d5-e366da2b8b99',
  'ilai-sanitary-pad',
  'ILAI Sanitary Pad',
  'Sustainable menstrual protection crafted from banana fibre & water hyacinth.',
  45.00,
  6,
  500,
  TRUE
)
ON CONFLICT (slug) DO UPDATE SET
  price = EXCLUDED.price,
  pack_quantity = EXCLUDED.pack_quantity;

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confirmation_token UUID NOT NULL DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_mobile TEXT NOT NULL,
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('upi', 'upi_gpay', 'cod', 'razorpay')),
  payment_status TEXT NOT NULL DEFAULT 'Pending verification' CHECK (payment_status IN ('Pending verification', 'Paid', 'COD Pending', 'pending', 'paid', 'failed', 'Cash on Delivery', 'Pending confirmation', 'Pending')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  order_status TEXT NOT NULL DEFAULT 'Pending verification' CHECK (order_status IN ('Pending verification', 'Pending confirmation', 'Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled')),
  tracking_number TEXT,
  courier_name TEXT,
  subtotal NUMERIC(10,2) NOT NULL,
  delivery_charge NUMERIC(10,2) NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure confirmation_token column and unique index exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'confirmation_token'
  ) THEN
    ALTER TABLE orders ADD COLUMN confirmation_token UUID DEFAULT gen_random_uuid() NOT NULL;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_confirmation_token ON orders(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_orders_number_mobile ON orders(order_number, customer_mobile);

-- 5. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL,
  total_price NUMERIC(10,2) NOT NULL
);

-- 6. Order Status History Table
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Sequence & Function to Auto-generate Order Numbers (ILAI-2026-0001)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE OR REPLACE FUNCTION get_next_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ILAI-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := get_next_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_order_number ON orders;
CREATE TRIGGER set_order_number
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION generate_order_number();

-- 8. Row Level Security (RLS) Policies
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Drop old policies to prevent collision
DROP POLICY IF EXISTS "Public Read Products" ON products;
DROP POLICY IF EXISTS "Public Read Settings" ON store_settings;
DROP POLICY IF EXISTS "Public Create Orders" ON orders;
DROP POLICY IF EXISTS "Public Create Order Items" ON order_items;
DROP POLICY IF EXISTS "Public Select Track Order" ON orders;
DROP POLICY IF EXISTS "Public Select Track Items" ON order_items;
DROP POLICY IF EXISTS "Public Select Order Status History" ON order_status_history;

-- Create Policies
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Read Settings" ON store_settings FOR SELECT USING (true);
CREATE POLICY "Public Create Orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Create Order Items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Select Track Order" ON orders FOR SELECT USING (true);
CREATE POLICY "Public Select Track Items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Public Select Order Status History" ON order_status_history FOR SELECT USING (true);

-- 9. Admin Users Table (Accessible only via backend Service Role)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'super_admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
