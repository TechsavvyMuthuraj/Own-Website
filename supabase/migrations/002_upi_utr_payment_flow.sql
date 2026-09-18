-- ==============================================================================
-- MIGRATION 002 — UPI/UTR Payment Flow Updates
-- IDEMPOTENT — safe to re-run multiple times in Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > paste > Run
-- ==============================================================================

-- 1. Add utr_number column to orders (idempotent)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS utr_number TEXT;

-- Index for fast UTR lookups
CREATE INDEX IF NOT EXISTS idx_orders_utr_number
  ON public.orders(utr_number)
  WHERE utr_number IS NOT NULL;

-- 2. Add 12-digit format constraint (drop first so re-run is safe)
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS chk_orders_utr_format;

ALTER TABLE public.orders
  ADD CONSTRAINT chk_orders_utr_format
    CHECK (utr_number IS NULL OR utr_number ~ '^\d{12}$');

-- 3. RLS: users can update payment_id on their own PENDING orders
DROP POLICY IF EXISTS "Users can update own pending order UTR" ON public.orders;
CREATE POLICY "Users can update own pending order UTR" ON public.orders
  FOR UPDATE
  USING  (auth.uid() = user_id AND status = 'PENDING')
  WITH CHECK (auth.uid() = user_id AND status = 'PENDING');

-- ==============================================================================
-- 4. software_requests table (idempotent)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.software_requests (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  software_name TEXT        NOT NULL,
  description   TEXT,
  platform      TEXT,
  official_url  TEXT,
  status        TEXT        NOT NULL DEFAULT 'PENDING'
                CHECK (status IN ('PENDING','REVIEWING','APPROVED','REJECTED','AVAILABLE')),
  admin_note    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.software_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_software_requests_status
  ON public.software_requests(status);
CREATE INDEX IF NOT EXISTS idx_software_requests_user_id
  ON public.software_requests(user_id);

-- RLS policies
DROP POLICY IF EXISTS "Anyone can submit software requests" ON public.software_requests;
CREATE POLICY "Anyone can submit software requests" ON public.software_requests
  FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Users can view own requests" ON public.software_requests;
CREATE POLICY "Users can view own requests" ON public.software_requests
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage software requests" ON public.software_requests;
CREATE POLICY "Admins can manage software requests" ON public.software_requests
  FOR ALL USING (public.is_admin());

-- Trigger (DROP first so re-run never errors)
DROP TRIGGER IF EXISTS update_software_requests_timestamp ON public.software_requests;
CREATE TRIGGER update_software_requests_timestamp
  BEFORE UPDATE ON public.software_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- ==============================================================================
-- 5. Ad placements analytics columns (idempotent)
-- ==============================================================================
ALTER TABLE public.ad_placements
  ADD COLUMN IF NOT EXISTS impressions BIGINT NOT NULL DEFAULT 0;
ALTER TABLE public.ad_placements
  ADD COLUMN IF NOT EXISTS clicks BIGINT NOT NULL DEFAULT 0;

-- ==============================================================================
-- 6. Admin pending orders view
-- ==============================================================================
DROP VIEW IF EXISTS public.admin_pending_orders;
CREATE VIEW public.admin_pending_orders AS
  SELECT
    o.id,
    o.order_number,
    o.total,
    o.currency,
    o.status,
    o.payment_id   AS utr,
    o.payment_provider,
    o.coupon_code,
    o.created_at,
    o.updated_at,
    p.full_name    AS user_name,
    p.email        AS user_email,
    COUNT(oi.id)   AS item_count
  FROM public.orders o
  LEFT JOIN public.profiles p  ON p.id  = o.user_id
  LEFT JOIN public.order_items oi ON oi.order_id = o.id
  WHERE o.status = 'PENDING'
  GROUP BY o.id, p.full_name, p.email
  ORDER BY o.created_at DESC;

GRANT SELECT ON public.admin_pending_orders TO authenticated;

-- ==============================================================================
-- 7. Order stats function
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_order_stats()
RETURNS TABLE(
  total_orders   BIGINT,
  pending_orders BIGINT,
  paid_orders    BIGINT,
  total_revenue  NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT                                         AS total_orders,
    COUNT(*) FILTER (WHERE status = 'PENDING')::BIGINT       AS pending_orders,
    COUNT(*) FILTER (WHERE status = 'PAID')::BIGINT          AS paid_orders,
    COALESCE(SUM(total) FILTER (WHERE status = 'PAID'), 0)   AS total_revenue
  FROM public.orders;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- DONE — Verify with these queries (uncomment to run individually):
-- ==============================================================================

-- 1. Check utr_number column added:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'utr_number';

-- 2. Check constraint added:
-- SELECT constraint_name FROM information_schema.table_constraints
-- WHERE table_schema = 'public' AND table_name = 'orders'
--   AND constraint_name = 'chk_orders_utr_format';

-- 3. Check trigger added:
-- SELECT trigger_name FROM information_schema.triggers
-- WHERE event_object_table = 'software_requests';

-- 4. View pending orders:
-- SELECT * FROM public.admin_pending_orders LIMIT 10;

-- 5. Order stats:
-- SELECT * FROM public.get_order_stats();
