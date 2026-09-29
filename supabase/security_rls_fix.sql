-- ============================================================================
-- Supabase Security Migration: Restrict RLS on Orders and Sensitive Tables
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor)
-- ============================================================================

-- 1. Ensure Row Level Security (RLS) is enabled on all sensitive tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 2. Drop any previous insecure or permissive read policies on orders
DROP POLICY IF EXISTS "Public Select Track Order" ON orders;
DROP POLICY IF EXISTS "Public Create Orders" ON orders;
DROP POLICY IF EXISTS "Anon Insert Orders Only" ON orders;

DROP POLICY IF EXISTS "Public Select Track Items" ON order_items;
DROP POLICY IF EXISTS "Public Create Order Items" ON order_items;
DROP POLICY IF EXISTS "Anon Insert Order Items Only" ON order_items;

DROP POLICY IF EXISTS "Public Select Order Status History" ON order_status_history;
DROP POLICY IF EXISTS "Anon Insert Order Status History Only" ON order_status_history;

-- 3. Policy: Public / Anon key can ONLY INSERT new orders
-- (No public SELECT, UPDATE, or DELETE permitted)
CREATE POLICY "Anon Insert Orders Only" 
ON orders 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- 4. Policy: Public / Anon key can ONLY INSERT new order items
CREATE POLICY "Anon Insert Order Items Only" 
ON order_items 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- 5. Policy: Public / Anon key can ONLY INSERT new status history entries
CREATE POLICY "Anon Insert Order Status History Only" 
ON order_status_history 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- 6. Public Read on Catalog & Settings is retained for normal website browsing
DROP POLICY IF EXISTS "Public Read Products" ON products;
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Settings" ON store_settings;
CREATE POLICY "Public Read Settings" ON store_settings FOR SELECT USING (true);

-- Note: The Supabase Service Role Key (used server-side by Next.js API routes)
-- has the BYPASSRLS attribute in PostgreSQL, so server-side order lookups, tracking,
-- and admin updates continue to work seamlessly and securely.
