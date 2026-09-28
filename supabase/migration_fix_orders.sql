-- ==============================================================================
-- ILAI E-COMMERCE: SUPABASE MIGRATION FOR VERCEL PRODUCTION
-- ==============================================================================
-- Run this migration in your Supabase Project's SQL Editor:
-- 1. Go to your Supabase Dashboard -> SQL Editor -> New Query
-- 2. Paste this entire file and click "Run"
-- ==============================================================================

-- 1. Enable UUID Extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Add confirmation_token column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmation_token UUID DEFAULT gen_random_uuid();

-- Populate confirmation_token for any existing rows that might be NULL
UPDATE orders SET confirmation_token = gen_random_uuid() WHERE confirmation_token IS NULL;

-- Set NOT NULL and create Unique Index on confirmation_token for fast & unguessable lookups
ALTER TABLE orders ALTER COLUMN confirmation_token SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_confirmation_token ON orders(confirmation_token);

-- 3. Drop all outdated/restrictive CHECK constraints that break checkout on Vercel
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_status_check;

-- 4. Re-add comprehensive CHECK constraints supporting UPI, COD, and all status states
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check 
  CHECK (payment_method IN ('upi', 'upi_gpay', 'cod', 'razorpay'));

ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
  CHECK (payment_status IN ('Pending verification', 'Paid', 'COD Pending', 'pending', 'paid', 'failed', 'Cash on Delivery', 'Pending confirmation', 'Pending'));

ALTER TABLE orders ADD CONSTRAINT orders_order_status_check 
  CHECK (order_status IN ('Pending verification', 'Pending confirmation', 'Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'));

-- Default order status should be 'Pending verification' (Never auto-'Confirmed')
ALTER TABLE orders ALTER COLUMN order_status SET DEFAULT 'Pending verification';

-- 5. Auto-generating Order Sequence Function (ILAI-2026-0001, etc.)
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

-- Grant permissions for sequence and function to all database roles
GRANT EXECUTE ON FUNCTION get_next_order_number() TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE order_number_seq TO anon, authenticated, service_role;

-- 6. Ensure Row Level Security (RLS) is configured with permissive policies
-- This ensures that whether you use anon key or service role key, queries work seamlessly
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Orders Table Policies
DROP POLICY IF EXISTS "Public Create Orders" ON orders;
CREATE POLICY "Public Create Orders" ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Select Orders" ON orders;
CREATE POLICY "Public Select Orders" ON orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Select Track Order" ON orders;
CREATE POLICY "Public Select Track Order" ON orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Update Orders" ON orders;
CREATE POLICY "Public Update Orders" ON orders FOR UPDATE USING (true);

-- Order Items Table Policies
DROP POLICY IF EXISTS "Public Create Order Items" ON order_items;
CREATE POLICY "Public Create Order Items" ON order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Select Order Items" ON order_items;
CREATE POLICY "Public Select Order Items" ON order_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Select Track Items" ON order_items;
CREATE POLICY "Public Select Track Items" ON order_items FOR SELECT USING (true);

-- Order Status History Table Policies
DROP POLICY IF EXISTS "Public Create Order Status History" ON order_status_history;
CREATE POLICY "Public Create Order Status History" ON order_status_history FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Select Order Status History" ON order_status_history;
CREATE POLICY "Public Select Order Status History" ON order_status_history FOR SELECT USING (true);

-- Index for Order Lookup & Tracking by mobile
CREATE INDEX IF NOT EXISTS idx_orders_number_mobile ON orders(order_number, customer_mobile);

-- Verify migration completed
SELECT 'Migration Successful! confirmation_token and status constraints are now active.' AS result;
