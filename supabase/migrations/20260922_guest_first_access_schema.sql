-- ================================================================
-- NammaTech: Guest-First Access System Migration
-- Run this in Supabase SQL Editor
-- ================================================================

-- 1. Make user_id nullable on orders (for guest purchases)
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- 2. Add guest contact info columns to orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
  ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- 3. Make user_id nullable on entitlements (for guest entitlements)
ALTER TABLE entitlements ALTER COLUMN user_id DROP NOT NULL;

-- 4. Add secure access token and guest contact columns to entitlements
ALTER TABLE entitlements
  ADD COLUMN IF NOT EXISTS access_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by TEXT;

-- 5. Drop the old unique constraint that required user_id
-- (user_id,resource_id) no longer works because user_id can be null
-- Create a partial unique index for authenticated users only
ALTER TABLE entitlements DROP CONSTRAINT IF EXISTS entitlements_user_id_resource_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS entitlements_user_resource_unique
  ON entitlements (user_id, resource_id)
  WHERE user_id IS NOT NULL;

-- 6. RLS: Allow public to SELECT entitlements by access_token
-- Note: CREATE POLICY does not support IF NOT EXISTS in PostgreSQL
-- Drop first, then recreate safely
DROP POLICY IF EXISTS "Public can view entitlement by access_token" ON entitlements;

CREATE POLICY "Public can view entitlement by access_token"
  ON entitlements FOR SELECT
  USING (access_token IS NOT NULL AND status = 'ACTIVE');

-- 7. RLS: Allow guest order creation (anon can insert orders with null user_id)
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Users or guests can insert orders" ON orders;

CREATE POLICY "Users or guests can insert orders"
  ON orders FOR INSERT
  WITH CHECK (
    user_id IS NULL
    OR user_id = auth.uid()
  );

-- Note: Admin reads all orders via admin client (bypasses RLS)
