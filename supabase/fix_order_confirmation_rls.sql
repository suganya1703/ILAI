-- ============================================================================
-- Supabase Fix: Allow SELECT for Order Confirmation & Order Tracking
-- Run this in Supabase SQL Editor (Dashboard -> SQL Editor)
-- ============================================================================

-- 1. Ensure RLS is active on orders, order_items, and order_status_history
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- 2. Allow SELECT for anon and authenticated users
-- This allows:
-- - The Order Confirmation page (/order-confirmation/[id]) to display order details
-- - The Order Tracking page (/track) to look up orders by order number & mobile
-- - The Checkout API route to select inserted orders
DROP POLICY IF EXISTS "Allow select orders" ON orders;
CREATE POLICY "Allow select orders" 
ON orders 
FOR SELECT 
TO anon, authenticated 
USING (true);

DROP POLICY IF EXISTS "Allow select order_items" ON order_items;
CREATE POLICY "Allow select order_items" 
ON order_items 
FOR SELECT 
TO anon, authenticated 
USING (true);

DROP POLICY IF EXISTS "Allow select status_history" ON order_status_history;
CREATE POLICY "Allow select status_history" 
ON order_status_history 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- 3. Maintain INSERT permissions for placing orders
DROP POLICY IF EXISTS "Anon Insert Orders Only" ON orders;
CREATE POLICY "Anon Insert Orders Only" 
ON orders 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Anon Insert Order Items Only" ON order_items;
CREATE POLICY "Anon Insert Order Items Only" 
ON order_items 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Anon Insert Order Status History Only" ON order_status_history;
CREATE POLICY "Anon Insert Order Status History Only" 
ON order_status_history 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Explicitly ensure UPDATE and DELETE are blocked for public/anon
DROP POLICY IF EXISTS "Anon Update Orders" ON orders;
DROP POLICY IF EXISTS "Anon Delete Orders" ON orders;
DROP POLICY IF EXISTS "Anon Update Order Items" ON order_items;
DROP POLICY IF EXISTS "Anon Delete Order Items" ON order_items;
